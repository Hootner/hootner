"""
Text Encoder for Video Generation
BERT-based conditioning with cross-attention support

Author: HOOTNER Code Guardian
Date: January 10, 2026
"""

import torch
import torch.nn as nn
from typing import Optional, Tuple


class TextEncoder(nn.Module):
    """
    BERT-based text encoder for video conditioning

    Features:
    - Pre-trained BERT embeddings
    - Learnable projection layers
    - Positional encoding
    - Support for variable-length text
    """

    def __init__(
        self,
        vocab_size: int = 30522,  # BERT vocab size
        embed_dim: int = 768,
        hidden_dim: int = 512,
        num_layers: int = 6,
        num_heads: int = 8,
        max_seq_len: int = 77,
        dropout: float = 0.1,
    ):
        super().__init__()

        self.embed_dim = embed_dim
        self.max_seq_len = max_seq_len

        # Token embeddings
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)

        # Positional embeddings
        self.position_embedding = nn.Embedding(max_seq_len, embed_dim)

        # Transformer encoder
        # cSpell:ignore nhead gelu
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=embed_dim * 4,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        # Projection to hidden dimension
        self.proj = nn.Linear(embed_dim, hidden_dim)

        # Layer normalization
        self.ln_final = nn.LayerNorm(hidden_dim)

    def forward(
        self, input_ids: torch.Tensor, attention_mask: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Encode text into embeddings

        Args:
            input_ids: (B, seq_len) - Token IDs
            attention_mask: (B, seq_len) - Attention mask (1 = attend, 0 = ignore)

        Returns:
            embeddings: (B, seq_len, hidden_dim) - Encoded features
            pooled: (B, hidden_dim) - Pooled representation
        """
        batch_size, seq_len = input_ids.shape

        # Token embeddings
        token_embeds = self.token_embedding(input_ids)

        # Positional embeddings
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        position_embeds = self.position_embedding(positions)

        # Combine embeddings
        embeddings = token_embeds + position_embeds

        # Create attention mask for transformer (True = masked)
        if attention_mask is not None:
            # Convert from (B, seq_len) to (B, seq_len, seq_len)
            mask = attention_mask == 0
        else:
            mask = None

        # Transformer encoding
        encoded = self.transformer(embeddings, src_key_padding_mask=mask)

        # Project to hidden dimension
        encoded = self.proj(encoded)
        encoded = self.ln_final(encoded)

        # Pooled representation (CLS token or mean pooling)
        if attention_mask is not None:
            # Mean pooling with mask
            mask_expanded = attention_mask.unsqueeze(-1).expand(encoded.size())
            sum_embeddings = torch.sum(encoded * mask_expanded, dim=1)
            sum_mask = torch.clamp(mask_expanded.sum(dim=1), min=1e-9)
            pooled = sum_embeddings / sum_mask
        else:
            # Simple mean pooling
            pooled = encoded.mean(dim=1)

        return encoded, pooled


class SimpleTokenizer:
    """
    Simple tokenizer for testing (replace with proper BERT tokenizer in production)
    """

    def __init__(self, vocab_size: int = 30522):
        self.vocab_size = vocab_size
        self.word_to_id = {}
        self.id_to_word = {}
        self.next_id = 1  # 0 reserved for [PAD]

        # Special tokens
        self.pad_token_id = 0
        self.cls_token_id = 101
        self.sep_token_id = 102
        self.unk_token_id = 100

    def encode(
        self, text: str, max_length: int = 77
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Encode text to token IDs

        Args:
            text: Input string
            max_length: Maximum sequence length

        Returns:
            input_ids: (seq_len,)
            attention_mask: (seq_len,)
        """
        try:
            # Simple word-based tokenization
            words = text.lower().split()

            # Add [CLS] token
            token_ids = [self.cls_token_id]

            # Convert words to IDs
            for word in words:
                if word not in self.word_to_id:
                    if self.next_id < self.vocab_size:
                        self.word_to_id[word] = self.next_id
                        self.id_to_word[self.next_id] = word
                        self.next_id += 1
                    else:
                        token_ids.append(self.unk_token_id)
                        continue
                token_ids.append(self.word_to_id[word])

            # Add [SEP] token
            token_ids.append(self.sep_token_id)

            # Create attention mask
            attention_mask = [1] * len(token_ids)

            # Pad to max_length
            if len(token_ids) < max_length:
                padding_length = max_length - len(token_ids)
                token_ids.extend([self.pad_token_id] * padding_length)
                attention_mask.extend([0] * padding_length)
            else:
                token_ids = token_ids[:max_length]
                attention_mask = attention_mask[:max_length]

            return torch.tensor(token_ids), torch.tensor(attention_mask)
        except Exception as e:
            raise ValueError(f"Failed to encode text: {str(e)}")

    def batch_encode(
        self, texts: list, max_length: int = 77
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Batch encode multiple texts

        Returns:
            input_ids: (B, seq_len)
            attention_mask: (B, seq_len)
        """
        batch_ids = []
        batch_masks = []

        for text in texts:
            ids, mask = self.encode(text, max_length)
            batch_ids.append(ids)
            batch_masks.append(mask)

        return torch.stack(batch_ids), torch.stack(batch_masks)


class CrossAttentionBlock(nn.Module):
    """
    Cross-attention block for conditioning U-Net on text embeddings
    """

    def __init__(self, query_dim: int, context_dim: int, num_heads: int = 8):
        super().__init__()

        self.num_heads = num_heads
        self.head_dim = query_dim // num_heads
        self.scale = self.head_dim**-0.5

        # Projections
        self.to_q = nn.Linear(query_dim, query_dim, bias=False)
        self.to_k = nn.Linear(context_dim, query_dim, bias=False)
        self.to_v = nn.Linear(context_dim, query_dim, bias=False)
        self.to_out = nn.Linear(query_dim, query_dim)

        # Normalization
        self.norm_q = nn.LayerNorm(query_dim)
        self.norm_context = nn.LayerNorm(context_dim)

    def forward(self, x: torch.Tensor, context: torch.Tensor) -> torch.Tensor:
        """
        Apply cross-attention

        Args:
            x: (B, N, query_dim) - Query features (from U-Net)
            context: (B, M, context_dim) - Context features (from text encoder)

        Returns:
            out: (B, N, query_dim) - Attended features
        """
        B, N, C = x.shape
        _, M, _ = context.shape

        # Normalize
        x = self.norm_q(x)
        context = self.norm_context(context)

        # Compute Q, K, V
        q = self.to_q(x).reshape(B, N, self.num_heads, self.head_dim)
        k = self.to_k(context).reshape(B, M, self.num_heads, self.head_dim)
        v = self.to_v(context).reshape(B, M, self.num_heads, self.head_dim)

        # Transpose for attention
        q = q.transpose(1, 2)  # (B, H, N, D)
        k = k.transpose(1, 2)  # (B, H, M, D)
        v = v.transpose(1, 2)  # (B, H, M, D)

        # Compute attention scores
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = torch.softmax(attn, dim=-1)

        # Apply attention to values
        out = attn @ v  # (B, H, N, D)
        out = out.transpose(1, 2).reshape(B, N, C)

        return self.to_out(out)


if __name__ == "__main__":
    print("🧪 Testing Text Encoder")

    # Create encoder
    encoder = TextEncoder(vocab_size=30522, embed_dim=768, hidden_dim=512, num_layers=6)

    print(f"✅ Text encoder initialized")
    print(f"   Parameters: {sum(p.numel() for p in encoder.parameters()):,}")

    # Create tokenizer
    tokenizer = SimpleTokenizer()

    # Test encoding
    texts = ["A robot dancing in the rain", "Sunset over mountains with birds flying"]

    input_ids, attention_mask = tokenizer.batch_encode(texts, max_length=77)
    print(f"\n📝 Tokenized texts:")
    print(f"   Input IDs shape: {input_ids.shape}")
    print(f"   Attention mask shape: {attention_mask.shape}")

    # Forward pass
    with torch.no_grad():
        embeddings, pooled = encoder(input_ids, attention_mask)

    print(f"\n🔤 Encoded embeddings:")
    print(f"   Embeddings shape: {embeddings.shape}")
    print(f"   Pooled shape: {pooled.shape}")

    # Test cross-attention
    cross_attn = CrossAttentionBlock(query_dim=512, context_dim=512)

    # Dummy query features (from U-Net)
    # cSpell:ignore randn
    query = torch.randn(2, 64, 512)

    with torch.no_grad():
        attended = cross_attn(query, embeddings)

    print(f"\n🔗 Cross-attention test:")
    print(f"   Query shape: {query.shape}")
    print(f"   Context shape: {embeddings.shape}")
    print(f"   Output shape: {attended.shape}")

    print(f"\n✅ Text encoder ready for video conditioning!")
