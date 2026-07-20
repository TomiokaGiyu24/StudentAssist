import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Enhanced LaTeX renderer with better error handling
 * Supports both $...$ inline and $$...$$ display math
 * Also auto-detects common LaTeX patterns without $ wrappers
 */
function renderLatex(text) {
    if (!text) return '';

    let result = String(text);

    // Handle bold text **...**
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle explicit newlines with double break for spacing
    result = result.replace(/\n|\\n/g, '<br/><br/>');

    // Auto-detect raw LaTeX patterns and wrap them with $ for processing
    // Common LaTeX commands that indicate mathematical content
    const latexPatterns = [
        /\\frac\{[^}]*\}\{[^}]*\}/g,           // \frac{a}{b}
        /\\sqrt(\[[^\]]*\])?\{[^}]*\}/g,       // \sqrt{a} or \sqrt[n]{a}
        /\\vec\{[^}]*\}/g,                      // \vec{a}
        /\\hat\{[^}]*\}/g,                      // \hat{a}
        /\\bar\{[^}]*\}/g,                      // \bar{a}
        /\\overline\{[^}]*\}/g,                // \overline{a}
        /\\underline\{[^}]*\}/g,               // \underline{a}
        /\\sum[_^]?/g,                          // \sum
        /\\int[_^]?/g,                          // \int
        /\\prod[_^]?/g,                         // \prod
        /\\lim[_^]?/g,                          // \lim
        /\\infty/g,                             // \infty
        /\\partial/g,                           // \partial
        /\\nabla/g,                             // \nabla
        /\\times/g,                             // \times
        /\\cdot/g,                              // \cdot
        /\\pm/g,                                // \pm
        /\\mp/g,                                // \mp
        /\\leq/g,                               // \leq
        /\\geq/g,                               // \geq
        /\\neq/g,                               // \neq
        /\\approx/g,                            // \approx
        /\\equiv/g,                             // \equiv
        /\\propto/g,                            // \propto
        /\\rightarrow/g,                        // \rightarrow
        /\\leftarrow/g,                         // \leftarrow
        /\\Rightarrow/g,                        // \Rightarrow
        /\\text\{[^}]*\}/g,                     // \text{...}
    ];

    // Greek letters
    const greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
        'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
        'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
        'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Theta', 'Lambda',
        'Pi', 'Sigma', 'Phi', 'Psi', 'Omega'];
    greekLetters.forEach(letter => {
        latexPatterns.push(new RegExp(`\\\\${letter}`, 'g'));
    });

    // Check if the string contains LaTeX but no $ wrappers
    const hasLatexCommands = latexPatterns.some(pattern => pattern.test(result));
    const hasSubscriptSuperscript = /[_^]\{[^}]+\}|[_^][a-zA-Z0-9]/.test(result);
    const hasNoDelimiters = !result.includes('$');

    // If it has LaTeX patterns but no $ delimiters, wrap the entire content
    if ((hasLatexCommands || hasSubscriptSuperscript) && hasNoDelimiters) {
        // Wrap the content (after bold/newline processing) in $ for inline math
        try {
            const rendered = katex.renderToString(result.replace(/<br\/><br\/>/g, '\\\\').replace(/<strong>/g, '\\textbf{').replace(/<\/strong>/g, '}'), {
                throwOnError: false,
                displayMode: false,
                output: 'html'
            });
            return rendered;
        } catch (e) {
            console.warn('KaTeX auto-wrap error:', e);
            // Fall through to original processing
        }
    }

    // Handle display math $$...$$
    const displayPatterns = result.match(/\$\$[^$]+\$\$/g);
    if (displayPatterns) {
        displayPatterns.forEach(match => {
            try {
                const latex = match.slice(2, -2).trim();
                const rendered = katex.renderToString(latex, {
                    throwOnError: false,
                    displayMode: true,
                    output: 'html'
                });
                result = result.replace(match, `<div class="my-3">${rendered}</div>`);
            } catch (e) {
                console.warn('KaTeX display error:', e);
            }
        });
    }

    // Handle inline math $...$
    const inlinePatterns = result.match(/\$[^$]+\$/g);
    if (inlinePatterns) {
        inlinePatterns.forEach(match => {
            try {
                const latex = match.slice(1, -1).trim();
                const rendered = katex.renderToString(latex, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html'
                });
                result = result.replace(match, rendered);
            } catch (e) {
                console.warn('KaTeX inline error:', e);
            }
        });
    }

    // Handle common LaTeX commands that might not be wrapped in $
    result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => {
        try {
            return katex.renderToString(`\\frac{${num}}{${den}}`, { throwOnError: false });
        } catch { return `${num}/${den}`; }
    });

    result = result.replace(/\\vec\{([^}]+)\}/g, (_, content) => {
        try {
            return katex.renderToString(`\\vec{${content}}`, { throwOnError: false });
        } catch { return content; }
    });

    return result;
}

/**
 * Diagram Placeholder Component
 */
function DiagramPlaceholder({ type = 'diagram', caption = '' }) {
    return (
        <div className="my-4 p-6 bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-stone-200 rounded-xl flex items-center justify-center">
                {type === 'graph' ? (
                    <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </div>
            <p className="text-sm font-medium text-stone-500">
                {type === 'graph' ? 'Graph' : 'Diagram'} Placeholder
            </p>
            {caption && (
                <p className="text-xs text-stone-400 mt-1">{caption}</p>
            )}
        </div>
    );
}

/**
 * MockMCQBlock - MCQ component with improved typography
 * Handles both old format (options as object) and new format (options as array)
 */
function MockMCQBlock({ question, selectedAnswer, onAnswerSelect, showFeedback = false }) {
    // Normalize options to { key, value } format
    const optionsArray = Array.isArray(question.options)
        ? question.options.map((opt, i) => ({ key: String.fromCharCode(65 + i), value: opt }))
        : Object.entries(question.options || {}).map(([key, value]) => ({ key, value }));

    const isArrayFormat = Array.isArray(question.options);

    // Get correct answer key
    const getCorrectAnswerKey = () => {
        if (question.correct_option) {
            // Check if it's a simple key (A, B, C, D) or a full answer string
            const correctOpt = String(question.correct_option).trim();

            // If it's a single letter (and matches a key), return it
            if (correctOpt.length === 1 && /[A-Z]/i.test(correctOpt)) {
                return correctOpt.toUpperCase();
            }

            // Otherwise, try to find matching value in options
            if (optionsArray.length > 0) {
                const normCorrect = correctOpt.toLowerCase();
                const match = optionsArray.find(opt =>
                    String(opt.value).trim().toLowerCase() === normCorrect
                );
                if (match) return match.key;
            }

            return question.correct_option;
        }

        // Strategy 2: Single letter answer (Old format?)
        if (typeof question.answer === 'string' && question.answer.length === 1) return question.answer;

        // Strategy 3: Parse 'answer' field (e.g., "**Option (B)**") - Common in Physics/Chemistry
        if (typeof question.answer === 'string') {
            const match = question.answer.match(/Option\s*\(([A-D])\)/i);
            if (match && match[1]) {
                return match[1].toUpperCase();
            }
        }

        return null;
    };

    const correctAnswerKey = getCorrectAnswerKey();
    const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;

    // Check correction based on KEY
    const isCorrect = (optionKey) => {
        if (!correctAnswerKey) return false;
        return optionKey === correctAnswerKey;
    };

    const getOptionStyle = (optionKey, optionValue) => {
        const base = "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer";

        if (showFeedback && isAnswered) {
            if (isCorrect(optionKey)) {
                return `${base} bg-green-50 border-green-400`;
            }
            if (selectedAnswer === optionKey && !isCorrect(optionKey)) {
                return `${base} bg-red-50 border-red-400`;
            }
            // Highlight correct answer if user answered wrong/different
            if (isCorrect(optionKey)) {
                return `${base} bg-green-50 border-green-400 border-dashed`;
            }
            return `${base} bg-stone-50 border-stone-200 opacity-60`;
        }

        if (selectedAnswer === optionKey) {
            return `${base} bg-indigo-50 border-indigo-500`;
        }
        return `${base} bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50`;
    };

    const getRadioStyle = (optionKey) => {
        const base = "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5";

        if (showFeedback && isAnswered) {
            if (isCorrect(optionKey)) {
                return `${base} border-green-500 bg-green-500`;
            }
            if (selectedAnswer === optionKey && !isCorrect(optionKey)) {
                return `${base} border-red-500 bg-red-500`;
            }
            return `${base} border-stone-300`;
        }

        if (selectedAnswer === optionKey) {
            return `${base} border-indigo-500 bg-indigo-500`;
        }
        return `${base} border-stone-300`;
    };

    // Get question text - handle assertion/reason format
    const questionText = question.question || question.question_text ||
        (question.assertion && question.reason
            ? `**Assertion (A):** ${question.assertion}\n\n**Reason (R):** ${question.reason}`
            : '');

    // For legacy reference
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="space-y-6">
            {/* Question Text - Improved Typography */}
            <div
                className="text-stone-800 text-lg leading-relaxed font-serif whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderLatex(questionText) }}
            />

            {/* Diagram (Image) if URL is present */}
            {question.diagram_url && (
                <div className="my-4 flex justify-center">
                    <img
                        src={question.diagram_url}
                        alt="Question Diagram"
                        className="max-w-full h-auto max-h-[400px] rounded-lg border border-stone-200 shadow-sm"
                    />
                </div>
            )}

            {/* Diagram placeholder if required and NO URL */}
            {question.diagram_required && !question.diagram_url && (
                <DiagramPlaceholder caption={question.diagram_caption} />
            )}

            {/* Options */}
            <div className="space-y-3">
                {optionsArray.map((option, idx) => {
                    // Always use Key for selection and comparison
                    const optionKey = option.key;
                    const optionValue = option.value;

                    return (
                        <div
                            key={optionKey}
                            onClick={() => !showFeedback && onAnswerSelect && onAnswerSelect(optionKey)}
                            className={getOptionStyle(optionKey, optionValue)}
                        >
                            <div className={getRadioStyle(optionKey)}>
                                {(selectedAnswer === optionKey || (showFeedback && isCorrect(optionKey))) && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="text-base font-medium text-stone-700"
                                    dangerouslySetInnerHTML={{ __html: renderLatex(optionValue) }}
                                />
                            </div>

                            {/* Correct/Wrong indicators */}
                            {showFeedback && isCorrect(optionKey) && (
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {showFeedback && selectedAnswer === optionKey && !isCorrect(optionKey) && (
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Explanation - shown in feedback mode - ENLARGED */}
            {showFeedback && (question.explanation || question.answer) && (
                <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                            Explanation
                        </h4>
                    </div>
                    <div
                        className="text-base text-indigo-900 leading-relaxed font-serif"
                        dangerouslySetInnerHTML={{ __html: renderLatex(question.explanation || (typeof question.answer === 'string' ? question.answer : (question.answer?.explanation || question.answer?.final_answer))) }}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * MockSubjectiveBlock - Theory/Numerical questions with improved answer display
 * canReveal prop controls whether the reveal button is shown (false in exam mode)
 */
function MockSubjectiveBlock({ question, showSolution = false, canReveal = true }) {
    const [revealed, setRevealed] = useState(showSolution);

    // Sync revealed state when showSolution prop changes
    // This ensures answers show automatically in practice mode
    React.useEffect(() => {
        if (showSolution) {
            setRevealed(true);
        }
    }, [showSolution]);

    // Get answer text - handle different formats
    const getAnswerText = () => {
        if (typeof question.answer === 'string') return question.answer;
        if (question.answer?.explanation) return question.answer.explanation;
        if (question.answer?.final_answer) return question.answer.final_answer;
        return null;
    };

    const answerText = getAnswerText();
    // Support both 'question' and 'question_text' fields
    const qText = question.question || question.question_text || '';

    const hasGraph = qText.toLowerCase().includes('graph') ||
        qText.toLowerCase().includes('variation') ||
        qText.toLowerCase().includes('plot');
    const hasDiagram = question.diagram_required ||
        qText.toLowerCase().includes('diagram') ||
        qText.toLowerCase().includes('draw');

    return (
        <div className="space-y-6">
            {/* Question Text - Improved Typography */}
            <div
                className="text-stone-800 text-lg leading-relaxed font-serif whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderLatex(qText) }}
            />

            {/* Diagram (Image) if URL is present */}
            {question.diagram_url && (
                <div className="my-4 flex justify-center">
                    <img
                        src={question.diagram_url}
                        alt="Question Diagram"
                        className="max-w-full h-auto max-h-[400px] rounded-lg border border-stone-200 shadow-sm"
                    />
                </div>
            )}

            {/* Internal Choice Display */}
            {question.has_internal_choice && (
                <>
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-stone-300"></div>
                        <span className="flex-shrink-0 mx-4 text-stone-400 font-bold uppercase tracking-widest text-sm">OR</span>
                        <div className="flex-grow border-t border-stone-300"></div>
                    </div>
                    {question.choice_question_text && (
                        <div
                            className="text-stone-800 text-lg leading-relaxed font-serif whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: renderLatex(question.choice_question_text) }}
                        />
                    )}
                </>
            )}

            {/* Diagram placeholder if mentioned */}
            {hasDiagram && !question.diagram_url && (
                <DiagramPlaceholder type="diagram" caption="Diagram to be drawn by student" />
            )}

            {/* Graph placeholder if mentioned */}
            {hasGraph && !question.diagram_url && (
                <DiagramPlaceholder type="graph" caption="Graph to be drawn by student" />
            )}

            {/* Answer Section */}
            {showSolution || revealed ? (
                <div className="space-y-4">
                    {/* Main Answer - ENLARGED */}
                    {answerText ? (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    Model Answer
                                </span>
                            </div>
                            <div
                                className="text-base text-stone-800 leading-relaxed font-serif"
                                dangerouslySetInnerHTML={{ __html: renderLatex(answerText) }}
                            />
                        </div>
                    ) : (
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
                            <p className="text-stone-500 italic">No model answer provided in the source data.</p>
                            <p className="text-xs text-stone-400 mt-1">Please refer to your textbook or class notes for self-evaluation.</p>
                        </div>
                    )}

                    {/* Key Formulae */}
                    {question.answer?.key_formulae?.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                                Key Formulae
                            </p>
                            <div className="space-y-2">
                                {question.answer.key_formulae.map((formula, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-lg p-3 text-center text-stone-900 font-serif"
                                        dangerouslySetInnerHTML={{ __html: renderLatex(`$${formula}$`) }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {canReveal && !showSolution && (
                        <button
                            onClick={() => setRevealed(false)}
                            className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors text-sm"
                        >
                            Hide Answer
                        </button>
                    )}
                </div>
            ) : canReveal ? (
                <button
                    onClick={() => setRevealed(true)}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Model Answer
                </button>
            ) : (
                <div className="py-4 px-5 bg-stone-100 text-stone-500 rounded-xl text-center text-sm">
                    Answer will be shown after submission
                </div>
            )}
        </div>
    );
}

/**
 * MockCaseStudyBlock - Case study with passage and sub-questions
 */
function MockCaseStudyBlock({ question, selectedAnswer = {}, onAnswerSelect, showFeedback = false }) {
    // Extract passage - handle different formats
    const passage = question.passage ||
        (question.question?.includes('CASE STUDY')
            ? question.question
            : null);

    const subQuestions = question.questions || [];

    return (
        <div className="space-y-6">
            {/* Passage / Case Context */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">
                    Case Study
                </p>

                {/* Diagram (Image) if URL is present in main question */}
                {question.diagram_url && (
                    <div className="my-4 flex justify-center">
                        <img
                            src={question.diagram_url}
                            alt="Case Study Diagram"
                            className="max-w-full h-auto max-h-[400px] rounded-lg border border-blue-100 shadow-sm"
                        />
                    </div>
                )}

                <div
                    className="text-stone-700 leading-relaxed font-serif whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderLatex(passage) }}
                />
            </div>

            {/* Sub-questions */}
            {subQuestions.length > 0 ? (
                <div className="space-y-6">
                    {subQuestions.map((subQ, idx) => (
                        <div key={subQ.id || idx} className="border-l-4 border-indigo-300 pl-5">
                            <p className="text-sm font-semibold text-indigo-600 mb-3">
                                Part ({String.fromCharCode(105 + idx)}) {/* i, ii, iii, iv */}
                            </p>
                            {/* Pass diagram_url to subquestions if needed, but usually it's on main */}
                            {subQ.options ? (
                                <MockMCQBlock
                                    question={subQ}
                                    selectedAnswer={selectedAnswer?.[subQ.id]}
                                    onAnswerSelect={(answer) => onAnswerSelect && onAnswerSelect({ ...selectedAnswer, [subQ.id]: answer })}
                                    showFeedback={showFeedback}
                                />
                            ) : (
                                <MockSubjectiveBlock
                                    question={subQ}
                                    showSolution={showFeedback}
                                    canReveal={!showFeedback}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Single answer case study */
                <MockSubjectiveBlock
                    question={{ ...question, question: '' }}
                    showSolution={showFeedback}
                    canReveal={!showFeedback}
                />
            )}
        </div>
    );
}

/**
 * MockQuestionRenderer - Routes to appropriate component based on question type
 * isExamMode - true when in exam mode (hides reveal button for subjective)
 */
function MockQuestionRenderer({ question, selectedAnswer, onAnswerSelect, showFeedback = false, isExamMode = false }) {
    const type = (question.type || '').toLowerCase().replace(/-/g, '_') ||
        (question.options ? 'mcq' : 'theory');

    // Detect question type from content if not explicitly set
    const hasOptions = question.options &&
        (Array.isArray(question.options) ? question.options.length > 0 : Object.keys(question.options).length > 0);

    // Only treat as Case Study if it has sub-questions. 
    // Otherwise treating "competency" with single text as Subjective.
    const isCaseStudy = (type === 'case_study' ||
        type === 'casestudy' ||
        type === 'competency') &&
        (question.sub_questions?.length > 0 || question.questions?.length > 0);

    if (isCaseStudy && !hasOptions) {
        return (
            <MockCaseStudyBlock
                question={question}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={onAnswerSelect}
                showFeedback={showFeedback}
            />
        );
    }

    if (hasOptions) {
        return (
            <MockMCQBlock
                question={question}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={onAnswerSelect}
                showFeedback={showFeedback}
                isExamMode={isExamMode}
            />
        );
    }

    // Default: Theory/Numerical/Derivation
    return (
        <MockSubjectiveBlock
            question={question}
            showSolution={showFeedback}
            canReveal={!isExamMode}
        />
    );
}

export default MockQuestionRenderer;
export { MockMCQBlock, MockSubjectiveBlock, MockCaseStudyBlock, DiagramPlaceholder };
