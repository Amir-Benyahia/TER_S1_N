#!/usr/bin/env python3
"""
Script principal pour lancer les benchmarks et générer les rapports.

Usage:
    python experiments/run_benchmarks.py [--config experiments/config.yaml]
    python experiments/run_benchmarks.py --maze-width 21 --maze-height 21
"""

import argparse
import sys
from pathlib import Path
import yaml
import json
import csv
from datetime import datetime

# Importer les modules du projet
sys.path.insert(0, str(Path(__file__).parent.parent))

from experiments.benchmark_runner import BenchmarkRunner
from experiments.metrics_collector import MetricsCollector
from experiments.graph_generator import GraphGenerator


def create_maze(width: int, height: int, config: dict) -> dict:
    """
    Crée un labyrinthe pour les tests.
    
    Args:
        width: Largeur du labyrinthe
        height: Hauteur du labyrinthe
        config: Configuration du labyrinthe
    
    Returns:
        Dict contenant les données du labyrinthe
    """
    try:
        from src.algorithms.maze.generators.recursive_backtracker import RecursiveBacktrackerGenerator
        from src.algorithms.maze.imperfecteur import MazeImperfecteur
        
        print(f"🏗️  Génération d'un labyrinthe {width}×{height}...")
        
        # Générer le labyrinthe de base
        generator = RecursiveBacktrackerGenerator()
        maze, remaining_walls = generator.generate(width, height)
        
        # Appliquer l'imperfection si configuré
        imperfection = config.get('imperfection', 0)
        if imperfection > 0:
            imperfecteur = MazeImperfecteur()
            maze, _, _ = imperfecteur.make_imperfect(
                maze, 
                remaining_walls,
                imperfection,
                width,
                height
            )
        
        print(f"  ✓ Labyrinthe créé avec succès")
        
        return {
            'width': width,
            'height': height,
            'data': maze,
            'algorithm': config.get('algorithm', 'recursive_backtracker'),
        }
        
    except Exception as e:
        print(f"❌ Erreur lors de la création du labyrinthe: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


def save_summary_report(output_dir: Path, aggregated: dict, config: dict):
    """Sauvegarde un rapport texte résumé."""
    report_path = output_dir / 'SUMMARY.txt'
    
    with open(report_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("RAPPORT DE BENCHMARK - PACMAN LAB\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Runs par config: {config['benchmark']['runs_per_config']}\n")
        f.write(f"Combinaisons testées: {len(aggregated)}\n\n")
        
        f.write("-" * 80 + "\n")
        f.write("RÉSULTATS PAR CONFIGURATION\n")
        f.write("-" * 80 + "\n\n")
        
        for config_key in sorted(aggregated.keys()):
            stats = aggregated[config_key]
            f.write(f"\n{config_key}\n")
            f.write("  " + "=" * 40 + "\n")
            f.write(f"  Nombre de runs: {stats['count']}\n")
            f.write(f"  Taux d'échappement: {stats['escape_rate']:.1f}%\n\n")
            
            f.write(f"  Score:\n")
            f.write(f"    Moyenne: {stats['score']['mean']:.2f}\n")
            f.write(f"    Médiane: {stats['score']['median']:.2f}\n")
            f.write(f"    Écart-type: {stats['score']['stdev']:.2f}\n")
            f.write(f"    Min-Max: {stats['score']['min']:.2f} - {stats['score']['max']:.2f}\n\n")
            
            f.write(f"  Durée (ms):\n")
            f.write(f"    Moyenne: {stats['duration']['mean']:.2f}\n")
            f.write(f"    Médiane: {stats['duration']['median']:.2f}\n")
            f.write(f"    Min-Max: {stats['duration']['min']:.2f} - {stats['duration']['max']:.2f}\n\n")
    
    print(f"  ✓ Rapport résumé sauvegardé: {report_path.name}")


def main():
    parser = argparse.ArgumentParser(description='Benchmark Pacman Lab')
    parser.add_argument(
        '--config',
        type=str,
        default='experiments/config.yaml',
        help='Fichier de configuration YAML'
    )
    parser.add_argument(
        '--maze-width',
        type=int,
        help='Largeur du labyrinthe (crée un nouveau maze)'
    )
    parser.add_argument(
        '--maze-height',
        type=int,
        help='Hauteur du labyrinthe (crée un nouveau maze)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='experiments/outputs',
        help='Répertoire de sortie'
    )
    parser.add_argument(
        '--runs',
        type=int,
        help='Nombre de runs par configuration (override config)'
    )
    
    args = parser.parse_args()
    
    # Chargement de la configuration
    print("📖 Chargement de la configuration...")
    config_path = Path(args.config)
    
    if not config_path.exists():
        print(f"❌ Fichier de configuration introuvable: {config_path}")
        sys.exit(1)
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Override du nombre de runs si spécifié
    if args.runs:
        config['benchmark']['runs_per_config'] = args.runs
    
    # Préparation des répertoires
    output_dir = Path(args.output_dir)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    run_dir = output_dir / f'run_{timestamp}'
    data_dir = run_dir / 'data'
    graphs_dir = run_dir / 'graphs'
    reports_dir = run_dir / 'reports'
    
    for directory in [data_dir, graphs_dir, reports_dir]:
        directory.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Répertoire de sortie: {run_dir}\n")
    
    # Préparation du labyrinthe
    maze_data = None
    
    if args.maze_width and args.maze_height:
        maze_config = config.get('benchmark', {}).get('maze_config', {})
        maze_data = create_maze(args.maze_width, args.maze_height, maze_config)
    else:
        # Essayer de charger un labyrinthe par défaut
        print("⚠️  Aucune dimension de labyrinthe spécifiée")
        print("   Utilisation des dimensions par défaut: 21×21")
        maze_config = config.get('benchmark', {}).get('maze_config', {})
        width = maze_config.get('width', 21)
        height = maze_config.get('height', 21)
        maze_data = create_maze(width, height, maze_config)
    
    # Sauvegarder les données du labyrinthe
    with open(data_dir / 'maze.json', 'w') as f:
        json.dump(maze_data, f, indent=2)
    
    print(f"🎮 Labyrinthe: {maze_data['width']}×{maze_data['height']}\n")
    
    # Lancement des benchmarks
    runner = BenchmarkRunner(config)
    
    try:
        results = runner.run_all_benchmarks(maze_data)
    except KeyboardInterrupt:
        print("\n\n⚠️  Benchmark interrompu par l'utilisateur")
        results = runner.results
    
    if not results:
        print("❌ Aucun résultat collecté")
        sys.exit(1)
    
    # Collecte et agrégation des métriques
    print("📊 Analyse des métriques...")
    collector = MetricsCollector()
    
    for result in results:
        collector.add_simulation(result)
    
    aggregated = collector.aggregate_by_config(results)
    raw_data = collector.export_raw_data()
    
    # Sauvegarde des données
    print("💾 Sauvegarde des données...")
    
    # JSON complet
    with open(data_dir / 'results_full.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Statistiques agrégées
    with open(data_dir / 'statistics.json', 'w') as f:
        json.dump(aggregated, f, indent=2)
    
    # CSV pour analyse externe
    if raw_data:
        keys = raw_data[0].keys()
        with open(data_dir / 'metrics.csv', 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(raw_data)
    
    print(f"  ✓ Données sauvegardées dans {data_dir.name}")
    
    # Sauvegarder le rapport résumé
    save_summary_report(reports_dir, aggregated, config)
    
    # Génération des graphiques
    print("\n📈 Génération des graphiques...")
    generator = GraphGenerator(config, graphs_dir)
    
    try:
        generator.generate_all_graphs(aggregated, raw_data)
    except Exception as e:
        print(f"⚠️  Erreur lors de la génération des graphiques: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n✅ Benchmark terminé !")
    print(f"   📂 Résultats: {run_dir}")
    print(f"   📈 Graphiques: {graphs_dir}")
    print(f"   📊 Données: {data_dir}")
    print(f"   📄 Rapports: {reports_dir}")
    
    # Afficher un résumé
    print("\n" + "=" * 80)
    print("📋 RÉSUMÉ DES RÉSULTATS")
    print("=" * 80 + "\n")
    print(f"{'Configuration':<32}  {'Escape %':>9}  {'Score Moyen':>12}  {'Durée (ms)':>12}")
    print("-" * 80)
    
    for config_key in sorted(aggregated.keys()):
        stats = aggregated[config_key]
        escape_rate = stats['escape_rate']
        score_mean = stats['score']['mean']
        duration_mean = stats['duration']['mean']
        
        print(f"{config_key:<32}  {escape_rate:>8.1f}%  {score_mean:>12.1f}  {duration_mean:>12.1f}")
    
    print("\n" + "=" * 80 + "\n")


if __name__ == '__main__':
    main()
