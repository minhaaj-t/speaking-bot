/**
 * Utility function to get environment variables with fallback to api.json values
 */

export function getEnvVar(name, defaultValue = null) {
    // First check if it's an environment variable
    if (process.env[name]) {
        return process.env[name];
    }
    
    // If not, try to read from api.json
    try {
        const fs = require('fs');
        const path = require('path');
        const apiConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'api.json'), 'utf8'));
        
        // Handle template variable syntax like "${GROQ_API_KEY}"
        const value = apiConfig[name.replace('GROQ_', '').toLowerCase()];
        if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
            const envVarName = value.slice(2, -1);
            return process.env[envVarName] || defaultValue;
        }
        
        return value || defaultValue;
    } catch (error) {
        return defaultValue;
    }
}