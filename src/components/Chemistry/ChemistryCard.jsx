import React from 'react';

const ChemistryCard = ({ children, className = '', hoverEffect = true, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 sm:p-6
                ${hoverEffect ? 'transition-all duration-300 hover:bg-[#222] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default ChemistryCard;
