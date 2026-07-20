const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/Questions/electricfieldandcharges.json', 'utf8'));

// Find MCQ-04
const q4 = data[0].chapter_assessment_bank.questions.find(q => q.question_id === 'CH1-MCQ-04');
console.log("MCQ-04:", JSON.stringify(q4, null, 2));

const optB = q4.options.b;
console.log("optB string representation:", optB);
console.log("optB JSON stringified:     ", JSON.stringify(optB));
console.log("optB character codes:      ", [...optB].map(c => c.charCodeAt(0)));
