"""
Générateur de graphiques pour l'analyse comparative des algorithmes.
Produit des visualisations scientifiques en PNG.
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import seaborn as sns
from pathlib import Path
from typing import Dict, List, Any
import pandas as pd


class GraphGenerator:
    """Génère des graphiques d'analyse comparative."""
    
    def __init__(self, config: Dict[str, Any], output_dir: Path):
        self.config = config
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Configuration matplotlib
        graph_config = config.get('graphs', {})
        style = graph_config.get('style', 'seaborn-v0_8-darkgrid')
        
        try:
            plt.style.use(style)
        except:
            # Fallback si le style n'existe pas
            plt.style.use('default')
        
        self.dpi = graph_config.get('dpi', 300)
        self.figsize = tuple(graph_config.get('figsize', [12, 8]))
    
    def generate_all_graphs(
        self, 
        aggregated_data: Dict[str, Dict[str, Any]],
        raw_data: List[Dict[str, Any]]
    ):
        """Génère tous les types de graphiques configurés."""
        graph_types = self.config.get('graphs', {}).get('types', [])
        
        df_raw = pd.DataFrame(raw_data)
        
        for graph_type in graph_types:
            if graph_type == 'bar_comparison':
                self._generate_bar_comparison(aggregated_data)
            elif graph_type == 'box_plot':
                self._generate_box_plots(df_raw)
            elif graph_type == 'scatter_correlation':
                self._generate_scatter_plots(df_raw)
            elif graph_type == 'heatmap':
                self._generate_heatmap(aggregated_data)
            elif graph_type == 'time_series':
                self._generate_time_series(df_raw)
    
    def _generate_bar_comparison(self, aggregated_data: Dict[str, Dict[str, Any]]):
        """Graphiques en barres pour comparer les moyennes."""
        metrics_to_plot = [
            ('duration', 'Durée moyenne (ms)', 'duration_comparison.png'),
            ('score', 'Score moyen', 'score_comparison.png'),
            ('escape_rate', 'Taux d\'échappement (%)', 'escape_rate_comparison.png'),
            ('ghost_decision_time_avg', 'Temps de décision fantômes (ms)', 'ghost_decision_time_comparison.png'),
        ]
        
        for metric_key, ylabel, filename in metrics_to_plot:
            fig, ax = plt.subplots(figsize=self.figsize)
            
            configs = list(aggregated_data.keys())
            
            # Extraire les valeurs
            if metric_key == 'escape_rate':
                values = [aggregated_data[c]['escape_rate'] for c in configs]
                errors = [0] * len(configs)  # Pas d'écart-type pour un taux
            else:
                values = [
                    aggregated_data[c][metric_key]['mean'] 
                    for c in configs
                ]
                errors = [
                    aggregated_data[c][metric_key]['stdev'] 
                    for c in configs
                ]
            
            # Créer le graphique
            x_pos = np.arange(len(configs))
            bars = ax.bar(x_pos, values, yerr=errors, capsize=5, alpha=0.8)
            
            # Colorer les barres selon l'algorithme Pacman
            colors = self._get_colors_for_configs(configs)
            for bar, color in zip(bars, colors):
                bar.set_color(color)
            
            ax.set_xlabel('Configuration (Pacman - Fantômes)', fontsize=12)
            ax.set_ylabel(ylabel, fontsize=12)
            ax.set_title(f'Comparaison: {ylabel}', fontsize=14, fontweight='bold')
            ax.set_xticks(x_pos)
            ax.set_xticklabels(configs, rotation=45, ha='right')
            ax.grid(True, alpha=0.3)
            
            plt.tight_layout()
            plt.savefig(self.output_dir / filename, dpi=self.dpi, bbox_inches='tight')
            plt.close()
            
            print(f"  ✓ Généré: {filename}")
    
    def _generate_box_plots(self, df: pd.DataFrame):
        """Boîtes à moustaches pour voir la distribution."""
        metrics_to_plot = [
            ('duration', 'Durée (ms)', 'duration_boxplot.png'),
            ('score', 'Score', 'score_boxplot.png'),
            ('ghost_nodes_explored_avg', 'Nœuds explorés (fantômes)', 'nodes_explored_boxplot.png'),
        ]
        
        for metric_key, ylabel, filename in metrics_to_plot:
            if metric_key not in df.columns:
                continue
            
            fig, ax = plt.subplots(figsize=self.figsize)
            
            # Créer une colonne de configuration
            df['config'] = df['pacman_algorithm'] + '-' + df['ghost_algorithm']
            
            # Box plot
            df.boxplot(
                column=metric_key, 
                by='config', 
                ax=ax,
                patch_artist=True
            )
            
            ax.set_xlabel('Configuration', fontsize=12)
            ax.set_ylabel(ylabel, fontsize=12)
            ax.set_title(f'Distribution: {ylabel}', fontsize=14, fontweight='bold')
            plt.suptitle('')  # Supprimer le titre automatique de pandas
            ax.grid(True, alpha=0.3)
            
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(self.output_dir / filename, dpi=self.dpi, bbox_inches='tight')
            plt.close()
            
            print(f"  ✓ Généré: {filename}")
    
    def _generate_scatter_plots(self, df: pd.DataFrame):
        """Nuages de points pour les corrélations."""
        correlations = [
            ('duration', 'score', 'Durée vs Score', 'duration_vs_score.png'),
            ('ghost_decision_time_avg', 'score', 'Temps décision fantômes vs Score', 'ghost_time_vs_score.png'),
        ]
        
        for x_key, y_key, title, filename in correlations:
            if x_key not in df.columns or y_key not in df.columns:
                continue
            
            fig, ax = plt.subplots(figsize=self.figsize)
            
            # Grouper par configuration
            for config in df['pacman_algorithm'].unique():
                subset = df[df['pacman_algorithm'] == config]
                ax.scatter(
                    subset[x_key], 
                    subset[y_key], 
                    label=config,
                    alpha=0.6,
                    s=50
                )
            
            ax.set_xlabel(x_key.replace('_', ' ').title(), fontsize=12)
            ax.set_ylabel(y_key.replace('_', ' ').title(), fontsize=12)
            ax.set_title(title, fontsize=14, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
            
            plt.tight_layout()
            plt.savefig(self.output_dir / filename, dpi=self.dpi, bbox_inches='tight')
            plt.close()
            
            print(f"  ✓ Généré: {filename}")
    
    def _generate_heatmap(self, aggregated_data: Dict[str, Dict[str, Any]]):
        """Carte thermique comparant les performances."""
        # Créer une matrice Pacman algo × Ghost algo
        pacman_algos = set()
        ghost_algos = set()
        
        for key in aggregated_data.keys():
            pacman, ghost = key.split('-')
            pacman_algos.add(pacman)
            ghost_algos.add(ghost)
        
        pacman_algos = sorted(pacman_algos)
        ghost_algos = sorted(ghost_algos)
        
        # Métriques à afficher
        metrics = [
            ('escape_rate', 'Taux d\'échappement (%)', 'heatmap_escape_rate.png'),
            ('score', 'Score moyen', 'heatmap_score.png'),
        ]
        
        for metric_key, label, filename in metrics:
            matrix = np.zeros((len(pacman_algos), len(ghost_algos)))
            
            for i, pacman in enumerate(pacman_algos):
                for j, ghost in enumerate(ghost_algos):
                    key = f"{pacman}-{ghost}"
                    if key in aggregated_data:
                        if metric_key == 'escape_rate':
                            value = aggregated_data[key]['escape_rate']
                        else:
                            value = aggregated_data[key][metric_key]['mean']
                        matrix[i, j] = value
            
            fig, ax = plt.subplots(figsize=(10, 8))
            
            sns.heatmap(
                matrix,
                annot=True,
                fmt='.1f',
                xticklabels=ghost_algos,
                yticklabels=pacman_algos,
                cmap='YlOrRd',
                ax=ax,
                cbar_kws={'label': label}
            )
            
            ax.set_xlabel('Algorithme Fantômes', fontsize=12)
            ax.set_ylabel('Algorithme Pacman', fontsize=12)
            ax.set_title(f'Carte thermique: {label}', fontsize=14, fontweight='bold')
            
            plt.tight_layout()
            plt.savefig(self.output_dir / filename, dpi=self.dpi, bbox_inches='tight')
            plt.close()
            
            print(f"  ✓ Généré: {filename}")
    
    def _generate_time_series(self, df: pd.DataFrame):
        """Évolution des métriques au fil des runs (si pertinent)."""
        if 'simulation_id' not in df.columns or len(df) < 10:
            return
        
        # Ajouter un index de run
        df = df.copy()
        df['run_index'] = df.groupby(['pacman_algorithm', 'ghost_algorithm']).cumcount()
        
        fig, ax = plt.subplots(figsize=self.figsize)
        
        for config in df['pacman_algorithm'].unique():
            subset = df[df['pacman_algorithm'] == config]
            grouped = subset.groupby('run_index')['score'].mean()
            ax.plot(grouped.index, grouped.values, marker='o', label=config, alpha=0.7)
        
        ax.set_xlabel('Numéro du run', fontsize=12)
        ax.set_ylabel('Score moyen', fontsize=12)
        ax.set_title('Évolution du score par configuration', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'score_evolution.png', dpi=self.dpi, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Généré: score_evolution.png")
    
    def _get_colors_for_configs(self, configs: List[str]) -> List[str]:
        """Assigne des couleurs selon l'algorithme Pacman."""
        color_map = {
            'greedy': '#4CAF50',
            'defensive': '#2196F3',
            'aggressive': '#F44336',
            'random': '#FF9800',
        }
        
        colors = []
        for config in configs:
            pacman_algo = config.split('-')[0]
            colors.append(color_map.get(pacman_algo, '#9E9E9E'))
        
        return colors
