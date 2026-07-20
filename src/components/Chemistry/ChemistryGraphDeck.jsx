import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FormatText, normalizeLatex } from './FormatText';
import ChemistryBadge from './ChemistryBadge';

const ChemistryGraphDeck = ({ graphs }) => {
    const [selectedGraphIndex, setSelectedGraphIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('ALL');
    
    // UI states
    const [activeKnowledgeTab, setActiveKnowledgeTab] = useState('math');
    const [activeNodeIndex, setActiveNodeIndex] = useState(0);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [revealExamAnswer, setRevealExamAnswer] = useState(false);
    const [isSimOpen, setIsSimOpen] = useState(true);
    
    // Simulation parameters state for each graph
    const [simParams, setSimParams] = useState({
        GRAPH_01: { kh: 1.0 },
        GRAPH_02: { p1: 1.0, p2: 1.0 },
        GRAPH_03: { p1: 1.0 },
        GRAPH_04: { dev: 1.0 },
        GRAPH_05: { dev: 1.0 },
        GRAPH_06: { conc: 1.0 },
        GRAPH_07: { conc: 1.0 }
    });

    // Reset details when selected graph changes
    useEffect(() => {
        setActiveNodeIndex(0);
        setIsExamModalOpen(false);
        setRevealExamAnswer(false);
        setActiveKnowledgeTab('math');
    }, [selectedGraphIndex]);

    if (!graphs || graphs.length === 0) {
        return (
            <div className="text-center py-20 text-stone-500">
                No graph data found for this chapter.
            </div>
        );
    }

    // Filter graphs based on search queries and priority
    const filteredGraphs = graphs.filter(graph => {
        const matchesSearch = 
            graph.graph_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            graph.graph_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            graph.core_concept_mapping?.governing_principle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (graph.critical_nodes_and_anomalies || []).some(n => 
                n.node_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.physical_significance?.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesPriority = selectedPriority === 'ALL' || graph.metadata?.priority_tier?.toUpperCase() === selectedPriority;

        return matchesSearch && matchesPriority;
    });

    const activeGraph = filteredGraphs.length > 0 ? (filteredGraphs[selectedGraphIndex] || filteredGraphs[0]) : null;

    const getPriorityColor = (priority) => {
        if (!priority) return 'default';
        const p = priority.toUpperCase();
        if (p.includes('HIGH')) return 'danger';
        if (p.includes('MEDIUM') || p.includes('MODERATE')) return 'warning';
        return 'primary';
    };

    // Replace black strokes and fills with high-contrast stone-200/stone-100 colors for dark mode compatibility
    // And apply dynamic simulator transformations
    const themeSvgString = (svgString, graphId) => {
        if (!svgString) return '';
        // Unescape any over-escaped quotes first (e.g. \" or \\")
        let cleaned = svgString.replace(/\\+"/g, '"');
        
        // Clean subscripts, superscripts, and Greek letters inside text tags
        cleaned = cleaned.replace(/<text([^>]*)>([\s\S]*?)<\/text>/g, (match, attrs, text) => {
            let formattedText = text
                .replace(/\\chi/g, 'χ')
                .replace(/&Delta;/g, 'Δ')
                .replace(/&deg;/g, '°')
                .replace(/&rarr;/g, '→')
                .replace(/([A-Za-z])₁/g, '$1<tspan dy="3" font-size="8">1</tspan><tspan dy="-3"></tspan>')
                .replace(/([A-Za-z])₂/g, '$1<tspan dy="3" font-size="8">2</tspan><tspan dy="-3"></tspan>')
                .replace(/([A-Za-z])_([A-Za-z0-9]+)/g, (m, letter, sub) => {
                    return `${letter}<tspan dy="3.5" font-size="8">${sub}</tspan><tspan dy="-3.5"></tspan>`;
                });
            return `<text${attrs}>${formattedText}</text>`;
        });

        // Apply interactive simulations based on sliders
        if (graphId === "GRAPH_01") {
            const kh = simParams.GRAPH_01.kh;
            cleaned = cleaned
                .replace(/x1="60" y1="340" x2="420" y2="70"/g, `x1="60" y1="340" x2="420" y2="${340 - 270 * kh}"`)
                .replace(/cx="132" cy="286"/g, `cx="132" cy="${340 - 54 * kh}"`)
                .replace(/cx="204" cy="232"/g, `cx="204" cy="${340 - 108 * kh}"`)
                .replace(/cx="276" cy="178"/g, `cx="276" cy="${340 - 162 * kh}"`)
                .replace(/cx="348" cy="124"/g, `cx="348" cy="${340 - 216 * kh}"`)
                .replace(/cx="420" cy="70"/g, `cx="420" cy="${340 - 270 * kh}"`);
        } else if (graphId === "GRAPH_02") {
            const p1 = simParams.GRAPH_02.p1;
            const p2 = simParams.GRAPH_02.p2;
            cleaned = cleaned
                .replace(/x1="60" y1="200" x2="440" y2="340"/g, `x1="60" y1="${340 - 140 * p1}" x2="440" y2="340"`)
                .replace(/x1="60" y1="340" x2="440" y2="100"/g, `x1="60" y1="340" x2="440" y2="${340 - 240 * p2}"`)
                .replace(/x1="60" y1="200" x2="440" y2="100"/g, `x1="60" y1="${340 - 140 * p1}" x2="440" y2="${340 - 240 * p2}"`)
                .replace(/x="50" y="204"/g, `x="50" y="${340 - 140 * p1 + 4}"`)
                .replace(/x="450" y="104"/g, `x="450" y="${340 - 240 * p2 + 4}"`)
                .replace(/x="340" y="280"/g, `x="340" y="${340 - 37 * p1}"`)
                .replace(/x="140" y="220"/g, `x="140" y="${340 - 120 * p2}"`)
                .replace(/x="250" y="135"/g, `x="250" y="${340 - 205 * (p1 + p2)/2}"`);
        } else if (graphId === "GRAPH_03") {
            const p1 = simParams.GRAPH_03.p1;
            cleaned = cleaned
                .replace(/x1="60" y1="340" x2="440" y2="100"/g, `x1="60" y1="340" x2="440" y2="${340 - 240 * p1}"`)
                .replace(/x="435" y="90"/g, `x="435" y="${340 - 240 * p1 - 10}"`);
        } else if (graphId === "GRAPH_04") {
            const dev = simParams.GRAPH_04.dev;
            cleaned = cleaned
                .replace(/d="M 60 340 Q 250 160 440 150"/g, `d="M 60 340 Q 250 ${245 - 85 * dev} 440 150"`)
                .replace(/d="M 60 200 Q 250 180 440 340"/g, `d="M 60 200 Q 250 ${270 - 90 * dev} 440 340"`)
                .replace(/d="M 60 200 C 160 80, 320 80, 440 150"/g, `d="M 60 200 C 160 ${187 - 107 * dev}, 320 ${166 - 86 * dev}, 440 150"`)
                .replace(/x="310" y="190"/g, `x="310" y="${220 - 30 * dev}"`)
                .replace(/x="180" y="210"/g, `x="180" y="${240 - 30 * dev}"`)
                .replace(/x="250" y="70"/g, `x="250" y="${175 - 105 * dev}"`);
        } else if (graphId === "GRAPH_05") {
            const dev = simParams.GRAPH_05.dev;
            cleaned = cleaned
                .replace(/d="M 60 340 Q 250 310 440 150"/g, `d="M 60 340 Q 250 ${245 + 65 * dev} 440 150"`)
                .replace(/d="M 60 200 Q 250 320 440 340"/g, `d="M 60 200 Q 250 ${270 + 50 * dev} 440 340"`)
                .replace(/d="M 60 200 C 160 280, 320 260, 440 150"/g, `d="M 60 200 C 160 ${187 + 93 * dev}, 320 ${166 + 94 * dev}, 440 150"`)
                .replace(/x="280" y="280"/g, `x="280" y="${220 + 60 * dev}"`)
                .replace(/x="160" y="290"/g, `x="160" y="${240 + 50 * dev}"`)
                .replace(/x="250" y="220"/g, `x="250" y="${175 + 95 * dev}"`);
        } else if (graphId === "GRAPH_06") {
            const conc = simParams.GRAPH_06.conc;
            const dx = 60 * (conc - 1);
            cleaned = cleaned
                .replace(/d="M 160 300 Q 240 210 360 110"/g, `d="M ${160 + dx} 300 Q ${240 + dx} 210 ${360 + dx} 110"`)
                .replace(/x="200" y="290"/g, `x="${200 + dx}" y="290"`)
                .replace(/x1="320" y1="140" x2="320" y2="340"/g, `x1="${220 + 100 * conc}" y1="140" x2="${220 + 100 * conc}" y2="340"`)
                .replace(/x="320" y="355"/g, `x="${220 + 100 * conc}" y="355"`)
                .replace(/x1="220" y1="240" x2="320" y2="240"/g, `x1="220" y1="240" x2="${220 + 100 * conc}" y2="240"`)
                .replace(/points="320,240 315,236 315,244"/g, `points="${220 + 100 * conc},240 ${220 + 100 * conc - 5},236 ${220 + 100 * conc - 5},244"`)
                .replace(/x="270" y="232"/g, `x="${220 + 50 * conc}" y="232"`);
        } else if (graphId === "GRAPH_07") {
            const conc = simParams.GRAPH_07.conc;
            const dx = -60 * (conc - 1);
            cleaned = cleaned
                .replace(/d="M 160 180 Q 290 130 420 100"/g, `d="M ${160 + dx} 180 Q ${290 + dx} 130 ${420 + dx} 100"`)
                .replace(/x="310" y="125"/g, `x="${310 + dx}" y="125"`)
                .replace(/x1="160" y1="180" x2="160" y2="340"/g, `x1="${220 - 60 * conc}" y1="180" x2="${220 - 60 * conc}" y2="340"`)
                .replace(/x="160" y="355"/g, `x="${220 - 60 * conc}" y="355"`)
                .replace(/x1="160" y1="240" x2="220" y2="240"/g, `x1="${220 - 60 * conc}" y1="240" x2="220" y2="240"`)
                .replace(/points="160,240 165,236 165,244"/g, `points="${220 - 60 * conc},240 ${220 - 60 * conc + 5},236 ${220 - 60 * conc + 5},244"`)
                .replace(/x="190" y="232"/g, `x="${220 - 30 * conc}" y="232"`);
        }

        // Remap stroke and fill colors for dark mode
        return cleaned
            .replace(/stroke="black"/gi, 'stroke="#e7e5e4"')
            .replace(/stroke="#000000"/gi, 'stroke="#e7e5e4"')
            .replace(/fill="black"/gi, 'fill="#f5f5f4"')
            .replace(/fill="#000000"/gi, 'fill="#f5f5f4"');
    };

    // Knowledge panel tabs definition
    const knowledgeTabs = [
        { id: 'math', label: 'Math & Axes', icon: '📐' },
        { id: 'concept', label: 'Concept', icon: '⚛️' },
        { id: 'landmarks', label: 'Landmarks', icon: '📍' },
        { id: 'traps', label: 'Traps', icon: '🚨' },
    ];

    // Simulator controls renderer per graph
    const renderSimulatorSliders = () => {
        if (!activeGraph) return null;
        const gid = activeGraph.graph_id;

        const SliderRow = ({ label, value, min, max, step, unit, onChange, description }) => (
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-400">{label}</span>
                    <span className="text-teal-400 font-mono font-bold">{unit}</span>
                </div>
                <input 
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={onChange}
                    className="w-full accent-teal-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                {description && <p className="text-[10px] text-stone-500 italic leading-relaxed">{description}</p>}
            </div>
        );

        if (gid === "GRAPH_01") return (
            <SliderRow label="Henry's Law Constant (K_H)" value={simParams.GRAPH_01.kh}
                min="0.5" max="1.8" step="0.05" unit={`${(simParams.GRAPH_01.kh * 43.5).toFixed(1)} kbar`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_01: { ...prev.GRAPH_01, kh: parseFloat(e.target.value) } }))}
                description="Tweak K_H to see how a stronger solute-solvent affinity reduces the solubility slope or raises the required pressure." />
        );
        if (gid === "GRAPH_02") return (
            <div className="space-y-4">
                <SliderRow label="Vapour Pressure of Component 1 (p₁°)" value={simParams.GRAPH_02.p1}
                    min="0.4" max="1.6" step="0.05" unit={`${(simParams.GRAPH_02.p1 * 140).toFixed(0)} mm Hg`}
                    onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_02: { ...prev.GRAPH_02, p1: parseFloat(e.target.value) } }))} />
                <SliderRow label="Vapour Pressure of Component 2 (p₂°)" value={simParams.GRAPH_02.p2}
                    min="0.4" max="1.6" step="0.05" unit={`${(simParams.GRAPH_02.p2 * 240).toFixed(0)} mm Hg`}
                    onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_02: { ...prev.GRAPH_02, p2: parseFloat(e.target.value) } }))}
                    description="Vary pure vapour pressures to watch the linear total pressure boundary lines tilt under ideal conditions." />
            </div>
        );
        if (gid === "GRAPH_03") return (
            <SliderRow label="Vapour Pressure of Pure Solvent (p₁°)" value={simParams.GRAPH_03.p1}
                min="0.5" max="1.5" step="0.05" unit={`${(simParams.GRAPH_03.p1 * 240).toFixed(0)} mm Hg`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_03: { ...prev.GRAPH_03, p1: parseFloat(e.target.value) } }))}
                description="Tweak pure solvent pressure to see the linear pressure lowering line scale and slope down toward zero." />
        );
        if (gid === "GRAPH_04") return (
            <SliderRow label="Solute-Solvent Repulsion Force" value={simParams.GRAPH_04.dev}
                min="0.0" max="2.0" step="0.1" unit={`${(simParams.GRAPH_04.dev * 100).toFixed(0)}% deviation`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_04: { ...prev.GRAPH_04, dev: parseFloat(e.target.value) } }))}
                description="Increasing deviation bends partial pressures upward, forming a maximum peak (minimum-boiling azeotrope)." />
        );
        if (gid === "GRAPH_05") return (
            <SliderRow label="Solute-Solvent Attraction Force" value={simParams.GRAPH_05.dev}
                min="0.0" max="2.0" step="0.1" unit={`${(simParams.GRAPH_05.dev * 100).toFixed(0)}% deviation`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_05: { ...prev.GRAPH_05, dev: parseFloat(e.target.value) } }))}
                description="Increasing deviation sags the curves downward, creating a vapour pressure valley (maximum-boiling azeotrope)." />
        );
        if (gid === "GRAPH_06") return (
            <SliderRow label="Molal Concentration of Solute (m)" value={simParams.GRAPH_06.conc}
                min="0.0" max="2.0" step="0.1" unit={`${(simParams.GRAPH_06.conc * 1.5).toFixed(2)} mol/kg`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_06: { ...prev.GRAPH_06, conc: parseFloat(e.target.value) } }))}
                description="Increasing solute concentration pushes the solution vapour pressure curve right, driving ΔT_b to higher values." />
        );
        if (gid === "GRAPH_07") return (
            <SliderRow label="Molal Concentration of Solute (m)" value={simParams.GRAPH_07.conc}
                min="0.0" max="2.0" step="0.1" unit={`${(simParams.GRAPH_07.conc * 1.5).toFixed(2)} mol/kg`}
                onChange={(e) => setSimParams(prev => ({ ...prev, GRAPH_07: { ...prev.GRAPH_07, conc: parseFloat(e.target.value) } }))}
                description="Adding solute lowers the liquid solvent vapour pressure, causing the freezing point to intersect at a depressed temperature." />
        );
        return <p className="text-[10px] text-stone-500">No interactive parameters available for this graph.</p>;
    };

    // Count available traps for badge
    const trapsCount = activeGraph ? [
        activeGraph.silly_mistake_tracker?.axis_inversion_trap,
        activeGraph.silly_mistake_tracker?.unit_mismatch_warning,
        activeGraph.silly_mistake_tracker?.extrapolation_error
    ].filter(Boolean).length : 0;

    const landmarkCount = activeGraph?.critical_nodes_and_anomalies?.length || 0;

    return (
        <div className="w-full space-y-5 select-none relative">
            
            {/* ─── Search & Filter Toolbar ─── */}
            <div className="p-4 bg-[#141414] border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search graphs, concepts, nodes..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setSelectedGraphIndex(0); }}
                        className="w-full bg-[#1e1e1e] border border-white/5 hover:border-white/10 focus:border-teal-500/40 rounded-xl px-4 py-2.5 pl-9 text-xs text-white placeholder-stone-600 focus:outline-none transition-all duration-300"
                    />
                    <span className="absolute left-3.5 top-3 text-[11px] text-stone-500">🔍</span>
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSelectedGraphIndex(0); }}
                            className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-300 text-[10px]">✕</button>
                    )}
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mr-1">Priority:</span>
                    {['ALL', 'HIGH', 'MEDIUM'].map((prio) => (
                        <button key={prio}
                            onClick={() => { setSelectedPriority(prio); setSelectedGraphIndex(0); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 uppercase ${
                                selectedPriority === prio
                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                    : 'bg-white/5 text-stone-400 border border-white/5 hover:text-stone-200'
                            }`}
                        >{prio}</button>
                    ))}
                </div>
            </div>

            {/* ─── Quick Navigation Ledger ─── */}
            <div className="flex flex-col gap-2.5 bg-[#141414]/30 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Quick Navigation Ledger</span>
                        <span className="text-[9px] text-stone-600 mt-0.5">Click any graph card to switch plots.</span>
                    </div>
                    {filteredGraphs.length > 0 && (
                        <span className="text-[10px] font-bold text-teal-400 font-mono bg-teal-950/20 px-2 py-0.5 rounded border border-teal-500/10">
                            {filteredGraphs[selectedGraphIndex] ? selectedGraphIndex + 1 : 1} of {filteredGraphs.length}
                        </span>
                    )}
                </div>
                <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none custom-scrollbar select-none">
                    {filteredGraphs.length > 0 ? (
                        filteredGraphs.map((graph, idx) => {
                            const isSelected = (filteredGraphs[selectedGraphIndex] ? selectedGraphIndex : 0) === idx;
                            const priority = graph.metadata?.priority_tier || 'LOW';
                            return (
                                <button key={graph.graph_id} onClick={() => setSelectedGraphIndex(idx)}
                                    className={`px-4 py-3 rounded-xl border shrink-0 text-left transition-all duration-300 flex flex-col gap-1 min-w-[150px] md:min-w-[180px] ${
                                        isSelected
                                            ? 'bg-teal-950/25 text-white border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] scale-[1.02]'
                                            : 'bg-white/5 text-stone-400 border-white/5 hover:border-white/10 hover:text-stone-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[9px] font-mono font-bold tracking-wider opacity-60">{graph.graph_id}</span>
                                        <ChemistryBadge variant={getPriorityColor(priority)} className="text-[8px] px-1 py-0 scale-90 origin-right">{priority}</ChemistryBadge>
                                    </div>
                                    <span className="text-xs font-extrabold truncate w-full">{graph.graph_name}</span>
                                </button>
                            );
                        })
                    ) : (
                        <span className="text-xs text-stone-500 italic py-2">No matching graphs found matching your filter parameters.</span>
                    )}
                </div>
            </div>

            {/* ─── Main Workspace ─── */}
            <div className="w-full min-w-0">
                {activeGraph ? (
                    <div className="space-y-5 animate-fade-in">
                        
                        {/* ─── Title Bar ─── */}
                        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500" />
                            <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase block">
                                        {activeGraph.graph_id} Lab Workspace
                                    </span>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight truncate">
                                        {activeGraph.graph_name}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                                    <button disabled={selectedGraphIndex === 0}
                                        onClick={() => setSelectedGraphIndex(prev => Math.max(0, prev - 1))}
                                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                                            selectedGraphIndex === 0
                                                ? 'opacity-30 cursor-not-allowed border-white/5 text-stone-600'
                                                : 'bg-white/5 border-white/5 text-stone-300 hover:text-white hover:bg-white/10'
                                        }`} title="Previous Graph">◀ Prev</button>
                                    <ChemistryBadge variant={getPriorityColor(activeGraph.metadata?.priority_tier)} className="py-1 px-2.5 text-[10px]">
                                        {activeGraph.metadata?.priority_tier}
                                    </ChemistryBadge>
                                    <button disabled={selectedGraphIndex === filteredGraphs.length - 1}
                                        onClick={() => setSelectedGraphIndex(prev => Math.min(filteredGraphs.length - 1, prev + 1))}
                                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                                            selectedGraphIndex === filteredGraphs.length - 1
                                                ? 'opacity-30 cursor-not-allowed border-white/5 text-stone-600'
                                                : 'bg-white/5 border-white/5 text-stone-300 hover:text-white hover:bg-white/10'
                                        }`} title="Next Graph">Next ▶</button>
                                </div>
                            </div>
                        </div>

                        {/* ─── Immersive Graph Hero + Integrated Simulator ─── */}
                        <div className="relative bg-[#0c0c0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            
                            {/* SVG Canvas */}
                            <div className="relative p-6 sm:p-8 flex flex-col justify-center items-center">
                                <div className="absolute top-3 left-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold tracking-widest text-stone-600 uppercase select-none">Interactive Canvas</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                </div>
                                <div 
                                    className="svg-container w-full max-w-2xl mx-auto p-4 mt-4 flex justify-center items-center select-none bg-stone-950/40 border border-white/[0.04] rounded-2xl [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[420px] [&_text:not([fill])]:fill-stone-200 [&_text]:stroke-none"
                                    dangerouslySetInnerHTML={{ __html: themeSvgString(activeGraph.svg_rendering_block, activeGraph.graph_id) }}
                                />
                            </div>

                            {/* Integrated Simulator Dock */}
                            <div className="border-t border-white/5">
                                <button 
                                    onClick={() => setIsSimOpen(!isSimOpen)}
                                    className="w-full px-5 py-3 flex justify-between items-center text-left hover:bg-white/[0.01] transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-sm">🎛️</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Simulator Controls</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSimParams(prev => ({
                                                    ...prev,
                                                    [activeGraph.graph_id]: {
                                                        GRAPH_01: { kh: 1.0 }, GRAPH_02: { p1: 1.0, p2: 1.0 },
                                                        GRAPH_03: { p1: 1.0 }, GRAPH_04: { dev: 1.0 },
                                                        GRAPH_05: { dev: 1.0 }, GRAPH_06: { conc: 1.0 },
                                                        GRAPH_07: { conc: 1.0 }
                                                    }[activeGraph.graph_id]
                                                }));
                                            }}
                                            className="text-[10px] text-stone-500 hover:text-stone-300 font-bold uppercase tracking-wider transition-colors px-2 py-0.5 rounded hover:bg-white/5"
                                        >Reset</button>
                                        <span className={`text-stone-500 text-[10px] transition-transform duration-300 ${isSimOpen ? 'rotate-180' : ''}`}>▼</span>
                                    </div>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {isSimOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 pt-1">
                                                {renderSimulatorSliders()}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ─── Unified Tabbed Knowledge Panel ─── */}
                        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                            
                            {/* Tab Bar */}
                            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none">
                                {knowledgeTabs.map((tab) => {
                                    const isActive = activeKnowledgeTab === tab.id;
                                    // Show badge count for landmarks and traps
                                    let badge = null;
                                    if (tab.id === 'landmarks' && landmarkCount > 0) badge = landmarkCount;
                                    if (tab.id === 'traps' && trapsCount > 0) badge = trapsCount;
                                    
                                    // Hide tabs with no content
                                    if (tab.id === 'landmarks' && landmarkCount === 0) return null;
                                    if (tab.id === 'traps' && !activeGraph.silly_mistake_tracker) return null;

                                    return (
                                        <button key={tab.id} onClick={() => setActiveKnowledgeTab(tab.id)}
                                            className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                                                isActive
                                                    ? 'text-teal-300 bg-white/[0.02]'
                                                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/[0.01]'
                                            }`}
                                        >
                                            <span className="text-sm">{tab.icon}</span>
                                            <span>{tab.label}</span>
                                            {badge && (
                                                <span className="ml-1 bg-teal-500/20 text-teal-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-teal-500/20">
                                                    {badge}
                                                </span>
                                            )}
                                            {isActive && (
                                                <motion.div layoutId="activeTabIndicator"
                                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-400"
                                                    transition={{ duration: 0.25 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeKnowledgeTab}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-5 sm:p-6"
                                >
                                    {/* ── Math & Axes Tab ── */}
                                    {activeKnowledgeTab === 'math' && (
                                        <div className="space-y-5 text-xs text-stone-300">
                                            {activeGraph.mathematical_anatomy?.governing_equation && (
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center space-y-1.5">
                                                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Governing Equation</span>
                                                    <div className="text-lg py-2 overflow-x-auto no-scrollbar font-mono text-white flex justify-center">
                                                        <BlockMath math={normalizeLatex(activeGraph.mathematical_anatomy.governing_equation)} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5 p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                                                    <span className="font-bold text-[10px] text-teal-400 uppercase tracking-wider block">Y-Axis Parameter</span>
                                                    <p className="text-[11px] leading-relaxed"><FormatText>{activeGraph.cartesian_mechanics?.y_axis_parameter}</FormatText></p>
                                                </div>
                                                <div className="space-y-1.5 p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                                                    <span className="font-bold text-[10px] text-teal-400 uppercase tracking-wider block">X-Axis Parameter</span>
                                                    <p className="text-[11px] leading-relaxed"><FormatText>{activeGraph.cartesian_mechanics?.x_axis_parameter}</FormatText></p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                                        <span className="text-stone-500">Linearity Profile</span>
                                                        <span className="font-bold text-white">{activeGraph.mathematical_anatomy?.linearity_profile}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                                        <span className="text-stone-500">Slope Identity</span>
                                                        <span className="font-mono text-teal-300 font-medium">
                                                            <FormatText>{activeGraph.mathematical_anatomy?.slope_identity}</FormatText>
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                                        <span className="text-stone-500">Intercept Identity</span>
                                                        <span className="font-mono text-teal-300 font-medium">
                                                            <FormatText>{activeGraph.mathematical_anatomy?.intercept_identity}</FormatText>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl h-full flex flex-col justify-between">
                                                    <span className="font-bold text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Boundary Conditions</span>
                                                    <p className="text-[11px] leading-relaxed text-stone-300">
                                                        <FormatText>{activeGraph.cartesian_mechanics?.boundary_conditions}</FormatText>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Concept Tab ── */}
                                    {activeKnowledgeTab === 'concept' && (
                                        <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
                                            <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                                                <span className="text-[10px] uppercase font-bold text-teal-300 block mb-1">Governing Principle</span>
                                                <span className="font-extrabold text-sm text-white block">
                                                    {activeGraph.core_concept_mapping?.governing_principle}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-stone-500 block">Molecular Interpretation</span>
                                                <p className="text-stone-300 text-xs font-medium leading-relaxed">
                                                    <FormatText>{activeGraph.core_concept_mapping?.molecular_interpretation}</FormatText>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Landmarks Tab ── */}
                                    {activeKnowledgeTab === 'landmarks' && activeGraph.critical_nodes_and_anomalies && (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {activeGraph.critical_nodes_and_anomalies.map((node, index) => (
                                                    <button key={index} onClick={() => setActiveNodeIndex(index)}
                                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 ${
                                                            activeNodeIndex === index
                                                                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/35 shadow-sm'
                                                                : 'bg-white/5 text-stone-400 border border-white/5 hover:text-stone-200'
                                                        }`}
                                                    >{node.node_name}</button>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] uppercase font-bold text-teal-400 tracking-wider">Landmark Coordinate</span>
                                                    <h5 className="font-bold text-xs text-white">
                                                        {activeGraph.critical_nodes_and_anomalies[activeNodeIndex]?.node_name}
                                                    </h5>
                                                </div>
                                                <div className="flex gap-2 items-start py-1 px-2.5 bg-black/40 border border-white/5 rounded-xl text-[11px] font-mono text-teal-300">
                                                    <span className="text-stone-500 select-none">Coord:</span>
                                                    <span><FormatText>{activeGraph.critical_nodes_and_anomalies[activeNodeIndex]?.coordinates_or_region}</FormatText></span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">Physical Significance</span>
                                                    <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                        <FormatText>{activeGraph.critical_nodes_and_anomalies[activeNodeIndex]?.physical_significance}</FormatText>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Traps Tab ── */}
                                    {activeKnowledgeTab === 'traps' && activeGraph.silly_mistake_tracker && (
                                        <div className="space-y-4 text-xs">
                                            {activeGraph.silly_mistake_tracker.axis_inversion_trap && (
                                                <div className="p-4 bg-amber-500/[0.03] border border-amber-500/20 rounded-xl flex gap-3">
                                                    <span className="text-amber-500 text-sm shrink-0">⚠️</span>
                                                    <div className="space-y-0.5">
                                                        <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest">Axis Inversion Trap</span>
                                                        <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                            <FormatText>{activeGraph.silly_mistake_tracker.axis_inversion_trap}</FormatText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {activeGraph.silly_mistake_tracker.unit_mismatch_warning && (
                                                <div className="p-4 bg-rose-500/[0.03] border border-rose-500/20 rounded-xl flex gap-3">
                                                    <span className="text-rose-400 text-sm shrink-0">🚫</span>
                                                    <div className="space-y-0.5">
                                                        <span className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest">Unit Mismatch Trap</span>
                                                        <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                            <FormatText>{activeGraph.silly_mistake_tracker.unit_mismatch_warning}</FormatText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {activeGraph.silly_mistake_tracker.extrapolation_error && (
                                                <div className="p-4 bg-stone-500/5 border border-white/5 rounded-xl flex gap-3">
                                                    <span className="text-stone-400 text-sm shrink-0">⚙️</span>
                                                    <div className="space-y-0.5">
                                                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Extrapolation Error</span>
                                                        <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                                                            <FormatText>{activeGraph.silly_mistake_tracker.extrapolation_error}</FormatText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-500 bg-[#141414] rounded-3xl border border-dashed border-white/5">
                        <span className="text-3xl mb-3">📈</span>
                        <p className="text-sm font-medium">Please select a graph from the catalog index.</p>
                    </div>
                )}
            </div>

            {/* ─── Floating Board Question FAB ─── */}
            <AnimatePresence>
                {activeGraph?.exhaustive_question_bank?.length > 0 && !isExamModalOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsExamModalOpen(true)}
                        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-full text-xs font-bold shadow-[0_4px_25px_rgba(20,184,166,0.4)] hover:shadow-[0_4px_35px_rgba(20,184,166,0.55)] transition-all duration-300 uppercase tracking-wider"
                        title="Try a Board Exam Question"
                    >
                        <span className="text-sm">🎯</span>
                        <span>Try Board Question</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ─── Exam Question Modal ─── */}
            <AnimatePresence>
                {isExamModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative w-full max-w-3xl bg-[#141416] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                        >
                            <button 
                                onClick={() => setIsExamModalOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                            >✕</button>

                            <div className="space-y-6">
                                <div className="space-y-1.5 pr-8 border-b border-white/5 pb-4">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">Board Practice Exercise</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-extrabold text-white">
                                            {activeGraph.exhaustive_question_bank[0]?.question_type || 'Exam Challenge'}
                                        </h3>
                                        <ChemistryBadge variant="glow" className="text-[9px]">
                                            Yield: {activeGraph.metadata?.max_mark_yield}
                                        </ChemistryBadge>
                                    </div>
                                </div>

                                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                                    <span className="text-[9px] uppercase font-black text-stone-500 tracking-widest block">Exam Question</span>
                                    <p className="text-sm font-medium text-white leading-relaxed">
                                        <FormatText>{activeGraph.exhaustive_question_bank[0]?.question_text}</FormatText>
                                    </p>
                                </div>

                                {activeGraph.exhaustive_question_bank[0]?.examiner_marking_rubric && (
                                    <div className="space-y-2">
                                        <span className="text-[9px] uppercase font-black text-stone-500 tracking-widest block">Examiner Marking Rubric</span>
                                        <div className="p-4 bg-teal-500/[0.01] border border-teal-500/20 rounded-2xl text-xs text-stone-300 leading-relaxed font-medium">
                                            <FormatText>{activeGraph.exhaustive_question_bank[0].examiner_marking_rubric}</FormatText>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col items-center gap-4">
                                    <button
                                        onClick={() => setRevealExamAnswer(!revealExamAnswer)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-wide ${
                                            revealExamAnswer
                                                ? 'bg-stone-850 text-stone-400 border border-white/10 hover:text-white'
                                                : 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.35)] hover:bg-teal-400'
                                        }`}
                                    >
                                        {revealExamAnswer ? 'Hide Perfect Answer' : 'Reveal Ideal Response'}
                                    </button>

                                    <AnimatePresence>
                                        {revealExamAnswer && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.25 }}
                                                className="w-full text-left p-6 bg-emerald-500/[0.01] border border-emerald-500/20 rounded-2xl space-y-2 shadow-inner"
                                            >
                                                <span className="text-[9px] uppercase font-black text-emerald-400 tracking-widest block">Perfect Response (Full Credit)</span>
                                                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                                                    <FormatText>{activeGraph.exhaustive_question_bank[0].perfect_response_script}</FormatText>
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
};

export default ChemistryGraphDeck;
