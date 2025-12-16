/**
 * SimulationBatch Model - Groups simulations for analysis
 */

const mongoose = require('mongoose');

const simulationBatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    simulations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Simulation'
      }
    ],
    // Statistics (cached for performance)
    stats: {
      totalSimulations: {
        type: Number,
        default: 0
      },
      escapedCount: {
        type: Number,
        default: 0
      },
      caughtCount: {
        type: Number,
        default: 0
      },
      escapeRate: {
        type: Number,
        default: 0
      },
      // Statistiques de durée
      duration: {
        mean: { type: Number, default: 0 },
        median: { type: Number, default: 0 },
        stdDev: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
      },
      // Statistiques de score
      score: {
        mean: { type: Number, default: 0 },
        median: { type: Number, default: 0 },
        stdDev: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
      },
      // Statistiques de frames
      frames: {
        mean: { type: Number, default: 0 },
        median: { type: Number, default: 0 },
        stdDev: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
      },
      // Métriques de performance moyennes
      performance: {
        pacman: {
          avgMemoryUsage: { type: Number, default: 0 },
          avgDecisionTime: { type: Number, default: 0 }
        },
        ghosts: {
          avgMemoryUsage: { type: Number, default: 0 },
          avgDecisionTime: { type: Number, default: 0 },
          avgNodesExplored: { type: Number, default: 0 }
        }
      },
      // Distribution des algorithmes utilisés
      algorithmDistribution: [{
        algorithm: String,
        count: Number,
        avgPerformance: {
          memoryUsage: Number,
          decisionTime: Number,
          nodesExplored: Number
        }
      }],
      // Anciens champs (pour compatibilité)
      meanDuration: {
        type: Number,
        default: 0
      },
      minDuration: {
        type: Number,
        default: 0
      },
      maxDuration: {
        type: Number,
        default: 0
      },
      meanFrames: {
        type: Number,
        default: 0
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
simulationBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SimulationBatch', simulationBatchSchema);
