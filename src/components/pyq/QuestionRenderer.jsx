import MCQBlock from './MCQBlock';
import AssertionReasonBlock from './AssertionReasonBlock';
import SubjectiveBlock from './SubjectiveBlock';

/**
 * QuestionRenderer - Routes questions to appropriate component based on type
 * Supports both PYQ and Mock Test question formats
 */
function QuestionRenderer({ question, index, selectedAnswer, onAnswerSelect, showFeedback = true, showSolution = false }) {
    const questionNumber = typeof index === 'number' ? index + 1 : null;

    // Determine which component to render
    const renderQuestion = () => {
        // Normalize type (handle both underscore and hyphen variants)
        const normalizedType = question.type?.toLowerCase().replace(/-/g, '_');

        switch (normalizedType) {
            case 'mcq':
                return (
                    <MCQBlock
                        question={question}
                        selectedAnswer={selectedAnswer}
                        onAnswerSelect={onAnswerSelect}
                        showFeedback={showFeedback}
                    />
                );

            case 'assertion_reason':
                return (
                    <AssertionReasonBlock
                        question={question}
                        selectedAnswer={selectedAnswer}
                        onAnswerSelect={onAnswerSelect}
                        showFeedback={showFeedback}
                    />
                );

            case 'casestudy':
                // Render case study passage and sub-questions
                return (
                    <div className="space-y-4">
                        {/* Passage */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
                                Case Study
                            </p>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {question.passage}
                            </p>
                        </div>
                        {/* Sub-questions */}
                        {question.questions?.map((subQ, idx) => (
                            <div key={subQ.id} className="ml-4">
                                <p className="text-sm text-gray-500 mb-2">({String.fromCharCode(97 + idx)})</p>
                                <MCQBlock
                                    question={subQ}
                                    selectedAnswer={selectedAnswer}
                                    onAnswerSelect={onAnswerSelect}
                                    showFeedback={showFeedback}
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'theory':
            case 'numerical':
            case 'derivation':
            case 'short':
            case 'long':
            case 'verylong':
                return (
                    <SubjectiveBlock
                        question={question}
                        showSolution={showSolution}
                    />
                );

            default:
                // Fallback for unknown types - render as subjective
                return <SubjectiveBlock question={question} showSolution={showSolution} />;
        }
    };

    return (
        <div className="relative">
            {/* Question Number Badge - only show if index provided */}
            {questionNumber && (
                <div className="absolute -left-4 -top-2 z-10">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                        {questionNumber}
                    </span>
                </div>
            )}

            {/* Question Content */}
            <div className={questionNumber ? "ml-6" : ""}>
                {renderQuestion()}
            </div>
        </div>
    );
}

export default QuestionRenderer;
