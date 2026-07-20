import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConceptCard from './Blocks/ConceptCard';
import ExamIntelCard from './Blocks/ExamIntelCard';
import RapidRecallCard from './Blocks/RapidRecallCard';
import DiagramCard from './Blocks/DiagramCard';
import FormulaCard from './Blocks/FormulaCard';
import WorkedExampleCard from './Blocks/WorkedExampleCard';

function TopicSection({ data, index, initiallyExpanded = false }) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
    const { meta, notes } = data;

    if (!notes || notes.length === 0) return null;

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            {/* Topic Header */}
            <button
                onClick={toggleExpand}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                        <span className="text-indigo-300 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{meta?.topic || 'Topic'}</h2>
                        <div className="flex gap-2">
                            {meta?.board && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                    {meta.board}
                                </span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                                {notes.length} sections
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>
            </button>

            {/* Topic Content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 border-t border-white/5 space-y-6 mt-4">
                            {notes.map((item, i) => {
                                switch (item.type) {
                                    case 'concept':
                                        return <ConceptCard key={i} item={item} index={i} />;
                                    case 'exam_intel':
                                        return <ExamIntelCard key={i} item={item} index={i} />;
                                    case 'rapid_recall':
                                        return <RapidRecallCard key={i} item={item} index={i} />;
                                    case 'diagram':
                                        return <DiagramCard key={i} item={item} index={i} />;
                                    case 'formula':
                                        return <FormulaCard key={i} item={item} index={i} />;
                                    case 'worked_example':
                                        return <WorkedExampleCard key={i} item={item} index={i} />;
                                    default:
                                        console.warn(`Unknown note type: ${item.type}`);
                                        return null;
                                }
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TopicSection;
