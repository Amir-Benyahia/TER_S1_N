from collections import deque

class TesteurLabyrinthe:
    def __init__(self, labyrinthe_murs, largeur, hauteur):
        self.largeur_cellules = largeur
        self.hauteur_cellules = hauteur
        # Étape cruciale : on convertit le format "murs" en une grille de "cellules"
        self.grille = self._convertir_en_grille(labyrinthe_murs)
        
        self.hauteur_grille = len(self.grille)
        self.largeur_grille = len(self.grille[0])
        self.visited = set()

    def _convertir_en_grille(self, labyrinthe_murs):
        largeur_grille = self.largeur_cellules * 2 + 1
        hauteur_grille = self.hauteur_cellules * 2 + 1
        grille = [[1] * largeur_grille for _ in range(hauteur_grille)]

        for y in range(self.hauteur_cellules):
            for x in range(self.largeur_cellules):
                grille[y * 2 + 1][x * 2 + 1] = 0
                
                # Vérifie les murs horizontaux (à droite)
                if x < self.largeur_cellules - 1 and not labyrinthe_murs[2 * y][x]:
                    grille[y * 2 + 1][x * 2 + 2] = 0
                
                # Vérifie les murs verticaux (en bas)
                if y < self.hauteur_cellules - 1 and not labyrinthe_murs[2 * y + 1][x]:
                    grille[y * 2 + 2][x * 2 + 1] = 0
        
        return grille

    def qualifier(self):
        component_sizes = []
        total_path_cells = 0
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille):
                if self.grille[y][x] == 0:
                    total_path_cells += 1
                if self.grille[y][x] == 0 and (x, y) not in self.visited:
                    component_size = self._bfs_explore((x, y))
                    component_sizes.append(component_size)
        
        main_component_size = max(component_sizes) if component_sizes else 0
        playability_ratio = (main_component_size / total_path_cells) if total_path_cells > 0 else 0
        
        is_horizontally_symmetric = self._check_horizontal_symmetry()
        is_vertically_symmetric = self._check_vertical_symmetry()
        
        return {
            "Ratio de jouabilité": f"{playability_ratio:.2%}",
            "Symétrie horizontale": is_horizontally_symmetric,
            "Symétrie verticale": is_vertically_symmetric
        }

    def _bfs_explore(self, start_node):
        queue = deque([start_node])
        self.visited.add(start_node)
        size = 0
        while queue:
            x, y = queue.popleft()
            size += 1
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if (0 <= nx < self.largeur_grille and 0 <= ny < self.hauteur_grille and
                        self.grille[ny][nx] == 0 and (nx, ny) not in self.visited):
                    self.visited.add((nx, ny))
                    queue.append((nx, ny))
        return size

    def _check_horizontal_symmetry(self):
        for y in range(self.hauteur_grille // 2):
            for x in range(self.largeur_grille):
                if self.grille[y][x] != self.grille[self.hauteur_grille - 1 - y][x]:
                    return False
        return True

    def _check_vertical_symmetry(self):
        for y in range(self.hauteur_grille):
            for x in range(self.largeur_grille // 2):
                if self.grille[y][x] != self.grille[y][self.largeur_grille - 1 - x]:
                    return False
        return True