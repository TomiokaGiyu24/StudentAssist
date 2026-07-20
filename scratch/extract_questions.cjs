const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPaths = [
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\69923af5-db85-4b02-88fd-6c756835d681\\.system_generated\\logs\\transcript.jsonl',
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\7472641d-503b-4490-80bd-6617809d3a22\\.system_generated\\logs\\transcript.jsonl'
];

logPaths.forEach((logPath, idx) => {
  console.log(`\nScanning ${logPath}...`);
  if (!fs.existsSync(logPath)) {
    console.log("File does not exist!");
    return;
  }
  
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');
  console.log(`Total lines: ${lines.length}`);
  
  lines.forEach((line, lineIdx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      // Look for tool calls that read electricfieldandcharges.json
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'view_file' && tc.args && JSON.stringify(tc.args).includes('electricfieldandcharges.json')) {
            console.log(`Line ${lineIdx}: tool_call to view_file for electricfieldandcharges.json`);
            console.log(`  args:`, JSON.stringify(tc.args));
          }
        });
      }
      
      // Look for the output of the tool call containing the file content
      if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('CH1-MCQ-01')) {
        console.log(`Line ${lineIdx}: VIEW_FILE step output containing CH1-MCQ-01`);
        console.log(`  content length: ${obj.content.length}`);
        const snippet = obj.content.substring(0, 500);
        console.log(`  starts with:`, snippet.replace(/\r?\n/g, ' '));
      }
    } catch (e) {
      // ignore
    }
  });
});
