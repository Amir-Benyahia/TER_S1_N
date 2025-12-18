/**
 * Simulation Routes
 * 
 * @module routes/simulations
 * @description Handles AI simulation operations with Pacman and Ghost configurations
 * 
 * Base URL: /api/simulations
 * 
 * Supported Pacman Algorithms:
 * - greedy, defensive, aggressive, random (Basic)
 * - minimax, expectimax, influence_map, mcts (Advanced)
 * 
 * Supported Ghost Algorithms:
 * - astar (A* pathfinding)
 * - bfs (Breadth-first search)
 */

const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

/**
 * @route   POST /api/simulations
 * @desc    Run a new simulation with specified Pacman AI and Ghost configurations
 * @access  Public
 * @body    {name, mazeId, pacmanAlgorithm, pacmanConfig, ghostConfigs, results}
 * @returns {Object} Simulation object with results and performance metrics
 */
router.post('/', simulationController.runSimulation);

/**
 * @route   GET /api/simulations
 * @desc    Get all simulations (paginated, excludes frame data)
 * @access  Public
 * @query   {page, limit, mazeId, trajectoryId}
 * @returns {Array} List of simulations with pagination info
 */
router.get('/', simulationController.getAllSimulations);

/**
 * @route   GET /api/simulations/:id
 * @desc    Get single simulation by ID
 * @access  Public
 * @query   {includeFrames} - Set to 'true' to include frame-by-frame data
 * @returns {Object} Complete simulation object
 */
router.get('/:id', simulationController.getSimulationById);

/**
 * @route   GET /api/simulations/:id/replay
 * @desc    Get only replay frames for a simulation (optimized for replay)
 * @access  Public
 * @returns {Array} Frame-by-frame replay data
 */
router.get('/:id/replay', simulationController.getReplayFrames);

/**
 * @route   DELETE /api/simulations/:id
 * @desc    Delete a simulation
 * @access  Public
 * @returns {Object} Success message
 */
router.delete('/:id', simulationController.deleteSimulation);

module.exports = router;

