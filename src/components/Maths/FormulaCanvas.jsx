import React from 'react';
import { Zap, AlertTriangle, ShieldAlert, Target, BookOpen, BrainCircuit, Lightbulb, Clock, Brain, Sparkles } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const FormulaCanvas = ({ formula, index, total, onNext, onPrev }) => {
    const processLatex = (str) => {
        if (!str) return '';
        return str.replace(/^\$\$(.*?)\$\$$/s, '$1').replace(/^\$(.*?)\$$/s, '$1').trim();
    };

    // Auto-detect math-like expressions in plain text and wrap them in $ delimiters
    const preprocessMathText = (text) => {
        if (!text || text.includes('$')) return text;
        return text.replace(
            /([^\s,;.!?]*[\^_√][^\s,;.!?]*)([,;.!?])?/g,
            (match, expr, punct) => {
                let latex = expr;
                latex = latex.replace(/\b(sin|cos|tan|sec|csc|cot|log|ln|lim|max|min)\b/g, '\\$1');
                latex = latex.replace(/\^(-?\d+|[a-zA-Z])\b/g, '^{$1}');
                latex = latex.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
                return `$${latex}$${punct || ''}`;
            }
        );
    };

    // Render inline LaTeX within text — handles $$...$$, $...$, and auto-detected math
    const renderTextWithLatex = (text) => {
        if (!text) return null;
        const processed = preprocessMathText(text);
        const parts = processed.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const math = part.slice(2, -2);
                try {
                    return <span key={i} className="inline-block align-middle mx-1 [&_.katex]:!text-[0.95em]"><BlockMath math={math} /></span>;
                } catch {
                    return <code key={i} className="text-violet-300 bg-violet-950/40 px-1.5 py-0.5 rounded text-sm">{math}</code>;
                }
            } else if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1);
                try {
                    return <span key={i} className="inline-block align-middle mx-0.5 [&_.katex]:!text-[0.9em]"><InlineMath math={math} /></span>;
                } catch {
                    return <code key={i} className="text-violet-300 bg-violet-950/40 px-1.5 py-0.5 rounded text-sm">{math}</code>;
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="w-full select-none dark-katex">

            {/* ╔══════════════════════════════════════════════════════════════╗
                ║           FORMULA TITLE                                     ║
                ╚══════════════════════════════════════════════════════════════╝ */}
            <div className="mb-12 flex items-end justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/20">
                            <span className="text-2xl font-bold text-white">{formula.formula_number}</span>
                        </div>
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 opacity-20 blur-lg -z-10"></div>
                    </div>
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.15]">
                            {formula.formula_title}
                        </h2>
                        <p className="text-white/30 text-sm mt-2 font-medium tracking-wide">FORMULA {formula.formula_number} OF {total}</p>
                    </div>
                </div>
            </div>


            {/* ╔══════════════════════════════════════════════════════════════╗
                ║           HERO FORMULA — THE STAR                           ║
                ╚══════════════════════════════════════════════════════════════╝ */}
            <section className="mb-14">
                <div className="relative group">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-violet-500/30 via-transparent to-fuchsia-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative bg-gradient-to-br from-[#110a24] to-[#0a0818] border border-violet-500/[0.08] rounded-[2rem] p-12 sm:p-16 overflow-hidden">
                        {/* Ambient glow layers */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[200px] bg-violet-600/[0.08] rounded-full blur-[120px] group-hover:bg-violet-500/[0.15] transition-all duration-1000"></div>
                            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[200px] bg-fuchsia-600/[0.06] rounded-full blur-[120px] group-hover:bg-fuchsia-500/[0.12] transition-all duration-1000"></div>
                        </div>

                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-full">
                                <div className="min-w-0 text-xl sm:text-2xl lg:text-3xl text-white [&_.katex]:!text-[1.1em] sm:[&_.katex]:!text-[1.3em] lg:[&_.katex]:!text-[1.6em] [&_.katex-display]:!my-2">
                                    <BlockMath math={processLatex(formula.section_A?.latex_formula)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ─── DERIVED FORMS & SPECIAL CASES ─── */}
            {((formula.section_A?.derived_forms && formula.section_A?.derived_forms.length > 0) ||
                (formula.section_A?.special_cases && formula.section_A?.special_cases.length > 0)) && (
                    <section className="mb-14 grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {formula.section_A?.derived_forms && formula.section_A?.derived_forms.length > 0 && (
                            <div className="bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.02] border border-violet-500/[0.07] rounded-2xl p-8 hover:border-amber-500/20 transition-colors duration-500">
                                <div className="flex items-center gap-3 mb-7">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <h3 className="text-white/60 font-semibold text-xs uppercase tracking-[0.2em]">Derived Forms</h3>
                                </div>
                                <div className="space-y-4">
                                    {formula.section_A?.derived_forms.map((df, i) => (
                                        <div key={i} className="bg-violet-500/[0.03] border border-violet-500/[0.06] rounded-xl px-6 py-5 overflow-hidden [&_.katex-display]:!my-0 [&_.katex]:!text-[0.85em] sm:[&_.katex]:!text-[0.95em] [&_.katex-display>.katex]:whitespace-normal">
                                            <BlockMath math={processLatex(df)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formula.section_A?.special_cases && formula.section_A?.special_cases.length > 0 && (
                            <div className="bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.02] border border-violet-500/[0.07] rounded-2xl p-8 hover:border-emerald-500/20 transition-colors duration-500">
                                <div className="flex items-center gap-3 mb-7">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <h3 className="text-white/60 font-semibold text-xs uppercase tracking-[0.2em]">Special Cases</h3>
                                </div>
                                <div className="space-y-4">
                                    {formula.section_A?.special_cases.map((sc, i) => (
                                        <div key={i} className="bg-violet-500/[0.03] border border-violet-500/[0.06] rounded-xl px-6 py-5 overflow-hidden [&_.katex-display]:!my-0 [&_.katex]:!text-[0.85em] sm:[&_.katex]:!text-[0.95em] [&_.katex-display>.katex]:whitespace-normal">
                                            <BlockMath math={processLatex(sc)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}


            {/* ╔══════════════════════════════════════════════════════════════╗
                ║           EXAM INSIGHTS                                     ║
                ╚══════════════════════════════════════════════════════════════╝ */}
            {formula.section_B && (
                <section className="mb-14">
                    {/* Section divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-violet-400/80 text-xs font-bold uppercase tracking-[0.25em]">Exam Intelligence</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {/* When to Use */}
                        {formula.section_B?.when_to_use && (
                            <div className="group bg-gradient-to-br from-sky-950/30 to-sky-950/10 border border-sky-500/[0.08] rounded-2xl p-7 hover:border-sky-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/15 transition-colors">
                                        <Lightbulb className="w-4 h-4 text-sky-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">When to Use</h4>
                                </div>
                                <p className="text-white/75 text-[14.5px] leading-[1.8]">{renderTextWithLatex(formula.section_B?.when_to_use)}</p>
                            </div>
                        )}

                        {/* Common Mistakes */}
                        {formula.section_B?.common_mistakes && formula.section_B?.common_mistakes.length > 0 && (
                            <div className="group bg-gradient-to-br from-rose-950/30 to-rose-950/10 border border-rose-500/[0.08] rounded-2xl p-7 hover:border-rose-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/15 transition-colors">
                                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">Common Mistakes</h4>
                                </div>
                                <ul className="space-y-3.5">
                                    {formula.section_B?.common_mistakes.map((m, i) => (
                                        <li key={i} className="text-white/75 text-[14.5px] leading-[1.8] flex gap-3">
                                            <span className="text-rose-400/60 mt-[9px] shrink-0 w-1 h-1 rounded-full bg-rose-400/60"></span>
                                            <span>{renderTextWithLatex(m)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Board Traps */}
                        {formula.section_B?.board_traps && formula.section_B?.board_traps.length > 0 && (
                            <div className="group bg-gradient-to-br from-orange-950/30 to-orange-950/10 border border-orange-500/[0.08] rounded-2xl p-7 hover:border-orange-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/15 transition-colors">
                                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">Board Traps</h4>
                                </div>
                                <ul className="space-y-3.5">
                                    {formula.section_B?.board_traps.map((t, i) => (
                                        <li key={i} className="text-white/75 text-[14.5px] leading-[1.8] flex gap-3">
                                            <span className="text-orange-400/60 mt-[9px] shrink-0 w-1 h-1 rounded-full bg-orange-400/60"></span>
                                            <span>{renderTextWithLatex(t)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Examiner Twist + Question Types — full-width row */}
                    {(formula.section_B?.examiner_twist_pattern || (formula.section_B?.question_types && formula.section_B?.question_types.length > 0)) && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-6">
                            {formula.section_B?.examiner_twist_pattern && (
                                <div className="flex-1 bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.02] border border-violet-500/[0.08] rounded-2xl p-7 hover:border-violet-500/15 transition-colors duration-500">
                                    <h4 className="text-white/50 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Examiner's Twist</h4>
                                    <p className="text-white/75 text-[14.5px] leading-[1.8]">{renderTextWithLatex(formula.section_B?.examiner_twist_pattern)}</p>
                                </div>
                            )}
                            {formula.section_B?.question_types && formula.section_B?.question_types.length > 0 && (
                                <div className="sm:w-auto bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.02] border border-violet-500/[0.08] rounded-2xl p-7 flex flex-col justify-center">
                                    <h4 className="text-white/50 text-xs uppercase tracking-[0.2em] font-semibold mb-4">Expected In</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {formula.section_B?.question_types.map((qt, i) => (
                                            <span key={i} className="px-4 py-2 bg-violet-500/8 border border-violet-500/15 rounded-full text-violet-300 text-xs font-medium hover:bg-violet-500/15 transition-colors">
                                                {qt.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}


            {/* ╔══════════════════════════════════════════════════════════════╗
                ║           MASTER STRATEGY                                    ║
                ╚══════════════════════════════════════════════════════════════╝ */}
            {formula.section_C && (
                <section className="mb-14">
                    {/* Section divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-2.5">
                            <Brain className="w-4 h-4 text-violet-400" />
                            <span className="text-violet-400/80 text-xs font-bold uppercase tracking-[0.25em]">Master Strategy</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Why Students Fail */}
                        {formula.section_C?.why_students_fail && (
                            <div className="group bg-gradient-to-br from-purple-950/30 to-purple-950/10 border border-purple-500/[0.08] rounded-2xl p-7 hover:border-purple-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/15 transition-colors">
                                        <Brain className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">Why Students Fail</h4>
                                </div>
                                <p className="text-white/75 text-[14.5px] leading-[1.8]">{renderTextWithLatex(formula.section_C?.why_students_fail)}</p>
                            </div>
                        )}

                        {/* How to Think */}
                        {formula.section_C?.how_to_think && (
                            <div className="group bg-gradient-to-br from-fuchsia-950/30 to-fuchsia-950/10 border border-fuchsia-500/[0.08] rounded-2xl p-7 hover:border-fuchsia-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/10 flex items-center justify-center group-hover:bg-fuchsia-500/15 transition-colors">
                                        <BrainCircuit className="w-4 h-4 text-fuchsia-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">How to Think</h4>
                                </div>
                                <p className="text-white/75 text-[14.5px] leading-[1.8]">{renderTextWithLatex(formula.section_C?.how_to_think)}</p>
                            </div>
                        )}

                        {/* 30-Second Strategy */}
                        {formula.section_C?.thirty_second_strategy && (
                            <div className="group bg-gradient-to-br from-indigo-950/30 to-indigo-950/10 border border-indigo-500/[0.08] rounded-2xl p-7 hover:border-indigo-400/20 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/15 transition-colors">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <h4 className="text-white font-semibold text-[15px]">30-Second Strategy</h4>
                                </div>
                                <p className="text-white/75 text-[14.5px] leading-[1.8]">{renderTextWithLatex(formula.section_C?.thirty_second_strategy)}</p>
                            </div>
                        )}

                        {/* Mental Shortcut */}
                        {formula.section_C?.mental_shortcut && (
                            <div className="group relative bg-gradient-to-br from-amber-950/25 to-amber-950/5 border border-amber-500/[0.08] rounded-2xl p-7 hover:border-amber-400/20 transition-all duration-500 overflow-hidden">
                                {/* Subtle accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-[60px]"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-[15px]">Mental Shortcut</h4>
                                    </div>
                                    <p className="text-white/80 text-[15px] leading-[1.8] font-medium italic">"{renderTextWithLatex(formula.section_C?.mental_shortcut)}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}


            {/* ─── MICRO EXAMPLE ─── */}
            {formula.section_C?.micro_example && (
                <section className="mb-14">
                    <div className="relative group bg-gradient-to-br from-emerald-950/25 to-emerald-950/5 border border-emerald-500/[0.08] rounded-2xl p-8 sm:p-10 hover:border-emerald-400/20 transition-all duration-500 overflow-hidden">
                        {/* Accent glow */}
                        <div className="absolute bottom-0 left-1/4 w-[300px] h-[100px] bg-emerald-500/[0.04] rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                                    <BookOpen className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h4 className="text-white font-semibold text-[15px]">Micro Example</h4>
                            </div>
                            <div className="bg-violet-500/[0.03] border border-violet-500/[0.06] rounded-xl px-8 py-6 text-white/90 text-[15px] leading-[1.9] [&_.katex-display]:!my-1 [&_.katex]:!text-[1.1em] sm:[&_.katex]:!text-[1.2em]">
                                {renderTextWithLatex(formula.section_C?.micro_example)}
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {/* ─── TRIGGER KEYWORDS ─── */}
            {formula.section_B?.trigger_keywords && formula.section_B?.trigger_keywords.length > 0 && (
                <section className="mb-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-white/30 text-[11px] uppercase tracking-[0.25em] font-semibold mr-1">Keywords</span>
                        {formula.section_B?.trigger_keywords.map((kw, i) => (
                            <span key={i} className="px-4 py-2 bg-violet-500/[0.03] border border-violet-500/[0.08] rounded-full text-[12px] text-white/50 font-medium hover:text-white/80 hover:border-violet-400/20 hover:bg-violet-500/[0.06] transition-all duration-300 cursor-default">
                                {kw}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default FormulaCanvas;
