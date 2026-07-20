import { useState } from 'react';
import katex from 'katex';
import DiagramPlaceholder from './DiagramPlaceholder';

/**
 * Check if text contains LaTeX commands
 */
function containsLatex(text) {
    if (!text) return false;
    return /\\(frac|sqrt|pi|epsilon|alpha|beta|gamma|delta|theta|lambda|mu|sigma|omega|times|cdot|pm|neq|leq|geq|infty|sum|int|vec|hat|bar|overline|underline|text|mathrm|left|right|\{|\})/i.test(text);
}

/**
 * Render LaTeX strings safely - handles $...$, \\(...\\), and raw LaTeX
 */
function renderLatex(text) {
    if (!text) return '';

    let result = String(text);

    // Handle \\(...\\) patterns
    const inlinePatterns = result.match(/\\\\\(.*?\\\\\)/g);
    if (inlinePatterns) {
        inlinePatterns.forEach(match => {
            try {
                const latex = match.slice(2, -2);
                const rendered = katex.renderToString(latex, { throwOnError: false, displayMode: false });
                result = result.replace(match, rendered);
            } catch (e) { }
        });
    }

    // Handle $...$ patterns
    const dollarPatterns = result.match(/\$[^$]+\$/g);
    if (dollarPatterns) {
        dollarPatterns.forEach(match => {
            try {
                const latex = match.slice(1, -1);
                const rendered = katex.renderToString(latex, { throwOnError: false, displayMode: false });
                result = result.replace(match, rendered);
            } catch (e) { }
        });
    }

    // If still contains raw LaTeX commands (no delimiters), try to render entire text
    if (containsLatex(result) && !result.includes('<span class="katex">')) {
        try {
            const rendered = katex.renderToString(result, { throwOnError: false, displayMode: false });
            return rendered;
        } catch (e) {
            return result;
        }
    }

    return result;
}

/**
 * Parse assertion and reason text from question string
 * Format: "Assertion (A): ... Reason (R): ..."
 */
function parseAssertionReason(questionText) {
    if (!questionText) return { assertion: '', reason: '' };

    // Try to split by "Reason (R):" pattern
    const reasonMatch = questionText.match(/Reason\s*\(R\)\s*:\s*/i);

    if (reasonMatch) {
        const splitIndex = questionText.indexOf(reasonMatch[0]);
        let assertionPart = questionText.substring(0, splitIndex).trim();
        let reasonPart = questionText.substring(splitIndex + reasonMatch[0].length).trim();

        // Remove "Assertion (A):" prefix if present
        assertionPart = assertionPart.replace(/^Assertion\s*\(A\)\s*:\s*/i, '').trim();

        return {
            assertion: assertionPart,
            reason: reasonPart
        };
    }

    // Fallback: return entire question as assertion
    return {
        assertion: questionText.replace(/^Assertion\s*\(A\)\s*:\s*/i, '').trim(),
        reason: ''
    };
}

/**
 * AssertionReasonBlock - Renders CBSE-style Assertion-Reason questions
 * 
 * New JSON structure:
 * - question.assertion: boolean (true/false) indicating if assertion is correct
 * - question.reason: boolean (true/false) indicating if reason is correct
 * - question.question: string containing both assertion and reason text
 */
function AssertionReasonBlock({ question, onComplete }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const correctOption = question.correct_option;
    const isCorrect = submitted && selectedOption === correctOption;

    // Parse assertion and reason from question text
    const { assertion, reason } = parseAssertionReason(question.question);

    // Standard CBSE A-R options
    const standardOptions = {
        A: "Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of the Assertion (A).",
        B: "Both Assertion (A) and Reason (R) are true, but Reason (R) is NOT the correct explanation of the Assertion (A).",
        C: "Assertion (A) is true, but Reason (R) is false.",
        D: "Assertion (A) is false and Reason (R) is also false."
    };

    // Use question's options if provided, otherwise use standard
    const options = question.options || standardOptions;

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

    const getOptionStyle = (key) => {
        const base = "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer";

        if (!submitted) {
            if (selectedOption === key) {
                return `${base} bg-amber-500/20 border-amber-500/50`;
            }
            return `${base} bg-white/5 border-white/10 hover:bg-white/10`;
        }

        if (key === correctOption) {
            return `${base} bg-emerald-500/20 border-emerald-500/50`;
        }
        if (selectedOption === key && key !== correctOption) {
            return `${base} bg-red-500/20 border-red-500/50`;
        }
        return `${base} bg-white/5 border-white/10 opacity-50`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg">
                    {question.marks} Mark{question.marks > 1 ? 's' : ''}
                </span>
                <span className="px-2.5 py-1 bg-white/10 text-white/60 text-xs rounded-lg">
                    {question.year}
                </span>
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg">
                    Assertion-Reason
                </span>
            </div>

            {/* Assertion */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-blue-400 text-xs uppercase tracking-wide font-medium">
                        Assertion (A)
                    </p>
                    {submitted && typeof question.assertion === 'boolean' && (
                        <span className={`text-xs px-2 py-0.5 rounded ${question.assertion ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {question.assertion ? 'True' : 'False'}
                        </span>
                    )}
                </div>
                <p
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderLatex(assertion) }}
                />
            </div>

            {/* Reason */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-purple-400 text-xs uppercase tracking-wide font-medium">
                        Reason (R)
                    </p>
                    {submitted && typeof question.reason === 'boolean' && (
                        <span className={`text-xs px-2 py-0.5 rounded ${question.reason ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {question.reason ? 'True' : 'False'}
                        </span>
                    )}
                </div>
                <p
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderLatex(reason) }}
                />
            </div>

            {/* Diagram if required */}
            {question.diagram_required && (
                <DiagramPlaceholder title="Question Diagram" />
            )}

            {/* Standard Options */}
            <div className="space-y-2 mb-6">
                {Object.entries(options).map(([key, value]) => (
                    <div
                        key={key}
                        onClick={() => !submitted && setSelectedOption(key)}
                        className={getOptionStyle(key)}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedOption === key
                            ? submitted
                                ? key === correctOption ? 'border-emerald-500 bg-emerald-500' : 'border-red-500 bg-red-500'
                                : 'border-amber-500 bg-amber-500'
                            : submitted && key === correctOption
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-white/30'
                            }`}>
                            {(selectedOption === key || (submitted && key === correctOption)) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="text-white/60 font-medium mr-2">({key})</span>
                            <span className="text-white/70 text-sm">{value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit / Feedback */}
            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${selectedOption
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    Submit Answer
                </button>
            ) : (
                <>
                    <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <p className={`font-medium mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </p>
                        {!isCorrect && (
                            <p className="text-white/60 text-sm">
                                Correct answer: <span className="text-emerald-400 font-medium">({correctOption})</span>
                            </p>
                        )}
                    </div>

                    {question.answer?.explanation && (
                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                            <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Explanation</p>
                            <p
                                className="text-white/80 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderLatex(question.answer.explanation) }}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleReset}
                        className="w-full py-3 bg-white/10 text-white/70 rounded-xl font-medium hover:bg-white/20 transition-all"
                    >
                        Try Again
                    </button>
                </>
            )}
        </div>
    );
}

export default AssertionReasonBlock;
