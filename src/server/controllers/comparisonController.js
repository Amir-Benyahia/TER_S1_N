/**
 * Comparison Controller - Gère les graphiques de comparaison
 */

const Comparison = require('../models/Comparison');

/**
 * Create a new comparison
 * POST /api/comparisons
 */
exports.createComparison = async (req, res) => {
  try {
    const { name, type, batches, algorithms, image, created_at } = req.body;

    const comparison = new Comparison({
      name,
      type: type || 'batch_comparison',
      batches: batches || [],
      algorithms: algorithms || [],
      image,
      createdAt: created_at ? new Date(created_at) : new Date()
    });

    await comparison.save();

    res.status(201).json({
      message: 'Comparison created successfully',
      comparison
    });
  } catch (error) {
    console.error('Error creating comparison:', error);
    res.status(500).json({ error: 'Failed to create comparison' });
  }
};

/**
 * Get all comparisons
 * GET /api/comparisons
 */
exports.getAllComparisons = async (req, res) => {
  try {
    const comparisons = await Comparison.find()
      .select('-image')  // Ne pas inclure l'image dans la liste
      .sort({ createdAt: -1 });

    res.json({ comparisons });
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
};

/**
 * Get comparison by ID
 * GET /api/comparisons/:id
 */
exports.getComparisonById = async (req, res) => {
  try {
    const comparison = await Comparison.findById(req.params.id);

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
};

/**
 * Delete comparison
 * DELETE /api/comparisons/:id
 */
exports.deleteComparison = async (req, res) => {
  try {
    const comparison = await Comparison.findByIdAndDelete(req.params.id);

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({ error: 'Failed to delete comparison' });
  }
};
