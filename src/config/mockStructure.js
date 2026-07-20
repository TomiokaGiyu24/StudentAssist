/**
 * Mock Test Structure Configuration
 * Deterministic structure - website controls, NOT AI
 * 
 * Based on CBSE Class 12 Physics Paper Pattern (2024-25)
 * Total Marks: 70 | Duration: 3 hours | Questions: 33
 */

/**
 * Standard CBSE Paper Structure
 */
export const CBSE_PAPER_STRUCTURE = {
    totalMarks: 70,
    duration: 180, // minutes
    sections: [
        // Section A: MCQs (16 × 1 = 16 marks)
        { section: 'A', type: 'mcq', count: 12, marks: 1, difficulty: ['easy', 'moderate'] },
        { section: 'A', type: 'assertion_reason', count: 4, marks: 1, difficulty: ['moderate'] },

        // Section B: Short Answer (5 × 2 = 10 marks)
        { section: 'B', type: 'theory', count: 3, marks: 2, difficulty: ['easy', 'moderate'] },
        { section: 'B', type: 'numerical', count: 2, marks: 2, difficulty: ['easy', 'moderate'] },

        // Section C: Long Answer (7 × 3 = 21 marks)
        { section: 'C', type: 'numerical', count: 4, marks: 3, difficulty: ['moderate', 'high'] },
        { section: 'C', type: 'derivation', count: 2, marks: 3, difficulty: ['moderate'] },
        { section: 'C', type: 'theory', count: 1, marks: 3, difficulty: ['moderate'] },

        // Section D: Very Long Answer (3 × 5 = 15 marks)
        { section: 'D', type: 'derivation', count: 2, marks: 5, difficulty: ['high'] },
        { section: 'D', type: 'numerical', count: 1, marks: 5, difficulty: ['high'] },

        // Case Study (2 × 4 = 8 marks)
        { section: 'CS', type: 'case_study', count: 2, marks: 4, difficulty: ['moderate', 'high'] }
    ]
};

/**
 * Mock Type Configurations
 * Controls how questions are selected for each mock type
 */
export const MOCK_TYPE_CONFIG = {
    // PYQ-Based Mock: Questions derived from past papers
    pyq: {
        name: 'PYQ-Based Mock',
        description: 'Based on real CBSE paper patterns',
        conceptSelection: 'pyq_weighted', // Prioritize concepts with PYQ history
        difficultyDistribution: { easy: 40, moderate: 45, high: 15 },
        allowValueModification: true, // Modify numerical values from PYQs
        structure: CBSE_PAPER_STRUCTURE
    },

    // Conceptual Mock: Covers every NCERT concept
    conceptual: {
        name: 'Conceptual Mock',
        description: 'Comprehensive NCERT coverage',
        conceptSelection: 'balanced', // Equal coverage of all concepts
        difficultyDistribution: { easy: 35, moderate: 50, high: 15 },
        allowValueModification: true,
        structure: CBSE_PAPER_STRUCTURE
    },

    // Competency-Based Mock: Higher-order thinking
    competency: {
        name: 'Competency-Based Mock',
        description: 'HOTS & multi-concept integration',
        conceptSelection: 'competency', // Prioritize integration & application
        difficultyDistribution: { easy: 20, moderate: 45, high: 35 },
        allowValueModification: true,
        structure: CBSE_PAPER_STRUCTURE
    }
};

/**
 * Question Types supported
 */
export const QUESTION_TYPES = {
    mcq: {
        name: 'Multiple Choice Question',
        requiresOptions: true,
        optionCount: 4,
        marks: [1]
    },
    assertion_reason: {
        name: 'Assertion-Reason',
        requiresOptions: true,
        optionCount: 4,
        marks: [1],
        standardOptions: {
            A: 'Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.',
            B: 'Both Assertion and Reason are true, but Reason is NOT the correct explanation of Assertion.',
            C: 'Assertion is true but Reason is false.',
            D: 'Assertion is false but Reason is true.'
        }
    },
    theory: {
        name: 'Theory/Conceptual',
        requiresOptions: false,
        marks: [2, 3, 5]
    },
    numerical: {
        name: 'Numerical Problem',
        requiresOptions: false,
        marks: [2, 3, 5]
    },
    derivation: {
        name: 'Derivation',
        requiresOptions: false,
        marks: [3, 5]
    },
    case_study: {
        name: 'Case Study',
        requiresOptions: true,
        subQuestions: 4,
        marksPerSub: 1,
        marks: [4]
    }
};

/**
 * Get structure for a mock type
 */
export function getMockStructure(mockType) {
    const config = MOCK_TYPE_CONFIG[mockType];
    if (!config) {
        console.warn(`Unknown mock type: ${mockType}, using pyq`);
        return MOCK_TYPE_CONFIG.pyq;
    }
    return config;
}

/**
 * Get total question count from structure
 */
export function getTotalQuestions(structure = CBSE_PAPER_STRUCTURE) {
    return structure.sections.reduce((sum, s) => sum + s.count, 0);
}

/**
 * Get questions grouped by section
 */
export function getSectionBreakdown(structure = CBSE_PAPER_STRUCTURE) {
    const breakdown = {};
    structure.sections.forEach(s => {
        if (!breakdown[s.section]) {
            breakdown[s.section] = { questions: 0, marks: 0, types: [] };
        }
        breakdown[s.section].questions += s.count;
        breakdown[s.section].marks += s.count * s.marks;
        breakdown[s.section].types.push(s.type);
    });
    return breakdown;
}

export default {
    CBSE_PAPER_STRUCTURE,
    MOCK_TYPE_CONFIG,
    QUESTION_TYPES,
    getMockStructure,
    getTotalQuestions,
    getSectionBreakdown
};
