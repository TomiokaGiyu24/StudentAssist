import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import SectionBlock from '../components/SectionBlock';
import Button from '../components/Button';
import { subjects, chapters, chapterContent } from '../data/mockData';

const tabs = [
    { id: 'important-questions', label: 'Important Questions' },
    { id: 'short-notes', label: 'Short Notes' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'practice-questions', label: 'Practice' }
];

function ContentOutputPage() {
    const { subjectId, chapterId } = useParams();
    const [activeTab, setActiveTab] = useState('important-questions');

    const subject = subjects.find(s => s.id === subjectId);
    const subjectChapters = chapters[subjectId] || [];
    const chapter = subjectChapters.find(c => c.id === chapterId);

    if (!subject || !chapter) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="Content" showBack />
                <div className="container-app py-12 text-center">
                    <p className="text-gray-600">Content not found</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'important-questions':
                return (
                    <div className="space-y-4">
                        {chapterContent['important-questions'].map((item, index) => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium mb-2">{item.question}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                {item.marks} marks
                                            </span>
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'short-notes':
                return (
                    <div className="space-y-4">
                        {chapterContent['short-notes'].map((note) => (
                            <SectionBlock key={note.id} title={note.title}>
                                <p className="text-gray-700 leading-relaxed">{note.content}</p>
                            </SectionBlock>
                        ))}
                    </div>
                );

            case 'formulas':
                return (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {chapterContent['formulas'].map((formula) => (
                            <div key={formula.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <p className="text-sm text-gray-500 mb-1">{formula.name}</p>
                                <p className="text-lg font-mono font-semibold text-gray-900 mb-2">
                                    {formula.formula}
                                </p>
                                <p className="text-xs text-gray-500">where {formula.where}</p>
                            </div>
                        ))}
                    </div>
                );

            case 'practice-questions':
                return (
                    <div className="space-y-3">
                        {chapterContent['practice-questions'].map((item, index) => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 flex-shrink-0 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-900">{item.question}</p>
                                    </div>
                                    <span className={`
                    px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                    ${item.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : ''}
                    ${item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${item.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                                        {item.difficulty}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title={chapter.name} showBack />

            {/* Chapter Info Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-app py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span>{subject.icon}</span>
                                <span>{subject.name}</span>
                                <span>•</span>
                                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${chapter.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : ''}
                  ${chapter.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${chapter.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : ''}
                `}>
                                    {chapter.difficulty}
                                </span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">{chapter.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white sticky top-14 sm:top-16 z-40">
                <div className="container-app">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>

            {/* Content Area */}
            <main className="container-app py-6">
                {renderContent()}

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                    <Button variant="success" fullWidth>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </Button>

                    <Button variant="outline" fullWidth>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Unlock Full Content
                    </Button>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    This is sample content. Full content unlocks with premium access.
                </p>
            </main>
        </div>
    );
}

export default ContentOutputPage;
