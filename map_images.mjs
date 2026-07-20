
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'Physics', 'Derivations');
const CONTENT_DIR = path.join(__dirname, 'src', 'data', 'Boards', 'Physics');

function getImages() {
    if (!fs.existsSync(IMAGES_DIR)) return [];
    return fs.readdirSync(IMAGES_DIR).filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i));
}

function tokenize(str) {
    if (!str) return [];
    return str.toLowerCase()
        .replace(/\.png|\.jpg|\.jpeg|json/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 3); // Only words > 3 chars
}

function findBestMatch(text, images) {
    if (!text) return null;
    const textTokens = tokenize(text);
    if (textTokens.length === 0) return null;

    let bestMatch = null;
    let maxScore = 0;

    for (const img of images) {
        const imgTokens = tokenize(img);
        let score = 0;
        const matchedTokens = [];

        for (const t of imgTokens) {
            if (textTokens.includes(t)) {
                score++;
                matchedTokens.push(t);
            }
        }

        // Bonus for exact word sequence? No, keep it simple.

        if (score > maxScore) {
            maxScore = score;
            bestMatch = img;
        }
    }

    // Threshold: at least 2 matching significant words
    if (maxScore >= 2) {
        return { match: bestMatch, score: maxScore };
    }
    return null;
}

function processFile(filePath, images) {
    const content = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
        return;
    }

    let modified = false;

    // Helper to process a list of items
    const processItems = (items) => {
        if (!Array.isArray(items)) return;
        for (const item of items) {
            let targetText = item.title || item.question || item.assertion || item.diagram_name || item.used_for;

            // If item is a diagram type or has diagram_required
            let shouldProcess = (item.diagram_required === true) ||
                (item.type === 'diagram') ||
                (item.diagram_name && item.image_path) ||
                (item.image && !item.image.includes('Physics/Derivations')); // Fix existing wrong paths

            if (!targetText || !shouldProcess) continue;

            // Check if image is already correct (in the target folder)
            let currentImage = item.image || item.image_path;
            if (currentImage && currentImage.includes('/images/Physics/Derivations/')) {
                // But check if we can find a BETTER match? No, assume if it's in Derivations/ it's likely correct or already mapped.
                // However, user might have renamed files.
                // For now, let's trust it if it's in the correct folder, UNLESS we want to force remap.
                // Let's force remap if it's one of the files we just renamed/typo fixed?
                // No, just keep it simple.
                continue;
            }

            const result = findBestMatch(targetText, images);
            if (result) {
                const imagePath = `/images/Physics/Derivations/${result.match}`;

                if (item.image && item.image !== imagePath) {
                    item.image = imagePath;
                    console.log(`[MATCH] "${targetText.slice(0, 40)}..." -> ${result.match} (Score: ${result.score})`);
                    modified = true;
                }
                if (item.image_path && item.image_path !== imagePath) {
                    item.image_path = imagePath;
                    console.log(`[MATCH] "${targetText.slice(0, 40)}..." -> ${result.match} (Score: ${result.score})`);
                    modified = true;
                }
                // If neither exists but we should process (e.g. type=diagram without image?)
                if (!item.image && !item.image_path && item.type === 'diagram') {
                    item.image = imagePath;
                    console.log(`[MATCH-NEW] "${targetText.slice(0, 40)}..." -> ${result.match} (Score: ${result.score})`);
                    modified = true;
                }
            }
        }
    };

    if (data.derivations) processItems(data.derivations);
    if (data.questions) processItems(data.questions);
    if (data.notes) processItems(data.notes);
    if (data.diagram_descriptors) processItems(data.diagram_descriptors);
    if (Array.isArray(data)) processItems(data);

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated ${path.basename(filePath)}`);
    }
}

function traverseDir(dir, images) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath, images);
        } else if (file.endsWith('.json')) {
            processFile(fullPath, images);
        }
    }
}

const images = getImages();
console.log(`Found ${images.length} images. Starting mapping...`);
traverseDir(CONTENT_DIR, images);
