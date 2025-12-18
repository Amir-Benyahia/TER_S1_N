"""
Influence Map Algorithm
Spatial reasoning for tactical awareness
Creates 'heat maps' of danger and opportunity
"""

from .base_pacman import BasePacmanAI
import numpy as np


class InfluenceMapPacman(BasePacmanAI):
    """
    Influence Map based decision making.
    
    Concept:
    - Create spatial maps representing danger (ghosts) and opportunity (pellets)
    - Combine maps with weights to make decisions
    - Choose positions with best combined influence
    
    Advanced technique used in RTS games and tactical AI
    """
    
    def __init__(self, grid):
        super().__init__(grid)
        
        # Create numpy arrays for influence maps
        self.danger_map = np.zeros((self.height, self.width))
        self.opportunity_map = np.zeros((self.height, self.width))
        self.combined_map = np.zeros((self.height, self.width))
        
        # Influence parameters
        self.ghost_influence_radius = 5
        self.pellet_influence_radius = 8
        self.danger_weight = 2.0
        self.opportunity_weight = 1.0
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Make decision based on influence maps.
        
        Returns:
            (x, y) tuple of next position
        """
        # Reset maps
        self.danger_map.fill(0)
        self.opportunity_map.fill(0)
        self.combined_map.fill(0)
        
        # Build danger map from ghosts
        self._build_danger_map(ghost_positions)
        
        # Build opportunity map from pellets
        self._build_opportunity_map(pellet_positions)
        
        # Combine maps
        self._combine_maps()
        
        # Choose best move based on combined influence
        valid_moves = self.get_valid_neighbors(pacman_pos)
        if not valid_moves:
            return pacman_pos
        
        best_move = valid_moves[0]
        best_score = self._get_influence_score(best_move)
        
        for move in valid_moves:
            score = self._get_influence_score(move)
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move
    
    def _build_danger_map(self, ghost_positions):
        """
        Build danger influence map from ghost positions.
        Danger spreads out from each ghost with falloff.
        """
        for ghost_pos in ghost_positions:
            gx, gy = ghost_pos
            
            # Propagate influence in radius around ghost
            for y in range(self.height):
                for x in range(self.width):
                    # Skip walls
                    if self.grid[y][x] == 1:
                        continue
                    
                    # Calculate Manhattan distance
                    dist = abs(x - gx) + abs(y - gy)
                    
                    # Apply influence with falloff
                    if dist <= self.ghost_influence_radius:
                        # Inverse square falloff (closer = much more dangerous)
                        influence = 100 / (dist + 1) ** 2
                        self.danger_map[y][x] += influence
    
    def _build_opportunity_map(self, pellet_positions):
        """
        Build opportunity influence map from pellet positions.
        Opportunity spreads from pellets with slower falloff.
        """
        for pellet_pos in pellet_positions:
            px, py = pellet_pos
            
            # Propagate influence
            for y in range(self.height):
                for x in range(self.width):
                    if self.grid[y][x] == 1:
                        continue
                    
                    dist = abs(x - px) + abs(y - py)
                    
                    # Apply influence with linear falloff
                    if dist <= self.pellet_influence_radius:
                        influence = (self.pellet_influence_radius - dist) * 5
                        self.opportunity_map[y][x] += influence
    
    def _combine_maps(self):
        """
        Combine danger and opportunity maps into single decision map.
        Formula: combined = opportunity - (danger * danger_weight)
        """
        self.combined_map = (
            self.opportunity_map * self.opportunity_weight - 
            self.danger_map * self.danger_weight
        )
    
    def _get_influence_score(self, position):
        """
        Get combined influence score at a position.
        
        Args:
            position: (x, y) tuple
        
        Returns:
            float: Influence score (higher is better)
        """
        x, y = position
        
        # Bounds check
        if not (0 <= y < self.height and 0 <= x < self.width):
            return float('-inf')
        
        return self.combined_map[y][x]
    
    def get_danger_map(self):
        """Export danger map for visualization"""
        return self.danger_map.copy()
    
    def get_opportunity_map(self):
        """Export opportunity map for visualization"""
        return self.opportunity_map.copy()
    
    def get_combined_map(self):
        """Export combined map for visualization"""
        return self.combined_map.copy()
