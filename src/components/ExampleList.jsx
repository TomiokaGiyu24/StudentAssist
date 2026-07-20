function ExampleList({ examples }) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                    NCERT Examples You Cannot Skip
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Must-practice examples from your textbook
                </p>
            </div>

            {/* Examples List */}
            <div className="p-5">
                <div className="space-y-3">
                    {examples.map((example, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors"
                        >
                            {/* Example Number */}
                            <span className="flex-shrink-0 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                                {example.number}
                            </span>

                            {/* Description */}
                            <p className="text-gray-700 text-[15px] leading-relaxed">
                                {example.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ExampleList;
