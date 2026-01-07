"""
LLM Service for HOOTNER
Provides text generation and prediction capabilities
"""

import numpy as np
import json
from collections import defaultdict
from pathlib import Path

class BigramLLM:
    """Simple bigram language model for text generation"""
    
    def __init__(self):
        self.vocab = []
        self.word_to_idx = {}
        self.idx_to_word = {}
        self.bigram_probs = None
        
    def train(self, corpus):
        """Train model on text corpus"""
        words = corpus.lower().split()
        self.vocab = list(set(words))
        vocab_size = len(self.vocab)
        
        self.word_to_idx = {word: idx for idx, word in enumerate(self.vocab)}
        self.idx_to_word = {idx: word for word, idx in self.word_to_idx.items()}
        
        corpus_indices = [self.word_to_idx[word] for word in words]
        
        bigram_counts = np.zeros((vocab_size, vocab_size))
        for i in range(len(corpus_indices) - 1):
            bigram_counts[corpus_indices[i], corpus_indices[i + 1]] += 1
        
        bigram_counts += 0.01  # Laplace smoothing
        self.bigram_probs = bigram_counts / bigram_counts.sum(axis=1, keepdims=True)
        
    def predict_next(self, word):
        """Predict next word given current word"""
        if word not in self.word_to_idx:
            return None
        word_idx = self.word_to_idx[word]
        next_idx = np.random.choice(len(self.vocab), p=self.bigram_probs[word_idx])
        return self.idx_to_word[next_idx]
    
    def generate(self, start_word, length=10):
        """Generate text sequence"""
        if start_word not in self.word_to_idx:
            return None
        
        sentence = [start_word]
        current = start_word
        for _ in range(length):
            next_word = self.predict_next(current)
            if next_word:
                sentence.append(next_word)
                current = next_word
        return ' '.join(sentence)
    
    def save(self, path):
        """Save model to disk"""
        data = {
            'vocab': self.vocab,
            'bigram_probs': self.bigram_probs.tolist()
        }
        Path(path).write_text(json.dumps(data))
    
    def load(self, path):
        """Load model from disk"""
        data = json.loads(Path(path).read_text())
        self.vocab = data['vocab']
        self.bigram_probs = np.array(data['bigram_probs'])
        self.word_to_idx = {word: idx for idx, word in enumerate(self.vocab)}
        self.idx_to_word = {idx: word for word, idx in self.word_to_idx.items()}

# Default training corpus for HOOTNER
DEFAULT_CORPUS = """
hootner is the ultimate video streaming platform.
the owl never sleeps and provides continuous service.
video content is delivered with high quality streaming.
users can upload download and share video content.
the platform supports real-time collaboration and chat.
artificial intelligence powers content moderation.
machine learning enhances video recommendations.
the system uses microservices architecture for scalability.
kubernetes orchestrates container deployments.
monitoring and observability ensure system reliability.
"""

if __name__ == '__main__':
    model = BigramLLM()
    model.train(DEFAULT_CORPUS)
    
    print("HOOTNER LLM Service Ready")
    print(f"Vocabulary size: {len(model.vocab)}")
    print(f"\nGenerated text: {model.generate('hootner', 15)}")
    print(f"Generated text: {model.generate('video', 15)}")
    
    model.save('llm-model.json')
    print("\nModel saved to llm-model.json")
