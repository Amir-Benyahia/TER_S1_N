# Guide des Métriques de Performance Scientifiques

## Vue d'ensemble

Le système de métriques de performance implémente une analyse scientifique rigoureuse des simulations Pac-Man, fournissant des mesures quantifiables de performance pour chaque entité (Pac-Man et fantômes) ainsi que des statistiques agrégées au niveau des batches.

## Métriques Principales

### 1. Durée de Simulation (Duration)
- **Unité**: Millisecondes (ms)
- **Description**: Temps total d'exécution de la simulation depuis le démarrage jusqu'à la capture ou la fin de la trajectoire
- **Utilité**: Mesure l'efficacité globale de la simulation et permet de comparer différentes configurations

### 2. Score
- **Unité**: Points (entier)
- **Calcul**: 
  ```
  Score = Score_Base + (Pellets × 10) + (PowerPellets × 50) + Bonus_Survie - Pénalité_Capture
  ```
- **Composants**:
  - Score de base: 1000 points
  - Pellets mangés: 10 points chacun
  - Power pellets: 50 points chacun
  - Bonus de survie: 1 point par frame si non capturé + 1000 points de complétion
  - Pénalité de capture précoce: proportionnelle au moment de la capture
- **Utilité**: Évaluation quantitative de la performance de la partie

### 3. Total Frames
- **Unité**: Nombre de frames (entier)
- **Description**: Nombre total de frames de jeu exécutées
- **Utilité**: Mesure de la durée de la partie en unités de jeu

## Métriques de Performance par Entité

### Pour Pac-Man

#### Occupation Mémoire (Memory Usage)
- **Unité**: Bytes (affiché en KB/MB)
- **Mesure**: Mémoire moyenne utilisée durant les décisions
- **Méthode**: Tracking via `tracemalloc` Python
- **Importance**: Évalue l'efficacité mémoire de l'algorithme de replay

#### Complexité Temporelle (Time Complexity)
- **Format**: Notation Big-O (ex: O(1), O(n), O(n log n))
- **Valeur pour Pac-Man**: O(1) (replay constant)
- **Utilité**: Caractérisation théorique de la complexité algorithmique

#### Temps de Décision Moyen (Average Decision Time)
- **Unité**: Millisecondes (ms)
- **Mesure**: Temps moyen pour prendre une décision de mouvement
- **Calcul**: Moyenne des temps de décision sur toutes les frames
- **Importance**: Performance pratique de l'algorithme

### Pour les Fantômes

#### Occupation Mémoire (Memory Usage)
- **Unité**: Bytes (affiché en KB/MB)
- **Mesure**: Mémoire moyenne utilisée durant le pathfinding
- **Variation**: Dépend de l'algorithme (A* vs BFS)

#### Complexité Temporelle (Time Complexity)
- **Format**: Notation Big-O
- **Valeurs selon algorithme**:
  - **A***: O(b^d) où b = branching factor, d = profondeur
  - **BFS**: O(V + E) où V = vertices, E = edges
- **Utilité**: Compréhension de la scalabilité

#### Temps de Décision Moyen (Average Decision Time)
- **Unité**: Millisecondes (ms)
- **Mesure**: Temps moyen pour calculer un chemin
- **Importance**: Performance réelle de l'algorithme de pathfinding

#### Nœuds Explorés (Path Nodes Explored)
- **Unité**: Nombre de nœuds (entier)
- **Mesure**: Total de nœuds explorés durant tous les calculs de chemin
- **Utilité**: Efficacité de l'algorithme de recherche de chemin
- **Comparaison**: A* explore généralement moins de nœuds que BFS grâce à l'heuristique

## Statistiques Agrégées des Batches

### Statistiques Descriptives

Pour chaque métrique (durée, score, frames), les statistiques suivantes sont calculées:

#### Moyenne (Mean) - μ
```
μ = (Σ xi) / n
```
- **Description**: Tendance centrale des données
- **Utilité**: Valeur représentative typique

#### Médiane (Median)
```
Médiane = valeur au 50e percentile
```
- **Description**: Valeur centrale après tri
- **Avantage**: Résistante aux valeurs aberrantes
- **Utilité**: Meilleure représentation si distribution asymétrique

#### Écart-Type (Standard Deviation) - σ
```
σ = √(Σ(xi - μ)² / n)
```
- **Description**: Mesure de dispersion des données
- **Interprétation**:
  - σ faible: Données homogènes, résultats consistants
  - σ élevé: Données dispersées, résultats variables
- **Utilité**: Évaluation de la fiabilité et de la consistance

#### Min / Max
- **Description**: Valeurs extrêmes observées
- **Utilité**: Identification des cas limites

### Performance Moyenne des Agents

#### Pac-Man
- Mémoire moyenne utilisée
- Temps de décision moyen

#### Fantômes (agrégé)
- Mémoire moyenne utilisée
- Temps de décision moyen
- Nombre moyen de nœuds explorés

### Distribution des Algorithmes

Pour chaque algorithme utilisé (A*, BFS, etc.), affichage de:
- **Nombre d'utilisations**: Fréquence d'utilisation dans le batch
- **Performance moyenne**:
  - Mémoire utilisée
  - Temps de décision
  - Nœuds explorés

## Méthodologie de Mesure

### Tracking de la Mémoire
```python
import tracemalloc

# Démarrer le tracking
tracemalloc.start()

# Mesurer avant décision
current, peak = tracemalloc.get_traced_memory()
start_memory = current

# Exécuter décision
# ...

# Mesurer après décision
current, peak = tracemalloc.get_traced_memory()
memory_used = current - start_memory
```

### Tracking du Temps
```python
import time

# Mesurer avant décision
start_time = time.perf_counter()

# Exécuter décision
# ...

# Mesurer après décision
decision_time = (time.perf_counter() - start_time) * 1000  # en ms
```

### Comptage des Nœuds Explorés
```python
# Dans les algorithmes A* et BFS
self.nodes_explored = 0

# À chaque nœud exploré
while frontier:
    current = heapq.heappop(frontier)
    self.nodes_explored += 1
    # ...
```

## Analyse et Interprétation

### Comparaison d'Algorithmes

#### A* vs BFS
- **Mémoire**: A* généralement plus gourmand (stocke f-scores)
- **Temps**: A* plus rapide avec bonne heuristique
- **Nœuds**: A* explore moins de nœuds grâce à l'heuristique
- **Optimalité**: Les deux garantissent le chemin optimal

### Évaluation de Performance

#### Critères de Performance Excellente
- Mémoire < 1 MB par agent
- Temps de décision < 10 ms
- Score > 5000
- Écart-type faible (σ/μ < 0.3)

#### Signaux d'Alerte
- Mémoire > 10 MB (possible fuite mémoire)
- Temps de décision > 100 ms (algorithme inefficace)
- Écart-type élevé (σ/μ > 0.5) (comportement instable)

### Analyse Statistique Avancée

#### Coefficient de Variation (CV)
```
CV = (σ / μ) × 100%
```
- **Interprétation**:
  - CV < 15%: Faible variabilité, excellente consistance
  - 15% < CV < 30%: Variabilité modérée
  - CV > 30%: Haute variabilité, résultats imprévisibles

## Applications Scientifiques

### Recherche et Optimisation
1. **Benchmark d'algorithmes**: Comparaison objective de différentes stratégies
2. **Optimisation de paramètres**: Identification des configurations optimales
3. **Analyse de scalabilité**: Comportement face à des labyrinthes plus grands
4. **Étude de complexité**: Validation empirique des complexités théoriques

### Validation Expérimentale
- **Tests statistiques**: t-test, ANOVA pour comparer algorithmes
- **Intervalles de confiance**: Estimation de la fiabilité des mesures
- **Corrélations**: Relations entre métriques (temps vs nœuds explorés)

## Références

- Analyse de complexité: [Introduction to Algorithms, CLRS]
- Pathfinding algorithms: [Artificial Intelligence: A Modern Approach, Russell & Norvig]
- Statistiques descriptives: [Statistics for Engineers, Montgomery & Runger]
- Performance profiling: [Python Performance Documentation]

## Notes Techniques

### Limitations
- Le tracking mémoire peut ajouter un overhead (~5-10% de temps)
- Les mesures sont des estimations (dépendent de la charge système)
- Le score ne reflète pas parfaitement la qualité du jeu (pas de pellets trackés actuellement)

### Améliorations Futures
- [ ] Tracking précis des pellets mangés
- [ ] Mesure de la qualité des trajectoires (smoothness)
- [ ] Analyse de la prédictibilité des fantômes
- [ ] Heatmaps de performance par zone du labyrinthe
- [ ] Corrélations entre structure du labyrinthe et performance
