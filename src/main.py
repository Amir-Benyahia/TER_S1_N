# Fichier : main.py

# 1. On importe les outils depuis les autres fichiers
from maze_generator import *
from maze_tester import TesteurLabyrinthe
from maze_visualiser import *

# 2. Le bloc principal qui orchestre tout
if __name__ == "__main__":
    

    # --- PARAMÈTRES ---
    LARGEUR = 28
    HAUTEUR = 15
    NIVEAU_IMPERFECTION = 0.30
    
    # Nouveaux paramètres pour les tunnels
    NB_TUNNELS_HORIZONTAUX = 5
    NB_TUNNELS_VERTICAUX = 3 # Mettre à 1 ou plus pour des tunnels haut/bas

    # --- CHOIX DE L'ALGORITHME ---
    choix_generateur = "kruskal" # Changer pour "prim" pour tester l'autre

    generateurs = {
        "kruskal": GenerateurKruskal(),
        "prim": GenerateurPrim()
    }

    if choix_generateur not in generateurs:
        print(f"Erreur: Le générateur '{choix_generateur}' n'existe pas.")
    else:
        # 1. Instancier les classes
        generateur = generateurs[choix_generateur]
        imperfecteur = Imperfecteur()
        print(f"🚀 Génération avec l'algorithme de {choix_generateur.capitalize()}...")

        # 2. Générer le labyrinthe parfait
        labyrinthe_parfait, murs_restants = generateur.generer(LARGEUR, HAUTEUR)

        # 3. Rendre imparfait ET créer les tunnels
        print("🌀 Ajout d'imperfections et de tunnels...")
        labyrinthe_imparfait, tunnels_h, tunnels_v = imperfecteur.rendre_imparfait(
            labyrinthe_parfait, 
            murs_restants, 
            NIVEAU_IMPERFECTION,
            LARGEUR, HAUTEUR, # On passe maintenant largeur/hauteur
            NB_TUNNELS_HORIZONTAUX,
            NB_TUNNELS_VERTICAUX
        )
        grille = vers_grille_pixels(labyrinthe_imparfait, LARGEUR, HAUTEUR, tunnels_h, tunnels_v)
        
        print("\n=== GRILLE 0/1 ===")
        afficher_grille_pixels(grille)
        
        print("\n=== ASCII ===")
        print(ascii_depuis_grille(grille))
        
        afficher_grille(grille, sauvegarder_sous="best.png")
