const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.forEach((chapterData, idx) => {
  if (chapterData.chapter_assessment_bank) {
    const bank = chapterData.chapter_assessment_bank;
    bank.questions.forEach(q => {
      if (q.format === 'MCQ') {
        Object.entries(q.options).forEach(([key, val]) => {
          // Detect weird formatting: double dollars, backslash dollars, trailing dollars, etc.
          if (val.includes('$$') || val.includes('\\$') || (val.match(/\$/g) || []).length > 2) {
            console.log(`Question: ${q.question_id} Option ${key}: "${val}"`);
          }
        });
      }
    });
  }
});
