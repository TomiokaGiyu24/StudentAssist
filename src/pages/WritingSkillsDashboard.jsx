import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenTool, CheckCircle, FileText, Megaphone, Calendar, ClipboardList, BarChart2 } from 'lucide-react';

const WritingSkillsDashboard = () => {
    const navigate = useNavigate();
    const { subjectId } = useParams();

    const skills = [
        {
            id: 'notice',
            title: 'Notice Writing',
            desc: 'Formal announcements for schools/public',
            icon: Megaphone,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 'analyticalparagraph',
            title: 'Analytical Paragraph',
            desc: 'Data interpretation & analysis',
            icon: BarChart2,
            color: 'from-pink-500 to-rose-600'
        },

        {
            id: 'letter',
            title: 'Letters',
            desc: 'Job Applications & Editor Letters',
            icon: FileText,
            color: 'from-emerald-500 to-teal-600'
        },
        {
            id: 'article',
            title: 'Article Writing',
            desc: 'Opinion pieces for newspapers/magazines',
            icon: PenTool,
            color: 'from-orange-500 to-red-600'
        },
        {
            id: 'report',
            title: 'Report Writing',
            desc: 'Factual accounts of events',
            icon: ClipboardList,
            color: 'from-cyan-500 to-blue-600'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 p-8 md:p-12 font-sans selection:bg-emerald-500/30">
            <header className="max-w-7xl mx-auto mb-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase">Creative Corner</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mt-4 mb-4 font-serif">
                        Writing Skills
                    </h1>
                    <p className="text-stone-400 text-lg max-w-2xl mb-8">
                        Master the formats. Every mark counts. Choose a module to perfect your structure and expression.
                    </p>

                    <button
                        onClick={() => navigate(`/subjects/english/writing/instructions`)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all text-stone-300 hover:text-white"
                    >
                        <ClipboardList size={20} />
                        <span className="font-bold text-sm">View General Guidelines</span>
                    </button>
                </motion.div>
            </header>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                {skills.map((skill) => (
                    <motion.div
                        key={skill.id}
                        variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 }
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-stone-900 border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all duration-300"
                        onClick={() => navigate(`/subjects/${subjectId || 'english'}/writing/${skill.id}`)}
                    >
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                        <div className="p-8 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-6 shadow-lg shadow-black/50 group-hover:scale-110 transition-transform`}>
                                <skill.icon size={24} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">{skill.title}</h2>
                            <p className="text-stone-400 text-sm mb-6">{skill.desc}</p>

                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                <span>Start Module</span>
                                <CheckCircle size={14} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default WritingSkillsDashboard;
