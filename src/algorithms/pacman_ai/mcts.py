"""
Monte Carlo Tree Search (MCTS)
State-of-the-art algorithm used in AlphaGo and modern game AI
Balances exploration and exploitation through simulation
"""

from .base_pacman import BasePacmanAI
import random
import math


class MCTSNode:
    """
    Node in the MCTS search tree.
    Represents a game state with statistics from simulations.
    """
    
    def __init__(self, state, parent=None, action=None):
        """
        Args:
            state: (pacman_pos, ghost_positions, pellets)
            parent: Parent node
            action: Action that led to this node
        """
        self.state = state
        self.parent = parent
        self.action = action
        self.children = []
        self.visits = 0
        self.value = 0.0
        self.untried_actions = None
    
    def uct_value(self, exploration_constant=1.41):
        """
        Upper Confidence Bound for Trees (UCT).
        Balances exploitation (high value) vs exploration (rarely visited).
        
        Formula: value/visits + c * sqrt(ln(parent_visits) / visits)
        """
        if self.visits == 0:
            return float('inf')
        
        exploitation = self.value / self.visits
        exploration = exploration_constant * math.sqrt(
            math.log(self.parent.visits) / self.visits
        )
        
        return exploitation + exploration
    
    def is_fully_expanded(self):
        """Check if all child actions have been tried"""
        return self.untried_actions is not None and len(self.untried_actions) == 0
    
    def is_terminal(self):
        """Check if this is a terminal game state"""
        pacman_pos, ghost_positions, pellets = self.state
        
        # Check if caught
        for ghost_pos in ghost_positions:
            if abs(pacman_pos[0] - ghost_pos[0]) + abs(pacman_pos[1] - ghost_pos[1]) <= 1:
                return True
        
        # Check if won
        return len(pellets) == 0


class MCTSPacman(BasePacmanAI):
    """
    Monte Carlo Tree Search for Pacman decision making.
    
    MCTS Phases:
    1. Selection: Navigate tree using UCT
    2. Expansion: Add new child node
    3. Simulation: Random playout from new node
    4. Backpropagation: Update statistics up the tree
    """
    
    def __init__(self, grid, iterations=1000):
        """
        Initialize MCTS agent.
        
        Args:
            grid: 2D maze grid
            iterations: Number of MCTS iterations (more = better but slower)
        """
        super().__init__(grid)
        self.iterations = iterations
        self.exploration_constant = 1.41
        self.max_simulation_depth = 15
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Use MCTS to find best move.
        
        Returns:
            (x, y) tuple of next position
        """
        # Create root node for current state
        root_state = (pacman_pos, ghost_positions, pellet_positions)
        root = MCTSNode(root_state)
        
        # Initialize possible actions
        root.untried_actions = self.get_valid_neighbors(pacman_pos)
        
        if not root.untried_actions:
            return pacman_pos
        
        # Run MCTS iterations
        for _ in range(self.iterations):
            # 1. Selection: Traverse tree to select promising node
            node = self._select(root)
            
            # 2. Expansion: Add new child if not terminal
            if not node.is_terminal() and not node.is_fully_expanded():
                node = self._expand(node)
            
            # 3. Simulation: Random playout from this node
            value = self._simulate(node.state)
            
            # 4. Backpropagation: Update statistics
            self._backpropagate(node, value)
        
        # Choose best action based on visit count (most robust)
        best_child = max(root.children, key=lambda c: c.visits)
        return best_child.action
    
    def _select(self, node):
        """
        Selection phase: Navigate tree using UCT.
        Returns leaf node to expand or simulate from.
        """
        while node.children and node.is_fully_expanded():
            # Choose child with highest UCT value
            node = max(node.children, key=lambda c: c.uct_value(self.exploration_constant))
        
        return node
    
    def _expand(self, node):
        """
        Expansion phase: Add new child node.
        """
        if node.untried_actions is None:
            pacman_pos = node.state[0]
            node.untried_actions = self.get_valid_neighbors(pacman_pos)
        
        if node.untried_actions:
            # Choose random untried action
            action = random.choice(node.untried_actions)
            node.untried_actions.remove(action)
            
            # Create new state
            new_state = self._apply_action(node.state, action)
            
            # Create child node
            child = MCTSNode(new_state, parent=node, action=action)
            node.children.append(child)
            
            return child
        
        return node
    
    def _simulate(self, state):
        """
        Simulation phase: Random playout to terminal state.
        Returns value of the terminal state.
        """
        pacman_pos, ghost_positions, pellets = state
        depth = 0
        
        while depth < self.max_simulation_depth:
            # Check terminal conditions
            for ghost_pos in ghost_positions:
                if self.distance(pacman_pos, ghost_pos) <= 1:
                    return -1.0  # Lost
            
            if not pellets:
                return 1.0  # Won
            
            # Random Pacman move
            valid_moves = self.get_valid_neighbors(pacman_pos)
            if not valid_moves:
                return -0.5  # Stuck
            
            pacman_pos = random.choice(valid_moves)
            
            # Remove pellet if collected
            if pacman_pos in pellets:
                pellets = [p for p in pellets if p != pacman_pos]
            
            # Simple ghost movement (move toward Pacman)
            new_ghost_positions = []
            for ghost_pos in ghost_positions:
                ghost_moves = self.get_valid_neighbors(ghost_pos)
                if ghost_moves:
                    # Move closer to Pacman
                    best_move = min(ghost_moves, 
                                   key=lambda m: self.distance(m, pacman_pos))
                    new_ghost_positions.append(best_move)
                else:
                    new_ghost_positions.append(ghost_pos)
            
            ghost_positions = new_ghost_positions
            depth += 1
        
        # Heuristic evaluation if didn't reach terminal state
        score = 0
        score += len(pellets) * -0.1  # Penalize remaining pellets
        
        if ghost_positions:
            min_ghost_dist = min(self.distance(pacman_pos, g) for g in ghost_positions)
            score += min_ghost_dist * 0.05  # Reward distance from ghosts
        
        return max(-1.0, min(1.0, score))  # Clamp to [-1, 1]
    
    def _backpropagate(self, node, value):
        """
        Backpropagation phase: Update statistics up the tree.
        """
        while node is not None:
            node.visits += 1
            node.value += value
            node = node.parent
    
    def _apply_action(self, state, action):
        """
        Apply action to state and return new state.
        
        Args:
            state: (pacman_pos, ghost_positions, pellets)
            action: New pacman position
        
        Returns:
            New state tuple
        """
        _, ghost_positions, pellets = state
        new_pacman_pos = action
        
        # Remove pellet if collected
        new_pellets = [p for p in pellets if p != action]
        
        return (new_pacman_pos, ghost_positions, new_pellets)
