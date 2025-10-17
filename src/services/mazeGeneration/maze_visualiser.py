"""
Visualisation de labyrinthes.
Transforme un labyrinthe en represetation graphique et en ASCII.
0 = couloir, 1 = mur
"""

import sys

try:
    import numpy as np
except ImportError:
    np = None


def _verifier_format(labyrinthe, largeur, hauteur):
    #Vérifie que le labyrinthe est au bon format (liste de listes de booléens).
    assert labyrinthe is not None, "labyrinthe est None"
    assert len(labyrinthe) == 2 * hauteur - 1, \
        f"le labyrinthe doit avoir {2 * hauteur - 1} lignes"
    
    for i, ligne in enumerate(labyrinthe):
        attendu = (largeur - 1) if (i % 2 == 0) else largeur
        assert len(ligne) == attendu, \
            f"ligne {i} : longueur attendue {attendu}, obtenue {len(ligne)}"


def vers_grille_pixels(labyrinthe, largeur, hauteur, tunnels_h=set(), tunnels_v=set()):
    #Transforme le labyrinthe en grille de pixels avec des bordures.

    _verifier_format(labyrinthe, largeur, hauteur)
    
    H_grand = 2 * hauteur + 1
    L_grand = 2 * largeur + 1
    
    # Créer une grille remplie de murs (1)
    grille = np.ones((H_grand, L_grand), dtype=int) if np else [[1] * L_grand for _ in range(H_grand)]
    
    # Placer les couloirs et les passages
    for y in range(hauteur):
        for x in range(largeur):
            # Centre de chaque cellule = couloir
            if np:
                grille[2 * y + 1, 2 * x + 1] = 0
            else:
                grille[2 * y + 1][2 * x + 1] = 0
            
            # Passage horizontal (droite) si le mur est cassé
            if x < largeur - 1 and not labyrinthe[2 * y][x]:
                if np:
                    grille[2 * y + 1, 2 * x + 2] = 0
                else:
                    grille[2 * y + 1][2 * x + 2] = 0
            
            # Passage vertical (bas) si le mur est cassé
            if y < hauteur - 1 and not labyrinthe[2 * y + 1][x]:
                if np:
                    grille[2 * y + 2, 2 * x + 1] = 0
                else:
                    grille[2 * y + 2][2 * x + 1] = 0
    
    # Ajouter les tunnels horizontaux (traversent tout le labyrinthe)
    for y in tunnels_h:
        if 0 <= y < hauteur:
            if np:
                grille[2 * y + 1, :] = 0
            else:
                grille[2 * y + 1] = [0] * L_grand
    
    # Ajouter les tunnels verticaux (traversent tout le labyrinthe)
    for x in tunnels_v:
        if 0 <= x < largeur:
            if np:
                grille[:, 2 * x + 1] = 0
            else:
                for r in range(H_grand):
                    grille[r][2 * x + 1] = 0
    
    return grille


def afficher_grille_pixels(grille):
    #Affiche la grille de pixels (0/1) dans la console.

    if np and isinstance(grille, np.ndarray):
        for ligne in grille:
            print(" ".join(str(int(v)) for v in ligne))
    else:
        for ligne in grille:
            print(" ".join(str(int(v)) for v in ligne))


def ascii_depuis_grille(grille):
    #Dessine le labyrinthe avec des caractères (+, -, |).

    est_np = np and isinstance(grille, np.ndarray)
    H_grand = grille.shape[0] if est_np else len(grille)
    L_grand = grille.shape[1] if est_np else len(grille[0])
    hauteur = (H_grand - 1) // 2
    largeur = (L_grand - 1) // 2
    
    def g(r, c):
        return grille[r, c] if est_np else grille[r][c]
    
    lignes = []
    
    haut = "+"
    for x in range(largeur):
        haut += "   " if g(0, 2 * x + 1) == 0 else "---"
        haut += "+"
    lignes.append(haut)
    
    for y in range(hauteur):
        ligne = ""
        for x in range(largeur):
            ligne += " " if g(2 * y + 1, 2 * x) == 0 else "|"
            ligne += "   "
        ligne += " " if g(2 * y + 1, 2 * largeur) == 0 else "|"
        lignes.append(ligne)
        
        if y < hauteur - 1:
            sep = "+"
            for x in range(largeur):
                sep += "   " if g(2 * y + 2, 2 * x + 1) == 0 else "---"
                sep += "+"
            lignes.append(sep)
    
    bas = "+"
    for x in range(largeur):
        bas += "   " if g(H_grand - 1, 2 * x + 1) == 0 else "---"
        bas += "+"
    lignes.append(bas)
    
    return "\n".join(lignes)


def afficher_grille(grille, sauvegarder_sous=None):
    #Affiche le labyrinthe en style Pac-Man (noir et bleu).
    
    import matplotlib.pyplot as plt
    from matplotlib.colors import ListedColormap
    
    arr = np.array(grille, dtype=int) if (np and not isinstance(grille, np.ndarray)) else grille

    # Palette Pac-Man : noir pour passages, bleu foncé pour murs
    couleurs_pacman = ['#000000', '#1B1B7D']
    cmap_pacman = ListedColormap(couleurs_pacman)
    
    taille_fig = (max(6, arr.shape[1] * 0.15), max(6, arr.shape[0] * 0.15))
    fig, ax = plt.subplots(figsize=taille_fig, facecolor='#000000')
    
    ax.imshow(arr, cmap=cmap_pacman, interpolation='nearest')
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_aspect('equal')
    
    # Supprimer les bordures blanches
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    
    if sauvegarder_sous:
        plt.savefig(sauvegarder_sous, dpi=150, bbox_inches='tight', 
                    pad_inches=0, facecolor='#000000')
        print(f"Image sauvegardée : {sauvegarder_sous}")
    
    plt.show()


if __name__ == "__main__":
    from maze_generator import GenerateurKruskal, Imperfecteur
    
    LARGEUR, HAUTEUR = 28, 15
    
    gen = GenerateurKruskal()
    imp = Imperfecteur()
    
    lab_par, murs_rest = gen.generer(LARGEUR, HAUTEUR)
    lab_imp, tunnels_h, tunnels_v = imp.rendre_imparfait(
        lab_par, murs_rest, 0.3, LARGEUR, HAUTEUR, 2, 1
    )
    
    grille = vers_grille_pixels(lab_imp, LARGEUR, HAUTEUR, tunnels_h, tunnels_v)
    
    print("\n=== GRILLE 0/1 ===")
    afficher_grille_pixels(grille)
    
    print("\n=== ASCII ===")
    print(ascii_depuis_grille(grille))
    
    afficher_grille(grille, sauvegarder_sous="best.png")