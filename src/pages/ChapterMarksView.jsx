import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    BookOpen, Brain, Award, GraduationCap, Zap, ChevronRight, 
    Activity, Percent, ArrowLeft, ShieldAlert, Target, 
    CheckCircle2, Sparkles, FileText, Compass
} from 'lucide-react';
import { subjects, chapters, chapterMarksData, defaultChapterData } from '../data/mockData';
import { hasNotesAvailable, loadChapterContent, getChapterFileSlug, hasGraphsAvailable } from '../utils/contentLoader';

function ChapterMarksView() {
    const { subjectId, chapterId } = useParams();

    const subject = subjects.find(s => s.id === subjectId);
    const subjectChapters = chapters[subjectId] || [];
    const chapter = subjectChapters.find(c => c.id === chapterId);

    // Check if AI-generated notes are available
    const notesAvailable = hasNotesAvailable(subjectId, chapterId);

    // Futuristic Cyber-Neon Accents
    const subjectGradients = {
        physics: {
            primary: 'from-cyan-500 to-indigo-500',
            light: 'from-cyan-500/10 to-indigo-500/10',
            accent: 'text-cyan-400',
            accentBg: 'bg-cyan-500/10',
            accentBorder: 'border-cyan-500/20',
            shadow: 'shadow-cyan-500/10',
            border: 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
            bullet: 'bg-cyan-400',
            glow: 'rgba(6, 182, 212, 0.2)'
        },
        chemistry: {
            primary: 'from-emerald-400 to-teal-500',
            light: 'from-emerald-400/10 to-teal-500/10',
            accent: 'text-emerald-400',
            accentBg: 'bg-emerald-500/10',
            accentBorder: 'border-emerald-500/20',
            shadow: 'shadow-emerald-500/10',
            border: 'hover:border-emerald-400/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
            bullet: 'bg-emerald-400',
            glow: 'rgba(52, 211, 153, 0.2)'
        },
        mathematics: {
            primary: 'from-pink-500 to-rose-500',
            light: 'from-pink-500/10 to-rose-500/10',
            accent: 'text-pink-400',
            accentBg: 'bg-pink-500/10',
            accentBorder: 'border-pink-500/20',
            shadow: 'shadow-pink-500/10',
            border: 'hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
            bullet: 'bg-pink-400',
            glow: 'rgba(244, 63, 94, 0.2)'
        },
        biology: {
            primary: 'from-green-400 to-lime-500',
            light: 'from-green-400/10 to-lime-500/10',
            accent: 'text-green-400',
            accentBg: 'bg-green-500/10',
            accentBorder: 'border-green-500/20',
            shadow: 'shadow-green-500/10',
            border: 'hover:border-green-400/30 hover:shadow-[0_0_20px_rgba(74,222,128,0.15)]',
            bullet: 'bg-green-400',
            glow: 'rgba(74, 222, 128, 0.2)'
        },
        'physical-education': {
            primary: 'from-amber-400 to-orange-500',
            light: 'from-amber-400/10 to-orange-500/10',
            accent: 'text-amber-400',
            accentBg: 'bg-amber-500/10',
            accentBorder: 'border-amber-500/20',
            shadow: 'shadow-amber-500/10',
            border: 'hover:border-amber-400/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            bullet: 'bg-amber-400',
            glow: 'rgba(245, 158, 11, 0.2)'
        },
        english: {
            primary: 'from-rose-400 to-purple-500',
            light: 'from-rose-400/10 to-purple-500/10',
            accent: 'text-rose-400',
            accentBg: 'bg-rose-500/10',
            accentBorder: 'border-rose-500/20',
            shadow: 'shadow-rose-500/10',
            border: 'hover:border-rose-400/30 hover:shadow-[0_0_20px_rgba(251,113,133,0.15)]',
            bullet: 'bg-rose-400',
            glow: 'rgba(251, 113, 133, 0.2)'
        }
    };

    const gradient = subjectGradients[subjectId] || subjectGradients.physics;

    // Get chapter-specific data or use default
    const chapterData = chapterMarksData[chapterId] || {
        ...defaultChapterData,
        examSnapshot: {
            ...defaultChapterData.examSnapshot,
            chapterName: chapter?.name || 'Chapter'
        }
    };

    // State for loading dynamic chapter content (topics, sections)
    const [chapterContent, setChapterContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            try {
                const fileSlug = getChapterFileSlug(subjectId, chapterId);
                const content = await loadChapterContent(subjectId, fileSlug);
                setChapterContent(content);
            } catch (err) {
                console.error('Failed to load chapter content', err);
            } finally {
                setLoading(false);
            }
        }
        if (subjectId && chapterId) {
            fetchContent();
        }
    }, [subjectId, chapterId]);

    if (!subject || !chapter) {
        return (
            <div className="min-h-screen bg-[#030307] flex items-center justify-center">
                <p className="text-white/60 font-mono">Chapter not found</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030307] flex flex-col items-center justify-center relative overflow-hidden">
                <div className={`absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br ${gradient.light} blur-[130px] mix-blend-screen opacity-60`}></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-t-white/80 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <p className="text-white/50 font-mono text-xs tracking-[0.2em] animate-pulse">BOOTING STUDY SCHEMATICS...</p>
                </div>
            </div>
        );
    }

    // Determine the array of items to show in our learning roadmap based on subject and data structures
    let roadmapItems = [];
    let isTopicFlow = false;
    let isChemistryFlow = false;
    let isMathsFlow = false;

    if (chapterContent) {
        if (Array.isArray(chapterContent)) {
            roadmapItems = chapterContent;
            isTopicFlow = true;
        } else if (chapterContent.chapter_flow && Array.isArray(chapterContent.chapter_flow)) {
            roadmapItems = chapterContent.chapter_flow;
            isChemistryFlow = true;
        } else if (chapterContent.formulas && Array.isArray(chapterContent.formulas)) {
            roadmapItems = chapterContent.formulas;
            isMathsFlow = true;
        }
    }

    return (
        <div className="min-h-screen bg-[#030307] text-stone-300 relative overflow-x-hidden font-sans selection:bg-cyan-500/20">
            
            {/* Ambient Background & Grid Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Microdot grid */}
                <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:80px_80px]" />
                
                {/* Neo-Glow Orbs */}
                <motion.div
                    animate={{
                        x: ['-5%', '10%', '-5%'],
                        y: ['-10%', '10%', '-10%'],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className={`absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br ${gradient.light} blur-[120px] mix-blend-screen opacity-70`}
                />
                <motion.div
                    animate={{
                        x: ['10%', '-5%', '10%'],
                        y: ['10%', '-10%', '10%'],
                        scale: [1.05, 0.95, 1.05],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-950/10 blur-[130px] mix-blend-screen opacity-40"
                />
            </div>

            {/* Premium Header/Navigation */}
            <nav className="sticky top-0 z-30 w-full bg-[#030307]/75 backdrop-blur-xl border-b border-white/5 py-4">
                <div className="container-app flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to={`/subjects/${subjectId}/chapters`}
                            className="group flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 text-white/50 rounded-full hover:text-white hover:border-white/10 hover:bg-white/[0.06] transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-[10px] font-mono tracking-wider uppercase pr-0.5">Chapters</span>
                        </Link>

                        {/* Breadcrumbs */}
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/30 font-mono">
                            <span>Subjects</span>
                            <span>/</span>
                            <span className="capitalize">{subject.name}</span>
                            <span>/</span>
                            <span className="text-white/60 truncate max-w-[180px]">{chapter.name}</span>
                        </div>
                    </div>

                    <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                    </Link>
                </div>
            </nav>

            {/* Dashboard Header */}
            <header className="relative z-10 container-app pt-10 pb-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        {/* Subject Badge */}
                        <div className="mb-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${gradient.accentBg} ${gradient.accentBorder} border text-[10px] font-mono font-bold uppercase tracking-wider ${gradient.accent}`}>
                                <span>{subject.icon}</span> 
                                <span>{subject.name}</span>
                            </span>
                        </div>

                        {/* Chapter Title */}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            {chapter.name}
                        </h1>
                    </div>

                    {/* Stats Widget Row */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Weighting Badge */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                            <Percent className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-mono text-white/80">{chapter.weightage}% Weight</span>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                chapter.difficulty === 'easy' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                                chapter.difficulty === 'hard' ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            }`} />
                            <span className="font-mono capitalize text-white/80">{chapter.difficulty}</span>
                        </div>

                        {/* Expected Marks */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                            <Award className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-mono text-white/80">{chapterData.examSnapshot?.expectedMarks || '8-10 marks'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Streamlined Main Layout */}
            <main className="relative z-10 container-app pb-24 pt-4">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Clean Topic Roadmap (Navigation Syllabus Outline) */}
                    <section className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 pl-1 mb-2">
                            <Compass className="w-4 h-4 text-cyan-400" />
                            <h2 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">Syllabus Index</h2>
                        </div>

                        {/* TIMELINE PATHWAY */}
                        <div className="space-y-1 relative">
                            {roadmapItems.length > 0 ? (
                                <>
                                    {/* PHYSICS TIMELINE */}
                                    {isTopicFlow && roadmapItems.map((topicData, idx) => {
                                        const { meta, notes } = topicData;
                                        const frequency = meta?.frequency || 'MEDIUM';
                                        
                                        return (
                                            <div key={idx} className="relative pl-9 pb-5 last:pb-0 group">
                                                {/* Connecting line */}
                                                {idx < roadmapItems.length - 1 && (
                                                    <div className="absolute left-[13px] top-6 bottom-0 w-[1px] bg-white/5 group-hover:bg-cyan-500/20 transition-colors" />
                                                )}
                                                
                                                {/* Node Indicator */}
                                                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-[#030307] border border-white/10 group-hover:border-cyan-500/50 group-hover:scale-105 flex items-center justify-center z-10 transition-all duration-300 font-mono text-[10px] text-white/40 group-hover:text-cyan-300 shadow-inner">
                                                    {idx + 1}
                                                </div>
                                                
                                                {/* Topic Card (Static clean preview) */}
                                                <div className={`bg-white/[0.01] border border-white/5 rounded-xl p-4 transition-all duration-300 ${gradient.border} flex items-center justify-between gap-4`}>
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                            {meta?.topic || 'Topic'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                                                            {frequency.toUpperCase() === 'HIGH' && (
                                                                <span className="text-rose-400 font-bold uppercase">⚡ High Yield</span>
                                                            )}
                                                            {frequency.toUpperCase() === 'MEDIUM' && (
                                                                <span className="text-amber-400">Medium weighting</span>
                                                            )}
                                                            {frequency.toUpperCase() === 'LOW' && (
                                                                <span className="text-blue-400">Low weighting</span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{notes?.length || 0} segments</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* CHEMISTRY TIMELINE */}
                                    {isChemistryFlow && roadmapItems.map((section, idx) => {
                                        const importance = section.section_importance_signal || 'MEDIUM';
                                        return (
                                            <div key={idx} className="relative pl-9 pb-5 last:pb-0 group">
                                                {idx < roadmapItems.length - 1 && (
                                                    <div className="absolute left-[13px] top-6 bottom-0 w-[1px] bg-white/5 group-hover:bg-emerald-500/20 transition-colors" />
                                                )}
                                                
                                                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-[#030307] border border-white/10 group-hover:border-emerald-500/50 group-hover:scale-105 flex items-center justify-center z-10 transition-all duration-300 font-mono text-[9px] text-white/40 group-hover:text-emerald-300">
                                                    {section.ncert_section || idx + 1}
                                                </div>
                                                
                                                <div className={`bg-white/[0.01] border border-white/5 rounded-xl p-4 transition-all duration-300 ${gradient.border} flex items-center justify-between gap-4`}>
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                            {section.section_title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                                                            {importance.toUpperCase() === 'HIGH' && (
                                                                <span className="text-rose-400 font-bold uppercase">⚡ High Yield</span>
                                                            )}
                                                            {importance.toUpperCase() === 'MEDIUM' && (
                                                                <span className="text-amber-400">Moderate yield</span>
                                                            )}
                                                            {importance.toUpperCase() === 'LOW' && (
                                                                <span className="text-blue-400">Low yield</span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{section.core_concepts?.length || 0} topics</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* MATHEMATICS TIMELINE */}
                                    {isMathsFlow && roadmapItems.map((f, idx) => {
                                        return (
                                            <div key={idx} className="relative pl-9 pb-5 last:pb-0 group">
                                                {idx < roadmapItems.length - 1 && (
                                                    <div className="absolute left-[13px] top-6 bottom-0 w-[1px] bg-white/5 group-hover:bg-pink-500/20 transition-colors" />
                                                )}
                                                
                                                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-[#030307] border border-white/10 group-hover:border-pink-500/50 group-hover:scale-105 flex items-center justify-center z-10 transition-all duration-300 font-mono text-[10px] text-white/40 group-hover:text-pink-300">
                                                    {f.formula_number || idx + 1}
                                                </div>
                                                
                                                <div className={`bg-white/[0.01] border border-white/5 rounded-xl p-4 transition-all duration-300 ${gradient.border} flex items-center justify-between gap-4`}>
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                                                            {f.formula_title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {f.section_B?.question_types?.map((type, tIdx) => (
                                                                <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[9px] font-mono text-white/40 uppercase">
                                                                    {type.replace('_', ' ')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 text-center">
                                    <p className="text-xs text-white/30 italic">Roadmap overview available for core dynamic subjects.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Simplified Actions Hub */}
                    <section className="lg:col-span-5 space-y-5">
                        <div className="flex items-center gap-2 pl-1 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <h2 className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">Syllabus CTAs</h2>
                        </div>

                        {/* Clean Vertical CTAs */}
                        <div className="flex flex-col gap-4">
                            
                            {/* Card 1: Study Center (Complete NCERT Notes) */}
                            {notesAvailable && (
                                <Link
                                    to={`/subjects/${subjectId}/chapters/${chapterId}/notes`}
                                    className={`group block bg-gradient-to-br ${gradient.primary} rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg ${gradient.shadow} hover:scale-[1.01] hover:brightness-110`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                                                {subjectId === 'physical-education' ? 'Study Modules' : 'AI NCERT Study'}
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                {subjectId === 'physical-education' ? 'Complete Study Notes' : 'Complete NCERT Notes'}
                                            </h3>
                                            <p className="text-white/80 text-[11px] leading-relaxed max-w-[220px]">
                                                Review formulas, key NCERT definitions, and exam playbook sheets.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <BookOpen className="w-4.5 h-4.5 text-white" />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Card 2: Interactive Practice Room (Physics only) */}
                            {subjectId === 'physics' && (
                                <Link
                                    to={`/subjects/${subjectId}/chapters/${chapterId}/practice`}
                                    className="group block bg-gradient-to-br from-violet-950/30 to-indigo-950/30 border border-violet-500/20 hover:border-violet-400 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-md hover:scale-[1.01]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/25 text-violet-300 border border-violet-500/30">
                                                Topper Practice
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                Examiner's Trap Practice
                                            </h3>
                                            <p className="text-white/60 text-[11px] leading-relaxed max-w-[220px]">
                                                Solve hand-picked questions, exposes common pitfalls and errors.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Zap className="w-4.5 h-4.5 text-violet-400" />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Card 3: Derivations & Proofs (Physics only) */}
                            {subjectId === 'physics' && (
                                <Link
                                    to={`/subjects/physics/chapters/${chapterId}/derivations`}
                                    className="group block bg-gradient-to-br from-indigo-950/30 to-blue-950/30 border border-indigo-500/20 hover:border-indigo-400 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-md hover:scale-[1.01]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/35">
                                                Proofs Lab
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                Derivations & Proofs
                                            </h3>
                                            <p className="text-white/60 text-[11px] leading-relaxed max-w-[220px]">
                                                Step-by-step mathematical proofs with exam-aligned visualizations.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <span className="text-indigo-400 font-mono font-bold text-xs">∫dx</span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                            
                            {/* Card 3.5: Graph Analysis & Variations (Physics only) */}
                            {hasGraphsAvailable(subjectId, chapterId) && (
                                <Link
                                    to={`/subjects/physics/chapters/${chapterId}/graphs`}
                                    className="group block bg-gradient-to-br from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 hover:border-cyan-400 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-md hover:scale-[1.01]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/35">
                                                Plot Lab
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                Graph Analysis & Variations
                                            </h3>
                                            <p className="text-white/60 text-[11px] leading-relaxed max-w-[220px]">
                                                Interactive graphical variations, examiner-alert traps, and transformations.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <span className="text-cyan-400 font-mono font-bold text-xs">f(x)</span>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Card 4: Mock Test Arena */}
                            {subjectId !== 'physical-education' && (
                                <Link
                                    to={`/mocks?chapter=${chapterId}`}
                                    className={`group block bg-gradient-to-br ${gradient.primary} rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-lg ${gradient.shadow} hover:scale-[1.01] hover:brightness-110`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                                                CBSE Exam Mode
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                Take Mock Test
                                            </h3>
                                            <p className="text-white/80 text-[11px] leading-relaxed max-w-[220px]">
                                                Benchmark your score with realistic full-syllabus & topic mock tests.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Award className="w-4.5 h-4.5 text-white" />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Consolidate Physical Education Actions */}
                            {subjectId === 'physical-education' && (
                                <Link
                                    to="/mocks"
                                    className="group block bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-400 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 shadow-md hover:scale-[1.01]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_linear_infinite]" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                Practice Mocks
                                            </span>
                                            <h3 className="text-base font-extrabold text-white tracking-tight mt-1.5">
                                                Take PE Mock Test
                                            </h3>
                                            <p className="text-white/60 text-[11px] leading-relaxed max-w-[220px]">
                                                Solve CBSE Physical Education mock exams dynamically.
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <FileText className="w-4.5 h-4.5 text-amber-400" />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Exam Priority snapshot panel */}
                            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                                <h3 className="text-white font-bold text-xs tracking-wider font-mono uppercase flex items-center gap-2">
                                    <Target className="w-4 h-4 text-cyan-400" />
                                    <span>Exam Priority Snapshot</span>
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-[#030307]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                        <p className="text-white/40 font-mono text-[9px] uppercase tracking-wider">Weightage</p>
                                        <p className={`text-xs font-bold mt-1.5 ${gradient.accent}`}>{chapterData.examSnapshot?.weightage || 'Medium'}</p>
                                    </div>
                                    <div className="bg-[#030307]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                        <p className="text-white/40 font-mono text-[9px] uppercase tracking-wider">Question Types</p>
                                        <p className="text-xs font-bold text-white mt-1.5 truncate">{chapterData.examSnapshot?.questionTypes?.[0] || 'Mixed'}</p>
                                    </div>
                                    <div className="bg-[#030307]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                        <p className="text-white/40 font-mono text-[9px] uppercase tracking-wider">Frequency</p>
                                        <p className="text-xs font-bold text-white mt-1.5">{chapterData.examSnapshot?.frequency || 'Regular'}</p>
                                    </div>
                                    <div className="bg-[#030307]/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                                        <p className="text-white/40 font-mono text-[9px] uppercase tracking-wider">Expected Marks</p>
                                        <p className="text-xs font-bold text-white mt-1.5">{chapterData.examSnapshot?.expectedMarks || '5-7 marks'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default ChapterMarksView;
