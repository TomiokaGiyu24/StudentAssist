const inlineMathRegex = /(\$[^$]+\$|\\[a-zA-Z0-9{}_^*+\-\/()<>=\\:\approx\gg\ll\propto\pm\text,|]+|[a-zA-Z]+(?:_\{[^{}]*\}|\^\{[^{}]*\}|_[a-zA-Z0-9]+|\^[a-zA-Z0-9]+|')+|[+-][qQ]|\b[qQVECKrdtpxyzLSFWUT]\b(?:\s*[-+<>=/\\*]\s*[a-zA-Z0-9_{}\\]+)*)/g;

function test(text) {
    console.log("Original:", JSON.stringify(text));
    let cleanedText = text
        .replace(/\\\\/g, '\\')
        .replace(/\u000c/g, '\\f');
    console.log("Cleaned: ", JSON.stringify(cleanedText));

    const trimmed = cleanedText.trim();
    if ((trimmed.startsWith('\\') || trimmed.startsWith('-\\') || trimmed.startsWith('+\\')) && !trimmed.endsWith('$')) {
        cleanedText = `$${trimmed}$`;
    }
    console.log("Wrapped: ", JSON.stringify(cleanedText));

    const parts = cleanedText.split(inlineMathRegex);
    console.log("Parts:   ", parts);
}

// Option B from MCQ-04 (with 4 backslashes in JSON)
test("\\\\frac{1}{4\\\\pi\\\\epsilon_{0}}\\\\frac{q q_{0}}{a^{2}}");
