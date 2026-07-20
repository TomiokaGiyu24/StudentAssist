import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const WritingSkillRenderer = () => {
    const { skillId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                let moduleData;
                switch (skillId.toLowerCase()) {
                    case 'notice':
                        moduleData = await import('../data/Boards/English/WritingSkills/notice.json');
                        break;
                    case 'article':
                        moduleData = await import('../data/Boards/English/WritingSkills/article.json');
                        break;
                    case 'report':
                        moduleData = await import('../data/Boards/English/WritingSkills/report.json');
                        break;
                    case 'letter':
                        moduleData = await import('../data/Boards/English/WritingSkills/Letter.json');
                        break;

                    case 'analyticalparagraph':
                        moduleData = await import('../data/Boards/English/WritingSkills/analyticalparagraph.json');
                        break;
                    default:
                        console.error("Skill not found:", skillId);
                        setError(`Skill module '${skillId}' not found.`);
                        setLoading(false);
                        return;
                }
                setData(moduleData.default || moduleData);
            } catch (err) {
                console.error("Failed to load skill data", err);
                setError(`Failed to load content for ${skillId}. Details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [skillId]);

    if (loading) return <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-white">Loading...</div>;
    if (error) return <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-red-500 p-8 text-center">{error}</div>;
    if (!data) return <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-white">No content available for {skillId}</div>;

    // Destructure based on ACTUAL JSON Schema
    const {
        question_metadata,
        board_style_question,
        format_blueprint,
        model_answer_with_word_count,
        why_this_scores_full_marks,
        common_mark_losing_mistakes,
        common_mistakes // Fallback if some files use the old key
    } = data;

    const mistakes = common_mark_losing_mistakes || common_mistakes || [];

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans p-6 md:p-12 selection:bg-purple-500/30">
            <header className="max-w-4xl mx-auto mb-16 text-center">
                <span className="text-purple-400 font-bold tracking-widest text-xs uppercase mb-4 block">Writing Skills Module</span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 capitalize font-serif">{skillId} Writing</h1>
                <div className="h-1 w-24 bg-purple-500 mx-auto rounded-full"></div>
            </header>

            <main className="max-w-5xl mx-auto space-y-24">

                {/* 1. Question Analysis */}
                <section className="bg-stone-900/50 p-8 rounded-2xl border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-4">Board Style Question</h2>
                    <p className="text-stone-300 italic font-serif leading-relaxed">
                        "{board_style_question}"
                    </p>
                </section>

                {/* 2. Format Blueprint */}
                <section>
                    <h2 className="text-3xl font-bold text-white mb-8">The Format Blueprint</h2>
                    <div className="bg-white text-black p-8 md:p-16 rounded shadow-2xl mx-auto max-w-3xl font-serif relative">
                        <div className="space-y-4 border border-black/10 p-8">
                            {format_blueprint?.sequence_order?.map((item, idx) => (
                                <div key={idx} className="bg-gray-100 p-2 border border-dashed border-gray-300 text-center uppercase text-xs font-bold tracking-widest text-gray-600">
                                    {item}
                                </div>
                            ))}
                            {format_blueprint?.format_visual_layout && (
                                <div className="mt-4 text-center text-red-500 text-sm font-bold border-2 border-red-500/20 p-2">
                                    NB: {format_blueprint.format_visual_layout}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. Model Answer & Scoring */}
                <section className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl overflow-hidden">
                        <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20">
                            <h3 className="font-bold text-emerald-400 text-center uppercase tracking-widest text-sm">Perfect Answer</h3>
                        </div>
                        <div className="p-8">
                            <pre className="whitespace-pre-wrap font-serif text-stone-300 leading-relaxed font-sans text-sm md:text-base">
                                {model_answer_with_word_count?.answer_text}
                            </pre>
                            <div className="mt-6 flex justify-end">
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                                    {model_answer_with_word_count?.word_count} words
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Why it scores full marks */}
                        <div className="bg-stone-900 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                Why this scores full marks
                            </h3>
                            <ul className="space-y-4 text-sm text-stone-400">
                                {why_this_scores_full_marks && Object.entries(why_this_scores_full_marks).map(([reason, desc]) => (
                                    <li key={reason}>
                                        <span className="block text-stone-200 font-bold capitalize mb-1">{reason.replace(/_/g, ' ')}</span>
                                        {desc}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Common Mistakes */}
                        <div className="bg-red-900/10 p-6 rounded-2xl border border-red-500/20">
                            <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Top Mark-Losing Mistakes
                            </h3>
                            <ul className="space-y-3">
                                {mistakes.map((mistake, idx) => (
                                    <li key={idx} className="flex gap-3 text-stone-300 text-sm">
                                        <span className="text-red-500">•</span>
                                        {mistake}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default WritingSkillRenderer;
