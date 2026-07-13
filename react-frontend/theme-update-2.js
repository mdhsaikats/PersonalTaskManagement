import fs from 'fs';
import path from 'path';

const dir = './src';

const replacements = [
  // replace remaining grays with navy opacities or skin/cream
  { from: /bg-gray-50/g, to: 'bg-skin/50' },
  { from: /bg-gray-100/g, to: 'bg-skin' },
  { from: /border-gray-100/g, to: 'border-skin' },
  { from: /border-gray-200/g, to: 'border-skin' },
  { from: /border-gray-300/g, to: 'border-navy/20' },
  { from: /text-gray-400/g, to: 'text-navy/50' },
  { from: /text-gray-500/g, to: 'text-navy/60' },
  { from: /text-gray-600/g, to: 'text-navy/70' },
  { from: /text-gray-700/g, to: 'text-navy/80' },
  { from: /text-gray-800/g, to: 'text-navy' },
  { from: /text-gray-900/g, to: 'text-navy' },
  
  // also handle hovers
  { from: /hover:bg-gray-50/g, to: 'hover:bg-skin/50' },
  { from: /hover:bg-gray-100/g, to: 'hover:bg-skin' },
  { from: /hover:text-gray-900/g, to: 'hover:text-navy' },
  { from: /hover:text-gray-600/g, to: 'hover:text-navy/70' },
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
