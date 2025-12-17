"""Text Encoder"""

class TextEncoder:
    def __init__(self):
        self.vocab_size = 1000
    
    def encode(self, text):
        return [hash(word) % self.vocab_size for word in text.split()]