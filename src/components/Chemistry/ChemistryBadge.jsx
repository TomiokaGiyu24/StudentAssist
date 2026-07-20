import React from 'react';

const ChemistryBadge = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors";

    const variants = {
        default: "bg-white/5 text-stone-300 border border-white/10",
        primary: "bg-teal-500/10 text-teal-300 border border-teal-500/20",
        warning: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-300 border border-red-500/20",
        glow: "bg-teal-500/20 text-teal-200 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default ChemistryBadge;
