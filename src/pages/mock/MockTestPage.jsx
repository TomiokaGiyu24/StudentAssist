import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CBSE_PAPER_STRUCTURE } from '../../config/mockStructure';
import { MockQuestionRenderer } from '../../components/mock';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Helper to get mock by ID from session storage
function getMockById(id) {
    const stored = sessionStorage.getItem(`mock_${id}`);
    return stored ? JSON.parse(stored) : null;
}

// UI-friendly paper structure
const PAPER_STRUCTURE = {
    totalMarks: CBSE_PAPER_STRUCTURE.totalMarks,
    duration: CBSE_PAPER_STRUCTURE.duration / 60, // Convert to hours
    sections: [
        { id: 'A', name: 'MCQs', count: 16 },
        { id: 'B', name: 'Short Answer', count: 5 },
        { id: 'C', name: 'Long Answer', count: 7 },
        { id: 'D', name: 'Very Long Answer', count: 3 },
        { id: 'CS', name: 'Case Study', count: 2 }
    ]
};

/**
 * MockTestPage - The main test-taking interface
 * Clean, academic exam feel matching StudyAssist theme
 */
function MockTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [mockData, setMockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentSection, setCurrentSection] = useState('A');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDangerous: false,
        confirmText: 'Confirm'
    });

    // Load mock data
    useEffect(() => {
        const data = getMockById(id);
        if (data) {
            setMockData(data);
            // Set timer from mock data's duration (already in seconds)
            setTimeRemaining(data.meta?.duration || 90 * 60);
            setLoading(false);
        } else {
            navigate('/mocks');
        }
    }, [id, navigate]);

    // Timer countdown
    useEffect(() => {
        if (isSubmitted || loading || timeRemaining === null) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    forceSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSubmitted, loading, timeRemaining]);

    // Warning on tab close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSubmitted) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSubmitted]);

    // Format time display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle answer selection
    const handleAnswerChange = useCallback((sectionId, questionId, answer) => {
        const compositeKey = `${sectionId}-${questionId}`;
        setAnswers(prev => ({
            ...prev,
            [compositeKey]: answer
        }));
    }, []);

    // Get all questions count
    const getTotalQuestions = () => {
        if (!mockData?.sections) return 0;
        return Object.values(mockData.sections).reduce((total, questions) => total + questions.length, 0);
    };

    // Get current section questions
    const getCurrentSectionQuestions = () => {
        if (!mockData?.sections) return [];
        return mockData.sections[currentSection] || [];
    };

    // Force Submit (used by timer)
    const forceSubmit = () => {
        setIsSubmitted(true);
        navigate(`/mock/${id}/results`, {
            state: {
                mockData,
                answers,
                timeSpent: PAPER_STRUCTURE.duration * 60 - timeRemaining
            }
        });
    };

    // Handle submit request
    const handleSubmitRequest = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Submit Test?',
            message: 'Are you sure you want to submit the test? You cannot change your answers after submission.',
            confirmText: 'Submit Test',
            isDangerous: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                forceSubmit();
            }
        });
    };

    // Handle exit request
    const handleExitRequest = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Leave Test?',
            message: 'Are you sure you want to leave? Your progress will be lost.',
            confirmText: 'Leave',
            isDangerous: true,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                navigate('/mocks');
            }
        });
    };

    // Timer warning colors
    const getTimerStyle = () => {
        if (timeRemaining < 300) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (timeRemaining < 600) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-white/10 text-white border-white/20';
    };

    if (loading) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Loading test...</p>
                </div>
            </div>
        );
    }

    const sectionQuestions = getCurrentSectionQuestions();
    const currentQuestion = sectionQuestions[currentQuestionIndex];
    const isExamMode = true; // Always exam mode
    const sectionKeys = Object.keys(mockData?.sections || {});

    return (
        <div className="min-h-screen bg-stone-100">
            {/* Custom Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDangerous={confirmModal.isDangerous}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Fixed Top Bar - Dark header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-stone-900 border-b border-stone-800">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Test Info */}
                        <div className="flex items-center gap-4">
                            <button onClick={handleExitRequest} className="text-white/60 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-white font-medium text-sm">
                                    {mockData?.meta?.chapter || 'Mock Test'}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-white/40 capitalize">
                                        {mockData?.mockType} Mock
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timer - Center */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getTimerStyle()}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-mono font-medium text-lg">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>

                        {/* Progress & Submit */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-white/60 hidden sm:block">
                                <span className="text-white font-medium">{Object.keys(answers).length}</span>
                                <span className="text-white/40"> / {getTotalQuestions()} answered</span>
                            </div>
                            <button
                                onClick={handleSubmitRequest}
                                className="px-5 py-2 gradient-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Submit Test
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-16 flex min-h-screen">
                {/* Question Navigation Sidebar */}
                <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-stone-200 overflow-y-auto hidden lg:block">
                    <div className="p-4">
                        {sectionKeys.map(sectionId => (
                            <div key={sectionId} className="mb-6">
                                <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
                                    Section {sectionId}
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {mockData.sections[sectionId].map((question, idx) => {
                                        // Use question.id if available, otherwise fallback to idx (prevents state leakage if id is missing)
                                        const uniqueId = question.id || idx;
                                        const isAnswered = answers[`${sectionId}-${uniqueId}`] !== undefined;
                                        const isCurrent = currentSection === sectionId && currentQuestionIndex === idx;

                                        return (
                                            <button
                                                key={`${sectionId}-${idx}`}
                                                onClick={() => {
                                                    setCurrentSection(sectionId);
                                                    setCurrentQuestionIndex(idx);
                                                }}
                                                className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${isCurrent
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                    : isAnswered
                                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-stone-200">
                            <p className="text-xs text-stone-500 mb-3">Legend</p>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-indigo-600 rounded"></span>
                                    <span className="text-stone-600">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                                    <span className="text-stone-600">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-stone-100 rounded"></span>
                                    <span className="text-stone-600">Not Answered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Question Area */}
                <main className="lg:ml-64 flex-1 p-6 lg:p-8 pb-24">
                    <div className="max-w-3xl mx-auto">
                        {/* Section Tabs */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            {sectionKeys.map(sectionId => {
                                const section = PAPER_STRUCTURE.sections.find(s => s.id === sectionId);
                                return (
                                    <button
                                        key={sectionId}
                                        onClick={() => {
                                            setCurrentSection(sectionId);
                                            setCurrentQuestionIndex(0);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentSection === sectionId
                                            ? 'bg-stone-900 text-white'
                                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                            }`}
                                    >
                                        {sectionId}
                                        <span className="text-xs opacity-60 ml-1">
                                            ({section?.count || mockData.sections[sectionId].length})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Current Question */}
                        {currentQuestion && (
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                                {/* Question Header */}
                                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center font-semibold">
                                            {currentQuestionIndex + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">
                                                Section {currentSection} • Question {currentQuestionIndex + 1}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {answers[`${currentSection}-${currentQuestion.id || currentQuestionIndex}`] && (
                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                            Answered
                                        </span>
                                    )}
                                </div>

                                {/* Question Content */}
                                <div className="p-6">
                                    <MockQuestionRenderer
                                        question={currentQuestion}
                                        selectedAnswer={answers[`${currentSection}-${currentQuestion.id || currentQuestionIndex}`]}
                                        onAnswerSelect={(answer) => handleAnswerChange(currentSection, currentQuestion.id || currentQuestionIndex, answer)}
                                        showFeedback={!isExamMode}
                                        isExamMode={isExamMode}
                                    />
                                </div>

                                {/* Navigation Footer */}
                                <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between">
                                    <button
                                        onClick={() => {
                                            if (currentQuestionIndex > 0) {
                                                setCurrentQuestionIndex(prev => prev - 1);
                                            } else {
                                                const currentIdx = sectionKeys.indexOf(currentSection);
                                                if (currentIdx > 0) {
                                                    const prevSection = sectionKeys[currentIdx - 1];
                                                    setCurrentSection(prevSection);
                                                    setCurrentQuestionIndex(mockData.sections[prevSection].length - 1);
                                                }
                                            }
                                        }}
                                        disabled={currentSection === sectionKeys[0] && currentQuestionIndex === 0}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentSection === sectionKeys[0] && currentQuestionIndex === 0
                                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                            }`}
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (currentQuestionIndex < sectionQuestions.length - 1) {
                                                setCurrentQuestionIndex(prev => prev + 1);
                                            } else {
                                                const currentIdx = sectionKeys.indexOf(currentSection);
                                                if (currentIdx < sectionKeys.length - 1) {
                                                    setCurrentSection(sectionKeys[currentIdx + 1]);
                                                    setCurrentQuestionIndex(0);
                                                }
                                            }
                                        }}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        {currentQuestionIndex === sectionQuestions.length - 1 &&
                                            currentSection === sectionKeys[sectionKeys.length - 1]
                                            ? 'Review & Submit →'
                                            : 'Next →'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MockTestPage;
