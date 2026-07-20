import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chapters = [
    { file: 'alternatingcurrent.json', name: 'Alternating Current' },
    { file: 'atoms.json', name: 'Atoms' },
    { file: 'currentelectricity.json', name: 'Current Electricity' },
    { file: 'dualnature.json', name: 'Dual Nature of Radiation and Matter' },
    // electricfieldandcharges.json is already handled
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
    // We check if file exists, but we also want to overwrite if it's empty or invalid? No, just check existence.
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
