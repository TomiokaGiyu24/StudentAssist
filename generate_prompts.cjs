const fs = require('fs');
const path = require('path');

// Basic manual recursive glob for CommonJS since we can't reliably require 'glob' if it's strictly ESM
function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const baseDir = path.resolve('src/data/Boards/Chemistry');
const jsonFiles = findJsonFiles(baseDir);

let allPrompts = '# AI Image Generation Prompts - Chemistry (All Chapters)\n\n';
allPrompts += 'Below are the optimized AI image generator prompts for all Chemistry chapters. ';
allPrompts += 'These prompts are explicitly designed to produce **NCERT-oriented, board-exam friendly, clean, and minimalist educational diagrams** ';
allPrompts += 'with soothing backgrounds and exact data matching the syllabus.\n\n';

jsonFiles.forEach(filePath => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        if (data.visual_elements && data.visual_elements.length > 0) {
            const chapterName = path.basename(filePath, '.json');
            allPrompts += '---\n\n## Chapter: ' + chapterName.toUpperCase() + '\n\n';

            data.visual_elements.forEach((visual, index) => {
                let promptDesc = '';

                if (visual.visual_type.includes('Graph')) {
                    promptDesc = `A clear, minimalist educational 2D vector graph illustrating '${visual.visual_title}'. Set on a soothing, light neutral background (like soft cream). `;
                    if (visual.axes_or_components) {
                        promptDesc += `The horizontal x-axis is cleanly labeled "${visual.axes_or_components.x_axis || 'X'}". The vertical y-axis is labeled "${visual.axes_or_components.y_axis || 'Y'}". `;
                        if (visual.axes_or_components.important_labels && visual.axes_or_components.important_labels.length > 0) {
                            promptDesc += `Ensure the following labels are clearly and precisely marked: ${visual.axes_or_components.important_labels.join(', ')}. `;
                        }
                        if (visual.axes_or_components.key_points_to_mark && visual.axes_or_components.key_points_to_mark.length > 0) {
                            promptDesc += `Pay special attention to plotting these key points accurately according to the concept: ${visual.axes_or_components.key_points_to_mark.join(', ')}. `;
                        }
                    }
                } else if (visual.visual_type.includes('Mechanism') || visual.visual_type.includes('Reaction')) {
                    promptDesc = `A highly accurate, uncluttered textbook-style chemical mechanism diagram for '${visual.visual_title}'. Use a clean, soothing light background. `;
                    if (visual.mechanism_steps) {
                        if (visual.mechanism_steps.stepwise_flow && visual.mechanism_steps.stepwise_flow.length > 0) {
                            promptDesc += `Visually map out the following explicit reaction steps chronologically: ${visual.mechanism_steps.stepwise_flow.join(' -> ')}. `;
                        }
                        if (visual.mechanism_steps.intermediates && visual.mechanism_steps.intermediates.length > 0) {
                            promptDesc += `Clearly highlight the intermediate: "${visual.mechanism_steps.intermediates.join(', ')}". `;
                        }
                    }
                } else {
                    promptDesc = `A clean, minimalist 2D educational schematic or structural diagram illustrating '${visual.visual_title}'. Set against a soothing light academic background. `;
                    if (visual.axes_or_components && visual.axes_or_components.important_labels && visual.axes_or_components.important_labels.length > 0) {
                        promptDesc += `Include precise textual labels for: ${visual.axes_or_components.important_labels.join(', ')}. `;
                    }
                }

                promptDesc += `Maintain a board-exam friendly, NCERT-oriented aesthetic using calm colors (like indigo, forest-green, slate-blue, soft coral) and high legibility sans-serif fonts. Absolutely no flashy 3D rendering or distracting sci-fi UI elements. Purely educational, flat 2D vector graphic.`;

                allPrompts += `### ${index + 1}. ${visual.visual_title} (Visual ID: ${visual.visual_id})\n`;
                allPrompts += `**Base Concept:** ${visual.what_the_visual_represents}\n`;
                allPrompts += `**Prompt to Copy:**\n\`\`\`text\n${promptDesc}\n\`\`\`\n\n`;
            });
        }
    } catch (e) {
        console.error('Error parsing', filePath, e.message);
    }
});

fs.writeFileSync('all_chemistry_diagram_prompts.md', allPrompts);
console.log('Successfully generated all_chemistry_diagram_prompts.md with ' + jsonFiles.length + ' files scanned.');
