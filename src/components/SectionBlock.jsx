function SectionBlock({ title, children }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {title && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">
                        {title}
                    </h3>
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}

export default SectionBlock;
