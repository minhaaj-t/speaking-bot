const fetch = require('node-fetch');
const fs = require('fs');

// Helper function to properly encode Unicode strings to base64
function base64Encode(str) {
  // First, we convert the string to a UTF-8 encoded string
  const utf8Bytes = new TextEncoder().encode(str);
  // Then we convert the bytes to a binary string
  let binary = '';
  utf8Bytes.forEach(byte => binary += String.fromCharCode(byte));
  // Finally, we encode the binary string to base64
  return Buffer.from(binary).toString('base64');
}

async function getDidCredits(apiKey) {
  const url = "https://api.d-id.com/credits";
  const base64AuthString = base64Encode(apiKey);

  const headers = {
    "accept": "application/json",
    "Authorization": `Basic ${base64AuthString}`
  };

  const response = await fetch(url, { headers });
  const data = await response.json();
  return data;
}

async function main() {
  try {
    // Read the API key from api.json file
    const apiKeyJson = JSON.parse(fs.readFileSync('api.json', 'utf8'));
    const apiKey = apiKeyJson.key;

    const didCredits = await getDidCredits(apiKey);
    console.log("Full response:", didCredits);
    
    // Check if we have a successful response
    if (didCredits && didCredits.remaining !== undefined) {
      // Extracting just the 'remaining' and 'total' values
      const creditsSummary = {
        remaining: didCredits.remaining,
        total: didCredits.total
      };
      console.log("Credits Summary:", creditsSummary);
    } else {
      console.log("Unable to retrieve credit information");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();