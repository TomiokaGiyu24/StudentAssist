import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

/**
 * Floating PDF Download Button with dismiss functionality
 * Uses html2pdf.js to generate PDF from content
 */
function PDFDownloadButton({ contentRef, filename = 'notes', subjectName = '', chapterName = '', onExport }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Check localStorage for dismiss preference
    useEffect(() => {
        const dismissed = localStorage.getItem('pdfButtonDismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('pdfButtonDismissed', 'true');
    };

    const handleRestore = () => {
        setIsDismissed(false);
        localStorage.removeItem('pdfButtonDismissed');
    };

    const generatePDF = async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            // If custom export handler is provided (e.g. for structured PDF generation)
            if (onExport) {
                await onExport();
                return;
            }

            // Default screenshot-based generation
            if (!contentRef?.current) return;

            const element = contentRef.current;
            const pdfFilename = `${subjectName}_${chapterName}_${filename}.pdf`
                .replace(/[^a-zA-Z0-9_]/g, '_')
                .replace(/_+/g, '_');

            const options = {
                margin: [10, 10, 10, 10],
                filename: pdfFilename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#0c0a09' // stone-950
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: 'avoid-all' }
            };

            await html2pdf().set(options).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Show small restore button when dismissed
    if (isDismissed) {
        return (
            <button
                onClick={handleRestore}
                className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 group"
                title="Show download button"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 backdrop-blur-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all duration-300 group">
                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="p-3 text-white/60 hover:text-white transition-colors border-r border-white/20"
                    title="Hide download button"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Download button */}
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 pr-4 py-3 text-white font-medium disabled:opacity-50 transition-all"
                >
                    {isGenerating ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download PDF</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default PDFDownloadButton;
