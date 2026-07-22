import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormatText } from './FormatText';

/* ─────────────────────────────────────────────────────────
   OrganicBridgeExplorer - Award-Winning Modern Design
   A high-performance visual dashboard for Organic Chemistry prerequisites.
   Provides publication-grade SVG vector chemical structures,
   interactive search/filtering, and an uncongested 3-tab study panel.
   ───────────────────────────────────────────────────────── */

// Category Visual Styling Map
const CATEGORY_STYLES = {
    'Spatial Frameworks': { 
        icon: '📐', 
        accent: '#f43f5e', 
        glow: 'rgba(244,63,94,0.2)', 
        text: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20' 
    },
    'Intermediates': { 
        icon: '🔋', 
        accent: '#3b82f6', 
        glow: 'rgba(59,130,246,0.2)', 
        text: 'text-blue-400', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/20' 
    },
    'Trivial Nomenclature': { 
        icon: '🏷️', 
        accent: '#eab308', 
        glow: 'rgba(234,179,8,0.2)', 
        text: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20' 
    },
    'Electronic Effects': { 
        icon: '⚡', 
        accent: '#a855f7', 
        glow: 'rgba(168,85,247,0.2)', 
        text: 'text-purple-400', 
        bg: 'bg-purple-500/10', 
        border: 'border-purple-500/20' 
    },
    'Reagent Mechanics': { 
        icon: '🧪', 
        accent: '#10b981', 
        glow: 'rgba(16,185,129,0.2)', 
        text: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20' 
    },
    'General': { 
        icon: '📚', 
        accent: '#9ca3af', 
        glow: 'rgba(156,163,175,0.2)', 
        text: 'text-stone-400', 
        bg: 'bg-stone-500/10', 
        border: 'border-stone-500/20' 
    }
};

/* ─────────────────────────────────────────────────────────
   DYNAMIC ORGANIC STRUCTURE SVG VECTOR RENDERER
   Generates clean 2D/3D-style vector graphics for chemical
   structures, orbitals, spatial frameworks, & reaction mechanics.
   ───────────────────────────────────────────────────────── */
const OrganicStructureViewer = ({ name, category, rawSvg }) => {
    // If rawSvg is genuine SVG markup, render it safely
    if (rawSvg && rawSvg.trim().startsWith('<svg')) {
        const cleanedSvg = rawSvg
            .replace(/fill=['"]#333['"]/g, "fill='#f8fafc'")
            .replace(/fill=['"]#303030['"]/g, "fill='#f1f5f9'")
            .replace(/stroke=['"]#2b2b2b['"]/g, "stroke='#cbd5e1'")
            .replace(/stroke=['"]#333['"]/g, "stroke='#e2e8f0'");
        return (
            <div 
                dangerouslySetInnerHTML={{ __html: cleanedSvg }} 
                className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
            />
        );
    }

    const titleLower = (name || '').toLowerCase();

    // Bond Legend Overlay for Student Clarity
    const renderBondLegend = (hasDouble = false, hasSingle = true, hasLonePair = false) => (
        <g transform="translate(10, 15)">
            <rect x="0" y="0" width="380" height="22" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x="12" y="15" fill="#94a3b8" fontSize="9" fontWeight="extrabold">BOND KEY:</text>
            
            {hasSingle && (
                <g transform="translate(75, 0)">
                    <line x1="0" y1="11" x2="18" y2="11" stroke="#94a3b8" strokeWidth="3" />
                    <text x="24" y="14" fill="#cbd5e1" fontSize="9" fontWeight="bold">Single Bond (σ)</text>
                </g>
            )}

            {hasDouble && (
                <g transform="translate(180, 0)">
                    <line x1="0" y1="9" x2="18" y2="9" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="0" y1="14" x2="18" y2="14" stroke="#38bdf8" strokeWidth="2.5" />
                    <text x="24" y="14" fill="#38bdf8" fontSize="9" fontWeight="extrabold">Double Bond (σ + π)</text>
                </g>
            )}

            {hasLonePair && (
                <g transform="translate(300, 0)">
                    <circle cx="5" cy="11" r="2.5" fill="#f43f5e" />
                    <circle cx="12" cy="11" r="2.5" fill="#f43f5e" />
                    <text x="20" y="14" fill="#f43f5e" fontSize="9" fontWeight="extrabold">Lone Pair (:)</text>
                </g>
            )}
        </g>
    );

    // 1. Spatial Frameworks
    if (titleLower.includes('allylic')) {
        return (
            <svg viewBox="0 0 400 190" className="w-full h-full max-h-[220px]">
                <defs>
                    <linearGradient id="allylicGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                {renderBondLegend(true, true, true)}

                {/* Double Bond C=C */}
                <line x1="60" y1="100" x2="150" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                <line x1="60" y1="112" x2="150" y2="112" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                <text x="50" y="90" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">CH₂</text>
                <text x="150" y="90" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">CH</text>
                <text x="100" y="138" fill="#0284c7" fontSize="10" fontWeight="extrabold" textAnchor="middle">══ Double Bond (σ + π)</text>

                {/* Single Bond C-C */}
                <line x1="165" y1="106" x2="245" y2="106" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="5,4" />
                <text x="205" y="125" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">── Single Bond (σ)</text>

                {/* Allylic Carbon Highlight Box */}
                <rect x="235" y="70" width="70" height="70" rx="16" fill="url(#allylicGlow)" stroke="#f43f5e" strokeWidth="2.5" />
                <text x="270" y="104" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle">CH₂</text>
                <text x="270" y="124" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">sp³ Allylic</text>

                {/* Attached Group with Single Bond */}
                <line x1="305" y1="106" x2="350" y2="106" stroke="#f43f5e" strokeWidth="3.5" />
                <text x="365" y="111" fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">Cl</text>

                {/* Annotation Arrow */}
                <path d="M 270 52 L 270 68" stroke="#f43f5e" strokeWidth="2.5" />
                <text x="270" y="44" fill="#f43f5e" fontSize="11" fontWeight="extrabold" textAnchor="middle">TARGET ALLYLIC SITE</text>
            </svg>
        );
    }

    if (titleLower.includes('vinylic')) {
        return (
            <svg viewBox="0 0 400 180" className="w-full h-full max-h-[220px]">
                {/* Double Bond C=C with Vinylic Carbon Highlight */}
                <line x1="80" y1="90" x2="180" y2="90" stroke="#38bdf8" strokeWidth="4" />
                <line x1="80" y1="102" x2="180" y2="102" stroke="#38bdf8" strokeWidth="4" />
                <text x="70" y="80" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">CH₂</text>

                <rect x="160" y="60" width="70" height="70" rx="16" fill="rgba(244,63,94,0.25)" stroke="#f43f5e" strokeWidth="2" />
                <text x="195" y="94" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle">CH</text>
                <text x="195" y="114" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">sp² Vinylic</text>

                <line x1="230" y1="96" x2="290" y2="96" stroke="#f43f5e" strokeWidth="3" />
                <text x="310" y="101" fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">Cl</text>

                <text x="195" y="35" fill="#f43f5e" fontSize="12" fontWeight="extrabold" textAnchor="middle">VINYLIC CENTER (Inert C-Cl)</text>
                <line x1="195" y1="42" x2="195" y2="58" stroke="#f43f5e" strokeWidth="2" />
            </svg>
        );
    }

    if (titleLower.includes('benzylic')) {
        return (
            <svg viewBox="0 0 400 180" className="w-full h-full max-h-[220px]">
                {/* Benzene Ring */}
                <polygon points="100,50 140,73 140,118 100,140 60,118 60,73" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="100" cy="95" r="24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,3" />

                {/* Exocyclic Bond */}
                <line x1="140" y1="95" x2="200" y2="95" stroke="#f43f5e" strokeWidth="3" />

                {/* Benzylic Carbon */}
                <rect x="200" y="60" width="75" height="70" rx="16" fill="rgba(244,63,94,0.25)" stroke="#f43f5e" strokeWidth="2" />
                <text x="237" y="94" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle">CH₂</text>
                <text x="237" y="114" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">sp³ Benzylic</text>

                {/* Leaving Group */}
                <line x1="275" y1="95" x2="330" y2="95" stroke="#94a3b8" strokeWidth="3" />
                <text x="345" y="100" fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">Cl</text>

                <text x="237" y="35" fill="#f43f5e" fontSize="12" fontWeight="extrabold" textAnchor="middle">BENZYLIC POSITION (High SN1)</text>
            </svg>
        );
    }

    if (titleLower.includes('aryl')) {
        return (
            <svg viewBox="0 0 400 180" className="w-full h-full max-h-[220px]">
                {/* Benzene Ring */}
                <polygon points="120,50 160,73 160,118 120,140 80,118 80,73" fill="rgba(56,189,248,0.05)" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="120" cy="95" r="24" fill="none" stroke="#38bdf8" strokeWidth="2" />

                {/* Aryl Carbon Highlight */}
                <circle cx="160" cy="95" r="14" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <text x="160" y="99" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">sp²</text>

                {/* Directly attached halogen */}
                <line x1="174" y1="95" x2="250" y2="95" stroke="#f43f5e" strokeWidth="3" />
                <text x="270" y="100" fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">Cl</text>

                <text x="160" y="30" fill="#f43f5e" fontSize="12" fontWeight="extrabold" textAnchor="middle">ARYL RING CARBON (Resonance Locked)</text>
            </svg>
        );
    }

    if (titleLower.includes('ortho') || titleLower.includes('positioning')) {
        return (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-[230px]">
                {/* Benzene Hexagon */}
                <polygon points="200,45 250,75 250,135 200,165 150,135 150,75" fill="none" stroke="#64748b" strokeWidth="3" />
                <circle cx="200" cy="105" r="32" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5,4" />

                {/* Principal Group G at pos 1 */}
                <line x1="200" y1="45" x2="200" y2="15" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="200" cy="12" r="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="200" y="16" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">G (1)</text>

                {/* Ortho (2, 6) */}
                <circle cx="250" cy="75" r="10" fill="#10b981" />
                <circle cx="150" cy="75" r="10" fill="#10b981" />
                <text x="285" y="70" fill="#10b981" fontSize="12" fontWeight="bold">Ortho (2,6)</text>

                {/* Meta (3, 5) */}
                <circle cx="250" cy="135" r="10" fill="#eab308" />
                <circle cx="150" cy="135" r="10" fill="#eab308" />
                <text x="285" y="140" fill="#eab308" fontSize="12" fontWeight="bold">Meta (3,5)</text>

                {/* Para (4) */}
                <circle cx="200" cy="165" r="10" fill="#f43f5e" />
                <text x="200" y="192" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">Para (4)</text>
            </svg>
        );
    }

    if (titleLower.includes('carbocation') || titleLower.includes('carbanion') || titleLower.includes('radical')) {
        const isCarbocation = titleLower.includes('carbocation');
        const isCarbanion = titleLower.includes('carbanion');

        return (
            <svg viewBox="0 0 400 190" className="w-full h-full max-h-[220px]">
                {/* Central Carbon */}
                <circle cx="200" cy="100" r="22" fill={isCarbocation ? '#3b82f6' : isCarbanion ? '#10b981' : '#a855f7'} stroke="#ffffff" strokeWidth="2" />
                <text x="200" y="106" fill="#ffffff" fontSize="16" fontWeight="black" textAnchor="middle">
                    {isCarbocation ? 'C⁺' : isCarbanion ? 'C⁻' : 'C•'}
                </text>

                {/* Bonds */}
                <line x1="200" y1="100" x2="110" y2="130" stroke="#94a3b8" strokeWidth="3" />
                <line x1="200" y1="100" x2="290" y2="130" stroke="#94a3b8" strokeWidth="3" />
                <line x1="200" y1="100" x2="200" y2="170" stroke="#94a3b8" strokeWidth="3" />
                <text x="95" y="140" fill="#cbd5e1" fontSize="14" fontWeight="bold">R₁</text>
                <text x="305" y="140" fill="#cbd5e1" fontSize="14" fontWeight="bold">R₂</text>
                <text x="200" y="185" fill="#cbd5e1" fontSize="14" fontWeight="bold" textAnchor="middle">R₃</text>

                {/* Orbital Lobe */}
                <ellipse cx="200" cy="50" rx="18" ry="32" fill={isCarbocation ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.3)'} stroke={isCarbocation ? '#60a5fa' : '#34d399'} strokeWidth="2" strokeDasharray="3,3" />

                {/* Annotations */}
                <text x="200" y="22" fill="#e2e8f0" fontSize="12" fontWeight="extrabold" textAnchor="middle">
                    {isCarbocation ? 'Empty p-Orbital (Trigonal Planar, 120°)' : isCarbanion ? 'Lone Pair in sp³ (Pyramidal, ~107°)' : 'Unpaired Single Electron (Planar, 120°)'}
                </text>
            </svg>
        );
    }

    // 2. Trivial Nomenclature & Structural Compounds
    if (titleLower.includes('chloroform') || titleLower.includes('iodoform')) {
        const isIod = titleLower.includes('iodoform');
        const halSymbol = isIod ? 'I' : 'Cl';
        const halColor = isIod ? '#eab308' : '#38bdf8';

        return (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-[220px]">
                {/* Central Carbon */}
                <circle cx="200" cy="100" r="20" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
                <text x="200" y="106" fill="#ffffff" fontSize="16" fontWeight="black" textAnchor="middle">C</text>

                {/* Top H bond */}
                <line x1="200" y1="80" x2="200" y2="40" stroke="#94a3b8" strokeWidth="3" />
                <circle cx="200" cy="28" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="200" y="33" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">H</text>

                {/* Three Halogen Bonds */}
                <line x1="184" y1="112" x2="130" y2="155" stroke={halColor} strokeWidth="3" />
                <rect x="95" y="145" width="40" height="30" rx="8" fill="rgba(15,23,42,0.9)" stroke={halColor} strokeWidth="2" />
                <text x="115" y="165" fill={halColor} fontSize="14" fontWeight="black" textAnchor="middle">{halSymbol}</text>

                <line x1="200" y1="120" x2="200" y2="165" stroke={halColor} strokeWidth="3" />
                <rect x="180" y="150" width="40" height="30" rx="8" fill="rgba(15,23,42,0.9)" stroke={halColor} strokeWidth="2" />
                <text x="200" y="170" fill={halColor} fontSize="14" fontWeight="black" textAnchor="middle">{halSymbol}</text>

                <line x1="216" y1="112" x2="270" y2="155" stroke={halColor} strokeWidth="3" />
                <rect x="265" y="145" width="40" height="30" rx="8" fill="rgba(15,23,42,0.9)" stroke={halColor} strokeWidth="2" />
                <text x="285" y="165" fill={halColor} fontSize="14" fontWeight="black" textAnchor="middle">{halSymbol}</text>

                <text x="200" y="15" fill={halColor} fontSize="13" fontWeight="bold" textAnchor="middle">
                    Trihalomethane ({isIod ? 'CHI₃ Yellow Precipitate' : 'CHCl₃ Anesthetic'})
                </text>
            </svg>
        );
    }

    if (titleLower.includes('formaldehyde') || titleLower.includes('acetaldehyde') || titleLower.includes('acetone') || titleLower.includes('acetic acid')) {
        let leftGroup = 'H';
        let rightGroup = 'H';
        let leftColor = '#94a3b8';
        let rightColor = '#94a3b8';

        if (titleLower.includes('acetaldehyde')) { leftGroup = 'CH₃'; leftColor = '#10b981'; }
        else if (titleLower.includes('acetone')) { leftGroup = 'CH₃'; rightGroup = 'CH₃'; leftColor = '#10b981'; rightColor = '#10b981'; }
        else if (titleLower.includes('acetic acid')) { leftGroup = 'CH₃'; rightGroup = 'OH'; leftColor = '#10b981'; rightColor = '#f43f5e'; }

        return (
            <svg viewBox="0 0 400 190" className="w-full h-full max-h-[220px]">
                {/* Carbonyl C=O */}
                <circle cx="200" cy="110" r="20" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
                <text x="200" y="116" fill="#ffffff" fontSize="16" fontWeight="black" textAnchor="middle">C</text>

                {/* Double Bond =O */}
                <line x1="193" y1="90" x2="193" y2="45" stroke="#f43f5e" strokeWidth="3.5" />
                <line x1="207" y1="90" x2="207" y2="45" stroke="#f43f5e" strokeWidth="3.5" />
                <circle cx="200" cy="30" r="16" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="2" />
                <text x="200" y="36" fill="#f43f5e" fontSize="16" fontWeight="black" textAnchor="middle">O</text>

                {/* Left Branch */}
                <line x1="182" y1="118" x2="130" y2="148" stroke={leftColor} strokeWidth="3" />
                <rect x="85" y="135" width="50" height="32" rx="8" fill="rgba(15,23,42,0.9)" stroke={leftColor} strokeWidth="2" />
                <text x="110" y="156" fill={leftColor} fontSize="14" fontWeight="black" textAnchor="middle">{leftGroup}</text>

                {/* Right Branch */}
                <line x1="218" y1="118" x2="270" y2="148" stroke={rightColor} strokeWidth="3" />
                <rect x="265" y="135" width="50" height="32" rx="8" fill="rgba(15,23,42,0.9)" stroke={rightColor} strokeWidth="2" />
                <text x="290" y="156" fill={rightColor} fontSize="14" fontWeight="black" textAnchor="middle">{rightGroup}</text>

                <text x="200" y="182" fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle">{name}</text>
            </svg>
        );
    }

    if (titleLower.includes('glycol') || titleLower.includes('glycerol') || titleLower.includes('oxalic')) {
        const isGlycerol = titleLower.includes('glycerol');
        const isOxalic = titleLower.includes('oxalic');

        return (
            <svg viewBox="0 0 400 190" className="w-full h-full max-h-[220px]">
                {isOxalic ? (
                    <g>
                        {/* Oxalic Acid HOOC-COOH */}
                        <line x1="160" y1="100" x2="240" y2="100" stroke="#ffffff" strokeWidth="4" />
                        
                        {/* Left C=O & OH */}
                        <circle cx="160" cy="100" r="18" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                        <text x="160" y="105" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">C</text>
                        <line x1="160" y1="82" x2="160" y2="45" stroke="#f43f5e" strokeWidth="3" />
                        <text x="160" y="38" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">=O</text>
                        <line x1="142" y1="100" x2="90" y2="100" stroke="#f43f5e" strokeWidth="3" />
                        <text x="65" y="105" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">HO</text>

                        {/* Right C=O & OH */}
                        <circle cx="240" cy="100" r="18" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                        <text x="240" y="105" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">C</text>
                        <line x1="240" y1="82" x2="240" y2="45" stroke="#f43f5e" strokeWidth="3" />
                        <text x="240" y="38" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">=O</text>
                        <line x1="258" y1="100" x2="310" y2="100" stroke="#f43f5e" strokeWidth="3" />
                        <text x="330" y="105" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">OH</text>

                        <text x="200" y="165" fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle">Oxalic Acid (HOOC-COOH)</text>
                    </g>
                ) : (
                    <g>
                        {/* Glycol / Glycerol chain */}
                        <line x1="120" y1="100" x2="280" y2="100" stroke="#38bdf8" strokeWidth="4" />

                        {/* C1 */}
                        <circle cx="120" cy="100" r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                        <text x="120" y="105" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">CH₂</text>
                        <line x1="120" y1="118" x2="120" y2="155" stroke="#f43f5e" strokeWidth="3" />
                        <text x="120" y="175" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">OH</text>

                        {/* C2 */}
                        {isGlycerol ? (
                            <>
                                <circle cx="200" cy="100" r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                                <text x="200" y="105" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">CH</text>
                                <line x1="200" y1="82" x2="200" y2="45" stroke="#f43f5e" strokeWidth="3" />
                                <text x="200" y="35" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">OH</text>
                            </>
                        ) : null}

                        {/* C3/C2 */}
                        <circle cx="280" cy="100" r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                        <text x="280" y="105" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">CH₂</text>
                        <line x1="280" y1="118" x2="280" y2="155" stroke="#f43f5e" strokeWidth="3" />
                        <text x="280" y="175" fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">OH</text>

                        <text x="200" y="190" fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
                            {isGlycerol ? 'Glycerol (1,2,3-Triol)' : 'Ethylene Glycol (1,2-Diol)'}
                        </text>
                    </g>
                )}
            </svg>
        );
    }

    if (titleLower.includes('cresol') || titleLower.includes('catechol') || titleLower.includes('resorcinol') || titleLower.includes('hydroquinone')) {
        const isOrtho = titleLower.includes('o-cresol') || titleLower.includes('catechol');
        const isMeta = titleLower.includes('m-cresol') || titleLower.includes('resorcinol');
        const isPara = titleLower.includes('p-cresol') || titleLower.includes('hydroquinone');

        const isDiol = titleLower.includes('catechol') || titleLower.includes('resorcinol') || titleLower.includes('hydroquinone');
        const secondGroup = isDiol ? 'OH' : 'CH₃';
        const secondColor = isDiol ? '#f43f5e' : '#10b981';

        // Positions: 1 at top (200,65), 2 at upper right (245,90), 3 at lower right (245,140), 4 at bottom (200,165)
        let pos2X = 245, pos2Y = 90;
        if (isMeta) { pos2X = 245; pos2Y = 140; }
        else if (isPara) { pos2X = 200; pos2Y = 165; }

        return (
            <svg viewBox="0 0 400 210" className="w-full h-full max-h-[230px]">
                {/* Benzene Ring */}
                <polygon points="200,65 245,90 245,140 200,165 155,140 155,90" fill="rgba(255,255,255,0.02)" stroke="#94a3b8" strokeWidth="3" />
                <circle cx="200" cy="115" r="26" fill="none" stroke="#94a3b8" strokeWidth="2" />

                {/* Primary Group -OH at position 1 */}
                <line x1="200" y1="65" x2="200" y2="35" stroke="#f43f5e" strokeWidth="3" />
                <rect x="175" y="5" width="50" height="30" rx="8" fill="rgba(15,23,42,0.9)" stroke="#f43f5e" strokeWidth="2" />
                <text x="200" y="25" fill="#f43f5e" fontSize="14" fontWeight="black" textAnchor="middle">OH</text>

                {/* Second Group (-CH3 or -OH) */}
                <line x1={pos2X} y1={pos2Y} x2={isPara ? 200 : pos2X + 30} y2={isPara ? 190 : pos2Y} stroke={secondColor} strokeWidth="3" />
                <rect x={isPara ? 175 : pos2X + 30} y={isPara ? 185 : pos2Y - 15} width="50" height="30" rx="8" fill="rgba(15,23,42,0.9)" stroke={secondColor} strokeWidth="2" />
                <text x={isPara ? 200 : pos2X + 55} y={isPara ? 205 : pos2Y + 5} fill={secondColor} fontSize="14" fontWeight="black" textAnchor="middle">{secondGroup}</text>

                <text x="200" y="195" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    {name} ({isOrtho ? '1,2-Position' : isMeta ? '1,3-Position' : '1,4-Position'})
                </text>
            </svg>
        );
    }

    if (category === 'Trivial Nomenclature' || titleLower.includes('aniline') || titleLower.includes('phenol') || titleLower.includes('toluene') || titleLower.includes('anisole')) {
        let groupText = 'R';
        let groupColor = '#38bdf8';

        if (titleLower.includes('aniline')) { groupText = 'NH₂'; groupColor = '#38bdf8'; }
        else if (titleLower.includes('phenol')) { groupText = 'OH'; groupColor = '#f43f5e'; }
        else if (titleLower.includes('anisole')) { groupText = 'OCH₃'; groupColor = '#a855f7'; }
        else if (titleLower.includes('toluene')) { groupText = 'CH₃'; groupColor = '#10b981'; }
        else if (titleLower.includes('cumene')) { groupText = 'CH(CH₃)₂'; groupColor = '#eab308'; }
        else if (titleLower.includes('benzyl chloride')) { groupText = 'CH₂Cl'; groupColor = '#fb7185'; }
        else if (titleLower.includes('benzal chloride')) { groupText = 'CHCl₂'; groupColor = '#fb7185'; }
        else if (titleLower.includes('benzo trichloride')) { groupText = 'CCl₃'; groupColor = '#fb7185'; }

        return (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-[220px]">
                {/* Benzene Ring */}
                <polygon points="200,65 245,90 245,140 200,165 155,140 155,90" fill="rgba(255,255,255,0.02)" stroke="#94a3b8" strokeWidth="3" />
                <circle cx="200" cy="115" r="26" fill="none" stroke="#94a3b8" strokeWidth="2" />

                {/* Functional Group */}
                <line x1="200" y1="65" x2="200" y2="35" stroke={groupColor} strokeWidth="3" />
                <rect x="150" y="5" width="100" height="34" rx="10" fill="rgba(15,23,42,0.9)" stroke={groupColor} strokeWidth="2" />
                <text x="200" y="27" fill={groupColor} fontSize="16" fontWeight="black" textAnchor="middle">{groupText}</text>

                <text x="200" y="190" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    {name}
                </text>
            </svg>
        );
    }

    // 3. Electronic Effects & Reagents Fallback Renderers
    return (
        <svg viewBox="0 0 400 180" className="w-full h-full max-h-[220px]">
            <rect x="20" y="20" width="360" height="140" rx="20" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <circle cx="80" cy="90" r="30" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="2" />
            <text x="80" y="96" fill="#38bdf8" fontSize="22" fontWeight="black" textAnchor="middle">⚡</text>

            <path d="M 130 90 L 250 90" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,4" />
            <text x="190" y="75" fill="#f43f5e" fontSize="12" fontWeight="extrabold" textAnchor="middle">ELECTRONIC SHIFT / REACTION PATH</text>

            <rect x="270" y="60" width="90" height="60" rx="14" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
            <text x="315" y="95" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">Active Site</text>

            <text x="200" y="148" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">{name}</text>
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────
   PREREQUISITE DETAIL PANEL (Uncongested 3-Tab Study View)
   ───────────────────────────────────────────────────────── */
const PrerequisiteDetail = React.memo(({ item, isMastered, onToggleMastered, onBack }) => {
    const [activeDetailTab, setActiveDetailTab] = useState('visual'); // 'visual' | 'examiner' | 'flashcard'
    const [isFlipped, setIsFlipped] = useState(false);

    const cat = item.core_category || 'General';
    const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['General'];

    // Reset state on topic switch
    useEffect(() => {
        setActiveDetailTab('visual');
        setIsFlipped(false);
    }, [item.prerequisite_name]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 220, damping: 25 }}
            className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-500 shadow-2xl backdrop-blur-xl ${
                isMastered 
                    ? 'border-emerald-500/35 bg-emerald-950/[0.04] shadow-[0_12px_40px_rgba(16,185,129,0.08)]' 
                    : 'border-white/[0.08] bg-[#0d0d12]/90 shadow-[0_16px_50px_rgba(0,0,0,0.7)]'
            }`}
        >
            <div>
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.03] text-xs font-bold text-stone-300 hover:text-white transition-all cursor-pointer"
                    >
                        ← Back to Topics
                    </button>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text} ${style.border} border`}>
                            {style.icon} {cat}
                        </span>
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                            item.syllabus_tier === 'CRITICAL' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                            {item.syllabus_tier || 'CRITICAL'}
                        </span>
                    </div>

                    {/* Mastered Toggle Button */}
                    <button
                        onClick={onToggleMastered}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isMastered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-white/[0.03] text-stone-400 border-white/[0.1] hover:text-white hover:bg-white/[0.06]'
                        }`}
                    >
                        {isMastered ? '✓ Mastered' : 'Mark as Mastered'}
                    </button>
                </div>

                {/* Topic Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
                    {item.prerequisite_name}
                </h3>

                {/* Segmented 3-Tab Controls */}
                <div className="grid grid-cols-3 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6">
                    <button
                        onClick={() => setActiveDetailTab('visual')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeDetailTab === 'visual'
                                ? 'bg-white/[0.1] text-white shadow-md'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        <span>🔬</span>
                        <span className="hidden sm:inline">Visual & Core</span>
                        <span className="sm:hidden">Core</span>
                    </button>

                    <button
                        onClick={() => setActiveDetailTab('examiner')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeDetailTab === 'examiner'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-md'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        <span>🔗</span>
                        <span className="hidden sm:inline">Exam Traps</span>
                        <span className="sm:hidden">Traps</span>
                    </button>

                    <button
                        onClick={() => setActiveDetailTab('flashcard')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeDetailTab === 'flashcard'
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-md'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        <span>🧠</span>
                        <span className="hidden sm:inline">Topper Script</span>
                        <span className="sm:hidden">Script</span>
                    </button>
                </div>

                {/* TAB CONTENT AREA */}
                <AnimatePresence mode="wait">
                    {activeDetailTab === 'visual' && (
                        <motion.div
                            key="visual"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Vector Structural Canvas */}
                            <div className="relative w-full h-[220px] sm:h-[260px] rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/[0.08] p-4 flex items-center justify-center shadow-inner">
                                <OrganicStructureViewer 
                                    name={item.prerequisite_name} 
                                    category={item.core_category} 
                                    rawSvg={item.visual_svg_block} 
                                />
                            </div>

                            {/* Simplified vs Textbook Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/15">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-base">💡</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">In Plain Terms (Simplified)</span>
                                    </div>
                                    <p className="text-[13.5px] text-stone-200 leading-relaxed font-medium">
                                        <FormatText>{item.plain_terms_decode?.the_concept_simplified}</FormatText>
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-base">📖</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Textbook Definition</span>
                                    </div>
                                    <p className="text-[13.5px] text-stone-300 italic leading-relaxed">
                                        <FormatText>{item.plain_terms_decode?.the_textbook_definition}</FormatText>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeDetailTab === 'examiner' && (
                        <motion.div
                            key="examiner"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                        >
                            {/* Class 12 Connection Bar */}
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1">Target CBSE Chapter</span>
                                    <span className="text-sm font-bold text-white">
                                        {item.class_12_dependency?.chapter_link || 'Class 12 Organic Core'}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1">Mechanism / Reaction</span>
                                    <span className="text-xs font-bold text-rose-400 font-mono">
                                        {item.class_12_dependency?.mechanism_or_reaction || 'Core Mechanism'}
                                    </span>
                                </div>
                            </div>

                            {/* The Examiner Trap Box */}
                            <div className="p-6 rounded-2xl bg-rose-500/[0.04] border border-rose-500/25 shadow-[0_0_25px_rgba(244,63,94,0.05)]">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">THE EXAMINER'S TRAP</span>
                                        <span className="text-xs text-stone-400">Why students lose marks in board exams</span>
                                    </div>
                                </div>
                                <p className="text-sm text-stone-200 leading-relaxed font-medium pl-1">
                                    <FormatText>{item.class_12_dependency?.the_consequence}</FormatText>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeDetailTab === 'flashcard' && (
                        <motion.div
                            key="flashcard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Diagnostic Question Box */}
                            <div className="p-5 rounded-2xl bg-teal-500/[0.03] border border-teal-500/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 block mb-2">DIAGNOSTIC BOARD QUESTION</span>
                                <p className="text-sm sm:text-base text-white font-semibold leading-relaxed">
                                    {item.diagnostic_flash_card?.flash_question}
                                </p>
                            </div>

                            {/* Reveal Button */}
                            <button
                                onClick={() => setIsFlipped(prev => !prev)}
                                className="w-full py-3 px-4 rounded-xl text-xs font-black bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                                <span>🧠</span>
                                <span>{isFlipped ? 'Hide Topper Blueprint' : 'Reveal Topper Perfect Response'}</span>
                            </button>

                            {/* Flip Content */}
                            <AnimatePresence>
                                {isFlipped && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/25 mt-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">PERFECT RESPONSE SCRIPT (100/100 ANSWER)</span>
                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">CBSE Marking Scheme Aligned</span>
                                            </div>
                                            <p className="text-sm text-stone-200 leading-[1.8] font-medium">
                                                <FormatText>{item.diagnostic_flash_card?.perfect_response_script}</FormatText>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
});

/* ─────────────────────────────────────────────────────────
   MAIN ORGANIC BRIDGE EXPLORER COMPONENT
   ───────────────────────────────────────────────────────── */
const OrganicBridgeExplorer = ({ content }) => {
    // Filter out database metadata item
    const prerequisites = useMemo(() => {
        if (!Array.isArray(content)) return [];
        return content.filter(item => item.prerequisite_name && item.prerequisite_name !== "Curricular Audit Core Database Complete");
    }, [content]);

    // Local Storage for Mastered status
    const [masteredList, setMasteredList] = useState(() => {
        try {
            const stored = localStorage.getItem('organic-bridge-mastered');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('organic-bridge-mastered', JSON.stringify(masteredList));
    }, [masteredList]);

    const handleToggleMastered = useCallback((name) => {
        setMasteredList(prev => {
            if (prev.includes(name)) {
                return prev.filter(x => x !== name);
            } else {
                return [...prev, name];
            }
        });
    }, []);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Extract categories
    const categories = useMemo(() => {
        const set = new Set();
        prerequisites.forEach(item => {
            if (item.core_category) set.add(item.core_category);
        });
        return Array.from(set);
    }, [prerequisites]);

    // Filtered Items
    const filteredItems = useMemo(() => {
        return prerequisites.filter(item => {
            const matchesCategory = selectedCategory === 'ALL' || item.core_category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                item.prerequisite_name.toLowerCase().includes(q) ||
                (item.core_category && item.core_category.toLowerCase().includes(q)) ||
                (item.plain_terms_decode?.the_concept_simplified && item.plain_terms_decode.the_concept_simplified.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [prerequisites, selectedCategory, searchQuery]);

    // Active Selected Topic
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    // Sync selected topic when filters change
    useEffect(() => {
        if (filteredItems.length > 0) {
            const exists = filteredItems.some(x => x.prerequisite_name === selectedTopicName);
            if (!exists) {
                setSelectedTopicName(filteredItems[0].prerequisite_name);
                setShowMobileDetail(false);
            }
        }
    }, [filteredItems, selectedCategory]);

    const selectedTopic = useMemo(() => {
        return filteredItems.find(x => x.prerequisite_name === selectedTopicName) || filteredItems[0] || null;
    }, [filteredItems, selectedTopicName]);

    // Progress Stats
    const totalCount = prerequisites.length;
    const masteredCount = useMemo(() => {
        return prerequisites.filter(item => masteredList.includes(item.prerequisite_name)).length;
    }, [prerequisites, masteredList]);

    const progressPercentage = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

    return (
        <div className="w-full select-none pb-12 font-sans">
            {/* HERO & PROGRESS BAR */}
            <div className="relative p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#121218] via-[#0d0d12] to-[#08080c] mb-8 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-[0.08] bg-rose-500 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px] opacity-[0.06] bg-amber-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(234,179,8,0.15)]">
                                Class 11 → 12 Bridge
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                                {totalCount} Essential Prerequisite Nodes
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-3">
                            Organic Chemistry Prerequisite Bridge
                        </h2>
                        <p className="text-sm text-stone-400 leading-relaxed max-w-2xl">
                            Master spatial frameworks, benzene trivial nomenclature, electron displacement effects, and reagent attack mechanics to conquer CBSE Class 12 Organic Chemistry.
                        </p>
                    </div>

                    {/* Progress Widget */}
                    <div className="w-full lg:w-72 bg-white/[0.02] border border-white/[0.08] p-5 rounded-2xl flex flex-col shrink-0 relative overflow-hidden shadow-xl backdrop-blur-md">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Mastery Score</span>
                            <span className="text-xl font-black text-emerald-400 font-mono">{masteredCount} / {totalCount}</span>
                        </div>
                        
                        <div className="h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        
                        <p className="text-[10px] text-stone-400 font-medium mt-2">
                            {progressPercentage === 100 
                                ? '🎉 All 24 bridge concepts mastered!' 
                                : `${Math.round(progressPercentage)}% completed. Click 'Mark as Mastered' as you study.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* SEARCH & CATEGORY FILTER BAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
                {/* Category Pills */}
                <div className="flex overflow-x-auto pb-2 custom-scrollbar select-none gap-2">
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-4 py-2.5 rounded-2xl border font-bold text-xs shrink-0 transition-all cursor-pointer ${
                            selectedCategory === 'ALL'
                                ? 'bg-white/[0.1] text-white border-white/[0.2] shadow-md'
                                : 'bg-[#0a0a0e]/60 text-stone-400 border-white/[0.06] hover:text-white'
                        }`}
                    >
                        All Nodes ({prerequisites.length})
                    </button>

                    {categories.map(cat => {
                        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['General'];
                        const count = prerequisites.filter(x => x.core_category === cat).length;
                        const isSelected = selectedCategory === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? `${style.bg} ${style.text} ${style.border} shadow-lg`
                                        : 'bg-[#0a0a0e]/60 text-stone-400 border-white/[0.06] hover:text-white'
                                }`}
                            >
                                <span>{style.icon}</span>
                                <span>{cat}</span>
                                <span className="font-mono text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-stone-300">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[260px] md:min-w-[300px]">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search formulas, concepts..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                    <span className="absolute left-3.5 top-3 text-stone-500 text-xs">🔍</span>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-stone-500 hover:text-white text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* SPLIT STUDY BOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Topic Navigator List */}
                <div className={`lg:col-span-4 flex flex-col gap-2.5 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar ${
                    showMobileDetail ? 'hidden lg:flex' : 'flex'
                }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1 px-1">
                        Topics ({filteredItems.length})
                    </span>

                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl text-stone-500 text-xs font-bold">
                            No matching topics found.
                        </div>
                    ) : (
                        filteredItems.map((item, idx) => {
                            const isSelected = selectedTopicName === item.prerequisite_name;
                            const isItemMastered = masteredList.includes(item.prerequisite_name);
                            const catStyle = CATEGORY_STYLES[item.core_category] || CATEGORY_STYLES['General'];

                            return (
                                <button
                                    key={item.prerequisite_name}
                                    onClick={() => {
                                        setSelectedTopicName(item.prerequisite_name);
                                        setShowMobileDetail(true);
                                    }}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                                        isSelected
                                            ? 'border-amber-500/40 bg-amber-500/[0.05] shadow-[0_4px_20px_rgba(234,179,8,0.08)]'
                                            : 'border-white/[0.06] bg-[#0a0a0e]/50 hover:border-white/[0.12] hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                                                    Node {idx + 1}
                                                </span>
                                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>
                                                    {item.core_category}
                                                </span>
                                            </div>

                                            <h4 className={`text-sm font-bold tracking-tight transition-colors ${
                                                isSelected ? 'text-white' : 'text-stone-300 group-hover:text-white'
                                            }`}>
                                                {item.prerequisite_name}
                                            </h4>
                                        </div>

                                        {isItemMastered && (
                                            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* RIGHT: Topic Detail Panel */}
                <div className={`lg:col-span-8 ${
                    showMobileDetail ? 'block' : 'hidden lg:block'
                }`}>
                    <AnimatePresence mode="wait">
                        {selectedTopic ? (
                            <PrerequisiteDetail
                                key={selectedTopic.prerequisite_name}
                                item={selectedTopic}
                                isMastered={masteredList.includes(selectedTopic.prerequisite_name)}
                                onToggleMastered={() => handleToggleMastered(selectedTopic.prerequisite_name)}
                                onBack={() => setShowMobileDetail(false)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/[0.08] rounded-3xl bg-white/[0.01]">
                                <span className="text-4xl mb-3">👈</span>
                                <p className="text-stone-400 font-bold text-sm">Select a prerequisite node to start studying.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default OrganicBridgeExplorer;
