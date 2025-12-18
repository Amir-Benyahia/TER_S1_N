# 📚 API Documentation Index

Complete guide to the Pacman AI Simulation API with all available endpoints, examples, and tools.

---

## 🚀 Getting Started

Start here if you're new to the API:

1. **[Quick Start Guide](#quick-start)** - Get up and running in 5 minutes
2. **[API Quick Reference](./API_QUICK_REFERENCE.md)** - Fast lookup table for all endpoints
3. **[Architecture Overview](./API_ARCHITECTURE.md)** - Understand how the system works

---

## 📖 Complete Documentation

### Core API Documentation

| Document | Description | Use When |
|----------|-------------|----------|
| **[API Documentation](./API_DOCUMENTATION.md)** | 📘 **MAIN REFERENCE** - Complete endpoint documentation with request/response examples, data models, and best practices | You need detailed information about any endpoint |
| **[Quick Reference](./API_QUICK_REFERENCE.md)** | 📋 Fast lookup table with all endpoints, algorithms, and status codes | You need a quick reminder of endpoint paths |
| **[Architecture Overview](./API_ARCHITECTURE.md)** | 🏗️ System architecture, data flow, component interactions, and scaling strategies | You want to understand the technical design |

---

### Practical Guides

| Document | Description | Use When |
|----------|-------------|----------|
| **[cURL Examples](./API_CURL_EXAMPLES.md)** | 🌐 Command-line examples for all endpoints with automation scripts | You want to test the API from terminal |
| **[Postman Collection](./Pacman_API.postman_collection.json)** | 📮 Import into Postman/Thunder Client for GUI testing | You prefer a visual API testing tool |
| **[Performance Metrics Guide](./PERFORMANCE_METRICS_GUIDE.md)** | 📊 Understanding algorithm performance and complexity | You need to interpret performance data |

---

### AI & Algorithms

| Document | Description | Use When |
|----------|-------------|----------|
| **[Pacman AI Configuration](./PACMAN_AI_CONFIGURATION.md)** | 🤖 All 8 algorithms explained with parameters and usage | You want to configure Pacman AI behavior |
| **[Advanced AI Algorithms](./docs/ADVANCED_AI_ALGORITHMS.md)** | 🧠 Deep dive into Minimax, Expectimax, MCTS, Influence Maps | You want to understand advanced algorithms |

---

## 🔥 Quick Start

### 1. Start the Server

```bash
cd src/server
npm install
npm run dev
```

Server runs at: `http://localhost:3000`

### 2. Test the API

```bash
# Check server is running
curl http://localhost:3000/api/mazes

# Create a maze
curl -X POST http://localhost:3000/api/mazes \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Maze", "config": {"width": 20, "height": 20}}'
```

### 3. Run Your First Simulation

See [API Documentation](./API_DOCUMENTATION.md#run-new-simulation) for complete example.

---

## 📊 API Endpoints Overview

### Simulations (`/api/simulations`)

Core endpoints for running AI simulations:

- `POST /api/simulations` - Run simulation with Pacman AI
- `GET /api/simulations` - List all simulations (paginated)
- `GET /api/simulations/:id` - Get detailed simulation
- `GET /api/simulations/:id/replay` - Get frame data for replay
- `DELETE /api/simulations/:id` - Delete simulation

**📖 Details:** [API Documentation - Simulations](./API_DOCUMENTATION.md#-simulation-endpoints)

---

### Batch Automation (`/api/batches`)

Batch operations for automated testing and performance analysis:

- `POST /api/batches/run-batch` - **🔥 PRIMARY AUTOMATION ENDPOINT**
- `POST /api/batches` - Create new batch
- `GET /api/batches` - List all batches
- `GET /api/batches/:id` - Get batch with statistics
- `PUT /api/batches/:id` - Update batch metadata
- `DELETE /api/batches/:id` - Delete batch
- `POST /api/batches/:id/add-simulations` - Add simulations
- `POST /api/batches/:id/clear` - Clear batch

**📖 Details:** [API Documentation - Batches](./API_DOCUMENTATION.md#-batch-automation-endpoints)

---

### Mazes (`/api/mazes`)

Maze generation and management:

- `POST /api/mazes` - Generate new maze
- `GET /api/mazes` - List all mazes
- `GET /api/mazes/:id` - Get maze details
- `PUT /api/mazes/:id/rating` - Update rating
- `DELETE /api/mazes/:id` - Delete maze

**📖 Details:** [API Documentation - Mazes](./API_DOCUMENTATION.md#️-maze-management)

---

### Trajectories (`/api/trajectories`)

Player trajectory recording and replay:

- `POST /api/trajectories` - Save trajectory
- `GET /api/trajectories` - List all trajectories
- `GET /api/trajectories/:id` - Get trajectory
- `DELETE /api/trajectories/:id` - Delete trajectory

**📖 Details:** [API Documentation - Trajectories](./API_DOCUMENTATION.md#-trajectory-management)

---

## 🤖 Pacman AI Algorithms

### Basic Strategies (Fast - O(1) to O(n))

| Algorithm | Description | Decision Time | Best For |
|-----------|-------------|---------------|----------|
| `greedy` | Moves towards nearest pellet | ~2-5ms | Balanced gameplay |
| `defensive` | Prioritizes ghost avoidance | ~2-5ms | Safe, cautious play |
| `aggressive` | Focuses on pellet collection | ~2-5ms | High-score runs |
| `random` | Random movement (baseline) | ~1ms | Comparison baseline |

### Advanced Algorithms (Smarter - O(w×h) to O(b^d))

| Algorithm | Description | Decision Time | Best For |
|-----------|-------------|---------------|----------|
| `minimax` | Optimal game tree search | ~10-20ms | Competitive play |
| `expectimax` | Probabilistic decisions | ~15-30ms | Uncertain environments |
| `influence_map` | Spatial tactical reasoning | ~8-12ms | Strategic positioning |
| `mcts` | Monte Carlo Tree Search | ~50-100ms | State-of-the-art performance |

**📖 Details:** [Pacman AI Configuration](./PACMAN_AI_CONFIGURATION.md)

---

## 📦 Example Workflows

### 1. Test All 8 Algorithms

```bash
# See complete script in cURL Examples
bash test_all_algorithms.sh
```

**📖 Full Script:** [cURL Examples - Complete Workflow](./API_CURL_EXAMPLES.md#complete-workflow-test-all-8-algorithms)

---

### 2. Minimax Depth Comparison

Compare Minimax performance at depths 3, 4, and 5:

```bash
for depth in 3 4 5; do
  curl -X POST http://localhost:3000/api/batches/run-batch \
    -d "{\"pacmanAlgorithm\": \"minimax\", \"pacmanConfig\": {\"depth\": $depth}}"
done
```

**📖 Full Example:** [cURL Examples - Depth Comparison](./API_CURL_EXAMPLES.md#minimax-depth-comparison)

---

### 3. Batch Automation with Statistics

```javascript
// 1. Create batch and run simulations
const response = await fetch('/api/batches/run-batch', {
  method: 'POST',
  body: JSON.stringify({
    batchName: 'Performance Test',
    mazeId: 'your-maze-id',
    pacmanAlgorithm: 'mcts',
    iterations: 50
  })
});

// 2. Get aggregate statistics
const stats = await fetch(`/api/batches/${batchId}`);
console.log(stats.batch.stats); // catch rate, avg score, duration, etc.
```

**📖 Full Guide:** [API Documentation - Batch Automation](./API_DOCUMENTATION.md#run-batch-simulations-automation)

---

## 🛠️ Developer Tools

### Postman Collection

Import the collection for visual API testing:

1. Open Postman/Thunder Client
2. Import `docs/Pacman_API.postman_collection.json`
3. Set `baseUrl` variable to `http://localhost:3000/api`
4. Start testing!

**📦 File:** [Pacman_API.postman_collection.json](./Pacman_API.postman_collection.json)

---

### cURL Scripts

Pre-built bash scripts for common tasks:

- Test all 8 algorithms
- Minimax depth comparison
- MCTS iterations test
- Extract batch statistics

**📜 Scripts:** [cURL Examples](./API_CURL_EXAMPLES.md#-example-workflows)

---

## 📊 Understanding Results

### Simulation Results

```json
{
  "caught": false,
  "duration": 45.2,
  "score": 2400,
  "pelletsCollected": 120,
  "performance": {
    "pacman": {
      "decisionTime": { "mean": 12.5, "max": 45.2, "min": 2.1 },
      "memoryUsage": { "mean": 2048, "max": 3072, "min": 1024 },
      "complexity": "O(b^d)"
    }
  }
}
```

**📊 Interpretation:** [Performance Metrics Guide](./PERFORMANCE_METRICS_GUIDE.md)

---

### Batch Statistics

```json
{
  "total": 50,
  "catchRate": 30.0,
  "escapeRate": 70.0,
  "duration": { "mean": 42.5, "median": 41.2, "stdDev": 8.3 },
  "score": { "mean": 2150, "median": 2100, "stdDev": 350 }
}
```

**📈 Analysis:** [API Documentation - Statistics Breakdown](./API_DOCUMENTATION.md#statistics-breakdown)

---

## 🎯 Common Use Cases

### 1. Compare Algorithm Performance

**Goal:** Determine which algorithm performs best on your maze

1. Create a maze: `POST /api/mazes`
2. Run batch for each algorithm: `POST /api/batches/run-batch`
3. Compare statistics: `GET /api/batches/:id`

**📖 Guide:** [API Documentation - Best Practices](./API_DOCUMENTATION.md#-best-practices)

---

### 2. Optimize Algorithm Parameters

**Goal:** Find optimal depth for Minimax or iterations for MCTS

1. Run batches with different parameters
2. Analyze decision time vs. performance tradeoff
3. Choose optimal configuration

**📖 Guide:** [Pacman AI Configuration](./PACMAN_AI_CONFIGURATION.md#parameter-tuning)

---

### 3. Automated Testing Pipeline

**Goal:** Regression testing for AI changes

1. Use `POST /api/batches/run-batch` in CI/CD
2. Store batch IDs
3. Compare statistics across builds

**📖 Example:** [cURL Examples - Automation Scripts](./API_CURL_EXAMPLES.md#-example-workflows)

---

## ❓ FAQ

### How do I run simulations locally?

See [Quick Start](#-quick-start) above.

### What's the difference between simulations and batches?

- **Simulation**: Single game run with one Pacman AI and ghosts
- **Batch**: Collection of simulations with aggregate statistics

### Can I run simulations server-side?

Yes, the Python bridge spawns processes for AI execution. However, batch automation returns configuration for client-side execution to avoid server overload.

### How do I access frame-by-frame replay?

Use `GET /api/simulations/:id/replay` for optimized frame data retrieval.

### What are the performance characteristics?

See [Performance Metrics Guide](./PERFORMANCE_METRICS_GUIDE.md) for detailed complexity analysis.

---

## 📞 Support & Resources

### Documentation

- **Primary:** [API Documentation](./API_DOCUMENTATION.md)
- **Quick:** [Quick Reference](./API_QUICK_REFERENCE.md)
- **Examples:** [cURL Examples](./API_CURL_EXAMPLES.md)
- **Architecture:** [Architecture Overview](./API_ARCHITECTURE.md)

### Configuration

- **AI Setup:** [Pacman AI Configuration](./PACMAN_AI_CONFIGURATION.md)
- **Server Setup:** [Setup Guide](./SETUP.md)
- **Deployment:** [Render Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)

### Testing

- **Manual:** [Postman Collection](./Pacman_API.postman_collection.json)
- **Automated:** [cURL Scripts](./API_CURL_EXAMPLES.md#-example-workflows)
- **Performance:** [Performance Guide](./PERFORMANCE_METRICS_GUIDE.md)

---

## 🔄 Updates & Changelog

**Version 1.0** (December 18, 2025)
- ✅ Complete API documentation
- ✅ 8 Pacman AI algorithms (4 basic + 4 advanced)
- ✅ Batch automation endpoints
- ✅ Performance metrics tracking
- ✅ Postman collection
- ✅ cURL examples
- ✅ Architecture documentation

---

**Last Updated:** December 18, 2025  
**API Version:** 1.0  
**Maintained by:** UNICA M1 TER Team
