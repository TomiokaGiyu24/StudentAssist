import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

/**
 * Premium Formula Table with clean, exam-ready styling
 */
function FormulaTable({ formulas }) {
    if (!formulas || formulas.length === 0) {
        return (
            <div className="text-stone-400 text-center py-12">
                No formulas available for this chapter yet.
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

    return (
        <section className="reading-column">
            {/* Section Header */}
            <header className="mb-8 pb-6 border-b border-stone-200">
                <h2 className="text-xl font-medium text-stone-900 tracking-tight">
                    Formula Reference
                </h2>
                <p className="text-stone-500 mt-1 text-sm">
                    Quick lookup for exam preparation
                </p>
            </header>

            {/* Formula Cards */}
            <div className="space-y-4">
                {formulas.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
                    >
                        {/* Formula Display */}
                        <div className="p-6 bg-stone-50 border-b border-stone-100 overflow-x-auto">
                            <div className="text-center">
                                <BlockMath math={stripDelimiters(item.formula)} />
                            </div>
                        </div>

                        {/* Description & Meta */}
                        <div className="p-5 flex items-start justify-between gap-4">
                            <p className="text-stone-600 text-sm leading-relaxed flex-1">
                                {item.description}
                            </p>

                            <span className={`
                flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium
                ${item.use_case === 'Direct Use'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : item.use_case.includes('Direct')
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }
              `}>
                                {item.use_case}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default FormulaTable;
