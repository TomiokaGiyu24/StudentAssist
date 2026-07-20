import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormatText } from './FormatText';

// ── Helpers ──────────────────────────────────────────────────────────────────
const MARK_CONFIG = {
    1: { label: '1 Mark', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
    2: { label: '2 Marks', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25' },
    3: { label: '3 Marks', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
    4: { label: '4 Marks', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
    5: { label: '5 Marks', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
};

const TYPE_CONFIG = {
    'MCQ': { color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
    'Assertion-Reason': { color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
    'Case-Based': { color: 'text-orange-400 bg-orange-500/10 border-orange-500/25' },
    '2M': { color: 'text-teal-400 bg-teal-500/10 border-teal-500/25' },
    '3M': { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
    '5M': { color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
};

// ── Formatted text with line-break support ────────────────────────────────────
const ChemText = ({ children, className = '' }) => {
    if (!children || typeof children !== 'string') return <span className={className}>{children}</span>;
    return (
        <span className={className}>
            {children.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                    <FormatText>{line}</FormatText>
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            ))}
        </span>
    );
};

// ── Structured Board-Style Answer (renders step-labelled paragraphs) ──────────
const StructuredAnswer = ({ text }) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);
    return (
        <div className="space-y-3">
            {paragraphs.map((para, i) => (
                <p key={i} className="text-[14px] text-white/80 leading-relaxed">
                    <ChemText>{para}</ChemText>
                </p>
            ))}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PYQQuizMode = ({ pyqContent }) => {
    const questions = pyqContent?.questions || [];
    const meta = pyqContent?.meta || {};

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null); // 'a' | 'b' | 'c' | 'd'
    const [isRevealed, setIsRevealed] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [activeSection, setActiveSection] = useState('solution'); // 'solution' | 'analysis'
    const [attemptedMap, setAttemptedMap] = useState({});          // questionId → 'correct'|'wrong'|'revealed'

    // Reset per-question state when navigating
    useEffect(() => {
        setSelectedOption(null);
        setIsRevealed(false);
        setShowSolution(false);
        setActiveSection('solution');
    }, [currentIndex]);

    const q = questions[currentIndex];
    if (!q) return null;

    const isMCQ = q.question_type === 'MCQ' || q.question_type === 'Assertion-Reason';
    const options = isMCQ ? (q.quiz_mode?.options || {}) : {};
    const correctOptionKey = q.quiz_mode?.correct_option_if_mcq?.toLowerCase();
    const markCfg = MARK_CONFIG[q.marks] || { label: `${q.marks}M`, color: 'text-stone-400 bg-stone-500/10 border-stone-500/25' };
    const typeCfg = TYPE_CONFIG[q.question_type] || { color: 'text-stone-400 bg-stone-500/10 border-stone-500/25' };

    const handleOptionClick = (key) => {
        if (isRevealed) return;
        const isCorrect = key === correctOptionKey;
        setSelectedOption(key);
        setIsRevealed(true);
        setShowSolution(true);
        setAttemptedMap(prev => ({
            ...prev,
            [q.question_id]: isCorrect ? 'correct' : 'wrong',
        }));
    };

    const handleRevealAnswer = () => {
        setIsRevealed(true);
        setShowSolution(true);
        setAttemptedMap(prev => ({
            ...prev,
            [q.question_id]: prev[q.question_id] || 'revealed',
        }));
    };

    const navigate = useCallback((dir) => {
        setCurrentIndex(prev => {
            const next = prev + dir;
            if (next < 0 || next >= questions.length) return prev;
            return next;
        });
    }, [questions.length]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'ArrowLeft') navigate(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate]);

    if (!questions.length) {
        return (
            <div className="flex flex-col items-center justify-center py-28 text-white/30">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-6">⚗️</div>
                <p className="text-lg font-medium">No PYQ questions available yet.</p>
            </div>
        );
    }

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const correctCount = Object.values(attemptedMap).filter(v => v === 'correct').length;
    const attemptedCount = Object.keys(attemptedMap).length;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-24">

            {/* ── TOP HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">PYQ Challenge</span>
                        <span className="text-white/10">·</span>
                        <span className="text-white/30 text-xs">CBSE Class {meta.class}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{meta.chapter_name}</h2>
                    <p className="text-white/30 text-sm mt-0.5">{meta.pyq_year_range} · {meta.total_questions} Questions</p>
                </div>

                {/* Stats pill */}
                <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl shrink-0">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white tabular-nums">{currentIndex + 1}<span className="text-white/30 text-sm font-normal">/{questions.length}</span></p>
                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Question</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <p className="text-xl font-bold text-emerald-400 tabular-nums">{correctCount}<span className="text-white/30 text-sm font-normal">/{attemptedCount}</span></p>
                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Correct</p>
                    </div>
                </div>
            </div>

            {/* ── PROGRESS + DOTS ── */}
            <div className="mb-6">
                <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden mb-3">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                {/* Mini dot navigator */}
                <div className="flex gap-1.5 flex-wrap">
                    {questions.map((qItem, idx) => {
                        const status = attemptedMap[qItem.question_id];
                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                title={`Q${idx + 1}`}
                                className={`rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'w-6 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                                    : status === 'correct'
                                        ? 'w-2 h-2 bg-emerald-500/60 hover:bg-emerald-400'
                                        : status === 'wrong'
                                            ? 'w-2 h-2 bg-rose-500/60 hover:bg-rose-400'
                                            : status === 'revealed'
                                                ? 'w-2 h-2 bg-amber-500/50 hover:bg-amber-400'
                                                : 'w-2 h-2 bg-white/10 hover:bg-white/25'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* ── QUESTION CARD ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative"
                >
                    {/* Glow behind card */}
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-sky-500/10 blur-xl pointer-events-none" />

                    <div className="relative bg-gradient-to-br from-[#0f0f1e] to-[#0a0a18] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
                        {/* Card top accent line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 opacity-60" />

                        <div className="p-6 md:p-10">
                            {/* ── METADATA BADGES ── */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {/* Year badge */}
                                {q.year && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/[0.04] border border-white/[0.07] text-white/40 uppercase tracking-widest">
                                        {q.year}
                                    </span>
                                )}

                                {/* Question type badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeCfg.color}`}>
                                    {q.question_type}
                                </span>

                                {/* Marks badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${markCfg.color}`}>
                                    {markCfg.label}
                                </span>

                                {/* Concept badge */}
                                {q.examiner_intent_analysis?.concept_tested && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.07] text-white/40">
                                        {q.examiner_intent_analysis.concept_tested}
                                    </span>
                                )}
                            </div>

                            {/* ── QUESTION TEXT ── */}
                            <div className="mb-8 text-[17px] md:text-[19px] text-white/90 leading-relaxed font-[450] tracking-[-0.01em]">
                                <ChemText>{q.question_text}</ChemText>
                            </div>

                            {/* ── MCQ OPTIONS ── */}
                            {isMCQ && Object.keys(options).length > 0 && (
                                <div className="space-y-3 mb-8">
                                    {Object.entries(options).map(([key, value]) => {
                                        const isSelected = selectedOption === key;
                                        const isCorrect = key === correctOptionKey;

                                        let containerStyle = 'border-white/[0.08] bg-white/[0.02] hover:border-teal-500/40 hover:bg-teal-500/5';
                                        let letterStyle = 'border-white/10 text-white/30 group-hover:border-teal-500/40 group-hover:text-white/60';
                                        let textStyle = 'text-white/60 group-hover:text-white/80';

                                        if (isRevealed) {
                                            if (isCorrect) {
                                                containerStyle = 'border-emerald-500/50 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                                                letterStyle = 'border-emerald-500 bg-emerald-500 text-white';
                                                textStyle = 'text-emerald-100';
                                            } else if (isSelected && !isCorrect) {
                                                containerStyle = 'border-rose-500/50 bg-rose-500/[0.08] opacity-80';
                                                letterStyle = 'border-rose-500 bg-rose-500 text-white';
                                                textStyle = 'text-rose-100';
                                            } else {
                                                containerStyle = 'border-white/[0.04] bg-white/[0.01] opacity-35';
                                                letterStyle = 'border-white/10 text-white/20';
                                                textStyle = 'text-white/30';
                                            }
                                        } else if (isSelected) {
                                            containerStyle = 'border-teal-500/60 bg-teal-500/10';
                                            letterStyle = 'border-teal-500 bg-teal-500 text-white';
                                            textStyle = 'text-teal-100';
                                        }

                                        return (
                                            <motion.button
                                                key={key}
                                                whileHover={!isRevealed ? { scale: 1.01 } : {}}
                                                whileTap={!isRevealed ? { scale: 0.99 } : {}}
                                                onClick={() => handleOptionClick(key)}
                                                disabled={isRevealed}
                                                className={`group w-full text-left p-4 rounded-2xl border transition-all duration-250 flex items-start gap-4 cursor-pointer disabled:cursor-default ${containerStyle}`}
                                            >
                                                {/* Letter circle */}
                                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200 ${letterStyle}`}>
                                                    {isRevealed && isCorrect ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : isRevealed && isSelected && !isCorrect ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    ) : key.toUpperCase()}
                                                </div>
                                                {/* Option text */}
                                                <span className={`pt-0.5 text-sm leading-relaxed transition-colors duration-200 ${textStyle}`}>
                                                    <ChemText>{value}</ChemText>
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── SUBJECTIVE: REVEAL BUTTON ── */}
                            {!isMCQ && !isRevealed && (
                                <div className="flex justify-center mb-8">
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleRevealAnswer}
                                        className="group relative px-8 py-4 rounded-2xl font-bold text-sm text-white overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.35)] group-hover:shadow-[0_0_40px_rgba(20,184,166,0.55)] transition-shadow duration-300" />
                                        <span className="relative z-10 flex items-center gap-2.5">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            I've Attempted — Reveal Answer & Solution
                                        </span>
                                    </motion.button>
                                </div>
                            )}

                            {/* ── REVEALED SECTION ── */}
                            <AnimatePresence>
                                {isRevealed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 border-t border-white/[0.06] space-y-6">

                                            {/* ── CORRECT ANSWER BANNER (MCQ) ── */}
                                            {isMCQ && correctOptionKey && (
                                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/25">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Correct Answer</p>
                                                        <p className="text-white/90 text-[15px] leading-relaxed font-semibold">
                                                            ({correctOptionKey.toUpperCase()}) <ChemText>{options[correctOptionKey]}</ChemText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── BOXED FINAL ANSWER (non-MCQ) ── */}
                                            {!isMCQ && q.board_style_answer?.final_answer_boxed && q.board_style_answer.final_answer_boxed !== 'N/A' && (
                                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/25">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Final Answer</p>
                                                        <p className="text-white/90 text-[15px] font-semibold">
                                                            <ChemText>{q.board_style_answer.final_answer_boxed}</ChemText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── SUB-SECTION TABS ── */}
                                            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 w-fit overflow-x-auto">
                                                {[
                                                    { id: 'solution', label: '📋 Board Answer' },
                                                    { id: 'analysis', label: '🔍 Examiner Analysis' },
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveSection(tab.id)}
                                                        className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-250 ${activeSection === tab.id
                                                            ? 'text-white'
                                                            : 'text-white/35 hover:text-white/60'
                                                            }`}
                                                    >
                                                        {activeSection === tab.id && (
                                                            <motion.div
                                                                layoutId="chemPyqSubTab"
                                                                className="absolute inset-0 bg-white/[0.07] border border-white/[0.1] rounded-xl"
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                            />
                                                        )}
                                                        <span className="relative z-10">{tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* ── SOLUTION PANEL ── */}
                                            <AnimatePresence mode="wait">
                                                {activeSection === 'solution' && (
                                                    <motion.div
                                                        key="solution"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="bg-[#0d0d1c] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden"
                                                    >
                                                        {/* Left accent bar */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-500 via-cyan-400 to-sky-500 opacity-60 rounded-l-2xl" />

                                                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-5 ml-4 flex items-center gap-2">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                            Board-Style Answer
                                                        </h4>

                                                        <div className="ml-4">
                                                            {q.board_style_answer?.structured_answer ? (
                                                                <StructuredAnswer text={q.board_style_answer.structured_answer} />
                                                            ) : (
                                                                <p className="text-white/30 text-sm">Solution not available.</p>
                                                            )}

                                                            {/* Marking Scheme */}
                                                            {q.board_style_answer?.stepwise_marking_scheme_breakdown && (
                                                                <div className="mt-5 p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Marking Scheme</p>
                                                                    <ChemText className="text-[13px] text-white/50 leading-relaxed">
                                                                        {q.board_style_answer.stepwise_marking_scheme_breakdown}
                                                                    </ChemText>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* ── EXAMINER ANALYSIS ── */}
                                                {activeSection === 'analysis' && (
                                                    <motion.div
                                                        key="analysis"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="space-y-4"
                                                    >
                                                        {/* Why asked */}
                                                        {q.examiner_intent_analysis?.why_this_question_is_asked && (
                                                            <div className="bg-sky-500/[0.06] border border-sky-500/20 rounded-2xl p-5">
                                                                <h5 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                    Why This is Asked
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <ChemText>{q.examiner_intent_analysis.why_this_question_is_asked}</ChemText>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Common mistake */}
                                                        {q.examiner_intent_analysis?.common_student_mistake && (
                                                            <div className="bg-rose-500/[0.04] border border-rose-500/15 rounded-2xl p-5">
                                                                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                    </svg>
                                                                    Common Student Mistake
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <ChemText>{q.examiner_intent_analysis.common_student_mistake}</ChemText>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Trap zone */}
                                                        {q.examiner_intent_analysis?.trap_zone && q.examiner_intent_analysis.trap_zone !== 'N/A' && (
                                                            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5">
                                                                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                                    </svg>
                                                                    Trap Zone ⚠️
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <ChemText>{q.examiner_intent_analysis.trap_zone}</ChemText>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── NAVIGATION ── */}
            <div className="flex items-center justify-between mt-8">
                <motion.button
                    whileHover={{ x: -2 }}
                    onClick={() => navigate(-1)}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm text-white/50 hover:text-white hover:bg-white/[0.05] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/50 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </motion.button>

                <div className="hidden md:block text-center">
                    <p className="text-xs text-white/20">Use ← → keys to navigate</p>
                </div>

                <motion.button
                    whileHover={{ x: 2 }}
                    onClick={() => navigate(1)}
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-teal-600/80 to-cyan-600/80 hover:from-teal-500 hover:to-cyan-500 text-white disabled:opacity-25 transition-all duration-200 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.35)]"
                >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>

            {/* ── BOTTOM NOTE ── */}
            <p className="text-center text-white/15 text-xs mt-10 font-medium tracking-wide">
                For MCQs, click an option to reveal the answer instantly. For subjective questions, attempt first — then reveal.
            </p>
        </div>
    );
};

export default PYQQuizMode;
