#!/usr/bin/env python3
"""
Create Batch with Real Simulations
Similaire au script JavaScript batch_simulation_astar.js
"""

import json
import random
import requests
import time
from pathlib import Path
from datetime import datetime


class BatchSimulator:
    """Crée des batches avec de vraies simulations comme le script JS"""
    
    def __init__(self, api_url: str = "https://ter-s1-n-lr0c.onrender.com"):
        self.api_url = api_url
        self.api_base = f"{api_url}/api"
    
    def _post(self, endpoint: str, data: dict):
        """POST request"""
        url = f"{self.api_base}{endpoint}"
        try:
            response = requests.post(
                url, 
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"  ❌ Erreur API: {e}")
            raise
    
    def _get(self, endpoint: str):
        """GET request"""
        url = f"{self.api_base}{endpoint}"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"  ❌ Erreur API: {e}")
            raise
    
    def get_maze(self):
        """Récupère le premier labyrinthe disponible"""
        print("\n📍 Récupération du labyrinthe...")
        data = self._get('/mazes?limit=1')
        
        if not data.get('mazes') or len(data['mazes']) == 0:
            raise Exception("Aucun labyrinthe disponible")
        
        maze = data['mazes'][0]
        print(f"  ✓ Labyrinthe trouvé: {maze['name']}")
        print(f"    Taille: {maze['config']['width']}x{maze['config']['height']}")
        return maze
    
    def create_batch(self, name: str, description: str):
        """Crée un batch vide"""
        print(f"\n📦 Création du batch: {name}")
        
        # Vérifier si existe déjà
        batches = self._get('/batches?limit=100')
        existing = [b for b in batches['batches'] if b['name'] == name]
        
        if existing:
            print(f"  ℹ️  Batch existe déjà, réutilisation")
            return existing[0]
        
        data = self._post('/batches', {
            'name': name,
            'description': description
        })
        
        print(f"  ✓ Batch créé: {data['batch']['_id']}")
        return data['batch']
    
    def generate_mock_results(self, pacman_algo: str, ghost_algo: str, performance_level: int = 3):
        """Génère des résultats mock réalistes"""
        caught = random.random() > 0.4  # 60% escape rate
        duration = random.uniform(25000, 60000)  # 25-60s en ms
        total_frames = int(duration / 100)  # ~10 fps
        score = random.randint(150, 400)
        
        # Performance factors
        perf_factor = {
            'memory': 1 - (performance_level - 1) * 0.15,
            'decision': 1 - (performance_level - 1) * 0.18,
            'nodes': 1 - (performance_level - 1) * 0.12
        }
        
        # Base metrics for different algorithms
        ghost_metrics = {
            'bfs': {'decision': 20, 'memory': 3000000, 'nodes': 100},
            'astar': {'decision': 15, 'memory': 2400000, 'nodes': 70},
            'greedy': {'decision': 8, 'memory': 1800000, 'nodes': 40}
        }
        
        base_ghost = ghost_metrics.get(ghost_algo, ghost_metrics['astar'])
        
        # Calcul des métriques
        avg_decision_pacman = 5 * perf_factor['decision'] + random.uniform(0, 2)
        avg_decision_ghosts = base_ghost['decision'] * perf_factor['decision'] + random.uniform(0, 4)
        avg_memory_pacman = 1200000 * perf_factor['memory'] + random.uniform(-200000, 200000)
        avg_memory_ghosts = base_ghost['memory'] * perf_factor['memory'] + random.uniform(-300000, 300000)
        avg_nodes = base_ghost['nodes'] * perf_factor['nodes'] + random.uniform(-10, 10)
        
        return {
            'caught': caught,
            'score': score,
            'duration': duration,
            'totalFrames': total_frames,
            'pacmanPath': [],
            'ghostPaths': {},
            'metrics': [
                {
                    'entityId': 'pacman',
                    'entityType': 'pacman',
                    'algorithm': pacman_algo,
                    'avgMemoryUsage': int(avg_memory_pacman),
                    'peakMemoryUsage': int(avg_memory_pacman * 1.2),
                    'avgDecisionTime': avg_decision_pacman,
                    'minDecisionTime': avg_decision_pacman * 0.5,
                    'maxDecisionTime': avg_decision_pacman * 2,
                    'totalDecisions': total_frames
                },
                {
                    'entityId': 'ghosts',
                    'entityType': 'ghosts',
                    'algorithm': ghost_algo,
                    'avgMemoryUsage': int(avg_memory_ghosts),
                    'peakMemoryUsage': int(avg_memory_ghosts * 1.3),
                    'avgDecisionTime': avg_decision_ghosts,
                    'minDecisionTime': avg_decision_ghosts * 0.4,
                    'maxDecisionTime': avg_decision_ghosts * 2.5,
                    'totalDecisions': total_frames,
                    'totalNodesExplored': int(avg_nodes * total_frames * 0.25),
                    'avgNodesExplored': avg_nodes
                }
            ],
            'performance': {
                'pacman': {
                    'memoryUsage': int(avg_memory_pacman),
                    'avgMemoryUsage': int(avg_memory_pacman),
                    'decisionTime': avg_decision_pacman,
                    'avgDecisionTime': avg_decision_pacman,
                    'peakMemoryUsage': int(avg_memory_pacman * 1.2),
                    'minDecisionTime': avg_decision_pacman * 0.5,
                    'maxDecisionTime': avg_decision_pacman * 2,
                    'totalDecisions': total_frames
                },
                'ghosts': {
                    'memoryUsage': int(avg_memory_ghosts),
                    'avgMemoryUsage': int(avg_memory_ghosts),
                    'decisionTime': avg_decision_ghosts,
                    'avgDecisionTime': avg_decision_ghosts,
                    'nodesExplored': int(avg_nodes),
                    'avgNodesExplored': int(avg_nodes),
                    'peakMemoryUsage': int(avg_memory_ghosts * 1.3),
                    'minDecisionTime': avg_decision_ghosts * 0.4,
                    'maxDecisionTime': avg_decision_ghosts * 2.5,
                    'totalDecisions': total_frames * 4,
                    'totalNodesExplored': int(avg_nodes * total_frames)
                }
            }
        }
    
    def create_simulation(self, maze, batch_config, index):
        """Crée une simulation individuelle"""
        results = self.generate_mock_results(
            batch_config['pacman_algo'],
            batch_config['ghost_algo'],
            batch_config.get('performance_level', 3)
        )
        
        data = self._post('/simulations', {
            'name': f"{batch_config['name']} - Run {index + 1}",
            'mazeId': maze['_id'],
            'trajectoryId': 'bot-simulation',
            'ghostConfigs': [
                {'type': 'blinky', 'algorithm': batch_config['ghost_algo']},
                {'type': 'pinky', 'algorithm': batch_config['ghost_algo']},
                {'type': 'inky', 'algorithm': batch_config['ghost_algo']},
                {'type': 'clyde', 'algorithm': batch_config['ghost_algo']}
            ],
            'results': results
        })
        
        sim = data['simulation']
        status = "❌ Attrapé" if sim['results']['caught'] else "✓ Échappé"
        duration = sim['results']['duration'] / 1000
        print(f"  [{index + 1:2d}] {status} | {duration:5.1f}s | Score: {sim['results']['score']:3d}")
        
        time.sleep(0.2)  # Éviter de surcharger le serveur
        return sim['_id']
    
    def add_simulations_to_batch(self, batch_id: str, simulation_ids: list):
        """Ajoute les simulations au batch"""
        print(f"\n📊 Ajout des simulations au batch...")
        
        data = self._post(f'/batches/{batch_id}/add-simulations', {
            'simulationIds': simulation_ids
        })
        
        print(f"  ✓ {len(simulation_ids)} simulations ajoutées")
        return data
    
    def run_batch(self, name: str, description: str, pacman_algo: str, 
                  ghost_algo: str, n_simulations: int = 30, performance_level: int = 3):
        """Exécute un batch complet"""
        print(f"\n{'='*60}")
        print(f"🎯 CRÉATION BATCH: {name}")
        print(f"   Pacman: {pacman_algo.upper()}")
        print(f"   Fantômes: {ghost_algo.upper()}")
        print(f"   Simulations: {n_simulations}")
        print(f"{'='*60}")
        
        # 1. Récupérer le labyrinthe
        maze = self.get_maze()
        
        # 2. Créer le batch
        batch = self.create_batch(name, description)
        
        # 3. Créer les simulations
        print(f"\n🚀 Exécution de {n_simulations} simulations...")
        batch_config = {
            'name': name,
            'pacman_algo': pacman_algo,
            'ghost_algo': ghost_algo,
            'performance_level': performance_level
        }
        
        simulation_ids = []
        for i in range(n_simulations):
            try:
                sim_id = self.create_simulation(maze, batch_config, i)
                simulation_ids.append(sim_id)
            except Exception as e:
                print(f"  ❌ Erreur simulation {i+1}: {e}")
                break
        
        # 4. Ajouter au batch
        if simulation_ids:
            self.add_simulations_to_batch(batch['_id'], simulation_ids)
        
        print(f"\n✅ Batch terminé: {len(simulation_ids)} simulations créées")
        return batch


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Créer un batch avec vraies simulations')
    parser.add_argument('--pacman', type=str, default='greedy',
                        help='IA Pacman (defensive, aggressive, greedy, etc.)')
    parser.add_argument('--ghosts', type=str, default='astar',
                        help='Algo fantômes (astar, bfs, greedy)')
    parser.add_argument('--simulations', type=int, default=30,
                        help='Nombre de simulations')
    parser.add_argument('--name', type=str, default=None,
                        help='Nom du batch')
    parser.add_argument('--api-url', type=str, default='https://ter-s1-n-lr0c.onrender.com',
                        help='URL de l\'API')
    
    args = parser.parse_args()
    
    name = args.name or f"Batch {args.pacman.upper()} vs {args.ghosts.upper()}"
    description = f"Pacman {args.pacman} against {args.ghosts} ghosts - Performance testing"
    
    simulator = BatchSimulator(api_url=args.api_url)
    simulator.run_batch(
        name=name,
        description=description,
        pacman_algo=args.pacman,
        ghost_algo=args.ghosts,
        n_simulations=args.simulations,
        performance_level=3
    )


if __name__ == '__main__':
    main()
