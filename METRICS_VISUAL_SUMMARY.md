# 📊 Système de Métriques de Performance - Résumé Visuel

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SIMULATION PROCESS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Pac-Man    │     │   Blinky     │     │    Pinky     │        │
│  │   (Replay)   │     │   (A* AI)    │     │   (BFS AI)   │        │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘        │
│         │                    │                     │                 │
│         │                    │                     │                 │
│         ▼                    ▼                     ▼                 │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          PERFORMANCE TRACKER                             │        │
│  │  • Mémoire (tracemalloc)                                │        │
│  │  • Temps (perf_counter)                                 │        │
│  │  • Nœuds explorés                                       │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                 │                                    │
│                                 ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          METRICS CALCULATION                             │        │
│  │  • Score Calculator                                      │        │
│  │  • Complexity Analyzer                                   │        │
│  │  • Statistics Aggregator                                 │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                 │                                    │
│                                 ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          MONGODB STORAGE                                 │        │
│  │  Simulation.results.performanceMetrics                   │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BATCH STATISTICS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          STATISTICAL ANALYSIS                            │        │
│  │  • Moyenne (μ) = Σxi / n                                │        │
│  │  • Médiane = Valeur centrale                            │        │
│  │  • Écart-type (σ) = √(Σ(xi-μ)² / n)                    │        │
│  │  • Min / Max                                             │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                 │                                    │
│                                 ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          ALGORITHM DISTRIBUTION                          │        │
│  │  A*: 100 uses | Avg: 8.67ms, 534KB, 1345 nodes         │        │
│  │  BFS: 100 uses | Avg: 12.23ms, 755KB, 2011 nodes       │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                 │                                    │
│                                 ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          MONGODB STORAGE                                 │        │
│  │  SimulationBatch.stats                                   │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND DISPLAY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────┐  ┌───────────────────────┐              │
│  │ SIMULATION VIEW       │  │ BATCH VIEW            │              │
│  ├───────────────────────┤  ├───────────────────────┤              │
│  │ 📊 Main Metrics       │  │ 📈 Statistics         │              │
│  │   • Duration: 3245ms  │  │   Duration (μ±σ):     │              │
│  │   • Score: 4850       │  │   3456±456 ms         │              │
│  │   • Frames: 156       │  │   Score (μ±σ):        │              │
│  │   • Result: ✅ Escaped│  │   4523±678            │              │
│  │                       │  │                        │              │
│  │ 🎮 Pac-Man            │  │ ⚡ Avg Performance     │              │
│  │   • Memory: 2 KB      │  │   Pacman: 0.18ms      │              │
│  │   • Time: O(1)        │  │   Ghosts: 10.45ms     │              │
│  │   • Avg: 0.15ms       │  │                        │              │
│  │                       │  │ 🔬 Algorithms          │              │
│  │ 👻 Ghosts             │  │   A*: 8.67ms, 534KB   │              │
│  │   Blinky (A*)         │  │   BFS: 12.23ms, 755KB │              │
│  │   • Memory: 512 KB    │  │                        │              │
│  │   • Time: O(b^d)      │  │ 📊 Results             │              │
│  │   • Avg: 8.45ms       │  │   Escaped: 64%        │              │
│  │   • Nodes: 1247       │  │   Caught: 36%         │              │
│  └───────────────────────┘  └───────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Flux de Données

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ Initialize Tracker   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ FOR EACH FRAME:      │
│                      │
│  1. Start timing     │
│  2. Record memory    │
│  3. Execute decision │
│  4. Count nodes      │
│  5. Record metrics   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Calculate Averages:  │
│                      │
│  • Memory: Σ/n       │
│  • Time: Σ/n         │
│  • Nodes: Σ          │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Determine Complexity │
│ Based on Algorithm   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Calculate Score:     │
│                      │
│  Base + Pellets +    │
│  Survival - Penalty  │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Save to Database     │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Display in UI        │
└────┬─────────────────┘
     │
     ▼
┌──────────┐
│   END    │
└──────────┘
```

## Formules Statistiques

### Moyenne (Mean)
```
     n
    ___
    \
μ = /__ xi
    i=1
    ─────────
        n
```

### Écart-type (Standard Deviation)
```
       _______________
      /     n
     /     ___
    /      \    2
σ =│       /__ (xi - μ)
    \     i=1
     \   ─────────────
      \       n
       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

### Score de Simulation
```
Score = BASE + (pellets × 10) + (power_pellets × 50)
        + (survival_bonus × frames) + completion_bonus
        - early_capture_penalty
```

### Coefficient de Variation
```
       σ
CV = ──── × 100%
       μ
```

## Complexités Algorithmiques

| Algorithm | Time Complexity | Space Complexity | Description |
|-----------|----------------|------------------|-------------|
| **A\***   | O(b^d)         | O(b^d)          | b=branching, d=depth |
| **BFS**   | O(V + E)       | O(V)            | V=vertices, E=edges |
| **Greedy**| O(1)           | O(1)            | Immediate decision |
| **Random**| O(1)           | O(1)            | Random walk |

## Interprétation des Métriques

### 🟢 Performance Excellente
```
✓ Mémoire       < 1 MB
✓ Temps décision < 10 ms
✓ Score         > 5000
✓ CV            < 15%
```

### 🟡 Performance Acceptable
```
≈ Mémoire       1-5 MB
≈ Temps décision 10-50 ms
≈ Score         3000-5000
≈ CV            15-30%
```

### 🔴 Performance Problématique
```
✗ Mémoire       > 10 MB
✗ Temps décision > 100 ms
✗ Score         < 1000
✗ CV            > 50%
```

## Exemple de Comparaison A* vs BFS

```
┌────────────────┬─────────────┬─────────────┬──────────┐
│   Métrique     │     A*      │     BFS     │ Meilleur │
├────────────────┼─────────────┼─────────────┼──────────┤
│ Mémoire        │   534 KB    │   755 KB    │   A*     │
│ Temps décision │   8.67 ms   │  12.23 ms   │   A*     │
│ Nœuds explorés │    1345     │    2011     │   A*     │
│ Optimalité     │     ✓       │      ✓     │   Égal   │
└────────────────┴─────────────┴─────────────┴──────────┘

Conclusion: A* est plus efficace grâce à son heuristique Manhattan,
            tout en garantissant le chemin optimal comme BFS.
```

## Stack Technologique

```
┌─────────────────────────────────────────┐
│           FRONTEND                       │
│  • JavaScript ES6+                      │
│  • PerformanceMetrics Component         │
│  • Custom CSS Styling                   │
└───────────────┬─────────────────────────┘
                │
                │ REST API
                │
┌───────────────▼─────────────────────────┐
│           BACKEND (Node.js)              │
│  • Express.js                           │
│  • MongoDB + Mongoose                   │
│  • Statistics Module                    │
└───────────────┬─────────────────────────┘
                │
                │ Python Bridge
                │
┌───────────────▼─────────────────────────┐
│           PYTHON ENGINE                  │
│  • tracemalloc (memory)                 │
│  • time.perf_counter (timing)           │
│  • Performance Tracker                  │
│  • Complexity Analyzer                  │
│  • Score Calculator                     │
└─────────────────────────────────────────┘
```

## Fichiers Modifiés/Créés

### Python (9 fichiers)
- ✨ `utils/performance_metrics.py` (nouveau)
- 📝 `simulation/game_engine.py` (modifié)
- 📝 `pathfinding/astar.py` (modifié)
- 📝 `pathfinding/bfs.py` (modifié)
- 📝 `ghost_ai/base_agent.py` (modifié)
- ✨ `tests/test_performance_metrics.py` (nouveau)

### Node.js (4 fichiers)
- ✨ `server/utils/statistics.js` (nouveau)
- 📝 `server/models/Simulation.js` (modifié)
- 📝 `server/models/SimulationBatch.js` (modifié)
- 📝 `server/controllers/batchController.js` (modifié)

### Frontend (3 fichiers)
- ✨ `client/js/components/PerformanceMetrics.js` (nouveau)
- ✨ `client/css/performance-metrics.css` (nouveau)
- 📝 `client/index.html` (modifié)

### Documentation (3 fichiers)
- ✨ `PERFORMANCE_METRICS_GUIDE.md` (nouveau)
- ✨ `METRICS_UPDATE_README.md` (nouveau)
- ✨ `METRICS_DATA_EXAMPLES.json` (nouveau)

**Total**: 19 fichiers (9 nouveaux + 10 modifiés)

## Quick Start

### 1. Lancer une simulation avec métriques
```bash
# Le tracking est automatique
python src/algorithms/simulation/game_engine.py
```

### 2. Consulter les métriques
```javascript
// Via API
const sim = await fetch('/api/simulations/:id').then(r => r.json());
console.log(sim.results.performanceMetrics);
```

### 3. Voir les statistiques de batch
```javascript
// Via API
const batch = await fetch('/api/batches/:id').then(r => r.json());
console.log(batch.stats);
```

### 4. Afficher dans l'UI
```javascript
// Utiliser le composant
const html = PerformanceMetrics.renderMetrics(data, 'simulation');
document.getElementById('container').innerHTML = html;
```

---

**🎓 Pour plus de détails, consultez**:
- `PERFORMANCE_METRICS_GUIDE.md` - Guide complet
- `METRICS_UPDATE_README.md` - Documentation technique
- `METRICS_DATA_EXAMPLES.json` - Exemples de données
