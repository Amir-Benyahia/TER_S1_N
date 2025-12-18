# 🚀 API Quick Start Card

**Copy-paste these commands to get started immediately!**

---

## ⚡ Test Server Status

```bash
curl http://localhost:3000/api/mazes && echo "✅ Server is running!"
```

---

## 🗺️ 1. Create a Maze

```bash
curl -X POST http://localhost:3000/api/mazes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Test Maze",
    "config": {
      "width": 20,
      "height": 20,
      "wallDensity": 0.3,
      "pelletDensity": 0.7
    }
  }' | jq

# Save the maze ID from the response!
# Example: "674b9a1f8a3d1f001e5c4a1a"
```

---

## 🤖 2. Run a Simulation

**Replace `YOUR_MAZE_ID` with the ID from step 1**

```bash
curl -X POST http://localhost:3000/api/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Simulation",
    "mazeId": "YOUR_MAZE_ID",
    "pacmanAlgorithm": "mcts",
    "pacmanConfig": {
      "iterations": 1000
    },
    "ghostConfigs": [
      {
        "type": "blinky",
        "algorithm": "astar",
        "startPosition": { "x": 10, "y": 10 }
      }
    ],
    "results": {
      "caught": false,
      "duration": 42.5,
      "score": 2400,
      "pelletsCollected": 120,
      "totalFrames": 1275,
      "frames": []
    }
  }' | jq

# Save the simulation ID!
```

---

## 📦 3. Run Batch Automation

**The POWER endpoint - test multiple configurations automatically**

```bash
curl -X POST http://localhost:3000/api/batches/run-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batchName": "Algorithm Comparison",
    "mazeId": "YOUR_MAZE_ID",
    "pacmanAlgorithm": "minimax",
    "pacmanConfig": {
      "depth": 4
    },
    "ghostConfigs": [
      {
        "type": "blinky",
        "algorithm": "astar",
        "startPosition": { "x": 10, "y": 10 }
      }
    ],
    "iterations": 10,
    "maxDuration": 60
  }' | jq

# Save the batch ID!
```

---

## 📊 4. View Statistics

```bash
# Replace YOUR_BATCH_ID with ID from step 3
curl http://localhost:3000/api/batches/YOUR_BATCH_ID | jq '{
  name: .batch.name,
  total: .batch.stats.total,
  catchRate: .batch.stats.catchRate,
  avgScore: .batch.stats.score.mean,
  avgDuration: .batch.stats.duration.mean
}'
```

---

## 🎮 Try All 8 Algorithms

```bash
# Set your maze ID here
MAZE_ID="YOUR_MAZE_ID"

# Test each algorithm
for algo in greedy defensive aggressive random minimax expectimax influence_map mcts; do
  echo "Testing $algo..."
  
  curl -s -X POST http://localhost:3000/api/batches/run-batch \
    -H "Content-Type: application/json" \
    -d "{
      \"batchName\": \"Algorithm Test: $algo\",
      \"mazeId\": \"$MAZE_ID\",
      \"pacmanAlgorithm\": \"$algo\",
      \"ghostConfigs\": [{
        \"type\": \"blinky\",
        \"algorithm\": \"astar\",
        \"startPosition\": { \"x\": 10, \"y\": 10 }
      }],
      \"iterations\": 5,
      \"maxDuration\": 60
    }" | jq '.batchId'
done

echo "✅ All algorithms tested!"
```

---

## 🔍 Quick Queries

### List all simulations
```bash
curl http://localhost:3000/api/simulations | jq '.simulations[].name'
```

### List all batches
```bash
curl http://localhost:3000/api/batches | jq '.batches[] | {name, total: .stats.total}'
```

### Get simulation details
```bash
curl http://localhost:3000/api/simulations/YOUR_SIMULATION_ID | jq
```

---

## 📮 Postman Alternative

**Don't like cURL? Import our Postman collection:**

1. Open Postman or Thunder Client
2. Import: `docs/Pacman_API.postman_collection.json`
3. Set baseUrl to `http://localhost:3000/api`
4. Start clicking! 🖱️

---

## 🎯 What Each Algorithm Does

| Algorithm | Speed | Best For |
|-----------|-------|----------|
| `greedy` | ⚡ Fast | Balanced gameplay |
| `defensive` | ⚡ Fast | Playing it safe |
| `aggressive` | ⚡ Fast | High scores |
| `random` | ⚡⚡ Very Fast | Baseline testing |
| `minimax` | ⏱️ Medium | Competitive play |
| `expectimax` | ⏱️ Medium | Uncertain opponents |
| `influence_map` | ⚡ Fast | Tactical positioning |
| `mcts` | 🐌 Slower | Best performance |

---

## 💡 Pro Tips

1. **Use jq** for pretty JSON output: `| jq`
2. **Save IDs** in variables for reuse
3. **Start simple** with greedy or random
4. **Test advanced** with minimax depth=3 first
5. **MCTS is powerful** but slow - use iterations=500-1000 for testing

---

## 📚 Full Documentation

- **[Complete Guide](./API_INDEX.md)** - Start here for everything
- **[All Endpoints](./API_DOCUMENTATION.md)** - Full reference
- **[More Examples](./API_CURL_EXAMPLES.md)** - 50+ examples
- **[Architecture](./API_ARCHITECTURE.md)** - How it works

---

## ❓ Quick Troubleshooting

**Server not responding?**
```bash
cd src/server
npm run dev
```

**Can't find maze ID?**
```bash
curl http://localhost:3000/api/mazes | jq '.mazes[]._id'
```

**Want to see all simulations?**
```bash
curl http://localhost:3000/api/simulations | jq
```

---

## 🎉 You're Ready!

**You now have:**
- ✅ A working maze
- ✅ Your first simulation
- ✅ A batch test suite
- ✅ Statistics and metrics

**Next:** Browse [full documentation](./API_INDEX.md) to explore advanced features!

---

**Happy Testing! 🚀**
