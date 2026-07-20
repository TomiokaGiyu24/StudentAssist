import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { MockConfigModal } from '../../components/mock';
import { subjects, chapters, fullSyllabusMocks } from '../../data/mockData';
import { isMockAvailable, getAvailableMockTypes, loadMock } from '../../data/Mocks';

/**
 * MocksPage - Modern, mobile-first mock test landing page
 * Features subjects accordion with chapters and mock type selection
 */
function MocksPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedMockType, setSelectedMockType] = useState(null);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);

    // ... (useEffect remains same) ...

    useEffect(() => {
        const chapterFromUrl = searchParams.get('chapter');
        if (chapterFromUrl) {
            // Find which subject this chapter belongs to
            for (const [subjectId, chapterList] of Object.entries(chapters)) {
                const found = chapterList.find(c => c.id === chapterFromUrl);
                if (found) {
                    setExpandedSubject(subjectId);
                    setSelectedChapter(chapterFromUrl);
                    break;
                }
            }
        }
    }, [searchParams]);

    const mockTypes = [
        { id: 'pyq', title: 'PYQ', fullTitle: 'PYQ-Based Mock', color: 'indigo' },
        { id: 'conceptual', title: 'Conceptual', fullTitle: 'Conceptual Mock', color: 'blue' },
        { id: 'competency', title: 'Competency', fullTitle: 'Competency-Based Mock', color: 'purple' }
    ];

    const handleMockSelect = (chapterId, mockType) => {
        // Special handling for PE Full Syllabus Mocks - Start immediately
        if (chapterId.startsWith('pe-mock-')) {
            try {
                // Load mock data directly
                const mockData = loadMock(chapterId, mockType.id);

                if (mockData) {
                    // Start test immediately
                    mockData.examMode = 'exam';
                    mockData.mockType = mockType.id;
                    const mockId = mockData.id;
                    sessionStorage.setItem(`mock_${mockId}`, JSON.stringify(mockData));
                    navigate(`/mock/${mockId}`);
                    return;
                }
            } catch (err) {
                console.error("Failed to load mock:", err);
                // Fallback to modal if load fails
            }
        }

        setSelectedChapter(chapterId);
        setSelectedMockType({
            id: mockType.id,
            title: mockType.fullTitle,
            description: mockType.id === 'pyq'
                ? 'Questions modeled after previous year CBSE board papers.'
                : mockType.id === 'conceptual'
                    ? 'Tests every NCERT concept with deep understanding questions.'
                    : 'Higher-order thinking questions for 90%+ aspirants.'
        });
    };

    // Subject colors
    const subjectColors = {
        physics: { bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
        chemistry: { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
        mathematics: { bg: 'bg-orange-500', light: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
        biology: { bg: 'bg-green-500', light: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' }
    };

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Minimal Header */}
            <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-lg border-b border-white/5">
                <div className="container-app py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                                <span className="text-white font-bold text-sm">S</span>
                            </div>
                            <span className="text-white font-semibold">StudyAssist</span>
                        </Link>
                        <Link to="/subjects" className="text-white/50 hover:text-white text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section - Compact */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative container-app py-12 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-4">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-white/60 text-xs">CBSE Pattern</span>
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                        Mock Tests
                    </h1>
                    <p className="text-white/50 text-sm max-w-md mx-auto">
                        Practice with expert-curated tests that match real board exam patterns
                    </p>
                </div>
            </section>

            {/* Subject Accordion */}
            <main className="container-app pb-16">
                <div className="space-y-3">
                    {subjects.map(subject => {
                        const subjectChapters = chapters[subject.id] || [];
                        const isExpanded = expandedSubject === subject.id;
                        const colors = subjectColors[subject.id] || subjectColors.physics;

                        return (
                            <div key={subject.id} className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5">
                                {/* Subject Header */}
                                <button
                                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${colors.light} rounded-xl flex items-center justify-center text-xl`}>
                                            {subject.icon}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-white font-medium">{subject.name}</h3>
                                            <p className="text-white/40 text-xs">{subjectChapters.length} chapters</p>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Chapters List */}
                                {isExpanded && (
                                    <div className="border-t border-white/5">
                                        {/* Physical Education Special Handling */}
                                        {subject.id === 'physical-education' ? (
                                            <div className="p-4 grid gap-3">
                                                {(fullSyllabusMocks['physical-education'] || []).map((mock, idx) => (
                                                    <div key={mock.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded font-medium">
                                                                    FULL SYLLABUS
                                                                </span>
                                                                <h4 className="text-white font-medium">
                                                                    {mock.name}
                                                                </h4>
                                                            </div>
                                                            <p className="text-white/40 text-xs">
                                                                {mock.weightage} • {mock.difficulty} Level
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMockSelect(mock.id, {
                                                                id: 'pyq', // Internal mapping for loading data
                                                                title: 'Start Mock',
                                                                fullTitle: mock.name,
                                                                description: 'Full syllabus mock test based on latest CBSE pattern.'
                                                            })}
                                                            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg text-white font-medium text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                                                        >
                                                            Start Test
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // Standard Chapter List
                                            subjectChapters.map((chapter, idx) => {
                                                const availableMocks = getAvailableMockTypes(chapter.id);
                                                const hasAnyMock = availableMocks.length > 0;

                                                return (
                                                    <div
                                                        key={chapter.id}
                                                        className={`p-4 ${idx !== subjectChapters.length - 1 ? 'border-b border-white/5' : ''}`}
                                                    >
                                                        {/* Chapter Name */}
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-6 h-6 ${colors.light} ${colors.text} rounded-md flex items-center justify-center text-xs font-medium`}>
                                                                    {idx + 1}
                                                                </span>
                                                                <h4 className="text-white/90 text-sm font-medium leading-tight">
                                                                    {chapter.name}
                                                                </h4>
                                                            </div>
                                                        </div>

                                                        {/* Mock Type Buttons */}
                                                        <div className="flex flex-wrap gap-2 pl-8">
                                                            {mockTypes.map(mockType => {
                                                                const isAvailable = isMockAvailable(chapter.id, mockType.id);

                                                                return (
                                                                    <button
                                                                        key={mockType.id}
                                                                        onClick={() => isAvailable && handleMockSelect(chapter.id, mockType)}
                                                                        disabled={!isAvailable}
                                                                        className={`
                                                                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                                        ${isAvailable
                                                                                ? `${colors.light} ${colors.text} hover:opacity-80 cursor-pointer`
                                                                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                                                                            }
                                                                    `}
                                                                    >
                                                                        {mockType.title}
                                                                        {!isAvailable && (
                                                                            <span className="ml-1 opacity-60">•</span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                            {!hasAnyMock && (
                                                                <span className="text-white/30 text-xs italic">
                                                                    Coming soon
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Info Card */}
                <div className="mt-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-indigo-300 text-sm font-medium mb-1">Mock Test Types</h4>
                            <p className="text-white/50 text-xs leading-relaxed">
                                <strong className="text-white/70">PYQ</strong> → Board pattern questions •
                                <strong className="text-white/70 ml-1">Conceptual</strong> → Deep understanding •
                                <strong className="text-white/70 ml-1">Competency</strong> → HOTS questions
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Config Modal */}
            {selectedMockType && selectedChapter && (
                <MockConfigModal
                    mockType={selectedMockType}
                    preSelectedChapter={selectedChapter}
                    onClose={() => {
                        setSelectedMockType(null);
                        setSelectedChapter(null);
                    }}
                />
            )}
        </div>
    );
}

export default MocksPage;
