const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/Questions/electricfieldandcharges.json', 'utf8'));

data.forEach((chapter, chIdx) => {
    chapter.chapter_assessment_bank.questions.forEach((q, qIdx) => {
        // Check stem text
        if (q.stem_text.includes('epsilon')) {
            console.log(`Q ${q.question_id} Stem:`, q.stem_text);
        }
        // Check options
        Object.entries(q.options || {}).forEach(([key, val]) => {
            if (val.includes('epsilon')) {
                console.log(`Q ${q.question_id} Option ${key}:`, val);
            }
        });
        // Check execution logic
        if (q.topper_execution_logic && q.topper_execution_logic.includes('epsilon')) {
            console.log(`Q ${q.question_id} Logic:`, q.topper_execution_logic);
        }
    });
});
