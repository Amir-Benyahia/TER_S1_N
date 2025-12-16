/**
 * Statistical Analysis Utilities
 * Fonctions pour calculer des statistiques scientifiques rigoureuses
 */

/**
 * Calcule la moyenne (mean) d'un tableau de valeurs
 */
function mean(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calcule la médiane d'un tableau de valeurs
 */
function median(values) {
  if (!values || values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calcule l'écart-type (standard deviation) d'un tableau de valeurs
 */
function standardDeviation(values) {
  if (!values || values.length === 0) return 0;
  
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calcule les valeurs min et max d'un tableau
 */
function minMax(values) {
  if (!values || values.length === 0) return { min: 0, max: 0 };
  
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

/**
 * Calcule un ensemble complet de statistiques descriptives
 */
function descriptiveStats(values) {
  if (!values || values.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }
  
  const { min, max } = minMax(values);
  
  return {
    mean: mean(values),
    median: median(values),
    stdDev: standardDeviation(values),
    min,
    max,
    count: values.length
  };
}

/**
 * Calcule le percentile d'un tableau de valeurs
 * @param {number[]} values - Tableau de valeurs
 * @param {number} percentile - Percentile à calculer (0-100)
 */
function percentile(values, percentile) {
  if (!values || values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calcule le coefficient de variation (CV)
 * Mesure la dispersion relative des données
 */
function coefficientOfVariation(values) {
  if (!values || values.length === 0) return 0;
  
  const avg = mean(values);
  if (avg === 0) return 0;
  
  const stdDev = standardDeviation(values);
  return (stdDev / avg) * 100; // En pourcentage
}

/**
 * Calcule des statistiques complètes pour les métriques de simulation
 */
function calculateSimulationStats(simulations) {
  if (!simulations || simulations.length === 0) {
    return getEmptyStats();
  }
  
  // Extraire les valeurs
  const durations = [];
  const scores = [];
  const frames = [];
  const pacmanMemory = [];
  const pacmanTime = [];
  const ghostMemory = [];
  const ghostTime = [];
  const ghostNodes = [];
  
  // Compter les résultats
  let caughtCount = 0;
  let escapedCount = 0;
  
  // Tracking des algorithmes
  const algorithmStats = new Map();
  
  simulations.forEach(sim => {
    if (!sim.results) return;
    
    // Compter captures vs échappées
    if (sim.results.caught) {
      caughtCount++;
    } else {
      escapedCount++;
    }
    
    // Métriques de base
    if (sim.results.duration !== undefined) durations.push(sim.results.duration);
    if (sim.results.score !== undefined) scores.push(sim.results.score);
    if (sim.results.totalFrames !== undefined) frames.push(sim.results.totalFrames);
    
    // Métriques de performance
    if (sim.results.performanceMetrics) {
      const pm = sim.results.performanceMetrics;
      
      // Pacman
      if (pm.pacman) {
        if (pm.pacman.memoryUsage !== undefined) pacmanMemory.push(pm.pacman.memoryUsage);
        if (pm.pacman.avgDecisionTime !== undefined) pacmanTime.push(pm.pacman.avgDecisionTime);
      }
      
      // Ghosts
      if (pm.ghosts && Array.isArray(pm.ghosts)) {
        pm.ghosts.forEach(ghost => {
          if (ghost.memoryUsage !== undefined) ghostMemory.push(ghost.memoryUsage);
          if (ghost.avgDecisionTime !== undefined) ghostTime.push(ghost.avgDecisionTime);
          if (ghost.pathNodesExplored !== undefined) ghostNodes.push(ghost.pathNodesExplored);
          
          // Statistiques par algorithme
          const algo = ghost.algorithm || 'unknown';
          if (!algorithmStats.has(algo)) {
            algorithmStats.set(algo, {
              count: 0,
              memory: [],
              time: [],
              nodes: []
            });
          }
          
          const algoData = algorithmStats.get(algo);
          algoData.count++;
          if (ghost.memoryUsage !== undefined) algoData.memory.push(ghost.memoryUsage);
          if (ghost.avgDecisionTime !== undefined) algoData.time.push(ghost.avgDecisionTime);
          if (ghost.pathNodesExplored !== undefined) algoData.nodes.push(ghost.pathNodesExplored);
        });
      }
    }
  });
  
  // Calculer les statistiques par algorithme
  const algorithmDistribution = [];
  algorithmStats.forEach((data, algo) => {
    algorithmDistribution.push({
      algorithm: algo,
      count: data.count,
      avgPerformance: {
        memoryUsage: mean(data.memory),
        decisionTime: mean(data.time),
        nodesExplored: mean(data.nodes)
      }
    });
  });
  
  return {
    totalSimulations: simulations.length,
    caughtCount,
    escapedCount,
    escapeRate: simulations.length > 0 ? (escapedCount / simulations.length) * 100 : 0,
    
    duration: descriptiveStats(durations),
    score: descriptiveStats(scores),
    frames: descriptiveStats(frames),
    
    performance: {
      pacman: {
        avgMemoryUsage: mean(pacmanMemory),
        avgDecisionTime: mean(pacmanTime)
      },
      ghosts: {
        avgMemoryUsage: mean(ghostMemory),
        avgDecisionTime: mean(ghostTime),
        avgNodesExplored: mean(ghostNodes)
      }
    },
    
    algorithmDistribution,
    
    // Anciens champs pour compatibilité
    meanDuration: mean(durations),
    minDuration: durations.length > 0 ? Math.min(...durations) : 0,
    maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    meanFrames: mean(frames)
  };
}

/**
 * Retourne des statistiques vides par défaut
 */
function getEmptyStats() {
  return {
    totalSimulations: 0,
    caughtCount: 0,
    escapedCount: 0,
    escapeRate: 0,
    
    duration: { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, count: 0 },
    score: { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, count: 0 },
    frames: { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, count: 0 },
    
    performance: {
      pacman: {
        avgMemoryUsage: 0,
        avgDecisionTime: 0
      },
      ghosts: {
        avgMemoryUsage: 0,
        avgDecisionTime: 0,
        avgNodesExplored: 0
      }
    },
    
    algorithmDistribution: [],
    
    meanDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    meanFrames: 0
  };
}

/**
 * Formate les statistiques pour l'affichage
 */
function formatStats(stats) {
  if (!stats) return null;
  
  return {
    ...stats,
    duration: stats.duration ? {
      ...stats.duration,
      mean: Math.round(stats.duration.mean * 100) / 100,
      median: Math.round(stats.duration.median * 100) / 100,
      stdDev: Math.round(stats.duration.stdDev * 100) / 100
    } : null,
    score: stats.score ? {
      ...stats.score,
      mean: Math.round(stats.score.mean),
      median: Math.round(stats.score.median),
      stdDev: Math.round(stats.score.stdDev)
    } : null,
    escapeRate: Math.round(stats.escapeRate * 100) / 100
  };
}

module.exports = {
  mean,
  median,
  standardDeviation,
  minMax,
  descriptiveStats,
  percentile,
  coefficientOfVariation,
  calculateSimulationStats,
  getEmptyStats,
  formatStats
};
