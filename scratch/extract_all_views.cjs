const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\7472641d-503b-4490-80bd-6617809d3a22\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.log("Log file does not exist");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('electricfieldandcharges.json')) {
      console.log(`\n--- VIEW_FILE Output at step ${obj.step_index} (line ${idx}) ---`);
      console.log(`Content length: ${obj.content.length}`);
      console.log(obj.content.substring(0, 1000));
      if (obj.content.length > 1000) {
        console.log("... [TRUNCATED IN PRINT] ...");
      }
    }
  } catch (e) {
    // ignore
  }
});
