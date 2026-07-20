const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/Questions/electricfieldandcharges.json', 'utf8'));
const q4 = data[0].chapter_assessment_bank.questions.find(q => q.question_id === 'CH1-MCQ-04');

const inlineMathRegex = /(\$[^$]+\$|\\[a-zA-Z0-9{}_^*+\-\/()<>=\\:\approx\gg\ll\propto\pm\text,|]+|[a-zA-Z]+(?:_\{[^{}]*\}|\^\{[^{}]*\}|_[a-zA-Z0-9]+|\^[a-zA-Z0-9]+|')+|[+-][qQ]|\b[qQVECKrdtpxyzLSFWUT]\b(?:\s*[-+<>=/\\*]\s*[a-zA-Z0-9_{}\\]+)*)/g;

function processText(text) {
    let cleanedText = text
        .replace(/\\\\/g, '\\')
        .replace(/\u000c/g, '\\f');
    const trimmed = cleanedText.trim();
    if ((trimmed.startsWith('\\') || trimmed.startsWith('-\\') || trimmed.startsWith('+\\')) && !trimmed.endsWith('$')) {
        cleanedText = `$${trimmed}$`;
    }
    const parts = cleanedText.split(inlineMathRegex);
    return parts.map((part, index) => {
        if (part === undefined) return null;
        if (index % 2 === 0) {
            return { type: 'text', val: part };
        } else {
            let mathExpr = part;
            if (mathExpr.startsWith('$') && mathExpr.endsWith('$')) {
                mathExpr = mathExpr.slice(1, -1);
            }
            return { type: 'math', val: mathExpr };
        }
    });
}

console.log("Option A:", JSON.stringify(processText(q4.options.a), null, 2));
console.log("Option B:", JSON.stringify(processText(q4.options.b), null, 2));
console.log("Option C:", JSON.stringify(processText(q4.options.c), null, 2));
console.log("Option D:", JSON.stringify(processText(q4.options.d), null, 2));
