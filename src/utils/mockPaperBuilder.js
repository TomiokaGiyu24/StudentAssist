/**
 * Mock Paper Builder
 * Orchestrates question-by-question generation with controlled AI
 * 
 * Uses AI-generated questions directly with minimal validation
 */

import { getMockStructure } from '../config/mockStructure';
import { getChapterConcepts, getKeyFormulae, physicsConceptBank } from '../data/concepts/physics';
import { generateSingleQuestion, getModelName } from './aiQuestionGenerator';

// Cache for generated questions
const questionCache = new Map();

/**
 * Build a complete mock paper
 */
export async function buildMockPaper(chapter, mockType, onProgress = () => { }) {
    console.log('📝 Building mock paper:', { chapter, mockType });

    const config = getMockStructure(mockType);
    const structure = config.structure;

    // Get chapter data
    const chapterData = physicsConceptBank[chapter];
    const concepts = chapterData?.concepts || [];
    const chapterName = chapterData?.name || chapter.replace(/-/g, ' ');

    if (!concepts.length) {
        console.warn('⚠️ No concepts found for:', chapter, '- using default');
    }

    const slots = buildQuestionSlots(structure, concepts, config);
    const totalQuestions = slots.length;

    console.log(`📋 Generating ${totalQuestions} questions for: ${chapterName}`);

    const sections = { A: [], B: [], C: [], D: [], CS: [] };
    let completed = 0;
    let aiSuccessCount = 0;

    for (const slot of slots) {
        onProgress(completed, totalQuestions, `Generating ${slot.type} (${slot.marks}m)...`);

        try {
            const question = await generateQuestionForSlot(slot, chapter, chapterName, mockType);

            if (question && question.question) {
                // Use AI question directly
                question.id = slot.id;
                sections[slot.section].push(question);
                aiSuccessCount++;
                console.log(`✅ [${completed + 1}/${totalQuestions}] AI: ${slot.type}`);
            } else {
                // Use fallback
                const fallback = generateFallbackQuestion(slot);
                sections[slot.section].push(fallback);
                console.log(`⚠️ [${completed + 1}/${totalQuestions}] Fallback: ${slot.type}`);
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
            const fallback = generateFallbackQuestion(slot);
            sections[slot.section].push(fallback);
        }

        completed++;
    }

    onProgress(totalQuestions, totalQuestions, 'Finalizing paper...');
    console.log(`📊 AI Success Rate: ${aiSuccessCount}/${totalQuestions} (${Math.round(aiSuccessCount / totalQuestions * 100)}%)`);

    return {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mockType,
        examMode: 'exam',
        createdAt: new Date().toISOString(),
        aiGenerated: true,
        aiModel: getModelName(),
        aiSuccessRate: Math.round(aiSuccessCount / totalQuestions * 100),
        meta: {
            chapter: chapterName,
            chapterId: chapter,
            totalMarks: structure.totalMarks,
            duration: structure.duration,
            questionCount: totalQuestions
        },
        sections,
        keyFormulae: getKeyFormulae(chapter) || []
    };
}

/**
 * Build question slots from structure
 */
function buildQuestionSlots(structure, concepts, config) {
    const slots = [];
    let questionNum = 1;

    for (const section of structure.sections) {
        for (let i = 0; i < section.count; i++) {
            const concept = selectConcept(concepts, section.type);

            slots.push({
                id: `${section.section}${questionNum}`,
                section: section.section,
                type: section.type,
                marks: section.marks,
                difficulty: pickDifficulty(section.difficulty),
                concept: concept
            });
            questionNum++;
        }
    }

    return slots;
}

/**
 * Select a random suitable concept
 */
function selectConcept(concepts, type) {
    if (!concepts.length) {
        return { id: 'general', name: 'General Physics' };
    }

    const suitable = concepts.filter(c =>
        c.types?.includes(type) ||
        (type === 'assertion_reason' && c.types?.includes('mcq')) ||
        (type === 'case_study')
    );

    const pool = suitable.length > 0 ? suitable : concepts;
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pick a random difficulty from allowed list
 */
function pickDifficulty(allowed) {
    return allowed[Math.floor(Math.random() * allowed.length)];
}

/**
 * Generate question for a slot using AI
 */
async function generateQuestionForSlot(slot, chapter, chapterName, mockType) {
    try {
        const question = await generateSingleQuestion({
            chapter: chapterName,
            chapterId: chapter,
            concept: slot.concept.name,
            conceptId: slot.concept.id,
            type: slot.type,
            marks: slot.marks,
            difficulty: slot.difficulty,
            mockType: mockType
        });

        // Basic validation - just check if it has required fields
        if (question && question.question) {
            // Ensure proper structure
            if (!question.marks) question.marks = slot.marks;
            if (!question.type) question.type = slot.type;
            if (!question.difficulty) question.difficulty = slot.difficulty;

            // For MCQ/AR, ensure options exist
            if ((question.type === 'mcq' || question.type === 'assertion_reason') && !question.options) {
                return null;
            }

            return question;
        }
    } catch (error) {
        console.error('❌ Generation error:', error.message);
    }

    return null;
}

/**
 * Generate fallback question
 */
function generateFallbackQuestion(slot) {
    const { id, type, marks, difficulty, concept } = slot;
    const conceptName = concept?.name || 'this topic';

    const fallbacks = {
        mcq: {
            id,
            type: 'mcq',
            marks: 1,
            difficulty,
            question: `The electric field inside a conductor is:`,
            options: {
                A: 'Zero',
                B: 'Non-zero and uniform',
                C: 'Non-zero and non-uniform',
                D: 'Infinite'
            },
            correct_option: 'A',
            explanation: 'Electric field inside a conductor is always zero in electrostatic equilibrium.'
        },
        assertion_reason: {
            id,
            type: 'assertion_reason',
            marks: 1,
            difficulty,
            assertion: 'Electric field lines never cross each other.',
            reason: 'At the point of intersection, there would be two directions of electric field, which is impossible.',
            question: 'Assertion (A): Electric field lines never cross each other.\nReason (R): At the point of intersection, there would be two directions of electric field, which is impossible.',
            options: {
                A: 'Both A and R are true, R is the correct explanation of A',
                B: 'Both A and R are true, R is not the correct explanation of A',
                C: 'A is true but R is false',
                D: 'A is false but R is true'
            },
            correct_option: 'A',
            explanation: 'Both statements are true and the reason correctly explains the assertion.'
        },
        theory: {
            id,
            type: 'theory',
            marks,
            difficulty,
            question: `Define electric flux. State its SI unit. (${marks} marks)`,
            answer: {
                explanation: 'Electric flux is the measure of electric field lines passing through a given surface. It is defined as the surface integral of the electric field over that surface.\n\nMathematically: $\\phi = \\oint \\vec{E} \\cdot d\\vec{A}$\n\nSI Unit: Nm²/C or Volt-metre (Vm)'
            }
        },
        numerical: {
            id,
            type: 'numerical',
            marks,
            difficulty,
            question: `Two point charges of $+2\\mu C$ and $-2\\mu C$ are placed 10 cm apart in air. Calculate the electric field at the midpoint. (${marks} marks)`,
            answer: {
                explanation: 'GIVEN:\n$q_1 = +2\\mu C = 2 \\times 10^{-6}C$\n$q_2 = -2\\mu C = -2 \\times 10^{-6}C$\n$r = 10cm = 0.1m$\n\nFIND: Electric field at midpoint\n\nSOLUTION:\nDistance from each charge to midpoint = 0.05m\n$E_1 = E_2 = \\frac{kq}{r^2} = \\frac{9 \\times 10^9 \\times 2 \\times 10^{-6}}{(0.05)^2} = 7.2 \\times 10^6 N/C$\n\nBoth fields point in same direction (towards negative charge)\n$E_{net} = E_1 + E_2 = 1.44 \\times 10^7 N/C$\n\nANSWER: $1.44 \\times 10^7$ N/C towards the negative charge',
                key_formulae: ['$E = \\frac{kq}{r^2}$']
            }
        },
        derivation: {
            id,
            type: 'derivation',
            marks,
            difficulty,
            question: `Using Gauss's law, derive the expression for electric field due to a uniformly charged infinite plane sheet. (${marks} marks)`,
            answer: {
                explanation: 'Consider an infinite plane sheet with uniform surface charge density σ.\n\nStep 1: By symmetry, E is perpendicular to the sheet and uniform on both sides.\n\nStep 2: Choose a cylindrical Gaussian surface with axis perpendicular to sheet.\n\nStep 3: Apply Gauss\'s law:\n$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\epsilon_0}$\n\nStep 4: Flux through curved surface = 0 (E ⊥ to normal)\nFlux through end caps = 2EA\n\nStep 5: $2EA = \\frac{\\sigma A}{\\epsilon_0}$\n\n$E = \\frac{\\sigma}{2\\epsilon_0}$',
                key_formulae: ['$E = \\frac{\\sigma}{2\\epsilon_0}$']
            }
        },
        case_study: {
            id,
            type: 'case_study',
            marks: 4,
            difficulty,
            passage: 'Electrostatic precipitators are used in thermal power plants to remove particulate matter from exhaust gases. They work on the principle of corona discharge. When a high voltage is applied between electrodes, gas molecules near the electrode get ionized. Dust particles acquire charge and migrate towards the collecting plates under the influence of electric field.',
            questions: [
                { id: `${id}a`, question: 'What is the principle behind electrostatic precipitators?', type: 'mcq', options: { A: 'Corona discharge', B: 'Electromagnetic induction', C: 'Photoelectric effect', D: 'Thermionic emission' }, correct_option: 'A', marks: 1 },
                { id: `${id}b`, question: 'Why do dust particles move towards collecting plates?', type: 'mcq', options: { A: 'Due to gravity', B: 'Due to electric force on charged particles', C: 'Due to magnetic force', D: 'Due to air pressure' }, correct_option: 'B', marks: 1 },
                { id: `${id}c`, question: 'What happens to gas molecules near the electrode?', type: 'mcq', options: { A: 'They condense', B: 'They ionize', C: 'They evaporate', D: 'They decompose' }, correct_option: 'B', marks: 1 },
                { id: `${id}d`, question: 'Electrostatic precipitators are primarily used to:', type: 'mcq', options: { A: 'Generate electricity', B: 'Store charge', C: 'Remove particulate matter', D: 'Measure voltage' }, correct_option: 'C', marks: 1 }
            ],
            answer: { explanation: 'a) Corona discharge creates ions. b) Charged particles experience electric force. c) High voltage ionizes gas molecules. d) Main purpose is pollution control.' }
        }
    };

    return fallbacks[type] || fallbacks.mcq;
}

/**
 * Clear question cache
 */
export function clearQuestionCache() {
    questionCache.clear();
}

export default { buildMockPaper, clearQuestionCache };
