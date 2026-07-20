import React from 'react';
import { renderTextWithLatex } from '../../../utils/latexRenderer';

function ConceptCard({ item }) {
    return (
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-500/30">
                    Tier {item.tier}
                </span>
                <h3 className="text-lg font-bold text-white">
                    {item.title}
                </h3>
            </div>
            
            <ul className="space-y-3 relative z-10 mb-4">
                {item.points?.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/75 leading-relaxed text-sm md:text-[15px]">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                        <span className="font-light">{renderTextWithLatex(point)}</span>
                    </li>
                ))}
            </ul>

            {item.why_it_matters && (
                <div className="mt-5 p-4 bg-gradient-to-r from-blue-900/30 to-transparent border-l-2 border-blue-500 rounded-r-xl relative z-10">
                    <p className="text-blue-300 text-xs uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Why it matters
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">
                        {renderTextWithLatex(item.why_it_matters)}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ConceptCard;
