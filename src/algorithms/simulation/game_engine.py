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
from utils.performance_metrics import PerformanceTracker, ComplexityAnalyzer, ScoreCalculator


class GameEngine:
    """
    Simulates Pacman gameplay with ghosts.
    Replays a recorded trajectory and simulates ghost behavior.
    """
    
    def __init__(self, grid, ghost_configs):
        """
        Initialize game engine.
        
        Args:
            grid: 2D maze grid (0=walkable)
            ghost_configs: List of ghost configurations
                [{'type': 'blinky', 'algorithm': 'astar', 'startPos': (row, col)}, ...]
        """
        self.grid = grid
        self.ghosts = []
        self.performance_tracker = PerformanceTracker()
        self.complexity_analyzer = ComplexityAnalyzer()
        
        # Calculate maze size for score calculation
        self.maze_size = sum(1 for row in grid for cell in row if cell == 0)
        
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
                    # Normalize position format
                    if isinstance(start_pos, dict):
                        start_pos = (start_pos['y'], start_pos['x'])
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
    
    def simulate(self, trajectory):
        """
        Simulate a game with the given Pacman trajectory.
        
        Args:
            trajectory: List of Pacman positions/moves
                [{'position': {'x': , 'y': }, 'timestamp': , ...}, ...]
        
        Returns:
            dict: Simulation results with performance metrics
        """
        frames = []
        caught = False
        catch_position = None
        catch_time = None
        
        # Performance tracking
        simulation_start_time = time.perf_counter()
        self.performance_tracker.start_tracking('pacman')
        
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
                
                if next_pos:
                    agent.set_position(next_pos)
                    ghost['position'] = next_pos
                
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

