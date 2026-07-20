import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, Search, GraduationCap, User, BookOpen } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if we are on the home page
    const isHome = location.pathname === '/';
    const isCreatorPage = location.pathname === '/creator';

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Back button logic: Show if not on home page
    const showBackButton = !isHome;

    const navLinks = [
        { name: 'Subjects', path: '/subjects', icon: BookOpen },
        { name: 'Mock Tests', path: '/mocks', icon: GraduationCap },
        { name: 'Creator', path: '/creator', icon: User },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHome
                        ? 'bg-stone-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg supports-[backdrop-filter]:bg-stone-950/60'
                        : 'bg-transparent'
                    }`}
            >
                <div className="container-app px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Side: Logo & Back Button */}
                        <div className="flex items-center gap-4">
                            {showBackButton && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                                    aria-label="Go Back"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                                    <span className="text-white font-bold text-lg leading-none">L</span>
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white">
                                    Lumina
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isHome && !isScrolled
                                            ? 'text-white/80 hover:text-white hover:bg-white/10'
                                            : 'text-stone-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-search-modal'))}
                                className={`ml-2 p-2 rounded-full transition-colors ${isHome && !isScrolled
                                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                                        : 'text-stone-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-search-modal'))}
                                className="mr-2 p-2 rounded-full transition-colors text-white/80 hover:bg-white/10"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg transition-colors text-white hover:bg-white/10"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-16 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl overflow-hidden md:hidden"
                    >
                        <div className="p-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <link.icon size={20} />
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
