/**
 * Mock Test Service
 * Loads mock tests from pre-made JSON files
 * 
 * Replaces AI generation with instant JSON loading
 */

import { loadMock, isMockAvailable, getAvailableMockTypes, getMockSummary } from '../data/Mocks';

// In-memory mock store
const mockStore = new Map();

console.log('📦 Mock Test Service loaded (JSON-based)');

/**
 * Generate (load) a mock test
 * @param {Object} options - { chapter, mockType, examMode }
 * @returns {Promise<string>} Mock ID
 */
export async function generateMock({ chapter, mockType, examMode }) {
    console.log('📄 Loading mock:', { chapter, mockType, examMode });

    // Check if mock is available
    if (!isMockAvailable(chapter, mockType)) {
        const available = getAvailableMockTypes(chapter);
        if (available.length === 0) {
            throw new Error(`No mocks available for chapter: ${chapter}`);
        }
        throw new Error(`Mock type "${mockType}" not available for "${chapter}". Available: ${available.join(', ')}`);
    }

    // Load from JSON
    const mockData = loadMock(chapter, mockType);

    if (!mockData) {
        throw new Error(`Failed to load mock: ${chapter}/${mockType}`);
    }

    // Add exam mode
    mockData.examMode = examMode;

    // Store in memory
    mockStore.set(mockData.id, mockData);

    console.log('✅ Mock loaded:', mockData.id);
    return mockData.id;
}

/**
 * Get mock by ID
 */
export function getMockById(mockId) {
    return mockStore.get(mockId);
}

/**
 * Check if mock is AI generated
 */
export function isMockAIGenerated(mockId) {
    const mock = mockStore.get(mockId);
    return mock?.aiGenerated === true;
}

/**
 * Get mock info
 */
export function getMockInfo(chapterId, mockType) {
    return getMockSummary(chapterId, mockType);
}

/**
 * Check mock availability
 */
export function checkMockAvailability(chapterId, mockType) {
    return isMockAvailable(chapterId, mockType);
}

/**
 * Get available mock types for a chapter
 */
export function getAvailableMocks(chapterId) {
    return getAvailableMockTypes(chapterId);
}

/**
 * Clear cache
 */
export function clearCache() {
    mockStore.clear();
    console.log('🗑️ Mock cache cleared');
}

export default {
    generateMock,
    getMockById,
    isMockAIGenerated,
    getMockInfo,
    checkMockAvailability,
    getAvailableMocks,
    clearCache
};
