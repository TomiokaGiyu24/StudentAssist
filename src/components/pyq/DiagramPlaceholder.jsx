/**
 * DiagramPlaceholder - Displays a labeled placeholder for diagrams
 */
function DiagramPlaceholder({ title, caption }) {
    return (
        <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 my-4">
            <div className="flex flex-col items-center justify-center min-h-[120px] text-center">
                {/* Diagram Icon */}
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Title */}
                <p className="text-white/70 text-sm font-medium mb-1">
                    {title || 'Diagram Required'}
                </p>

                {/* Caption */}
                {caption && (
                    <p className="text-white/40 text-xs italic">
                        {caption}
                    </p>
                )}

                <p className="text-white/30 text-xs mt-2">
                    [Refer to NCERT / Question Paper]
                </p>
            </div>
        </div>
    );
}

export default DiagramPlaceholder;
