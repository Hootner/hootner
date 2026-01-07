import os

# Read master file
with open('services/training-data-master.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into 5 fragments
fragment_size = len(content) // 5
fragments = []

for i in range(5):
    start = i * fragment_size
    end = start + fragment_size if i < 4 else len(content)
    fragments.append(content[start:end])

# Save fragments
for i, fragment in enumerate(fragments, 1):
    filename = f'services/training-fragment-{i}.txt'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fragment)
    print(f"✅ Created {filename} ({len(fragment):,} chars)")

print(f"\n📦 Split into 5 fragments of ~{fragment_size:,} chars each")
