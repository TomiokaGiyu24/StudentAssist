import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChemistryAccordion = ({ title, children, defaultOpen = false, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/10 bg-[#121212] rounded-2xl overflow-hidden mb-4 transition-all duration-300 hover:border-white/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-white/90">{title}</h3>
                    {badge && <div>{badge}</div>}
                </div>

                <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-white/5 mt-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChemistryAccordion;
