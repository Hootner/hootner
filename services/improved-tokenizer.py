"""
Improved Tokenizer with Subword Support
Handles unknown words by breaking them into pieces
"""

from collections import Counter
import re

class SubwordTokenizer:
    """BPE-style subword tokenizer"""
    
    def __init__(self, vocab_size=10000):
        self.vocab_size = vocab_size
        self.word_to_idx = {'<pad>': 0, '<unk>': 1, '<s>': 2, '</s>': 3}
        self.idx_to_word = {v: k for k, v in self.word_to_idx.items()}
        self.merges = []
        
    def fit(self, text):
        """Build subword vocabulary from text"""
        words = text.lower().split()
        word_freqs = Counter(words)
        
        # Start with character-level
        vocab = set()
        for word in word_freqs:
            vocab.update(list(word))
        
        # Add common words directly
        for word, freq in word_freqs.most_common(self.vocab_size // 2):
            vocab.add(word)
        
        # Build vocabulary
        for i, token in enumerate(sorted(vocab)):
            if len(self.word_to_idx) >= self.vocab_size:
                break
            if token not in self.word_to_idx:
                idx = len(self.word_to_idx)
                self.word_to_idx[token] = idx
                self.idx_to_word[idx] = token
    
    def encode(self, text):
        """Encode text to token IDs"""
        words = text.lower().split()
        tokens = []
        
        for word in words:
            if word in self.word_to_idx:
                tokens.append(self.word_to_idx[word])
            else:
                # Break unknown word into characters
                for char in word:
                    tokens.append(self.word_to_idx.get(char, 1))  # 1 = <unk>
        
        return tokens
    
    def decode(self, indices):
        """Decode token IDs to text"""
        words = []
        current_word = []
        
        for idx in indices:
            token = self.idx_to_word.get(idx, '<unk>')
            if len(token) == 1 and token.isalpha():
                current_word.append(token)
            else:
                if current_word:
                    words.append(''.join(current_word))
                    current_word = []
                if token not in ['<pad>', '<unk>', '<s>', '</s>']:
                    words.append(token)
        
        if current_word:
            words.append(''.join(current_word))
        
        return ' '.join(words)
    
    @property
    def vocab_size_actual(self):
        return len(self.word_to_idx)


# Example usage
if __name__ == '__main__':
    tokenizer = SubwordTokenizer(vocab_size=10000)
    
    # Load training data
    with open('training-data-combined.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    
    tokenizer.fit(text)
    
    print(f"Vocabulary size: {tokenizer.vocab_size_actual}")
    
    # Test with known and unknown words
    test_cases = [
        "hootner platform streaming",
        "kubernetes orchestration",
        "supercalifragilisticexpialidocious"  # Unknown word
    ]
    
    for test in test_cases:
        encoded = tokenizer.encode(test)
        decoded = tokenizer.decode(encoded)
        print(f"\nOriginal: {test}")
        print(f"Encoded: {encoded[:20]}...")
        print(f"Decoded: {decoded}")
