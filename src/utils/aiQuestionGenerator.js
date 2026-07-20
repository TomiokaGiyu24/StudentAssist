/**
 * AI Question Generator - Multi-Provider Support
 * 
 * Supports:
 * - Groq (Primary) - Llama 3.3 70B, very fast, generous free tier
 * - Gemini (Backup) - Gemini 2.0 Flash
 * 
 * KEY PRINCIPLE: AI generates ONE question at a time
 * Website controls structure, AI just fills the slots
 */

// Provider configuration
const PROVIDERS = {
    groq: {
        name: 'Groq (Llama 3.3 70B)',
        model: 'llama-3.3-70b-versatile',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        envKey: 'VITE_GROQ_API_KEY',
        rateLimit: 100 // ms between calls
    },
    gemini: {
        name: 'Gemini 2.0 Flash',
        model: 'gemini-2.0-flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        envKey: 'VITE_GEMINI_API_KEY',
        rateLimit: 1000 // ms between calls
    }
};

// Active provider - try Groq first, fallback to Gemini
let activeProvider = null;
let lastCallTime = 0;

// Detect available provider
function detectProvider() {
    if (import.meta.env.VITE_GROQ_API_KEY) {
        console.log('🚀 Using Groq AI (Llama 3.3 70B)');
        return 'groq';
    }
    if (import.meta.env.VITE_GEMINI_API_KEY) {
        console.log('🤖 Using Gemini AI');
        return 'gemini';
    }
    console.error('❌ No AI API key found! Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to .env');
    return null;
}

activeProvider = detectProvider();

/**
 * Get the AI model name
 */
export function getModelName() {
    if (!activeProvider) return 'No AI configured';
    return PROVIDERS[activeProvider].name;
}

/**
 * Generate a SINGLE question with strict schema
 */
export async function generateSingleQuestion(config) {
    const { chapter, concept, type, marks, difficulty } = config;

    if (!activeProvider) {
        console.error('❌ No AI provider available');
        return null;
    }

    const provider = PROVIDERS[activeProvider];
    const apiKey = import.meta.env[provider.envKey];

    console.log(`🎯 [${provider.name}] Generating: ${type} | ${marks}m | ${difficulty}`);

    // Rate limiting
    const now = Date.now();
    const elapsed = now - lastCallTime;
    if (elapsed < provider.rateLimit) {
        await sleep(provider.rateLimit - elapsed);
    }
    lastCallTime = Date.now();

    const prompt = buildPrompt(config);

    try {
        let response;

        if (activeProvider === 'groq') {
            response = await callGroq(apiKey, prompt);
        } else {
            response = await callGemini(apiKey, prompt);
        }

        if (!response) return null;

        const question = extractJSON(response);
        if (!question) {
            console.error('❌ Failed to parse JSON');
            console.log('Raw:', response.substring(0, 200));
            return null;
        }

        // Add metadata
        question.concept_tags = [config.conceptId];
        question.ai_generated = true;

        console.log('✅ Generated successfully');
        return question;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Call Groq API (OpenAI-compatible)
 */
async function callGroq(apiKey, prompt) {
    const response = await fetch(PROVIDERS.groq.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: PROVIDERS.groq.model,
            messages: [
                { role: 'system', content: 'You are a CBSE Class 12 Physics exam question generator. Return ONLY valid JSON, no markdown.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    console.log('📡 Groq status:', response.status);

    if (!response.ok) {
        const err = await response.text();
        console.error('❌ Groq error:', err.substring(0, 200));
        return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content;
}

/**
 * Call Gemini API
 */
async function callGemini(apiKey, prompt) {
    const response = await fetch(`${PROVIDERS.gemini.endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        })
    });

    console.log('📡 Gemini status:', response.status);

    if (!response.ok) {
        const err = await response.text();
        console.error('❌ Gemini error:', err.substring(0, 200));

        if (response.status === 429) {
            console.log('⏳ Rate limited, waiting...');
            await sleep(3000);
        }
        return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * Build prompt for question generation
 */
function buildPrompt(config) {
    const { chapter, concept, type, marks, difficulty } = config;

    const prompts = {
        mcq: `Generate 1 MCQ for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}
Difficulty: ${difficulty}

Return ONLY this JSON:
{"type":"mcq","marks":1,"difficulty":"${difficulty}","question":"Question with $LaTeX$ formulas","options":{"A":"opt1","B":"opt2","C":"opt3","D":"opt4"},"correct_option":"A","explanation":"Why A is correct"}`,

        assertion_reason: `Generate 1 Assertion-Reason for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}

Return ONLY this JSON:
{"type":"assertion_reason","marks":1,"difficulty":"${difficulty}","assertion":"Statement A","reason":"Statement R","question":"Assertion (A): ...\\nReason (R): ...","options":{"A":"Both true, R explains A","B":"Both true, R doesn't explain A","C":"A true, R false","D":"A false, R true"},"correct_option":"A","explanation":"Brief reason"}`,

        numerical: `Generate 1 numerical problem for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}
Marks: ${marks}

Return ONLY this JSON:
{"type":"numerical","marks":${marks},"difficulty":"${difficulty}","question":"Problem with values and $LaTeX$","answer":{"explanation":"GIVEN:\\n...\\nFIND:\\n...\\nSOLUTION:\\n...\\nANSWER: [with units]","key_formulae":["$formula$"]}}`,

        theory: `Generate 1 theory question for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}
Marks: ${marks}

Return ONLY this JSON:
{"type":"theory","marks":${marks},"difficulty":"${difficulty}","question":"Theory question about ${concept}","answer":{"explanation":"NCERT-style explanation"}}`,

        derivation: `Generate 1 derivation for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}
Marks: ${marks}

Return ONLY this JSON:
{"type":"derivation","marks":${marks},"difficulty":"${difficulty}","question":"Derive expression for...","answer":{"explanation":"Step 1:...\\nStep 2:...\\nResult: $formula$","key_formulae":["$formula$"]}}`,

        case_study: `Generate 1 case study for CBSE Class 12 Physics.
Topic: ${chapter} - ${concept}

Return ONLY this JSON:
{"type":"case_study","marks":4,"difficulty":"${difficulty}","passage":"100-word real-world scenario about ${concept}","questions":[{"id":"a","question":"Q1","type":"mcq","options":{"A":"","B":"","C":"","D":""},"correct_option":"A","marks":1},{"id":"b","question":"Q2","type":"mcq","options":{"A":"","B":"","C":"","D":""},"correct_option":"B","marks":1},{"id":"c","question":"Q3","type":"mcq","options":{"A":"","B":"","C":"","D":""},"correct_option":"C","marks":1},{"id":"d","question":"Q4","type":"mcq","options":{"A":"","B":"","C":"","D":""},"correct_option":"D","marks":1}],"answer":{"explanation":"Brief explanations"}}`
    };

    return prompts[type] || prompts.mcq;
}

/**
 * Extract JSON from response
 */
function extractJSON(text) {
    if (!text) return null;

    let cleaned = text.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
            try { return JSON.parse(match[0]); } catch (e2) { }
        }
    }
    return null;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

export default { generateSingleQuestion, getModelName };
