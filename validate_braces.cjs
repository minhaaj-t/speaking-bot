const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Extract the script content
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/i);
if (scriptMatch && scriptMatch[1]) {
  const scriptContent = scriptMatch[1];
  
  // Check for balanced braces and parentheses
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  
  for (let i = 0; i < scriptContent.length; i++) {
    const char = scriptContent[i];
    
    // Skip characters inside strings
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      i++;
      while (i < scriptContent.length && scriptContent[i] !== quote) {
        if (scriptContent[i] === '\\' && i + 1 < scriptContent.length) {
          i += 2;
        } else {
          i++;
        }
      }
      continue;
    }
    
    // Skip characters inside comments
    if (char === '/' && i + 1 < scriptContent.length && scriptContent[i + 1] === '/') {
      // Single line comment
      while (i < scriptContent.length && scriptContent[i] !== '\n') {
        i++;
      }
      continue;
    }
    
    if (char === '/' && i + 1 < scriptContent.length && scriptContent[i + 1] === '*') {
      // Multi line comment
      i += 2;
      while (i < scriptContent.length - 1 && !(scriptContent[i] === '*' && scriptContent[i + 1] === '/')) {
        i++;
      }
      i += 1;
      continue;
    }
    
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    
    // Check for negative counts which indicate unbalanced brackets
    if (braceCount < 0) {
      const line = scriptContent.substring(0, i).split('\n').length;
      console.log(`Unbalanced braces: Extra closing brace at position ${i}, line ${line}`);
      break;
    }
    
    if (parenCount < 0) {
      const line = scriptContent.substring(0, i).split('\n').length;
      console.log(`Unbalanced parentheses: Extra closing parenthesis at position ${i}, line ${line}`);
      break;
    }
    
    if (bracketCount < 0) {
      const line = scriptContent.substring(0, i).split('\n').length;
      console.log(`Unbalanced brackets: Extra closing bracket at position ${i}, line ${line}`);
      break;
    }
  }
  
  console.log(`Brace count: ${braceCount}`);
  console.log(`Parenthesis count: ${parenCount}`);
  console.log(`Bracket count: ${bracketCount}`);
  
  if (braceCount !== 0) {
    console.log(`Unbalanced braces: ${braceCount > 0 ? 'Missing ' + braceCount + ' closing braces' : 'Extra ' + Math.abs(braceCount) + ' closing braces'}`);
  }
  
  if (parenCount !== 0) {
    console.log(`Unbalanced parentheses: ${parenCount > 0 ? 'Missing ' + parenCount + ' closing parentheses' : 'Extra ' + Math.abs(parenCount) + ' closing parentheses'}`);
  }
  
  if (bracketCount !== 0) {
    console.log(`Unbalanced brackets: ${bracketCount > 0 ? 'Missing ' + bracketCount + ' closing brackets' : 'Extra ' + Math.abs(bracketCount) + ' closing brackets'}`);
  }
  
  if (braceCount === 0 && parenCount === 0 && bracketCount === 0) {
    console.log('All braces, parentheses, and brackets are balanced');
  }
} else {
  console.log('No script tag found');
}