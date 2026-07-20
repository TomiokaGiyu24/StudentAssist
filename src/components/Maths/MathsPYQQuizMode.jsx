import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath } from 'react-katex';

// ── LaTeX Renderer ──────────────────────────────────────────────────────────
// Handles $$ ... $$ block math, $ ... $ inline math, and plain text segments
const LatexText = ({ children, className = '' }) => {
    if (!children || typeof children !== 'string') return <span className={className}>{children}</span>;

    // Replace escaped newlines written as literal \n in JSON strings
    const normalised = children.replace(/\\n/g, '\n');

    // Split by $$ (block) first, then $ (inline)
    const segments = normalised.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

    return (
        <span className={className}>
            {segments.map((seg, i) => {
                if (seg.startsWith('$$') && seg.endsWith('$$')) {
                    const math = seg.slice(2, -2).trim();
                    // Render inline — $$ in this JSON is always mid-sentence, never standalone
                    return (
                        <InlineMath key={i} math={math} renderError={() => <code className="text-violet-300 text-sm">{math}</code>} />
                    );
                }
                if (seg.startsWith('$') && seg.endsWith('$')) {
                    const math = seg.slice(1, -1).trim();
                    return (
                        <InlineMath key={i} math={math} renderError={() => <code className="text-violet-300 text-sm">{math}</code>} />
                    );
                }
                // Plain text — preserve line breaks
                return seg.split('\n').map((line, j, arr) => (
                    <React.Fragment key={`${i}-${j}`}>
                        {line}
                        {j < arr.length - 1 && <br />}
                    </React.Fragment>
                ));
            })}
        </span>
    );
};

// ── Badge helpers ────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
    'Easy': { label: 'Easy', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400' },
    'Moderate': { label: 'Moderate', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400', dot: 'bg-amber-400' },
    'Hard': { label: 'Hard', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400', dot: 'bg-rose-400' },
    'Board-Tricky': { label: 'Board Tricky ⚡', color: 'from-fuchsia-500/20 to-violet-600/10 border-fuchsia-500/30 text-fuchsia-400', dot: 'bg-fuchsia-400' },
};

const TYPE_CONFIG = {
    'MCQ': { label: 'MCQ', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
    'Assertion Reason': { label: 'Assertion Reason', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
    '1_mark': { label: '1 Mark', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25' },
    '2_mark': { label: '2 Marks', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
    '3_mark': { label: '3 Marks', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
    '5_mark': { label: '5 Marks', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
    'case_based': { label: 'Case Based', color: 'text-orange-400 bg-orange-500/10 border-orange-500/25' },
};

const formatTime = (s) => {
    const seconds = parseInt(s, 10);
    if (isNaN(seconds)) return null;
    return seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;
};

// ── Solution Steps Renderer ──────────────────────────────────────────────────
const SolutionStep = ({ stepKey, stepText, index }) => {
    const stepNumber = parseInt(stepKey.replace('step_', ''), 10);
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            className="flex gap-4 group"
        >
            {/* Step number bubble */}
            <div className="shrink-0 mt-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 group-hover:from-violet-500/50 group-hover:to-fuchsia-500/40 transition-all duration-300">
                    {stepNumber}
                </div>
            </div>
            {/* Step content */}
            <div className="flex-1 pb-5 border-b border-white/[0.04] last:border-0">
                <p className="text-[15px] text-white/80 leading-relaxed">
                    <LatexText>{stepText}</LatexText>
                </p>
            </div>
        </motion.div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MathsPYQQuizMode = ({ pyqContent }) => {
    const questions = pyqContent?.questions || [];
    const meta = {
        chapter: pyqContent?.chapter_name,
        board: pyqContent?.board,
        class: pyqContent?.class,
        yearRange: pyqContent?.pyq_year_range,
        total: pyqContent?.total_questions_generated,
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);   // the text of the selected option
    const [isRevealed, setIsRevealed] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [activeSection, setActiveSection] = useState('solution'); // 'solution' | 'tips' | 'mistakes'
    const [attemptedMap, setAttemptedMap] = useState({});          // questionId → 'correct'|'wrong'|'revealed'

    // Reset per-question state when navigating
    useEffect(() => {
        setSelectedOption(null);
        setIsRevealed(false);
        setShowSolution(false);
        setActiveSection('solution');
    }, [currentIndex]);

    const q = questions[currentIndex];

    const isMCQ = q?.question_type === 'MCQ' || q?.question_type === 'Assertion Reason';
    const options = isMCQ ? (q?.options || []) : [];
    const correctAnswer = q?.correct_answer || '';
    const diffCfg = DIFFICULTY_CONFIG[q?.difficulty_level] || DIFFICULTY_CONFIG['Easy'];
    const typeCfg = TYPE_CONFIG[q?.question_type] || { label: q?.question_type, color: 'text-stone-400 bg-stone-500/10 border-stone-500/25' };

    // Solution steps from topper_solution object
    const solutionSteps = q?.topper_solution
        ? Object.entries(q.topper_solution).sort(([a], [b]) => {
            const na = parseInt(a.replace('step_', ''), 10);
            const nb = parseInt(b.replace('step_', ''), 10);
            return na - nb;
        })
        : [];

    const handleOptionClick = (optionText) => {
        if (isRevealed) return;
        const isCorrect = optionText === correctAnswer;
        setSelectedOption(optionText);
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
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-6">∫</div>
                <p className="text-lg font-medium">No PYQ questions available yet.</p>
            </div>
        );
    }

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const correctCount = Object.values(attemptedMap).filter(v => v === 'correct').length;
    const attemptedCount = Object.keys(attemptedMap).length;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-24 dark-katex">

            {/* ── TOP HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-violet-400 text-xs font-semibold uppercase tracking-widest">PYQ Challenge</span>
                        <span className="text-white/10">·</span>
                        <span className="text-white/30 text-xs">{meta.board} Class {meta.class}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{meta.chapter}</h2>
                    <p className="text-white/30 text-sm mt-0.5">{meta.yearRange} · {meta.total} Questions</p>
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
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
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
                                    ? 'w-6 h-2 bg-gradient-to-r from-violet-400 to-fuchsia-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
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
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-pink-500/10 blur-xl pointer-events-none" />

                    <div className="relative bg-gradient-to-br from-[#0f0f1e] to-[#0a0a18] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
                        {/* Card top accent line */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 opacity-60" />

                        <div className="p-6 md:p-10">
                            {/* ── METADATA BADGES ── */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {/* Question number */}
                                <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                                    Q{q.question_id}
                                </span>

                                {/* Type badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeCfg.color}`}>
                                    {typeCfg.label}
                                </span>

                                {/* Difficulty badge */}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r border ${diffCfg.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                                    {diffCfg.label}
                                </span>

                                {/* Concept tested */}
                                {q.concept_tested && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.07] text-white/40">
                                        {q.concept_tested}
                                    </span>
                                )}

                                {/* Time */}
                                {q.time_to_solve_seconds && (
                                    <span className="ml-auto flex items-center gap-1.5 text-xs text-white/25 font-medium">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatTime(q.time_to_solve_seconds)}
                                    </span>
                                )}
                            </div>

                            {/* ── QUESTION TEXT ── */}
                            <div className="mb-8 text-[17px] md:text-[19px] text-white/90 leading-relaxed font-[450] tracking-[-0.01em]">
                                <LatexText>{q.question_text}</LatexText>
                            </div>

                            {/* ── MCQ OPTIONS ── */}
                            {isMCQ && options.length > 0 && (
                                <div className="space-y-3 mb-8">
                                    {options.map((optionText, idx) => {
                                        const letter = String.fromCharCode(65 + idx); // A, B, C, D
                                        const isSelected = selectedOption === optionText;
                                        const isCorrect = optionText === correctAnswer;

                                        let containerStyle = 'border-white/[0.08] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5';
                                        let letterStyle = 'border-white/10 text-white/30 group-hover:border-violet-500/40 group-hover:text-white/60';
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
                                            containerStyle = 'border-violet-500/60 bg-violet-500/10';
                                            letterStyle = 'border-violet-500 bg-violet-500 text-white';
                                            textStyle = 'text-violet-100';
                                        }

                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={!isRevealed ? { scale: 1.01 } : {}}
                                                whileTap={!isRevealed ? { scale: 0.99 } : {}}
                                                onClick={() => handleOptionClick(optionText)}
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
                                                    ) : letter}
                                                </div>
                                                {/* Option text */}
                                                <span className={`pt-0.5 text-sm leading-relaxed transition-colors duration-200 ${textStyle}`}>
                                                    <LatexText>{optionText}</LatexText>
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
                                        {/* Button gradient bg */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.55)] transition-shadow duration-300" />
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

                            {/* ── REVEALED SECTION: CORRECT ANSWER + SOLUTION ── */}
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

                                            {/* ── CORRECT ANSWER BANNER ── */}
                                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/25">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Correct Answer</p>
                                                    <div className="text-white/90 text-[15px] leading-relaxed">
                                                        <LatexText>{correctAnswer}</LatexText>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── SUB-SECTION TABS ── */}
                                            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 w-fit overflow-x-auto">
                                                {[
                                                    { id: 'solution', label: '📐 Topper Solution' },
                                                    { id: 'tips', label: '🎯 Board Tips' },
                                                    { id: 'mistakes', label: '⚠️ Common Mistakes' },
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
                                                                layoutId="mathsPyqSubTab"
                                                                className="absolute inset-0 bg-white/[0.07] border border-white/[0.1] rounded-xl"
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                            />
                                                        )}
                                                        <span className="relative z-10">{tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* ── SOLUTION STEPS ── */}
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
                                                        {/* Faint violet left bar */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-500 via-fuchsia-500 to-pink-500 opacity-60 rounded-l-2xl" />

                                                        <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-6 ml-4 flex items-center gap-2">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                            Step-by-Step Topper Solution
                                                        </h4>

                                                        <div className="ml-4 space-y-1">
                                                            {solutionSteps.length > 0 ? (
                                                                solutionSteps.map(([key, text], i) => (
                                                                    <SolutionStep key={key} stepKey={key} stepText={text} index={i} />
                                                                ))
                                                            ) : (
                                                                <p className="text-white/30 text-sm">Solution not available.</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* ── BOARD TIPS ── */}
                                                {activeSection === 'tips' && (
                                                    <motion.div
                                                        key="tips"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="space-y-4"
                                                    >
                                                        {/* Board Presentation Tip */}
                                                        {q.board_presentation_tip && (
                                                            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-6">
                                                                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                    </svg>
                                                                    Board Presentation Tip
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <LatexText>{q.board_presentation_tip}</LatexText>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Concept Trigger */}
                                                        {q.concept_trigger && (
                                                            <div className="bg-sky-500/[0.06] border border-sky-500/20 rounded-2xl p-6">
                                                                <h5 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                    Concept Trigger
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <LatexText>{q.concept_trigger}</LatexText>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Examiner Intent */}
                                                        {q.examiner_intent && (
                                                            <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-2xl p-6">
                                                                <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    Examiner's Intent
                                                                </h5>
                                                                <p className="text-[14px] text-white/75 leading-relaxed">
                                                                    <LatexText>{q.examiner_intent}</LatexText>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* ── COMMON MISTAKES ── */}
                                                {activeSection === 'mistakes' && (
                                                    <motion.div
                                                        key="mistakes"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="bg-rose-500/[0.04] border border-rose-500/15 rounded-2xl p-6"
                                                    >
                                                        <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            Common Student Mistakes
                                                        </h5>
                                                        {q.common_student_mistakes && q.common_student_mistakes.length > 0 ? (
                                                            <ul className="space-y-3">
                                                                {q.common_student_mistakes.map((mistake, i) => (
                                                                    <motion.li
                                                                        key={i}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: i * 0.08 }}
                                                                        className="flex items-start gap-3 text-[14px] text-white/70 leading-relaxed"
                                                                    >
                                                                        <span className="shrink-0 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-[10px] font-bold mt-0.5">
                                                                            {i + 1}
                                                                        </span>
                                                                        <LatexText>{mistake}</LatexText>
                                                                    </motion.li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-white/30 text-sm">No common mistakes documented.</p>
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
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 hover:from-violet-500 hover:to-fuchsia-500 text-white disabled:opacity-25 transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]"
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

export default MathsPYQQuizMode;
