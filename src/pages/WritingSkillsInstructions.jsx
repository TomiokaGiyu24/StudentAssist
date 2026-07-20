import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, PenTool, ClipboardCheck, GraduationCap } from 'lucide-react';
import instructionsData from '../data/Boards/English/WritingSkills/WritingSkillsInstructions.json';

const WritingSkillsInstructions = () => {
    const navigate = useNavigate();

    const {
        board_pattern_intelligence = {},
        perfect_format_blueprint = {},
        step_by_step_writing_algorithm = [],
        vocabulary_upgrade_system = {},
        common_mark_losing_mistakes = []
    } = instructionsData;

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="relative py-20 px-6 md:px-12 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0c0a09] to-[#0c0a09]"></div>
                <div className="relative z-10 max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
                        Mastering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Creative Writing</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 space-y-24">

                {/* 1. Board Intelligence */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <GraduationCap className="text-purple-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Board Pattern Intelligence</h2>
                    </div>
                    <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-8">
                        <p className="text-lg text-purple-200 mb-6 font-medium">{board_pattern_intelligence.latest_weightage_trend}</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {Object.entries(board_pattern_intelligence.marks_distribution || {}).map(([key, value]) => (
                                <div key={key} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <span className="block text-3xl font-bold text-white mb-1">{value}</span>
                                    <span className="text-xs text-stone-500 uppercase tracking-widest font-bold">{key.replace('_marks', '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. Writing Algorithm */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <PenTool className="text-pink-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Writing Algorithm</h2>
                    </div>
                    <div className="space-y-4">
                        {step_by_step_writing_algorithm.map((step, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center text-stone-500 font-bold group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    {idx + 1}
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-white font-bold text-lg mb-1">{step.split(':')[0]}</h3>
                                    <p className="text-stone-400">{step.split(':')[1]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Vocabulary Upgrade */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Book className="text-emerald-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Vocabulary Upgrade</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {vocabulary_upgrade_system.basic_to_board_level_word_map?.map((item, idx) => (
                            <div key={idx} className="bg-stone-900 p-6 rounded-xl border border-white/5 relative overflow-hidden">
                                <span className="text-xs text-red-400 line-through block mb-2">{item.basic}</span>
                                <span className="text-lg text-white font-bold block mb-1">{item.improved}</span>
                                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-bl-lg">
                                    Board Level
                                </div>
                                <span className="text-sm text-emerald-400 block mt-2">{item.board_level}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Common Mistakes */}
                <section className="bg-red-900/10 border border-red-500/20 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <ClipboardCheck className="text-red-400" size={28} />
                        <h2 className="text-2xl font-bold text-white">Mark Losing Mistakes</h2>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-4">
                        {common_mark_losing_mistakes.map((mistake, idx) => (
                            <li key={idx} className="flex gap-3 text-stone-300">
                                <span className="text-red-500 mt-1">•</span>
                                {mistake}
                            </li>
                        ))}
                    </ul>
                </section>

            </main>
        </div>
    );
};

export default WritingSkillsInstructions;
