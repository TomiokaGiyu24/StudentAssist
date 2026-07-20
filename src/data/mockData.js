// Mock data for Class 12 CBSE subjects and chapters

export const subjects = [
    {
        id: 'physics',
        name: 'Physics',
        tagline: 'High scoring | Numerical heavy',
        icon: '⚡',
        color: 'blue'
    },
    {
        id: 'chemistry',
        name: 'Chemistry',
        tagline: 'Theory + Numerical | Most reactions',
        icon: '🧪',
        color: 'green'
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        tagline: 'Most difficult | Practice essential',
        icon: '📐',
        color: 'purple'
    },
    {
        id: 'biology',
        name: 'Biology',
        tagline: 'Memory based | Diagram heavy',
        icon: '🧬',
        color: 'emerald'
    },
    {
        id: 'physical-education',
        name: 'Physical Education',
        tagline: 'Theory based | High scoring',
        icon: '🏃',
        color: 'orange'
    },
    {
        id: 'english',
        name: 'English',
        tagline: 'Literature | Analytical',
        icon: '📚',
        color: 'rose'
    }
];

export const chapters = {
    physics: [
        { id: 'electric-charges', name: 'Electric Charges and Fields', difficulty: 'medium', weightage: 8 },
        { id: 'electrostatic-potential', name: 'Electrostatic Potential and Capacitance', difficulty: 'medium', weightage: 7 },
        { id: 'current-electricity', name: 'Current Electricity', difficulty: 'easy', weightage: 8 },
        { id: 'moving-charges', name: 'Moving Charges and Magnetism', difficulty: 'hard', weightage: 7 },
        { id: 'magnetism-matter', name: 'Magnetism and Matter', difficulty: 'easy', weightage: 4 },
        { id: 'electromagnetic-induction', name: 'Electromagnetic Induction', difficulty: 'hard', weightage: 7 },
        { id: 'alternating-current', name: 'Alternating Current', difficulty: 'hard', weightage: 7 },
        { id: 'em-waves', name: 'Electromagnetic Waves', difficulty: 'easy', weightage: 4 },
        { id: 'ray-optics', name: 'Ray Optics and Optical Instruments', difficulty: 'medium', weightage: 9 },
        { id: 'wave-optics', name: 'Wave Optics', difficulty: 'medium', weightage: 6 },
        { id: 'dual-nature', name: 'Dual Nature of Radiation and Matter', difficulty: 'medium', weightage: 6 },
        { id: 'atoms', name: 'Atoms', difficulty: 'easy', weightage: 4 },
        { id: 'nuclei', name: 'Nuclei', difficulty: 'medium', weightage: 5 },
        { id: 'semiconductor', name: 'Semiconductor Electronics', difficulty: 'medium', weightage: 8 },
    ],
    chemistry: [
        { id: 'solutions', name: 'Solutions', difficulty: 'Hard', weightage: '5-7 marks' },
        { id: 'electrochemistry', name: 'Electrochemistry', difficulty: 'Hard', weightage: '5-7 marks' },
        { id: 'chemical-kinetics', name: 'Chemical Kinetics', difficulty: 'Medium', weightage: '5-6 marks' },
        { id: 'd-and-f-block', name: 'The d-and f-Block Elements', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'periodic-table', name: 'The Periodic Table', difficulty: 'Easy', weightage: 'Reference' },
        { id: 'coordination-compounds', name: 'Coordination Compounds', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'organic-bridge', name: 'Organic Chemistry Prerequisite Bridge', difficulty: 'Medium', weightage: 'Critical' },
        { id: 'haloalkanes', name: 'Haloalkanes and Haloarenes', difficulty: 'Easy', weightage: '6-7 marks' },
        { id: 'alcohols-phenols', name: 'Alcohols, Phenols and Ethers', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'aldehydes-ketones', name: 'Aldehydes, Ketones and Carboxylic Acids', difficulty: 'Hard', weightage: '7-9 marks' },
        { id: 'amines', name: 'Amines', difficulty: 'Medium', weightage: '5-6 marks' },
        { id: 'biomolecules', name: 'Biomolecules', difficulty: 'Easy', weightage: '6-7 marks' },
    ],
    mathematics: [
        { id: 'relations-functions', name: 'Relations and Functions', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'inverse-trig', name: 'Inverse Trigonometric Functions', difficulty: 'Easy', weightage: '4-6 marks' },
        { id: 'matrices', name: 'Matrices', difficulty: 'Easy', weightage: '5-6 marks' },
        { id: 'determinants', name: 'Determinants', difficulty: 'Medium', weightage: '5-7 marks' },
        { id: 'continuity-differentiability', name: 'Continuity and Differentiability', difficulty: 'Hard', weightage: '8-10 marks' },
        { id: 'applications-derivatives', name: 'Application of Derivatives', difficulty: 'Hard', weightage: '8-10 marks' },
        { id: 'integrals', name: 'Integrals', difficulty: 'Hard', weightage: '10-12 marks' },
        { id: 'application-of-integrals', name: 'Application of Integrals', difficulty: 'Medium', weightage: '5-7 marks' },
        { id: 'differential-equations', name: 'Differential Equations', difficulty: 'Medium', weightage: '5-7 marks' },
        { id: 'vector-algebra', name: 'Vector Algebra', difficulty: 'Easy', weightage: '5-7 marks' },
        { id: 'three-dimensional-geometry', name: 'Three Dimensional Geometry', difficulty: 'Hard', weightage: '8-10 marks' },
    ],
    biology: [
        { id: 'reproduction-organisms', name: 'Reproduction in Organisms', difficulty: 'Easy', weightage: '4-5 marks' },
        { id: 'sexual-reproduction', name: 'Sexual Reproduction in Flowering Plants', difficulty: 'Medium', weightage: '5-7 marks' },
        { id: 'human-reproduction', name: 'Human Reproduction', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'reproductive-health', name: 'Reproductive Health', difficulty: 'Easy', weightage: '4-5 marks' },
        { id: 'inheritance-variation', name: 'Principles of Inheritance and Variation', difficulty: 'Hard', weightage: '8-10 marks' },
        { id: 'molecular-biology', name: 'Molecular Basis of Inheritance', difficulty: 'Hard', weightage: '8-10 marks' },
        { id: 'evolution', name: 'Evolution', difficulty: 'Medium', weightage: '5-6 marks' },
        { id: 'human-health', name: 'Human Health and Disease', difficulty: 'Medium', weightage: '6-8 marks' },
    ],
    'physical-education': [
        { id: 'management-sporting-events', name: 'Management of Sporting Events', difficulty: 'Easy', weightage: '6-8 marks' },
        { id: 'children-women-sports', name: 'Children and Women in Sports', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'yoga-lifestyle', name: 'Yoga as Preventive Measure for Lifestyle Disease', difficulty: 'Easy', weightage: '6-8 marks' },
        { id: 'cwsn-divyang', name: 'Physical Education and Sports for CWSN (Divyang)', difficulty: 'Easy', weightage: '4-6 marks' },
        { id: 'sports-nutrition', name: 'Sports and Nutrition', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'test-measurement', name: 'Test and Measurement in Sports', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'physiology-injuries', name: 'Physiology and Injuries in Sports', difficulty: 'Hard', weightage: '8-10 marks' },
        { id: 'biomechanics', name: 'Biomechanics and Sports', difficulty: 'Hard', weightage: '6-8 marks' },
        { id: 'psychology-sports', name: 'Psychology and Sports', difficulty: 'Medium', weightage: '6-8 marks' },
        { id: 'training-sports', name: 'Training in Sports', difficulty: 'Medium', weightage: '6-8 marks' }
    ],
    english: [
        { id: 'the-last-lesson', name: 'The Last Lesson', difficulty: 'Easy', weightage: 'High' },
        { id: 'lost-spring', name: 'Lost Spring', difficulty: 'Medium', weightage: 'High' },
        { id: 'deep-water', name: 'Deep Water', difficulty: 'Hard', weightage: 'Medium' },
        { id: 'the-rattrap', name: 'The Rattrap', difficulty: 'Medium', weightage: 'High' },
        { id: 'indigo', name: 'Indigo', difficulty: 'Medium', weightage: 'High' },
        { id: 'poets-and-pancakes', name: 'Poets and Pancakes', difficulty: 'Hard', weightage: 'Low' },
        { id: 'the-interview', name: 'The Interview', difficulty: 'Easy', weightage: 'Low' },
        { id: 'going-places', name: 'Going Places', difficulty: 'Medium', weightage: 'Medium' },
        { id: 'my-mother-at-66', name: 'My Mother at Sixty-Six', difficulty: 'Easy', weightage: 'High' },
        { id: 'keeping-quiet', name: 'Keeping Quiet', difficulty: 'Easy', weightage: 'High' },
        { id: 'a-thing-of-beauty', name: 'A Thing of Beauty', difficulty: 'Medium', weightage: 'Medium' },
        { id: 'a-roadside-stand', name: 'A Roadside Stand', difficulty: 'Hard', weightage: 'Medium' },
        { id: 'aunt-jennifers-tigers', name: 'Aunt Jennifer\'s Tigers', difficulty: 'Medium', weightage: 'High' },
        { id: 'the-third-level', name: 'The Third Level', difficulty: 'Medium', weightage: 'High' },
        { id: 'the-tiger-king', name: 'The Tiger King', difficulty: 'Easy', weightage: 'High' },
        { id: 'journey-to-the-end-of-the-earth', name: 'Journey to the End of the Earth', difficulty: 'Hard', weightage: 'Medium' },
        { id: 'the-enemy', name: 'The Enemy', difficulty: 'Hard', weightage: 'High' },
        { id: 'on-the-face-of-it', name: 'On The Face Of It', difficulty: 'Medium', weightage: 'Medium' },
        { id: 'memories-of-childhood', name: 'Memories of Childhood', difficulty: 'Medium', weightage: 'Low' }
    ]
};

export const fullSyllabusMocks = {
    'physical-education': [
        { id: 'pe-mock-1', name: 'Full Syllabus Mock 1', difficulty: 'Standard', weightage: '70 marks', duration: 180 },
        { id: 'pe-mock-2', name: 'Full Syllabus Mock 2', difficulty: 'Standard', weightage: '70 marks', duration: 180 },
        { id: 'pe-mock-3', name: 'Full Syllabus Mock 3', difficulty: 'Standard', weightage: '70 marks', duration: 180 },
        { id: 'pe-mock-4', name: 'Full Syllabus Mock 4', difficulty: 'Standard', weightage: '70 marks', duration: 180 },
        { id: 'pe-mock-5', name: 'Full Syllabus Mock 5', difficulty: 'Standard', weightage: '70 marks', duration: 180 },
    ]
};

// Chapter Marks View Content
export const chapterMarksData = {
    'electric-charges': {
        examSnapshot: {
            chapterName: 'Electric Charges and Fields',
            weightage: 'High',
            questionTypes: ['Theory', 'Numericals', 'Derivations'],
            frequency: 'Frequently Asked',
            expectedMarks: '8-10 marks'
        },
        ncertNotes: [
            'Electric charge is a scalar quantity with SI unit Coulomb (C).',
            'Like charges repel, unlike charges attract — fundamental property.',
            'Quantization of charge: q = ne, where e = 1.6 × 10⁻¹⁹ C.',
            'Conservation of charge: Total charge in an isolated system remains constant.',
            'Coulomb\'s Law: F = kq₁q₂/r² where k = 9 × 10⁹ Nm²/C².',
            'Electric field E = F/q₀ = kQ/r² for a point charge.',
            'Electric field lines: Never cross, start from +ve and end at -ve charge.',
            'Electric dipole moment p = q × 2a, direction: -ve to +ve charge.',
            'Torque on dipole: τ = pE sinθ, maximum when θ = 90°.',
            'Gauss\'s Law: φ = q/ε₀, applies to closed surfaces only.'
        ],
        formulas: [
            { name: 'Coulomb\'s Law', formula: 'F = kq₁q₂/r²', tag: 'Direct Use', mostUsed: true },
            { name: 'Electric Field (Point Charge)', formula: 'E = kQ/r²', tag: 'Direct Use', mostUsed: true },
            { name: 'Electric Dipole Moment', formula: 'p = q × 2a', tag: 'Direct Use', mostUsed: false },
            { name: 'Axial Field of Dipole', formula: 'E = 2kp/r³', tag: 'Derivation Required', mostUsed: true },
            { name: 'Equatorial Field of Dipole', formula: 'E = kp/r³', tag: 'Derivation Required', mostUsed: true },
            { name: 'Torque on Dipole', formula: 'τ = pE sinθ', tag: 'Direct Use', mostUsed: false },
            { name: 'Potential Energy of Dipole', formula: 'U = -pE cosθ', tag: 'Derivation Required', mostUsed: false },
            { name: 'Gauss\'s Law', formula: 'φ = q_enclosed/ε₀', tag: 'Direct Use', mostUsed: true },
            { name: 'Field due to Infinite Sheet', formula: 'E = σ/2ε₀', tag: 'Derivation Required', mostUsed: true },
            { name: 'Field inside Conductor', formula: 'E = 0', tag: 'Direct Use', mostUsed: false }
        ],
        ncertExamples: [
            { number: 'Example 1.1', description: 'Force between two point charges using Coulomb\'s Law' },
            { number: 'Example 1.3', description: 'Electric field at a point due to system of charges' },
            { number: 'Example 1.5', description: 'Electric field on axial line of an electric dipole' },
            { number: 'Example 1.7', description: 'Torque on an electric dipole in uniform field' },
            { number: 'Example 1.10', description: 'Application of Gauss\'s Law for spherical shell' }
        ],
        questionBank: {
            oneTwo: [
                { question: 'Define electric field intensity. Write its SI unit.', tags: ['Repeated'] },
                { question: 'State Coulomb\'s law in electrostatics.', tags: ['Repeated', 'High Probability'] },
                { question: 'What is an electric dipole? Define dipole moment.', tags: ['High Probability'] },
                { question: 'Why do electric field lines never cross each other?', tags: [] },
                { question: 'Define linear charge density. Write its SI unit.', tags: [] }
            ],
            three: [
                { question: 'Derive expression for electric field at a point on the axial line of an electric dipole.', tags: ['Repeated', 'High Probability'] },
                { question: 'State Gauss\'s theorem. Use it to find electric field due to infinite plane sheet of charge.', tags: ['High Probability'] },
                { question: 'Two charges +3μC and -3μC are placed 2cm apart. Find electric field at perpendicular bisector at 4cm.', tags: [] },
                { question: 'Explain the behaviour of a dipole in (i) uniform and (ii) non-uniform electric field.', tags: ['Repeated'] }
            ],
            five: [
                { question: 'State and prove Gauss\'s law. Use it to derive expression for electric field due to uniformly charged spherical shell.', tags: ['Repeated', 'High Probability'] },
                { question: 'Derive expressions for electric field at (i) axial point and (ii) equatorial point of an electric dipole apply.', tags: ['High Probability'] },
                { question: 'Define electric flux. State Gauss\'s theorem and use it to find field due to infinitely long straight charged wire.', tags: ['Repeated'] }
            ],
            caseBased: [
                { question: 'A student performs an experiment with two charged balls. Based on the observations... (i) Calculate the force between them (ii) What happens if distance is doubled?', tags: ['High Probability'] },
                { question: 'An electric dipole is placed in a uniform electric field. Read the passage and answer: (i) What is the net force? (ii) Calculate torque if angle is 30°.', tags: [] }
            ]
        }
    }
};

// Default chapter content for chapters without specific data
export const defaultChapterData = {
    examSnapshot: {
        chapterName: 'Chapter Name',
        weightage: 'Medium',
        questionTypes: ['Theory', 'Numericals'],
        frequency: 'Occasionally Asked',
        expectedMarks: '5-7 marks'
    },
    ncertNotes: [
        'Key concept 1 from NCERT that appears in exams.',
        'Important definition that is frequently tested.',
        'Fundamental principle you must memorize.',
        'Relationship between quantities that is often asked.',
        'Special case or exception that examiners love.',
        'Application-based concept for numerical problems.'
    ],
    formulas: [
        { name: 'Primary Formula', formula: 'A = B × C', tag: 'Direct Use', mostUsed: true },
        { name: 'Derived Formula', formula: 'D = E/F', tag: 'Derivation Required', mostUsed: false },
        { name: 'Important Relation', formula: 'X = Y + Z', tag: 'Direct Use', mostUsed: true }
    ],
    ncertExamples: [
        { number: 'Example 1', description: 'Basic application of primary formula' },
        { number: 'Example 2', description: 'Problem involving derived quantities' },
        { number: 'Example 3', description: 'Multi-step calculation problem' }
    ],
    questionBank: {
        oneTwo: [
            { question: 'Define the key term from this chapter.', tags: ['Repeated'] },
            { question: 'State the fundamental law or principle.', tags: ['High Probability'] },
            { question: 'Write the SI unit of the main quantity.', tags: [] }
        ],
        three: [
            { question: 'Derive the expression for the primary quantity.', tags: ['High Probability'] },
            { question: 'Numerical problem based on formula application.', tags: [] }
        ],
        five: [
            { question: 'State and prove the main theorem of this chapter.', tags: ['Repeated', 'High Probability'] },
            { question: 'Long derivation with diagram and explanation.', tags: ['High Probability'] }
        ],
        caseBased: [
            { question: 'Read the passage about real-world application and answer the following questions.', tags: ['High Probability'] }
        ]
    }
};


