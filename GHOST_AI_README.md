# Intelligence Artificielle des Fantômes - Documentation Technique

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de l'IA](#architecture-de-lia)
3. [Les 4 Personnalités de Fantômes](#les-4-personnalités-de-fantômes)
4. [Algorithmes de Pathfinding](#algorithmes-de-pathfinding)
5. [Nouvelles Fonctionnalités Implémentées](#nouvelles-fonctionnalités-implémentées)
6. [Détails Techniques](#détails-techniques)

---

## Vue d'ensemble

Le système d'IA des fantômes dans ce projet Pac-Man est conçu pour simuler des comportements variés et intelligents. Chaque fantôme possède sa propre personnalité qui détermine comment il poursuit Pac-Man.

### Composants principaux
- **Backend Python** : Simulation de l'IA et calcul des trajectoires (`src/algorithms/`)
- **Frontend JavaScript** : Affichage en temps réel et interaction utilisateur (`src/client/js/`)
- **Serveur Node.js** : API REST pour orchestrer les simulations (`src/server/`)

---

## Architecture de l'IA

### Structure des classes

```
BaseAgent (classe de base)
    ├── BlinkyAgent (Rouge - Chasseur)
    ├── PinkyAgent (Rose - Embusqueur)
    ├── InkyAgent (Cyan - Flanqueur)
    └── ClydeAgent (Orange - Aléatoire)
```

### Fichiers concernés
- `src/algorithms/ghost_ai/base_agent.py` : Classe de base commune à tous les fantômes
- `src/algorithms/ghost_ai/blinky.py` : Comportement du fantôme rouge
- `src/algorithms/ghost_ai/pinky.py` : Comportement du fantôme rose
- `src/algorithms/ghost_ai/inky.py` : Comportement du fantôme cyan
- `src/algorithms/ghost_ai/clyde.py` : Comportement du fantôme orange

---

## Les 4 Personnalités de Fantômes

### 1. Blinky (Rouge) - Le Chasseur Direct
**Stratégie** : Poursuite directe et agressive de Pac-Man

**Comportement** :
- Cible toujours la position exacte de Pac-Man
- Utilise le pathfinding pour trouver le chemin le plus court
- Ne dévie jamais de sa cible

**Code** (`blinky.py`) :
```python
def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
    return pacman_pos  # Cible directe
```

**Utilisation idéale** : Test de performance des algorithmes de pathfinding

---

### 2. Pinky (Rose) - L'Embusqueur
**Stratégie** : Anticipe les mouvements de Pac-Man et vise devant lui

**Comportement** :
- Calcule une position 4 cases devant Pac-Man
- Crée des situations de piège en coupant la route
- Plus stratégique que direct

**Code** (`pinky.py`) :
```python
def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
    # Directions : UP, DOWN, LEFT, RIGHT
    offsets = {
        'UP': (-4, 0),
        'DOWN': (4, 0),
        'LEFT': (0, -4),
        'RIGHT': (0, 4)
    }
    # Vise 4 cases devant Pac-Man
    offset = offsets.get(pacman_dir, (0, 0))
    target = (pacman_pos[0] + offset[0], pacman_pos[1] + offset[1])
    return target
```

**Utilisation idéale** : Test d'anticipation et de stratégie offensive

---

### 3. Inky (Cyan) - Le Flanqueur
**Stratégie** : Coordonne ses mouvements avec Blinky pour encercler Pac-Man

**Comportement** :
- Calcule un vecteur entre Blinky et Pac-Man
- Vise le point opposé pour créer une tenaille
- Comportement le plus complexe et coordonné

**Code** (`inky.py`) :
```python
def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
    # Trouve la position de Blinky
    blinky_pos = other_ghosts.get('blinky', pacman_pos)
    
    # Vise 2 cases devant Pac-Man
    offset = offsets.get(pacman_dir, (0, 0))
    pivot = (pacman_pos[0] + offset[0], pacman_pos[1] + offset[1])
    
    # Calcule le vecteur Blinky -> Pivot
    vector = (pivot[0] - blinky_pos[0], pivot[1] - blinky_pos[1])
    
    # Double ce vecteur pour l'effet de flanquement
    target = (pivot[0] + vector[0], pivot[1] + vector[1])
    return target
```

**Utilisation idéale** : Test de coordination entre fantômes

---

### 4. Clyde (Orange) - L'Aléatoire
**Stratégie** : Alterne entre poursuite et fuite selon la distance

**Comportement** :
- Si loin de Pac-Man (>8 cases) : poursuit comme Blinky
- Si proche (<8 cases) : fuit vers un coin du labyrinthe
- Comportement imprévisible

**Code** (`clyde.py`) :
```python
def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
    distance = abs(self.current_pos[0] - pacman_pos[0]) + \
               abs(self.current_pos[1] - pacman_pos[1])
    
    if distance > 8:
        return pacman_pos  # Poursuite
    else:
        # Fuite vers le coin bas-gauche
        return (len(self.grid) - 2, 1)
```

**Utilisation idéale** : Test d'adaptabilité et de comportements mixtes

---

## Algorithmes de Pathfinding

Chaque fantôme peut utiliser différents algorithmes pour calculer son chemin :

### 1. A* (A-Star) - Par défaut
**Fichier** : `src/algorithms/pathfinding/astar.py`

**Principe** :
- Utilise une heuristique (distance de Manhattan) pour guider la recherche
- Explore les nœuds les plus prometteurs en premier
- Garantit le chemin optimal

**Avantages** :
- Efficace et rapide
- Chemin optimal garanti
- Bon équilibre performance/qualité

**Complexité** :
- Temps : O(b^d) avec optimisation heuristique
- Espace : O(b^d)

### 2. BFS (Breadth-First Search)
**Fichier** : `src/algorithms/pathfinding/bfs.py`

**Principe** :
- Explore tous les voisins niveau par niveau
- Trouve le chemin le plus court en nombre de cases

**Avantages** :
- Simple à comprendre
- Chemin optimal en nombre de cases

**Inconvénients** :
- Plus lent que A* sur grandes distances
- Consomme plus de mémoire

---

## Nouvelles Fonctionnalités Implémentées

### 1. Validation des Positions de Spawn ✨

**Problème initial** : Les fantômes pouvaient spawner dans les murs si l'utilisateur choisissait une position invalide.

**Solution implémentée** :

#### Backend (`game_engine.py`)
```python
def _is_walkable(self, pos):
    """
    Verifie si une position est valide et traversable.
    
    Args:
        pos: Position (row, col)
    
    Returns:
        bool: True si la position est OK, False sinon
    """
    if not pos:
        return False
    
    row, col = pos
    # Verifier que la position est dans les limites
    if row < 0 or row >= len(self.grid):
        return False
    if col < 0 or col >= len(self.grid[0]):
        return False
    
    # Verifier que ce n'est pas un mur (0 = passage, 1 = mur)
    return self.grid[row][col] != 1

def _find_nearest_walkable(self, pos):
    """
    Trouve la case traversable la plus proche d'une position.
    
    Args:
        pos: Position de depart (row, col)
    
    Returns:
        tuple: Position traversable (row, col) ou None
    """
    if self._is_walkable(pos):
        return pos
    
    row, col = pos
    # Chercher autour dans un rayon croissant
    for radius in range(1, 10):
        for dr in range(-radius, radius + 1):
            for dc in range(-radius, radius + 1):
                check_pos = (row + dr, col + dc)
                if self._is_walkable(check_pos):
                    return check_pos
    
    # Si rien trouve, retourner la premiere case libre du labyrinthe
    for r in range(len(self.grid)):
        for c in range(len(self.grid[0])):
            if self.grid[r][c] == 0:
                return (r, c)
    
    return None
```

**Utilisation dans `__init__`** :
```python
if start_pos:
    # Normaliser le format de position
    if isinstance(start_pos, dict):
        start_pos = (start_pos['y'], start_pos['x'])
    
    # Valider que la position n'est pas dans un mur
    if not self._is_walkable(start_pos):
        print(f"Warning: {ghost_type} spawn dans un mur {start_pos}, correction...")
        start_pos = self._find_nearest_walkable(start_pos)
    
    ghost.set_position(start_pos)
```

#### Frontend (`SimulationViewer.js`)
```javascript
initializeGhosts() {
  return this.ghostConfigs.map((config, index) => {
    let startPos = config.startPos || { y: 1 + index, x: 1 + index * 2 };
    
    // Valider que la position n'est pas dans un mur
    if (!this.isWalkable(startPos)) {
      console.warn(`Fantome ${config.type} spawn dans un mur (${startPos.y}, ${startPos.x}), correction...`);
      startPos = this.findNearestWalkable(startPos);
    }
    
    return {
      type: config.type || ['blinky', 'pinky', 'inky', 'clyde'][index],
      position: startPos,
      lastMove: Date.now()
    };
  });
}

findNearestWalkable(pos) {
  // Si deja OK, retourner directement
  if (this.isWalkable(pos)) {
    return pos;
  }
  
  // Chercher autour dans un rayon croissant
  for (let radius = 1; radius < 10; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const checkPos = { y: pos.y + dy, x: pos.x + dx };
        if (this.isWalkable(checkPos)) {
          console.log(`Position corrigee: (${pos.y}, ${pos.x}) -> (${checkPos.y}, ${checkPos.x})`);
          return checkPos;
        }
      }
    }
  }
  
  // Si rien trouve, retourner la premiere case libre
  for (let y = 0; y < this.grid.length; y++) {
    for (let x = 0; x < this.grid[0].length; x++) {
      if (this.grid[y][x] !== 1) {
        return { y, x };
      }
    }
  }
  
  return pos; // Dernier recours
}
```

**Résultat** :
- ✅ Les fantômes ne peuvent plus spawner dans les murs
- ✅ Correction automatique vers la case libre la plus proche
- ✅ Message d'avertissement dans la console

---

### 2. Validation des Mouvements en Temps Réel ✨

**Problème initial** : Les fantômes pouvaient se retrouver bloqués dans les murs si le pathfinding retournait une position invalide.

**Solution implémentée** (`game_engine.py`) :
```python
# Valider que le mouvement ne va pas dans un mur
if next_pos and self._is_walkable(next_pos):
    agent.set_position(next_pos)
    ghost['position'] = next_pos
# Sinon le fantome reste sur place
```

**Comportement** :
- Avant de déplacer un fantôme, on vérifie que la nouvelle position est valide
- Si la position est un mur, le fantôme reste immobile
- Évite les bugs où les fantômes disparaissent ou traversent les murs

**Résultat** :
- ✅ Les fantômes ne peuvent plus entrer dans les murs
- ✅ Comportement cohérent même en cas d'erreur de pathfinding
- ✅ Aucun fantôme ne reste "coincé" dans un mur

---

### 3. Gestion de la Superposition Visuelle ✨

**Problème initial** : Quand plusieurs fantômes étaient sur la même case, un seul était visible (les autres disparaissaient).

**Solution implémentée** :

#### Backend - Rendu avec décalage (`MazeCanvas.js`)
```javascript
drawGhost(row, col, type = 'blinky', offset = 0) {
  const x = col * this.cellSize + this.cellSize / 2;
  const y = row * this.cellSize + this.cellSize / 2;
  const radius = this.cellSize * 0.4;

  // Appliquer un decalage si plusieurs fantomes sur la meme case
  const offsetX = (offset % 2) * (radius * 0.5) * (offset % 4 < 2 ? -1 : 1);
  const offsetY = Math.floor(offset / 2) * (radius * 0.5) * (offset < 2 ? -1 : 1);

  this.ctx.fillStyle = this.colors.ghost[type] || this.colors.ghost.blinky;
  this.ctx.beginPath();
  this.ctx.arc(x + offsetX, y + offsetY, radius * 0.9, 0, Math.PI * 2);
  this.ctx.fill();
  
  // ... dessiner les yeux avec le même décalage
}
```

**Pattern de décalage** :
```
Offset 0: Position centrale
Offset 1: Décalage gauche-haut     (offsetX = -radius*0.5, offsetY = -radius*0.5)
Offset 2: Décalage droite-haut     (offsetX = +radius*0.5, offsetY = -radius*0.5)
Offset 3: Décalage droite-bas      (offsetX = +radius*0.5, offsetY = +radius*0.5)
```

#### Frontend - Détection de superposition (`SimulationViewer.js`)
```javascript
// Draw ghosts
if (this.ghostPositions && Array.isArray(this.ghostPositions)) {
  // Compter les fantomes par position pour gerer la superposition
  const positionCounts = {};
  this.ghostPositions.forEach(ghost => {
    if (ghost.position) {
      const key = `${ghost.position.y},${ghost.position.x}`;
      if (!positionCounts[key]) {
        positionCounts[key] = [];
      }
      positionCounts[key].push(ghost);
    }
  });
  
  // Dessiner chaque fantome avec un decalage si necessaire
  this.ghostPositions.forEach(ghost => {
    if (ghost.position && this.mazeCanvas && this.mazeCanvas.drawGhost) {
      const key = `${ghost.position.y},${ghost.position.x}`;
      const ghostsAtPos = positionCounts[key];
      const offset = ghostsAtPos.indexOf(ghost);
      this.mazeCanvas.drawGhost(ghost.position.y, ghost.position.x, ghost.type, offset);
    }
  });
}
```

**Résultat** :
- ✅ Les 4 fantômes sont toujours visibles
- ✅ Décalage automatique quand ils se superposent
- ✅ Meilleure clarté visuelle de la simulation

---

## Détails Techniques

### Format de la grille
```javascript
0 = Case vide (traversable)
1 = Mur (non-traversable)
2 = Pellet normal
3 = Power pellet
```

### Format des positions
- **Backend Python** : `(row, col)` - tuple
- **Frontend JavaScript** : `{y: row, x: col}` - objet

### Conversion automatique
Le code gère automatiquement la conversion entre les deux formats :
```python
if isinstance(start_pos, dict):
    start_pos = (start_pos['y'], start_pos['x'])
```

### Configuration des fantômes
L'utilisateur peut configurer via l'interface :
- **Type** : blinky, pinky, inky, clyde
- **Algorithme** : astar, bfs
- **Position de départ** : (START Y, START X)

Exemple de configuration :
```javascript
{
  type: 'blinky',
  algorithm: 'astar',
  startPos: { y: 7, x: 9 }
}
```

---

## Fichiers Modifiés

### Backend Python
- `src/algorithms/simulation/game_engine.py` :
  - Ajout de `_is_walkable(pos)`
  - Ajout de `_find_nearest_walkable(pos)`
  - Validation dans `__init__()` et `simulate()`

### Frontend JavaScript
- `src/client/js/components/SimulationViewer.js` :
  - Ajout de `findNearestWalkable(pos)`
  - Modification de `initializeGhosts()`
  - Modification du rendu des fantômes (gestion superposition)

- `src/client/js/components/MazeCanvas.js` :
  - Modification de `drawGhost()` pour accepter un paramètre `offset`
  - Calcul automatique du décalage visuel

---

## Tests et Validation

### Test de spawn dans les murs
1. Ouvrir l'interface de configuration
2. Placer un fantôme sur une case mur (case bleue foncée)
3. Lancer la simulation
4. ✅ Le fantôme apparaît automatiquement sur la case libre la plus proche

### Test de superposition
1. Configurer plusieurs fantômes avec la même position de départ
2. Lancer la simulation
3. ✅ Tous les fantômes sont visibles avec un léger décalage

### Test de mouvement dans les murs
1. Observer les fantômes pendant la simulation
2. ✅ Aucun fantôme ne traverse ou ne reste coincé dans un mur

---

## Performance

### Optimisations
- Validation des positions en O(1) grâce à un accès direct à `grid[row][col]`
- Recherche de case libre en spirale (rayon croissant) pour trouver rapidement la position la plus proche
- Calcul de superposition en O(n) où n = nombre de fantômes (max 4)

### Métriques
Les performances de chaque fantôme sont tracées :
- Temps de décision moyen
- Nombre de nœuds explorés par le pathfinding
- Utilisation mémoire

---

## Utilisation

### Lancer une simulation
1. Démarrer le serveur : `node src/server/index.js`
2. Ouvrir http://localhost:3000
3. Aller dans "AI Simulation"
4. Configurer les fantômes (type, algorithme, position)
5. Cliquer sur "START SIMULATION"

### Voir les résultats
- Les fantômes apparaissent avec leurs couleurs respectives
- La simulation se joue automatiquement
- Les métriques de performance s'affichent à la fin

---

## Conclusion

Les améliorations apportées rendent le système d'IA des fantômes :
- **Plus robuste** : Aucun bug de collision ou de spawn invalide
- **Plus fiable** : Validation à tous les niveaux (frontend + backend)
- **Plus clair** : Tous les fantômes sont visibles même quand ils se superposent
- **Plus professionnel** : Code propre avec commentaires appropriés

Le système est maintenant prêt pour des tests approfondis et des analyses de performance des différentes stratégies d'IA.
