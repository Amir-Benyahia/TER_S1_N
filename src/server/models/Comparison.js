/**
 * Comparison Model - Stocke les graphiques de comparaison
 */

const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'batch_comparison'
    },
    batches: [{
      type: String
    }],
    algorithms: [{
      type: String
    }],
    image: {
      type: String  // Base64 encoded image
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comparison', comparisonSchema);
