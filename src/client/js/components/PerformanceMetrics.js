/**
 * Performance Metrics Display Component
 * Affiche les métriques de performance scientifiques pour une simulation ou un batch
 */

class PerformanceMetrics {
  /**
   * Crée une vue détaillée des métriques de performance
   * @param {Object} data - Données de simulation ou statistiques de batch
   * @param {String} type - 'simulation' ou 'batch'
   * @returns {String} HTML string
   */
  static renderMetrics(data, type = 'simulation') {
    if (type === 'simulation') {
      return this.renderSimulationMetrics(data);
    } else {
      return this.renderBatchMetrics(data);
    }
  }

  /**
   * Affiche les métriques d'une simulation individuelle
   */
  static renderSimulationMetrics(simulation) {
    if (!simulation || !simulation.results) {
      return '<div class="no-data">Aucune donnée de performance disponible</div>';
    }

    const results = simulation.results;
    const perf = results.performanceMetrics;

    return `
      <div class="performance-metrics">
        <div class="metrics-section">
          <h3>Performance Metrics</h3>
          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-label">Durée de simulation</span>
              <span class="metric-value">${this.formatDuration(results.duration)}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Score</span>
              <span class="metric-value">${this.formatNumber(results.score)}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Total frames</span>
              <span class="metric-value">${results.totalFrames || 0}</span>
            </div>
            <div class="metric-card ${results.caught ? 'caught' : 'escaped'}">
              <span class="metric-label">Résultat</span>
              <span class="metric-value">${results.caught ? '❌ Capturé' : '✅ Échappé'}</span>
            </div>
          </div>
        </div>

        ${perf ? this.renderEntityMetrics(perf) : ''}
      </div>
    `;
  }

  /**
   * Affiche les métriques des entités (Pacman + Fantômes)
   */
  static renderEntityMetrics(perf) {
    return `
      <div class="metrics-section">
        <h3>🎮 Performance des Entités</h3>
        
        ${perf.pacman ? `
          <div class="entity-metrics pacman-metrics">
            <h4>Pac-Man</h4>
            <div class="metrics-row">
              <div class="metric-item">
                <span class="metric-icon">🧠</span>
                <span class="metric-label">Mémoire</span>
                <span class="metric-value">${this.formatBytes(perf.pacman.memoryUsage)}</span>
              </div>
              <div class="metric-item">
                <span class="metric-icon">TIME</span>
                <span class="metric-label">Complexité</span>
                <span class="metric-value">${perf.pacman.timeComplexity}</span>
              </div>
              <div class="metric-item">
                <span class="metric-icon">⚡</span>
                <span class="metric-label">Temps décision</span>
                <span class="metric-value">${this.formatTime(perf.pacman.avgDecisionTime)}</span>
              </div>
            </div>
          </div>
        ` : ''}

        ${perf.ghosts && perf.ghosts.length > 0 ? `
          <div class="entity-metrics ghosts-metrics">
            <h4>Fantômes</h4>
            ${perf.ghosts.map(ghost => this.renderGhostMetrics(ghost)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Affiche les métriques d'un fantôme individuel
   */
  static renderGhostMetrics(ghost) {
    const ghostEmojis = {
      blinky: '🔴',
      pinky: '🩷',
      inky: '🩵',
      clyde: '🟠'
    };

    return `
      <div class="ghost-metrics-card ${ghost.type}">
        <div class="ghost-header">
          <span class="ghost-emoji">${ghostEmojis[ghost.type] || '👻'}</span>
          <span class="ghost-name">${ghost.type}</span>
          <span class="ghost-algo badge">${ghost.algorithm}</span>
        </div>
        <div class="metrics-row small">
          <div class="metric-item">
            <span class="metric-label">Mémoire</span>
            <span class="metric-value">${this.formatBytes(ghost.memoryUsage)}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Complexité</span>
            <span class="metric-value">${ghost.timeComplexity}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Temps moyen</span>
            <span class="metric-value">${this.formatTime(ghost.avgDecisionTime)}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Nœuds explorés</span>
            <span class="metric-value">${this.formatNumber(ghost.pathNodesExplored)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Affiche les statistiques agrégées d'un batch
   */
  static renderBatchMetrics(stats) {
    if (!stats) {
      return '<div class="no-data">Aucune statistique disponible</div>';
    }

    return `
      <div class="batch-statistics">
        <div class="stats-header">
          <h2>📈 Statistiques Scientifiques du Batch</h2>
          <div class="stats-summary">
            <span class="stat-badge">${stats.totalSimulations} simulations</span>
            <span class="stat-badge success">${stats.escapedCount} échappés</span>
            <span class="stat-badge danger">${stats.caughtCount} capturés</span>
            <span class="stat-badge info">${this.formatPercent(stats.escapeRate)} taux d'échappement</span>
          </div>
        </div>

        <div class="stats-grid">
          ${this.renderStatCard('Durée', stats.duration, 'ms')}
          ${this.renderStatCard('Score', stats.score, '')}
          ${this.renderStatCard('Frames', stats.frames, '')}
        </div>

        ${stats.performance ? this.renderBatchPerformance(stats.performance) : ''}
        ${stats.algorithmDistribution ? this.renderAlgorithmDistribution(stats.algorithmDistribution) : ''}
      </div>
    `;
  }

  /**
   * Carte de statistique avec moyenne, médiane, écart-type
   */
  static renderStatCard(title, stat, unit) {
    if (!stat) return '';

    return `
      <div class="stat-card">
        <h3>${title}</h3>
        <div class="stat-values">
          <div class="stat-row">
            <span class="stat-label">Moyenne (μ):</span>
            <span class="stat-value">${this.formatNumber(stat.mean)}${unit}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Médiane:</span>
            <span class="stat-value">${this.formatNumber(stat.median)}${unit}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Écart-type (σ):</span>
            <span class="stat-value">${this.formatNumber(stat.stdDev)}${unit}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Min / Max:</span>
            <span class="stat-value">${this.formatNumber(stat.min)} / ${this.formatNumber(stat.max)}${unit}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Performance moyenne des entités dans le batch
   */
  static renderBatchPerformance(performance) {
    return `
      <div class="batch-performance">
        <h3>⚡ Performance Moyenne des Agents</h3>
        <div class="performance-comparison">
          <div class="entity-perf-card">
            <h4>🎮 Pac-Man</h4>
            <div class="perf-stats">
              <div>Mémoire: ${this.formatBytes(performance.pacman.avgMemoryUsage)}</div>
              <div>Temps décision: ${this.formatTime(performance.pacman.avgDecisionTime)}</div>
            </div>
          </div>
          <div class="entity-perf-card">
            <h4>👻 Fantômes</h4>
            <div class="perf-stats">
              <div>Mémoire: ${this.formatBytes(performance.ghosts.avgMemoryUsage)}</div>
              <div>Temps décision: ${this.formatTime(performance.ghosts.avgDecisionTime)}</div>
              <div>Nœuds explorés: ${this.formatNumber(performance.ghosts.avgNodesExplored)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Distribution des algorithmes utilisés
   */
  static renderAlgorithmDistribution(distribution) {
    if (!distribution || distribution.length === 0) return '';

    return `
      <div class="algorithm-distribution">
        <h3>🔬 Distribution des Algorithmes</h3>
        <div class="algo-cards">
          ${distribution.map(algo => `
            <div class="algo-card">
              <div class="algo-header">
                <span class="algo-name">${algo.algorithm.toUpperCase()}</span>
                <span class="algo-count">${algo.count} utilisations</span>
              </div>
              <div class="algo-metrics">
                <div class="algo-metric">
                  <span>Mémoire moy.:</span>
                  <span>${this.formatBytes(algo.avgPerformance.memoryUsage)}</span>
                </div>
                <div class="algo-metric">
                  <span>Temps moy.:</span>
                  <span>${this.formatTime(algo.avgPerformance.decisionTime)}</span>
                </div>
                <div class="algo-metric">
                  <span>Nœuds moy.:</span>
                  <span>${this.formatNumber(algo.avgPerformance.nodesExplored)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ===== Fonctions utilitaires de formatage =====

  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  static formatTime(ms) {
    if (!ms || ms === 0) return '0 ms';
    if (ms < 1) return (ms * 1000).toFixed(2) + ' μs';
    if (ms < 1000) return ms.toFixed(2) + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }

  static formatDuration(ms) {
    if (!ms || ms === 0) return '0 ms';
    if (ms < 1000) return Math.round(ms) + ' ms';
    if (ms < 60000) return (ms / 1000).toFixed(2) + ' s';
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }

  static formatNumber(num) {
    if (num === undefined || num === null) return '0';
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toFixed(2);
  }

  static formatPercent(num) {
    if (!num) return '0%';
    return num.toFixed(1) + '%';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMetrics;
}
