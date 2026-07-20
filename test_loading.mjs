import { loadDerivationsContent } from './src/utils/contentLoader.js';

async function test() {
    console.log("Testing derivation loading...");
    try {
        const data = await loadDerivationsContent('physics', 'electric-charges');
        if (data) {
            console.log("Success! Data found:");
            console.log("Derivations count:", data.derivations ? data.derivations.length : 0);
            if (data.derivations && data.derivations.length > 0) {
                console.log("First derivation:", data.derivations[0].title);
            }
        } else {
            console.log("Failed: Data is null");
        }
    } catch (e) {
        console.error("Error during test:", e);
    }
}

test();
