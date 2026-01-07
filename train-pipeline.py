import subprocess
import json

print("🦉 HOOTNER Training Pipeline\n")

# Step 1: Load MCP session data
print("📥 Loading MCP session data...")
with open('.amazonq/training/mcp-server-session.json', 'r') as f:
    mcp_data = json.load(f)

# Convert to training text
training_text = f"""
{mcp_data['session']} {mcp_data['date']}
{' '.join(mcp_data['topics'])}
{mcp_data['projectContext']['name']} {mcp_data['projectContext']['type']}
{' '.join(mcp_data['toolsImplemented'])}
"""

with open('services/training-mcp-session.txt', 'w') as f:
    f.write(training_text)

print("✅ MCP data prepared\n")

# Step 2: Train with PyTorch GPT transformer
print("🚀 Training transformer with PyTorch GPT...\n")
subprocess.run(['python', 'services/transformer-llm-service.py'])

print("\n✅ Pipeline complete!")
