import { useState } from 'react';
import DiagramPlaceholder from './DiagramPlaceholder';
import LatexRenderer from './LatexRenderer';

/**
 * MCQBlock - Interactive MCQ component with premium design
 */
function MCQBlock({ question, onComplete }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Normalize options to ensure consistent {key, value} pairs
    // If array: map index 0 -> "1", 1 -> "2", etc.
    const normalizedOptions = Array.isArray(question.options)
        ? question.options.map((opt, i) => ({ key: String(i + 1), value: opt }))
        : Object.entries(question.options || {}).map(([key, value]) => ({ key, value }));

    const correctOption = question.correct_option;
    const isCorrect = submitted && selectedOption === correctOption;
    // const isWrong = submitted && selectedOption !== correctOption; // Unused

    const handleSubmit = () => {
        if (selectedOption) {
            setSubmitted(true);
            if (onComplete) onComplete(isCorrect);
        }
    };

    const handleReset = () => {
        setSelectedOption(null);
        setSubmitted(false);
    };

    // Option styling based on state
    const getOptionStyle = (key) => {
        const base = "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group";

        if (!submitted) {
            if (selectedOption === key) {
                return `${base} bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10`;
            }
            return `${base} bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]`;
        }

        // After submission
        if (key === correctOption) {
            return `${base} bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10`;
        }
        if (selectedOption === key && key !== correctOption) {
            return `${base} bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/10`;
        }
        return `${base} bg-white/5 border-white/10 opacity-50 grayscale`;
    };

    const getRadioStyle = (key) => {
        const base = "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors";

        if (!submitted) {
            if (selectedOption === key) {
                return `${base} border-indigo-500 bg-indigo-500`;
            }
            return `${base} border-white/30 group-hover:border-white/50`;
        }

        if (key === correctOption) {
            return `${base} border-emerald-500 bg-emerald-500`;
        }
        if (selectedOption === key && key !== correctOption) {
            return `${base} border-red-500 bg-red-500`;
        }
        return `${base} border-white/20`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-colors w-full overflow-hidden">
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-6 font-heading">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-lg flex-shrink-0">
                    {question.marks} Mark{question.marks > 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/70 text-xs font-bold rounded-lg border border-white/5">
                    {question.year}
                </span>
                {question.type === 'mcq' && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-purple-500/20">
                        MCQ
                    </span>
                )}
            </div>

            {/* Question Text */}
            <div className="text-white/90 text-lg leading-relaxed mb-8 break-words">
                <LatexRenderer text={question.question} />
            </div>

            {/* Diagram if required */}
            {question.diagram_required && (
                <DiagramPlaceholder title="Question Diagram" />
            )}

            {/* Options */}
            <div className="space-y-3 mb-8">
                {normalizedOptions.map(({ key, value }) => (
                    <div
                        key={key}
                        onClick={() => !submitted && setSelectedOption(key)}
                        className={getOptionStyle(key)}
                    >
                        <div className={getRadioStyle(key)}>
                            {(selectedOption === key || (submitted && key === correctOption)) && (
                                <div className="w-2 h-2 bg-white rounded-full animate-scale-in"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-white/60 font-medium mr-3 font-heading text-sm uppercase tracking-wide">
                                Option {key}
                            </span>
                            <div className="text-white/90 mt-1 break-words">
                                <LatexRenderer text={value} />
                            </div>
                        </div>

                        {/* Correct/Wrong indicators icons */}
                        {submitted && key === correctOption && (
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        {submitted && selectedOption === key && key !== correctOption && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`w-full py-4 rounded-xl font-heading font-bold uppercase tracking-wide text-sm transition-all shadow-lg ${selectedOption
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.01] hover:shadow-indigo-500/25'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                >
                    Submit Answer
                </button>
            ) : (
                <div className="animate-fade-in-up">
                    {/* Feedback */}
                    <div className={`p-5 rounded-xl mb-6 border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isCorrect ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>
                            <div>
                                <p className={`font-heading font-bold text-lg ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </p>
                            </div>
                        </div>

                        {!isCorrect && (
                            <div className="ml-11 text-white/70 text-sm">
                                The correct answer is option <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{correctOption}</span>
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    {question.answer?.explanation && (
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider font-heading">Explanation</p>
                            </div>
                            <div className="text-white/90 text-base leading-relaxed">
                                <LatexRenderer text={question.answer.explanation} />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleReset}
                        className="w-full py-4 bg-white/5 text-white/60 hover:text-white rounded-xl font-heading font-medium hover:bg-white/10 transition-all border border-white/5"
                    >
                        Attempt Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default MCQBlock;
