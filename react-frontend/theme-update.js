import fs from 'fs';
import path from 'path';

const dir = './src';

const replacements = [
  { from: /text-gray-900/g, to: 'text-navy' },
  { from: /text-gray-800/g, to: 'text-navy' },
  { from: /bg-gray-900/g, to: 'bg-navy' },
  { from: /hover:bg-gray-800/g, to: 'hover:bg-navy-hover' },
  { from: /bg-blue-600/g, to: 'bg-coral' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-coral-hover' },
  { from: /hover:bg-blue-500/g, to: 'hover:bg-coral' },
  { from: /text-blue-600/g, to: 'text-coral' },
  { from: /text-blue-700/g, to: 'text-coral' },
  { from: /hover:text-blue-700/g, to: 'hover:text-coral-hover' },
  { from: /hover:text-blue-500/g, to: 'hover:text-coral-hover' },
  { from: /focus-visible:outline-blue-500/g, to: 'focus-visible:outline-coral' },
  { from: /focus:ring-blue-500/g, to: 'focus:ring-coral' },
  { from: /focus:border-blue-500/g, to: 'focus:border-coral' },
  { from: /border-blue-500/g, to: 'border-coral' },
  { from: /border-blue-200/g, to: 'border-coral/20' },
  { from: /bg-blue-50/g, to: 'bg-skin' },
  { from: /bg-blue-100/g, to: 'bg-skin/80' },
  { from: /hover:bg-blue-100/g, to: 'hover:bg-skin/80' },
  { from: /text-blue-500/g, to: 'text-coral' },
  { from: /text-blue-800/g, to: 'text-navy' },
  { from: /border-blue-100/g, to: 'border-skin' },
  { from: /ring-blue-300/g, to: 'ring-coral/50' },
  { from: /from-sky-50 to-cyan-50/g, to: 'from-skin to-cream' },
  { from: /text-sky-700/g, to: 'text-coral' },
  { from: /bg-sky-500/g, to: 'bg-coral' },
  { from: /bg-sky-50/g, to: 'bg-skin' },
  { from: /border-sky-100/g, to: 'border-coral/20' },
  { from: /text-sky-900/g, to: 'text-navy' },
];

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(dir);
