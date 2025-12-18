/**
 * Simulation Batch Routes
 * 
 * @module routes/batches
 * @description Batch operations for grouping simulations and automated testing
 * 
 * Base URL: /api/batches
 * 
 * Use Cases:
 * - Group related simulations together
 * - Run automated test suites
 * - Compare algorithm performance
 * - Generate aggregate statistics
 */

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

/**
 * @route   POST /api/batches
 * @desc    Create a new simulation batch container
 * @access  Public
 * @body    {name, description}
 * @returns {Object} Created batch object
 */
router.post('/', batchController.createBatch);

/**
 * @route   GET /api/batches
 * @desc    Get all batches (paginated)
 * @access  Public
 * @query   {page, limit}
 * @returns {Array} List of batches with pagination info
 */
router.get('/', batchController.getAllBatches);

/**
 * @route   POST /api/batches/run-batch
 * @desc    🔥 PRIMARY AUTOMATION ENDPOINT - Configure and run batch simulations
 * @access  Public
 * @body    {batchName, mazeId, pacmanAlgorithm, pacmanConfig, ghostConfigs, iterations, maxDuration}
 * @returns {Object} Batch ID and configuration for client-side execution
 * 
 * @example
 * POST /api/batches/run-batch
 * {
 *   "batchName": "MCTS Performance Test",
 *   "mazeId": "674b9a1f8a3d1f001e5c4a1a",
 *   "pacmanAlgorithm": "mcts",
 *   "pacmanConfig": { "iterations": 2000 },
 *   "ghostConfigs": [
 *     { "type": "blinky", "algorithm": "astar", "startPosition": { "x": 10, "y": 10 } }
 *   ],
 *   "iterations": 100,
 *   "maxDuration": 60
 * }
 */
router.post('/run-batch', batchController.runBatchSimulations);

/**
 * @route   GET /api/batches/:id
 * @desc    Get batch by ID with all simulations and aggregate statistics
 * @access  Public
 * @returns {Object} Batch with simulations array and stats (catch rate, duration, score, performance)
 */
router.get('/:id', batchController.getBatchById);

/**
 * @route   PUT /api/batches/:id
 * @desc    Update batch metadata (name, description)
 * @access  Public
 * @body    {name, description}
 * @returns {Object} Updated batch object
 */
router.put('/:id', batchController.updateBatch);

/**
 * @route   DELETE /api/batches/:id
 * @desc    Delete a batch
 * @access  Public
 * @returns {Object} Success message
 */
router.delete('/:id', batchController.deleteBatch);

/**
 * @route   POST /api/batches/:id/add-simulations
 * @desc    Add existing simulations to a batch
 * @access  Public
 * @body    {simulationIds: Array}
 * @returns {Object} Updated batch with new simulations
 */
router.post('/:id/add-simulations', batchController.addSimulationsToBatch);

/**
 * @route   DELETE /api/batches/:id/simulations/:simulationId
 * @desc    Remove a simulation from a batch
 * @access  Public
 * @returns {Object} Updated batch
 */
router.delete('/:id/simulations/:simulationId', batchController.removeSimulationFromBatch);

/**
 * @route   POST /api/batches/:id/clear
 * @desc    Clear all simulations from a batch
 * @access  Public
 * @returns {Object} Cleared batch object
 */
router.post('/:id/clear', batchController.clearBatch);

module.exports = router;
