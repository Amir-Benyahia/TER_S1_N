/**
 * Main Application - Pacman Lab
 */

class PacmanLabApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.currentMaze = null;
    this.currentTrajectory = null;
    this.currentBatchId = null;
    this.gameEngine = null;
    this.lastRecordedTrajectory = null; // Store last played trajectory
    this.simulationViewer = null;
    
    // Filtering and sorting state
    this.simulationsData = [];
    this.batchesData = [];
    this.simulationFilters = { outcome: 'all', minScore: 0 };
    this.simulationSort = { field: 'createdAt', order: 'desc' };
    this.batchFilters = { minSimulations: 0 };
    this.batchSort = { field: 'createdAt', order: 'desc' };
    
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadPage('dashboard');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        this.loadPage(page);
      });
    });
  }

  async loadPage(page) {
    this.currentPage = page;
    const container = document.getElementById('app-container');

    switch (page) {
      case 'dashboard':
        await this.renderDashboard(container);
        break;
      case 'generator':
        await this.renderGenerator(container);
        break;
      case 'player':
        await this.renderPlayer(container);
        break;
      case 'simulation':
        await this.renderSimulation(container);
        break;
      case 'results':
        await this.renderResults(container);
        break;
      case 'api':
        await this.renderAPI(container);
        break;
    }
  }

  async renderDashboard(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Dashboard</h2>
          <p>Recent Mazes & Trajectories</p>
        </div>
        
        <div class="grid grid-2">
          <div id="recent-mazes-section">
            <h3>Recent Mazes</h3>
            <div id="recent-mazes-list"></div>
          </div>
          
          <div id="recent-trajectories-section">
            <h3>Recent Trajectories</h3>
            <div id="recent-trajectories-list"></div>
          </div>
        </div>
      </div>
    `;

    try {
      Formatters.showLoading(true);
      
      // Load recent mazes and trajectories
      const [mazesData, trajectoriesData] = await Promise.all([
        MazeAPI.getAllMazes(1, 10),
        GameAPI.getAllTrajectories(1, 10)
      ]);

      this.displayMazeList(mazesData.mazes, 'recent-mazes-list');
      this.displayTrajectoryList(trajectoriesData.trajectories, 'recent-trajectories-list');
      
      Formatters.showLoading(false);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading dashboard: ${error.message}`, 'error');
    }
  }

  async renderGenerator(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Maze Generator</h2>
          <p>Create a new maze with custom configurations</p>
        </div>
        
        ${ConfigPanel.createMazeConfig()}
        
        <div class="action-buttons">
          <button class="btn btn-primary" id="generate-maze-btn">Generate Maze</button>
        </div>
      </div>
      
      <div class="card" id="generated-maze-section" style="display: none; margin-top: 24px;">
        <div class="card-header">
          <h2>Generated Maze</h2>
          <p>Rate and save your maze</p>
        </div>
        
        <div class="maze-canvas-container">
          <canvas id="maze-canvas"></canvas>
        </div>
        
        <div class="action-buttons">
          <h3>Rate This Maze:</h3>
          <div id="maze-rating"></div>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-secondary" id="regenerate-btn">Generate Another</button>
          <button class="btn btn-primary" id="save-maze-btn">Save Maze</button>
        </div>
      </div>
      
      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h2>Saved Mazes</h2>
          <p>Browse and manage your mazes</p>
        </div>
        <div id="saved-mazes-list"></div>
      </div>
    `;

    // Load saved mazes
    this.loadSavedMazes();

    // Setup event listeners
    document.getElementById('generate-maze-btn').addEventListener('click', () => this.generateMaze());
  }

  async generateMaze() {
    try {
      const config = ConfigPanel.getMazeConfigValues();
      const errors = Validators.validateMazeConfig(config);

      if (errors.length > 0) {
        Formatters.showToast(errors.join(', '), 'error');
        return;
      }

      Formatters.showLoading(true);
      
      const result = await MazeAPI.generateMaze(config);
      this.currentMaze = result.maze;

      // Render maze
      const mazeCanvas = new MazeCanvas('maze-canvas', this.currentMaze.grid);
      mazeCanvas.render();

      // Show maze section
      document.getElementById('generated-maze-section').style.display = 'block';

      // Setup rating
      const ratingComponent = new StarRating('maze-rating', 0);

      // Setup save button
      document.getElementById('save-maze-btn').onclick = async () => {
        const rating = ratingComponent.getRating();
        if (rating > 0) {
          await MazeAPI.updateRating(this.currentMaze._id, rating);
        }
        Formatters.showToast('Maze saved successfully!', 'success');
        this.loadSavedMazes();
      };

      document.getElementById('regenerate-btn').onclick = () => {
        document.getElementById('generated-maze-section').style.display = 'none';
        this.generateMaze();
      };

      Formatters.showLoading(false);
      Formatters.showToast('Maze generated successfully!', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error generating maze: ${error.message}`, 'error');
    }
  }

  async loadSavedMazes() {
    try {
      const data = await MazeAPI.getAllMazes(1, 20);
      this.displayMazeList(data.mazes, 'saved-mazes-list', true);
    } catch (error) {
      console.error('Error loading saved mazes:', error);
    }
  }

  displayMazeList(mazes, containerId, withActions = false) {
    const container = document.getElementById(containerId);
    
    if (mazes.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No mazes found</p></div>';
      return;
    }

    container.innerHTML = `<div class="maze-list"></div>`;
    const listEl = container.querySelector('.maze-list');

    mazes.forEach(maze => {
      const item = document.createElement('div');
      item.className = 'maze-item';
      item.style.cursor = 'pointer';
      
      // Make the whole card clickable to view maze
      item.onclick = (e) => {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.btn')) {
          this.viewMaze(maze._id);
        }
      };
      
      item.innerHTML = `
        <h3>${maze.name}</h3>
        <div class="maze-item-details">
          <p><strong>Size:</strong> ${maze.config.width}×${maze.config.height}</p>
          <p><strong>Algorithm:</strong> ${Formatters.formatAlgorithmName(maze.config.algorithm)}</p>
          ${maze.rating.user ? `<p><strong>Rating:</strong> ${'★'.repeat(maze.rating.user)}</p>` : ''}
          <p><strong>Created:</strong> ${Formatters.formatDate(maze.createdAt)}</p>
        </div>
        ${withActions ? `
          <div class="action-buttons">
            <button class="btn btn-secondary" onclick="event.stopPropagation(); app.playMaze('${maze._id}')">Play</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); app.deleteMaze('${maze._id}')">Delete</button>
          </div>
        ` : ''}
      `;
      listEl.appendChild(item);
    });
  }

  async viewMaze(mazeId) {
    try {
      Formatters.showLoading(true);
      const { maze } = await MazeAPI.getMazeById(mazeId);
      this.currentMaze = maze;
      
      // Show maze in a modal or viewer
      const viewerDiv = document.createElement('div');
      viewerDiv.id = 'maze-viewer-modal';
      viewerDiv.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.9); 
        z-index: 10000; display: flex; flex-direction: column; 
        align-items: center; justify-content: center; padding: 20px;
      `;
      
      viewerDiv.innerHTML = `
        <div style="max-width: 1000px; width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2 style="color: #e6e8ff;">${maze.name}</h2>
            <button id="close-viewer-btn" 
                    style="background: #ff1744; color: white; border: none; 
                           padding: 10px 20px; border-radius: 8px; cursor: pointer;">
              ✕ Close
            </button>
          </div>
          <div style="background: rgba(10, 14, 48, 0.95); padding: 20px; border-radius: 16px;">
            <canvas id="view-maze-canvas"></canvas>
            <div style="margin-top: 20px; text-align: center;">
              <button id="play-this-maze-btn" 
                      class="btn btn-primary" style="margin-right: 10px;">
                Play This Maze
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(viewerDiv);
      
      // Setup close button
      document.getElementById('close-viewer-btn').onclick = () => {
        document.getElementById('maze-viewer-modal').remove();
      };
      
      // Setup play button
      document.getElementById('play-this-maze-btn').onclick = () => {
        document.getElementById('maze-viewer-modal').remove();
        this.playMaze(maze._id);
      };
      
      // Render maze
      setTimeout(() => {
        const canvas = new MazeCanvas('view-maze-canvas', maze.grid);
        canvas.render();
      }, 100);
      
      Formatters.showLoading(false);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error viewing maze: ${error.message}`, 'error');
    }
  }

  async playMaze(mazeId) {
    try {
      Formatters.showLoading(true);
      const { maze } = await MazeAPI.getMazeById(mazeId);
      this.currentMaze = maze;
      
      // Switch to player page
      document.querySelector('[data-page="player"]').click();
      
      // DON'T auto-start - wait for user to click Start Game
      
      Formatters.showLoading(false);
      Formatters.showToast('Maze loaded! Click "Start Game" when ready.', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading maze: ${error.message}`, 'error');
    }
  }

  async deleteMaze(mazeId) {
    if (!confirm('Are you sure you want to delete this maze?')) return;

    try {
      await MazeAPI.deleteMaze(mazeId);
      Formatters.showToast('Maze deleted successfully', 'success');
      this.loadSavedMazes();
    } catch (error) {
      Formatters.showToast(`Error deleting maze: ${error.message}`, 'error');
    }
  }

  async renderPlayer(container) {
    // Load available mazes
    let mazes = [];
    try {
      const data = await MazeAPI.getAllMazes(1, 50);
      mazes = data.mazes;
    } catch (error) {
      console.error('Error loading mazes:', error);
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Play Mode</h2>
          <p>Control Pacman with arrow keys or WASD</p>
        </div>
        
        ${mazes.length > 0 ? `
          <div class="form-group">
            <label for="maze-select">Select a Maze to Play</label>
            <select id="maze-select" class="form-control">
              <option value="">Choose a maze...</option>
              ${mazes.map(m => `
                <option value="${m._id}" ${this.currentMaze && m._id === this.currentMaze._id ? 'selected' : ''}>
                  ${m.name} (${m.config.width}×${m.config.height})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" id="load-maze-btn">Load Selected Maze</button>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon"></div>
            <div class="empty-state-text">No mazes available</div>
            <button class="btn btn-primary" onclick="app.loadPage('generator')">Generate a Maze First</button>
          </div>
        `}
        
        ${this.currentMaze ? `
          <div class="maze-canvas-container">
            <canvas id="game-canvas"></canvas>
          </div>
          
          <div class="trajectory-info">
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="pellets-count">0</div>
              <div class="trajectory-stat-label">Pellets</div>
            </div>
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="time-elapsed">0s</div>
              <div class="trajectory-stat-label">Time</div>
            </div>
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="moves-count">0</div>
              <div class="trajectory-stat-label">Moves</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" id="start-game-btn">Start Game</button>
            <button class="btn btn-secondary" id="pause-game-btn" style="display: none;">Pause</button>
            <button class="btn btn-primary" id="save-trajectory-btn" style="display: none;">Save Trajectory</button>
            <button class="btn btn-success" id="view-stats-btn" style="display: none;">View Statistics</button>
          </div>
          
          <div id="game-stats-panel" style="display: none; margin-top: 20px; padding: 20px; background: rgba(99, 116, 255, 0.1); border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.3);">
            <h3 style="margin-bottom: 15px;">Game Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div class="stat-item">
                <strong>Maze:</strong> <span id="stat-maze-name">-</span>
              </div>
              <div class="stat-item">
                <strong>Duration:</strong> <span id="stat-duration">-</span>
              </div>
              <div class="stat-item">
                <strong>Total Moves:</strong> <span id="stat-moves">-</span>
              </div>
              <div class="stat-item">
                <strong>Pellets Collected:</strong> <span id="stat-pellets">-</span>
              </div>
              <div class="stat-item">
                <strong>Completion:</strong> <span id="stat-completion">-</span>
              </div>
              <div class="stat-item">
                <strong>Avg Speed:</strong> <span id="stat-speed">-</span>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <strong>Trajectory Info:</strong>
              <div style="color: #9aa4ff; margin-top: 5px;">
                <span id="stat-trajectory-status">Ready for replay in AI Simulation mode</span>
              </div>
            </div>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">▶</div>
            <div class="empty-state-text">Select a maze to play</div>
            <button class="btn btn-primary" onclick="app.loadPage('generator')">Go to Generator</button>
          </div>
        `}
      </div>
    `;

    if (mazes.length > 0 && !this.currentMaze) {
      document.getElementById('load-maze-btn').addEventListener('click', async () => {
        const mazeId = document.getElementById('maze-select').value;
        if (!mazeId) {
          Formatters.showToast('Please select a maze', 'error');
          return;
        }
        await this.playMaze(mazeId);
      });
    }

    if (this.currentMaze) {
      document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    }
  }

  startGame() {
    if (!this.currentMaze) {
      Formatters.showToast('Please select a maze first!', 'error');
      return;
    }

    try {
      // Stop any existing game
      if (this.gameEngine) {
        this.gameEngine.stop();
      }

      // Store original grid before game modifies it
      this.originalGrid = JSON.parse(JSON.stringify(this.currentMaze.grid));
      
      this.gameEngine = new GameEngine('game-canvas', this.currentMaze.grid, this.currentMaze._id);
      this.gameEngine.start();

      const startBtn = document.getElementById('start-game-btn');
      const pauseBtn = document.getElementById('pause-game-btn');
      const saveBtn = document.getElementById('save-trajectory-btn');
      
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      if (saveBtn) saveBtn.style.display = 'inline-block';

      if (pauseBtn) {
        pauseBtn.onclick = () => {
          const isPaused = this.gameEngine.togglePause();
          pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
          pauseBtn.className = isPaused ? 'btn btn-primary' : 'btn btn-secondary';
          
          if (isPaused) {
            Formatters.showToast('Game Paused', 'info');
          } else {
            Formatters.showToast('Game Resumed', 'info');
          }
        };
      }

      if (saveBtn) {
        saveBtn.onclick = async () => {
          this.gameEngine.stop();
          
          // Store trajectory for immediate replay
          this.lastRecordedTrajectory = {
            moves: this.gameEngine.getTrajectory(),
            mazeId: this.currentMaze._id,
            grid: this.originalGrid || this.currentMaze.grid, // Use original grid with pellets
            trajectoryId: null // Will be set if saved to DB
          };
          
          // Calculate and display statistics
          const trajectory = this.gameEngine.getTrajectory();
          const duration = this.gameEngine.getElapsedTime();
          const pelletsCollected = this.gameEngine.pacman.getPelletsEaten();
          const totalPellets = this.gameEngine.totalPellets;
          
          document.getElementById('stat-maze-name').textContent = this.currentMaze.name || 'Unnamed Maze';
          document.getElementById('stat-duration').textContent = (duration / 1000).toFixed(1) + 's';
          document.getElementById('stat-moves').textContent = trajectory.length;
          document.getElementById('stat-pellets').textContent = `${pelletsCollected}/${totalPellets}`;
          document.getElementById('stat-completion').textContent = ((pelletsCollected / totalPellets) * 100).toFixed(1) + '%';
          document.getElementById('stat-speed').textContent = (trajectory.length / (duration / 1000)).toFixed(2) + ' moves/s';
          
          // Show statistics panel
          document.getElementById('game-stats-panel').style.display = 'block';
          document.getElementById('view-stats-btn').style.display = 'inline-block';
          
          Formatters.showToast('Trajectory recorded! Go to AI Simulation to replay it with ghosts!', 'success');
          
          // Optionally save to database
          const save = confirm('Trajectory recorded! Do you want to save it to database? (Optional)');
          if (save) {
            const name = prompt('Enter trajectory name:');
            if (name) {
              try {
                const response = await this.gameEngine.saveTrajectory(name);
                // Store trajectory ID for simulation saving
                if (response && response.trajectory && response.trajectory._id) {
                  this.lastRecordedTrajectory.trajectoryId = response.trajectory._id;
                  document.getElementById('stat-trajectory-status').textContent = 
                    `Saved to database as "${name}" - Ready for replay`;
                }
                Formatters.showToast('Also saved to database!', 'success');
              } catch (error) {
                Formatters.showToast(`Database save failed (demo mode), but trajectory is still recorded for replay!`, 'info');
                document.getElementById('stat-trajectory-status').textContent = 
                  'Recorded in memory only - Ready for replay in AI Simulation';
              }
            }
          }
        };
      }
      
      // View stats button handler
      const viewStatsBtn = document.getElementById('view-stats-btn');
      if (viewStatsBtn) {
        viewStatsBtn.onclick = () => {
          const statsPanel = document.getElementById('game-stats-panel');
          if (statsPanel.style.display === 'none') {
            statsPanel.style.display = 'block';
            viewStatsBtn.textContent = 'Hide Statistics';
          } else {
            statsPanel.style.display = 'none';
            viewStatsBtn.textContent = 'View Statistics';
          }
        };
      }

      // Update stats periodically
      this.statsInterval = setInterval(() => {
        if (this.gameEngine && this.gameEngine.isRunning) {
          const pelletsEl = document.getElementById('pellets-count');
          const timeEl = document.getElementById('time-elapsed');
          const movesEl = document.getElementById('moves-count');
          
          if (pelletsEl) {
            pelletsEl.textContent = this.gameEngine.pacman.getPelletsEaten();
          }
          if (timeEl) {
            timeEl.textContent = Formatters.formatDuration(this.gameEngine.getElapsedTime());
          }
          if (movesEl) {
            movesEl.textContent = this.gameEngine.trajectory.length;
          }
        }
      }, 100);

    } catch (error) {
      Formatters.showToast(`Error starting game: ${error.message}`, 'error');
    }
  }

  async renderSimulation(container) {
    const hasRecording = this.lastRecordedTrajectory !== null;
    
    // Load saved trajectories
    let trajectories = [];
    try {
      const data = await GameAPI.getAllTrajectories(1, 50);
      trajectories = data.trajectories;
    } catch (error) {
      console.error('Error loading trajectories:', error);
    }
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>AI Simulation & Replay</h2>
          <p>Configure Pacman and ghost AI for simulation</p>
        </div>
        
        <!-- Pacman Configuration Widget -->
        <div class="simulation-section">
          <h3 style="margin-bottom: 15px; color: #6f7dff;">Pacman Configuration</h3>
          
          <div class="simulation-nav-tabs">
            <button class="simulation-tab-btn active" data-tab="trajectory">
              <span class="tab-icon">▶</span>
              Trajectory Simulation
            </button>
            <button class="simulation-tab-btn" data-tab="bot">
              <span class="tab-icon"></span>
              Bot Simulation
            </button>
          </div>

          <!-- Trajectory Simulation Tab -->
          <div id="tab-trajectory" class="simulation-tab-content active">
            ${hasRecording ? `
              <div class="info" style="background: rgba(76, 175, 80, 0.2); border-color: #4caf50;">
                Last played trajectory ready! Or select a saved one below.
              </div>
            ` : trajectories.length > 0 ? `

            ` : `
              <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
                No trajectory available. Go to <strong>Play Mode</strong>, play a maze, then save your trajectory!
              </div>
            `}
            
            ${trajectories.length > 0 || hasRecording ? `
              <div class="form-group">
                <label for="trajectory-select">Select Trajectory</label>
                <select id="trajectory-select" class="form-control">
                  ${hasRecording ? '<option value="last">Last Played (In Memory)</option>' : ''}
                  ${trajectories.map(t => `
                    <option value="${t._id}">
                      ${t.name} - ${t.moves ? t.moves.length : 0} moves
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}
          </div>

          <!-- Bot Simulation Tab -->
          <div id="tab-bot" class="simulation-tab-content">

            
            <div class="form-group">
              <label for="pacman-algorithm-select">Pacman Algorithm</label>
              <select id="pacman-algorithm-select" class="form-control">
                <option value="greedy">Greedy - Always moves towards nearest pellet</option>
                <option value="defensive">Defensive - Prioritizes staying away from ghosts</option>
                <option value="aggressive">Aggressive - Focuses on collecting pellets quickly</option>
                <option value="random">Random Walker - Random movement with ghost avoidance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bot-max-duration">Max Duration (seconds)</label>
              <input type="number" id="bot-max-duration" class="form-control" value="60" min="10" max="300" step="10" />
              <small style="color: #9aa4ff;">Maximum simulation time before timeout (10-300 seconds)</small>
            </div>
            
            <div class="form-group">
              <label for="bot-maze-select">Select Maze for Bot</label>
              <select id="bot-maze-select" class="form-control">
                <option value="">Loading mazes...</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Ghost Configuration Widget -->
        <div class="simulation-section" style="margin-top: 32px;">
          <h3 style="margin-bottom: 15px; color: #6f7dff;">Ghost Configuration</h3>
          <p style="color: #9aa4ff; margin-bottom: 15px;">Configure how each ghost will chase Pacman</p>
          
          <div id="ghost-configs">
            <div class="ghost-config-list" id="ghost-config-list">
              ${ConfigPanel.createGhostConfig(0)}
              ${ConfigPanel.createGhostConfig(1)}
              ${ConfigPanel.createGhostConfig(2)}
              ${ConfigPanel.createGhostConfig(3)}
            </div>
          </div>
        </div>
        
        <div class="action-buttons" style="margin-top: 32px;">
          <button class="btn btn-primary" id="start-replay-btn">
            Start Simulation
          </button>
        </div>
      </div>
      
      <div class="card" id="simulation-viewer" style="display: none; margin-top: 24px;">
        <div class="card-header">
          <h2>Live Simulation</h2>
          <p>Watching AI simulation</p>
        </div>
        
        <div class="maze-canvas-container">
          <canvas id="simulation-canvas"></canvas>
        </div>
        
        <div class="replay-controls">
          <button class="btn btn-secondary" id="replay-play-btn">Play</button>
          <button class="btn btn-secondary" id="replay-pause-btn">Pause</button>
          <button class="btn btn-secondary" id="replay-reset-btn">Reset</button>
          <div class="replay-progress" id="replay-progress">
            <div class="replay-progress-bar" id="replay-progress-bar"></div>
          </div>
        </div>
        
        <div class="trajectory-info">
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-frame">0</div>
            <div class="trajectory-stat-label">Frame</div>
          </div>
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-progress">0%</div>
            <div class="trajectory-stat-label">Progress</div>
          </div>
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-status">Ready</div>
            <div class="trajectory-stat-label">Status</div>
          </div>
        </div>
      </div>
    `;

    // Setup tab navigation
    this.setupSimulationTabs();

    // Load mazes for bot mode
    this.loadMazesForBot();

    // Setup start button
    document.getElementById('start-replay-btn').addEventListener('click', async () => {
      const activeTab = document.querySelector('.simulation-tab-btn.active').getAttribute('data-tab');
      
      if (activeTab === 'trajectory') {
        const selected = document.getElementById('trajectory-select');
        if (!selected || selected.options.length === 0) {
          Formatters.showToast('No trajectory available', 'error');
          return;
        }
        
        if (selected.value === 'last') {
          this.startReplay();
        } else {
          await this.loadAndReplayTrajectory(selected.value);
        }
      } else {
        // Bot mode
        await this.startBotSimulation();
      }
    });
  }

  setupSimulationTabs() {
    const tabButtons = document.querySelectorAll('.simulation-tab-btn');
    const tabContents = document.querySelectorAll('.simulation-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });
  }

  async loadMazesForBot() {
    try {
      const response = await MazeAPI.getAllMazes(1, 50);
      const mazes = response.mazes || [];
      
      const select = document.getElementById('bot-maze-select');
      if (select) {
        select.innerHTML = mazes.length > 0 
          ? mazes.map(m => `<option value="${m._id}">${m.name} (${m.config.width}x${m.config.height})</option>`).join('')
          : '<option value="">No mazes available</option>';
      }
    } catch (error) {
      console.error('Error loading mazes:', error);
    }
  }

  async startBotSimulation() {
    const algorithm = document.getElementById('pacman-algorithm-select').value;
    const mazeId = document.getElementById('bot-maze-select').value;
    
    if (!mazeId) {
      Formatters.showToast('Please select a maze', 'error');
      return;
    }
    
    try {
      Formatters.showLoading(true);
      
      // Load the maze
      const { maze } = await MazeAPI.getMazeById(mazeId);
      
      if (!maze || !maze.grid) {
        throw new Error('Invalid maze data');
      }
      
      // Find Pacman's starting position in the maze
      let pacmanStart = null;
      for (let y = 0; y < maze.grid.length; y++) {
        for (let x = 0; x < maze.grid[y].length; x++) {
          if (maze.grid[y][x] === 2) { // 2 is Pacman's starting position
            pacmanStart = { y, x };
            break;
          }
        }
        if (pacmanStart) break;
      }
      
      // If no starting position found, use a default one
      if (!pacmanStart) {
        pacmanStart = { y: 1, x: 1 };
      }
      
      // Create an initial trajectory with just the starting position
      // The bot will generate moves dynamically during simulation
      const initialMoves = [{ ...pacmanStart, timestamp: Date.now() }];
      
      this.lastRecordedTrajectory = {
        moves: initialMoves,
        mazeId: maze._id,
        grid: maze.grid,
        botMode: true,
        botAlgorithm: algorithm,
        trajectoryId: 'bot-simulation'
      };
      
      Formatters.showLoading(false);
      Formatters.showToast(`Starting bot simulation with ${algorithm} algorithm`, 'info');
      
      // Start replay (which will handle bot mode)
      this.startReplay();
      
    } catch (error) {
      Formatters.showLoading(false);
      console.error('Error starting bot simulation:', error);
      Formatters.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async loadAndReplayTrajectory(trajectoryId) {
    try {
      Formatters.showLoading(true);
      
      const { trajectory } = await GameAPI.getTrajectoryById(trajectoryId);
      
      if (!trajectory || !trajectory.moves || trajectory.moves.length === 0) {
        throw new Error('Invalid trajectory data');
      }
      
      // Check if mazeId is already populated (full object) or just an ID
      let maze;
      if (typeof trajectory.mazeId === 'object' && trajectory.mazeId._id) {
        // Already populated
        maze = trajectory.mazeId;
      } else {
        // Need to fetch the maze
        const response = await MazeAPI.getMazeById(trajectory.mazeId);
        maze = response.maze;
      }
      
      if (!maze || !maze.grid) {
        throw new Error('Invalid maze data for trajectory');
      }
      
      // Set up trajectory for replay
      this.lastRecordedTrajectory = {
        moves: trajectory.moves,
        mazeId: maze._id,
        grid: maze.grid,
        trajectoryId: trajectory._id
      };
      
      console.log('Loaded trajectory with grid:', maze.grid.length, 'x', maze.grid[0]?.length);
      
      Formatters.showLoading(false);
      
      // Start replay
      this.startReplay();
      
    } catch (error) {
      Formatters.showLoading(false);
      console.error('Error loading trajectory:', error);
      Formatters.showToast(`Error loading trajectory: ${error.message}`, 'error');
    }
  }

  startReplay() {
    if (!this.lastRecordedTrajectory) {
      Formatters.showToast('No trajectory available!', 'error');
      return;
    }
    
    if (!this.lastRecordedTrajectory.grid || !Array.isArray(this.lastRecordedTrajectory.grid)) {
      Formatters.showToast('Invalid trajectory data - no grid found!', 'error');
      console.error('Invalid trajectory:', this.lastRecordedTrajectory);
      return;
    }
    
    if (!this.lastRecordedTrajectory.moves || !Array.isArray(this.lastRecordedTrajectory.moves)) {
      Formatters.showToast('Invalid trajectory data - no moves found!', 'error');
      console.error('Invalid trajectory:', this.lastRecordedTrajectory);
      return;
    }

    try {
      const ghostConfigs = ConfigPanel.getGhostConfigValues();
      
      console.log('Starting replay with:');
      console.log('- Grid:', this.lastRecordedTrajectory.grid.length, 'x', this.lastRecordedTrajectory.grid[0]?.length);
      console.log('- Moves:', this.lastRecordedTrajectory.moves.length);
      console.log('- Ghosts:', ghostConfigs.length);
      
      // Show simulation viewer
      document.getElementById('simulation-viewer').style.display = 'block';
      
      // Check if this is bot mode
      const isBotMode = this.lastRecordedTrajectory.botMode || false;
      const botAlgorithm = this.lastRecordedTrajectory.botAlgorithm || null;
      
      console.log('- Bot Mode:', isBotMode, '| Algorithm:', botAlgorithm);
      
      // Get max duration from config panel (in seconds, convert to ms)
      // Only read from input if in bot mode, otherwise use default
      let maxDuration = 60000; // Default 60 seconds
      if (isBotMode) {
        const durationInput = document.getElementById('bot-max-duration');
        const durationSeconds = durationInput ? parseInt(durationInput.value) : 60;
        maxDuration = durationSeconds * 1000; // Convert to milliseconds
        console.log('- Max Duration:', maxDuration, 'ms (', durationSeconds, 'seconds)');
      } else {
        console.log('- Trajectory mode - no duration limit');
      }
      
      // Create simulation viewer
      this.simulationViewer = new SimulationViewer(
        'simulation-canvas',
        this.lastRecordedTrajectory.grid,
        this.lastRecordedTrajectory.moves,
        ghostConfigs,
        isBotMode,
        botAlgorithm,
        maxDuration
      );
      
      // Callback when simulation completes
      this.simulationViewer.onSimulationComplete = (results) => {
        this.promptSaveSimulation(results);
      };

      // Setup controls
      document.getElementById('replay-play-btn').onclick = () => {
        this.simulationViewer.play();
        document.getElementById('sim-status').textContent = 'Playing';
      };

      document.getElementById('replay-pause-btn').onclick = () => {
        this.simulationViewer.pause();
        document.getElementById('sim-status').textContent = 'Paused';
      };

      document.getElementById('replay-reset-btn').onclick = () => {
        this.simulationViewer.reset();
        document.getElementById('sim-status').textContent = 'Reset';
        document.getElementById('sim-frame').textContent = '0';
        document.getElementById('sim-progress').textContent = '0%';
      };

      // Update stats periodically
      setInterval(() => {
        if (this.simulationViewer) {
          const frameEl = document.getElementById('sim-frame');
          const progressEl = document.getElementById('sim-progress');
          const progressBarEl = document.getElementById('replay-progress-bar');
          
          if (frameEl) frameEl.textContent = this.simulationViewer.currentFrame;
          if (progressEl) {
            const progress = this.simulationViewer.getProgress().toFixed(1);
            progressEl.textContent = `${progress}%`;
          }
          if (progressBarEl) {
            const progress = this.simulationViewer.getProgress().toFixed(1);
            progressBarEl.style.width = `${progress}%`;
          }
        }
      }, 100);

      Formatters.showToast('Simulation ready! Maze loaded. Click Play to watch!', 'success');
      
      // Scroll to viewer
      document.getElementById('simulation-viewer').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error starting replay:', error);
      Formatters.showToast(`Error starting replay: ${error.message}`, 'error');
    }
  }

  displayTrajectoryList(trajectories, containerId) {
    const container = document.getElementById(containerId);
    
    if (trajectories.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No trajectories found</p></div>';
      return;
    }

    container.innerHTML = '<div class="maze-list"></div>';
    const listEl = container.querySelector('.maze-list');

    trajectories.forEach(traj => {
      const item = document.createElement('div');
      item.className = 'maze-item';
      item.innerHTML = `
        <h3>${traj.name}</h3>
        <div class="maze-item-details">
          <p><strong>Moves:</strong> ${traj.moves.length}</p>
          <p><strong>Duration:</strong> ${Formatters.formatDuration(traj.duration)}</p>
          <p><strong>Pellets:</strong> ${traj.pelletsCollected}/${traj.totalPellets}</p>
        </div>
      `;
      listEl.appendChild(item);
    });
  }
  
  async renderResults(container) {
    // Check if we're viewing a specific batch
    const batchId = this.currentBatchId;

    if (batchId) {
      // Render batch view
      await this.renderBatchView(container, batchId);
    } else {
      // Render combined view with both batches and simulations
      await this.renderCombinedResultsView(container);
    }
  }

  async renderCombinedResultsView(container) {
    container.innerHTML = `
      <div class="card">
        <div class="results-nav-tabs">
          <button class="results-tab-btn active" data-tab="simulations">
            <span class="tab-icon">▣</span>
            Simulations
          </button>
          <button class="results-tab-btn" data-tab="batches">
            <span class="tab-icon"></span>
            Batches
          </button>
        </div>

        <!-- Simulations Tab Content -->
        <div id="tab-simulations" class="results-tab-content active">
          <div class="card-header">
            <h2>All Simulations</h2>
            <p>View and manage individual simulations</p>
          </div>
          <div id="simulations-list"></div>
        </div>

        <!-- Batches Tab Content -->
        <div id="tab-batches" class="results-tab-content">
          <div class="card-header">
            <h2>Simulation Batches</h2>
            <p>Organize simulations by batch</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" id="create-batch-btn">Create New Batch</button>
          </div>
          
          <div id="batches-list"></div>
        </div>
      </div>
    `;

    try {
      Formatters.showLoading(true);
      
      // Load both batches and simulations in parallel
      const [batchesResponse, simulationsResponse] = await Promise.all([
        GameAPI.getAllBatches(1, 100),
        GameAPI.getAllSimulations(1, 100)
      ]);

      const batches = batchesResponse.batches || [];
      const simulations = simulationsResponse.simulations || [];
      this.simulationsData = simulations;
      this.batchesData = batches;

      Formatters.showLoading(false);

      // Render simulations
      if (simulations.length === 0) {
        document.getElementById('simulations-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No saved simulations yet. Run a simulation in AI Simulation mode and save it!
          </div>
        `;
      } else {
        this.renderSimulationControls();
        this.renderSimulationsList(this.filterAndSortSimulations(simulations));
      }

      // Render batches
      if (batches.length === 0) {
        document.getElementById('batches-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No batches created yet. Create one to start organizing simulations!
          </div>
        `;
      } else {
        this.renderBatchControls();
        this.renderBatchesTable(this.filterAndSortBatches(batches));
      }

      // Setup tab navigation
      this.setupResultsTabs();

      // Setup event listener for create batch button
      document.getElementById('create-batch-btn').addEventListener('click', () => {
        this.showCreateBatchDialog();
      });
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading results: ${error.message}`, 'error');
    }
  }

  setupResultsTabs() {
    const tabButtons = document.querySelectorAll('.results-tab-btn');
    const tabContents = document.querySelectorAll('.results-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });
  }

  renderBatchControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'list-controls';
    controlsContainer.innerHTML = `
      <div class="filter-sort-bar">
        <div class="filter-group">
          <label>Min Simulations:</label>
          <input type="number" id="batch-filter-sims" class="control-input" placeholder="0" min="0" value="0">
        </div>
        <div class="filter-group">
          <label>Sort By:</label>
          <select id="batch-sort-field" class="control-select">
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
            <option value="simCount">Sim Count</option>
            <option value="escapeRate">Escape Rate</option>
            <option value="meanScore">Mean Score</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Order:</label>
          <select id="batch-sort-order" class="control-select">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <button id="batch-reset-filters" class="btn btn-secondary btn-sm">Reset</button>
      </div>
    `;
    
    const batchesList = document.getElementById('batches-list');
    batchesList.parentElement.insertBefore(controlsContainer, batchesList);
    
    // Event listeners
    document.getElementById('batch-filter-sims').addEventListener('input', (e) => {
      this.batchFilters.minSimulations = parseInt(e.target.value) || 0;
      this.renderBatchesTable(this.filterAndSortBatches(this.batchesData));
    });
    
    document.getElementById('batch-sort-field').addEventListener('change', (e) => {
      this.batchSort.field = e.target.value;
      this.renderBatchesTable(this.filterAndSortBatches(this.batchesData));
    });
    
    document.getElementById('batch-sort-order').addEventListener('change', (e) => {
      this.batchSort.order = e.target.value;
      this.renderBatchesTable(this.filterAndSortBatches(this.batchesData));
    });
    
    document.getElementById('batch-reset-filters').addEventListener('click', () => {
      this.batchFilters = { minSimulations: 0 };
      this.batchSort = { field: 'createdAt', order: 'desc' };
      document.getElementById('batch-filter-sims').value = '0';
      document.getElementById('batch-sort-field').value = 'createdAt';
      document.getElementById('batch-sort-order').value = 'desc';
      this.renderBatchesTable(this.filterAndSortBatches(this.batchesData));
    });
  }

  filterAndSortBatches(batches) {
    let filtered = [...batches];
    
    // Apply filters
    if (this.batchFilters.minSimulations > 0) {
      filtered = filtered.filter(batch => 
        (batch.stats?.totalSimulations || 0) >= this.batchFilters.minSimulations
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch(this.batchSort.field) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          return this.batchSort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'simCount':
          aVal = a.stats?.totalSimulations || 0;
          bVal = b.stats?.totalSimulations || 0;
          break;
        case 'escapeRate':
          aVal = a.stats?.escapeRate || 0;
          bVal = b.stats?.escapeRate || 0;
          break;
        case 'meanScore':
          aVal = a.stats?.score?.mean || 0;
          bVal = b.stats?.score?.mean || 0;
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
      }
      
      return this.batchSort.order === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered;
  }

  renderBatchesTable(batches) {
    const listEl = document.getElementById('batches-list');
    listEl.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'batches-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Simulations</th>
        <th>Escape Rate</th>
        <th>Mean Score</th>
        <th>Mean Duration</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    batches.forEach((batch) => {
      const row = document.createElement('tr');
      row.className = 'batches-table-row';
      row.style.cursor = 'pointer';

      const escapeRate = batch.stats.totalSimulations > 0 
        ? batch.stats.escapeRate.toFixed(1) 
        : 'N/A';
      const meanScore = batch.stats.score?.mean 
        ? batch.stats.score.mean.toFixed(0)
        : 'N/A';
      const meanDuration = batch.stats.totalSimulations > 0
        ? Formatters.formatDuration(batch.stats.meanDuration)
        : 'N/A';
      const createdDate = Formatters.formatDate(batch.createdAt);

      row.innerHTML = `
        <td class="col-name"><strong>${batch.name}</strong></td>
        <td class="col-count">${batch.stats.totalSimulations}</td>
        <td class="col-escape-rate">
          <span class="escape-rate-badge" style="background-color: ${batch.stats.escapeRate >= 50 ? '#4caf5020' : '#ff525220'}; color: ${batch.stats.escapeRate >= 50 ? '#4caf50' : '#ff5252'};">
            ${escapeRate}%
          </span>
        </td>
        <td class="col-score"><strong>${meanScore}</strong></td>
        <td class="col-duration">${meanDuration}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.deleteBatch('${batch._id}')">
            Delete
          </button>
        </td>
      `;

      row.addEventListener('click', () => {
        this.currentBatchId = batch._id;
        this.loadPage('results');
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listEl.appendChild(table);
  }

  async renderBatchView(container, batchId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getBatchById(batchId);
      const batch = response.batch;
      Formatters.showLoading(false);

      const stats = batch.stats;
      const escapeRate = stats.totalSimulations > 0 ? stats.escapeRate.toFixed(1) : 0;
      const meanDuration = stats.totalSimulations > 0 ? Formatters.formatDuration(stats.meanDuration) : 'N/A';
      
      // Performance statistics
      const meanScore = stats.score?.mean?.toFixed(0) || 'N/A';
      const medianScore = stats.score?.median?.toFixed(0) || 'N/A';
      const stdDevScore = stats.score?.stdDev?.toFixed(1) || 'N/A';
      
      const durationMean = stats.duration?.mean ? Formatters.formatDuration(stats.duration.mean) : 'N/A';
      const durationMedian = stats.duration?.median ? Formatters.formatDuration(stats.duration.median) : 'N/A';
      
      const pacmanMemoryMean = stats.performance?.pacman?.memoryUsage?.mean 
        ? Formatters.formatBytes(stats.performance.pacman.memoryUsage.mean)
        : 'N/A';

      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h2>${batch.name}</h2>
                <p>Batch analysis and statistics</p>
              </div>
              <button class="btn btn-secondary" id="back-to-batches-btn">← Back to Batches</button>
            </div>
          </div>
        </div>

        <!-- Batch Statistics -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Batch Statistics Overview</h3>
          </div>
          <div class="professional-stats-grid">
            <div class="stats-primary-row">
              <div class="stat-box stat-primary">
                <div class="stat-label">Total Simulations</div>
                <div class="stat-value">${stats.totalSimulations || 0}</div>
              </div>
              <div class="stat-box stat-success">
                <div class="stat-label">Escaped</div>
                <div class="stat-value">${stats.escapedCount || 0}</div>
                <div class="stat-percent">${stats.totalSimulations > 0 ? ((stats.escapedCount / stats.totalSimulations) * 100).toFixed(1) : '0'}%</div>
              </div>
              <div class="stat-box stat-danger">
                <div class="stat-label">Caught</div>
                <div class="stat-value">${stats.caughtCount || 0}</div>
                <div class="stat-percent">${stats.totalSimulations > 0 ? ((stats.caughtCount / stats.totalSimulations) * 100).toFixed(1) : '0'}%</div>
              </div>
              <div class="stat-box stat-accent">
                <div class="stat-label">Escape Rate</div>
                <div class="stat-value">${escapeRate}%</div>
                <div class="stat-bar" style="width: ${stats.totalSimulations > 0 ? escapeRate : 0}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics: Score -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Score Distribution</h3>
          </div>
          <div class="professional-stats-grid">
            <div class="stat-box">
              <div class="stat-label">Mean</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.score?.mean ? stats.score.mean.toFixed(0) : '0'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Median</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.score?.median ? stats.score.median.toFixed(0) : '0'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Std Dev</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.score?.stdDev ? stats.score.stdDev.toFixed(1) : '0'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Min</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.score?.min ? stats.score.min.toFixed(0) : '0'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Max</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.score?.max ? stats.score.max.toFixed(0) : '0'}</div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics: Duration -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Duration Analysis</h3>
          </div>
          <div class="professional-stats-grid">
            <div class="stat-box">
              <div class="stat-label">Mean Duration</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.duration?.mean ? Formatters.formatDuration(stats.duration.mean) : '0s'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Median Duration</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.duration?.median ? Formatters.formatDuration(stats.duration.median) : '0s'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Min Duration</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.duration?.min ? Formatters.formatDuration(stats.duration.min) : '0s'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Max Duration</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.duration?.max ? Formatters.formatDuration(stats.duration.max) : '0s'}</div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics: Memory & Performance -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Performance Metrics</h3>
          </div>
          <div class="professional-stats-grid">
            <div class="stat-box">
              <div class="stat-label">Pacman Avg Memory</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.performance?.pacman?.avgMemoryUsage ? Formatters.formatBytes(stats.performance.pacman.avgMemoryUsage) : '0 B'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Pacman Decision Time</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.performance?.pacman?.avgDecisionTime ? stats.performance.pacman.avgDecisionTime.toFixed(2) + ' ms' : '0 ms'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Ghost Avg Memory</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.performance?.ghosts?.avgMemoryUsage ? Formatters.formatBytes(stats.performance.ghosts.avgMemoryUsage) : '0 B'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Ghost Decision Time</div>
              <div class="stat-value">${stats.totalSimulations > 0 && stats.performance?.ghosts?.avgDecisionTime ? stats.performance.ghosts.avgDecisionTime.toFixed(2) + ' ms' : '0 ms'}</div>
            </div>
          </div>
        </div>

        <!-- Simulations Table -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Simulations in Batch</h3>
            <p>${batch.simulations.length} simulations</p>
          </div>
          <div id="batch-simulations-list"></div>
        </div>
      `;

      // Setup back button
      document.getElementById('back-to-batches-btn').addEventListener('click', () => {
        this.currentBatchId = null;
        this.loadPage('results');
      });

      // Render simulations table
      if (batch.simulations.length > 0) {
        this.renderSimulationsTableForBatch(batch.simulations);
      } else {
        document.getElementById('batch-simulations-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No simulations in this batch yet. Add some simulations to analyze them!
          </div>
        `;
      }
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading batch: ${error.message}`, 'error');
    }
  }

  renderSimulationsTableForBatch(simulations) {
    const listEl = document.getElementById('batch-simulations-list');
    listEl.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'simulations-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Outcome</th>
        <th>Score</th>
        <th>Duration</th>
        <th title="Memory usage rate (bytes/second) - normalized for fair comparison">Pac Memory Rate</th>
        <th>Frames</th>
        <th>Maze</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    simulations.forEach((sim) => {
      const row = document.createElement('tr');
      row.className = 'simulations-table-row';
      row.style.cursor = 'pointer';

      const outcome = sim.results.caught ? 'Caught' : 'Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const score = sim.results.score || 0;
      const duration = Formatters.formatDuration(sim.results.duration || 0);
      const pacmanMemoryRaw = sim.results.performanceMetrics?.pacman?.memoryUsage || 0;
      const pacmanMemoryPerSec = sim.results.performanceMetrics?.pacman?.memoryPerSecond || 0;
      const pacmanMemory = pacmanMemoryPerSec > 0 
        ? `${Formatters.formatBytes(pacmanMemoryPerSec)}/s`
        : (pacmanMemoryRaw > 0 ? Formatters.formatBytes(pacmanMemoryRaw) : 'N/A');
      const pacmanMemoryTitle = pacmanMemoryRaw > 0 
        ? `Total: ${Formatters.formatBytes(pacmanMemoryRaw)}, Rate: ${Formatters.formatBytes(pacmanMemoryPerSec)}/s`
        : 'No memory data';
      
      const frames = sim.results.totalFrames || 0;
      const mazeIdStr = typeof sim.mazeId === 'string' ? sim.mazeId : (sim.mazeId?._id || sim.mazeId?.name || 'N/A');
      const mazeName = typeof sim.mazeId === 'object' ? sim.mazeId?.name : 'N/A';
      const mazeId = mazeIdStr.substring(0, 8) + '...';
      const createdDate = Formatters.formatDate(sim.createdAt);

      row.innerHTML = `
        <td class="col-name"><strong>${sim.name}</strong></td>
        <td class="col-outcome">
          <span class="outcome-badge" style="background-color: ${outcomeColor}20; color: ${outcomeColor}; border: 1px solid ${outcomeColor};">
            ${outcome}
          </span>
        </td>
        <td class="col-score"><strong>${score}</strong></td>
        <td class="col-duration">${duration}</td>
        <td class="col-memory" title="${pacmanMemoryTitle}">${pacmanMemory}</td>
        <td class="col-frames">${frames}</td>
        <td class="col-maze" title="${mazeName || mazeIdStr}">${mazeId}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); app.removeFromBatch('${this.currentBatchId}', '${sim._id}')">
            Remove
          </button>
        </td>
      `;

      row.addEventListener('click', () => {
        this.viewSimulationDetails(sim._id);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listEl.appendChild(table);
  }

  showCreateBatchDialog() {
    const batchName = prompt('Enter batch name:');
    if (!batchName || batchName.trim() === '') return;

    const batchDescription = prompt('Enter batch description (optional):');

    this.createBatch(batchName.trim(), batchDescription ? batchDescription.trim() : '');
  }

  async createBatch(name, description) {
    try {
      Formatters.showLoading(true);
      await GameAPI.createBatch(name, description);
      Formatters.showLoading(false);
      Formatters.showToast(`Batch "${name}" created successfully`, 'success');
      this.loadPage('results');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error creating batch: ${error.message}`, 'error');
    }
  }

  async deleteBatch(batchId) {
    if (!confirm('Are you sure you want to delete this batch? Simulations will not be deleted.')) {
      return;
    }

    try {
      await GameAPI.deleteBatch(batchId);
      Formatters.showToast('Batch deleted successfully', 'success');
      this.loadPage('results');
    } catch (error) {
      Formatters.showToast(`Error deleting batch: ${error.message}`, 'error');
    }
  }

  async removeFromBatch(batchId, simulationId) {
    if (!confirm('Remove this simulation from batch?')) {
      return;
    }

    try {
      Formatters.showLoading(true);
      await GameAPI.removeSimulationFromBatch(batchId, simulationId);
      Formatters.showLoading(false);
      Formatters.showToast('Simulation removed from batch', 'success');
      // Reload batch view
      this.renderBatchView(document.getElementById('app-container'), batchId);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error removing simulation: ${error.message}`, 'error');
    }
  }
  
  renderSimulationControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'list-controls';
    controlsContainer.innerHTML = `
      <div class="filter-sort-bar">
        <div class="filter-group">
          <label>Outcome:</label>
          <select id="sim-filter-outcome" class="control-select">
            <option value="all">All</option>
            <option value="escaped">Escaped</option>
            <option value="caught">Caught</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Min Score:</label>
          <input type="number" id="sim-filter-score" class="control-input" placeholder="0" min="0" value="0">
        </div>
        <div class="filter-group">
          <label>Sort By:</label>
          <select id="sim-sort-field" class="control-select">
            <option value="createdAt">Date</option>
            <option value="score">Score</option>
            <option value="duration">Duration</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Order:</label>
          <select id="sim-sort-order" class="control-select">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <button id="sim-reset-filters" class="btn btn-secondary btn-sm">Reset</button>
      </div>
    `;
    
    const simulationsList = document.getElementById('simulations-list');
    simulationsList.parentElement.insertBefore(controlsContainer, simulationsList);
    
    // Event listeners
    document.getElementById('sim-filter-outcome').addEventListener('change', (e) => {
      this.simulationFilters.outcome = e.target.value;
      this.renderSimulationsList(this.filterAndSortSimulations(this.simulationsData));
    });
    
    document.getElementById('sim-filter-score').addEventListener('input', (e) => {
      this.simulationFilters.minScore = parseInt(e.target.value) || 0;
      this.renderSimulationsList(this.filterAndSortSimulations(this.simulationsData));
    });
    
    document.getElementById('sim-sort-field').addEventListener('change', (e) => {
      this.simulationSort.field = e.target.value;
      this.renderSimulationsList(this.filterAndSortSimulations(this.simulationsData));
    });
    
    document.getElementById('sim-sort-order').addEventListener('change', (e) => {
      this.simulationSort.order = e.target.value;
      this.renderSimulationsList(this.filterAndSortSimulations(this.simulationsData));
    });
    
    document.getElementById('sim-reset-filters').addEventListener('click', () => {
      this.simulationFilters = { outcome: 'all', minScore: 0 };
      this.simulationSort = { field: 'createdAt', order: 'desc' };
      document.getElementById('sim-filter-outcome').value = 'all';
      document.getElementById('sim-filter-score').value = '0';
      document.getElementById('sim-sort-field').value = 'createdAt';
      document.getElementById('sim-sort-order').value = 'desc';
      this.renderSimulationsList(this.filterAndSortSimulations(this.simulationsData));
    });
  }

  filterAndSortSimulations(simulations) {
    let filtered = [...simulations];
    
    // Apply filters
    if (this.simulationFilters.outcome !== 'all') {
      filtered = filtered.filter(sim => {
        const caught = sim.results?.caught;
        return this.simulationFilters.outcome === 'caught' ? caught : !caught;
      });
    }
    
    if (this.simulationFilters.minScore > 0) {
      filtered = filtered.filter(sim => (sim.results?.score || 0) >= this.simulationFilters.minScore);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch(this.simulationSort.field) {
        case 'score':
          aVal = a.results?.score || 0;
          bVal = b.results?.score || 0;
          break;
        case 'duration':
          aVal = a.results?.duration || 0;
          bVal = b.results?.duration || 0;
          break;
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          return this.simulationSort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
      }
      
      return this.simulationSort.order === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    return filtered;
  }

  renderSimulationsList(simulations) {
    const listEl = document.getElementById('simulations-list');
    if (!listEl) {
      console.error('simulations-list element not found');
      return;
    }
    
    console.log('Rendering simulations table with', simulations.length, 'simulations');
    listEl.innerHTML = '';
    
    if (simulations.length === 0) {
      console.log('No simulations to display');
      return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'simulations-table';
    console.log('Table created with class:', table.className);
    
    // Create header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Outcome</th>
        <th>Score</th>
        <th>Duration</th>
        <th title="Memory usage rate (bytes/second) - normalized for comparison">Pac Memory Rate</th>
        <th>Ghosts</th>
        <th>Maze ID</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    simulations.forEach((sim, idx) => {
      const row = document.createElement('tr');
      
      // Calculate some stats
      const outcome = sim.results.caught ? 'Caught' : 'Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const duration = Formatters.formatDuration(sim.results.duration || 0);
      const ghostCount = sim.ghostConfigs ? sim.ghostConfigs.length : 0;
      
      // Performance metrics
      const score = sim.results.score || 0;
      const pacmanMemoryRaw = sim.results.performanceMetrics?.pacman?.memoryUsage || 0;
      const pacmanMemoryPerSec = sim.results.performanceMetrics?.pacman?.memoryPerSecond || 0;
      const pacmanMemory = pacmanMemoryPerSec > 0 
        ? `${Formatters.formatBytes(pacmanMemoryPerSec)}/s`
        : (pacmanMemoryRaw > 0 ? Formatters.formatBytes(pacmanMemoryRaw) : 'N/A');
      const pacmanMemoryTitle = pacmanMemoryRaw > 0 
        ? `Total: ${Formatters.formatBytes(pacmanMemoryRaw)}, Rate: ${Formatters.formatBytes(pacmanMemoryPerSec)}/s`
        : 'No memory data';
      
      // Handle mazeId - it can be a string or an object
      const mazeIdStr = typeof sim.mazeId === 'string' ? sim.mazeId : (sim.mazeId?._id || sim.mazeId?.name || 'N/A');
      const mazeName = typeof sim.mazeId === 'object' ? sim.mazeId?.name : 'N/A';
      const mazeId = mazeIdStr.substring(0, 8) + '...';
      
      const createdDate = Formatters.formatDate(sim.createdAt);
      
      console.log(`Adding row ${idx}: ${sim.name}`);
      
      row.className = 'simulations-table-row';
      row.style.cursor = 'pointer';
      
      row.innerHTML = `
        <td class="col-name"><strong>${sim.name}</strong></td>
        <td class="col-outcome">
          <span class="outcome-badge" style="background-color: ${outcomeColor}20; color: ${outcomeColor}; border: 1px solid ${outcomeColor};">
            ${outcome}
          </span>
        </td>
        <td class="col-score"><strong>${score}</strong></td>
        <td class="col-duration">${duration}</td>
        <td class="col-memory" title="${pacmanMemoryTitle}">${pacmanMemory}</td>
        <td class="col-ghosts">${ghostCount}</td>
        <td class="col-maze" title="${mazeName || mazeIdStr}">${mazeId}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-info btn-sm" onclick="event.stopPropagation(); app.showClassifyDialog('${sim._id}')">
            Classify
          </button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); app.deleteSimulation('${sim._id}')">
            Delete
          </button>
        </td>
      `;
      
      // Add click handler to view details
      row.addEventListener('click', () => {
        this.viewSimulationDetails(sim._id);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    listEl.appendChild(table);
    console.log('Table appended to DOM. Table element:', table);
  }
  
  async viewSimulationDetails(simulationId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getSimulationById(simulationId, false);
      const sim = response.simulation;
      
      Formatters.showLoading(false);
      
      // Create modal overlay
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        overflow-y: auto;
        padding: 40px 20px;
      `;
      
      const outcome = sim.results.caught ? 'Pacman was Caught' : 'Pacman Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const caughtBy = sim.results.caughtByGhost ? ` by ${sim.results.caughtByGhost.toUpperCase()}` : '';
      
      modal.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; background: rgba(10, 14, 48, 0.98); padding: 30px; border-radius: 16px; border: 1px solid rgba(99, 116, 255, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
            <div>
              <h2 style="color: #fff; margin-bottom: 10px;">${sim.name}</h2>
              <p style="color: #9aa4ff;">Simulation Details</p>
            </div>
            <button id="close-modal" class="btn btn-secondary">Close</button>
          </div>
          
          <!-- Outcome Summary -->
          <div style="background: rgba(99, 116, 255, 0.1); padding: 20px; border-radius: 8px; border: 2px solid ${outcomeColor}; margin-bottom: 30px;">
            <h3 style="color: ${outcomeColor}; margin-bottom: 10px;">${outcome}${caughtBy}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
              <div>
                <strong>Score:</strong> ${sim.results.score || 0}
              </div>
              <div>
                <strong>Duration:</strong> ${Formatters.formatDuration(sim.results.duration || 0)}
              </div>
              <div>
                <strong>Total Frames:</strong> ${sim.results.totalFrames || 0}
              </div>
              ${sim.results.caught ? `
                <div>
                  <strong>Caught At:</strong> Frame ${sim.results.caughtFrame || 'N/A'}
                </div>
                <div>
                  <strong>Time to Catch:</strong> ${Formatters.formatDuration(sim.results.caughtTime || 0)}
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Performance Metrics: Pacman -->
          ${sim.results.performanceMetrics?.pacman && sim.results.performanceMetrics.pacman.memoryUsage > 0 ? `
          <div style="background: rgba(255, 193, 7, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #ffc107;">Pacman Performance</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Memory Usage:</strong><br/>
                ${Formatters.formatBytes(sim.results.performanceMetrics.pacman.memoryUsage)}
              </div>
              <div>
                <strong>Time Complexity:</strong><br/>
                ${sim.results.performanceMetrics.pacman.timeComplexity || 'N/A'}
              </div>
              <div>
                <strong>Avg Decision Time:</strong><br/>
                ${(sim.results.performanceMetrics.pacman.avgDecisionTime || 0).toFixed(3)} ms
              </div>
            </div>
          </div>
          ` : `
          <div style="background: rgba(255, 152, 0, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(255, 152, 0, 0.3); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #ff9800;">Performance Metrics Not Available</h3>
            <p style="color: #9aa4ff; margin-bottom: 10px;">
              This simulation preview doesn't include detailed performance metrics yet.
            </p>
            <p style="color: #9aa4ff; font-size: 14px;">
              <strong>For Trajectory mode:</strong> Save the simulation - backend will calculate full metrics (memory, decision time, complexity).<br/>
              <strong>For Bot mode:</strong> Basic metrics only (bot simulations can't recalculate with backend).
            </p>
          </div>
          `}
          
          <!-- Performance Metrics: Ghosts -->
          ${sim.results.performanceMetrics?.ghosts && sim.results.performanceMetrics.ghosts.length > 0 ? `
          <div style="background: rgba(99, 116, 255, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.3); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Ghost Performance Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
              ${sim.results.performanceMetrics.ghosts.map((ghost, idx) => `
                <div style="background: rgba(10, 14, 48, 0.5); padding: 15px; border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.2);">
                  <h4 style="color: #fff; margin-bottom: 10px;">${ghost.type ? ghost.type.toUpperCase() : `Ghost ${idx + 1}`}</h4>
                  <div style="font-size: 14px; line-height: 1.8;">
                    <p><strong>Algorithm:</strong> ${ghost.algorithm || 'N/A'}</p>
                    <p><strong>Memory:</strong> ${Formatters.formatBytes(ghost.memoryUsage || 0)}</p>
                    <p><strong>Time Complexity:</strong> ${ghost.timeComplexity || 'N/A'}</p>
                    <p><strong>Avg Decision Time:</strong> ${(ghost.avgDecisionTime || 0).toFixed(3)} ms</p>
                    <p><strong>Nodes Explored:</strong> ${ghost.pathNodesExplored || 0}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <!-- Maze Information -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Maze Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div>
                <strong>Maze ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all;">${typeof sim.mazeId === 'string' ? sim.mazeId : (sim.mazeId?._id || sim.mazeId?.name || 'N/A')}</code>
              </div>
              <div>
                <strong>Trajectory ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all;">${typeof sim.trajectoryId === 'string' ? sim.trajectoryId : (sim.trajectoryId?._id || sim.trajectoryId?.name || 'N/A')}</code>
              </div>
            </div>
          </div>
          
          <!-- Ghost Configurations -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Ghost Configurations (${sim.ghostConfigs ? sim.ghostConfigs.length : 0} Ghosts)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
              ${sim.ghostConfigs && sim.ghostConfigs.length > 0 ? sim.ghostConfigs.map((ghost, idx) => `
                <div style="background: rgba(10, 14, 48, 0.5); padding: 15px; border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.2);">
                  <h4 style="color: #fff; margin-bottom: 10px;">Ghost ${idx + 1}: ${ghost.ghostType ? ghost.ghostType.toUpperCase() : 'Unknown'}</h4>
                  <div style="font-size: 14px;">
                    <p><strong>Type:</strong> ${ghost.ghostType || 'N/A'}</p>
                    <p><strong>Start Position:</strong> (${ghost.startPosition ? ghost.startPosition.x : 'N/A'}, ${ghost.startPosition ? ghost.startPosition.y : 'N/A'})</p>
                    <p><strong>Behavior:</strong> ${this.getGhostBehaviorDescription(ghost.ghostType)}</p>
                  </div>
                </div>
              `).join('') : '<p style="color: #9aa4ff;">No ghost configurations available</p>'}
            </div>
          </div>
          
          <!-- Pacman Information -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Pacman Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Total Frames:</strong> ${sim.results.totalFrames || 0}
              </div>
              <div>
                <strong>Survival Time:</strong> ${Formatters.formatDuration(sim.results.duration || 0)}
              </div>
              ${sim.results.caught ? `
                <div>
                  <strong>Caught By:</strong> ${sim.results.caughtByGhost ? sim.results.caughtByGhost.toUpperCase() : 'Unknown'}
                </div>
              ` : `
                <div style="color: #4caf50;">
                  <strong>Status:</strong> Successfully Escaped
                </div>
              `}
            </div>
          </div>
          
          <!-- Metadata -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Metadata</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Created:</strong> ${Formatters.formatDate(sim.createdAt)}
              </div>
              <div>
                <strong>Simulation ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all; font-size: 12px;">${sim._id}</code>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Setup close button
      document.getElementById('close-modal').onclick = () => {
        document.body.removeChild(modal);
      };
      
      // Close on overlay click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
      
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading simulation details: ${error.message}`, 'error');
    }
  }
  
  getGhostBehaviorDescription(ghostType) {
    const behaviors = {
      'blinky': 'Direct chaser - Always targets Pacman\'s current position',
      'pinky': 'Ambusher - Targets 4 tiles ahead of Pacman',
      'inky': 'Flanker - Uses vector from Blinky to target ahead of Pacman',
      'clyde': 'Random - Chases when far, scatters when close'
    };
    return behaviors[ghostType] || 'Unknown behavior';
  }
  
  async deleteSimulation(simulationId) {
    if (!confirm('Are you sure you want to delete this simulation?')) {
      return;
    }
    
    try {
      await GameAPI.deleteSimulation(simulationId);
      Formatters.showToast('Simulation deleted successfully', 'success');
      // Reload the results page
      this.loadPage('results');
    } catch (error) {
      Formatters.showToast(`Error deleting simulation: ${error.message}`, 'error');
    }
  }
  
  async promptSaveSimulation(results) {
    const save = confirm(`Simulation complete! ${results.caught ? 'Pacman was caught!' : 'Pacman escaped!'}\n\nDo you want to save this simulation?`);
    
    if (save) {
      const name = prompt('Enter simulation name:');
      if (name) {
        try {
          Formatters.showLoading(true);
          
          // Ensure results are properly structured (deep clone to avoid reference issues)
          const cleanResults = JSON.parse(JSON.stringify(results));
          
          // Use duration from results (already calculated in SimulationViewer)
          if (!cleanResults.duration) {
            cleanResults.duration = this.simulationViewer.simulationElapsedTime || 0;
          }
          
          // Ensure trajectoryId is set
          let trajectoryId = this.lastRecordedTrajectory.trajectoryId || 'demo-trajectory';
          
          // Check if this is a bot simulation (no real trajectory)
          const isBotSimulation = trajectoryId === 'bot-simulation' || trajectoryId === 'demo-trajectory';
          
          if (isBotSimulation) {
            console.log('Bot simulation detected - using demo-trajectory placeholder');
            trajectoryId = 'demo-trajectory';
          }
          
          // Save with performance metrics from frontend
          const simulationData = {
            name,
            trajectoryId: trajectoryId,
            mazeId: this.lastRecordedTrajectory.mazeId,
            ghostConfigs: this.simulationViewer.ghostConfigs.map(config => ({
              type: config.type,
              algorithm: config.algorithm || 'astar',
              startPos: config.startPos
            })),
            results: cleanResults // Includes frontend-calculated performance metrics
          };
          
          console.log('Saving simulation with performance metrics:', simulationData);
          
          const response = await GameAPI.saveSimulation(simulationData);
          
          Formatters.showLoading(false);
          Formatters.showToast(`Simulation saved with performance metrics!`, 'success');
        } catch (error) {
          Formatters.showLoading(false);
          console.error('Error saving simulation:', error);
          Formatters.showToast(`Simulation results recorded but save failed: ${error.message}`, 'info');
        }
      }
    }
  }

  async showClassifyDialog(simulationId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getAllBatches(1, 100);
      const batches = response.batches || [];
      Formatters.showLoading(false);

      if (batches.length === 0) {
        Formatters.showToast('No batches found. Create a batch first!', 'info');
        return;
      }

      // Create modal dialog
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;

      modal.innerHTML = `
        <div style="max-width: 500px; width: 100%; background: rgba(10, 14, 48, 0.98); padding: 30px; border-radius: 16px; border: 1px solid rgba(99, 116, 255, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Classify Simulation to Batch</h3>
            <button id="close-classify-modal" style="background: none; border: none; color: var(--accent-blue); font-size: 24px; cursor: pointer;">×</button>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 600;">Select a batch:</label>
            <select id="batch-select" style="width: 100%; padding: 12px; background: rgba(11, 14, 43, 0.85); border: 1px solid rgba(132, 141, 255, 0.25); color: var(--text-primary); border-radius: 8px; font-size: 1rem;">
              ${batches.map(batch => `<option value="${batch._id}">${batch.name}</option>`).join('')}
            </select>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-secondary" id="cancel-classify-btn">Cancel</button>
            <button class="btn btn-primary" id="confirm-classify-btn">Classify</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('close-classify-modal').onclick = () => {
        document.body.removeChild(modal);
      };

      document.getElementById('cancel-classify-btn').onclick = () => {
        document.body.removeChild(modal);
      };

      document.getElementById('confirm-classify-btn').onclick = async () => {
        const batchId = document.getElementById('batch-select').value;
        if (batchId) {
          await this.addSimulationToBatch(batchId, simulationId);
          document.body.removeChild(modal);
        }
      };

      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading batches: ${error.message}`, 'error');
    }
  }

  async addSimulationToBatch(batchId, simulationId) {
    try {
      Formatters.showLoading(true);
      await GameAPI.addSimulationsToBatch(batchId, [simulationId]);
      Formatters.showLoading(false);
      Formatters.showToast('Simulation added to batch', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error adding simulation to batch: ${error.message}`, 'error');
    }
  }

  async renderAPI(container) {
    const baseUrl = window.location.origin;
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>API Documentation</h2>
          <p>Automate simulations and batch operations via REST API</p>
        </div>
        
        <div style="background: rgba(99, 116, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #6374ff;">
          <h3 style="margin: 0 0 8px 0; color: #6374ff;">Base URL</h3>
          <code style="background: rgba(10, 14, 48, 0.6); padding: 8px 12px; border-radius: 4px; display: block; color: #e6e8ff;">${baseUrl}/api</code>
        </div>

        <!-- Mazes Section -->
        <div class="api-section">
          <h3 style="color: #6374ff; margin-top: 32px;">Mazes</h3>
          
          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method get">GET</span>
              <code>/mazes</code>
              <span class="endpoint-desc">Get all mazes</span>
            </div>
            <div class="endpoint-body">
              <h4>Query Parameters:</h4>
              <ul>
                <li><code>page</code> (optional): Page number (default: 1)</li>
                <li><code>limit</code> (optional): Results per page (default: 20)</li>
              </ul>
              <h4>Example (cURL):</h4>
              <pre><code>curl "${baseUrl}/api/mazes?page=1&limit=10"</code></pre>
              <h4>Example (JavaScript):</h4>
              <pre><code>fetch('${baseUrl}/api/mazes?page=1&limit=10')
  .then(res => res.json())
  .then(data => console.log(data.mazes));</code></pre>
            </div>
          </div>

          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method get">GET</span>
              <code>/mazes/:id</code>
              <span class="endpoint-desc">Get maze by ID</span>
            </div>
            <div class="endpoint-body">
              <h4>Example (cURL):</h4>
              <pre><code>curl "${baseUrl}/api/mazes/{MAZE_ID}"</code></pre>
            </div>
          </div>
        </div>

        <!-- Batches Section -->
        <div class="api-section">
          <h3 style="color: #6374ff; margin-top: 32px;">Batches</h3>
          
          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method post">POST</span>
              <code>/batches</code>
              <span class="endpoint-desc">Create a new batch</span>
            </div>
            <div class="endpoint-body">
              <h4>Request Body:</h4>
              <pre><code>{
  "name": "a_star_batch",
  "description": "A* ghost algorithm tests"
}</code></pre>
              <h4>Example (cURL):</h4>
              <pre><code>curl -X POST "${baseUrl}/api/batches" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"a_star_batch","description":"A* tests"}'</code></pre>
            </div>
          </div>

          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method get">GET</span>
              <code>/batches</code>
              <span class="endpoint-desc">Get all batches</span>
            </div>
            <div class="endpoint-body">
              <h4>Example (JavaScript):</h4>
              <pre><code>fetch('${baseUrl}/api/batches')
  .then(res => res.json())
  .then(data => console.log(data.batches));</code></pre>
            </div>
          </div>

          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method get">GET</span>
              <code>/batches/:id</code>
              <span class="endpoint-desc">Get batch with simulations</span>
            </div>
            <div class="endpoint-body">
              <h4>Example:</h4>
              <pre><code>curl "${baseUrl}/api/batches/{BATCH_ID}"</code></pre>
            </div>
          </div>

          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method post">POST</span>
              <code>/batches/:id/add-simulations</code>
              <span class="endpoint-desc">Add simulations to batch</span>
            </div>
            <div class="endpoint-body">
              <h4>Request Body:</h4>
              <pre><code>{
  "simulationIds": ["sim_id_1", "sim_id_2"]
}</code></pre>
            </div>
          </div>
        </div>

        <!-- Simulations Section -->
        <div class="api-section">
          <h3 style="color: #6374ff; margin-top: 32px;">Simulations</h3>
          
          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method post">POST</span>
              <code>/simulations</code>
              <span class="endpoint-desc">Save simulation results</span>
            </div>
            <div class="endpoint-body">
              <h4>Request Body:</h4>
              <pre><code>{
  "name": "A* Test Run 1",
  "mazeId": "maze_id_here",
  "trajectoryId": "bot-simulation",
  "ghostConfigs": [
    {
      "type": "blinky",
      "algorithm": "astar",
      "startPosition": { "x": 1, "y": 1 }
    }
  ],
  "results": {
    "caught": false,
    "duration": 45000,
    "score": 280,
    "totalFrames": 450
  }
}</code></pre>
              <h4>Example (JavaScript):</h4>
              <pre><code>fetch('${baseUrl}/api/simulations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Simulation',
    mazeId: mazeId,
    trajectoryId: 'bot-simulation',
    ghostConfigs: ghostConfigs,
    results: simulationResults
  })
})
  .then(res => res.json())
  .then(data => console.log('Saved:', data.simulation._id));</code></pre>
            </div>
          </div>

          <div class="api-endpoint">
            <div class="endpoint-header">
              <span class="http-method get">GET</span>
              <code>/simulations</code>
              <span class="endpoint-desc">Get all simulations</span>
            </div>
            <div class="endpoint-body">
              <h4>Example:</h4>
              <pre><code>curl "${baseUrl}/api/simulations?page=1&limit=20"</code></pre>
            </div>
          </div>
        </div>

        <!-- Automation Script Example -->
        <div class="api-section" style="background: rgba(255, 152, 0, 0.1); border-radius: 8px; padding: 20px; margin-top: 32px; border-left: 4px solid #ff9800;">
          <h3 style="color: #ff9800; margin-top: 0;">Automation Script Example</h3>
          <p style="color: #9aa4ff;">Complete Node.js script for running 5 A* batch simulations:</p>
          <pre style="max-height: 500px; overflow-y: auto;"><code>// batch_simulation.js
// Run with: node batch_simulation.js

const API_BASE = '${baseUrl}/api';

async function runBatchSimulations() {
  try {
    // 1. Get first available maze
    const mazesRes = await fetch(\`\${API_BASE}/mazes?limit=1\`);
    const mazesData = await mazesRes.json();
    
    if (!mazesData.mazes || mazesData.mazes.length === 0) {
      throw new Error('No mazes available');
    }
    
    const maze = mazesData.mazes[0];
    console.log(\`Using maze: \${maze.name} (\${maze._id})\`);
    
    // 2. Create batch
    const batchRes = await fetch(\`\${API_BASE}/batches\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'a_star_batch',
        description: 'A* ghost algorithm - 5 simulations with greedy pacman'
      })
    });
    
    const batchData = await batchRes.json();
    const batchId = batchData.batch._id;
    console.log(\`Created batch: \${batchData.batch.name} (\${batchId})\`);
    
    // 3. Run 5 simulations (client-side simulation required)
    const simulationIds = [];
    
    for (let i = 0; i < 5; i++) {
      console.log(\`\\nRunning simulation \${i + 1}/5...\`);
      
      // Ghost configs: 4 ghosts all using A*
      const ghostConfigs = [
        { type: 'blinky', algorithm: 'astar', startPosition: { x: 1, y: 1 } },
        { type: 'pinky', algorithm: 'astar', startPosition: { x: maze.config.width - 2, y: 1 } },
        { type: 'inky', algorithm: 'astar', startPosition: { x: 1, y: maze.config.height - 2 } },
        { type: 'clyde', algorithm: 'astar', startPosition: { x: maze.config.width - 2, y: maze.config.height - 2 } }
      ];
      
      // NOTE: Actual simulation must be run in browser
      // This is a placeholder for demonstration
      const mockResults = {
        caught: Math.random() > 0.5,
        duration: 30000 + Math.random() * 20000,
        score: Math.floor(200 + Math.random() * 200),
        totalFrames: Math.floor(300 + Math.random() * 200)
      };
      
      // Save simulation
      const simRes = await fetch(\`\${API_BASE}/simulations\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: \`A* Batch Test \${i + 1}\`,
          mazeId: maze._id,
          trajectoryId: 'bot-simulation',
          ghostConfigs: ghostConfigs,
          results: mockResults
        })
      });
      
      const simData = await simRes.json();
      simulationIds.push(simData.simulation._id);
      console.log(\`  ✓ Saved simulation: \${simData.simulation._id}\`);
    }
    
    // 4. Add all simulations to batch
    console.log(\`\\nAdding \${simulationIds.length} simulations to batch...\`);
    const addRes = await fetch(\`\${API_BASE}/batches/\${batchId}/add-simulations\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulationIds })
    });
    
    const finalBatch = await addRes.json();
    console.log(\`\\n✓ Batch complete!\`);
    console.log(\`  Batch ID: \${batchId}\`);
    console.log(\`  Total simulations: \${finalBatch.batch.simulations.length}\`);
    console.log(\`  View at: ${baseUrl}/#results\`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the batch
runBatchSimulations();</code></pre>
          <div class="action-buttons" style="margin-top: 16px;">
            <button class="btn btn-primary" onclick="app.downloadAutomationScript()">
              ⬇ Download Script
            </button>
          </div>
        </div>

        <div style="margin-top: 32px; padding: 16px; background: rgba(76, 175, 80, 0.1); border-radius: 8px; border-left: 4px solid #4caf50;">
          <h4 style="color: #4caf50; margin: 0 0 8px 0;">💡 Pro Tips</h4>
          <ul style="color: #9aa4ff; margin: 0; padding-left: 20px;">
            <li>Always create a batch before running simulations for easier organization</li>
            <li>Use descriptive batch names to track different algorithm combinations</li>
            <li>Simulations require browser execution - you can't run physics simulations purely server-side</li>
            <li>Use the automation script as a template for your custom testing scenarios</li>
            <li>Check the Results page to view batch statistics and compare algorithm performance</li>
          </ul>
        </div>
      </div>
    `;
  }

  downloadAutomationScript() {
    const baseUrl = window.location.origin;
    const scriptContent = `// batch_simulation.js
// Pacman Lab - Batch Simulation Automation Script
// Run with: node batch_simulation.js

const API_BASE = '${baseUrl}/api';

async function runBatchSimulations() {
  try {
    // 1. Get first available maze
    const mazesRes = await fetch(\`\${API_BASE}/mazes?limit=1\`);
    const mazesData = await mazesRes.json();
    
    if (!mazesData.mazes || mazesData.mazes.length === 0) {
      throw new Error('No mazes available. Please create a maze first.');
    }
    
    const maze = mazesData.mazes[0];
    console.log(\`Using maze: \${maze.name} (\${maze._id})\`);
    
    // 2. Create batch
    const batchRes = await fetch(\`\${API_BASE}/batches\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'a_star_batch',
        description: 'A* ghost algorithm - 5 simulations with greedy pacman'
      })
    });
    
    const batchData = await batchRes.json();
    const batchId = batchData.batch._id;
    console.log(\`Created batch: \${batchData.batch.name} (\${batchId})\`);
    
    // 3. Run 5 simulations
    // NOTE: In production, you should run actual simulations in the browser
    // This script uses mock data for demonstration
    const simulationIds = [];
    
    for (let i = 0; i < 5; i++) {
      console.log(\`\\nRunning simulation \${i + 1}/5...\`);
      
      // Ghost configs: 4 ghosts all using A*
      const ghostConfigs = [
        { type: 'blinky', algorithm: 'astar', startPosition: { x: 1, y: 1 } },
        { type: 'pinky', algorithm: 'astar', startPosition: { x: maze.config.width - 2, y: 1 } },
        { type: 'inky', algorithm: 'astar', startPosition: { x: 1, y: maze.config.height - 2 } },
        { type: 'clyde', algorithm: 'astar', startPosition: { x: maze.config.width - 2, y: maze.config.height - 2 } }
      ];
      
      // Mock simulation results (replace with actual simulation in production)
      const mockResults = {
        caught: Math.random() > 0.5,
        duration: 30000 + Math.random() * 20000,
        score: Math.floor(200 + Math.random() * 200),
        totalFrames: Math.floor(300 + Math.random() * 200),
        catchPosition: null,
        catchTime: null,
        frames: []
      };
      
      // Save simulation
      const simRes = await fetch(\`\${API_BASE}/simulations\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: \`A* Batch Test \${i + 1}\`,
          mazeId: maze._id,
          trajectoryId: 'bot-simulation',
          ghostConfigs: ghostConfigs,
          results: mockResults
        })
      });
      
      if (!simRes.ok) {
        throw new Error(\`Failed to save simulation: \${simRes.statusText}\`);
      }
      
      const simData = await simRes.json();
      simulationIds.push(simData.simulation._id);
      console.log(\`  ✓ Saved simulation: \${simData.simulation._id}\`);
      
      // Small delay between simulations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 4. Add all simulations to batch
    console.log(\`\\nAdding \${simulationIds.length} simulations to batch...\`);
    const addRes = await fetch(\`\${API_BASE}/batches/\${batchId}/add-simulations\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulationIds })
    });
    
    if (!addRes.ok) {
      throw new Error(\`Failed to add simulations to batch: \${addRes.statusText}\`);
    }
    
    const finalBatch = await addRes.json();
    console.log(\`\\n✅ Batch complete!\`);
    console.log(\`  Batch ID: \${batchId}\`);
    console.log(\`  Batch Name: \${finalBatch.batch.name}\`);
    console.log(\`  Total simulations: \${finalBatch.batch.simulations.length}\`);
    console.log(\`\\n  View results at: ${baseUrl}/#results\`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the batch
console.log('Starting batch simulation automation...\\n');
runBatchSimulations()
  .then(() => {
    console.log('\\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\\n❌ Script failed:', error);
    process.exit(1);
  });
`;

    // Create download
    const blob = new Blob([scriptContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_simulation.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Formatters.showToast('Script downloaded! Run with: node batch_simulation.js', 'success');
  }
}

// Initialize app
const app = new PacmanLabApp();

// Modal Management
class ModalManager {
  constructor() {
    this.modalContainer = document.getElementById('modal-container');
    this.modalBody = document.getElementById('modal-body');
    this.modalOverlay = this.modalContainer.querySelector('.modal-overlay');
    this.closeBtn = document.getElementById('modal-close-btn');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Click outside to close
    this.modalOverlay.addEventListener('click', () => this.close());
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalContainer.style.display !== 'none') {
        this.close();
      }
    });
    
    // Modal links
    document.querySelectorAll('[data-modal]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const modalType = link.getAttribute('data-modal');
        this.open(modalType);
      });
    });
  }

  open(type) {
    this.modalBody.innerHTML = this.getContent(type);
    this.modalContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modalContainer.style.display = 'none';
    document.body.style.overflow = '';
  }

  getContent(type) {
    const baseUrl = window.location.origin;
    
    switch(type) {
      case 'documentation':
        return `
          <h2>Documentation</h2>
          <p>Welcome to Pacman Lab documentation. This platform provides comprehensive tools for analyzing AI algorithms in a game-theoretic environment.</p>
          
          <h3>Getting Started</h3>
          <p>Follow these steps to begin your AI research journey:</p>
          <ul>
            <li><strong>Generate a Maze:</strong> Use the Maze Generator to create custom labyrinths with different algorithms (Recursive Backtracker, Kruskal's, Prim's, Wilson's)</li>
            <li><strong>Play Mode:</strong> Record human gameplay trajectories by playing mazes with keyboard controls (Arrow keys or WASD)</li>
            <li><strong>AI Simulation:</strong> Test ghost algorithms (A*, BFS) against Pacman AIs (Greedy, Defensive, Aggressive, Random Walker)</li>
            <li><strong>Analyze Results:</strong> View detailed performance metrics, batch statistics, and algorithm comparisons</li>
          </ul>
          
          <h3>Features</h3>
          <ul>
            <li><strong>Maze Generation:</strong> 5 different algorithms with customizable parameters (size, density, pellet placement)</li>
            <li><strong>Human Gameplay Recording:</strong> Record your own trajectories for later AI replay</li>
            <li><strong>Bot Simulations:</strong> Run automated tests with configurable Pacman and Ghost AIs</li>
            <li><strong>Performance Metrics:</strong> Memory usage, decision times, nodes explored, time complexity analysis</li>
            <li><strong>Batch Management:</strong> Group simulations for statistical analysis and comparison</li>
            <li><strong>API Automation:</strong> REST API endpoints for programmatic control and batch processing</li>
          </ul>
          
          <h3>Algorithm Support</h3>
          <p><strong>Ghost Algorithms:</strong></p>
          <ul>
            <li>A* (A-Star): Optimal pathfinding with heuristic</li>
            <li>BFS (Breadth-First Search): Guaranteed shortest path</li>
          </ul>
          <p><strong>Pacman Algorithms:</strong></p>
          <ul>
            <li>Greedy: Moves toward nearest pellet</li>
            <li>Defensive: Prioritizes avoiding ghosts</li>
            <li>Aggressive: Focuses on fast pellet collection</li>
            <li>Random Walker: Random movement with ghost avoidance</li>
          </ul>
          
          <h3>API Documentation</h3>
          <p>Access the <strong>API Docs</strong> page from the sidebar for complete REST API reference, automation scripts, and integration examples.</p>
          
          <h3>Performance Analysis</h3>
          <p>The Results page provides:</p>
          <ul>
            <li>Individual simulation details with performance metrics</li>
            <li>Batch statistics with mean, median, standard deviation</li>
            <li>Escape/catch rates and duration analysis</li>
            <li>Algorithm distribution charts</li>
            <li>Memory and decision time comparisons</li>
          </ul>
          
          <h3>Tips for Best Results</h3>
          <ul>
            <li>Start with smaller mazes (15x15) for faster simulations</li>
            <li>Use batch simulations to compare algorithms statistically</li>
            <li>Record multiple human trajectories for varied AI testing</li>
            <li>Check the API Docs for automation scripts to run large-scale tests</li>
            <li>Save important mazes and trajectories with descriptive names</li>
          </ul>
        `;
        
      case 'about':
        return `
          <h2>About Us</h2>
          <p>Pacman Lab is an advanced theoretical game analysis platform developed for research and education in artificial intelligence, pathfinding algorithms, and game theory.</p>
          
          <h3>Mission</h3>
          <p>Our mission is to provide researchers, students, and AI enthusiasts with a powerful yet accessible platform for exploring and comparing different AI algorithms in a controlled, game-based environment. Pacman Lab bridges the gap between theoretical algorithm knowledge and practical implementation analysis.</p>
          
          <h3>Key Objectives</h3>
          <ul>
            <li><strong>Educational Tool:</strong> Help students understand pathfinding algorithms through visual, interactive demonstrations</li>
            <li><strong>Research Platform:</strong> Enable researchers to conduct reproducible experiments on AI behavior and performance</li>
            <li><strong>Algorithm Comparison:</strong> Provide objective metrics for comparing different algorithmic approaches</li>
          </ul>
          
          <h3>Team</h3>
          <div class="contact-info">
            <div class="contact-card">
              <h4>Oussama BELHOUT</h4>

            </div>
            <div class="contact-card">
              <h4>Amir BENYAHIA</h4>
            </div>
            <div class="contact-card">
              <h4>Ahmed TAMANI</h4>
            </div>
          </div>
          
          <h3>Technology Stack</h3>
          <ul>
            <li><strong>Frontend:</strong> Vanilla JavaScript, HTML5 Canvas, CSS3</li>
            <li><strong>Backend:</strong> Node.js, Express.js, MongoDB</li>
            <li><strong>Algorithms:</strong> Python (NumPy, Matplotlib for analysis)</li>
            <li><strong>Deployment:</strong> Render (Web Services), MongoDB Atlas</li>
          </ul>
          
          <h3>License & Usage</h3>
          <p>Pacman Lab is developed for educational and research purposes. Feel free to use this platform for:</p>
          <ul>
            <li>Academic research and publications</li>
            <li>Classroom demonstrations and assignments</li>
            <li>Algorithm benchmarking and comparison studies</li>
            <li>Personal learning and experimentation</li>
          </ul>
          <p style="margin-top: 20px; padding: 16px; background: rgba(111, 125, 255, 0.1); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
            <strong>Citation:</strong> If you use Pacman Lab in your research, please cite this platform and reference our GitHub repository.
          </p>
          
          <h3>Future Roadmap</h3>
          <ul>
            <li>Additional pathfinding algorithms (Dijkstra's, JPS, Theta*)</li>
            <li>Machine learning integration for adaptive ghost behavior</li>
            <li>Multi-player support for competitive AI testing</li>
            <li>Real-time collaboration features</li>
            <li>Export capabilities for research papers (LaTeX, CSV)</li>
          </ul>
        `;
        
      case 'contact':
        return `
          <h2>Contact Us</h2>
          <p>We'd love to hear from you! Whether you have questions, feedback, or collaboration ideas, feel free to reach out.</p>
          
          <h3>Get in Touch</h3>
          <div class="contact-info">
            <div class="contact-card">
              <h4>Email</h4>
              <p><a href="mailto:oussama.belhout@example.com">oussama.belhout@etu.unice.fr</a></p>
              <p><a href="mailto:amir.benyahia@example.com">amir.benyahia@etu.unice.fr</a></p>
              <p><a href="mailto:nafissa.tamani@example.com">nafissa.tamani@etu.unice.fr</a></p>
            </div>
            <div class="contact-card">
              <h4>GitHub</h4>
              <p><a href="https://github.com/Amir-Benyahia/TER_S1_N" target="_blank">github.com/Amir-Benyahia/TER_S1_N</a></p>
              <p style="font-size: 0.9rem; color: var(--text-dim); margin-top: 8px;">View source code, report issues, contribute</p>
            </div>

          </div>
          
          <h3>Collaboration Opportunities</h3>
          <p>We welcome collaborations in the following areas:</p>
          <ul>
            <li><strong>Research Partnerships:</strong> Joint studies on AI algorithms and game theory</li>
            <li><strong>Educational Use:</strong> Integration into university courses and curriculum</li>
            <li><strong>Algorithm Development:</strong> Implementing new pathfinding or decision-making algorithms</li>
            <li><strong>Data Science:</strong> Statistical analysis and visualization of simulation results</li>
          </ul>
          
          <h3>Report Issues</h3>
          <p>Found a bug or have a feature request? Please submit an issue on our GitHub repository:</p>
          <p style="margin-top: 12px;">
            <a href="https://github.com/Amir-Benyahia/TER_S1_N/issues" target="_blank" style="display: inline-block; padding: 12px 24px; background: rgba(111, 125, 255, 0.2); border: 1px solid var(--accent-blue); border-radius: 8px; text-decoration: none; transition: var(--transition);">
              Submit an Issue
            </a>
          </p>
          
          <h3>Community</h3>
          <p>Join our community to discuss ideas, share results, and connect with other researchers:</p>
          <ul>
            <li>Star our GitHub repository to stay updated</li>
            <li>Follow development progress and release notes</li>
            <li>Participate in discussions and feature proposals</li>
            <li>Share your research findings using Pacman Lab</li>
          </ul>
          
          <h3>Acknowledgments</h3>
          <p>Special thanks to:</p>
          <ul>
            <li>University of Angers - Department of Computer Science</li>
            <li>Our academic supervisors and mentors</li>
            <li>Beta testers and early adopters who provided feedback</li>
          </ul>
          
          <p style="margin-top: 32px; padding: 20px; background: rgba(76, 175, 80, 0.1); border-radius: 8px; border-left: 4px solid #4caf50; text-align: center;">
            <strong style="color: #4caf50; font-size: 1.1rem;">Thank you for using Pacman Lab!</strong><br/>
            <span style="color: var(--text-secondary); font-size: 0.95rem;">We appreciate your interest and support in advancing AI research and education.</span>
          </p>
        `;
        
      default:
        return '<p>Content not found.</p>';
    }
  }
}

// Initialize modal manager
const modalManager = new ModalManager();


