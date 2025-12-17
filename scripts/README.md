# Automation Scripts

This folder contains automation scripts for running batch simulations and managing the Pacman Lab platform programmatically.

## Available Scripts

### 1. `batch_simulation_astar.js`

Automated batch simulation script that runs 5 simulations with A* ghost algorithms against a Greedy Pacman AI.

**Features:**
- Creates or uses existing "a_star_batch" batch
- Runs 5 complete simulations with A* ghosts
- Automatically selects first available maze
- Provides colored console output with progress tracking
- Saves all results to database with batch organization

**Usage:**

```bash
# Run against local server (default: http://localhost:3000)
node scripts/batch_simulation_astar.js

# Run against production server
node scripts/batch_simulation_astar.js https://your-app.onrender.com
```

**Requirements:**
- Node.js 18+ (uses native fetch API)
- Pacman Lab server running
- At least one maze created in the system

**Output Example:**
```
============================================================
PACMAN LAB - BATCH SIMULATION AUTOMATION
============================================================
API URL: http://localhost:3000
Batch Name: a_star_batch
Simulations: 5

[1] Fetching available maze...
  ✓ Found maze: "Test Maze 1" (507f1f77bcf86cd799439011)
  ℹ   Size: 21x21
  ℹ   Algorithm: recursive_backtracker

[2] Creating batch: "a_star_batch"...
  ✓ Created batch: "a_star_batch" (507f191e810c19729de860ea)

[3] Running 5 simulations with ASTAR ghosts...
  ℹ Ghost configuration: 4 ghosts using ASTAR
  ℹ Pacman algorithm: GREEDY
  ℹ Running simulation 1/5...
  ✓ ✓ Escaped | 38.5s | Score: 285 | ID: 507f1f77bcf86cd799439012
  ...

[4] Adding simulations to batch...
  ✓ Added 5 simulations to batch
  ℹ Total simulations in batch: 5

============================================================
BATCH SIMULATION COMPLETE
============================================================

  Batch Information:
  ------------------
  Name:         a_star_batch
  ID:           507f191e810c19729de860ea
  
  Simulation Details:
  -------------------
  Total Runs:   5
  Maze Used:    Test Maze 1 (21x21)
  Pacman AI:    GREEDY
  Ghost AI:     ASTAR
  
  View Results:
  -------------
  Open your browser and navigate to the Results page:
  http://localhost:3000/#results

✓ All simulations completed successfully!
```

## Creating Custom Scripts

You can create your own automation scripts based on the provided template. Here's a basic structure:

```javascript
const API_BASE = 'http://localhost:3000/api';

async function runCustomBatch() {
  // 1. Get mazes
  const mazesRes = await fetch(`${API_BASE}/mazes?limit=10`);
  const { mazes } = await mazesRes.json();
  
  // 2. Create batch
  const batchRes = await fetch(`${API_BASE}/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'my_custom_batch',
      description: 'Custom batch description'
    })
  });
  const { batch } = await batchRes.json();
  
  // 3. Run simulations
  const simulationIds = [];
  for (let i = 0; i < 10; i++) {
    const simRes = await fetch(`${API_BASE}/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Custom Sim ${i + 1}`,
        mazeId: mazes[0]._id,
        trajectoryId: 'bot-simulation',
        ghostConfigs: [
          { type: 'blinky', algorithm: 'astar', startPosition: { x: 1, y: 1 } }
        ],
        results: {
          caught: false,
          duration: 30000,
          score: 250,
          totalFrames: 300
        }
      })
    });
    const { simulation } = await simRes.json();
    simulationIds.push(simulation._id);
  }
  
  // 4. Add to batch
  await fetch(`${API_BASE}/batches/${batch._id}/add-simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulationIds })
  });
  
  console.log('✓ Batch complete!');
}

runCustomBatch();
```

## API Endpoints Reference

See the **API Docs** page in the web interface for complete endpoint documentation.

Quick reference:
- `GET /api/mazes` - List all mazes
- `POST /api/batches` - Create a batch
- `GET /api/batches/:id` - Get batch details
- `POST /api/simulations` - Save simulation results
- `POST /api/batches/:id/add-simulations` - Add simulations to batch

## Tips for Automation

1. **Batch Organization**: Always create batches with descriptive names like `algorithm_comparison_2024` or `maze_difficulty_study`

2. **Mock vs Real Simulations**: The provided script uses mock data. For real simulations, you'll need to integrate with the browser-based simulation engine.

3. **Error Handling**: Always wrap API calls in try-catch blocks and handle connection errors gracefully.

4. **Rate Limiting**: Add small delays between simulations to avoid overwhelming the server.

5. **Results Analysis**: Use the Results page to view batch statistics and compare algorithm performance visually.

## Troubleshooting

**Error: Cannot connect to API**
- Make sure the Pacman Lab server is running
- Check the API URL is correct
- Verify no firewall is blocking the connection

**Error: No mazes available**
- Create at least one maze using the Maze Generator
- Check MongoDB is connected

**Error: fetch is not available**
- Upgrade to Node.js 18 or higher
- Or install node-fetch: `npm install node-fetch`

## Contributing

Feel free to create additional automation scripts for:
- Algorithm comparison studies
- Performance benchmarking
- Maze difficulty analysis
- Ghost behavior studies
- A/B testing different configurations

Place new scripts in this folder and update this README with documentation.
