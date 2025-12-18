# Personalized Pacman AI in Simulations

## 🎯 Overview

You can now **personalize Pacman's behavior** in bot simulations! Choose from **8 different AI algorithms** ranging from simple heuristics to state-of-the-art game AI.

## 🤖 Available Pacman Algorithms

| Algorithm | Type | Speed | Intelligence | Best For |
|-----------|------|-------|--------------|----------|
| **greedy** | Heuristic | Fast | Medium | Balanced play |
| **defensive** | Heuristic | Fast | Low | Survival focus |
| **aggressive** | Heuristic | Fast | Medium | High-risk play |
| **random** | Random | Very Fast | None | Baseline comparison |
| **minimax** | Game Tree | Medium | High | Competitive play |
| **expectimax** | Probabilistic | Medium | High | Uncertain opponents |
| **influence_map** | Spatial | Fast | Medium | Tactical awareness |
| **mcts** | Sampling | Slow | Very High | Research/competition |

---

## 📋 Configuration Format

### Basic Configuration

```json
{
  "algorithm": "greedy"
}
```

### Advanced Configuration (for minimax, expectimax, mcts)

```json
{
  "algorithm": "minimax",
  "depth": 4,           // Look-ahead depth (minimax/expectimax)
  "iterations": 2000,   // Number of simulations (mcts)
  "startPos": {
    "x": 1,
    "y": 1
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Create Bot Simulation with Greedy Pacman

```javascript
// API Request
POST /api/simulations

{
  "name": "Bot Simulation - Greedy Pacman",
  "mazeId": "your-maze-id",
  "trajectoryId": "bot-simulation",
  "pacmanAlgorithm": "greedy",
  "pacmanConfig": {
    "depth": 3,
    "iterations": 1000
  },
  "ghostConfigs": [
    {
      "type": "blinky",
      "algorithm": "astar",
      "startPos": { "x": 10, "y": 5 }
    },
    {
      "type": "pinky",
      "algorithm": "bfs",
      "startPos": { "x": 15, "y": 5 }
    }
  ],
  "maxSteps": 1000
}
```

### Example 2: Minimax vs Ghosts

```javascript
{
  "name": "Minimax Pacman (depth=4)",
  "mazeId": "maze-123",
  "trajectoryId": "bot-simulation",
  "pacmanAlgorithm": "minimax",
  "pacmanConfig": {
    "depth": 4,
    "startPos": { "x": 1, "y": 1 }
  },
  "ghostConfigs": [
    { "type": "blinky", "algorithm": "astar", "startPos": { "x": 20, "y": 10 } },
    { "type": "pinky", "algorithm": "astar", "startPos": { "x": 20, "y": 12 } }
  ]
}
```

### Example 3: MCTS (Advanced)

```javascript
{
  "name": "MCTS Pacman - 2000 iterations",
  "mazeId": "maze-123",
  "trajectoryId": "bot-simulation",
  "pacmanAlgorithm": "mcts",
  "pacmanConfig": {
    "iterations": 2000,
    "startPos": { "x": 1, "y": 1 }
  },
  "ghostConfigs": [
    { "type": "blinky", "algorithm": "astar", "startPos": { "x": 20, "y": 10 } }
  ],
  "maxSteps": 500
}
```

---

## 🎮 Frontend Integration

### JavaScript Example

```javascript
// Create bot simulation with personalized Pacman
async function createBotSimulation(mazeId, pacmanAlgorithm) {
  const config = {
    name: `Bot Simulation - ${pacmanAlgorithm}`,
    mazeId: mazeId,
    trajectoryId: 'bot-simulation',
    pacmanAlgorithm: pacmanAlgorithm,
    pacmanConfig: {
      depth: 3,          // For minimax/expectimax
      iterations: 1000,  // For MCTS
      startPos: { x: 1, y: 1 }
    },
    ghostConfigs: [
      {
        type: 'blinky',
        algorithm: 'astar',
        startPos: { x: 20, y: 10 }
      }
    ],
    maxSteps: 1000
  };
  
  const response = await fetch('/api/simulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  
  return await response.json();
}

// Usage
createBotSimulation('maze-123', 'minimax');
```

### UI Dropdown Example

```html
<select id="pacmanAlgorithm">
  <option value="greedy">Greedy (Balanced)</option>
  <option value="defensive">Defensive (Safe)</option>
  <option value="aggressive">Aggressive (Risky)</option>
  <option value="random">Random (Baseline)</option>
  <option value="minimax">Minimax (Optimal)</option>
  <option value="expectimax">Expectimax (Probabilistic)</option>
  <option value="influence_map">Influence Maps (Spatial)</option>
  <option value="mcts">MCTS (State-of-the-art)</option>
</select>

<div id="advancedConfig" style="display:none;">
  <label>Depth (minimax/expectimax): <input type="number" id="depth" value="3"></label>
  <label>Iterations (MCTS): <input type="number" id="iterations" value="1000"></label>
</div>

<script>
  document.getElementById('pacmanAlgorithm').addEventListener('change', (e) => {
    const needsAdvanced = ['minimax', 'expectimax', 'mcts'].includes(e.target.value);
    document.getElementById('advancedConfig').style.display = needsAdvanced ? 'block' : 'none';
  });
</script>
```

---

## 📊 Simulation Database Schema

The `Simulation` model now includes:

```javascript
{
  name: String,
  trajectoryId: Mixed,          // Can be ObjectId or 'bot-simulation'
  mazeId: ObjectId,
  
  // NEW: Pacman AI configuration
  pacmanAlgorithm: {
    type: String,
    enum: ['greedy', 'defensive', 'aggressive', 'random', 
           'minimax', 'expectimax', 'influence_map', 'mcts'],
    default: 'greedy'
  },
  pacmanConfig: {
    depth: Number,              // For minimax/expectimax (default: 3)
    iterations: Number          // For MCTS (default: 1000)
  },
  
  ghostConfigs: [{
    ghostType: String,
    algorithm: String,
    startPosition: {x: Number, y: Number}
  }],
  
  results: {
    caught: Boolean,
    catchPosition: {x: Number, y: Number},
    totalFrames: Number,
    duration: Number,
    score: Number,
    performanceMetrics: {
      pacman: {
        memoryUsage: Number,
        timeComplexity: String,    // e.g., "O(b^d)", "O(n)"
        avgDecisionTime: Number
      },
      ghosts: [...]
    },
    frames: [...]
  }
}
```

---

## 🔬 Performance Metrics

Each algorithm provides detailed performance metrics:

### Pacman Metrics
- **Memory Usage**: Bytes consumed during execution
- **Time Complexity**: Theoretical complexity (O notation)
- **Avg Decision Time**: Milliseconds per decision
- **Nodes Explored**: For tree-based algorithms

### Example Output

```json
{
  "performanceMetrics": {
    "pacman": {
      "memoryUsage": 524288,
      "timeComplexity": "O(b^d)",
      "avgDecisionTime": 45.2
    },
    "ghosts": [...]
  }
}
```

---

## 🎯 Algorithm Recommendations

### For Teaching/Demos
- **Greedy**: Easy to understand, decent performance
- **Influence Maps**: Visual spatial reasoning

### For Competition
- **Minimax** (depth=4): Best if ghosts are predictable
- **MCTS** (iterations=2000): Best overall

### For Research
- **Expectimax**: Realistic probabilistic modeling
- **MCTS**: State-of-the-art baseline

### For Performance Testing
- **Random**: Baseline to measure improvement
- **All algorithms**: Compare across different scenarios

---

## 🧪 Testing

### Command Line Test (Python)

```bash
cd src/algorithms

# Test with Minimax Pacman
python main.py simulate \
  --grid-file ../../data/maze.json \
  --ghost-configs '[{"type":"blinky","algorithm":"astar","startPos":{"x":10,"y":5}}]' \
  --pacman-config '{"algorithm":"minimax","depth":3,"startPos":{"x":1,"y":1}}' \
  --max-steps 1000
```

### API Test (cURL)

```bash
curl -X POST http://localhost:3000/api/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Bot Simulation",
    "mazeId": "your-maze-id",
    "trajectoryId": "bot-simulation",
    "pacmanAlgorithm": "minimax",
    "pacmanConfig": {
      "depth": 3,
      "startPos": {"x": 1, "y": 1}
    },
    "ghostConfigs": [
      {"type": "blinky", "algorithm": "astar", "startPos": {"x": 20, "y": 10}}
    ],
    "maxSteps": 1000
  }'
```

---

## 🚨 Important Notes

1. **Bot Mode vs Replay Mode**
   - If `pacmanAlgorithm` is provided → Bot mode (AI makes decisions)
   - If `trajectoryId` points to real trajectory → Replay mode

2. **Performance Impact**
   - Simple algorithms (greedy, random): <10ms per decision
   - Tree search (minimax, expectimax): 50-100ms per decision
   - MCTS: 200-500ms per decision (depends on iterations)

3. **maxSteps Parameter**
   - Prevents infinite loops in bot mode
   - Default: 1000 steps
   - Adjust based on maze size

4. **Complexity Trade-offs**
   - Higher depth/iterations = smarter but slower
   - Balance based on real-time requirements

---

## 📖 See Also

- [ADVANCED_AI_ALGORITHMS.md](./ADVANCED_AI_ALGORITHMS.md) - Detailed algorithm explanations
- [DECISION_DIAGRAMS.md](./DECISION_DIAGRAMS.md) - Visual decision flows
- [demo_advanced_ai.py](../src/algorithms/demo_advanced_ai.py) - Test all algorithms

---

## 🎉 Summary

You now have full control over Pacman's behavior in simulations:

✅ **8 algorithms** from basic to state-of-the-art  
✅ **Configurable parameters** (depth, iterations)  
✅ **Performance metrics** for scientific analysis  
✅ **Easy API integration** with frontend  
✅ **Compatible with existing system** (replay mode still works)

Choose your algorithm, configure the parameters, and watch Pacman play! 🎮
