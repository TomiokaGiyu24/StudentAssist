import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGraphsContent, loadChapterContent, getChapterFileSlug, loadPhysicsQuestions } from '../utils/contentLoader';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { 
    ArrowLeft, Sliders, AlertTriangle, Shield, CheckSquare, 
    TrendingUp, BarChart2, HelpCircle, Search, Sparkles, ChevronLeft, ChevronRight, Award, Info,
    Eye, Layers, Flame, Zap
} from 'lucide-react';
import LatexText from '../components/LatexText';

/* =========================================================
   EXTRACT GRAPHS HELPER
   Safely extracts graph profiles array from JSON data
   ========================================================= */
const extractGraphs = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
        if (data[0]?.chapter_graph_bank?.graphs) return data[0].chapter_graph_bank.graphs;
        if (data[0]?.graphs) return data[0].graphs;
        return data;
    }
    if (data.chapter_graph_profiles) return data.chapter_graph_profiles;
    if (data.graphs) return data.graphs;
    if (data.chapter_graph_bank?.graphs) return data.chapter_graph_bank.graphs;
    return [];
};

/* =========================================================
   INTERACTIVE SVG VECTOR PLOTTER COMPONENT (HERO BIG SCALE)
   800x500 ViewBox with energetic, warm neon curves
   ========================================================= */
const InteractiveSVGPlot = ({ graphId, params, activeTab, transType, xAxisLabel, yAxisLabel, presetMode }) => {
    const width = 800;
    const height = 500;
    const padding = 75;

    // Helper: Draw Warm Grid lines
    const renderGrid = () => {
        const lines = [];
        for (let y = padding; y <= height - padding; y += 45) {
            lines.push(
                <line 
                    key={`h-${y}`} 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.06)" 
                    strokeWidth="1"
                    strokeDasharray="4,6"
                />
            );
        }
        for (let x = padding; x <= width - padding; x += 65) {
            lines.push(
                <line 
                    key={`v-${x}`} 
                    x1={x} 
                    y1={padding} 
                    x2={x} 
                    y2={height - padding} 
                    stroke="rgba(255, 255, 255, 0.06)" 
                    strokeWidth="1"
                    strokeDasharray="4,6"
                />
            );
        }
        return lines;
    };

    // Helper: Draw Axes & Origin with Warm Colors
    const renderAxes = () => {
        return (
            <g>
                <line 
                    x1={padding} 
                    y1={height - padding} 
                    x2={width - padding + 25} 
                    y2={height - padding} 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                />
                <line 
                    x1={padding} 
                    y1={height - padding} 
                    x2={padding} 
                    y2={padding - 25} 
                    stroke="rgba(255, 255, 255, 0.5)" 
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                />
                <circle cx={padding} cy={height - padding} r="5" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" />
                <text 
                    x={padding - 20} 
                    y={height - padding + 22} 
                    fill="rgba(255, 255, 255, 0.6)" 
                    fontSize="12" 
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    (0,0)
                </text>
            </g>
        );
    };

    // Render Curves based on Graph ID & Parameter States
    const renderGraphPaths = () => {
        const paths = [];
        const originX = padding;
        const originY = height - padding;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        if (graphId === "CH1-GR-01") {
            const k = parseFloat(params.gr1Permittivity || 1); 
            const chargeProd = parseFloat(params.gr1ChargeProduct || 1.0); 
            
            if (presetMode === 'hyperbola' || (activeTab === 'transformations' && transType === 0)) {
                const points = [];
                const C = 160000 * chargeProd / k;
                for (let xMath = 30; xMath <= graphWidth; xMath++) {
                    const yVal = C / (xMath * xMath);
                    const xSvg = originX + xMath;
                    const ySvg = originY - Math.min(graphHeight, yVal);
                    points.push(`${xSvg},${ySvg}`);
                }
                paths.push(
                    <path 
                        key="hyperbola"
                        d={`M ${points.join(' L ')}`} 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="4.5"
                    />
                );
                paths.push(
                    <text key="lbl" x={width - 240} y={160} fill="#10B981" fontSize="15" fontFamily="monospace" fontWeight="bold">
                        F ∝ 1/r² (Hyperbolic Decay)
                    </text>
                );
            } 
            else if (presetMode === 'log') {
                const startX = originX + 30;
                const startY = padding + 50;
                const endX = width - padding - 30;
                const endY = originY - 30;
                paths.push(
                    <line 
                        key="log-line"
                        x1={startX} 
                        y1={startY} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#A855F7" 
                        strokeWidth="4.5"
                    />
                );
                paths.push(
                    <text key="log-slope" x={endX - 160} y={endY - 20} fill="#A855F7" fontSize="14" fontFamily="monospace" fontWeight="bold">
                        ln(F) vs ln(r) [Slope m = -2]
                    </text>
                );
            }
            else {
                const slope1 = (0.6 * chargeProd) / k;
                const slope2 = 0.32 / k; 

                const dashLen = graphWidth * 0.05;
                const midX1 = originX + dashLen;
                const midY1 = originY - (dashLen * slope1);
                const endX1 = originX + graphWidth - 30;
                const endY1 = originY - ((graphWidth - 30) * slope1);

                paths.push(
                    <line 
                        key="line1-dash"
                        x1={originX} 
                        y1={originY} 
                        x2={midX1} 
                        y2={midY1} 
                        stroke="#10B981" 
                        strokeWidth="4"
                        strokeDasharray="4,4"
                    />
                );
                paths.push(
                    <line 
                        key="line1-solid"
                        x1={midX1} 
                        y1={midY1} 
                        x2={endX1} 
                        y2={endY1} 
                        stroke="#10B981" 
                        strokeWidth="4.5"
                    />
                );

                const midX2 = originX + dashLen;
                const midY2 = originY - (dashLen * slope2);
                const endX2 = originX + graphWidth - 20;
                const endY2 = originY - ((graphWidth - 20) * slope2);

                paths.push(
                    <line 
                        key="line2-dash"
                        x1={originX} 
                        y1={originY} 
                        x2={midX2} 
                        y2={midY2} 
                        stroke="#F59E0B" 
                        strokeWidth="3"
                        strokeDasharray="4,4"
                    />
                );
                paths.push(
                    <line 
                        key="line2-solid"
                        x1={midX2} 
                        y1={midY2} 
                        x2={endX2} 
                        y2={endY2} 
                        stroke="#F59E0B" 
                        strokeWidth="3.5"
                    />
                );

                paths.push(<text key="l1" x={endX1 - 100} y={endY1 - 15} fill="#10B981" fontSize="13" fontFamily="monospace" fontWeight="bold">F ∝ 1/r² (Vacuum)</text>);
                paths.push(<text key="l2" x={endX2 - 100} y={endY2 - 15} fill="#F59E0B" fontSize="12" fontFamily="monospace" fontWeight="bold">F_medium (K={k})</text>);
            }
        } 
        else if (graphId === "CH1-GR-02") {
            const isSolid = params.gr2SolidSphere === true || presetMode === 'solid';
            const q = parseFloat(params.gr2Charge || 1.0);
            const K = parseFloat(params.gr2Permittivity || 1.0);
            const R = 180; 

            const peakYMath = (200 * q) / K;
            const peakY = originY - peakYMath;
            const rx = originX + R;

            if (isSolid) {
                paths.push(
                    <line 
                        key="internal-linear"
                        x1={originX} 
                        y1={originY} 
                        x2={rx} 
                        y2={peakY} 
                        stroke="#10B981" 
                        strokeWidth="4.5"
                    />
                );
                paths.push(
                    <text key="lbl-int" x={originX + R/2} y={originY - peakYMath/2 - 14} fill="#10B981" fontSize="13" fontFamily="monospace" fontWeight="bold">
                        E ∝ r (Inside Solid Sphere)
                    </text>
                );
            } else {
                paths.push(
                    <line 
                        key="internal-zero"
                        x1={originX} 
                        y1={originY} 
                        x2={rx} 
                        y2={originY} 
                        stroke="#FB7185" 
                        strokeWidth="5"
                    />
                );
                paths.push(
                    <text key="lbl-zero" x={originX + R/2} y={originY - 14} fill="#FB7185" fontSize="13" fontFamily="monospace" fontWeight="bold">
                        E = 0 (Inside Shell)
                    </text>
                );
            }

            const pointsDecay = [];
            for (let xMath = R; xMath <= graphWidth; xMath++) {
                const yVal = peakYMath * (R * R) / (xMath * xMath);
                const xSvg = originX + xMath;
                const ySvg = originY - Math.min(graphHeight, yVal);
                pointsDecay.push(`${xSvg},${ySvg}`);
            }

            paths.push(
                <path 
                    key="external-decay"
                    d={`M ${pointsDecay.join(' L ')}`} 
                    fill="none" 
                    stroke="#C084FC" 
                    strokeWidth="4.5"
                />
            );

            paths.push(<line key="dashed-r" x1={rx} y1={originY} x2={rx} y2={peakY} stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4,4" />);
            paths.push(<circle key="r-dot" cx={rx} y1={originY} r="5" fill="#C084FC" />);
            paths.push(<text key="lbl-r" x={rx} y={originY + 22} fill="rgba(255,255,255,0.8)" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">r = R (Surface)</text>);
            paths.push(<text key="lbl-[#C084FC]" x={rx + 70} y={peakY + 25} fill="#C084FC" fontSize="13" fontFamily="monospace" fontWeight="bold">E ∝ 1/r² (Outside)</text>);
        }
        else if (graphId === "CH1-GR-03") {
            const pointsLine = [];
            for (let xMath = 30; xMath <= graphWidth; xMath++) {
                const yVal = (12000) / xMath;
                const xSvg = originX + xMath;
                const ySvg = originY - Math.min(graphHeight, yVal);
                pointsLine.push(`${xSvg},${ySvg}`);
            }
            paths.push(
                <path 
                    key="line-charge"
                    d={`M ${pointsLine.join(' L ')}`} 
                    fill="none" 
                    stroke="#A855F7" 
                    strokeWidth="4.5"
                />
            );
            paths.push(
                <text key="lbl-line" x={width - 220} y={originY - 110} fill="#A855F7" fontSize="14" fontFamily="monospace" fontWeight="bold">
                    E ∝ 1/r (Line Charge Decay)
                </text>
            );

            const pointsPoint = [];
            for (let xMath = 35; xMath <= graphWidth; xMath++) {
                const yVal = (280000) / (xMath * xMath);
                const xSvg = originX + xMath;
                const ySvg = originY - Math.min(graphHeight, yVal);
                pointsPoint.push(`${xSvg},${ySvg}`);
            }
            paths.push(
                <path 
                    key="point-charge-ref"
                    d={`M ${pointsPoint.join(' L ')}`} 
                    fill="none" 
                    stroke="rgba(255,255,255,0.4)" 
                    strokeWidth="3"
                    strokeDasharray="5,5"
                />
            );
            paths.push(
                <text key="lbl-point" x={width - 240} y={originY - 40} fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily="monospace">
                    E ∝ 1/r² (Point Charge Ref)
                </text>
            );
        }
        else if (graphId === "CH1-GR-04") {
            const fieldHeight = 160;
            paths.push(
                <line 
                    key="sheet-const"
                    x1={originX} 
                    y1={originY - fieldHeight} 
                    x2={originX + graphWidth - 30} 
                    y2={originY - fieldHeight} 
                    stroke="#F59E0B" 
                    strokeWidth="5"
                />
            );
            paths.push(<circle key="intercept-dot" cx={originX} cy={originY - fieldHeight} r="6" fill="#F59E0B" stroke="#ffffff" strokeWidth="2.5" />);
            paths.push(
                <text key="lbl-intercept" x={originX + 20} y={originY - fieldHeight - 16} fill="#ffffff" fontSize="14" fontFamily="monospace" fontWeight="bold">
                    E = σ / (2ε₀)
                </text>
            );
            paths.push(
                <text key="lbl-[#F59E0B]" x={width / 2} y={originY - fieldHeight + 35} fill="#F59E0B" fontSize="15" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    E ∝ r⁰ (Distance Independent Field)
                </text>
            );
        }
        else if (graphId === "CH1-GR-05") {
            const isAlpha = params.gr5Particle === 'alpha' || presetMode === 'alpha';
            const massScale = isAlpha ? 0.5 : 1.0;
            const C = 400000 * massScale;

            const pointsProton = [];
            for (let xMath = 40; xMath <= graphWidth; xMath++) {
                const yVal = C / (xMath * xMath);
                const xSvg = originX + xMath;
                const ySvg = originY - Math.min(graphHeight, yVal);
                pointsProton.push(`${xSvg},${ySvg}`);
            }

            paths.push(
                <path 
                    key="accel-proton"
                    d={`M ${pointsProton.join(' L ')}`} 
                    fill="none" 
                    stroke="#FB7185" 
                    strokeWidth="4.5"
                />
            );
            paths.push(
                <text key="lbl-accel" x={width - 240} y={originY - 120} fill="#FB7185" fontSize="14" fontFamily="monospace" fontWeight="bold">
                    a ∝ 1/r² ({isAlpha ? 'Alpha Particle' : 'Proton'})
                </text>
            );
        }
        else {
            const points = [];
            for (let xMath = 30; xMath <= graphWidth; xMath++) {
                const yVal = (250000) / (xMath + 40);
                const xSvg = originX + xMath;
                const ySvg = originY - Math.min(graphHeight, yVal);
                points.push(`${xSvg},${ySvg}`);
            }
            paths.push(
                <path 
                    key="generic-curve"
                    d={`M ${points.join(' L ')}`} 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="4.5"
                />
            );
        }

        return paths;
    };

    return (
        <div className="w-full h-full bg-[#0F0F17] rounded-3xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-2xl">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-h-[520px]"
            >
                <defs>
                    <marker 
                        id="arrow" 
                        viewBox="0 0 10 10" 
                        refX="6" 
                        refY="5" 
                        markerWidth="7" 
                        markerHeight="7" 
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.7)" />
                    </marker>
                </defs>
                {renderGrid()}
                {renderGraphPaths()}
                {renderAxes()}

                {/* Y-Axis Label */}
                <foreignObject x={padding + 10} y={15} width={230} height={50} className="overflow-visible select-none pointer-events-none">
                    <div xmlns="http://www.w3.org/1999/xhtml" className="text-xs font-mono text-purple-300 bg-[#161622]/95 border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-lg leading-none inline-block">
                        <span className="text-[8px] uppercase tracking-widest text-amber-400 block mb-0.5 font-bold">Y-Axis Variable</span>
                        <LatexText text={yAxisLabel} />
                    </div>
                </foreignObject>

                {/* X-Axis Label */}
                <foreignObject x={width - padding - 150} y={height - padding + 12} width={230} height={50} className="overflow-visible select-none pointer-events-none">
                    <div xmlns="http://www.w3.org/1999/xhtml" className="text-xs font-mono text-purple-300 bg-[#161622]/95 border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-lg leading-none inline-block float-right text-right">
                        <span className="text-[8px] uppercase tracking-widest text-amber-400 block mb-0.5 font-bold">X-Axis Variable</span>
                        <LatexText text={xAxisLabel} />
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
};

/* =========================================================
   INTERACTIVE QUESTION CARD COMPONENT
   ========================================================= */
const InteractiveQuestionCard = ({ question }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const isCorrect = selectedOption === question.correct_option;

    return (
        <div className="bg-[#14141F]/80 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-purple-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                    {question.question_id}
                </span>
                <span className="text-[10px] font-mono uppercase bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-lg font-bold">
                    {question.format || 'MCQ'}
                </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                <LatexText text={question.stem_text} />
            </p>

            {question.options && (
                <div className="space-y-2.5 pt-2">
                    {Object.entries(question.options).map(([key, label]) => {
                        const isChosen = selectedOption === key;
                        const isOptionCorrect = key === question.correct_option;
                        
                        let optionStyle = "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5";
                        if (isChosen) {
                            optionStyle = isCorrect 
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                : "bg-rose-500/20 border-rose-500/40 text-rose-300";
                        } else if (selectedOption !== null && isOptionCorrect) {
                            optionStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold";
                        }

                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedOption(key)}
                                className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="font-bold uppercase text-slate-400 shrink-0">{key}.</span>
                                    <LatexText text={label} />
                                </span>
                                {isChosen && (
                                    <span className="text-xs font-bold shrink-0">
                                        {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* =========================================================
   MAIN PHYSICS GRAPHS PAGE COMPONENT (WARM VIBRANT OBSIDIAN PALETTE)
   ========================================================= */
function PhysicsGraphsPage() {
    const { chapterId, subjectId: paramSubjectId } = useParams();
    const subjectId = paramSubjectId || 'physics';

    // State Hooks
    const [graphsList, setGraphsList] = useState([]);
    const [chapterInfo, setChapterInfo] = useState(null);
    const [matchedQuestions, setMatchedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGraphIndex, setSelectedGraphIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('plotter');
    const [activeTransIndex, setActiveTransIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFallbackMode, setIsFallbackMode] = useState(false);
    const [presetMode, setPresetMode] = useState('default');

    // Graph Parameters State
    const [graphParams, setGraphParams] = useState({
        gr1ChargeProduct: 1.0,
        gr1Permittivity: '1',
        gr2SolidSphere: false,
        gr2Charge: 1.0,
        gr2Permittivity: '1',
        gr5Particle: 'proton',
        gr5Transform: 'none'
    });

    const updateParam = (key, value) => {
        setGraphParams(prev => ({ ...prev, [key]: value }));
    };

    // Checked checkpoints state with LocalStorage persistence
    const [checkedItems, setCheckedItems] = useState(() => {
        try {
            const stored = localStorage.getItem(`physics-graph-checkpoints-${chapterId}`);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem(`physics-graph-checkpoints-${chapterId}`, JSON.stringify(checkedItems));
    }, [checkedItems, chapterId]);

    // Keyboard Arrow Navigation
    const handlePrevGraph = useCallback(() => {
        if (graphsList.length === 0) return;
        setSelectedGraphIndex(prev => (prev === 0 ? graphsList.length - 1 : prev - 1));
        setPresetMode('default');
    }, [graphsList]);

    const handleNextGraph = useCallback(() => {
        if (graphsList.length === 0) return;
        setSelectedGraphIndex(prev => (prev === graphsList.length - 1 ? 0 : prev + 1));
        setPresetMode('default');
    }, [graphsList]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrevGraph();
            if (e.key === 'ArrowRight') handleNextGraph();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevGraph, handleNextGraph]);

    const toggleCheckbox = (idx) => {
        const currentG = graphsList[selectedGraphIndex];
        if (!currentG) return;
        const key = `${currentG.graph_id}-${idx}`;
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Fetch Graphs & Chapter Content
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const fileSlug = getChapterFileSlug('physics', chapterId) || chapterId;
                let rawGData = await loadGraphsContent('physics', chapterId);
                let extracted = extractGraphs(rawGData);

                if (!extracted || extracted.length === 0) {
                    const fallbackData = await loadGraphsContent('physics', 'electric-charges');
                    extracted = extractGraphs(fallbackData);
                    setIsFallbackMode(true);
                } else {
                    setIsFallbackMode(false);
                }

                const cData = await loadChapterContent('physics', fileSlug);
                const qData = await loadPhysicsQuestions(chapterId);

                setGraphsList(extracted);
                setSelectedGraphIndex(0);

                if (cData) {
                    setChapterInfo(cData);
                }

                if (qData && Array.isArray(qData)) {
                    let allQs = [];
                    qData.forEach(item => {
                        if (item.questions) allQs = [...allQs, ...item.questions];
                    });
                    setMatchedQuestions(allQs);
                }
            } catch (err) {
                console.error("Failed to load graphs page content:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [chapterId]);

    // Filter Graphs by Search Query
    const filteredGraphs = useMemo(() => {
        if (!searchQuery.trim()) return graphsList;
        const q = searchQuery.toLowerCase();
        return graphsList.filter(g => 
            g.title.toLowerCase().includes(q) ||
            g.graph_id.toLowerCase().includes(q) ||
            (g.ncert_reference_section && g.ncert_reference_section.toLowerCase().includes(q))
        );
    }, [graphsList, searchQuery]);

    const currentGraph = graphsList[selectedGraphIndex] || graphsList[0];

    // Active Graph Axes
    const axes = useMemo(() => {
        if (!currentGraph) return { x: 'x', y: 'y' };
        const base = currentGraph.base_axis_definition || currentGraph.standard_axes || {};
        return {
            x: base.x_axis || 'x',
            y: base.y_axis || 'y'
        };
    }, [currentGraph]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-amber-400 font-mono text-sm">
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-8 py-5 rounded-3xl shadow-2xl backdrop-blur-xl">
                    <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
                    <span className="tracking-wider">Building Vibrant Physics Graph Laboratory...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-slate-200 font-sans selection:bg-purple-500/30 pb-20">
            
            {/* HERO HEADER BAR - WARM VIOLET & GOLD OBSIDIAN */}
            <header className="border-b border-white/10 bg-[#12121A]/90 backdrop-blur-2xl sticky top-0 z-30 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link 
                            to={`/subjects/${subjectId}/chapters/${chapterId}`}
                            className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Physics Graph Lab
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono font-semibold">
                                    {chapterInfo?.chapter || 'Physics Chapter'}
                                </span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent tracking-tight leading-tight mt-0.5">
                                Vibrant Visual Graph Explorer
                            </h1>
                        </div>
                    </div>

                    {/* Arrow Navigation Deck Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-2xl">
                            <button
                                onClick={handlePrevGraph}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                                title="Previous Graph (Left Arrow)"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="text-xs font-mono font-extrabold text-amber-400 px-2">
                                Graph {selectedGraphIndex + 1} of {graphsList.length}
                            </span>

                            <button
                                onClick={handleNextGraph}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                                title="Next Graph (Right Arrow)"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT CONTAINER */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                
                {/* Fallback Banner Notice */}
                {isFallbackMode && (
                    <div className="mb-6 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-200">
                        <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                            <span className="font-bold block">Viewing Master Physics Graph Laboratory (Core Profiles)</span>
                            <span className="text-[11px] text-slate-400">
                                Universal Physics graph profiles, parameter mutators, and examiner traps designed for an inspiring, calm study session.
                            </span>
                        </div>
                    </div>
                )}

                {/* GRAPH SELECTION HORIZONTAL BAR */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
                    <div className="flex overflow-x-auto pb-2 custom-scrollbar select-none gap-2.5">
                        {filteredGraphs.map((g, index) => {
                            const isSelected = selectedGraphIndex === index;
                            return (
                                <button
                                    key={g.graph_id}
                                    onClick={() => {
                                        setSelectedGraphIndex(index);
                                        setPresetMode('default');
                                    }}
                                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-bold text-xs shrink-0 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                                            : 'bg-[#14141F]/80 text-slate-400 border-white/5 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-black">
                                        {g.graph_id}
                                    </span>
                                    <span className="tracking-tight max-w-[200px] truncate">{g.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative min-w-[240px]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search graph profiles..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#14141F]/80 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    </div>
                </div>

                {/* ===== HERO GRAPH CANVAS (ATTENTION-MAGNET BIG VIEW) ===== */}
                {currentGraph && (
                    <div className="space-y-8">
                        
                        {/* HERO CANVAS CONTAINER */}
                        <div className="bg-[#12121A]/90 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative">
                            
                            {/* Profile Header with Side Arrow Navigation */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-amber-400">
                                            PROFILE {currentGraph.graph_id}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-300 font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                            NCERT {currentGraph.ncert_reference_section}
                                        </span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                        {currentGraph.title}
                                    </h2>
                                </div>

                                {/* Arrow Deck Buttons on Hero Canvas */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevGraph}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Previous Graph</span>
                                    </button>

                                    <button
                                        onClick={handleNextGraph}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <span className="hidden sm:inline">Next Graph</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* 1-CLICK QUICK VARIATION PRESET SWITCHER BAR */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 select-none custom-scrollbar">
                                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Presets:
                                </span>

                                <button
                                    onClick={() => setPresetMode('default')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                        presetMode === 'default'
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    ⚡ Standard Profile
                                </button>

                                {currentGraph.graph_id === 'CH1-GR-01' && (
                                    <>
                                        <button
                                            onClick={() => setPresetMode('hyperbola')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                                presetMode === 'hyperbola'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <LatexText text="🌊 Hyperbolic Decay ($F \propto 1/r^2$)" />
                                        </button>
                                        <button
                                            onClick={() => setPresetMode('log')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                                presetMode === 'log'
                                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <LatexText text="🔬 Log Linear ($\ln F \text{ vs } \ln r$)" />
                                        </button>
                                    </>
                                )}

                                {currentGraph.graph_id === 'CH1-GR-02' && (
                                    <button
                                        onClick={() => setPresetMode(presetMode === 'solid' ? 'default' : 'solid')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                            presetMode === 'solid'
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <LatexText text="⚪ Solid Sphere ($E \propto r$ inside)" />
                                    </button>
                                )}
                            </div>

                            {/* EXTRA LARGE HERO CANVAS */}
                            <div className="w-full h-[320px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                                <InteractiveSVGPlot 
                                    graphId={currentGraph.graph_id} 
                                    params={graphParams}
                                    activeTab={activeTab}
                                    transType={activeTransIndex}
                                    xAxisLabel={axes.x}
                                    yAxisLabel={axes.y}
                                    presetMode={presetMode}
                                />
                            </div>

                            {/* DIRECT PARAMETER SLIDERS & CONTROLS DIRECTLY BELOW GRAPH */}
                            <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                                        <Sliders className="w-4 h-4" />
                                        <span>Real-time Parameter Mutators (Watch curve shift instantly)</span>
                                    </h4>
                                </div>

                                {currentGraph.graph_id === "CH1-GR-01" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-300 font-medium">
                                                    <LatexText text="Charge Product $|q_1 q_2|$ Magnitude:" />
                                                </span>
                                                <span className="text-amber-400 font-mono font-bold">{graphParams.gr1ChargeProduct}x</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="2.0" 
                                                step="0.1" 
                                                value={graphParams.gr1ChargeProduct}
                                                onChange={(e) => updateParam('gr1ChargeProduct', parseFloat(e.target.value))}
                                                className="w-full accent-amber-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-slate-300 text-xs block font-medium">
                                                <LatexText text="Permittivity ($K$):" />
                                            </span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['1', '2', '4'].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => updateParam('gr1Permittivity', val)}
                                                        className={`py-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                                                            graphParams.gr1Permittivity === val
                                                                ? 'bg-purple-500/25 border-purple-500 text-purple-200 shadow-md'
                                                                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                                        }`}
                                                    >
                                                        K = {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentGraph.graph_id === "CH1-GR-02" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center justify-between bg-white/[0.02] p-3.5 rounded-xl border border-white/10">
                                            <span className="text-xs text-slate-200 font-semibold">Sphere Physical Type:</span>
                                            <button
                                                onClick={() => updateParam('gr2SolidSphere', !graphParams.gr2SolidSphere)}
                                                className={`px-4 py-1.5 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                                                    graphParams.gr2SolidSphere
                                                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-md'
                                                        : 'bg-rose-500/25 border-rose-500 text-rose-300 shadow-md'
                                                }`}
                                            >
                                                <LatexText text={graphParams.gr2SolidSphere ? 'Solid Insulating ($E \\propto r$)' : 'Hollow Shell ($E = 0$)'} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-300 font-medium">
                                                    <LatexText text="Total Charge ($q$):" />
                                                </span>
                                                <span className="text-amber-400 font-mono font-bold">{graphParams.gr2Charge}x</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="1.5" 
                                                step="0.1" 
                                                value={graphParams.gr2Charge}
                                                onChange={(e) => updateParam('gr2Charge', parseFloat(e.target.value))}
                                                className="w-full accent-amber-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SUBTLE 3-TAB EXPLORER PANEL BELOW HERO CANVAS */}
                        <div className="bg-[#12121A]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
                            
                            {/* 3-Tab Navigation Bar */}
                            <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-8">
                                <button
                                    onClick={() => setActiveTab('plotter')}
                                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        activeTab === 'plotter'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Layers className="w-4 h-4 text-amber-400" />
                                    <span className="hidden sm:inline">Equations & Significance</span>
                                    <span className="sm:hidden">Equations</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('traps')}
                                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        activeTab === 'traps'
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    <span className="hidden sm:inline">Traps & Checkpoints</span>
                                    <span className="sm:hidden">Traps</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('questions')}
                                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        activeTab === 'questions'
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <HelpCircle className="w-4 h-4 text-purple-400" />
                                    <span className="hidden sm:inline">Board Questions</span>
                                    <span className="sm:hidden">Questions</span>
                                </button>
                            </div>

                            {/* TAB 1: EQUATIONS & CHARACTERISTICS */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'plotter' && (
                                    <motion.div
                                        key="plotter"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-amber-400" />
                                                <span className="text-xs font-black uppercase tracking-wider text-amber-300">Governing Equation</span>
                                            </div>
                                            <div className="py-2">
                                                {currentGraph.base_governing_equations?.map((eq, i) => (
                                                    <BlockMath key={i} math={eq} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart2 className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">Slope Physical Significance</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                <LatexText text={currentGraph.slope_significance || "Slope represents the rate of change of the dependent variable with respect to the independent variable."} />
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB 2: EXAMINER TRAPS & CHECKPOINTS */}
                                {activeTab === 'traps' && (
                                    <motion.div
                                        key="traps"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-400 flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4" />
                                                <span>Examiner's Non-Negotiable Checkpoints</span>
                                            </h4>

                                            <div className="space-y-3">
                                                {currentGraph.non_negotiable_visual_checkpoints?.map((checkpoint, idx) => {
                                                    const key = `${currentGraph.graph_id}-${idx}`;
                                                    const isChecked = checkedItems[key] === true;

                                                    return (
                                                        <div 
                                                            key={idx}
                                                            onClick={() => toggleCheckbox(idx)}
                                                            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 select-none ${
                                                                isChecked
                                                                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-lg'
                                                                    : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                                                            }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                                                isChecked 
                                                                    ? 'bg-amber-400 border-amber-400 text-black font-black text-xs' 
                                                                    : 'border-white/20 text-transparent'
                                                            }`}>
                                                                ✓
                                                            </div>
                                                            <div className="text-xs sm:text-sm leading-relaxed font-medium">
                                                                <LatexText text={checkpoint} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="w-6 h-6 text-rose-400" />
                                                <div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-rose-400 block">EXAMINER DEDUCTION TRAPS</span>
                                                    <span className="text-xs text-slate-400">Common mistakes in board diagrams</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-2">
                                                {currentGraph.examiner_deduction_traps?.map((trap, index) => (
                                                    <div key={index} className="p-5 rounded-2xl bg-[#0A0A0F] border border-rose-500/20 space-y-3">
                                                        <span className="text-sm font-bold text-rose-300 block">Trap {index + 1}: {trap.trap_title}</span>
                                                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                                            <LatexText text={trap.description || trap.trap_description} />
                                                        </p>
                                                        <div className="pt-3 border-t border-rose-500/10 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                                                            <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                                                            <span>Shield: <LatexText text={trap.structural_shield || trap.student_defense_action} /></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB 3: BOARD QUESTIONS */}
                                {activeTab === 'questions' && (
                                    <motion.div
                                        key="questions"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="border-b border-white/10 pb-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-purple-400 flex items-center gap-2">
                                                <HelpCircle className="w-4 h-4" />
                                                <span>Real Board Questions Linked to Graph</span>
                                            </h4>
                                        </div>

                                        {matchedQuestions.length > 0 ? (
                                            <div className="space-y-4">
                                                {matchedQuestions.slice(0, 4).map((q, idx) => (
                                                    <InteractiveQuestionCard key={idx} question={q} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-10 text-center text-xs sm:text-sm text-slate-500 border border-dashed border-white/10 rounded-3xl italic">
                                                No exact question matches found for this graph profile.
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PhysicsGraphsPage;
