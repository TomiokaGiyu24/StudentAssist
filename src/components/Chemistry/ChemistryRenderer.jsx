import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chapters } from '../../data/mockData';
import ChemistryTabSystem from './ChemistryTabSystem';
import ChemistryBadge from './ChemistryBadge';
import LearnMode from './LearnMode';
import RapidMode from './RapidMode';
import VisualsMode from './VisualsMode';
import ActivateMode from './ActivateMode';
import ChemistryTopicExplorer from './ChemistryTopicExplorer';
import InorganicTopicExplorer from './InorganicTopicExplorer';
import PeriodicTableExplorer from './PeriodicTableExplorer';
import OrganicBridgeExplorer from './OrganicBridgeExplorer';
import ChemistryFormulaDeck from './ChemistryFormulaDeck';
import ChemistryGraphDeck from './ChemistryGraphDeck';
import PYQQuizMode from './PYQQuizMode';

const ChemistryRenderer = ({ content, hasPyqs, pyqLoading, pyqContent }) => {
    const { chapterId } = useParams();
    const isNewStructure = Array.isArray(content);

    // Detect inorganic chapter structure (topics with simplified_core, exceptions with exception_id, INORG_ graphs)
    const isInorganicStructure = isNewStructure && content.some(
        item => item.simplified_core || item.exception_id || (item.graph_id && item.graph_id.startsWith('INORG_'))
    );

    // Detect periodic table data (elements with atomic_number, symbol, period, group)
    const isPeriodicTable = isNewStructure && content.length > 50 && content.every(
        item => item.atomic_number && item.symbol && item.period && item.group
    );

    // Detect organic bridge chapter structure (prerequisites with prerequisite_name)
    const isOrganicBridge = isNewStructure && content.some(
        item => item.prerequisite_name && item.plain_terms_decode
    );

    // Filter mixed contents into distinct collections for new structures
    const topics = isNewStructure ? content.filter(item => item.topic_name) : content;
    const formulas = isNewStructure ? content.filter(item => item.formula_id) : [];
    const graphs = isNewStructure && !isInorganicStructure ? content.filter(item => item.graph_id) : [];
    const hasFormulas = formulas.length > 0;
    const hasGraphs = graphs.length > 0;

    // Get chapter meta info from mockData if new structure, or from content.meta if old structure
    let chapterName = 'Chapter';
    let chapterClass = '12';
    let weightage = '';
    let difficulty = '';
    let nature = 'Physical';
    let strategy = '';

    if (isNewStructure) {
        // Find matching chapter in mockData
        const chemistryChapters = chapters.chemistry || [];
        const found = chemistryChapters.find(c => c.id === chapterId);
        if (found) {
            chapterName = found.name;
            difficulty = found.difficulty;
            weightage = found.weightage;
        }
    } else if (content && content.meta) {
        const { meta } = content;
        chapterName = meta.chapter_name || content.chapter_name || 'Chapter';
        chapterClass = meta.class || '12';
        weightage = meta.chapter_weightage_estimate || '';
        difficulty = meta.difficulty_rating || '';
        nature = meta.nature_of_chapter || 'Physical';
        strategy = meta.scoring_potential_analysis || '';
    }

    const tabs = isInorganicStructure
        ? [
            { id: 'inorganic-explorer', label: 'Inorganic Explorer' }
          ]
        : isNewStructure 
        ? [
            { id: 'explorer', label: 'Topic Explorer' },
            ...(hasFormulas ? [{ id: 'formula-deck', label: 'Formula Dashboard' }] : []),
            ...(hasGraphs ? [{ id: 'graph-deck', label: 'Graph Lab' }] : [])
          ]
        : [
            { id: 'learn', label: 'Learn' },
            { id: 'activate', label: 'Activate' },
            { id: 'rapid', label: 'Rapid' }
          ];

    if (!isNewStructure && content?.visual_elements && content.visual_elements.length > 0) {
        tabs.push({ id: 'visuals', label: 'Visuals' });
    }

    if (hasPyqs) {
        tabs.push({ id: 'pyq-quiz', label: 'PYQ Quiz Challenge' });
    }

    const defaultTab = isInorganicStructure ? 'inorganic-explorer' : isNewStructure ? 'explorer' : tabs[0].id;
    const [activeMode, setActiveMode] = useState(defaultTab);

    // Sync active tab when content changes (e.g. user navigates between chapters)
    useEffect(() => {
        setActiveMode(isInorganicStructure ? 'inorganic-explorer' : isNewStructure ? 'explorer' : (tabs[0]?.id || 'learn'));
    }, [content, isNewStructure, isInorganicStructure]);

    if (!content) return null;

    // Periodic Table gets its own full-width renderer — skip the standard header/tabs
    if (isPeriodicTable) {
        return (
            <div className="w-full text-stone-200">
                <PeriodicTableExplorer content={content} />
            </div>
        );
    }

    // Organic Chemistry Prerequisite Bridge gets its own layout
    if (isOrganicBridge) {
        return (
            <div className="w-full text-stone-200 animate-fade-in">
                <OrganicBridgeExplorer content={content} />
            </div>
        );
    }

    const getDifficultyColor = (rating) => {
        if (!rating) return 'default';
        const r = rating.toLowerCase();
        if (r.includes('hard') || r.includes('high')) return 'danger';
        if (r.includes('moderate') || r.includes('medium')) return 'warning';
        return 'primary';
    };

    return (
        <div className="w-full text-stone-200">
            {/* Header Section */}
            <header className="mb-10 animate-fade-in relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <ChemistryBadge variant="primary">Class {chapterClass}</ChemistryBadge>
                            {weightage && (
                                <ChemistryBadge variant="glow">{weightage}</ChemistryBadge>
                            )}
                            {difficulty && (
                                <ChemistryBadge variant={getDifficultyColor(difficulty)}>{difficulty}</ChemistryBadge>
                            )}
                            {nature && (
                                <ChemistryBadge variant="default">{nature} Chemistry</ChemistryBadge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            {chapterName}
                        </h1>
                        {strategy && (
                            <p className="max-w-2xl text-stone-400 text-sm leading-relaxed">
                                <span className="text-teal-400 font-medium">Strategy: </span>
                                {strategy}
                            </p>
                        )}
                    </div>

                    {!isNewStructure && (
                        <button
                            onClick={() => setActiveMode('rapid')}
                            className="group relative inline-flex items-center justify-center shrink-0 px-6 py-3 font-bold text-white bg-teal-500 rounded-full overflow-hidden shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] focus:outline-none"
                        >
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                            <span className="relative flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Rapid Mode
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Navigation */}
            {tabs.length > 1 && (
                <div className="mb-8 relative z-10">
                    <ChemistryTabSystem
                        tabs={tabs}
                        activeTab={activeMode}
                        onChange={setActiveMode}
                    />
                </div>
            )}

            {/* Content Display */}
            <div className="relative z-10 min-h-[50vh]">
                {activeMode === 'inorganic-explorer' && <InorganicTopicExplorer content={content} />}
                {activeMode === 'explorer' && <ChemistryTopicExplorer content={topics} />}
                {activeMode === 'formula-deck' && <ChemistryFormulaDeck formulas={formulas} />}
                {activeMode === 'graph-deck' && <ChemistryGraphDeck graphs={graphs} />}
                {activeMode === 'learn' && <LearnMode chapterFlow={content.chapter_flow} />}
                {activeMode === 'activate' && <ActivateMode chapterData={content} />}
                {activeMode === 'rapid' && <RapidMode chapterData={content} />}
                {activeMode === 'visuals' && <VisualsMode visualElements={content.visual_elements} />}
                {activeMode === 'pyq-quiz' && (
                    <div className="animate-fade-in py-6">
                        {pyqLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-stone-400 text-sm">Loading quiz...</p>
                            </div>
                        ) : pyqContent?.questions ? (
                            <PYQQuizMode pyqContent={pyqContent} />
                        ) : (
                            <div className="text-center py-16 bg-[#141414] border border-white/5 rounded-2xl max-w-4xl mx-auto">
                                <p className="text-stone-400">Quiz questions are coming soon.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChemistryRenderer;
