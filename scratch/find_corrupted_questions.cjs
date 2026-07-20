const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/Boards/Physics/Questions/electricfieldandcharges.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log("Analyzing for corruption...\n");

data.forEach((chapterData, idx) => {
  if (chapterData.chapter_assessment_bank) {
    const bank = chapterData.chapter_assessment_bank;
    bank.questions.forEach(q => {
      let isCorrupted = false;
      let reasons = [];

      // Check for empty options in MCQs
      if (q.format === 'MCQ') {
        const emptyOpts = Object.entries(q.options).filter(([k, v]) => !v || v.trim() === '');
        if (emptyOpts.length > 0) {
          isCorrupted = true;
          reasons.push(`Empty options: [${emptyOpts.map(o => o[0]).join(', ')}]`);
        }
      }

      // Check for empty space before punctuation or signs of missing text in stem
      if (q.stem_text.includes('measured as .') || q.stem_text.includes('tripled to ,') || q.stem_text.match(/\b(to|as|is|and|coordinates|between)\s+[.,;?]/i)) {
        isCorrupted = true;
        reasons.push("Stem text seems to have missing math expressions (dangling words before punctuation)");
      }

      if (isCorrupted) {
        console.log(`Question: ${q.question_id} (${q.format})`);
        console.log(`  Reasons: ${reasons.join(' | ')}`);
        console.log(`  Stem: ${q.stem_text}`);
        if (q.options) {
          console.log(`  Options:`, JSON.stringify(q.options));
        }
        console.log(`  Topper Logic: ${q.topper_execution_logic || q.topper_code_logic}`);
        console.log("--------------------------------------------------------------------------------");
      }
    });
  }
});
