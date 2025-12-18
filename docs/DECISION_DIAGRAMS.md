# Decision Diagrams for Pacman AI

This document provides visual decision diagrams showing how each algorithm makes decisions.

---

## 🎯 High-Level Decision Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PACMAN AI DECISION SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   PERCEIVE STATE       │
                    │  • Pacman position     │
                    │  • Ghost positions     │
                    │  • Pellet locations    │
                    │  • Maze layout         │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  SELECT ALGORITHM      │
                    └────────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │  Tree Search  │   │    Spatial    │   │   Sampling    │
    │  Algorithms   │   │   Reasoning   │   │  Algorithms   │
    └───────────────┘   └───────────────┘   └───────────────┘
      │         │              │                     │
      ▼         ▼              ▼                     ▼
  ┌────────┐ ┌────────┐  ┌──────────┐       ┌──────────┐
  │Minimax │ │Expecti-│  │Influence │       │  MCTS    │
  │        │ │  max   │  │   Maps   │       │          │
  └────────┘ └────────┘  └──────────┘       └──────────┘
      │         │              │                     │
      └─────────┴──────────────┴─────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   SELECT BEST MOVE     │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    EXECUTE ACTION      │
                    └────────────────────────┘
```

---

## 1️⃣ Minimax Decision Diagram

```
START: Current game state
   │
   ▼
┌──────────────────────────────────────┐
│ Get all valid moves (neighbors)     │
│ Result: [Move_A, Move_B, Move_C]    │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│ FOR EACH valid move:                 │
│   Build game tree (depth=3)          │
└──────────────────────────────────────┘
   │
   ├─→ Move_A
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ Level 1 (MIN - Ghost turn)     │
   │   │ • For each ghost move          │
   │   │ • Find MINIMUM value           │
   │   └────────────────────────────────┘
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ Level 2 (MAX - Pacman turn)    │
   │   │ • For each Pacman response     │
   │   │ • Find MAXIMUM value           │
   │   └────────────────────────────────┘
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ Level 3 (MIN - Ghost turn)     │
   │   └────────────────────────────────┘
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ Terminal Evaluation            │
   │   │ score = f(pellets, ghosts)     │
   │   └────────────────────────────────┘
   │     │
   │     ▼
   │   Backpropagate MIN/MAX values
   │     │
   │     └─→ Move_A_value = 7.5
   │
   ├─→ Move_B → ... → Move_B_value = 9.2
   │
   └─→ Move_C → ... → Move_C_value = 4.1
         │
         ▼
┌──────────────────────────────────────┐
│ SELECT: max(7.5, 9.2, 4.1) = 9.2    │
│ DECISION: Move_B                     │
└──────────────────────────────────────┘
         │
         ▼
    Execute Move_B

KEY OPTIMIZATIONS:
• Alpha-Beta Pruning: Cut branches that can't improve result
• Example: If Move_A_value=7.5 and we find Move_B≥9.0,
           we can skip remaining branches of Move_B
```

---

## 2️⃣ Expectimax Decision Diagram

```
START: Current game state
   │
   ▼
┌──────────────────────────────────────┐
│ Get all valid moves                  │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│ FOR EACH valid move:                 │
│   Calculate expected value           │
└──────────────────────────────────────┘
   │
   ├─→ Move_A
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ CHANCE NODE (Ghost behavior)   │
   │   │                                │
   │   │ Ghost options:                 │
   │   │   Chase: 60% → value = 5       │
   │   │   Random: 30% → value = 8      │
   │   │   Retreat: 10% → value = 10    │
   │   │                                │
   │   │ Expected = 0.6×5 + 0.3×8 + 0.1×10 │
   │   │          = 3 + 2.4 + 1 = 6.4   │
   │   └────────────────────────────────┘
   │     │
   │     └─→ Move_A_expected = 6.4
   │
   ├─→ Move_B
   │     │
   │     ▼
   │   ┌────────────────────────────────┐
   │   │ CHANCE NODE                    │
   │   │ Expected = 0.6×8 + 0.3×9 + 0.1×7  │
   │   │          = 4.8 + 2.7 + 0.7 = 8.2   │
   │   └────────────────────────────────┘
   │     │
   │     └─→ Move_B_expected = 8.2
   │
   └─→ Move_C → ... → Move_C_expected = 5.1
         │
         ▼
┌──────────────────────────────────────┐
│ SELECT: max(6.4, 8.2, 5.1) = 8.2    │
│ DECISION: Move_B                     │
└──────────────────────────────────────┘
         │
         ▼
    Execute Move_B

PROBABILITY CALCULATION:
┌────────────────────────────────────┐
│ Weight ghost moves by intent:     │
│                                    │
│ dist_now = 5 (ghost to Pacman)    │
│                                    │
│ • Move closer (dist=4): weight=3.0 │
│ • Move same (dist=5): weight=1.0   │
│ • Move away (dist=6): weight=0.5   │
│                                    │
│ Total weight = 3.0+1.0+0.5 = 4.5  │
│                                    │
│ Probabilities:                     │
│ • Chase: 3.0/4.5 = 0.67 (67%)     │
│ • Neutral: 1.0/4.5 = 0.22 (22%)   │
│ • Retreat: 0.5/4.5 = 0.11 (11%)   │
└────────────────────────────────────┘
```

---

## 3️⃣ Influence Maps Decision Diagram

```
START: Current game state
   │
   ▼
┌─────────────────────────────────────────┐
│ STEP 1: Build Danger Map                │
│                                          │
│ FOR EACH ghost at (gx, gy):             │
│   FOR EACH cell (x, y):                 │
│     distance = |x-gx| + |y-gy|          │
│     danger[y][x] += 100/(distance+1)²   │
└─────────────────────────────────────────┘
   │
   ▼
   Example: Ghost at (3,3)
   
   Danger Map:
   ┌───────────────────────────────┐
   │ 11  14  20  25  20  14  11 .. │
   │ 14  20  33  50  33  20  14 .. │
   │ 20  33 100 100  33  20  14 .. │
   │ 25  50 100  G  100  50  25 .. │  ← Ghost here
   │ 20  33 100 100  33  20  14 .. │
   │ 14  20  33  50  33  20  14 .. │
   └───────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────┐
│ STEP 2: Build Opportunity Map           │
│                                          │
│ FOR EACH pellet at (px, py):            │
│   FOR EACH cell (x, y):                 │
│     distance = |x-px| + |y-py|          │
│     IF distance ≤ radius:               │
│       opportunity[y][x] += (r-dist)×5   │
└─────────────────────────────────────────┘
   │
   ▼
   Example: Pellets at (7,3) and (7,5)
   
   Opportunity Map:
   ┌───────────────────────────────┐
   │  5  10  15  20  25  30  35 .. │
   │ 10  15  20  25  30  35  40 .. │
   │ 15  20  25  30  35  40  45 .. │
   │ 20  25  30  35  40  45  50 .. │
   │ 15  20  25  30  35  40  45 .. │
   │ 10  15  20  25  30  35  40 .. │
   └───────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────┐
│ STEP 3: Combine Maps                    │
│                                          │
│ combined = opportunity - (danger × 2.0) │
└─────────────────────────────────────────┘
   │
   ▼
   Combined Map:
   ┌────────────────────────────────┐
   │ -17  -18  -25  -25  -15   2 .. │
   │ -18  -25  -46  -75  -36   0 .. │
   │ -25  -46 -175 -165   1  ..  .. │
   │ -25  -75 -170  -G  -160 -55 .. │
   │ -25  -46 -175 -165   1  ..  .. │
   └────────────────────────────────┘
              Pacman at (5,3)
   │
   ▼
┌─────────────────────────────────────────┐
│ STEP 4: Evaluate Valid Neighbors        │
│                                          │
│ Pacman at (5,3), valid moves:           │
│   • (4,3): score = -165                 │
│   • (6,3): score = -160                 │
│   • (5,2): score = -36                  │
│   • (5,4): score = 1   ← BEST!          │
└─────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────┐
│ DECISION: Move to (5,4)                 │
│ Reason: Highest combined score          │
└─────────────────────────────────────────┘
   │
   ▼
Execute Move

INTERPRETATION:
✓ Move (5,4): Low danger, moderate opportunity
✗ Move (4,3): Very high danger (close to ghost)
✗ Move (6,3): High danger
✗ Move (5,2): Moderate danger
```

---

## 4️⃣ MCTS Decision Diagram

```
START: Current game state
   │
   ▼
┌─────────────────────────────────────────┐
│ Initialize root node                    │
│ • State = current game state            │
│ • Visits = 0, Value = 0                 │
│ • Children = []                         │
└─────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────┐
│ FOR iteration = 1 to 1000:              │
└─────────────────────────────────────────┘
   │
   ▼
   ┌──────────────────────────────────────┐
   │ PHASE 1: SELECTION                   │
   │ Navigate tree using UCT              │
   └──────────────────────────────────────┘
      │
      ▼
      Start at root
      │
      ▼
      ┌─────────────────────────┐
      │ While node has children │
      └─────────────────────────┘
         │
         ▼
      ┌────────────────────────────────┐
      │ Calculate UCT for each child:  │
      │                                │
      │ UCT = visits/value +           │
      │       1.41×√(ln(parent)/visits)│
      │                                │
      │ Child A: 0.75 + 0.5 = 1.25     │
      │ Child B: 0.80 + 0.3 = 1.10     │
      │ Child C: 0.60 + 0.8 = 1.40 ←   │
      └────────────────────────────────┘
         │
         └─→ Select Child C (highest UCT)
               │
               ▼
   ┌──────────────────────────────────────┐
   │ PHASE 2: EXPANSION                   │
   │ Add new child for untried action     │
   └──────────────────────────────────────┘
      │
      ▼
      ┌────────────────────────────┐
      │ Create new node:           │
      │ • State = apply_action()   │
      │ • Visits = 0               │
      │ • Value = 0                │
      └────────────────────────────┘
         │
         ▼
   ┌──────────────────────────────────────┐
   │ PHASE 3: SIMULATION (Rollout)        │
   │ Play randomly until game ends        │
   └──────────────────────────────────────┘
      │
      ▼
      Play random moves (max depth=15)
         │
         ├─→ If caught by ghost → -1.0
         ├─→ If all pellets eaten → +1.0
         └─→ If timeout → heuristic (-0.5 to +0.5)
               │
               ▼
         result = +0.7 (good outcome)
               │
               ▼
   ┌──────────────────────────────────────┐
   │ PHASE 4: BACKPROPAGATION             │
   │ Update statistics up tree            │
   └──────────────────────────────────────┘
      │
      ▼
      New Node: visits=1, value=+0.7
         │
         ▼
      Parent: visits=15→16, value=8.3→9.0
         │
         ▼
      Grandparent: visits=50→51, value=25→25.7
         │
         ▼
      Root: visits=999→1000, value=450→450.7
         │
         └─→ Continue next iteration...

AFTER 1000 ITERATIONS:
   │
   ▼
┌─────────────────────────────────────────┐
│ Root's children statistics:             │
│                                          │
│ Move_A: visits=350, value=210 (0.60)    │
│ Move_B: visits=450, value=315 (0.70) ← │
│ Move_C: visits=200, value=110 (0.55)    │
└─────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────┐
│ DECISION: Move_B                        │
│ Reason: Most visits (most reliable)     │
└─────────────────────────────────────────┘
   │
   ▼
Execute Move_B

KEY INSIGHT:
Choose by visits, not value!
• More visits = more confident
• High value but few visits = lucky but unreliable
• Many visits converges to true value
```

---

## 🎓 Algorithm Selection Decision Tree

```
                    ┌─────────────────┐
                    │  START: Choose  │
                    │   Algorithm     │
                    └─────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ How much time per move? │
              └─────────────────────────┘
                │              │
        <20ms   │              │  >50ms
                ▼              ▼
      ┌─────────────┐    ┌─────────────┐
      │  INFLUENCE  │    │ Need optimal│
      │    MAPS     │    │  solution?  │
      └─────────────┘    └─────────────┘
                              │     │
                         YES  │     │  NO
                              ▼     ▼
                         ┌────────┬────────┐
                         │ Ghosts │  Want  │
                         │predict-│ state- │
                         │ able?  │of-art? │
                         └────────┴────────┘
                          │    │    │    │
                     YES  │    │NO  │YES │NO
                          ▼    ▼    ▼    ▼
                      ┌────┐┌────┐┌────┐┌────┐
                      │MINI││EXPEC││MCTS││EXPEC│
                      │MAX ││TIMAX││    ││TIMAX│
                      └────┘└────┘└────┘└────┘
```

---

## 📊 Decision Quality Over Time

```
Quality
  │
1.0│                                    ┌─── MCTS (converges)
  │                              ┌─────┘
  │                        ┌────┘
0.8│              ┌───────┘
  │         ┌────┘
  │    ┌───┘                    Minimax ──────────
0.6│───────────────────────────────────────────────
  │                            Expectimax ─────────
  │                   Influence Maps ──────────────
0.4│
  │
0.2│
  │
0.0└──────────────────────────────────────────────→
    0ms   50ms  100ms  200ms  500ms  1000ms    Time

Legend:
• Influence Maps: Instant but heuristic
• Minimax/Expectimax: Good quality, fixed time
• MCTS: Quality improves with more time
```

---

## 🔄 Complete Decision Cycle

```
┌──────────────────────────────────────────────────────────┐
│                    GAME LOOP                              │
└──────────────────────────────────────────────────────────┘

Every frame (16ms for 60 FPS):

   ┌────────────────────────────────────┐
   │ 1. PERCEIVE                        │
   │    • Read sensors                  │
   │    • Update world model            │
   └────────────────────────────────────┘
                  │
                  ▼
   ┌────────────────────────────────────┐
   │ 2. DECIDE (One of 4 algorithms)    │
   │    • Run chosen algorithm          │
   │    • Get next move                 │
   └────────────────────────────────────┘
                  │
                  ▼
   ┌────────────────────────────────────┐
   │ 3. ACT                             │
   │    • Move Pacman                   │
   │    • Collect pellets               │
   └────────────────────────────────────┘
                  │
                  ▼
   ┌────────────────────────────────────┐
   │ 4. EVALUATE                        │
   │    • Check win/loss                │
   │    • Update performance metrics    │
   └────────────────────────────────────┘
                  │
                  └──→ Loop back to step 1
```

---

## Summary

These decision diagrams show how each algorithm transforms **perception** into **action**:

- **Minimax**: Optimal adversarial planning
- **Expectimax**: Probabilistic decision making  
- **Influence Maps**: Spatial tactical reasoning
- **MCTS**: Balanced exploration-exploitation

Choose based on your needs: speed, optimality, or sophistication!
