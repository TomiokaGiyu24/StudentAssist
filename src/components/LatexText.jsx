import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Advanced regex to dynamically extract inline math and LaTeX commands:
// 1. Matches standard $math$ wrapped blocks.
// 2. Matches character sequences starting with a backslash (LaTeX commands).
// 3. Matches variables containing subscripts or superscripts (like V_{1}, a^{2}, r^2, q').
// 4. Matches isolated charges (+q, -q, +Q, -Q).
// 5. Matches single-letter variables followed by standard math operator groups (like r - a, t < d).
const inlineMathRegex = /(\$[^$]+\$|\\[a-zA-Z0-9{}_^*+\-\/()<>=\\:\approx\gg\ll\propto\pm\text,|]+|[a-zA-Z]+(?:_\{[^{}]*\}|\^\{[^{}]*\}|_[a-zA-Z0-9]+|\^[a-zA-Z0-9]+|')+|[+-][qQ]|\b[qQVECKrdtpxyzLSFWUT]\b(?:\s*[-+<>=/\\*]\s*[a-zA-Z0-9_{}\\]+)*)/g;

const LatexText = ({ text }) => {
    if (!text) return null;

    // Clean up multiple backslashes (normalize any sequence of 2+ backslashes to a single backslash)
    // and Form Feed characters (\u000c to \f)
    let cleanedText = text
        .replace(/\\{2,}/g, '\\')
        .replace(/\u000c/g, '\\f');

    // Auto-wrap pure math expressions starting with backslash if not already wrapped
    const trimmed = cleanedText.trim();
    if ((trimmed.startsWith('\\') || trimmed.startsWith('-\\') || trimmed.startsWith('+\\')) && !trimmed.endsWith('$')) {
        cleanedText = `$${trimmed}$`;
    }

    // Split text using the advanced regex matcher
    // In JavaScript, capturing groups in split return the matched tokens at odd indices
    const parts = cleanedText.split(inlineMathRegex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part === undefined) return null;
                
                // Even indices are plain text; odd indices are mathematical expressions
                if (index % 2 === 0) {
                    return <span key={index}>{part}</span>;
                } else {
                    // Strip the legacy $ delimiters if they exist in the matched part
                    let mathExpr = part;
                    if (mathExpr.startsWith('$') && mathExpr.endsWith('$')) {
                        mathExpr = mathExpr.slice(1, -1);
                    }
                    
                    // Render the math expression inside InlineMath
                    return <InlineMath key={index} math={mathExpr} />;
                }
            })}
        </span>
    );
};

export default LatexText;
