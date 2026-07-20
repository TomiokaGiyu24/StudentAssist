import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import PEPracticeSection from './PEPracticeSection';

/**
 * Physical Education Notes Renderer - Premium Edition
 * Award-winning design with calm, clean aesthetics
 * Tabbed navigation for organized content
 */
function PhysicalEducationRenderer({ content, practiceContent, initialTab = 'notes' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [expandedItems, setExpandedItems] = useState({});
    const [expandedImage, setExpandedImage] = useState(null);



    // Sync state with prop if it changes (e.g. navigation)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    if (!content) {
        return (
            <div className="text-stone-400 text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                </div>
                No content available for this chapter yet.
            </div>
        );
    }

    const toggleExpand = (key) => {
        setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Parse inline LaTeX ($...$) and bold (**...**) in text
    const parseContent = (text) => {
        if (!text) return null;

        // Remove citations [cite: ...]
        let cleaned = text.replace(/\[cite:.*?\]/g, '');

        const parts = [];
        const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$]+\$)|(\*\*[^*]+\*\*)/g;
        let lastIndex = 0;
        let match;
        let key = 0;

        while ((match = regex.exec(cleaned)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(<span key={key++}>{cleaned.slice(lastIndex, match.index)}</span>);
            }

            if (match[1]) {
                // Block Math $$...$$
                const latex = match[1].slice(2, -2);
                try {
                    parts.push(<div key={key++} className="my-2"><BlockMath math={latex} /></div>);
                } catch (e) {
                    parts.push(<code key={key++} className="block p-2 bg-amber-500/10 rounded text-amber-300 text-sm">{latex}</code>);
                }
            } else if (match[2]) {
                // Inline Math $...$
                const latex = match[2].slice(1, -1);
                try {
                    parts.push(<InlineMath key={key++} math={latex} />);
                } catch (e) {
                    parts.push(<code key={key++} className="px-1.5 py-0.5 bg-amber-500/10 rounded text-amber-300 text-sm">{latex}</code>);
                }
            } else if (match[3]) {
                // Bold **...**
                parts.push(<strong key={key++} className="font-semibold text-white">{match[3].slice(2, -2)}</strong>);
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < cleaned.length) {
            parts.push(<span key={key++}>{cleaned.slice(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : cleaned;
    };

    // Tab configuration
    const tabs = [
        { id: 'notes', label: 'Notes', icon: '📝', available: content.ultimate_short_notes?.length > 0 },
        { id: 'formulas', label: 'Formulas', icon: '📐', available: content.formula_bank?.length > 0 },
        { id: 'practice', label: 'Practice', icon: '✍️', available: !!practiceContent },
        { id: 'questions', label: 'Questions', icon: '⭐', available: content.sure_shot_questions?.length > 0 },
        { id: 'playbook', label: 'Exam Tips', icon: '🎯', available: content.exam_playbook?.length > 0 },
        { id: 'traps', label: 'Traps', icon: '⚠️', available: content.examiner_traps?.length > 0 },
    ].filter(t => t.available);

    return (
        <div className="space-y-6">
            {/* Weightage Header */}
            {content.weightage_insight && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-6">
                    {/* Subtle glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>

                    <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">
                                {content.chapter_name}
                            </h2>
                            <p className="text-stone-400 text-sm leading-relaxed max-w-2xl">
                                {parseContent(content.weightage_insight.pyq_frequency_summary)}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                                <span className="text-amber-400 text-sm font-medium">
                                    {content.weightage_insight.estimated_marks_range}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                : 'text-stone-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Notes Tab */}
                {activeTab === 'notes' && content.ultimate_short_notes && (
                    <div className="space-y-4 animate-fade-in">
                        {content.ultimate_short_notes.map((note, idx) => (
                            <div
                                key={idx}
                                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-amber-500/20 rounded-xl overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleExpand(`note-${idx}`)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                                >
                                    <span className="font-medium text-white group-hover:text-amber-100 transition-colors">
                                        {note.heading}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${expandedItems[`note-${idx}`] ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${expandedItems[`note-${idx}`] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5 space-y-3">
                                        {(note.content || note.points)?.map((point, pIdx) => (
                                            <div key={pIdx} className="flex items-start gap-3">
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2.5 flex-shrink-0"></span>
                                                <span className="text-stone-300 text-sm leading-relaxed">
                                                    {parseContent(point)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Formulas Tab */}
                {activeTab === 'formulas' && content.formula_bank && (
                    <div className="grid gap-4 animate-fade-in">
                        {content.formula_bank.map((formula, idx) => (
                            <div
                                key={idx}
                                className="relative bg-gradient-to-br from-stone-900/80 to-stone-900/40 border border-amber-500/20 rounded-xl p-5 overflow-hidden group hover:border-amber-500/40 transition-all duration-300"
                            >
                                {/* Subtle glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative">
                                    <h4 className="text-amber-300 font-medium text-sm mb-3">
                                        {formula.concept}
                                    </h4>
                                    <div className="bg-black/30 rounded-lg p-4 mb-3 text-center overflow-x-auto">
                                        <span className="text-white text-lg">
                                            {parseContent(formula.formula)}
                                        </span>
                                    </div>
                                    <p className="text-stone-500 text-xs">
                                        {parseContent(formula.used_in_questions)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && content.sure_shot_questions && (
                    <div className="space-y-4 animate-fade-in">
                        {content.sure_shot_questions.map((q, idx) => (
                            <div
                                key={idx}
                                className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleExpand(`q-${idx}`)}
                                    className="w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <p className="text-white font-medium leading-relaxed">
                                            {q.question}
                                        </p>
                                        <span className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                            {q.marks}M
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {q.mandatory_keywords?.slice(0, 4).map((kw, kwIdx) => (
                                            <span key={kwIdx} className="text-xs bg-white/5 text-stone-400 px-2 py-1 rounded">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${expandedItems[`q-${idx}`] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                                        {q.answer_structure && (
                                            <div>
                                                <p className="text-stone-500 text-xs mb-2">Answer Structure</p>
                                                <p className="text-stone-300 text-sm">{parseContent(q.answer_structure)}</p>
                                            </div>
                                        )}

                                        {q.model_answer_outline && (
                                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-4">
                                                <p className="text-green-400 text-xs font-medium mb-3">Model Answer</p>
                                                {q.model_answer_outline.map((line, lIdx) => (
                                                    <p key={lIdx} className="text-stone-300 text-sm mb-2 leading-relaxed">
                                                        {parseContent(line)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Practice Questions Tab */}
                {activeTab === 'practice' && practiceContent && (
                    <PEPracticeSection data={practiceContent} />
                )}

                {/* Exam Playbook Tab */}
                {activeTab === 'playbook' && content.exam_playbook && (
                    <div className="space-y-4 animate-fade-in">
                        {content.exam_playbook.map((strategy, idx) => (
                            <div
                                key={idx}
                                className="relative bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-xl p-5 overflow-hidden"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h4 className="text-blue-300 font-semibold">{strategy.strategy_name}</h4>
                                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                                        {strategy.marks_secured}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-stone-500 text-xs mb-1">PYQ Pattern</p>
                                        <p className="text-stone-300">{parseContent(strategy.pyq_pattern)}</p>
                                    </div>

                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        <p className="text-red-400 text-xs mb-1">❌ How Students Lose Marks</p>
                                        <p className="text-stone-400">{parseContent(strategy.how_students_lose_marks)}</p>
                                    </div>

                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                        <p className="text-green-400 text-xs mb-1">✅ Winning Approach</p>
                                        <p className="text-stone-300">{parseContent(strategy.winning_approach)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Examiner Traps Tab */}
                {activeTab === 'traps' && content.examiner_traps && (
                    <div className="space-y-4 animate-fade-in">
                        {content.examiner_traps.map((trap, idx) => (
                            <div
                                key={idx}
                                className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20 rounded-xl p-5"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h4 className="text-red-300 font-medium mb-1">
                                            {trap.common_mistake}
                                        </h4>
                                        <p className="text-stone-500 text-sm">
                                            {parseContent(trap.why_marks_are_cut)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                    <p className="text-green-400 text-xs font-medium mb-2">✓ Examiner Expects</p>
                                    <p className="text-stone-300 text-sm leading-relaxed">
                                        {parseContent(trap.correct_examiner_expectation)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Diagram Section with Images */}
            {content.diagram_descriptors && content.diagram_descriptors.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span>📊</span> Diagrams & Visual References
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {content.diagram_descriptors.map((diagram, idx) => (
                            <div
                                key={idx}
                                className="group bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-300"
                            >
                                {/* Image Container - Click to expand */}
                                {diagram.image_path && (
                                    <div
                                        className="relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-950 p-4 cursor-zoom-in"
                                        onClick={() => setExpandedImage({ src: diagram.image_path, name: diagram.diagram_name })}
                                    >
                                        <img
                                            src={diagram.image_path}
                                            alt={diagram.diagram_name || 'Diagram'}
                                            className="w-full h-auto max-h-[300px] object-contain rounded-lg mx-auto transform group-hover:scale-[1.02] transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {/* Expand hint */}
                                        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                            Click to expand
                                        </div>
                                    </div>
                                )}

                                {/* Name only */}
                                {diagram.diagram_name && (
                                    <div className="p-3 text-center">
                                        <h4 className="text-cyan-300 font-medium text-sm">
                                            {diagram.diagram_name}
                                        </h4>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fullscreen Image Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
                    onClick={() => setExpandedImage(null)}
                    onKeyDown={(e) => e.key === 'Escape' && setExpandedImage(null)}
                    tabIndex={0}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-200"
                        onClick={() => setExpandedImage(null)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image container */}
                    <div className="max-w-[90vw] max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={expandedImage.src}
                            alt={expandedImage.name || 'Expanded diagram'}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                        {expandedImage.name && (
                            <p className="text-center text-white/80 mt-4 text-lg font-medium">
                                {expandedImage.name}
                            </p>
                        )}
                    </div>

                    {/* Click outside hint */}
                    <p className="absolute bottom-6 text-white/50 text-sm">
                        Click anywhere or press ESC to close
                    </p>
                </div>
            )}
        </div>
    );
}

export default PhysicalEducationRenderer;
