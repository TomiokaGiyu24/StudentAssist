import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FormatText } from './FormatText';

/* ─────────────────────────────────────────────────────────
   PeriodicTableExplorer
   A premium, interactive periodic table for board-exam prep.
   Layout mirrors the standard 18-column periodic table.
   Click any element → floating detail panel.
   ───────────────────────────────────────────────────────── */

// ── Element Categories & Colors ──────────────────────────

const CATEGORIES = {
    'alkali-metal':       { label: 'Alkali Metal',           bg: 'rgba(239,68,68,0.18)',     border: 'rgba(239,68,68,0.35)',     text: '#fca5a5', glow: 'rgba(239,68,68,0.25)',  solid: '#ef4444' },
    'alkaline-earth':     { label: 'Alkaline Earth Metal',   bg: 'rgba(249,115,22,0.18)',    border: 'rgba(249,115,22,0.35)',    text: '#fdba74', glow: 'rgba(249,115,22,0.25)', solid: '#f97316' },
    'transition-metal':   { label: 'Transition Metal',       bg: 'rgba(234,179,8,0.15)',     border: 'rgba(234,179,8,0.30)',     text: '#fde047', glow: 'rgba(234,179,8,0.20)',  solid: '#eab308' },
    'post-transition':    { label: 'Post-Transition Metal',  bg: 'rgba(20,184,166,0.15)',    border: 'rgba(20,184,166,0.30)',    text: '#5eead4', glow: 'rgba(20,184,166,0.20)', solid: '#14b8a6' },
    'metalloid':          { label: 'Metalloid',              bg: 'rgba(34,197,94,0.15)',     border: 'rgba(34,197,94,0.30)',     text: '#86efac', glow: 'rgba(34,197,94,0.20)',  solid: '#22c55e' },
    'nonmetal':           { label: 'Reactive Nonmetal',      bg: 'rgba(56,189,248,0.15)',    border: 'rgba(56,189,248,0.30)',    text: '#7dd3fc', glow: 'rgba(56,189,248,0.20)', solid: '#38bdf8' },
    'halogen':            { label: 'Halogen',                bg: 'rgba(6,182,212,0.18)',     border: 'rgba(6,182,212,0.35)',     text: '#67e8f9', glow: 'rgba(6,182,212,0.25)',  solid: '#06b6d4' },
    'noble-gas':          { label: 'Noble Gas',              bg: 'rgba(139,92,246,0.18)',    border: 'rgba(139,92,246,0.35)',    text: '#c4b5fd', glow: 'rgba(139,92,246,0.25)', solid: '#8b5cf6' },
    'lanthanide':         { label: 'Lanthanide',             bg: 'rgba(99,102,241,0.15)',    border: 'rgba(99,102,241,0.30)',    text: '#a5b4fc', glow: 'rgba(99,102,241,0.20)', solid: '#6366f1' },
    'actinide':           { label: 'Actinide',               bg: 'rgba(236,72,153,0.15)',    border: 'rgba(236,72,153,0.30)',    text: '#f9a8d4', glow: 'rgba(236,72,153,0.20)', solid: '#ec4899' },
    'unknown':            { label: 'Unknown',                bg: 'rgba(120,113,108,0.15)',   border: 'rgba(120,113,108,0.30)',   text: '#a8a29e', glow: 'rgba(120,113,108,0.15)',solid: '#78716c' },
};

const METALLOID_NUMBERS = new Set([5, 14, 32, 33, 51, 52]);
const NONMETAL_NUMBERS  = new Set([1, 6, 7, 8, 15, 16, 34]);

function getCategory(el) {
    if (!el) return 'unknown';
    const { atomic_number: z, group, block, period } = el;
    if (group === 18)                              return 'noble-gas';
    if (group === 17 && block === 'p')             return 'halogen';
    if (group === 1  && block === 's' && period > 1) return 'alkali-metal';
    if (group === 2  && block === 's')             return 'alkaline-earth';
    if (z >= 57 && z <= 71)                        return 'lanthanide';
    if (z >= 89 && z <= 103)                       return 'actinide';
    if (block === 'd')                             return 'transition-metal';
    if (METALLOID_NUMBERS.has(z))                  return 'metalloid';
    if (NONMETAL_NUMBERS.has(z))                   return 'nonmetal';
    if (block === 'p')                             return 'post-transition';
    return 'unknown';
}

// ── Layout Helpers ───────────────────────────────────────

function buildGridPositions(elements) {
    const mainGrid = [];      // Elements placed on the 7×18 grid
    const lanthanides = [];   // Atomic numbers 57–71
    const actinides = [];     // Atomic numbers 89–103

    elements.forEach(el => {
        const z = el.atomic_number;
        if (z >= 57 && z <= 71) {
            lanthanides.push(el);
        } else if (z >= 89 && z <= 103) {
            actinides.push(el);
        } else {
            mainGrid.push(el);
        }
    });

    lanthanides.sort((a, b) => a.atomic_number - b.atomic_number);
    actinides.sort((a, b) => a.atomic_number - b.atomic_number);

    return { mainGrid, lanthanides, actinides };
}

// ── Element Cell Component ───────────────────────────────

const ElementCell = React.memo(({ element, isSelected, onClick, compact }) => {
    const cat = getCategory(element);
    const colors = CATEGORIES[cat];
    const hasNotes = element.board_high_frequency_nodes?.length > 0;

    return (
        <motion.button
            onClick={() => onClick(element)}
            whileHover={{ scale: 1.12, zIndex: 30 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="periodic-cell group"
            style={{
                gridColumn: element._col,
                gridRow: element._row,
                background: isSelected
                    ? colors.bg.replace(/[\d.]+\)$/, '0.35)')
                    : colors.bg,
                border: isSelected
                    ? `2px solid ${colors.solid}`
                    : hasNotes
                        ? `1.5px solid rgba(245,158,11,0.65)` // Standout gold border for elements with board notes
                        : `1px solid ${colors.border}`,
                boxShadow: isSelected
                    ? `0 0 20px ${colors.glow}, inset 0 0 15px ${colors.glow}`
                    : hasNotes
                        ? `0 0 10px rgba(245,158,11,0.22), inset 0 0 6px rgba(245,158,11,0.15)` // Standout gold soft glow for board notes
                        : 'none',
                position: 'relative',
                borderRadius: '10px',
                cursor: 'pointer',
                padding: compact ? '3px 2px 2px' : '4px 3px 3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            }}
            title={`${element.name} (${element.symbol})`}
        >
            {/* Pulsing Gold Beacon for Board Notes */}
            {hasNotes && (
                <span className="absolute top-[4px] right-[4px] flex h-2 w-2 z-10 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                </span>
            )}

            {/* Atomic number */}
            <span
                className="leading-none font-semibold opacity-50"
                style={{ fontSize: compact ? '7px' : '8px', color: colors.text }}
            >
                {element.atomic_number}
            </span>

            {/* Symbol */}
            <span
                className="leading-none font-extrabold tracking-tight"
                style={{
                    fontSize: compact ? '14px' : '16px',
                    color: colors.text,
                    filter: `drop-shadow(0 0 3px ${colors.glow})`,
                }}
            >
                {element.symbol}
            </span>

            {/* Name */}
            <span
                className="leading-none font-medium truncate w-full text-center opacity-60"
                style={{ fontSize: compact ? '5.5px' : '6.5px', color: colors.text }}
            >
                {element.name.length > 9 ? element.name.slice(0, 8) + '…' : element.name}
            </span>
        </motion.button>
    );
});

// ── Electron Configuration Parser ────────────────────────

const renderElectronConfig = (configStr) => {
    if (!configStr) return null;

    const regex = /(\[[A-Za-z]+\])|(\d+)([spdf])(\d+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(configStr)) !== null) {
        if (match.index > lastIndex) {
            parts.push(
                <span key={`text-${lastIndex}`} className="text-stone-500 font-medium mx-0.5">
                    {configStr.substring(lastIndex, match.index)}
                </span>
            );
        }

        if (match[1]) {
            parts.push(
                <span
                    key={`core-${match.index}`}
                    className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-stone-300 font-bold font-mono text-[13px] tracking-wide"
                >
                    {match[1]}
                </span>
            );
        } else if (match[3]) {
            const shell = match[2] || '';
            const subshell = match[3];
            const electrons = match[4];
            parts.push(
                <span key={`orb-${match.index}`} className="inline-flex items-baseline font-mono text-[14px] font-medium">
                    <span className="text-white/90">{shell}</span>
                    <span className="text-teal-400 font-bold">{subshell}</span>
                    <sup className="text-teal-300 font-extrabold text-[10px] ml-0.5 select-none">{electrons}</sup>
                </span>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < configStr.length) {
        parts.push(
            <span key={`text-${lastIndex}`} className="text-stone-500 font-medium mx-0.5">
                {configStr.substring(lastIndex)}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-none">
            {parts}
        </div>
    );
};

// ── Detail Panel Component ───────────────────────────────

const DetailPanel = ({ element, onClose }) => {
    const cat = getCategory(element);
    const colors = CATEGORIES[cat];
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                if (e.target.closest('.periodic-cell')) return;
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen z-[9999] w-[calc(100vw-50px)] sm:w-[450px] flex flex-col border-l"
            style={{
                background: 'linear-gradient(180deg, #0d0d12 0%, #08080b 100%)',
                borderColor: colors.border,
                boxShadow: `-10px 0 40px rgba(0,0,0,0.6), 0 0 40px ${colors.glow}`,
            }}
        >
            {/* Left handle button to slide close */}
            <button
                onClick={onClose}
                className="absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-20 rounded-l-xl bg-[#0d0d12]/95 flex items-center justify-center transition-all cursor-pointer group shadow-[-4px_0_10px_rgba(0,0,0,0.5)] z-[101]"
                style={{
                    borderLeft: `1px solid ${colors.border}`,
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.text
                }}
                title="Close sidebar"
            >
                <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Inner Content with key-based transition for cross-fading */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={element.symbol}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    {/* Hero Section (Fixed) */}
                    <div className="relative px-7 pt-8 pb-5 shrink-0 overflow-hidden">
                        {/* Ambient glow */}
                        <div
                            className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ background: colors.solid }}
                        />
                        <div
                            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none"
                            style={{ background: colors.solid }}
                        />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 z-10 w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/[0.1] transition-all"
                        >
                            ✕
                        </button>

                        <div className="relative z-10 flex items-start gap-5">
                            {/* Large Symbol */}
                            <div
                                className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl shrink-0"
                                style={{
                                    background: colors.bg,
                                    border: `2px solid ${colors.border}`,
                                    boxShadow: `0 0 30px ${colors.glow}`,
                                }}
                            >
                                <span className="text-xs font-bold opacity-50" style={{ color: colors.text }}>{element.atomic_number}</span>
                                <span className="text-4xl font-black tracking-tight" style={{ color: colors.text, filter: `drop-shadow(0 0 6px ${colors.glow})` }}>
                                    {element.symbol}
                                </span>
                                <span className="text-[9px] font-semibold opacity-60" style={{ color: colors.text }}>{element.atomic_mass}</span>
                            </div>

                            {/* Name & Meta */}
                            <div className="flex-1 min-w-0 pt-1 pr-6">
                                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2 truncate">{element.name}</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                        {colors.label || CATEGORIES[cat].label}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                                        {element.block.toUpperCase()}-Block
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                                        Period {element.period}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                                        Group {element.group}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mx-4 shrink-0" />

                    {/* Detail Sections (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 custom-scrollbar">
                        {/* Electronic Configuration */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-stone-500 block mb-2.5">Electronic Configuration</span>
                            <div className="text-[15px] font-mono font-bold text-white/90 tracking-wide">
                                {renderElectronConfig(element.electronic_configuration)}
                            </div>
                        </div>

                        {/* Atomic Mass */}
                        <div className="flex gap-3">
                            <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-stone-500 block mb-1">Atomic Mass</span>
                                <p className="text-sm font-bold text-white/80">{element.atomic_mass} u</p>
                            </div>
                            <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-stone-500 block mb-1">Atomic Number</span>
                                <p className="text-sm font-bold text-white/80">{element.atomic_number}</p>
                            </div>
                        </div>

                        {/* Mnemonic */}
                        {element.mnemonic && (
                            <div className="p-4 rounded-2xl border" style={{ background: colors.bg.replace(/[\d.]+\)$/, '0.06)'), borderColor: colors.border }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">🎵</span>
                                    <span className="text-[8px] font-extrabold uppercase tracking-[0.15em]" style={{ color: colors.text }}>Mnemonic</span>
                                </div>
                                <p className="text-[13px] italic text-stone-300 leading-relaxed font-medium">
                                    "{element.mnemonic}"
                                </p>
                            </div>
                        )}

                        {/* Board High Frequency Nodes */}
                        {element.board_high_frequency_nodes?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">🎯</span>
                                    <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-teal-400">Board Exam Key Points</span>
                                </div>
                                <div className="space-y-3">
                                    {element.board_high_frequency_nodes.map((node, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-teal-500/[0.03] border border-teal-500/10 hover:border-teal-500/20 transition-colors">
                                            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-teal-400/70 block mb-1.5">
                                                {node.exam_context}
                                            </span>
                                            <p className="text-[12.5px] text-stone-200 leading-[1.85]">
                                                <FormatText>{node.core_line}</FormatText>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>,
        document.body
    );
};


// ── Legend Component ──────────────────────────────────────

const Legend = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center py-3">
        {Object.entries(CATEGORIES).filter(([k]) => k !== 'unknown').map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: val.solid, boxShadow: `0 0 4px ${val.glow}` }} />
                <span className="text-[9px] font-bold text-stone-500 tracking-wide">{val.label}</span>
            </div>
        ))}
    </div>
);

// ── Main Component ───────────────────────────────────────

const PeriodicTableExplorer = ({ content }) => {
    const elements = useMemo(() => {
        if (!Array.isArray(content)) return [];
        return content.filter(el => el.atomic_number && el.symbol);
    }, [content]);

    const [selectedElement, setSelectedElement] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const tableRef = useRef(null);

    const handleSelect = useCallback((el) => {
        setSelectedElement(prev => prev?.atomic_number === el.atomic_number ? null : el);
    }, []);

    const handleClose = useCallback(() => setSelectedElement(null), []);

    // Separate elements into main grid, lanthanides, actinides
    const { mainGrid, lanthanides, actinides } = useMemo(() => buildGridPositions(elements), [elements]);

    // Assign grid positions
    const positionedMain = useMemo(() => {
        return mainGrid.map(el => ({
            ...el,
            _row: el.period,
            _col: el.group,
        }));
    }, [mainGrid]);

    // Search filter
    const filteredElements = useMemo(() => {
        if (!searchQuery.trim()) return null; // null = show all
        const q = searchQuery.toLowerCase().trim();
        return new Set(
            elements
                .filter(el =>
                    el.name.toLowerCase().includes(q) ||
                    el.symbol.toLowerCase().includes(q) ||
                    String(el.atomic_number) === q ||
                    el.block.toLowerCase() === q
                )
                .map(el => el.atomic_number)
        );
    }, [searchQuery, elements]);

    const isHighlighted = (el) => {
        if (!filteredElements) return true;
        return filteredElements.has(el.atomic_number);
    };

    if (elements.length === 0) {
        return (
            <div className="text-center py-24 text-stone-500">
                <span className="text-4xl block mb-4">⚛️</span>
                No periodic table data found.
            </div>
        );
    }

    return (
        <div className="w-full select-none relative overflow-hidden flex flex-row items-start">
            <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${selectedElement ? 'lg:mr-[450px]' : 'lg:mr-0'}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Interactive Periodic Table
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">Click any element to explore • Elements with 🟢 have board exam notes</p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search element, symbol, or block..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 pl-9 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-teal-500/30 focus:bg-white/[0.04] transition-all"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Legend */}
                <Legend />

                {/* Table Container — horizontally scrollable on small screens */}
                <div ref={tableRef} className="overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
                    <div className="min-w-[940px]">

                        {/* Main 18-column Grid (Periods 1-7) */}
                        <div
                            className="grid gap-[3px]"
                            style={{
                                gridTemplateColumns: 'repeat(18, minmax(44px, 1fr))',
                                gridTemplateRows: 'repeat(7, 52px)',
                            }}
                        >
                            {positionedMain.map(el => (
                                <ElementCell
                                    key={el.atomic_number}
                                    element={el}
                                    isSelected={selectedElement?.atomic_number === el.atomic_number}
                                    onClick={handleSelect}
                                    compact={false}
                                />
                            ))}

                            {/* Placeholder for Lanthanides at row 6 col 3 */}
                            {lanthanides.length > 0 && (
                                <div
                                    style={{ gridColumn: 3, gridRow: 6 }}
                                    className="rounded-[10px] flex items-center justify-center text-[8px] font-bold uppercase tracking-wider cursor-default"
                                    title="Lanthanides (57-71)"
                                >
                                    <span className="text-indigo-400/60" style={{ fontSize: '7px' }}>57-71 ▼</span>
                                </div>
                            )}

                            {/* Placeholder for Actinides at row 7 col 3 */}
                            {actinides.length > 0 && (
                                <div
                                    style={{ gridColumn: 3, gridRow: 7 }}
                                    className="rounded-[10px] flex items-center justify-center text-[8px] font-bold uppercase tracking-wider cursor-default"
                                    title="Actinides (89-103)"
                                >
                                    <span className="text-pink-400/60" style={{ fontSize: '7px' }}>89-103 ▼</span>
                                </div>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="h-4" />

                        {/* Lanthanide Row */}
                        {lanthanides.length > 0 && (
                            <div className="relative">
                                <span className="absolute -left-0 top-1/2 -translate-y-1/2 text-[7px] font-bold uppercase tracking-widest text-indigo-400/40 -rotate-0 whitespace-nowrap" style={{ width: '42px', textAlign: 'center' }}>
                                    Lan
                                </span>
                                <div
                                    className="grid gap-[3px] ml-[46px]"
                                    style={{
                                        gridTemplateColumns: `repeat(${lanthanides.length}, minmax(44px, 1fr))`,
                                        gridTemplateRows: '52px',
                                    }}
                                >
                                    {lanthanides.map(el => (
                                        <ElementCell
                                            key={el.atomic_number}
                                            element={{ ...el, _col: 'auto', _row: 'auto' }}
                                            isSelected={selectedElement?.atomic_number === el.atomic_number}
                                            onClick={handleSelect}
                                            compact
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Small gap between rows */}
                        <div className="h-[3px]" />

                        {/* Actinide Row */}
                        {actinides.length > 0 && (
                            <div className="relative">
                                <span className="absolute -left-0 top-1/2 -translate-y-1/2 text-[7px] font-bold uppercase tracking-widest text-pink-400/40 -rotate-0 whitespace-nowrap" style={{ width: '42px', textAlign: 'center' }}>
                                    Act
                                </span>
                                <div
                                    className="grid gap-[3px] ml-[46px]"
                                    style={{
                                        gridTemplateColumns: `repeat(${actinides.length}, minmax(44px, 1fr))`,
                                        gridTemplateRows: '52px',
                                    }}
                                >
                                    {actinides.map(el => (
                                        <ElementCell
                                            key={el.atomic_number}
                                            element={{ ...el, _col: 'auto', _row: 'auto' }}
                                            isSelected={selectedElement?.atomic_number === el.atomic_number}
                                            onClick={handleSelect}
                                            compact
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Element Detail Sidebar */}
            <AnimatePresence>
                {selectedElement && (
                    <DetailPanel
                        element={selectedElement}
                        onClose={handleClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PeriodicTableExplorer;
