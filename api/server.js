import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname + '/../'));

// API routes can be added here if needed
// For now, we're just serving static files

export default app;