import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

/**
 * Renders notes with different block types: concept, formula, derived_result, diagram, application
 */
function NotesRenderer({ notes }) {
    if (!notes || notes.length === 0) {
        return (
            <div className="text-white/40 text-center py-12">
                No notes available for this chapter yet.
            </div>
        );
    }

    /**
     * Render inline LaTeX within text
     * Handles both $...$ delimited math and raw LaTeX commands
     */
    const renderTextWithLatex = (text) => {
        if (!text) return null;

        // First check for explicit $...$ delimited math
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
                // Check if this non-$ part still has raw LaTeX
                if (/\\[a-zA-Z]/.test(part)) {
                    return renderRawLatexSegments(part, i);
                }
                return <span key={i}>{part}</span>;
            });
        }

        // No $ delimiters, check for raw LaTeX patterns
        if (/\\[a-zA-Z]/.test(text)) {
            return renderRawLatexSegments(text, 0);
        }

        return <span>{text}</span>;
    };

    /**
     * Render text segments that contain raw LaTeX (no $ delimiters)
     * Uses a comprehensive regex to find entire LaTeX expressions
     */
    const renderRawLatexSegments = (text, baseKey) => {
        // Comprehensive regex to match LaTeX expressions including:
        // - Commands with braces: \frac{...}{...}, \sqrt{...}, \vec{...}, etc.
        // - Greek letters: \alpha, \beta, \epsilon, \lambda, etc.
        // - Operators: \times, \cdot, \pm, etc.
        // - Relations: \leq, \geq, \approx, etc.
        // - Subscripts/superscripts with their content
        // This regex tries to match complete LaTeX expressions
        const latexPattern = /(\\(?:frac|sqrt|vec|hat|bar|mathbf|boldsymbol|text|overline|underline)\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}\{[^{}]*\}|\\(?:frac|sqrt|vec|hat|bar|mathbf|boldsymbol|text|overline|underline)\{[^{}]*\}|\\[a-zA-Z]+(?:_\{[^}]+\}|\^\{[^}]+\})*|[a-zA-Z0-9]+[_^]\{[^}]+\}|[_^]\{[^}]+\})/g;

        const result = [];
        let lastIndex = 0;
        let match;
        let keyIndex = 0;

        // Reset regex lastIndex
        latexPattern.lastIndex = 0;

        while ((match = latexPattern.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                result.push(
                    <span key={`${baseKey}-text-${keyIndex++}`}>
                        {text.slice(lastIndex, match.index)}
                    </span>
                );
            }

            // Add the LaTeX match
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

        // Add remaining text after last match
        if (lastIndex < text.length) {
            result.push(
                <span key={`${baseKey}-text-${keyIndex++}`}>
                    {text.slice(lastIndex)}
                </span>
            );
        }

        // If no matches were found, return original text
        if (result.length === 0) {
            return <span key={baseKey}>{text}</span>;
        }

        return result;
    };

    /**
     * Render a concept block
     */
    const renderConcept = (item, index) => (
        <article
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                {item.title}
            </h3>
            <ul className="space-y-3">
                {item.points?.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 leading-relaxed">
                        <span className="flex-shrink-0 w-1 h-1 rounded-full bg-white/30 mt-2.5"></span>
                        <span>{renderTextWithLatex(point)}</span>
                    </li>
                ))}
            </ul>
        </article>
    );

    /**
     * Render a formula block
     */
    const renderFormula = (item, index) => (
        <div
            key={index}
            className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
            {/* Label */}
            {item.label && (
                <div className="mb-4">
                    <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full">
                        {item.label}
                    </span>
                </div>
            )}

            {/* Formula */}
            <div className="text-center py-2 overflow-x-auto dark-katex">
                <BlockMath math={item.latex} />
            </div>

            {/* Conditions */}
            {item.conditions && item.conditions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Conditions</p>
                    <ul className="space-y-1">
                        {item.conditions.map((cond, i) => (
                            <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                                <span className="text-indigo-400">•</span>
                                {renderTextWithLatex(cond)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    /**
     * Render a derived result block
     */
    const renderDerivedResult = (item, index) => (
        <div
            key={index}
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
            {/* Badge */}
            <div className="mb-3">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full">
                    Derived Result
                </span>
            </div>

            {/* Statement */}
            <p className="text-white/80 font-medium mb-4">
                {renderTextWithLatex(item.statement)}
            </p>

            {/* Formula */}
            <div className="bg-black/20 rounded-xl p-4 text-center overflow-x-auto dark-katex">
                <BlockMath math={item.latex} />
            </div>

            {/* Valid When */}
            {item.valid_when && (
                <p className="mt-4 text-amber-300/70 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {renderTextWithLatex(item.valid_when)}
                </p>
            )}
        </div>
    );

    /**
     * Render a diagram block
     */
    const renderDiagram = (item, index) => (
        <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
            {item.title && (
                <h4 className="text-white/80 font-medium mb-4">{item.title}</h4>
            )}

            {item.image || item.image_path ? (
                <img src={item.image || item.image_path} alt={item.caption || item.title} className="max-w-full mx-auto rounded-lg" />
            ) : (
                <div className="py-8 text-white/30 text-sm">
                    [Diagram placeholder]
                </div>
            )}

            {item.caption && (
                <p className="mt-4 text-white/50 text-sm italic">{renderTextWithLatex(item.caption)}</p>
            )}
        </div>
    );

    /**
     * Render an application block
     */
    const renderApplication = (item, index) => (
        <div
            key={index}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
            {/* Badge */}
            <div className="mb-3">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full">
                    Application
                </span>
            </div>

            {/* Title */}
            <h4 className="text-white font-semibold text-lg mb-4">
                {item.title}
            </h4>

            {/* Assumptions */}
            {item.assumptions && item.assumptions.length > 0 && (
                <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Assumptions</p>
                    <ul className="space-y-1">
                        {item.assumptions.map((assumption, i) => (
                            <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                                <span className="text-emerald-400">•</span>
                                {renderTextWithLatex(assumption)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Result */}
            {item.result && (
                <div className="bg-black/20 rounded-xl p-4 dark-katex">
                    <div className="text-center overflow-x-auto mb-2">
                        <BlockMath math={item.result.latex} />
                    </div>
                    {item.result.direction && (
                        <p className="text-emerald-300/70 text-sm text-center">
                            {renderTextWithLatex(item.result.direction)}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    /**
     * Render a block based on its type
     */
    const renderBlock = (item, index) => {
        switch (item.type) {
            case 'concept':
                return renderConcept(item, index);
            case 'formula':
                return renderFormula(item, index);
            case 'derived_result':
                return renderDerivedResult(item, index);
            case 'diagram':
                return renderDiagram(item, index);
            case 'application':
                return renderApplication(item, index);
            default:
                return null;
        }
    };

    return (
        <div className="space-y-5">
            {notes.map((item, index) => renderBlock(item, index))}
        </div>
    );
}

export default NotesRenderer;
