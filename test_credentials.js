const fetch = require('node-fetch');

async function testCredentials() {
  try {
    // Your D-ID credentials
    const username = 'minhajreactnative@gmail.com';
    const password = 'hp33lEF_-_z69vA6t6Ait';
    
    // Create the authorization string
    const authString = `${username}:${password}`;
    
    // Try different encoding methods
    const base64Auth1 = Buffer.from(authString).toString('base64');
    const base64Auth2 = Buffer.from(authString, 'utf8').toString('base64');
    
    console.log('Auth string:', authString);
    console.log('Base64 encoded (method 1):', base64Auth1);
    console.log('Base64 encoded (method 2):', base64Auth2);
    
    // Test both encoding methods
    for (let i = 1; i <= 2; i++) {
      const base64Auth = i === 1 ? base64Auth1 : base64Auth2;
      console.log(`\n--- Testing method ${i} ---`);
      
      // Test the credentials
      const response = await fetch('https://api.d-id.com/credits', {
        headers: {
          'Authorization': `Basic ${base64Auth}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('Credentials are valid with method', i);
        return;
      }
    }
    
    console.log('Credentials are invalid or there was an error with both methods.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testCredentials();