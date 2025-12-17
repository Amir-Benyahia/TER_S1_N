/**
 * Pacman Lab - Main Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const connectDatabase = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const mazeRoutes = require('./routes/mazeRoutes');
const trajectoryRoutes = require('./routes/trajectoryRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const batchRoutes = require('./routes/batchRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for grids
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// API Routes
app.use('/api/mazes', mazeRoutes);
app.use('/api/trajectories', trajectoryRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/batches', batchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ROOT - Welcome page (landing page)
app.get('/', (req, res) => {
  console.log('✓ Serving welcome page at /');
  res.sendFile(path.join(__dirname, '..', 'client', 'welcome.html'));
});

// APP - Main application dashboard
app.get('/app', (req, res) => {
  console.log('✓ Serving main app at /app');
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// No wildcard redirect - let 404s happen naturally for missing files

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Pacman Lab server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

