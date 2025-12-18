# 🚀 Pacman AI Simulation - API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:3000/api`  
**Content-Type:** `application/json`

---

## 📋 Table of Contents

1. [Simulation Endpoints](#-simulation-endpoints)
2. [Batch Automation Endpoints](#-batch-automation-endpoints)
3. [Maze Management](#-maze-management)
4. [Trajectory Management](#-trajectory-management)
5. [Data Models](#-data-models)
6. [Error Responses](#-error-responses)

---

## 🎮 Simulation Endpoints

### Run New Simulation

Execute a simulation with specified Pacman AI and Ghost configurations.

```http
POST /api/simulations
```

**Request Body:**

```json
{
  "name": "Minimax vs Blinky Test",
  "trajectoryId": "optional-trajectory-id",
  "mazeId": "maze-id-here",
  "pacmanAlgorithm": "minimax",
  "pacmanConfig": {
    "depth": 4,
    "iterations": 1000,
    "startPos": { "x": 1, "y": 1 }
  },
  "ghostConfigs": [
    {
      "type": "blinky",
      "algorithm": "astar",
      "startPosition": { "x": 10, "y": 10 }
    },
    {
      "type": "pinky",
      "algorithm": "bfs",
      "startPosition": { "x": 15, "y": 15 }
    }
  ],
  "results": {
    "caught": false,
    "catchPosition": null,
    "catchTime": null,
    "duration": 45.2,
    "score": 2400,
    "pelletsCollected": 120,
    "totalFrames": 1356,
    "frames": [],
    "performance": {
      "pacman": {
        "decisionTime": { "mean": 12.5, "max": 45.2, "min": 2.1 },
        "memoryUsage": { "mean": 2048, "max": 3072, "min": 1024 },
        "complexity": "O(b^d)"
      },
      "ghosts": [
        {
          "type": "blinky",
          "algorithm": "astar",
          "decisionTime": { "mean": 5.3, "max": 15.2, "min": 1.1 },
          "nodesExplored": { "mean": 145, "max": 450, "min": 20 }
        }
      ]
    }
  }
}
```

**Pacman Algorithms Available:**
- `greedy` - Fast, balanced pellet collection (O(n))
- `defensive` - Safe, ghost-avoidance priority (O(n))
- `aggressive` - Risky, maximum pellet focus (O(n))
- `random` - Baseline random movement (O(1))
- `minimax` - Optimal game tree search (O(b^d))
- `expectimax` - Probabilistic decision making (O(b^d))
- `influence_map` - Spatial tactical reasoning (O(w×h))
- `mcts` - Monte Carlo Tree Search (O(k×d))

**Ghost Algorithms:**
- `astar` - A* pathfinding
- `bfs` - Breadth-first search

**Response (201 Created):**

```json
{
  "message": "Simulation completed successfully",
  "simulation": {
    "_id": "674b9e2f8a3d1f001e5c4a8b",
    "name": "Minimax vs Blinky Test",
    "pacmanAlgorithm": "minimax",
    "pacmanConfig": {
      "depth": 4,
      "iterations": 1000,
      "startPos": { "x": 1, "y": 1 }
    },
    "ghostConfigs": [...],
    "results": {...},
    "createdAt": "2025-12-18T10:30:00.000Z",
    "updatedAt": "2025-12-18T10:30:00.000Z"
  }
}
```

---

### Get All Simulations

Retrieve paginated list of all simulations with optional filtering.

```http
GET /api/simulations?page=1&limit=20&trajectoryId=xxx&mazeId=yyy
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 20 | Items per page (max 100) |
| `trajectoryId` | string | - | Filter by trajectory ID |
| `mazeId` | string | - | Filter by maze ID |

**Response (200 OK):**

```json
{
  "simulations": [
    {
      "_id": "674b9e2f8a3d1f001e5c4a8b",
      "name": "Minimax vs Blinky Test",
      "pacmanAlgorithm": "minimax",
      "mazeId": {...},
      "results": {
        "caught": false,
        "duration": 45.2,
        "score": 2400
      },
      "createdAt": "2025-12-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Note:** Frame data is excluded in list view for performance.

---

### Get Simulation by ID

Retrieve detailed information about a specific simulation.

```http
GET /api/simulations/:id?includeFrames=true
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeFrames` | boolean | false | Include frame-by-frame replay data |

**Response (200 OK):**

```json
{
  "simulation": {
    "_id": "674b9e2f8a3d1f001e5c4a8b",
    "name": "Minimax vs Blinky Test",
    "pacmanAlgorithm": "minimax",
    "pacmanConfig": {
      "depth": 4,
      "iterations": 1000,
      "startPos": { "x": 1, "y": 1 }
    },
    "ghostConfigs": [...],
    "results": {
      "caught": false,
      "catchPosition": null,
      "catchTime": null,
      "duration": 45.2,
      "score": 2400,
      "pelletsCollected": 120,
      "totalFrames": 1356,
      "frames": [
        {
          "frame": 0,
          "pacman": { "x": 1, "y": 1 },
          "ghosts": [{ "x": 10, "y": 10, "type": "blinky" }],
          "pellets": [[1,2], [1,3], ...],
          "score": 0
        }
      ],
      "performance": {...}
    },
    "trajectoryId": {...},
    "mazeId": {...},
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
}
```

---

### Get Replay Frames

Retrieve only the frame data for simulation replay (optimized endpoint).

```http
GET /api/simulations/:id/replay
```

**Response (200 OK):**

```json
{
  "frames": [
    {
      "frame": 0,
      "pacman": { "x": 1, "y": 1 },
      "ghosts": [
        { "x": 10, "y": 10, "type": "blinky" }
      ],
      "pellets": [[1,2], [1,3]],
      "score": 0
    }
  ]
}
```

**Use Case:** Optimized for replaying simulations without loading all metadata.

---

### Delete Simulation

Remove a simulation from the database.

```http
DELETE /api/simulations/:id
```

**Response (200 OK):**

```json
{
  "message": "Simulation deleted successfully"
}
```

---

## 📦 Batch Automation Endpoints

Batch operations allow you to group simulations, run automated tests, and analyze aggregate statistics.

### Create New Batch

Create a new batch container for grouping simulations.

```http
POST /api/batches
```

**Request Body:**

```json
{
  "name": "Minimax Performance Test Suite",
  "description": "Testing Minimax with depth 3-5 across 10 mazes"
}
```

**Response (201 Created):**

```json
{
  "message": "Batch created successfully",
  "batch": {
    "_id": "674b9f2f8a3d1f001e5c4b9c",
    "name": "Minimax Performance Test Suite",
    "description": "Testing Minimax with depth 3-5 across 10 mazes",
    "simulations": [],
    "stats": null,
    "createdAt": "2025-12-18T10:35:00.000Z"
  }
}
```

---

### Run Batch Simulations (Automation)

**🔥 PRIMARY AUTOMATION ENDPOINT** - Configure and execute multiple simulations automatically.

```http
POST /api/batches/run-batch
```

**Request Body:**

```json
{
  "batchName": "MCTS vs A* Ghosts - 100 Iterations",
  "mazeId": "674b9a1f8a3d1f001e5c4a1a",
  "pacmanAlgorithm": "mcts",
  "pacmanConfig": {
    "depth": 3,
    "iterations": 2000
  },
  "ghostConfigs": [
    {
      "type": "blinky",
      "algorithm": "astar",
      "startPosition": { "x": 10, "y": 10 }
    },
    {
      "type": "pinky",
      "algorithm": "astar",
      "startPosition": { "x": 15, "y": 5 }
    }
  ],
  "iterations": 100,
  "maxDuration": 60
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batchName` | string | ✅ | Name of the batch (creates if not exists) |
| `mazeId` | string | ✅ | Maze ID to run simulations on |
| `pacmanAlgorithm` | string | ✅ | Pacman AI algorithm (see list above) |
| `pacmanConfig` | object | - | Advanced config (depth, iterations) |
| `ghostConfigs` | array | ✅ | Array of ghost configurations |
| `iterations` | integer | - | Number of simulations to run (default: 1) |
| `maxDuration` | integer | - | Max duration per simulation in seconds |

**Response (202 Accepted):**

```json
{
  "message": "Batch simulations accepted for processing",
  "batchId": "674b9f2f8a3d1f001e5c4b9c",
  "batchName": "MCTS vs A* Ghosts - 100 Iterations",
  "iterations": 100,
  "note": "Simulations must be run client-side. Use the returned configuration to run simulations in the browser and POST results back to /api/simulations"
}
```

**Workflow:**

1. POST to `/api/batches/run-batch` with configuration
2. Receive batch ID
3. Run simulations client-side (browser/UI)
4. POST each simulation result to `/api/simulations` with `batchId`
5. GET `/api/batches/:id` to retrieve aggregate statistics

---

### Get All Batches

Retrieve paginated list of all batches.

```http
GET /api/batches?page=1&limit=20
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

**Response (200 OK):**

```json
{
  "batches": [
    {
      "_id": "674b9f2f8a3d1f001e5c4b9c",
      "name": "MCTS Performance Tests",
      "description": "Testing MCTS iterations 500-5000",
      "simulationCount": 50,
      "createdAt": "2025-12-18T10:35:00.000Z",
      "updatedAt": "2025-12-18T11:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

---

### Get Batch by ID

Retrieve detailed batch information with statistics and all simulations.

```http
GET /api/batches/:id
```

**Response (200 OK):**

```json
{
  "batch": {
    "_id": "674b9f2f8a3d1f001e5c4b9c",
    "name": "MCTS Performance Tests",
    "description": "Testing MCTS iterations 500-5000",
    "simulations": [
      {
        "_id": "674b9e2f8a3d1f001e5c4a8b",
        "name": "MCTS Test #1",
        "pacmanAlgorithm": "mcts",
        "results": {...}
      }
    ],
    "stats": {
      "total": 50,
      "caught": 15,
      "escaped": 35,
      "catchRate": 30.0,
      "escapeRate": 70.0,
      "duration": {
        "mean": 42.5,
        "median": 41.2,
        "stdDev": 8.3,
        "min": 25.1,
        "max": 59.8
      },
      "score": {
        "mean": 2150,
        "median": 2100,
        "stdDev": 350,
        "min": 1200,
        "max": 3400
      },
      "frames": {
        "mean": 1275,
        "median": 1236,
        "stdDev": 249,
        "min": 753,
        "max": 1794
      },
      "performance": {
        "pacman": {
          "avgMemoryUsage": 2048,
          "avgDecisionTime": 15.3
        },
        "ghosts": {
          "avgMemoryUsage": 1024,
          "avgDecisionTime": 5.2,
          "avgNodesExplored": 125
        }
      },
      "algorithmDistribution": [
        {
          "algorithm": "mcts",
          "count": 50,
          "percentage": 100
        }
      ]
    },
    "createdAt": "2025-12-18T10:35:00.000Z",
    "updatedAt": "2025-12-18T11:20:00.000Z"
  }
}
```

**Statistics Breakdown:**

- **Catch/Escape Rates**: Percentage of simulations where Pacman was caught
- **Duration Stats**: Time-based statistical analysis (mean, median, std deviation)
- **Score Stats**: Point-based performance metrics
- **Frame Stats**: Simulation length analysis
- **Performance Metrics**: Algorithm efficiency (decision time, memory, complexity)
- **Algorithm Distribution**: Breakdown by AI algorithm used

---

### Update Batch

Update batch metadata (name, description).

```http
PUT /api/batches/:id
```

**Request Body:**

```json
{
  "name": "Updated Batch Name",
  "description": "Updated description"
}
```

**Response (200 OK):**

```json
{
  "message": "Batch updated successfully",
  "batch": {...}
}
```

---

### Delete Batch

Remove a batch from the database.

```http
DELETE /api/batches/:id
```

**Response (200 OK):**

```json
{
  "message": "Batch deleted successfully",
  "batch": {...}
}
```

---

### Add Simulations to Batch

Add existing simulations to a batch.

```http
POST /api/batches/:id/add-simulations
```

**Request Body:**

```json
{
  "simulationIds": [
    "674b9e2f8a3d1f001e5c4a8b",
    "674b9e3f8a3d1f001e5c4a8c"
  ]
}
```

**Response (200 OK):**

```json
{
  "message": "2 simulations added to batch",
  "batch": {...}
}
```

---

### Remove Simulation from Batch

Remove a specific simulation from a batch.

```http
DELETE /api/batches/:id/simulations/:simulationId
```

**Response (200 OK):**

```json
{
  "message": "Simulation removed from batch",
  "batch": {...}
}
```

---

### Clear Batch

Remove all simulations from a batch.

```http
POST /api/batches/:id/clear
```

**Response (200 OK):**

```json
{
  "message": "Batch cleared successfully",
  "batch": {...}
}
```

---

## 🗺️ Maze Management

### Generate Maze

```http
POST /api/mazes
```

**Request Body:**

```json
{
  "name": "Test Maze 20x20",
  "config": {
    "width": 20,
    "height": 20,
    "wallDensity": 0.3,
    "pelletDensity": 0.7
  }
}
```

---

### Get All Mazes

```http
GET /api/mazes?page=1&limit=20
```

---

### Get Maze by ID

```http
GET /api/mazes/:id
```

---

### Update Maze Rating

```http
PUT /api/mazes/:id/rating
```

**Request Body:**

```json
{
  "rating": 4.5
}
```

---

### Delete Maze

```http
DELETE /api/mazes/:id
```

---

## 📍 Trajectory Management

### Save Trajectory

```http
POST /api/trajectories
```

**Request Body:**

```json
{
  "name": "Manual Play - Speed Run",
  "mazeId": "674b9a1f8a3d1f001e5c4a1a",
  "duration": 45.2,
  "score": 2400,
  "frames": [...]
}
```

---

### Get All Trajectories

```http
GET /api/trajectories?page=1&limit=20
```

---

### Get Trajectory by ID

```http
GET /api/trajectories/:id
```

---

### Delete Trajectory

```http
DELETE /api/trajectories/:id
```

---

## 📊 Data Models

### Simulation Model

```javascript
{
  _id: ObjectId,
  name: String,
  trajectoryId: ObjectId (optional),
  mazeId: ObjectId,
  pacmanAlgorithm: Enum[
    'greedy', 'defensive', 'aggressive', 'random',
    'minimax', 'expectimax', 'influence_map', 'mcts'
  ],
  pacmanConfig: {
    depth: Number,        // For minimax/expectimax
    iterations: Number,   // For MCTS
    startPos: { x: Number, y: Number }
  },
  ghostConfigs: [{
    type: Enum['blinky', 'pinky', 'inky', 'clyde'],
    algorithm: Enum['astar', 'bfs'],
    startPosition: { x: Number, y: Number }
  }],
  results: {
    caught: Boolean,
    catchPosition: { x: Number, y: Number },
    catchTime: Number,
    duration: Number,
    score: Number,
    pelletsCollected: Number,
    totalFrames: Number,
    frames: [FrameObject],
    performance: PerformanceObject
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

### Batch Model

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  simulations: [SimulationObject],
  stats: {
    total: Number,
    caught: Number,
    escaped: Number,
    catchRate: Number,
    escapeRate: Number,
    duration: StatisticsObject,
    score: StatisticsObject,
    frames: StatisticsObject,
    performance: PerformanceStatsObject,
    algorithmDistribution: [AlgorithmStatsObject]
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "error": "Missing required fields: name, mazeId, pacmanAlgorithm"
}
```

---

### 404 Not Found

```json
{
  "error": "Simulation not found"
}
```

---

### 500 Internal Server Error

```json
{
  "error": "Failed to run simulation",
  "details": "Detailed error message here"
}
```

---

## 🔧 Example Usage

### Run a Complete Automated Test Suite

```javascript
// 1. Create a batch
const batchResponse = await fetch('/api/batches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Minimax Depth Comparison',
    description: 'Testing Minimax performance at depths 3, 4, and 5'
  })
});
const { batch } = await batchResponse.json();

// 2. Run simulations for each depth
for (let depth = 3; depth <= 5; depth++) {
  for (let i = 0; i < 10; i++) {
    await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Minimax Depth ${depth} - Run ${i + 1}`,
        mazeId: 'your-maze-id',
        pacmanAlgorithm: 'minimax',
        pacmanConfig: { depth },
        ghostConfigs: [
          { type: 'blinky', algorithm: 'astar', startPosition: { x: 10, y: 10 } }
        ],
        results: { /* simulation results */ }
      })
    });
  }
}

// 3. Get aggregate statistics
const statsResponse = await fetch(`/api/batches/${batch._id}`);
const { batch: finalBatch } = await statsResponse.json();
console.log('Batch Statistics:', finalBatch.stats);
```

---

## 📈 Performance Metrics Explained

### Pacman Performance

- **Decision Time (ms)**: Time to compute next move
  - Greedy/Defensive/Aggressive: ~2-5ms
  - Minimax (depth 3): ~10-20ms
  - Expectimax (depth 3): ~15-30ms
  - MCTS (1000 iter): ~50-100ms

- **Memory Usage (KB)**: Peak memory during decision
  - Basic algorithms: ~1-2 MB
  - Minimax/Expectimax: ~2-4 MB
  - Influence Maps: ~3-5 MB
  - MCTS: ~4-8 MB

- **Complexity**: Big-O notation for algorithm
  - O(1): Random
  - O(n): Greedy, Defensive, Aggressive
  - O(w×h): Influence Maps
  - O(b^d): Minimax, Expectimax
  - O(k×d): MCTS

---

## 🎯 Best Practices

1. **Use includeFrames=false** when listing simulations to improve performance
2. **Batch operations** for statistical analysis across multiple runs
3. **Filter by mazeId** to compare algorithms on same maze
4. **Use pagination** for large datasets
5. **Run batches** for reproducible, automated testing

---

## 📞 Support

For questions or issues, refer to:
- [Project README](../README.md)
- [Setup Guide](./SETUP.md)
- [Performance Metrics Guide](./PERFORMANCE_METRICS_GUIDE.md)

---

**Last Updated:** December 18, 2025  
**API Version:** 1.0
