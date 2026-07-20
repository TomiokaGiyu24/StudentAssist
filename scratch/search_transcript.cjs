const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\2079a5fc-acae-4448-be81-1b3b9238cfce\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('CH1-MCQ-01') || line.includes('boundary limit')) {
    console.log(`Found matching line in transcript:`);
    console.log(line.substring(0, 1000) + '...');
  }
});
