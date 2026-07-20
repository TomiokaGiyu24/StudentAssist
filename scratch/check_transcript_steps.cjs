const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\2079a5fc-acae-4448-be81-1b3b9238cfce\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 4 || obj.step_index === 5 || obj.step_index === 7) {
      console.log(`Step ${obj.step_index}: source=${obj.source}, type=${obj.type}, status=${obj.status}`);
      if (obj.content) {
        console.log(`  content length: ${obj.content.length}`);
        console.log(`  content starts with: ${obj.content.substring(0, 150).replace(/\r?\n/g, ' ')}`);
        console.log(`  content ends with:   ${obj.content.substring(obj.content.length - 150).replace(/\r?\n/g, ' ')}`);
      }
    }
  } catch (e) {
    // ignore parse error
  }
});
