#!/usr/bin/env python3
"""
Unified Training Pipeline - Combines all training functionality
- Local training (train_sd.py)
- AWS training (aws_train_sd.py)
- Setup utilities (setup_training.py)
- Offline render pipeline integration
"""

import os
import boto3
import torch
import json
import logging
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from diffusers import StableDiffusionPipeline, DDPMScheduler
from diffusers.optimization import get_cosine_schedule_with_warmup
from torch.utils.data import Dataset, DataLoader
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".exr"}

class UnifiedTrainingPipeline:
    def __init__(self, config_path=None):
        self.config = self.load_config(config_path)
        self.mode = self.config.get('mode', 'local')
        self.s3_client = None

        if self.mode in ['aws', 'offline-render']:
            self.s3_client = boto3.client('s3')

    def load_config(self, config_path):
        """Load configuration from file or use defaults"""
        default_config = {
            "mode": "local",
            "model_id": "runwayml/stable-diffusion-v1-5",
            "learning_rate": 1e-5,
            "epochs": 10,
            "batch_size": 1,
            "image_size": 512,
            "num_workers": 2,
            "weight_decay": 0.01,
            "warmup_steps": 100,
            "log_steps": 10,
            "local_data_dir": "./training_images",
            "s3_bucket": "hootner-uploads-504165876439",
            "s3_data_prefix": "training-data/images/",
            "s3_output_prefix": "models/trained",
            "prompts_file": "training_prompts.json"
        }

        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)

        return default_config

    def setup_environment(self):
        """Setup Python environment for training"""
        logger.info("🔧 Setting up training environment...")

        packages = [
            "torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118",
            "diffusers==0.21.4",
            "transformers==4.35.0",
            "accelerate==0.24.1",
            "xformers==0.0.22",
            "boto3==1.29.0",
            "Pillow==10.0.1",
            "safetensors==0.4.0",
            "ftfy==6.1.1"
        ]

        for package in packages:
            try:
                subprocess.run(f"pip install {package}".split(), check=True, capture_output=True)
                logger.info(f"✅ Installed {package.split('==')[0]}")
            except subprocess.CalledProcessError as e:
                logger.error(f"❌ Failed to install {package}: {e}")

    def check_gpu(self):
        """Check GPU availability"""
        try:
            if torch.cuda.is_available():
                gpu_name = torch.cuda.get_device_name(0)
                logger.info(f"✅ GPU detected: {gpu_name}")
                return True
            else:
                logger.warning("❌ No GPU detected - training will be slow")
                return False
        except Exception as e:
            logger.error(f"❌ GPU check failed: {e}")
            return False

    def train(self):
        """Main training orchestrator"""
        logger.info(f"🚀 Starting {self.mode} training...")

        # Setup model
        pipe = StableDiffusionPipeline.from_pretrained(
            self.config['model_id'],
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )

        if torch.cuda.is_available():
            pipe = pipe.to("cuda")

        # Create dataset based on mode
        if self.mode == 'local':
            dataset = LocalImageDataset(
                self.config['local_data_dir'],
                self.config['prompts_file'],
                self.config['image_size']
            )
        else:
            dataset = S3ImageDataset(
                self.config['s3_bucket'],
                self.config['s3_data_prefix'],
                self.config['prompts_file'],
                self.config['image_size']
            )

        dataloader = DataLoader(
            dataset,
            batch_size=self.config['batch_size'],
            shuffle=True,
            num_workers=self.config['num_workers']
        )

        # Setup optimizer
        optimizer = torch.optim.AdamW(
            pipe.unet.parameters(),
            lr=self.config['learning_rate'],
            weight_decay=self.config['weight_decay']
        )

        total_steps = len(dataloader) * self.config['epochs']
        scheduler = get_cosine_schedule_with_warmup(
            optimizer,
            num_warmup_steps=self.config['warmup_steps'],
            num_training_steps=total_steps
        )

        # Training loop
        pipe.unet.train()
        best_loss = float('inf')

        for epoch in range(self.config['epochs']):
            epoch_loss = 0.0
            num_batches = 0

            for step, batch in enumerate(dataloader):
                try:
                    optimizer.zero_grad()

                    if torch.cuda.is_available():
                        batch["image"] = batch["image"].to("cuda")

                    # Training step
                    with torch.no_grad():
                        latents = pipe.vae.encode(batch["image"]).latent_dist.sample() * 0.18215

                    noise = torch.randn_like(latents)
                    timesteps = torch.randint(0, pipe.scheduler.config.num_train_timesteps, (latents.shape[0],), device=latents.device)
                    noisy_latents = pipe.scheduler.add_noise(latents, noise, timesteps)

                    text_inputs = pipe.tokenizer(
                        batch["prompt"],
                        padding="max_length",
                        max_length=pipe.tokenizer.model_max_length,
                        truncation=True,
                        return_tensors="pt"
                    )

                    if torch.cuda.is_available():
                        text_inputs = text_inputs.to("cuda")

                    encoder_hidden_states = pipe.text_encoder(text_inputs.input_ids)[0]
                    noise_pred = pipe.unet(noisy_latents, timesteps, encoder_hidden_states).sample

                    loss = torch.nn.functional.mse_loss(noise_pred, noise)
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(pipe.unet.parameters(), 1.0)
                    optimizer.step()
                    scheduler.step()

                    epoch_loss += loss.item()
                    num_batches += 1

                    if step % self.config['log_steps'] == 0:
                        logger.info(f"Epoch {epoch+1}/{self.config['epochs']}, Step {step}, Loss: {loss.item():.4f}")

                except Exception as e:
                    logger.error(f"Error in training step: {e}")
                    continue

            avg_loss = epoch_loss / num_batches if num_batches > 0 else 0
            if avg_loss < best_loss:
                best_loss = avg_loss
                self.save_checkpoint(pipe, epoch + 1, avg_loss)

        logger.info(f"✅ Training completed! Best loss: {best_loss:.4f}")
        return best_loss

    def save_checkpoint(self, pipe, epoch, loss):
        """Save model checkpoint"""
        if self.mode == 'local':
            save_path = f"./trained_model_epoch_{epoch}"
            pipe.save_pretrained(save_path)
            logger.info(f"✅ Model saved to {save_path}")
        else:
            checkpoint_dir = f"checkpoints/epoch_{epoch}"
            local_dir = f"./temp_checkpoint_{epoch}"

            pipe.save_pretrained(local_dir)

            for root, dirs, files in os.walk(local_dir):
                for file in files:
                    local_path = os.path.join(root, file)
                    s3_key = f"{self.config['s3_output_prefix']}/{checkpoint_dir}/{os.path.relpath(local_path, local_dir)}"
                    self.s3_client.upload_file(local_path, self.config['s3_bucket'], s3_key)

            import shutil
            shutil.rmtree(local_dir)
            logger.info(f"✅ Model uploaded to S3: {checkpoint_dir}")


class LocalImageDataset(Dataset):
    def __init__(self, image_dir, prompts_file, size=512):
        self.root = Path(image_dir)
        self.images = [p for p in self.root.rglob('*')
                       if p.is_file() and p.suffix.lower() in ('.jpg', '.jpeg', '.png')]

        with open(prompts_file, 'r') as f:
            self.prompts = json.load(f)

        self.size = size

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        image_path = self.images[idx]
        image = Image.open(image_path).convert("RGB").resize((self.size, self.size))

        import torchvision.transforms as transforms
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5])
        ])

        rel = image_path.relative_to(self.root).as_posix()
        parts = [p for p in rel.split('/') if p]
        rel_no_dcim = rel
        if parts and parts[0].lower() == 'dcim':
            rel_no_dcim = '/'.join(parts[1:])

        filename = image_path.name
        prompt = (
            self.prompts.get(rel)
            or self.prompts.get(rel_no_dcim)
            or self.prompts.get(filename)
            or "a photo"
        )

        return {"image": transform(image), "prompt": prompt}


class S3ImageDataset(Dataset):
    def __init__(self, s3_bucket, s3_prefix, prompts_file, size=512):
        self.s3_client = boto3.client('s3')
        self.bucket = s3_bucket
        self.prefix = s3_prefix
        self.size = size

        # Paginate in case there are >1000 images under the prefix
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

        with open(prompts_file, 'r') as f:
            self.prompts = json.load(f)

        logger.info(f"Found {len(self.image_keys)} images in s3://{s3_bucket}/{s3_prefix}")

    def _prompt_key_candidates(self, image_key: str):
        rel = image_key
        if self.prefix and image_key.startswith(self.prefix):
            rel = image_key[len(self.prefix):]
        rel = rel.lstrip('/').replace('\\', '/')

        parts = [p for p in rel.split('/') if p]
        rel_no_dcim = rel
        if parts and parts[0].lower() == 'dcim':
            rel_no_dcim = '/'.join(parts[1:])

        base = os.path.basename(rel)
        base_no_dcim = os.path.basename(rel_no_dcim)

        return [rel, rel_no_dcim, base, base_no_dcim]

    def __len__(self):
        return len(self.image_keys)

    def __getitem__(self, idx):
        image_key = self.image_keys[idx]
        response = self.s3_client.get_object(Bucket=self.bucket, Key=image_key)
        image = Image.open(response['Body']).convert("RGB").resize((self.size, self.size))

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


def main():
    parser = argparse.ArgumentParser(description="Unified Training Pipeline")
    parser.add_argument("--config", help="Path to configuration JSON file")
    parser.add_argument("--mode", choices=['local', 'aws', 'offline-render'], help="Training mode")
    parser.add_argument("--setup", action="store_true", help="Setup environment only")

    args = parser.parse_args()

    pipeline = UnifiedTrainingPipeline(args.config)

    if args.mode:
        pipeline.config['mode'] = args.mode

    if args.setup:
        pipeline.setup_environment()
        pipeline.check_gpu()
        return

    final_loss = pipeline.train()
    logger.info(f"🎯 Training finished with final loss: {final_loss:.4f}")


if __name__ == "__main__":
    main()
