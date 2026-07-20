import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, ArrowLeft, Heart, Sparkles, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Staggered Blur Reveal Component
const StaggeredText = ({ text, delay = 0 }) => {
    return (
        <span className="inline-block overflow-hidden h-[1.2em] align-bottom">
            <span className="inline-flex">
                {text.split('').map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{
                            duration: 0.8,
                            delay: delay + (index * 0.05),
                            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "premium" feel
                        }}
                        className="inline-block whitespace-pre text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
                    >
                        {char}
                    </motion.span>
                ))}
            </span>
        </span>
    );
};

const CreatorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative perspective-1000 pt-16">

            {/* 1. Dynamic Background */}
            <div className="absolute inset-0 z-0 h-full overflow-hidden">
                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[80px] sm:blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -30, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-900/20 rounded-full blur-[80px] sm:blur-[120px]"
                />

                {/* Grid & Noise */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10 min-h-[calc(100vh-4rem)] flex flex-col">

                {/* Local Nav removed in favor of Global Navbar, or kept minimal if needed. 
                    Since Global Navbar handles "Back", we might not need this.
                    But keeping 'Creator Profile' tag is nice.
                */}
                <div className="flex justify-end items-center mb-8 shrink-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm"
                    >
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-300">Creator Profile</span>
                    </motion.div>
                </div>

                {/* Main Content - Asymmetrical Layout */}
                <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 pb-12">

                    {/* Left: Text Content */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 lg:pr-12 order-2 lg:order-1 text-center lg:text-left">

                        {/* Title Block */}
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-stone-400 font-medium text-base sm:text-lg mb-2 flex items-center justify-center lg:justify-start gap-3"
                            >
                                <span className="w-8 h-[1px] bg-stone-600 hidden lg:block"></span>
                                Architect of Lumina
                            </motion.h2>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white">
                                <motion.span
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="block"
                                >
                                    Bharat
                                </motion.span>
                                <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                                    <StaggeredText text="Singh Rajawat" delay={0.8} />
                                </div>
                            </h1>
                        </div>

                        {/* Message Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 2.5 }}
                            className="relative group text-left"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl">
                                <span className="absolute top-4 left-4 sm:top-6 sm:left-6 text-4xl sm:text-6xl text-white/5 font-serif">"</span>
                                <p className="text-stone-300 text-base sm:text-lg leading-relaxed relative z-10 font-light">
                                    Hey guys, I built this website to help you all in your boards preparation. I hope you will find this initiative of mine helpful. I want you people to use it and tell me what things could be made better and if you have any suggestions please contact me on my instagram.
                                </p>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 3 }}
                            className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start"
                        >
                            <a
                                href="https://www.instagram.com/bharat.s.rajawat?igsh=MTh4NmF0dzc2MHRlZQ=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto relative group px-8 py-4 bg-white text-black rounded-lg font-bold text-lg overflow-hidden transition-transform hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-center gap-3 group-hover:text-white transition-colors">
                                    <Instagram size={20} />
                                    <span>Connect on Instagram</span>
                                    <ExternalLink size={16} className="opacity-50 group-hover:opacity-100" />
                                </div>
                            </a>

                            <div className="flex flex-col text-xs font-mono text-stone-500 text-center sm:text-left">
                                <span>BASED IN</span>
                                <span className="text-stone-300">INDIA</span>
                            </div>
                        </motion.div>
                    </div>


                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end relative order-1 lg:order-2"
                    >
                        {/* Decorative Circles behind image - responsive sizing 
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] lg:w-[30rem] lg:h-[30rem] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[14rem] h-[14rem] sm:w-[20rem] sm:h-[20rem] lg:w-[25rem] lg:h-[25rem] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
*/}
                        <div className="relative w-64 h-80 sm:w-80 sm:h-[28rem] lg:w-[26rem] lg:h-[36rem] rounded-[3rem] lg:rounded-[10rem] overflow-hidden border-2 border-white/10 shadow-2xl group cursor-pointer hover:border-purple-500/50 transition-colors duration-500 mx-auto">
                            <div className="absolute inset-0 bg-stone-800 animate-pulse" /> {/* Loading Placeholder */}
                            <img
                                src="/images/bharat.jpeg"
                                alt="Bharat Singh Rajawat"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-center">
                                <span className="text-white font-bold tracking-widest uppercase text-sm">Visionary</span>
                            </div>
                        </div>
                    </motion.div>

                </main>
            </div>
        </div>
    );
};

export default CreatorPage;
