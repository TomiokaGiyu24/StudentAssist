import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FormatText } from './FormatText';
import ChemistryBadge from './ChemistryBadge';
import ChemistryCard from './ChemistryCard';

const ChemistryTopicExplorer = ({ content }) => {
    // Content is an array of topics in solutions.json
    const topics = Array.isArray(content) ? content : [];
    
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [keywordSearch, setKeywordSearch] = useState('');
    const [expandedBlueprint, setExpandedBlueprint] = useState(0); // Default first expanded

    if (topics.length === 0) {
        return (
            <div className="text-center py-20 text-stone-500">
                No topic data found.
            </div>
        );
    }

    const currentTopic = topics[activeTopicIndex];

    const getPriorityBadgeVariant = (tier) => {
        if (!tier) return 'default';
        const t = tier.toUpperCase();
        if (t.includes('HIGH')) return 'danger';
        if (t.includes('MEDIUM') || t.includes('MODERATE')) return 'warning';
        return 'primary';
    };

    // Parse keywords: "Word: Definition"
    const parsedKeywords = (currentTopic.examiner_keywords || []).map((keywordStr) => {
        const firstColon = keywordStr.indexOf(':');
        if (firstColon === -1) return { word: keywordStr, definition: '' };
        return {
            word: keywordStr.substring(0, firstColon).trim(),
            definition: keywordStr.substring(firstColon + 1).trim()
        };
    });

    const filteredKeywords = parsedKeywords.filter(k => 
        k.word.toLowerCase().includes(keywordSearch.toLowerCase()) || 
        k.definition.toLowerCase().includes(keywordSearch.toLowerCase())
    );

    // Sort numerical steps
    const tacticalPack = currentTopic.numerical_tactical_pack || {};
    const stepMarkingLayout = tacticalPack.step_marking_layout || {};
    const sortedSteps = Object.entries(stepMarkingLayout)
        .sort(([keyA], [keyB]) => {
            const numA = parseInt(keyA.replace('step_', ''), 10);
            const numB = parseInt(keyB.replace('step_', ''), 10);
            return numA - numB;
        });

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start select-none">
            {/* Left Column: Topics Sidebar Selector */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4 lg:sticky lg:top-24">
                <div className="px-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">Topics & Concepts</h3>
                    <p className="text-[11px] text-stone-500">Select a topic below to explore details.</p>
                </div>
                
                <div className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {topics.map((topic, index) => {
                        const isActive = activeTopicIndex === index;
                        const tier = topic.metadata?.priority_tier || 'LOW';
                        
                        return (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setActiveTopicIndex(index);
                                    setExpandedBlueprint(0);
                                    setKeywordSearch('');
                                }}
                                className={`
                                    relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                                    ${isActive 
                                        ? 'bg-teal-950/20 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                                        : 'bg-[#141414] border-white/5 hover:border-white/10 hover:bg-[#181818]'
                                    }
                                `}
                            >
                                {/* Active glowing left indicator bar */}
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTopicBar"
                                        className="absolute left-0 top-0 bottom-0 w-[4px] bg-teal-400 rounded-r"
                                    />
                                )}
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center gap-2">
                                        <ChemistryBadge variant={getPriorityBadgeVariant(tier)}>
                                            {tier}
                                        </ChemistryBadge>
                                        <span className="text-[10px] text-stone-500 font-mono">
                                            {topic.metadata?.pyq_frequency?.split(' ')[0]} / 10 Yr
                                        </span>
                                    </div>
                                    
                                    <h4 className={`text-sm font-bold leading-snug transition-colors ${isActive ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>
                                        {topic.topic_name}
                                    </h4>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </aside>

            {/* Right Column: Detailed Concept Dashboard */}
            <main className="flex-1 w-full min-w-0">
                {/* Horizontal Timeline Tracker */}
                <div className="hidden md:flex items-center gap-4 mb-6 bg-[#141416]/60 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                    {topics.map((t, idx) => {
                        const isCompleted = idx < activeTopicIndex;
                        const isCurrent = idx === activeTopicIndex;
                        return (
                            <div key={idx} className="flex-1 flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setActiveTopicIndex(idx);
                                        setExpandedBlueprint(0);
                                        setKeywordSearch('');
                                    }}
                                    className="group flex flex-col items-start text-left flex-1 relative"
                                >
                                    <div className="w-full h-1 rounded-full relative overflow-hidden bg-white/10 mb-2">
                                        {isCompleted && (
                                            <div className="absolute inset-0 bg-teal-500" />
                                        )}
                                        {isCurrent && (
                                            <motion.div 
                                                layoutId="timelineGlow"
                                                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase transition-all duration-300 tracking-wider truncate max-w-[140px] block ${
                                        isCurrent ? 'text-teal-400 font-extrabold' : isCompleted ? 'text-stone-400 group-hover:text-stone-300' : 'text-stone-600 group-hover:text-stone-500'
                                    }`}>
                                        0{idx + 1}. {t.topic_name}
                                    </span>
                                </button>
                                {idx < topics.length - 1 && (
                                    <span className="text-stone-850 text-sm select-none font-light">→</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Topic Banner Header */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/5 rounded-3xl mb-8 overflow-hidden shadow-xl">
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${
                        currentTopic.metadata?.priority_tier?.toUpperCase() === 'HIGH'
                            ? 'from-rose-500 to-red-500'
                            : currentTopic.metadata?.priority_tier?.toUpperCase() === 'MEDIUM' || currentTopic.metadata?.priority_tier?.toUpperCase() === 'MODERATE'
                                ? 'from-amber-400 to-orange-500'
                                : 'from-teal-400 to-emerald-500'
                    }`} />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase block mb-1">Active Concept Profile</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                {currentTopic.topic_name}
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 md:self-end">
                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-stone-300 flex items-center gap-1.5 font-medium">
                                <span className="text-stone-500">PYQs:</span>
                                <span className="text-teal-400 font-bold">{currentTopic.metadata?.pyq_frequency}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-stone-300 flex items-center gap-1.5 font-medium">
                                <span className="text-stone-500">Weightage:</span>
                                <span className="text-teal-400 font-bold">{currentTopic.metadata?.weightage_pattern}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Widescreen Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTopicIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="grid grid-cols-1 xl:grid-cols-2 gap-8"
                    >
                        {/* LEFT COLUMN: Theory, Key Mechanism, and searchable Glossary */}
                        <div className="space-y-6">
                            {/* NCERT Verbatim card */}
                            <div className="p-6 bg-teal-500/[0.02] border-l-4 border-teal-500/60 rounded-r-3xl bg-[#111116] border-y border-r border-white/5 relative shadow-inner">
                                <span className="absolute -top-3 left-4 bg-teal-500/10 text-teal-300 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-teal-500/20">
                                    NCERT Verbatim Definition
                                </span>
                                <p className="text-[15px] italic text-stone-200 leading-relaxed font-serif pt-2">
                                    "<FormatText>{currentTopic.core_concept?.ncert_definition}</FormatText>"
                                </p>
                            </div>

                            {/* Core Mechanism & Principle */}
                            <ChemistryCard hoverEffect={false} className="border-white/5 bg-[#141414] shadow-md p-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3 flex items-center gap-2">
                                    <span>⚛️</span> Core Mechanism & Principle
                                </h4>
                                <p className="text-[14px] text-stone-300 leading-relaxed">
                                    <FormatText>{currentTopic.core_concept?.key_mechanism_or_principle}</FormatText>
                                </p>
                            </ChemistryCard>

                            {/* Glossary Section */}
                            <div className="space-y-4 p-6 bg-[#141414] border border-white/5 rounded-3xl shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center gap-2">
                                            <span>🔍</span> Keywords & Glossary
                                        </h4>
                                        <p className="text-[11px] text-stone-500">Standard criteria terms examiners look for.</p>
                                    </div>
                                    
                                    {/* Glossary Search */}
                                    <div className="relative w-full sm:w-48">
                                        <input
                                            type="text"
                                            placeholder="Search keywords..."
                                            value={keywordSearch}
                                            onChange={(e) => setKeywordSearch(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-teal-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredKeywords.length > 0 ? (
                                        filteredKeywords.map((k, idx) => (
                                            <div 
                                                key={idx}
                                                className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-teal-500/20 hover:bg-white/[0.03] transition-all duration-300 group"
                                            >
                                                <span className="font-bold text-sm text-white/95 group-hover:text-teal-300 transition-colors block mb-1">
                                                    {k.word}
                                                </span>
                                                <p className="text-xs text-stone-400 leading-relaxed">
                                                    <FormatText>{k.definition}</FormatText>
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-xs text-stone-500 italic bg-black/20 rounded-2xl border border-dashed border-white/5">
                                            No keywords match your search.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Formula card, Step markings, warnings & Q&A blueprints */}
                        <div className="space-y-6">
                            {/* Governing Formula */}
                            {tacticalPack.main_formula && (
                                <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#121216] border border-teal-500/20 rounded-3xl p-6 text-center shadow-lg">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 block mb-3">Governing Formula</span>
                                    
                                    <div className="text-lg sm:text-xl py-3 text-white overflow-x-auto overflow-y-hidden max-w-full flex justify-center items-center font-mono">
                                        <BlockMath math={tacticalPack.main_formula} />
                                    </div>
                                    
                                    {/* Variable mappings dictionary */}
                                    {tacticalPack.variables_si_units && tacticalPack.variables_si_units.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/5 text-left">
                                            <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block mb-2">Variables & Units</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {tacticalPack.variables_si_units.map((val, idx) => {
                                                    const parts = val.split(':');
                                                    const symbol = parts[0]?.trim();
                                                    const desc = parts.slice(1).join(':')?.trim();
                                                    return (
                                                        <div key={idx} className="flex items-start gap-2 p-1.5 rounded-lg bg-white/[0.01] border border-white/[0.02]">
                                                            <span className="font-mono text-teal-300 font-bold shrink-0 bg-teal-500/10 px-1 py-0.5 rounded text-[10px] min-w-[20px] text-center flex justify-center items-center">
                                                                <InlineMath math={symbol} />
                                                            </span>
                                                            <span className="text-stone-300 leading-snug text-[11px]">
                                                                <FormatText>{desc}</FormatText>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Warnings */}
                            {(tacticalPack.unit_traps || tacticalPack.red_flags) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tacticalPack.unit_traps && (
                                        <div className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl flex gap-3">
                                            <span className="text-amber-500 text-sm">⚠️</span>
                                            <div className="space-y-0.5">
                                                <span className="block text-[9px] uppercase font-bold tracking-widest text-amber-500">Unit Traps</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                    <FormatText>{tacticalPack.unit_traps}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {tacticalPack.red_flags && (
                                        <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl flex gap-3">
                                            <span className="text-rose-400 text-sm">🚫</span>
                                            <div className="space-y-0.5">
                                                <span className="block text-[9px] uppercase font-bold tracking-widest text-rose-400">Red Flags</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                    <FormatText>{tacticalPack.red_flags}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step Marking Layout */}
                            {sortedSteps.length > 0 && (
                                <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden shadow-md">
                                    <div className="bg-black/20 px-5 py-3 border-b border-white/5">
                                        <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Step-by-Step Scoring Guide</h5>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {sortedSteps.map(([key, text], idx) => {
                                            const stepNum = parseInt(key.replace('step_', ''), 10);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="flex gap-3 items-start bg-white/[0.01] hover:bg-white/[0.02] transition-colors p-3 rounded-xl border border-white/[0.02] group"
                                                >
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/15 text-teal-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                                                        {stepNum}
                                                    </span>
                                                    <span className="text-[12px] text-stone-300 leading-relaxed">
                                                        <FormatText>{text}</FormatText>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Question Blueprints Accordion */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 px-1">
                                    📋 Question Blueprints & Perfect Responses
                                </h4>
                                <div className="space-y-3">
                                    {(currentTopic.question_blueprints || []).map((qp, idx) => {
                                        const isExpanded = expandedBlueprint === idx;
                                        return (
                                            <div 
                                                key={idx}
                                                className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-md"
                                            >
                                                <div 
                                                    onClick={() => setExpandedBlueprint(isExpanded ? null : idx)}
                                                    className="p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <ChemistryBadge variant="primary">
                                                                {qp.type}
                                                            </ChemistryBadge>
                                                        </div>
                                                        <h5 className="text-[14px] font-bold text-white leading-snug">
                                                            {qp.pattern}
                                                        </h5>
                                                    </div>
                                                    <button className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white bg-white/10' : ''}`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                                            className="overflow-hidden bg-[#0d0d0d] border-t border-white/5"
                                                        >
                                                            <div className="p-5 space-y-2">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-teal-450 block">
                                                                    Perfect Model Response (Full Credit)
                                                                </span>
                                                                <div className="text-[13px] leading-relaxed text-stone-300 border-l-2 border-teal-500/40 pl-4 py-1">
                                                                    <FormatText>{qp.perfect_response}</FormatText>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ChemistryTopicExplorer;
