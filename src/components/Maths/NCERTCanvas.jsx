import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
    TrendingUp, Zap, AlertTriangle, Clock, Flame, Star, Target,
    Brain, PenLine, BarChart2, GraduationCap, ArrowRight,
    X, BookOpenCheck
} from 'lucide-react';

/* ─────────────────────────── LATEX HELPERS ─────────────────────────── */
const renderTextWithLatex = (text) => {
    if (!text) return null;
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            try { return <span key={i} className="inline-block align-middle mx-1 [&_.katex]:!text-[0.9em]"><BlockMath math={math} /></span>; }
            catch { return <code key={i} className="text-violet-300 bg-violet-950/40 px-1.5 py-0.5 rounded text-sm">{math}</code>; }
        } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            try { return <span key={i} className="inline-block align-middle mx-0.5 [&_.katex]:!text-[0.87em]"><InlineMath math={math} /></span>; }
            catch { return <code key={i} className="text-violet-300 bg-violet-950/40 px-1 py-0.5 rounded text-sm">{math}</code>; }
        }
        return <span key={i}>{part}</span>;
    });
};

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const DIFF_STYLES = {
    'Easy': { pill: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', dot: 'bg-emerald-400' },
    'Moderate': { pill: 'bg-amber-500/10  border-amber-500/25  text-amber-400', dot: 'bg-amber-400' },
    'Board-Tricky': { pill: 'bg-rose-500/10   border-rose-500/25   text-rose-400', dot: 'bg-rose-400' },
};
const PROB_STYLES = {
    'High': { icon: Flame, color: 'text-orange-400', label: '🔥 High' },
    'Medium': { icon: Star, color: 'text-amber-400', label: '⭐ Medium' },
    'Low': { icon: Target, color: 'text-slate-400', label: '— Low' },
};

const DiffBadge = ({ level }) => {
    const s = DIFF_STYLES[level] || DIFF_STYLES['Moderate'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            {level}
        </span>
    );
};

/* ══════════════════════════ SOLUTION MODAL ══════════════════════════ */
const SolutionModal = ({ q, onClose }) => {
    const steps = Object.entries(q.topper_solution || {});
    const modalRef = useRef(null);

    // Close on backdrop click
    const handleBackdrop = (e) => { if (e.target === modalRef.current) onClose(); };

    // Close on ESC + lock body scroll
    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', fn);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const estimatedMin = q.estimated_time_seconds ? Math.ceil(Number(q.estimated_time_seconds) / 60) : null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {/* ── Backdrop ── */}
            <motion.div
                ref={modalRef}
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleBackdrop}
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-0 sm:px-4"
            >
                {/* ── Sheet / Modal ── */}
                <motion.div
                    key="modal"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="w-full sm:max-w-2xl lg:max-w-3xl bg-[#0f0a22] border border-violet-500/15
                               rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-violet-900/30
                               flex flex-col overflow-hidden dark-katex text-white"
                    style={{ maxHeight: '92dvh' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag handle (mobile) */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 px-5 sm:px-7 py-4 border-b border-white/[0.05] shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="px-2.5 py-0.5 bg-violet-500/12 border border-violet-500/20 rounded-full text-violet-300 text-[10px] font-bold uppercase tracking-widest">
                                    {q.ncert_reference?.exercise} · Q{q.ncert_reference?.question_number}
                                </span>
                                <DiffBadge level={q.difficulty_level} />
                                {estimatedMin && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-white/35 font-medium">
                                        <Clock className="w-3 h-3" />~{estimatedMin} min
                                    </span>
                                )}
                            </div>
                            <h3 className="text-white font-bold text-[15px] leading-snug flex items-center gap-2">
                                <Brain className="w-4 h-4 text-violet-400 shrink-0" />
                                Topper Solution
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                        >
                            <X className="w-4 h-4 text-white/50" />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5 space-y-5">

                        {/* ── Solution Canvas (all steps visible at once) ── */}
                        {steps.length > 0 && (
                            <div className="rounded-2xl border border-violet-500/[0.08] overflow-hidden"
                                style={{ background: 'linear-gradient(160deg, #0e0a20 0%, #0a0818 100%)' }}>
                                {/* Canvas header */}
                                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-violet-500/[0.07]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                    <span className="text-violet-400/70 text-[10px] font-bold uppercase tracking-[0.25em]">
                                        Solution · {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                                    </span>
                                </div>
                                {/* Steps — always visible */}
                                <div className="divide-y divide-violet-500/[0.05]">
                                    {steps.map(([key, content], i) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
                                            className="flex gap-4 px-5 py-5"
                                        >
                                            {/* Step number */}
                                            <div className="shrink-0 flex flex-col items-center gap-2">
                                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 border border-violet-500/25 flex items-center justify-center text-[12px] font-bold text-violet-300">
                                                    {i + 1}
                                                </div>
                                                {/* Connector line */}
                                                {i < steps.length - 1 && (
                                                    <div className="w-px flex-1 min-h-[16px] bg-gradient-to-b from-violet-500/20 to-transparent" />
                                                )}
                                            </div>
                                            {/* Step label + content */}
                                            <div className="flex-1 min-w-0 pb-1">
                                                <p className="text-violet-400/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                                    Step {i + 1}
                                                </p>
                                                <div className="text-white/85 text-[13.5px] leading-[1.9] [&_.katex-display]:!my-2 [&_.katex]:!text-[0.9em]">
                                                    {renderTextWithLatex(content)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Board Writing Tip */}
                        {q.board_writing_tip && (
                            <div className="flex gap-3.5 bg-gradient-to-br from-emerald-950/40 to-emerald-950/10 border border-emerald-500/[0.12] rounded-2xl p-4 sm:p-5">
                                <div className="shrink-0 w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mt-0.5">
                                    <PenLine className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">Board Writing Tip</p>
                                    <p className="text-white/75 text-[13px] leading-[1.8]">{renderTextWithLatex(q.board_writing_tip)}</p>
                                </div>
                            </div>
                        )}

                        {/* Common Mistakes */}
                        {q.common_student_mistakes?.length > 0 && (
                            <div className="flex gap-3.5 bg-gradient-to-br from-rose-950/30 to-rose-950/5 border border-rose-500/[0.1] rounded-2xl p-4 sm:p-5">
                                <div className="shrink-0 w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center mt-0.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Common Mistakes</p>
                                    <ul className="space-y-2">
                                        {q.common_student_mistakes.map((m, i) => (
                                            <li key={i} className="flex gap-2 text-white/70 text-[13px] leading-[1.8]">
                                                <span className="shrink-0 mt-2.5 w-1 h-1 rounded-full bg-rose-400/50" />
                                                <span>{renderTextWithLatex(m)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

/* ══════════════════════════ QUESTION CARD ══════════════════════════ */
const QuestionCard = ({ q, onViewSolution }) => {
    const prob = PROB_STYLES[q.repeat_probability_2026] || PROB_STYLES['Medium'];
    const estimatedMin = q.estimated_time_seconds ? Math.ceil(Number(q.estimated_time_seconds) / 60) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="bg-gradient-to-br from-[#110a28]/90 to-[#0c0820]/80 border border-violet-500/[0.1] rounded-3xl overflow-hidden"
        >
            {/* Top colorbar — difficulty color */}
            <div className={`h-[3px] w-full ${q.difficulty_level === 'Easy' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                q.difficulty_level === 'Board-Tricky' ? 'bg-gradient-to-r from-rose-500 to-orange-400' :
                    'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`} />

            <div className="p-5 sm:p-6">
                {/* Meta row */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-[10px] font-bold uppercase tracking-widest">
                        {q.ncert_reference?.exercise}
                    </span>
                    <span className="text-white/25 text-[10px]">·</span>
                    <span className="text-white/40 text-[11px] font-medium">Q{q.ncert_reference?.question_number}</span>
                    <div className="ml-auto flex items-center gap-2">
                        <DiffBadge level={q.difficulty_level} />
                        <span className={`text-[11px] font-semibold ${prob.color}`}>{prob.label}</span>
                    </div>
                </div>

                {/* Question text */}
                <div className="text-white/88 text-[14px] sm:text-[15px] leading-[1.85] mb-5 [&_.katex-display]:!my-1.5 [&_.katex]:!text-[0.92em] sm:[&_.katex]:!text-[1em]">
                    {renderTextWithLatex(q.question_text)}
                </div>

                {/* Concepts */}
                {q.concepts_tested?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {q.concepts_tested.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 bg-violet-500/[0.05] border border-violet-500/[0.09] rounded-full text-violet-300/60 text-[11px] font-medium">
                                {renderTextWithLatex(c)}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.04]">
                    {estimatedMin && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-white/30 font-medium">
                            <Clock className="w-3.5 h-3.5" />~{estimatedMin} min
                        </span>
                    )}
                    <button
                        onClick={onViewSolution}
                        className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10
                                   border border-violet-500/20 hover:border-violet-400/35
                                   text-white text-[13px] font-semibold
                                   hover:from-violet-500/20 hover:to-fuchsia-500/15
                                   transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.08)]
                                   hover:shadow-[0_0_25px_rgba(139,92,246,0.18)]"
                    >
                        <BookOpenCheck className="w-4 h-4 text-violet-300" />
                        View Solution
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ══════════════════════════ QUESTION PILL SELECTOR ══════════════════════════ */
const QuestionPills = ({ questions, selectedId, onSelect }) => {
    const scrollRef = useRef(null);

    return (
        <div className="relative mb-5">
            {/* Fade edges hint */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#050510] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#050510] to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto px-1 pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`.pill-scroll::-webkit-scrollbar { display: none; }`}</style>
                {questions.map((q) => {
                    const isActive = q.question_id === selectedId;
                    const dotColor = DIFF_STYLES[q.difficulty_level]?.dot || 'bg-amber-400';
                    return (
                        <button
                            key={q.question_id}
                            onClick={() => onSelect(q.question_id)}
                            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-200
                                ${isActive
                                    ? 'bg-violet-500/15 border-violet-500/30 text-white shadow-[0_0_18px_rgba(139,92,246,0.12)]'
                                    : 'bg-white/[0.025] border-white/[0.06] text-white/45 hover:text-white/70 hover:bg-white/[0.04] hover:border-white/[0.1]'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? dotColor : 'bg-white/20'}`} />
                            Q{q.question_id}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/* ══════════════════════════ TREND ANALYSIS ══════════════════════════ */
const TrendAnalysis = ({ data }) => {
    if (!data) return null;
    return (
        <div className="mb-9">
            <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                    <BarChart2 className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-fuchsia-400/80 text-xs font-bold uppercase tracking-[0.25em]">PYQ Trend Analysis</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-500/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.dominant_concepts_from_pyqs?.length > 0 && (
                    <div className="bg-gradient-to-br from-fuchsia-500/[0.04] to-violet-500/[0.02] border border-fuchsia-500/[0.09] rounded-2xl p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/10 flex items-center justify-center">
                                <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
                            </div>
                            <h3 className="text-white font-semibold text-[13px]">Dominant PYQ Concepts</h3>
                        </div>
                        <ol className="space-y-2.5">
                            {data.dominant_concepts_from_pyqs.map((c, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="shrink-0 w-5 h-5 rounded-md bg-fuchsia-500/12 border border-fuchsia-500/18 flex items-center justify-center text-fuchsia-300 text-[9px] font-bold mt-0.5">{i + 1}</span>
                                    <span className="text-white/65 text-[13px] leading-[1.7]">{renderTextWithLatex(c)}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
                {data.question_patterns_seen?.length > 0 && (
                    <div className="bg-gradient-to-br from-violet-500/[0.04] to-indigo-500/[0.02] border border-violet-500/[0.09] rounded-2xl p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-violet-400" />
                            </div>
                            <h3 className="text-white font-semibold text-[13px]">Question Patterns</h3>
                        </div>
                        <ul className="space-y-2.5">
                            {data.question_patterns_seen.map((p, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <ArrowRight className="shrink-0 w-3 h-3 text-violet-400/50 mt-1.5" />
                                    <span className="text-white/65 text-[13px] leading-[1.7]">{renderTextWithLatex(p)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
const NCERTCanvas = ({ trendAnalysis, questions }) => {
    const [selectedId, setSelectedId] = useState(questions?.[0]?.question_id ?? null);
    const [modalQ, setModalQ] = useState(null);

    const selectedQ = questions?.find(q => q.question_id === selectedId) ?? null;

    if (!trendAnalysis && (!questions || questions.length === 0)) return null;

    return (
        <div className="w-full dark-katex text-white">

            {/* ── Trend Analysis ── */}
            {trendAnalysis && <TrendAnalysis data={trendAnalysis} />}

            {/* ── Questions Section ── */}
            {questions?.length > 0 && (
                <>
                    {/* Section header */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.25em]">High-Leverage NCERT</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
                        <span className="text-white/20 text-xs font-medium shrink-0">{questions.length} questions</span>
                    </div>

                    {/* Pill selector */}
                    <QuestionPills
                        questions={questions}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />

                    {/* Question card */}
                    <AnimatePresence mode="wait">
                        {selectedQ && (
                            <QuestionCard
                                key={selectedQ.question_id}
                                q={selectedQ}
                                onViewSolution={() => setModalQ(selectedQ)}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* ── Solution Modal ── */}
            <AnimatePresence>
                {modalQ && <SolutionModal q={modalQ} onClose={() => setModalQ(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default NCERTCanvas;
