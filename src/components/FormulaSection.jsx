function FormulaSection({ formulas }) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                    Formula & Key Results Sheet
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    All formulas you need for this chapter
                </p>
            </div>

            {/* Formula Grid */}
            <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    {formulas.map((item, index) => (
                        <div
                            key={index}
                            className={`
                p-4 rounded-lg border
                ${item.mostUsed
                                    ? 'border-purple-200 bg-purple-50/50'
                                    : 'border-gray-200 bg-gray-50/50'
                                }
              `}
                        >
                            {/* Formula Name & Tags */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm text-gray-600 font-medium">
                                    {item.name}
                                </p>
                                {item.mostUsed && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                        Most Used
                                    </span>
                                )}
                            </div>

                            {/* Formula */}
                            <p className="text-lg font-mono font-semibold text-gray-900 mb-2">
                                {item.formula}
                            </p>

                            {/* Tag */}
                            <span className={`
                inline-block px-2 py-0.5 rounded text-xs font-medium
                ${item.tag === 'Direct Use'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
              `}>
                                {item.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FormulaSection;
