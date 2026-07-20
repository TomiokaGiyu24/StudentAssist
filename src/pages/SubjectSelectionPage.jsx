import { Link } from 'react-router-dom';
import { subjects } from '../data/mockData';

function SubjectSelectionPage() {
    // Subject card configurations with gradients
    const subjectConfigs = {
        physics: {
            gradient: 'from-blue-500 via-indigo-500 to-purple-600',
            shadowColor: 'shadow-blue-500/20',
            bgPattern: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            icon: '⚛️'
        },
        chemistry: {
            gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
            shadowColor: 'shadow-emerald-500/20',
            bgPattern: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
            icon: '🧪'
        },
        mathematics: {
            gradient: 'from-orange-500 via-red-500 to-pink-600',
            shadowColor: 'shadow-orange-500/20',
            bgPattern: 'radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)',
            icon: '📐'
        },
        biology: {
            gradient: 'from-green-500 via-lime-500 to-yellow-500',
            shadowColor: 'shadow-green-500/20',
            bgPattern: 'radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
            icon: '🧬'
        },
        english: {
            gradient: 'from-stone-700 via-rose-900 to-red-900',
            shadowColor: 'shadow-rose-900/20',
            bgPattern: 'radial-gradient(circle at 100% 0%, rgba(225, 29, 72, 0.2) 0%, transparent 60%)',
            icon: '✒️'
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                {/* Gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 container-app pt-6">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Lumina Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                        <span className="text-white font-semibold text-lg tracking-tight">
                            Lumina
                        </span>
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 container-app py-16 sm:py-24">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <span className="inline-block px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-white/60 text-sm border border-white/10 mb-6">
                        Choose Your Subject
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                        What do you want to
                        <br />
                        <span className="text-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            master today?
                        </span>
                    </h1>
                    <p className="mt-6 text-white/50 text-lg max-w-md mx-auto">
                        Select a subject to access chapter-wise notes, formulas, and questions.
                    </p>
                </div>

                {/* Subject Cards Grid */}
                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {subjects.map((subject, index) => {
                        const config = subjectConfigs[subject.id] || subjectConfigs.physics;

                        return (
                            <Link
                                key={subject.id}
                                to={subject.id === 'english' ? `/subjects/english/dashboard` : `/subjects/${subject.id}/chapters`}
                                className={`
                  group relative overflow-hidden rounded-2xl p-8
                  bg-white/5 backdrop-blur-sm border border-white/10
                  hover:border-white/20 transition-all duration-500
                  hover:-translate-y-2 hover:shadow-2xl ${config.shadowColor}
                  animate-fade-in-up
                `}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    opacity: 0
                                }}
                            >
                                {/* Background gradient */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: config.bgPattern }}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient}
                    flex items-center justify-center text-3xl mb-6
                    shadow-lg group-hover:scale-110 transition-transform duration-300
                  `}>
                                        {config.icon}
                                    </div>

                                    {/* Text */}
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                        {subject.name}
                                    </h2>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        {subject.tagline}
                                    </p>

                                    {/* Arrow */}
                                    <div className="mt-6 flex items-center gap-2 text-white/40 group-hover:text-white/80 transition-colors">
                                        <span className="text-sm font-medium">Explore chapters</span>
                                        <svg
                                            className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Decorative corner gradient */}
                                <div className={`
                  absolute -bottom-12 -right-12 w-32 h-32 rounded-full
                  bg-gradient-to-br ${config.gradient} opacity-20 blur-2xl
                  group-hover:opacity-40 group-hover:scale-150 transition-all duration-500
                `}></div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom tip */}
                <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <p className="text-white/30 text-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        All content aligned with CBSE 2025-26 syllabus
                    </p>
                </div>
            </main>
        </div>
    );
}

export default SubjectSelectionPage;
