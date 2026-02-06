#!/bin/bash
# DreamBooth training (easiest method)

# Install
pip install diffusers accelerate transformers bitsandbytes

# Train (replace with your data)
accelerate launch train_dreambooth.py \
  --pretrained_model_name_or_path="runwayml/stable-diffusion-v1-5" \
  --instance_data_dir="./my_images" \
  --instance_prompt="a photo of sks person" \
  --resolution=512 \
  --train_batch_size=1 \
  --gradient_accumulation_steps=1 \
  --learning_rate=5e-6 \
  --lr_scheduler="constant" \
  --lr_warmup_steps=0 \
  --max_train_steps=400 \
  --output_dir="./dreambooth_model"
