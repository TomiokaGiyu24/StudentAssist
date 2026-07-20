import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGraphsContent, loadChapterContent, getChapterFileSlug, loadPhysicsQuestions } from '../utils/contentLoader';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { 
    ArrowLeft, Sliders, AlertTriangle, Shield, CheckSquare, 
    TrendingUp, RefreshCw, BarChart2, Check, HelpCircle, X,
    LayoutGrid, Columns, ChevronLeft, ChevronRight
} from 'lucide-react';
import LatexText from '../components/LatexText';

// ==========================================
// INTERACTIVE SVG PLOTTER COMPONENT
// ==========================================
const InteractiveSVGPlot = ({ graphId, params, activeTab, transType, xAxisLabel, yAxisLabel }) => {
    const width = 500;
    const height = 400;
    const padding = 60;

    // Helper: Draw Grid lines
    const renderGrid = () => {
        const lines = [];
        // Horizontal grid lines
        for (let y = padding; y <= height - padding; y += 40) {
            lines.push(
                <line 
                    key={`h-${y}`} 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="1"
                    strokeDasharray="2,4"
                />
            );
        }
        // Vertical grid lines
        for (let x = padding; x <= width - padding; x += 50) {
            lines.push(
                <line 
                    key={`v-${x}`} 
                    x1={x} 
                    y1={padding} 
                    x2={x} 
                    y2={height - padding} 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="1"
                    strokeDasharray="2,4"
                />
            );
        }
        return lines;
    };

    // Helper: Draw Axes
    const renderAxes = () => {
        return (
            <g>
                {/* X Axis */}
                <line 
                    x1={padding} 
                    y1={height - padding} 
                    x2={width - padding + 20} 
                    y2={height - padding} 
                    stroke="rgba(255, 255, 255, 0.4)" 
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                />
                {/* Y Axis */}
                <line 
                    x1={padding} 
                    y1={height - padding} 
                    x2={padding} 
                    y2={padding - 20} 
                    stroke="rgba(255, 255, 255, 0.4)" 
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                />
                {/* Origin */}
                <text 
                    x={padding - 15} 
                    y={height - padding + 15} 
                    fill="rgba(255, 255, 255, 0.4)" 
                    fontSize="10" 
                    fontFamily="monospace"
                    textAnchor="middle"
                >
                    (0,0)
                </text>
            </g>
        );
    };

    // Render Curves based on Graph ID and UI parameters
    const renderGraphPaths = () => {
        const paths = [];

        // Origin coords in SVG space
        const originX = padding;
        const originY = height - padding;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        if (graphId === "CH1-GR-01") {
            const k = parseFloat(params.gr1Permittivity || 1); 
            const chargeProd = parseFloat(params.gr1ChargeProduct || 1.0); 
            
            if (activeTab === 'transformations' && transType === 0) {
                const points = [];
                const C = 60000 * chargeProd / k;
                for (let xMath = 25; xMath <= graphWidth; xMath++) {
                    const yVal = C / (xMath * xMath);
                    const xSvg = originX + xMath;
                    const ySvg = originY - Math.min(graphHeight, yVal);
                    points.push(`${xSvg},${ySvg}`);
                }
                paths.push(
                    <path 
                        key="hyperbola"
                        d={`M ${points.join(' L ')}`} 
                        fill="none" 
                        stroke="#00f2ff" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(
                    <text key="lbl" x={width - 120} y={150} fill="#00f2ff" fontSize="12" fontFamily="monospace">
                        F ∝ 1/r²
                    </text>
                );
            } 
            else if (activeTab === 'transformations' && transType === 1) {
                const startX = originX + 20;
                const startY = padding + 40;
                const endX = width - padding - 20;
                const endY = originY - 20;
                paths.push(
                    <line 
                        key="log-line"
                        x1={startX} 
                        y1={startY} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#00f2ff" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(
                    <text key="log-slope" x={endX - 80} y={endY - 20} fill="#00f2ff" fontSize="11" fontFamily="monospace">
                        Slope (m) = -2
                    </text>
                );
            } 
            else {
                const slope1 = (0.75 * chargeProd) / k;
                const slope2 = 0.4 / k; 

                const dashLen = graphWidth * 0.05;
                const midX1 = originX + dashLen;
                const midY1 = originY - (dashLen * slope1);
                const endX1 = originX + graphWidth - 20;
                const endY1 = originY - ((graphWidth - 20) * slope1);

                paths.push(
                    <line 
                        key="line1-dash"
                        x1={originX} 
                        y1={originY} 
                        x2={midX1} 
                        y2={midY1} 
                        stroke="#00f2ff" 
                        strokeWidth="3.5"
                        strokeDasharray="3,3"
                    />
                );
                paths.push(
                    <line 
                        key="line1-solid"
                        x1={midX1} 
                        y1={midY1} 
                        x2={endX1} 
                        y2={endY1} 
                        stroke="#00f2ff" 
                        strokeWidth="3.5"
                    />
                );

                const midX2 = originX + dashLen;
                const midY2 = originY - (dashLen * slope2);
                const endX2 = originX + graphWidth - 10;
                const endY2 = originY - ((graphWidth - 10) * slope2);

                paths.push(
                    <line 
                        key="line2-dash"
                        x1={originX} 
                        y1={originY} 
                        x2={midX2} 
                        y2={midY2} 
                        stroke="rgba(0, 242, 255, 0.3)" 
                        strokeWidth="2.5"
                        strokeDasharray="3,3"
                    />
                );
                paths.push(
                    <line 
                        key="line2-solid"
                        x1={midX2} 
                        y1={midY2} 
                        x2={endX2} 
                        y2={endY2} 
                        stroke="rgba(0, 242, 255, 0.3)" 
                        strokeWidth="2.5"
                    />
                );

                paths.push(
                    <text key="l1" x={endX1 - 10} y={endY1 - 10} fill="#00f2ff" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                        |q₁q₂| (Pair 1)
                    </text>
                );
                paths.push(
                    <text key="l2" x={endX2 - 10} y={endY2 - 10} fill="rgba(0, 242, 255, 0.5)" fontSize="11" fontFamily="sans-serif">
                        |q₂q₃| (Pair 2)
                    </text>
                );
            }
        } 
        else if (graphId === "CH1-GR-02") {
            const k = parseFloat(params.gr2Permittivity || 1);
            const q = parseFloat(params.gr2Charge || 1.0);
            const isSolidSphere = params.gr2SolidSphere === true;
            const R = 150; 

            if (activeTab === 'transformations' && transType === 0) {
                const startX = originX + 120;
                const endX = originX + graphWidth - 25;
                const startY = originY - 10;
                const endY = originY - (120 * q / k);

                paths.push(
                    <line 
                        key="linearized-decay"
                        x1={startX} 
                        y1={startY} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#00ff66" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(
                    <line 
                        key="linearized-origin-dash"
                        x1={originX} 
                        y1={originY} 
                        x2={startX} 
                        y2={startY} 
                        stroke="#00ff66" 
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        opacity="0.5"
                    />
                );
                paths.push(<circle key="pt-linear" cx={startX} cy={startY} r="4.5" fill="#030307" stroke="#00ff66" strokeWidth="2" />);
                paths.push(<text key="lbl-r" x={startX} y={originY + 15} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">1/R²</text>);
            } 
            else if (activeTab === 'transformations' && transType === 1) {
                const startX = originX + 80;
                const endX = originX + graphWidth - 30;
                const startY = padding + 50;
                const endY = originY - 30;
                paths.push(
                    <line 
                        key="log-decay"
                        x1={startX} 
                        y1={startY} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#00ff66" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(<circle key="pt-log" cx={startX} cy={startY} r="4.5" fill="#030307" stroke="#00ff66" strokeWidth="2" />);
                paths.push(<text key="log-text" x={startX} y={originY + 15} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">ln(R)</text>);
            } 
            else {
                const eMaxY = originY - (140 * q / k);
                const boundaryX = originX + R;

                if (isSolidSphere) {
                    paths.push(
                        <line 
                            key="solid-interior"
                            x1={originX} 
                            y1={originY} 
                            x2={boundaryX} 
                            y2={eMaxY} 
                            stroke="#00ff66" 
                            strokeWidth="3.5"
                        />
                    );
                } else {
                    paths.push(
                        <line 
                            key="shell-interior"
                            x1={originX} 
                            y1={originY} 
                            x2={boundaryX} 
                            y2={originY} 
                            stroke="#00ff66" 
                            strokeWidth="4.5"
                        />
                    );
                    paths.push(
                        <circle 
                            key="interior-limit" 
                            cx={boundaryX} 
                            cy={originY} 
                            r="4.5" 
                            fill="#030307" 
                            stroke="#00ff66" 
                            strokeWidth="2.5" 
                        />
                    );
                    paths.push(
                        <line 
                            key="discontinuity"
                            x1={boundaryX} 
                            y1={originY} 
                            x2={boundaryX} 
                            y2={eMaxY} 
                            stroke="rgba(255,255,255,0.4)" 
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                        />
                    );
                }

                const points = [];
                const eMaxValMath = originY - eMaxY;
                const C = eMaxValMath * R * R;
                
                for (let xMath = R; xMath <= graphWidth; xMath++) {
                    const yVal = C / (xMath * xMath);
                    const xSvg = originX + xMath;
                    const ySvg = originY - yVal;
                    points.push(`${xSvg},${ySvg}`);
                }

                paths.push(
                    <path 
                        key="exterior-decay"
                        d={`M ${points.join(' L ')}`} 
                        fill="none" 
                        stroke="#00ff66" 
                        strokeWidth="3.5"
                    />
                );

                paths.push(
                    <circle 
                        key="peak-dot"
                        cx={boundaryX} 
                        cy={eMaxY} 
                        r="5.5" 
                        fill="#00ff66" 
                    />
                );

                paths.push(<text key="lbl-r" x={boundaryX} y={originY + 18} fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="bold" textAnchor="middle">r = R</text>);
                paths.push(<text key="lbl-emax" x={boundaryX - 10} y={eMaxY - 10} fill="#00ff66" fontSize="10" fontWeight="bold" textAnchor="end">E_max = σ/ε₀</text>);
                paths.push(<text key="lbl-prop" x={boundaryX + 100} y={eMaxY + 50} fill="#00ff66" fontSize="11" fontFamily="monospace">E ∝ 1/r²</text>);
                
                if (isSolidSphere) {
                    paths.push(<text key="lbl-solid" x={boundaryX - 60} y={eMaxY + 40} fill="#00ff66" fontSize="10" fontFamily="monospace">E ∝ r</text>);
                }
            }
        } 
        else if (graphId === "CH1-GR-03") {
            const lambdaContrast = params.gr3LambdaContrast === true;
            
            if (activeTab === 'transformations' && transType === 0) {
                const endX1 = originX + graphWidth - 30;
                const endY1 = originY - 180;
                paths.push(<line key="lin-line" x1={originX} y1={originY} x2={endX1} y2={endY1} stroke="#b500ff" strokeWidth="3.5" />);
                paths.push(<text key="lin-lbl" x={endX1 - 10} y={endY1 - 10} fill="#b500ff" fontSize="11" fontFamily="monospace">m ∝ λ</text>);
            } 
            else if (activeTab === 'transformations' && transType === 1) {
                const startX = originX + 30;
                const startY = padding + 40;
                const endX = width - padding - 30;
                const endY = originY - 30;
                paths.push(<line key="log-log-line" x1={startX} y1={startY} x2={endX} y2={endY} stroke="#b500ff" strokeWidth="3.5" />);
                paths.push(<text key="log-slope" x={endX - 80} y={endY - 20} fill="#b500ff" fontSize="11" fontFamily="monospace">Slope (m) = -1</text>);
            } 
            else {
                const C_line = 18000;
                const pointsLine = [];
                for (let xMath = 50; xMath <= graphWidth; xMath++) {
                    const yVal = C_line / xMath;
                    const xSvg = originX + xMath;
                    const ySvg = originY - yVal;
                    pointsLine.push(`${xSvg},${ySvg}`);
                }
                
                paths.push(
                    <path 
                        key="line-decay"
                        d={`M ${pointsLine.join(' L ')}`} 
                        fill="none" 
                        stroke="#b500ff" 
                        strokeWidth="3.5"
                    />
                );

                if (params.gr3ShowPointCharge !== false) {
                    const C_point = 18000 * 50;
                    const pointsPoint = [];
                    for (let xMath = 50; xMath <= graphWidth; xMath++) {
                        const yVal = C_point / (xMath * xMath);
                        const xSvg = originX + xMath;
                        const ySvg = originY - Math.min(graphHeight, yVal);
                        pointsPoint.push(`${xSvg},${ySvg}`);
                    }
                    paths.push(
                        <path 
                            key="point-decay"
                            d={`M ${pointsPoint.join(' L ')}`} 
                            fill="none" 
                            stroke="rgba(255, 255, 255, 0.2)" 
                            strokeWidth="2"
                            strokeDasharray="4,4"
                        />
                    );
                    paths.push(
                        <text key="pt-lbl" x={150} y={originY - 20} fill="rgba(255, 255, 255, 0.4)" fontSize="10">
                            Point Charge (1/r²)
                        </text>
                    );
                }

                if (lambdaContrast) {
                    const pointsLine2 = [];
                    for (let xMath = 50; xMath <= graphWidth; xMath++) {
                        const yVal = (C_line * 0.65) / xMath;
                        const xSvg = originX + xMath;
                        const ySvg = originY - yVal;
                        pointsLine2.push(`${xSvg},${ySvg}`);
                    }
                    paths.push(
                        <path 
                            key="line-decay-low"
                            d={`M ${pointsLine2.join(' L ')}`} 
                            fill="none" 
                            stroke="rgba(181, 0, 255, 0.4)" 
                            strokeWidth="2.5"
                        />
                    );
                    paths.push(<text key="lbl-l1" x={width - 120} y={originY - 70} fill="#b500ff" fontSize="10" fontWeight="bold">λ₁ (high)</text>);
                    paths.push(<text key="lbl-l2" x={width - 120} y={originY - 35} fill="rgba(181,0,255,0.6)" fontSize="10">λ₂ (low)</text>);
                } else {
                    paths.push(
                        <text key="line-lbl" x={width - 140} y={originY - 70} fill="#b500ff" fontSize="11" fontFamily="monospace">
                            E ∝ 1/r (Line Charge)
                        </text>
                    );
                }
            }
        } 
        else if (graphId === "CH1-GR-04") {
            const k = parseFloat(params.gr4Permittivity || 1);
            const sheetSetup = params.gr4SheetSetup || 'single';

            if (sheetSetup === 'transverse') {
                const centerX = originX + graphWidth / 2;
                const fieldHeight = 80 / k;

                paths.push(<line key="trans-pos" x1={centerX} y1={originY - fieldHeight} x2={width - padding - 20} y2={originY - fieldHeight} stroke="#ffaa00" strokeWidth="3.5" />);
                paths.push(<line key="trans-neg" x1={padding + 20} y1={originY + fieldHeight} x2={centerX} y2={originY + fieldHeight} stroke="#ffaa00" strokeWidth="3.5" />);
                
                paths.push(<line key="y-divider" x1={centerX} y1={padding} x2={centerX} y2={height-padding} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3,3" />);
                
                paths.push(<circle key="trans-pos-circle" cx={centerX} cy={originY - fieldHeight} r="4.5" fill="#030307" stroke="#ffaa00" strokeWidth="2" />);
                paths.push(<circle key="trans-neg-circle" cx={centerX} cy={originY + fieldHeight} r="4.5" fill="#030307" stroke="#ffaa00" strokeWidth="2" />);
                
                paths.push(<text key="lbl-pos" x={width - padding - 40} y={originY - fieldHeight - 10} fill="#ffaa00" fontSize="10" fontWeight="bold">+σ/2ε₀</text>);
                paths.push(<text key="lbl-neg" x={padding + 40} y={originY + fieldHeight + 18} fill="#ffaa00" fontSize="10" fontWeight="bold">-σ/2ε₀</text>);
                paths.push(<text key="lbl-zero" x={centerX + 8} y={originY + 15} fill="rgba(255,255,255,0.6)" fontSize="10">x = 0</text>);
            } 
            else if (sheetSetup === 'dual') {
                const d1 = 120;
                const d2 = 240;
                const fieldHeight = 120 / k;

                paths.push(<line key="dual-i" x1={originX} y1={originY} x2={originX + d1} y2={originY} stroke="#ffaa00" strokeWidth="4.5" />);
                paths.push(<line key="dual-ii" x1={originX + d1} y1={originY - fieldHeight} x2={originX + d2} y2={originY - fieldHeight} stroke="#ffaa00" strokeWidth="3.5" />);
                paths.push(<line key="dual-iii" x1={originX + d2} y1={originY} x2={originX + graphWidth - 10} y2={originY} stroke="#ffaa00" strokeWidth="4.5" />);

                paths.push(<line key="v-jump-1" x1={originX + d1} y1={originY} x2={originX + d1} y2={originY - fieldHeight} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />);
                paths.push(<line key="v-jump-2" x1={originX + d2} y1={originY} x2={originX + d2} y2={originY - fieldHeight} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />);
                
                paths.push(<circle key="c1" cx={originX + d1} cy={originY} r="4.5" fill="#030307" stroke="#ffaa00" strokeWidth="2" />);
                paths.push(<circle key="c2" cx={originX + d2} cy={originY} r="4.5" fill="#030307" stroke="#ffaa00" strokeWidth="2" />);
                paths.push(<circle key="c3" cx={originX + d1} cy={originY - fieldHeight} r="4.5" fill="#ffaa00" />);
                paths.push(<circle key="c4" cx={originX + d2} cy={originY - fieldHeight} r="4.5" fill="#ffaa00" />);

                paths.push(<text key="lbl-i" x={originX + d1/2} y={originY - 15} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">Reg I (E=0)</text>);
                paths.push(<text key="lbl-ii" x={originX + (d1+d2)/2} y={originY - fieldHeight - 10} fill="#ffaa00" fontSize="10" fontWeight="bold" textAnchor="middle">Reg II (E = σ/ε₀)</text>);
                paths.push(<text key="lbl-iii" x={originX + d2 + 50} y={originY - 15} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">Reg III (E=0)</text>);
            } 
            else {
                const fieldHeight = 90 / k;
                const endX = originX + graphWidth - 20;

                paths.push(
                    <line 
                        key="sheet-constant"
                        x1={originX} 
                        y1={originY - fieldHeight} 
                        x2={endX} 
                        y2={originY - fieldHeight} 
                        stroke="#ffaa00" 
                        strokeWidth="3.5"
                    />
                );

                paths.push(<circle key="crosshair" cx={originX} cy={originY - fieldHeight} r="4.5" fill="#fff" stroke="#ffaa00" strokeWidth="2" />);
                paths.push(<text key="lbl-intercept" x={originX + 15} y={originY - fieldHeight - 12} fill="#fff" fontSize="11" fontWeight="bold">E = σ/2ε₀</text>);
                paths.push(<text key="lbl-prop" x={width / 2} y={originY - fieldHeight + 20} fill="#ffaa00" fontSize="11" fontFamily="monospace" textAnchor="middle">E ∝ r⁰ (Distance Independent)</text>);
            }
        } 
        else if (graphId === "CH1-GR-05") {
            const isAlpha = params.gr5Particle === 'alpha';
            const massScale = isAlpha ? 0.5 : 1.0;
            const transform = params.gr5Transform || 'none';

            if (transform === 'reciprocal') {
                const slope = 180 * massScale;
                const endX = originX + graphWidth - 30;
                const endY = originY - ((graphWidth - 30) * slope / 300);

                paths.push(
                    <line 
                        key="lin-accel"
                        x1={originX} 
                        y1={originY} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#ff5500" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(<text key="lin-lbl" x={endX - 10} y={endY - 10} fill="#ff5500" fontSize="11" fontFamily="monospace">a ∝ 1/r² (Linear)</text>);
            } 
            else if (transform === 'phase-space') {
                const r0 = 50;
                const points = [];
                for (let xMath = r0; xMath <= graphWidth; xMath++) {
                    const val = 12000 * massScale * (1/r0 - 1/xMath);
                    const yVal = Math.sqrt(Math.max(0, val));
                    const xSvg = originX + xMath;
                    const ySvg = originY - yVal;
                    points.push(`${xSvg},${ySvg}`);
                }

                paths.push(
                    <path 
                        key="phase-space-v"
                        d={`M ${points.join(' L ')}`} 
                        fill="none" 
                        stroke="#ff5500" 
                        strokeWidth="3.5"
                    />
                );
                const maxVal = Math.sqrt(12000 * massScale / r0);
                const ceilingY = originY - maxVal;
                paths.push(
                    <line 
                        key="v-ceiling"
                        x1={originX + r0} 
                        y1={ceilingY} 
                        x2={width - padding - 10} 
                        y2={ceilingY} 
                        stroke="rgba(255, 85, 0, 0.25)" 
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                    />
                );

                paths.push(<circle key="r0-dot" cx={originX + r0} cy={originY} r="4.5" fill="#ff5500" />);
                paths.push(<text key="lbl-r0" x={originX + r0} y={originY + 15} fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">r = r₀</text>);
                paths.push(<text key="lbl-vmax" x={width - padding - 80} y={ceilingY - 8} fill="rgba(255, 85, 0, 0.8)" fontSize="9" fontFamily="monospace">v_escape ceiling</text>);
            } 
            else {
                const C = 200000 * massScale;
                const points = [];
                for (let xMath = 30; xMath <= graphWidth; xMath++) {
                    const yVal = C / (xMath * xMath);
                    const xSvg = originX + xMath;
                    const ySvg = originY - Math.min(graphHeight, yVal);
                    points.push(`${xSvg},${ySvg}`);
                }

                paths.push(
                    <path 
                        key="accel-decay"
                        d={`M ${points.join(' L ')}`} 
                        fill="none" 
                        stroke="#ff5500" 
                        strokeWidth="3.5"
                    />
                );
                paths.push(
                    <text key="lbl-prop" x={width - 150} y={originY - 80} fill="#ff5500" fontSize="11" fontFamily="monospace">
                        a ∝ 1/r² (Proton)
                    </text>
                );

                if (isAlpha) {
                    const C_alpha = C * 0.5;
                    const pointsAlpha = [];
                    for (let xMath = 30; xMath <= graphWidth; xMath++) {
                        const yVal = C_alpha / (xMath * xMath);
                        const xSvg = originX + xMath;
                        const ySvg = originY - Math.min(graphHeight, yVal);
                        pointsAlpha.push(`${xSvg},${ySvg}`);
                    }
                    paths.push(
                        <path 
                            key="accel-decay-alpha"
                            d={`M ${pointsAlpha.join(' L ')}`} 
                            fill="none" 
                            stroke="rgba(255, 85, 0, 0.4)" 
                            strokeWidth="2.5"
                        />
                    );
                    paths.push(<text key="lbl-alpha" x={width - 150} y={originY - 35} fill="rgba(255, 85, 0, 0.6)" fontSize="10">a_α ∝ 1/2r² (Alpha)</text>);
                }
            }
        }

        return paths;
    };

    return (
        <div className="w-full h-full bg-[#07070b]/60 rounded-2xl p-3 md:p-4 backdrop-blur-md relative overflow-hidden flex items-center justify-center">
            {/* SVG Plot view */}
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
            >
                <defs>
                    <marker 
                        id="arrow" 
                        viewBox="0 0 10 10" 
                        refX="6" 
                        refY="5" 
                        markerWidth="6" 
                        markerHeight="6" 
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.4)" />
                    </marker>
                </defs>
                {/* 1. Grid */}
                {renderGrid()}
                {/* 2. Paths */}
                {renderGraphPaths()}
                {/* 3. Coordinate Axes */}
                {renderAxes()}

                {/* 4. Axis Labels rendered via foreignObject for seamless SVG scaling and KaTeX rendering */}
                <foreignObject x={padding + 8} y={15} width={175} height={45} className="overflow-visible select-none pointer-events-none">
                    <div xmlns="http://www.w3.org/1999/xhtml" className="text-[10px] md:text-[11px] font-mono text-cyan-400 bg-[#07070b]/90 border border-cyan-500/20 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.15)] leading-none inline-block">
                        <span className="text-[7px] uppercase tracking-wider text-slate-500 block mb-0.5 font-bold">Y-Axis</span>
                        <LatexText text={yAxisLabel} />
                    </div>
                </foreignObject>

                <foreignObject x={width - padding - 110} y={height - padding + 10} width={180} height={45} className="overflow-visible select-none pointer-events-none">
                    <div xmlns="http://www.w3.org/1999/xhtml" className="text-[10px] md:text-[11px] font-mono text-cyan-400 bg-[#07070b]/90 border border-cyan-500/20 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.15)] leading-none inline-block float-right text-right">
                        <span className="text-[7px] uppercase tracking-wider text-slate-500 block mb-0.5 font-bold">X-Axis</span>
                        <LatexText text={xAxisLabel} />
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
};

// ==========================================
// INTERACTIVE PRACTICE QUESTION CARD
// ==========================================
const InteractiveQuestionCard = ({ question }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExecutionLogic, setShowExecutionLogic] = useState(false);

    const handleOptionSelect = (key) => {
        setSelectedOption(key);
    };

    const isCorrect = selectedOption === question.correct_option;

    return (
        <div className="bg-[#0d0d15]/60 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-cyan-500/25 transition-all shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                    {question.question_id}
                </span>
                <span className="text-[9px] font-mono uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                    {question.format}
                </span>
            </div>

            {/* Stem */}
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                <LatexText text={question.stem_text} />
            </p>

            {/* MCQ Options */}
            {question.options && (
                <div className="space-y-2 pt-2">
                    {Object.entries(question.options).map(([key, label]) => {
                        const isChosen = selectedOption === key;
                        const isOptionCorrect = key === question.correct_option;
                        
                        let optionStyle = "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5";
                        if (isChosen) {
                            optionStyle = isCorrect 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold"
                                : "bg-rose-500/10 border-rose-500/40 text-rose-400";
                        } else if (selectedOption !== null && isOptionCorrect) {
                            optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold";
                        }

                        return (
                            <button
                                key={key}
                                onClick={() => handleOptionSelect(key)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                            >
                                <span className="flex items-start gap-2">
                                    <span className="font-bold uppercase text-slate-500 shrink-0">{key}.</span>
                                    <LatexText text={label} />
                                </span>
                                <span className="shrink-0">
                                    {isChosen && (
                                        isCorrect ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Subjective/Verification feedback */}
            {selectedOption !== null && (
                <div className="pt-2">
                    <button
                        onClick={() => setShowExecutionLogic(!showExecutionLogic)}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showExecutionLogic ? 'Hide Topper Execution Logic' : 'Show Topper Execution Logic'}</span>
                    </button>

                    <AnimatePresence>
                        {showExecutionLogic && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-xs text-amber-200/80 mt-3 italic leading-relaxed">
                                    <strong className="text-white block not-italic mb-1 text-[10px] font-mono uppercase tracking-wider">Topper's Execution Logic:</strong>
                                    "<LatexText text={question.topper_execution_logic} />"
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

// ==========================================
// PHYSICS GRAPHS WORKSPACE
// ==========================================
const PhysicsGraphsPage = () => {
    const { subjectId: paramSubjectId, chapterId } = useParams();
    const subjectId = paramSubjectId || 'physics';

    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState(null);
    const [chapterInfo, setChapterInfo] = useState(null);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [layoutMode, setLayoutMode] = useState('standard'); // standard, split
    const [highlightQuestions, setHighlightQuestions] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isTweakerOpen, setIsTweakerOpen] = useState(false);
    const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [isTransActive, setIsTransActive] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setIsDesktop(window.innerWidth >= 1024);
            if (mobile) {
                setIsRightDrawerOpen(false);
            }
        };
        handleResize();
        setInitialLoadDone(true);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tab view state: controls, questions, check-traps
    const [activeRightTab, setActiveRightTab] = useState('controls'); 
    const [activeTransIndex, setActiveTransIndex] = useState(0);

    // Interactive slider parameters
    const [graphParams, setGraphParams] = useState({
        gr1ChargeProduct: 1.0,
        gr1Permittivity: '1', 
        gr2Permittivity: '1',
        gr2Charge: 1.0,
        gr2SolidSphere: false,
        gr3ShowPointCharge: true,
        gr3LambdaContrast: false,
        gr4Permittivity: '1',
        gr4SheetSetup: 'single', 
        gr5Particle: 'proton', 
        gr5Transform: 'none' 
    });

    // Checkpoint checklist
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Graphs
                const data = await loadGraphsContent(subjectId, chapterId);
                let normalized = [];
                if (data && Array.isArray(data)) {
                    normalized = data.flatMap(item => item.chapter_graph_bank?.graphs || []);
                } else if (data && data.chapter_graph_bank) {
                    normalized = data.chapter_graph_bank.graphs || [];
                }
                setGraphs(normalized);

                // 2. Fetch Chapter Meta Info
                const chapterSlug = getChapterFileSlug(subjectId, chapterId);
                if (chapterSlug) {
                    const chapterData = await loadChapterContent(subjectId, chapterSlug);
                    setChapterInfo(chapterData?.meta);
                }

                // 3. Fetch Practice Questions (to filter possible questions formed)
                const questionsData = await loadPhysicsQuestions(chapterId);
                setAllQuestions(questionsData?.questions || []);

                if (normalized.length > 0) {
                    setSelectedGraph(normalized[0]);
                }
            } catch (error) {
                console.error("Error loading chapter graphs/questions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, chapterId]);

    // Reset right panel tab state when active graph changes
    useEffect(() => {
        setActiveRightTab('questions');
        setActiveTransIndex(0);
        setIsTransActive(false);
        setCheckedItems({});
    }, [selectedGraph]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030307] flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-cyan-400 font-mono tracking-wider animate-pulse text-xs">BOOTING GRAPH WORKSPACE...</p>
            </div>
        );
    }

    if (graphs.length === 0) {
        return (
            <div className="min-h-screen bg-[#030307] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl">📈</div>
                <h2 className="text-2xl text-white font-bold mb-4">No Graphs Found</h2>
                <p className="text-white/40 max-w-md mb-8">This chapter does not have any graph analysis profiles loaded yet.</p>
                <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-all">
                    Back to Chapter Dashboard
                </Link>
            </div>
        );
    }

    const currentGraph = selectedGraph || graphs[0];

    // Filter questions matching current graph ID using text keywords matching
    const getAssociatedQuestions = () => {
        if (!allQuestions || !Array.isArray(allQuestions)) return [];
        
        return allQuestions.filter(q => {
            const textToMatch = `${q.stem_text} ${q.topper_execution_logic} ${q.associated_trap_title || ''} ${JSON.stringify(q.options || {})}`.toLowerCase();
            const graphId = currentGraph.graph_id;

            if (graphId === "CH1-GR-01") {
                return textToMatch.includes("coulomb") && (textToMatch.includes("1/r") || textToMatch.includes("slope"));
            }
            if (graphId === "CH1-GR-02") {
                return textToMatch.includes("shell") || textToMatch.includes("spherical");
            }
            if (graphId === "CH1-GR-03") {
                return textToMatch.includes("line charge") || textToMatch.includes("straight wire") || textToMatch.includes("linear charge");
            }
            if (graphId === "CH1-GR-04") {
                return textToMatch.includes("sheet") || textToMatch.includes("plane");
            }
            if (graphId === "CH1-GR-05") {
                return textToMatch.includes("acceleration") || textToMatch.includes("released") || textToMatch.includes("mass");
            }
            return false;
        });
    };

    const matchedQuestions = getAssociatedQuestions();

    const toggleCheckbox = (idx) => {
        setCheckedItems(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const updateParam = (key, value) => {
        setGraphParams(prev => ({
            ...prev,
            [key]: value
        }));
        
        // Flash visual highlight on the Questions field to indicate mapping connection
        setHighlightQuestions(true);
        setTimeout(() => {
            setHighlightQuestions(false);
        }, 1200);
    };

    const getAxisLabels = () => {
        if (graphParams.gr5Transform !== 'none' && currentGraph.graph_id === "CH1-GR-05") {
            const activeTrans = currentGraph.axis_transformations?.[activeTransIndex];
            if (activeTrans) {
                return { x: activeTrans.mutated_x_axis, y: activeTrans.mutated_y_axis };
            }
        }
        if (isTransActive && currentGraph.axis_transformations?.[activeTransIndex]) {
            return {
                x: currentGraph.axis_transformations[activeTransIndex].mutated_x_axis,
                y: currentGraph.axis_transformations[activeTransIndex].mutated_y_axis
            };
        }
        return {
            x: currentGraph.base_axis_definition?.x_axis || 'X Axis',
            y: currentGraph.base_axis_definition?.y_axis || 'Y Axis'
        };
    };

    // Helper rendering function for Variations & Parameter Mutators
    const renderControlsPaneContent = () => {
        return (
            <>
                {/* Graph parameter mutators */}
                <div className="space-y-4">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span>Graph Parameter Mutators</span>
                    </h4>

                    {/* Parameters for Graph 1 */}
                    {currentGraph.graph_id === "CH1-GR-01" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-400">
                                        <LatexText text="Charge Product magnitude $|q_1 q_2|$:" />
                                    </span>
                                    <span className="text-cyan-400 font-mono font-bold">{graphParams.gr1ChargeProduct}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.0" 
                                    step="0.1" 
                                    value={graphParams.gr1ChargeProduct}
                                    onChange={(e) => updateParam('gr1ChargeProduct', parseFloat(e.target.value))}
                                    className="w-full accent-cyan-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-slate-400 block mb-1.5">
                                    <LatexText text="Relative Permittivity of Medium ($K$):" />
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Vacuum ($K=1$)', val: '1' },
                                        { label: 'Medium ($K=2$)', val: '2' },
                                        { label: 'Dielectric ($K=4$)', val: '4' }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateParam('gr1Permittivity', item.val)}
                                            className={`px-2.5 py-2 text-xs rounded-xl font-bold border transition-all ${
                                                graphParams.gr1Permittivity === item.val
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <LatexText text={item.label} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parameters for Graph 2 */}
                    {currentGraph.graph_id === "CH1-GR-02" && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <span className="text-xs text-slate-400">Insulating Solid Sphere Mode:</span>
                                <button
                                    onClick={() => updateParam('gr2SolidSphere', !graphParams.gr2SolidSphere)}
                                    className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                                        graphParams.gr2SolidSphere
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                            : 'bg-white/5 border-white/5 text-slate-400'
                                    }`}
                                >
                                    {graphParams.gr2SolidSphere ? 'Solid Sphere' : 'Hollow Shell'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-400">
                                        <LatexText text="Total charge ($q$):" />
                                    </span>
                                    <span className="text-cyan-400 font-mono font-bold">{graphParams.gr2Charge}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="1.5" 
                                    step="0.1" 
                                    value={graphParams.gr2Charge}
                                    onChange={(e) => updateParam('gr2Charge', parseFloat(e.target.value))}
                                    className="w-full accent-cyan-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-slate-400 block mb-1.5">
                                    <LatexText text="Dielectric Permittivity ($K$):" />
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Vacuum ($K=1$)', val: '1' },
                                        { label: 'Dielectric ($K=2.5$)', val: '2.5' }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateParam('gr2Permittivity', item.val)}
                                            className={`px-3 py-2 text-xs rounded-xl font-bold border transition-all ${
                                                graphParams.gr2Permittivity === item.val
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <LatexText text={item.label} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parameters for Graph 3 */}
                    {currentGraph.graph_id === "CH1-GR-03" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <span className="text-xs text-slate-400">
                                    <LatexText text="Contrast charge densities ($\lambda_1 > \lambda_2$):" />
                                </span>
                                <button
                                    onClick={() => updateParam('gr3LambdaContrast', !graphParams.gr3LambdaContrast)}
                                    className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                                        graphParams.gr3LambdaContrast
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                            : 'bg-white/5 border-white/5 text-slate-400'
                                    }`}
                                >
                                    {graphParams.gr3LambdaContrast ? 'Comparison On' : 'Single wire'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    <LatexText text="Show Point Charge reference curve ($1/r^2$):" />
                                </span>
                                <button
                                    onClick={() => updateParam('gr3ShowPointCharge', !graphParams.gr3ShowPointCharge)}
                                    className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                                        graphParams.gr3ShowPointCharge
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                            : 'bg-white/5 border-white/5 text-slate-400'
                                    }`}
                                >
                                    {graphParams.gr3ShowPointCharge ? 'Show reference' : 'Hide reference'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Parameters for Graph 4 */}
                    {currentGraph.graph_id === "CH1-GR-04" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <span className="text-xs text-slate-400 block mb-1.5">Infinite Sheet configuration setup:</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Single Sheet', val: 'single' },
                                        { label: 'Transverse ($\\pm x$)', val: 'transverse' },
                                        { label: 'Dual ($+$ & $-$)', val: 'dual' }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateParam('gr4SheetSetup', item.val)}
                                            className={`px-2.5 py-2 text-xs rounded-xl font-bold border transition-all ${
                                                graphParams.gr4SheetSetup === item.val
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <LatexText text={item.label} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-slate-400 block mb-1.5">
                                    <LatexText text="Permittivity index ($K$):" />
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Vacuum ($K=1$)', val: '1' },
                                        { label: 'Dielectric ($K=2.0$)', val: '2' }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateParam('gr4Permittivity', item.val)}
                                            className={`px-3 py-2 text-xs rounded-xl font-bold border transition-all ${
                                                graphParams.gr4Permittivity === item.val
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <LatexText text={item.label} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parameters for Graph 5 */}
                    {currentGraph.graph_id === "CH1-GR-05" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <span className="text-xs text-slate-400 block mb-1.5">Released particle configuration:</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Proton ($m_p, e$)', val: 'proton' },
                                        { label: 'Alpha ($4m_p, 2e$)', val: 'alpha' }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            onClick={() => updateParam('gr5Particle', item.val)}
                                            className={`px-3 py-2 text-xs rounded-xl font-bold border transition-all ${
                                                graphParams.gr5Particle === item.val
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <LatexText text={item.label} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Axis transformations */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-cyan-400" />
                        <span>Axis Transformations & Proofs</span>
                    </h4>

                    <div className="flex flex-col gap-2.5">
                        {currentGraph.axis_transformations?.map((trans, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveTransIndex(idx);
                                    setIsTransActive(true);
                                    if (currentGraph.graph_id === "CH1-GR-05") {
                                        updateParam('gr5Transform', idx === 0 ? 'reciprocal' : 'phase-space');
                                    } else {
                                        setHighlightQuestions(true);
                                        setTimeout(() => setHighlightQuestions(false), 1200);
                                    }
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                                    isTransActive && activeTransIndex === idx
                                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-md'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <span className="text-[9px] font-bold font-mono tracking-widest block uppercase text-slate-500 mb-1">
                                    Transformation {idx + 1}
                                </span>
                                <span className="text-xs font-bold block leading-snug">{trans.transformation_title}</span>
                            </button>
                        ))}

                        {/* Reset button */}
                        {(isTransActive || (currentGraph.graph_id === "CH1-GR-05" && graphParams.gr5Transform !== 'none')) && (
                            <button
                                onClick={() => {
                                    setIsTransActive(false);
                                    setActiveTransIndex(0);
                                    if (currentGraph.graph_id === "CH1-GR-05") {
                                        updateParam('gr5Transform', 'none');
                                    } else {
                                        setHighlightQuestions(true);
                                        setTimeout(() => setHighlightQuestions(false), 1200);
                                    }
                                }}
                                className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all text-center flex items-center justify-center gap-2 mt-1"
                            >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Reset to Base Visualizer</span>
                            </button>
                        )}
                    </div>

                    {/* Transformation description box */}
                    {(isTransActive || (currentGraph.graph_id === "CH1-GR-05" && graphParams.gr5Transform !== 'none')) && currentGraph.axis_transformations?.[activeTransIndex] && (
                        <div className="bg-[#0c0c14]/40 border border-white/5 rounded-2xl p-4 space-y-4 mt-2">
                            <div className="bg-[#030307]/50 rounded-xl p-3 border border-white/5 overflow-x-auto flex items-center justify-center">
                                <BlockMath math={currentGraph.axis_transformations[activeTransIndex].algebraic_derivation} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Description:</span>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    <LatexText text={currentGraph.axis_transformations[activeTransIndex].geometric_transformation_description} />
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[10px] pt-3.5 border-t border-white/5">
                                <div className="space-y-0.5">
                                    <span className="text-slate-500 block uppercase font-bold text-[8px]">New X-Axis</span>
                                    <span className="font-bold text-white font-mono leading-tight block">
                                        <LatexText text={currentGraph.axis_transformations[activeTransIndex].mutated_x_axis} />
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-slate-500 block uppercase font-bold text-[8px]">New Y-Axis</span>
                                    <span className="font-bold text-white font-mono leading-tight block">
                                        <LatexText text={currentGraph.axis_transformations[activeTransIndex].mutated_y_axis} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

    // Helper rendering function for Questions list
    const renderQuestionsPaneContent = () => {
        return (
            <div className="space-y-5">
                <div className="border-b border-white/5 pb-2">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Possible Board Questions Formed</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        These are real board exam mapping questions extracted from the active chapter database associated with this graph profile.
                    </p>
                </div>

                {matchedQuestions.length > 0 ? (
                    <div className="space-y-4">
                        {matchedQuestions.map((q, idx) => (
                            <InteractiveQuestionCard key={idx} question={q} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#0d0d15]/20 border border-dashed border-white/5 rounded-2xl p-6 text-center text-xs text-slate-500 italic">
                        No exact question matches found for this graph in the MCQ bank.
                    </div>
                )}
            </div>
        );
    };

    // Helper rendering function for Checklist, Traps, and Topper logic
    const renderCheckpointsPaneContent = () => {
        return (
            <div className="space-y-6 pt-4 border-t border-white/5">
                {/* Checklist */}
                <div className="space-y-4">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                        <span>Examiner's Checkpoints</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Board examiners check these items strictly. Mark them off as you verify them on the graph:
                    </p>

                    <div className="space-y-3">
                        {currentGraph.non_negotiable_visual_checkpoints?.map((checkpoint, idx) => {
                            const isChecked = checkedItems[idx] === true;
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => toggleCheckbox(idx)}
                                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-3 select-none ${
                                        isChecked
                                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                                            : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        isChecked 
                                            ? 'bg-cyan-500 border-cyan-500 text-[#030307]' 
                                            : 'border-white/20 text-transparent'
                                    }`}>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="text-[11px] leading-relaxed font-medium">
                                        <LatexText text={checkpoint} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Traps & Shields */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Examiner Deduction Traps</span>
                    </h4>

                    <div className="space-y-4">
                        {currentGraph.examiner_deduction_traps?.map((trap, index) => (
                            <div key={index} className="bg-[#0d0d15]/50 border border-white/5 rounded-2xl p-5 space-y-3.5">
                                <div className="flex items-center gap-2 text-rose-400">
                                    <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                                    <h5 className="font-extrabold text-xs tracking-wide uppercase leading-tight">
                                        Trap: {trap.trap_title}
                                    </h5>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <LatexText text={trap.description} />
                                </p>
                                <div className="bg-rose-950/10 border border-rose-500/10 rounded-xl p-3.5">
                                    <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                        <Shield className="w-3 h-3" />
                                        <span>Defensive Shield:</span>
                                    </span>
                                    <p className="text-xs text-rose-200/90 leading-relaxed italic">
                                        "<LatexText text={trap.structural_shield} />"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Execution Logic */}
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 space-y-3">
                        <h5 className="text-amber-400 text-xs font-extrabold uppercase tracking-wider font-mono flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Topper's Execution Logic</span>
                        </h5>
                        <p className="text-xs text-amber-200/90 leading-relaxed italic">
                            "<LatexText text={currentGraph.topper_execution_logic} />"
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const axes = getAxisLabels();
    const showSidebar = isMobile ? isSidebarOpen : !isSidebarCollapsed;

    return (
        <div className={`w-screen bg-[#030307] text-slate-100 font-sans relative pt-16 ${
            isMobile 
                ? 'min-h-screen overflow-y-auto flex flex-col' 
                : 'h-screen overflow-hidden flex flex-row'
        }`}>
            
            {/* Background glows */}
            <div className="absolute top-[-10%] left-[-15%] w-[45vw] h-[45vw] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-15%] w-[45vw] h-[45vw] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

            {/* MOBILE TITLE HEADER */}
            <div className="md:hidden p-4 bg-[#09090f]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-30 shrink-0 relative w-full">
                <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className="font-bold text-base bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent truncate max-w-[200px]">
                    Graph Lab: {chapterInfo?.chapter || "Physics"}
                </span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white/5 rounded-xl border border-white/5 text-white animate-pulse"
                >
                    <BarChart2 className="w-5 h-5" />
                </button>
            </div>

            {/* SIDEBAR SELECTION PANEL */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`
                            fixed inset-y-0 left-0 md:relative md:inset-auto z-40
                            w-[260px] lg:w-[280px] shrink-0
                            bg-[#07070b]/90 backdrop-blur-xl md:bg-[#07070b]/60 
                            border-r border-white/5 flex flex-col h-full overflow-hidden
                        `}
                    >
                        {/* Sidebar Header */}
                        <div className="p-5 border-b border-white/5 flex flex-col shrink-0">
                            <Link to={`/subjects/${subjectId}/chapters/${chapterId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider mb-4 group">
                                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
                                Back to Dashboard
                            </Link>
                            <div className="flex items-center justify-between">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                    Graph Lab
                                </h1>
                                <button
                                    onClick={() => setIsSidebarCollapsed(true)}
                                    className="hidden md:block p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-slate-500 text-[10px] font-medium mt-1">Interactive Board graph analyses</p>
                        </div>

                        {/* List items */}
                        <div className="p-3 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                            {graphs.map((g) => {
                                const isSelected = currentGraph.graph_id === g.graph_id;
                                return (
                                    <button
                                        key={g.graph_id}
                                        onClick={() => {
                                            setSelectedGraph(g);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden flex flex-col gap-1.5 border ${
                                            isSelected
                                                ? 'bg-cyan-600/10 border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center w-full text-[9px]">
                                            <span className="font-bold font-mono text-cyan-400">{g.graph_id}</span>
                                            <span className="font-medium text-slate-500 uppercase tracking-widest">{g.ncert_reference_section}</span>
                                        </div>
                                        <h3 className={`font-semibold leading-snug transition-colors text-[11px] lg:text-xs ${
                                            isSelected ? 'text-white font-bold' : 'text-slate-300'
                                        }`}>
                                            {g.title}
                                        </h3>
                                        {isSelected && (
                                            <motion.div
                                                layoutId="sidebarActiveGlow"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* MAIN GRAPH AND WORKSPACE DASHBOARD */}
            <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : 'h-full overflow-hidden'} relative z-10`}>
                
                {/* TOP HEADER BAR (DESKTOP) */}
                <div className="hidden md:flex px-6 py-3 border-b border-white/5 bg-[#09090f]/40 backdrop-blur-sm items-center justify-between shrink-0 z-10 w-full">
                    <div className="flex items-center gap-3">
                        {isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center"
                                title="Expand Graph List"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400 font-bold font-mono uppercase tracking-wider">
                                    {currentGraph.graph_id}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium font-mono">
                                    NCERT {currentGraph.ncert_reference_section}
                                </span>
                            </div>
                            <h2 className="text-sm lg:text-base font-extrabold text-white tracking-tight leading-tight mt-0.5">
                                {currentGraph.title}
                            </h2>
                        </div>
                    </div>

                    {/* Toggle Controls */}
                    <div className="bg-[#0c0c14] p-1 rounded-xl border border-white/5 flex gap-1 shrink-0 shadow-inner">
                        <button
                            onClick={() => setIsTweakerOpen(!isTweakerOpen)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                                isTweakerOpen
                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Sliders className="w-3 h-3" />
                            <span>Tweaker</span>
                        </button>
                        <button
                            onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                                isRightDrawerOpen
                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <HelpCircle className="w-3 h-3" />
                            <span>Q&A ({matchedQuestions.length})</span>
                        </button>
                    </div>
                </div>

                {/* ===== MAIN CONTENT AREA ===== */}
                <div className="flex-1 w-full flex flex-col relative overflow-hidden">
                    
                    {/* Scrollable center panel */}
                    <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}>
                        
                        {/* Mobile Title */}
                        <div className="md:hidden flex flex-col gap-1 border-b border-white/5 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                                {currentGraph.title}
                            </h2>
                        </div>

                        {/* ===== HERO GRAPH PLOTTER ===== */}
                        <div className="w-full max-w-4xl mx-auto">
                            <div className="w-full max-h-[60vh] border border-white/[0.06] rounded-2xl overflow-hidden relative group hover:border-cyan-500/20 transition-all duration-500" style={{ aspectRatio: '5/3' }}>
                                {/* Subtle glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
                                <InteractiveSVGPlot 
                                    graphId={currentGraph.graph_id} 
                                    params={graphParams}
                                    activeTab={isTransActive ? 'transformations' : 'controls'}
                                    transType={activeTransIndex}
                                    xAxisLabel={axes.x}
                                    yAxisLabel={axes.y}
                                />
                            </div>
                        </div>

                        {/* ===== GRAPH INFO CARDS ROW ===== */}
                        <div className={`w-full max-w-4xl mx-auto mt-6 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            
                            {/* Governing Equations Card */}
                            <div className="bg-[#0a0a12]/60 border border-white/[0.06] rounded-2xl p-5 space-y-3">
                                <h4 className="text-white text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Governing Equations</span>
                                </h4>
                                <div className="bg-[#030307]/60 rounded-xl p-3 border border-white/[0.04] overflow-x-auto space-y-3">
                                    {currentGraph.base_governing_equations?.map((eq, index) => (
                                        <div key={index} className="flex flex-col items-center justify-center border-b border-white/[0.04] last:border-0 pb-2 last:pb-0">
                                            <BlockMath math={eq} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Graph Characteristics Card */}
                            <div className="bg-[#0a0a12]/60 border border-white/[0.06] rounded-2xl p-5 space-y-3">
                                <h4 className="text-white text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                                    <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Graph Characteristics</span>
                                </h4>
                                <div className="space-y-2">
                                    {/* Slope info */}
                                    <div className="bg-[#030307]/60 rounded-xl p-3 border border-white/[0.04]">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Slope Interpretation</span>
                                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                            <LatexText text={currentGraph.slope_significance || "Slope represents the rate of change of the dependent variable with respect to the independent variable."} />
                                        </p>
                                    </div>
                                    {/* Axis definitions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-[#030307]/60 rounded-xl p-3 border border-white/[0.04]">
                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">X-Axis</span>
                                            <span className="text-[11px] text-cyan-400 font-mono font-bold leading-tight block">
                                                <LatexText text={axes.x} />
                                            </span>
                                        </div>
                                        <div className="bg-[#030307]/60 rounded-xl p-3 border border-white/[0.04]">
                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Y-Axis</span>
                                            <span className="text-[11px] text-cyan-400 font-mono font-bold leading-tight block">
                                                <LatexText text={axes.y} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== MOBILE WORKSPACE TABS (inline below graph) ===== */}
                    {isMobile && (
                        <div className="w-full shrink-0 bg-[#09090f]/40 flex flex-col border-t border-white/5 mt-4">
                            <div className="p-3 border-b border-white/5 bg-[#07070b]/60 flex shrink-0">
                                <div className="bg-[#0c0c14] p-1 rounded-xl border border-white/5 flex gap-1 w-full shadow-inner">
                                    {[
                                        { id: 'controls', label: 'Tweaker', icon: <Sliders className="w-3.5 h-3.5" /> },
                                        { id: 'questions', label: `Q&A (${matchedQuestions.length})`, icon: <HelpCircle className="w-3.5 h-3.5" /> },
                                        { id: 'checkpoints', label: 'Traps', icon: <CheckSquare className="w-3.5 h-3.5" /> }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveRightTab(tab.id)}
                                            className={`flex-1 relative py-2 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1 ${
                                                activeRightTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {activeRightTab === tab.id && (
                                                <div className="absolute inset-0 bg-cyan-600 rounded-md shadow-md shadow-cyan-900/30" />
                                            )}
                                            <span className="relative z-10 flex items-center gap-1">{tab.icon} {tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 space-y-5">
                                {activeRightTab === 'controls' && renderControlsPaneContent()}
                                {activeRightTab === 'questions' && renderQuestionsPaneContent()}
                                {activeRightTab === 'checkpoints' && renderCheckpointsPaneContent()}
                            </div>
                        </div>
                    )}

                    {/* ===== FLOATING TWEAKER (DESKTOP) ===== */}
                    {!isMobile && (
                        <AnimatePresence>
                            {isTweakerOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute bottom-5 left-5 z-30 w-[320px] max-h-[50vh] bg-[#0a0a12]/92 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-2xl flex flex-col overflow-hidden"
                                >
                                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 shrink-0 bg-[#0c0c16]/80">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <Sliders className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Graph Tweaker</span>
                                        </div>
                                        <button 
                                            onClick={() => setIsTweakerOpen(false)}
                                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                                        {renderControlsPaneContent()}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    {/* Tweaker FAB (closed state, desktop) */}
                    {!isMobile && !isTweakerOpen && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsTweakerOpen(true)}
                            className="absolute bottom-5 left-5 z-30 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 hover:scale-105 active:scale-95 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-cyan-900/40 flex items-center gap-2 transition-all duration-200"
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase tracking-wider font-mono">Tune Graph</span>
                        </motion.button>
                    )}

                    {/* ===== RIGHT DRAWER (DESKTOP) ===== */}
                    {!isMobile && (
                        <>
                            {/* Backdrop */}
                            <AnimatePresence>
                                {isRightDrawerOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute inset-0 z-40 bg-black/15 backdrop-blur-[1px]"
                                        onClick={() => setIsRightDrawerOpen(false)}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Drawer Panel */}
                            <AnimatePresence>
                                {isRightDrawerOpen && (
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                        className="absolute right-0 top-0 bottom-0 z-50 w-[380px] lg:w-[420px] bg-[#0a0a12]/95 border-l border-white/[0.06] backdrop-blur-2xl shadow-2xl shadow-black/60 flex flex-col h-full overflow-hidden"
                                    >
                                        {/* Drawer Header */}
                                        <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#0c0c16]/80 flex items-center justify-between shrink-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                    <HelpCircle className="w-3 h-3 text-cyan-400" />
                                                </div>
                                                <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">Questions & Checkpoints</span>
                                            </div>
                                            <button 
                                                onClick={() => setIsRightDrawerOpen(false)}
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                title="Close Panel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Tab Selectors */}
                                        <div className="px-4 py-2.5 border-b border-white/[0.06] bg-[#0c0c16]/40 flex shrink-0">
                                            <div className="bg-[#0c0c14] p-1 rounded-lg border border-white/5 flex gap-1 w-full shadow-inner">
                                                {[
                                                    { id: 'questions', label: `Questions (${matchedQuestions.length})`, icon: <HelpCircle className="w-3 h-3" /> },
                                                    { id: 'checkpoints', label: 'Traps & Checks', icon: <CheckSquare className="w-3 h-3" /> }
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveRightTab(tab.id)}
                                                        className={`flex-1 relative py-1.5 rounded-md text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                                            activeRightTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'
                                                        }`}
                                                    >
                                                        {activeRightTab === tab.id && (
                                                            <motion.div
                                                                layoutId="drawerActiveTab"
                                                                className="absolute inset-0 bg-cyan-600 rounded-md shadow-md shadow-cyan-900/30"
                                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                            />
                                                        )}
                                                        <span className="relative z-10 flex items-center gap-1">{tab.icon} {tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div className={`flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar transition-all duration-500 ${
                                            highlightQuestions && activeRightTab === 'questions' ? 'ring-1 ring-cyan-500/20 bg-cyan-950/5' : ''
                                        }`}>
                                            {activeRightTab === 'questions' && renderQuestionsPaneContent()}
                                            {activeRightTab === 'checkpoints' && renderCheckpointsPaneContent()}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PhysicsGraphsPage;
