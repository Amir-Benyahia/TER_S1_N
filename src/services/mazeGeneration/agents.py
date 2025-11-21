import random
from collections import deque

class GhostAgent:
    def __init__(self, position, id=0, strategy="random"):
        self.position = position 
        self.id = id
        self.strategy = strategy 
        self.path_memory = []

    def get_next_move(self, maze_grid, pacman_position, shared_memory=None, assigned_zone=None):
        """
        Hub central pour décider du mouvement selon la stratégie.
        """
        if self.strategy == "random":
            return self._random_move(maze_grid)
        elif self.strategy == "bfs":
            return self._bfs_move(maze_grid, pacman_position)
        elif self.strategy == "collaborative":
            return self._collaborative_move(maze_grid, pacman_position, shared_memory, assigned_zone)
        return self.position

    def _collaborative_move(self, grid, pacman_real_pos, shared_memory, zone_target):
        """
        Stratégie de groupe :
        1. Si je vois Pacman (distance < 5), je le dis aux autres (shared_memory).
        2. Si on connait la position de Pacman, je le chasse.
        3. Sinon, je patrouille ma zone.
        """
        # 1. Simulation de la Vue (Distance de Manhattan)
        dist = abs(self.position[0] - pacman_real_pos[0]) + abs(self.position[1] - pacman_real_pos[1])
        
        # Si je suis assez près, je le "vois" et je mets à jour la mémoire de l'équipe
        if dist <= 5: 
            shared_memory['pacman_last_pos'] = pacman_real_pos
            
        # 2. Choix de la cible
        target = zone_target # Par défaut : je vais vers le centre de ma zone
        
        # Si l'équipe a une info sur Pacman, on change de mode -> CHASSE
        if shared_memory['pacman_last_pos'] is not None:
            target = shared_memory['pacman_last_pos']
            
        # 3. Déplacement vers la cible choisie
        return self._bfs_move(grid, target)

    def _get_valid_neighbors(self, position, grid):
        y, x = position
        neighbors = []
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)] # Haut, Bas, Gauche, Droite
        
        height = len(grid)
        width = len(grid[0])

        for dy, dx in directions:
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width:
                cell_value = grid[ny][nx]
                if not cell_value: 
                    neighbors.append((ny, nx))
        return neighbors

    def _random_move(self, grid):
        neighbors = self._get_valid_neighbors(self.position, grid)
        return random.choice(neighbors) if neighbors else self.position

    def _bfs_move(self, grid, target):
        start = self.position
        if start == target: return start

        queue = deque([(start, [])]) 
        visited = set([start])

        # Limite de recherche pour ne pas laguer si la cible est inaccessible
        limit = 500 
        count = 0

        while queue and count < limit:
            count += 1
            current, path = queue.popleft()
            
            if current == target:
                return path[0] if path else current

            for neighbor in self._get_valid_neighbors(current, grid):
                if neighbor not in visited:
                    visited.add(neighbor)
                    # On priorise un peu le chemin (optionnel)
                    new_path = path + [neighbor]
                    queue.append((neighbor, new_path))
        
        # Si pas de chemin trouvé (ou trop loin), on bouge au hasard vers une case libre
        # pour ne pas rester bloqué
        return self._random_move(grid)