#!/usr/bin/env python3
"""
Liste et visualise les batches depuis MongoDB.
"""

import requests
import json
from typing import List, Dict


class BatchViewer:
    """Visualise les batches depuis MongoDB."""
    
    def __init__(self, api_url: str = "http://localhost:3000"):
        self.api_url = api_url
    
    def list_batches(self) -> List[Dict]:
        """Liste tous les batches depuis MongoDB."""
        try:
            response = requests.get(f"{self.api_url}/api/batches")
            
            if response.status_code == 200:
                data = response.json()
                return data.get('batches', [])
            else:
                print(f"❌ Erreur {response.status_code}")
                return []
        
        except requests.exceptions.ConnectionError:
            print(f"❌ Impossible de se connecter à {self.api_url}")
            print(f"   Démarrez le serveur: cd src && npm start")
            return []
    
    def display_batches(self):
        """Affiche tous les batches."""
        batches = self.list_batches()
        
        if not batches:
            print("\n📦 Aucun batch trouvé dans MongoDB\n")
            return
        
        print(f"\n📦 {len(batches)} batch(es) trouvé(s) dans MongoDB:\n")
        
        for batch in batches:
            print(f"  🎯 {batch.get('batchId', batch.get('_id'))}")
            print(f"     Nom: {batch.get('name', 'N/A')}")
            print(f"     Algorithme: {batch.get('algorithm', 'N/A')}")
            print(f"     Simulations: {batch.get('simulationCount', 0)}")
            
            # Afficher les statistiques si disponibles
            stats = batch.get('statistics', {})
            if stats:
                score_stats = stats.get('score', {})
                memory_stats = stats.get('memory', {})
                time_stats = stats.get('decision_time', {})
                
                if score_stats:
                    print(f"     Score: {score_stats.get('mean', 0):.1f} ± {score_stats.get('std', 0):.1f}")
                if memory_stats:
                    print(f"     Mémoire: {memory_stats.get('mean_mb', 0):.2f} ± {memory_stats.get('std_mb', 0):.2f} MB")
                if time_stats:
                    print(f"     Temps: {time_stats.get('mean_ms', 0):.2f} ± {time_stats.get('std_ms', 0):.2f} ms")
            
            print()


def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Visualiser les batches depuis MongoDB')
    parser.add_argument('--api-url', type=str, default='http://localhost:3000',
                        help='URL de l\'API')
    
    args = parser.parse_args()
    
    viewer = BatchViewer(api_url=args.api_url)
    viewer.display_batches()


if __name__ == '__main__':
    main()
