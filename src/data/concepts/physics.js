/**
 * Physics Chapter Concepts Bank
 * Contains tagged concepts per chapter for controlled question generation
 * Structure: chapter → concepts array with difficulty, types, PYQ refs
 */

export const physicsConceptBank = {
    'electric-charges': {
        name: 'Electric Charges and Fields',
        concepts: [
            // Fundamentals
            { id: 'charge-properties', name: 'Properties of Electric Charge', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '1.2' },
            { id: 'coulombs-law', name: "Coulomb's Law", difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical', 'theory'], ncertRef: '1.4' },
            { id: 'superposition', name: 'Superposition Principle', difficulty: ['moderate', 'high'], types: ['numerical'], ncertRef: '1.5' },

            // Electric Field
            { id: 'electric-field-point', name: 'Electric Field due to Point Charge', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '1.6' },
            { id: 'electric-field-lines', name: 'Electric Field Lines', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '1.7' },

            // Dipole
            { id: 'dipole-field-axial', name: 'Dipole Field on Axial Line', difficulty: ['moderate', 'high'], types: ['derivation', 'numerical'], ncertRef: '1.8' },
            { id: 'dipole-field-equatorial', name: 'Dipole Field on Equatorial Line', difficulty: ['moderate', 'high'], types: ['derivation', 'numerical'], ncertRef: '1.8' },
            { id: 'dipole-uniform-field', name: 'Dipole in Uniform Electric Field', difficulty: ['moderate'], types: ['mcq', 'numerical', 'theory'], ncertRef: '1.9' },

            // Gauss Law
            { id: 'electric-flux', name: 'Electric Flux', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '1.10' },
            { id: 'gauss-law', name: "Gauss's Law Statement", difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '1.11' },
            { id: 'gauss-sphere', name: "Gauss's Law - Spherical Shell", difficulty: ['moderate', 'high'], types: ['derivation'], ncertRef: '1.12' },
            { id: 'gauss-plane', name: "Gauss's Law - Infinite Plane Sheet", difficulty: ['moderate', 'high'], types: ['derivation'], ncertRef: '1.13' },
            { id: 'gauss-wire', name: "Gauss's Law - Infinite Wire", difficulty: ['moderate', 'high'], types: ['derivation'], ncertRef: '1.14' }
        ],
        pyqTemplates: [
            { id: 'pyq-ch1-001', concept: 'coulombs-law', type: 'numerical', marks: 3, year: 2023, question: 'Two charges {q1} and {q2} are placed {r} apart. Find force.' },
            { id: 'pyq-ch1-002', concept: 'dipole-field-axial', type: 'derivation', marks: 3, year: 2022, question: 'Derive electric field on axial line of dipole.' },
            { id: 'pyq-ch1-003', concept: 'gauss-plane', type: 'derivation', marks: 5, year: 2023, question: 'Using Gauss law, derive field due to infinite plane sheet.' },
            { id: 'pyq-ch1-004', concept: 'dipole-uniform-field', type: 'numerical', marks: 2, year: 2021, question: 'Dipole of moment p in field E makes angle θ. Find torque.' },
            { id: 'pyq-ch1-005', concept: 'electric-field-point', type: 'mcq', marks: 1, year: 2023, question: 'E at distance r from charge q is...' }
        ],
        keyFormulae: [
            { name: "Coulomb's Law", formula: '$F = \\frac{1}{4\\pi\\epsilon_0} \\frac{q_1 q_2}{r^2}$' },
            { name: 'Electric Field', formula: '$E = \\frac{1}{4\\pi\\epsilon_0} \\frac{q}{r^2}$' },
            { name: 'Dipole Field (Axial)', formula: '$E_{axial} = \\frac{1}{4\\pi\\epsilon_0} \\frac{2p}{r^3}$' },
            { name: 'Dipole Field (Equatorial)', formula: '$E_{eq} = \\frac{1}{4\\pi\\epsilon_0} \\frac{p}{r^3}$' },
            { name: 'Torque on Dipole', formula: '$\\tau = pE\\sin\\theta$' },
            { name: "Gauss's Law", formula: '$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enc}}{\\epsilon_0}$' },
            { name: 'Field (Infinite Sheet)', formula: '$E = \\frac{\\sigma}{2\\epsilon_0}$' }
        ]
    },

    'electrostatic-potential': {
        name: 'Electrostatic Potential and Capacitance',
        concepts: [
            { id: 'potential-point', name: 'Potential due to Point Charge', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '2.2' },
            { id: 'potential-dipole', name: 'Potential due to Dipole', difficulty: ['moderate'], types: ['derivation', 'numerical'], ncertRef: '2.3' },
            { id: 'equipotential', name: 'Equipotential Surfaces', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '2.4' },
            { id: 'potential-energy', name: 'Potential Energy of Charges', difficulty: ['moderate'], types: ['numerical'], ncertRef: '2.5' },
            { id: 'capacitance', name: 'Capacitance Definition', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '2.7' },
            { id: 'parallel-plate', name: 'Parallel Plate Capacitor', difficulty: ['moderate', 'high'], types: ['derivation', 'numerical'], ncertRef: '2.8' },
            { id: 'capacitor-dielectric', name: 'Effect of Dielectric', difficulty: ['moderate'], types: ['mcq', 'numerical'], ncertRef: '2.9' },
            { id: 'capacitor-combination', name: 'Combination of Capacitors', difficulty: ['moderate', 'high'], types: ['numerical'], ncertRef: '2.10' },
            { id: 'energy-capacitor', name: 'Energy Stored in Capacitor', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '2.11' }
        ],
        pyqTemplates: [
            { id: 'pyq-ch2-001', concept: 'parallel-plate', type: 'derivation', marks: 3, year: 2023, question: 'Derive capacitance of parallel plate capacitor.' },
            { id: 'pyq-ch2-002', concept: 'capacitor-combination', type: 'numerical', marks: 3, year: 2022, question: 'Find equivalent capacitance of given network.' },
            { id: 'pyq-ch2-003', concept: 'equipotential', type: 'theory', marks: 2, year: 2021, question: 'Why is work done zero moving charge on equipotential?' }
        ],
        keyFormulae: [
            { name: 'Potential', formula: '$V = \\frac{1}{4\\pi\\epsilon_0} \\frac{q}{r}$' },
            { name: 'Parallel Plate Capacitance', formula: '$C = \\frac{\\epsilon_0 A}{d}$' },
            { name: 'With Dielectric', formula: '$C = \\frac{K\\epsilon_0 A}{d}$' },
            { name: 'Energy', formula: '$U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C}$' }
        ]
    },

    'current-electricity': {
        name: 'Current Electricity',
        concepts: [
            { id: 'current-drift', name: 'Drift Velocity and Current', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical', 'derivation'], ncertRef: '3.2' },
            { id: 'ohms-law', name: "Ohm's Law", difficulty: ['easy'], types: ['mcq', 'numerical'], ncertRef: '3.3' },
            { id: 'resistivity', name: 'Resistivity and Conductivity', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '3.5' },
            { id: 'temp-dependence', name: 'Temperature Dependence of Resistance', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '3.6' },
            { id: 'emf-internal', name: 'EMF and Internal Resistance', difficulty: ['moderate'], types: ['numerical'], ncertRef: '3.8' },
            { id: 'kirchhoff', name: "Kirchhoff's Laws", difficulty: ['moderate', 'high'], types: ['numerical', 'theory'], ncertRef: '3.10' },
            { id: 'wheatstone', name: 'Wheatstone Bridge', difficulty: ['moderate'], types: ['numerical', 'derivation'], ncertRef: '3.11' },
            { id: 'meter-bridge', name: 'Meter Bridge', difficulty: ['moderate'], types: ['numerical'], ncertRef: '3.12' },
            { id: 'potentiometer', name: 'Potentiometer', difficulty: ['moderate', 'high'], types: ['numerical', 'theory'], ncertRef: '3.13' }
        ],
        pyqTemplates: [],
        keyFormulae: [
            { name: 'Drift Velocity', formula: '$v_d = \\frac{eE\\tau}{m}$' },
            { name: 'Current', formula: '$I = neAv_d$' },
            { name: "Ohm's Law", formula: '$V = IR$' },
            { name: 'Resistivity', formula: '$R = \\rho\\frac{l}{A}$' },
            { name: 'EMF', formula: '$\\mathcal{E} = V + Ir$' }
        ]
    },

    'moving-charges': {
        name: 'Moving Charges and Magnetism',
        concepts: [
            { id: 'lorentz-force', name: 'Lorentz Force', difficulty: ['easy', 'moderate'], types: ['mcq', 'numerical'], ncertRef: '4.2' },
            { id: 'motion-magnetic', name: 'Motion in Magnetic Field', difficulty: ['moderate'], types: ['numerical', 'derivation'], ncertRef: '4.3' },
            { id: 'biot-savart', name: 'Biot-Savart Law', difficulty: ['moderate', 'high'], types: ['derivation', 'numerical'], ncertRef: '4.4' },
            { id: 'ampere-law', name: "Ampere's Circuital Law", difficulty: ['moderate', 'high'], types: ['derivation'], ncertRef: '4.6' },
            { id: 'solenoid', name: 'Field due to Solenoid', difficulty: ['moderate'], types: ['derivation', 'numerical'], ncertRef: '4.7' },
            { id: 'force-conductors', name: 'Force between Parallel Conductors', difficulty: ['moderate'], types: ['derivation', 'numerical'], ncertRef: '4.8' },
            { id: 'torque-loop', name: 'Torque on Current Loop', difficulty: ['moderate'], types: ['derivation', 'numerical'], ncertRef: '4.9' },
            { id: 'moving-coil', name: 'Moving Coil Galvanometer', difficulty: ['moderate'], types: ['theory', 'numerical'], ncertRef: '4.10' }
        ],
        pyqTemplates: [],
        keyFormulae: [
            { name: 'Lorentz Force', formula: '$\\vec{F} = q(\\vec{v} \\times \\vec{B})$' },
            { name: 'Biot-Savart', formula: '$dB = \\frac{\\mu_0}{4\\pi} \\frac{I dl \\sin\\theta}{r^2}$' },
            { name: 'Field at Center of Loop', formula: '$B = \\frac{\\mu_0 I}{2R}$' },
            { name: 'Solenoid', formula: '$B = \\mu_0 nI$' }
        ]
    },

    'semiconductor': {
        name: 'Semiconductor Electronics',
        concepts: [
            { id: 'intrinsic', name: 'Intrinsic Semiconductors', difficulty: ['easy'], types: ['mcq', 'theory'], ncertRef: '14.2' },
            { id: 'extrinsic', name: 'Extrinsic Semiconductors (n & p type)', difficulty: ['easy', 'moderate'], types: ['mcq', 'theory'], ncertRef: '14.3' },
            { id: 'pn-junction', name: 'p-n Junction Formation', difficulty: ['moderate'], types: ['theory', 'derivation'], ncertRef: '14.4' },
            { id: 'pn-biasing', name: 'Forward & Reverse Bias', difficulty: ['easy', 'moderate'], types: ['mcq', 'theory'], ncertRef: '14.5' },
            { id: 'diode-characteristics', name: 'Diode V-I Characteristics', difficulty: ['moderate'], types: ['theory'], ncertRef: '14.5' },
            { id: 'rectifier-half', name: 'Half Wave Rectifier', difficulty: ['moderate'], types: ['theory', 'numerical'], ncertRef: '14.6' },
            { id: 'rectifier-full', name: 'Full Wave Rectifier', difficulty: ['moderate'], types: ['theory', 'numerical'], ncertRef: '14.6' },
            { id: 'zener-diode', name: 'Zener Diode as Voltage Regulator', difficulty: ['moderate'], types: ['theory', 'numerical'], ncertRef: '14.7' },
            { id: 'transistor-basics', name: 'Transistor (npn, pnp)', difficulty: ['moderate'], types: ['mcq', 'theory'], ncertRef: '14.8' },
            { id: 'transistor-amplifier', name: 'Transistor as Amplifier', difficulty: ['moderate', 'high'], types: ['numerical', 'theory'], ncertRef: '14.9' },
            { id: 'logic-gates', name: 'Logic Gates (AND, OR, NOT, NAND, NOR)', difficulty: ['easy', 'moderate'], types: ['mcq', 'theory'], ncertRef: '14.10' }
        ],
        pyqTemplates: [],
        keyFormulae: [
            { name: 'Current Gain (α)', formula: '$\\alpha = \\frac{I_C}{I_E}$' },
            { name: 'Current Gain (β)', formula: '$\\beta = \\frac{I_C}{I_B}$' },
            { name: 'Relation', formula: '$\\beta = \\frac{\\alpha}{1-\\alpha}$' },
            { name: 'Voltage Gain', formula: '$A_v = \\beta \\frac{R_{out}}{R_{in}}$' }
        ]
    }
};

// Helper to get all concepts for a chapter
export function getChapterConcepts(chapterId) {
    return physicsConceptBank[chapterId]?.concepts || [];
}

// Helper to get concepts by difficulty
export function getConceptsByDifficulty(chapterId, difficulty) {
    const concepts = getChapterConcepts(chapterId);
    return concepts.filter(c => c.difficulty.includes(difficulty));
}

// Helper to get concepts by question type
export function getConceptsByType(chapterId, type) {
    const concepts = getChapterConcepts(chapterId);
    return concepts.filter(c => c.types.includes(type));
}

// Helper to get PYQ templates
export function getPYQTemplates(chapterId) {
    return physicsConceptBank[chapterId]?.pyqTemplates || [];
}

// Helper to get key formulae
export function getKeyFormulae(chapterId) {
    return physicsConceptBank[chapterId]?.keyFormulae || [];
}

export default physicsConceptBank;
