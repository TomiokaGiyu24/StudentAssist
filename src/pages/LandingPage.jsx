import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { 
    Search, BookOpen, Brain, Target, Sparkles, ArrowUpRight, 
    Zap, ShieldAlert, Award, FileText, BarChart3, HelpCircle, GraduationCap
} from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// --- Subcomponents for Extreme Aesthetic ---

// 1. Interactive Canvas Particle Mesh Background
const InteractiveCanvasBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 10;
                this.vx = (Math.random() * 0.4) - 0.2;
                this.vy = (Math.random() * 0.4) - 0.2;
            }

            draw() {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.45)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Free movement
                this.x += this.vx;
                this.y += this.vy;

                // Screen boundaries rebound
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                // Mouse interaction (push away)
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        
                        this.x -= directionX * force * 5;
                        this.y -= directionY * force * 5;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        // Connect particles with thin lines
        const connectParticles = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        const alpha = (120 - distance) / 120 * 0.15;
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw a subtle coordinate grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 0.5;
            const gridSpacing = 80;
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Update & Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-85"
        />
    );
};

// 2. Magnetic Button
const MagneticButton = ({ children, className, onClick }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        if (!ref.current) return;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;
    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.1 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};

// 3. 3D Tilt Card with Dynamic Mouse Glare Sheen
const TiltCard = ({ children, className }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

    const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);

        setGlarePosition({
            x: (mouseX / width) * 100,
            y: (mouseY / height) * 100,
            opacity: 0.15
        });
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setGlarePosition(prev => ({ ...prev, opacity: 0 }));
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
            className={`relative w-full h-full ${className}`}
        >
            {/* Dynamic Glare Overlay */}
            <div 
                className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.25) 0%, transparent 60%)`,
                    opacity: glarePosition.opacity
                }}
            />
            <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d", WebkitFontSmoothing: "antialiased" }} className="w-full h-full will-change-transform">
                {children}
            </div>
        </motion.div>
    );
};

// 4. Typewriter Placeholder for Search Bar
const TypewriterPlaceholder = () => {
    const phrases = [
        "Search for 'Faraday's Law'...",
        "Look up 'Organic Mechanisms'...",
        "Find examiner intent in 'EM Induction'...",
        "Explore chapter mocks for 'Alternating Current'...",
        "Check Letter formatting toppers secrets..."
    ];
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timer;
        const currentPhrase = phrases[currentPhraseIndex];

        if (isDeleting) {
            timer = setTimeout(() => {
                setCurrentText(currentPhrase.substring(0, currentText.length - 1));
                if (currentText.length === 0) {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }, 30);
        } else {
            timer = setTimeout(() => {
                setCurrentText(currentPhrase.substring(0, currentText.length + 1));
                if (currentText.length === currentPhrase.length) {
                    timer = setTimeout(() => setIsDeleting(true), 2500);
                }
            }, 50);
        }

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentPhraseIndex]);

    return (
        <span className="text-sm sm:text-lg md:text-xl text-stone-400 group-hover:text-stone-300 font-mono tracking-tight transition-colors">
            {currentText}
            <span className="inline-block w-2 h-4 sm:h-5 ml-1 bg-violet-500 rounded-sm animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] group-hover:bg-purple-400 align-middle -mt-1"></span>
        </span>
    );
};

// --- MAIN LANDING PAGE COMPONENT ---
export default function LandingPage() {
    const containerRef = useRef(null);

    // Custom Cursor Spotlight Tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Typography stagger animations
    const titleWords = ["Phenomenal.", "High-Yield.", "Class 12th", "Engine."];
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };
    const wordVariants = {
        hidden: { opacity: 0, y: 40, rotateX: -30 },
        visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    // --- Interactive Study Engine Previewer State ---
    const [activeTab, setActiveTab] = useState('physics');
    
    // Physics Sub-States
    const [isTrapRevealed, setIsTrapRevealed] = useState(false);
    
    // Chemistry Sub-States
    const [isChemistrySplit, setIsChemistrySplit] = useState(false);

    // English Sub-States
    const [hoveredLetterSection, setHoveredLetterSection] = useState(null);

    const letterSections = {
        sender: {
            title: "Sender's Address",
            note: "Positioned at the absolute top-left. Write it in 2-3 lines. Do NOT write your name or email inside the address block.",
            marks: "1 Mark (Format Alignment)"
        },
        date: {
            title: "Date block",
            note: "Always expand fully: '1st June 2026' or 'June 1, 2026'. Mismatches like '01/06/2026' or '01-06-26' are strict board trap zones.",
            marks: "Topper standard format"
        },
        receiver: {
            title: "Receiver's Address",
            note: "Start with designation (e.g. 'The Editor', 'The Director'), then the official address in 2-3 lines.",
            marks: "1 Mark (Format block)"
        },
        subject: {
            title: "Subject Line",
            note: "Must be brief (4-6 words), exceptionally clear, and underlined. Captures examiner attention instantly.",
            marks: "Core Content Anchor"
        },
        body: {
            title: "Body Paragraphs",
            note: "Divide into exactly 3 paragraphs: Para 1 (Brief introduction of purpose), Para 2 (Comprehensive details/problems), Para 3 (Formal conclusion/thanks/expected action).",
            marks: "3 Marks (Content & Expression)"
        },
        subscription: {
            title: "Formal Sign-off",
            note: "Use 'Yours faithfully' or 'Yours sincerely'. Board Trap: Do NOT capitalize the 'f' or 's' (write 'faithfully', not 'Faithfully').",
            marks: "Closing conformity"
        }
    };

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#000000] text-stone-200 overflow-hidden font-sans selection:bg-violet-500/30">

            {/* --- 1. Ambient Background Orbs & Interactive Particle Mesh --- */}
            <InteractiveCanvasBackground />
            
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: ['-10%', '15%', '-10%'],
                        y: ['-15%', '15%', '-15%'],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-[-10%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-violet-950/20 blur-[130px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        x: ['15%', '-10%', '15%'],
                        y: ['15%', '-10%', '15%'],
                        scale: [1.1, 0.95, 1.1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-indigo-950/20 blur-[140px] mix-blend-screen"
                />
            </div>

            {/* Dynamic Cursor Spotlight Radial Mask */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-0 opacity-60 transition-opacity duration-500 hidden md:block"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(900px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.20), rgba(59, 130, 246, 0.04), transparent 45%)`
                    ),
                    mixBlendMode: 'screen'
                }}
            />
            {/* Deep static gradient veil */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#020205]/0 via-[#000000]/70 to-[#000000] pointer-events-none" />
            <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* --- 2. Hero Section (Visual Typography & Interactive Search) --- */}
            <section className="relative z-10 w-full min-h-[105vh] flex flex-col items-center justify-center px-4 pt-12 sm:pt-24 overflow-hidden">
                
                {/* Board Status Pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mb-8 sm:mb-10 px-5 py-2.5 rounded-full border border-violet-500/10 bg-violet-950/5 backdrop-blur-xl flex items-center gap-3 shadow-[0_4px_24px_rgba(139,92,246,0.05)]"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-400 relative">
                        <div className="absolute inset-0 bg-violet-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-violet-300 font-semibold font-mono">CBSE 2026 Elite Engine</span>
                </motion.div>

                {/* Massive Styled Typography */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center max-w-5xl mx-auto text-center gap-x-3 sm:gap-x-5 gap-y-2 sm:gap-y-4 mb-6 sm:mb-8 perspective-[1200px]"
                >
                    <div className="flex flex-wrap justify-center w-full px-2 sm:px-4">
                        {titleWords.map((word, i) => (
                            <motion.span
                                key={i}
                                variants={wordVariants}
                                className={`text-[12vw] sm:text-7xl md:text-8xl lg:text-[9.5rem] leading-[0.85] sm:leading-[0.9] tracking-tighter ${word === "High-Yield."
                                    ? "font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-violet-400 via-indigo-400 to-cyan-400 pr-2 sm:pr-0"
                                    : "font-black text-white"
                                    }`}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-stone-400 text-sm sm:text-base md:text-lg max-w-2xl text-center mb-10 sm:mb-14 font-light tracking-wide px-4"
                >
                    Designed strictly for Class 12th board aspirants. Cut out the noise. Experience notes, formulas, and mock engines filtered by high-yield scoring vectors.
                </motion.p>

                {/* Shimmering Glassmorphic Command Search Trigger */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 100 }}
                    className="w-full max-w-2xl group perspective-[1000px] z-50 relative px-4 sm:px-0"
                >
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 rounded-[2.2rem] blur-xl opacity-35 transition duration-1000 group-hover:opacity-50 pointer-events-none"></div>

                    <MagneticButton
                        onClick={() => window.dispatchEvent(new CustomEvent('open-search-modal'))}
                        className="relative w-full overflow-hidden rounded-[1.8rem] bg-black/80 border border-white/10 backdrop-blur-3xl p-4 sm:p-5 md:p-6 flex items-center justify-between gap-4 sm:gap-6 transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.6)] cursor-pointer pointer-events-auto"
                    >
                        {/* Interactive Shimmer Sweep */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent group-hover:animate-[shimmer_2s_linear_infinite]" />

                        <div className="flex items-center gap-4 sm:gap-5 flex-1 w-full relative z-10">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 group-hover:scale-105 group-hover:text-violet-200 transition-transform duration-300 shadow-inner">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            <div className="flex-1 text-left flex items-center">
                                <TypewriterPlaceholder />
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-400 font-mono tracking-widest font-bold text-xs shadow-inner group-hover:text-stone-200 transition-colors shrink-0 z-10">
                            COMMAND + K
                        </div>
                    </MagneticButton>
                </motion.div>

                {/* Hero Primary Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-10 sm:mt-12 z-50 relative px-4 sm:px-0 w-full sm:w-auto"
                >
                    <Link to="/subjects" className="w-full sm:w-auto overflow-hidden relative group rounded-full p-[1px]">
                        <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <div className="w-full sm:w-auto relative flex items-center justify-center gap-3 px-10 py-4 bg-black/90 backdrop-blur-xl rounded-full border border-white/10 group-hover:bg-black/40 transition-colors duration-300">
                            <BookOpen className="w-4 h-4 text-violet-300 group-hover:text-white transition-colors" />
                            <span className="font-semibold text-stone-300 group-hover:text-white tracking-wider text-sm transition-colors uppercase">Subjects Library</span>
                        </div>
                    </Link>

                    <Link to="/mocks" className="w-full sm:w-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-300"></div>
                        <div className="w-full sm:w-auto relative flex items-center justify-center gap-3 px-10 py-4 bg-white text-black rounded-full font-semibold transition-transform duration-300 group-hover:scale-[1.02] shadow-[0_4px_30px_rgba(255,255,255,0.15)]">
                            <Brain className="w-4 h-4 text-black" />
                            <span className="tracking-wider text-sm uppercase">Mock Arenas</span>
                            <ArrowUpRight className="w-4.5 h-4.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </Link>
                </motion.div>
            </section>

            {/* --- 3. Live Interactive Showcase Dashboard (The 12th Study Engine Previewer) --- */}
            <section className="relative z-10 py-20 sm:py-32 px-4 border-t border-white/5 bg-[#020204]">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full text-violet-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 border border-violet-500/20">
                            Live Capability Showcase
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500 tracking-tighter mb-4 sm:mb-6">
                            Interact with the Engine.
                        </h2>
                        <p className="text-stone-400 text-base sm:text-lg max-w-xl mx-auto font-light">
                            Discover the pedagogical architecture built directly inside our database. Click the tabs below to test live features.
                        </p>
                    </motion.div>

                    {/* Interactive Showcase Panel */}
                    <div className="w-full bg-[#050508]/85 border border-white/10 rounded-[2.2rem] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                        {/* Interactive Tabs Menu */}
                        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-full max-w-lg mb-8 sm:mb-12 relative z-10 shrink-0">
                            <button
                                onClick={() => { setActiveTab('physics'); setIsTrapRevealed(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'physics' ? 'bg-violet-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                            >
                                <Zap className="w-4 h-4" />
                                <span>Physics Engine</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('chemistry'); setIsChemistrySplit(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'chemistry' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Chemistry Lab</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('english'); setHoveredLetterSection(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'english' ? 'bg-rose-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>English Workshop</span>
                            </button>
                        </div>

                        {/* Showcase Display Area */}
                        <div className="w-full relative z-10 min-h-[360px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                
                                {/* PHYSICS INTERACTIVE SHOWCASE */}
                                {activeTab === 'physics' && (
                                    <motion.div
                                        key="physics"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between"
                                    >
                                        <div className="flex-1 flex flex-col justify-between p-2">
                                            <div>
                                                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold">Chapter 6 • Electromagnetic Induction</span>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 tracking-tight">Faraday's Law of Induction</h3>
                                                <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-6 font-light">
                                                    Our physics database splits complex derivations and equations into highly transparent, examiner-compliant structures. Hovering or clicking reveals direct traps designed by board examiners.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setIsTrapRevealed(!isTrapRevealed)}
                                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                                                    isTrapRevealed 
                                                        ? 'bg-rose-600/10 border-rose-500/30 text-rose-300 hover:bg-rose-600/20' 
                                                        : 'bg-white text-black border-transparent hover:bg-stone-200'
                                                }`}
                                            >
                                                <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
                                                <span>{isTrapRevealed ? "Deactivate Warning Systems" : "Simulate Board Trap Activation"}</span>
                                            </button>
                                        </div>

                                        {/* Virtual Note Render Card */}
                                        <div className="flex-1 rounded-[1.8rem] bg-black/60 border border-white/5 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 select-none">
                                            {isTrapRevealed && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.06),_transparent_60%)] pointer-events-none border border-rose-500/20 rounded-[inherit]"
                                                />
                                            )}

                                            <div>
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-[10px] font-mono text-stone-500 tracking-wider uppercase">NCERT Notes Card v7.3</span>
                                                    {isTrapRevealed ? (
                                                        <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                                            Trap Detected
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded bg-white/5 text-[9px] font-mono text-stone-400 uppercase tracking-wider">
                                                            Formula Sheet
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Styled LaTeX container */}
                                                <div className={`p-6 rounded-2xl bg-white/[0.02] border transition-colors duration-500 flex items-center justify-center select-all dark-katex ${isTrapRevealed ? 'border-rose-500/20 bg-rose-950/5' : 'border-white/5'}`}>
                                                    <BlockMath math="\mathcal{E} = -N\frac{d\Phi_{B}}{dt}" />
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <AnimatePresence mode="wait">
                                                    {!isTrapRevealed ? (
                                                        <motion.div
                                                            key="normal"
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -5 }}
                                                            className="text-stone-500 text-xs font-mono leading-relaxed"
                                                        >
                                                            * Symbols: <InlineMath math="\mathcal{E}" /> = induced EMF (V), <InlineMath math="N" /> = number of turns, <InlineMath math="d\Phi_B/dt" /> = rate of change of magnetic flux (Wb/s).
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="traps"
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex flex-col gap-4 text-xs font-mono text-rose-300"
                                                        >
                                                            <div className="flex gap-2 items-start bg-rose-950/10 p-3 rounded-lg border border-rose-500/10">
                                                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold shrink-0 mt-0.5">TRAP A</span>
                                                                <p className="leading-relaxed">
                                                                    Examiner states: "A strong bar magnet is placed **stationary** inside a multi-turn coil." The trap is claiming high EMF. Correct: since velocity is 0, <InlineMath math="d\Phi/dt = 0" />, so EMF is **strictly 0**.
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2 items-start bg-rose-950/10 p-3 rounded-lg border border-rose-500/10">
                                                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold shrink-0 mt-0.5">TRAP B</span>
                                                                <p className="leading-relaxed">
                                                                    Students omit the negative sign in conceptual statements. The negative sign represents **Lenz's Law** (conservation of energy) and is mandatory for full marks.
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* CHEMISTRY INTERACTIVE SHOWCASE */}
                                {activeTab === 'chemistry' && (
                                    <motion.div
                                        key="chemistry"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between"
                                    >
                                        <div className="flex-1 flex flex-col justify-between p-2">
                                            <div>
                                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Chapter 9 • Coordination Compounds</span>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 tracking-tight">Crystal Field Splitting Theory</h3>
                                                <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-6 font-light">
                                                    Observe degenerate metal d-orbitals split into higher energy <InlineMath math="e_g" /> and lower energy <InlineMath math="t_{2g}" /> subgroups under an octahedral coordination field. Our dynamic Chemistry components bring concepts to life.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setIsChemistrySplit(!isChemistrySplit)}
                                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                                                    isChemistrySplit 
                                                        ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20' 
                                                        : 'bg-white text-black border-transparent hover:bg-stone-200'
                                                }`}
                                            >
                                                <Sparkles className="w-4.5 h-4.5" />
                                                <span>{isChemistrySplit ? "Regenerate Orbitals (Free State)" : "Apply Octahedral Ligand Field"}</span>
                                            </button>
                                        </div>

                                        {/* Interactive Crystal Field Splitting Canvas/Box */}
                                        <div className="flex-1 rounded-[1.8rem] bg-black/60 border border-white/5 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 select-none min-h-[300px]">
                                            {isChemistrySplit && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.04),_transparent_60%)] pointer-events-none border border-emerald-500/20 rounded-[inherit]"
                                                />
                                            )}

                                            <div className="flex items-center justify-between mb-8">
                                                <span className="text-[10px] font-mono text-stone-500 tracking-wider uppercase">CFT Simulator v9.1</span>
                                                <span className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider font-bold border transition-colors ${
                                                    isChemistrySplit 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse' 
                                                        : 'bg-white/5 border-transparent text-stone-400'
                                                }`}>
                                                    {isChemistrySplit ? "Split Octahedral Field" : "Degenerate d-Orbitals"}
                                                </span>
                                            </div>

                                            {/* CFT Splitting Diagram Container */}
                                            <div className="relative h-48 flex items-center justify-center">
                                                {!isChemistrySplit ? (
                                                    // Degenerate State
                                                    <motion.div 
                                                        key="degenerate"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="flex gap-2"
                                                    >
                                                        {['d_xy', 'd_yz', 'd_xz', 'd_x2-y2', 'd_z2'].map(orb => (
                                                            <div key={orb} className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center shadow-inner relative group">
                                                                <span className="text-[9px] sm:text-xs text-white font-bold font-mono">{orb.replace('d_', '')}</span>
                                                                <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 text-[8px] text-stone-500 font-mono transition-opacity duration-200 uppercase">Degenerate</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                ) : (
                                                    // Split State
                                                    <motion.div 
                                                        key="split"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="w-full h-full flex flex-col justify-between py-2 relative"
                                                    >
                                                        {/* Upper e_g level */}
                                                        <div className="flex justify-end gap-3 pr-8 relative">
                                                            <div className="absolute left-8 bottom-0 text-[10px] text-emerald-400 font-mono font-bold tracking-widest">e_g level (+0.6 Δ_o)</div>
                                                            {['d_x2-y2', 'd_z2'].map(orb => (
                                                                <motion.div 
                                                                    initial={{ y: 20, opacity: 0 }} 
                                                                    animate={{ y: 0, opacity: 1 }} 
                                                                    key={orb} 
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 border border-emerald-500/30 rounded-xl bg-emerald-500/5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                                >
                                                                    <span className="text-[9px] sm:text-xs text-emerald-300 font-bold font-mono">{orb.replace('d_', '')}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        {/* Central energy line (Barycenter) */}
                                                        <div className="w-full h-[1px] border-t border-dashed border-white/10 flex items-center justify-center relative">
                                                            <span className="px-2 py-0.5 rounded bg-[#09090d] border border-white/5 text-[8px] font-mono text-stone-500 uppercase tracking-widest -mt-[1px]">Barycenter</span>
                                                            {/* Vertical Splitting Energy Δ_o Arrow representation */}
                                                            <div className="absolute left-40 -top-8 bottom-[-24px] w-[1px] bg-emerald-500/30 flex flex-col justify-between items-center hidden sm:flex">
                                                                <span className="text-[8px] text-emerald-400 font-mono -mt-4 font-bold">Δ_o</span>
                                                                <span className="text-[8px] text-emerald-400 font-mono -mb-4 font-bold"></span>
                                                            </div>
                                                        </div>

                                                        {/* Lower t_2g level */}
                                                        <div className="flex justify-start gap-3 pl-8 relative">
                                                            <div className="absolute right-8 top-0 text-[10px] text-teal-400 font-mono font-bold tracking-widest">t_2g level (-0.4 Δ_o)</div>
                                                            {['d_xy', 'd_yz', 'd_xz'].map(orb => (
                                                                <motion.div 
                                                                    initial={{ y: -20, opacity: 0 }} 
                                                                    animate={{ y: 0, opacity: 1 }} 
                                                                    key={orb} 
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 border border-teal-500/30 rounded-xl bg-teal-500/5 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                                                >
                                                                    <span className="text-[9px] sm:text-xs text-teal-300 font-bold font-mono">{orb.replace('d_', '')}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="text-[10px] font-mono text-stone-500 mt-6 leading-relaxed">
                                                {isChemistrySplit 
                                                    ? "* CFT explains coordination color and magnetic properties: lower-energy levels fill first. Strong field ligands cause larger splitting Δ_o, resulting in low-spin complexes."
                                                    : "* In free metal ions, all five d-orbitals are degenerate (possess the exact same energy levels). Ligand approach breaks this symmetry."}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ENGLISH INTERACTIVE SHOWCASE */}
                                {activeTab === 'english' && (
                                    <motion.div
                                        key="english"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-between"
                                    >
                                        <div className="flex-1 flex flex-col justify-between p-2">
                                            <div>
                                                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Writing Section • Formal Letter</span>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 tracking-tight">Formal Letter Layout Blueprint</h3>
                                                <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-6 font-light">
                                                    Format errors are the fastest way to lose marks in CBSE English Writing Section. Hover over each block of our formal letter blueprint to reveal topper standard layout tips and examiner scoring criteria.
                                                </p>
                                            </div>

                                            {/* Details indicator panel */}
                                            <div className="min-h-[100px] border border-rose-500/20 bg-rose-950/5 rounded-xl p-4 flex flex-col justify-center">
                                                {hoveredLetterSection ? (
                                                    <motion.div 
                                                        key={hoveredLetterSection} 
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="font-mono text-xs text-rose-200"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-bold text-rose-400 uppercase text-xs sm:text-sm tracking-tight">{letterSections[hoveredLetterSection].title}</h5>
                                                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300 border border-rose-500/30 uppercase">{letterSections[hoveredLetterSection].marks}</span>
                                                        </div>
                                                        <p className="leading-relaxed text-stone-400 font-sans">{letterSections[hoveredLetterSection].note}</p>
                                                    </motion.div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 text-stone-500 text-xs sm:text-sm font-mono italic">
                                                        <HelpCircle className="w-4 h-4 animate-bounce" />
                                                        <span>Hover over the letter blocks on the right</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mock Interactive Letter Box */}
                                        <div className="flex-1 rounded-[1.8rem] bg-black/60 border border-white/5 p-6 sm:p-8 flex flex-col gap-2 relative overflow-hidden transition-all duration-500 justify-center">
                                            <div className="text-[10px] font-mono text-stone-500 mb-4 tracking-wider uppercase flex justify-between">
                                                <span>CBSE format layout</span>
                                                <span>interactive letter</span>
                                            </div>

                                            {/* Hoverable letter elements */}
                                            <div className="flex flex-col gap-1.5 font-mono text-[9px] sm:text-xs">
                                                
                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('sender')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-3 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all ${hoveredLetterSection === 'sender' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01]' : 'text-stone-400'}`}
                                                >
                                                    Sender's Address block (2-3 lines)
                                                </div>

                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('date')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-2 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all ${hoveredLetterSection === 'date' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01]' : 'text-stone-400'}`}
                                                >
                                                    Date (expanded format: June 1, 2026)
                                                </div>

                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('receiver')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-3 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all ${hoveredLetterSection === 'receiver' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01]' : 'text-stone-400'}`}
                                                >
                                                    Receiver's Address block (designation + address)
                                                </div>

                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('subject')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-2 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all ${hoveredLetterSection === 'subject' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01] font-bold underline' : 'text-stone-400'}`}
                                                >
                                                    Subject: 4-6 Words Underlined Core statement
                                                </div>

                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('body')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-4 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all leading-relaxed ${hoveredLetterSection === 'body' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01]' : 'text-stone-400'}`}
                                                >
                                                    Body Paragraphs (Para 1: Intro, Para 2: Details, Para 3: Action/Closing)
                                                </div>

                                                <div 
                                                    onMouseEnter={() => setHoveredLetterSection('subscription')}
                                                    onMouseLeave={() => setHoveredLetterSection(null)}
                                                    className={`p-2 rounded-lg border border-white/5 bg-white/[0.02] cursor-crosshair transition-all ${hoveredLetterSection === 'subscription' ? 'border-rose-500/40 bg-rose-500/5 text-rose-200 scale-[1.01]' : 'text-stone-400'}`}
                                                >
                                                    Subscription block (Yours faithfully / sincerely)
                                                </div>

                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. High-Yield Feature Sections (Scroll Velvet & Dynamic Cards) --- */}
            <section className="relative z-10 py-24 sm:py-36 px-4 border-t border-white/5 bg-[#000000]">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-15%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center mb-16 sm:mb-28"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full text-violet-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 border border-violet-500/20">
                            Beyond Static Notes
                        </span>
                        <h2 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-600 tracking-tighter mb-6 leading-[1.05] sm:leading-[1.1]">
                            Shaped by Analytics.<br />Presented in the Void.
                        </h2>
                        <p className="text-stone-500 text-lg sm:text-xl font-serif italic max-w-2xl mx-auto font-light leading-relaxed">
                            No distraction-heavy elements. Only pristine layouts built to highlight core CBSE board intents.
                        </p>
                    </motion.div>

                    {/* --- Interactive Cards Grid --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">

                        {/* Card 1: Crystalline Notes */}
                        <div className="h-auto min-h-[400px] sm:h-[480px] perspective-[1500px]">
                            <TiltCard className="rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-[#0c0c10] to-[#040406] overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col z-10">
                                    <BookOpen className="w-10 h-10 text-violet-400 mb-6 sm:mb-10 opacity-90 transition-transform group-hover:scale-110 duration-300" />
                                    <h3 className="text-2xl sm:text-3.5xl font-bold text-white mb-3 sm:mb-5 tracking-tight leading-none">Crystalline Notes</h3>
                                    <p className="text-stone-400 text-sm sm:text-lg leading-relaxed mb-6 max-w-sm font-light">
                                        High-yield theory notes filtered through a decade of CBSE past papers. Concise, exam-centric, and structured to optimize recall.
                                    </p>

                                    <Link to="/subjects" className="mt-auto inline-flex items-center gap-2.5 text-violet-300 font-semibold hover:text-white transition-colors text-sm sm:text-base tracking-wider uppercase">
                                        <span>Browse Subjects</span> 
                                        <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-600/10 transition-colors duration-1000"></div>

                                {/* Floating Mock UI Preview */}
                                <div style={{ transform: "translateZ(40px)" }} className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 w-60 sm:w-80 h-44 sm:h-56 bg-black/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-2xl opacity-40 sm:opacity-60 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className="w-16 h-3 bg-white/10 rounded-full"></div>
                                        <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                                            <Award className="w-4 h-4 text-violet-300" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="w-full h-4 bg-white/5 rounded-full"></div>
                                        <div className="w-5/6 h-4 bg-white/5 rounded-full"></div>
                                    </div>
                                    <div className="w-full h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full mt-6"></div>
                                </div>
                            </TiltCard>
                        </div>

                        {/* Card 2: Examiner Intent (Interactive PYQs) */}
                        <div className="h-auto min-h-[400px] sm:h-[480px] perspective-[1500px]">
                            <TiltCard className="rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-[#0c0c10] to-[#040406] overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col z-10">
                                    <Target className="w-10 h-10 text-cyan-400 mb-6 sm:mb-10 opacity-90 transition-transform group-hover:scale-110 duration-300" />
                                    <h3 className="text-2xl sm:text-3.5xl font-bold text-white mb-3 sm:mb-5 tracking-tight leading-none">Examiner Intent</h3>
                                    <p className="text-stone-400 text-sm sm:text-lg leading-relaxed mb-6 max-w-sm font-light">
                                        Don't just read old questions—face them actively. Reveal board-style model answers, caution tags, and marking breakdowns with one click.
                                    </p>

                                    <Link to="/subjects" className="mt-auto inline-flex items-center gap-2.5 text-cyan-300 font-semibold hover:text-white transition-colors text-sm sm:text-base tracking-wider uppercase">
                                        <span>Expose Traps</span> 
                                        <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/4 group-hover:bg-cyan-600/10 transition-colors duration-1000"></div>

                                {/* Floating Mock UI Preview */}
                                <div style={{ transform: "translateZ(55px)" }} className="absolute top-12 -right-8 sm:-right-12 w-60 sm:w-72 h-32 sm:h-40 bg-[#0c0c10] border border-cyan-500/20 rounded-2xl p-5 shadow-2xl opacity-40 sm:opacity-60 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between hidden sm:flex">
                                    <div className="flex gap-2.5">
                                        <div className="w-1/2 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-bold">Answer Scheme</div>
                                        <div className="w-1/2 h-8 rounded-xl bg-white/5 border border-white/10"></div>
                                    </div>
                                    <div className="w-full h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center px-4 text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">
                                        Topper Match 100%
                                    </div>
                                </div>
                            </TiltCard>
                        </div>

                        {/* Card 3: Adaptive Synthesis (Double Span) */}
                        <div className="lg:col-span-2 h-auto sm:h-[420px] perspective-[1500px] mt-0 sm:mt-6">
                            <TiltCard className="rounded-[2.2rem] border border-white/10 bg-[#040407] overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-12 z-10 h-full overflow-y-auto sm:overflow-hidden">
                                    <div className="flex-1 w-full">
                                        <Brain className="w-10 h-10 text-fuchsia-400 mb-6 opacity-95 transition-transform group-hover:scale-115 duration-300" />
                                        <h3 className="text-3xl sm:text-5xl font-black text-white mb-3 sm:mb-5 tracking-tight leading-none">Active Synthesis Mocks</h3>
                                        <p className="text-stone-400 text-sm sm:text-lg leading-relaxed mb-8 max-w-lg font-light">
                                            Dynamically generate mock board tests compiled to identify your weak spots. Train under high-pressure simulated constraints built precisely on CBSE specifications.
                                        </p>
                                        <Link to="/mocks" className="w-full sm:w-auto text-center px-8 py-4 bg-white text-black font-semibold rounded-full sm:hover:scale-105 transition-transform inline-flex items-center justify-center gap-3 shadow-[0_4px_30px_rgba(255,255,255,0.15)] text-sm sm:text-base uppercase tracking-wider">
                                            <GraduationCap className="w-5 h-5 text-black" />
                                            <span>Enter Test Arena</span>
                                        </Link>
                                    </div>

                                    {/* Abstract Geometry Visualizer */}
                                    <div style={{ transform: "translateZ(70px)" }} className="hidden md:flex flex-1 justify-center items-center opacity-70 group-hover:opacity-100 transition-all duration-500">
                                        <div className="w-48 sm:w-60 h-48 sm:h-60 border border-fuchsia-500/25 rounded-full flex items-center justify-center relative animate-[spin_25s_linear_infinite]">
                                            <div className="absolute w-full h-[1px] bg-fuchsia-500/20"></div>
                                            <div className="absolute w-[1px] h-full bg-fuchsia-500/20"></div>
                                            <div className="w-36 sm:w-44 h-36 sm:h-44 border border-white/10 rounded-full flex items-center justify-center animate-[spin_12s_linear_infinite_reverse]">
                                                <div className="w-24 h-24 border border-cyan-500/20 rounded-full flex items-center justify-center animate-[pulse_3s_infinite]">
                                                    <Sparkles className="w-6 h-6 text-fuchsia-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/10 via-transparent to-transparent pointer-events-none"></div>
                            </TiltCard>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- 5. Core Strengths Breakdown (The Definitive Standard) --- */}
            <section className="relative py-24 sm:py-36 bg-black border-t border-white/5 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-violet-900/10 via-black to-black pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="text-center mb-16 sm:mb-24">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full text-violet-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 border border-violet-500/20">
                            Our Core Blueprint
                        </span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter">
                            The Definitive Standard.
                        </h2>
                        <p className="text-stone-400 font-serif italic text-lg sm:text-xl max-w-xl mx-auto px-4 font-light leading-relaxed">
                            Elite preparation requires an elite architectural ecosystem. We filter out the noise so you command your marks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Strength 1 */}
                        <div className="p-8 rounded-[1.8rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-6 group-hover:scale-105 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 tracking-tight">Elite Curations</h4>
                            <p className="text-stone-400 leading-relaxed text-sm sm:text-base font-light">
                                Notes written by toppers, approved by educators, and cross-referenced with examiners' intent. Zero fluff.
                            </p>
                        </div>
                        {/* Strength 2 */}
                        <div className="p-8 rounded-[1.8rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-6 group-hover:scale-105 transition-transform">
                                <Brain className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 tracking-tight">Active Mocks</h4>
                            <p className="text-stone-400 leading-relaxed text-sm sm:text-base font-light">
                                Challenge yourself with mock tests designed to identify weaknesses and prepare you for actual exam pacing.
                            </p>
                        </div>
                        {/* Strength 3 */}
                        <div className="p-8 rounded-[1.8rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300 mb-6 group-hover:scale-105 transition-transform">
                                <Target className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 tracking-tight">Examiner Intents</h4>
                            <p className="text-stone-400 leading-relaxed text-sm sm:text-base font-light">
                                Learn the specific keywords examiners look for when grading derivations, mechanisms, and formats.
                            </p>
                        </div>
                    </div>

                    <div className="mt-20 flex justify-center">
                        <MagneticButton className="px-12 py-5 bg-white text-black font-bold tracking-widest uppercase text-xs sm:text-sm rounded-full hover:bg-stone-200 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.15)] z-50">
                            <Link to="/subjects" className="pointer-events-auto flex items-center gap-2">
                                <span>Commence Preparation</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-16 bg-black border-t border-white/5 text-center">
                <div className="text-stone-600 text-xs font-mono tracking-widest uppercase">
                    Designed for Excellence • Class 12th Board Engine • 2026
                </div>
            </footer>
        </div>
    );
}
