import React from 'react';
import { BlockMath } from 'react-katex';
import { renderTextWithLatex } from '../../../utils/latexRenderer';

function FormulaCard({ item }) {
    return (
        <div className="bg-gradient-to-br from-teal-900/20 to-emerald-900/10 border border-teal-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            {item.label && (
                <div className="mb-4">
                    <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-teal-500/30">
                        {item.label}
                    </span>
                </div>
            )}
            
            <div className="bg-black/40 rounded-xl p-4 text-center overflow-x-auto dark-katex mb-4 shadow-inner border border-white/5">
                <BlockMath math={item.latex} />
            </div>

            {item.conditions && item.conditions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-teal-500/10">
                    <p className="text-teal-400 text-[10px] uppercase tracking-wider font-bold mb-2">Conditions & Parameters</p>
                    <ul className="space-y-1">
                        {item.conditions.map((cond, i) => (
                            <li key={i} className="text-white/70 text-sm flex items-start gap-2 font-light">
                                <span className="text-teal-500 mt-0.5 shadow-[0_0_5px_rgba(20,184,166,0.8)]">•</span>
                                <span>{renderTextWithLatex(cond)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {item.physical_meaning && (
                <div className="mt-4 bg-teal-500/5 rounded-lg p-3 border-l-2 border-teal-500">
                    <p className="text-teal-200/80 text-sm leading-relaxed">
                        <span className="font-semibold text-teal-400 text-xs uppercase mr-2">Meaning:</span>
                        {renderTextWithLatex(item.physical_meaning)}
                    </p>
                </div>
            )}

            {item.variables && item.variables.length > 0 && (
                <div className="mt-4 pt-4 border-t border-teal-500/10">
                    <p className="text-teal-400 text-[10px] uppercase tracking-wider font-bold mb-3">Variables & Units</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.variables.map((v, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-teal-300 font-mono bg-teal-900/40 px-2 py-0.5 rounded text-sm"><BlockMath math={v.symbol} /></span>
                                    {v.unit && <span className="text-white/40 text-xs px-2 py-0.5 bg-white/5 rounded border border-white/5">{renderTextWithLatex(v.unit)}</span>}
                                </div>
                                <span className="text-white/80 text-sm font-medium">{v.name}</span>
                                {v.note && <span className="text-white/50 text-xs leading-tight">{renderTextWithLatex(v.note)}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {item.si_unit_of_result && (
                <div className="mt-4 pt-3 flex items-center gap-2 text-sm">
                    <span className="text-teal-500/70 font-semibold text-xs uppercase tracking-wider">SI Unit of Result:</span>
                    <span className="text-white/80 px-2 py-1 bg-white/5 rounded-md border border-white/10">{renderTextWithLatex(item.si_unit_of_result)}</span>
                </div>
            )}

            {item.common_error && (
                <div className="mt-4 bg-red-500/10 rounded-lg p-3 border-l-2 border-red-500">
                    <p className="text-red-200/80 text-sm leading-relaxed">
                        <span className="font-bold text-red-400 text-xs uppercase mr-2 flex items-center gap-1 inline-flex">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Common Error:
                        </span>
                        {renderTextWithLatex(item.common_error)}
                    </p>
                </div>
            )}
        </div>
    );
}

export default FormulaCard;
