import fs from 'fs';

const code = fs.readFileSync('./src/App.tsx', 'utf-8');

// Simple regex to find function/component definitions
const componentRegex = /(?:const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:React\.FC.*?|)?[({]|function\s+([A-Z][a-zA-Z0-9]*)\s*\()/g;
const components = [];
let match;
while ((match = componentRegex.exec(code)) !== null) {
  components.push(match[1] || match[2]);
}

console.log("Components found:");
console.log(components.join(', '));

// Let's also find all state variables in 'App' component
const appStart = code.indexOf('function App()');
if (appStart !== -1) {
  const appSnippet = code.substring(appStart, appStart + 2000);
  const stateRegex = /const\s+\[(.*?)\]\s*=\s*useState/g;
  const states = [];
  while ((match = stateRegex.exec(appSnippet)) !== null) {
    states.push(match[1]);
  }
  console.log("\nApp States:");
  console.log(states.join(', '));
}

// Let's look for missing features mentioned: Gemini api / Resume analyzer
console.log("\nMentions of 'resume':", code.includes('resume'));
console.log("Mentions of 'gemini':", code.toLowerCase().includes('gemini'));
console.log("Mentions of 'meet':", code.toLowerCase().includes('meet'));
