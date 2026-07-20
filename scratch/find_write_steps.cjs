const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPaths = [
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\69923af5-db85-4b02-88fd-6c756835d681\\.system_generated\\logs\\transcript.jsonl',
  'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\7472641d-503b-4490-80bd-6617809d3a22\\.system_generated\\logs\\transcript.jsonl'
];

logPaths.forEach((logPath) => {
  if (!fs.existsSync(logPath)) return;
  console.log(`\nScanning ${logPath}...`);
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      // Look for tool calls that wrote to electricfieldandcharges.json
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if ((tc.name === 'write_to_file' || tc.name === 'replace_file_content') && tc.args && JSON.stringify(tc.args).includes('electricfieldandcharges.json')) {
            console.log(`Line ${idx}: tool_call to ${tc.name}`);
            const argsStr = JSON.stringify(tc.args);
            console.log(`  args length: ${argsStr.length}`);
            console.log(`  TargetFile: ${tc.args.TargetFile || tc.args.AbsolutePath}`);
            // Check if there is CodeContent or ReplacementContent
            const contentLen = (tc.args.CodeContent || tc.args.ReplacementContent || '').length;
            console.log(`  Content length: ${contentLen}`);
            if (contentLen > 0) {
              const code = tc.args.CodeContent || tc.args.ReplacementContent;
              console.log(`  Starts with: ${code.substring(0, 300).replace(/\r?\n/g, ' ')}`);
              console.log(`  Ends with:   ${code.substring(code.length - 300).replace(/\r?\n/g, ' ')}`);
              
              // Write this code content to a file in scratch for recovery!
              const recoveryFile = `C:\\StudentAssist-main\\scratch\\recovered_write_line_${idx}.json`;
              fs.writeFileSync(recoveryFile, code);
              console.log(`  Saved recovered code to ${recoveryFile}`);
            }
          }
        });
      }
    } catch (e) {
      // ignore
    }
  });
});
