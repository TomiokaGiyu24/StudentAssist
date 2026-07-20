import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Eagerly load all image assets from the Images directory
const imageAssets = import.meta.glob('/src/data/Boards/Chemistry/Images/*.{png,jpg,jpeg,webp,svg}', { eager: true, query: '?url', import: 'default' });

const getBestImageMatch = (visualTitle) => {
    if (!visualTitle) return null;

    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normTitle = normalize(visualTitle);

    // 1. Precise Match (normalized)
    for (const [path, url] of Object.entries(imageAssets)) {
        const filename = path.split('/').pop().split('.')[0];
        if (normalize(filename) === normTitle) return url;
    }

    // 2. Substring Match
    for (const [path, url] of Object.entries(imageAssets)) {
        const filename = path.split('/').pop().split('.')[0];
        const normFile = normalize(filename);
        if (normTitle.includes(normFile) || normFile.includes(normTitle)) {
            return url;
        }
    }

    // 3. Fuzzy Keyword Match (overlap of significant words)
    const titleWords = visualTitle.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let bestMatch = null;
    let maxScore = 0;

    for (const [path, url] of Object.entries(imageAssets)) {
        const filename = path.split('/').pop().split('.')[0];
        const fileWords = filename.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];

        let score = 0;
        fileWords.forEach(w => { if (titleWords.includes(w)) score++; });

        // Require at least 2 matching words for multi-word titles, or 1 for single-word
        const threshold = titleWords.length > 2 ? 2 : 1;

        if (score > maxScore && score >= threshold) {
            maxScore = score;
            bestMatch = url;
        }
    }

    return bestMatch;
};

const VisualsMode = ({ visualElements }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!visualElements || visualElements.length === 0) return null;

    const navNext = () => setCurrentIndex((prev) => (prev + 1) % visualElements.length);
    const navPrev = () => setCurrentIndex((prev) => (prev - 1 + visualElements.length) % visualElements.length);

    const activeVisual = visualElements[currentIndex];

    // Memoize the image lookup so it doesn't recalculate on every render
    const imageUrl = useMemo(() => getBestImageMatch(activeVisual.visual_title), [activeVisual.visual_title]);

    // Render structured Data into nice blocks
    const renderMetadata = () => {
        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <h3 className="text-3xl font-bold tracking-tight text-white mb-3">
                        {activeVisual.visual_title}
                    </h3>
                    <p className="text-stone-300 text-lg leading-relaxed font-light">
                        {activeVisual.what_the_visual_represents}
                    </p>
                </div>

                {activeVisual.axes_or_components && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                        <h4 className="text-sm uppercase tracking-widest text-teal-400 font-semibold mb-4">Structural Components</h4>
                        {activeVisual.axes_or_components.x_axis && (
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <span className="text-stone-500 block mb-1">X-Axis</span>
                                    <span className="text-stone-200 font-medium">{activeVisual.axes_or_components.x_axis}</span>
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <span className="text-stone-500 block mb-1">Y-Axis</span>
                                    <span className="text-stone-200 font-medium">{activeVisual.axes_or_components.y_axis}</span>
                                </div>
                            </div>
                        )}
                        {activeVisual.axes_or_components.important_labels && activeVisual.axes_or_components.important_labels.length > 0 && (
                            <div className="mb-4">
                                <span className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Key Markings</span>
                                <div className="flex flex-wrap gap-2">
                                    {activeVisual.axes_or_components.important_labels.map((lbl, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-white/5 text-stone-300 text-xs rounded-full border border-white/10">
                                            {lbl}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeVisual.axes_or_components.key_points_to_mark && activeVisual.axes_or_components.key_points_to_mark.length > 0 && (
                            <div>
                                <span className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Crucial Interactions</span>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-stone-300">
                                    {activeVisual.axes_or_components.key_points_to_mark.map((pt, idx) => (
                                        <li key={idx} className="pl-1">{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeVisual.mechanism_steps && (
                    <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]">
                        <h4 className="text-sm uppercase tracking-widest text-indigo-400 font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Mechanism Flow
                        </h4>
                        {activeVisual.mechanism_steps.stepwise_flow && (
                            <div className="relative border-l-2 border-indigo-500/30 ml-3 pl-6 space-y-6">
                                {activeVisual.mechanism_steps.stepwise_flow.map((step, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20"></div>
                                        <p className="text-stone-300 text-sm">{step}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeVisual.mechanism_steps.intermediates && activeVisual.mechanism_steps.intermediates.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-indigo-500/20">
                                <span className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Active Intermediates</span>
                                <div className="flex flex-wrap gap-2">
                                    {activeVisual.mechanism_steps.intermediates.map((intm, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-md border border-indigo-500/30">
                                            {intm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- NEW: Exam Intelligence & Application Pane --- */}
                {activeVisual.real_life_application_if_any && (
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-emerald-400 mb-1">Real-Life Application</h4>
                            <p className="text-stone-300 text-sm">{activeVisual.real_life_application_if_any}</p>
                        </div>
                    </div>
                )}

                {((activeVisual.exam_question_patterns && activeVisual.exam_question_patterns.length > 0) ||
                    (activeVisual.graph_interpretation_traps && activeVisual.graph_interpretation_traps.length > 0) ||
                    (activeVisual.labeling_mistakes_students_make && activeVisual.labeling_mistakes_students_make.length > 0)) && (
                        <div className="bg-rose-900/10 border border-rose-500/20 rounded-2xl p-6 shadow-[inset_0_0_40px_rgba(244,63,94,0.05)]">
                            <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest text-rose-400 font-semibold mb-5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Exam Intelligence & Traps
                            </h4>

                            <div className="space-y-6">
                                {/* Question Patterns */}
                                {activeVisual.exam_question_patterns && activeVisual.exam_question_patterns.map((pattern, idx) => (
                                    <div key={idx} className="bg-black/30 rounded-xl p-4 border border-rose-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase rounded">{pattern.question_type}</span>
                                            <span className="text-rose-300 text-xs font-semibold">Examiner Pattern</span>
                                        </div>
                                        <p className="text-stone-300 text-sm mb-3 italic">"{pattern.how_examiner_frames_it}"</p>
                                        <div className="bg-rose-500/10 border border-rose-500/20 rounded p-3">
                                            <span className="text-rose-400 text-xs font-bold block mb-1">YOUR ACTION:</span>
                                            <p className="text-stone-200 text-sm">{pattern.student_must_do}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Interpretation Traps & Mistakes */}
                                {((activeVisual.graph_interpretation_traps && activeVisual.graph_interpretation_traps.length > 0) ||
                                    (activeVisual.labeling_mistakes_students_make && activeVisual.labeling_mistakes_students_make.length > 0)) && (
                                        <div>
                                            <h5 className="text-xs uppercase tracking-wider text-rose-500 font-bold mb-3">Fatal Graphic Traps</h5>
                                            <ul className="space-y-2">
                                                {activeVisual.graph_interpretation_traps?.map((trap, idx) => (
                                                    <li key={`trap-${idx}`} className="flex items-start gap-2 text-sm text-stone-300">
                                                        <svg className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        <span><strong className="text-rose-400 font-medium">Interpretation Error:</strong> {trap}</span>
                                                    </li>
                                                ))}
                                                {activeVisual.labeling_mistakes_students_make?.map((mistake, idx) => (
                                                    <li key={`mistake-${idx}`} className="flex items-start gap-2 text-sm text-stone-300">
                                                        <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <span><strong className="text-orange-400 font-medium">Labeling Mistake:</strong> {mistake}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}
            </div>
        );
    };

    return (
        <div className="w-full flex justify-center py-6">
            <div className="w-full max-w-7xl relative">

                {/* Immersive Gallery Card */}
                <div className="bg-[#0f0f11] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">

                    {/* Top: Image Focal Area */}
                    <div className="w-full p-6 lg:p-12 flex items-center justify-center relative bg-gradient-to-br from-[#151518] to-[#0a0a0c] min-h-[400px] lg:min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.04 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full h-full flex items-center justify-center relative"
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={activeVisual.visual_title}
                                        className="max-w-full max-h-[50vh] lg:max-h-[600px] object-contain rounded-xl shadow-2xl ring-1 ring-white/5 bg-[#FAFAFA]"
                                    />
                                ) : (
                                    <div className="w-full max-w-lg aspect-video bg-white/5 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-stone-500">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-medium text-stone-400 mb-2">Aesthetic Rendering Pending</h3>
                                        <p className="text-stone-500 text-sm">The 2D vector for "{activeVisual.visual_title}" is currently generating or unmatched.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination / Navigation Controls Overlaid softly */}
                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                            <button onClick={navPrev} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={navNext} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Progress Pill */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-semibold tracking-widest text-stone-400 border border-white/10 pointer-events-none">
                            {currentIndex + 1} / {visualElements.length}
                        </div>
                    </div>

                    {/* Bottom: Information & Metadata Pane */}
                    <div className="w-full border-t border-white/10 bg-[#121214] flex flex-col">
                        <div className="p-8 lg:p-12 w-full max-w-4xl mx-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    {renderMetadata()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VisualsMode;
