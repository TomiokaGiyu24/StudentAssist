import { useState } from 'react';
import { QuestionRenderer } from './pyq';

/**
 * PYQSection - Main section for rendering Previous Year Questions
 */
function PYQSection({ questions = [], meta = {} }) {
    const [filter, setFilter] = useState('all'); // 'all', 'mcq', 'subjective'
    const [yearFilter, setYearFilter] = useState('all');

    // Get unique years
    const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);

    // Filter questions
    let filtered = questions;

    if (filter === 'mcq') {
        filtered = filtered.filter(q => q.type === 'mcq' || q.type === 'assertion_reason');
    } else if (filter === 'subjective') {
        filtered = filtered.filter(q => ['theory', 'numerical', 'derivation', 'short', 'long', 'verylong'].includes(q.type));
    }

    if (yearFilter !== 'all') {
        filtered = filtered.filter(q => q.year === parseInt(yearFilter));
    }

    // Group by marks
    const groupedByMarks = filtered.reduce((acc, q) => {
        const marks = q.marks || 1;
        if (!acc[marks]) acc[marks] = [];
        acc[marks].push(q);
        return acc;
    }, {});

    // Stats
    const mcqCount = questions.filter(q => q.type === 'mcq' || q.type === 'assertion_reason').length;
    const subjectiveCount = questions.filter(q => ['theory', 'numerical', 'derivation', 'short', 'long', 'verylong'].includes(q.type)).length;

    return (
        <div className="animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">📝</span>
                    </div>
                    <div>
                        <p className="text-white font-heading font-bold text-2xl">{questions.length}</p>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Total Questions</p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">✓</span>
                    </div>
                    <div>
                        <p className="text-white font-heading font-bold text-2xl">{mcqCount}</p>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">MCQs</p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">✏️</span>
                    </div>
                    <div>
                        <p className="text-white font-heading font-bold text-2xl">{subjectiveCount}</p>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Subjective</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 sticky top-20 z-30 bg-stone-950/80 backdrop-blur-md p-2 -mx-2 rounded-xl border border-white/5 sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:mx-0">
                {/* Type Filter */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {[
                        { id: 'all', label: 'All Questions' },
                        { id: 'mcq', label: 'MCQs' },
                        { id: 'subjective', label: 'Subjective' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id)}
                            className={`px-5 py-2.5 text-sm font-heading font-bold uppercase tracking-wide rounded-lg transition-all ${filter === opt.id
                                ? 'bg-white text-stone-900 shadow-lg scale-100'
                                : 'text-white/60 hover:text-white hover:bg-white/5 scale-95 hover:scale-100'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Year Filter */}
                <div className="relative group">
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full sm:w-auto appearance-none bg-white/5 border border-white/10 text-white text-sm font-heading font-bold rounded-xl px-5 py-3 pr-10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer hover:border-white/20"
                    >
                        <option value="all" className="bg-stone-900">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year} className="bg-stone-900">{year}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Questions Grouped by Marks */}
            {Object.keys(groupedByMarks).length > 0 ? (
                Object.keys(groupedByMarks).sort((a, b) => a - b).map(marks => (
                    <div key={marks} className="mb-12">
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-8 sticky top-[5.5rem] z-20 bg-stone-950/95 py-4 backdrop-blur-sm border-b border-white/5">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-3">
                                {marks} Mark{marks > 1 ? 's' : ''} Questions
                                <span className="text-sm font-normal text-white/40 font-sans normal-case bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    {groupedByMarks[marks].length} Qs
                                </span>
                            </h3>
                        </div>

                        {/* Questions Grid */}
                        <div className="grid gap-6">
                            {groupedByMarks[marks].map((question, idx) => (
                                <QuestionRenderer
                                    key={question.id || idx}
                                    question={question}
                                    index={filtered.indexOf(question)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                /* Empty State */
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-heading font-bold text-lg mb-2">No questions found</h3>
                    <p className="text-white/50 max-w-sm mx-auto">
                        Try adjusting your filters to see more questions from previous years.
                    </p>
                    <button
                        onClick={() => { setFilter('all'); setYearFilter('all'); }}
                        className="mt-6 px-6 py-2 bg-white text-stone-900 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

export default PYQSection;
