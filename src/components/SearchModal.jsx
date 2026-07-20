import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Command } from 'lucide-react';
import { subjects, chapters } from '../data/mockData';

const SearchModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Toggle scroll lock when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const handleOpenEvent = () => setIsOpen(true);
        window.addEventListener('open-search-modal', handleOpenEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-search-modal', handleOpenEvent);
        };
    }, []);

    // Aggregate all searchable items
    const allItems = useMemo(() => {
        let items = [];

        // Add Subjects
        subjects.forEach(subject => {
            items.push({
                type: 'subject',
                id: subject.id,
                title: subject.name,
                subtitle: 'Subject',
                icon: subject.icon,
                path: `/subjects/${subject.id === 'english' ? 'english/dashboard' : `${subject.id}/chapters`}`,
                color: subject.color
            });
        });

        // Add Chapters
        Object.entries(chapters).forEach(([subjectId, subjectChapters]) => {
            const subjectName = subjects.find(s => s.id === subjectId)?.name || subjectId;
            const subjectIcon = subjects.find(s => s.id === subjectId)?.icon || '📚';

            subjectChapters.forEach(chapter => {
                let path = `/subjects/${subjectId}/chapters/${chapter.id}`;
                if (subjectId === 'english') {
                    path = `/subjects/english/chapters/${chapter.id}/notes`;
                }

                items.push({
                    type: 'chapter',
                    id: chapter.id,
                    title: chapter.name,
                    subtitle: `${subjectName} • ${chapter.difficulty}`,
                    icon: subjectIcon,
                    path: path,
                    subjectId: subjectId
                });
            });
        });

        return items;
    }, []);

    // Filter results
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return allItems.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.subtitle.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Limit to 5 results for clean UI
    }, [query, allItems]);

    // Handle selection
    const handleSelect = (item) => {
        navigate(item.path);
        setIsOpen(false);
        setQuery('');
    };

    // Keyboard navigation for results
    useEffect(() => {
        const handleNavigation = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, results, selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl bg-[#0c0a09] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="flex items-center px-4 py-4 border-b border-white/5 gap-3">
                                <Search className="w-5 h-5 text-stone-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search chapters, subjects..."
                                    className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-stone-600 font-medium"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-stone-500 font-mono">
                                        <span className="text-[10px]">ESC</span>
                                    </kbd>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {results.length > 0 ? (
                                    <div className="space-y-1">
                                        <div className="px-3 py-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                                            Suggested
                                        </div>
                                        {results.map((item, index) => (
                                            <motion.button
                                                key={`${item.type}-${item.id}`}
                                                layout
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group ${selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white/5 ${selectedIndex === index ? 'bg-white/10 scale-110' : ''} transition-all`}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-medium truncate ${selectedIndex === index ? 'text-white' : 'text-stone-300'}`}>
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-stone-500 truncate">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                                {selectedIndex === index && (
                                                    <ChevronRight className="w-4 h-4 text-white/50 animate-pulse" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : query ? (
                                    <div className="py-12 text-center">
                                        <p className="text-stone-500">No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-stone-600 text-sm">Type to search for any chapter...</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {results.length > 0 && (
                                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-stone-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/10">↵</kbd>
                                            to select
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/10">↑</kbd>
                                            <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/10">↓</kbd>
                                            to navigate
                                        </span>
                                    </div>
                                    <span>Lumina Search</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
