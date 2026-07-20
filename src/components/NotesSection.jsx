function NotesSection({ notes }) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                    NCERT Lines That Actually Matter
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Exam-focused points from your textbook
                </p>
            </div>

            {/* Notes List */}
            <div className="p-5">
                <ul className="space-y-3">
                    {notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                                {note}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default NotesSection;
