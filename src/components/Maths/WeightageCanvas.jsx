import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Crosshair,
    BarChart3, BookOpen, Sparkles, Target, AlertTriangle, Brain,
    Clock, Shield, Lightbulb, Layers, Link2, Zap, GraduationCap
} from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ─── Latex helpers ───
const processLatex = (str) => {
    if (!str) return '';
    return str.replace(/^\$\$(.*?)\$\$$/s, '$1').replace(/^\$(.*?)\$$/s, '$1').trim();
};

const renderTextWithLatex = (text) => {
    if (!text) return null;
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            try {
                return <span key={i} className="inline-block align-middle mx-1 [&_.katex]:!text-[0.95em]"><BlockMath math={math} /></span>;
            } catch {
                return <code key={i} className="text-amber-200 bg-amber-900/30 px-1.5 py-0.5 rounded text-sm">{math}</code>;
            }
        } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            try {
                return <span key={i} className="inline-block align-middle mx-0.5 [&_.katex]:!text-[0.9em]"><InlineMath math={math} /></span>;
            } catch {
                return <code key={i} className="text-amber-200 bg-amber-900/30 px-1.5 py-0.5 rounded text-sm">{math}</code>;
            }
        }
        return <span key={i}>{part}</span>;
    });
};

// ─── Frequency styles ───
const frequencyBadge = {
    High: { bg: 'bg-emerald-400/10', text: 'text-emerald-300', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
    Medium: { bg: 'bg-amber-400/10', text: 'text-amber-300', border: 'border-amber-400/20', dot: 'bg-amber-400' },
    Low: { bg: 'bg-stone-400/10', text: 'text-stone-400', border: 'border-stone-400/20', dot: 'bg-stone-400' },
};

// ─── Light card transition ───
const cardVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, zIndex: 1 },
    exit: (dir) => ({ x: dir < 0 ? 60 : -60, opacity: 0, zIndex: 0 }),
};
const quickTransition = {
    x: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    opacity: { duration: 0.18 },
};


// ═══════════════════════════════════════════════════════════
// ██  WeightageCanvas — Warm editorial design
// ═══════════════════════════════════════════════════════════
const WeightageCanvas = ({ weightageData, standardResults }) => {
    const [[resultPage, resultDir], setResultPage] = useState([0, 0]);
    const results = standardResults || [];
    const current = results[resultPage];

    const goNext = () => { if (resultPage < results.length - 1) setResultPage([resultPage + 1, 1]); };
    const goPrev = () => { if (resultPage > 0) setResultPage([resultPage - 1, -1]); };
    const goTo = (i) => setResultPage([i, i > resultPage ? 1 : -1]);

    React.useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [resultPage, results.length]);

    return (
        <div className="w-full select-none dark-katex">

            {/* ═══════════════════════════════════════
                  CHAPTER WEIGHTAGE — Bento Dashboard
                ═══════════════════════════════════════ */}
            {weightageData && (
                <section className="mb-24">
                    {/* Section title — editorial style */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500"></div>
                            <span className="text-violet-300/80 text-[11px] font-bold uppercase tracking-[0.3em]">Exam Weightage</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white/90 tracking-tight leading-tight">
                            Chapter Analysis
                        </h2>
                        <p className="text-stone-500 text-[15px] mt-2 max-w-lg leading-relaxed">
                            Strategic breakdown of marks distribution and key concepts to prioritize.
                        </p>
                    </motion.div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

                        {/* Marks Hero — spans 2 cols */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl border border-violet-500/10 p-8 flex flex-col justify-between min-h-[240px]"
                            style={{ background: 'linear-gradient(135deg, #110a22 0%, #0c0818 40%, #0e0a1c 100%)' }}
                        >
                            {/* Decorative ring */}
                            <div className="absolute -top-16 -right-16 w-48 h-48 border border-violet-400/[0.06] rounded-full"></div>
                            <div className="absolute -top-10 -right-10 w-36 h-36 border border-violet-400/[0.04] rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-violet-500/[0.03] to-transparent"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/10 rounded-lg mb-4">
                                    <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                                    <span className="text-violet-400/70 text-[11px] font-semibold uppercase tracking-wider">Board Average</span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-300 tracking-tight leading-none mb-2">
                                    {weightageData.average_marks_in_board?.replace(/\s*\(.*?\)\s*$/, '') || '4-5 Marks'}
                                </h3>
                                <p className="text-stone-600 text-sm font-medium">
                                    {weightageData.average_marks_in_board?.match(/\(.*?\)/)?.[0]?.replace(/[()]/g, '') || 'In CBSE Board exams'}
                                </p>
                            </div>
                        </motion.div>

                        {/* High Weightage — spans 4 cols */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="md:col-span-4 rounded-3xl border border-emerald-500/[0.08] p-7 relative overflow-hidden"
                            style={{ background: 'linear-gradient(145deg, #0a100e 0%, #080d0c 100%)' }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 via-emerald-600 to-transparent rounded-full"></div>
                            <div className="pl-4">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <h4 className="text-emerald-300/80 font-semibold text-sm">High Weightage Areas</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {weightageData.high_weightage_areas?.map((area, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-emerald-500/[0.04] border border-emerald-500/[0.06] rounded-xl px-4 py-3.5 hover:border-emerald-400/15 transition-colors duration-300">
                                            <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-emerald-400 text-[10px] font-bold">{i + 1}</span>
                                            </div>
                                            <span className="text-stone-300 text-[13px] leading-[1.6]">{renderTextWithLatex(area)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Low Weightage — spans 2 cols */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="md:col-span-2 rounded-3xl border border-purple-800/40 p-7 relative overflow-hidden"
                            style={{ background: 'linear-gradient(145deg, #0c0a12 0%, #080810 100%)' }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500 via-purple-700 to-transparent rounded-full"></div>
                            <div className="pl-4">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <TrendingDown className="w-4 h-4 text-purple-400" />
                                    <h4 className="text-purple-400/80 font-semibold text-sm">Low Weightage</h4>
                                </div>
                                <ul className="space-y-3">
                                    {weightageData.low_weightage_areas?.map((area, i) => (
                                        <li key={i} className="text-stone-600 text-[13px] leading-[1.6] flex items-start gap-2.5">
                                            <span className="mt-[7px] w-1 h-1 rounded-full bg-stone-600 shrink-0"></span>
                                            <span>{renderTextWithLatex(area)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* 80/20 Leverage — spans 2 cols */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                            className="md:col-span-2 rounded-3xl border border-fuchsia-500/[0.08] p-7 relative overflow-hidden"
                            style={{ background: 'linear-gradient(145deg, #100a14 0%, #0c0810 100%)' }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-fuchsia-400 via-purple-600 to-transparent rounded-full"></div>
                            <div className="pl-4">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <Crosshair className="w-4 h-4 text-fuchsia-400" />
                                    <h4 className="text-fuchsia-300/80 font-semibold text-sm">80/20 Leverage</h4>
                                    <span className="text-[10px] text-fuchsia-300/50 font-bold tracking-wider uppercase bg-fuchsia-500/10 px-2 py-0.5 rounded">Focus</span>
                                </div>
                                <ul className="space-y-3">
                                    {weightageData.eighty_twenty_leverage_concepts?.map((concept, i) => (
                                        <li key={i} className="text-stone-400 text-[13px] leading-[1.7] flex items-start gap-2.5">
                                            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-fuchsia-400/40 shrink-0"></span>
                                            <span>{renderTextWithLatex(concept)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}


            {/* ═══════════════════════════════════════
                  STANDARD RESULTS — Editorial Carousel
                ═══════════════════════════════════════ */}
            {results.length > 0 && (
                <section>
                    {/* Section title */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-400 to-indigo-600"></div>
                            <span className="text-purple-400/70 text-[11px] font-bold uppercase tracking-[0.3em]">Reference Library</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white/90 tracking-tight">Standard Results</h2>
                                <p className="text-stone-600 text-[14px] mt-1">Core theorems and properties you must master.</p>
                            </div>

                            {/* Nav controls */}
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                                <button onClick={goPrev} disabled={resultPage === 0}
                                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${resultPage === 0 ? 'border-purple-800/40 text-purple-700 cursor-not-allowed' : 'border-violet-500/20 text-violet-400/60 hover:bg-violet-500/10 hover:text-violet-300'}`}>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-500/[0.05] border border-violet-500/10 rounded-full min-w-[60px] justify-center">
                                    <span className="text-violet-300 font-bold text-sm tabular-nums">{resultPage + 1}</span>
                                    <span className="text-purple-700 text-xs">/</span>
                                    <span className="text-purple-500 text-sm tabular-nums">{results.length}</span>
                                </div>
                                <button onClick={goNext} disabled={resultPage === results.length - 1}
                                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${resultPage === results.length - 1 ? 'border-purple-800/40 text-purple-700 cursor-not-allowed' : 'border-violet-500/20 text-violet-400/60 hover:bg-violet-500/10 hover:text-violet-300'}`}>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pill indicators */}
                    {results.length <= 20 && (
                        <div className="flex items-center gap-1.5 mb-10 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                            {results.map((_, i) => (
                                <button key={i} onClick={() => goTo(i)}
                                    className={`shrink-0 rounded-full transition-all duration-300 ${i === resultPage
                                        ? 'w-7 h-[5px] bg-gradient-to-r from-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                                        : i < resultPage
                                            ? 'w-[5px] h-[5px] bg-violet-500/30 hover:bg-violet-400/50'
                                            : 'w-[5px] h-[5px] bg-purple-900/40 hover:bg-purple-600/40'
                                        }`}
                                    aria-label={`Go to result ${i + 1}`} />
                            ))}
                        </div>
                    )}

                    {/* Result Card */}
                    <div className="relative w-full overflow-hidden">
                        <AnimatePresence initial={false} custom={resultDir} mode="wait">
                            <motion.div
                                key={resultPage}
                                custom={resultDir}
                                variants={cardVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={quickTransition}
                                className="w-full will-change-[transform,opacity]"
                            >
                                {current && <ResultCard result={current} total={results.length} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>
            )}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════
// ██  ResultCard — Warm editorial layout
// ═══════════════════════════════════════════════════════════
const ResultCard = ({ result, total }) => {
    const freq = frequencyBadge[result.pyq_frequency_level] || frequencyBadge.Medium;

    return (
        <div className="w-full space-y-8">

            {/* ─── HEADER ─── */}
            <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-violet-500/15"
                    style={{ background: 'linear-gradient(135deg, #150a2a 0%, #0e081a 100%)' }}>
                    <span className="text-lg font-bold text-violet-300">{result.result_number}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white/90 tracking-tight leading-snug">{result.result_title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-stone-600 text-xs font-medium tracking-wider">RESULT {result.result_number} OF {total}</span>
                        {result.pyq_frequency_level && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${freq.bg} ${freq.text} ${freq.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${freq.dot} animate-pulse`}></span>
                                {result.pyq_frequency_level}
                            </span>
                        )}
                    </div>
                </div>
            </div>


            {/* ─── HERO RESULT — warm glass with amber accent ─── */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/[0.08]"
                style={{ background: 'linear-gradient(160deg, #110a22 0%, #0c0818 50%, #0a0916 100%)' }}>
                {/* Top accent line */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"></div>
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[150px] bg-violet-600/[0.04] rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 p-10 sm:p-12 flex flex-col items-center text-center">
                    <div className="w-full min-w-0 text-xl sm:text-2xl lg:text-3xl text-white [&_.katex]:!text-[1.1em] sm:[&_.katex]:!text-[1.3em] lg:[&_.katex]:!text-[1.5em] [&_.katex-display]:!my-2">
                        <BlockMath math={processLatex(result.latex_result)} />
                    </div>
                </div>
            </div>


            {/* ─── DERIVED FORMS ─── */}
            {result.derived_forms?.length > 0 && (
                <div className="rounded-2xl border border-purple-800/40 p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #0e0a18 0%, #0a0814 100%)' }}>
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-400 via-purple-600 to-transparent rounded-full"></div>
                    <div className="pl-4">
                        <h4 className="text-stone-500 font-semibold text-[11px] uppercase tracking-[0.2em] mb-5">Derived Forms</h4>
                        <div className="space-y-2.5">
                            {result.derived_forms.map((df, i) => (
                                <div key={i} className="bg-violet-500/[0.03] border border-violet-500/[0.06] rounded-xl px-5 py-4 overflow-hidden [&_.katex-display]:!my-0 [&_.katex]:!text-[0.85em] sm:[&_.katex]:!text-[0.95em] [&_.katex-display>.katex]:whitespace-normal">
                                    <BlockMath math={processLatex(df)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            {/* ─── TWO COLUMN: NCERT Reference + Why This Works ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* NCERT Ref */}
                {result.origin_in_ncert && (
                    <div className="lg:col-span-2 rounded-2xl border border-purple-800/40 p-6"
                        style={{ background: 'linear-gradient(145deg, #0c0a14 0%, #08081a 100%)' }}>
                        <div className="flex items-center gap-2 mb-5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <h4 className="text-purple-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">NCERT Source</h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Section', value: result.origin_in_ncert.chapter_section },
                                { label: 'Exercise', value: result.origin_in_ncert.exercise_reference },
                                { label: 'Example', value: result.origin_in_ncert.example_reference },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b border-purple-800/30 last:border-0">
                                    <span className="text-stone-600 text-[12px] font-medium">{label}</span>
                                    <span className="text-stone-300 text-[13px] font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conceptual Reason */}
                {result.conceptual_reason && (
                    <div className="lg:col-span-3 rounded-2xl border border-purple-800/40 p-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #0c0a16 0%, #08081a 100%)' }}>
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-400 via-indigo-600 to-transparent rounded-full"></div>
                        <div className="pl-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                                <h4 className="text-purple-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">Why This Works</h4>
                            </div>
                            <p className="text-stone-400 text-[14px] leading-[1.85]">{renderTextWithLatex(result.conceptual_reason)}</p>
                        </div>
                    </div>
                )}
            </div>


            {/* ─── QUESTION PATTERNS ─── */}
            {result.question_formation_patterns?.length > 0 && (() => {
                const validPatterns = result.question_formation_patterns.filter(
                    p => p.description !== 'N/A' && p.marks_weightage !== 'Not Applicable'
                );
                if (validPatterns.length === 0) return null;

                const patternAccents = [
                    { left: 'from-emerald-400 to-emerald-700', bg: '#090e0c', border: 'border-emerald-500/[0.06]', badge: 'bg-emerald-500/10 text-emerald-300' },
                    { left: 'from-violet-400 to-violet-700', bg: '#0c0a16', border: 'border-violet-500/[0.06]', badge: 'bg-violet-500/10 text-violet-300' },
                    { left: 'from-rose-400 to-rose-700', bg: '#0e0809', border: 'border-rose-500/[0.06]', badge: 'bg-rose-500/10 text-rose-300' },
                    { left: 'from-purple-400 to-purple-700', bg: '#0c0a14', border: 'border-purple-500/[0.06]', badge: 'bg-purple-500/10 text-purple-300' },
                ];

                return (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-purple-600"></div>
                            <span className="text-purple-400/80 text-[11px] font-bold uppercase tracking-[0.25em]">Question Patterns</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {validPatterns.map((pattern, i) => {
                                const accent = patternAccents[i % patternAccents.length];
                                return (
                                    <div key={i} className={`rounded-2xl ${accent.border} border p-5 relative overflow-hidden`}
                                        style={{ background: accent.bg }}>
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${accent.left} rounded-full`}></div>
                                        <div className="pl-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-stone-300 font-semibold text-[13px]">{pattern.pattern_type}</h5>
                                                {pattern.marks_weightage && (
                                                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${accent.badge}`}>
                                                        {pattern.marks_weightage.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-stone-500 text-[13px] leading-[1.7]">{renderTextWithLatex(pattern.description)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}


            {/* ─── EXAM INTEL — Traps + Occurrence ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.common_traps?.length > 0 && (
                    <div className="md:col-span-2 rounded-2xl border border-rose-500/[0.06] p-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #100810 0%, #0c070e 100%)' }}>
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-rose-400 via-rose-700 to-transparent rounded-full"></div>
                        <div className="pl-4">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                <h4 className="text-rose-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">Common Traps</h4>
                            </div>
                            <ul className="space-y-3">
                                {result.common_traps.map((trap, i) => (
                                    <li key={i} className="text-stone-400 text-[13px] leading-[1.75] flex items-start gap-2.5">
                                        <span className="mt-[7px] w-1 h-1 rounded-full bg-rose-400/50 shrink-0"></span>
                                        <span>{renderTextWithLatex(trap)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {result.estimated_occurrence_pattern && (
                    <div className="rounded-2xl border border-purple-800/40 p-6 flex flex-col"
                        style={{ background: 'linear-gradient(145deg, #0c0a14 0%, #08081a 100%)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                            <h4 className="text-violet-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">Occurrence</h4>
                        </div>
                        <p className="text-stone-500 text-[13px] leading-[1.75] flex-1">{result.estimated_occurrence_pattern}</p>
                    </div>
                )}
            </div>


            {/* ─── STRATEGY STRIP ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.memory_anchor && (
                    <div className="rounded-2xl border border-violet-500/[0.08] p-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(160deg, #100a1c 0%, #0c0816 100%)' }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/25 to-transparent"></div>
                        <div className="flex items-center gap-2 mb-4 mt-1">
                            <Brain className="w-3.5 h-3.5 text-violet-400" />
                            <h4 className="text-violet-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">Memory Anchor</h4>
                        </div>
                        <p className="text-violet-200/50 text-[14px] leading-[1.7] italic font-medium">"{renderTextWithLatex(result.memory_anchor)}"</p>
                    </div>
                )}

                {result.thirty_second_exam_strategy && (
                    <div className="rounded-2xl border border-purple-800/40 p-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #0c0a16 0%, #08081a 100%)' }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
                        <div className="flex items-center gap-2 mb-4 mt-1">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <h4 className="text-purple-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">30s Strategy</h4>
                        </div>
                        <p className="text-stone-500 text-[13px] leading-[1.75]">{renderTextWithLatex(result.thirty_second_exam_strategy)}</p>
                    </div>
                )}

                {result.examiner_psychology && (
                    <div className="rounded-2xl border border-purple-500/[0.06] p-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #0c080e 0%, #0a080c 100%)' }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
                        <div className="flex items-center gap-2 mb-4 mt-1">
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                            <h4 className="text-purple-400/60 font-semibold text-[11px] uppercase tracking-[0.2em]">Examiner's Mind</h4>
                        </div>
                        <p className="text-stone-500 text-[13px] leading-[1.75]">{renderTextWithLatex(result.examiner_psychology)}</p>
                    </div>
                )}
            </div>


            {/* ─── CONNECTS TO ─── */}
            {result.integration_with_other_concepts?.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap pt-2">
                    <div className="flex items-center gap-2 mr-1">
                        <Link2 className="w-3 h-3 text-stone-700" />
                        <span className="text-stone-700 text-[11px] font-semibold tracking-wider uppercase">Connects to</span>
                    </div>
                    {result.integration_with_other_concepts.map((concept, i) => (
                        <span key={i} className="px-3 py-1.5 bg-violet-500/[0.04] border border-violet-500/[0.08] rounded-full text-violet-300/50 text-[11px] font-medium hover:border-violet-400/20 transition-colors duration-200">
                            {concept}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeightageCanvas;
