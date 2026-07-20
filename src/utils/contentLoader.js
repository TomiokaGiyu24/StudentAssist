// Content Loader Utility for dynamically loading chapter JSON files

/**
 * Subject folder name mapping (handles case sensitivity)
 */
const subjectFolderMap = {
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'mathematics': 'Maths',
    'biology': 'Biology',
    'physical-education': 'PhysicalEducation',
    'english': 'English'
};

/**
 * Load chapter content from JSON file
 * @param {string} subject - Subject name (e.g., 'physics', 'chemistry')
 * @param {string} chapterSlug - Chapter slug/filename without extension
 * @returns {Promise<Object>} Chapter content object
 */
// Use import.meta.glob to load all chapter JSON files
// This avoids dynamic import restrictions with variables
const chapterModules = import.meta.glob('../data/Boards/**/*.json');

export async function loadChapterContent(subject, chapterSlug) {
    try {
        const folderName = subjectFolderMap[subject.toLowerCase()] || subject;

        // Construct the expected path relative to this file
        // Note: chapterModules keys are relative to the current file
        const path = `../data/Boards/${folderName}/${chapterSlug}.json`;

        const loader = chapterModules[path];

        if (!loader) {
            console.error(`Chapter file not found: ${path}`);
            return null;
        }

        const module = await loader();
        return module.default;
    } catch (error) {
        console.error(`Failed to load chapter: ${subject}/${chapterSlug}`, error);
        return null;
    }
}

/**
 * Get chapter file mapping from chapter ID to file slug
 * This maps the URL-friendly IDs to actual file names
 */
export const chapterFileMap = {
    physics: {
        'electric-charges': 'electricfieldandcharges',
        'electrostatic-potential': 'electrostaticpotentialandcapicitance',
        'current-electricity': 'currentelectricity',
        'moving-charges': 'movingchargesandmagnetism',
        'magnetism-matter': 'magentismandmatter',
        'electromagnetic-induction': 'electromagneticinduction',
        'alternating-current': 'alternatingcurrent',
        'em-waves': 'emwaves',
        'ray-optics': 'rayoptics',
        'wave-optics': 'waveoptics',
        'dual-nature': 'dualnature',
        'atoms': 'atoms',
        'nuclei': 'nuclie',
        'semiconductor': 'semiconductor'
    },
    chemistry: {
        'solutions': 'physical/solutions',
        'electrochemistry': 'physical/Electrochemistry',
        'chemical-kinetics': 'physical/Kinetics',
        'd-and-f-block': 'inorganic/d&fblock',
        'periodic-table': 'inorganic/periodic-table',
        'coordination-compounds': 'inorganic/Coordination',
        'organic-bridge': 'organic/organic-bridge',
        'haloalkanes': 'organic/haloalkanes-haloarenese',
        'alcohols-phenols': 'organic/alcohol-phenol-ether',
        'aldehydes-ketones': 'organic/aldehyde-ketone-carboxlylic-acid',
        'amines': 'organic/amines',
        'biomolecules': 'organic/biomolecules'
    },
    mathematics: {
        'relations-functions': 'relations-and-functions/relations-and-functions',
        'inverse-trig': 'relations-and-functions/inverse-trigonometric-functions',
        'matrices': 'algebra/matrices',
        'determinants': 'algebra/determinants',
        'continuity-differentiability': 'calculus/continuity-and-differentiability',
        'applications-derivatives': 'calculus/application-of-derivatives',
        'integrals': 'calculus/integrals',
        'application-of-integrals': 'calculus/application-of-integrals',
        'differential-equations': 'calculus/differential-equations',
        'vector-algebra': 'vectors-and-3d-geometry/vector-algebra',
        'three-dimensional-geometry': 'vectors-and-3d-geometry/three-dimensional-geometry',
        'linear-programming': 'linear-programming/linear-programming',
        'probability': 'probability/probability'
    },
    biology: {},
    'physical-education': {
        'management-sporting-events': 'managementofsportingevents',
        'children-women-sports': 'childrenwomeninsports',
        'yoga-lifestyle': 'yogalifestyle',
        'cwsn-divyang': 'cwsndivyang',
        'sports-nutrition': 'sportsnutrition',
        'test-measurement': 'testmeasurement',
        'physiology-injuries': 'physiologyinjuries',
        'biomechanics': 'biomechanics',
        'psychology-sports': 'psychologysports',
        'training-sports': 'traininginsports'
    },
    english: {
        'the-third-level': 'Vistas/thethirdlevel',
        'the-tiger-king': 'Vistas/thetigerking',
        'journey-to-the-end-of-the-earth': 'Vistas/journeytotheendoftheearth',
        'the-enemy': 'Vistas/theenemy',
        'on-the-face-of-it': 'Vistas/onthefaceofi',
        'memories-of-childhood': 'Vistas/memoriesofchilhood',
        'my-mother-at-66': 'Flamingo/Poems/mymotherat66',
        'keeping-quiet': 'Flamingo/Poems/keepingquiet',
        'a-thing-of-beauty': 'Flamingo/Poems/athingofbeauty',
        'a-roadside-stand': 'Flamingo/Poems/roadsidestand',
        'aunt-jennifers-tigers': 'Flamingo/Poems/auntjenifferstiger',
        'the-last-lesson': 'Flamingo/Prose/thelastlesson',
        'lost-spring': 'Flamingo/Prose/lostspring',
        'deep-water': 'Flamingo/Prose/deepwater',
        'the-rattrap': 'Flamingo/Prose/therattrap',
        'indigo': 'Flamingo/Prose/Indigo',
        'poets-and-pancakes': 'Flamingo/Prose/poetsandpancakes',
        'the-interview': 'Flamingo/Prose/theinterview',
        'going-places': 'Flamingo/Prose/goingplaces'
    }
};

/**
 * Get the file slug for a given subject and chapter ID
 * @param {string} subject
 * @param {string} chapterId
 * @returns {string|null}
 */
export function getChapterFileSlug(subject, chapterId) {
    const subjectMap = chapterFileMap[subject.toLowerCase()];
    if (subjectMap && subjectMap[chapterId]) {
        return subjectMap[chapterId];
    }
    // Fallback: try using chapter ID directly (remove dashes)
    return chapterId.replace(/-/g, '');
}

/**
 * Check if a chapter has notes available
 * @param {string} subject
 * @param {string} chapterId
 * @returns {boolean}
 */
export function hasNotesAvailable(subject, chapterId) {
    const subjectMap = chapterFileMap[subject.toLowerCase()];
    return subjectMap && !!subjectMap[chapterId];
}

/**
 * PYQ file mapping - maps chapter IDs to PYQ JSON files
 */
export const pyqFileMap = {
    physics: {
        'electric-charges': 'chapter1',
        'electrostatic-potential': 'chapter2',
        'current-electricity': 'chapter3',
        'moving-charges': 'chapter4',
        'magnetism-matter': 'chapter5',
        'electromagnetic-induction': 'chapter6',
        'alternating-current': 'chapter7',
        'em-waves': 'chapter8',
        'ray-optics': 'chapter9',
        'wave-optics': 'chapter10',
        'dual-nature': 'chapter11',
        'atoms': 'chapter12',
        'nuclei': 'chapter13',
        'semiconductor': 'chapter14',
    },
    chemistry: {
        'solutions': 'physical/pyqs/solutionspyq',
        'electrochemistry': 'physical/pyqs/electrochemistrypyq',
        'chemical-kinetics': 'physical/pyqs/kineticspyq',
        'd-and-f-block': 'inorganic/pyqs/d&fblockpyq',
        'coordination-compounds': 'inorganic/pyqs/coordinationpyq',
        'haloalkanes': 'organic/pyqs/haloalkanes-haloarenes-pyq',
        'alcohols-phenols': 'organic/pyqs/alcohol-phenol-ether-pyqs',
        'aldehydes-ketones': 'organic/pyqs/aldehyde-ketone-carboxylic-acid',
        'amines': 'organic/pyqs/amine-pyqs',
        'biomolecules': 'organic/pyqs/biomolecules-pyq'
    },
    mathematics: {
        'relations-functions': 'relations-and-functions/pyqs/relations-and-functions-pyq',
        'inverse-trig': 'relations-and-functions/pyqs/inverse-trigonometric-functions-pyq',
        'matrices': 'algebra/pyqs/matrices-pyq',
        'determinants': 'algebra/pyqs/determinants-pyq',
        'continuity-differentiability': 'calculus/pyqs/continuity-and-differentiability-pyq',
        'applications-derivatives': 'calculus/pyqs/application-of-derivatives-pyq',
        'integrals': 'calculus/pyqs/integrals-pyq',
        'application-of-integrals': 'calculus/pyqs/application-of-integrals-pyq',
        'differential-equations': 'calculus/pyqs/differential-equations-pyq',
        'vector-algebra': 'vectors-and-3d-geometry/pyqs/vector-algebra-pyq',
        'three-dimensional-geometry': 'vectors-and-3d-geometry/pyqs/three-dimensional-geometry-pyq',
        'linear-programming': 'linear-programming/pyqs/linear-programming-pyq',
        'probability': 'probability/pyqs/probability-pyq'
    },
    biology: {},
    'physical-education': {
        'management-sporting-events': 'chapter1',
        'children-women-sports': 'chapter2',
        'yoga-lifestyle': 'chapter3',
        'cwsn-divyang': 'chapter4',
        'sports-nutrition': 'chapter5',
        'test-measurement': 'chapter6',
        'physiology-injuries': 'chapter7',
        'biomechanics': 'chapter8',
        'psychology-sports': 'chapter9',
        'training-sports': 'chapter10'
    }
};

/**
 * Load PYQ content for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {Promise<Object|null>}
 */
export async function loadPYQContent(subject, chapterId) {
    try {
        const folderName = subjectFolderMap[subject.toLowerCase()] || subject;
        const subjectPyqs = pyqFileMap[subject.toLowerCase()];
        const pyqFile = subjectPyqs?.[chapterId];

        if (!pyqFile) {
            console.log(`No PYQ file mapped for ${subject}/${chapterId}`);
            return null;
        }

        let path;
        if (pyqFile.includes('/')) {
            // Nested structure (e.g., Chemistry: physical/pyqs/kineticspyq)
            path = `../data/Boards/${folderName}/${pyqFile}.json`;
        } else {
            // Flat structure (e.g., Physics: chapter1 -> PYQs/chapter1)
            path = `../data/Boards/${folderName}/PYQs/${pyqFile}.json`;
        }

        const loader = chapterModules[path];

        if (!loader) {
            console.error(`PYQ file not found: ${path}`);
            return null;
        }

        const module = await loader();
        return module.default;
    } catch (error) {
        console.error(`Failed to load PYQs: ${subject}/${chapterId}`, error);
        return null;
    }
}

/**
 * Check if PYQs are available for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {boolean}
 */
export function hasPYQsAvailable(subject, chapterId) {
    const subjectPyqs = pyqFileMap[subject.toLowerCase()];
    return subjectPyqs && !!subjectPyqs[chapterId];
}

/**
 * Practice Questions file mapping
 */
export const practiceFileMap = {
    'physical-education': {
        'management-sporting-events': 'chapter1',
        'children-women-sports': 'chapter2',
        'yoga-lifestyle': 'chapter3',
        'cwsn-divyang': 'chapter4',
        'sports-nutrition': 'chapter5',
        'test-measurement': 'chapter6',
        'physiology-injuries': 'chapter7',
        'biomechanics': 'chapter8',
        'psychology-sports': 'chapter9',
        'training-sports': 'chapter10'
    }
};

/**
 * Load Practice Questions content
 * @param {string} subject
 * @param {string} chapterId
 * @returns {Promise<Object|null>}
 */
export async function loadPracticeContent(subject, chapterId) {
    try {
        const folderName = subjectFolderMap[subject.toLowerCase()] || subject;
        const subjectPractice = practiceFileMap[subject.toLowerCase()];
        const practiceFile = subjectPractice?.[chapterId];

        if (!practiceFile) {
            return null;
        }

        const module = await import(`../data/Boards/${folderName}/questions/${practiceFile}.json`);
        return module.default;
    } catch (error) {
        console.error(`Failed to load Practice Questions: ${subject}/${chapterId}`, error);
        return null;
    }
}

/**
 * Load Derivation content for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {Promise<Object|null>}
 */
export async function loadDerivationsContent(subject, chapterId) {
    try {
        const folderName = subjectFolderMap[subject.toLowerCase()] || subject;
        const chapterSlug = getChapterFileSlug(subject, chapterId);

        console.log(`[ContentLoader] Loading derivations for ${subject}/${chapterId}`);
        console.log(`[ContentLoader] Folder: ${folderName}, Slug: ${chapterSlug}`);

        if (!chapterSlug) {
            console.warn(`[ContentLoader] No slug found for ${chapterId}`);
            return null;
        }

        const module = await import(`../data/Boards/${folderName}/Derivations/${chapterSlug}.json`);
        console.log(`[ContentLoader] Module loaded successfully`);
        return module.default;
    } catch (error) {
        console.error(`Failed to load Derivations: ${subject}/${chapterId}`, error);
        return null;
    }
}

/**
 * Check if Derivations are available for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {boolean}
 */
export function hasDerivationsAvailable(subject, chapterId) {
    // Currently only Physics has derivations
    return subject.toLowerCase() === 'physics';
}

/**
 * Load Physics Questions from JSON file
 * @param {string} chapterId - Chapter ID (e.g., 'electric-charges')
 * @returns {Promise<Object[]|null>} Array of question bank objects
 */
export async function loadPhysicsQuestions(chapterId) {
    try {
        const fileSlug = getChapterFileSlug('physics', chapterId);
        if (!fileSlug) {
            console.warn(`No slug mapped for physics chapter ${chapterId}`);
            return null;
        }

        const path = `../data/Boards/Physics/Questions/${fileSlug}.json`;
        const loader = chapterModules[path];

        if (!loader) {
            console.error(`Physics questions file not found: ${path}`);
            return null;
        }

        const module = await loader();
        return module.default;
    } catch (error) {
        console.error(`Failed to load physics questions: ${chapterId}`, error);
        return null;
    }
}

/**
 * Load Graphs content for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {Promise<Object|null>}
 */
export async function loadGraphsContent(subject, chapterId) {
    try {
        const folderName = subjectFolderMap[subject.toLowerCase()] || subject;
        const chapterSlug = getChapterFileSlug(subject, chapterId);

        if (!chapterSlug) {
            console.warn(`[ContentLoader] No slug found for graphs chapter ${chapterId}`);
            return null;
        }

        const path = `../data/Boards/${folderName}/Graphs/${chapterSlug}.json`;
        const loader = chapterModules[path];

        if (!loader) {
            console.error(`Graphs file not found: ${path}`);
            return null;
        }

        const module = await loader();
        return module.default;
    } catch (error) {
        console.error(`Failed to load Graphs: ${subject}/${chapterId}`, error);
        return null;
    }
}

/**
 * Check if Graphs are available for a chapter
 * @param {string} subject
 * @param {string} chapterId
 * @returns {boolean}
 */
export function hasGraphsAvailable(subject, chapterId) {
    // Currently only Physics has graphs
    return subject.toLowerCase() === 'physics';
}

