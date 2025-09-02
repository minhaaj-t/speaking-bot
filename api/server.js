import express from 'express';

const app = express();
app.use('/', express.static('.')); // Serve files from current directory

export default app;