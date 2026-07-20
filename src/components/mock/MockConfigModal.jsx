
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjects, chapters, fullSyllabusMocks } from '../../data/mockData';
import { loadMock, isMockAvailable, getMockSummary } from '../../data/Mocks';

/**
 * MockConfigModal - Configuration modal for JSON-based mock tests
 * Instant loading, no AI progress tracking needed
 */
function MockConfigModal({ mockType, preSelectedChapter, onClose }) {
    const navigate = useNavigate();
    const [selectedChapter, setSelectedChapter] = useState(preSelectedChapter || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mockInfo, setMockInfo] = useState(null);

    // Dynamic chapter list based on selected chapter's subject
    const getSubjectForChapter = (chapterId) => {
        for (const [subject, chapterList] of Object.entries(chapters)) {
            if (chapterList.find(c => c.id === chapterId)) {
                return subject;
            }
        }
        // Check full syllabus mocks
        for (const [subject, mockList] of Object.entries(fullSyllabusMocks || {})) {
            if (mockList.find(m => m.id === chapterId)) {
                return subject;
            }
        }
        return 'physics'; // Default
    };

    const currentSubject = getSubjectForChapter(preSelectedChapter || selectedChapter);
    const availableChapters = chapters[currentSubject] || [];
    const availableFullMocks = fullSyllabusMocks && fullSyllabusMocks[currentSubject] ? fullSyllabusMocks[currentSubject] : [];

    // Combine standard chapters and full mocks for the dropdown (or handle separately)
    // For PE, we only have full mocks, so just use those if availableChapters is empty
    const displayChapters = availableChapters.length > 0 ? availableChapters : availableFullMocks;

    // Check mock availability when chapter changes
    useEffect(() => {
        if (selectedChapter && mockType?.id) {
            const available = isMockAvailable(selectedChapter, mockType.id);
            if (available) {
                const info = getMockSummary(selectedChapter, mockType.id);
                setMockInfo(info);
                setError(null);
            } else {
                setMockInfo(null);
                setError(`${mockType.title} not yet available for this chapter`);
            }
        } else {
            setMockInfo(null);
            setError(null);
        }
    }, [selectedChapter, mockType?.id]);

    const handleGenerate = () => {
        console.log('📄 Load mock clicked:', { selectedChapter, mockType: mockType?.id });

        if (!selectedChapter) {
            setError('Please select a chapter');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Load mock from local JSON files
            const mockData = loadMock(selectedChapter, mockType.id);

            if (!mockData) {
                throw new Error('Mock test not found');
            }

            // Enforce exam mode
            mockData.examMode = 'exam';
            mockData.mockType = mockType.id;

            // Store in session storage for the test page to retrieve
            const mockId = mockData.id;
            sessionStorage.setItem(`mock_${mockId}`, JSON.stringify(mockData));

            navigate(`/mock/${mockId}`);
        } catch (err) {
            console.error('Load error:', err);
            setError(err.message || 'Failed to load mock test');
            setIsLoading(false);
        }
    };

    const canStart = selectedChapter && mockInfo && !error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-stone-200 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-stone-900">
                                {mockType?.title || 'Configure Mock Test'}
                            </h2>
                            <p className="text-sm text-stone-500 mt-0.5">
                                Set up your test preferences
                            </p>
                        </div>
                        {!isLoading && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Chapter Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Select Chapter
                        </label>
                        <select
                            value={selectedChapter}
                            onChange={(e) => setSelectedChapter(e.target.value)}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">Choose a chapter...</option>
                            {displayChapters.map((chapter) => (
                                <option key={chapter.id} value={chapter.id}>
                                    {chapter.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mock Info (shown when available) */}
                    {mockInfo && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <span className="text-lg">✅</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-900">Mock Available</p>
                                    <p className="text-xs text-green-600">{mockInfo.chapter}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white rounded-lg p-2">
                                    <p className="text-lg font-bold text-stone-900">{mockInfo.totalMarks}</p>
                                    <p className="text-xs text-stone-500">Marks</p>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                    <p className="text-lg font-bold text-stone-900">{mockInfo.questionCount}</p>
                                    <p className="text-xs text-stone-500">Questions</p>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                    <p className="text-lg font-bold text-stone-900">{mockInfo.duration}m</p>
                                    <p className="text-xs text-stone-500">Duration</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Not Available Message */}
                    {selectedChapter && !mockInfo && error && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <span className="text-lg">🚧</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-amber-900">Coming Soon</p>
                                    <p className="text-xs text-amber-600">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!canStart || isLoading}
                        className={`w-full py-4 px-4 rounded-xl font-medium transition-all ${canStart && !isLoading
                                ? 'gradient-accent text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </span>
                        ) : (
                            <>
                                Start Mock Test
                                <span className="ml-2">→</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MockConfigModal;
