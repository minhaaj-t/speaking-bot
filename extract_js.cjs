const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Extract the script content
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/i);
if (scriptMatch && scriptMatch[1]) {
  const scriptContent = scriptMatch[1];
  
  // Write to a JS file for validation
  fs.writeFileSync('extracted_script.js', scriptContent);
  console.log('Script extracted successfully');
} else {
  console.log('No script tag found');
}