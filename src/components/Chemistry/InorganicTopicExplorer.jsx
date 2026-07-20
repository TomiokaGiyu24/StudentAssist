import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FormatText, normalizeLatex } from './FormatText';
import ChemistryBadge from './ChemistryBadge';

/* ─────────────────────────────────────────────────────────
   InorganicTopicExplorer
   Premium dashboard for inorganic chemistry chapters
   (d&f block, coordination compounds, etc.)
   Data shape: mixed array of topics, exceptions, and graphs
   ───────────────────────────────────────────────────────── */

// ── Micro-components ──────────────────────────────────────

const GlowCard = ({ children, className = '', accent = 'teal', onClick, active, hoverGlow = true }) => (
    <motion.div
        whileHover={hoverGlow ? { y: -2 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`
            relative rounded-2xl border backdrop-blur-sm transition-all duration-300
            ${active
                ? 'bg-gradient-to-br from-teal-950/30 to-[#0d0d0f] border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.08)]'
                : 'bg-[#111114] border-white/[0.06] hover:border-white/[0.12] hover:bg-[#141418]'
            }
            ${onClick ? 'cursor-pointer' : ''}
            ${className}
        `}
    >
        {active && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/[0.03] to-transparent pointer-events-none" />
        )}
        {children}
    </motion.div>
);

const SectionLabel = ({ icon, children, className = '' }) => (
    <div className={`flex items-center gap-2.5 mb-4 ${className}`}>
        {icon && <span className="text-base">{icon}</span>}
        <h4 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-teal-400">{children}</h4>
    </div>
);

const AccentDivider = ({ className = '' }) => (
    <div className={`h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent ${className}`} />
);

const PriorityChip = ({ tier }) => {
    const t = (tier || '').toUpperCase();
    const variant = t.includes('HIGH') ? 'danger' : t.includes('MEDIUM') || t.includes('MODERATE') ? 'warning' : 'primary';
    return <ChemistryBadge variant={variant}>{tier}</ChemistryBadge>;
};

const StatChip = ({ label, value }) => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[11px]">
        <span className="text-stone-500 font-medium">{label}</span>
        <span className="text-teal-400 font-bold">{value}</span>
    </div>
);

// Safe KaTeX rendering with error fallback
const SafeBlockMath = ({ math }) => {
    if (!math) return null;
    const normalized = normalizeLatex(math);
    return (
        <BlockMath
            math={normalized}
            renderError={() => <span className="text-stone-400 text-sm font-mono">{normalized}</span>}
        />
    );
};

const SafeInlineMath = ({ math }) => {
    if (!math) return null;
    const normalized = normalizeLatex(math);
    return (
        <InlineMath
            math={normalized}
            renderError={() => <span className="text-stone-400 text-xs font-mono">{normalized}</span>}
        />
    );
};


// ── Main Component ────────────────────────────────────────

const InorganicTopicExplorer = ({ content }) => {
    const allItems = Array.isArray(content) ? content : [];

    // Separate items by type
    const topics = allItems.filter(item => item.topic_name);
    const exceptions = allItems.filter(item => item.exception_id);
    const graphs = allItems.filter(item => item.graph_id);

    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [expandedExceptions, setExpandedExceptions] = useState({});
    const [revealedAnswers, setRevealedAnswers] = useState({});
    const [activeView, setActiveView] = useState('topics'); // 'topics' | 'exceptions' | 'graphs'
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const mainRef = useRef(null);

    // Scroll to top of main content on topic change
    useEffect(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTopicIndex]);

    if (topics.length === 0) {
        return (
            <div className="text-center py-24 text-stone-500">
                <span className="text-4xl block mb-4">📭</span>
                No topic data found for this chapter.
            </div>
        );
    }

    const currentTopic = topics[activeTopicIndex];

    const toggleException = (id) => {
        setExpandedExceptions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleAnswer = (key) => {
        setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── View Tabs ─────────────────────────────────────────
    const viewTabs = [
        { id: 'topics', label: 'Concept Explorer', icon: '⚛️', count: topics.length },
        { id: 'exceptions', label: 'Exception Decoder', icon: '🧩', count: exceptions.length },
        { id: 'graphs', label: 'Graph Lab', icon: '📊', count: graphs.length },
    ].filter(tab => tab.count > 0);

    // ── Render Topic Content ──────────────────────────────
    const renderTopicContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTopicIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-8"
            >
                {/* ─── Hero Banner ─── */}
                <div className="relative p-7 sm:p-8 bg-gradient-to-br from-[#111116] via-[#0e0e12] to-[#0a0a0e] border border-white/[0.05] rounded-3xl overflow-hidden">
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${
                        currentTopic.metadata?.priority_tier?.toUpperCase() === 'HIGH'
                            ? 'from-rose-500 via-red-400 to-orange-500'
                            : currentTopic.metadata?.priority_tier?.toUpperCase() === 'MEDIUM'
                                ? 'from-amber-400 via-yellow-400 to-orange-400'
                                : 'from-teal-400 via-emerald-400 to-cyan-400'
                    }`} />

                    {/* Ambient glow */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/[0.03] rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <span className="text-[10px] font-extrabold tracking-[0.2em] text-teal-400/70 uppercase block mb-2">
                            Topic {String(activeTopicIndex + 1).padStart(2, '0')} of {topics.length}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-5">
                            {currentTopic.topic_name}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {currentTopic.metadata?.priority_tier && (
                                <PriorityChip tier={currentTopic.metadata.priority_tier} />
                            )}
                            {currentTopic.metadata?.pyq_frequency && (
                                <StatChip label="PYQs" value={currentTopic.metadata.pyq_frequency} />
                            )}
                            {currentTopic.metadata?.weightage_pattern && (
                                <StatChip label="Pattern" value={currentTopic.metadata.weightage_pattern} />
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Dual Understanding Cards ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Plain English */}
                    {currentTopic.simplified_core?.plain_english_explanation && (
                        <GlowCard className="p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-xl mt-0.5">💡</span>
                                <div>
                                    <h5 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-400/80">
                                        Simplified Understanding
                                    </h5>
                                    <p className="text-[10px] text-stone-600 mt-0.5">In plain, everyday language</p>
                                </div>
                            </div>
                            <p className="text-[13.5px] text-stone-300 leading-[1.85] pl-9">
                                <FormatText>{currentTopic.simplified_core.plain_english_explanation}</FormatText>
                            </p>
                        </GlowCard>
                    )}

                    {/* Textbook Anchor */}
                    {currentTopic.simplified_core?.textbook_anchor && (
                        <GlowCard className="p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-xl mt-0.5">📖</span>
                                <div>
                                    <h5 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-400/80">
                                        NCERT Textbook Anchor
                                    </h5>
                                    <p className="text-[10px] text-stone-600 mt-0.5">Exact standard definition</p>
                                </div>
                            </div>
                            <p className="text-[13px] italic text-stone-200/80 leading-[1.9] font-serif pl-9 border-l-2 border-emerald-500/20 ml-4">
                                <FormatText>{currentTopic.simplified_core.textbook_anchor}</FormatText>
                            </p>
                        </GlowCard>
                    )}
                </div>

                {/* ─── Board Scoring Notes ─── */}
                {currentTopic.board_scoring_notes && currentTopic.board_scoring_notes.length > 0 && (
                    <div>
                        <SectionLabel icon="🎯">Board Scoring Key Points</SectionLabel>
                        <div className="space-y-3">
                            {currentTopic.board_scoring_notes.map((note, idx) => (
                                <div key={idx} className="flex gap-3.5 items-start p-4 bg-[#111114] border border-white/[0.04] rounded-2xl hover:border-teal-500/15 transition-all duration-300 group">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 text-[10px] font-black shrink-0 mt-0.5 group-hover:bg-teal-500/20 transition-colors">
                                        {idx + 1}
                                    </span>
                                    <p className="text-[13px] text-stone-300 leading-relaxed">
                                        <FormatText>{note}</FormatText>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── Exceptions Decoded ─── */}
                {currentTopic.exceptions_decoded && currentTopic.exceptions_decoded.length > 0 && (
                    <div>
                        <SectionLabel icon="🧩">Exceptions Decoded</SectionLabel>
                        <div className="space-y-3">
                            {currentTopic.exceptions_decoded.map((exc, idx) => {
                                const excKey = `topic-${activeTopicIndex}-exc-${idx}`;
                                const isOpen = expandedExceptions[excKey];
                                return (
                                    <div key={idx} className="bg-[#111114] border border-white/[0.04] rounded-2xl overflow-hidden hover:border-amber-500/15 transition-all duration-300">
                                        <button
                                            onClick={() => toggleException(excKey)}
                                            className="w-full p-5 flex items-start gap-4 text-left group"
                                        >
                                            <span className="text-amber-400/70 text-lg mt-0.5 shrink-0">⚡</span>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-[13.5px] font-bold text-white/90 leading-snug group-hover:text-white transition-colors">
                                                    {exc.anomaly_title}
                                                </h5>
                                            </div>
                                            <span className={`text-stone-500 text-xs transition-transform duration-300 shrink-0 mt-1 ${isOpen ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 space-y-4">
                                                        <AccentDivider />
                                                        {/* What Baffles Students */}
                                                        <div className="flex gap-3 items-start">
                                                            <span className="text-rose-400/60 text-sm shrink-0 mt-0.5">❓</span>
                                                            <div>
                                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-rose-400/60 block mb-1">What Baffles Students</span>
                                                                <p className="text-[12.5px] text-stone-400 leading-relaxed">
                                                                    <FormatText>{exc.what_baffles_students}</FormatText>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* The Killer Reason */}
                                                        <div className="flex gap-3 items-start p-4 bg-teal-500/[0.03] border border-teal-500/10 rounded-xl">
                                                            <span className="text-teal-400 text-sm shrink-0 mt-0.5">💡</span>
                                                            <div>
                                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-400 block mb-1">The Killer Reason</span>
                                                                <p className="text-[12.5px] text-stone-200 leading-relaxed font-medium">
                                                                    <FormatText>{exc.the_killer_reason}</FormatText>
                                                                </p>
                                                            </div>
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
                )}

                {/* ─── High-Yield Q&A Cards ─── */}
                {currentTopic.high_yield_reasoning_cards && currentTopic.high_yield_reasoning_cards.length > 0 && (
                    <div>
                        <SectionLabel icon="🏆">High-Yield Reasoning Cards</SectionLabel>
                        <div className="space-y-4">
                            {currentTopic.high_yield_reasoning_cards.map((card, idx) => {
                                const cardKey = `topic-${activeTopicIndex}-qa-${idx}`;
                                const isRevealed = revealedAnswers[cardKey];
                                return (
                                    <div key={idx} className="bg-[#111114] border border-white/[0.04] rounded-2xl overflow-hidden">
                                        {/* Question */}
                                        <div className="p-5">
                                            <div className="flex items-start gap-3">
                                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-black shrink-0">
                                                    Q{idx + 1}
                                                </span>
                                                <p className="text-[13.5px] font-semibold text-white/90 leading-relaxed">
                                                    <FormatText>{card.question}</FormatText>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reveal Button */}
                                        <button
                                            onClick={() => toggleAnswer(cardKey)}
                                            className="w-full px-5 py-3 border-t border-white/[0.04] flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:bg-white/[0.02]"
                                        >
                                            <span className={`transition-colors ${isRevealed ? 'text-teal-400' : 'text-stone-500'}`}>
                                                {isRevealed ? '▲ Hide Model Answer' : '▼ Reveal Perfect Answer Script'}
                                            </span>
                                        </button>

                                        {/* Answer */}
                                        <AnimatePresence initial={false}>
                                            {isRevealed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 pt-1">
                                                        <div className="p-4 bg-teal-500/[0.02] border-l-3 border-teal-500/30 rounded-r-xl">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-teal-400/60 block mb-2">
                                                                Model Response — Full Credit
                                                            </span>
                                                            <p className="text-[13px] text-stone-300 leading-[1.85]">
                                                                <FormatText>{card.perfect_answer_script}</FormatText>
                                                            </p>
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
                )}

                {/* ─── Visual Chemistry Strip ─── */}
                {currentTopic.flowchart_and_visual_nodes && (
                    <div>
                        <SectionLabel icon="🔬">Visual Chemistry</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Chemical Equations */}
                            {currentTopic.flowchart_and_visual_nodes.chemical_equations?.length > 0 && (
                                <GlowCard className="p-5 lg:col-span-3">
                                    <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-500 mb-4">Chemical Equations</h5>
                                    <div className="space-y-3">
                                        {currentTopic.flowchart_and_visual_nodes.chemical_equations.map((eq, idx) => (
                                            <div key={idx} className="p-3 bg-black/20 border border-white/[0.03] rounded-xl overflow-x-auto">
                                                <div className="flex justify-center items-center min-w-0 text-sm">
                                                    <SafeBlockMath math={normalizeLatex(eq)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlowCard>
                            )}

                            {/* Color & State Milestones */}
                            {currentTopic.flowchart_and_visual_nodes.color_and_state_milestones && (
                                <GlowCard className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base">🎨</span>
                                        <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-500">Color & State</h5>
                                    </div>
                                    <p className="text-[12.5px] text-stone-300 leading-[1.85]">
                                        <FormatText>{currentTopic.flowchart_and_visual_nodes.color_and_state_milestones}</FormatText>
                                    </p>
                                </GlowCard>
                            )}

                            {/* Structural Geometry */}
                            {currentTopic.flowchart_and_visual_nodes.structural_geometry && (
                                <GlowCard className="p-5 lg:col-span-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base">🔷</span>
                                        <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-500">Structural Geometry</h5>
                                    </div>
                                    <p className="text-[12.5px] text-stone-300 leading-[1.85]">
                                        <FormatText>{currentTopic.flowchart_and_visual_nodes.structural_geometry}</FormatText>
                                    </p>
                                </GlowCard>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    // ── Render Exceptions View ─────────────────────────────
    const renderExceptionsView = () => (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
        >
            <div className="p-6 bg-gradient-to-br from-[#111116] to-[#0d0d10] border border-white/[0.05] rounded-3xl">
                <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Exception Decoder</h2>
                <p className="text-[12px] text-stone-500">Master every anomaly and deviation from standard periodic rules</p>
            </div>

            <div className="columns-1 lg:columns-2 gap-5 space-y-5">
                {exceptions.map((exc, idx) => {
                    const excKey = `exc-global-${idx}`;
                    const isOpen = expandedExceptions[excKey];
                    return (
                        <div key={exc.exception_id} className="break-inside-avoid bg-[#111114] border border-white/[0.04] rounded-2xl overflow-hidden hover:border-amber-500/10 transition-all duration-300">
                            <button
                                onClick={() => toggleException(excKey)}
                                className="w-full p-5 text-left"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-mono font-bold text-stone-600 bg-white/[0.03] px-2 py-0.5 rounded">{exc.exception_id}</span>
                                    {exc.anomaly_profile && (
                                        <span className="text-[9px] text-amber-400/60 font-bold uppercase tracking-wider">Anomaly</span>
                                    )}
                                </div>
                                <h5 className="text-[13px] font-bold text-white/90 leading-snug mb-2">
                                    {exc.chemical_context}
                                </h5>
                                {exc.anomaly_profile?.the_observed_deviation && (
                                    <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                                        <FormatText>{exc.anomaly_profile.the_observed_deviation}</FormatText>
                                    </p>
                                )}
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 space-y-4">
                                            <AccentDivider />

                                            {/* Standard Rule vs Deviation */}
                                            {exc.anomaly_profile && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-stone-500 block mb-1.5">Standard Rule</span>
                                                        <p className="text-[11.5px] text-stone-400 leading-relaxed">
                                                            <FormatText>{exc.anomaly_profile.the_standard_periodic_rule}</FormatText>
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-amber-400/70 block mb-1.5">Observed Deviation</span>
                                                        <p className="text-[11.5px] text-stone-300 leading-relaxed">
                                                            <FormatText>{exc.anomaly_profile.the_observed_deviation}</FormatText>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {exc.pedagogical_breakdown?.plain_english_explanation && (
                                                <div className="flex gap-3 items-start">
                                                    <span className="text-sm shrink-0 mt-0.5">💡</span>
                                                    <p className="text-[12px] text-stone-300 leading-[1.8]">
                                                        <FormatText>{exc.pedagogical_breakdown.plain_english_explanation}</FormatText>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Board Defense Key */}
                                            {exc.pedagogical_breakdown?.board_defense_key && (
                                                <div className="p-3.5 bg-teal-500/[0.03] border border-teal-500/10 rounded-xl">
                                                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-teal-400/70 block mb-1">Board Defense Key</span>
                                                    <p className="text-[12px] text-teal-200/80 leading-relaxed font-medium">
                                                        <FormatText>{exc.pedagogical_breakdown.board_defense_key}</FormatText>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Question Blueprints */}
                                            {exc.exhaustive_question_blueprints?.map((qb, qIdx) => {
                                                const qaKey = `exc-${idx}-qa-${qIdx}`;
                                                const isQARevealed = revealedAnswers[qaKey];
                                                return (
                                                    <div key={qIdx} className="bg-black/20 border border-white/[0.03] rounded-xl overflow-hidden">
                                                        <div className="p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <ChemistryBadge variant="primary">{qb.question_type}</ChemistryBadge>
                                                            </div>
                                                            <p className="text-[12.5px] font-semibold text-white/85 leading-snug">
                                                                <FormatText>{qb.question_prompt}</FormatText>
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleAnswer(qaKey)}
                                                            className="w-full px-4 py-2.5 border-t border-white/[0.03] text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 hover:text-teal-400 transition-colors"
                                                        >
                                                            {isQARevealed ? '▲ Hide Answer' : '▼ Reveal Perfect Response'}
                                                        </button>
                                                        <AnimatePresence initial={false}>
                                                            {isQARevealed && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-4 pb-4">
                                                                        <div className="p-3 bg-teal-500/[0.02] border-l-2 border-teal-500/20 rounded-r-lg">
                                                                            <p className="text-[12px] text-stone-300 leading-[1.8]">
                                                                                <FormatText>{qb.perfect_response_script}</FormatText>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}

                                            {/* Chemical Data */}
                                            {exc.associated_chemical_data?.relevant_equations?.length > 0 && (
                                                <div className="space-y-2">
                                                    {exc.associated_chemical_data.relevant_equations.map((eq, eqIdx) => (
                                                        <div key={eqIdx} className="p-3 bg-black/20 border border-white/[0.03] rounded-xl overflow-x-auto">
                                                            <div className="flex justify-center text-sm">
                                                                <SafeBlockMath math={normalizeLatex(eq)} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );

    // ── Render Graphs View ─────────────────────────────────
    const [activeGraphIndex, setActiveGraphIndex] = useState(0);

    const renderGraphsView = () => {
        if (graphs.length === 0) return null;
        const activeGraph = graphs[activeGraphIndex] || graphs[0];

        // Theme the SVG for dark mode
        const themeSvg = (svgStr) => {
            if (!svgStr) return '';
            return svgStr
                .replace(/fill='#F8FAFC'/g, "fill='#0d0d0f'")
                .replace(/fill='#0F172A'/g, "fill='#e7e5e4'")
                .replace(/fill='#1E293B'/g, "fill='#a8a29e'")
                .replace(/stroke='#1E293B'/g, "stroke='#57534e'")
                .replace(/stroke='#E2E8F0'/g, "stroke='#292524'")
                .replace(/fill=' #F8FAFC'/g, "fill='#0d0d0f'");
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
            >
                {/* Graph Navigation */}
                <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none custom-scrollbar">
                    {graphs.map((graph, idx) => (
                        <button
                            key={graph.graph_id}
                            onClick={() => setActiveGraphIndex(idx)}
                            className={`px-4 py-3 rounded-xl border shrink-0 text-left transition-all duration-300 flex flex-col gap-1 min-w-[170px] ${
                                activeGraphIndex === idx
                                    ? 'bg-teal-950/25 text-white border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.12)]'
                                    : 'bg-[#111114] text-stone-400 border-white/[0.04] hover:border-white/[0.1] hover:text-stone-200'
                            }`}
                        >
                            <span className="text-[9px] font-mono font-bold tracking-wider opacity-60">{graph.graph_id}</span>
                            <span className="text-xs font-extrabold truncate w-full">{graph.graph_name}</span>
                        </button>
                    ))}
                </div>

                {/* Active Graph Display */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGraphIndex}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                    >
                        {/* Title */}
                        <div className="p-6 bg-gradient-to-br from-[#111116] to-[#0d0d10] border border-white/[0.05] rounded-3xl">
                            <span className="text-[10px] font-bold tracking-[0.15em] text-teal-400/70 uppercase block mb-1">{activeGraph.graph_id}</span>
                            <h2 className="text-lg font-extrabold text-white tracking-tight">{activeGraph.graph_name}</h2>
                            {activeGraph.metadata && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <PriorityChip tier={activeGraph.metadata.priority_tier} />
                                    {activeGraph.metadata.pyq_frequency && (
                                        <StatChip label="PYQs" value={activeGraph.metadata.pyq_frequency} />
                                    )}
                                    {activeGraph.metadata.max_mark_yield && (
                                        <StatChip label="Yield" value={activeGraph.metadata.max_mark_yield} />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SVG Canvas */}
                        {activeGraph.svg_rendering_block && (
                            <div className="bg-[#0c0c0e] border border-white/[0.04] rounded-2xl p-6 overflow-hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    <span className="text-[10px] font-bold tracking-widest text-stone-600 uppercase">Graph Canvas</span>
                                </div>
                                <div
                                    className="w-full max-w-2xl mx-auto [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[400px] [&_text:not([fill])]:fill-stone-300 [&_text]:stroke-none"
                                    dangerouslySetInnerHTML={{ __html: themeSvg(activeGraph.svg_rendering_block) }}
                                />
                            </div>
                        )}

                        {/* Knowledge Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Concept */}
                            {activeGraph.core_concept_mapping && (
                                <GlowCard className="p-5 space-y-3">
                                    <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-400/70">Governing Principle</h5>
                                    <p className="text-[12.5px] text-white/80 font-semibold leading-relaxed">
                                        <FormatText>{activeGraph.core_concept_mapping.governing_principle}</FormatText>
                                    </p>
                                    {activeGraph.core_concept_mapping.molecular_interpretation && (
                                        <>
                                            <AccentDivider />
                                            <div>
                                                <h6 className="text-[8px] font-bold uppercase tracking-[0.12em] text-stone-500 mb-1.5">Molecular Interpretation</h6>
                                                <p className="text-[11.5px] text-stone-400 leading-[1.8]">
                                                    <FormatText>{activeGraph.core_concept_mapping.molecular_interpretation}</FormatText>
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </GlowCard>
                            )}

                            {/* Axes & Math */}
                            {activeGraph.cartesian_mechanics && (
                                <GlowCard className="p-5 space-y-3">
                                    <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-400/70">Axes & Boundaries</h5>
                                    <div className="space-y-2">
                                        <div className="p-2.5 bg-white/[0.02] border border-white/[0.03] rounded-lg">
                                            <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">X-Axis</span>
                                            <p className="text-[11px] text-stone-300"><FormatText>{activeGraph.cartesian_mechanics.x_axis_parameter}</FormatText></p>
                                        </div>
                                        <div className="p-2.5 bg-white/[0.02] border border-white/[0.03] rounded-lg">
                                            <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Y-Axis</span>
                                            <p className="text-[11px] text-stone-300"><FormatText>{activeGraph.cartesian_mechanics.y_axis_parameter}</FormatText></p>
                                        </div>
                                    </div>
                                    {activeGraph.cartesian_mechanics.boundary_conditions && (
                                        <div className="p-2.5 bg-white/[0.02] border border-white/[0.03] rounded-lg">
                                            <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Boundary Conditions</span>
                                            <p className="text-[11px] text-stone-400 leading-relaxed"><FormatText>{activeGraph.cartesian_mechanics.boundary_conditions}</FormatText></p>
                                        </div>
                                    )}
                                </GlowCard>
                            )}

                            {/* Peaks & Troughs */}
                            {activeGraph.mathematical_and_electronic_anatomy && (
                                <GlowCard className="p-5 space-y-3 lg:col-span-2">
                                    <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-400/70">Critical Landmarks</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {activeGraph.mathematical_and_electronic_anatomy.governing_factors && (
                                            <div className="p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl">
                                                <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block mb-1">Governing Factors</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed"><FormatText>{activeGraph.mathematical_and_electronic_anatomy.governing_factors}</FormatText></p>
                                            </div>
                                        )}
                                        {activeGraph.mathematical_and_electronic_anatomy.peak_identities && (
                                            <div className="p-3 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl">
                                                <span className="text-[8px] text-rose-400/70 font-bold uppercase tracking-wider block mb-1">📈 Peak Identities</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed"><FormatText>{activeGraph.mathematical_and_electronic_anatomy.peak_identities}</FormatText></p>
                                            </div>
                                        )}
                                        {activeGraph.mathematical_and_electronic_anatomy.trough_identities && (
                                            <div className="p-3 bg-blue-500/[0.02] border border-blue-500/10 rounded-xl">
                                                <span className="text-[8px] text-blue-400/70 font-bold uppercase tracking-wider block mb-1">📉 Trough Identities</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed"><FormatText>{activeGraph.mathematical_and_electronic_anatomy.trough_identities}</FormatText></p>
                                            </div>
                                        )}
                                    </div>
                                </GlowCard>
                            )}

                            {/* Examiner Tricks */}
                            {activeGraph.examiner_tricks_and_traps && (
                                <GlowCard className="p-5 space-y-3 lg:col-span-2">
                                    <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400/70">⚠️ Examiner Tricks & Traps</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeGraph.examiner_tricks_and_traps.trend_break_targeting && (
                                            <div className="p-3 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                                                <span className="text-[8px] text-amber-400/60 font-bold uppercase tracking-wider block mb-1">Trend Break Targeting</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed"><FormatText>{activeGraph.examiner_tricks_and_traps.trend_break_targeting}</FormatText></p>
                                            </div>
                                        )}
                                        {activeGraph.examiner_tricks_and_traps.period_vs_group_confusion && (
                                            <div className="p-3 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl">
                                                <span className="text-[8px] text-rose-400/60 font-bold uppercase tracking-wider block mb-1">Common Confusion</span>
                                                <p className="text-[11px] text-stone-300 leading-relaxed"><FormatText>{activeGraph.examiner_tricks_and_traps.period_vs_group_confusion}</FormatText></p>
                                            </div>
                                        )}
                                    </div>
                                </GlowCard>
                            )}
                        </div>

                        {/* Question Bank */}
                        {activeGraph.exhaustive_question_bank?.length > 0 && (
                            <div className="space-y-3">
                                <SectionLabel icon="📋">Question Bank</SectionLabel>
                                {activeGraph.exhaustive_question_bank.map((q, qIdx) => {
                                    const qaKey = `graph-${activeGraphIndex}-q-${qIdx}`;
                                    const isQARevealed = revealedAnswers[qaKey];
                                    return (
                                        <div key={qIdx} className="bg-[#111114] border border-white/[0.04] rounded-2xl overflow-hidden">
                                            <div className="p-5">
                                                <ChemistryBadge variant="primary" className="mb-2">{q.question_type}</ChemistryBadge>
                                                <p className="text-[13px] font-semibold text-white/85 leading-snug">
                                                    <FormatText>{q.question_text}</FormatText>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleAnswer(qaKey)}
                                                className="w-full px-5 py-2.5 border-t border-white/[0.03] text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 hover:text-teal-400 transition-colors"
                                            >
                                                {isQARevealed ? '▲ Hide' : '▼ Show Perfect Response'}
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isQARevealed && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 pb-5">
                                                            <div className="p-3 bg-teal-500/[0.02] border-l-2 border-teal-500/20 rounded-r-lg">
                                                                <p className="text-[12px] text-stone-300 leading-[1.8]">
                                                                    <FormatText>{q.perfect_response_script}</FormatText>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        );
    };

    // ── Main Render ────────────────────────────────────────
    return (
        <div className="w-full select-none">
            {/* ─── View Tabs ─── */}
            {viewTabs.length > 1 && (
                <div className="flex items-center gap-1 p-1.5 bg-[#0d0d0f] border border-white/[0.04] rounded-2xl mb-8 w-fit">
                    {viewTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                                activeView === tab.id
                                    ? 'bg-white/[0.06] text-white shadow-sm'
                                    : 'text-stone-500 hover:text-stone-300'
                            }`}
                        >
                            <span className="text-sm">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="text-[9px] font-mono opacity-50 ml-1">{tab.count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* ─── Topics View ─── */}
            {activeView === 'topics' && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* ── Sidebar ── */}
                    <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-24 space-y-3">
                        {/* Mobile toggle */}
                        <button
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            className="lg:hidden w-full flex items-center justify-between p-4 bg-[#111114] border border-white/[0.04] rounded-2xl text-sm font-bold text-white"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-teal-400">⚛️</span>
                                Topic {activeTopicIndex + 1}/{topics.length}
                            </span>
                            <span className={`text-stone-500 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <div className={`space-y-2 ${mobileNavOpen ? 'block' : 'hidden lg:block'}`}>
                            <div className="px-1 mb-3">
                                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-teal-400/70 mb-0.5">Chapter Topics</h3>
                                <p className="text-[10px] text-stone-600">Select to explore in detail</p>
                            </div>

                            <div className="max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                {topics.map((topic, index) => {
                                    const isActive = activeTopicIndex === index;
                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setActiveTopicIndex(index);
                                                setMobileNavOpen(false);
                                                setExpandedExceptions({});
                                                setRevealedAnswers({});
                                            }}
                                            className={`
                                                relative w-full text-left p-4 rounded-2xl border transition-all duration-300
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-teal-950/30 to-[#111114] border-teal-500/25 shadow-[0_0_20px_rgba(20,184,166,0.06)]'
                                                    : 'bg-[#111114] border-white/[0.04] hover:border-white/[0.08] hover:bg-[#141418]'
                                                }
                                            `}
                                        >
                                            {/* Active glow bar */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTopicIndicator"
                                                    className="absolute left-0 top-3 bottom-3 w-[3px] bg-gradient-to-b from-teal-400 to-emerald-500 rounded-r"
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}

                                            <div className="space-y-2 pl-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <PriorityChip tier={topic.metadata?.priority_tier || 'LOW'} />
                                                    <span className="text-[9px] text-stone-600 font-mono font-bold">
                                                        {topic.metadata?.pyq_frequency?.split(' ')[0]}/10
                                                    </span>
                                                </div>
                                                <h4 className={`text-[12.5px] font-bold leading-snug transition-colors ${
                                                    isActive ? 'text-white' : 'text-stone-400'
                                                }`}>
                                                    {topic.topic_name}
                                                </h4>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <main ref={mainRef} className="flex-1 min-w-0 w-full">
                        {/* Progress Track */}
                        <div className="hidden xl:flex items-center gap-1 mb-7 px-1">
                            {topics.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveTopicIndex(idx);
                                        setExpandedExceptions({});
                                        setRevealedAnswers({});
                                    }}
                                    className="flex-1 group"
                                >
                                    <div className={`h-1 rounded-full transition-all duration-500 ${
                                        idx < activeTopicIndex ? 'bg-teal-500/50'
                                            : idx === activeTopicIndex ? 'bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_8px_rgba(20,184,166,0.3)]'
                                                : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
                                    }`} />
                                </button>
                            ))}
                        </div>

                        {renderTopicContent()}
                    </main>
                </div>
            )}

            {/* ─── Exceptions View ─── */}
            {activeView === 'exceptions' && renderExceptionsView()}

            {/* ─── Graphs View ─── */}
            {activeView === 'graphs' && renderGraphsView()}
        </div>
    );
};

export default InorganicTopicExplorer;
