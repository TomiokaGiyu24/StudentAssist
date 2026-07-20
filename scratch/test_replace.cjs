const text = "\\\\frac"; // in memory: two backslashes and "frac"
console.log("Original: ", text, "len:", text.length, [...text].map(c => c.charCodeAt(0)));
const replaced = text.replace(/\\\\/g, '\\');
console.log("Replaced: ", replaced, "len:", replaced.length, [...replaced].map(c => c.charCodeAt(0)));
const replaced2 = text.replace(/\\\\/g, '\\\\');
console.log("Replaced2:", replaced2, "len:", replaced2.length, [...replaced2].map(c => c.charCodeAt(0)));
const replaced3 = text.replace(/\\\\/g, () => '\\');
console.log("Replaced3:", replaced3, "len:", replaced3.length, [...replaced3].map(c => c.charCodeAt(0)));
