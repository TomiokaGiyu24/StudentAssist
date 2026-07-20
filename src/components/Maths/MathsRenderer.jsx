import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, BookOpen, BarChart3, Layers, GraduationCap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import FormulaCanvas from './FormulaCanvas';
import WeightageCanvas from './WeightageCanvas';
import MathsPYQQuizMode from './MathsPYQQuizMode';
import NCERTCanvas from './NCERTCanvas';

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 60 : -60,
        opacity: 0,
    })
};

const quickTransition = {
    x: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    opacity: { duration: 0.18 },
};

const TABS = [
    { id: 'formulas', label: 'Formulas', icon: BookOpen },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'ncert', label: 'NCERT', icon: GraduationCap },
    { id: 'pyqs', label: 'PYQ Quiz', icon: Layers },
];

const MathsRenderer = ({ content, hasPyqs, pyqLoading, pyqContent }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [activeTab, setActiveTab] = useState('formulas');
    const navigate = useNavigate();
    const { subjectId } = useParams();

    if (!content) return null;

    // ── Separate formula items from analysis / ncert data ──
    const { pureFormulas, weightageData, standardResults, hasAnalysis, trendAnalysis, ncertQuestions } = useMemo(() => {
        const allFormulas = content.formulas || [];
        const pure = [];
        let weightage = null;
        let results = [];
        let trend = null;
        let ncertQs = [];

        allFormulas.forEach(item => {
            if (item.standard_results || item.trend_analysis || item.high_leverage_ncert_questions) {
                if (item.standard_results) results = item.standard_results;
                if (item.trend_analysis) trend = item.trend_analysis;
                if (item.high_leverage_ncert_questions) ncertQs = item.high_leverage_ncert_questions;
            } else if (item.formula_number !== undefined) {
                pure.push(item);
            }
        });

        return {
            pureFormulas: pure,
            weightageData: weightage,
            standardResults: results,
            hasAnalysis: weightage !== null || results.length > 0,
            trendAnalysis: trend,
            ncertQuestions: ncertQs,
        };
    }, [content.formulas]);

    const formulas = pureFormulas;
    const chapterName = content.chapter_name || 'Mathematics';

    const handleNext = () => {
        if (page < formulas.length - 1) setPage([page + 1, 1]);
    };

    const handlePrev = () => {
        if (page > 0) setPage([page - 1, -1]);
    };

    const goToFormula = (index) => {
        setPage([index, index > page ? 1 : -1]);
    };

    // Keyboard support
    React.useEffect(() => {
        if (activeTab !== 'formulas') return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [page, formulas.length, activeTab]);

    const progress = formulas.length > 0 ? ((page + 1) / formulas.length) * 100 : 0;

    // Available tabs — only show tabs when their data exists
    const hasPYQData = !!pyqContent?.questions?.length;
    const hasNCERTData = trendAnalysis !== null || ncertQuestions.length > 0;
    const availableTabs = TABS.filter(t => {
        if (t.id === 'analysis') return hasAnalysis;
        if (t.id === 'ncert') return hasNCERTData;
        if (t.id === 'pyqs') return hasPYQData || hasPyqs;
        return true;
    });

    return (
        <div className="w-full relative min-h-screen flex flex-col bg-[#050510] overflow-x-hidden">

            {/* ── ANIMATED BACKGROUND ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <style>{`
                    @keyframes meshBgShift {
                        0%, 100% { background-position: 0% 0%; }
                        25% { background-position: 100% 0%; }
                        50% { background-position: 100% 100%; }
                        75% { background-position: 0% 100%; }
                    }
                    @keyframes orbFloat1 {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(100px, -80px) scale(1.1); }
                        66% { transform: translate(-50px, 60px) scale(0.95); }
                    }
                    @keyframes orbFloat2 {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(-80px, 100px) scale(1.15); }
                    }
                    @keyframes orbFloat3 {
                        0%, 100% { transform: translate(0, 0) scale(0.95); }
                        40% { transform: translate(120px, 40px) scale(1.1); }
                        80% { transform: translate(-40px, -60px) scale(1); }
                    }
                    @keyframes gridBreathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                `}</style>

                {/* Animated gradient base — visible color shifts */}
                <div className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #12062e 0%, #1a0a3e 20%, #0e0620 40%, #200e3d 60%, #150930 80%, #0e0620 100%)',
                        backgroundSize: '300% 300%',
                        animation: 'meshBgShift 20s ease-in-out infinite',
                    }}></div>

                {/* Large floating orbs — warm violet/fuchsia/rose — HIGH opacity */}
                <div className="absolute top-[-15%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full"
                    style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0) 65%)', animation: 'orbFloat1 22s ease-in-out infinite' }}></div>
                <div className="absolute bottom-[-20%] right-[-15%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full"
                    style={{ background: 'radial-gradient(circle at center, rgba(217,70,239,0.30) 0%, rgba(217,70,239,0) 65%)', animation: 'orbFloat2 26s ease-in-out infinite' }}></div>
                <div className="absolute top-[25%] left-[35%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full"
                    style={{ background: 'radial-gradient(circle at center, rgba(244,114,182,0.20) 0%, rgba(244,114,182,0) 65%)', animation: 'orbFloat3 18s ease-in-out infinite' }}></div>

                {/* SVG wireframe grid — visible */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
                    style={{ animation: 'gridBreathe 8s ease-in-out infinite' }}>
                    <defs>
                        <pattern id="bgGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#bgGrid)" />
                </svg>

                {/* Fine dot accent grid */}
                <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            </div>

            {/* ── PROGRESS BAR (formulas tab only) ── */}
            {activeTab === 'formulas' && (
                <div className="fixed top-0 left-0 w-full h-[3px] bg-white/[0.03] z-50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                </div>
            )}

            {/* ── HEADER ── */}
            <div className="relative z-40 pt-20 pb-4 px-6 sm:px-10 lg:px-16">
                <div className="flex items-center justify-between">
                    {/* Left — Back + Chapter Name */}
                    <div className="flex items-center gap-5 min-w-0">
                        <button
                            onClick={() => navigate(`/subjects/${subjectId}/chapters`)}
                            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-white/60" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-white font-bold text-xl sm:text-2xl truncate tracking-tight">{chapterName}</h1>
                            <p className="text-white/30 text-xs font-medium tracking-wide mt-0.5">{content.board} · Class {content.class}</p>
                        </div>
                    </div>

                    {/* Right — Navigation (formulas tab only) */}
                    {activeTab === 'formulas' && (
                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                onClick={handlePrev}
                                disabled={page === 0}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${page === 0
                                    ? 'border-white/[0.04] text-white/10 cursor-not-allowed'
                                    : 'border-white/[0.1] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15'
                                    }`}
                            >
                                <ChevronLeft className="w-4.5 h-4.5" />
                            </button>

                            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl min-w-[70px] justify-center">
                                <span className="text-white font-bold text-sm tabular-nums">{page + 1}</span>
                                <span className="text-white/20 text-xs">/</span>
                                <span className="text-white/40 text-sm tabular-nums">{formulas.length}</span>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={page === formulas.length - 1}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${page === formulas.length - 1
                                    ? 'border-white/[0.04] text-white/10 cursor-not-allowed'
                                    : 'border-white/[0.1] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15'
                                    }`}
                            >
                                <ChevronRight className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── TAB BAR ── */}
                {availableTabs.length > 1 && (
                    <div className="mt-6 flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
                        {availableTabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'text-white'
                                        : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="mathsTabIndicator"
                                            className="absolute inset-0 bg-white/[0.08] border border-white/[0.1] rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Formula Indicators (formulas tab only) */}
                {activeTab === 'formulas' && formulas.length <= 30 && (
                    <div className="mt-5 flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                        {formulas.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => goToFormula(i)}
                                className={`shrink-0 rounded-full transition-all duration-400 ${i === page
                                    ? 'w-8 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                    : i < page
                                        ? 'w-2.5 h-1.5 bg-violet-500/30 hover:bg-violet-500/50'
                                        : 'w-2.5 h-1.5 bg-white/[0.06] hover:bg-white/15'
                                    }`}
                                aria-label={`Go to formula ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 w-full relative">

                {/* FORMULAS TAB */}
                {activeTab === 'formulas' && (
                    formulas.length > 0 ? (
                        <div className="w-full px-6 sm:px-10 lg:px-16 py-6 pb-20">
                            <div className="relative w-full overflow-hidden">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div
                                        key={page}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={quickTransition}
                                        className="w-full will-change-[transform,opacity]"
                                    >
                                        <FormulaCanvas
                                            formula={formulas[page]}
                                            index={page}
                                            total={formulas.length}
                                            onNext={handleNext}
                                            onPrev={handlePrev}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-28 relative z-10">
                            <div className="relative">
                                <div className="w-28 h-28 bg-gradient-to-br from-violet-500/15 to-blue-500/15 rounded-3xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
                                    <span className="text-5xl text-white/80">∑</span>
                                </div>
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-2xl -z-10"></div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mt-8 mb-3 tracking-tight">Coming Soon</h2>
                            <p className="text-white/40 max-w-md text-[15px] leading-relaxed">Formulas and strategies for {chapterName} are being meticulously crafted.</p>
                        </div>
                    )
                )}

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                    <div className="w-full px-6 sm:px-10 lg:px-16 py-8 pb-20">
                        <WeightageCanvas
                            weightageData={weightageData}
                            standardResults={standardResults}
                        />
                    </div>
                )}

                {/* NCERT TAB */}
                {activeTab === 'ncert' && (
                    <div className="w-full px-6 sm:px-10 lg:px-16 py-8 pb-20">
                        <NCERTCanvas
                            trendAnalysis={trendAnalysis}
                            questions={ncertQuestions}
                        />
                    </div>
                )}

                {/* PYQ QUIZ TAB */}
                {activeTab === 'pyqs' && (
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                        {pyqLoading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <div className="w-12 h-12 rounded-2xl border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin mb-6" />
                                <p className="text-white/30 text-sm font-medium">Loading questions...</p>
                            </div>
                        ) : pyqContent?.questions?.length ? (
                            <MathsPYQQuizMode pyqContent={pyqContent} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center text-5xl mb-6 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                                    ∫
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">PYQs Coming Soon</h3>
                                <p className="text-white/30 text-sm max-w-xs leading-relaxed">Previous year questions for this chapter are being meticulously prepared.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MathsRenderer;
