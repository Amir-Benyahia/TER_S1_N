const express = require('express');
const path = require('path');
const { generateMaze } = require('./controllers/generationController');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from src directory
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to trigger maze generation
app.post('/generate-maze', (req, res) => {
  generateMaze();
  res.status(200).send('Maze generation triggered. Check server console for output.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
