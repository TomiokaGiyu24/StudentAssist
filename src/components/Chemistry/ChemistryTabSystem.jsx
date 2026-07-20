import React from 'react';
import { motion } from 'framer-motion';

const ChemistryTabSystem = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex gap-6 border-b border-white/10 w-full overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            relative py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors outline-none
                            ${isActive ? 'text-teal-400' : 'text-stone-400 hover:text-stone-200'}
                        `}
                    >
                        {tab.label}

                        {isActive && (
                            <motion.div
                                layoutId="chemistryTabIndicator"
                                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-teal-400 rounded-t-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ChemistryTabSystem;
