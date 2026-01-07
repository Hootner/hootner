import fs from 'fs';
import path from 'path';

const servicesDir = 'services';
const outputFile = 'services/training-data-master.txt';

const textFiles = [
  'hootner-training-data.txt',
  'hootner-training-data-educational.txt',
  'training-data-autonomous-gamedev.txt',
  'training-data-combined.txt',
  'training-data-common-usage.txt',
  'training-data-massive.txt',
  'training-data-programming-vocabulary.txt',
  'training-data-q-conversations.txt',
  'training-data-relationships.txt'
];

let compiled = '';
let stats = { files: 0, chars: 0, lines: 0 };

textFiles.forEach(file => {
  const filePath = path.join(servicesDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    compiled += content + '\n\n';
    stats.files++;
    stats.chars += content.length;
    stats.lines += content.split('\n').length;
    console.log(`✅ Added: ${file} (${content.length} chars)`);
  }
});

fs.writeFileSync(outputFile, compiled);
console.log(`\n📦 Compiled ${stats.files} files`);
console.log(`📊 Total: ${stats.chars.toLocaleString()} chars, ${stats.lines.toLocaleString()} lines`);
console.log(`💾 Saved to: ${outputFile}`);
