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
        total_wall_cells = 0

        # On parcourt la grille pour trouver toutes les zones de couloirs ("îles").
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:
                    total_path_cells += 1
                else:
                    total_wall_cells += 1
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
        
        # Nouvelles métriques
        dead_ends = self._count_dead_ends()
        intersections = self._count_intersections()
        density = total_wall_cells / (total_path_cells + total_wall_cells) if (total_path_cells + total_wall_cells) > 0 else 0
        longest_path = self._calculate_longest_path()
        difficulty_score = self._calculate_difficulty(dead_ends, intersections, longest_path)
        
        # Métriques avancées pour Pac-Man
        avg_intersection_distance = self._calculate_average_intersection_distance()
        safe_dead_ends = self._count_safe_dead_ends()
        
        return {
            "Ratio de jouabilité": f"{playability_ratio:.2%}",
            "Symétrie horizontale": is_horizontally_symmetric,
            "Symétrie verticale": is_vertically_symmetric,
            "Nombre de culs-de-sac": dead_ends,
            "Nombre d'intersections": intersections,
            "Densité de murs": f"{density:.2%}",
            "Longueur du chemin le plus long": longest_path,
            "Score de difficulté": f"{difficulty_score:.2f}/10",
            "Distance moyenne intersections": f"{avg_intersection_distance:.2f}",
            "Culs-de-sac sûrs": safe_dead_ends
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

    def _count_dead_ends(self):
        """Compte le nombre de culs-de-sac (cellules avec un seul voisin accessible)"""
        dead_ends = 0
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:  # Si c'est un couloir
                    neighbors = self._count_neighbors(x, y)
                    if neighbors == 1:  # Un seul voisin = cul-de-sac
                        dead_ends += 1
        return dead_ends
    
    def _count_intersections(self):
        """Compte le nombre d'intersections (cellules avec 3+ voisins accessibles)"""
        intersections = 0
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:  # Si c'est un couloir
                    neighbors = self._count_neighbors(x, y)
                    if neighbors >= 3:  # 3 voisins ou plus = intersection
                        intersections += 1
        return intersections
    
    def _count_neighbors(self, x, y):
        """Compte le nombre de voisins accessibles (couloirs) autour d'une cellule"""
        count = 0
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = x + dx, y + dy
            if (0 <= nx < self.largeur_grille and 0 <= ny < self.hauteur_grille and
                    self.grille[ny][nx] == 0):
                count += 1
        return count
    
    def _calculate_longest_path(self):
        """Calcule la longueur du chemin le plus long dans le labyrinthe"""
        max_distance = 0
        
        # On teste depuis chaque point du labyrinthe
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:  # Si c'est un couloir
                    distance = self._bfs_longest_from_point(x, y)
                    max_distance = max(max_distance, distance)
        
        return max_distance
    
    def _bfs_longest_from_point(self, start_x, start_y):
        """Calcule la distance maximale depuis un point donné"""
        visited = set()
        queue = deque([(start_x, start_y, 0)])  # (x, y, distance)
        visited.add((start_x, start_y))
        max_dist = 0
        
        while queue:
            x, y, dist = queue.popleft()
            max_dist = max(max_dist, dist)
            
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if (0 <= nx < self.largeur_grille and 0 <= ny < self.hauteur_grille and
                        self.grille[ny][nx] == 0 and (nx, ny) not in visited):
                    visited.add((nx, ny))
                    queue.append((nx, ny, dist + 1))
        
        return max_dist
    
    def _calculate_difficulty(self, dead_ends, intersections, longest_path):
        """
        Calcule un score de difficulté de 0 à 10
        - Plus de culs-de-sac = plus difficile
        - Plus d'intersections = plus complexe
        - Chemin plus long = plus difficile
        """
        # Normalisation approximative (ajustable selon vos besoins)
        dead_end_score = min(dead_ends / 10, 3)  # Max 3 points
        intersection_score = min(intersections / 15, 4)  # Max 4 points
        path_score = min(longest_path / 50, 3)  # Max 3 points
        
        total_score = dead_end_score + intersection_score + path_score
        return min(total_score, 10)  # Plafond à 10
    
    def _calculate_average_intersection_distance(self):
        """
        Calcule la distance Manhattan moyenne entre toutes les paires d'intersections
        Indicateur du rythme du jeu : trop proche = frénétique, trop éloigné = ennuyeux
        Idéal pour Pac-Man : 4-6 cases entre intersections
        """
        intersections = []
        
        # Trouver toutes les intersections (cellules avec 3+ voisins)
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0 and self._count_neighbors(x, y) >= 3:
                    intersections.append((x, y))
        
        if len(intersections) < 2:
            return 0
        
        # Calculer la distance Manhattan moyenne entre toutes les paires
        total_distance = 0
        count = 0
        
        for i, (x1, y1) in enumerate(intersections):
            for x2, y2 in intersections[i+1:]:
                distance = abs(x2 - x1) + abs(y2 - y1)
                total_distance += distance
                count += 1
        
        return round(total_distance / count, 2) if count > 0 else 0
    
    def _count_safe_dead_ends(self):
        """
        Compte les culs-de-sac "sûrs" (à moins de 3 cases d'une intersection)
        Un cul-de-sac proche d'une intersection = zone de refuge stratégique
        Un cul-de-sac isolé = piège mortel
        """
        # Trouver toutes les intersections
        intersections = set()
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0 and self._count_neighbors(x, y) >= 3:
                    intersections.add((x, y))
        
        safe_dead_ends = 0
        
        # Pour chaque cul-de-sac, vérifier la distance à l'intersection la plus proche
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0 and self._count_neighbors(x, y) == 1:
                    # C'est un cul-de-sac
                    # Vérifier s'il y a une intersection à moins de 3 cases
                    for ix, iy in intersections:
                        distance = abs(ix - x) + abs(iy - y)
                        if distance <= 3:
                            safe_dead_ends += 1
                            break  # On compte ce cul-de-sac une seule fois
        
        return safe_dead_ends