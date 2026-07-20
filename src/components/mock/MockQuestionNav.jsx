/**
 * MockQuestionNav - Question navigation sidebar
 * Shows sections and question numbers with answered/unanswered status
 */
function MockQuestionNav({ sections, answers, currentSection, currentQuestionIndex, onNavigate }) {
    if (!sections) return null;

    const sectionLabels = {
        A: 'Section A - MCQs',
        B: 'Section B - Short Answers',
        C: 'Section C - Long Answers',
        D: 'Section D - Very Long',
        CS: 'Case Studies'
    };

    return (
        <div className="p-4">
            {Object.entries(sections).map(([sectionId, questions]) => (
                <div key={sectionId} className="mb-6">
                    {/* Section Header */}
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        {sectionLabels[sectionId] || `Section ${sectionId}`}
                    </h3>

                    {/* Question Grid */}
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((question, idx) => {
                            const isAnswered = answers[question.id] !== undefined;
                            const isCurrent = currentSection === sectionId && currentQuestionIndex === idx;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => onNavigate(sectionId, idx)}
                                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${isCurrent
                                            ? 'bg-gray-900 text-white'
                                            : isAnswered
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Legend</p>
                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gray-900 rounded"></span>
                        <span className="text-gray-600">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                        <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gray-100 rounded"></span>
                        <span className="text-gray-600">Not Answered</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MockQuestionNav;
