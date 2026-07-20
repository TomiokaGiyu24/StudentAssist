import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDerivationsContent, loadChapterContent, getChapterFileSlug } from '../utils/contentLoader';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import LatexText from '../components/LatexText';

// ==========================================
// UNIFIED DATA ADAPTER LAYER
// Normalizes legacy and new JSON formats
// ==========================================
const normalizeDerivationsData = (data) => {
    if (!data) return [];

    // CASE 1: New JSON format (Array of objects, each containing chapter_derivations)
    if (Array.isArray(data)) {
        return data.flatMap(item => item.chapter_derivations || []).map(deriv => {
            const rawTimeline = deriv.derivation_timeline || [];
            
            // Map timeline steps to standard internal step objects
            const steps = rawTimeline.map((step, idx) => ({
                step_number: step.step_number || (idx + 1),
                phase: step.phase || 'MATHEMATICAL_FORMULATION', // SETUP_AND_DIAGRAM, MATHEMATICAL_FORMULATION, ALGEBRAIC_SIMPLIFICATION, FINAL_EVALUATION
                paper_script: step.exact_board_text || step.paper_script || '',
                mathematical_line: (step.substitution_matrix?.algebraic_progression && step.substitution_matrix.algebraic_progression.length > 0)
                    ? step.substitution_matrix.algebraic_progression[step.substitution_matrix.algebraic_progression.length - 1]
                    : step.mathematical_line || '',
                trigger_keywords: step.score_trigger_keywords || step.trigger_keywords || [],
                embedded_diagram: step.step_diagram ? {
                    requires_diagram: step.step_diagram.has_inline_drawing || false,
                    diagram_id: step.step_diagram.diagram_id || '',
                    diagram_placement_note: step.step_diagram.drawing_instruction || '',
                    generation_prompt: step.step_diagram.generation_prompt || ''
                } : (step.embedded_diagram || {
                    requires_diagram: false,
                    diagram_id: '',
                    diagram_placement_note: '',
                    generation_prompt: ''
                })
            }));

            // Extract the final evaluation step for quick reference
            const finalStep = steps.find(s => s.phase === 'FINAL_EVALUATION') || steps[steps.length - 1];

            // Extract assumptions from the SETUP phase
            const assumptions = steps
                .filter(s => s.phase === 'SETUP_AND_DIAGRAM' && s.paper_script)
                .map(s => s.paper_script);

            return {
                id: deriv.derivation_id,
                title: deriv.meta?.derivation_title || 'Untitled Derivation',
                chapter_number: deriv.meta?.chapter_number,
                chapter_name: deriv.meta?.chapter_name,
                priority: deriv.meta?.cbse_frequency === 'HIGH' ? 'P1' : 'P2',
                priority_reason: `CBSE Occurrence Frequency: ${deriv.meta?.cbse_frequency || 'HIGH'}`,
                marks: deriv.meta?.total_marks || 3,
                historical_years: deriv.meta?.historical_occurrence_years || [],
                asked_stems: deriv.examiner_overview?.asked_as_stems || [],
                marking_distribution: deriv.examiner_overview?.marking_distribution || {},
                steps: steps,
                given_assumptions: assumptions.length > 0 ? assumptions : ["Uniform vacuum separation parameters", "Standard electrostatic constant formulations"],
                final_result: finalStep ? {
                    text: finalStep.paper_script,
                    latex: finalStep.mathematical_line
                } : null,
                examiner_notes: deriv.topper_scoring_notes || [],
                isNewFormat: true
            };
        });
    }

    // CASE 2: Legacy JSON format (Object with a derivations array)
    if (data.derivations && Array.isArray(data.derivations)) {
        return data.derivations.map(deriv => {
            const legacySteps = deriv.derivation?.steps || [];
            
            // Map legacy steps to new timeline phase structure
            const steps = legacySteps.map((step, idx) => {
                let phase = 'MATHEMATICAL_FORMULATION';
                if (idx === 0) phase = 'SETUP_AND_DIAGRAM';
                else if (idx === legacySteps.length - 1) phase = 'FINAL_EVALUATION';

                return {
                    step_number: idx + 1,
                    phase: phase,
                    paper_script: step.text || '',
                    mathematical_line: step.latex || '',
                    trigger_keywords: [],
                    embedded_diagram: {
                        requires_diagram: idx === 0 && !!deriv.diagram_required,
                        diagram_id: deriv.diagram_required ? `${deriv.id}-diag` : '',
                        diagram_placement_note: deriv.diagram_description || '',
                        generation_prompt: ''
                    }
                };
            });

            return {
                id: deriv.id,
                title: deriv.title || 'Untitled Derivation',
                chapter_number: null,
                chapter_name: data.meta?.chapter || '',
                priority: deriv.priority || 'P2',
                priority_reason: deriv.priority_reason || 'Core syllabus requirement',
                marks: deriv.marks || 3,
                historical_years: [],
                asked_stems: deriv.derivation?.question_forms || deriv.question_forms || [],
                marking_distribution: {},
                steps: steps,
                given_assumptions: deriv.derivation?.given_assumptions || ["Standard variables and physical parameters are assumed."],
                final_result: deriv.derivation?.final_result ? {
                    text: deriv.derivation.final_result.text || '',
                    latex: deriv.derivation.final_result.latex || ''
                } : null,
                examiner_notes: deriv.derivation?.examiner_notes || deriv.examiner_notes || [],
                image_path: deriv.image || deriv.image_path || null,
                isNewFormat: false
            };
        });
    }

    return [];
};

// ==========================================
// UTILITY: FORMAT LONG PARAGRAPHS INTO BULLET POINTS
// ==========================================
const formatScriptToPoints = (text) => {
    if (!text) return [];
    
    // Split sentences using negative lookbehind/lookahead for numbers and acronyms
    const sentences = text
        .split(/(?<!\d)(?<![A-Za-z]\.)(?<!\b[a-zA-Z]\b)\.\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return sentences.map(sentence => {
        if (!sentence.endsWith('.') && !sentence.endsWith('?') && !sentence.endsWith(':')) {
            return sentence + '.';
        }
        return sentence;
    });
};

// ==========================================
// UTILITY: FORMAT TOPPER TRAP NOTE
// Splits a paragraph: First sentence = core alert, rest = bullet points
// ==========================================
const formatTrapNote = (text) => {
    const points = formatScriptToPoints(text);
    if (points.length === 0) return { header: "Calculation Pitfall", bullets: [] };
    
    return {
        header: points[0],
        bullets: points.slice(1)
    };
};

// ==========================================
// MAIN COMPONENT DEFINITION
// ==========================================
const PhysicsDerivationsPage = () => {
    const { subjectId: paramSubjectId, chapterId } = useParams();
    const subjectId = paramSubjectId || 'physics';
    
    const [derivations, setDerivations] = useState([]);
    const [chapterInfo, setChapterInfo] = useState(null);
    const [selectedDerivation, setSelectedDerivation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Interactive Learning States
    const [activeTab, setActiveTab] = useState('timeline'); // timeline, onepage, insights
    const [recallHelperActive, setRecallHelperActive] = useState(false);
    const [revealedSteps, setRevealedSteps] = useState({}); // stepIndex -> bool
    const [lightboxImage, setLightboxImage] = useState(null); // stores image path for fullscreen modal
    
    const contentRef = useRef(null);

    // Fetch and Normalize Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await loadDerivationsContent(subjectId, chapterId);
                const normalized = normalizeDerivationsData(data);
                setDerivations(normalized);

                const chapterSlug = getChapterFileSlug(subjectId, chapterId);
                if (chapterSlug) {
                    const chapterData = await loadChapterContent(subjectId, chapterSlug);
                    setChapterInfo(chapterData?.meta);
                }

                if (normalized.length > 0) {
                    setSelectedDerivation(normalized[0]);
                }
            } catch (error) {
                console.error("Error loading content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, chapterId]);

    // Reset recall reveal states when active derivation changes
    useEffect(() => {
        setRevealedSteps({});
    }, [selectedDerivation]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-medium tracking-wide animate-pulse">Loading derivations...</p>
            </div>
        );
    }

    if (derivations.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl">📚</div>
                <h2 className="text-2xl text-white font-bold mb-4">No Derivations Found</h2>
                <p className="text-white/40 max-w-md mb-8">This chapter does not have any mathematical derivations mapped yet.</p>
                <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/30">
                    Go Back to Chapter
                </Link>
            </div>
        );
    }

    const currentDeriv = selectedDerivation || derivations[0];

    // Helper: Toggle individual recall step
    const toggleRevealStep = (idx) => {
        setRevealedSteps(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Helper: Map Phase to elegant color schemes
    const getPhaseBadgeStyle = (phase) => {
        switch (phase) {
            case 'SETUP_AND_DIAGRAM':
                return { bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400', label: '1. Setup & Context' };
            case 'MATHEMATICAL_FORMULATION':
                return { bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', label: '2. Mathematical Formulation' };
            case 'ALGEBRAIC_SIMPLIFICATION':
                return { bg: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400', label: '3. Algebraic Simplification' };
            case 'FINAL_EVALUATION':
                return { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: '4. Final Proof' };
            default:
                return { bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400', label: 'Derivation Step' };
        }
    };

    // Bullet-Point Icon Helper
    const getBulletIcon = (idx) => {
        const icons = ['✨', '⚡', '🔹', '👉'];
        return icons[idx % icons.length];
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Ambient visual background glow effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* MOBILE HEADER */}
            <div className="md:hidden p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-30 shrink-0 relative">
                <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    {chapterInfo?.chapter || "Derivations"}
                </span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-white"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* SIDEBAR NAVIGATION */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`
                            fixed inset-y-0 left-0 md:relative md:inset-auto z-40
                            w-[290px] md:w-[320px] lg:w-[360px] 
                            bg-slate-900/90 backdrop-blur-xl md:bg-slate-900/30 
                            border-r border-white/5 flex flex-col h-full shrink-0
                        `}
                    >
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-white/5 flex flex-col shrink-0">
                            <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider mb-6 group">
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Chapter
                            </Link>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                {chapterInfo?.chapter || "Derivations"}
                            </h1>
                            <p className="text-slate-500 text-xs font-medium mt-1">Mathematical Proofs & Derivations</p>
                        </div>

                        {/* Derivation Selection List */}
                        <div 
                            data-lenis-prevent 
                            className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar"
                        >
                            {derivations.map((deriv) => {
                                const isSelected = currentDeriv.id === deriv.id;
                                return (
                                    <button
                                        key={deriv.id}
                                        onClick={() => {
                                            setSelectedDerivation(deriv);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col gap-3 group border ${
                                            isSelected
                                                ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-950/40'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                deriv.priority === 'P1'
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                            }`}>
                                                {deriv.priority === 'P1' ? 'HIGH FREQ' : 'MEDIUM'}
                                            </span>
                                            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                                                {deriv.marks} Marks
                                            </span>
                                        </div>
                                        <h3 className={`font-semibold leading-snug transition-colors ${
                                            isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                        }`}>
                                            {deriv.title}
                                        </h3>
                                        {isSelected && (
                                            <motion.div
                                                layoutId="sidebarActiveGlow"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <main 
                ref={contentRef} 
                data-lenis-prevent
                className="flex-1 h-full overflow-y-auto relative custom-scrollbar flex flex-col z-10"
            >
                
                {/* Hero Dashboard Panel */}
                <div className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-8 flex-1 pb-32">
                    
                    {/* Top Row: Meta & Visual Information */}
                    <header className="relative bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm overflow-hidden flex flex-col gap-4 shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <span className="text-[140px] font-bold leading-none select-none">∫</span>
                        </div>

                        {/* Badges & Frequency */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Core {currentDeriv.marks}-Marker Proof
                            </div>
                            {currentDeriv.historical_years.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold">
                                    📜 Board Exam Target
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
                            {currentDeriv.title}
                        </h2>

                        {/* Occurrence Chips */}
                        {currentDeriv.historical_years.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 mt-2">
                                <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider">Exam Appearances:</span>
                                {currentDeriv.historical_years.map((year, idx) => (
                                    <span key={idx} className="text-xs bg-slate-800 border border-slate-700/50 px-2.5 py-0.5 rounded-lg text-slate-300 font-semibold shadow-sm hover:scale-105 transition-transform">
                                        {year}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Navigation Tabs Bar & Interactive Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
                        {/* Segmented Control Tabs */}
                        <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 flex gap-1 self-start relative shadow-inner">
                            {[
                                { id: 'timeline', label: 'Timeline Derivation', icon: '⏳' },
                                { id: 'onepage', label: 'One-Page Summary', icon: '📄' },
                                { id: 'insights', label: 'Examiner Insights', icon: '🧠' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeWorkspaceTab"
                                            className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/35"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.icon} {tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Recall Helper Mode Switch */}
                        <button
                            onClick={() => setRecallHelperActive(!recallHelperActive)}
                            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 transition-all font-bold text-xs ${
                                recallHelperActive
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-950/20 animate-pulse'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span>🧠 Active Recall Mode</span>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${
                                recallHelperActive ? 'bg-amber-500' : 'bg-slate-700'
                            }`}>
                                <motion.div
                                    layout
                                    className="w-3 h-3 bg-white rounded-full shadow-md"
                                    animate={{ x: recallHelperActive ? 16 : 0 }}
                                />
                            </div>
                        </button>
                    </div>

                    {/* Active Recall Ribbon Warning */}
                    <AnimatePresence>
                        {recallHelperActive && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3"
                            >
                                <span className="text-xl">✨</span>
                                <div className="text-xs text-amber-300/90 leading-relaxed font-medium">
                                    <strong className="text-white block mb-0.5">Active Recall Mode Activated!</strong>
                                    Mathematical equations are blurred or hidden below. Read the step's explanation script, mentally verify the formula, and **click the equation box** to reveal the math line.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TABS CONTAINER WITH TRANSITIONS */}
                    <AnimatePresence mode="wait">
                        
                        {/* TAB 1: VISUAL TIMELINE */}
                        {activeTab === 'timeline' && (
                            <motion.div
                                key="timeline"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-8 relative"
                            >
                                {/* Vertical connection track */}
                                <div className="absolute left-6 md:left-12 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-slate-800 pointer-events-none hidden sm:block"></div>

                                {currentDeriv.steps.map((step, idx) => {
                                    const phase = getPhaseBadgeStyle(step.phase);
                                    const isRevealed = !recallHelperActive || revealedSteps[idx];
                                    const hasDiagram = step.embedded_diagram?.requires_diagram;
                                    const points = formatScriptToPoints(step.paper_script);

                                    return (
                                        <div key={idx} className="relative sm:pl-16 md:pl-28 flex flex-col gap-6">
                                            
                                            {/* Stepper Node (Left rail indicator) */}
                                            <div className="absolute left-3 md:left-9 w-6 h-6 rounded-full bg-slate-950 border-4 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-400 z-10 hidden sm:flex ring-4 ring-slate-900"></div>

                                            {/* Main Step Stepper Card */}
                                            <div className="bg-slate-900/40 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-900/60 rounded-3xl p-6 transition-all duration-300 shadow-lg group relative">
                                                
                                                {/* Phase and step number */}
                                                <div className="flex items-center justify-between gap-3 mb-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${phase.bg}`}>
                                                        {phase.label}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-500">Step {step.step_number}</span>
                                                </div>

                                                {/* Structured Explanation List (Instead of paragraph block) */}
                                                <div className="space-y-3 mb-6">
                                                    {points.map((sentence, sIdx) => (
                                                        <motion.div 
                                                            key={sIdx} 
                                                            whileHover={{ x: 2 }}
                                                            className="flex items-start gap-2.5 text-slate-200 text-sm leading-relaxed"
                                                        >
                                                            <span className="text-indigo-400 mt-1 text-xs shrink-0 select-none">
                                                                {getBulletIcon(sIdx)}
                                                            </span>
                                                            <span>
                                                                <LatexText text={sentence} />
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Interactive Diagram (If applicable) */}
                                                {hasDiagram && (
                                                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch border-t border-white/5 pt-6 mt-4">
                                                        {/* Schematic visual container */}
                                                        <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                                                            {currentDeriv.image_path ? (
                                                                <img
                                                                    src={currentDeriv.image_path}
                                                                    alt={currentDeriv.title}
                                                                    className="w-full max-h-48 object-contain cursor-pointer hover:scale-105 transition-transform"
                                                                    onClick={() => setLightboxImage(currentDeriv.image_path)}
                                                                />
                                                            ) : (
                                                                <div className="text-center p-6 flex flex-col items-center justify-center gap-2">
                                                                    <span className="text-3xl animate-bounce">📐</span>
                                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Laminated Board Schematic</span>
                                                                    <p className="text-[10px] text-slate-400 max-w-xs">{step.embedded_diagram.diagram_placement_note}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Vector Generation prompts details */}
                                                        <div className="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-4 flex flex-col justify-center text-xs">
                                                            <h5 className="text-indigo-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                                🎨 Board Layout Guidelines:
                                                            </h5>
                                                            <p className="text-slate-400 leading-relaxed italic">
                                                                "{step.embedded_diagram.generation_prompt || "Include symmetric charges separated by a 2a axis vector."}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Equation Container */}
                                                {step.mathematical_line && (
                                                    <div className="relative mt-2">
                                                        <AnimatePresence mode="wait">
                                                            {isRevealed ? (
                                                                <motion.div
                                                                    key="equation-revealed"
                                                                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                                                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="bg-slate-950/90 rounded-2xl p-6 border border-white/5 overflow-x-auto shadow-inner flex items-center justify-center relative group"
                                                                >
                                                                    <BlockMath math={step.mathematical_line} />
                                                                    
                                                                    {recallHelperActive && (
                                                                        <button
                                                                            onClick={() => toggleRevealStep(idx)}
                                                                            className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            Hide
                                                                        </button>
                                                                    )}
                                                                </motion.div>
                                                            ) : (
                                                                <motion.button
                                                                    key="equation-hidden"
                                                                    whileHover={{ scale: 1.01, borderColor: 'rgba(245,158,11,0.4)' }}
                                                                    onClick={() => toggleRevealStep(idx)}
                                                                    className="w-full bg-amber-500/5 hover:bg-amber-500/10 border border-dashed border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                                                                >
                                                                    <span className="text-lg">👁️</span>
                                                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Reveal Equation Line</span>
                                                                    <p className="text-[10px] text-slate-500">Solve mentally first, then click to confirm your mathematical steps.</p>
                                                                </motion.button>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}

                                                {/* Trigger Memory Keywords */}
                                                {step.trigger_keywords && step.trigger_keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {step.trigger_keywords.map((kw, kIdx) => (
                                                            <span key={kIdx} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                                                🔑 {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}

                            </motion.div>
                        )}

                        {/* TAB 2: ONE-PAGE SHEET */}
                        {activeTab === 'onepage' && (
                            <motion.div
                                key="onepage"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="bg-slate-900/25 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-sm space-y-10 shadow-2xl relative"
                            >
                                <div className="absolute top-4 right-4 text-xs font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                                    Sheet Summary
                                </div>

                                {/* Assumptions Box */}
                                <div className="bg-gradient-to-br from-indigo-950/10 to-indigo-900/5 border border-indigo-500/15 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 text-indigo-500/10 text-6xl font-bold select-none pointer-events-none">
                                        Assumptions
                                    </div>
                                    <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2 text-base">
                                        📌 Assumptions & Given Parameters
                                    </h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentDeriv.given_assumptions.map((item, idx) => (
                                            <li key={idx} className="text-slate-300 text-xs flex gap-2.5 items-start">
                                                <span className="text-indigo-500 font-bold">▶</span>
                                                <span><LatexText text={item} /></span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Unified Math flow list */}
                                <div className="space-y-6">
                                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5 pb-2">
                                        Derivation Flow Proof
                                    </h4>
                                    <div className="space-y-6">
                                        {currentDeriv.steps.map((step, idx) => {
                                            const points = formatScriptToPoints(step.paper_script);
                                            return (
                                                <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
                                                    <div className="lg:col-span-6 space-y-2">
                                                        <span className="text-[10px] font-bold text-indigo-400 tracking-wider">STEP {step.step_number}</span>
                                                        <div className="space-y-2">
                                                            {points.map((sentence, sIdx) => (
                                                                <div key={sIdx} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                                                                    <span className="text-indigo-400 mt-0.5 shrink-0 select-none">
                                                                        {getBulletIcon(sIdx)}
                                                                    </span>
                                                                    <span>
                                                                        <LatexText text={sentence} />
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-6 bg-slate-950/50 rounded-xl p-4 border border-white/5 flex items-center justify-center overflow-x-auto min-h-16">
                                                        <BlockMath math={step.mathematical_line || '0'} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Final Result Highlight Card */}
                                {currentDeriv.final_result && (
                                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                                        <h4 className="text-emerald-400 uppercase tracking-widest text-[10px] font-bold mb-4 flex items-center gap-2">
                                            <span className="w-8 h-px bg-emerald-500/30"></span>
                                            Final Expression
                                        </h4>
                                        <div className="scale-105 origin-left py-2 overflow-x-auto">
                                            <BlockMath math={currentDeriv.final_result.latex} />
                                        </div>
                                        <p className="text-emerald-300/80 text-sm mt-4 font-semibold border-t border-emerald-500/10 pt-4 leading-relaxed">
                                            <LatexText text={currentDeriv.final_result.text} />
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: EXAMINER INSIGHTS */}
                        {activeTab === 'insights' && (
                            <motion.div
                                key="insights"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                            >
                                {/* Left Side: CBSE Marking Scheme details (Grid 5 cols) */}
                                <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
                                    <div>
                                        <h4 className="text-white font-extrabold flex items-center gap-2 text-lg">
                                            🏆 CBSE Marking Scheme
                                        </h4>
                                        <p className="text-slate-500 text-xs mt-1">Official breakdown showing exactly where marks are awarded.</p>
                                    </div>

                                    {Object.keys(currentDeriv.marking_distribution).length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Beautiful Segmented Bar */}
                                            <div className="h-5 bg-slate-950 rounded-full overflow-hidden flex p-1 border border-white/5 shadow-inner">
                                                {Object.entries(currentDeriv.marking_distribution).map(([key, val], idx) => {
                                                    const color = idx === 0 ? 'bg-cyan-500 shadow-cyan-500/50' : idx === 1 ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-fuchsia-500 shadow-fuchsia-500/50';
                                                    const percentage = (val / currentDeriv.marks) * 100;
                                                    return (
                                                        <div
                                                            key={key}
                                                            style={{ width: `${percentage}%` }}
                                                            className={`h-full first:rounded-l-full last:rounded-r-full shadow-lg ${color}`}
                                                        />
                                                    );
                                                })}
                                            </div>

                                            {/* Details mapped strictly as Bullet checklist items */}
                                            <div className="space-y-4">
                                                {Object.entries(currentDeriv.marking_distribution).map(([key, val], idx) => {
                                                    const border = idx === 0 ? 'border-cyan-500/20' : idx === 1 ? 'border-indigo-500/20' : 'border-fuchsia-500/20';
                                                    const icon = idx === 0 ? '📐' : idx === 1 ? '✍️' : '🎯';
                                                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                                                    const guidelines = 
                                                        idx === 0 ? [
                                                            "Core definitions and statements are fully required.",
                                                            "A fully labeled schematic diagram with coordinates must be present.",
                                                            "Coordinate systems, separation vectors (2a), and targets (P) must match."
                                                        ] : idx === 1 ? [
                                                            "Integration bounds and substitutions must be mapped sequentially.",
                                                            "Common constants extraction must follow algebra progression.",
                                                            "Trigonometric or fractional coordinate factoring must be mathematically shown."
                                                        ] : [
                                                            "Final unapproximated formula forms must be highlighted.",
                                                            "Short dipole or distance limits (e.g., r >> a) must be written.",
                                                            "Vector alignments and physical direction justifications are mandatory."
                                                        ];

                                                    return (
                                                        <div key={key} className={`bg-slate-950/40 p-5 border rounded-2xl ${border} space-y-3`}>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                                    <span>{icon}</span> {label}
                                                                </span>
                                                                <span className="text-[10px] bg-slate-900 border border-white/5 px-2.5 py-0.5 rounded-full text-indigo-400 font-bold">
                                                                    +{val} Marks
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1.5 pt-1">
                                                                {guidelines.map((g, gIdx) => (
                                                                    <div key={gIdx} className="text-[11px] text-slate-400 flex items-start gap-2">
                                                                        <span className="text-indigo-500 mt-0.5 shrink-0">✔</span>
                                                                        <span>{g}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2">
                                            <span className="text-2xl block">📈</span>
                                            <p className="text-xs text-slate-400">Score distribution parameters are evaluated dynamically according to CBSE marking codes.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Exam Stems and Pitfalls (Grid 7 cols) */}
                                <div className="lg:col-span-7 space-y-8">
                                    
                                    {/* Asked Stems Component */}
                                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-4">
                                        <h4 className="text-cyan-400 font-bold flex items-center gap-2 text-base">
                                            ❓ Asked as Exam Stems
                                        </h4>
                                        <p className="text-slate-500 text-xs">Variations of how this proof question is presented on exam sheets.</p>
                                        
                                        <div className="space-y-3 pt-2">
                                            {currentDeriv.asked_stems.map((stem, idx) => {
                                                const points = formatScriptToPoints(stem);
                                                return (
                                                    <div key={idx} className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                Formulation {idx + 1}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {points.map((p, pIdx) => (
                                                                <div key={pIdx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed font-medium">
                                                                    <span className="text-cyan-500 mt-1 text-[8px] shrink-0 select-none">🔷</span>
                                                                    <span>
                                                                        <LatexText text={p} />
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Topper Traps and Pitfalls Warnings */}
                                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-4">
                                        <h4 className="text-rose-400 font-bold flex items-center gap-2 text-base">
                                            ⚠️ Topper Traps & Pitfalls
                                        </h4>
                                        <p className="text-slate-500 text-xs">Critical examiner feedback detailing where high-scoring students fail.</p>
                                        
                                        <div className="space-y-4 pt-2">
                                            {currentDeriv.examiner_notes.map((note, idx) => {
                                                const trap = formatTrapNote(note);
                                                
                                                // Dynamic colors for cards
                                                let cardStyle = "bg-rose-950/10 border-rose-500/10";
                                                let tag = "CALCULATION WARNING";
                                                let tagStyle = "bg-rose-950/50 text-rose-400 border-rose-800/20";
                                                let bulletIcon = "❌";

                                                if (trap.header.includes("MANDATORY")) {
                                                    cardStyle = "bg-amber-950/10 border-amber-500/10";
                                                    tag = "MANDATORY REQUISITE";
                                                    tagStyle = "bg-amber-950/50 text-amber-400 border-amber-800/20";
                                                    bulletIcon = "⚡";
                                                } else if (trap.header.includes("CONVERSION") || trap.header.includes("coordinate")) {
                                                    cardStyle = "bg-orange-950/10 border-orange-500/10";
                                                    tag = "UNITS & SCALE BOUNDARY";
                                                    tagStyle = "bg-orange-950/50 text-orange-400 border-orange-800/20";
                                                    bulletIcon = "🔺";
                                                }

                                                return (
                                                    <div key={idx} className={`p-5 border rounded-2xl ${cardStyle} space-y-3 hover:scale-[1.01] transition-transform`}>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded uppercase tracking-wider ${tagStyle}`}>
                                                                {tag}
                                                            </span>
                                                        </div>
                                                        <h5 className="text-sm font-bold text-slate-100 leading-snug">
                                                            <LatexText text={trap.header} />
                                                        </h5>
                                                        {trap.bullets.length > 0 && (
                                                            <div className="space-y-1.5 border-t border-white/5 pt-2.5">
                                                                {trap.bullets.map((b, bIdx) => (
                                                                    <div key={bIdx} className="text-xs text-slate-350 flex items-start gap-2.5 leading-relaxed">
                                                                        <span className="mt-0.5 shrink-0 text-xs select-none">{bulletIcon}</span>
                                                                        <span>
                                                                            <LatexText text={b} />
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                </div>

            </main>

            {/* FULLSCREEN LIGHTBOX FOR VISUAL DIAGRAMS */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={lightboxImage}
                            alt="Visual Diagram Fullscreen"
                            className="max-w-full max-h-full object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PhysicsDerivationsPage;
