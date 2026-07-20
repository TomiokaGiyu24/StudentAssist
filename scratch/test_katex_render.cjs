const fs = require('fs');
const katex = require('katex');
const data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/Questions/electricfieldandcharges.json', 'utf8'));

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

data.forEach((chapter, chIdx) => {
    chapter.chapter_assessment_bank.questions.forEach((q, qIdx) => {
        Object.entries(q.options || {}).forEach(([key, val]) => {
            const parsed = processText(val);
            parsed.forEach(item => {
                if (item && item.type === 'math') {
                    try {
                        katex.renderToString(item.val, { throwOnError: true });
                    } catch (err) {
                        console.log(`Failed to render Q ${q.question_id} Option ${key} Math: "${item.val}"`);
                        console.log("Error:", err.message);
                    }
                }
            });
        });
    });
});
