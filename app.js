import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import groqHandler from './api/groq.js';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use PORT environment variable if available, otherwise default to 3002
const port = process.env.PORT || 3002;

const app = express();
app.use(express.json()); // Parse JSON bodies
app.use('/', express.static('.')); // Serve files from current directory

// API route for Groq/Gemini
app.post('/api/groq', groqHandler);

const server = http.createServer(app);

server.listen(port, () => console.log(`Server started on port localhost:${port}`));