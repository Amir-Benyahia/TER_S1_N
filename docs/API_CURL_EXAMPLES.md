# 🌐 API Testing with cURL

Quick command-line examples for testing the Pacman AI Simulation API.

---

## 🚀 Setup

```bash
# Set base URL as environment variable (optional)
export BASE_URL="http://localhost:3000/api"

# Or use directly in commands
BASE_URL="http://localhost:3000/api"
```

---

## 🎮 Simulations

### Run New Simulation

```bash
curl -X POST "$BASE_URL/simulations" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minimax vs Blinky Test",
    "mazeId": "YOUR_MAZE_ID",
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
      }
    ],
    "results": {
      "caught": false,
      "duration": 45.2,
      "score": 2400,
      "pelletsCollected": 120,
      "totalFrames": 1356,
      "frames": []
    }
  }'
```

### Get All Simulations

```bash
# Basic list
curl "$BASE_URL/simulations?page=1&limit=20"

# Filter by maze
curl "$BASE_URL/simulations?mazeId=YOUR_MAZE_ID&page=1&limit=20"

# Pretty print with jq
curl "$BASE_URL/simulations" | jq
```

### Get Simulation by ID

```bash
# Without frames (lighter)
curl "$BASE_URL/simulations/YOUR_SIMULATION_ID?includeFrames=false"

# With frames (for replay)
curl "$BASE_URL/simulations/YOUR_SIMULATION_ID?includeFrames=true"
```

### Get Replay Frames Only

```bash
curl "$BASE_URL/simulations/YOUR_SIMULATION_ID/replay" | jq '.frames'
```

### Delete Simulation

```bash
curl -X DELETE "$BASE_URL/simulations/YOUR_SIMULATION_ID"
```

---

## 📦 Batches

### Create Batch

```bash
curl -X POST "$BASE_URL/batches" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minimax Performance Test Suite",
    "description": "Testing Minimax with depth 3-5 across 10 mazes"
  }'
```

### 🔥 Run Batch Simulations (AUTOMATION)

```bash
# MCTS Batch Test
curl -X POST "$BASE_URL/batches/run-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "batchName": "MCTS vs A* Ghosts - 100 Iterations",
    "mazeId": "YOUR_MAZE_ID",
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
  }'

# Save batch ID from response for later use
```

### Get All Batches

```bash
curl "$BASE_URL/batches?page=1&limit=20" | jq
```

### Get Batch with Statistics

```bash
# Get full batch info with aggregate stats
curl "$BASE_URL/batches/YOUR_BATCH_ID" | jq

# Extract just the statistics
curl "$BASE_URL/batches/YOUR_BATCH_ID" | jq '.batch.stats'

# Get catch rate
curl "$BASE_URL/batches/YOUR_BATCH_ID" | jq '.batch.stats.catchRate'

# Get average duration
curl "$BASE_URL/batches/YOUR_BATCH_ID" | jq '.batch.stats.duration.mean'
```

### Update Batch

```bash
curl -X PUT "$BASE_URL/batches/YOUR_BATCH_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Batch Name",
    "description": "Updated description"
  }'
```

### Delete Batch

```bash
curl -X DELETE "$BASE_URL/batches/YOUR_BATCH_ID"
```

### Add Simulations to Batch

```bash
curl -X POST "$BASE_URL/batches/YOUR_BATCH_ID/add-simulations" \
  -H "Content-Type: application/json" \
  -d '{
    "simulationIds": [
      "SIMULATION_ID_1",
      "SIMULATION_ID_2"
    ]
  }'
```

### Clear Batch

```bash
curl -X POST "$BASE_URL/batches/YOUR_BATCH_ID/clear"
```

---

## 🗺️ Mazes

### Generate Maze

```bash
curl -X POST "$BASE_URL/mazes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Maze 20x20",
    "config": {
      "width": 20,
      "height": 20,
      "wallDensity": 0.3,
      "pelletDensity": 0.7
    }
  }'

# Save maze ID from response for use in simulations
```

### Get All Mazes

```bash
curl "$BASE_URL/mazes?page=1&limit=20" | jq

# Get just maze IDs
curl "$BASE_URL/mazes" | jq '.mazes[].id'
```

### Get Maze by ID

```bash
curl "$BASE_URL/mazes/YOUR_MAZE_ID" | jq
```

### Delete Maze

```bash
curl -X DELETE "$BASE_URL/mazes/YOUR_MAZE_ID"
```

---

## 🎯 Example Workflows

### Complete Workflow: Test All 8 Algorithms

```bash
#!/bin/bash

# 1. Create a maze
MAZE_RESPONSE=$(curl -s -X POST "$BASE_URL/mazes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Algorithm Test Maze",
    "config": {
      "width": 20,
      "height": 20,
      "wallDensity": 0.3,
      "pelletDensity": 0.7
    }
  }')

MAZE_ID=$(echo $MAZE_RESPONSE | jq -r '.maze._id')
echo "Created maze: $MAZE_ID"

# 2. Create a batch
BATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/batches" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Algorithm Comparison Suite",
    "description": "Testing all 8 Pacman algorithms"
  }')

BATCH_ID=$(echo $BATCH_RESPONSE | jq -r '.batch._id')
echo "Created batch: $BATCH_ID"

# 3. Test each algorithm
ALGORITHMS=("greedy" "defensive" "aggressive" "random" "minimax" "expectimax" "influence_map" "mcts")

for algo in "${ALGORITHMS[@]}"; do
  echo "Testing $algo..."
  
  # Configure advanced params if needed
  if [ "$algo" == "minimax" ] || [ "$algo" == "expectimax" ]; then
    CONFIG='{"depth": 3}'
  elif [ "$algo" == "mcts" ]; then
    CONFIG='{"iterations": 1000}'
  else
    CONFIG='{}'
  fi
  
  curl -s -X POST "$BASE_URL/batches/run-batch" \
    -H "Content-Type: application/json" \
    -d "{
      \"batchName\": \"Algorithm Comparison Suite\",
      \"mazeId\": \"$MAZE_ID\",
      \"pacmanAlgorithm\": \"$algo\",
      \"pacmanConfig\": $CONFIG,
      \"ghostConfigs\": [
        {
          \"type\": \"blinky\",
          \"algorithm\": \"astar\",
          \"startPosition\": { \"x\": 10, \"y\": 10 }
        }
      ],
      \"iterations\": 5,
      \"maxDuration\": 60
    }" > /dev/null
    
  echo "  $algo configured ✓"
done

echo ""
echo "All algorithms configured!"
echo "Batch ID: $BATCH_ID"
echo "View results: curl $BASE_URL/batches/$BATCH_ID | jq"
```

### Minimax Depth Comparison

```bash
#!/bin/bash

MAZE_ID="YOUR_MAZE_ID"
BATCH_NAME="Minimax Depth Comparison"

for depth in 3 4 5; do
  echo "Testing Minimax with depth $depth..."
  
  curl -s -X POST "$BASE_URL/batches/run-batch" \
    -H "Content-Type: application/json" \
    -d "{
      \"batchName\": \"$BATCH_NAME\",
      \"mazeId\": \"$MAZE_ID\",
      \"pacmanAlgorithm\": \"minimax\",
      \"pacmanConfig\": {
        \"depth\": $depth
      },
      \"ghostConfigs\": [
        {
          \"type\": \"blinky\",
          \"algorithm\": \"astar\",
          \"startPosition\": { \"x\": 10, \"y\": 10 }
        }
      ],
      \"iterations\": 10,
      \"maxDuration\": 60
    }" | jq -r '.batchId'
done

echo "Depth comparison complete!"
```

### MCTS Iterations Test

```bash
#!/bin/bash

MAZE_ID="YOUR_MAZE_ID"
BATCH_NAME="MCTS Iterations Comparison"

for iter in 500 1000 2000 5000; do
  echo "Testing MCTS with $iter iterations..."
  
  curl -s -X POST "$BASE_URL/batches/run-batch" \
    -H "Content-Type: application/json" \
    -d "{
      \"batchName\": \"$BATCH_NAME\",
      \"mazeId\": \"$MAZE_ID\",
      \"pacmanAlgorithm\": \"mcts\",
      \"pacmanConfig\": {
        \"iterations\": $iter
      },
      \"ghostConfigs\": [
        {
          \"type\": \"blinky\",
          \"algorithm\": \"astar\",
          \"startPosition\": { \"x\": 10, \"y\": 10 }
        }
      ],
      \"iterations\": 5,
      \"maxDuration\": 60
    }" | jq -r '.batchId'
done

echo "MCTS iterations test complete!"
```

---

## 📊 Extract Statistics

### Get Batch Performance Summary

```bash
curl -s "$BASE_URL/batches/YOUR_BATCH_ID" | jq '{
  name: .batch.name,
  total_simulations: .batch.stats.total,
  catch_rate: .batch.stats.catchRate,
  escape_rate: .batch.stats.escapeRate,
  avg_duration: .batch.stats.duration.mean,
  avg_score: .batch.stats.score.mean,
  avg_frames: .batch.stats.frames.mean,
  pacman_decision_time: .batch.stats.performance.pacman.avgDecisionTime,
  ghost_decision_time: .batch.stats.performance.ghosts.avgDecisionTime
}'
```

### Compare Algorithm Performance

```bash
#!/bin/bash

# Get all batches and extract stats for each algorithm
curl -s "$BASE_URL/batches" | jq -r '
  .batches[] | 
  select(.stats != null) | 
  "\(.name): Catch Rate=\(.stats.catchRate)%, Avg Score=\(.stats.score.mean), Avg Time=\(.stats.duration.mean)s"
'
```

---

## 🔍 Debugging

### Check Server Status

```bash
curl -s "$BASE_URL/mazes?limit=1" && echo "✓ Server is running"
```

### Test with Verbose Output

```bash
curl -v -X POST "$BASE_URL/simulations" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Save Response to File

```bash
curl "$BASE_URL/simulations/YOUR_ID" > simulation.json
cat simulation.json | jq
```

---

## 💡 Pro Tips

1. **Use jq for pretty output**: `| jq` at the end of any curl command
2. **Save IDs**: Capture maze/batch/simulation IDs for reuse
3. **Silent mode**: Use `-s` flag to hide progress meter
4. **Environment variables**: Store BASE_URL, MAZE_ID, etc.
5. **Shell scripts**: Automate multi-step workflows

---

**See also:**
- [Full API Documentation](./API_DOCUMENTATION.md)
- [Quick Reference](./API_QUICK_REFERENCE.md)
- [Postman Collection](./Pacman_API.postman_collection.json)
