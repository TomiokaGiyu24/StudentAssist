import React from 'react';
import { renderTextWithLatex } from '../../../utils/latexRenderer';
import { BlockMath } from 'react-katex';

function WorkedExampleCard({ item }) {
    return (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl relative mt-4">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">Worked Example</h3>
                        <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-wider">{item.purpose}</p>
                    </div>
                </div>

                {/* Situation */}
                <div className="mb-6">
                    <p className="text-white/90 font-medium text-lg md:text-xl leading-relaxed">
                        {renderTextWithLatex(item.situation)}
                    </p>
                </div>

                {/* Given Data */}
                {item.given && item.given.length > 0 && (
                    <div className="mb-6">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold">Given Parameters</div>
                        <div className="flex flex-wrap gap-2">
                            {item.given.map((g, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-emerald-100 flex items-center shadow-inner">
                                    {renderTextWithLatex(g)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Steps Timeline */}
                <div className="mb-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-4 font-semibold ml-2 md:text-center md:mb-6">Solution Steps</div>
                    <div className="space-y-6">
                        {item.steps?.map((step, idx) => (
                            <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-stone-900 text-white/50 group-hover:text-emerald-400 group-hover:border-emerald-500/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                    <span className="text-sm font-bold">{step.step_number}</span>
                                </div>
                                {/* Content */}
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                    <p className="text-white/80 text-sm mb-3 font-medium">{renderTextWithLatex(step.action)}</p>
                                    
                                    {step.latex && (
                                        <div className="bg-black/30 rounded-xl py-3 px-4 mb-3 overflow-x-auto dark-katex text-center border border-black/50 shadow-inner">
                                            <BlockMath math={step.latex} />
                                        </div>
                                    )}
                                    
                                    {step.why && (
                                        <div className="flex gap-2 items-start mt-2 border-t border-white/5 pt-3">
                                            <svg className="w-4 h-4 text-emerald-500/70 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-white/50 text-xs leading-relaxed">{renderTextWithLatex(step.why)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Answer */}
                {item.final_answer && (
                    <div className="mb-6 p-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20">
                        <div className="bg-stone-950/80 backdrop-blur-sm rounded-[15px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <span className="text-xs text-emerald-400/80 uppercase tracking-wider font-bold block mb-1">Final Answer</span>
                                <div className="text-white font-medium">
                                    {item.final_answer.unit ? `Result in ${item.final_answer.unit}` : 'Result'}
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20 dark-katex w-full sm:w-auto text-center">
                                <BlockMath math={item.final_answer.latex} />
                                {item.final_answer.direction && (
                                    <div className="text-emerald-300 text-sm mt-2">{renderTextWithLatex(item.final_answer.direction)}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Trap / Warning */}
                {item.trap && (
                    <div className="bg-red-500/10 border-l-2 border-red-500 p-4 rounded-r-xl flex gap-3">
                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <span className="text-red-400 text-sm font-bold block mb-1">Common Trap</span>
                            <p className="text-white/70 text-sm leading-relaxed">{renderTextWithLatex(item.trap)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkedExampleCard;
