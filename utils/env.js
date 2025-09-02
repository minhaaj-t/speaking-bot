/**
 * Utility function to get environment variables with fallback to api.json values
 */

export function getEnvVar(name, defaultValue = null) {
    // In Vercel/serverless environment, process.env is available
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
        return process.env[name];
    }
    
    // For browser environment or if env var not found, return default value
    return defaultValue;
}

// In a Vercel environment, you would typically pass environment variables through
// serverless functions or use Vercel's built-in environment variable support