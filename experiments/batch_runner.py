#!/usr/bin/env python3
"""
Batch Runner - Génère des batches de simulations avec le même algorithme
pour analyser la performance et la variance.
"""

import json
import random
import sys
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.algorithms.maze.generators.recursive_backtracker import RecursiveBacktrackerGenerator
from src.algorithms.maze.imperfecteur import MazeImperfecteur


class BatchRunner:
    """Génère et exécute des batches de simulations."""
    
    def __init__(self, pacman_algo: str = "greedy", ghost_algo: str = "bfs", api_url: str = "https://ter-s1-n-lr0c.onrender.com"):
        """
        Args:
            pacman_algo: IA pour Pacman (aggressive, defensive, expectimax, greedy, influence_map, minimax, random_walker)
            ghost_algo: Algorithme pour les fantômes (astar, bfs, greedy, mixed)
            api_url: URL de l'API pour upload MongoDB
        """
        self.pacman_algo = pacman_algo
        self.ghost_algo = ghost_algo
        self.api_url = api_url
        self.batches_dir = Path('experiments/batches')
        self.batches_dir.mkdir(parents=True, exist_ok=True)
    
    def create_batch(self, 
                     n_simulations: int = 30,
                     maze_width: int = 21,
                     maze_height: int = 21,
                     batch_name: str = None) -> str:
        """
        Crée un batch de N simulations avec le même algorithme.
        
        Args:
            n_simulations: Nombre de simulations à générer
            maze_width: Largeur du labyrinthe
            maze_height: Hauteur du labyrinthe
            batch_name: Nom du batch (optionnel)
        
        Returns:
            batch_id: ID du batch créé
        """
        # Créer le répertoire du batch
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        batch_id = f"batch_{timestamp}"
        batch_dir = self.batches_dir / batch_id
        batch_dir.mkdir(exist_ok=True)
        
        if not batch_name:
            batch_name = f"Batch Pacman:{self.pacman_algo.upper()} vs Ghosts:{self.ghost_algo.upper()}"
        
        print(f"\n🎯 Création du batch: {batch_name}")
        print(f"   Pacman IA: {self.pacman_algo}")
        print(f"   Fantômes Algo: {self.ghost_algo}")
        print(f"   Simulations: {n_simulations}")
        print(f"   Labyrinthe: {maze_width}×{maze_height}\n")
        
        # Générer le labyrinthe
        print("🏗️  Génération du labyrinthe...")
        generator = RecursiveBacktrackerGenerator()
        maze, remaining_walls = generator.generate(maze_width, maze_height)
        
        # Ajouter des imperfections
        imperfecteur = MazeImperfecteur()
        maze, h_tunnels, v_tunnels = imperfecteur.make_imperfect(
            maze, remaining_walls, 
            imperfection_level=20,
            width=maze_width,
            height=maze_height,
            tunnels_h=1,
            tunnels_v=0
        )
        
        maze_data = {
            'width': maze_width,
            'height': maze_height,
            'data': maze,  # maze est déjà une liste
            'algorithm': 'recursive_backtracker',
            'imperfections': 20
        }
        
        # Sauvegarder le labyrinthe
        with open(batch_dir / 'maze.json', 'w') as f:
            json.dump(maze_data, f, indent=2)
        
        print("  ✓ Labyrinthe généré\n")
        
        # Exécuter les simulations
        print(f"🚀 Exécution de {n_simulations} simulations...")
        results = []
        
        for i in range(n_simulations):
            result = self._run_simulation(i + 1, maze)
            results.append(result)
            
            if (i + 1) % 10 == 0:
                print(f"  [{i + 1}/{n_simulations}] simulations terminées")
        
        print(f"  ✓ {n_simulations} simulations terminées\n")
        
        # Calculer les statistiques
        print("📊 Calcul des statistiques...")
        stats = self._calculate_statistics(results)
        
        # Sauvegarder les résultats
        config = {
            'batch_id': batch_id,
            'batch_name': batch_name,
            'pacman_algorithm': self.pacman_algo,
            'ghost_algorithm': self.ghost_algo,
            'n_simulations': n_simulations,
            'maze_width': maze_width,
            'maze_height': maze_height,
            'created_at': datetime.now().isoformat()
        }
        
        with open(batch_dir / 'config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        with open(batch_dir / 'results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        with open(batch_dir / 'statistics.json', 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"  ✓ Statistiques calculées")
        
        # Upload vers MongoDB
        print(f"\n📤 Upload vers MongoDB...")
        if self._upload_to_db(batch_id, config, maze_data, results, stats):
            print(f"  ✅ Batch sauvegardé dans MongoDB")
        else:
            print(f"  ⚠️  Batch sauvegardé en local uniquement")
        
        print(f"\n✅ Batch créé: {batch_dir}")
        
        return batch_id
    
    def _run_simulation(self, sim_number: int, maze) -> Dict:
        """
        Exécute une simulation.
        
        NOTE: Utilise des données mock pour le moment.
        À remplacer par une vraie simulation avec GameEngine.
        """
        # Mock data - à remplacer par vraie simulation
        score = random.randint(100, 500)
        memory = random.uniform(0.5, 2.0) * 1024 * 1024  # En bytes
        decision_time = random.uniform(0.5, 5.0)  # En ms
        duration = random.uniform(30, 90)
        frames = int(duration * 30)
        
        return {
            'simulation_number': sim_number,
            'pacman_algorithm': self.pacman_algo,
            'ghost_algorithm': self.ghost_algo,
            'results': {
                'score': score,
                'duration': duration,
                'frames': frames,
                'memory_used': memory,
                'avg_decision_time': decision_time,
                'completed': True
            }
        }
    
    def _calculate_statistics(self, results: List[Dict]) -> Dict:
        """Calcule les statistiques du batch."""
        scores = [r['results']['score'] for r in results]
        memories = [r['results']['memory_used'] for r in results]
        times = [r['results']['avg_decision_time'] for r in results]
        
        return {
            'score': {
                'mean': sum(scores) / len(scores),
                'min': min(scores),
                'max': max(scores),
                'std': self._std(scores)
            },
            'memory': {
                'mean': sum(memories) / len(memories),
                'min': min(memories),
                'max': max(memories),
                'std': self._std(memories)
            },
            'decision_time': {
                'mean': sum(times) / len(times),
                'min': min(times),
                'max': max(times),
                'std': self._std(times)
            },
            'n_simulations': len(results)
        }
    
    def _std(self, values: List[float]) -> float:
        """Calcule l'écart-type."""
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance ** 0.5
    
    def _upload_to_db(self, batch_id: str, config: Dict, maze: Dict, 
                      results: List[Dict], stats: Dict) -> bool:
        """
        Upload le batch vers MongoDB.
        
        Returns:
            True si succès, False sinon
        """
        batch_data = {
            'batch_id': batch_id,
            'name': config['batch_name'],
            'pacman_algorithm': config['pacman_algorithm'],
            'ghost_algorithm': config['ghost_algorithm'],
            'n_simulations': config['n_simulations'],
            'maze': maze,
            'statistics': {
                'score': {
                    'mean': stats['score']['mean'],
                    'min': stats['score']['min'],
                    'max': stats['score']['max'],
                    'std': stats['score']['std']
                },
                'memory': {
                    'mean_mb': stats['memory']['mean'] / (1024 * 1024),
                    'min_mb': stats['memory']['min'] / (1024 * 1024),
                    'max_mb': stats['memory']['max'] / (1024 * 1024),
                    'std_mb': stats['memory']['std'] / (1024 * 1024)
                },
                'decision_time': {
                    'mean_ms': stats['decision_time']['mean'],
                    'min_ms': stats['decision_time']['min'],
                    'max_ms': stats['decision_time']['max'],
                    'std_ms': stats['decision_time']['std']
                }
            },
            'results': results,
            'created_at': config['created_at']
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/api/batches",
                json=batch_data,
                headers={'Content-Type': 'application/json'},
                timeout=30  # Augmenter le timeout pour Render
            )
            
            if response.status_code in [200, 201]:
                return True
            else:
                print(f"  ⚠️  Erreur HTTP {response.status_code}: {response.text[:200]}")
                return False
        
        except requests.exceptions.ConnectionError as e:
            print(f"  ℹ️  Serveur non disponible sur {self.api_url}")
            print(f"     Détails: {e}")
            return False
        
        except requests.exceptions.Timeout:
            print(f"  ⚠️  Timeout - Le serveur met trop de temps à répondre")
            return False
        
        except Exception as e:
            print(f"  ⚠️  Erreur: {e}")
            return False


def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Générer un batch de simulations')
    parser.add_argument('--pacman', type=str, default='greedy',
                        help='IA pour Pacman (aggressive, defensive, expectimax, greedy, influence_map, minimax, random_walker)')
    parser.add_argument('--ghosts', type=str, default='bfs',
                        help='Algorithme pour les fantômes (astar, bfs, greedy, mixed)')
    parser.add_argument('--simulations', type=int, default=30,
                        help='Nombre de simulations à générer')
    parser.add_argument('--name', type=str, default=None,
                        help='Nom du batch')
    parser.add_argument('--maze-width', type=int, default=21,
                        help='Largeur du labyrinthe')
    parser.add_argument('--maze-height', type=int, default=21,
                        help='Hauteur du labyrinthe')
    parser.add_argument('--api-url', type=str, default='https://ter-s1-n-lr0c.onrender.com',
                        help='URL de l\'API pour MongoDB')
    parser.add_argument('--no-upload', action='store_true',
                        help='Ne pas uploader vers MongoDB')
    
    args = parser.parse_args()
    
    api_url = None if args.no_upload else args.api_url
    
    runner = BatchRunner(pacman_algo=args.pacman, ghost_algo=args.ghosts, api_url=api_url or "https://ter-s1-n-lr0c.onrender.com")
    batch_id = runner.create_batch(
        n_simulations=args.simulations,
        maze_width=args.maze_width,
        maze_height=args.maze_height,
        batch_name=args.name
    )
    
    print(f"\n🎉 Batch {batch_id} créé avec succès!")
    print(f"   Local: experiments/batches/{batch_id}")
    if not args.no_upload:
        print(f"   MongoDB: Uploadé via {args.api_url}")
    print(f"\n   Pour visualiser: python3 experiments/visualize_3d.py --batch {batch_id}")


if __name__ == '__main__':
    main()
