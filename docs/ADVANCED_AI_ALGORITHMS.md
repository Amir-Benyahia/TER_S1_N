# State-of-the-Art Pacman AI Algorithms

## 🎯 Overview

This project now includes **4 advanced AI algorithms** that represent state-of-the-art approaches to game AI and decision-making:

1. **Minimax with Alpha-Beta Pruning** - Game tree search
2. **Expectimax** - Decision making under uncertainty  
3. **Influence Maps** - Spatial reasoning and tactical awareness
4. **Monte Carlo Tree Search (MCTS)** - Simulation-based planning

---

## 📊 Algorithm Comparison

| Algorithm | Type | Look-ahead | Complexity | Best For |
|-----------|------|------------|------------|----------|
| **Minimax** | Adversarial Search | Yes (3-5 moves) | O(b^d) | Perfect information games |
| **Expectimax** | Probabilistic Search | Yes (3-4 moves) | O(b^d) | Uncertain opponents |
| **Influence Maps** | Spatial Reasoning | No | O(n×m) | Real-time tactical decisions |
| **MCTS** | Sampling-based | Yes (simulations) | O(k×d) | Complex games, large branching |

---

## 🔴 1. Minimax with Alpha-Beta Pruning

### Concept
**Game tree search** that assumes both players play optimally. Looks ahead multiple moves to find the best strategy.

### Decision Process

```
┌─────────────────────────────────────────────────┐
│  MINIMAX DECISION TREE                          │
└─────────────────────────────────────────────────┘

Level 0 (MAX):     [Pacman moves]
                        │
            ┌───────────┼───────────┐
            │           │           │
         Move A      Move B      Move C
            │           │           │
Level 1 (MIN):  [Ghosts respond]
            │           │           │
         ┌──┼──┐     ┌──┼──┐     ┌──┼──┐
       G1 G2 G3    G1 G2 G3    G1 G2 G3
         │  │  │     │  │  │     │  │  │
Level 2 (MAX):  [Pacman responds]
       ...

DECISION: Choose move with MAX value at root
```

### Key Features
- **Look-ahead depth**: 3-5 moves (configurable)
- **Alpha-Beta Pruning**: Cuts ~50% of branches
- **Evaluation Function**: Multi-factor scoring
  - Distance to pellets (-10 per unit)
  - Distance from ghosts (exponential penalty if close)
  - Pellets remaining (bonus for fewer)
  - Position in maze (prefer center)

### When to Use
✅ When you need **optimal decisions**  
✅ When computation time is available  
✅ When ghosts behave predictably  

---

## 🟡 2. Expectimax

### Concept
Like Minimax, but handles **uncertainty**. Instead of assuming optimal play, it calculates **expected values** over probable opponent actions.

### Decision Process

```
┌─────────────────────────────────────────────────┐
│  EXPECTIMAX DECISION TREE                       │
└─────────────────────────────────────────────────┘

Level 0 (MAX):     [Pacman chooses best]
                        │
            ┌───────────┼───────────┐
            │           │           │
         Move A      Move B      Move C
         value=7     value=9     value=4
            │           │           │
Level 1 (CHANCE):  [Ghost probabilities]
            │           │           │
         ┌──┼──┐     ┌──┼──┐     ┌──┼──┐
        30% 50% 20%  40% 40% 20%  (probabilities)
         │  │  │     │  │  │     
       v=5 v=8 v=7  v=10 v=9 v=8
         │           │
Expected: 0.3×5 + 0.5×8 + 0.2×7 = 6.9

DECISION: Choose Move B (highest expected value = 9)
```

### Key Features
- **Probabilistic modeling**: Ghosts weighted by behavior
  - 3x probability to chase Pacman
  - 1x for neutral moves
  - 0.5x for moving away
- **Expected value calculation**: Sum(probability × value)
- **Mobility bonus**: Prefers positions with more escape routes

### When to Use
✅ When ghosts are **unpredictable**  
✅ More **realistic** than Minimax  
✅ When you need **robust strategies**  

---

## 🟢 3. Influence Maps

### Concept
**Spatial reasoning** technique from RTS games. Creates "heat maps" of danger and opportunity, then combines them for decision-making.

### Decision Process

```
┌─────────────────────────────────────────────────┐
│  INFLUENCE MAP PIPELINE                         │
└─────────────────────────────────────────────────┘

Step 1: BUILD DANGER MAP
    Ghost positions → Propagate danger influence
    
    [Danger Map - Example]
    100  80  60  40  20
     80  60  40  20  10
     60  40  20  10   5
     40  20  10   5   2
     20  10   5   2   1
    
    (Ghost at top-left, danger decreases with distance²)

Step 2: BUILD OPPORTUNITY MAP
    Pellet positions → Propagate opportunity influence
    
    [Opportunity Map - Example]
      5  10  15  20  25
     10  15  20  25  30
     15  20  25  30  35
     20  25  30  35  40
     25  30  35  40  45
    
    (More pellets = higher opportunity)

Step 3: COMBINE MAPS
    Combined = Opportunity - (Danger × weight)
    
    [Combined Map - Example]
    -195 -150 -105  -60  -15
    -150 -105  -60  -15   20
    -105  -60  -15   20   30
     -60  -15   20   30   38
     -15   20   30   38   44
    
DECISION: Move to cell with HIGHEST combined score
```

### Key Features
- **Danger propagation**: Inverse square falloff (1/(dist+1)²)
- **Opportunity propagation**: Linear falloff
- **Real-time performance**: O(grid_size) - very fast!
- **Configurable weights**: Adjust danger vs opportunity priority

### Mathematical Formulas

```python
# Danger influence at distance d:
danger(d) = 100 / (d + 1)²

# Opportunity influence at distance d:
opportunity(d) = max(0, (max_radius - d) × 5)

# Combined score:
score(x,y) = opportunity(x,y) - danger(x,y) × danger_weight
```

### When to Use
✅ Need **fast real-time decisions**  
✅ Want **intuitive tactical behavior**  
✅ Can visualize for debugging/teaching  
✅ Works well in **dynamic environments**  

---

## 🔵 4. Monte Carlo Tree Search (MCTS)

### Concept
**Sampling-based algorithm** that builds a search tree through simulations. Used in AlphaGo and modern game AI. Balances exploration (trying new things) vs exploitation (using known good moves).

### Decision Process - The Four Phases

```
┌─────────────────────────────────────────────────────────┐
│  MCTS: THE FOUR PHASES (Repeated 1000+ times)           │
└─────────────────────────────────────────────────────────┘

Phase 1: SELECTION
    Navigate tree using UCT formula
    UCT = exploitation + exploration
        = (wins/visits) + c×√(ln(parent_visits)/visits)
    
    [Tree Navigation]
         Root (1000 visits)
         /     |      \
     A(400)  B(500)  C(100)  ← Select node with highest UCT
     /  \
   ...  ...

Phase 2: EXPANSION
    Add new child node for untried action
    
    [Before]        [After]
      B(500)         B(500)
       / \           / | \
      /   \         /  |  \
    ...   ...     ... D(0) ...  ← New node added

Phase 3: SIMULATION (ROLLOUT)
    Play randomly until game ends
    
    Pacman → → Ghost → Pacman → Pellet! → ...
           (random)  (chase)   (random)
    
    Result: Win(+1), Loss(-1), or Heuristic(-0.5 to +0.5)

Phase 4: BACKPROPAGATION
    Update statistics back up tree
    
    D: visits=1, value=+0.7
    ↓
    B: visits=501, value=250.7
    ↓
    Root: visits=1001, value=450.7

AFTER 1000 ITERATIONS:
    Choose child of root with MOST VISITS (most reliable)
```

### Key Features

#### UCT Formula (Selection)
```python
UCT = exploitation + exploration

exploitation = node_value / node_visits
exploration = c × √(ln(parent_visits) / node_visits)

# Where c = 1.41 (exploration constant)
```

#### Simulation Strategy
- Max depth: 15 moves
- Pacman: Random valid moves
- Ghosts: Chase Pacman (move closer)
- Terminal values:
  - Win (all pellets): +1.0
  - Loss (caught): -1.0
  - Timeout: Heuristic based on state

#### Statistics Tracked
```python
class MCTSNode:
    visits: int      # Number of times visited
    value: float     # Sum of simulation results
    children: List   # Child nodes
    untried_actions: List  # Actions not yet explored
```

### When to Use
✅ **Very complex** state spaces  
✅ Need **anytime algorithm** (improve with more time)  
✅ Want **balanced exploration**  
✅ State-of-the-art for games like Go, Chess variants  

---

## 🎓 Pedagogical Decision Diagram

```
┌────────────────────────────────────────────────────────────────┐
│  CHOOSING THE RIGHT ALGORITHM FOR PACMAN                       │
└────────────────────────────────────────────────────────────────┘

START: What are your constraints and goals?
   │
   ├─→ Need VERY FAST decisions (<10ms)?
   │      │
   │      └─→ YES → Use INFLUENCE MAPS
   │               ✓ Real-time performance
   │               ✓ Intuitive behavior
   │               ✓ Easy to visualize
   │
   ├─→ Ghosts behave PREDICTABLY?
   │      │
   │      ├─→ YES → Use MINIMAX
   │      │         ✓ Optimal strategy
   │      │         ✓ Deep look-ahead
   │      │         ✓ Best for competitive play
   │      │
   │      └─→ NO → Use EXPECTIMAX
   │                ✓ Handles uncertainty
   │                ✓ Robust decisions
   │                ✓ More realistic
   │
   └─→ Want STATE-OF-THE-ART / Research quality?
          │
          └─→ Use MCTS
              ✓ Balances exploration/exploitation
              ✓ Anytime algorithm
              ✓ Handles complex scenarios
              ✓ Used in AlphaGo
```

---

## 🔧 Usage Examples

### 1. Using Minimax
```python
from algorithms.pacman_ai.minimax import MinimaxPacman

# Create agent with depth=4 (looks 4 moves ahead)
pacman = MinimaxPacman(grid, depth=4)

# Get next move
next_pos = pacman.get_next_move(
    pacman_pos=(10, 10),
    ghost_positions=[(5, 5), (15, 15)],
    pellet_positions=[(8, 10), (12, 10)]
)

print(f"Nodes explored: {pacman.nodes_explored}")
```

### 2. Using Expectimax
```python
from algorithms.pacman_ai.expectimax import ExpectimaxPacman

# Create agent
pacman = ExpectimaxPacman(grid, depth=3)

# Get next move (handles uncertain ghost behavior)
next_pos = pacman.get_next_move(pacman_pos, ghosts, pellets)
```

### 3. Using Influence Maps
```python
from algorithms.pacman_ai.influence_map import InfluenceMapPacman

# Create agent
pacman = InfluenceMapPacman(grid)

# Get next move
next_pos = pacman.get_next_move(pacman_pos, ghosts, pellets)

# Export maps for visualization
danger_map = pacman.get_danger_map()
opportunity_map = pacman.get_opportunity_map()
combined_map = pacman.get_combined_map()
```

### 4. Using MCTS
```python
from algorithms.pacman_ai.mcts import MCTSPacman

# Create agent with 1000 simulations per move
pacman = MCTSPacman(grid, iterations=1000)

# Get next move (improves with more iterations)
next_pos = pacman.get_next_move(pacman_pos, ghosts, pellets)
```

---

## 📈 Performance Characteristics

| Algorithm | Time Complexity | Space Complexity | Decision Time | Optimality |
|-----------|----------------|------------------|---------------|------------|
| **Minimax (d=3)** | O(b³) ≈ 64 nodes | O(b×d) | ~50-100ms | Optimal* |
| **Expectimax (d=3)** | O(b³) ≈ 64 nodes | O(b×d) | ~50-100ms | Expected optimal |
| **Influence Maps** | O(w×h) ≈ grid size | O(w×h) | ~5-10ms | Heuristic |
| **MCTS (k=1000)** | O(k×d) ≈ 15000 nodes | O(k) | ~200-500ms | Converges to optimal |

*where b=branching factor≈4, d=depth, k=iterations, w×h=grid dimensions

---

## 🎯 Recommended Configuration

For **teaching/demonstration**:
- **Influence Maps** - Easy to visualize and understand
- Depth 2-3 for tree searches

For **competition**:
- **Minimax** depth=4 - Best if ghosts predictable
- **MCTS** iterations=2000 - Best overall

For **research**:
- **Expectimax** - More realistic modeling
- **MCTS** - State-of-the-art baseline

---

## 📚 Academic References

1. **Minimax & Alpha-Beta**: Russell & Norvig, "Artificial Intelligence: A Modern Approach"
2. **Expectimax**: Michie, "Game-Playing and Game-Learning Automata"
3. **Influence Maps**: Sweetser, "Strategic Decision-Making with Neural Networks and Influence Maps"
4. **MCTS**: Browne et al., "A Survey of Monte Carlo Tree Search Methods"

---

## 🚀 Next Steps

To integrate these algorithms into your simulation:

1. Update game engine to support new algorithms
2. Add algorithm selection in UI/API
3. Compare performance metrics across algorithms
4. Visualize decision-making process (especially influence maps)
5. Run batch comparisons to determine best strategy

**File**: [main.py](../main.py) - Entry point for testing algorithms
