#!/usr/bin/env python3
"""
Visualisation 3D des résultats de batch.
Affiche Score × Mémoire × Temps de décision.
"""

import json
import sys
from pathlib import Path
from typing import List
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np


class Visualizer3D:
    """Génère des visualisations 3D des résultats de batch."""
    
    def __init__(self):
        self.batches_dir = Path('experiments/batches')
        self.output_dir = Path('experiments/outputs')
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def visualize_batch(self, batch_id: str):
        """
        Génère une visualisation 3D pour un batch.
        
        Args:
            batch_id: ID du batch à visualiser
        """
        batch_dir = self.batches_dir / batch_id
        
        if not batch_dir.exists():
            print(f"❌ Batch introuvable: {batch_id}")
            return
        
        # Charger les données
        with open(batch_dir / 'config.json', 'r') as f:
            config = json.load(f)
        
        with open(batch_dir / 'results.json', 'r') as f:
            results = json.load(f)
        
        with open(batch_dir / 'statistics.json', 'r') as f:
            stats = json.load(f)
        
        print(f"\n📊 Visualisation 3D du batch: {config['batch_name']}")
        print(f"   Algorithme: {config['algorithm']}")
        print(f"   Simulations: {len(results)}\n")
        
        # Extraire les données
        scores = [r['results']['score'] for r in results]
        memories = [r['results']['memory_used'] / (1024 * 1024) for r in results]  # En MB
        times = [r['results']['avg_decision_time'] for r in results]  # En ms
        
        # Créer le graphique 3D
        fig = plt.figure(figsize=(14, 10))
        ax = fig.add_subplot(111, projection='3d')
        
        # Scatter plot
        scatter = ax.scatter(scores, memories, times,
                           c=range(len(results)),
                           cmap='viridis',
                           s=100,
                           alpha=0.6,
                           edgecolors='black',
                           linewidth=0.5)
        
        # Ajouter le point moyen
        mean_score = stats['score']['mean']
        mean_memory = stats['memory']['mean'] / (1024 * 1024)
        mean_time = stats['decision_time']['mean']
        
        ax.scatter([mean_score], [mean_memory], [mean_time],
                  c='red',
                  s=300,
                  marker='*',
                  edgecolors='black',
                  linewidth=2,
                  label='Moyenne',
                  zorder=10)
        
        # Labels et titre
        ax.set_xlabel('Score (Performance)', fontsize=12, labelpad=10)
        ax.set_ylabel('Complexité Spatiale\n(Mémoire MB)', fontsize=12, labelpad=10)
        ax.set_zlabel('Complexité Temporelle\n(Temps ms)', fontsize=12, labelpad=10)
        
        title = f"Analyse 3D : {config['batch_name']}\n"
        title += f"Algorithme: {config['algorithm'].upper()} | "
        title += f"N={len(results)} simulations"
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        
        # Colorbar
        cbar = plt.colorbar(scatter, ax=ax, pad=0.1, shrink=0.8)
        cbar.set_label('Numéro de simulation', rotation=270, labelpad=20)
        
        # Légende
        ax.legend(loc='upper left', fontsize=10)
        
        # Angle de vue
        ax.view_init(elev=20, azim=45)
        
        # Grille
        ax.grid(True, alpha=0.3)
        
        # Statistiques dans le coin
        stats_text = f"Statistiques:\n"
        stats_text += f"Score: {mean_score:.1f} ± {stats['score']['std']:.1f}\n"
        stats_text += f"Mémoire: {mean_memory:.2f} ± {stats['memory']['std']/(1024*1024):.2f} MB\n"
        stats_text += f"Temps: {mean_time:.2f} ± {stats['decision_time']['std']:.2f} ms"
        
        ax.text2D(0.02, 0.98, stats_text,
                 transform=ax.transAxes,
                 fontsize=10,
                 verticalalignment='top',
                 bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        # Sauvegarder
        output_file = self.output_dir / f'{batch_id}_3d.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✅ Graphique 3D généré: {output_file}")
        
        # Ouvrir automatiquement
        import subprocess
        try:
            subprocess.run(['open', str(output_file)])
            print(f"  ✓ Graphique ouvert\n")
        except:
            pass
    
    def compare_batches(self, batch_ids: List[str]):
        """
        Compare plusieurs batches dans un graphique 3D.
        
        Args:
            batch_ids: Liste des IDs de batches à comparer
        """
        print(f"\n📊 Comparaison de {len(batch_ids)} batches en 3D\n")
        
        fig = plt.figure(figsize=(14, 10))
        ax = fig.add_subplot(111, projection='3d')
        
        colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9467bd', 
                  '#8c564b', '#e377c2', '#7f7f7f']
        markers = ['o', 's', '^', 'D', 'v', '<', '>', 'p']
        
        # Pour chaque batch, afficher UN SEUL POINT (la moyenne)
        for idx, batch_id in enumerate(batch_ids):
            batch_dir = self.batches_dir / batch_id
            
            if not batch_dir.exists():
                print(f"  ⚠️  Batch ignoré: {batch_id}")
                continue
            
            with open(batch_dir / 'config.json', 'r') as f:
                config = json.load(f)
            
            with open(batch_dir / 'statistics.json', 'r') as f:
                stats = json.load(f)
            
            # Extraire les MOYENNES seulement (1 point par batch)
            score = stats['score']['mean']
            memory = stats['memory']['mean'] / (1024 * 1024)  # En MB
            time = stats['decision_time']['mean']  # En ms
            
            # Afficher UN point par batch
            pacman = config.get('pacman_algorithm', config.get('algorithm', 'unknown'))
            ghost = config.get('ghost_algorithm', 'unknown')
            combo_label = f"P:{pacman.upper()} vs G:{ghost.upper()}"
            
            ax.scatter([score], [memory], [time],
                      c=colors[idx % len(colors)],
                      marker=markers[idx % len(markers)],
                      s=500,  # Points plus gros
                      alpha=0.8,
                      edgecolors='black',
                      linewidth=2,
                      label=combo_label)
            
            # Ajouter label sur le point
            ax.text(score, memory, time, 
                   f"  {combo_label}\n  {score:.0f}",
                   fontsize=10, fontweight='bold')
            
            print(f"  ✓ Batch chargé: {config['batch_name']}")
        
        # Labels
        ax.set_xlabel('Score (Performance)', fontsize=12, labelpad=10)
        ax.set_ylabel('Complexité Spatiale\n(Mémoire MB)', fontsize=12, labelpad=10)
        ax.set_zlabel('Complexité Temporelle\n(Temps ms)', fontsize=12, labelpad=10)
        
        ax.set_title('Comparaison 3D des Batches\nScore × Mémoire × Temps (Moyennes)',
                    fontsize=14, fontweight='bold', pad=20)
        
        ax.legend(loc='upper left', fontsize=10)
        ax.view_init(elev=20, azim=45)
        ax.grid(True, alpha=0.3)
        
        # Sauvegarder
        output_file = self.output_dir / 'comparison_3d.png'
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"\n✅ Comparaison 3D générée: {output_file}\n")
        
        # Ouvrir
        import subprocess
        try:
            subprocess.run(['open', str(output_file)])
        except:
            pass


def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Visualiser les résultats en 3D')
    parser.add_argument('--batch', type=str, help='ID du batch à visualiser')
    parser.add_argument('--compare', nargs='+', help='Liste des batches à comparer')
    parser.add_argument('--list', action='store_true', help='Lister les batches disponibles')
    
    args = parser.parse_args()
    
    viz = Visualizer3D()
    
    if args.list:
        batches_dir = Path('experiments/batches')
        batches = sorted(batches_dir.glob('batch_*'))
        
        if not batches:
            print("Aucun batch trouvé")
            return
        
        print("\n📦 Batches disponibles:\n")
        for batch_dir in batches:
            with open(batch_dir / 'config.json', 'r') as f:
                config = json.load(f)
            print(f"  {batch_dir.name}")
            print(f"    Nom: {config['batch_name']}")
            print(f"    Algorithme: {config['algorithm']}")
            print(f"    Simulations: {config['n_simulations']}")
            print()
    
    elif args.batch:
        viz.visualize_batch(args.batch)
    
    elif args.compare:
        viz.compare_batches(args.compare)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
