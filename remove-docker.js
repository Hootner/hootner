import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'README.md',
  'hexarchy/2-intelligence/ai-hexarchy/2-intelligence/ai-services/video-generation/README.md',
  'hexarchy/2-intelligence/ai-hexarchy/2-intelligence/ai-services/video-generation/README_ENHANCED.md',
  'hexarchy/3-communication/adapters/graphql-api/README.md'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/docker[^\n]*/gi, '');
    content = content.replace(/\n\n\n+/g, '\n\n');
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  }
});
