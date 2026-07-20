function ExamSnapshot({ data }) {
    const weightageColors = {
        Low: 'bg-gray-100 text-gray-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        High: 'bg-green-100 text-green-700'
    };

    const frequencyColors = {
        'Frequently Asked': 'bg-blue-100 text-blue-700',
        'Occasionally Asked': 'bg-gray-100 text-gray-600',
        'Occasional': 'bg-gray-100 text-gray-600'
    };

    return (
        <div className="bg-white rounded-xl border-2 border-blue-100 p-5 shadow-sm">
            {/* Chapter Title */}
            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                {data.chapterName}
            </h1>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Weightage */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${weightageColors[data.weightage]}`}>
                    {data.weightage} Weightage
                </span>

                {/* Frequency */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${frequencyColors[data.frequency]}`}>
                    {data.frequency}
                </span>
            </div>

            {/* Question Types */}
            <div className="flex flex-wrap gap-2 mb-4">
                {data.questionTypes.map((type, index) => (
                    <span
                        key={index}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
                    >
                        {type}
                    </span>
                ))}
            </div>

            {/* Expected Marks */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                    Expected: <span className="text-blue-600 font-semibold">{data.expectedMarks}</span> in Board Exam
                </span>
            </div>
        </div>
    );
}

export default ExamSnapshot;
