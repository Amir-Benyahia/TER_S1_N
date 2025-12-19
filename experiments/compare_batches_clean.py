#!/usr/bin/env python3
"""
Comparaison claire des batches avec graphiques propres.
"""

import json
import sys
import requests
from pathlib import Path
from typing import List, Dict
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

# Style moderne
sns.set_style("whitegrid")
plt.rcParams['font.size'] = 11
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['figure.titlesize'] = 16


class BatchComparator:
    """Compare les batches avec des graphiques clairs."""
    
    def __init__(self, api_url: str = "http://localhost:3000"):
        self.api_url = api_url
        self.batches_dir = Path('experiments/batches')
        self.output_dir = Path('experiments/outputs')
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def get_batches_from_db(self) -> List[Dict]:
        """Récupère les batches depuis MongoDB."""
        try:
            response = requests.get(f"{self.api_url}/api/batches")
            if response.status_code == 200:
                return response.json().get('batches', [])
            return []
        except:
            return []
    
    def compare_batches(self, batch_ids: List[str] = None):
        """
        Génère un graphique de comparaison clair.
        
        Args:
            batch_ids: IDs des batches à comparer (None = tous)
        """
        # Récupérer les batches
        if batch_ids:
            batches = []
            for batch_id in batch_ids:
                batch_dir = self.batches_dir / batch_id
                if batch_dir.exists():
                    with open(batch_dir / 'config.json') as f:
                        config = json.load(f)
                    with open(batch_dir / 'statistics.json') as f:
                        stats = json.load(f)
                    batches.append({
                        'batchId': batch_id,
                        'name': config['batch_name'],
                        'algorithm': config['algorithm'],
                        'statistics': stats
                    })
        else:
            batches = self.get_batches_from_db()
        
        if not batches:
            print("❌ Aucun batch trouvé")
            return None
        
        print(f"\n📊 Comparaison de {len(batches)} batches\n")
        
        # Créer le graphique
        fig, axes = plt.subplots(1, 3, figsize=(16, 5))
        fig.suptitle('Comparaison des Algorithmes - Analyse par Batch', 
                     fontsize=16, fontweight='bold', y=1.02)
        
        algorithms = [b['algorithm'].upper() for b in batches]
        colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
        
        # 1. Score (Performance)
        ax1 = axes[0]
        scores = []
        errors = []
        for batch in batches:
            if 'statistics' in batch:
                stats = batch['statistics']
                if 'score' in stats:
                    scores.append(stats['score']['mean'])
                    errors.append(stats['score']['std'])
                else:
                    scores.append(stats.get('score', {}).get('mean', 0))
                    errors.append(stats.get('score', {}).get('std', 0))
            else:
                scores.append(0)
                errors.append(0)
        
        bars1 = ax1.bar(algorithms, scores, color=colors[:len(algorithms)], 
                       alpha=0.7, edgecolor='black', linewidth=1.5)
        ax1.errorbar(algorithms, scores, yerr=errors, fmt='none', 
                    ecolor='black', capsize=5, capthick=2)
        
        ax1.set_ylabel('Score Moyen', fontweight='bold')
        ax1.set_title('Performance (Score)', fontweight='bold', pad=10)
        ax1.grid(axis='y', alpha=0.3)
        
        # Ajouter les valeurs sur les barres
        for i, (bar, score, err) in enumerate(zip(bars1, scores, errors)):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{score:.0f}\n±{err:.0f}',
                    ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        # 2. Mémoire (Complexité Spatiale)
        ax2 = axes[1]
        memories = []
        mem_errors = []
        for batch in batches:
            if 'statistics' in batch:
                stats = batch['statistics']
                if 'memory' in stats:
                    mem = stats['memory']
                    if 'mean_mb' in mem:
                        memories.append(mem['mean_mb'])
                        mem_errors.append(mem['std_mb'])
                    else:
                        memories.append(mem['mean'] / (1024 * 1024))
                        mem_errors.append(mem['std'] / (1024 * 1024))
                else:
                    memories.append(0)
                    mem_errors.append(0)
            else:
                memories.append(0)
                mem_errors.append(0)
        
        bars2 = ax2.bar(algorithms, memories, color=colors[:len(algorithms)], 
                       alpha=0.7, edgecolor='black', linewidth=1.5)
        ax2.errorbar(algorithms, memories, yerr=mem_errors, fmt='none',
                    ecolor='black', capsize=5, capthick=2)
        
        ax2.set_ylabel('Mémoire Moyenne (MB)', fontweight='bold')
        ax2.set_title('Complexité Spatiale (Mémoire)', fontweight='bold', pad=10)
        ax2.grid(axis='y', alpha=0.3)
        
        for i, (bar, mem, err) in enumerate(zip(bars2, memories, mem_errors)):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{mem:.2f}\n±{err:.2f}',
                    ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        # 3. Temps (Complexité Temporelle)
        ax3 = axes[2]
        times = []
        time_errors = []
        for batch in batches:
            if 'statistics' in batch:
                stats = batch['statistics']
                if 'decision_time' in stats:
                    time = stats['decision_time']
                    if 'mean_ms' in time:
                        times.append(time['mean_ms'])
                        time_errors.append(time['std_ms'])
                    else:
                        times.append(time['mean'])
                        time_errors.append(time['std'])
                else:
                    times.append(0)
                    time_errors.append(0)
            else:
                times.append(0)
                time_errors.append(0)
        
        bars3 = ax3.bar(algorithms, times, color=colors[:len(algorithms)], 
                       alpha=0.7, edgecolor='black', linewidth=1.5)
        ax3.errorbar(algorithms, times, yerr=time_errors, fmt='none',
                    ecolor='black', capsize=5, capthick=2)
        
        ax3.set_ylabel('Temps Moyen (ms)', fontweight='bold')
        ax3.set_title('Complexité Temporelle (Décision)', fontweight='bold', pad=10)
        ax3.grid(axis='y', alpha=0.3)
        
        for i, (bar, time, err) in enumerate(zip(bars3, times, time_errors)):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height,
                    f'{time:.2f}\n±{err:.2f}',
                    ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        plt.tight_layout()
        
        # Sauvegarder
        output_file = self.output_dir / 'batch_comparison.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        print(f"✅ Graphique généré: {output_file}\n")
        
        # Upload vers MongoDB
        self._upload_comparison_to_db(output_file, batches)
        
        # Ouvrir
        import subprocess
        try:
            subprocess.run(['open', str(output_file)])
        except:
            pass
        
        return str(output_file)
    
    def _upload_comparison_to_db(self, image_path: Path, batches: List[Dict]):
        """Upload le graphique de comparaison vers MongoDB."""
        print("📤 Upload du graphique vers MongoDB...")
        
        # Lire l'image en base64
        import base64
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Créer un document de comparaison
        comparison_data = {
            'name': 'Comparaison Algorithmes',
            'type': 'batch_comparison',
            'batches': [b.get('batchId', b.get('_id')) for b in batches],
            'algorithms': [b['algorithm'] for b in batches],
            'image': image_data,
            'created_at': __import__('datetime').datetime.now().isoformat()
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/api/comparisons",
                json=comparison_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                print("  ✅ Graphique sauvegardé dans MongoDB")
            else:
                print(f"  ⚠️  Erreur {response.status_code}")
        
        except requests.exceptions.ConnectionError:
            print(f"  ⚠️  Serveur non disponible")
        except Exception as e:
            print(f"  ⚠️  Erreur: {e}")


def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Comparer les batches')
    parser.add_argument('--batches', nargs='+', help='IDs des batches à comparer')
    parser.add_argument('--all', action='store_true', help='Comparer tous les batches')
    parser.add_argument('--api-url', type=str, default='http://localhost:3000',
                        help='URL de l\'API')
    
    args = parser.parse_args()
    
    comparator = BatchComparator(api_url=args.api_url)
    
    if args.all or not args.batches:
        comparator.compare_batches()
    else:
        comparator.compare_batches(args.batches)


if __name__ == '__main__':
    main()
