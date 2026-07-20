import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

/**
 * Premium Notes Renderer with calm, readable styling
 * Designed for extended reading sessions without visual fatigue
 */
function UltimateNotesRenderer({ notes }) {
    if (!notes || notes.length === 0) {
        return (
            <div className="text-stone-400 text-center py-12">
                No notes available for this chapter yet.
            </div>
        );
    }

    /**
     * Strip $$ delimiters from LaTeX content
     */
    const stripDelimiters = (latex) => {
        if (!latex) return '';
        let cleaned = latex.trim();
        if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
            cleaned = cleaned.slice(2, -2).trim();
        } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
            cleaned = cleaned.slice(1, -1).trim();
        }
        return cleaned;
    };

    /**
     * Parse content for inline LaTeX ($...$) and split into parts
     */
    const parseInlineLatex = (text) => {
        if (!text) return null;

        const parts = [];
        const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
        let lastIndex = 0;
        let match;
        let key = 0;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                const textPart = text.slice(lastIndex, match.index);
                parts.push(...formatTextPart(textPart, key));
                key += 10;
            }

            const mathContent = match[1] || match[2];
            try {
                parts.push(
                    <InlineMath key={key++} math={mathContent.trim()} />
                );
            } catch (e) {
                parts.push(
                    <code key={key++} className="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono">
                        {mathContent}
                    </code>
                );
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(...formatTextPart(text.slice(lastIndex), key));
        }

        return parts.length > 0 ? parts : text;
    };

    /**
     * Format text with bold markers
     */
    const formatTextPart = (text, startKey = 0) => {
        const parts = [];
        const boldRegex = /\*\*(.+?)\*\*/g;
        let lastIndex = 0;
        let match;
        let key = startKey;

        while ((match = boldRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
            }
            parts.push(
                <strong key={key++} className="font-medium text-stone-900">
                    {match[1]}
                </strong>
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : [<span key={key}>{text}</span>];
    };

    /**
     * Parse text content with headers, bullets, and inline math
     */
    const parseTextContent = (content) => {
        if (!content) return null;

        const lines = content.split('\n');

        return lines.map((line, lineIndex) => {
            // Handle headers
            if (line.startsWith('## ')) {
                return (
                    <h3 key={lineIndex} className="text-lg font-medium text-stone-900 mt-8 mb-4 first:mt-0 tracking-tight">
                        {line.replace('## ', '')}
                    </h3>
                );
            }

            // Handle bullet points
            if (line.startsWith('* ') || line.startsWith('- ')) {
                const bulletContent = line.replace(/^\* |^- /, '');
                return (
                    <div key={lineIndex} className="flex items-start gap-4 mb-3">
                        <span className="flex-shrink-0 w-1 h-1 bg-stone-300 rounded-full mt-3"></span>
                        <span className="text-stone-700 leading-relaxed">
                            {parseInlineLatex(bulletContent)}
                        </span>
                    </div>
                );
            }

            // Handle numbered lists
            const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
            if (numberedMatch) {
                return (
                    <div key={lineIndex} className="flex items-start gap-4 mb-3">
                        <span className="flex-shrink-0 text-stone-400 text-sm font-medium min-w-[1.5rem]">
                            {numberedMatch[1]}.
                        </span>
                        <span className="text-stone-700 leading-relaxed">
                            {parseInlineLatex(numberedMatch[2])}
                        </span>
                    </div>
                );
            }

            // Handle empty lines
            if (line.trim() === '') {
                return <div key={lineIndex} className="h-4"></div>;
            }

            // Regular paragraph
            return (
                <p key={lineIndex} className="text-stone-700 leading-[1.8] mb-4">
                    {parseInlineLatex(line)}
                </p>
            );
        });
    };

    /**
     * Render a concept/text block as a note card
     */
    const renderConceptBlock = (content, index) => (
        <article
            key={index}
            className="bg-white rounded-lg border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8"
        >
            {parseTextContent(content)}
        </article>
    );

    /**
     * Render a formula block with visual prominence
     */
    const renderFormulaBlock = (content, index) => {
        const cleanedFormula = stripDelimiters(content);
        return (
            <div
                key={index}
                className="my-8"
            >
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 sm:p-8">
                    <div className="text-center overflow-x-auto">
                        <BlockMath math={cleanedFormula} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="reading-column">
            {/* Section Header */}
            <header className="mb-8 pb-6 border-b border-stone-200">
                <h2 className="text-xl font-medium text-stone-900 tracking-tight">
                    Chapter Notes
                </h2>
                <p className="text-stone-500 mt-1 text-sm">
                    Complete conceptual coverage from NCERT
                </p>
            </header>

            {/* Notes Content */}
            <div className="space-y-6">
                {notes.map((item, index) => {
                    if (item.type === 'formula') {
                        return renderFormulaBlock(item.content, index);
                    }
                    return renderConceptBlock(item.content, index);
                })}
            </div>
        </section>
    );
}

export default UltimateNotesRenderer;
