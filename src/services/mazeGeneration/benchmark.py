import time
import json
import random
from agents import GhostAgent
from maze_generator import GenerateurKruskal, Imperfecteur

# --- OUTIL DE CONVERSION (Le Correctif) ---
def convert_to_matrix(labyrinthe, width, height):
    """
    Convertit le format 'liste de murs' du générateur en une
    vraie grille 2D (Matrice) navigable pour les agents.
    True = Mur, False = Chemin
    """
    # On crée une grille 2x plus grande (car les murs ont leur propre épaisseur)
    # +1 pour les murs extérieurs
    matrix_h = 2 * height + 1
    matrix_w = 2 * width + 1
    
    # Au départ, tout est un mur
    matrix = [[True for _ in range(matrix_w)] for _ in range(matrix_h)]
    
    for y in range(height):
        for x in range(width):
            # La cellule elle-même est toujours un chemin
            matrix[2*y+1][2*x+1] = False
            
            # Vérification des murs adjacents selon la logique de maze_generator.py
            
            # 1. Mur Vertical (à droite de la case actuelle)
            # Stocké dans les lignes paires (2*y)
            if x < width - 1:
                is_wall = labyrinthe[2*y][x]
                if not is_wall: # Si le mur est cassé (False)
                    matrix[2*y+1][2*x+2] = False # On ouvre le passage à droite

            # 2. Mur Horizontal (en bas de la case actuelle)
            # Stocké dans les lignes impaires (2*y+1)
            if y < height - 1:
                is_wall = labyrinthe[2*y+1][x]
                if not is_wall: # Si le mur est cassé
                    matrix[2*y+2][2*x+1] = False # On ouvre le passage en bas
                    
    return matrix

# --- FONCTIONS DE SIMULATION ---

def run_game_simulation(width, height, strategy, max_steps=1000):
    # 1. Génération
    gen = GenerateurKruskal()
    raw_maze, murs = gen.generer(width, height)
    imp = Imperfecteur()
    # Ajout de cycles (5% d'imperfection)
    raw_maze, _, _ = imp.rendre_imparfait(raw_maze, murs, 0.05, width, height)
    
    # 2. CONVERSION CRITIQUE (Transformation en grille de jeu)
    grid = convert_to_matrix(raw_maze, width, height)
    real_h = len(grid)
    real_w = len(grid[0])

    # 3. Positions
    # Départ fantôme (Haut Gauche) - On cherche une case vide (False)
    start_pos = (1, 1)
    
    # Pacman (Bas Droite)
    pacman_pos = (real_h - 2, real_w - 2)
    
    # Sécurité : Si Pacman tombe dans un mur (peu probable avec la conversion, mais on assure)
    while grid[pacman_pos[0]][pacman_pos[1]] is True:
        pacman_pos = (pacman_pos[0] - 1, pacman_pos[1] - 1)

    ghost = GhostAgent(start_pos, strategy=strategy)
    
    steps = 0
    start_time = time.time()
    success = False
    
    while steps < max_steps:
        steps += 1
        # L'agent reçoit la "vraie" grille navigable maintenant
        next_move = ghost.get_next_move(grid, pacman_pos)
        ghost.position = next_move
        
        if ghost.position == pacman_pos:
            success = True
            break
    
    return {"success": success, "steps": steps}

def run_squad_simulation(width, height, max_steps=1000):
    # 1. Génération & Conversion
    gen = GenerateurKruskal()
    raw_maze, murs = gen.generer(width, height)
    imp = Imperfecteur()
    raw_maze, _, _ = imp.rendre_imparfait(raw_maze, murs, 0.05, width, height)
    grid = convert_to_matrix(raw_maze, width, height)
    
    real_h = len(grid)
    real_w = len(grid[0])

    # 2. Setup Squad
    pacman_pos = (real_h // 2, real_w // 2)
    # S'assurer que Pacman n'est pas dans un mur
    if grid[pacman_pos[0]][pacman_pos[1]]: pacman_pos = (real_h // 2, real_w // 2 + 1)

    shared_memory = {'pacman_last_pos': None}
    ghosts = []
    
    # Coins de la grille convertie
    corners = [(1, 1), (1, real_w-2), (real_h-2, 1), (real_h-2, real_w-2)]
    # Zones basées sur la grille convertie
    zones = [
        (real_h//4, real_w//4), (real_h//4, 3*real_w//4),
        (3*real_h//4, real_w//4), (3*real_h//4, 3*real_w//4)
    ]
    
    for i in range(4):
        start = corners[i]
        # Création des agents
        g = GhostAgent(start, id=i, strategy="collaborative")
        ghosts.append({'agent': g, 'zone': zones[i]})

    steps = 0
    success = False
    
    while steps < max_steps:
        steps += 1
        for g_data in ghosts:
            agent = g_data['agent']
            zone = g_data['zone']
            move = agent.get_next_move(grid, pacman_pos, shared_memory, zone)
            agent.position = move
            if agent.position == pacman_pos:
                success = True
                break
        if success: break

    return {"success": success, "steps": steps}

def run_campaign(strategy, iterations=50):
    print(f"\n Lancement campagne : {strategy.upper()} ({iterations} parties)...")
    results = []
    start_time = time.time()
    
    for i in range(iterations):
        if i % 10 == 0: print(".", end="", flush=True)
        # Taille plus petite pour tests rapides (15x15 donne une grille réelle de 31x31)
        if strategy == "squad":
            res = run_squad_simulation(15, 15)
        else:
            res = run_game_simulation(15, 15, strategy)
        results.append(res)
        
    total_time = time.time() - start_time
    print(" Terminé !")

    successes = [r for r in results if r['success']]
    nb_success = len(successes)
    win_rate = (nb_success / iterations) * 100
    
    avg_steps = 0
    if nb_success > 0:
        avg_steps = sum(r['steps'] for r in successes) / nb_success

    return {
        "strategy": strategy,
        "iterations": iterations,
        "win_rate": f"{win_rate}%",
        "avg_steps_on_success": round(avg_steps, 1),
        "total_time_sec": round(total_time, 2)
    }

if __name__ == "__main__":
    print("Démarrage du Benchmark Scientifique")
    print("====================================================================")
    
    N = 50
    stats_random = run_campaign("random", N)
    stats_bfs = run_campaign("bfs", N)
    stats_squad = run_campaign("squad", N)
    
    print("\n\n RAPPORT FINAL :")
    print(json.dumps([stats_random, stats_bfs, stats_squad], indent=2))
    
    print("\nCONCLUSION :")
    bfs_win = float(stats_bfs['win_rate'].strip('%'))
    squad_win = float(stats_squad['win_rate'].strip('%'))
    
    if bfs_win > 90:
        print("Correction réussie : Le BFS fonctionne enfin !")
    else:
        print("Attention : Le BFS a encore du mal, vérifiez la génération.")

    if squad_win >= bfs_win:
        print("La Squad est aussi efficace ou meilleure que le Solo.")
    
    if stats_squad['avg_steps_on_success'] > 0 and stats_bfs['avg_steps_on_success'] > 0:
        diff = stats_bfs['avg_steps_on_success'] - stats_squad['avg_steps_on_success']
        if diff > 0:
            print(f"PERFORMANCE : La Squad capture Pacman {diff} pas plus vite en moyenne !")