import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import NotesRenderer from '../components/NotesRenderer';
import PhysicalEducationRenderer from '../components/PhysicalEducationRenderer';
import EnglishRenderer from '../components/EnglishRenderer';
import EnglishPoemRenderer from '../components/EnglishPoemRenderer';
import FormulaSheet from '../components/FormulaSheet';
import GoldenLines from '../components/GoldenLines';
import PYQSection from '../components/PYQSection';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { loadChapterContent, getChapterFileSlug, loadPYQContent, hasPYQsAvailable, loadPracticeContent } from '../utils/contentLoader';
import { exportChapterToPDF } from '../utils/pdfExport';
import { subjects } from '../data/mockData';
import ChemistryRenderer from '../components/Chemistry/ChemistryRenderer';
import MathsRenderer from '../components/Maths/MathsRenderer';
import PhysicsRenderer from '../components/Physics/PhysicsRenderer';

function ChapterNotes() {
    const { subjectId, chapterId } = useParams();
    const [searchParams] = useSearchParams();
    const contentRef = useRef(null);
    const [chapterContent, setChapterContent] = useState(null);
    const [pyqContent, setPyqContent] = useState(null);
    const [practiceContent, setPracticeContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pyqLoading, setPyqLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEnglish = useParams().subjectId === 'english';
    const [activeSection, setActiveSection] = useState(searchParams.get('tab') || (isEnglish ? 'analysis' : 'notes'));
    const [exporting, setExporting] = useState(false);

    // Sync activeSection with URL param
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveSection(tab);
    }, [searchParams]);

    const subject = subjects.find(s => s.id === subjectId);
    const isPhysicalEducation = subjectId === 'physical-education';
    const isChemistry = subjectId === 'chemistry';
    const isMathematics = subjectId === 'mathematics';
    const isPhysics = subjectId === 'physics';
    const hasPyqs = hasPYQsAvailable(subjectId, chapterId);

    // Subject-specific gradients
    const subjectGradients = {
        physics: 'from-blue-500 to-indigo-600',
        chemistry: 'from-emerald-500 to-teal-600',
        mathematics: 'from-orange-500 to-red-600',
        biology: 'from-green-500 to-lime-600',
        'physical-education': 'from-amber-500 to-orange-600',
        english: 'from-stone-800 to-rose-900'
    };

    const gradient = subjectGradients[subjectId] || subjectGradients.physics;

    // Load chapter content
    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            setError(null);

            try {
                const fileSlug = getChapterFileSlug(subjectId, chapterId);
                const content = await loadChapterContent(subjectId, fileSlug);

                if (content) {
                    setChapterContent(content);
                } else {
                    setError('Chapter content not found');
                }
            } catch (err) {
                console.error('Error loading chapter:', err);
                setError('Failed to load chapter content');
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, [subjectId, chapterId]);

    // Load PYQ content when tab is activated or if it's Chemistry (which has its own tab management)
    useEffect(() => {
        async function fetchPyqs() {
            if ((activeSection === 'pyqs' || isChemistry || isMathematics) && hasPyqs && !pyqContent) {
                setPyqLoading(true);
                try {
                    const content = await loadPYQContent(subjectId, chapterId);
                    setPyqContent(content);
                } catch (err) {
                    console.error('Error loading PYQs:', err);
                } finally {
                    setPyqLoading(false);
                }
            }
        }

        fetchPyqs();
    }, [activeSection, subjectId, chapterId, hasPyqs, pyqContent, isChemistry]);

    // Get chapter name
    const isArrayContent = Array.isArray(chapterContent);
    const firstTopicMeta = isArrayContent ? chapterContent[0]?.meta : null;
    const chapterName = isArrayContent 
        ? (firstTopicMeta?.chapter_name || 'Chapter Notes')
        : (chapterContent?.meta?.chapter || chapterContent?.chapter || 'Chapter Notes');

    // Load Practice content for PE
    useEffect(() => {
        async function fetchPractice() {
            if (isPhysicalEducation && chapterId) {
                try {
                    const content = await loadPracticeContent('physical-education', chapterId);
                    setPracticeContent(content);
                } catch (err) {
                    console.error('Error loading practice questions:', err);
                }
            }
        }
        fetchPractice();
    }, [isPhysicalEducation, chapterId]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-950">
                <div className="container-app py-24">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4"></div>
                        <p className="text-white/50 text-sm">Loading notes...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !chapterContent) {
        return (
            <div className="min-h-screen bg-stone-950">
                <div className="container-app py-24">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">
                            Coming Soon
                        </h3>
                        <p className="text-white/50 text-sm mb-8">
                            Notes for this chapter are being prepared.
                        </p>
                        <Link
                            to={`/subjects/${subjectId}/chapters`}
                            className="inline-block px-6 py-3 bg-white text-stone-900 text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
                        >
                            Back to Chapters
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Aggregate arrays for formulas and golden lines if chapterContent is an array
    const allFormulas = isArrayContent ? chapterContent.flatMap(t => t.formula_sheet || []) : (chapterContent.formula_sheet || []);
    const allGoldenLines = isArrayContent ? chapterContent.flatMap(t => t.ncert_golden_lines || []) : (chapterContent.ncert_golden_lines || []);
    const hasNotes = isArrayContent ? chapterContent.some(t => t.notes?.length > 0) : chapterContent.notes?.length > 0;

    // Determine available sections
    const sections = isPhysicalEducation
        ? [{ id: 'notes', label: 'Study Notes', available: true }]
        : isEnglish
            ? [{ id: 'analysis', label: 'Analysis', available: true }]
            : [
                { id: 'notes', label: 'Notes', available: hasNotes },
                { id: 'formulas', label: 'Formulas', available: allFormulas.length > 0 },
                { id: 'golden', label: 'Key Lines', available: allGoldenLines.length > 0 },
                { id: 'pyqs', label: 'PYQs', available: hasPyqs }
            ].filter(s => s.available);



    return (
        <div className="min-h-screen bg-stone-950 relative overflow-hidden">
            {/* Background Elements */}
            {!isMathematics && (
                <div className="absolute inset-0">
                    <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
            )}

            {/* Navigation */}
            {!isMathematics && (
                <nav className="relative z-10 container-app pt-6">
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/subjects/${subjectId}/chapters`}
                            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm">Back to Chapters</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-stone-400">
                                {subject?.name}
                            </span>
                        </div>
                    </div>
                </nav>
            )}

            {/* Header */}
            {!isEnglish && !isChemistry && !isMathematics && (
                <header className="relative z-10 container-app pt-12 pb-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Badge */}
                        <div className="mb-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${gradient} rounded-full text-white text-xs font-medium`}>
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                {activeSection === 'pyqs' ? 'Previous Year Questions' : 'NCERT Notes'}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight animate-fade-in">
                            {chapterName}
                        </h1>
                    </div>
                </header>
            )}

            {/* Section Tabs */}
            {sections.length > 0 && !isEnglish && !isChemistry && !isMathematics && (
                <div className="relative z-10 container-app mb-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex gap-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10 overflow-x-auto">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`
                                        flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap
                                        ${activeSection === section.id
                                            ? 'bg-white text-stone-900 shadow-lg'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className={`relative z-10 pb-24 ${isEnglish || isChemistry || isMathematics ? 'w-full px-0' : 'container-app'}`}>
                <div ref={contentRef} className={isEnglish || isChemistry || isMathematics ? "w-full" : "max-w-3xl mx-auto"}>

                    {isChemistry && (
                        <div className="max-w-[1600px] mx-auto px-6 md:px-12 w-full pt-24 md:pt-32">
                            <ChemistryRenderer
                                content={chapterContent}
                                hasPyqs={hasPyqs}
                                pyqLoading={pyqLoading}
                                pyqContent={pyqContent}
                            />
                        </div>
                    )}

                    {isMathematics && (
                        <div className="w-full dark-katex">
                            <MathsRenderer
                                content={chapterContent}
                                hasPyqs={hasPyqs}
                                pyqLoading={pyqLoading}
                                pyqContent={pyqContent}
                            />
                        </div>
                    )}

                    {!isChemistry && !isMathematics && (activeSection === 'notes' || (isPhysicalEducation && ['formulas', 'practice', 'questions', 'playbook', 'traps'].includes(activeSection)) || (isEnglish && (activeSection === 'analysis' || activeSection === 'notes'))) && (
                        isPhysicalEducation ? (
                            <PhysicalEducationRenderer
                                content={chapterContent}
                                practiceContent={practiceContent}
                                initialTab={activeSection}
                            />
                        ) : isEnglish ? (
                            (chapterContent.para_to_para_meaning_simple || (chapterContent.chapter_meta?.genre && chapterContent.chapter_meta.genre.toLowerCase().includes('poem'))) ? (
                                <EnglishPoemRenderer content={chapterContent} />
                            ) : (
                                <EnglishRenderer content={chapterContent} />
                            )
                        ) : isPhysics && isArrayContent ? (
                            <PhysicsRenderer topics={chapterContent} />
                        ) : chapterContent.notes ? (
                            <NotesRenderer notes={chapterContent.notes} />
                        ) : null
                    )}

                    {activeSection === 'formulas' && allFormulas.length > 0 && !isPhysicalEducation && (
                        <FormulaSheet formulas={allFormulas} />
                    )}

                    {activeSection === 'golden' && allGoldenLines.length > 0 && !isPhysicalEducation && (
                        <GoldenLines lines={allGoldenLines} />
                    )}

                    {activeSection === 'pyqs' && (
                        pyqLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4"></div>
                                <p className="text-white/50 text-sm">Loading questions...</p>
                            </div>
                        ) : pyqContent?.questions ? (
                            <PYQSection
                                questions={pyqContent.questions}
                                meta={pyqContent.meta}
                            />
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-white/50">PYQs for this chapter are coming soon</p>
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* PDF Download Button - Floating & Dismissible */}
            {activeSection !== 'pyqs' && chapterContent && (
                <PDFDownloadButton
                    contentRef={contentRef}
                    filename={activeSection}
                    subjectName={subject?.name}
                    chapterName={chapterName || 'Chapter'}
                    onExport={() => exportChapterToPDF(chapterContent, subject?.name)}
                />
            )}
        </div>
    );
}

export default ChapterNotes;
