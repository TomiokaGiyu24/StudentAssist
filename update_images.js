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
        if (path.extname(file) === '.json') {
            const filePath = path.join(dir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', filePath, err);
                    return;
                }

                // specific regex to target the derivation image field
                // It looks for "image": "..."
                // We want to be careful not to replace other things, but here "image" key is unique enough usually
                // The pattern observed is: "image": "/images/Physics/Derivations/..."

                const regex = /"image":\s*"\/images\/Physics\/Derivations\/[^"]*"/g;
                // Double check if there are other image paths like .jpg
                // The updated value:
                const updatedData = data.replace(/"image":\s*"[^"]*"/g, `"image": "${placeholder}"`);

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
