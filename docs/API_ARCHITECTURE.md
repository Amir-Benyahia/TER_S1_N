# 🏗️ API Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Web UI     │  │  Postman     │  │   cURL/Scripts      │   │
│  │  (Browser)   │  │  (Testing)   │  │   (Automation)      │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/JSON
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Express)                       │
│                    http://localhost:3000/api                     │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  /simulations    │ │    /batches      │ │     /mazes       │
│                  │ │                  │ │                  │
│ POST /           │ │ POST /           │ │ POST /           │
│ GET  /           │ │ GET  /           │ │ GET  /           │
│ GET  /:id        │ │ GET  /:id        │ │ GET  /:id        │
│ GET  /:id/replay │ │ PUT  /:id        │ │ PUT  /:id/rating │
│ DELETE /:id      │ │ DELETE /:id      │ │ DELETE /:id      │
│                  │ │                  │ │                  │
│                  │ │ POST /run-batch  │ │                  │
│                  │ │ ⚡ AUTOMATION    │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │   Simulation   │  │     Batch      │  │      Maze       │   │
│  │   Controller   │  │   Controller   │  │   Controller    │   │
│  └────────────────┘  └────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Python Bridge Layer                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  pythonBridge.js - Spawns Python processes               │   │
│  │  • Executes AI algorithms                                │   │
│  │  • Runs simulations                                      │   │
│  │  • Collects performance metrics                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ spawn()
┌─────────────────────────────────────────────────────────────────┐
│                      Python AI Engine                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  src/algorithms/                                           │ │
│  │  ├── pacman_ai/                                            │ │
│  │  │   ├── greedy.py         (Basic)                        │ │
│  │  │   ├── defensive.py      (Basic)                        │ │
│  │  │   ├── aggressive.py     (Basic)                        │ │
│  │  │   ├── random_walker.py  (Baseline)                     │ │
│  │  │   ├── minimax.py        (Advanced - Game Tree)         │ │
│  │  │   ├── expectimax.py     (Advanced - Probabilistic)     │ │
│  │  │   ├── influence_map.py  (Advanced - Spatial)           │ │
│  │  │   └── mcts.py           (Advanced - MCTS)              │ │
│  │  ├── ghost_ai/                                             │ │
│  │  │   ├── blinky.py         (Aggressive chaser)            │ │
│  │  │   ├── pinky.py          (Ambush)                       │ │
│  │  │   ├── inky.py           (Patrol)                       │ │
│  │  │   └── clyde.py          (Random)                       │ │
│  │  ├── pathfinding/                                          │ │
│  │  │   ├── astar.py          (A* algorithm)                 │ │
│  │  │   └── bfs.py            (Breadth-first search)         │ │
│  │  └── simulation/                                           │ │
│  │      └── game_engine.py    (Core simulation logic)        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Results
┌─────────────────────────────────────────────────────────────────┐
│                      Data Persistence Layer                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MongoDB Database                                          │ │
│  │  ├── simulations (Simulation results with performance)    │ │
│  │  ├── batches     (Batch groups with statistics)           │ │
│  │  ├── mazes       (Generated maze configurations)          │ │
│  │  └── trajectories (Recorded player movements)             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Example

### Running a Batch Simulation

```
1. CLIENT
   POST /api/batches/run-batch
   {
     "batchName": "MCTS Test",
     "mazeId": "...",
     "pacmanAlgorithm": "mcts",
     "pacmanConfig": { "iterations": 2000 },
     "ghostConfigs": [...],
     "iterations": 100
   }

2. API GATEWAY
   ├─> Route: /api/batches/run-batch
   └─> Controller: batchController.runBatchSimulations()

3. BUSINESS LOGIC
   ├─> Validate request parameters
   ├─> Check maze exists in MongoDB
   ├─> Create/get batch in MongoDB
   └─> Return batch configuration

4. CLIENT EXECUTION
   ├─> Receive batch ID and config
   ├─> Run simulations in browser/UI
   └─> POST each result to /api/simulations

5. PYTHON ENGINE (per simulation)
   ├─> Spawn Python process
   ├─> Load MCTS algorithm
   ├─> Run game engine simulation
   ├─> Collect performance metrics
   └─> Return results to Node.js

6. DATA PERSISTENCE
   ├─> Save simulation to MongoDB
   ├─> Link simulation to batch
   ├─> Update batch statistics
   └─> Calculate aggregates

7. CLIENT RETRIEVAL
   GET /api/batches/:id
   ├─> Fetch batch with all simulations
   ├─> Get aggregate statistics
   │   ├─ Catch rate: 30%
   │   ├─ Avg duration: 42.5s
   │   ├─ Avg score: 2150
   │   └─ Performance metrics
   └─> Display results
```

---

## Data Flow

```
┌──────────────┐
│  Maze Data   │ ─────┐
└──────────────┘      │
                      ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
│   Pacman AI  │──>│  Game Engine     │──>│  Simulation  │
│  (8 algos)   │   │  (Python)        │   │   Results    │
└──────────────┘   └──────────────────┘   └──────────────┘
                      ▲                          │
┌──────────────┐      │                          │
│   Ghost AI   │ ─────┘                          ▼
│  (4 types)   │                        ┌──────────────────┐
└──────────────┘                        │  MongoDB         │
                                        │  • Simulations   │
                                        │  • Batches       │
                                        │  • Statistics    │
                                        └──────────────────┘
```

---

## Component Interactions

### Simulation Endpoint

```
POST /api/simulations
    │
    ├─> simulationController.runSimulation()
    │   │
    │   ├─> Validate: name, mazeId, pacmanAlgorithm, ghostConfigs
    │   │
    │   ├─> Check MongoDB connection
    │   │   ├─ Connected: Use MongoDB
    │   │   └─ Disconnected: Use demo mode (in-memory)
    │   │
    │   ├─> Create Simulation document
    │   │   ├─ pacmanAlgorithm: "mcts"
    │   │   ├─ pacmanConfig: { iterations: 2000 }
    │   │   ├─ ghostConfigs: [...]
    │   │   └─ results: { frames, performance, ... }
    │   │
    │   └─> Return: 201 Created + simulation object
    │
    └─> Response to client
```

### Batch Automation Endpoint

```
POST /api/batches/run-batch
    │
    ├─> batchController.runBatchSimulations()
    │   │
    │   ├─> Validate: batchName, mazeId, pacmanAlgorithm, ghostConfigs
    │   │
    │   ├─> Verify maze exists (MongoDB)
    │   │
    │   ├─> Create/Get batch
    │   │   ├─ Find existing batch by name
    │   │   └─ Create new if not found
    │   │
    │   └─> Return: 202 Accepted
    │       ├─ batchId
    │       ├─ batchName
    │       ├─ iterations count
    │       └─ instructions for client
    │
    └─> Client runs simulations and POSTs results
```

---

## Performance Optimization

### 1. Pagination
```javascript
GET /api/simulations?page=1&limit=20
// Only fetches 20 items at a time
```

### 2. Selective Data Loading
```javascript
GET /api/simulations/:id?includeFrames=false
// Excludes heavy frame data (can be 100KB+ per simulation)
```

### 3. Replay Optimization
```javascript
GET /api/simulations/:id/replay
// Returns only frame data, not full simulation object
```

### 4. Aggregate Statistics
```javascript
GET /api/batches/:id
// Pre-calculated statistics stored in batch document
// Avoids recalculating on every request
```

---

## Security Considerations

1. **Input Validation**: All inputs validated in controllers
2. **MongoDB Injection**: Using Mongoose ODM prevents injection
3. **Rate Limiting**: Can be added via express-rate-limit
4. **CORS**: Configured in server index.js
5. **Error Handling**: Centralized error middleware

---

## Scalability

### Horizontal Scaling
```
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Node.js │   │  Node.js │   │  Node.js │
│ Instance │   │ Instance │   │ Instance │
│    #1    │   │    #2    │   │    #3    │
└──────────┘   └──────────┘   └──────────┘
     │              │              │
     └──────────────┼──────────────┘
                    ▼
          ┌──────────────────┐
          │   Load Balancer  │
          └──────────────────┘
                    ▼
          ┌──────────────────┐
          │    MongoDB       │
          │   (Shared DB)    │
          └──────────────────┘
```

### Vertical Scaling
- Increase Python process pool
- Use MongoDB indexes for faster queries
- Cache frequently accessed data (Redis)
- Implement background job processing (Bull/Queue)

---

## Monitoring & Analytics

### Endpoints to Monitor

1. **Response Times**
   - `/api/simulations` - Should be < 200ms
   - `/api/batches/:id` - Can be up to 1s with many simulations

2. **Error Rates**
   - 4xx errors: Client issues (validation)
   - 5xx errors: Server issues (bugs, DB down)

3. **Resource Usage**
   - Memory: Python processes can use 10-50MB each
   - CPU: MCTS and Minimax are CPU-intensive
   - Database: Monitor MongoDB connection pool

---

## Testing Strategy

```
┌──────────────────────────────────────────┐
│  Unit Tests                              │
│  • Controller logic                      │
│  • Validation functions                  │
│  • Data transformations                  │
└──────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────┐
│  Integration Tests                       │
│  • API endpoints                         │
│  • Database operations                   │
│  • Python bridge communication           │
└──────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────┐
│  E2E Tests                               │
│  • Complete workflows                    │
│  • Batch automation                      │
│  • Performance benchmarks                │
└──────────────────────────────────────────┘
```

---

**See also:**
- [API Documentation](./API_DOCUMENTATION.md) - Complete endpoint reference
- [Quick Reference](./API_QUICK_REFERENCE.md) - Fast lookup table
- [cURL Examples](./API_CURL_EXAMPLES.md) - Command-line testing
