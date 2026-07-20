function QuestionItem({ question, tags }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5"></span>
            <div className="flex-1">
                <p className="text-gray-800 text-[15px] leading-relaxed">
                    {question}
                </p>
                {tags && tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className={`
                  px-2 py-0.5 rounded text-xs font-medium
                  ${tag === 'Repeated' ? 'bg-blue-100 text-blue-700' : ''}
                  ${tag === 'High Probability' ? 'bg-orange-100 text-orange-700' : ''}
                `}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function QuestionCategory({ title, questions, accentColor = 'blue' }) {
    const colors = {
        blue: 'border-blue-200 bg-blue-50',
        green: 'border-green-200 bg-green-50',
        purple: 'border-purple-200 bg-purple-50',
        orange: 'border-orange-200 bg-orange-50'
    };

    return (
        <div className="mb-6 last:mb-0">
            <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 mb-3 ${colors[accentColor]}`}>
                {title}
            </div>
            <div className="pl-1">
                {questions.map((q, index) => (
                    <QuestionItem key={index} question={q.question} tags={q.tags} />
                ))}
            </div>
        </div>
    );
}

function QuestionBank({ data }) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                    Question Bank (Marks-Based)
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Organized by marks for targeted practice
                </p>
            </div>

            {/* Questions */}
            <div className="p-5">
                {data.oneTwo && data.oneTwo.length > 0 && (
                    <QuestionCategory
                        title="1-2 Mark Questions"
                        questions={data.oneTwo}
                        accentColor="blue"
                    />
                )}

                {data.three && data.three.length > 0 && (
                    <QuestionCategory
                        title="3 Mark Questions"
                        questions={data.three}
                        accentColor="green"
                    />
                )}

                {data.five && data.five.length > 0 && (
                    <QuestionCategory
                        title="5 Mark Questions"
                        questions={data.five}
                        accentColor="purple"
                    />
                )}

                {data.caseBased && data.caseBased.length > 0 && (
                    <QuestionCategory
                        title="Case-Based Questions"
                        questions={data.caseBased}
                        accentColor="orange"
                    />
                )}
            </div>
        </section>
    );
}

export default QuestionBank;
