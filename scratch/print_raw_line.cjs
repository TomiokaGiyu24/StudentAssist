const fs = require('fs');
const lines = fs.readFileSync('src/data/Boards/Physics/Questions/electricfieldandcharges.json', 'utf8').split('\n');
console.log("Raw line 60:", JSON.stringify(lines[59])); // 0-indexed line 60 is index 59
