import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Clock, CheckCircle } from 'lucide-react';

const UnseenPassageViewer = () => {
    const { passageId } = useParams();
    const navigate = useNavigate();
    const [passageData, setPassageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'vocabulary'
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [showAnswers, setShowAnswers] = useState({});

    const [mobileView, setMobileView] = useState('passage'); // 'passage' or 'questions'

    // Reset state on passage change
    useEffect(() => {
        setShowAnswers({});
        setTimeLeft(900);
        setLoading(true);
        setMobileView('passage'); // Reset mobile view
        const loadPassage = async () => {
            try {
                // Determine file to load. Assuming passageId is '1', '2' etc. mapping to passage1.json
                const module = await import(`../data/Boards/English/UnseenPassages/passage${passageId}.json`);
                setPassageData(module.default || module);
            } catch (err) {
                console.error("Failed to load passage", err);
                setPassageData(null);
            } finally {
                setLoading(false);
            }
        };
        loadPassage();
    }, [passageId]);

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleNext = () => {
        const nextId = parseInt(passageId) + 1;
        if (nextId <= 5) navigate(`/subjects/english/unseen/passage/${nextId}`);
    };

    const handlePrev = () => {
        const prevId = parseInt(passageId) - 1;
        if (prevId >= 1) navigate(`/subjects/english/unseen/passage/${prevId}`);
    };

    const toggleAnswer = (idx) => {
        setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleSubmit = () => {
        const allRevealed = {};
        allQuestions.forEach((_, idx) => {
            allRevealed[idx] = true;
        });
        setShowAnswers(allRevealed);
        setActiveTab('questions'); // Ensure questions tab is open
        setMobileView('questions'); // Switch to questions view on mobile
    };

    if (loading) return <div className="min-h-screen bg-[#0c0a09] text-white flex items-center justify-center">Loading Passage...</div>;
    if (!passageData) return <div className="min-h-screen bg-[#0c0a09] text-white flex items-center justify-center">Passage Not Found</div>;

    // Correct destructuring based on actual JSON keys
    const { passage_metadata, unseen_passage, passage_content, questions, model_answers } = passageData;

    // Normalize data
    const meta = passage_metadata || {};
    const textContent = unseen_passage || passage_content?.text || "No text content available.";

    // Flatten questions if they are categorized
    let allQuestions = [];
    if (Array.isArray(questions)) {
        allQuestions = questions;
    } else if (questions) {
        if (questions.mcqs) allQuestions = [...allQuestions, ...questions.mcqs.map(q => ({ ...q, type: 'MCQ' }))];
        if (questions.short_answer_questions) allQuestions = [...allQuestions, ...questions.short_answer_questions.map(q => ({ ...q, type: 'Short Answer' }))];
        if (questions.vocabulary_questions) allQuestions = [...allQuestions, ...questions.vocabulary_questions.map(q => ({ ...q, type: 'Vocabulary' }))];
    }

    const getAnswerForQuestion = (q, idx) => {
        if (!model_answers) return "Answer key not available.";

        const { mcq_answers, short_answer_responses, vocabulary_answers } = model_answers;

        if (q.type === 'MCQ') {
            // Count previous MCQs to find index
            const mcqCount = allQuestions.slice(0, idx).filter(qn => qn.type === 'MCQ').length;
            return mcq_answers?.[mcqCount] || "Answer not found";
        }

        if (q.type === 'Short Answer') {
            const shortCount = allQuestions.slice(0, idx).filter(qn => qn.type === 'Short Answer').length;
            const ans = short_answer_responses?.[shortCount];
            return typeof ans === 'object' ? ans.answer : ans || "Answer not found";
        }

        if (q.type === 'Vocabulary') {
            const vocabCount = allQuestions.slice(0, idx).filter(qn => qn.type === 'Vocabulary').length;
            return vocabulary_answers?.[vocabCount] || "Answer not found";
        }

        return "Answer type not recognized.";
    };

    return (
        <div className="h-screen bg-[#0c0a09] text-stone-200 font-sans flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-stone-900/50 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-20">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <button onClick={() => navigate('/subjects/english/unseen')} className="p-2 hover:bg-white/5 rounded-full text-stone-400 hover:text-white transition-colors shrink-0" title="Back to Instructions">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-xs md:text-sm uppercase tracking-widest truncate">{meta.theme || meta.title || `Passage ${passageId}`}</h1>
                        <span className="text-stone-500 text-[10px] md:text-xs block truncate">{meta.difficulty_level || 'Standard'} • {meta.passage_type || 'Reading'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    {/* Navigation - Hidden on very small screens if needed, or compact */}
                    <div className="flex items-center gap-1 md:gap-2 mr-2 md:mr-4">
                        <button
                            onClick={handlePrev}
                            disabled={parseInt(passageId) <= 1}
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-stone-400 text-xs md:text-sm font-mono whitespace-nowrap">{passageId}/5</span>
                        <button
                            onClick={handleNext}
                            disabled={parseInt(passageId) >= 5}
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft < 300 ? 'border-red-500/50 bg-red-900/10 text-red-500' : 'border-cyan-500/50 bg-cyan-900/10 text-cyan-500'}`}>
                        <Clock size={16} />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>

                    {/* Mobile Timer (Compact) */}
                    <div className={`md:hidden flex items-center font-mono font-bold text-sm ${timeLeft < 300 ? 'text-red-500' : 'text-cyan-500'}`}>
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="bg-white text-black px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold hover:bg-stone-200 transition-colors whitespace-nowrap"
                    >
                        Submit
                    </button>
                </div>
            </header>

            {/* Mobile View Toggle */}
            <div className="md:hidden flex border-b border-white/5 bg-stone-900/30 shrink-0">
                <button
                    onClick={() => setMobileView('passage')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${mobileView === 'passage' ? 'text-white border-b-2 border-cyan-500 bg-white/5' : 'text-stone-500'}`}
                >
                    Passage
                </button>
                <button
                    onClick={() => setMobileView('questions')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${mobileView === 'questions' ? 'text-white border-b-2 border-cyan-500 bg-white/5' : 'text-stone-500'}`}
                >
                    Questions
                </button>
            </div>

            {/* Main Content - Responsive Split/Stack */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Panel: Passage Text */}
                <div className={`w-full md:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-white/5 scrollbar-hide bg-[#0c0a09] ${mobileView === 'passage' ? 'block' : 'hidden md:block'}`}>
                    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
                        <p className="font-serif text-base md:text-lg leading-loose text-stone-300 whitespace-pre-line text-justify selection:bg-cyan-500/30">
                            {textContent}
                        </p>
                    </div>
                </div>

                {/* Right Panel: Questions */}
                <div className={`w-full md:w-1/2 bg-stone-900/30 flex flex-col ${mobileView === 'questions' ? 'block' : 'hidden md:block'}`}>
                    {/* Tabs */}
                    <div className="flex border-b border-white/5 shrink-0">
                        <button
                            onClick={() => setActiveTab('questions')}
                            className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'questions' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/5' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Questions
                        </button>
                        <button
                            onClick={() => setActiveTab('vocabulary')}
                            className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'vocabulary' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/5' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Vocabulary Builder
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide pb-20 md:pb-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'questions' ? (
                                <motion.div
                                    key="questions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 md:space-y-8"
                                >
                                    {allQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-4 md:p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-cyan-500 font-bold text-base md:text-lg">Q.{idx + 1}</span>
                                                <span className="text-stone-500 text-[10px] md:text-xs font-bold uppercase border border-stone-800 px-2 py-0.5 rounded">{q.type} • {q.marks}M</span>
                                            </div>
                                            <p className="text-white mb-6 font-medium text-sm md:text-base">{q.question}</p>

                                            {/* Options (if MCQ) or Text Area */}
                                            {q.options ? (
                                                <div className="space-y-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-stone-600 group-hover:border-cyan-500 flex items-center justify-center shrink-0">
                                                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            </div>
                                                            <span className="text-stone-400 group-hover:text-stone-200 text-sm">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <textarea
                                                    className="w-full bg-[#0c0a09] border border-white/10 rounded-lg p-4 text-stone-300 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors h-32 resize-none"
                                                    placeholder={`Type your answer here... ${q.word_limit ? `(${q.word_limit})` : ''}`}
                                                ></textarea>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => toggleAnswer(idx)}
                                                    className="text-xs text-stone-500 flex items-center gap-1 hover:text-cyan-400 transition-colors mb-2"
                                                >
                                                    <CheckCircle size={12} />
                                                    {showAnswers[idx] ? 'Hide Answer' : 'Reveal Answer Key'}
                                                </button>

                                                {showAnswers[idx] && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="bg-green-900/10 border border-green-500/20 rounded p-3 text-sm text-green-300 font-medium"
                                                    >
                                                        {getAnswerForQuestion(q, idx)}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="vocab"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Placeholder for Vocab - Assuming data structure or generic content */}
                                    <div className="p-6 rounded-xl bg-purple-900/10 border border-purple-500/20 text-center">
                                        <BookOpen className="mx-auto text-purple-400 mb-4" size={32} />
                                        <h3 className="text-white font-bold mb-2">Build Your Lexicon</h3>
                                        <p className="text-stone-400 text-sm">
                                            Highlight words in the passage to see definitions and synonyms instantly.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnseenPassageViewer;
