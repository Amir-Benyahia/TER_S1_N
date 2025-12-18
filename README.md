# Pacman AI Simulation Platform

**Advanced AI testing environment for Pacman with 8 state-of-the-art algorithms, batch automation, and comprehensive performance metrics.**

---

## 👥 Membres du groupe

- Amir Benyahia
- Ahmed Tamani
- Oussama Belhout

---

## 🚀 Quick Start

```bash
# Install dependencies
cd src/server && npm install

# Start the server
npm run dev

# Open browser
http://localhost:3000
```

---

## 📚 Documentation

### 🔥 API Documentation
- **[Complete API Documentation](./docs/API_DOCUMENTATION.md)** - Full endpoint reference with examples
- **[Quick Reference](./docs/API_QUICK_REFERENCE.md)** - Fast lookup for all endpoints
- **[cURL Examples](./docs/API_CURL_EXAMPLES.md)** - Command-line testing examples
- **[Postman Collection](./docs/Pacman_API.postman_collection.json)** - Import into Postman/Thunder Client

### 🤖 AI & Algorithms
- **[Pacman AI Configuration](./docs/PACMAN_AI_CONFIGURATION.md)** - Algorithm parameters and usage
- **[Advanced AI Algorithms](./docs/ADVANCED_AI_ALGORITHMS.md)** - Minimax, Expectimax, MCTS, Influence Maps
- **[Performance Metrics Guide](./docs/PERFORMANCE_METRICS_GUIDE.md)** - Understanding algorithm performance

### 🛠️ Setup & Deployment
- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Deployment Guide](./docs/RENDER_DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[MongoDB Setup](./docs/MONGODB_SETUP_GUIDE.md)** - Database configuration

---

## 🎮 Features

### 8 Pacman AI Algorithms

**Basic Strategies (Fast):**
- 🟢 **Greedy** - Balanced pellet collection (O(n))
- 🛡️ **Defensive** - Safe, ghost avoidance (O(n))
- ⚡ **Aggressive** - Risky, maximum pellets (O(n))
- 🎲 **Random** - Baseline random movement (O(1))

**Advanced Algorithms (Smarter):**
- 🎯 **Minimax** - Optimal game tree search (O(b^d))
- 🎰 **Expectimax** - Probabilistic decision making (O(b^d))
- 🗺️ **Influence Maps** - Spatial tactical reasoning (O(w×h))
- 🌳 **MCTS** - Monte Carlo Tree Search (O(k×d))

### 🔥 Batch Automation

Run automated test suites with configurable parameters:
- Test multiple algorithms across different mazes
- Compare performance metrics (catch rate, score, duration)
- Aggregate statistics (mean, median, std deviation)
- Export results for analysis

---

## 📊 API Endpoints

### Simulations

```http
POST   /api/simulations          # Run new simulation
GET    /api/simulations          # List all simulations
GET    /api/simulations/:id      # Get simulation details
GET    /api/simulations/:id/replay  # Get replay frames
DELETE /api/simulations/:id      # Delete simulation
```

### Batch Automation

```http
POST   /api/batches/run-batch    # 🔥 Run batch simulations (AUTOMATION)
POST   /api/batches              # Create batch
GET    /api/batches              # List batches
GET    /api/batches/:id          # Get batch with statistics
PUT    /api/batches/:id          # Update batch
DELETE /api/batches/:id          # Delete batch
```

### Mazes & Trajectories

```http
POST   /api/mazes                # Generate maze
GET    /api/mazes                # List mazes
POST   /api/trajectories         # Save trajectory
GET    /api/trajectories         # List trajectories
```

**📖 See [API Documentation](./docs/API_DOCUMENTATION.md) for full details**

---

## 🔧 Example Usage

### Run Automated Test Suite

```javascript
// Run 100 MCTS simulations
const response = await fetch('/api/batches/run-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    batchName: 'MCTS Performance Test',
    mazeId: 'your-maze-id',
    pacmanAlgorithm: 'mcts',
    pacmanConfig: { iterations: 2000 },
    ghostConfigs: [
      { type: 'blinky', algorithm: 'astar', startPosition: { x: 10, y: 10 } }
    ],
    iterations: 100,
    maxDuration: 60
  })
});

const { batchId } = await response.json();

// Get aggregate statistics
const stats = await fetch(`/api/batches/${batchId}`);
```

### Compare Algorithms

```bash
# Test all 8 algorithms on same maze
for algo in greedy defensive aggressive random minimax expectimax influence_map mcts; do
  curl -X POST http://localhost:3000/api/batches/run-batch \
    -d "{ \"pacmanAlgorithm\": \"$algo\", ... }"
done
```

---

## 📈 Performance Metrics

| Algorithm | Decision Time | Memory | Complexity |
|-----------|---------------|---------|------------|
| Random | ~1ms | ~1MB | O(1) |
| Greedy/Defensive/Aggressive | ~2-5ms | ~1-2MB | O(n) |
| Influence Maps | ~8-12ms | ~3-5MB | O(w×h) |
| Minimax (depth 3) | ~10-20ms | ~2-4MB | O(b^d) |
| Expectimax (depth 3) | ~15-30ms | ~2-4MB | O(b^d) |
| MCTS (1000 iter) | ~50-100ms | ~4-8MB | O(k×d) |

---

## 🎯 Project Structure

```
TER_S1_N/
├── docs/                      # 📚 Complete documentation
│   ├── API_DOCUMENTATION.md   # Full API reference
│   ├── API_QUICK_REFERENCE.md # Quick lookup
│   ├── API_CURL_EXAMPLES.md   # cURL examples
│   └── Pacman_API.postman_collection.json
├── src/
│   ├── algorithms/            # 🤖 Python AI implementations
│   │   ├── pacman_ai/        # 8 Pacman algorithms
│   │   ├── ghost_ai/         # Ghost behaviors
│   │   ├── pathfinding/      # A*, BFS
│   │   └── simulation/       # Game engine
│   ├── server/               # 🚀 Node.js/Express API
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Business logic
│   │   └── models/           # MongoDB schemas
│   └── client/               # 🎨 Frontend UI
│       ├── js/               # Application logic
│       └── css/              # Styling
└── tests/                    # ✅ Test suites
```

---

## 🧪 Testing

```bash
# Run Python tests
pytest tests/

# Run server tests
cd src/server && npm test

# Test API endpoints
curl http://localhost:3000/api/simulations
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is part of academic research at UNICA M1.

---

## 📞 Support

- 📖 [Setup Guide](./docs/SETUP.md)
- 🔥 [API Documentation](./docs/API_DOCUMENTATION.md)
- 📊 [Performance Guide](./docs/PERFORMANCE_METRICS_GUIDE.md)
- 🤖 [AI Configuration](./docs/PACMAN_AI_CONFIGURATION.md)

---

**Built with ❤️ by the UNICA M1 TER Team**
