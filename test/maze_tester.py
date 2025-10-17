from collections import deque

class TesteurLabyrinthe:
    def __init__(self, labyrinthe_murs, largeur, hauteur):
        self.largeur_cellules = largeur
        self.hauteur_cellules = hauteur
        # Traduit le format "murs" en une grille simple (0/1) sur laquelle on peut travailler.
        self.grille = self._convertir_en_grille(labyrinthe_murs)
        
        self.hauteur_grille = len(self.grille)
        self.largeur_grille = len(self.grille[0])
        self.visited = set() # Mémorise les cases déjà visitées pour ne pas les compter plusieurs fois.

    def _convertir_en_grille(self, labyrinthe_murs):

       # Traduit la structure de données complexe du générateur (liste de murs) en une grille simple de 0 (couloir) et 1 (mur).

        # On crée une grille plus grande pour représenter les cellules ET les murs.
        largeur_grille = self.largeur_cellules * 2 + 1
        hauteur_grille = self.hauteur_cellules * 2 + 1
        grille = [[1] * largeur_grille for _ in range(hauteur_grille)]

        for y in range(self.hauteur_cellules):
            for x in range(self.largeur_cellules):
                # Le centre de chaque "super-cellule" est un couloir.
                grille[y * 2 + 1][x * 2 + 1] = 0
                
                # Si un mur est cassé dans le modèle original, on crée un passage.
                if x < self.largeur_cellules - 1 and not labyrinthe_murs[2 * y][x]:
                    grille[y * 2 + 1][x * 2 + 2] = 0 # Passage à droite
                
                if y < self.hauteur_cellules - 1 and not labyrinthe_murs[2 * y + 1][x]:
                    grille[y * 2 + 2][x * 2 + 1] = 0 # Passage en bas
        
        return grille

    def qualifier(self):
        # Lance l'analyse complète du labyrinthe et retourne un dictionnaire de résultats
        component_sizes = []
        total_path_cells = 0

        # On parcourt la grille pour trouver toutes les zones de couloirs ("îles").
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:
                    total_path_cells += 1
                # Si on trouve un couloir non visité, on explore sa zone.
                if self.grille[y][x] == 0 and (x, y) not in self.visited:
                    component_size = self._bfs_explore((x, y))
                    component_sizes.append(component_size)
        
        # La zone de jeu principale est la plus grande "île" de couloirs trouvée.
        main_component_size = max(component_sizes) if component_sizes else 0
        playability_ratio = (main_component_size / total_path_cells) if total_path_cells > 0 else 0
        
        # On exécute les tests de symétrie.
        is_horizontally_symmetric = self._check_horizontal_symmetry()
        is_vertically_symmetric = self._check_vertical_symmetry()
        
        return {
            "Ratio de jouabilité": f"{playability_ratio:.2%}",
            "Symétrie horizontale": is_horizontally_symmetric,
            "Symétrie verticale": is_vertically_symmetric
        }

    def _bfs_explore(self, start_node):
       # Utilise l'algorithme BFS pour trouver tous les couloirs connectés à partir d'un point
        queue = deque([start_node])
        self.visited.add(start_node)
        size = 0
        # Tant qu'il y a des cases à explorer dans la zone...
        while queue:
            x, y = queue.popleft()
            size += 1
            # On regarde les 4 voisins.
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx, ny = x + dx, y + dy
                # Si le voisin est un couloir valide et non visité, on l'ajoute à la liste d'exploration.
                if (0 <= nx < self.largeur_grille and 0 <= ny < self.hauteur_grille and
                        self.grille[ny][nx] == 0 and (nx, ny) not in self.visited):
                    self.visited.add((nx, ny))
                    queue.append((nx, ny))
        return size

    def _check_horizontal_symmetry(self):
        for y in range(self.hauteur_grille // 2):
            for x in range(self.largeur_grille):
                # On compare chaque ligne du haut avec sa ligne miroir en bas.
                symmetric_y = self.hauteur_grille - 1 - y
                if self.grille[y][x] != self.grille[symmetric_y][x]:
                    return False
        return True

    def _check_vertical_symmetry(self):
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille // 2):
                # On compare chaque colonne de gauche avec sa colonne miroir à droite.
                symmetric_x = self.largeur_grille - 1 - x
                if self.grille[y][x] != self.grille[y][symmetric_x]:
                    return False
        return True
