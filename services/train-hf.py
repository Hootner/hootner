from transformers import GPT2Config, GPT2LMHeadModel, GPT2Tokenizer, Trainer, TrainingArguments, TextDataset, DataCollatorForLanguageModeling
import torch

print("🦉 HOOTNER Transformer Training with Hugging Face\n")

# Load tokenizer
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
tokenizer.pad_token = tokenizer.eos_token

# Configure small GPT model
config = GPT2Config(
    vocab_size=tokenizer.vocab_size,
    n_embd=256,
    n_head=4,
    n_layer=4,
    n_positions=512
)
model = GPT2LMHeadModel(config)

print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")

# Load dataset
train_dataset = TextDataset(
    tokenizer=tokenizer,
    file_path="services/training-data-master.txt",
    block_size=128
)

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./hootner-model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    save_steps=500,
    save_total_limit=2,
    logging_steps=100,
)

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    data_collator=data_collator,
)

print("\n🚀 Starting training...\n")
trainer.train()

# Save
model.save_pretrained("./hootner-model")
tokenizer.save_pretrained("./hootner-model")
print("\n✅ Model saved to ./hootner-model")

# Test generation
prompt = "hootner platform"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(inputs['input_ids'], max_length=50, temperature=0.8)
print(f"\nPrompt: {prompt}")
print(f"Generated: {tokenizer.decode(outputs[0])}")
