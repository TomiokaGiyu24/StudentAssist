import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Target, AlertTriangle, BookOpen, Brain, ListCheck } from 'lucide-react';
import instructionsData from '../data/Boards/English/UnseenPassages/unseenpassageinstructions.json';

const UnseenPassageInstructions = () => {
    const navigate = useNavigate();
    // Default subjectId to english if missing (dashboard route doesn't pass it)
    const { subjectId: paramSubjectId } = useParams();
    const subjectId = paramSubjectId || 'english';

    // Safety check for data
    if (!instructionsData) {
        return <div className="min-h-screen bg-[#0c0a09] grid place-items-center text-white">Loading Instructions...</div>;
    }

    const {
        board_pattern_intelligence = {},
        "15_minute_execution_algorithm": algorithm = [],
        question_type_attack_models = [],
        word_limit_discipline_system = {},
        panic_control_protocol = [],
        common_mark_losing_behaviours = []
    } = instructionsData;

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-cyan-500/30">
            {/* Hero Section */}
            <header className="relative py-20 px-6 md:px-12 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0c0a09] to-[#0c0a09]"></div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <BookOpen size={20} />
                        </span>
                        <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase">Reading Comprehension Module</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif"
                    >
                        The Art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Decoding</span> Text
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-stone-400 text-lg md:text-xl max-w-2xl leading-relaxed"
                    >
                        Master the 22-mark section with a military-grade execution strategy.
                        Stop reading blindly; start hunting for answers.
                    </motion.p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24">

                {/* 1. The Strategy (Timeline) */}
                <section>
                    <div className="flex items-center gap-4 mb-12">
                        <Clock className="text-cyan-400" size={32} />
                        <h2 className="text-3xl font-bold text-white">15-Minute Execution Algorithm</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {algorithm.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-stone-900/50 border border-white/5 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-white group-hover:opacity-20 transition-opacity">
                                    {idx + 1}
                                </div>
                                <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-wider text-sm">
                                    {step.split('):')[0] + ')'}
                                </h3>
                                <p className="text-stone-300 leading-relaxed text-sm">
                                    {step.split('):')[1]}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. Attack Models (Grid) */}
                <section>
                    <div className="flex items-center gap-4 mb-12">
                        <Target className="text-rose-400" size={32} />
                        <h2 className="text-3xl font-bold text-white">Question Attack Models</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {question_type_attack_models.map((model, idx) => (
                            <div key={idx} className="bg-[#1c1917] rounded-2xl overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-white">{model.question_type.replace(/_/g, ' ')}</h3>
                                    {model.recognition_signal && (
                                        <span className="text-xs text-stone-400 italic">Signal: "{model.recognition_signal.split(' ')[0]}..."</span>
                                    )}
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-green-500/50 rounded-full"></div>
                                        <div>
                                            <span className="text-xs font-bold text-green-500 uppercase">Strategy</span>
                                            <p className="text-stone-300 text-sm mt-1">{model.answer_construction_rule || model.context_scanning_rule}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-red-500/50 rounded-full"></div>
                                        <div>
                                            <span className="text-xs font-bold text-red-500 uppercase">Common Trap</span>
                                            <p className="text-stone-400 text-sm mt-1">{model.common_trap || "Avoid vague answers."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Discipline System (Cards) */}
                <section className="bg-stone-900 rounded-3xl p-8 md:p-12 border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <Brain className="text-purple-400" size={32} />
                        <h2 className="text-3xl font-bold text-white">Word Limit Discipline</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-black/40 border border-white/5">
                                <span className="block text-purple-400 font-bold text-sm mb-2">1 Mark Answer</span>
                                <p className="text-2xl text-white font-serif">10-15 Words</p>
                                <p className="text-stone-500 text-sm mt-2">{word_limit_discipline_system["1_mark_answer_range"]}</p>
                            </div>
                            <div className="p-6 rounded-xl bg-black/40 border border-white/5">
                                <span className="block text-purple-400 font-bold text-sm mb-2">2 Mark Answer</span>
                                <p className="text-2xl text-white font-serif">30-40 Words</p>
                                <p className="text-stone-500 text-sm mt-2">{word_limit_discipline_system["2_mark_answer_range"]}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            <div className="border-l-2 border-purple-500/30 pl-6">
                                <h4 className="text-white font-bold mb-2">Why Concise?</h4>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    "{word_limit_discipline_system.why_excess_writing_loses_marks}"
                                </p>
                            </div>
                            <div className="border-l-2 border-green-500/30 pl-6">
                                <h4 className="text-white font-bold mb-2">Model Answer</h4>
                                <p className="text-stone-300 italic font-serif">
                                    "{word_limit_discipline_system.tight_answer_example_model}"
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Panic Protocol & Mistakes (Split) */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-orange-900/20 to-[#0c0a09] p-8 rounded-3xl border border-orange-500/10">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="text-orange-500" />
                            <h3 className="text-xl font-bold text-white">Panic Control Protocol</h3>
                        </div>
                        <ul className="space-y-4">
                            {panic_control_protocol.map((protocol, idx) => (
                                <li key={idx} className="flex gap-4 items-start">
                                    <span className="text-orange-500 font-bold font-mono">0{idx + 1}</span>
                                    <p className="text-stone-300 text-sm">{protocol}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-red-900/20 to-[#0c0a09] p-8 rounded-3xl border border-red-500/10">
                        <div className="flex items-center gap-3 mb-6">
                            <ListCheck className="text-red-500" />
                            <h3 className="text-xl font-bold text-white">Mark Losing Behaviours</h3>
                        </div>
                        <ul className="space-y-3">
                            {common_mark_losing_behaviours.map((behavior, idx) => (
                                <li key={idx} className="flex gap-3 items-center text-stone-400 text-sm">
                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                                    {behavior}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* CTA */}
                <div className="flex justify-center pb-12">
                    <button
                        onClick={() => navigate(`/subjects/${subjectId}/unseen/passage/1`)}
                        className="group flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)]"
                    >
                        Start Practicing
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </main>
        </div>
    );
};

export default UnseenPassageInstructions;
