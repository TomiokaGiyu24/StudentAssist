import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FormatText } from './FormatText';
import ChemistryBadge from './ChemistryBadge';

const AutoFitMath = ({ math }) => {
    const containerRef = React.useRef(null);
    const innerRef = React.useRef(null);
    const [scale, setScale] = useState(1);

    const updateScale = () => {
        if (!containerRef.current || !innerRef.current) return;
        
        // Reset styles first to measure natural dimensions
        innerRef.current.style.transform = 'none';
        innerRef.current.style.display = 'inline-block';
        
        const containerWidth = containerRef.current.clientWidth;
        const innerWidth = innerRef.current.scrollWidth;
        
        if (innerWidth > containerWidth && containerWidth > 0) {
            const ratio = (containerWidth - 16) / innerWidth; // 16px padding safety
            setScale(ratio);
        } else {
            setScale(1);
        }
    };

    useEffect(() => {
        updateScale();
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            const observer = new ResizeObserver(() => {
                updateScale();
            });
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, [math]);

    return (
        <div 
            ref={containerRef} 
            className="w-full flex justify-center items-center overflow-hidden py-4 select-text"
            style={{ minHeight: '80px' }}
        >
            <div 
                ref={innerRef} 
                className="transition-transform duration-200 ease-out origin-center select-text"
                style={{ 
                    transform: `scale(${scale})`,
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                }}
            >
                <BlockMath math={math} />
            </div>
        </div>
    );
};

const ChemistryFormulaDeck = ({ formulas }) => {
    const [selectedFormulaIndex, setSelectedFormulaIndex] = useState(0);
    const [activeVariationIndex, setActiveVariationIndex] = useState(-1); // -1 is Base Equation
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('ALL');
    const [showSolution, setShowSolution] = useState(false);

    // Sync active variation index and showSolution when switching formulas
    useEffect(() => {
        setActiveVariationIndex(-1);
        setShowSolution(false);
    }, [selectedFormulaIndex]);

    if (!formulas || formulas.length === 0) {
        return (
            <div className="text-center py-20 text-stone-500">
                No formula data found for this chapter.
            </div>
        );
    }

    // Filter formulas based on search query and priority tier
    const filteredFormulas = formulas.filter(formula => {
        const matchesSearch = 
            formula.formula_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formula.formula_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formula.base_equation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (formula.variable_registry || []).some(v => 
                v.parameter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        
        const matchesPriority = selectedPriority === 'ALL' || formula.priority_tier?.toUpperCase() === selectedPriority;
        
        return matchesSearch && matchesPriority;
    });

    const activeFormula = filteredFormulas.length > 0 ? (filteredFormulas[selectedFormulaIndex] || filteredFormulas[0]) : null;

    const getPriorityColor = (priority) => {
        if (!priority) return 'default';
        const p = priority.toUpperCase();
        if (p.includes('HIGH')) return 'danger';
        if (p.includes('MEDIUM') || p.includes('MODERATE')) return 'warning';
        return 'primary';
    };

    // Helper to format step titles nicely
    const formatStepTitle = (stepKey) => {
        const cleanKey = stepKey.replace('step_', '');
        const parts = cleanKey.split('_');
        return parts.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getEquationFontSize = (eq) => {
        if (!eq) return 'text-xl sm:text-2xl';
        const len = eq.length;
        if (len > 60) return 'text-xs sm:text-sm md:text-base';
        if (len > 40) return 'text-sm sm:text-base md:text-lg';
        if (len > 25) return 'text-lg sm:text-xl md:text-2xl';
        return 'text-2xl sm:text-3xl';
    };

    return (
        <div className="w-full space-y-6 select-none">
            
            {/* Unified Header & Filter Toolbar */}
            <div className="p-4 bg-[#141414] border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
                
                {/* Modern search block */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search formulas, symbols, concepts..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedFormulaIndex(0);
                        }}
                        className="w-full bg-[#1e1e1e] border border-white/5 hover:border-white/10 focus:border-teal-500/40 rounded-xl px-4 py-2.5 pl-9 text-xs text-white placeholder-stone-600 focus:outline-none transition-all duration-300"
                    />
                    <span className="absolute left-3.5 top-3 text-[11px] text-stone-500">🔍</span>
                    {searchQuery && (
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedFormulaIndex(0); }}
                            className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-300 text-[10px]"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Priority Selection Bar */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mr-1">Priority:</span>
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => (
                        <button
                            key={prio}
                            onClick={() => {
                                setSelectedPriority(prio);
                                setSelectedFormulaIndex(0);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 uppercase ${
                                selectedPriority === prio
                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                    : 'bg-white/5 text-stone-400 border border-white/5 hover:text-stone-200'
                            }`}
                        >
                            {prio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Navigation Ledger Ribbon */}
            <div className="flex flex-col gap-2.5 bg-[#141414]/30 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Quick Navigation Ledger</span>
                        <span className="text-[9px] text-stone-600 mt-0.5">Click any formula card to switch, or use the paging arrows.</span>
                    </div>
                    {filteredFormulas.length > 0 && (
                        <span className="text-[10px] font-bold text-teal-400 font-mono bg-teal-950/20 px-2 py-0.5 rounded border border-teal-500/10">
                            {filteredFormulas[selectedFormulaIndex] ? selectedFormulaIndex + 1 : 1} of {filteredFormulas.length}
                        </span>
                    )}
                </div>

                <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none custom-scrollbar select-none">
                    {filteredFormulas.length > 0 ? (
                        filteredFormulas.map((formula, idx) => {
                            const isSelected = (filteredFormulas[selectedFormulaIndex] ? selectedFormulaIndex : 0) === idx;
                            return (
                                <button
                                    key={formula.formula_id}
                                    onClick={() => setSelectedFormulaIndex(idx)}
                                    className={`px-4 py-3 rounded-xl border shrink-0 text-left transition-all duration-300 flex flex-col gap-1 min-w-[150px] md:min-w-[180px] ${
                                        isSelected
                                            ? 'bg-teal-950/25 text-white border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] scale-[1.02]'
                                            : 'bg-white/5 text-stone-400 border-white/5 hover:border-white/10 hover:text-stone-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[9px] font-mono font-bold tracking-wider opacity-60">
                                            {formula.formula_id}
                                        </span>
                                        <ChemistryBadge variant={getPriorityColor(formula.priority_tier)} className="text-[8px] px-1 py-0 scale-90 origin-right">
                                            {formula.priority_tier}
                                        </ChemistryBadge>
                                    </div>
                                    <span className="text-xs font-extrabold truncate w-full">
                                        {formula.formula_name}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <span className="text-xs text-stone-500 italic py-2">No matching formulas found matching your filter parameters.</span>
                    )}
                </div>
            </div>

            {/* Formula Dashboard Detail Viewer */}
            <div className="w-full min-w-0">
                {activeFormula ? (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Title Card */}
                        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase block">
                                        {activeFormula.formula_id} ledger profile
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                                        {activeFormula.formula_name}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                                    <button
                                        disabled={selectedFormulaIndex === 0}
                                        onClick={() => setSelectedFormulaIndex(prev => Math.max(0, prev - 1))}
                                        className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                                            selectedFormulaIndex === 0
                                                ? 'opacity-30 cursor-not-allowed border-white/5 text-stone-600'
                                                : 'bg-white/5 border-white/5 text-stone-300 hover:text-white hover:bg-white/10'
                                        }`}
                                        title="Previous Formula"
                                    >
                                        ◀ Prev
                                    </button>
                                    <ChemistryBadge variant={getPriorityColor(activeFormula.priority_tier)} className="py-1 px-3">
                                        {activeFormula.priority_tier}
                                    </ChemistryBadge>
                                    <button
                                        disabled={selectedFormulaIndex === filteredFormulas.length - 1}
                                        onClick={() => setSelectedFormulaIndex(prev => Math.min(filteredFormulas.length - 1, prev + 1))}
                                        className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                                            selectedFormulaIndex === filteredFormulas.length - 1
                                                ? 'opacity-30 cursor-not-allowed border-white/5 text-stone-600'
                                                : 'bg-white/5 border-white/5 text-stone-300 hover:text-white hover:bg-white/10'
                                        }`}
                                        title="Next Formula"
                                    >
                                        Next ▶
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Large Equation Hero Display */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#111115] border border-teal-500/15 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/5 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/5 blur-3xl pointer-events-none" />
                            
                            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400/80 block mb-6">
                                {activeVariationIndex === -1 ? 'Governing Base Equation' : 'Algebraic Mutation Variation'}
                            </span>
                            
                            {/* Equation Render Box */}
                            {(() => {
                                const eq = activeVariationIndex === -1 
                                    ? activeFormula.base_equation 
                                    : (activeFormula.algebraic_variations[activeVariationIndex]?.mutated_equation || activeFormula.base_equation);
                                return (
                                    <div className={`text-white max-w-full font-mono ${getEquationFontSize(eq)}`}>
                                        <AutoFitMath math={eq} />
                                    </div>
                                );
                            })()}

                            {/* Algebraic Variations Switcher */}
                            {activeFormula.algebraic_variations && activeFormula.algebraic_variations.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-3.5">
                                        Algebraic Mutation Swaps
                                    </span>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <button
                                            onClick={() => setActiveVariationIndex(-1)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                                                activeVariationIndex === -1
                                                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                                                    : 'bg-white/5 text-stone-400 border border-white/5 hover:text-stone-200'
                                            }`}
                                        >
                                            Base Equation
                                        </button>
                                        {activeFormula.algebraic_variations.map((variation, vIdx) => (
                                            <button
                                                key={vIdx}
                                                onClick={() => setActiveVariationIndex(vIdx)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                                                    activeVariationIndex === vIdx
                                                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                                                        : 'bg-white/5 text-stone-400 border border-white/5 hover:text-stone-200'
                                                }`}
                                            >
                                                <span>Solve for</span>
                                                <span className="font-mono bg-black/35 px-1 py-0.5 rounded text-[10px] text-teal-400">
                                                    <InlineMath math={variation.target_variable} />
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Variation Description Block */}
                                    <AnimatePresence mode="wait">
                                        {activeVariationIndex !== -1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-4 p-4 bg-[#141419] border border-teal-500/10 rounded-2xl max-w-2xl mx-auto text-xs text-stone-300 leading-relaxed text-left flex gap-3"
                                            >
                                                <span className="text-teal-400 text-sm select-none">⚙️</span>
                                                <div>
                                                    <span className="font-bold text-teal-300 block mb-0.5">Specific Case Application</span>
                                                    <FormatText>{activeFormula.algebraic_variations[activeVariationIndex]?.specific_use_case}</FormatText>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Variable Registry Section */}
                        {activeFormula.variable_registry && activeFormula.variable_registry.length > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center gap-2">
                                        <span>📋</span> Variable Registry Ledger
                                    </h4>
                                    <p className="text-[11px] text-stone-500">Explore variable constraints, metric definitions, and hidden nuances.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeFormula.variable_registry.map((variable, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-5 bg-[#141414] border border-white/5 rounded-2xl hover:border-teal-500/20 hover:bg-[#16161c]/50 transition-all duration-300 space-y-3"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="font-mono text-teal-300 font-bold shrink-0 bg-teal-500/10 px-2 py-1 rounded-lg text-xs min-w-[32px] text-center flex justify-center items-center border border-teal-500/20">
                                                    <InlineMath math={variable.symbol} />
                                                </span>
                                                {variable.mandatory_si_unit && (
                                                    <ChemistryBadge variant="default" className="text-[9px] lowercase font-mono py-0.5">
                                                        unit: <FormatText>{variable.mandatory_si_unit}</FormatText>
                                                    </ChemistryBadge>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-white block">
                                                    {variable.parameter_name}
                                                </span>
                                                {variable.hidden_nuances && (
                                                    <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
                                                        <FormatText>{variable.hidden_nuances}</FormatText>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Warnings & Hacks Grid */}
                        {activeFormula.tactical_tricks && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Unit traps & Red flags column */}
                                <div className="space-y-4">
                                    {activeFormula.tactical_tricks.unit_traps && (
                                        <div className="p-5 bg-amber-500/[0.01] border border-amber-500/20 rounded-2xl flex gap-4 shadow-sm">
                                            <div className="bg-amber-500/20 p-2.5 h-10 w-10 rounded-xl text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/10 font-bold">
                                                ⚠️
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-400">Unit Warning Traps</span>
                                                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                                                    <FormatText>{activeFormula.tactical_tricks.unit_traps}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {activeFormula.tactical_tricks.red_flags && (
                                        <div className="p-5 bg-rose-500/[0.01] border border-rose-500/20 rounded-2xl flex gap-4 shadow-sm">
                                            <div className="bg-rose-500/20 p-2.5 h-10 w-10 rounded-xl text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/10 font-bold">
                                                🚫
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-[10px] uppercase font-bold tracking-widest text-rose-400">Critical Red Flags</span>
                                                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                                                    <FormatText>{activeFormula.tactical_tricks.red_flags}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Approximation hacks column */}
                                <div>
                                    {activeFormula.tactical_tricks.approximation_hacks && (
                                        <div className="p-5 bg-emerald-500/[0.01] border border-emerald-500/20 rounded-2xl flex gap-4 h-full shadow-sm">
                                            <div className="bg-emerald-500/20 p-2.5 h-10 w-10 rounded-xl text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 font-bold">
                                                ⚡
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-400">Approximation Shortcut Hacks</span>
                                                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                                                    <FormatText>{activeFormula.tactical_tricks.approximation_hacks}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Board Exam Exemplar Accordion */}
                        {activeFormula.board_exam_exemplar && (
                            <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden shadow-md">
                                <div className="bg-black/20 p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1.5">
                                            <span>🎯</span> Board Exam Exemplar
                                        </h4>
                                        <p className="text-[10px] text-stone-500">Analyze real grading rubrics for scoring calculations.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowSolution(!showSolution)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 uppercase ${
                                            showSolution 
                                                ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                                                : 'bg-white/5 text-stone-300 border border-white/10 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {showSolution ? 'Hide Solutions Guide' : 'Show Grading Solution'}
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Question Text */}
                                    <div className="p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-2">Exemplar Problem Statement</span>
                                        <p className="text-[14px] text-stone-200 leading-relaxed font-medium">
                                            <FormatText>{activeFormula.board_exam_exemplar.question_text}</FormatText>
                                        </p>
                                    </div>

                                    {/* Interactive solution timeline */}
                                    <AnimatePresence>
                                        {showSolution && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                                className="overflow-hidden space-y-4"
                                            >
                                                <div className="pt-4 border-t border-white/5 space-y-4">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 block">Marking Scheme step-by-step guideline</span>
                                                    
                                                    {Object.entries(activeFormula.board_exam_exemplar.marking_scheme_solution || {})
                                                        .sort(([keyA], [keyB]) => {
                                                            const numA = parseInt(keyA.replace(/^\D+/g, ''), 10) || 0;
                                                            const numB = parseInt(keyB.replace(/^\D+/g, ''), 10) || 0;
                                                            return numA - numB;
                                                        })
                                                        .map(([key, contentText], idx) => {
                                                            const stepIndex = idx + 1;
                                                            return (
                                                                <div 
                                                                    key={key}
                                                                    className="flex gap-4 items-start bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.02] p-4 rounded-2xl group transition-all duration-300"
                                                                >
                                                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs font-bold shrink-0 mt-0.5 group-hover:bg-teal-500/30 transition-all border border-teal-500/10">
                                                                        {stepIndex}
                                                                    </span>
                                                                    <div className="space-y-1 pt-0.5">
                                                                        <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
                                                                            {formatStepTitle(key)}
                                                                        </span>
                                                                        <p className="text-[14px] text-stone-300 leading-relaxed font-medium">
                                                                            <FormatText>{contentText}</FormatText>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-500 bg-[#141414] rounded-3xl border border-dashed border-white/5 shadow-md animate-fade-in">
                        <span className="text-3xl mb-3">🔍</span>
                        <p className="text-sm font-medium">No formulas found matching your filter selection parameters.</p>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default ChemistryFormulaDeck;
