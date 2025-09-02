import express from 'express';
import http from 'http';

const port = 3002; // Changed from 3001 to avoid conflict

const app = express();
app.use('/', express.static('.')); // Serve files from current directory
const server = http.createServer(app);

server.listen(port, () => console.log(`Server started on port localhost:${port}`));