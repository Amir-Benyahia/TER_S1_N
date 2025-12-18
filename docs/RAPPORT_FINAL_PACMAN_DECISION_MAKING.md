# Pacman Decision-Making: From Basic Strategies to State-of-the-Art AI

## Final Report - TER S1

---

**Authors:**
- Amir Benyahia
- Ahmed Tamani  
- Oussama Belhout

**Institution:** UNICA M1  
**Date:** December 2025

---

## Abstract

This report presents a comprehensive study of decision-making algorithms for autonomous Pacman agents in a maze environment. We implemented and analyzed eight distinct algorithms ranging from simple heuristic-based strategies to state-of-the-art game AI techniques. Our implementation includes reactive strategies (Greedy, Defensive, Aggressive, Random), game tree search methods (Minimax with Alpha-Beta Pruning, Expectimax), spatial reasoning (Influence Maps), and sampling-based planning (Monte Carlo Tree Search). This work provides both a theoretical framework for understanding game AI decision-making and a practical platform for comparing algorithm performance.

**Keywords:** Artificial Intelligence, Game Theory, Decision Making, Pathfinding, Monte Carlo Tree Search, Minimax, Pacman

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Formulation](#2-problem-formulation)
3. [Theoretical Background](#3-theoretical-background)
4. [Algorithm Implementations](#4-algorithm-implementations)
   - 4.1 Basic Reactive Strategies
   - 4.2 Game Tree Search Methods
   - 4.3 Spatial Reasoning: Influence Maps
   - 4.4 Sampling-Based: Monte Carlo Tree Search
5. [Decision Flow Architecture](#5-decision-flow-architecture)
6. [Complexity Analysis](#6-complexity-analysis)
7. [Experimental Platform](#7-experimental-platform)
8. [Discussion and Comparison](#8-discussion-and-comparison)
9. [Conclusion](#9-conclusion)
10. [References](#10-references)

---

## 1. Introduction

### 1.1 Context and Motivation

Pacman represents a classic testbed for artificial intelligence research. The game presents a well-defined environment with clear objectives, adversarial agents, and real-time decision requirements. Understanding how to make optimal decisions in such environments has applications far beyond gaming—from robotics navigation to autonomous vehicle control.

The fundamental question we address is:

> **"How should an autonomous agent decide what action to take given its current state and knowledge of the environment?"**

### 1.2 Objectives

Our project aims to:

1. **Implement** a spectrum of decision-making algorithms for Pacman
2. **Analyze** the theoretical foundations of each approach
3. **Compare** performance characteristics across different scenarios
4. **Provide** a platform for educational exploration of AI decision-making

### 1.3 Scope

We focus on the Pacman agent's decision-making process. The agent must:
- Navigate a maze to collect pellets
- Avoid being caught by ghost adversaries
- Maximize score while minimizing risk

---

## 2. Problem Formulation

### 2.1 Environment Model

The Pacman game environment can be formalized as follows:

**State Space $S$:**
$$S = \{(p_{pac}, P_{ghosts}, P_{pellets}, G)\}$$

Where:
- $p_{pac} = (x, y)$ : Pacman's position
- $P_{ghosts} = \{g_1, g_2, ..., g_n\}$ : Set of ghost positions
- $P_{pellets} = \{pel_1, pel_2, ..., pel_m\}$ : Set of remaining pellets
- $G$ : Maze grid (static)

**Action Space $A$:**
$$A = \{UP, DOWN, LEFT, RIGHT\}$$

**Transition Function $T$:**
$$T: S \times A \rightarrow S$$

The transition is deterministic for Pacman but ghosts may have stochastic behavior.

**Reward Function $R$:**
$$R(s, a, s') = \begin{cases}
+10 & \text{if pellet collected} \\
-1000 & \text{if caught by ghost} \\
+1000 & \text{if all pellets collected} \\
-1 & \text{otherwise (time penalty)}
\end{cases}$$

### 2.2 Decision Problem

At each timestep, the agent must solve:

$$a^* = \arg\max_{a \in A} \mathbb{E}[R | s, a]$$

The challenge lies in estimating the expected reward, which depends on:
1. Future states (look-ahead)
2. Ghost behavior (adversarial/stochastic)
3. Computational constraints (real-time)

---

## 3. Theoretical Background

### 3.1 Decision Trees and Game Trees

A **decision tree** represents possible future states as a tree structure where:
- **Nodes** represent game states
- **Edges** represent actions
- **Leaves** represent terminal states or evaluation cutoffs

For adversarial games, we use **game trees** with alternating player turns:
- **MAX nodes**: Agent tries to maximize utility
- **MIN nodes**: Opponent tries to minimize agent's utility

### 3.2 Utility and Evaluation Functions

An **evaluation function** $f(s)$ estimates the utility of a state:

$$f(s) = w_1 \cdot \text{pellet\_score}(s) + w_2 \cdot \text{ghost\_danger}(s) + w_3 \cdot \text{mobility}(s)$$

Good evaluation functions capture domain knowledge about what makes a state favorable.

### 3.3 Heuristic Search

**Heuristics** are problem-specific rules that guide search without guaranteeing optimality. For Pacman:
- **Manhattan distance**: $d(p_1, p_2) = |x_1 - x_2| + |y_1 - y_2|$
- **Ghost proximity**: Distance to nearest ghost
- **Pellet density**: Number of pellets in nearby area

---

## 4. Algorithm Implementations

### 4.1 Basic Reactive Strategies

These algorithms make decisions based on immediate observations without lookahead.

#### 4.1.1 Greedy Algorithm

**Concept:** Always move towards the nearest pellet while avoiding immediate danger.

**Decision Rule:**
```
For each valid move:
    score = -distance_to_nearest_pellet × 10
    if ghost_nearby:
        score -= (danger_threshold - ghost_distance) × 50
    Choose move with highest score
```

**Implementation:**

```python
class GreedyPacman(BasePacmanAI):
    """Greedy algorithm - moves towards nearest pellet, avoids ghosts when close"""
    
    GHOST_DANGER_DISTANCE = 3
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        neighbors = self.get_valid_neighbors(pacman_pos)
        if not pellet_positions:
            return neighbors[0]
        
        # Find nearest pellet
        nearest_pellet = min(pellet_positions, 
                           key=lambda p: self.distance(pacman_pos, p))
        
        # Score each neighbor
        best_move = neighbors[0]
        best_score = float('-inf')
        
        for neighbor in neighbors:
            score = -self.distance(neighbor, nearest_pellet) * 10
            
            # Avoid ghosts
            for ghost_pos in ghost_positions:
                ghost_dist = self.distance(neighbor, ghost_pos)
                if ghost_dist < self.GHOST_DANGER_DISTANCE:
                    score -= (self.GHOST_DANGER_DISTANCE - ghost_dist) * 50
            
            if score > best_score:
                best_score = score
                best_move = neighbor
        
        return best_move
```

**Characteristics:**
- ✅ Fast: O(n) where n = number of pellets
- ✅ Simple to implement
- ❌ No lookahead
- ❌ Can be trapped by ghosts

---

#### 4.1.2 Defensive Algorithm

**Concept:** Prioritize survival over pellet collection. Only collect pellets when safe.

**Decision Rule:**
```
For each valid move:
    score = min_ghost_distance × 100
    if min_ghost_distance > SAFE_THRESHOLD:
        score -= distance_to_nearest_pellet × 5
    Choose move with highest score
```

**Implementation:**

```python
class DefensivePacman(BasePacmanAI):
    """Defensive algorithm - prioritizes safety over pellet collection"""
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        neighbors = self.get_valid_neighbors(pacman_pos)
        best_move = neighbors[0]
        best_score = float('-inf')
        
        for neighbor in neighbors:
            score = 0
            
            # Maximize distance from nearest ghost
            if ghost_positions:
                min_ghost_dist = min(self.distance(neighbor, g) 
                                    for g in ghost_positions)
                score += min_ghost_dist * 100
                
                # Only consider pellets if safe
                if min_ghost_dist > 5 and pellet_positions:
                    nearest_pellet_dist = min(self.distance(neighbor, p) 
                                             for p in pellet_positions)
                    score -= nearest_pellet_dist * 5
            
            if score > best_score:
                best_score = score
                best_move = neighbor
        
        return best_move
```

**Characteristics:**
- ✅ High survival rate
- ✅ Good for dense ghost environments
- ❌ Slow pellet collection
- ❌ May never complete level if too cautious

---

#### 4.1.3 Aggressive Algorithm

**Concept:** Focus on pellet collection with minimal ghost avoidance.

**Use Case:** When ghosts are predictable or slow.

---

#### 4.1.4 Random Walker

**Concept:** Baseline algorithm that chooses random valid moves.

**Use Case:** Baseline for comparison; understanding minimum performance.

---

### 4.2 Game Tree Search Methods

These algorithms look ahead multiple moves to make better decisions.

#### 4.2.1 Minimax with Alpha-Beta Pruning

**Concept:** Assume the opponent (ghosts) will always make the optimal move against us. Search the game tree to find our best response.

**Algorithm:**

```
function minimax(state, depth, isMaxPlayer, α, β):
    if depth = 0 or terminal(state):
        return evaluate(state)
    
    if isMaxPlayer:  # Pacman's turn
        maxEval = -∞
        for each move in validMoves(state):
            eval = minimax(nextState(state, move), depth-1, false, α, β)
            maxEval = max(maxEval, eval)
            α = max(α, eval)
            if β ≤ α:
                break  # Beta cutoff
        return maxEval
    else:  # Ghost's turn
        minEval = +∞
        for each move in ghostMoves(state):
            eval = minimax(nextState(state, move), depth-1, true, α, β)
            minEval = min(minEval, eval)
            β = min(β, eval)
            if β ≤ α:
                break  # Alpha cutoff
        return minEval
```

**Implementation:**

```python
class MinimaxPacman(BasePacmanAI):
    """
    Minimax algorithm with alpha-beta pruning.
    
    Key concepts:
    - Game tree: Explores future states
    - Minimax: Assumes opponent plays optimally
    - Alpha-beta pruning: Cuts unnecessary branches
    """
    
    def __init__(self, grid, depth=3):
        super().__init__(grid)
        self.max_depth = depth
        self.nodes_explored = 0
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        self.nodes_explored = 0
        valid_moves = self.get_valid_neighbors(pacman_pos)
        
        best_move = valid_moves[0]
        best_value = float('-inf')
        alpha = float('-inf')
        beta = float('inf')
        
        for move in valid_moves:
            value = self._minimax(
                move, ghost_positions, pellet_positions,
                depth=self.max_depth - 1,
                is_pacman_turn=False,
                alpha=alpha, beta=beta
            )
            
            if value > best_value:
                best_value = value
                best_move = move
            alpha = max(alpha, value)
        
        return best_move
    
    def _minimax(self, pacman_pos, ghost_positions, pellet_positions,
                 depth, is_pacman_turn, alpha, beta):
        self.nodes_explored += 1
        
        # Terminal conditions
        if depth == 0:
            return self._evaluate_state(pacman_pos, ghost_positions, pellet_positions)
        
        # Check if caught
        for ghost_pos in ghost_positions:
            if self.distance(pacman_pos, ghost_pos) <= 1:
                return -10000
        
        # Check win
        if not pellet_positions:
            return 10000
        
        if is_pacman_turn:
            # MAX node
            max_eval = float('-inf')
            for move in self.get_valid_neighbors(pacman_pos):
                new_pellets = [p for p in pellet_positions if p != move]
                eval_score = self._minimax(move, ghost_positions, new_pellets,
                                          depth-1, False, alpha, beta)
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break  # Pruning
            return max_eval
        else:
            # MIN node
            min_eval = float('inf')
            # Simulate ghost movements...
            # [Ghost move simulation code]
            return min_eval
```

**Alpha-Beta Pruning Visualization:**

```
                    MAX (Pacman)
                   /     |     \
              [3]      [5]      [?]  ← No need to explore
             /   \    /   \         (we know best ≥ 5)
           MIN   MIN MIN  MIN
           /\    /\   /\   /\
          3  4  5  2  ?  ?  ?  ?
```

**Complexity:**
- Without pruning: $O(b^d)$
- With pruning (best case): $O(b^{d/2})$
- Where $b$ = branching factor, $d$ = depth

---

#### 4.2.2 Expectimax Algorithm

**Concept:** Unlike Minimax which assumes optimal opponent play, Expectimax models ghosts as having probabilistic behavior.

**Key Difference:**
- **Minimax**: MIN nodes choose minimum value
- **Expectimax**: CHANCE nodes compute expected value

**Algorithm:**

```
function expectimax(state, depth, isMaxPlayer):
    if depth = 0 or terminal(state):
        return evaluate(state)
    
    if isMaxPlayer:  # MAX node (Pacman)
        return max(expectimax(next, depth-1, false) for next in successors)
    else:  # CHANCE node (Ghosts)
        return Σ P(action) × expectimax(result(action), depth-1, true)
```

**Probability Weighting for Ghosts:**

```python
def _weight_ghost_moves(self, moves, pacman_pos, ghost_pos):
    """
    Assign probabilities to ghost moves.
    Ghosts more likely to move towards Pacman.
    """
    current_dist = self.distance(ghost_pos, pacman_pos)
    weights = []
    
    for move in moves:
        new_dist = self.distance(move, pacman_pos)
        if new_dist < current_dist:
            weights.append(0.6)  # 60% chance to move closer
        elif new_dist > current_dist:
            weights.append(0.1)  # 10% chance to move away
        else:
            weights.append(0.3)  # 30% chance to move perpendicular
    
    # Normalize to probabilities
    total = sum(weights)
    return [(move, w/total) for move, w in zip(moves, weights)]
```

**When to Use:**
- When ghosts don't play optimally
- When environment has random elements
- More realistic modeling of opponents

---

### 4.3 Spatial Reasoning: Influence Maps

**Concept:** Create "heat maps" of the game space representing danger and opportunity. Make decisions based on combined spatial influences.

**The Influence Map Approach:**

```
┌────────────────────────────────┐
│     DANGER MAP (Ghosts)        │
│   High danger near ghosts      │
│   Decays with distance         │
│                                │
│   🔴 ← Ghost center            │
│   🟡 Medium danger             │
│   🟢 Low danger                │
└────────────────────────────────┘
         +
┌────────────────────────────────┐
│    OPPORTUNITY MAP (Pellets)   │
│   High value near pellet       │
│   clusters                     │
│                                │
│   🟢 ← Pellet clusters         │
│   🟡 Some pellets nearby       │
│   ⚪ No pellets                │
└────────────────────────────────┘
         =
┌────────────────────────────────┐
│       COMBINED MAP             │
│   Decision = max(opportunity   │
│              - danger×weight)  │
└────────────────────────────────┘
```

**Implementation:**

```python
class InfluenceMapPacman(BasePacmanAI):
    """
    Influence Map based decision making.
    Creates spatial maps of danger and opportunity.
    """
    
    def __init__(self, grid):
        super().__init__(grid)
        self.danger_map = np.zeros((self.height, self.width))
        self.opportunity_map = np.zeros((self.height, self.width))
        self.combined_map = np.zeros((self.height, self.width))
        
        # Parameters
        self.ghost_influence_radius = 5
        self.pellet_influence_radius = 8
        self.danger_weight = 2.0
        self.opportunity_weight = 1.0
    
    def _build_danger_map(self, ghost_positions):
        """Build danger map with inverse square falloff."""
        for ghost_pos in ghost_positions:
            gx, gy = ghost_pos
            
            for y in range(self.height):
                for x in range(self.width):
                    if self.grid[y][x] == 1:  # Skip walls
                        continue
                    
                    dist = abs(x - gx) + abs(y - gy)
                    
                    if dist <= self.ghost_influence_radius:
                        # Inverse square: closer = much more dangerous
                        influence = 100 / (dist + 1) ** 2
                        self.danger_map[y][x] += influence
    
    def _build_opportunity_map(self, pellet_positions):
        """Build opportunity map with linear falloff."""
        for pellet_pos in pellet_positions:
            px, py = pellet_pos
            
            for y in range(self.height):
                for x in range(self.width):
                    if self.grid[y][x] == 1:
                        continue
                    
                    dist = abs(x - px) + abs(y - py)
                    
                    if dist <= self.pellet_influence_radius:
                        influence = (self.pellet_influence_radius - dist) * 5
                        self.opportunity_map[y][x] += influence
    
    def _combine_maps(self):
        """Combine maps: opportunity - (danger × weight)"""
        self.combined_map = (
            self.opportunity_map * self.opportunity_weight -
            self.danger_map * self.danger_weight
        )
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        # Reset and rebuild maps
        self.danger_map.fill(0)
        self.opportunity_map.fill(0)
        
        self._build_danger_map(ghost_positions)
        self._build_opportunity_map(pellet_positions)
        self._combine_maps()
        
        # Choose move with best combined influence
        valid_moves = self.get_valid_neighbors(pacman_pos)
        return max(valid_moves, key=lambda m: self.combined_map[m[1]][m[0]])
```

**Influence Falloff Functions:**

| Type | Function | Use Case |
|------|----------|----------|
| Inverse Square | $\frac{1}{(d+1)^2}$ | Ghost danger (sharp falloff) |
| Linear | $r - d$ | Pellet opportunity (gentle falloff) |
| Exponential | $e^{-d/r}$ | Variable decay rate |

**Advantages:**
- ✅ Natural handling of multiple influences
- ✅ Smooth decision boundaries
- ✅ Easy to visualize and debug
- ✅ Efficient: O(width × height)

---

### 4.4 Monte Carlo Tree Search (MCTS)

**Concept:** The state-of-the-art algorithm used in AlphaGo. Instead of exhaustively searching the game tree, use random simulations to estimate the value of moves.

**The Four Phases of MCTS:**

```
┌─────────────────────────────────────────────────────────────┐
│                     MCTS CYCLE                              │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ SELECTION│ → │ EXPANSION│ → │SIMULATION│ → │BACKPROP  │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       │              │              │              │        │
│       ↓              ↓              ↓              ↓        │
│    Navigate       Add new       Random         Update      │
│    tree using     child node    playout to     statistics  │
│    UCT            if not        terminal       up the      │
│    selection      terminal      state          tree        │
└─────────────────────────────────────────────────────────────┘
```

#### Phase 1: Selection (UCT)

Navigate from root to leaf using **Upper Confidence Bound for Trees**:

$$UCT(n) = \frac{Q(n)}{N(n)} + c \sqrt{\frac{\ln N(parent)}{N(n)}}$$

Where:
- $Q(n)$ = Total value accumulated at node
- $N(n)$ = Visit count of node
- $c$ = Exploration constant (typically $\sqrt{2}$)

The first term is **exploitation** (prefer high-value nodes).
The second term is **exploration** (prefer rarely-visited nodes).

#### Phase 2: Expansion

If the selected node is not terminal and not fully expanded:
- Add one new child node for an untried action
- This child becomes the node for simulation

#### Phase 3: Simulation (Rollout)

From the new node, play random moves until reaching a terminal state:

```python
def _simulate(self, state):
    """Random playout from state to terminal or max depth."""
    pacman_pos, ghost_positions, pellets = state
    
    for step in range(self.max_simulation_depth):
        # Check terminal
        for ghost in ghost_positions:
            if self.distance(pacman_pos, ghost) <= 1:
                return -1  # Caught
        
        if not pellets:
            return 1  # Won
        
        # Random Pacman move
        valid_moves = self.get_valid_neighbors(pacman_pos)
        if valid_moves:
            pacman_pos = random.choice(valid_moves)
            pellets = [p for p in pellets if p != pacman_pos]
        
        # Random ghost moves
        ghost_positions = self._simulate_ghost_moves(ghost_positions, pacman_pos)
    
    # Evaluate non-terminal state
    return self._evaluate_state(pacman_pos, ghost_positions, pellets)
```

#### Phase 4: Backpropagation

Update statistics from leaf to root:

```python
def _backpropagate(self, node, value):
    """Update visit counts and values up the tree."""
    while node is not None:
        node.visits += 1
        node.value += value
        node = node.parent
```

#### Complete MCTS Implementation:

```python
class MCTSPacman(BasePacmanAI):
    """Monte Carlo Tree Search for Pacman."""
    
    def __init__(self, grid, iterations=1000):
        super().__init__(grid)
        self.iterations = iterations
        self.exploration_constant = 1.41  # √2
        self.max_simulation_depth = 15
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        # Create root
        root_state = (pacman_pos, ghost_positions, pellet_positions)
        root = MCTSNode(root_state)
        root.untried_actions = self.get_valid_neighbors(pacman_pos)
        
        # MCTS iterations
        for _ in range(self.iterations):
            # 1. Selection
            node = self._select(root)
            
            # 2. Expansion
            if not node.is_terminal() and not node.is_fully_expanded():
                node = self._expand(node)
            
            # 3. Simulation
            value = self._simulate(node.state)
            
            # 4. Backpropagation
            self._backpropagate(node, value)
        
        # Return most visited action (most robust)
        best_child = max(root.children, key=lambda c: c.visits)
        return best_child.action
```

**Why MCTS is Powerful:**

1. **Anytime algorithm**: Can return a decision at any time; more iterations = better
2. **No evaluation function required**: Learns value through simulation
3. **Handles large state spaces**: Focuses search on promising areas
4. **Domain-independent**: Same algorithm works for chess, Go, Pacman

**MCTS Statistics After 1000 Iterations:**

```
Root
├── UP     [visits: 342, value: 0.65, UCT: 0.71]
├── DOWN   [visits: 156, value: 0.32, UCT: 0.45]  
├── LEFT   [visits: 298, value: 0.58, UCT: 0.64]  ← Promising
└── RIGHT  [visits: 204, value: 0.45, UCT: 0.52]

Best move: UP (highest visits = most robust)
```

---

## 5. Decision Flow Architecture

### 5.1 Abstract Decision Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    PACMAN DECISION PIPELINE                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PERCEPTION: Observe current game state                         │
│  - Pacman position: (x, y)                                      │
│  - Ghost positions: [(x₁,y₁), (x₂,y₂), ...]                    │
│  - Pellet positions: [(x₁,y₁), (x₂,y₂), ...]                   │
│  - Maze layout: Grid[height][width]                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VALID ACTIONS: Determine possible moves                        │
│                                                                 │
│  for each direction in [UP, DOWN, LEFT, RIGHT]:                 │
│      new_pos = current_pos + direction                          │
│      if not wall(new_pos) and in_bounds(new_pos):              │
│          valid_moves.add(new_pos)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DECISION ALGORITHM: Choose best action                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  GREEDY        → Nearest pellet, avoid close ghosts      │   │
│  │  DEFENSIVE     → Maximize ghost distance                  │   │
│  │  MINIMAX       → Game tree search with α-β pruning       │   │
│  │  EXPECTIMAX    → Probabilistic opponent modeling          │   │
│  │  INFLUENCE MAP → Spatial danger/opportunity analysis      │   │
│  │  MCTS          → Monte Carlo simulation-based planning    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ACTION: Execute chosen move                                    │
│  - Update Pacman position                                       │
│  - Collect pellet if present                                    │
│  - Update score                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Evaluation Function Details

All advanced algorithms use an evaluation function to score game states:

```python
def _evaluate_state(self, pacman_pos, ghost_positions, pellet_positions):
    """
    Multi-factor evaluation function.
    
    Factors:
    1. Distance to nearest ghost (negative if too close)
    2. Distance to nearest pellet (negative = better)
    3. Number of remaining pellets
    4. Mobility (escape routes available)
    """
    score = 0
    
    # Factor 1: Ghost danger (exponential penalty for proximity)
    if ghost_positions:
        min_ghost_dist = min(self.distance(pacman_pos, g) for g in ghost_positions)
        if min_ghost_dist <= 1:
            return -10000  # Caught!
        elif min_ghost_dist <= 3:
            score -= (4 - min_ghost_dist) * 100  # Danger zone
        else:
            score += min_ghost_dist * 5  # Safe bonus
    
    # Factor 2: Pellet collection progress
    if pellet_positions:
        nearest_pellet_dist = min(self.distance(pacman_pos, p) for p in pellet_positions)
        score -= nearest_pellet_dist * 10  # Closer is better
        score -= len(pellet_positions) * 20  # Fewer remaining is better
    else:
        score += 10000  # Won!
    
    # Factor 3: Mobility (escape routes)
    valid_moves = self.get_valid_neighbors(pacman_pos)
    score += len(valid_moves) * 15  # More options is better
    
    return score
```

---

## 6. Complexity Analysis

### 6.1 Time Complexity Comparison

| Algorithm | Time Complexity | Explanation |
|-----------|-----------------|-------------|
| Random | O(1) | Single random selection |
| Greedy | O(n + g) | Scan pellets + ghosts |
| Defensive | O(n + g) | Scan pellets + ghosts |
| Aggressive | O(n) | Scan pellets |
| Influence Map | O(w × h) | Build spatial maps |
| Minimax (depth d) | O(b^d) | Full tree search |
| Minimax + α-β | O(b^(d/2)) | Best case with pruning |
| Expectimax | O(b^d) | No pruning possible |
| MCTS (k iterations) | O(k × d) | k simulations of depth d |

Where:
- n = number of pellets
- g = number of ghosts
- w × h = maze dimensions
- b = branching factor (~4 for grid movement)
- d = search depth
- k = MCTS iterations

### 6.2 Space Complexity

| Algorithm | Space Complexity | Notes |
|-----------|------------------|-------|
| Reactive (Greedy, Defensive) | O(1) | No state storage |
| Influence Map | O(w × h) | Three maps stored |
| Minimax | O(d) | Recursion stack |
| MCTS | O(k) | Tree nodes in memory |

### 6.3 Performance Trade-offs

```
Quality vs Speed Trade-off
                                     
     Quality                          
        ▲                             
        │           ★ MCTS            
        │        ★ Minimax(d=5)       
        │     ★ Expectimax            
        │   ★ Minimax(d=3)            
        │ ★ Influence Map             
        │★ Greedy                     
        │★ Defensive                   
        │★ Random                      
        └────────────────────► Speed  
           Fast              Slow     
```

---

## 7. Experimental Platform

### 7.1 System Architecture

Our implementation provides a complete platform for testing and comparing algorithms:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PACMAN AI PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Web UI    │    │  REST API   │    │   Python AI Core    │ │
│  │  (Browser)  │◄──►│  (Node.js)  │◄──►│   (Algorithms)      │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                            │                     │              │
│                            ▼                     ▼              │
│                     ┌─────────────┐    ┌─────────────────────┐ │
│                     │   MongoDB   │    │   Game Engine       │ │
│                     │  (Storage)  │    │   (Simulation)      │ │
│                     └─────────────┘    └─────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Algorithm Configuration

Each algorithm can be configured through the API:

```json
{
  "pacmanAlgorithm": "mcts",
  "pacmanConfig": {
    "depth": 4,
    "iterations": 2000
  },
  "ghostConfigs": [
    {
      "type": "blinky",
      "algorithm": "astar"
    }
  ]
}
```

### 7.3 Performance Metrics Tracked

For each simulation, we track:

- **Decision Time**: Milliseconds per move decision
- **Memory Usage**: Peak memory during computation
- **Nodes Explored**: For tree-based algorithms
- **Path Length**: Total moves made
- **Score**: Pellets collected
- **Outcome**: Win/Loss/Timeout

---

## 8. Discussion and Comparison

### 8.1 Algorithm Suitability Matrix

| Scenario | Best Algorithm | Reason |
|----------|---------------|--------|
| Fast decisions needed | Greedy | O(n) complexity |
| Dense ghost environment | Defensive | Prioritizes survival |
| Predictable ghosts | Minimax | Assumes optimal opponent |
| Random ghosts | Expectimax | Probabilistic modeling |
| Complex maze | Influence Map | Spatial awareness |
| High-stakes decisions | MCTS | Robust estimation |

### 8.2 Key Insights

1. **No Universal Winner**: Algorithm choice depends on environment
2. **Depth-Quality Trade-off**: Deeper search = better decisions, slower speed
3. **Opponent Modeling Matters**: Minimax vs Expectimax shows importance of accurate opponent model
4. **Spatial Reasoning is Efficient**: Influence maps provide good quality at low cost
5. **MCTS Scales Well**: Performance improves smoothly with more iterations

### 8.3 Practical Recommendations

**For Real-Time Games:**
- Use Greedy or Influence Maps (low latency)
- MCTS with limited iterations as enhancement

**For Analysis/Research:**
- Minimax with high depth (optimal baseline)
- MCTS with high iterations (best average performance)

**For Hybrid Approaches:**
- Influence Map for immediate danger assessment
- MCTS for strategic planning

---

## 9. Conclusion

### 9.1 Summary

This project implemented and analyzed eight decision-making algorithms for Pacman:

1. **Reactive Strategies** (Greedy, Defensive, Aggressive, Random): Fast but limited
2. **Game Tree Search** (Minimax, Expectimax): Optimal with lookahead but expensive
3. **Spatial Reasoning** (Influence Maps): Good balance of quality and speed
4. **Sampling-Based** (MCTS): State-of-the-art with configurable quality

### 9.2 Key Contributions

1. **Unified Framework**: All algorithms share common interface for fair comparison
2. **Complete Pipeline**: From web UI to algorithm execution to results storage
3. **Performance Tracking**: Detailed metrics for algorithm analysis
4. **Educational Value**: Clear implementations with documentation

### 9.3 Future Work

1. **Deep Learning Integration**: Neural network evaluation functions
2. **Multi-Agent Coordination**: Multiple Pacman agents
3. **Dynamic Difficulty**: Adaptive algorithm selection
4. **Reinforcement Learning**: Online learning from gameplay

### 9.4 Final Thoughts

Decision-making in games like Pacman exemplifies the broader challenges of AI: balancing computation with quality, modeling uncertainty, and making robust decisions in adversarial environments. The algorithms studied here—from simple heuristics to Monte Carlo Tree Search—form a toolkit applicable to problems far beyond gaming.

---

## 10. References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.

2. Browne, C., et al. (2012). A Survey of Monte Carlo Tree Search Methods. *IEEE Transactions on Computational Intelligence and AI in Games*, 4(1), 1-43.

3. Knuth, D. E., & Moore, R. W. (1975). An Analysis of Alpha-Beta Pruning. *Artificial Intelligence*, 6(4), 293-326.

4. Tozour, P. (2001). Influence Mapping. In *Game Programming Gems 2* (pp. 287-297).

5. Silver, D., et al. (2016). Mastering the Game of Go with Deep Neural Networks and Tree Search. *Nature*, 529(7587), 484-489.

6. Shannon, C. E. (1950). Programming a Computer for Playing Chess. *Philosophical Magazine*, 41(314), 256-275.

---

## Appendix A: Algorithm Pseudocode Summary

### A.1 Greedy
```
function greedy_move(state):
    nearest_pellet = min_distance(pacman, pellets)
    for each valid_move:
        score = -distance(move, nearest_pellet)
        score -= ghost_penalty(move)
    return argmax(score)
```

### A.2 Minimax
```
function minimax(state, depth, maximizing):
    if terminal(state) or depth = 0:
        return evaluate(state)
    if maximizing:
        return max(minimax(child, depth-1, false) for child in children)
    else:
        return min(minimax(child, depth-1, true) for child in children)
```

### A.3 MCTS
```
function mcts(state, iterations):
    root = Node(state)
    for i in 1 to iterations:
        node = select(root)
        if expandable(node):
            node = expand(node)
        value = simulate(node.state)
        backpropagate(node, value)
    return best_child(root).action
```

---

## Appendix B: Class Hierarchy

```
BasePacmanAI (Abstract)
├── GreedyPacman
├── DefensivePacman
├── AggressivePacman
├── RandomWalker
├── MinimaxPacman
├── ExpectimaxPacman
├── InfluenceMapPacman
└── MCTSPacman
```

---

## Appendix C: API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/simulations` | POST | Run simulation |
| `/api/simulations` | GET | List simulations |
| `/api/batches/run-batch` | POST | Run batch automation |
| `/api/batches/:id` | GET | Get batch statistics |

---

**End of Report**

*This document serves as the final report for the TER S1 project on Pacman Decision-Making.*
