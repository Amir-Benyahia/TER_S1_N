#!/usr/bin/env python3
"""
Upload des batches vers MongoDB via l'API.
"""

import json
import requests
import sys
from pathlib import Path
from typing import Dict


class BatchUploader:
    """Upload les batches vers MongoDB."""
    
    def __init__(self, api_url: str = "http://localhost:3000"):
        self.api_url = api_url
        self.batches_dir = Path('experiments/batches')
    
    def upload_batch(self, batch_id: str) -> bool:
        """
        Upload un batch vers MongoDB.
        
        Args:
            batch_id: ID du batch à uploader
        
        Returns:
            True si succès, False sinon
        """
        batch_dir = self.batches_dir / batch_id
        
        if not batch_dir.exists():
            print(f"❌ Batch introuvable: {batch_id}")
            return False
        
        # Charger les données du batch
        with open(batch_dir / 'config.json', 'r') as f:
            config = json.load(f)
        
        with open(batch_dir / 'results.json', 'r') as f:
            results = json.load(f)
        
        with open(batch_dir / 'statistics.json', 'r') as f:
            statistics = json.load(f)
        
        with open(batch_dir / 'maze.json', 'r') as f:
            maze = json.load(f)
        
        print(f"\n📤 Upload du batch: {config['batch_name']}")
        print(f"   API: {self.api_url}")
        
        # Préparer les données du batch pour MongoDB
        batch_data = {
            'batch_id': batch_id,
            'name': config['batch_name'],
            'algorithm': config['algorithm'],
            'n_simulations': config['n_simulations'],
            'maze': maze,
            'statistics': {
                'score': {
                    'mean': statistics['score']['mean'],
                    'min': statistics['score']['min'],
                    'max': statistics['score']['max'],
                    'std': statistics['score']['std']
                },
                'memory': {
                    'mean_mb': statistics['memory']['mean'] / (1024 * 1024),
                    'min_mb': statistics['memory']['min'] / (1024 * 1024),
                    'max_mb': statistics['memory']['max'] / (1024 * 1024),
                    'std_mb': statistics['memory']['std'] / (1024 * 1024)
                },
                'decision_time': {
                    'mean_ms': statistics['decision_time']['mean'],
                    'min_ms': statistics['decision_time']['min'],
                    'max_ms': statistics['decision_time']['max'],
                    'std_ms': statistics['decision_time']['std']
                }
            },
            'results': results,
            'created_at': config['created_at']
        }
        
        try:
            # Envoyer à l'API
            response = requests.post(
                f"{self.api_url}/api/batches",
                json=batch_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Batch uploadé avec succès!")
                return True
            else:
                print(f"❌ Erreur {response.status_code}: {response.text}")
                return False
        
        except requests.exceptions.ConnectionError:
            print(f"❌ Impossible de se connecter à {self.api_url}")
            print(f"   Assurez-vous que le serveur est démarré:")
            print(f"   cd src && npm start")
            return False
        
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False


def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Uploader un batch vers MongoDB')
    parser.add_argument('--batch', type=str, required=True,
                        help='ID du batch à uploader')
    parser.add_argument('--api-url', type=str, default='http://localhost:3000',
                        help='URL de l\'API')
    
    args = parser.parse_args()
    
    uploader = BatchUploader(api_url=args.api_url)
    success = uploader.upload_batch(args.batch)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
