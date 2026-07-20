import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ChemistryAccordion from './ChemistryAccordion';
import ChemistryCard from './ChemistryCard';
import ChemistryBadge from './ChemistryBadge';
import { FormatText } from './FormatText';

const DiagramModal = ({ diagram, onClose }) => {
    if (!diagram || !diagram.diagram_required) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">{diagram.diagram_type} Diagram</h3>
                        <button onClick={onClose} className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-6">
                            <span className="text-white/40">Diagram Placeholder: {diagram.concept_tested_through_diagram}</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Components to Label</h4>
                                <ul className="list-disc pl-5 space-y-1 text-stone-300">
                                    {diagram.components_to_label?.map((comp, idx) => (
                                        <li key={idx}>{comp}</li>
                                    ))}
                                </ul>
                            </div>

                            {diagram.common_exam_twist && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <h4 className="text-amber-300 text-sm font-medium mb-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Common Exam Twist
                                    </h4>
                                    <p className="text-stone-300 text-sm">{diagram.common_exam_twist}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const ConceptBlock = ({ concept }) => {
    const [isDerivationOpen, setIsDerivationOpen] = useState(false);
    const [activeDiagram, setActiveDiagram] = useState(null);

    return (
        <ChemistryCard className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-white/90">{concept.concept_title}</h4>
                        <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            {concept.concept_id}
                        </span>
                    </div>
                    <p className="text-stone-400 text-sm">{concept.ncert_alignment_scope}</p>
                </div>
            </div>

            <div className="mb-6 p-4 bg-[#111] rounded-xl border-l-2 border-teal-500 text-stone-300">
                <p className="italic text-[15px] leading-relaxed">"<FormatText>{concept.definition_or_law_verbatim}</FormatText>"</p>
                {concept.concept_clarity_explanation && (
                    <p className="mt-3 text-sm text-teal-400/80"><FormatText>{concept.concept_clarity_explanation}</FormatText></p>
                )}
            </div>

            {/* Cognitive Layering */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h5 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Basics</h5>
                    <p className="text-sm text-stone-300"><FormatText>{concept.cognitive_layering.weak_student_layer}</FormatText></p>
                </div>
                <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/10">
                    <h5 className="text-xs font-semibold text-teal-500/60 uppercase tracking-widest mb-2">Board Ready</h5>
                    <p className="text-sm text-stone-300"><FormatText>{concept.cognitive_layering.board_ready_layer}</FormatText></p>
                </div>
                <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
                    <h5 className="text-xs font-semibold text-purple-500/60 uppercase tracking-widest mb-2">Mastery</h5>
                    <p className="text-sm text-stone-300"><FormatText>{concept.cognitive_layering.topper_mastery_layer}</FormatText></p>
                </div>
            </div>

            {/* Formula Block */}
            {concept.formula_block && concept.formula_block.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-xl border border-white/5 bg-[#141414]">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/5">
                        <h5 className="text-sm font-medium text-white/70">Formulas</h5>
                    </div>
                    <div className="divide-y divide-white/5">
                        {concept.formula_block.map((fb, idx) => (
                            <div key={idx} className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                                <div className="text-lg py-2 text-teal-300 flex flex-wrap gap-2">
                                    <BlockMath math={fb.expression_latex} />
                                </div>
                                <div className="text-sm text-stone-400">
                                    <div className="mb-2"><span className="text-white/60">Scope:</span> <FormatText>{fb.application_scope}</FormatText></div>
                                    {fb.units_required && <div className="mb-2"><span className="text-white/60">Units:</span> <FormatText>{fb.units_required}</FormatText></div>}
                                    {Object.entries(fb.symbol_meanings || {}).map(([symbol, meaning]) => (
                                        <div key={symbol} className="flex gap-2">
                                            <span className="font-mono text-teal-200/70"><InlineMath math={symbol} /></span>: <span><FormatText>{meaning}</FormatText></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions: Derivation & Diagram */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
                {concept.derivation_block?.required && (
                    <button
                        onClick={() => setIsDerivationOpen(!isDerivationOpen)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-stone-200 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isDerivationOpen ? 'Hide Derivation' : 'View Derivation'}
                    </button>
                )}

                {concept.diagram_json?.diagram_required && (
                    <button
                        onClick={() => setActiveDiagram(concept.diagram_json)}
                        className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg text-sm text-teal-300 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        View Diagram
                    </button>
                )}
            </div>

            {/* Expandable Derivation */}
            <AnimatePresence>
                {isDerivationOpen && concept.derivation_block?.required && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 p-5 bg-[#141414] border border-white/5 rounded-xl">
                            <h5 className="text-white/80 font-medium mb-3">Derivation Steps</h5>
                            <div className="space-y-4">
                                {concept.derivation_block.stepwise_progression?.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 items-start text-stone-300 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs">
                                            {idx + 1}
                                        </span>
                                        <div className="pt-0.5">
                                            <FormatText>{step}</FormatText>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-xs text-white/40 uppercase tracking-widest block mb-2">Final Expression</span>
                                    <div className="text-teal-300 break-words flex flex-wrap">
                                        <BlockMath math={concept.derivation_block.final_exam_form_expression} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeDiagram && (
                <DiagramModal diagram={activeDiagram} onClose={() => setActiveDiagram(null)} />
            )}
        </ChemistryCard>
    );
};

const LearnMode = ({ chapterFlow }) => {
    if (!chapterFlow || !chapterFlow.length) return null;

    const getImportanceColor = (signal) => {
        if (signal === 'High') return 'danger';
        if (signal === 'Medium') return 'warning';
        return 'default';
    };

    return (
        <div className="py-6 animate-fade-in max-w-4xl mx-auto">
            {chapterFlow.map((section, index) => (
                <ChemistryAccordion
                    key={index}
                    title={`${section.ncert_section} ${section.section_title}`}
                    defaultOpen={index === 0}
                    badge={
                        <ChemistryBadge variant={getImportanceColor(section.section_importance_signal)}>
                            {section.section_importance_signal} Priority
                        </ChemistryBadge>
                    }
                >
                    <div className="mb-6 mt-2">
                        <p className="text-sm text-stone-400">
                            <span className="text-white/70 font-medium">Why it matters:</span> <FormatText>{section.why_section_matters_exam_wise}</FormatText>
                        </p>
                    </div>

                    <div className="space-y-4">
                        {section.core_concepts?.map((concept, idx) => (
                            <ConceptBlock key={idx} concept={concept} />
                        ))}
                    </div>

                    {/* Rapid Revision Block */}
                    {section.rapid_revision_block && (
                        <div className="mt-6 p-5 bg-teal-500/5 border border-teal-500/20 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-24 h-24 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-teal-400 font-semibold flex items-center gap-2 mb-3">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Rapid Revision
                                </h4>
                                <p className="text-stone-300 text-sm mb-4 leading-relaxed">
                                    <FormatText>{section.rapid_revision_block.ultra_compact_revision}</FormatText>
                                </p>
                                {section.rapid_revision_block.must_remember_points?.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-stone-400">
                                        {section.rapid_revision_block.must_remember_points.map((pt, i) => (
                                            <li key={i}><span className="text-stone-300"><FormatText>{pt}</FormatText></span></li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </ChemistryAccordion>
            ))}
        </div>
    );
};

export default LearnMode;
