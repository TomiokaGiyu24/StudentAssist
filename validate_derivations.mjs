import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const derivationsDir = path.join(__dirname, 'src', 'data', 'Boards', 'Physics', 'Derivations');

if (fs.existsSync(derivationsDir)) {
    const files = fs.readdirSync(derivationsDir);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(derivationsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                console.log(`✅ Valid: ${file}`);
            } catch (e) {
                console.error(`❌ Invalid: ${file}`);
                console.error(`   Error: ${e.message}`);
            }
        }
    });
} else {
    console.error("Derivations directory not found!");
}
