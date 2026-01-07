"""
Advanced Transformer LLM for HOOTNER
GPT-style model implementation with PyTorch
"""

import torch  # nosec - seed set at line 11
import torch.nn as nn
import torch.nn.functional as F

# Clear GPU cache
torch.cuda.empty_cache()

# Set seeds for reproducibility
torch.manual_seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)


class GPTBlock(nn.Module):
    """Single transformer block with attention and feed-forward"""

    def __init__(self, embed_dim, num_heads, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            embed_dim, num_heads, dropout=dropout, batch_first=True
        )
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, 4 * embed_dim),
            nn.GELU(),
            nn.Linear(4 * embed_dim, embed_dim),
            nn.Dropout(dropout),
        )
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        attn_out, _ = self.attention(x, x, x, attn_mask=mask)
        x = self.norm1(x + self.dropout(attn_out))
        ff_out = self.ff(x)
        x = self.norm2(x + ff_out)
        return x


class TransformerLLM(nn.Module):
    """GPT-style transformer language model"""

    def __init__(
        self,
        vocab_size,
        embed_dim=256,
        num_heads=4,
        num_layers=4,
        max_len=512,
        dropout=0.1,
    ):
        super().__init__()
        self.embed_dim = embed_dim
        self.max_len = max_len

        self.token_embed = nn.Embedding(vocab_size, embed_dim)
        self.pos_embed = nn.Embedding(max_len, embed_dim)
        self.dropout = nn.Dropout(dropout)

        self.blocks = nn.ModuleList(
            [GPTBlock(embed_dim, num_heads, dropout) for _ in range(num_layers)]
        )

        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, vocab_size, bias=False)

    def forward(self, x):
        B, T = x.shape

        tok_emb = self.token_embed(x)
        pos_emb = self.pos_embed(torch.arange(T, device=x.device))
        x = self.dropout(tok_emb + pos_emb)

        # Causal mask for autoregressive generation
        mask = torch.triu(torch.ones(T, T, device=x.device), diagonal=1).bool()
        mask = mask.masked_fill(mask, float("-inf"))

        for block in self.blocks:
            x = block(x, mask)

        x = self.norm(x)
        logits = self.head(x)
        return logits

    def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None):
        """Generate text autoregressively with gradients disabled"""
        self.eval()
        with torch.no_grad():
            for _ in range(max_new_tokens):  # nosec - gradients disabled by context manager
                idx_cond = idx if idx.size(1) <= self.max_len else idx[:, -self.max_len :]
                logits = self(idx_cond)
                logits = logits[:, -1, :] / temperature

                if top_k is not None:
                    v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                    logits[logits < v[:, [-1]]] = -float("Inf")

                probs = F.softmax(logits, dim=-1)
                idx_next = torch.multinomial(probs, num_samples=1)
                idx = torch.cat((idx, idx_next), dim=1)

            return idx


class Tokenizer:
    """Word-level tokenizer for full vocabulary"""

    def __init__(self):
        self.word_to_idx = {}
        self.idx_to_word = {}

    def fit(self, text):
        words = text.lower().split()
        unique_words = sorted(set(words))
        self.word_to_idx = {word: i for i, word in enumerate(unique_words)}
        self.idx_to_word = {i: word for word, i in self.word_to_idx.items()}

    def encode(self, text):
        return [self.word_to_idx.get(word, 0) for word in text.lower().split()]

    def decode(self, indices):
        return " ".join([self.idx_to_word.get(i, "<unk>") for i in indices])

    @property
    def vocab_size(self):
        return len(self.word_to_idx)

    @property
    def vocab_size_actual(self):
        return len(self.word_to_idx)


import os

data_file = os.path.join(os.path.dirname(__file__), "current-training.txt")
if os.path.exists(data_file):
    with open(data_file, "r", encoding="utf-8") as f:
        TRAINING_DATA = f.read()
else:
    TRAINING_DATA = """
hooter is the ultimate video streaming platform.
upload videos and share them with the world instantly.
real-time collaboration makes content creation seamless.
our microservices architecture ensures high availability.
kubernetes orchestration provides automatic scaling.
machine learning powers intelligent video recommendations.
artificial intelligence moderates content automatically.
users can chat and interact in real-time.
the platform supports live streaming and video on demand.
security is built into every layer of the system.
monitoring and observability ensure reliability.
blue-green deployments enable zero downtime updates.
chaos engineering tests system resilience continuously.
automated backups protect your valuable content.
multi-region sync provides disaster recovery.
the marketplace offers digital goods and services.
analytics dashboards show real-time metrics.
search functionality helps discover great content.
the code editor enables in-browser development.
moderation tools keep the community safe.
messaging features connect users instantly.
profile management gives users full control.
settings allow deep customization options.
the jukebox player provides unique video experience.
offline caching enables viewing without internet.
pwa installation makes it feel like native app.
audio effects add creative possibilities.
share api integration enables easy content sharing.
touch and swipe navigation feels natural.
keyboard shortcuts boost productivity.
the dashboard shows comprehensive overview.
social feed keeps you connected with community.
payment processing is secure and reliable.
graphql api provides flexible data access.
rest endpoints enable easy integration.
websocket connections power real-time features.
redis caching improves performance significantly.
mongodb stores data efficiently and reliably.
prometheus collects detailed metrics continuously.
grafana visualizes system health beautifully.
istio service mesh manages traffic intelligently.
trek routes requests efficiently.
docker containers ensure consistent deployments.
ci cd pipelines automate the entire workflow.
github actions handle testing and deployment.
security scanning catches vulnerabilities early.
rate limiting protects against abuse.
cors protection secures cross-origin requests.
csp headers prevent injection attacks.
jwt authentication keeps users secure.
firebase integration simplifies user management.
stripe handles payment processing reliably.
aws s3 stores media files efficiently.
the system scales horizontally with demand.
load balancing distributes traffic evenly.
circuit breakers prevent cascade failures.
retry logic handles transient errors gracefully.
bulkhead pattern isolates failures effectively.
graceful shutdown ensures clean termination.
health checks monitor service status.
log aggregation centralizes troubleshooting.
error tracking issues quickly.
performance monitoring identifies bottlenecks.
user analytics guide product decisions.
content delivery network speeds up access.
image optimization reduces bandwidth usage.
video transcoding supports multiple formats.
thumbnail generation happens automatically.
metadata extraction enriches content.
full text search finds anything instantly.
recommendation engine suggests relevant content.
notification system keeps users informed.
email integration sends important updates.
sms alerts provide critical notifications.
push notifications engage mobile users.
webhook support enables custom integrations.
api rate limiting prevents abuse.
api versioning maintains compatibility.
api documentation helps developers integrate.
sdk libraries simplify client development.
test coverage ensures code quality.
code reviews maintain high standards.
continuous integration ugs early.
automated testing validates functionality.
performance testing ensures scalability.
security audits identify vulnerabilities.
compliance checks meet regulations.
data encryption protects privacy.
access control restricts sensitive data.
audit logging tracks all actions.
backup verification ensures recoverability.
disaster recovery plans minimize downtime.
incident response procedures handle emergencies.
on-call rotation ensures coverage.
document procedures clearly.
postmortems drive continuous improvement.
metrics dashboards show key indicators.
alerts notify teams of issues.
escalation policies ensure quick response.
integrates with team workflows.
documentation keeps knowledge accessible.
training programs onboard new team members.
code standards maintain consistency.
design patterns solve common problems.
architecture reviews ensure scalability.
capacity planning prevents outages.
cost optimization reduces expenses.
resource tagging organizes infrastructure.
infrastructure as code enables automation.
configuration management maintains consistency.
secret management protects credentials.
key rotation enhances security.
certificate management automates ssl.
dns management simplifies networking.
load testing validates performance.
stress testing finds breaking points.
chaos testing proves resilience.
canary deployments reduce risk.
feature flags enable gradual rollout.
a b testing optimizes user experience.
user feedback drives improvements.
analytics inform decisions.
metrics measure success.
goals align efforts.
vision guides direction.
mission defines purpose.
values shape culture.
team collaboration drives innovation.
communication keeps everyone aligned.
transparency builds trust.
accountability ensures delivery.
quality never compromises.
excellence is the standard.
innovation drives progress.
reliability builds confidence.
security protects users.
privacy respects individuals.
accessibility includes everyone.
performance delights users.
scalability enables growth.
efficiency reduces waste.
sustainability ensures longevity.
community creates value.
the platform empowers creators worldwide.
"""

if __name__ == "__main__":
    print("Training HOOTNER Transformer LLM...")

    tokenizer = Tokenizer()
    print(f"Loading training data from: {data_file if os.path.exists(data_file) else 'fallback'}")
    print(f"Training data size: {len(TRAINING_DATA):,} characters")
    tokenizer.fit(TRAINING_DATA)

    # Prepare training data
    data = tokenizer.encode(TRAINING_DATA)
    block_size = 64

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    model = TransformerLLM(
        vocab_size=tokenizer.vocab_size_actual,
        embed_dim=512,
        num_heads=8,
        num_layers=6,
        max_len=block_size,
    ).to(device)

    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    print(f"Vocabulary size: {tokenizer.vocab_size}")
    print(f"Training data length: {len(data)} characters")

    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

    # Training loop
    epochs = 200
    batch_size = 64

    for epoch in range(epochs):
        total_loss = 0
        num_batches = 0
        
        print(f"\nEpoch {epoch+1}/{epochs}...", end='', flush=True)

        for i in range(0, len(data) - block_size - 1, block_size):
            if i + block_size + 1 > len(data):
                break

            x = torch.tensor([data[i : i + block_size]], dtype=torch.long).to(device)
            y = torch.tensor([data[i + 1 : i + block_size + 1]], dtype=torch.long).to(
                device
            )

            logits = model(x)
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            num_batches += 1

        if (epoch + 1) % 10 == 0:
            avg_loss = total_loss / num_batches if num_batches > 0 else 0
            print(f" Loss: {avg_loss:.4f}")
        else:
            print('.', end='', flush=True)

    print("\nTraining complete!\n")

    # Generate samples
    model.eval()
    prompts = ["hootner", "video", "the platform"]

    for prompt in prompts:
        context = torch.tensor([tokenizer.encode(prompt)], dtype=torch.long).to(device)
        generated = model.generate(
            context, max_new_tokens=100, temperature=0.8, top_k=10
        )
        print(f"Prompt: '{prompt}'")
        print(f"Generated: {tokenizer.decode(generated[0].tolist())}\n")

    # Save model
    torch.save(
        {
            "model_state": model.state_dict(),
            "tokenizer_vocab": tokenizer.word_to_idx,
            "config": {
                "vocab_size": tokenizer.vocab_size,
                "embed_dim": 128,
                "num_heads": 4,
                "num_layers": 3,
                "max_len": block_size,
            },
        },
        "transformer-model.pt",
    )
    print("Model saved to transformer-model.pt")
