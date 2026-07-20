/**
 * Mock Data Loader
 * Loads pre-made mock test JSON files for each chapter and mock type
 * 
 * Replaces AI generation with instant JSON loading
 */

// Import all mock JSONs
// Mock registry: chapterId -> mockType -> data
// Electric Charges
import electricChargesPYQ from './Physics/electric-charges/pyq.json';
import electricChargesConceptual from './Physics/electric-charges/conceptualmock.json';
import electricChargesCompetency from './Physics/electric-charges/competencymock.json';

// Physical Education Full Syllabus Mocks
import peMock1 from '../Boards/PhysicalEducation/Mocks/mock1.json';
import peMock2 from '../Boards/PhysicalEducation/Mocks/mock2.json';
import peMock3 from '../Boards/PhysicalEducation/Mocks/mock3.json';
import peMock4 from '../Boards/PhysicalEducation/Mocks/mock4.json';
import peMock5 from '../Boards/PhysicalEducation/Mocks/mock5.json';

// Mock registry: chapterId -> mockType -> data
const mockRegistry = {
    'electric-charges': {
        pyq: electricChargesPYQ,
        conceptual: electricChargesConceptual,
        competency: electricChargesCompetency
    },
    // PE Full Syllabus Mocks (Mapped to PYQ type for now as 'Standard')
    'pe-mock-1': { pyq: peMock1 },
    'pe-mock-2': { pyq: peMock2 },
    'pe-mock-3': { pyq: peMock3 },
    'pe-mock-4': { pyq: peMock4 },
    'pe-mock-5': { pyq: peMock5 },
};

/**
 * Get available mock types for a chapter
 * @param {string} chapterId - Chapter ID
 * @returns {string[]} Array of available mock types
 */
export function getAvailableMockTypes(chapterId) {
    const chapter = mockRegistry[chapterId];
    if (!chapter) return [];
    return Object.keys(chapter);
}

/**
 * Check if a mock is available
 * @param {string} chapterId - Chapter ID
 * @param {string} mockType - Mock type (pyq, conceptual, competency)
 * @returns {boolean}
 */
export function isMockAvailable(chapterId, mockType) {
    return !!mockRegistry[chapterId]?.[mockType];
}

/**
 * Load a mock test
 * @param {string} chapterId - Chapter ID
 * @param {string} mockType - Mock type (pyq, conceptual, competency)
 * @returns {Object|null} Mock data or null if not found
 */
export function loadMock(chapterId, mockType) {
    const rawMockData = mockRegistry[chapterId]?.[mockType];

    if (!rawMockData) {
        console.error(`❌ Mock not found: ${chapterId}/${mockType}`);
        return null;
    }

    // Transform sections array to object format
    // JSON has: sections: [{ section_id: 'A', questions: [...] }]
    // UI expects: sections: { A: [...], B: [...] }
    const sectionsObject = {};
    let totalQuestions = 0;
    let totalMarks = 0;

    if (Array.isArray(rawMockData.sections)) {
        // Default marks by section
        const sectionMarks = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5
        };

        rawMockData.sections.forEach(section => {
            const sectionId = section.section_id;
            const defaultMarks = sectionMarks[sectionId] || 1;

            sectionsObject[sectionId] = (section.questions || []).map((q, qIdx) => {
                // Normalize ID: Use id, question_id, or fallback to section-index
                const id = q.id || q.question_id || `${sectionId}_${qIdx + 1}`;

                return {
                    ...q,
                    id: id,
                    // Add marks if not present
                    marks: q.marks || defaultMarks,
                    // Add type from section if not present
                    type: q.type || section.question_type
                };
            });

            totalQuestions += (section.questions || []).length;
            totalMarks += (section.questions || []).reduce((acc, q) => acc + (q.marks || defaultMarks), 0);
        });
    } else if (typeof rawMockData.sections === 'object' && rawMockData.sections !== null) {
        // Handle Object format (e.g. PE Mocks where sections = { "A": [...], "B": [...] })
        const sectionMarks = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5
        };

        Object.entries(rawMockData.sections).forEach(([sectionId, questions]) => {
            if (!Array.isArray(questions)) return;

            const defaultMarks = sectionMarks[sectionId] || 1;

            sectionsObject[sectionId] = questions.map((q, qIdx) => {
                // Normalize ID
                const id = q.id || q.question_id || `${sectionId}_${qIdx + 1}`;

                return {
                    ...q,
                    id: id,
                    marks: q.marks || defaultMarks,
                    type: q.type || 'Short Answer' // Default backup
                };
            });

            totalQuestions += questions.length;
            totalMarks += questions.reduce((acc, q) => acc + (q.marks || defaultMarks), 0);
        });
    }

    // Build the transformed mock data
    const mockData = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        aiGenerated: false,

        // Meta information
        meta: {
            ...rawMockData.meta,
            chapter: rawMockData.meta?.chapter || getChapterName(chapterId),
            totalMarks: rawMockData.meta?.maximum_marks || totalMarks,
            duration: (rawMockData.meta?.time_minutes || 90) * 60, // Convert to seconds
            questionCount: totalQuestions
        },

        // Transformed sections object
        sections: sectionsObject
    };

    console.log('✅ Mock loaded:', { chapterId, mockType, questions: totalQuestions, marks: totalMarks });
    return mockData;
}

/**
 * Get chapter name from ID
 */
function getChapterName(chapterId) {
    const names = {
        'electric-charges': 'Electric Charges and Fields',
        'electrostatic-potential': 'Electrostatic Potential and Capacitance',
        'pe-mock-1': 'PE Full Syllabus Mock 1',
        'pe-mock-2': 'PE Full Syllabus Mock 2',
        'pe-mock-3': 'PE Full Syllabus Mock 3',
        'pe-mock-4': 'PE Full Syllabus Mock 4',
        'pe-mock-5': 'PE Full Syllabus Mock 5',
    };
    return names[chapterId] || chapterId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get all available chapters with mocks
 * @returns {string[]} Array of chapter IDs
 */
export function getChaptersWithMocks() {
    return Object.keys(mockRegistry);
}

/**
 * Get mock summary
 * @param {string} chapterId - Chapter ID
 * @param {string} mockType - Mock type
 * @returns {Object|null} Summary info
 */
export function getMockSummary(chapterId, mockType) {
    const mock = mockRegistry[chapterId]?.[mockType];
    if (!mock) return null;

    // Calculate question count from sections array
    let questionCount = 0;
    if (Array.isArray(mock.sections)) {
        mock.sections.forEach(section => {
            questionCount += section.questions?.length || 0;
        });
    }

    return {
        chapter: mock.meta?.chapter || getChapterName(chapterId),
        mockType: mock.meta?.mock_type || mockType,
        totalMarks: mock.meta?.maximum_marks || 35,
        duration: mock.meta?.time_minutes || 90,
        questionCount: questionCount,
        available: true
    };
}

export default {
    loadMock,
    isMockAvailable,
    getAvailableMockTypes,
    getChaptersWithMocks,
    getMockSummary
};
