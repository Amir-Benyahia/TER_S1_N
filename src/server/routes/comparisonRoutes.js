/**
 * Comparison Routes
 */

const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

/**
 * @route   POST /api/comparisons
 * @desc    Create a new comparison
 */
router.post('/', comparisonController.createComparison);

/**
 * @route   GET /api/comparisons
 * @desc    Get all comparisons
 */
router.get('/', comparisonController.getAllComparisons);

/**
 * @route   GET /api/comparisons/:id
 * @desc    Get comparison by ID
 */
router.get('/:id', comparisonController.getComparisonById);

/**
 * @route   DELETE /api/comparisons/:id
 * @desc    Delete comparison
 */
router.delete('/:id', comparisonController.deleteComparison);

module.exports = router;
