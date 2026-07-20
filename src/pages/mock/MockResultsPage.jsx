import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import MockQuestionRenderer, { DiagramPlaceholder } from '../../components/mock/MockQuestionRenderer';
import { CBSE_PAPER_STRUCTURE } from '../../config/mockStructure';

// Helper to get mock by ID from session storage
function getMockById(id) {
    const stored = sessionStorage.getItem(`mock_${id}`);
    return stored ? JSON.parse(stored) : null;
}

// Helper to check if an answer is correct robustly
// Helper to check if an answer is correct robustly
const checkAnswer = (question, userAnswer) => {
    if (!userAnswer) return false;
    const normUser = String(userAnswer).trim().toLowerCase();

    // 1. Get Normalized Correct Option (Value) and Key
    let correctKey = null;
    let correctValue = null;

    if (question.correct_option) {
        const raw = String(question.correct_option).trim();
        // Check for simple letter key (A, B, C, D) or number (1, 2, 3, 4)
        if (/^[a-dA-D1-4]$/.test(raw)) {
            const map = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
            correctKey = (map[raw] || raw).toLowerCase();
        } else {
            correctValue = raw.toLowerCase();
        }
    }

    // Try to derive key from value if we have options
    if (correctValue && !correctKey && Array.isArray(question.options)) {
        const idx = question.options.findIndex(opt =>
            String(opt).trim().toLowerCase() === correctValue
        );
        if (idx !== -1) correctKey = String.fromCharCode(97 + idx); // 0->a
    }

    // Fallback: Parse 'answer' field for "Option (B)" or "**Option (B)**" pattern
    if (!correctKey && !correctValue) {
        const ansStr = typeof question.answer === 'string' ? question.answer :
            (question.answer?.final_answer || question.answer?.explanation || '');

        // Match "Option (B)", "**Option (B)**", "Option 1", etc.
        const match = String(ansStr).match(/Option\s*\(?([A-D1-4])\)?/i);
        if (match) {
            const rawKey = match[1].toLowerCase();
            const map = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
            correctKey = map[rawKey] || rawKey;
        }
    }

    // COMPARE
    // Case A: User provided Key (standard) - assume user key is 'a', 'b', 'c', 'd' or 'A', 'B'...
    // Normalize user answer to 'a', 'b', 'c', 'd' if it's a single letter
    let userKey = null;
    if (/^[a-dA-D]$/.test(normUser)) {
        userKey = normUser.toLowerCase();
    }

    if (userKey) {
        if (correctKey && userKey === correctKey) return true;
        // Check if user key maps to correct value
        if (correctValue && Array.isArray(question.options)) {
            const idx = userKey.charCodeAt(0) - 97;
            if (question.options[idx] && String(question.options[idx]).trim().toLowerCase() === correctValue) {
                return true;
            }
        }
    }

    // Case B: User provided Value (legacy/edge case)
    if (correctValue && normUser === correctValue) return true;

    // Case C: Reverse check - if we have correctKey but user provided value
    if (correctKey && !userKey && Array.isArray(question.options)) {
        const idx = correctKey.charCodeAt(0) - 97;
        const correctOptValue = question.options[idx];
        if (correctOptValue && String(correctOptValue).trim().toLowerCase() === normUser) {
            return true;
        }
    }

    return false;
};

/**
 * MockResultsPage - Results and solutions after test submission
 * Premium "Award-Winning" Design with Glassmorphism and Clean Typography
 */
function MockResultsPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [mockData, setMockData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeSpent, setTimeSpent] = useState(0);
    const [filter, setFilter] = useState('all'); // all, incorrect, unattempted

    useEffect(() => {
        // Try to get data from navigation state first
        if (location.state?.mockData) {
            setMockData(location.state.mockData);
            setAnswers(location.state.answers || {});
            setTimeSpent(location.state.timeSpent || 0);
        } else {
            // Fallback to stored data
            const data = getMockById(id);
            if (data) {
                setMockData(data);
            } else {
                navigate('/mocks');
            }
        }
    }, [id, location.state, navigate]);

    // Calculate results - Separating Auto-graded (MCQ) vs Subjective
    const calculateResults = () => {
        if (!mockData?.sections) return null;

        let totalMarks = 0; // Total marks of the ENTIRE paper
        let autoGradedTotalMarks = 0; // Total marks of only auto-graded questions
        let obtainedMarks = 0; // Marks obtained in auto-graded questions

        let totalQuestions = 0;
        let attempted = 0;
        let correct = 0;
        let wrong = 0;

        Object.entries(mockData.sections).forEach(([sectionId, questions]) => {
            questions.forEach(question => {
                const marks = question.marks || 1;
                totalMarks += marks;
                totalQuestions++;

                // Use composite key to retrieve answer
                const compositeKey = `${sectionId}-${question.id}`;
                const userAnswer = answers[compositeKey];
                const type = question.type || (question.options ? 'mcq' : 'theory');
                // Assume MCQ if options exist and type isn't case study (though case study sub-questions might be MCQs, logic here simplifies)
                const isAutoGradable = type === 'mcq' || (question.options && !type.includes('case'));

                if (userAnswer) attempted++;

                if (isAutoGradable) {
                    autoGradedTotalMarks += marks;

                    if (checkAnswer(question, userAnswer)) {
                        obtainedMarks += marks;
                        correct++;
                    } else if (userAnswer) {
                        wrong++;
                    }
                }
                // Subjective questions are NOT added to autoGradedTotalMarks or obtainedMarks
            });
        });

        const percentage = autoGradedTotalMarks > 0 ? Math.round((obtainedMarks / autoGradedTotalMarks) * 100) : 0;

        return {
            totalMarks,
            autoGradedTotalMarks, // Total marks possible for MCQs
            obtainedMarks,        // Marks actually scored
            totalQuestions,
            attempted,
            correct,
            wrong,
            percentage
        };
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        return `${mins}m ${secs}s`;
    };

    if (!mockData) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60 font-medium">Loading results...</p>
                </div>
            </div>
        );
    }

    const results = calculateResults();
    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (percentage >= 80) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
        if (percentage >= 70) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
        if (percentage >= 60) return { grade: 'C', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
        if (percentage >= 50) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' };
        return { grade: 'Needs Improvement', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' };
    };
    const gradeInfo = results ? getGrade(results.percentage) : null;

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Immersive Header */}
            <header className="bg-stone-900 text-white relative overflow-hidden pb-32">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-stone-900"></div>

                <nav className="container-app pt-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="Lumina Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                            <span className="font-semibold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
                                Lumina
                            </span>
                        </Link>
                        <Link
                            to="/mocks"
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm text-sm font-medium transition-all"
                        >
                            Exit Analysis
                        </Link>
                    </div>
                </nav>

                <div className="container-app relative z-10 mt-8 md:mt-12 text-center px-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-indigo-200 mb-4 backdrop-blur-md">
                        {mockData.meta?.chapter}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">
                        Assessment Complete
                    </h1>
                    <p className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
                        Here's a comprehensive breakdown of your performance marks and detailed solutions for review.
                    </p>
                </div>
            </header>

            {/* Content Container - Overlapping Header */}
            <div className="container-app -mt-20 relative z-20 pb-20">
                {/* Score Summary Card */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 p-5 sm:p-6 md:p-10 mb-8 md:mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left: Score Visual */}
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 ${gradeInfo?.border} ${gradeInfo?.bg} flex-shrink-0`}>
                                    <div className="text-center">
                                        <div className={`text-3xl sm:text-4xl font-bold ${gradeInfo?.color}`}>
                                            {results?.percentage}%
                                        </div>
                                        <div className={`text-xs font-medium uppercase tracking-wider mt-1 ${gradeInfo?.color}`}>
                                            Accuracy
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 text-sm text-stone-500 font-medium uppercase tracking-wide">Overall Grade</div>
                                    <div className={`text-2xl sm:text-3xl font-bold ${gradeInfo?.color} mb-2`}>{gradeInfo?.grade}</div>
                                    <p className="text-sm text-stone-600 leading-relaxed max-w-xs mx-auto sm:mx-0">
                                        Based on auto-graded questions. Subjective answers require self-evaluation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-4 sm:p-5 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">Time Taken</div>
                                <div className="text-xl sm:text-2xl font-bold text-stone-900">{formatTime(timeSpent)}</div>
                            </div>
                            <div className="p-4 sm:p-5 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">Attempted</div>
                                <div className="text-xl sm:text-2xl font-bold text-stone-900">
                                    {results?.attempted} <span className="text-stone-400 text-base sm:text-lg font-normal">/ {results?.totalQuestions}</span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">Auto-Graded</div>
                                <div className="text-xl sm:text-2xl font-bold text-stone-900">
                                    {results?.obtainedMarks} <span className="text-stone-400 text-base sm:text-lg font-normal">/ {results?.autoGradedTotalMarks}</span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">Total Marks</div>
                                <div className="text-xl sm:text-2xl font-bold text-stone-900">{results?.totalMarks}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {['all', 'incorrect', 'unattempted'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${filter === f
                                ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Question Analysis List */}
                <div className="space-y-12">
                    {Object.entries(mockData.sections).map(([sectionId, questions]) => {
                        // Filter questions based on selection
                        const filteredQuestions = questions.filter(q => {
                            const userAnswer = answers[`${sectionId}-${q.id}`];
                            const isMCQ = (q.type || 'mcq') === 'mcq';
                            const isCorrect = checkAnswer(q, userAnswer);

                            if (filter === 'incorrect') return isMCQ && userAnswer && !isCorrect;
                            if (filter === 'unattempted') return !userAnswer;
                            return true;
                        });

                        if (filteredQuestions.length === 0) return null;

                        return (
                            <div key={sectionId} className="animate-fade-in-up">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-lg shadow-indigo-600/20">
                                            {sectionId}
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                                            {sectionId === 'A' ? 'MCQ' :
                                                sectionId === 'B' ? 'Very Short' :
                                                    sectionId === 'C' ? 'Short Answer' :
                                                        sectionId === 'D' ? 'Long Answer' :
                                                            'Case Study'}
                                        </h2>
                                    </div>
                                    <div className="hidden sm:block h-px flex-1 bg-stone-200"></div>
                                </div>

                                <div className="grid gap-4 sm:gap-6 md:gap-8">
                                    {filteredQuestions.map((question, idx) => {
                                        const userAnswer = answers[`${sectionId}-${question.id}`];
                                        const isMCQ = (question.type || 'mcq') === 'mcq';
                                        const isCorrect = checkAnswer(question, userAnswer);

                                        return (
                                            <div key={question.id || idx} className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 sm:mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-stone-400 font-medium">Q{String(question.id || '').replace(/\D/g, '')}</span>
                                                        {isMCQ ? (
                                                            userAnswer ? (
                                                                isCorrect ? (
                                                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                                                        Correct
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        Incorrect
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider">
                                                                    Unattempted
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                                                Self Evaluation
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium text-stone-400">
                                                        {question.marks || 1} Marks
                                                    </div>
                                                </div>

                                                <MockQuestionRenderer
                                                    question={question}
                                                    selectedAnswer={answers[`${sectionId}-${question.id}`]}
                                                    showFeedback={true}
                                                    isExamMode={false}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MockResultsPage;
