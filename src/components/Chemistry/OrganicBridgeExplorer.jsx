import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormatText } from './FormatText';

/* ─────────────────────────────────────────────────────────
   OrganicBridgeExplorer
   A premium visual dashboard for Organic Chemistry prerequisites.
   Allows students to master the 24 prerequisite bridge nodes.
   ───────────────────────────────────────────────────────── */

// Category visual styles
const CATEGORY_STYLES = {
    'Spatial Frameworks': { icon: '📐', accent: '#f43f5e', glow: 'rgba(244,63,94,0.15)', text: 'text-rose-400', bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.2)' },
    'Intermediates':      { icon: '🔋', accent: '#3b82f6', glow: 'rgba(59,130,246,0.15)', text: 'text-blue-400', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)' },
    'Trivial Nomenclature':{ icon: '🏷️', accent: '#eab308', glow: 'rgba(234,179,8,0.15)', text: 'text-yellow-400', bg: 'rgba(234,179,8,0.06)', border: 'rgba(234,179,8,0.2)' },
    'Electronic Effects':  { icon: '⚡', accent: '#a855f7', glow: 'rgba(168,85,247,0.15)', text: 'text-purple-400', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },
    'Reagent Mechanics':   { icon: '🧪', accent: '#10b981', glow: 'rgba(16,185,129,0.15)', text: 'text-emerald-400', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
    'General':             { icon: '📚', accent: '#6b7280', glow: 'rgba(107,114,128,0.15)', text: 'text-stone-400', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.2)' }
};

// Dark Mode SVG string adapter
const adjustSvgForDarkMode = (svgStr) => {
    if (!svgStr) return '';
    return svgStr
        .replace(/background-color:\s*#f8f9fa/gi, 'background-color:transparent')
        .replace(/fill=['"]#333['"]/g, "fill='#f8fafc'")
        .replace(/fill=['"]#303030['"]/g, "fill='#f1f5f9'")
        .replace(/fill=['"]#2b2b2b['"]/g, "fill='#e2e8f0'")
        .replace(/stroke=['"]#2b2b2b['"]/g, "stroke='#cbd5e1'")
        .replace(/stroke=['"]#333['"]/g, "stroke='#e2e8f0'")
        .replace(/stroke-width=['"]2['"]/g, "stroke-width='1.5'")
        .replace(/stroke-width=['"]1.5['"]/g, "stroke-width='1.25'");
};

// ── Single Prerequisite Card ─────────────────────────────

// ── Prerequisite Detail Panel ────────────────────────────

const PrerequisiteDetail = React.memo(({ item, isMastered, onToggleMastered, onBack }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const cat = item.core_category || 'General';
    const styles = CATEGORY_STYLES[cat] || CATEGORY_STYLES['General'];
    
    // Clean SVG string
    const processedSvg = useMemo(() => adjustSvgForDarkMode(item.visual_svg_block), [item.visual_svg_block]);

    // Reset flipped state when topic changes
    useEffect(() => {
        setIsFlipped(false);
    }, [item.prerequisite_name]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 220, damping: 25 }}
            className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-500 shadow-2xl ${
                isMastered 
                    ? 'border-emerald-500/35 bg-emerald-950/[0.04] shadow-[0_12px_40px_rgba(16,185,129,0.06)]' 
                    : 'border-white/[0.06] bg-[#0c0c0f]/80 shadow-[0_12px_45px_rgba(0,0,0,0.6)]'
            }`}
        >
            <div>
                {/* Mobile Back Button & Actions Row */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-bold text-stone-400 hover:text-white transition-all cursor-pointer"
                    >
                        ← Back to List
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                            {styles.icon} {cat}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                            item.syllabus_tier === 'CRITICAL' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                            {item.syllabus_tier}
                        </span>
                    </div>

                    {/* Mastered Button */}
                    <button
                        onClick={onToggleMastered}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isMastered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                : 'bg-white/[0.02] text-stone-400 border-white/[0.08] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]'
                        }`}
                    >
                        {isMastered ? '✓ Mastered' : 'Mark Mastered'}
                    </button>
                </div>

                {/* Prerequisite Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
                    {item.prerequisite_name}
                </h3>

                {/* SVG Visual Canvas - Prominent & Massive */}
                {processedSvg && (
                    <div className="relative w-full h-[280px] sm:h-[360px] rounded-3xl overflow-hidden bg-white/[0.015] border border-white/[0.05] p-5 flex items-center justify-center transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.025] mb-6 shadow-inner">
                        <div 
                            dangerouslySetInnerHTML={{ __html: processedSvg }} 
                            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full flex items-center justify-center"
                        />
                    </div>
                )}

                {/* Concept Definitions (Split Panel) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Simplified */}
                    <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💡</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400">Simplified Core</span>
                        </div>
                        <p className="text-[13.5px] text-stone-300 leading-relaxed font-medium">
                            <FormatText>{item.plain_terms_decode.the_concept_simplified}</FormatText>
                        </p>
                    </div>

                    {/* Textbook */}
                    <div className="p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📖</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Textbook Anchor</span>
                        </div>
                        <p className="text-[13.5px] text-stone-400 italic leading-relaxed">
                            <FormatText>{item.plain_terms_decode.the_textbook_definition}</FormatText>
                        </p>
                    </div>
                </div>

                {/* Class 12 Dependency Alert (Examiner Trap) */}
                <div className="p-5 rounded-2xl bg-rose-500/[0.01] border border-rose-500/10 shadow-[inset_0_0_12px_rgba(244,63,94,0.02)] mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🔗</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400">Class 12 Bridge link</span>
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {item.class_12_dependency.chapter_link}
                        </span>
                    </div>

                    <p className="text-xs font-bold text-stone-300 mb-3 font-mono">
                        🎯 Mechanism: <span className="text-rose-400">{item.class_12_dependency.mechanism_or_reaction}</span>
                    </p>

                    <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/15">
                        <div className="flex items-start gap-2.5">
                            <span className="text-sm leading-none pt-0.5">⚠️</span>
                            <div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 block mb-1">The Examiner's Trap</span>
                                <p className="text-[12.5px] text-stone-300 leading-relaxed font-medium">
                                    <FormatText>{item.class_12_dependency.the_consequence}</FormatText>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagnostic Interactive Flashcard */}
            <div className="border-t border-white/[0.06] pt-5">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">❓</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-400">Diagnostic Question</span>
                    </div>
                    <p className="text-[13.5px] text-stone-200 font-semibold leading-relaxed">
                        {item.diagnostic_flash_card.flash_question}
                    </p>

                    <button
                        onClick={() => setIsFlipped(prev => !prev)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-teal-500/[0.05] border border-teal-500/20 text-teal-300 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all text-center flex items-center justify-center gap-2 mt-1 cursor-pointer"
                    >
                        <span>🧠</span>
                        <span>{isFlipped ? 'Hide Answer Blueprint' : 'Reveal Answer Blueprint'}</span>
                    </button>

                    <AnimatePresence initial={false}>
                        {isFlipped && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-xl bg-teal-500/[0.03] border border-teal-500/15 mt-2">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-teal-400 block mb-1.5">PERFECT RESPONSE SCRIPT</span>
                                    <p className="text-[12.5px] text-stone-300 leading-[1.8] font-medium">
                                        <FormatText>{item.diagnostic_flash_card.perfect_response_script}</FormatText>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
});

// ── Main Component ───────────────────────────────────────

const OrganicBridgeExplorer = ({ content }) => {
    // Filter out core database metadata completion item
    const prerequisites = useMemo(() => {
        if (!Array.isArray(content)) return [];
        return content.filter(item => item.prerequisite_name && item.prerequisite_name !== "Curricular Audit Core Database Complete");
    }, [content]);

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups = {};
        prerequisites.forEach(item => {
            const cat = item.core_category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [prerequisites]);

    const categories = useMemo(() => Object.keys(groupedItems), [groupedItems]);

    // Local Storage for Mastered status
    const [masteredList, setMasteredList] = useState(() => {
        try {
            const stored = localStorage.getItem('organic-bridge-mastered');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('organic-bridge-mastered', JSON.stringify(masteredList));
    }, [masteredList]);

    const handleToggleMastered = useCallback((name) => {
        setMasteredList(prev => {
            if (prev.includes(name)) {
                return prev.filter(x => x !== name);
            } else {
                return [...prev, name];
            }
        });
    }, []);

    // Tabs state
    const [activeTab, setActiveTab] = useState(categories[0] || '');

    const currentItems = useMemo(() => {
        return groupedItems[activeTab] || [];
    }, [groupedItems, activeTab]);

    // Mastered count stats
    const totalCount = prerequisites.length;
    const masteredCount = useMemo(() => {
        return prerequisites.filter(item => masteredList.includes(item.prerequisite_name)).length;
    }, [prerequisites, masteredList]);

    const progressPercentage = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

    // Selected topic state
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    // Sync selected topic when activeTab or currentItems changes
    useEffect(() => {
        if (currentItems.length > 0) {
            const exists = currentItems.some(x => x.prerequisite_name === selectedTopicName);
            if (!exists) {
                setSelectedTopicName(currentItems[0].prerequisite_name);
                setShowMobileDetail(false);
            }
        }
    }, [activeTab, currentItems]);

    const selectedTopic = useMemo(() => {
        return currentItems.find(x => x.prerequisite_name === selectedTopicName) || currentItems[0] || null;
    }, [currentItems, selectedTopicName]);

    return (
        <div className="w-full select-none pb-12">
            {/* Header / Hero */}
            <div className="relative p-6 sm:p-8 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#121217] via-[#0d0d12] to-[#08080b] mb-10 overflow-hidden shadow-2xl">
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-[0.06] bg-amber-500 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-[0.04] bg-rose-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(234,179,8,0.1)]">
                                Prerequisites
                            </span>
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                                24 Core Nodes
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
                            Organic Chemistry Prerequisite Bridge
                        </h2>
                        <p className="text-sm text-stone-400 leading-relaxed max-w-2xl">
                            Master these essential spatial, electronic, and nomenclature concepts to bridge the gap between Class 11 and Class 12 Organic Chemistry. Avoid common traps set by board examiners.
                        </p>
                    </div>

                    {/* Progress Widget */}
                    <div className="w-full md:w-64 bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl flex flex-col shrink-0 relative overflow-hidden shadow-lg">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Mastery Progress</span>
                            <span className="text-lg font-black text-emerald-400 font-mono">{masteredCount}/{totalCount}</span>
                        </div>
                        
                        {/* Progress Bar Track */}
                        <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        
                        <p className="text-[10px] text-stone-500 font-medium mt-2">
                            {progressPercentage === 100 
                                ? '🎉 All bridge concepts mastered!' 
                                : 'Mark items as mastered below to track progress.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Tab Bar */}
            <div className="flex overflow-x-auto pb-4 mb-8 -mx-2 px-2 custom-scrollbar select-none">
                <div className="flex gap-2.5">
                    {categories.map(cat => {
                        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['General'];
                        const items = groupedItems[cat] || [];
                        const masteredInCat = items.filter(x => masteredList.includes(x.prerequisite_name)).length;
                        const isSelected = activeTab === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`relative flex items-center gap-2.5 px-4.5 py-3 rounded-2xl border font-bold text-sm shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? 'text-white border-white/[0.12] bg-white/[0.04]'
                                        : 'text-stone-400 border-white/[0.05] bg-[#09090b]/40 hover:text-white hover:border-white/[0.1] hover:bg-white/[0.01]'
                                }`}
                            >
                                {/* Active sliding background pill */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="activeBridgeTab"
                                        className="absolute inset-0 rounded-2xl z-0"
                                        style={{
                                            border: `1px solid ${style.accent}50`,
                                            boxShadow: `0 0 15px ${style.glow}`,
                                        }}
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                                
                                <span className="relative z-10 text-base">{style.icon}</span>
                                <span className="relative z-10 tracking-tight">{cat}</span>
                                
                                {/* Item count & mastered badge */}
                                <span className={`relative z-10 font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg transition-all ${
                                    isSelected
                                        ? 'bg-white/[0.08] text-white'
                                        : 'bg-white/[0.03] text-stone-500'
                                }`}>
                                    {masteredInCat}/{items.length}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Split Explorer Board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side list pane */}
                <div className={`lg:col-span-4 flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar ${
                    showMobileDetail ? 'hidden lg:flex' : 'flex'
                }`}>
                    <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1 px-1">
                        Topics in this Category
                    </span>
                    {currentItems.map((item, idx) => {
                        const isSelected = selectedTopicName === item.prerequisite_name;
                        const isItemMastered = masteredList.includes(item.prerequisite_name);
                        
                        return (
                            <button
                                key={item.prerequisite_name}
                                onClick={() => {
                                    setSelectedTopicName(item.prerequisite_name);
                                    setShowMobileDetail(true);
                                }}
                                className={`w-full p-4.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                                    isSelected
                                        ? 'border-amber-500/40 bg-amber-500/[0.04] shadow-[0_4px_20px_rgba(234,179,8,0.06)]'
                                        : 'border-white/[0.05] bg-[#09090b]/40 hover:border-white/[0.1] hover:bg-white/[0.02]'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1">
                                            Topic {idx + 1}
                                        </span>
                                        <h4 className={`text-sm font-bold tracking-tight transition-colors ${
                                            isSelected ? 'text-white' : 'text-stone-300 group-hover:text-white'
                                        }`}>
                                            {item.prerequisite_name}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isItemMastered && (
                                            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right side detail pane */}
                <div className={`lg:col-span-8 ${
                    showMobileDetail ? 'block' : 'hidden lg:block'
                }`}>
                    <AnimatePresence mode="wait">
                        {selectedTopic ? (
                            <PrerequisiteDetail
                                key={selectedTopic.prerequisite_name}
                                item={selectedTopic}
                                isMastered={masteredList.includes(selectedTopic.prerequisite_name)}
                                onToggleMastered={() => handleToggleMastered(selectedTopic.prerequisite_name)}
                                onBack={() => setShowMobileDetail(false)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-white/[0.06] rounded-3xl bg-white/[0.01]">
                                <span className="text-4xl mb-4">👈</span>
                                <p className="text-stone-400 font-bold text-sm">Select a prerequisite from the list to begin studying.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OrganicBridgeExplorer;
