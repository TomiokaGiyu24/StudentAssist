const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const targetIds = ['CH1-MCQ-44', 'CH1-MCQ-47', 'CH1-MCQ-50'];

data.forEach((chapterData) => {
  if (chapterData.chapter_assessment_bank) {
    chapterData.chapter_assessment_bank.questions.forEach(q => {
      if (targetIds.includes(q.question_id)) {
        console.log(`\n=== ${q.question_id} ===`);
        console.log(JSON.stringify(q, null, 2));
      }
    });
  }
});
