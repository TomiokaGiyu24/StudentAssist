
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'Physics', 'Derivations');
const CONTENT_DIR = path.join(__dirname, 'src', 'data', 'Boards', 'Physics');
const PUBLIC_DIR = path.join(__dirname, 'public');

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
        .filter(t => t.length > 2);
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

        // Exact match bonus
        if (text.toLowerCase() === img.toLowerCase().replace(/\.[^/.]+$/, "")) {
            return { match: img, score: 100 };
        }

        for (const t of imgTokens) {
            if (textTokens.includes(t)) {
                score++;
            }
        }

        // Penalize index length mismatch? No.

        if (score > maxScore) {
            maxScore = score;
            bestMatch = img;
        }
    }


    // Threshold: 
    // If text has only 1 token, allow score 1.
    // If text has 2+ tokens, require 2.
    // Also, if exact match (normalized), return highest score.
    const requiredScore = Math.min(2, textTokens.length);

    if (maxScore >= requiredScore) {
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

    // Helper to process notes
    const processNotes = (notes) => {
        if (!Array.isArray(notes)) return;
        for (const note of notes) {
            if (note.type === 'diagram' || note.image) {
                // Check if image exists
                let currentPath = note.image;
                let exists = false;
                if (currentPath) {
                    const absPath = path.join(PUBLIC_DIR, currentPath);
                    exists = fs.existsSync(absPath);
                }

                // If it doesn't exist OR it's not in the new standard directory
                if (!exists || !currentPath.includes('/images/Physics/Derivations/')) {
                    // Try to match
                    const targetText = note.title || note.diagram_name; // Use title as primary
                    const match = findBestMatch(targetText, images);

                    if (match) {
                        const newPath = `/images/Physics/Derivations/${match.match}`;
                        if (note.image !== newPath) {
                            console.log(`[UPDATE] ${path.basename(filePath)}: "${targetText}"`);
                            console.log(`    Old: ${currentPath || 'NONE'}`);
                            console.log(`    New: ${newPath} (Score: ${match.score})`);
                            note.image = newPath;
                            modified = true;
                        }
                    } else {
                        console.log(`[NO_MATCH] ${path.basename(filePath)}: "${targetText}" - Current: ${currentPath}`);
                    }
                } else {
                    // It exists and is in the right folder, but maybe we can double check mapping?
                    // User said "recheck".
                    // Let's verify if the filename matches title somewhat?
                    // For now, assume if it exists in Derivations/ it is correct, unless explicitly overriding.
                    // Actually, let's see if there is a BETTER match? No, that's risky.
                }

                // Update diagram_descriptors if present and linked
            }
        }
    };

    if (data.notes) processNotes(data.notes);

    // Also process diagram_descriptors because they might have paths too
    if (data.diagram_descriptors) {
        for (const desc of data.diagram_descriptors) {
            if (desc.image_path) {
                let currentPath = desc.image_path;
                let exists = false;
                if (currentPath) {
                    const absPath = path.join(PUBLIC_DIR, currentPath);
                    exists = fs.existsSync(absPath);
                }

                if (!exists || !currentPath.includes('/images/Physics/Derivations/')) {
                    const match = findBestMatch(desc.diagram_name, images);
                    if (match) {
                        const newPath = `/images/Physics/Derivations/${match.match}`;
                        if (desc.image_path !== newPath) {
                            console.log(`[UPDATE-DESC] ${desc.diagram_name} -> ${newPath}`);
                            desc.image_path = newPath;
                            modified = true;
                        }
                    }
                }
            }
        }
    }


    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${path.basename(filePath)}`);
    }
}

function traverseDir(dir, images) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // traverseDir(fullPath, images); 
            // Only root Physics folder has the main chapter notes usually? 
            // Or subfolders? Let's check subfolders too but be careful.
            // The user said "chapter notes", which are usually in src/data/Boards/Physics/CHAPTER.json
            // We should process those.
            if (file !== 'Images' && file !== 'PYQs' && file !== 'Derivations') {
                // Maybe recursion isn't needed if we know where they are.
                // But let's recurse to be safe, just skip known non-content dirs.
                traverseDir(fullPath, images);
            }
        } else if (file.endsWith('.json')) {
            processFile(fullPath, images);
        }
    }
}

const images = getImages();
console.log(`Found ${images.length} images.`);
traverseDir(CONTENT_DIR, images);
