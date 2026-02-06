# HOOTNER Stable Diffusion Training Guide

## Best Method: LoRA Fine-tuning

### Why LoRA?
- ✅ Trains in 30 mins vs 8 hours (full fine-tune)
- ✅ Uses 8GB VRAM vs 24GB
- ✅ Output is 3MB vs 4GB
- ✅ Perfect for AWS Lambda/SageMaker

### Quick Start

```bash
# 1. Install
pip install diffusers peft accelerate torch xformers

# 2. Prepare data (5-20 images minimum)
mkdir training_data
# Add your images to training_data/

# 3. Train
python train_lora_hootner.py \
  --images_dir="./training_data" \
  --prompt="your style description" \
  --steps=500 \
  --output="./models/my_lora"

# 4. Use in HOOTNER
# Upload to S3: hootner-models-{account}/lora/my_lora.safetensors
```

### Hardware Requirements
- **Minimum**: 8GB VRAM (RTX 3060)
- **Recommended**: 12GB VRAM (RTX 3080)
- **AWS**: g4dn.xlarge ($0.50/hr)

### Training Time
- LoRA: 30-60 mins
- DreamBooth: 2-4 hours
- Full fine-tune: 8-24 hours

### Cost Estimate (AWS)
- g4dn.xlarge: $0.50/hr × 1hr = **$0.50 per model**
- Storage: 3MB LoRA = **$0.00/month**

## Integration with HOOTNER

Add to `hexarchy/2-intelligence/ai-service.js`:

```javascript
const { LoraLoader } = require('./lora-loader');

async function generateWithCustomModel(prompt, loraPath) {
  const model = await LoraLoader.load(loraPath);
  return model.generate(prompt);
}
```

## Pro Tips
1. Use 512×512 images (faster)
2. 10-20 images is enough
3. Train for 500-1000 steps
4. Use xformers for 2x speedup
5. Save checkpoints every 100 steps
