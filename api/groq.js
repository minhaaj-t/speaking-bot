import { getEnvVar } from '../utils/env.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    
    // Get API key from environment variables or use the one from api.json
    let apiKey = getEnvVar('GEMINI_API_KEY');
    
    // If no environment variable, try to read from api.json
    if (!apiKey) {
      try {
        const configPath = join(__dirname, '../api.json');
        const configFile = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configFile);
        apiKey = config.openai_key;
      } catch (configError) {
        console.error('Error reading api.json:', configError);
        // Fall back to environment variable error message
      }
    }
    
    if (!apiKey) {
      response.status(500).json({ error: 'Google Gemini API key not configured. Please set the GEMINI_API_KEY environment variable or add it to api.json.' });
      return;
    }
    
    // Using Google Gemini Flash 1.5 model
    let geminiResponse;
    try {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional receptionist for AL RAWABI GROUP OF COMPANIES. Provide helpful, courteous, and accurate information about appointments, office locations, room numbers, company services, building directions, and contact information. Always be polite and professional.\n\nUser: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        }),
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Failed to connect to Gemini API. Please check your internet connection. Error: ${fetchError.message}`);
    }
    
    if (!geminiResponse.ok) {
      let errorMessage = `Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`;
      try {
        const errorData = await geminiResponse.json();
        errorMessage += ` - ${errorData.error?.message || 'Unknown error'}`;
      } catch (parseError) {
        // If we can't parse the error response, just use the status
        errorMessage += ` - Unable to parse error details`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await geminiResponse.json();
    const reply = data.candidates[0].content.parts[0].text.trim();
    
    response.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API Error:', error);
    response.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}