import { getEnvVar } from './utils/env.js';

export async function fetchGroqResponse(apiKey, userMessage) {
  // Use environment variable if available, otherwise use provided apiKey
  const groqApiKey = getEnvVar('GROQ_API_KEY', apiKey);
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            "role": "system",
            "content": "You are a professional receptionist for AL RAWABI GROUP OF COMPANIES. Provide helpful, courteous, and accurate information about appointments, office locations, room numbers, company services, building directions, and contact information. Always be polite and professional."
          },
          {
            "role": "user",
            "content": userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq error: ${errorData.error?.message || 'Unknown error'}`);
    }
    return (await response.json()).choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq Error:', error);
    return "I'm sorry, I'm having trouble processing your request. Could you please try again?";
  }
}