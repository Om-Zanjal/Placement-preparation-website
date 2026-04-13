const fs = require('fs');

const code = fs.readFileSync('./src/App.tsx', 'utf-8');
const lines = code.split('\n');

const terms = [
  'ExpertAvailabilityManager',
  'ExpertDashboardView',
  'Log out',
  'Logout',
  'button',
  'expert_joined',
  'start_time'
];

const results = {};
terms.forEach(term => results[term] = []);

lines.forEach((line, index) => {
  terms.forEach(term => {
    if (line.includes(term)) {
      results[term].push(index + 1);
    }
  });
});

for (const [term, matches] of Object.entries(results)) {
  console.log(`\n--- Matches for '${term}' ---`);
  // Only slice first 10 matches to avoid overwhelming output, except for a few
  const max = (term === 'ExpertDashboardView' || term === 'ExpertAvailabilityManager') ? matches.length : 10;
  
  matches.slice(0, max).forEach(lineNum => {
    console.log(`${lineNum}: ${lines[lineNum - 1].trim()}`);
  });
}
