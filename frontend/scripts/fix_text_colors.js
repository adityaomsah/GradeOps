import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(pagesDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // replacements
    const newContent = content
      .replaceAll('<h1 className="text-xl font-bold text-slate-800">', '<h1 className="text-xl font-bold text-slate-800 dark:text-white">')
      .replaceAll('<h1 className="text-xl font-bold text-slate-800 mb-1">', '<h1 className="text-xl font-bold text-slate-800 dark:text-white mb-1">')
      .replaceAll('className="text-sm text-slate-500 mb-6"', 'className="text-sm text-slate-500 dark:text-slate-400 mb-6"')
      .replaceAll('<h2 className="text-lg font-semibold text-slate-800 mb-4">', '<h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${path.basename(filePath)}`);
    }
  }
});
