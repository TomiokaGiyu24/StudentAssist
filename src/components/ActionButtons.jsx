function ActionButtons() {
    return (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="space-y-3">
                {/* Primary CTA - Download PDF */}
                <button className="
          w-full flex items-center justify-center gap-2
          px-6 py-4
          bg-green-600 text-white font-semibold text-base
          rounded-lg
          hover:bg-green-700
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Chapter PDF
                </button>

                {/* Secondary CTA - Unlock Full Content */}
                <button className="
          w-full flex items-center justify-center gap-2
          px-6 py-4
          bg-white text-gray-700 font-semibold text-base
          border-2 border-gray-200
          rounded-lg
          hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Unlock Full Content
                </button>

                {/* Helper Text */}
                <p className="text-center text-sm text-gray-500 pt-2">
                    Get complete notes, solutions, and unlimited tests
                </p>
            </div>
        </section>
    );
}

export default ActionButtons;
