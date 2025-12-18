"""Game simulation engine for replaying trajectories with ghosts."""

import json
import sys
import os
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ghost_ai.blinky import BlinkyAgent
from ghost_ai.pinky import PinkyAgent
from ghost_ai.inky import InkyAgent
from ghost_ai.clyde import ClydeAgent
from pacman_ai import (
    GreedyPacman,
    DefensivePacman,
    AggressivePacman,
    RandomWalker,
    MinimaxPacman,
    ExpectimaxPacman,
    InfluenceMapPacman,
    MCTSPacman
)
from utils.performance_metrics import PerformanceTracker, ComplexityAnalyzer, ScoreCalculator


class GameEngine:
    """
    Simulates Pacman gameplay with ghosts.
    Replays a recorded trajectory and simulates ghost behavior.
    """
    
    def _is_walkable(self, pos):
        """
        Verifie si une position est valide et traversable.
        
        Args:
            pos: Position (row, col)
        
        Returns:
            bool: True si la position est OK, False sinon
        """
        if not pos:
            return False
        
        row, col = pos
        # Verifier que la position est dans les limites
        if row < 0 or row >= len(self.grid):
            return False
        if col < 0 or col >= len(self.grid[0]):
            return False
        
        # Verifier que ce n'est pas un mur (0 = passage, 1 = mur)
        return self.grid[row][col] != 1
    
    def _find_nearest_walkable(self, pos):
        """
        Trouve la case traversable la plus proche d'une position.
        
        Args:
            pos: Position de depart (row, col)
        
        Returns:
            tuple: Position traversable (row, col) ou None
        """
        if self._is_walkable(pos):
            return pos
        
        row, col = pos
        # Chercher autour dans un rayon croissant
        for radius in range(1, 10):
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    check_pos = (row + dr, col + dc)
                    if self._is_walkable(check_pos):
                        return check_pos
        
        # Si rien trouve, retourner la premiere case libre du labyrinthe
        for r in range(len(self.grid)):
            for c in range(len(self.grid[0])):
                if self.grid[r][c] == 0:
                    return (r, c)
        
        return None
    
    def _init_pacman_ai(self, pacman_config):
        """
        Initialize Pacman AI agent.
        
        Args:
            pacman_config: Dict with algorithm, depth, iterations, startPos
        """
        algorithm = pacman_config.get('algorithm', 'greedy').lower()
        depth = pacman_config.get('depth', 3)
        iterations = pacman_config.get('iterations', 1000)
        start_pos = pacman_config.get('startPos')
        
        # Map algorithm names to classes
        pacman_classes = {
            'greedy': GreedyPacman,
            'defensive': DefensivePacman,
            'aggressive': AggressivePacman,
            'random': RandomWalker,
            'minimax': lambda grid: MinimaxPacman(grid, depth=depth),
            'expectimax': lambda grid: ExpectimaxPacman(grid, depth=depth),
            'influence_map': InfluenceMapPacman,
            'mcts': lambda grid: MCTSPacman(grid, iterations=iterations)
        }
        
        if algorithm not in pacman_classes:
            print(f"Warning: Unknown Pacman algorithm '{algorithm}', using greedy")
            algorithm = 'greedy'
        
        # Create Pacman AI agent
        pacman_class = pacman_classes[algorithm]
        if callable(pacman_class) and not isinstance(pacman_class, type):
            # It's a lambda, call it
            self.pacman_ai = pacman_class(self.grid)
        else:
            # It's a class, instantiate it
            self.pacman_ai = pacman_class(self.grid)
        
        # Set initial position
        if start_pos:
            if isinstance(start_pos, dict):
                start_pos = (start_pos['y'], start_pos['x'])
            self.pacman_position = start_pos
        else:
            # Find first walkable cell
            self.pacman_position = self._find_nearest_walkable((1, 1))
        
        self.pacman_algorithm = algorithm
        
        # Start tracking for Pacman
        self.performance_tracker.start_tracking('pacman')
        
        print(f"✓ Initialized Pacman AI: {algorithm}")
    
    def __init__(self, grid, ghost_configs, pacman_config=None):
        """
        Initialize game engine.
        
        Args:
            grid: 2D maze grid (0=walkable)
            ghost_configs: List of ghost configurations
                [{'type': 'blinky', 'algorithm': 'astar', 'startPos': (row, col)}, ...]
            pacman_config: Optional Pacman AI configuration
                {'algorithm': 'greedy', 'depth': 3, 'iterations': 1000, 'startPos': (row, col)}
                If None, will replay trajectory. If provided, will use AI bot.
        """
        self.grid = grid
        self.ghosts = []
        self.pacman_ai = None
        self.use_pacman_ai = pacman_config is not None
        self.performance_tracker = PerformanceTracker()
        self.complexity_analyzer = ComplexityAnalyzer()
        
        # Calculate maze size for score calculation
        self.maze_size = sum(1 for row in grid for cell in row if cell == 0)
        
        # Initialize Pacman AI if configured
        if pacman_config:
            self._init_pacman_ai(pacman_config)
        
        # Initialize ghosts based on configurations
        ghost_classes = {
            'blinky': BlinkyAgent,
            'pinky': PinkyAgent,
            'inky': InkyAgent,
            'clyde': ClydeAgent
        }
        
        for config in ghost_configs:
            ghost_type = config.get('type', 'blinky').lower()
            algorithm = config.get('algorithm', 'astar')
            start_pos = config.get('startPos')
            
            if ghost_type in ghost_classes:
                ghost = ghost_classes[ghost_type](grid, algorithm)
                
                if start_pos:
                    # Normaliser le format de position
                    if isinstance(start_pos, dict):
                        start_pos = (start_pos['y'], start_pos['x'])
                    
                    # Valider que la position n'est pas dans un mur
                    if not self._is_walkable(start_pos):
                        print(f"Warning: {ghost_type} spawn dans un mur {start_pos}, correction...")
                        start_pos = self._find_nearest_walkable(start_pos)
                    
                    ghost.set_position(start_pos)
                
                ghost_id = f"{ghost_type}_{algorithm}"
                self.ghosts.append({
                    'agent': ghost,
                    'type': ghost_type,
                    'algorithm': algorithm,
                    'position': start_pos,
                    'id': ghost_id
                })
                
                # Start tracking for this ghost
                self.performance_tracker.start_tracking(ghost_id)
    
    def simulate(self, trajectory=None, max_steps=1000):
        """
        Simulate a game with the given Pacman trajectory or AI bot.
        
        Args:
            trajectory: List of Pacman positions/moves (optional if using Pacman AI)
                [{'position': {'x': , 'y': }, 'timestamp': , ...}, ...]
            max_steps: Maximum steps for AI bot simulation
        
        Returns:
            dict: Simulation results with performance metrics
        """
        frames = []
        caught = False
        catch_position = None
        catch_time = None
        
        # Performance tracking
        simulation_start_time = time.perf_counter()
        
        # Initialize pellets (simplified - all walkable cells)
        pellets = []
        for y in range(len(self.grid)):
            for x in range(len(self.grid[0])):
                if self.grid[y][x] == 0:
                    pellets.append((x, y))
        
        # Determine simulation mode
        if self.use_pacman_ai:
            # BOT MODE: Use Pacman AI
            results = self._simulate_with_pacman_ai(pellets, max_steps)
        else:
            # REPLAY MODE: Use provided trajectory
            if not trajectory:
                raise ValueError("Trajectory required when not using Pacman AI")
            results = self._simulate_replay(trajectory)
        
        return results
        
        # Get other ghost positions for Inky's calculation
        def get_ghost_positions():
            return {
                ghost['type']: ghost['position']
                for ghost in self.ghosts
            }
        
        # Simulate each frame
        for i, move in enumerate(trajectory):
            # Get Pacman position
            pacman_pos = move.get('position', {})
            if isinstance(pacman_pos, dict):
                pacman_pos = (pacman_pos.get('y'), pacman_pos.get('x'))
            
            pacman_dir = move.get('direction')
            timestamp = move.get('timestamp', i * 100)
            
            # Track Pacman decision (simple replay, minimal complexity)
            self.performance_tracker.record_decision('pacman', nodes_explored=0)
            
            # Update each ghost
            ghost_positions = []
            other_ghosts = get_ghost_positions()
            
            for ghost in self.ghosts:
                agent = ghost['agent']
                ghost_id = ghost['id']
                
                # Start timing for this ghost's decision
                decision_start = time.perf_counter()
                
                # Get next move for this ghost
                next_pos = agent.get_next_move(
                    pacman_pos,
                    pacman_dir,
                    other_ghosts
                )
                
                # Get nodes explored (if available from pathfinding)
                nodes_explored = getattr(agent, 'last_nodes_explored', 0)
                
                # Record decision metrics
                self.performance_tracker.record_decision(ghost_id, nodes_explored)
                
                # Valider que le mouvement ne va pas dans un mur
                if next_pos and self._is_walkable(next_pos):
                    agent.set_position(next_pos)
                    ghost['position'] = next_pos
                # Sinon le fantome reste sur place
                
                ghost_positions.append({
                    'type': ghost['type'],
                    'position': {'y': ghost['position'][0], 'x': ghost['position'][1]}
                })
                
                # Check collision
                if ghost['position'] == pacman_pos and not caught:
                    caught = True
                    catch_position = {'y': pacman_pos[0], 'x': pacman_pos[1]}
                    catch_time = timestamp
            
            # Record frame
            frames.append({
                'timestamp': timestamp,
                'pacman': {'y': pacman_pos[0], 'x': pacman_pos[1]},
                'ghosts': ghost_positions,
                'caught': caught
            })
            
            # Stop if caught
            if caught:
                break
        
        # Calculate simulation duration
        simulation_duration = (time.perf_counter() - simulation_start_time) * 1000  # en ms
        
        # Get performance metrics for each entity
        pacman_metrics = self.performance_tracker.get_metrics('pacman')
        
        ghost_metrics = []
        for ghost in self.ghosts:
            ghost_id = ghost['id']
            metrics = self.performance_tracker.get_metrics(ghost_id)
            complexity = self.complexity_analyzer.get_complexity(ghost['algorithm'], 'ghost')
            
            ghost_metrics.append({
                'type': ghost['type'],
                'algorithm': ghost['algorithm'],
                'memoryUsage': metrics['memoryUsage'],
                'timeComplexity': complexity['timeComplexity'],
                'avgDecisionTime': metrics['avgDecisionTime'],
                'pathNodesExplored': metrics['pathNodesExplored']
            })
        
        # Calculate score
        score = ScoreCalculator.calculate_score(
            trajectory_length=len(trajectory),
            pellets_eaten=0,  # TODO: Tracker les pellets si disponibles
            power_pellets_eaten=0,
            caught=caught,
            total_frames=len(frames),
            maze_size=self.maze_size
        )
        
        # Stop performance tracking
        self.performance_tracker.stop_tracking()
        
        return {
            'caught': caught,
            'catchPosition': catch_position,
            'catchTime': catch_time,
            'totalFrames': len(frames),
            'duration': simulation_duration,
            'score': score,
            'performanceMetrics': {
                'pacman': {
                    'memoryUsage': pacman_metrics['memoryUsage'],
                    'timeComplexity': 'O(1)',  # Replay is constant time
                    'avgDecisionTime': pacman_metrics['avgDecisionTime']
                },
                'ghosts': ghost_metrics
            },
            'frames': frames
        }

