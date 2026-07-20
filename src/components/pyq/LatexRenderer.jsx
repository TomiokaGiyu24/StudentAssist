import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Enhanced LaTeX renderer component
 * Handles:
 * - Block math $$...$$
 * - Inline math $...$ and \(...\)
 * - Actual newlines (\n) and literal newlines (\\n) -> <br/>
 * - Bold text **...**
 * - Common LaTeX commands (frac, vec, etc.)
 */
function renderLatex(text) {
    if (!text) return '';

    let result = String(text);

    // Handle bold text **...**
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle actual newlines AND literal newlines with double break for spacing
    result = result.replace(/\n|\\n/g, '<br/><br/>');

    // Handle display math $$...$$
    const displayPatterns = result.match(/\$\$[^$]+\$\$/g);
    if (displayPatterns) {
        displayPatterns.forEach(match => {
            try {
                const latex = match.slice(2, -2).trim();
                const rendered = katex.renderToString(latex, {
                    throwOnError: false,
                    displayMode: true,
                    output: 'html'
                });
                result = result.replace(match, `<div class="katex-display-wrapper my-3 overflow-x-auto">${rendered}</div>`);
            } catch (e) {
                console.warn('KaTeX display error:', e);
            }
        });
    }

    // Handle inline math $...$
    const dollarPatterns = result.match(/\$[^$]+\$/g);
    if (dollarPatterns) {
        dollarPatterns.forEach(match => {
            try {
                const latex = match.slice(1, -1).trim();
                const rendered = katex.renderToString(latex, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html'
                });
                result = result.replace(match, rendered);
            } catch (e) {
                console.warn('KaTeX inline error:', e);
            }
        });
    }

    // Handle inline math \(...\)
    const parenPatterns = result.match(/\\\\\((.*?)\\\\\)/g); // Matches \\( ... \\)
    if (parenPatterns) {
        parenPatterns.forEach(match => {
            try {
                const latex = match.slice(3, -3).trim(); // Remove \\( and \\)
                const rendered = katex.renderToString(latex, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html'
                });
                result = result.replace(match, rendered);
            } catch (e) {
                console.warn('KaTeX inline paren error:', e);
            }
        });
    }

    // Handle common LaTeX commands that might not be wrapped in delimiters
    // Handle common LaTeX commands that might not be wrapped in delimiters
    // Fractions - supports one level of nested braces (e.g. \frac{a}{\epsilon_{0}})
    // Regex explanation:
    // \\frac\{
    // (            <- Group 1: Numerator
    //   (?:        <- Non-capturing group for content
    //     [^{}]    <- Any non-brace character
    //     |        <- OR
    //     \{[^{}]*\} <- A nested brace group with no further nesting
    //   )+         <- Repeated one or more times
    // )
    // \}
    // \{           <- Start of Denominator
    // (            <- Group 2: Denominator (same logic)
    //   (?:[^{}]|\{[^{}]*\})+
    // )
    // \}
    result = result.replace(/\\frac\{((?:[^{}]|\{[^{}]*\})+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g, (_, num, den) => {
        try {
            return katex.renderToString(`\\frac{${num}}{${den}}`, { throwOnError: false });
        } catch { return `${num}/${den}`; }
    });

    // Vectors - supports one level of nesting
    result = result.replace(/\\vec\{((?:[^{}]|\{[^{}]*\})+)\}/g, (_, content) => {
        try {
            return katex.renderToString(`\\vec{${content}}`, { throwOnError: false });
        } catch { return content; }
    });

    // Sqrt - supports one level of nesting
    result = result.replace(/\\sqrt\{((?:[^{}]|\{[^{}]*\})+)\}/g, (_, content) => {
        try {
            return katex.renderToString(`\\sqrt{${content}}`, { throwOnError: false });
        } catch { return `sqrt(${content})`; }
    });

    // Greek letters
    const greekLetters = [
        'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa',
        'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon',
        'phi', 'chi', 'psi', 'omega',
        'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega'
    ];

    // Math operators and symbols
    const mathSymbols = [
        // Operations
        'times', 'div', 'pm', 'mp', 'cdot', 'circ', 'ast', 'star',
        // Relations
        'leq', 'geq', 'neq', 'approx', 'equiv', 'cong', 'sim', 'propto',
        'subset', 'supset', 'subseteq', 'supseteq', 'in', 'ni',
        // Arrows
        'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'leftrightarrow', 'Leftrightarrow',
        'to', 'mapsto',
        // Misc
        'infty', 'partial', 'nabla', 'angle', 'triangle', 'forall', 'exists', 'neg', 'top', 'bot',
        'int', 'sum', 'prod' // These might be risky without limits, but worth trying
    ];

    // Standard functions
    const functions = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'log', 'ln', 'exp', 'lim', 'det', 'dim'];

    // Combine all
    const allSymbols = [...greekLetters, ...mathSymbols, ...functions];

    allSymbols.forEach(symbol => {
        // Match \symbol but ensure it's not followed by letters (to avoid matching \sin in \sinh if \sinh wasn't in list)
        // and ensure it's not already inside a latex block (simplistic check)
        const regex = new RegExp(`\\\\${symbol}(?![a-zA-Z])`, 'g');
        result = result.replace(regex, (match) => {
            try {
                return katex.renderToString(match, { throwOnError: false });
            } catch { return match; }
        });
    });

    // Handle degree symbol specifically if it appears as ^\circ or just \circ
    result = result.replace(/\\circ/g, '°'); // Fallback to char if needed, or better:
    // actually \circ is in mathSymbols, so handled above. 

    // Handle combined subscript and superscript: v_m^2 -> v_{m}^{2}
    // usage: Variable_Subscript^Superscript
    result = result.replace(/([a-zA-Z])_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, (match, v, sub, sup) => {
        try {
            return katex.renderToString(`${v}_{${sub}}^{${sup}}`, { throwOnError: false });
        } catch { return match; }
    });

    // Handle just subscript: v_m -> v_{m}
    // Avoid matching if already handled or inside a word
    result = result.replace(/([a-zA-Z])_([a-zA-Z0-9]+)(?!\^)/g, (match, v, sub) => {
        try {
            return katex.renderToString(`${v}_{${sub}}`, { throwOnError: false });
        } catch { return match; }
    });

    // Handle Greek words used as variables (e.g. "lambda", "nu" in "1/lambda")
    // Only match full words that are lower/title case versions of the greekLetters list
    // We filter the list to common ones to avoid false positives (like 'in' or 'to' if they were in the list)
    const greekNames = greekLetters.filter(g => g.length > 2); // Filter out 'pi', 'mu', 'nu', 'xi', 'chi', 'rho' might be risky? 'pi' is definitely ok.
    // actually 'nu' is a word. 'pi' is ok.
    // Let's stick to the list but exclude short ones that assume english words except specific contexts?
    // User specifically mentioned 'lambda'.
    const safeGreek = ['alpha', 'beta', 'gamma', 'delta', 'theta', 'lambda', 'mu', 'nu', 'pi', 'rho', 'sigma', 'tau', 'phi', 'psi', 'omega'];

    // Regex to find "lambda" and replace with rendered \lambda
    // We construct a regex like \b(lambda|mu|...)\b
    // BUT we must allow it to be followed by math chars like ^ or _ or /
    const greekRegex = new RegExp(`\\b(${safeGreek.join('|')})\\b`, 'gi');
    result = result.replace(greekRegex, (match) => {
        // Convert match to lowercase for the latex command (or keep case if needed?)
        // usually \Lambda vs \lambda. The list is all lowercase above.
        // If the text is "Lambda", render \Lambda?
        // simple approach: force lowercase command for now unless we improve logic
        try {
            const cmd = match.toLowerCase();
            return katex.renderToString(`\\${cmd}`, { throwOnError: false });
        } catch { return match; }
    });

    // Handle standard ^\circ pattern which might be common for degrees
    result = result.replace(/\^\{\\circ\}/g, '°');

    // Handle scientific notation: number x 10^power or number * 10^power
    // Example: 6.0 x 10^14 -> 6.0 \times 10^{14}
    // We look for: (digits/dot) space? (x|*) space? 10\^({?)(-?\d+)}?
    result = result.replace(/(\d+(?:\.\d+)?)[\s]*[x*][\s]*10\^\{?(-?\d+)\}?/g, (match, num, power) => {
        try {
            return katex.renderToString(`${num} \\times 10^{${power}}`, { throwOnError: false });
        } catch { return match; }
    });

    // Handle just 10^power without the prefix, if it looks like scientific notation
    result = result.replace(/(?<!\d)10\^\{?(-?\d+)\}?/g, (match, power) => {
        try {
            return katex.renderToString(`10^{${power}}`, { throwOnError: false });
        } catch { return match; }
    });

    return result;
}

// ... (imports)

// ... (renderLatex function)

/**
 * LatexRenderer Component
 * @param {string} text - The text containing LaTeX, Markdown-style bold, and newlines
 * @param {string} className - Additional classes for the container
 */
export default function LatexRenderer({ text, className = "" }) {
    if (!text) return null;

    return (
        <div
            className={`font-serif leading-relaxed break-words overflow-wrap-anywhere ${className}`}
            dangerouslySetInnerHTML={{ __html: renderLatex(text) }}
        />
    );
}

/**
 * Renders a block math expression (used for isolated formulas)
 */
export function BlockMath({ math, className = "" }) {
    if (!math) return null;
    try {
        const html = katex.renderToString(math, { throwOnError: false, displayMode: true });
        return (
            <div
                className={`overflow-x-auto py-2 ${className}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    } catch (e) {
        return <code className="text-sm bg-stone-100 p-1 rounded">{math}</code>;
    }
}
