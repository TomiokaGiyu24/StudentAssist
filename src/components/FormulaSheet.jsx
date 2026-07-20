import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { renderTextWithLatex } from '../utils/latexRenderer';

/**
 * Renders the formula sheet with clean card layout
 */
function FormulaSheet({ formulas }) {
    if (!formulas || formulas.length === 0) {
        return (
            <div className="text-white/40 text-center py-12">
                No formulas available for this chapter yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {formulas.map((item, index) => (
                <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                >
                    {/* Header: Label & Frequency */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                        <span className="text-indigo-300 text-xs uppercase tracking-wider font-bold">
                            {item.label || "Formula"}
                        </span>
                        {item.board_frequency && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                                item.board_frequency === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                item.board_frequency === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                                {item.board_frequency}
                            </span>
                        )}
                    </div>

                    {/* Formula Display */}
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-b border-white/10 overflow-x-auto dark-katex">
                        <div className="text-center">
                            <BlockMath math={item.latex} />
                        </div>
                    </div>

                    {/* Description & Use Case */}
                    <div className="p-5">
                        <p className="text-white/80 font-medium mb-3">
                            {renderTextWithLatex(item.description)}
                        </p>
                        
                        {item.variables && item.variables.length > 0 && (
                            <div className="mb-4 bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-indigo-400 text-[10px] uppercase tracking-wider font-bold mb-3">Variables & Units</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {item.variables.map((v, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-300 font-mono bg-indigo-900/40 px-1.5 py-0.5 rounded text-xs"><InlineMath math={v.symbol} /></span>
                                                <span className="text-white/80 text-xs font-medium">{v.name}</span>
                                            </div>
                                            {v.unit && <span className="text-white/40 text-[10px] pl-7">{renderTextWithLatex(v.unit)}</span>}
                                            {v.note && <span className="text-white/40 text-[10px] pl-7 italic">{renderTextWithLatex(v.note)}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mt-2">
                            {item.use_case && (
                                <p className="text-white/60 text-xs flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="font-semibold text-indigo-300/80 uppercase text-[10px] tracking-wider">Use Case:</span>
                                    {item.use_case}
                                </p>
                            )}
                            
                            {item.si_unit_of_result && (
                                <p className="text-white/60 text-xs flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                    <span className="font-semibold text-indigo-300/80 uppercase text-[10px] tracking-wider">SI Unit:</span>
                                    {renderTextWithLatex(item.si_unit_of_result)}
                                </p>
                            )}
                        </div>

                        {item.common_error && (
                            <div className="mt-4 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                <p className="text-red-200/80 text-xs leading-relaxed flex items-start gap-2">
                                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span>
                                        <span className="font-bold text-red-400 uppercase tracking-wider mr-1">Trap:</span>
                                        {renderTextWithLatex(item.common_error)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default FormulaSheet;
