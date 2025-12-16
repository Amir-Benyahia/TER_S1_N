"""
Module de calcul des métriques de performance pour l'analyse scientifique des simulations.
Mesure l'occupation mémoire, la complexité temporelle et d'autres indicateurs de performance.
"""

import sys
import time
import tracemalloc
from typing import Dict, Any, Optional


class PerformanceTracker:
    """Tracker pour mesurer les performances des algorithmes durant la simulation."""
    
    def __init__(self):
        self.trackers = {}
        self.active_tracker = None
        
    def start_tracking(self, entity_id: str):
        """Démarre le tracking pour une entité donnée."""
        if entity_id not in self.trackers:
            self.trackers[entity_id] = {
                'memory_samples': [],
                'time_samples': [],
                'nodes_explored': 0,
                'decisions_count': 0
            }
        
        self.active_tracker = entity_id
        
        # Démarrer le tracking mémoire si pas déjà actif
        if not tracemalloc.is_tracing():
            tracemalloc.start()
        
        # Enregistrer le snapshot mémoire de départ
        current, peak = tracemalloc.get_traced_memory()
        self.trackers[entity_id]['start_memory'] = current
        self.trackers[entity_id]['start_time'] = time.perf_counter()
    
    def record_decision(self, entity_id: str, nodes_explored: int = 0):
        """Enregistre une décision et ses métriques."""
        if entity_id not in self.trackers:
            return
        
        tracker = self.trackers[entity_id]
        
        # Mesurer la mémoire actuelle
        if tracemalloc.is_tracing():
            current, peak = tracemalloc.get_traced_memory()
            memory_used = current - tracker.get('start_memory', 0)
            tracker['memory_samples'].append(memory_used)
        
        # Mesurer le temps de décision
        if 'start_time' in tracker:
            decision_time = (time.perf_counter() - tracker['start_time']) * 1000  # en ms
            tracker['time_samples'].append(decision_time)
            tracker['start_time'] = time.perf_counter()  # Reset pour prochaine décision
        
        # Enregistrer les nœuds explorés
        tracker['nodes_explored'] += nodes_explored
        tracker['decisions_count'] += 1
    
    def get_metrics(self, entity_id: str) -> Dict[str, Any]:
        """Retourne les métriques calculées pour une entité."""
        if entity_id not in self.trackers:
            return self._default_metrics()
        
        tracker = self.trackers[entity_id]
        
        # Calculer les moyennes
        avg_memory = (
            sum(tracker['memory_samples']) / len(tracker['memory_samples'])
            if tracker['memory_samples'] else 0
        )
        
        avg_time = (
            sum(tracker['time_samples']) / len(tracker['time_samples'])
            if tracker['time_samples'] else 0
        )
        
        return {
            'memoryUsage': int(avg_memory),  # bytes
            'avgDecisionTime': round(avg_time, 3),  # ms
            'pathNodesExplored': tracker['nodes_explored'],
            'decisionsCount': tracker['decisions_count']
        }
    
    def _default_metrics(self) -> Dict[str, Any]:
        """Métriques par défaut."""
        return {
            'memoryUsage': 0,
            'avgDecisionTime': 0,
            'pathNodesExplored': 0,
            'decisionsCount': 0
        }
    
    def stop_tracking(self):
        """Arrête le tracking mémoire."""
        if tracemalloc.is_tracing():
            tracemalloc.stop()


class ComplexityAnalyzer:
    """Analyse la complexité temporelle et spatiale des algorithmes."""
    
    # Complexités connues des algorithmes
    ALGORITHM_COMPLEXITIES = {
        'astar': {
            'time': 'O(b^d)',  # b=branching factor, d=depth
            'space': 'O(b^d)',
            'description': 'A* avec heuristique'
        },
        'bfs': {
            'time': 'O(V + E)',  # V=vertices, E=edges
            'space': 'O(V)',
            'description': 'Breadth-First Search'
        },
        'greedy': {
            'time': 'O(1)',  # Décision immédiate
            'space': 'O(1)',
            'description': 'Greedy heuristic'
        },
        'random': {
            'time': 'O(1)',
            'space': 'O(1)',
            'description': 'Random walk'
        },
        'defensive': {
            'time': 'O(V)',  # Distance calculation
            'space': 'O(1)',
            'description': 'Defensive strategy'
        },
        'aggressive': {
            'time': 'O(V)',
            'space': 'O(1)',
            'description': 'Aggressive pursuit'
        }
    }
    
    @staticmethod
    def get_complexity(algorithm: str, entity_type: str = 'ghost') -> Dict[str, str]:
        """
        Retourne la complexité théorique d'un algorithme.
        
        Args:
            algorithm: Nom de l'algorithme (astar, bfs, greedy, etc.)
            entity_type: Type d'entité (ghost ou pacman)
        
        Returns:
            Dict contenant la complexité temporelle et spatiale
        """
        algo_lower = algorithm.lower()
        
        if algo_lower in ComplexityAnalyzer.ALGORITHM_COMPLEXITIES:
            info = ComplexityAnalyzer.ALGORITHM_COMPLEXITIES[algo_lower]
            return {
                'timeComplexity': info['time'],
                'spaceComplexity': info['space'],
                'description': info['description']
            }
        
        # Complexité par défaut pour algorithmes non répertoriés
        return {
            'timeComplexity': 'O(1)',
            'spaceComplexity': 'O(1)',
            'description': 'Unknown algorithm'
        }


class ScoreCalculator:
    """Calcule le score de la simulation selon des critères scientifiques."""
    
    # Constantes pour le calcul du score
    BASE_SCORE = 1000
    PELLET_VALUE = 10
    POWER_PELLET_VALUE = 50
    SURVIVAL_BONUS_PER_FRAME = 1
    EFFICIENCY_MULTIPLIER = 1.5
    
    @staticmethod
    def calculate_score(
        trajectory_length: int,
        pellets_eaten: int = 0,
        power_pellets_eaten: int = 0,
        caught: bool = False,
        total_frames: int = 0,
        maze_size: int = 100
    ) -> int:
        """
        Calcule le score basé sur plusieurs facteurs.
        
        Args:
            trajectory_length: Nombre de mouvements effectués
            pellets_eaten: Nombre de pellets mangés
            power_pellets_eaten: Nombre de power pellets mangés
            caught: Si Pacman a été attrapé
            total_frames: Nombre total de frames
            maze_size: Taille du labyrinthe (pour normalisation)
        
        Returns:
            Score calculé
        """
        score = ScoreCalculator.BASE_SCORE
        
        # Points pour les pellets
        score += pellets_eaten * ScoreCalculator.PELLET_VALUE
        score += power_pellets_eaten * ScoreCalculator.POWER_PELLET_VALUE
        
        # Bonus de survie
        if not caught:
            score += total_frames * ScoreCalculator.SURVIVAL_BONUS_PER_FRAME
            score += ScoreCalculator.BASE_SCORE  # Bonus de complétion
        else:
            # Pénalité pour capture précoce
            penalty = (1 - total_frames / max(trajectory_length, 1)) * ScoreCalculator.BASE_SCORE
            score -= int(penalty)
        
        # Bonus d'efficacité (ratio mouvements/taille du labyrinthe)
        if trajectory_length > 0:
            efficiency = maze_size / trajectory_length
            if efficiency > 0.5:  # Mouvement efficace
                score *= ScoreCalculator.EFFICIENCY_MULTIPLIER
        
        return max(0, int(score))  # Score ne peut pas être négatif
    
    @staticmethod
    def calculate_performance_rating(
        score: int,
        duration: float,
        caught: bool,
        avg_memory: float,
        avg_decision_time: float
    ) -> float:
        """
        Calcule une note de performance globale (0-5 étoiles).
        
        Args:
            score: Score de la simulation
            duration: Durée en secondes
            caught: Si capturé
            avg_memory: Mémoire moyenne utilisée
            avg_decision_time: Temps de décision moyen
        
        Returns:
            Note sur 5 (float)
        """
        rating = 0.0
        
        # Score (max 2 étoiles)
        if score >= 5000:
            rating += 2.0
        elif score >= 3000:
            rating += 1.5
        elif score >= 1000:
            rating += 1.0
        else:
            rating += 0.5
        
        # Survie (1 étoile)
        if not caught:
            rating += 1.0
        else:
            rating += 0.5
        
        # Performance (efficacité mémoire et temps - max 2 étoiles)
        if avg_memory < 1000000:  # < 1MB
            rating += 1.0
        elif avg_memory < 5000000:  # < 5MB
            rating += 0.5
        
        if avg_decision_time < 10:  # < 10ms
            rating += 1.0
        elif avg_decision_time < 50:  # < 50ms
            rating += 0.5
        
        return min(5.0, rating)
