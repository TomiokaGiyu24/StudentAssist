const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/electricfieldandcharges.json', 'utf8'));

// The parent JSON has a different structure. Let's recursively search for epsilon.
function search(obj, path = '') {
    if (typeof obj === 'string') {
        if (obj.includes('epsilon')) {
            console.log(`${path}:`, obj);
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => search(item, `${path}[${idx}]`));
    } else if (obj !== null && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, val]) => search(val, `${path}.${key}`));
    }
}

search(data);
