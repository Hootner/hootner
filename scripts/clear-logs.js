import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');

const clearLogs = () => {
  const dirs = ['services', 'servers', 'access', 'errors'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(logsDir, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(dirPath, file));
        }
      });
      console.log(`✓ Cleared ${dir} logs`);
    }
  });
  
  const combinedLog = path.join(logsDir, 'combined.log');
  if (fs.existsSync(combinedLog)) {
    fs.writeFileSync(combinedLog, '');
    console.log('✓ Cleared combined.log');
  }
  
  console.log('All logs cleared');
};

clearLogs();
