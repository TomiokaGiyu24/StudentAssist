import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subjects, chapters } from '../data/mockData';
import { chapterFileMap, loadChapterContent } from '../utils/contentLoader';

function ChapterSelectionPage() {
    const { subjectId } = useParams();

    const subject = subjects.find(s => s.id === subjectId);

    const [subjectChapters, setSubjectChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChapters() {
            setLoading(true);
            if (subjectId === 'mathematics') {
                const mathChapters = [];
                const mathMap = chapterFileMap['mathematics'];
                if (mathMap) {
                    for (const [id, path] of Object.entries(mathMap)) {
                        try {
                            const content = await loadChapterContent('mathematics', path);
                            if (content) {
                                mathChapters.push({
                                    id,
                                    name: content.chapter_name || id.replace(/-/g, ' '),
                                    difficulty: content.difficulty || 'Medium',
                                    weightage: content.weightage || '6-8 marks'
                                });
                            }
                        } catch (err) {
                            console.error(`Failed to load ${id}`, err);
                        }
                    }
                }
                setSubjectChapters(mathChapters);
            } else {
                setSubjectChapters(chapters[subjectId] || []);
            }
            setLoading(false);
        }

        if (subjectId) {
            fetchChapters();
        }
    }, [subjectId]);

    // Subject-specific gradients
    const subjectGradients = {
        physics: {
            primary: 'from-blue-500 to-indigo-600',
            light: 'from-blue-500/20 to-indigo-600/20',
            accent: 'text-indigo-400'
        },
        chemistry: {
            primary: 'from-emerald-500 to-teal-600',
            light: 'from-emerald-500/20 to-teal-600/20',
            accent: 'text-emerald-400'
        },
        mathematics: {
            primary: 'from-orange-500 to-red-600',
            light: 'from-orange-500/20 to-red-600/20',
            accent: 'text-orange-400'
        },
        biology: {
            primary: 'from-green-500 to-lime-600',
            light: 'from-green-500/20 to-lime-600/20',
            accent: 'text-green-400'
        },
        english: {
            primary: 'from-stone-800 to-rose-900',
            light: 'from-stone-500/10 to-rose-900/20',
            accent: 'text-rose-300'
        }
    };

    const gradient = subjectGradients[subjectId] || subjectGradients.physics;

    // Difficulty colors
    const difficultyConfig = {
        easy: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        hard: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' }
    };

    if (!subject) {
        return (
            <div className="min-h-screen bg-stone-950 flex items-center justify-center">
                <p className="text-white/60">Subject not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br ${gradient.light} rounded-full blur-3xl`}></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 container-app pt-6">
                <div className="flex items-center justify-between">
                    <Link to="/subjects" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">Back to Subjects</span>
                    </Link>

                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Lumina Logo" className="w-8 h-8 object-contain" />
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="relative z-10 container-app pt-12 pb-8">
                <div className="max-w-2xl">
                    {/* Subject Icon */}
                    <div className={`
            w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient.primary}
            flex items-center justify-center text-3xl mb-6 shadow-lg
            animate-fade-in
          `}>
                        {subject.icon}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3 animate-fade-in-up">
                        {subject.name}
                    </h1>
                    <p className="text-white/50 text-lg animate-fade-in-up-delay-1">
                        {subjectChapters.length} chapters • Select a chapter to begin studying
                    </p>
                </div>
            </header>

            {/* Chapters List */}
            <main className="relative z-10 container-app pb-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subjectChapters.map((chapter, index) => {
                            const difficulty = difficultyConfig[chapter.difficulty] || difficultyConfig.medium;

                            return (
                                <Link
                                    key={chapter.id}
                                    to={['english', 'mathematics'].includes(subjectId)
                                        ? `/subjects/${subjectId}/chapters/${chapter.id}/notes`
                                        : `/subjects/${subjectId}/chapters/${chapter.id}`
                                    }
                                    className="group block bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 
                         hover:bg-white/10 hover:border-white/20 transition-all duration-300
                         animate-fade-in-up"
                                    style={{
                                        animationDelay: `${index * 0.05}s`,
                                        opacity: 0
                                    }}
                                >
                                    <div className="flex items-center gap-5">
                                        {/* Chapter Number */}
                                        <div className={`
                    flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient.primary}
                    flex items-center justify-center text-white font-bold opacity-80
                    group-hover:opacity-100 group-hover:scale-105 transition-all duration-300
                  `}>
                                            {index + 1}
                                        </div>

                                        {/* Chapter Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-lg truncate group-hover:text-white/90 transition-colors">
                                                {chapter.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                {/* Weightage */}
                                                <span className={`text-sm ${gradient.accent}`}>
                                                    {chapter.weightage}% weightage
                                                </span>

                                                {/* Difficulty */}
                                                <span className={`text-xs px-2 py-0.5 rounded ${difficulty.bg} ${difficulty.color} ${difficulty.border} border`}>
                                                    {chapter.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <svg
                                            className="w-5 h-5 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${difficultyConfig.easy.bg}`}></span>
                        <span>Easy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${difficultyConfig.medium.bg}`}></span>
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${difficultyConfig.hard.bg}`}></span>
                        <span>Hard</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ChapterSelectionPage;
