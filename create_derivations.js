const fs = require('fs');
const path = require('path');

const chapters = [
    { file: 'alternatingcurrent.json', name: 'Alternating Current' },
    { file: 'atoms.json', name: 'Atoms' },
    { file: 'currentelectricity.json', name: 'Current Electricity' },
    { file: 'dualnature.json', name: 'Dual Nature of Radiation and Matter' },
    // electricfieldandcharges.json already exists
    { file: 'electromagneticinduction.json', name: 'Electromagnetic Induction' },
    { file: 'electrostaticpotentialandcapicitance.json', name: 'Electrostatic Potential and Capacitance' },
    { file: 'emwaves.json', name: 'Electromagnetic Waves' },
    { file: 'magentismandmatter.json', name: 'Magnetism and Matter' },
    { file: 'movingchargesandmagnetism.json', name: 'Moving Charges and Magnetism' },
    { file: 'nuclie.json', name: 'Nuclei' },
    { file: 'rayoptics.json', name: 'Ray Optics and Optical Instruments' },
    { file: 'semiconductor.json', name: 'Semiconductor Electronics' },
    { file: 'waveoptics.json', name: 'Wave Optics' }
];

const targetDir = path.join(__dirname, 'src', 'data', 'Boards', 'Physics', 'Derivations');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

chapters.forEach(chapter => {
    const filePath = path.join(targetDir, chapter.file);
    if (!fs.existsSync(filePath)) {
        const content = {
            meta: {
                subject: "Physics",
                chapter: chapter.name,
                class: 12,
                board: "CBSE"
            },
            derivations: []
        };
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Created ${chapter.file}`);
    } else {
        console.log(`Skipped ${chapter.file} (exists)`);
    }
});
