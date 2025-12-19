# 🎯 Module Batches - Expérimentation avec MongoDB

Génère des batches de simulations avec le même algorithme et les sauvegarde dans **MongoDB**.

## 🎯 Objectif

Analyser la **performance** et la **variance** d'un algorithme :
- **Score** (performance)
- **Mémoire** (complexité spatiale en MB)  
- **Temps de décision** (complexité temporelle en ms)

## 🚀 Quick Start

### 1. Démarrer le serveur

```bash
cd src && npm start
```

### 2. Générer un batch (sauvegarde automatique dans MongoDB)

```bash
# Générer 30 simulations avec A*
python3 experiments/batch_runner.py --algorithm astar --simulations 30

# Avec un nom personnalisé
python3 experiments/batch_runner.py \
  --algorithm astar \
  --simulations 50 \
  --name "Performance A*"
```

Le batch est **automatiquement sauvegardé dans MongoDB** !

### 3. Lister les batches dans MongoDB

```bash
python3 experiments/list_batches_db.py
```

### 4. Visualiser en 3D

```bash
# Visualiser un batch spécifique
python3 experiments/visualize_3d.py --batch batch_20251219_HHMMSS

# Comparer plusieurs batches
python3 experiments/visualize_3d.py --compare batch_1 batch_2
```

## 📊 Graphique 3D

Le graphique 3D affiche les **3 dimensions** :
- **Axe X** : Score (performance)
- **Axe Y** : Complexité Spatiale (mémoire en MB)
- **Axe Z** : Complexité Temporelle (temps de décision en ms)

**Interprétation** :
- ⭐ **Étoile rouge** = Valeur moyenne
- 🔵 **Points colorés** = Simulations individuelles
- **Dispersion** = Variance de l'algorithme

## 📁 Structure

```
experiments/
├── batch_runner.py        # Générer des batches (+ upload MongoDB)
├── visualize_3d.py        # Visualiser en 3D
├── list_batches_db.py     # Lister les batches MongoDB
├── upload_to_db.py        # Upload manuel vers MongoDB
├── batches/               # Batches en local (backup)
│   └── batch_YYYYMMDD_HHMMSS/
│       ├── config.json
│       ├── maze.json
│       ├── results.json
│       └── statistics.json
└── outputs/               # Graphiques 3D
    ├── batch_XXX_3d.png
    └── comparison_3d.png
```

## 🛠️ Commandes

| Action | Commande |
|--------|----------|
| **Démarrer serveur** | `cd src && npm start` |
| **Générer batch** | `python3 batch_runner.py --algorithm astar --simulations 30` |
| **Lister batches DB** | `python3 list_batches_db.py` |
| **Visualiser batch** | `python3 visualize_3d.py --batch batch_ID` |
| **Comparer batches** | `python3 visualize_3d.py --compare batch1 batch2` |

## 📈 Exemple complet

```bash
# 1. Démarrer le serveur
cd src && npm start &

# 2. Générer un batch avec A* (auto-upload MongoDB)
python3 experiments/batch_runner.py \
  --algorithm astar \
  --simulations 50 \
  --name "Test A*"

# 3. Générer un batch avec BFS (auto-upload MongoDB)
python3 experiments/batch_runner.py \
  --algorithm bfs \
  --simulations 50 \
  --name "Test BFS"

# 4. Lister les batches dans MongoDB
python3 experiments/list_batches_db.py

# 5. Comparer les deux batches en 3D
python3 experiments/visualize_3d.py --compare batch_ID1 batch_ID2
```

## ✨ Avantages

- ✅ **Auto-upload MongoDB** : Batches sauvegardés automatiquement
- ✅ **Accessible sur le site** : Batches visibles dans l'interface web
- ✅ **Backup local** : Copie en local dans `experiments/batches/`
- ✅ **Visualisation 3D** : Graphique automatique
- ✅ **Statistiques** : Moyenne et variance calculées

## 🔧 Options

### batch_runner.py

```bash
--algorithm ALGO       # Algorithme (astar, bfs, greedy, etc.)
--simulations N        # Nombre de simulations (défaut: 30)
--name "Nom"           # Nom du batch
--maze-width W         # Largeur du labyrinthe (défaut: 21)
--maze-height H        # Hauteur du labyrinthe (défaut: 21)
--api-url URL          # URL de l'API (défaut: http://localhost:3000)
--no-upload            # Ne pas uploader vers MongoDB
```

### visualize_3d.py

```bash
--batch ID             # Visualiser un batch
--compare ID1 ID2...   # Comparer plusieurs batches
--list                 # Lister les batches locaux
```

## 🎯 Workflow

1. **Générer** un batch avec `batch_runner.py`
2. Batch **sauvegardé automatiquement** dans MongoDB
3. **Lister** les batches avec `list_batches_db.py`
4. **Visualiser** en 3D avec `visualize_3d.py`
5. **Accéder** aux batches sur le site web (http://localhost:3000)

## 💾 MongoDB

Les batches sont sauvegardés dans la collection `simulationbatches` avec :
- `batchId` : ID unique du batch
- `name` : Nom du batch
- `algorithm` : Algorithme utilisé
- `simulationCount` : Nombre de simulations
- `maze` : Données du labyrinthe
- `statistics` : Statistiques agrégées (score, mémoire, temps)
- `results` : Résultats de toutes les simulations

## 🌐 Accès Web

Une fois uploadés, les batches sont accessibles via l'API :
- `GET /api/batches` : Liste tous les batches
- `GET /api/batches/:id` : Détails d'un batch
- `POST /api/batches` : Créer un batch

## 🔄 Upload manuel

Si le serveur n'était pas démarré lors de la génération :

```bash
python3 experiments/upload_to_db.py --batch batch_ID
```
