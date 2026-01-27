from diffusers import StableDiffusionPipeline, DDPMScheduler
from diffusers.optimization import get_cosine_schedule_with_warmup
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import os

class ImageDataset(Dataset):
    def __init__(self, image_dir, prompts, size=512):
        self.images = [os.path.join(image_dir, f) for f in os.listdir(image_dir)]
        self.prompts = prompts
        self.size = size
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        image = Image.open(self.images[idx]).convert("RGB").resize((self.size, self.size))
        return {"image": torch.tensor(image), "prompt": self.prompts[idx]}

# Load base model
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe.to("cuda")

# Training config
learning_rate = 1e-5
epochs = 10
batch_size = 1

# Dataset (replace with your data)
dataset = ImageDataset("./training_images", ["your prompt 1", "your prompt 2"])
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# Optimizer
optimizer = torch.optim.AdamW(pipe.unet.parameters(), lr=learning_rate)
scheduler = get_cosine_schedule_with_warmup(optimizer, num_warmup_steps=100, num_training_steps=len(dataloader) * epochs)

# Training loop
pipe.unet.train()
for epoch in range(epochs):
    for batch in dataloader:
        optimizer.zero_grad()
        
        # Forward pass (simplified)
        latents = pipe.vae.encode(batch["image"].to("cuda")).latent_dist.sample()
        noise = torch.randn_like(latents)
        timesteps = torch.randint(0, 1000, (batch_size,), device="cuda")
        
        noisy_latents = pipe.scheduler.add_noise(latents, noise, timesteps)
        noise_pred = pipe.unet(noisy_latents, timesteps, batch["prompt"]).sample
        
        loss = torch.nn.functional.mse_loss(noise_pred, noise)
        loss.backward()
        optimizer.step()
        scheduler.step()
        
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

# Save
pipe.save_pretrained("./trained_model")
