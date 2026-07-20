const fs = require('fs');
const path = require('path');

const logPaths = [
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\69923af5-db85-4b02-88fd-6c756835d681\\.system_generated\\logs\\transcript.jsonl',
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\7472641d-503b-4490-80bd-6617809d3a22\\.system_generated\\logs\\transcript.jsonl'
];

const found = {};

logPaths.forEach((logPath) => {
  if (!fs.existsSync(logPath)) return;
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      // Scan for any question ID
      for (let i = 1; i <= 50; i++) {
        const id = `CH1-MCQ-${i.toString().padStart(2, '0')}`;
        if (str.includes(id)) {
          // Find the question object structure inside the string
          // We can use a regex to find the question block starting with question_id
          const regex = new RegExp(`\\{\\s*"question_id"\\s*:\\s*"${id}"[^}]+?\\}`, 'g');
          let match;
          while ((match = regex.exec(str)) !== null) {
            if (!found[id] || found[id].length < match[0].length) {
              found[id] = match[0];
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  });
});

console.log("RECONSTRUCTED QUESTIONS FOUND:");
Object.keys(found).sort().forEach(id => {
  console.log(`\n=== ${id} ===`);
  try {
    const parsed = JSON.parse(found[id]);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log(found[id]);
  }
});
