import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Check, X, AlertTriangle, Lightbulb, ArrowLeft, ArrowRight,
  Eye, EyeOff, BarChart2, Bookmark, CheckCircle2, XCircle, RotateCcw,
  Award, ChevronLeft, ChevronRight, Zap, Target, BookMarked, Home, HelpCircle
} from 'lucide-react';
import { loadPhysicsQuestions } from '../utils/contentLoader';
import { subjects } from '../data/mockData';
import LatexText from '../components/LatexText';
import 'katex/dist/katex.min.css';

// Helper to format typology names
const formatTypology = (tag) => {
  if (!tag) return 'General';
  if (tag === 'VSA') return 'Very Short Answer (VSA)';
  if (tag === 'SA') return 'Short Answer (SA)';
  if (tag === 'CASE_EXTRACT') return 'Case Extract (Passage)';
  return tag.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const getTypologyColor = (tag) => {
  switch (tag) {
    case 'BOUNDARY_CONDITION': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    case 'GRAPH_MAPPING': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'EXPLANATION_TRAP': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'MULTI_STATEMENT': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'CAUSAL_REASONING': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    case 'VSA': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    case 'SA': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'CASE_EXTRACT': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  }
};

function QuestionsPracticePage() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  // Subject details
  const subject = subjects.find(s => s.id === subjectId) || { name: 'Physics', icon: '⚛️' };

  // Data States
  const [questions, setQuestions] = useState([]);
  const [chapterName, setChapterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Practice States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // question_id -> { selected, isCorrect, selfGrade, maxMarks, checkedSteps }
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [sessionFinished, setSessionFinished] = useState(false);

  // Layout & Filter States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeFormat, setActiveFormat] = useState('ALL'); // ALL, MCQ, ASSERTION_REASON, SUBJECTIVE
  const [activeTypology, setActiveTypology] = useState('ALL'); // ALL, or typology_tag
  const [showTopperLogic, setShowTopperLogic] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Mistakes-only practice state
  const [isMistakesOnlyMode, setIsMistakesOnlyMode] = useState(false);
  const [originalQuestions, setOriginalQuestions] = useState([]);

  // Load questions
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError(null);
      try {
        const rawData = await loadPhysicsQuestions(chapterId);
        if (rawData && Array.isArray(rawData)) {
          let allQs = [];
          let name = 'Chapter Questions';
          rawData.forEach(item => {
            if (item.chapter_assessment_bank) {
              allQs = [...allQs, ...(item.chapter_assessment_bank.questions || [])];
              if (item.chapter_assessment_bank.chapter_name) {
                name = item.chapter_assessment_bank.chapter_name;
              }
            }
            if (item.chapter_subjective_bank) {
              const subjectiveQs = (item.chapter_subjective_bank.questions || []).map(q => ({
                ...q,
                format: 'SUBJECTIVE'
              }));
              allQs = [...allQs, ...subjectiveQs];
              if (item.chapter_subjective_bank.chapter_name) {
                name = item.chapter_subjective_bank.chapter_name;
              }
            }
          });
          
          if (allQs.length > 0) {
            setQuestions(allQs);
            setOriginalQuestions(allQs);
            setChapterName(name);
          } else {
            setError('No questions found in this chapter.');
          }
        } else {
          setError('Failed to resolve questions database.');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading practice files.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [chapterId]);

  // Derived filter logic
  const typologies = Array.from(new Set(originalQuestions.map(q => q.typology_tag).filter(Boolean)));
  
  const filteredQuestions = questions.filter(q => {
    const formatMatch = activeFormat === 'ALL' || q.format === activeFormat;
    const typologyMatch = activeTypology === 'ALL' || q.typology_tag === activeTypology;
    return formatMatch && typologyMatch;
  });

  const currentQuestion = filteredQuestions[currentIndex];

  // Sync selection state on index changes
  useEffect(() => {
    if (currentQuestion) {
      const saved = userAnswers[currentQuestion.question_id];
      if (saved) {
        if (currentQuestion.format === 'SUBJECTIVE') {
          setCheckedSteps(saved.checkedSteps || new Array(currentQuestion.marking_scheme_breakdown?.length || 0).fill(false));
          setIsChecked(true);
          setShowTopperLogic(true);
        } else {
          setSelectedOption(saved.selected);
          setIsChecked(true);
          setShowTopperLogic(true);
        }
      } else {
        setSelectedOption(null);
        setIsChecked(false);
        setShowTopperLogic(false);
        setCheckedSteps(new Array(currentQuestion.marking_scheme_breakdown?.length || 0).fill(false));
      }
    }
  }, [currentIndex, currentQuestion, userAnswers]);

  // Handle Option Select
  const handleSelectOption = (optKey) => {
    if (isChecked) return;
    setSelectedOption(optKey);
  };

  // Check Answer
  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion || isChecked) return;

    const isCorrect = selectedOption === currentQuestion.correct_option;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        selected: selectedOption,
        isCorrect: isCorrect
      }
    }));
    setIsChecked(true);
    setShowTopperLogic(true);
  };

  // Reveal subjective marking scheme
  const handleRevealScheme = () => {
    if (isChecked || !currentQuestion) return;
    setIsChecked(true);
    setShowTopperLogic(true);
    
    const initialChecked = new Array(currentQuestion.marking_scheme_breakdown?.length || 0).fill(false);
    setCheckedSteps(initialChecked);
    
    const maxMarks = currentQuestion.marking_scheme_breakdown?.reduce((sum, s) => sum + s.allocated_marks, 0) || 0;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        selfGrade: 0,
        maxMarks: maxMarks,
        checkedSteps: initialChecked,
        isCorrect: false
      }
    }));
  };

  // Toggle step checkbox in marking scheme
  const handleStepCheck = (stepIdx, isCheckedVal) => {
    if (!currentQuestion) return;
    
    const nextChecked = [...checkedSteps];
    nextChecked[stepIdx] = isCheckedVal;
    setCheckedSteps(nextChecked);
    
    let score = 0;
    currentQuestion.marking_scheme_breakdown?.forEach((step, idx) => {
      if (nextChecked[idx]) {
        score += step.allocated_marks;
      }
    });
    
    const maxMarks = currentQuestion.marking_scheme_breakdown?.reduce((sum, s) => sum + s.allocated_marks, 0) || 0;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        selfGrade: score,
        maxMarks: maxMarks,
        checkedSteps: nextChecked,
        isCorrect: score === maxMarks
      }
    }));
  };

  // Navigation
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (qId) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // End practice session
  const handleFinishSession = () => {
    setSessionFinished(true);
  };

  // Reset practice
  const handleResetSession = (mistakesOnly = false) => {
    if (mistakesOnly) {
      const incorrectQs = originalQuestions.filter(q => {
        const ans = userAnswers[q.question_id];
        return ans && !ans.isCorrect;
      });
      setQuestions(incorrectQs);
      setIsMistakesOnlyMode(true);
    } else {
      setQuestions(originalQuestions);
      setIsMistakesOnlyMode(false);
      setUserAnswers({});
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setShowTopperLogic(false);
    setSessionFinished(false);
    setCheckedSteps([]);
  };

  // Parse Assertion-Reason text
  const parseARText = (text) => {
    if (!text) return { assertion: '', reason: '' };
    const assertionMatch = text.match(/\*\*Assertion:\*\*([\s\S]*?)(?=\*\*Reason:\*\*|$)/i);
    const reasonMatch = text.match(/\*\*Reason:\*\*([\s\S]*?)$/i);
    
    return {
      assertion: assertionMatch ? assertionMatch[1].trim() : text,
      reason: reasonMatch ? reasonMatch[1].trim() : ''
    };
  };

  // Keyboard Shortcuts handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || error || sessionFinished || !currentQuestion) return;

      const key = e.key.toLowerCase();
      
      if (key === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
      
      if (key === 'b') {
        e.preventDefault();
        toggleBookmark(currentQuestion.question_id);
      }
      
      if (e.key === 'ArrowRight' || key === 'n') {
        handleNext();
      }
      if (e.key === 'ArrowLeft' || key === 'p') {
        handlePrev();
      }
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isChecked) {
          if (currentQuestion.format === 'SUBJECTIVE') {
            handleRevealScheme();
          } else {
            handleCheckAnswer();
          }
        } else {
          handleNext();
        }
      }

      if (!isChecked && currentQuestion.format !== 'SUBJECTIVE') {
        if (['1', 'a'].includes(key)) handleSelectOption('a');
        if (['2', 'b'].includes(key)) handleSelectOption('b');
        if (['3', 'c'].includes(key)) handleSelectOption('c');
        if (['4', 'd'].includes(key)) handleSelectOption('d');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, error, sessionFinished, currentIndex, currentQuestion, selectedOption, isChecked, filteredQuestions, checkedSteps]);

  // Loading UI
  if (loading) {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-indigo-400 font-medium tracking-wide animate-pulse">Loading practice bank...</p>
      </div>
    );
  }

  // Error UI
  if (error || questions.length === 0) {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-stone-900 border border-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl">⚠️</div>
        <h2 className="text-2xl text-white font-bold mb-4">Error Loading Questions</h2>
        <p className="text-white/40 max-w-md mb-8">{error || 'Questions are not available for this chapter yet.'}</p>
        <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/35">
          Go Back to Chapter
        </Link>
      </div>
    );
  }

  // Summary statistics calculations
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Typology statistics breakdown
  const typologyStats = {};
  originalQuestions.forEach(q => {
    const tag = q.typology_tag || 'GENERAL';
    if (!typologyStats[tag]) {
      typologyStats[tag] = { total: 0, answered: 0, correct: 0 };
    }
    typologyStats[tag].total += 1;
    const ans = userAnswers[q.question_id];
    if (ans) {
      typologyStats[tag].answered += 1;
      if (ans.isCorrect) typologyStats[tag].correct += 1;
    }
  });

  return (
    <div className="h-screen w-screen bg-stone-950 text-stone-100 font-sans overflow-hidden flex flex-col relative select-none">
      
      {/* Background visual glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* TOP BAR */}
      <header className="h-16 shrink-0 bg-stone-900/50 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-stone-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
                {subject.icon} {subject.name}
              </span>
              {isMistakesOnlyMode && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md animate-pulse">
                  Mistakes Review Room
                </span>
              )}
            </div>
            <h1 className="text-xs md:text-sm font-bold text-white tracking-tight mt-0.5 truncate max-w-[200px] md:max-w-xs lg:max-w-md">
              {chapterName}
            </h1>
          </div>
        </div>

        {/* Header progress bar */}
        {!sessionFinished && filteredQuestions.length > 0 && (
          <div className="hidden md:flex flex-col items-center gap-1 w-72 lg:w-96 shrink-0">
            <div className="flex items-center justify-between w-full text-[10px] text-stone-400">
              <span>Progress: {currentIndex + 1} / {filteredQuestions.length}</span>
              <span>{Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-stone-850 h-1 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="bg-indigo-500 h-full rounded-full"
                animate={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Quick Toolbar Actions */}
        <div className="flex items-center gap-3">
          {!sessionFinished && (
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isFocusMode
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-md'
                  : 'bg-white/5 border-white/5 text-stone-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Focus Mode [F]"
            >
              {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          <button
            onClick={sessionFinished ? () => navigate(`/subjects/${subjectId}/chapters/${chapterId}`) : handleFinishSession}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/50"
          >
            {sessionFinished ? 'Back to Chapter' : 'End Practice'}
          </button>
        </div>
      </header>

      {/* VIEWPORT FILLER */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        <AnimatePresence mode="wait">
          {sessionFinished ? (
            
            // SUMMARY SCREEN (Fits exactly inside height-restricted container)
            <motion.div
              key="summary-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 flex flex-col items-center justify-start z-10"
            >
              <div className="max-w-2xl w-full space-y-6 pb-12">
                
                {/* Hero Summary Card */}
                <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
                      <Award className="w-4 h-4" /> Practice Session Completed
                    </span>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      Review Your Score
                    </h2>
                    <p className="text-stone-400 text-xs max-w-sm leading-relaxed">
                      You've successfully exposed examiner traps and evaluated your conceptual accuracy. Here's your metrics breakdown.
                    </p>
                  </div>

                  {/* Circular Accuracy Widget */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" stroke="#292524" strokeWidth="8" fill="transparent" />
                      <motion.circle
                        cx="56" cy="56" r="46" stroke="rgb(99, 102, 241)" strokeWidth="8" fill="transparent"
                        strokeDasharray={289}
                        initial={{ strokeDashoffset: 289 }}
                        animate={{ strokeDashoffset: 289 - (289 * accuracy) / 100 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-white">{accuracy}%</span>
                      <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">Accuracy</span>
                    </div>
                  </div>
                </div>

                {/* Score Indicators Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Answered</p>
                    <p className="text-xl font-extrabold text-white mt-0.5">{answeredCount} / {questions.length}</p>
                  </div>
                  <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Correct</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{correctCount}</p>
                  </div>
                  <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Bookmarks</p>
                    <p className="text-xl font-extrabold text-amber-400 mt-0.5">{flaggedQuestions.size}</p>
                  </div>
                </div>

                {/* Subjective score performance breakdown */}
                {(() => {
                  let totalSubjectiveMarksEarned = 0;
                  let totalSubjectiveMaxMarks = 0;
                  let hasSubjectiveAttempted = false;

                  originalQuestions.forEach(q => {
                    if (q.format === 'SUBJECTIVE') {
                      const ans = userAnswers[q.question_id];
                      if (ans) {
                        hasSubjectiveAttempted = true;
                        totalSubjectiveMarksEarned += ans.selfGrade || 0;
                        totalSubjectiveMaxMarks += ans.maxMarks || 0;
                      }
                    }
                  });

                  if (!hasSubjectiveAttempted) return null;

                  return (
                    <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden shadow-xl flex items-center justify-between gap-6">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/25 rounded-md text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                          📝 Board Subjective Scorecard
                        </span>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          Self-Graded Performance
                        </h3>
                        <p className="text-stone-400 text-xs leading-relaxed max-w-md">
                          Based on the official Board stepwise evaluation triggers, you evaluated your written answers and scored:
                        </p>
                      </div>
                      <div className="px-5 py-3.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[100px] shadow-lg">
                        <span className="text-[8px] font-mono uppercase font-bold tracking-widest opacity-80">Marks</span>
                        <span className="text-xl font-extrabold tracking-tight mt-0.5">
                          {totalSubjectiveMarksEarned} / {totalSubjectiveMaxMarks}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Typology accuracy breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="w-4.5 h-4.5 text-indigo-400" /> Accuracy per Question Typology
                  </h3>
                  
                  <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-5 space-y-3 shadow-md max-h-[220px] overflow-y-auto custom-scrollbar">
                    {Object.entries(typologyStats).map(([tag, stats]) => {
                      const tagAccuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
                      return (
                        <div key={tag} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-stone-300">{formatTypology(tag)}</span>
                            <span className="text-stone-400">
                              {stats.correct} / {stats.answered} Correct ({tagAccuracy}%)
                            </span>
                          </div>
                          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${
                                tagAccuracy >= 80 ? 'bg-emerald-500' :
                                tagAccuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${tagAccuracy}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleResetSession(false)}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Practice All Again
                  </button>

                  {answeredCount - correctCount > 0 && (
                    <button
                      onClick={() => handleResetSession(true)}
                      className="px-5 py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-xl font-bold flex items-center gap-2 transition-all text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Review Mistakes ({answeredCount - correctCount})
                    </button>
                  )}

                  <Link
                    to={`/subjects/${subjectId}/chapters/${chapterId}`}
                    className="px-5 py-3 bg-stone-900 hover:bg-stone-850 border border-white/10 text-stone-300 rounded-xl font-bold flex items-center gap-2 transition-all text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Return to Marks View
                  </Link>
                </div>

              </div>
            </motion.div>
          ) : (
            
            // 100VH DOUBLE-PANEL PRACTICE ROOM
            <motion.div
              key="practice-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden w-full h-full relative"
            >
              
              {/* COMPACT LEFT SIDEBAR */}
              {!isFocusMode && (
                <aside className="w-64 border-r border-white/5 bg-stone-950 flex flex-col h-full overflow-hidden shrink-0 z-10">
                  
                  {/* Filters Header (Format and Typology selectors) */}
                  <div className="p-4 border-b border-white/5 bg-stone-900/10 space-y-3">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-purple-400" /> Category Filters
                    </span>
                    
                    <div className="space-y-2">
                      {/* Format selector */}
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Format</label>
                        <select
                          value={activeFormat}
                          onChange={(e) => {
                            setActiveFormat(e.target.value);
                            setCurrentIndex(0);
                          }}
                          className="w-full bg-stone-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-stone-300 font-semibold focus:outline-none focus:border-indigo-500/50"
                        >
                          <option value="ALL">All Formats</option>
                          <option value="MCQ">Multiple Choice (MCQ)</option>
                          <option value="ASSERTION_REASON">Assertion-Reason</option>
                          <option value="SUBJECTIVE">Subjective Questions</option>
                        </select>
                      </div>

                      {/* Typology selector */}
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Typology</label>
                        <select
                          value={activeTypology}
                          onChange={(e) => {
                            setActiveTypology(e.target.value);
                            setCurrentIndex(0);
                          }}
                          className="w-full bg-stone-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-stone-300 font-semibold focus:outline-none focus:border-indigo-500/50 truncate"
                        >
                          <option value="ALL">All Typologies</option>
                          {typologies.map(t => (
                            <option key={t} value={t}>{formatTypology(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Compact Grid Question Navigator */}
                  <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-3 shrink-0">
                      <Target className="w-3.5 h-3.5 text-indigo-400" /> Question Navigator
                    </span>

                    {filteredQuestions.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0 content-start py-0.5">
                        {filteredQuestions.map((q, idx) => {
                          const ans = userAnswers[q.question_id];
                          const isCurrent = currentIndex === idx;
                          const isBookmarked = flaggedQuestions.has(q.question_id);

                          let cellStyle = 'bg-stone-900/30 border-white/5 text-stone-400 hover:bg-white/5 hover:border-white/10';

                          if (ans) {
                            if (ans.selfGrade !== undefined) {
                              if (ans.selfGrade === ans.maxMarks) {
                                cellStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20';
                              } else if (ans.selfGrade > 0) {
                                cellStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20';
                              } else {
                                cellStyle = 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20';
                              }
                            } else {
                              cellStyle = ans.isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20';
                            }
                          } else if (q.format === 'SUBJECTIVE') {
                            cellStyle = 'bg-stone-900/30 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500/35';
                          }

                          if (isCurrent) {
                            cellStyle = 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50';
                          }

                          return (
                            <button
                              key={q.question_id}
                              onClick={() => setCurrentIndex(idx)}
                              className={`relative aspect-square rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center shrink-0 ${cellStyle}`}
                            >
                              <span className={ans ? "text-[10px]" : "text-xs"}>{idx + 1}</span>
                              {ans && ans.selfGrade !== undefined && (
                                <span className="text-[8px] font-extrabold opacity-80 mt-0.5">{ans.selfGrade}/{ans.maxMarks}</span>
                              )}
                              {q.format === 'SUBJECTIVE' && !ans && (
                                <span className="text-[7px] font-extrabold opacity-60 mt-0.5 tracking-tighter uppercase px-1 bg-indigo-500/10 rounded">
                                  {q.marks_category}M
                                </span>
                              )}
                              {isBookmarked && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center p-4">
                        <p className="text-[10px] text-stone-500 italic">No questions match the selected filters.</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar compact footer statistics */}
                  <div className="p-4 border-t border-white/5 bg-stone-950 shrink-0 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Attempted:</span>
                      <span className="font-bold text-stone-300">{answeredCount} / {filteredQuestions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Correct:</span>
                      <span className="font-bold text-emerald-400">{correctCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Accuracy Rate:</span>
                      <span className="font-bold text-indigo-400">{accuracy}%</span>
                    </div>
                  </div>

                </aside>
              )}

              {/* CENTER PRACTICE AREA (Height restricted to exactly fit screen minus header/footer) */}
              <main className="flex-1 flex flex-col h-full overflow-hidden p-6 relative z-10">
                {isFocusMode && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[9px] text-stone-500 bg-stone-900 border border-white/5 px-2 py-1 rounded-md pointer-events-none select-none uppercase tracking-wider font-bold z-10">
                    <Zap className="w-3 h-3 text-indigo-400 animate-pulse" /> Focus Mode
                  </div>
                )}

                <div className="flex-1 flex flex-col min-h-0 max-w-3xl w-full mx-auto justify-between">
                  
                  {filteredQuestions.length > 0 && currentQuestion ? (
                    
                    // QUESTION CONTAINER CARD
                    <div className="flex-1 flex flex-col min-h-0 bg-stone-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                      
                      {/* Card meta header */}
                      <div className="flex items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-white/5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md uppercase tracking-wider">
                            Q. {currentIndex + 1} of {filteredQuestions.length}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTypologyColor(currentQuestion.typology_tag)}`}>
                            {formatTypology(currentQuestion.typology_tag)}
                          </span>
                          {currentQuestion.format && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-stone-850 text-stone-400 rounded-md border border-stone-700/50 uppercase tracking-wider">
                              {currentQuestion.format.replace('_', ' ')}
                            </span>
                          )}
                          {currentQuestion.marks_category && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 text-purple-400 rounded-md uppercase tracking-wider">
                              {currentQuestion.marks_category} Marks
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleBookmark(currentQuestion.question_id)}
                          className={`p-2 rounded-lg border transition-all ${
                            flaggedQuestions.has(currentQuestion.question_id)
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-white/5 border-white/5 text-stone-500 hover:text-stone-300'
                          }`}
                          title="Bookmark Question [B]"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.question_id) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Card scrollable body layout (single vertical flow) */}
                      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0 relative pb-4">
                        
                        {/* Question Stem or Assertion-Reason blocks */}
                        <div className="flex flex-col gap-3 shrink-0">
                          {currentQuestion.format === 'ASSERTION_REASON' ? (
                            (() => {
                              const { assertion, reason } = parseARText(currentQuestion.stem_text);
                              return (
                                <div className="space-y-3 shrink-0">
                                  <p className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                                    Statement Verification challenge:
                                  </p>
                                  
                                  {/* Assertion Box */}
                                  <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl space-y-1.5">
                                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded">
                                      Assertion (A)
                                    </span>
                                    <div className="text-white text-sm font-serif leading-relaxed notes-typography font-medium">
                                      <LatexText text={assertion} />
                                    </div>
                                  </div>

                                  {/* Reason Box */}
                                  <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl space-y-1.5">
                                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/10 rounded">
                                      Reason (R)
                                    </span>
                                    <div className="text-white text-sm font-serif leading-relaxed notes-typography font-medium">
                                      <LatexText text={reason} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="space-y-1.5 shrink-0">
                              <p className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                                Question Practice:
                              </p>
                              <h3 className="text-white text-base md:text-lg font-serif font-medium leading-relaxed tracking-wide notes-typography">
                                <LatexText text={currentQuestion.stem_text} />
                              </h3>
                            </div>
                          )}
                        </div>

                        {/* Subjective Panel or Options selections list */}
                        {currentQuestion.format === 'SUBJECTIVE' ? (
                          <div className="flex flex-col gap-4 shrink-0">
                            {!isChecked ? (
                              <div className="bg-stone-900/60 border border-white/5 p-6 rounded-2xl space-y-4 text-center">
                                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                  <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-white font-bold text-sm">Board Exam Subjective Challenge</h4>
                                  <p className="text-stone-400 text-xs max-w-md mx-auto leading-relaxed">
                                    Grab a sheet of paper. Solve this question step-by-step just as you would in your CBSE Board examination, keeping in mind standard formula declarations and S.I. units.
                                  </p>
                                </div>
                                <button
                                  onClick={handleRevealScheme}
                                  className="mx-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-950/50 flex items-center gap-2"
                                >
                                  <span>Reveal Step-by-Step Marking Scheme</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-5">
                                {/* Header / Score Tally */}
                                <div className="bg-stone-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Self-Grading Panel</h4>
                                    <p className="text-[10px] text-stone-500">Check each step you completed successfully below.</p>
                                  </div>
                                  
                                  {/* Score Display Badge */}
                                  {(() => {
                                    const ans = userAnswers[currentQuestion.question_id] || { selfGrade: 0, maxMarks: 0 };
                                    const isPerfect = ans.selfGrade === ans.maxMarks;
                                    return (
                                      <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center shrink-0 min-w-[70px] ${
                                        isPerfect
                                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-md shadow-emerald-950/20'
                                          : ans.selfGrade > 0
                                            ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 shadow-md shadow-amber-950/20'
                                            : 'bg-stone-850 border-white/5 text-stone-400'
                                      }`}>
                                        <span className="text-[8px] font-mono uppercase font-bold tracking-widest opacity-80">Score</span>
                                        <span className="text-base font-extrabold tracking-tight mt-0.5">
                                          {ans.selfGrade} / {ans.maxMarks}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* Step checklists */}
                                <div className="space-y-3">
                                  {currentQuestion.marking_scheme_breakdown?.map((step, idx) => {
                                    const isStepChecked = checkedSteps[idx];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => handleStepCheck(idx, !isStepChecked)}
                                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 ${
                                          isStepChecked
                                            ? 'bg-indigo-600/5 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                            : 'bg-stone-900/20 border-white/5 hover:border-white/15'
                                        }`}
                                      >
                                        {/* Satisfying Checkbox */}
                                        <div className="shrink-0 pt-0.5">
                                          <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                                            isStepChecked
                                              ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                                              : 'border-white/20 bg-stone-900/40 text-transparent'
                                          }`}>
                                            <Check className="w-3.5 h-3.5" />
                                          </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2.5">
                                          <div className="flex items-center justify-between gap-3">
                                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                                              Step {idx + 1}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold text-stone-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                              +{step.allocated_marks} Mark{step.allocated_marks > 1 ? 's' : ''}
                                            </span>
                                          </div>
                                          
                                          <div className="space-y-2 text-xs">
                                            {/* Trigger */}
                                            <div className="text-stone-300 font-semibold leading-relaxed">
                                              <span className="text-stone-400 font-normal">Requirement: </span>
                                              {step.evaluation_trigger}
                                            </div>

                                            {/* Minimum Viable Text / Model answer */}
                                            <div className="bg-stone-950/60 border border-white/5 p-3 rounded-xl space-y-2">
                                              <div>
                                                <span className="text-[9px] uppercase font-bold text-stone-500 block mb-0.5">Model Answer key</span>
                                                <p className="text-stone-300 leading-relaxed font-serif">
                                                  <LatexText text={step.minimum_viable_text} />
                                                </p>
                                              </div>
                                              
                                              {/* Algebraic Progression */}
                                              {step.algebraic_progression && step.algebraic_progression.length > 0 && (
                                                <div className="border-t border-white/5 pt-2 mt-2">
                                                  <span className="text-[9px] uppercase font-bold text-stone-500 block mb-1">Mathematical Progression</span>
                                                  <div className="space-y-1 font-mono text-[11px] text-stone-300">
                                                    {step.algebraic_progression.map((prog, pIdx) => (
                                                      <div key={pIdx} className="bg-stone-900/30 p-1.5 rounded border border-white/5">
                                                        <LatexText text={prog} />
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Step feedback message */}
                                {(() => {
                                  const ans = userAnswers[currentQuestion.question_id];
                                  if (!ans) return null;
                                  const isPerfect = ans.selfGrade === ans.maxMarks;
                                  return (
                                    <div className={`p-4.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                                      isPerfect
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950/20'
                                        : ans.selfGrade > 0
                                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-md shadow-amber-950/20'
                                          : 'bg-stone-900/60 border-white/5 text-stone-400'
                                    }`}>
                                      <h5 className="font-extrabold uppercase tracking-wide text-[9px] flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-indigo-400" /> Evaluator Feedback
                                      </h5>
                                      <p>
                                        {isPerfect
                                          ? "Perfect score! 🌟 You demonstrated precise step-by-step execution and followed the marking scheme exactly."
                                          : ans.selfGrade > 0
                                            ? "Solid progress! Review the remaining requirements above to make sure you don't lose step marks on the final exam."
                                            : "Check the checklist steps above as you verify your hand-written work to grade yourself."}
                                      </p>
                                    </div>
                                  );
                                })()}

                                {/* Inline Topper Execution Logic */}
                                {currentQuestion.topper_execution_logic && (
                                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4.5 space-y-2">
                                    <h4 className="text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                                      <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> Topper's Execution Logic & Pitfalls
                                    </h4>
                                    <p className="text-stone-200 text-xs leading-relaxed font-serif">
                                      <LatexText text={currentQuestion.topper_execution_logic} />
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Existing Option selections list for MCQ / AR
                          <div className="flex flex-col gap-4 shrink-0">
                            <div className="space-y-2">
                              <p className="text-stone-500 text-[9px] uppercase font-bold tracking-widest mb-1">
                                Select choice:
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2">
                                {Object.entries(currentQuestion.options || {}).map(([key, optionText]) => {
                                  const isSelected = selectedOption === key;
                                  const isCorrectOpt = key === currentQuestion.correct_option;
                                  
                                  let optionBg = 'bg-stone-900/40 border-white/5 hover:border-white/20 hover:bg-white/5 text-stone-200';
                                  let badgeBg = 'bg-stone-800 text-stone-400 border-white/5';
                                  let checkIcon = null;

                                  if (isSelected) {
                                    optionBg = 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200';
                                    badgeBg = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
                                  }

                                  if (isChecked) {
                                    optionBg = 'bg-stone-900/20 border-white/5 text-stone-500 cursor-not-allowed';
                                    
                                    if (isCorrectOpt) {
                                      optionBg = 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/20 cursor-not-allowed';
                                      badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                                      checkIcon = <Check className="w-4 h-4 text-emerald-400" />;
                                    } else if (isSelected) {
                                      optionBg = 'bg-rose-950/20 border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/20 cursor-not-allowed';
                                      badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                                      checkIcon = <X className="w-4 h-4 text-rose-400" />;
                                    }
                                  }

                                  return (
                                    <button
                                      key={key}
                                      onClick={() => handleSelectOption(key)}
                                      disabled={isChecked}
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left font-serif leading-relaxed text-xs md:text-sm transition-colors ${optionBg}`}
                                    >
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-sans font-bold border shrink-0 text-xs uppercase ${badgeBg}`}>
                                        {key}
                                      </span>
                                      <span className="flex-1">
                                        <LatexText text={optionText} />
                                      </span>
                                      {checkIcon && <div className="shrink-0">{checkIcon}</div>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Submit Action Button */}
                            {!isChecked && (
                              <div className="flex justify-end shrink-0 pt-2">
                                <button
                                  onClick={handleCheckAnswer}
                                  disabled={!selectedOption}
                                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    selectedOption
                                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-950/50'
                                      : 'bg-stone-800 text-stone-500 border border-stone-700/30 cursor-not-allowed'
                                  }`}
                                >
                                  <span>Check Answer</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                      {/* SLIDE-UP DRAWER OVERLAY INSIDE CARD */}
                      <AnimatePresence>
                        {isChecked && showTopperLogic && currentQuestion.format !== 'SUBJECTIVE' && (
                          <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="absolute bottom-0 left-0 right-0 z-30 bg-stone-950/98 border-t border-white/10 backdrop-blur-lg rounded-b-3xl p-5 flex flex-col max-h-[55%] shadow-2xl overflow-y-auto custom-scrollbar"
                          >
                            <div className="flex items-center justify-between shrink-0 mb-3 border-b border-white/5 pb-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-indigo-400" /> Explanation & Shortcuts
                              </span>
                              
                              <button
                                onClick={() => setShowTopperLogic(false)}
                                className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-colors"
                                title="Collapse Explanation"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-4 text-xs pr-1">
                              {/* Examiner Trap Banner */}
                              {currentQuestion.associated_trap_title && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-1.5">
                                  <h4 className="text-amber-400 font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Examiner's Trap: {currentQuestion.associated_trap_title}
                                  </h4>
                                  <div className="text-stone-300 explanation-text">
                                    {currentQuestion.logical_connector_test && (
                                      <p className="mb-1 italic text-stone-400">
                                        <strong>Connector Test:</strong> "{currentQuestion.logical_connector_test}"
                                      </p>
                                    )}
                                    <p>
                                      Watch out for the mathematical details. Choices are specifically constructed to catch common errors in binomial expansions, formula signs, or coordinate squaring.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Topper Secret Hack */}
                              {currentQuestion.topper_execution_logic && (
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-1.5">
                                  <h4 className="text-indigo-400 font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                    <Lightbulb className="w-3.5 h-3.5" /> Topper's Execution Logic
                                  </h4>
                                  <div className="text-stone-200 explanation-text">
                                    <LatexText text={currentQuestion.topper_execution_logic} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Small open button if collapsed */}
                      {isChecked && !showTopperLogic && currentQuestion.format !== 'SUBJECTIVE' && (
                        <button
                          onClick={() => setShowTopperLogic(true)}
                          className="absolute bottom-3 right-6 z-20 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-950/50"
                        >
                          <Lightbulb className="w-3 h-3" /> Show Explanation
                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-900/20 border border-white/5 rounded-3xl text-center">
                      <p className="text-stone-400 italic mb-4">No questions match the current selections.</p>
                      <button
                        onClick={() => {
                          setActiveFormat('ALL');
                          setActiveTypology('ALL');
                          setCurrentIndex(0);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}

                  {/* BOTTOM FOOTER: PREVIOUS / NEXT CONTROLS (Height restricted) */}
                  {!sessionFinished && filteredQuestions.length > 0 && (
                    <div className="h-14 shrink-0 flex items-center justify-between border-t border-white/5 mt-4">
                      <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`px-4 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                          currentIndex === 0
                            ? 'bg-stone-905 border-stone-850 text-stone-600 cursor-not-allowed'
                            : 'bg-white/5 border-white/5 text-stone-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                        Question {currentIndex + 1} of {filteredQuestions.length}
                      </div>

                      {currentIndex === filteredQuestions.length - 1 ? (
                        <button
                          onClick={handleFinishSession}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
                        >
                          Finish Session <Target className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="px-4 py-2 bg-white text-stone-900 hover:bg-white/90 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </main>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* FLOATING KEYBOARD SHORTCUTS IN THE BOTTOM RIGHT CORNER */}
      {!sessionFinished && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="bg-stone-900/95 border border-white/10 p-4.5 rounded-2xl shadow-2xl mb-2.5 w-64 backdrop-blur-md"
                onMouseEnter={() => setShowShortcuts(true)}
                onMouseLeave={() => setShowShortcuts(false)}
              >
                <h4 className="text-white font-extrabold text-[10px] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  ⌨️ Keyboard Shortcuts
                </h4>
                <div className="space-y-2 text-[10px] text-stone-400">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Option keys</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">1-4 / A-D</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Check / Continue</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">Space / Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Next question</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">→ / N</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Prev question</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">← / P</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span>Toggle focus mode</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">F</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle bookmark</span>
                    <kbd className="px-1.5 py-0.5 bg-stone-850 border border-stone-750 text-white rounded font-mono text-[9px]">B</kbd>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onMouseEnter={() => setShowShortcuts(true)}
            onMouseLeave={() => setShowShortcuts(false)}
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="bg-stone-900/80 hover:bg-stone-850 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-full flex items-center gap-2 text-xs text-stone-400 font-semibold shadow-xl transition-all hover:text-white"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Hotkeys</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default QuestionsPracticePage;
