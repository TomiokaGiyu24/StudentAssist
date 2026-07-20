const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.forEach((chapterData) => {
  if (chapterData.chapter_assessment_bank) {
    chapterData.chapter_assessment_bank.questions.forEach(q => {
      const idNum = parseInt(q.question_id.split('-').pop().replace(/\D/g, ''));
      if (idNum >= 11 && idNum <= 26) {
        console.log(`\n=== ${q.question_id} (${q.format}) ===`);
        console.log(`Stem: ${q.stem_text}`);
        if (q.options) {
          console.log(`Options:`, JSON.stringify(q.options));
        }
      }
    });
  }
});
