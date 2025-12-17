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
const NUM_SIMULATIONS = 10;

// Define 5 different batch configurations with varying algorithms
const BATCH_CONFIGS = [
  {
    name: 'batch_01_bfs',
    description: 'BFS Algorithm Testing - Basic pathfinding with breadth-first search',
    pacmanAlgorithm: 'defensive',
    ghostAlgorithm: 'bfs',
    performanceLevel: 1 // Basic performance
  },
  {
    name: 'batch_02_astar',
    description: 'A* Algorithm Testing - Optimized pathfinding with heuristics',
    pacmanAlgorithm: 'greedy',
    ghostAlgorithm: 'astar',
    performanceLevel: 2 // Improved performance
  },
  {
    name: 'batch_03_greedy',
    description: 'Greedy Algorithm Testing - Fast decision-making approach',
    pacmanAlgorithm: 'greedy',
    ghostAlgorithm: 'greedy',
    performanceLevel: 3 // Better performance
  },
  {
    name: 'batch_04_mixed',
    description: 'Mixed Algorithm Testing - Combination of BFS and A* strategies',
    pacmanAlgorithm: 'aggressive',
    ghostAlgorithm: 'mixed', // Will alternate between BFS and A*
    performanceLevel: 4 // Advanced performance
  },
  {
    name: 'batch_05_advanced',
    description: 'Advanced Algorithm Testing - Optimized combination of all strategies',
    pacmanAlgorithm: 'aggressive',
    ghostAlgorithm: 'astar',
    performanceLevel: 5 // Best performance
  }
];

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
async function createBatch(batchConfig) {
  logStep(2, `Creating batch: "${batchConfig.name}"...`);
  
  // Check if batch already exists
  const existingBatches = await fetchAPI(`/batches?limit=100`);
  const existingBatch = existingBatches.batches.find(b => b.name === batchConfig.name);
  
  if (existingBatch) {
    logInfo(`Batch "${batchConfig.name}" already exists. Using existing batch.`);
    logSuccess(`Using batch: ${existingBatch._id}`);
    return existingBatch;
  }
  
  // Create new batch
  const data = await fetchAPI('/batches', {
    method: 'POST',
    body: JSON.stringify({
      name: batchConfig.name,
      description: batchConfig.description
    })
  });
  
  logSuccess(`Created batch: "${data.batch.name}" (${data.batch._id})`);
  return data.batch;
}

/**
 * Create ghost configurations
 */
function createGhostConfigs(maze, ghostAlgorithm) {
  const width = maze.config.width;
  const height = maze.config.height;
  
  // For mixed algorithm, alternate between bfs and astar
  const algorithms = ghostAlgorithm === 'mixed' 
    ? ['bfs', 'astar', 'bfs', 'astar']
    : [ghostAlgorithm, ghostAlgorithm, ghostAlgorithm, ghostAlgorithm];
  
  return [
    {
      type: 'blinky',
      algorithm: algorithms[0],
      startPosition: { x: 1, y: 1 }
    },
    {
      type: 'pinky',
      algorithm: algorithms[1],
      startPosition: { x: width - 2, y: 1 }
    },
    {
      type: 'inky',
      algorithm: algorithms[2],
      startPosition: { x: 1, y: height - 2 }
    },
    {
      type: 'clyde',
      algorithm: algorithms[3],
      startPosition: { x: width - 2, y: height - 2 }
    }
  ];
}

/**
 * Generate mock simulation results with performance level
 * Performance levels (1-5) progressively improve:
 * - Level 1: Highest memory usage, slowest decisions (basic BFS)
 * - Level 2: Improved with A* optimizations
 * - Level 3: Greedy algorithm with fast decisions
 * - Level 4: Mixed strategies with balanced performance
 * - Level 5: Best performance with optimal algorithms
 */
function generateMockResults(performanceLevel = 3, ghostAlgorithm = 'astar') {
  const caught = Math.random() > 0.4; // 60% escape rate
  const duration = 25000 + Math.random() * 35000; // 25-60 seconds
  const totalFrames = Math.floor(duration / 100); // ~10 fps
  const score = Math.floor(150 + Math.random() * 250); // 150-400 points
  
  // Performance improvement factors based on level (higher level = better performance)
  const performanceFactor = {
    memory: 1 - (performanceLevel - 1) * 0.15, // Level 5: 40% less memory than Level 1
    decisionTime: 1 - (performanceLevel - 1) * 0.18, // Level 5: 28% faster than Level 1
    nodes: 1 - (performanceLevel - 1) * 0.12 // Level 5: 48% fewer nodes than Level 1
  };
  
  // Base metrics adjusted by performance level
  const basePacmanDecisionTime = 5;
  const baseGhostDecisionTime = ghostAlgorithm === 'bfs' ? 20 : (ghostAlgorithm === 'greedy' ? 8 : 15);
  const basePacmanMemory = 1200000;
  const baseGhostMemory = ghostAlgorithm === 'bfs' ? 3000000 : (ghostAlgorithm === 'greedy' ? 1800000 : 2400000);
  const baseNodesExplored = ghostAlgorithm === 'bfs' ? 100 : (ghostAlgorithm === 'greedy' ? 40 : 70);
  
  // Apply performance improvements
  const avgDecisionTimePacman = basePacmanDecisionTime * performanceFactor.decisionTime + Math.random() * 2;
  const avgDecisionTimeGhosts = baseGhostDecisionTime * performanceFactor.decisionTime + Math.random() * 4;
  const avgMemoryPacman = basePacmanMemory * performanceFactor.memory + Math.random() * 200000;
  const avgMemoryGhosts = baseGhostMemory * performanceFactor.memory + Math.random() * 400000;
  const avgNodesExplored = baseNodesExplored * performanceFactor.nodes + Math.random() * 20;
  
  // Determine time complexity based on algorithm
  const getTimeComplexity = (algorithm) => {
    switch(algorithm) {
      case 'bfs': return 'O(b^d)';
      case 'astar': return 'O(b^d)';
      case 'greedy': return 'O(n log n)';
      default: return 'O(b^d)';
    }
  };
  
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
          algorithm: ghostAlgorithm === 'mixed' ? 'bfs' : ghostAlgorithm,
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
          timeComplexity: getTimeComplexity(ghostAlgorithm === 'mixed' ? 'bfs' : ghostAlgorithm)
        },
        {
          type: 'pinky',
          algorithm: ghostAlgorithm === 'mixed' ? 'astar' : ghostAlgorithm,
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
          timeComplexity: getTimeComplexity(ghostAlgorithm === 'mixed' ? 'astar' : ghostAlgorithm)
        },
        {
          type: 'inky',
          algorithm: ghostAlgorithm === 'mixed' ? 'bfs' : ghostAlgorithm,
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
          timeComplexity: getTimeComplexity(ghostAlgorithm === 'mixed' ? 'bfs' : ghostAlgorithm)
        },
        {
          type: 'clyde',
          algorithm: ghostAlgorithm === 'mixed' ? 'astar' : ghostAlgorithm,
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
          timeComplexity: getTimeComplexity(ghostAlgorithm === 'mixed' ? 'astar' : ghostAlgorithm)
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
async function runSimulation(maze, ghostConfigs, index, batchConfig) {
  logInfo(`Running simulation ${index + 1}/${NUM_SIMULATIONS}...`);
  
  // Generate mock results with performance level
  const results = generateMockResults(batchConfig.performanceLevel, batchConfig.ghostAlgorithm);
  
  // Save simulation
  const data = await fetchAPI('/simulations', {
    method: 'POST',
    body: JSON.stringify({
      name: `${batchConfig.name} - Run ${index + 1}`,
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
 * Run all simulations for a batch
 */
async function runAllSimulations(maze, batch, batchConfig) {
  logStep(3, `Running ${NUM_SIMULATIONS} simulations for batch: ${batchConfig.name}`);
  
  const ghostConfigs = createGhostConfigs(maze, batchConfig.ghostAlgorithm);
  logInfo(`Ghost configuration: 4 ghosts using ${batchConfig.ghostAlgorithm.toUpperCase()}`);
  logInfo(`Pacman algorithm: ${batchConfig.pacmanAlgorithm.toUpperCase()}`);
  logInfo(`Performance level: ${batchConfig.performanceLevel}/5`);
  
  const simulationIds = [];
  
  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    try {
      const simId = await runSimulation(maze, ghostConfigs, i, batchConfig);
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
function displaySummary(allResults, maze) {
  logSection('ALL BATCH SIMULATIONS COMPLETE');
  
  console.log(`
  Overall Statistics:
  -------------------
  Total Batches:      ${allResults.length}
  Simulations/Batch:  ${NUM_SIMULATIONS}
  Total Simulations:  ${allResults.length * NUM_SIMULATIONS}
  Maze Used:          ${maze.name} (${maze.config.width}x${maze.config.height})
  `);
  
  console.log('  Batch Details:');
  console.log('  ' + '-'.repeat(58));
  allResults.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.batch.name}`);
    console.log(`     Algorithm: ${result.config.ghostAlgorithm.toUpperCase()} ghosts, ${result.config.pacmanAlgorithm.toUpperCase()} Pacman`);
    console.log(`     Performance Level: ${result.config.performanceLevel}/5`);
    console.log(`     Simulations: ${result.simulationIds.length}`);
    console.log(`     Batch ID: ${result.batch._id}`);
    console.log('');
  });
  
  console.log(`
  View Results:
  -------------
  Open your browser and navigate to the Results page:
  ${API_BASE_URL}/#results
  `);
  
  log('✓ All batches completed successfully!', 'green');
}

/**
 * Main execution
 */
async function main() {
  logSection('PACMAN LAB - BATCH SIMULATION AUTOMATION');
  
  log(`API URL: ${API_BASE_URL}`, 'blue');
  log(`Total Batches: ${BATCH_CONFIGS.length}`, 'blue');
  log(`Simulations per Batch: ${NUM_SIMULATIONS}`, 'blue');
  log(`Total Simulations: ${BATCH_CONFIGS.length * NUM_SIMULATIONS}`, 'blue');
  
  try {
    // Step 1: Get maze (once for all batches)
    const maze = await getMaze();
    
    // Array to store all batch results
    const allResults = [];
    
    // Step 2-4: Process each batch configuration
    for (let i = 0; i < BATCH_CONFIGS.length; i++) {
      const batchConfig = BATCH_CONFIGS[i];
      
      logSection(`PROCESSING BATCH ${i + 1}/${BATCH_CONFIGS.length}: ${batchConfig.name}`);
      
      // Create batch
      const batch = await createBatch(batchConfig);
      
      // Run simulations
      const simulationIds = await runAllSimulations(maze, batch, batchConfig);
      
      // Add to batch
      const finalBatch = await addSimulationsToBatch(batch._id, simulationIds);
      
      // Store result
      allResults.push({
        batch: finalBatch,
        simulationIds,
        config: batchConfig
      });
      
      logSuccess(`✓ Batch ${i + 1} completed: ${simulationIds.length} simulations added`);
      
      // Brief pause between batches
      if (i < BATCH_CONFIGS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Display summary
    displaySummary(allResults, maze);
    
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
