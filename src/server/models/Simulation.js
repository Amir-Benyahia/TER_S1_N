/**
 * Simulation model for ghost AI replays
 */

const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  trajectoryId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for demo mode
    required: true
  },
  mazeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maze',
    required: true
  },
  ghostConfigs: [{
    ghostType: {
      type: String,
      enum: ['blinky', 'pinky', 'inky', 'clyde'],
      required: true
    },
    algorithm: {
      type: String,
      enum: ['astar', 'bfs'],
      default: 'astar'
    },
    startPosition: {
      x: Number,
      y: Number
    }
  }],
  results: {
    caught: {
      type: Boolean,
      default: false
    },
    catchPosition: {
      x: Number,
      y: Number
    },
    catchTime: Number,
    totalFrames: Number,
    // Métriques principales
    duration: {
      type: Number, // Durée totale en millisecondes
      default: 0
    },
    score: {
      type: Number, // Score final (basé sur pellets, temps, évitement)
      default: 0
    },
    // Métriques de performance par entité
    performanceMetrics: {
      pacman: {
        memoryUsage: {
          type: Number, // En bytes (estimation)
          default: 0
        },
        memoryPerSecond: {
          type: Number, // Memory usage normalized by time (bytes/second) - fair comparison metric
          default: 0
        },
        timeComplexity: {
          type: String, // Ex: O(n), O(n²), O(log n)
          default: 'O(1)'
        },
        avgDecisionTime: {
          type: Number, // Temps moyen de décision en ms
          default: 0
        }
      },
      ghosts: [{
        type: {
          type: String,
          enum: ['blinky', 'pinky', 'inky', 'clyde']
        },
        algorithm: {
          type: String,
          enum: ['astar', 'bfs']
        },
        memoryUsage: {
          type: Number, // En bytes
          default: 0
        },
        timeComplexity: {
          type: String,
          default: 'O(1)'
        },
        avgDecisionTime: {
          type: Number, // ms
          default: 0
        },
        pathNodesExplored: {
          type: Number, // Nœuds explorés durant la simulation
          default: 0
        }
      }],
      // Aggregate metrics for ghosts
      ghostsAverage: {
        memoryUsage: {
          type: Number,
          default: 0
        },
        memoryPerSecond: {
          type: Number, // Normalized metric for fair comparison
          default: 0
        }
      }
    },
    frames: [{
      timestamp: Number,
      pacman: {
        x: Number,
        y: Number
      },
      ghosts: [{
        type: String,
        position: {
          x: Number,
          y: Number
        }
      }],
      caught: Boolean
    }]
  }
}, {
  timestamps: true
});

// Indexes
simulationSchema.index({ trajectoryId: 1, createdAt: -1 });
simulationSchema.index({ mazeId: 1 });

module.exports = mongoose.model('Simulation', simulationSchema);

