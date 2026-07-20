import React, { useState } from 'react';

/**
 * EnglishRenderer - Storytelling Interface
 * Design Philosophy: Editorial, Spacious, Focused, "New York Times" Feature Style
 */
function EnglishRenderer({ content }) {
    if (!content) return null;

    // Data handling
    const data = content.module_1_chapter_intelligence || content;
    const storyMastery = data.storyline_mastery || {};
    const themeData = data.theme_breakdown || {};
    const authorData = data.author_exam_insight || {};
    const vocabData = data.vocabulary_upgrade_section || {};

    return (
        <div className="font-serif bg-[#0c0a09] text-stone-200 min-h-screen selection:bg-rose-500/30">

            {/* 1. Immersive Editorial Hero */}
            <header className="relative h-[85vh] flex flex-col justify-end p-8 md:p-24 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale-[30%]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/60 to-transparent"></div>

                <div className="relative z-10 max-w-5xl animate-fade-in-up">
                    <div className="flex items-center gap-6 mb-8">
                        <span className="text-rose-500 font-sans font-bold tracking-[0.2em] text-sm uppercase border-b border-rose-500 pb-1">
                            {data.chapter_meta?.genre || 'Classic Literature'}
                        </span>
                        <span className="text-stone-400 font-sans tracking-[0.2em] text-sm uppercase">
                            {data.chapter_meta?.author || 'Unknown Author'}
                        </span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 mb-8 leading-[0.9] tracking-tighter">
                        {data.chapter_meta?.chapter_name || 'Chapter Title'}
                    </h1>

                    <div className="max-w-2xl border-l-[3px] border-rose-600 pl-8 py-2">
                        <p className="text-2xl md:text-3xl text-stone-300 leading-relaxed font-light italic">
                            "{themeData.board_ready_theme_line || "The intersection of time and space as a refuge from modern reality."}"
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 space-y-32">

                {/* 2. The Narrative Arc (Clean Timeline) */}
                <section>
                    <div className="grid md:grid-cols-12 gap-16">
                        <div className="md:col-span-4 sticky top-32 self-start">
                            <h2 className="text-5xl font-bold text-white mb-6">The Narrative</h2>
                            <p className="text-stone-500 text-lg leading-relaxed font-sans">
                                A chronological breakdown of the events that blur the line between 1950s reality and 1894 fantasy.
                            </p>

                            {storyMastery.memory_triggers && (
                                <div className="mt-12 pt-8 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest font-sans mb-6">Memory Anchors</h4>
                                    <ul className="space-y-4">
                                        {storyMastery.memory_triggers.map((trigger, idx) => (
                                            <li key={idx} className="flex gap-4 items-center group cursor-default">
                                                <span className="w-2 h-2 rounded-full bg-stone-700 group-hover:bg-rose-500 transition-colors"></span>
                                                <span className="text-stone-400 group-hover:text-stone-200 transition-colors">{trigger}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-8 space-y-12 border-l border-white/10 pl-8 md:pl-16 relative">
                            {storyMastery.chapter_story_in_simple_bullets?.map((point, idx) => (
                                <div key={idx} className="relative group">
                                    <span className="absolute -left-[41px] md:-left-[73px] top-2 w-4 h-4 rounded-full bg-stone-800 border-2 border-stone-600 group-hover:border-rose-500 group-hover:bg-rose-500 transition-colors z-10"></span>
                                    <p className="text-xl md:text-2xl text-stone-300 leading-relaxed font-light group-hover:text-white transition-colors">
                                        {point}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Thematic Deep Dive (Magazine Layout) */}
                <section className="bg-stone-900/30 rounded-3xl p-8 md:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.1),transparent_50%)]"></div>

                    <div className="grid md:grid-cols-2 gap-20 relative z-10">
                        <div>
                            <span className="text-rose-500 font-sans font-bold tracking-widest text-xs uppercase mb-4 block">Core Theme</span>
                            <h3 className="text-4xl font-bold text-white mb-8">Escapism as Refuge</h3>
                            <p className="text-xl text-stone-300 leading-relaxed mb-8">
                                {themeData.core_theme_explained_simply}
                            </p>
                            <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
                                <p className="text-stone-400 italic font-medium">"{themeData.deeper_message}"</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <span className="text-indigo-400 font-sans font-bold tracking-widest text-xs uppercase mb-4 block">Author's Craft</span>
                                <h3 className="text-3xl font-bold text-white mb-4">Logical Fantasy</h3>
                                <p className="text-lg text-stone-400 leading-relaxed">
                                    {authorData.writing_style}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {authorData.possible_author_based_questions?.map((q, idx) => (
                                    <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
                                        <p className="text-sm text-indigo-200/80">{q}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Vocabulary Mastery (Card Grid) */}
                {vocabData.word_comparisons && (
                    <section>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-5xl font-bold text-white mb-6">Language Upgrade</h2>
                            <p className="text-stone-500 text-lg font-sans">
                                Transform your answers from 'Basic' to 'Board-Topper' level by upgrading your vocabulary.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {vocabData.word_comparisons.map((item, idx) => (
                                <div key={idx} className="group bg-stone-900 border border-stone-800 p-8 rounded-2xl hover:bg-stone-800 transition-all hover:-translate-y-1 duration-300">
                                    <div className="text-center space-y-4">
                                        <span className="text-stone-500 text-sm line-through decoration-rose-500/50 decoration-2">{item.basic}</span>
                                        <div className="text-2xl md:text-3xl font-bold text-white">{item.improved}</div>
                                        <div className="h-px w-8 bg-stone-700 mx-auto group-hover:w-16 group-hover:bg-rose-500 transition-all duration-500"></div>
                                        <p className="text-xs text-stone-400 font-sans tracking-wide pt-2 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                            Usage Context
                                        </p>
                                        <p className="text-sm text-stone-300 italic">"{item.board_level_phrase}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Exam Intelligence (Clean Accordion) */}
                <section className="bg-[#1c1917] rounded-3xl overflow-hidden">
                    <div className="p-8 md:p-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                            <div>
                                <h2 className="text-5xl font-bold text-white mb-4">Board Questions</h2>
                                <p className="text-stone-400 text-lg font-sans max-w-xl">
                                    High-probability questions curated from previous years, complete with answer blueprints.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-4 bg-stone-800 rounded-xl border border-stone-700">
                                    <span className="block text-2xl font-bold text-white mb-1">5 Marks</span>
                                    <span className="text-xs text-stone-500 uppercase tracking-wider">Long Answer</span>
                                </div>
                                <div className="px-6 py-4 bg-stone-800 rounded-xl border border-stone-700">
                                    <span className="block text-2xl font-bold text-white mb-1">2 Marks</span>
                                    <span className="text-xs text-stone-500 uppercase tracking-wider">Short Answer</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data.most_probable_questions?.map((q, idx) => (
                                <ModernQuestionCard key={idx} data={q} index={idx + 1} />
                            ))}
                        </div>
                    </div>

                    {/* Common Mistakes Footer of Section */}
                    <div className="bg-red-950/20 border-t border-red-500/10 p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <h3 className="text-xl font-bold text-red-400 whitespace-nowrap pt-2">
                                ⚠️ Examiner Flags
                            </h3>
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 w-full">
                                {(data.common_mark_losing_mistakes || content.common_mark_losing_mistakes)?.map((mistake, idx) => (
                                    <li key={idx} className="text-stone-400 text-sm list-none flex gap-3">
                                        <span className="text-red-500/50">•</span>
                                        {mistake}
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-24"></div> {/* Bottom Spacer */}
            </main>
        </div>
    );
}

function ModernQuestionCard({ data, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`group border rounded-2xl transition-all duration-300 ${isOpen ? 'bg-stone-800 border-stone-600' : 'bg-transparent border-stone-800 hover:border-stone-600'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-8 md:p-10 flex items-start gap-8"
            >
                <span className={`text-xl font-bold font-sans mt-1 ${isOpen ? 'text-rose-500' : 'text-stone-600 group-hover:text-stone-500'}`}>
                    {index.toString().padStart(2, '0')}
                </span>
                <div className="flex-1">
                    <h3 className={`text-2xl md:text-3xl font-medium leading-tight transition-colors ${isOpen ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>
                        {data.question}
                    </h3>
                </div>
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isOpen ? 'border-rose-500 text-rose-500 rotate-45' : 'border-stone-700 text-stone-500 group-hover:border-stone-500'}`}>
                    <span className="text-2xl">+</span>
                </div>
            </button>

            {isOpen && (
                <div className="px-8 md:px-24 pb-12 animate-fade-in">
                    <div className="h-px w-full bg-white/10 mb-10"></div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Blueprint Column */}
                        <div className="col-span-1 space-y-8">
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest font-sans">Answer Blueprint</span>
                            {data.answer_structure_blueprint && Object.entries(data.answer_structure_blueprint).map(([key, value], idx) => (
                                <div key={idx}>
                                    <span className="text-[10px] text-stone-500 uppercase font-bold mb-2 block">{key.replace(/_/g, ' ')}</span>
                                    <p className="text-stone-300 text-sm leading-relaxed">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Model Answer Column */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#0c0a09] p-8 md:p-10 rounded-2xl border border-white/5 relative">
                                <span className="absolute -top-3 left-8 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Model Answer
                                </span>
                                <p className="text-lg text-stone-300 leading-relaxed font-serif whitespace-pre-line">
                                    {data.full_model_answer_120_to_150_words}
                                </p>

                                {data.examiner_keywords_highlight && (
                                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                                        {data.examiner_keywords_highlight.map((kw, i) => (
                                            <span key={i} className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnglishRenderer;
