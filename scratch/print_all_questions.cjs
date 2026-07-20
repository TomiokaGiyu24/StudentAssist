const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log("Number of root objects:", data.length);

data.forEach((chapterData, idx) => {
  console.log(`\nRoot object [${idx}]:`);
  if (chapterData.chapter_assessment_bank) {
    const bank = chapterData.chapter_assessment_bank;
    console.log(`  chapter_assessment_bank: Chapter ${bank.chapter_number} - ${bank.chapter_name}`);
    console.log(`    Number of questions: ${bank.questions ? bank.questions.length : 0}`);
    if (bank.questions) {
      bank.questions.forEach(q => {
        console.log(`      - [${q.format}] ${q.question_id}: ${q.stem_text.substring(0, 100)}...`);
        if (q.format === 'MCQ') {
          console.log(`        Options: a: "${q.options.a}", b: "${q.options.b}", c: "${q.options.c}", d: "${q.options.d}"`);
        }
      });
    }
  }
  if (chapterData.chapter_subjective_bank) {
    const bank = chapterData.chapter_subjective_bank;
    console.log(`  chapter_subjective_bank: Chapter ${bank.chapter_number} - ${bank.chapter_name}`);
    console.log(`    Number of questions: ${bank.questions ? bank.questions.length : 0}`);
    if (bank.questions) {
      bank.questions.forEach(q => {
        console.log(`      - [SUBJECTIVE] ${q.question_id || q.id}: ${q.stem_text ? q.stem_text.substring(0, 100) : (q.question ? q.question.substring(0,100) : '')}...`);
      });
    }
  }
});
