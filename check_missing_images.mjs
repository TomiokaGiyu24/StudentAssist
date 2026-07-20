
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, 'src', 'data', 'Boards', 'Physics');

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        return;
    }

    const processItems = (items) => {
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if ((item.diagram_required === true) && !item.image && !item.image_path) {
                console.log(`[MISSING] ${path.basename(filePath)}: "${item.title || item.question?.slice(0, 30) || 'Unknown'}"`);
            }
        }
    };

    if (data.derivations) processItems(data.derivations);
    if (data.questions) processItems(data.questions);
    if (Array.isArray(data)) processItems(data);
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (file.endsWith('.json')) {
            processFile(fullPath);
        }
    }
}

console.log("Checking for missing images...");
traverseDir(CONTENT_DIR);
