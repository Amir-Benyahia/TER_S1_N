"""
Tests pour le module de métriques de performance
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from algorithms.utils.performance_metrics import (
    PerformanceTracker,
    ComplexityAnalyzer,
    ScoreCalculator
)


def test_performance_tracker():
    """Test du tracking de performance"""
    print("🧪 Test PerformanceTracker...")
    
    tracker = PerformanceTracker()
    
    # Test tracking d'une entité
    tracker.start_tracking('test_agent')
    
    # Simuler quelques décisions
    for i in range(10):
        tracker.record_decision('test_agent', nodes_explored=i * 5)
    
    # Récupérer les métriques
    metrics = tracker.get_metrics('test_agent')
    
    print(f"  ✓ Mémoire moyenne: {metrics['memoryUsage']} bytes")
    print(f"  ✓ Temps de décision moyen: {metrics['avgDecisionTime']:.3f} ms")
    print(f"  ✓ Nœuds explorés: {metrics['pathNodesExplored']}")
    print(f"  ✓ Nombre de décisions: {metrics['decisionsCount']}")
    
    assert metrics['decisionsCount'] == 10
    assert metrics['pathNodesExplored'] == sum(i * 5 for i in range(10))
    
    tracker.stop_tracking()
    print("  ✅ PerformanceTracker fonctionne correctement\n")


def test_complexity_analyzer():
    """Test de l'analyseur de complexité"""
    print("🧪 Test ComplexityAnalyzer...")
    
    # Test des algorithmes connus
    algorithms = ['astar', 'bfs', 'greedy', 'random', 'defensive', 'aggressive']
    
    for algo in algorithms:
        complexity = ComplexityAnalyzer.get_complexity(algo, 'ghost')
        print(f"  ✓ {algo.upper()}: {complexity['timeComplexity']} / {complexity['spaceComplexity']}")
        assert complexity['timeComplexity'] is not None
        assert complexity['spaceComplexity'] is not None
    
    # Test algorithme inconnu
    unknown = ComplexityAnalyzer.get_complexity('unknown_algo')
    assert unknown['timeComplexity'] == 'O(1)'
    
    print("  ✅ ComplexityAnalyzer fonctionne correctement\n")


def test_score_calculator():
    """Test du calculateur de score"""
    print("🧪 Test ScoreCalculator...")
    
    # Test 1: Partie complète sans capture
    score1 = ScoreCalculator.calculate_score(
        trajectory_length=100,
        pellets_eaten=50,
        power_pellets_eaten=4,
        caught=False,
        total_frames=100,
        maze_size=200
    )
    print(f"  ✓ Score (partie complète): {score1}")
    assert score1 > 2000  # Devrait avoir un bon score
    
    # Test 2: Capture précoce
    score2 = ScoreCalculator.calculate_score(
        trajectory_length=100,
        pellets_eaten=10,
        power_pellets_eaten=0,
        caught=True,
        total_frames=20,
        maze_size=200
    )
    print(f"  ✓ Score (capture précoce): {score2}")
    assert score2 < score1  # Devrait être plus faible
    
    # Test 3: Performance rating
    rating = ScoreCalculator.calculate_performance_rating(
        score=score1,
        duration=5000,
        caught=False,
        avg_memory=500000,
        avg_decision_time=5
    )
    print(f"  ✓ Rating de performance: {rating:.1f}/5.0")
    assert 0 <= rating <= 5
    
    print("  ✅ ScoreCalculator fonctionne correctement\n")


def test_integration():
    """Test d'intégration complet"""
    print("🧪 Test d'intégration...")
    
    # Créer un tracker
    tracker = PerformanceTracker()
    
    # Simuler plusieurs agents
    agents = ['pacman', 'blinky_astar', 'pinky_bfs']
    
    for agent in agents:
        tracker.start_tracking(agent)
        
        # Simuler des décisions
        for _ in range(5):
            nodes = 20 if 'astar' in agent else 30 if 'bfs' in agent else 0
            tracker.record_decision(agent, nodes_explored=nodes)
    
    # Récupérer toutes les métriques
    all_metrics = {}
    for agent in agents:
        all_metrics[agent] = tracker.get_metrics(agent)
    
    # Analyser les complexités
    complexity_astar = ComplexityAnalyzer.get_complexity('astar')
    complexity_bfs = ComplexityAnalyzer.get_complexity('bfs')
    
    print(f"  ✓ Métriques collectées pour {len(all_metrics)} agents")
    print(f"  ✓ A*: {complexity_astar['timeComplexity']}")
    print(f"  ✓ BFS: {complexity_bfs['timeComplexity']}")
    
    # Calculer un score global
    score = ScoreCalculator.calculate_score(
        trajectory_length=150,
        pellets_eaten=75,
        power_pellets_eaten=4,
        caught=False,
        total_frames=150,
        maze_size=300
    )
    
    print(f"  ✓ Score final: {score}")
    
    tracker.stop_tracking()
    print("  ✅ Test d'intégration réussi\n")


def run_all_tests():
    """Exécute tous les tests"""
    print("=" * 60)
    print("🚀 Démarrage des tests de métriques de performance")
    print("=" * 60 + "\n")
    
    try:
        test_performance_tracker()
        test_complexity_analyzer()
        test_score_calculator()
        test_integration()
        
        print("=" * 60)
        print("✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!")
        print("=" * 60)
        return True
        
    except AssertionError as e:
        print(f"\n❌ ÉCHEC DU TEST: {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
