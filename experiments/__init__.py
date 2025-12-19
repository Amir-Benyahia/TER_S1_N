"""
Module d'expérimentation et benchmark pour Pacman Lab.
Permet de générer des batches de tests et de les comparer visuellement.
"""

from .batch_generator import BatchGenerator
from .batch_analyzer import BatchAnalyzer
from .metrics_collector import MetricsCollector
from .graph_generator import GraphGenerator

__all__ = ['BatchGenerator', 'BatchAnalyzer', 'MetricsCollector', 'GraphGenerator']
__version__ = '2.0.0'
