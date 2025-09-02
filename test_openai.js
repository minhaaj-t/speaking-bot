const config = require('./api.json');

const openai_key = config.openai_key;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function main() {
    const fetch = await import('node-fetch').then(module => module.default);

    async function fetchGroqResponse(prompt) {
        const response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openai_key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [{"role": "user", "content": prompt}],
                temperature: 0.7
            }),
        });

        const data = await response.json();
        if (!response.ok || !data.choices || data.choices.length === 0) {
            throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`);
        }
        return data.choices[0].message.content.trim();  
    }

    const userInput = "Who is the CEO of Tesla?";
    const groqResponse = await fetchGroqResponse(userInput);

    console.log("User Input:", userInput);
    console.log("Groq Response:", groqResponse);
}

main().catch(error => console.error(error));