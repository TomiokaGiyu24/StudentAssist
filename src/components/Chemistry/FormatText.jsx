import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

// Normalize over-escaped LaTeX strings from JSON data.
// Graph JSON stores "\\\\\\\\chi" which after JSON parse becomes "\\chi" (2 backslashes).
// KaTeX needs "\chi" (1 backslash). This collapses pairs of backslashes into singles.
// For formula strings that already have correct single-backslash escaping, this is a no-op.
export const normalizeLatex = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Collapse every pair of literal backslashes into a single backslash.
    // "\\chi" (92,92,99,...) → "\chi" (92,99,...) 
    // "\chi" (92,99,...) stays unchanged (no pairs to collapse)
    return text.replace(/\\\\/g, '\\');
};

// Smart grouping algorithm to recursively bundle LaTeX commands that are separated by spaces 
// (e.g. implicitly embedded \frac{a}{b} = \frac{c}{d}) without explicit delimiters
const groupMathTokens = (text) => {
    // splits the text, preserving spaces as normal elements
    const words = text.split(/(\s+)/);
    const grouped = [];
    let currentMath = null;

    // A trigger is anything that is definitively a LaTeX command or syntax
    const isMathTrigger = (word) => /[\\_^={}]/.test(word);

    // A continuation is anything that could plausibly be inside an expanded Math formula
    const isPotentialMathContinuation = (word) =>
        /[\\_^={}]/.test(word) ||
        /^[+\-<>*/]$/.test(word.trim()) ||
        /^[A-Za-z]$/.test(word) ||
        /^\d+(\.\d+)?$/.test(word) ||
        /^[()\[\].,;:]$/.test(word);

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const isSpace = /^\s+$/.test(word);

        if (isSpace) {
            if (currentMath !== null) {
                currentMath += word;
            } else {
                grouped.push({ type: 'text', content: word });
            }
            continue;
        }

        const triggered = isMathTrigger(word);

        if (currentMath !== null) {
            if (triggered || isPotentialMathContinuation(word)) {
                currentMath += word;
            } else {
                // Break block, trim trailing spaces
                const trailingSpaces = currentMath.match(/\s+$/);
                if (trailingSpaces) {
                    currentMath = currentMath.slice(0, currentMath.length - trailingSpaces[0].length);
                    grouped.push({ type: 'math', content: currentMath });
                    grouped.push({ type: 'text', content: trailingSpaces[0] });
                } else {
                    grouped.push({ type: 'math', content: currentMath });
                }
                currentMath = null;
                grouped.push({ type: 'text', content: word });
            }
        } else {
            if (triggered) {
                currentMath = word;
            } else {
                grouped.push({ type: 'text', content: word });
            }
        }
    }

    if (currentMath !== null) {
        const trailingSpaces = currentMath.match(/\s+$/);
        if (trailingSpaces) {
            currentMath = currentMath.slice(0, currentMath.length - trailingSpaces[0].length);
            grouped.push({ type: 'math', content: currentMath });
            grouped.push({ type: 'text', content: trailingSpaces[0] });
        } else {
            grouped.push({ type: 'math', content: currentMath });
        }
    }

    return grouped;
};

const renderFormattedContent = (text) => {
    if (!text) return null;
    const blocks = text.split(/(\$\$[\s\S]*?\$\$|\$[^\n$]+?\$|\(\s[\s\S]*?\s\)|\[\s[\s\S]*?\s\])/g);
    return blocks.map((block, i) => {
        if (!block) return null;

        // Handle Explicit Double Dollar Block Math: $$ MATH $$
        if (/^\$\$[\s\S]*\$\$$/.test(block)) {
            const mathCore = block.slice(2, -2).trim();
            return (
                <span key={i} className="block py-2 my-2 text-teal-300 w-full text-center">
                    <BlockMath
                        math={mathCore}
                        renderError={() => <span className="text-stone-200">{mathCore}</span>}
                    />
                </span>
            );
        }

        // Handle Explicit Single Dollar Inline Math: $ MATH $
        if (/^\$[^\n$]+\$$/.test(block)) {
            const mathCore = block.slice(1, -1).trim();
            return (
                <span key={i} className="math-inline mx-[2px] whitespace-nowrap">
                    <InlineMath
                        math={mathCore}
                        renderError={() => <span className="text-stone-200">{mathCore}</span>}
                    />
                </span>
            );
        }

        // Handle Explicit Inline Math Delimiters: ( MATH )
        if (/^\(\s[\s\S]*\s\)$/.test(block)) {
            const mathCore = block.slice(2, -2).trim();
            return (
                <span key={i} className="math-inline mx-[2px] whitespace-nowrap">
                    <InlineMath
                        math={mathCore}
                        renderError={() => <span className="text-stone-200">{mathCore}</span>}
                    />
                </span>
            );
        }

        // Handle Explicit Block Math Delimiters: [ MATH ]
        if (/^\[\s[\s\S]*\s\]$/.test(block)) {
            const mathCore = block.slice(2, -2).trim();
            return (
                <span key={i} className="block py-2 my-2 text-teal-300 w-full text-center">
                    <BlockMath
                        math={mathCore}
                        renderError={() => <span className="text-stone-200">{mathCore}</span>}
                    />
                </span>
            );
        }

        // If not an explicit block, process for implicit math and chemistry
        const tokenGroups = groupMathTokens(block);

        return (
            <React.Fragment key={i}>
                {tokenGroups.map((group, gIdx) => {
                    if (group.type === 'math') {
                        return (
                            <span key={gIdx} className="math-inline mx-[2px] whitespace-nowrap">
                                <InlineMath
                                    math={group.content}
                                    renderError={() => <span className="text-stone-200">{group.content}</span>}
                                />
                            </span>
                        );
                    }

                    // type === 'text', parse for chemical formulas, orbitals, and Greek indicators
                    const textWords = group.content.split(/(\s+)/);
                    return (
                        <React.Fragment key={gIdx}>
                            {textWords.map((word, wIdx) => {
                                if (!word) return null;
                                if (/^\s+$/.test(word)) return <React.Fragment key={wIdx}>{word}</React.Fragment>;

                                // Split by orbital (sp3, sp2), Greek (alpha-, beta-, gamma-), or chemical element with digits (CH2, H2O, C6H5)
                                const parts = word.split(/(sp[23]d?[23]?|alpha-|beta-|gamma-|\b[A-Z][a-z]?\d+)/gi);

                                return (
                                    <span key={wIdx}>
                                        {parts.map((part, pIdx) => {
                                            if (!part) return null;

                                            // Orbitals like sp3, sp2, sp3d2
                                            if (/^sp[23]d?[23]?$/i.test(part)) {
                                                const subParts = part.split(/(\d+)/g);
                                                return (
                                                    <span key={pIdx} className="font-mono text-amber-300">
                                                        {subParts.map((sp, k) => {
                                                            if (/\d+/.test(sp)) {
                                                                return <sup key={k} className="text-[0.75em] font-bold leading-none">{sp}</sup>;
                                                            }
                                                            return sp;
                                                        })}
                                                    </span>
                                                );
                                            }

                                            // Greek prefixes
                                            if (/^alpha-$/i.test(part)) return <span key={pIdx} className="font-bold text-rose-400">α-</span>;
                                            if (/^beta-$/i.test(part)) return <span key={pIdx} className="font-bold text-amber-400">β-</span>;
                                            if (/^gamma-$/i.test(part)) return <span key={pIdx} className="font-bold text-purple-400">γ-</span>;

                                            // Chemical element followed by digits, e.g., C6, H5, O4, H2
                                            if (/^[A-Z][a-z]?\d+$/i.test(part)) {
                                                const match = part.match(/^([A-Z][a-z]?)(\d+)$/i);
                                                if (match) {
                                                    return (
                                                        <span key={pIdx} className="inline-block">
                                                            {match[1]}<sub className="text-[0.75em] font-bold leading-none relative top-[0.1em]">{match[2]}</sub>
                                                        </span>
                                                    );
                                                }
                                            }

                                            // Parse inline chemical bonds (= double bond, - single bond in formulas)
                                            if (part.includes('=') || part.includes('->')) {
                                                const subTokens = part.split(/(=|->)/g);
                                                return (
                                                    <span key={pIdx}>
                                                        {subTokens.map((st, sIdx) => {
                                                            if (st === '=') {
                                                                return <span key={sIdx} className="inline-block px-1 text-sky-400 font-black font-mono tracking-tighter" title="Double Bond (σ + π)">═</span>;
                                                            }
                                                            if (st === '->') {
                                                                return <span key={sIdx} className="inline-block px-1 text-emerald-400 font-bold" title="Reaction Arrow">→</span>;
                                                            }
                                                            return st;
                                                        })}
                                                    </span>
                                                );
                                            }

                                            return <span key={pIdx}>{part}</span>;
                                        })}
                                    </span>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </React.Fragment>
        );
    });
};

const parseHtmlStructure = (text) => {
    // Splits text by bold tags <b>...</b> or markdown bold **...** or line break tags <br> or <br/>
    const regex = /(<b>[\s\S]*?<\/b>|\*\*[\s\S]*?\*\*|<br\s*\/?>)/gi;
    const parts = text.split(regex);
    return parts.map(part => {
        if (/^<b>/i.test(part) && /<\/b>$/i.test(part)) {
            return {
                type: 'bold',
                content: part.slice(3, -4)
            };
        } else if (/^\*\*/.test(part) && /\*\*$/.test(part)) {
            return {
                type: 'bold',
                content: part.slice(2, -2)
            };
        } else if (/^<br\s*\/?>$/i.test(part)) {
            return {
                type: 'br'
            };
        } else {
            return {
                type: 'text',
                content: part
            };
        }
    });
};

export const FormatText = ({ children }) => {
    if (!children || typeof children !== 'string') return children;

    // Normalize over-escaped LaTeX before any processing
    const normalized = normalizeLatex(children);
    const htmlParsed = parseHtmlStructure(normalized);

    return (
        <span className="format-text">
            {htmlParsed.map((chunk, chunkIdx) => {
                if (chunk.type === 'br') {
                    return <br key={chunkIdx} />;
                }
                
                const content = chunk.content;
                if (!content) return null;

                const formatted = renderFormattedContent(content);

                if (chunk.type === 'bold') {
                    return <strong key={chunkIdx} className="font-bold text-white">{formatted}</strong>;
                }

                return <React.Fragment key={chunkIdx}>{formatted}</React.Fragment>;
            })}
        </span>
    );
};
