// Test various backslash counts in memory
const cases = [
    "\\frac",       // 1 backslash
    "\\\\frac",     // 2 backslashes
    "\\\\\\\\frac", // 4 backslashes
];

cases.forEach((c, idx) => {
    const cleaned = c.replace(/\\+/g, '\\');
    console.log(`Case ${idx + 1}: original len = ${c.length}, cleaned len = ${cleaned.length}, chars =`, [...cleaned].map(ch => ch.charCodeAt(0)));
});
