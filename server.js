import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Serve Vite build output as static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — return index.html for all client-side routes
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BallotBuddy server running on port ${PORT}`);
});
