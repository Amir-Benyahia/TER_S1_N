import sys
import json
from agents import GhostAgent

def main():
    try:
        # 1. Récupération des arguments envoyés par Node.js
        # On attend un seul argument : une string JSON contenant tout l'état du jeu
        if len(sys.argv) < 2:
            print(json.dumps({"error": "Pas assez d'arguments"}))
            sys.exit(1)
            
        input_data = json.loads(sys.argv[1])
        
        # 2. Extraction des données
        # La grille reçue sera simplifiée (0 = chemin, 1 = mur) par le JS avant l'envoi
        grid = input_data.get('grid') 
        ghost_pos = tuple(input_data.get('ghostPos')) # [y, x]
        pacman_pos = tuple(input_data.get('pacmanPos')) # [y, x]
        strategy = input_data.get('strategy', 'bfs')
        
        # Pour la squad, on a besoin de la mémoire partagée (optionnel pour l'instant)
        shared_mem = input_data.get('sharedMemory', {'pacman_last_pos': None})
        zone = input_data.get('zone', None)

        # 3. Initialisation de l'agent
        # On crée un agent juste pour ce tour (stateless)
        agent = GhostAgent(ghost_pos, strategy=strategy)
        
        # 4. Calcul du mouvement
        if strategy == "collaborative":
            next_move = agent.get_next_move(grid, pacman_pos, shared_mem, zone)
        else:
            next_move = agent.get_next_move(grid, pacman_pos)
            
        # 5. Réponse JSON pour Node.js
        response = {
            "nextMove": next_move,
            # On renvoie la mémoire mise à jour pour que le JS la stocke
            "sharedMemory": shared_mem 
        }
        
        print(json.dumps(response))

    except Exception as e:
        # En cas d'erreur, on renvoie du JSON aussi pour ne pas planter Node
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()