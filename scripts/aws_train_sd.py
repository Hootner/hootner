#!/usr/bin/env python3
"""
AWS-Optimized Stable Diffusion Training
Supports: EC2 GPU instances, S3 storage, distributed training
"""

import os
import boto3
import torch
import json
import logging
from datetime import datetime
from diffusers import StableDiffusionPipeline, DDPMScheduler
from diffusers.optimization import get_cosine_schedule_with_warmup
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import argparse
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class S3ImageDataset(Dataset):
    """Dataset that loads images from S3"""

    def __init__(self, s3_bucket, s3_prefix, prompts_file, size=512):
        self.s3_client = boto3.client('s3')
        self.bucket = s3_bucket
        self.prefix = s3_prefix
        self.size = size

        # List images from S3 (paginate)
        self.image_keys = []
        continuation_token = None
        while True:
            kwargs = {"Bucket": s3_bucket, "Prefix": s3_prefix}
            if continuation_token:
                kwargs["ContinuationToken"] = continuation_token
            response = self.s3_client.list_objects_v2(**kwargs)
            for obj in response.get('Contents', []) or []:
                key = obj.get('Key')
                if key and key.lower().endswith(('.jpg', '.jpeg', '.png')):
                    self.image_keys.append(key)
            if response.get('IsTruncated'):
                continuation_token = response.get('NextContinuationToken')
                if not continuation_token:
                    break
            else:
                break

        # Load prompts
        with open(prompts_file, 'r') as f:
            self.prompts = json.load(f)

        logger.info(f"Found {len(self.image_keys)} images in s3://{s3_bucket}/{s3_prefix}")

    def _prompt_key_candidates(self, image_key: str):
        # Prefer prefix-relative key (folder-aware), with backwards-compatible fallbacks.
        rel = image_key
        if self.prefix and image_key.startswith(self.prefix):
            rel = image_key[len(self.prefix):]
        rel = rel.lstrip("/")
        rel = rel.replace("\\", "/")

        parts = [p for p in rel.split("/") if p]
        rel_no_dcim = rel
        if parts and parts[0].lower() == "dcim":
            rel_no_dcim = "/".join(parts[1:])

        base = os.path.basename(rel)
        base_no_dcim = os.path.basename(rel_no_dcim)

        return [
            rel,
            rel_no_dcim,
            base,
            base_no_dcim,
        ]

    def __len__(self):
        return len(self.image_keys)

    def __getitem__(self, idx):
        # Download image from S3
        image_key = self.image_keys[idx]
        response = self.s3_client.get_object(Bucket=self.bucket, Key=image_key)
        image = Image.open(response['Body']).convert("RGB").resize((self.size, self.size))

        # Convert to tensor
        import torchvision.transforms as transforms
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5])
        ])

        return {
            "image": transform(image),
            "prompt": next(
                (self.prompts.get(k) for k in self._prompt_key_candidates(image_key) if self.prompts.get(k) is not None),
                "a photo",
            )
        }

class AWSSDTrainer:
    def __init__(self, config):
        self.config = config
        self.s3_client = boto3.client('s3')
        self.setup_model()
        self.setup_dataset()
        self.setup_training()

    def setup_model(self):
        """Initialize the Stable Diffusion model"""
        logger.info(f"Loading model: {self.config['model_id']}")

        self.pipe = StableDiffusionPipeline.from_pretrained(
            self.config['model_id'],
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )

        if torch.cuda.is_available():
            self.pipe = self.pipe.to("cuda")
            logger.info(f"Using GPU: {torch.cuda.get_device_name()}")
        else:
            logger.warning("CUDA not available, using CPU (very slow)")

    def setup_dataset(self):
        """Setup training dataset from S3"""
        self.dataset = S3ImageDataset(
            s3_bucket=self.config['s3_bucket'],
            s3_prefix=self.config['s3_data_prefix'],
            prompts_file=self.config['prompts_file'],
            size=self.config['image_size']
        )

        self.dataloader = DataLoader(
            self.dataset,
            batch_size=self.config['batch_size'],
            shuffle=True,
            num_workers=self.config['num_workers']
        )

    def setup_training(self):
        """Setup optimizer and scheduler"""
        self.optimizer = torch.optim.AdamW(
            self.pipe.unet.parameters(),
            lr=self.config['learning_rate'],
            weight_decay=self.config['weight_decay']
        )

        total_steps = len(self.dataloader) * self.config['epochs']
        self.scheduler = get_cosine_schedule_with_warmup(
            self.optimizer,
            num_warmup_steps=self.config['warmup_steps'],
            num_training_steps=total_steps
        )

    def save_checkpoint(self, epoch, loss):
        """Save model checkpoint to S3"""
        checkpoint_dir = f"checkpoints/epoch_{epoch}"
        local_dir = f"./temp_checkpoint_{epoch}"

        # Save locally first
        self.pipe.save_pretrained(local_dir)

        # Upload to S3
        for root, dirs, files in os.walk(local_dir):
            for file in files:
                local_path = os.path.join(root, file)
                s3_key = f"{self.config['s3_output_prefix']}/{checkpoint_dir}/{os.path.relpath(local_path, local_dir)}"

                self.s3_client.upload_file(local_path, self.config['s3_bucket'], s3_key)
                logger.info(f"Uploaded {local_path} to s3://{self.config['s3_bucket']}/{s3_key}")

        # Clean up local files
        import shutil
        shutil.rmtree(local_dir)

        # Save training metadata
        metadata = {
            "epoch": epoch,
            "loss": loss,
            "timestamp": datetime.utcnow().isoformat(),
            "model_id": self.config['model_id'],
            "learning_rate": self.config['learning_rate']
        }

        metadata_key = f"{self.config['s3_output_prefix']}/{checkpoint_dir}/training_metadata.json"
        self.s3_client.put_object(
            Bucket=self.config['s3_bucket'],
            Key=metadata_key,
            Body=json.dumps(metadata, indent=2)
        )

    def train(self):
        """Main training loop"""
        logger.info("Starting training...")

        self.pipe.unet.train()
        best_loss = float('inf')

        for epoch in range(self.config['epochs']):
            epoch_loss = 0.0
            num_batches = 0

            for step, batch in enumerate(self.dataloader):
                try:
                    self.optimizer.zero_grad()

                    # Move to device
                    if torch.cuda.is_available():
                        batch["image"] = batch["image"].to("cuda")

                    # Encode images to latents
                    with torch.no_grad():
                        latents = self.pipe.vae.encode(batch["image"]).latent_dist.sample() * 0.18215

                    # Add noise
                    noise = torch.randn_like(latents)
                    timesteps = torch.randint(
                        0, self.pipe.scheduler.config.num_train_timesteps,
                        (latents.shape[0],), device=latents.device
                    )

                    noisy_latents = self.pipe.scheduler.add_noise(latents, noise, timesteps)

                    # Get text embeddings
                    text_inputs = self.pipe.tokenizer(
                        batch["prompt"],
                        padding="max_length",
                        max_length=self.pipe.tokenizer.model_max_length,
                        truncation=True,
                        return_tensors="pt"
                    )

                    if torch.cuda.is_available():
                        text_inputs = text_inputs.to("cuda")

                    encoder_hidden_states = self.pipe.text_encoder(text_inputs.input_ids)[0]

                    # Predict noise
                    noise_pred = self.pipe.unet(noisy_latents, timesteps, encoder_hidden_states).sample

                    # Compute loss
                    loss = torch.nn.functional.mse_loss(noise_pred, noise)

                    # Backward pass
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(self.pipe.unet.parameters(), 1.0)
                    self.optimizer.step()
                    self.scheduler.step()

                    epoch_loss += loss.item()
                    num_batches += 1

                    if step % self.config['log_steps'] == 0:
                        logger.info(f"Epoch {epoch+1}/{self.config['epochs']}, Step {step}, Loss: {loss.item():.4f}")

                except Exception as e:
                    logger.error(f"Error in training step: {e}")
                    continue

            # Calculate average epoch loss
            avg_loss = epoch_loss / num_batches if num_batches > 0 else 0
            logger.info(f"Epoch {epoch+1} completed. Average loss: {avg_loss:.4f}")

            # Save checkpoint if loss improved
            if avg_loss < best_loss:
                best_loss = avg_loss
                self.save_checkpoint(epoch + 1, avg_loss)
                logger.info(f"New best model saved with loss: {avg_loss:.4f}")

        logger.info("Training completed!")
        return best_loss

def main():
    parser = argparse.ArgumentParser(description="AWS Stable Diffusion Training")
    parser.add_argument("--config", required=True, help="Path to configuration JSON file")
    args = parser.parse_args()

    # Load configuration
    with open(args.config, 'r') as f:
        config = json.load(f)

    # Initialize trainer
    trainer = AWSSDTrainer(config)

    # Start training
    final_loss = trainer.train()

    logger.info(f"Training finished with final loss: {final_loss:.4f}")

if __name__ == "__main__":
    main()
