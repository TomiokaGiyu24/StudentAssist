import React from 'react';
import { renderTextWithLatex } from '../../../utils/latexRenderer';

function DiagramCard({ item }) {
    return (
        <div className="bg-stone-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <h4 className="text-white font-semibold">{item.title}</h4>
                </div>
                {item.source === 'NCERT' && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider rounded border border-white/5">
                        {item.ncert_reference || 'NCERT Diagram'}
                    </span>
                )}
            </div>

            {/* Diagram Content (Placeholder or Image) */}
            <div className="p-6 bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border-b border-white/5 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
                
                <div className="relative z-10 text-center py-8">
                    <div className="w-16 h-16 border-2 border-dashed border-indigo-500/50 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-indigo-500/5 text-indigo-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-indigo-300/80 text-sm font-bold tracking-widest uppercase mb-2">Interactive Visual</p>
                    {item.description?.what_is_shown && (
                        <p className="text-white/50 text-xs max-w-sm mx-auto leading-relaxed">
                            {renderTextWithLatex(item.description.what_is_shown)}
                        </p>
                    )}
                </div>
            </div>

            {/* Caption */}
            {item.caption && (
                <div className="px-6 py-4 bg-black/40">
                    <p className="text-white/60 text-sm italic text-center font-light">
                        {renderTextWithLatex(item.caption)}
                    </p>
                </div>
            )}
        </div>
    );
}

export default DiagramCard;
