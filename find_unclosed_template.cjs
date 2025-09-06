const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Find all template literals (backticks)
const backticks = [];
for (let i = 0; i < html.length; i++) {
  if (html[i] === '`') {
    backticks.push(i);
  }
}

console.log(`Found ${backticks.length} backticks`);

// Check if even number
if (backticks.length % 2 !== 0) {
  console.log('ERROR: Odd number of backticks');
  
  // Show positions of all backticks
  backticks.forEach((pos, index) => {
    const line = html.substring(0, pos).split('\n').length;
    const context = html.substring(Math.max(0, pos - 20), Math.min(html.length, pos + 20));
    console.log(`  ${index + 1}. Position ${pos}, Line ${line}: ...${context}...`);
  });
} else {
  console.log('Backtick count is even');
}