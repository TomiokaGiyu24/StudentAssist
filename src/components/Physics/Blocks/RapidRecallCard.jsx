import React from 'react';
import { renderTextWithLatex } from '../../../utils/latexRenderer';

function RapidRecallCard({ item }) {
    return (
        <div className="bg-gradient-to-r from-purple-900/40 to-fuchsia-900/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs font-bold rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Rapid Recall
                    </span>
                    <span className="text-white/40 text-xs">For: {item.concept_ref}</span>
                </div>

                <div className="mb-5">
                    <p className="text-white text-lg font-medium leading-relaxed">
                        {renderTextWithLatex(item.one_liner)}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {item.memory_hook && (
                        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                            <h4 className="text-purple-300 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                                <span className="text-sm">🧠</span> Memory Hook
                            </h4>
                            <p className="text-white/70 text-sm italic">
                                "{renderTextWithLatex(item.memory_hook)}"
                            </p>
                        </div>
                    )}

                    {item.never_forget && item.never_forget.length > 0 && (
                        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                            <h4 className="text-purple-300 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                                <span className="text-sm">🔥</span> Never Forget
                            </h4>
                            <ul className="space-y-1.5">
                                {item.never_forget.map((point, i) => (
                                    <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                                        <span className="text-purple-400 mt-0.5">•</span>
                                        <span>{renderTextWithLatex(point)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RapidRecallCard;
