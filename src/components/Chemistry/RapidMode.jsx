import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import ChemistryTabSystem from './ChemistryTabSystem';
import ChemistryCard from './ChemistryCard';
import { FormatText } from './FormatText';

const RapidCarousel = ({ items, renderContent, accentColor }) => {
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
            <div className="text-center text-stone-500 py-16 border border-white/5 rounded-2xl bg-white/5 shadow-inner">
                <div className="text-4xl mb-3 opacity-30">⚡</div>
                No rapid checkpoints available.
            </div>
        );
    }

    const currentItem = items[currentIndex];

    // Faster, sharper animation for "Rapid" mode
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            rotateY: direction > 0 ? 15 : -15,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            rotateY: 0,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            rotateY: direction < 0 ? 15 : -15,
        }),
    };

    const colorMap = {
        teal: 'bg-teal-500 text-teal-400 border-teal-500/30 ring-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.15)]',
        amber: 'bg-amber-500 text-amber-500 border-amber-500/30 ring-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        rose: 'bg-rose-500 text-rose-500 border-rose-500/30 ring-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    };
    const accentClass = colorMap[accentColor] || colorMap.teal;
    const isAmber = accentColor === 'amber';
    const isRose = accentColor === 'rose';

    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center perspective-1000">

            {/* Minimalist Progress Track */}
            <div className="w-full flex justify-between items-end mb-6 px-2">
                <div className="text-xs uppercase tracking-widest font-bold text-stone-500">
                    Checkpoint <span className={`text-[15px] ${accentClass.split(' ')[1]}`}>{currentIndex + 1}</span> / {items.length}
                </div>
                <div className="flex gap-1.5">
                    {items.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-sm transition-all duration-300 ${idx === currentIndex ? `w-8 ${accentClass.split(' ')[0]}` : 'w-3 bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Slider Track */}
            <div className="relative w-full overflow-hidden rounded-2xl pb-8">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 400, damping: 35 },
                            opacity: { duration: 0.15 },
                            rotateY: { duration: 0.25 }
                        }}
                        className="w-full"
                    >
                        {renderContent(currentItem)}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Rapid Navigation Controls */}
            <div className="flex justify-between w-full px-4 mb-4 mt-2">
                <button
                    onClick={handlePrev}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white uppercase text-xs font-bold tracking-widest backdrop-blur-sm"
                >
                    &larr; Prev
                </button>

                <button
                    onClick={handleNext}
                    className={`flex items-center gap-3 px-8 py-3 rounded-lg border uppercase text-xs font-bold tracking-widest text-black transition-all ${isAmber
                            ? 'bg-amber-500 border-amber-400 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : isRose
                                ? 'bg-rose-500 border-rose-400 hover:bg-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] text-white'
                                : 'bg-teal-400 border-teal-300 hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]'
                        }`}
                >
                    Next &rarr;
                </button>
            </div>
        </div>
    );
};

const RapidSlide = ({ title, accentColor, children }) => {
    const isAmber = accentColor === 'amber';
    const isRose = accentColor === 'rose';

    return (
        <ChemistryCard
            className={`relative overflow-hidden group border ${isAmber ? 'border-amber-500/20' : isRose ? 'border-rose-500/20' : 'border-teal-500/20'
                } bg-gradient-to-br from-[#121212] flex flex-col to-[#0a0a0a] min-h-[350px] shadow-2xl`}
            hoverEffect={false}
        >
            {/* Edgy Side Accent */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isAmber ? 'bg-amber-500' : isRose ? 'bg-rose-500' : 'bg-teal-500'
                } opacity-80`} />

            <div className="flex flex-col mb-8 pl-4">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">
                    <FormatText>{title}</FormatText>
                </h4>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isAmber ? 'text-amber-500/70' : isRose ? 'text-rose-500/70' : 'text-teal-500/70'
                    }`}>Rapid Checkpoint</div>
            </div>

            <div className="text-stone-300 text-base leading-relaxed pl-4 flex-1">
                {children}
            </div>
        </ChemistryCard>
    );
};

const RapidMode = ({ chapterData }) => {
    const tabs = [
        { id: 'triggers', label: 'Trigger Points' },
        { id: 'traps', label: 'Numerical Traps' },
        { id: 'predictions', label: 'Exam Predictions' }
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    // Merge high predictions and exceptions into a single array for the carousel
    const predictionItems = [];
    if (chapterData.chapter_master_control?.high_probability_areas_2026) {
        chapterData.chapter_master_control.high_probability_areas_2026.forEach(item => {
            predictionItems.push({ type: 'prediction', text: item });
        });
    }
    if (chapterData.exception_bank) {
        chapterData.exception_bank.forEach(ex => {
            predictionItems.push({ type: 'exception', ...ex });
        });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'triggers':
                return (
                    <RapidCarousel
                        items={chapterData.formula_trigger_engine}
                        accentColor="teal"
                        renderContent={(item) => (
                            <RapidSlide title={item.trigger_situation} accentColor="teal">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-teal-400 font-bold uppercase tracking-widest text-[11px] shrink-0 mt-1">Action</div>
                                        <div className="text-white/90 font-medium text-lg leading-snug"><FormatText>{item.student_should_think}</FormatText></div>
                                    </div>
                                    <div className="p-6 bg-black/60 rounded-xl border border-teal-500/10 text-center shadow-inner">
                                        <BlockMath math={item.correct_formula_latex} />
                                    </div>
                                </div>
                            </RapidSlide>
                        )}
                    />
                );
            case 'traps':
                return (
                    <RapidCarousel
                        items={chapterData.numerical_pattern_lab}
                        accentColor="amber"
                        renderContent={(item) => (
                            <RapidSlide title={item.problem_archetype} accentColor="amber">
                                <div className="space-y-6 flex flex-col h-full justify-between">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-500">
                                            ⏱️
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Target Time</span>
                                            <span className="text-amber-100 text-xl font-bold">{item.time_target_seconds}s</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-amber-500 font-bold uppercase tracking-widest text-[11px] shrink-0 mt-1">Trap</div>
                                        <div className="text-white/90 text-[15px] leading-relaxed font-medium"><FormatText>{item.hidden_exam_trap}</FormatText></div>
                                    </div>

                                    <div className="p-4 bg-amber-500/5 rounded-xl border-l-4 border-amber-500">
                                        <span className="block text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">Signal</span>
                                        <span className="text-amber-200/80 text-sm"><FormatText>{item.recognition_signal}</FormatText></span>
                                    </div>
                                </div>
                            </RapidSlide>
                        )}
                    />
                );
            case 'predictions':
                return (
                    <RapidCarousel
                        items={predictionItems}
                        accentColor="rose"
                        renderContent={(item) => {
                            if (item.type === 'prediction') {
                                return (
                                    <RapidSlide title="2026 Prediction" accentColor="rose">
                                        <div className="flex flex-col items-center justify-center h-full space-y-8 text-center px-4">
                                            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-500">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                            </div>
                                            <div className="text-white/95 text-xl font-medium leading-relaxed max-w-lg">
                                                <FormatText>{item.text}</FormatText>
                                            </div>
                                        </div>
                                    </RapidSlide>
                                );
                            } else {
                                return (
                                    <RapidSlide title="Key Exception" accentColor="rose">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="text-rose-500 font-bold uppercase tracking-widest text-[11px] shrink-0 mt-1">Case</div>
                                                <div className="text-white/95 text-xl font-bold leading-snug"><FormatText>{item.exception}</FormatText></div>
                                            </div>
                                            <div className="p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Why It Occurs</span>
                                                <span className="text-stone-300 text-[15px] leading-relaxed"><FormatText>{item.why_exception_occurs}</FormatText></span>
                                            </div>
                                        </div>
                                    </RapidSlide>
                                );
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="py-6 animate-fade-in w-full">
            <div className="max-w-4xl mx-auto mb-10 text-center sm:text-left">
                <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase px-4">Final Checkpoint</h2>
                <p className="text-stone-400 mt-2 text-sm px-4">Ultra-fast revision before the exam.</p>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
                <ChemistryTabSystem
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id)}
                />
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
            >
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default RapidMode;
