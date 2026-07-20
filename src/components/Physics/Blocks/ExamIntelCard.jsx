import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderTextWithLatex } from '../../../utils/latexRenderer';

function ExamIntelCard({ item }) {
    const [activeTab, setActiveTab] = useState('questions');

    const getFrequencyColor = (freq) => {
        if (freq.toLowerCase().includes('always') || freq.toLowerCase().includes('high')) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (freq.toLowerCase().includes('frequent')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    };

    return (
        <div className="bg-gradient-to-br from-stone-900 to-black border border-stone-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/20">
                        <span className="text-xl">🎯</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Exam Intelligence</h3>
                        <p className="text-white/50 text-xs">For: {item.concept_ref}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getFrequencyColor(item.frequency)}`}>
                        {item.frequency}
                    </span>
                </div>
            </div>

            {/* Marks Breakdown Pills */}
            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                {item.marks_breakdown?.map((mark, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.8)]"></div>
                        {mark}
                    </span>
                ))}
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex gap-2 mb-4 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar relative z-10">
                {['questions', 'traps', 'strategy'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'bg-white/10 text-white' 
                                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                    >
                        {tab === 'questions' && 'Question Forms'}
                        {tab === 'traps' && 'Traps & Mistakes'}
                        {tab === 'strategy' && 'Winning Answer'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="relative z-10 min-h-[120px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'questions' && (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                        >
                            {item.question_forms?.map((q, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3">
                                    <span className="text-white/30 font-serif">Q.</span>
                                    <p className="text-white/80 text-sm">{renderTextWithLatex(q)}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'traps' && (
                        <motion.div
                            key="traps"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {item.board_traps && item.board_traps.length > 0 && (
                                <div>
                                    <h4 className="text-red-400 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Examiner Traps
                                    </h4>
                                    <ul className="space-y-2">
                                        {item.board_traps.map((trap, i) => (
                                            <li key={i} className="text-white/70 text-sm bg-red-500/10 border-l-2 border-red-500 p-2 rounded-r-lg">
                                                {renderTextWithLatex(trap)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {item.common_mistakes && item.common_mistakes.length > 0 && (
                                <div>
                                    <h4 className="text-amber-400 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Common Mistakes
                                    </h4>
                                    <ul className="space-y-2">
                                        {item.common_mistakes.map((mistake, i) => (
                                            <li key={i} className="text-white/70 text-sm bg-amber-500/10 border-l-2 border-amber-500 p-2 rounded-r-lg">
                                                {renderTextWithLatex(mistake)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'strategy' && (
                        <motion.div
                            key="strategy"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {item.answer_structure && (
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                                    <h4 className="text-emerald-400 text-xs uppercase tracking-wider font-bold mb-2">Structure your answer:</h4>
                                    <p className="text-white/80 text-sm leading-relaxed">{renderTextWithLatex(item.answer_structure)}</p>
                                </div>
                            )}
                            {item.examiner_expectation && (
                                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                                    <h4 className="text-blue-400 text-xs uppercase tracking-wider font-bold mb-2">Examiner wants to see:</h4>
                                    <p className="text-white/80 text-sm leading-relaxed">{renderTextWithLatex(item.examiner_expectation)}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ExamIntelCard;
