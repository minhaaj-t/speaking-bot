import { getEnvVar } from '../utils/env.js';

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { message } = request.body;
    
    if (!message) {
      response.status(400).json({ error: 'Message is required' });
      return;
    }
    
    // Get API key from environment variables
    const apiKey = getEnvVar('GROQ_API_KEY');
    
    if (!apiKey) {
      response.status(500).json({ error: 'Groq API key not configured. Please set the GROQ_API_KEY environment variable in your Vercel project settings.' });
      return;
    }
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
            "content": message
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false
      }),
    });
    
    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      throw new Error(`Groq error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await groqResponse.json();
    const reply = data.choices[0].message.content.trim();
    
    response.status(200).json({ reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    response.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}