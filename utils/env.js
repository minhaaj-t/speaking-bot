/**
 * Utility function to get environment variables with fallback to api.json values
 */

export function getEnvVar(name, defaultValue = null) {
    // For browser environment, we'll need to pass environment variables through the server
    // For now, we'll just return the default value
    return defaultValue;
}

// In a Vercel environment, you would typically pass environment variables through
// serverless functions or use Vercel's built-in environment variable support
