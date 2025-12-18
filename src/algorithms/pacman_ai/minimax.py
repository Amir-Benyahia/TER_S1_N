"""
Minimax Algorithm with Alpha-Beta Pruning
State-of-the-art game tree search for optimal decision making
"""

from .base_pacman import BasePacmanAI
import math


class MinimaxPacman(BasePacmanAI):
    """
    Minimax algorithm with alpha-beta pruning.
    Looks ahead multiple moves to find optimal strategy.
    
    Key concepts:
    - Game tree: Explores future states
    - Minimax: Assumes opponent plays optimally
    - Alpha-beta pruning: Cuts unnecessary branches
    - Evaluation function: Scores terminal states
    """
    
    def __init__(self, grid, depth=3):
        """
        Initialize Minimax agent.
        
        Args:
            grid: 2D maze grid
            depth: How many moves to look ahead (higher = smarter but slower)
        """
        super().__init__(grid)
        self.max_depth = depth
        self.nodes_explored = 0
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Find best move using minimax with alpha-beta pruning.
        
        Returns:
            (x, y) tuple of next position
        """
        self.nodes_explored = 0
        
        # Get valid moves
        valid_moves = self.get_valid_neighbors(pacman_pos)
        if not valid_moves:
            return pacman_pos
        
        # Evaluate each move using minimax
        best_move = valid_moves[0]
        best_value = float('-inf')
        alpha = float('-inf')
        beta = float('inf')
        
        for move in valid_moves:
            # Simulate Pacman moving to this position
            value = self._minimax(
                move, 
                ghost_positions, 
                pellet_positions,
                depth=self.max_depth - 1,
                is_pacman_turn=False,  # After Pacman moves, ghosts move
                alpha=alpha,
                beta=beta
            )
            
            if value > best_value:
                best_value = value
                best_move = move
            
            alpha = max(alpha, value)
        
        return best_move
    
    def _minimax(self, pacman_pos, ghost_positions, pellet_positions, 
                 depth, is_pacman_turn, alpha, beta):
        """ 
        Recursive minimax with alpha-beta pruning.
        
        Args:
            pacman_pos: Current Pacman position
            ghost_positions: List of ghost positions
            pellet_positions: List of remaining pellets
            depth: Remaining depth to search
            is_pacman_turn: True if Pacman's turn (MAX), False for ghosts (MIN)
            alpha: Best value for MAX player
            beta: Best value for MIN player
        
        Returns:
            float: Evaluated score of this state
        """
        self.nodes_explored += 1
        
        # Terminal conditions
        if depth == 0:
            return self._evaluate_state(pacman_pos, ghost_positions, pellet_positions)
        
        # Check if Pacman is caught
        for ghost_pos in ghost_positions:
            if self.distance(pacman_pos, ghost_pos) <= 1:
                return -10000  # Game over, very bad
        
        # Check if all pellets collected
        if not pellet_positions:
            return 10000  # Win, very good
        
        if is_pacman_turn:
            # MAX player (Pacman wants to maximize score)
            max_eval = float('-inf')
            valid_moves = self.get_valid_neighbors(pacman_pos)
            
            for move in valid_moves:
                # Remove pellet if at this position
                new_pellets = [p for p in pellet_positions if p != move]
                
                eval_score = self._minimax(
                    move, ghost_positions, new_pellets,
                    depth - 1, False, alpha, beta
                )
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                
                # Alpha-beta pruning
                if beta <= alpha:
                    break
            
            return max_eval
        else:
            # MIN player (Ghosts want to minimize Pacman's score)
            min_eval = float('inf')
            
            # Simulate ghost movements (simplified: closest ghost moves)
            if ghost_positions:
                closest_ghost = min(ghost_positions, 
                                   key=lambda g: self.distance(g, pacman_pos))
                
                ghost_moves = self.get_valid_neighbors(closest_ghost)
                other_ghosts = [g for g in ghost_positions if g != closest_ghost]
                
                for ghost_move in ghost_moves:
                    new_ghost_positions = other_ghosts + [ghost_move]
                    
                    eval_score = self._minimax(
                        pacman_pos, new_ghost_positions, pellet_positions,
                        depth - 1, True, alpha, beta
                    )
                    min_eval = min(min_eval, eval_score)
                    beta = min(beta, eval_score)
                    
                    # Alpha-beta pruning
                    if beta <= alpha:
                        break
            
            return min_eval
    
    def _evaluate_state(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Evaluation function for terminal states.
        Combines multiple factors into a single score.
        
        Returns:
            float: State evaluation score
        """
        score = 0
        
        # Factor 1: Distance to nearest pellet (want to minimize)
        if pellet_positions:
            nearest_pellet_dist = min(self.distance(pacman_pos, p) 
                                     for p in pellet_positions)
            score -= nearest_pellet_dist * 10
            
            # Bonus for having few pellets left
            score += (100 - len(pellet_positions)) * 50
        
        # Factor 2: Distance from ghosts (want to maximize)
        if ghost_positions:
            nearest_ghost_dist = min(self.distance(pacman_pos, g) 
                                    for g in ghost_positions)
            
            # Exponential penalty for being close to ghosts
            if nearest_ghost_dist < 5:
                score -= (5 - nearest_ghost_dist) ** 2 * 100
            else:
                score += nearest_ghost_dist * 5
        
        # Factor 3: Position in maze (prefer center over corners)
        center_x, center_y = self.width // 2, self.height // 2
        center_dist = self.distance(pacman_pos, (center_x, center_y))
        score -= center_dist * 2
        
        return score
