import { useState } from 'react';
import DiagramPlaceholder from './DiagramPlaceholder';
import LatexRenderer, { BlockMath } from './LatexRenderer';

/**
 * SubjectiveBlock - For Theory, Numerical, Derivation type questions
 * Shows question with "View Model Answer" reveal
 */
function SubjectiveBlock({ question }) {
    const [showAnswer, setShowAnswer] = useState(false);

    // Type badge colors
    const typeStyles = {
        theory: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/20', label: 'Theory' },
        numerical: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/20', label: 'Numerical' },
        derivation: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/20', label: 'Derivation' },
        short: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/20', label: 'Short Answer' },
        long: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/20', label: 'Long Answer' }
    };

    const typeStyle = typeStyles[question.type] || typeStyles.theory;

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6 font-heading">
                <span className={`px-3 py-1 ${typeStyle.bg} ${typeStyle.text} text-xs font-bold uppercase tracking-wider rounded-lg border ${typeStyle.border}`}>
                    {question.marks} Mark{question.marks > 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/70 text-xs font-bold rounded-lg border border-white/5">
                    {question.year}
                </span>
                <span className={`px-3 py-1 ${typeStyle.bg} ${typeStyle.text} text-xs font-bold uppercase tracking-wider rounded-lg border ${typeStyle.border}`}>
                    {typeStyle.label}
                </span>
            </div>

            {/* Question */}
            <div className="text-white/90 text-lg leading-relaxed mb-8">
                <LatexRenderer text={question.question} />
            </div>

            {/* Diagram placeholder if required */}
            {question.diagram_required && (
                <DiagramPlaceholder
                    title="Question Diagram"
                    caption={question.answer?.diagrams?.[0] || ''}
                />
            )}

            {/* View Model Answer Button */}
            {!showAnswer ? (
                <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-heading font-bold uppercase tracking-wide text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Model Answer
                </button>
            ) : (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-stone-900/50 rounded-2xl border border-white/5 overflow-hidden">
                        {/* Model Answer Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-emerald-400 font-heading font-bold text-sm uppercase tracking-wide">Model Answer</span>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Explanation */}
                            {question.answer?.explanation && (
                                <div className="text-white/80 leading-relaxed text-lg">
                                    <LatexRenderer text={question.answer.explanation} />
                                </div>
                            )}

                            {/* Key Formulae */}
                            {question.answer?.key_formulae && question.answer.key_formulae.length > 0 && (
                                <div className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider font-heading">Key Formulae</p>
                                    </div>
                                    <div className="space-y-4">
                                        {question.answer.key_formulae.map((formula, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-stone-950/50 rounded-lg p-4 text-center border border-white/5 shadow-inner"
                                            >
                                                <BlockMath math={formula} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Diagrams Required for Answer */}
                            {question.answer?.diagrams && question.answer.diagrams.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider font-heading pl-1">Diagrams to Draw</p>
                                    {question.answer.diagrams.map((diagram, idx) => (
                                        <DiagramPlaceholder
                                            key={idx}
                                            title={diagram}
                                            caption="Draw this diagram in your answer"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hide Answer Button */}
                    <button
                        onClick={() => setShowAnswer(false)}
                        className="w-full py-4 bg-white/5 text-white/60 hover:text-white rounded-xl font-heading font-medium hover:bg-white/10 transition-all border border-white/5"
                    >
                        Hide Answer
                    </button>
                </div>
            )}
        </div>
    );
}

export default SubjectiveBlock;
