/**
 * Browser-based Performance Tracker
 * Tracks memory usage, decision time, and complexity for simulations
 */

class BrowserPerformanceTracker {
  constructor() {
    this.trackers = {};
    this.supportsMemory = 'memory' in performance;
  }

  startTracking(entityId) {
    if (!this.trackers[entityId]) {
      this.trackers[entityId] = {
        memorySamples: [],
        timeSamples: [],
        nodesExplored: 0,
        decisionsCount: 0,
        startTime: performance.now(),
        startMemory: this.getCurrentMemory()
      };
    }
  }

  getCurrentMemory() {
    if (this.supportsMemory && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  recordDecision(entityId, nodesExplored = 0, decisionStartTime = null) {
    if (!this.trackers[entityId]) {
      this.startTracking(entityId);
    }

    const tracker = this.trackers[entityId];
    
    // Measure decision time
    if (decisionStartTime !== null) {
      const decisionTime = performance.now() - decisionStartTime;
      tracker.timeSamples.push(decisionTime);
    }
    
    // Measure memory
    const currentMemory = this.getCurrentMemory();
    if (currentMemory > 0 && tracker.startMemory > 0) {
      const memoryUsed = currentMemory - tracker.startMemory;
      tracker.memorySamples.push(Math.max(0, memoryUsed));
    }
    
    // Track nodes explored
    tracker.nodesExplored += nodesExplored;
    tracker.decisionsCount++;
  }

  getMetrics(entityId) {
    if (!this.trackers[entityId]) {
      return this.getDefaultMetrics();
    }

    const tracker = this.trackers[entityId];

    // Calculate averages
    const avgMemory = tracker.memorySamples.length > 0
      ? tracker.memorySamples.reduce((a, b) => a + b, 0) / tracker.memorySamples.length
      : 0;

    const avgTime = tracker.timeSamples.length > 0
      ? tracker.timeSamples.reduce((a, b) => a + b, 0) / tracker.timeSamples.length
      : 0;

    return {
      memoryUsage: Math.round(avgMemory),
      avgDecisionTime: Number(avgTime.toFixed(3)),
      pathNodesExplored: tracker.nodesExplored,
      decisionsCount: tracker.decisionsCount
    };
  }

  getDefaultMetrics() {
    return {
      memoryUsage: 0,
      avgDecisionTime: 0,
      pathNodesExplored: 0,
      decisionsCount: 0
    };
  }

  reset() {
    this.trackers = {};
  }

  // Get time complexity based on algorithm
  getComplexity(algorithm) {
    const complexities = {
      'astar': 'O(b^d)',
      'bfs': 'O(V+E)',
      'greedy': 'O(V)',
      'defensive': 'O(V)',
      'aggressive': 'O(V)',
      'random': 'O(1)'
    };
    return complexities[algorithm] || 'O(1)';
  }
}
