# 🚀 API Quick Reference

## Base URL
```
http://localhost:3000/api
```

---

## 🎮 Simulations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/simulations` | Run new simulation |
| `GET` | `/simulations` | List all simulations |
| `GET` | `/simulations/:id` | Get simulation details |
| `GET` | `/simulations/:id/replay` | Get replay frames |
| `DELETE` | `/simulations/:id` | Delete simulation |

---

## 📦 Batches

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/batches` | Create new batch |
| `POST` | `/batches/run-batch` | **🔥 Automation: Run batch simulations** |
| `GET` | `/batches` | List all batches |
| `GET` | `/batches/:id` | Get batch with stats |
| `PUT` | `/batches/:id` | Update batch info |
| `DELETE` | `/batches/:id` | Delete batch |
| `POST` | `/batches/:id/add-simulations` | Add simulations to batch |
| `DELETE` | `/batches/:id/simulations/:simId` | Remove simulation |
| `POST` | `/batches/:id/clear` | Clear all simulations |

---

## 🗺️ Mazes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/mazes` | Generate new maze |
| `GET` | `/mazes` | List all mazes |
| `GET` | `/mazes/:id` | Get maze details |
| `PUT` | `/mazes/:id/rating` | Update rating |
| `DELETE` | `/mazes/:id` | Delete maze |

---

## 📍 Trajectories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/trajectories` | Save trajectory |
| `GET` | `/trajectories` | List all trajectories |
| `GET` | `/trajectories/:id` | Get trajectory |
| `DELETE` | `/trajectories/:id` | Delete trajectory |

---

## 🤖 Pacman Algorithms

```javascript
// Basic (Fast)
'greedy'         // Balanced pellet collection
'defensive'      // Safe, ghost avoidance
'aggressive'     // Risky, maximum pellets
'random'         // Baseline random

// Advanced (Smarter)
'minimax'        // Optimal game tree search
'expectimax'     // Probabilistic decisions
'influence_map'  // Spatial reasoning
'mcts'           // Monte Carlo Tree Search
```

---

## 👻 Ghost Algorithms

```javascript
'astar'  // A* pathfinding
'bfs'    // Breadth-first search
```

---

## 🔥 Quick Start: Run Automation

```bash
curl -X POST http://localhost:3000/api/batches/run-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batchName": "MCTS Test Suite",
    "mazeId": "your-maze-id",
    "pacmanAlgorithm": "mcts",
    "pacmanConfig": { "iterations": 2000 },
    "ghostConfigs": [
      { "type": "blinky", "algorithm": "astar", "startPosition": { "x": 10, "y": 10 } }
    ],
    "iterations": 50,
    "maxDuration": 60
  }'
```

---

## 📊 Query Parameters

### Pagination (All List Endpoints)
```
?page=1&limit=20
```

### Filtering
```
/simulations?mazeId=xxx&trajectoryId=yyy
/simulations/:id?includeFrames=true
```

---

## 📦 Example: Complete Workflow

```javascript
// 1. Create batch
POST /api/batches
{ "name": "Performance Test", "description": "..." }

// 2. Run simulations
POST /api/batches/run-batch
{ "batchName": "Performance Test", ... }

// 3. Get statistics
GET /api/batches/:id
// Returns aggregate stats: catch rate, duration, score, performance
```

---

## 🎯 Response Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `202` | Accepted (async) |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Server Error |

---

## 📈 Performance Metrics

| Algorithm | Decision Time | Complexity |
|-----------|---------------|------------|
| Random | ~1ms | O(1) |
| Greedy/Defensive/Aggressive | ~2-5ms | O(n) |
| Influence Maps | ~8-12ms | O(w×h) |
| Minimax (depth 3) | ~10-20ms | O(b^d) |
| Expectimax (depth 3) | ~15-30ms | O(b^d) |
| MCTS (1000 iter) | ~50-100ms | O(k×d) |

---

**Full Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
