import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, FileText, Sparkles, ArrowRight } from 'lucide-react';

const EnglishDashboard = () => {
    const navigate = useNavigate();
    const { subjectId: paramSubjectId } = useParams();
    const subjectId = paramSubjectId || 'english';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const modules = [
        {
            id: 'literature',
            title: 'Literature',
            subtitle: 'Flamingo & Vistas',
            description: 'Dive into the curated collection of prose and poetry with deep analysis.',
            icon: BookOpen,
            color: 'from-rose-500 to-orange-500',
            path: `/subjects/${subjectId}/literature`, // We will need to update App.jsx to point "literature" to the old chapter selection or similar
            delay: 0
        },
        {
            id: 'unseen',
            title: 'Unseen Passages',
            subtitle: 'Reading Comprehension',
            description: 'Master the art of decoding complex texts with guided practice.',
            icon: FileText,
            color: 'from-blue-500 to-cyan-500',
            path: `/subjects/${subjectId}/unseen`,
            delay: 0.1
        },
        {
            id: 'writing',
            title: 'Writing Skills',
            subtitle: 'Creative & Formal',
            description: 'Perfect your formats for Notices, Articles, and Reports.',
            icon: PenTool,
            color: 'from-emerald-500 to-teal-500',
            path: `/subjects/${subjectId}/writing`,
            delay: 0.2
        },
        {
            id: 'extracts',
            title: 'Extracts',
            subtitle: 'Coming Soon',
            description: 'Contextual questions and line-by-line breakdown.',
            icon: Sparkles,
            color: 'from-violet-500 to-purple-500',
            path: '#', // Placeholder
            isComingSoon: true,
            delay: 0.3
        }
    ];

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 p-8 md:p-12 font-sans selection:bg-rose-500/30">
            <header className="max-w-7xl mx-auto mb-16 md:mb-24 mt-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-rose-500 font-bold tracking-[0.2em] text-sm uppercase border-b border-rose-500 pb-1">
                        Class 12 English Core
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-stone-500 mt-6 mb-4 font-serif">
                        Mastery Hub
                    </h1>
                    <p className="text-stone-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Select a module to begin your journey designed for excelling in the board exams.
                    </p>
                </motion.div>
            </header>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {modules.map((module) => (
                    <motion.div
                        key={module.id}
                        variants={itemVariants}
                        className={`group relative overflow-hidden rounded-3xl bg-stone-900/50 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer ${module.isComingSoon ? 'opacity-70 grayscale' : ''}`}
                        onClick={() => !module.isComingSoon && navigate(module.path)}
                    >
                        {/* Interactive Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                        <div className="p-8 md:p-12 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 text-white group-hover:scale-110 transition-transform duration-500`}>
                                    <module.icon size={32} strokeWidth={1.5} />
                                </div>
                                {module.isComingSoon && (
                                    <span className="px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-[10px] uppercase tracking-widest font-bold text-stone-500">
                                        Coming Soon
                                    </span>
                                )}
                                {!module.isComingSoon && (
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                                        <ArrowRight size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 block group-hover:text-rose-500 transition-colors">
                                    {module.subtitle}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300 font-serif">
                                    {module.title}
                                </h2>
                                <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-md group-hover:text-stone-300 transition-colors">
                                    {module.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default EnglishDashboard;
