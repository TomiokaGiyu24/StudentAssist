/**
 * Question Validator
 * Validates AI-generated questions against strict schema
 * Ensures board-exam quality and safety
 */

import { QUESTION_TYPES } from '../config/mockStructure';

/**
 * Required fields for all question types
 */
const REQUIRED_FIELDS = ['id', 'type', 'marks', 'difficulty', 'question'];

/**
 * Validate a single question against schema
 * @param {Object} question - The question to validate
 * @param {Object} expected - Expected values (type, marks, etc.)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateQuestion(question, expected = {}) {
    const errors = [];

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        if (!question[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate type
    const validTypes = Object.keys(QUESTION_TYPES);
    if (question.type && !validTypes.includes(question.type)) {
        errors.push(`Invalid question type: ${question.type}`);
    }

    // Validate marks
    if (expected.marks && question.marks !== expected.marks) {
        errors.push(`Marks mismatch: expected ${expected.marks}, got ${question.marks}`);
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'moderate', 'high'];
    if (question.difficulty && !validDifficulties.includes(question.difficulty)) {
        errors.push(`Invalid difficulty: ${question.difficulty}`);
    }

    // Type-specific validations
    if (question.type === 'mcq' || question.type === 'assertion_reason') {
        if (!question.options || Object.keys(question.options).length !== 4) {
            errors.push('MCQ must have exactly 4 options (A, B, C, D)');
        }
        if (!question.correct_option || !['A', 'B', 'C', 'D'].includes(question.correct_option)) {
            errors.push('MCQ must have valid correct_option (A, B, C, or D)');
        }
    }

    // Validate assertion_reason specific fields
    if (question.type === 'assertion_reason') {
        if (!question.assertion) {
            errors.push('Assertion-Reason must have assertion field');
        }
        if (!question.reason) {
            errors.push('Assertion-Reason must have reason field');
        }
    }

    // Validate case_study
    if (question.type === 'case_study') {
        if (!question.passage) {
            errors.push('Case study must have passage field');
        }
        if (!question.questions || !Array.isArray(question.questions) || question.questions.length < 4) {
            errors.push('Case study must have at least 4 sub-questions');
        }
    }

    // Validate answer exists for non-MCQ
    if (!['mcq', 'assertion_reason'].includes(question.type)) {
        if (!question.answer || !question.answer.explanation) {
            errors.push('Answer with explanation is required for this question type');
        }
    }

    // Validate LaTeX safety
    const latexErrors = validateLatex(question.question);
    if (latexErrors.length > 0) {
        errors.push(...latexErrors);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate LaTeX is KaTeX-safe
 * @param {string} text - Text containing LaTeX
 * @returns {string[]} Array of errors
 */
export function validateLatex(text) {
    const errors = [];
    if (!text) return errors;

    // Check for unsupported LaTeX commands
    const unsupportedCommands = [
        '\\begin{align}', '\\end{align}',
        '\\begin{equation}', '\\end{equation}',
        '\\newcommand', '\\def',
        '\\usepackage', '\\documentclass'
    ];

    for (const cmd of unsupportedCommands) {
        if (text.includes(cmd)) {
            errors.push(`Unsupported LaTeX command: ${cmd}`);
        }
    }

    // Check for balanced delimiters
    const dollarCount = (text.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
        errors.push('Unbalanced $ delimiters in LaTeX');
    }

    return errors;
}

/**
 * Sanitize question for safety
 * @param {Object} question - Question to sanitize
 * @returns {Object} Sanitized question
 */
export function sanitizeQuestion(question) {
    const sanitized = { ...question };

    // Trim all string fields
    for (const key of Object.keys(sanitized)) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitized[key].trim();
        }
    }

    // Sanitize options if present
    if (sanitized.options) {
        for (const key of Object.keys(sanitized.options)) {
            if (typeof sanitized.options[key] === 'string') {
                sanitized.options[key] = sanitized.options[key].trim();
            }
        }
    }

    // Ensure answer structure
    if (!sanitized.answer) {
        sanitized.answer = { explanation: '', key_formulae: [], diagrams: [] };
    }

    return sanitized;
}

/**
 * Format answer in board-style
 * @param {Object} answer - Answer object
 * @param {string} type - Question type
 * @returns {Object} Formatted answer
 */
export function formatBoardStyleAnswer(answer, type) {
    if (!answer) return null;

    // For MCQ/AR - keep short
    if (['mcq', 'assertion_reason'].includes(type)) {
        return {
            explanation: answer.explanation || '',
            key_formulae: answer.key_formulae || []
        };
    }

    // For numerical - structure as GIVEN/REQUIRED/SOLUTION/ANSWER
    if (type === 'numerical') {
        let formatted = answer.explanation || '';

        // If not already structured, try to structure it
        if (!formatted.includes('GIVEN') && !formatted.includes('Given')) {
            // AI should provide structured answer, but fallback to original
        }

        return {
            explanation: formatted,
            key_formulae: answer.key_formulae || [],
            diagrams: answer.diagrams || []
        };
    }

    // For derivation/theory - ensure step-wise
    return {
        explanation: answer.explanation || '',
        key_formulae: answer.key_formulae || [],
        diagrams: answer.diagrams || []
    };
}

export default {
    validateQuestion,
    validateLatex,
    sanitizeQuestion,
    formatBoardStyleAnswer
};
