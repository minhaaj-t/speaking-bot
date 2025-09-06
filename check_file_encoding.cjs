const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Check for any unusual characters around line 1571
const lines = html.split('\n');
console.log('Total lines:', lines.length);

// Check the last few lines
console.log('Last 5 lines:');
for (let i = Math.max(0, lines.length - 5); i < lines.length; i++) {
  console.log(`${i + 1}: ${JSON.stringify(lines[i])}`);
}

// Check for any unusual characters in the file
for (let i = 0; i < html.length; i++) {
  const char = html[i];
  if (char.charCodeAt(0) > 127) {
    console.log(`Non-ASCII character at position ${i}, line ${html.substring(0, i).split('\n').length}: ${char} (${char.charCodeAt(0)})`);
  }
}

// Check for any unclosed strings or comments
let inSingleQuoteString = false;
let inDoubleQuoteString = false;
let inTemplateLiteral = false;
let inLineComment = false;
let inBlockComment = false;

for (let i = 0; i < html.length; i++) {
  const char = html[i];
  const nextChar = html[i + 1];
  
  // Skip escaped characters
  if (html[i - 1] === '\\') continue;
  
  if (!inSingleQuoteString && !inDoubleQuoteString && !inTemplateLiteral && !inLineComment && !inBlockComment) {
    if (char === '/' && nextChar === '/') {
      inLineComment = true;
    } else if (char === '/' && nextChar === '*') {
      inBlockComment = true;
    } else if (char === '"') {
      inDoubleQuoteString = true;
    } else if (char === "'") {
      inSingleQuoteString = true;
    } else if (char === '`') {
      inTemplateLiteral = true;
    }
  } else if (inSingleQuoteString) {
    if (char === "'") {
      inSingleQuoteString = false;
    }
  } else if (inDoubleQuoteString) {
    if (char === '"') {
      inDoubleQuoteString = false;
    }
  } else if (inTemplateLiteral) {
    if (char === '`') {
      inTemplateLiteral = false;
    }
  } else if (inLineComment) {
    if (char === '\n') {
      inLineComment = false;
    }
  } else if (inBlockComment) {
    if (char === '*' && nextChar === '/') {
      inBlockComment = false;
      i++; // Skip the next character
    }
  }
}

if (inSingleQuoteString) console.log('Unclosed single quote string');
if (inDoubleQuoteString) console.log('Unclosed double quote string');
if (inTemplateLiteral) console.log('Unclosed template literal');
if (inLineComment) console.log('Unclosed line comment');
if (inBlockComment) console.log('Unclosed block comment');