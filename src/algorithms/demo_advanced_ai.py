"""
Demo script to test and compare state-of-the-art Pacman AI algorithms

This script demonstrates:
1. All 4 advanced algorithms
2. Performance metrics comparison
3. Decision visualization
4. Algorithm behavior analysis
"""

import sys
import os
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from algorithms.pacman_ai.minimax import MinimaxPacman
from algorithms.pacman_ai.expectimax import ExpectimaxPacman
from algorithms.pacman_ai.influence_map import InfluenceMapPacman
from algorithms.pacman_ai.mcts import MCTSPacman


def create_test_maze():
    """Create a simple test maze"""
    return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]


def test_algorithm(algorithm_class, name, grid, config=None):
    """
    Test an algorithm and measure performance
    
    Args:
        algorithm_class: The algorithm class to test
        name: Display name
        grid: Maze grid
        config: Configuration dict for algorithm
    """
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    
    # Create agent
    if config:
        agent = algorithm_class(grid, **config)
    else:
        agent = algorithm_class(grid)
    
    # Test scenario
    pacman_pos = (5, 5)
    ghost_positions = [(2, 2), (7, 7)]
    pellet_positions = [(1, 1), (3, 5), (7, 3), (8, 8)]
    
    print(f"\nScenario:")
    print(f"  Pacman: {pacman_pos}")
    print(f"  Ghosts: {ghost_positions}")
    print(f"  Pellets: {pellet_positions}")
    
    # Measure decision time
    start_time = time.perf_counter()
    next_move = agent.get_next_move(pacman_pos, ghost_positions, pellet_positions)
    decision_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
    
    print(f"\nResults:")
    print(f"  Next move: {next_move}")
    print(f"  Decision time: {decision_time:.2f}ms")
    
    # Algorithm-specific metrics
    if hasattr(agent, 'nodes_explored'):
        print(f"  Nodes explored: {agent.nodes_explored}")
    
    # Visualize for Influence Maps
    if isinstance(agent, InfluenceMapPacman):
        print(f"\n  Influence Map Analysis:")
        danger_map = agent.get_danger_map()
        combined_map = agent.get_combined_map()
        
        print(f"    Max danger: {danger_map.max():.2f}")
        print(f"    Chosen position score: {combined_map[next_move[1]][next_move[0]]:.2f}")
    
    return {
        'name': name,
        'next_move': next_move,
        'decision_time': decision_time,
        'nodes_explored': getattr(agent, 'nodes_explored', 0)
    }


def visualize_decision(grid, pacman_pos, ghost_positions, next_move):
    """Simple ASCII visualization of the decision"""
    print("\n  Visual:")
    for y in range(len(grid)):
        row = "    "
        for x in range(len(grid[0])):
            pos = (x, y)
            if grid[y][x] == 1:
                row += "█ "
            elif pos == pacman_pos:
                row += "P "
            elif pos == next_move:
                row += "→ "
            elif pos in ghost_positions:
                row += "G "
            else:
                row += "· "
        print(row)


def compare_algorithms():
    """Compare all algorithms side by side"""
    print("\n" + "="*60)
    print("ALGORITHM COMPARISON")
    print("="*60)
    
    grid = create_test_maze()
    
    # Test configurations
    algorithms = [
        (MinimaxPacman, "Minimax (depth=3)", {'depth': 3}),
        (ExpectimaxPacman, "Expectimax (depth=3)", {'depth': 3}),
        (InfluenceMapPacman, "Influence Maps", None),
        (MCTSPacman, "MCTS (1000 iterations)", {'iterations': 1000}),
    ]
    
    results = []
    for algo_class, name, config in algorithms:
        result = test_algorithm(algo_class, name, grid, config)
        results.append(result)
        
        # Visualize first algorithm's decision
        if len(results) == 1:
            pacman_pos = (5, 5)
            ghost_positions = [(2, 2), (7, 7)]
            visualize_decision(grid, pacman_pos, ghost_positions, result['next_move'])
    
    # Summary table
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}\n")
    print(f"{'Algorithm':<25} {'Decision Time':<15} {'Nodes Explored':<15}")
    print("-" * 60)
    
    for result in results:
        print(f"{result['name']:<25} {result['decision_time']:>10.2f}ms {result['nodes_explored']:>15}")
    
    # Analysis
    print(f"\n{'='*60}")
    print("ANALYSIS")
    print(f"{'='*60}")
    
    fastest = min(results, key=lambda r: r['decision_time'])
    most_efficient = min(results, key=lambda r: r['nodes_explored'] if r['nodes_explored'] > 0 else float('inf'))
    
    print(f"\n✓ Fastest: {fastest['name']} ({fastest['decision_time']:.2f}ms)")
    print(f"✓ Most Efficient: {most_efficient['name']} ({most_efficient['nodes_explored']} nodes)")
    
    print("\nKey Insights:")
    print("  • Influence Maps: Fastest but heuristic-based")
    print("  • Minimax/Expectimax: Good balance of speed and optimality")
    print("  • MCTS: Slowest but most sophisticated, converges to optimal")


def demonstrate_influence_maps():
    """Special demonstration of Influence Maps with visualization"""
    print(f"\n{'='*60}")
    print("INFLUENCE MAPS - DETAILED VISUALIZATION")
    print(f"{'='*60}")
    
    grid = create_test_maze()
    agent = InfluenceMapPacman(grid)
    
    pacman_pos = (5, 5)
    ghost_positions = [(3, 3)]
    pellet_positions = [(7, 3), (7, 5)]
    
    next_move = agent.get_next_move(pacman_pos, ghost_positions, pellet_positions)
    
    # Get maps
    danger_map = agent.get_danger_map()
    opportunity_map = agent.get_opportunity_map()
    combined_map = agent.get_combined_map()
    
    print("\nDanger Map (higher = more dangerous):")
    print_heatmap(danger_map, grid, pacman_pos, ghost_positions)
    
    print("\nOpportunity Map (higher = more pellets nearby):")
    print_heatmap(opportunity_map, grid, pacman_pos, ghost_positions)
    
    print("\nCombined Map (higher = better move):")
    print_heatmap(combined_map, grid, pacman_pos, ghost_positions, next_move)


def print_heatmap(heatmap, grid, pacman_pos, ghost_positions, highlight=None):
    """Print a heatmap with ASCII visualization"""
    for y in range(len(grid)):
        row = "  "
        for x in range(len(grid[0])):
            pos = (x, y)
            if grid[y][x] == 1:
                row += "   ███ "
            elif pos == pacman_pos:
                row += "    P  "
            elif pos in ghost_positions:
                row += "    G  "
            elif pos == highlight:
                row += f" →{heatmap[y][x]:>4.0f}"
            else:
                row += f"  {heatmap[y][x]:>4.0f} "
        print(row)


def main():
    """Main demo function"""
    print("\n" + "="*60)
    print("STATE-OF-THE-ART PACMAN AI ALGORITHMS - DEMO")
    print("="*60)
    print("\nThis demo showcases 4 advanced decision-making algorithms:")
    print("  1. Minimax with Alpha-Beta Pruning")
    print("  2. Expectimax")
    print("  3. Influence Maps")
    print("  4. Monte Carlo Tree Search (MCTS)")
    
    # Run comparison
    compare_algorithms()
    
    # Detailed Influence Maps demo
    demonstrate_influence_maps()
    
    print("\n" + "="*60)
    print("Demo complete! See docs/ADVANCED_AI_ALGORITHMS.md for details.")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
