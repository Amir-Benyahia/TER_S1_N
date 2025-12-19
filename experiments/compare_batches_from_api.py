#!/usr/bin/env python3
"""
Génère un graphe 3D de comparaison à partir des batches sur l'API
"""

import json
import requests
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from pathlib import Path


def get_comparison_batches(api_url: str = "https://ter-s1-n-lr0c.onrender.com"):
    """Récupère les batches de comparaison depuis l'API"""
    print("📡 Récupération des batches depuis l'API...")
    
    response = requests.get(f"{api_url}/api/batches", timeout=30)
    response.raise_for_status()
    data = response.json()
    
    # Filtrer les batches de comparaison
    comparison_batches = [
        b for b in data['batches'] 
        if 'Comparison:' in b['name'] and b.get('stats', {}).get('totalSimulations', 0) > 0
    ]
    
    print(f"  ✓ {len(comparison_batches)} batches trouvés")
    return comparison_batches


def generate_3d_comparison(batches, output_path: str = "experiments/outputs/comparison_3d_render.png"):
    """Génère le graphe 3D de comparaison"""
    print(f"\n📊 Génération du graphe 3D...")
    
    fig = plt.figure(figsize=(14, 10))
    ax = fig.add_subplot(111, projection='3d')
    
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    markers = ['o', 's', '^', 'D', 'v']
    
    for idx, batch in enumerate(batches):
        stats = batch.get('stats', {})
        
        # Extraire les métriques
        score = stats.get('score', {}).get('mean', 0)
        duration = stats.get('duration', {}).get('mean', 0) / 1000  # en secondes
        frames = stats.get('frames', {}).get('mean', 0)
        
        name = batch['name'].replace('Comparison: ', '')
        
        # Afficher le point
        ax.scatter([score], [duration], [frames],
                  c=colors[idx % len(colors)],
                  marker=markers[idx % len(markers)],
                  s=500,
                  alpha=0.8,
                  edgecolors='black',
                  linewidth=2,
                  label=name)
        
        # Label sur le point
        ax.text(score, duration, frames,
               f"  {name}\n  {score:.0f}",
               fontsize=10,
               fontweight='bold')
        
        print(f"  ✓ {name}")
        print(f"    Score: {score:.1f}")
        print(f"    Durée: {duration:.1f} s")
        print(f"    Frames: {frames:.0f}")
    
    # Configuration du graphe
    ax.set_xlabel('Score Moyen', fontsize=12, fontweight='bold')
    ax.set_ylabel('Durée Moyenne (s)', fontsize=12, fontweight='bold')
    ax.set_zlabel('Frames Moyens', fontsize=12, fontweight='bold')
    ax.set_title('Comparaison 3D des Batches\n(Pacman IA vs Fantômes Algorithmes)',
                fontsize=14, fontweight='bold', pad=20)
    
    ax.legend(loc='upper left', fontsize=10)
    ax.grid(True, alpha=0.3)
    
    # Sauvegarder
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"\n✅ Graphe sauvegardé: {output_file}")
    
    return output_file


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Générer graphe 3D depuis l\'API')
    parser.add_argument('--api-url', type=str, default='https://ter-s1-n-lr0c.onrender.com',
                        help='URL de l\'API')
    parser.add_argument('--output', type=str, default='experiments/outputs/comparison_3d_render.png',
                        help='Fichier de sortie')
    
    args = parser.parse_args()
    
    # Récupérer les batches
    batches = get_comparison_batches(args.api_url)
    
    if not batches:
        print("❌ Aucun batch de comparaison trouvé")
        return
    
    # Générer le graphe
    output_file = generate_3d_comparison(batches, args.output)
    
    print(f"\n🎉 Comparaison terminée!")
    print(f"   Batches comparés: {len(batches)}")
    print(f"   Graphe: {output_file}")


if __name__ == '__main__':
    main()
