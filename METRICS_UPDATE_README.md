# Mise à Jour: Métriques de Performance Scientifiques

## 🎯 Objectif

Intégration d'un système complet de métriques de performance scientifiques pour l'analyse rigoureuse des simulations Pac-Man, incluant des mesures de durée, score, occupation mémoire et complexité temporelle pour chaque entité.

## 📊 Nouvelles Fonctionnalités

### 1. Métriques Principales de Simulation

- **Durée de jeu** (ms): Temps total d'exécution de la simulation
- **Score**: Évaluation quantitative basée sur pellets, survie et efficacité
- **Total frames**: Nombre de frames de jeu exécutées

### 2. Métriques de Performance par Entité

#### Pour Pac-Man
- Occupation mémoire (bytes)
- Complexité temporelle (notation Big-O)
- Temps de décision moyen (ms)

#### Pour chaque Fantôme
- Occupation mémoire (bytes)
- Complexité temporelle selon l'algorithme
- Temps de décision moyen (ms)
- Nœuds explorés durant le pathfinding

### 3. Statistiques Agrégées des Batches

Pour chaque métrique principale:
- **Moyenne (μ)**: Tendance centrale
- **Médiane**: Valeur centrale résistante aux outliers
- **Écart-type (σ)**: Mesure de dispersion
- **Min/Max**: Valeurs extrêmes

Métriques supplémentaires:
- Performance moyenne par type d'agent
- Distribution et performance par algorithme
- Taux d'échappement vs capture

## 🗂️ Fichiers Créés/Modifiés

### Backend (Python)

#### Nouveaux Fichiers
- `src/algorithms/utils/performance_metrics.py`: Module de calcul des métriques
  - `PerformanceTracker`: Tracking en temps réel de la mémoire et du temps
  - `ComplexityAnalyzer`: Analyse de complexité algorithmique
  - `ScoreCalculator`: Calcul du score et rating de performance

#### Fichiers Modifiés
- `src/algorithms/simulation/game_engine.py`: Intégration du tracking de performance
- `src/algorithms/pathfinding/astar.py`: Ajout du compteur de nœuds explorés
- `src/algorithms/pathfinding/bfs.py`: Ajout du compteur de nœuds explorés
- `src/algorithms/ghost_ai/base_agent.py`: Exposition des métriques de pathfinding

### Backend (Node.js)

#### Nouveaux Fichiers
- `src/server/utils/statistics.js`: Fonctions statistiques scientifiques
  - Calculs de moyenne, médiane, écart-type
  - Statistiques descriptives complètes
  - Agrégation des métriques de simulation

#### Fichiers Modifiés
- `src/server/models/Simulation.js`: Schéma étendu avec métriques de performance
- `src/server/models/SimulationBatch.js`: Statistiques enrichies
- `src/server/controllers/batchController.js`: Calcul automatique des statistiques

### Frontend

#### Nouveaux Fichiers
- `src/client/js/components/PerformanceMetrics.js`: Composant d'affichage des métriques
  - Vue détaillée pour simulations individuelles
  - Vue statistique pour batches
  - Formatage scientifique des données
- `src/client/css/performance-metrics.css`: Styles pour l'affichage des métriques

#### Fichiers Modifiés
- `src/client/index.html`: Inclusion des nouveaux scripts et styles

### Tests

- `tests/test_performance_metrics.py`: Suite de tests complète
  - Tests unitaires pour chaque module
  - Tests d'intégration
  - Validation des calculs

### Documentation

- `PERFORMANCE_METRICS_GUIDE.md`: Guide complet des métriques
  - Description détaillée de chaque métrique
  - Méthodologie de mesure
  - Interprétation et analyse
  - Références scientifiques

## 🔧 Architecture Technique

### Workflow de Mesure

```
1. Simulation démarre
   ↓
2. PerformanceTracker initialise le tracking
   ↓
3. Pour chaque frame:
   - Mesure mémoire (tracemalloc)
   - Mesure temps (perf_counter)
   - Compte nœuds explorés
   ↓
4. Calcul des métriques agrégées
   ↓
5. Sauvegarde dans MongoDB
   ↓
6. Affichage dans le frontend
```

### Calcul des Statistiques de Batch

```
1. Récupération des simulations
   ↓
2. Extraction des valeurs pour chaque métrique
   ↓
3. Calculs statistiques:
   - Moyenne: Σ(xi) / n
   - Médiane: Valeur centrale triée
   - Écart-type: √(Σ(xi - μ)² / n)
   ↓
4. Agrégation par algorithme
   ↓
5. Mise en cache dans le batch
```

## 📈 Exemple d'Utilisation

### Affichage des Métriques d'une Simulation

```javascript
// Dans le frontend
const metrics = PerformanceMetrics.renderMetrics(simulation, 'simulation');
document.getElementById('metrics-container').innerHTML = metrics;
```

### Affichage des Statistiques d'un Batch

```javascript
// Dans le frontend
const stats = PerformanceMetrics.renderMetrics(batch.stats, 'batch');
document.getElementById('stats-container').innerHTML = stats;
```

### Récupération via API

```javascript
// Obtenir une simulation avec métriques
const response = await fetch('/api/simulations/[id]');
const simulation = await response.json();
console.log(simulation.results.performanceMetrics);

// Obtenir un batch avec statistiques
const batchResponse = await fetch('/api/batches/[id]');
const batch = await batchResponse.json();
console.log(batch.stats);
```

## 🧪 Tests

Exécuter les tests de métriques:

```bash
# Tests Python
python tests/test_performance_metrics.py

# Tests complets
pytest tests/test_performance_metrics.py -v
```

## 📊 Visualisation des Données

Les métriques sont affichées dans:

1. **Page de Simulation Individuelle**
   - Métriques principales en cartes
   - Performance de Pac-Man
   - Performance détaillée de chaque fantôme

2. **Page de Batch**
   - En-tête avec résumé statistique
   - Cartes statistiques (durée, score, frames)
   - Comparaison de performance entre agents
   - Distribution des algorithmes

## 🔬 Analyse Scientifique

### Comparaison d'Algorithmes

Les métriques permettent de comparer objectivement:
- **A* vs BFS**: Mémoire, temps, nœuds explorés
- **Performance par type de fantôme**: Efficacité selon la stratégie
- **Consistance**: Via l'écart-type

### Optimisation

Identifier les configurations optimales:
- Meilleur ratio performance/mémoire
- Algorithmes les plus rapides
- Stratégies les plus efficaces

## 🎓 Applications Pédagogiques

Les métriques peuvent être utilisées pour:
- Étudier l'impact des algorithmes de pathfinding
- Analyser la complexité pratique vs théorique
- Comprendre les compromis temps/mémoire
- Valider expérimentalement les Big-O

## 🚀 Prochaines Étapes

### Améliorations Prévues

1. **Tracking des Pellets**
   - Intégrer le comptage réel des pellets mangés
   - Améliorer le calcul du score

2. **Métriques Avancées**
   - Qualité des trajectoires (smoothness)
   - Prédictibilité des fantômes
   - Heatmaps de performance par zone

3. **Visualisations**
   - Graphiques de performance dans le temps
   - Comparaison visuelle d'algorithmes
   - Courbes de distribution

4. **Export et Reporting**
   - Export CSV/JSON des métriques
   - Génération de rapports PDF
   - Intégration avec outils d'analyse (R, Python)

## 📚 Références

- **Algorithmes**: Introduction to Algorithms (CLRS)
- **IA**: Artificial Intelligence: A Modern Approach (Russell & Norvig)
- **Statistiques**: Statistics for Engineers (Montgomery & Runger)
- **Performance Python**: Python Performance Documentation

## 👥 Contribution

Les métriques sont conçues pour être extensibles:
- Ajouter de nouvelles métriques dans `performance_metrics.py`
- Étendre les calculs statistiques dans `statistics.js`
- Créer de nouvelles visualisations dans `PerformanceMetrics.js`

## 📝 Notes Techniques

### Limitations Connues

- Le tracking mémoire ajoute ~5-10% de overhead
- Les mesures dépendent de la charge système
- Score actuel ne compte pas les pellets réels

### Compatibilité

- Python 3.7+
- Node.js 14+
- Navigateurs modernes (ES6+)
- MongoDB 4.0+

## ✅ Checklist de Vérification

- [x] Module de métriques Python
- [x] Intégration dans game_engine
- [x] Tracking dans pathfinding
- [x] Modèles MongoDB étendus
- [x] Module statistiques Node.js
- [x] Contrôleur batch mis à jour
- [x] Composant frontend
- [x] Styles CSS
- [x] Tests unitaires
- [x] Documentation complète

---

**Date de mise à jour**: Décembre 2025  
**Version**: 2.0.0  
**Auteurs**: Équipe Pacman Lab
