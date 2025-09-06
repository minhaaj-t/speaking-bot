const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Find all unescaped backticks
const backticks = [];
for (let i = 0; i < html.length; i++) {
  if (html[i] === '`' && (i === 0 || html[i-1] !== '\\')) {
    backticks.push(i);
  }
}

console.log(`Found ${backticks.length} unescaped backticks`);

// Check if even number
if (backticks.length % 2 !== 0) {
  console.log('ERROR: Odd number of unescaped backticks - there is an unterminated template literal');
  
  // Show positions of all unescaped backticks
  backticks.forEach((pos, index) => {
    const line = html.substring(0, pos).split('\n').length;
    const context = html.substring(Math.max(0, pos - 30), Math.min(html.length, pos + 30));
    console.log(`  ${index + 1}. Position ${pos}, Line ${line}: ...${context.replace(/\n/g, '\\n')}...`);
  });
  
  // Try to identify which template literal is unterminated
  console.log('\nAnalyzing template literal pairs:');
  for (let i = 0; i < backticks.length - 1; i += 2) {
    const openPos = backticks[i];
    const closePos = backticks[i + 1];
    
    const openLine = html.substring(0, openPos).split('\n').length;
    const closeLine = html.substring(0, closePos).split('\n').length;
    
    console.log(`Template literal ${Math.floor(i/2) + 1}: Lines ${openLine}-${closeLine}`);
  }
  
  // The last backtick is unmatched
  const lastPos = backticks[backticks.length - 1];
  const lastLine = html.substring(0, lastPos).split('\n').length;
  console.log(`\nUNMATCHED backtick at position ${lastPos}, line ${lastLine}`);
} else {
  console.log('All unescaped backticks are properly paired');
  
  // Check each pair
  for (let i = 0; i < backticks.length; i += 2) {
    const openPos = backticks[i];
    const closePos = backticks[i + 1];
    
    const openLine = html.substring(0, openPos).split('\n').length;
    const closeLine = html.substring(0, closePos).split('\n').length;
    
    console.log(`Template literal ${i/2 + 1}: Lines ${openLine}-${closeLine}`);
  }
}