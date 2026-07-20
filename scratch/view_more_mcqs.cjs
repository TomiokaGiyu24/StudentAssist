const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.forEach((chapterData) => {
  if (chapterData.chapter_assessment_bank) {
    chapterData.chapter_assessment_bank.questions.forEach(q => {
      const idNum = parseInt(q.question_id.split('-').pop().replace(/\D/g, ''));
      if (idNum >= 40 && idNum <= 50) {
        console.log(`\n=== ${q.question_id} ===`);
        console.log(`Stem: ${q.stem_text}`);
        console.log(`Options:`, JSON.stringify(q.options));
        console.log(`Topper Logic: ${q.topper_execution_logic || q.topper_code_logic}`);
      }
    });
  }
});
