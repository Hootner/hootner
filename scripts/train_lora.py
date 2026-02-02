from diffusers import StableDiffusionPipeline
from peft import LoraConfig, get_peft_model
import torch

# Load model
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)

# LoRA config (trains only 1% of parameters!)
lora_config = LoraConfig(
    r=8,  # rank
    lora_alpha=32,
    target_modules=["to_q", "to_v"],
    lora_dropout=0.1
)

# Apply LoRA
pipe.unet = get_peft_model(pipe.unet, lora_config)
pipe.to("cuda")

# Train (same loop as above but 10x faster)
# ... training code ...

# Save LoRA weights only (tiny file!)
pipe.unet.save_pretrained("./lora_weights")
