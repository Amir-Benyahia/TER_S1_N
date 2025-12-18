"""
Expectimax Algorithm
Handles uncertainty in opponent behavior (probabilistic ghosts)
Better for non-deterministic games than Minimax
"""

from .base_pacman import BasePacmanAI
import random


class ExpectimaxPacman(BasePacmanAI):
    """
    Expectimax algorithm for decision making under uncertainty.
    
    Key differences from Minimax:
    - MIN nodes → CHANCE nodes (expected value)
    - Assumes ghosts move randomly (more realistic)
    - No alpha-beta pruning (need all branches for expectation)
    """
    
    def __init__(self, grid, depth=3):
        """
        Initialize Expectimax agent.
        
        Args:
            grid: 2D maze grid
            depth: Look-ahead depth
        """
        super().__init__(grid)
        self.max_depth = depth
        self.nodes_explored = 0
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Find best move using Expectimax algorithm.
        
        Returns:
            (x, y) tuple of next position
        """
        self.nodes_explored = 0
        
        valid_moves = self.get_valid_neighbors(pacman_pos)
        if not valid_moves:
            return pacman_pos
        
        best_move = valid_moves[0]
        best_value = float('-inf')
        
        for move in valid_moves:
            value = self._expectimax(
                move,
                ghost_positions,
                pellet_positions,
                depth=self.max_depth - 1,
                is_pacman_turn=False
            )
            
            if value > best_value:
                best_value = value
                best_move = move
        
        return best_move
    
    def _expectimax(self, pacman_pos, ghost_positions, pellet_positions,
                    depth, is_pacman_turn):
        """
        Recursive Expectimax evaluation.
        
        Args:
            pacman_pos: Current Pacman position
            ghost_positions: List of ghost positions
            pellet_positions: List of remaining pellets
            depth: Remaining search depth
            is_pacman_turn: True for MAX node, False for CHANCE node
        
        Returns:
            float: Expected value of this state
        """
        self.nodes_explored += 1
        
        # Terminal conditions
        if depth == 0:
            return self._evaluate_state(pacman_pos, ghost_positions, pellet_positions)
        
        # Check game over
        for ghost_pos in ghost_positions:
            if self.distance(pacman_pos, ghost_pos) <= 1:
                return -10000
        
        if not pellet_positions:
            return 10000
        
        if is_pacman_turn:
            # MAX node: Choose best action
            max_value = float('-inf')
            valid_moves = self.get_valid_neighbors(pacman_pos)
            
            for move in valid_moves:
                new_pellets = [p for p in pellet_positions if p != move]
                value = self._expectimax(
                    move, ghost_positions, new_pellets,
                    depth - 1, False
                )
                max_value = max(max_value, value)
            
            return max_value
        else:
            # CHANCE node: Calculate expected value over ghost actions
            total_value = 0
            num_scenarios = 0
            
            if ghost_positions:
                # Simulate each ghost moving randomly
                closest_ghost = min(ghost_positions,
                                   key=lambda g: self.distance(g, pacman_pos))
                
                ghost_moves = self.get_valid_neighbors(closest_ghost)
                other_ghosts = [g for g in ghost_positions if g != closest_ghost]
                
                # Weight moves: closer to Pacman = higher probability
                weighted_moves = self._weight_ghost_moves(
                    ghost_moves, pacman_pos, closest_ghost
                )
                
                for ghost_move, probability in weighted_moves:
                    new_ghost_positions = other_ghosts + [ghost_move]
                    
                    value = self._expectimax(
                        pacman_pos, new_ghost_positions, pellet_positions,
                        depth - 1, True
                    )
                    
                    total_value += value * probability
                    num_scenarios += 1
            
            return total_value if num_scenarios > 0 else 0
    
    def _weight_ghost_moves(self, moves, pacman_pos, ghost_pos):
        """
        Assign probabilities to ghost moves.
        Ghosts are more likely to move towards Pacman.
        
        Returns:
            List of (move, probability) tuples
        """
        if not moves:
            return []
        
        # Calculate how much each move reduces distance to Pacman
        current_dist = self.distance(ghost_pos, pacman_pos)
        
        weights = []
        for move in moves:
            new_dist = self.distance(move, pacman_pos)
            # Higher weight if moving closer to Pacman
            if new_dist < current_dist:
                weights.append(3.0)  # 3x more likely to chase
            elif new_dist == current_dist:
                weights.append(1.0)  # Neutral move
            else:
                weights.append(0.5)  # Less likely to move away
        
        # Normalize to probabilities
        total_weight = sum(weights)
        probabilities = [(move, w / total_weight) 
                        for move, w in zip(moves, weights)]
        
        return probabilities
    
    def _evaluate_state(self, pacman_pos, ghost_positions, pellet_positions):
        """
        State evaluation function.
        Similar to Minimax but considers uncertainty.
        """
        score = 0
        
        # Pellet collection score
        if pellet_positions:
            nearest_pellet_dist = min(self.distance(pacman_pos, p)
                                     for p in pellet_positions)
            score -= nearest_pellet_dist * 8
            score += (100 - len(pellet_positions)) * 40
        
        # Ghost avoidance with uncertainty discount
        if ghost_positions:
            # Calculate danger from all ghosts (weighted by distance)
            danger_score = 0
            for ghost_pos in ghost_positions:
                dist = self.distance(pacman_pos, ghost_pos)
                if dist < 4:
                    # Closer ghosts are exponentially more dangerous
                    danger_score += (4 - dist) ** 2 * 80
            
            score -= danger_score
        
        # Mobility bonus (prefer positions with more options)
        num_neighbors = len(self.get_valid_neighbors(pacman_pos))
        score += num_neighbors * 10
        
        return score
