// Minimal Static Site Generator
import fs from 'fs';
import path from 'path';

class SSG {
  constructor(srcDir, outDir) {
    this.srcDir = srcDir;
    this.outDir = outDir;
  }

  build() {
    if (!fs.existsSync(this.outDir)) fs.mkdirSync(this.outDir, { recursive: true });
    
    const files = fs.readdirSync(this.srcDir);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(this.srcDir, file), 'utf8');
        const html = this.markdown(content);
        const outFile = file.replace('.md', '.html');
        fs.writeFileSync(path.join(this.outDir, outFile), html);
        console.log(`Built: ${outFile}`);
      }
    });
  }

  markdown(md) {
    return `<html><body>${md.replace(/^# (.+)$/gm, '<h1>$1</h1>')}</body></html>`;
  }
}

export default SSG;
