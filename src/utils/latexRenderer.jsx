import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Render text segments that contain raw LaTeX (no $ delimiters)
 */
const renderRawLatexSegments = (text, baseKey) => {
    const latexPattern = /(\\(?:frac|sqrt|vec|hat|bar|mathbf|boldsymbol|text|overline|underline)\{(?:[^{}]*|\{[^{}]*\})*\}(?:\{(?:[^{}]*|\{[^{}]*\})*\})?|\\[a-zA-Z]+(?:_\{[^}]+\}|\^\{[^}]+\})*|[a-zA-Z0-9]+[_^]\{[^}]+\}|[_^]\{[^}]+\})/g;

    const result = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    latexPattern.lastIndex = 0;

    while ((match = latexPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            result.push(
                <span key={`${baseKey}-text-${keyIndex++}`}>
                    {text.slice(lastIndex, match.index)}
                </span>
            );
        }

        try {
            result.push(
                <InlineMath key={`${baseKey}-math-${keyIndex++}`} math={match[0]} />
            );
        } catch (e) {
            result.push(
                <code key={`${baseKey}-code-${keyIndex++}`} className="bg-white/10 px-1 rounded text-sm">
                    {match[0]}
                </code>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        result.push(
            <span key={`${baseKey}-text-${keyIndex++}`}>
                {text.slice(lastIndex)}
            </span>
        );
    }

    if (result.length === 0) {
        return <span key={baseKey}>{text}</span>;
    }

    return result;
};

/**
 * Render inline LaTeX within text
 */
export const renderTextWithLatex = (text) => {
    if (!text) return null;

    if (text.includes('$')) {
        const parts = text.split(/(\$[^$]+\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1);
                try {
                    return <InlineMath key={i} math={latex} />;
                } catch (e) {
                    return <code key={i} className="bg-white/10 px-1 rounded text-sm">{latex}</code>;
                }
            }
            if (/\\[a-zA-Z]/.test(part)) {
                return renderRawLatexSegments(part, i);
            }
            return <span key={i}>{part}</span>;
        });
    }

    if (/\\[a-zA-Z]/.test(text)) {
        return renderRawLatexSegments(text, 0);
    }

    return <span>{text}</span>;
};
