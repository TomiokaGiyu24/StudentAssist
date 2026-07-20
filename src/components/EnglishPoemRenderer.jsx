import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnglishPoemRenderer = ({ content }) => {
    // Data extraction with fallbacks
    const meta = content.chapter_meta || {};
    const stanzas = content.para_to_para_meaning_simple || [];
    const theme = content.central_theme_explained || {};
    const devices = content.poetic_devices_with_easy_explanation || [];
    const poetInsight = content.poet_exam_insight || {};
    const questions = content.most_probable_questions || [];

    return (
        <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-rose-900/30 selection:text-rose-200">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-rose-950/20 to-transparent opacity-60" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-32">

                {/* Hero Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="inline-block"
                    >
                        <span className="px-4 py-1 rounded-full border border-stone-800 bg-stone-900/50 text-xs tracking-widest uppercase text-stone-500 backdrop-blur-md">
                            {meta.genre || 'Poetry'}
                        </span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 to-stone-600 tracking-tight leading-none">
                        {meta.chapter_name}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-stone-400 font-serif italic text-lg md:text-xl">
                        <span className="w-12 h-[1px] bg-stone-800"></span>
                        <p>by {meta.poet}</p>
                        <span className="w-12 h-[1px] bg-stone-800"></span>
                    </div>

                    <p className="max-w-xl mx-auto text-stone-500 text-sm md:text-base leading-relaxed pt-8">
                        {meta.tone && <span className="block mb-2 text-rose-400/80 uppercase tracking-widest text-xs">Tone: {meta.tone}</span>}
                        {meta.structure && <span className="block text-stone-600">Structure: {meta.structure}</span>}
                    </p>
                </motion.header>


                {/* Stanza Breakdown (Kinetic Layout) */}
                <section className="space-y-24">
                    {stanzas.map((item, index) => {
                        // Handle if item is string (old format) or object (new format if any)
                        // The user provided array of strings/paragraphs in `para_to_para_meaning_simple`.
                        // Actually the JSON shows `para_to_para_meaning_simple` is an array of strings in some files?
                        // Let's check `roadsidestand.json` created in step 557.
                        // "para_to_para_meaning_simple": [ "The Setup ...", "The Traffic...", ... ]
                        // It seems to be an array of strings describing the meaning.
                        // Unlike the Prose renderer which has `chapter_story_in_simple_bullets` (array of strings).

                        // Wait, for poems, usually we want the Poem Text vs Meaning. 
                        // The JSON provided ONLY has the meaning/summary of stanzas, NOT the original poem text.
                        // "para_to_para_meaning_simple": [ "The Setup (Lines 1-6): A little old house...", ... ]

                        // So I can only display the Analysis/Meaning. 
                        // I will design it as "Stanza/Section Analysis".

                        const [title, content] = item.includes(':') ? item.split(/:(.+)/) : [`Stanza ${index + 1}`, item];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="grid md:grid-cols-12 gap-8 md:gap-16 items-start"
                            >
                                <div className="md:col-span-4 sticky top-32">
                                    <h3 className="text-2xl font-serif text-white/90 mb-2">{title.trim()}</h3>
                                    <div className="h-1 w-12 bg-rose-900/50 rounded-full"></div>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="text-lg md:text-xl text-stone-400 leading-relaxed font-light">
                                        {content ? content.trim() : item.trim()}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </section>


                {/* Central Theme (Full width glass) */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-stone-900/40 border border-white/5 p-8 md:p-16 text-center space-y-8 backdrop-blur-sm group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <h2 className="text-sm font-bold tracking-[0.2em] text-stone-500 uppercase">Core Theme</h2>
                        <p className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-200 leading-tight">
                            "{theme.board_ready_theme_line}"
                        </p>
                        <div className="max-w-2xl mx-auto text-stone-400 text-lg leading-relaxed">
                            <p>{theme.deeper_interpretation}</p>
                        </div>
                    </motion.div>
                </section>


                {/* Poetic Devices (Grid) */}
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b border-white/10 pb-6">
                        <h2 className="text-4xl font-serif text-white">Poetic Devices</h2>
                        <span className="text-stone-500 text-sm hidden md:inline-block">Stylistic elements & figures of speech</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-medium text-rose-200/90">{device.device}</h3>
                                    <div className="w-2 h-2 rounded-full bg-rose-500/30"></div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-stone-500">Definition</p>
                                    <p className="text-sm text-stone-400">{device.definition_in_simple_words}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-stone-500">Example</p>
                                    <p className="text-stone-300 font-serif italic border-l-2 border-stone-700 pl-3">
                                        "{device.example_from_poem}"
                                    </p>
                                </div>

                                <div className="pt-2 text-xs text-stone-500 border-t border-white/5 tracking-wide leading-relaxed">
                                    {device.why_it_is_used_here}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Question Bank (Simple Accordion) */}
                <section className="space-y-12">
                    <h2 className="text-4xl font-serif text-white pb-6 border-b border-white/10">Important Questions</h2>
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <QuestionCard key={idx} data={q} index={idx} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

// Sub-component for Questions
const QuestionCard = ({ data, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-lg bg-stone-900/20 overflow-hidden transition-colors hover:border-white/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-start gap-4 p-6 text-left"
            >
                <span className="text-stone-600 font-mono text-sm pt-1">0{index + 1}</span>
                <div className="flex-1">
                    <h3 className="text-lg text-stone-200 font-medium leading-relaxed mb-2">
                        {data.question}
                    </h3>
                    <div className="flex gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${data.question_type === 'long'
                                ? 'bg-amber-900/20 border-amber-800/30 text-amber-500'
                                : 'bg-stone-800/50 border-stone-700 text-stone-400'
                            }`}>
                            {data.question_type === 'long' ? 'Long Answer' : 'Short Answer'}
                        </span>
                    </div>
                </div>
                <div className={`text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ↓
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 pl-14 space-y-6">
                            {/* Blueprint */}
                            {data.answer_structure_blueprint && (
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Structure Blueprint</div>
                                    <div className="grid gap-2 border-l-2 border-stone-800 pl-4 py-1">
                                        {Object.entries(data.answer_structure_blueprint).map(([key, value]) => (
                                            <div key={key} className="text-sm text-stone-400">
                                                <span className="text-stone-500 capitalize mr-2">{key.replace('_', ' ')}:</span>
                                                {value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Model Answer */}
                            {data.full_model_answer_120_to_150_words && (
                                <div className="bg-stone-900/50 rounded-xl p-5 border border-white/5 hover:border-emerald-900/30 transition-colors">
                                    <div className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest mb-3">Model Answer</div>
                                    <p className="text-stone-300 leading-relaxed font-serif">
                                        {data.full_model_answer_120_to_150_words}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnglishPoemRenderer;
