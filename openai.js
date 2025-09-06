export async function fetchGroqResponse(apiKey, userMessage) {
  try {
    // Using Google Gemini Flash 1.5 model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional receptionist for AL RAWABI GROUP OF COMPANIES. Provide helpful, courteous, and accurate information about appointments, office locations, room numbers, company services, building directions, and contact information. Always be polite and professional.\n\nUser: ${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini Error:', error);
    return "I am sorry, I am having trouble processing your request. Could you please try again?";
  }
}