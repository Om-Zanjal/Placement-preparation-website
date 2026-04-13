const fs = require('fs');
const code = fs.readFileSync('./src/App.tsx', 'utf-8');
const lines = code.split('\n');

const results = [];
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('meet') || 
      line.toLowerCase().includes('gemini') || 
      line.toLowerCase().includes('resume') ||
      line.toLowerCase().includes('pdf')) {
    results.push(`${index + 1}: ${line}`);
  }
});

fs.writeFileSync('mentions.txt', results.join('\n'), 'utf-8');
console.log('Done writing mentions.txt');
