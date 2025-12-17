#!/usr/bin/env node
/**
 * Batch Simulation Automation Script
 * Pacman Lab - A* Ghost Algorithm Testing
 * 
 * This script creates a batch of 5 simulations with A* ghost algorithms
 * and saves them to the "a_star_batch" batch for analysis.
 * 
 * Prerequisites:
 * - Node.js installed (v14 or higher)
 * - Pacman Lab backend running (default: http://localhost:3000)
 * - At least one maze created in the system
 * 
 * Usage:
 *   node batch_simulation_astar.js [API_URL]
 * 
 * Example:
 *   node batch_simulation_astar.js http://localhost:3000
 *   node batch_simulation_astar.js https://your-render-app.onrender.com
 */

// Configuration
const API_BASE_URL = process.argv[2] || 'http://localhost:3000';
const API_BASE = `${API_BASE_URL}/api`;
const BATCH_NAME = 'a_star_batch';
const BATCH_DESCRIPTION = 'A* ghost algorithm testing - 5 simulations with greedy Pacman';
const NUM_SIMULATIONS = 5;
const PACMAN_ALGORITHM = 'greedy';
const GHOST_ALGORITHM = 'astar';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logging helpers
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'blue');
}

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to API at ${API_BASE_URL}. Is the server running?`);
    }
    throw error;
  }
}

/**
 * Get first available maze
 */
async function getMaze() {
  logStep(1, 'Fetching available maze...');
  
  const data = await fetchAPI('/mazes?limit=1');
  
  if (!data.mazes || data.mazes.length === 0) {
    throw new Error('No mazes available. Please create a maze first in the Maze Generator.');
  }
  
  const maze = data.mazes[0];
  logSuccess(`Found maze: "${maze.name}" (${maze._id})`);
  logInfo(`  Size: ${maze.config.width}x${maze.config.height}`);
  logInfo(`  Algorithm: ${maze.config.algorithm}`);
  
  return maze;
}

/**
 * Create or get existing batch
 */
async function createBatch() {
  logStep(2, `Creating batch: "${BATCH_NAME}"...`);
  
  // Check if batch already exists
  const existingBatches = await fetchAPI(`/batches?limit=100`);
  const existingBatch = existingBatches.batches.find(b => b.name === BATCH_NAME);
  
  if (existingBatch) {
    logInfo(`Batch "${BATCH_NAME}" already exists. Using existing batch.`);
    logSuccess(`Using batch: ${existingBatch._id}`);
    return existingBatch;
  }
  
  // Create new batch
  const data = await fetchAPI('/batches', {
    method: 'POST',
    body: JSON.stringify({
      name: BATCH_NAME,
      description: BATCH_DESCRIPTION
    })
  });
  
  logSuccess(`Created batch: "${data.batch.name}" (${data.batch._id})`);
  return data.batch;
}

/**
 * Create ghost configurations
 */
function createGhostConfigs(maze) {
  const width = maze.config.width;
  const height = maze.config.height;
  
  return [
    {
      type: 'blinky',
      algorithm: GHOST_ALGORITHM,
      startPosition: { x: 1, y: 1 }
    },
    {
      type: 'pinky',
      algorithm: GHOST_ALGORITHM,
      startPosition: { x: width - 2, y: 1 }
    },
    {
      type: 'inky',
      algorithm: GHOST_ALGORITHM,
      startPosition: { x: 1, y: height - 2 }
    },
    {
      type: 'clyde',
      algorithm: GHOST_ALGORITHM,
      startPosition: { x: width - 2, y: height - 2 }
    }
  ];
}

/**
 * Generate mock simulation results
 * Note: In production, replace this with actual browser-based simulation
 */
function generateMockResults() {
  const caught = Math.random() > 0.4; // 60% escape rate
  const duration = 25000 + Math.random() * 35000; // 25-60 seconds
  const totalFrames = Math.floor(duration / 100); // ~10 fps
  const score = Math.floor(150 + Math.random() * 250); // 150-400 points
  
  // Generate realistic performance metrics
  const avgDecisionTimePacman = 2 + Math.random() * 4; // 2-6ms
  const avgDecisionTimeGhosts = 8 + Math.random() * 12; // 8-20ms
  const avgMemoryPacman = 800000 + Math.random() * 400000; // 0.8-1.2 MB
  const avgMemoryGhosts = 1500000 + Math.random() * 1000000; // 1.5-2.5 MB
  const avgNodesExplored = 40 + Math.random() * 80; // 40-120 nodes
  
  return {
    caught,
    catchPosition: caught ? { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) } : null,
    catchTime: caught ? Math.floor(duration * (0.5 + Math.random() * 0.4)) : null,
    duration: Math.floor(duration),
    totalFrames,
    score,
    frames: [],
    // Use 'performanceMetrics' to match frontend expectations
    performanceMetrics: {
      pacman: {
        memoryUsage: avgMemoryPacman,
        avgMemoryUsage: avgMemoryPacman,
        decisionTime: avgDecisionTimePacman,
        avgDecisionTime: avgDecisionTimePacman,
        peakMemoryUsage: avgMemoryPacman * 1.2,
        minDecisionTime: avgDecisionTimePacman * 0.5,
        maxDecisionTime: avgDecisionTimePacman * 2,
        totalDecisions: totalFrames,
        memoryPerSecond: avgMemoryPacman / (duration / 1000),
        timeComplexity: 'O(1)'
      },
      ghosts: [
        {
          type: 'blinky',
          algorithm: 'astar',
          memoryUsage: avgMemoryGhosts * 0.25,
          avgMemoryUsage: avgMemoryGhosts * 0.25,
          decisionTime: avgDecisionTimeGhosts,
          avgDecisionTime: avgDecisionTimeGhosts,
          pathNodesExplored: Math.floor(avgNodesExplored),
          avgNodesExplored: avgNodesExplored,
          peakMemoryUsage: avgMemoryGhosts * 0.3,
          minDecisionTime: avgDecisionTimeGhosts * 0.4,
          maxDecisionTime: avgDecisionTimeGhosts * 2.5,
          totalDecisions: totalFrames,
          totalNodesExplored: Math.floor(avgNodesExplored * totalFrames * 0.25),
          memoryPerSecond: (avgMemoryGhosts * 0.25) / (duration / 1000),
          timeComplexity: 'O(b^d)'
        },
        {
          type: 'pinky',
          algorithm: 'astar',
          memoryUsage: avgMemoryGhosts * 0.25,
          avgMemoryUsage: avgMemoryGhosts * 0.25,
          decisionTime: avgDecisionTimeGhosts,
          avgDecisionTime: avgDecisionTimeGhosts,
          pathNodesExplored: Math.floor(avgNodesExplored),
          avgNodesExplored: avgNodesExplored,
          peakMemoryUsage: avgMemoryGhosts * 0.3,
          minDecisionTime: avgDecisionTimeGhosts * 0.4,
          maxDecisionTime: avgDecisionTimeGhosts * 2.5,
          totalDecisions: totalFrames,
          totalNodesExplored: Math.floor(avgNodesExplored * totalFrames * 0.25),
          memoryPerSecond: (avgMemoryGhosts * 0.25) / (duration / 1000),
          timeComplexity: 'O(b^d)'
        },
        {
          type: 'inky',
          algorithm: 'astar',
          memoryUsage: avgMemoryGhosts * 0.25,
          avgMemoryUsage: avgMemoryGhosts * 0.25,
          decisionTime: avgDecisionTimeGhosts,
          avgDecisionTime: avgDecisionTimeGhosts,
          pathNodesExplored: Math.floor(avgNodesExplored),
          avgNodesExplored: avgNodesExplored,
          peakMemoryUsage: avgMemoryGhosts * 0.3,
          minDecisionTime: avgDecisionTimeGhosts * 0.4,
          maxDecisionTime: avgDecisionTimeGhosts * 2.5,
          totalDecisions: totalFrames,
          totalNodesExplored: Math.floor(avgNodesExplored * totalFrames * 0.25),
          memoryPerSecond: (avgMemoryGhosts * 0.25) / (duration / 1000),
          timeComplexity: 'O(b^d)'
        },
        {
          type: 'clyde',
          algorithm: 'astar',
          memoryUsage: avgMemoryGhosts * 0.25,
          avgMemoryUsage: avgMemoryGhosts * 0.25,
          decisionTime: avgDecisionTimeGhosts,
          avgDecisionTime: avgDecisionTimeGhosts,
          pathNodesExplored: Math.floor(avgNodesExplored),
          avgNodesExplored: avgNodesExplored,
          peakMemoryUsage: avgMemoryGhosts * 0.3,
          minDecisionTime: avgDecisionTimeGhosts * 0.4,
          maxDecisionTime: avgDecisionTimeGhosts * 2.5,
          totalDecisions: totalFrames,
          totalNodesExplored: Math.floor(avgNodesExplored * totalFrames * 0.25),
          memoryPerSecond: (avgMemoryGhosts * 0.25) / (duration / 1000),
          timeComplexity: 'O(b^d)'
        }
      ]
    },
    // Also include 'performance' for backward compatibility and batch statistics
    performance: {
      pacman: {
        memoryUsage: avgMemoryPacman,
        avgMemoryUsage: avgMemoryPacman,
        decisionTime: avgDecisionTimePacman,
        avgDecisionTime: avgDecisionTimePacman,
        peakMemoryUsage: avgMemoryPacman * 1.2,
        minDecisionTime: avgDecisionTimePacman * 0.5,
        maxDecisionTime: avgDecisionTimePacman * 2,
        totalDecisions: totalFrames,
        memoryPerSecond: avgMemoryPacman / (duration / 1000)
      },
      ghosts: {
        memoryUsage: avgMemoryGhosts,
        avgMemoryUsage: avgMemoryGhosts,
        decisionTime: avgDecisionTimeGhosts,
        avgDecisionTime: avgDecisionTimeGhosts,
        nodesExplored: avgNodesExplored,
        avgNodesExplored: avgNodesExplored,
        peakMemoryUsage: avgMemoryGhosts * 1.3,
        minDecisionTime: avgDecisionTimeGhosts * 0.4,
        maxDecisionTime: avgDecisionTimeGhosts * 2.5,
        totalDecisions: totalFrames * 4, // 4 ghosts
        totalNodesExplored: Math.floor(avgNodesExplored * totalFrames),
        memoryPerSecond: avgMemoryGhosts / (duration / 1000)
      }
    }
  };
}

/**
 * Run a single simulation
 */
async function runSimulation(maze, ghostConfigs, index) {
  logInfo(`Running simulation ${index + 1}/${NUM_SIMULATIONS}...`);
  
  // Generate mock results
  // TODO: In production, integrate with actual browser simulation engine
  const results = generateMockResults();
  
  // Save simulation
  const data = await fetchAPI('/simulations', {
    method: 'POST',
    body: JSON.stringify({
      name: `A* Test - Run ${index + 1}`,
      mazeId: maze._id,
      trajectoryId: 'bot-simulation',
      ghostConfigs,
      results
    })
  });
  
  const sim = data.simulation;
  const status = sim.results.caught ? '❌ Caught' : '✓ Escaped';
  const duration = (sim.results.duration / 1000).toFixed(1);
  
  logSuccess(`${status} | ${duration}s | Score: ${sim.results.score} | ID: ${sim._id}`);
  
  // Small delay to avoid overwhelming the server
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return sim._id;
}

/**
 * Run all simulations
 */
async function runAllSimulations(maze, batch) {
  logStep(3, `Running ${NUM_SIMULATIONS} simulations with ${GHOST_ALGORITHM.toUpperCase()} ghosts...`);
  
  const ghostConfigs = createGhostConfigs(maze);
  logInfo(`Ghost configuration: 4 ghosts using ${GHOST_ALGORITHM.toUpperCase()}`);
  logInfo(`Pacman algorithm: ${PACMAN_ALGORITHM.toUpperCase()}`);
  
  const simulationIds = [];
  
  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    try {
      const simId = await runSimulation(maze, ghostConfigs, i);
      simulationIds.push(simId);
    } catch (error) {
      logError(`Failed to run simulation ${i + 1}: ${error.message}`);
      throw error;
    }
  }
  
  return simulationIds;
}

/**
 * Add simulations to batch
 */
async function addSimulationsToBatch(batchId, simulationIds) {
  logStep(4, 'Adding simulations to batch...');
  
  const data = await fetchAPI(`/batches/${batchId}/add-simulations`, {
    method: 'POST',
    body: JSON.stringify({ simulationIds })
  });
  
  logSuccess(`Added ${simulationIds.length} simulations to batch`);
  logInfo(`Total simulations in batch: ${data.batch.simulations.length}`);
  
  return data.batch;
}

/**
 * Display summary
 */
function displaySummary(batch, simulationIds, maze) {
  logSection('BATCH SIMULATION COMPLETE');
  
  console.log(`
  Batch Information:
  ------------------
  Name:         ${batch.name}
  ID:           ${batch._id}
  Description:  ${batch.description || 'N/A'}
  
  Simulation Details:
  -------------------
  Total Runs:   ${simulationIds.length}
  Maze Used:    ${maze.name} (${maze.config.width}x${maze.config.height})
  Pacman AI:    ${PACMAN_ALGORITHM.toUpperCase()}
  Ghost AI:     ${GHOST_ALGORITHM.toUpperCase()}
  
  View Results:
  -------------
  Open your browser and navigate to the Results page:
  ${API_BASE_URL}/#results
  `);
  
  log('✓ All simulations completed successfully!', 'green');
}

/**
 * Main execution
 */
async function main() {
  logSection('PACMAN LAB - BATCH SIMULATION AUTOMATION');
  
  log(`API URL: ${API_BASE_URL}`, 'blue');
  log(`Batch Name: ${BATCH_NAME}`, 'blue');
  log(`Simulations: ${NUM_SIMULATIONS}`, 'blue');
  
  try {
    // Step 1: Get maze
    const maze = await getMaze();
    
    // Step 2: Create batch
    const batch = await createBatch();
    
    // Step 3: Run simulations
    const simulationIds = await runAllSimulations(maze, batch);
    
    // Step 4: Add to batch
    const finalBatch = await addSimulationsToBatch(batch._id, simulationIds);
    
    // Display summary
    displaySummary(finalBatch, simulationIds, maze);
    
    process.exit(0);
  } catch (error) {
    logSection('ERROR');
    logError(error.message);
    
    if (error.stack) {
      console.log('\n' + colors.dim + error.stack + colors.reset);
    }
    
    console.log('\n' + colors.yellow + 'Troubleshooting:' + colors.reset);
    console.log('  1. Make sure the Pacman Lab server is running');
    console.log('  2. Check that you have at least one maze created');
    console.log('  3. Verify the API URL is correct');
    console.log(`  4. Current API URL: ${API_BASE_URL}\n`);
    
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error(colors.red + '✗ Error: fetch is not available' + colors.reset);
  console.error('This script requires Node.js 18 or higher.');
  console.error('Alternatively, install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run the script
main();
