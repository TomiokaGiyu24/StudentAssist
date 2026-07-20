const fs = require('fs');
const path = require('path');

const dir = 'd:\\Drive E\\StudentAssistProject\\src\\data\\Boards\\Physics\\Derivations';
const placeholder = '/images/placeholder.svg';

fs.readdir(dir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        // Only process specific files or all json files in that folder?
        // The user said "replace all the diagram image in dervations"
        // I will target all .json files in that folder.
        if (path.extname(file) === '.json') {
            const filePath = path.join(dir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', filePath, err);
                    return;
                }

                // Global replace for "image": "..."
                // Regex to capture the key and value
                const regex = /"image":\s*"[^"]*"/g;

                // We only want to replace if it matches the pattern of a derivation image broadly
                // But since these are derivation files, and "image" key is used for the diagram, it should be safe.
                // To be extra safe, I'll print what I'm replacing if I could, but for now just replace.

                const updatedData = data.replace(regex, `"image": "${placeholder}"`);

                if (data !== updatedData) {
                    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing file:', filePath, err);
                        } else {
                            console.log('Updated:', file);
                        }
                    });
                } else {
                    console.log('No changes needed for:', file);
                }
            });
        }
    });
});
