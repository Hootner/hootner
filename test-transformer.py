import torch
import sys
sys.path.insert(0, 'services')
from transformer_llm_service import TransformerLLM, Tokenizer

checkpoint = torch.load('transformer-model.pt')

tokenizer = Tokenizer()
tokenizer.word_to_idx = checkpoint['tokenizer_vocab']
tokenizer.idx_to_word = {v:k for k,v in tokenizer.word_to_idx.items()}

model = TransformerLLM(**checkpoint['config'])
model.load_state_dict(checkpoint['model_state'])
model.eval()

prompts = ['hootner', 'video streaming', 'the platform']

for prompt in prompts:
    context = torch.tensor([tokenizer.encode(prompt)], dtype=torch.long)
    generated = model.generate(context, max_new_tokens=30, temperature=0.8, top_k=10)
    print(f"\nPrompt: '{prompt}'")
    print(f"Generated: {tokenizer.decode(generated[0].tolist())}")
