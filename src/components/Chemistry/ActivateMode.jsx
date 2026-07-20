import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import ChemistryCard from './ChemistryCard';
import ChemistryBadge from './ChemistryBadge';
import ChemistryTabSystem from './ChemistryTabSystem';
import { FormatText } from './FormatText';

const FlashcardCarousel = ({ items, renderContent }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center text-stone-500 py-16 border border-white/5 rounded-3xl bg-white/5 shadow-inner">
                <div className="text-4xl mb-3 opacity-30">⚗️</div>
                No data available for this section yet.
            </div>
        );
    }

    const currentItem = items[currentIndex];

    // Variants for framer-motion slider
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.98,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.98,
        }),
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">

            {/* Carousel Header / Progress */}
            <div className="w-full flex justify-between items-center mb-6 px-4">
                <div className="text-sm font-medium text-stone-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                    Card <span className="text-white">{currentIndex + 1}</span> of {items.length}
                </div>
                <div className="flex gap-2">
                    {items.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-teal-400' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Slider Track */}
            <div className="relative w-full overflow-hidden rounded-3xl pb-10">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        {renderContent(currentItem)}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-4 items-center mt-2">
                <button
                    onClick={handlePrev}
                    className="flex justify-center items-center w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all text-white/70 hover:text-white shadow-lg"
                    aria-label="Previous Card"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={handleNext}
                    className="flex justify-center items-center w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 hover:border-teal-500/50 hover:scale-105 active:scale-95 transition-all text-teal-300 hover:text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                    aria-label="Next Card"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Extracted Flashcard Template for consistent styling within the carousel
const FlashcardSlide = ({ title, badge, trap, children }) => {
    return (
        <ChemistryCard className="relative overflow-hidden group shadow-2xl border-white/10 bg-[#121212]" hoverEffect={false}>
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-50" />

            <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-6 gap-4">
                <h4 className="text-xl font-bold text-white/95 leading-tight tracking-tight">
                    <FormatText>{title}</FormatText>
                </h4>
                {badge && <div className="shrink-0">{badge}</div>}
            </div>

            <div className="text-stone-300 text-[15px] leading-relaxed">
                {children}
            </div>

            {trap && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                        <div className="bg-amber-500/20 p-2 rounded-xl text-amber-500 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <span className="block text-amber-500/90 font-bold uppercase text-[10px] tracking-wider mb-1">Trap Warning</span>
                            <span className="text-stone-300 text-sm font-medium"><FormatText>{trap}</FormatText></span>
                        </div>
                    </div>
                </div>
            )}
        </ChemistryCard>
    );
};

const ActivateMode = ({ chapterData }) => {
    const tabs = [
        { id: 'formulas', label: 'Formula Triggers' },
        { id: 'numericals', label: 'Numerical Patterns' },
        { id: 'mechanisms', label: 'Mechanism Trainer' },
        { id: 'comparisons', label: 'Comparison Arena' },
        { id: 'exceptions', label: 'Exception Bank' }
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const renderContent = () => {
        switch (activeTab) {
            case 'formulas':
                return (
                    <FlashcardCarousel
                        items={chapterData.formula_trigger_engine}
                        renderContent={(item) => (
                            <FlashcardSlide
                                title={item.trigger_situation}
                                trap={item.unit_or_sign_trap}
                            >
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <div className="text-xs uppercase tracking-widest font-bold text-teal-500/50 mb-3">Target Formula</div>
                                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-center w-full shadow-inner">
                                            <BlockMath math={item.correct_formula_latex} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Think
                                            </div>
                                            <div className="text-white/90 font-medium leading-snug"><FormatText>{item.student_should_think}</FormatText></div>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <div className="text-stone-500 font-bold text-xs uppercase tracking-wider mb-2">Why This Works</div>
                                            <div className="text-stone-400 text-sm"><FormatText>{item.why_this_formula}</FormatText></div>
                                        </div>
                                    </div>
                                    {item.common_wrong_formula && (
                                        <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10 flex items-start gap-4">
                                            <div className="text-rose-500 shrink-0 bg-rose-500/10 p-2 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <div className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">Common Mistake</div>
                                                <div className="text-stone-300 text-sm"><FormatText>{item.common_wrong_formula}</FormatText></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FlashcardSlide>
                        )}
                    />
                );
            case 'numericals':
                return (
                    <FlashcardCarousel
                        items={chapterData.numerical_pattern_lab}
                        renderContent={(item) => (
                            <FlashcardSlide
                                title={item.problem_archetype}
                                badge={<ChemistryBadge variant="warning">{item.time_target_seconds}s Target</ChemistryBadge>}
                                trap={item.hidden_exam_trap}
                            >
                                <div className="space-y-6">
                                    <div className="flex gap-3 items-center p-4 bg-teal-500/5 rounded-2xl text-teal-300 border border-teal-500/10">
                                        <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
                                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-500/60 mb-0.5">Recognition Signal</span>
                                            <span className="text-[15px] font-semibold text-teal-100"><FormatText>{item.recognition_signal}</FormatText></span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                        <div className="bg-black/20 px-5 py-3 border-b border-white/5">
                                            <h5 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Execution Step Sequence</h5>
                                        </div>
                                        <ul className="p-3 space-y-2">
                                            {item.step_sequence?.map((step, i) => (
                                                <li key={i} className="flex gap-4 items-start bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4 rounded-xl">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs shrink-0 mt-0.5">{i + 1}</span>
                                                    <span className="text-[15px] text-stone-300 leading-relaxed"><FormatText>{step}</FormatText></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </FlashcardSlide>
                        )}
                    />
                );
            case 'mechanisms':
                return (
                    <FlashcardCarousel
                        items={chapterData.mechanism_classification_trainer}
                        renderContent={(item) => (
                            <FlashcardSlide
                                title={item.reaction_scenario}
                                trap={item.common_confusion}
                            >
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Student Must Identify</div>
                                        <div className="text-white/90 text-lg font-medium leading-snug"><FormatText>{item.student_must_identify}</FormatText></div>
                                    </div>

                                    <div className="flex justify-center my-2">
                                        <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    </div>

                                    <div className="p-6 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" />
                                        <div className="relative">
                                            <div className="text-[10px] font-bold text-teal-500/60 uppercase tracking-widest mb-2">Correct Classification</div>
                                            <div className="text-teal-400 font-extrabold text-2xl tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]"><FormatText>{item.correct_classification}</FormatText></div>
                                            <div className="inline-block bg-black/40 px-4 py-3 rounded-xl border border-teal-500/10 text-sm text-teal-100/80 max-w-lg mx-auto leading-relaxed">
                                                <FormatText>{item.decision_logic}</FormatText>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FlashcardSlide>
                        )}
                    />
                );
            case 'comparisons':
                return (
                    <FlashcardCarousel
                        items={chapterData.inorganic_comparison_arena}
                        renderContent={(item) => (
                            <FlashcardSlide
                                title="Comparison Arena"
                                trap={item.examiner_trap}
                            >
                                <div className="space-y-6">
                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                        <div className="py-6 px-4 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl border border-white/10 text-center shadow-lg">
                                            <div className="text-xl font-bold text-white/90"><FormatText>{item.entities_compared[0]}</FormatText></div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 font-bold italic shrink-0 border border-rose-500/30">VS</div>
                                        <div className="py-6 px-4 bg-gradient-to-bl from-stone-800 to-stone-900 rounded-2xl border border-white/10 text-center shadow-lg">
                                            <div className="text-xl font-bold text-white/90"><FormatText>{item.entities_compared[1]}</FormatText></div>
                                        </div>
                                    </div>

                                    <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                                        <div className="bg-white/5 px-5 py-3 border-b border-white/5">
                                            <h5 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Rapid Fire Questions</h5>
                                        </div>
                                        <ul className="p-4 space-y-3">
                                            {item.rapid_fire_questions?.map((q, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-stone-300 items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mt-1.5 shrink-0" />
                                                    <span className="leading-relaxed"><FormatText>{q}</FormatText></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-5 bg-teal-500/5 border border-teal-500/20 rounded-2xl flex gap-4 items-start">
                                        <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400 shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-teal-500/60 uppercase tracking-widest mb-1">Correct Insight</span>
                                            <span className="text-teal-100 text-[15px] leading-relaxed"><FormatText>{item.correct_insight}</FormatText></span>
                                        </div>
                                    </div>
                                </div>
                            </FlashcardSlide>
                        )}
                    />
                );
            case 'exceptions':
                return (
                    <FlashcardCarousel
                        items={chapterData.exception_bank}
                        renderContent={(item) => (
                            <FlashcardSlide
                                title="Notable Exception"
                                badge={<ChemistryBadge variant="danger">Exam Favorite</ChemistryBadge>}
                            >
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-stone-500" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">General Trend</span>
                                        </div>
                                        <div className="text-stone-300 text-[15px] pl-4 border-l-2 border-white/10 ml-1"><FormatText>{item.general_trend}</FormatText></div>
                                    </div>

                                    <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/20 shadow-[inset_0_0_40px_rgba(244,63,94,0.03)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg className="w-24 h-24 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22M12 6l7.5 13h-15M11 10v4h2v-4M11 16v2h2v-2" /></svg>
                                        </div>
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                <span className="text-[11px] uppercase tracking-widest font-bold text-rose-500">The Exception</span>
                                            </div>
                                            <div className="text-rose-100 text-lg font-medium leading-snug"><FormatText>{item.exception}</FormatText></div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-black/30 rounded-2xl border border-white/5 flex gap-4 items-start">
                                        <div className="bg-white/10 p-2 rounded-xl text-stone-400 shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Why This Happens</span>
                                            <span className="text-stone-300 text-sm leading-relaxed"><FormatText>{item.why_exception_occurs}</FormatText></span>
                                        </div>
                                    </div>

                                    {item.exam_question_style && (
                                        <div className="px-5 py-3 bg-teal-500/5 rounded-xl border border-teal-500/10 flex items-center gap-3 mt-2">
                                            <span className="shrink-0 text-teal-500/50">✍️</span>
                                            <span className="text-sm italic text-teal-200/70"><FormatText>{item.exam_question_style}</FormatText></span>
                                        </div>
                                    )}
                                </div>
                            </FlashcardSlide>
                        )}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="py-6 animate-fade-in w-full">
            <div className="max-w-4xl mx-auto mb-12">
                <ChemistryTabSystem
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id)}
                />
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
            >
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default ActivateMode;
