import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * PE Practice Section Component
 * Handles display and interaction for MCQs, Assertion-Reason, and Subjective questions
 */
function PEPracticeSection({ data }) {
    if (!data || !data.questions) return null;

    const [filter, setFilter] = useState('all');
    // Track selected options for MCQs/AR: { questionId: selectedOptionKey }
    const [selectedOptions, setSelectedOptions] = useState({});
    // Track revealed answers for Subjective: { questionId: boolean }
    const [revealedAnswers, setRevealedAnswers] = useState({});

    const questions = data.questions;

    // Filter logic
    const filteredQuestions = questions.filter(q => {
        if (filter === 'all') return true;
        if (filter === 'mcq') return q.type === 'mcq';
        if (filter === 'ar') return q.type === 'assertion_reason';
        if (filter === 'subjective') return ['very_short', 'short', 'long'].includes(q.type);
        return true;
    });

    const handleOptionSelect = (qId, optionKey) => {
        if (selectedOptions[qId]) return; // Prevent changing after selection
        setSelectedOptions(prev => ({ ...prev, [qId]: optionKey }));
    };

    const toggleReveal = (qId) => {
        setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    // Helper to parser text with LaTeX
    const parseText = (text) => {
        if (!text) return null;

        const parts = [];
        // Regex for Block Math ($$...$$), Inline Math ($...$), and Bold (**...**)
        const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$]+\$)|(\*\*[^*]+\*\*)/g;
        let lastIndex = 0;
        let match;
        let key = 0;

        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
            }

            if (match[1]) {
                // Block Math $$...$$
                const latex = match[1].slice(2, -2);
                parts.push(<div key={key++} className="my-2 overflow-x-auto"><BlockMath math={latex} /></div>);
            } else if (match[2]) {
                // Inline Math $...$
                const latex = match[2].slice(1, -1);
                parts.push(<InlineMath key={key++} math={latex} />);
            } else if (match[3]) {
                // Bold **...**
                parts.push(<strong key={key++} className="font-semibold text-white">{match[3].slice(2, -2)}</strong>);
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : text;
    };

    const renderPriorityBadge = (priority) => {
        const colors = {
            'P1': 'bg-red-500/10 text-red-500 border-red-500/20',
            'P2': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'P3': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[priority] || colors['P3']}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Practice Questions</h3>
                    <p className="text-stone-400 text-sm">
                        Total: {questions.length} Questions • {data.meta?.chapter}
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'mcq', label: 'MCQs' },
                        { id: 'ar', label: 'Assertion-Reason' },
                        { id: 'subjective', label: 'Subjective' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`
                                px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap
                                ${filter === f.id
                                    ? 'bg-white text-stone-900'
                                    : 'text-stone-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {filteredQuestions.map((q, idx) => (
                    <div
                        key={q.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300"
                    >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-stone-400 font-mono text-sm">#{idx + 1}</span>
                                {renderPriorityBadge(q.priority)}
                                <span className="text-xs text-stone-400 px-2 py-0.5 bg-white/5 rounded">
                                    {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium bg-white/5 px-2 py-1 rounded">
                                {q.source_basis}
                            </span>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6 text-stone-200 font-medium leading-relaxed">
                            {parseText(q.question)}
                        </div>

                        {/* MCQ / AR Options */}
                        {(q.type === 'mcq' || q.type === 'assertion_reason') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(q.options).map(([key, value]) => {
                                    const isSelected = selectedOptions[q.id] === key;
                                    const isCorrect = key === q.correct_option;
                                    const showResult = !!selectedOptions[q.id];

                                    let optionClass = "border-white/10 hover:bg-white/5 text-stone-300";
                                    if (showResult) {
                                        if (isCorrect) optionClass = "bg-green-500/10 border-green-500/50 text-green-400";
                                        else if (isSelected) optionClass = "bg-red-500/10 border-red-500/50 text-red-400";
                                        else optionClass = "border-white/10 opacity-50 text-stone-500";
                                    } else if (isSelected) {
                                        optionClass = "bg-white text-stone-900 border-white";
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleOptionSelect(q.id, key)}
                                            disabled={showResult}
                                            className={`
                                                relative text-left p-3 rounded-lg border transition-all duration-200 flex items-start gap-3
                                                ${optionClass}
                                            `}
                                        >
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-current opacity-60 text-xs font-bold">
                                                {key}
                                            </span>
                                            <span className="text-sm">{parseText(value)}</span>

                                            {showResult && isCorrect && (
                                                <span className="absolute top-3 right-3 text-green-500">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Subjective Answer Toggle */}
                        {['very_short', 'short', 'long'].includes(q.type) && (
                            <button
                                onClick={() => toggleReveal(q.id)}
                                className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            >
                                <span>{revealedAnswers[q.id] ? 'Hide Answer' : 'Show Answer'}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-300 ${revealedAnswers[q.id] ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Explanation / Answer Section */}
                        {((['mcq', 'assertion_reason'].includes(q.type) && selectedOptions[q.id]) ||
                            (['very_short', 'short', 'long'].includes(q.type) && revealedAnswers[q.id])) && (
                                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in-up">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                                            {['mcq', 'assertion_reason'].includes(q.type) ? 'Explanation' : 'Model Answer'}
                                        </h4>

                                        {/* Subjective Key Points */}
                                        {q.answer.key_points && q.answer.key_points.length > 0 && (
                                            <div className="mb-3">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {q.answer.key_points.map((point, i) => (
                                                        <li key={i} className="text-sm text-stone-300">{parseText(point)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Final Answer / Explanation */}
                                        <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap">
                                            {parseText(q.answer.final_answer || q.answer.explanation)}
                                        </div>

                                        {/* Diagram Placeholder */}
                                        {q.diagram_required && (
                                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
                                                <span className="text-xl">✏️</span>
                                                <div className="text-xs text-amber-600 dark:text-amber-400">
                                                    <strong>Diagram Required:</strong> {q.diagram_description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                ))}

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12 text-stone-400">
                        No questions in this category.
                    </div>
                )}
            </div>
        </div>
    );
}

export default PEPracticeSection;
