import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderTextWithLatex } from '../utils/latexRenderer';

/**
 * Renders NCERT Golden Lines with an ultra-spacious, cinematic vertical scroll layout.
 */
function GoldenLines({ lines }) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    if (!lines || lines.length === 0) {
        return (
            <div className="text-white/40 text-center py-24">
                No golden lines available for this chapter yet.
            </div>
        );
    }

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="py-12 space-y-24 md:space-y-40">
            {lines.map((line, index) => {
                const isEven = index % 2 === 1;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative w-full max-w-5xl mx-auto flex flex-col ${isEven ? 'items-end text-right' : 'items-start text-left'}`}
                    >
                        {/* Massive Background Watermark */}
                        <div 
                            className={`absolute top-1/2 -translate-y-1/2 select-none pointer-events-none -z-10 text-[12rem] md:text-[24rem] font-bold text-white/[0.02] tracking-tighter leading-none
                            ${isEven ? 'left-0 md:-left-20' : 'right-0 md:-right-20'}`}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </div>

                        {/* Line Content Block */}
                        <div className={`relative z-10 w-full md:w-4/5 p-8 md:p-16 backdrop-blur-sm bg-white/[0.01] border-t border-b ${isEven ? 'border-r rounded-r-3xl border-l-0' : 'border-l rounded-l-3xl border-r-0'} border-white/5`}>
                            
                            {/* Oversized Quote Decorator */}
                            <div className={`absolute -top-10 ${isEven ? '-right-4 text-right' : '-left-4 text-left'} text-amber-500/20 text-9xl font-serif leading-none select-none`}>
                                "
                            </div>

                            {/* Main Text */}
                            <p className="relative z-10 text-white/90 text-2xl md:text-3xl lg:text-4xl leading-[1.8] font-medium tracking-wide dark-katex">
                                {renderTextWithLatex(line)}
                            </p>

                            {/* Footer: Metadata & Actions */}
                            <div className={`mt-12 flex items-center gap-6 ${isEven ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-amber-500/40 font-mono text-sm uppercase tracking-widest">
                                    Golden Line {String(index + 1).padStart(2, '0')}
                                </span>
                                
                                <button 
                                    onClick={() => handleCopy(line, index)}
                                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20"
                                    title="Copy line"
                                >
                                    <AnimatePresence mode="wait">
                                        {copiedIndex === index ? (
                                            <motion.svg key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        ) : (
                                            <motion.svg key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </motion.svg>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Footer Tip */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center pt-24 pb-12"
            >
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    <span className="text-white/40 text-sm tracking-wide">Highly frequent in board examination marking schemes</span>
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                </div>
            </motion.div>
        </div>
    );
}

export default GoldenLines;
