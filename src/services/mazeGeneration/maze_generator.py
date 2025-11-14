import random
from abc import ABC, abstractmethod


class UnionFind:
    """Outil nécessaire pour l'algorithme de Kruskal."""
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            if self.size[root_i] < self.size[root_j]:
                root_i, root_j = root_j, root_i
            self.parent[root_j] = root_i
            self.size[root_i] += self.size[root_j]
            return True
        return False

# --- CLASSE DE BASE POUR LES GÉNÉRATEURS ---

class Generateur(ABC):
    """
    Classe de base abstraite pour tous les générateurs de labyrinthe.
    Elle définit une interface commune que tous les générateurs doivent respecter.
    """
    @abstractmethod
    def generer(self, largeur, hauteur):
        """
        Doit retourner un tuple :
        - Le labyrinthe (liste de listes de booléens).
        - La liste des murs restants (non cassés).
        """
        pass

# --- IMPLÉMENTATIONS DES GÉNÉRATEURS ---

class GenerateurKruskal(Generateur):
    def generer(self, largeur, hauteur):
        # Initialise le labyrinthe avec tous les murs
        labyrinthe = []
        for y in range(2 * hauteur - 1):
            labyrinthe.append([True] * (largeur - 1 if y % 2 == 0 else largeur))

        murs = []
        for y in range(hauteur):
            for x in range(largeur):
                if x < largeur - 1: murs.append(((y, x), 'H'))
                if y < hauteur - 1: murs.append(((y, x), 'V'))
        random.shuffle(murs)

        uf = UnionFind(largeur * hauteur)
        murs_restants = []

        for (y, x), type_mur in murs:
            cell_idx1 = y * largeur + x
            cell_idx2 = y * largeur + (x + 1) if type_mur == 'H' else (y + 1) * largeur + x

            if uf.union(cell_idx1, cell_idx2):
                if type_mur == 'H': labyrinthe[2 * y][x] = False
                else: labyrinthe[2 * y + 1][x] = False
            else:
                murs_restants.append(((y, x), type_mur))

        return labyrinthe, murs_restants

class GenerateurPrim(Generateur):
    def generer(self, largeur, hauteur):
        # Initialise le labyrinthe avec tous les murs
        labyrinthe = []
        for y in range(2 * hauteur - 1):
            labyrinthe.append([True] * (largeur - 1 if y % 2 == 0 else largeur))

        cellules_visitees = set()
        murs_frontiere = []
        murs_restants = []

        start_y, start_x = random.randint(0, hauteur - 1), random.randint(0, largeur - 1)
        cellules_visitees.add((start_y, start_x))

        for dy, dx, type_mur in [(0, 1, 'H'), (0, -1, 'H'), (1, 0, 'V'), (-1, 0, 'V')]:
            ny, nx = start_y + dy, start_x + dx
            if 0 <= ny < hauteur and 0 <= nx < largeur:
                # La position du mur dépend de la direction
                if type_mur == 'H': wall_y, wall_x = start_y, min(start_x, nx)
                else: wall_y, wall_x = min(start_y, ny), start_x
                murs_frontiere.append(((wall_y, wall_x), type_mur))

        while murs_frontiere:
            (y, x), type_mur = random.choice(murs_frontiere)
            murs_frontiere.remove(((y, x), type_mur))

            # Déterminer les deux cellules que le mur sépare
            if type_mur == 'H':
                cell1, cell2 = (y, x), (y, x + 1)
            else: # 'V'
                cell1, cell2 = (y, x), (y + 1, x)

            # Si une seule des deux cellules a été visitée
            if (cell1 in cellules_visitees) ^ (cell2 in cellules_visitees):
                # Casser le mur
                if type_mur == 'H': labyrinthe[2*y][x] = False
                else: labyrinthe[2*y+1][x] = False
                
                # Ajouter la nouvelle cellule au labyrinthe et ses murs à la frontière
                nouvelle_cellule = cell2 if cell1 in cellules_visitees else cell1
                cellules_visitees.add(nouvelle_cellule)
                
                ny, nx = nouvelle_cellule
                for dy, dx, new_type in [(0, 1, 'H'), (0, -1, 'H'), (1, 0, 'V'), (-1, 0, 'V')]:
                    nny, nnx = ny + dy, nx + dx
                    if 0 <= nny < hauteur and 0 <= nnx < largeur:
                        if new_type == 'H': wall_y, wall_x = ny, min(nx, nnx)
                        else: wall_y, wall_x = min(ny, nny), nx
                        murs_frontiere.append(((wall_y, wall_x), new_type))
            else:
                 murs_restants.append(((y, x), type_mur))
        
        return labyrinthe, murs_restants


# --- CLASSE POUR RENDRE LE LABYRINTHE IMPARFAIT ---

class Imperfecteur:

    def _creer_tunnels_symetriques(self, largeur, hauteur, nb_h, nb_v):
        """Choisit aléatoirement des emplacements pour les tunnels."""
        lignes_possibles = list(range(hauteur))
        colonnes_possibles = list(range(largeur))
        
        nb_h = min(nb_h, hauteur)
        nb_v = min(nb_v, largeur)

        tunnels_h = random.sample(lignes_possibles, nb_h)
        tunnels_v = random.sample(colonnes_possibles, nb_v)

        return set(tunnels_h), set(tunnels_v)

    def rendre_imparfait(self, labyrinthe, murs_restants, niveau_imperfection, largeur, hauteur, nb_tunnels_horizontaux=1, nb_tunnels_verticaux=0):
        """Rend le labyrinthe imparfait ET y ajoute des tunnels symétriques."""
        # Autoriser deux formats pour niveau_imperfection :
        # - fraction entre 0.0 et 1.0 (ex. 0.3)
        # - pourcentage entier/float > 1 (ex. 30 ou 30.0)
        if niveau_imperfection is None:
            niveau_imperfection = 0
        if niveau_imperfection > 1:
            niveau_imperfection = float(niveau_imperfection) / 100.0

        # Calculer le nombre de murs à casser en garantissant une borne valide
        nb_murs_a_casser = int(len(murs_restants) * niveau_imperfection)
        # Si l'utilisateur demande une imperfection non nulle mais que l'arrondi donne 0,
        # casser au moins un mur si des murs existent.
        if niveau_imperfection > 0 and nb_murs_a_casser == 0 and len(murs_restants) > 0:
            nb_murs_a_casser = 1

        # S'assurer que k pour random.sample est dans les bornes [0, len(murs_restants)]
        nb_murs_a_casser = max(0, min(nb_murs_a_casser, len(murs_restants)))

        if nb_murs_a_casser > 0:
            murs_a_casser = random.sample(murs_restants, nb_murs_a_casser)
            for (y, x), type_mur in murs_a_casser:
                if type_mur == 'H':
                    labyrinthe[2 * y][x] = False
                else: # 'V'
                    labyrinthe[2 * y + 1][x] = False
        
        tunnels_h, tunnels_v = self._creer_tunnels_symetriques(
            largeur, hauteur, nb_tunnels_horizontaux, nb_tunnels_verticaux
        )
        
        return labyrinthe, tunnels_h, tunnels_v

# --- FONCTION D'AFFICHAGE ET EXÉCUTION PRINCIPALE ---

def afficher_labyrinthe(labyrinthe, largeur, hauteur, tunnels_h=set(), tunnels_v=set()):
    """Fonction utilitaire pour visualiser le labyrinthe, incluant les tunnels."""
    # Ligne supérieure
    ligne_haut = "+"
    for x in range(largeur):
        # Si la colonne x a un tunnel vertical, on dessine une ouverture
        ligne_haut += ("   " if x in tunnels_v else "---") + "+"
    print(ligne_haut)

    for y in range(hauteur):
        # Murs verticaux (côtés)
        # Si la ligne y a un tunnel horizontal, on dessine une ouverture
        ligne = (" " if y in tunnels_h else "|")
        for x in range(largeur):
            mur_h = labyrinthe[2*y][x] if x < largeur - 1 else True
            ligne += "   " + ("|" if mur_h else " ")
        # Remplacer le dernier mur par une ouverture si nécessaire
        if y in tunnels_h:
            ligne = ligne[:-1] + " "
        print(ligne)

        # Murs horizontaux (bas)
        if y < hauteur - 1:
            ligne_bas = "+"
            for x in range(largeur):
                mur_v = labyrinthe[2*y+1][x]
                ligne_bas += ("---" if mur_v else "   ") + "+"
            print(ligne_bas)

    # Ligne inférieure
    ligne_basse = "+"
    for x in range(largeur):
        # Si la colonne x a un tunnel vertical, on dessine une ouverture
        ligne_basse += ("   " if x in tunnels_v else "---") + "+"
    print(ligne_basse)
def generateMaze():
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
        return labyrinthe_imparfait
    
def printMazeArray(labyrinthe):

    # Convertir en chaînes '1'/'0'
    rows = [[('1' if cell else '0') for cell in row] for row in labyrinthe]
    if not rows:
        print("(vide)")
        return

    # Déterminer la largeur maximale d'une colonne (ici éléments sont '0' ou '1')
    # mais on calcule par sécurité pour garder l'alignement si la représentation change.
    max_width = 1
    for r in rows:
        for c in r:
            if len(c) > max_width:
                max_width = len(c)

    # Imprimer chaque ligne en alignant les colonnes
    for r in rows:
        print(" ".join(c.rjust(max_width) for c in r))
if __name__ == "__main__":
    import sys
    import json
    
    # Mode API : arguments en ligne de commande (largeur hauteur)
    # Mode Normal : utilise les valeurs par défaut
    if len(sys.argv) >= 3:
        # Mode API : appelé depuis Node.js avec arguments
        try:
            LARGEUR = int(sys.argv[1])
            HAUTEUR = int(sys.argv[2])
            MODE_API = True
        except ValueError:
            print(json.dumps({"error": "Arguments invalides"}), file=sys.stderr)
            sys.exit(1)
    else:
        # Mode Normal : test local
        LARGEUR = 28
        HAUTEUR = 15
        MODE_API = False
    
    # Paramètres par défaut (moyen)
    NIVEAU_IMPERFECTION = 0.40
    NB_TUNNELS_HORIZONTAUX = 5
    NB_TUNNELS_VERTICAUX = 3
    
    # --- CHOIX DE L'ALGORITHME ---
    choix_generateur = "kruskal"

    generateurs = {
        "kruskal": GenerateurKruskal(),
        "prim": GenerateurPrim()
    }

    if choix_generateur not in generateurs:
        if MODE_API:
            print(json.dumps({"error": f"Générateur '{choix_generateur}' inconnu"}), file=sys.stderr)
            sys.exit(1)
        else:
            print(f"Erreur: Le générateur '{choix_generateur}' n'existe pas.")
    else:
        # 1. Instancier les classes
        generateur = generateurs[choix_generateur]
        imperfecteur = Imperfecteur()
        
        if not MODE_API:
            print(f"🚀 Génération avec l'algorithme de {choix_generateur.capitalize()}...")

        # 2. Générer le labyrinthe parfait
        labyrinthe_parfait, murs_restants = generateur.generer(LARGEUR, HAUTEUR)

        # 3. Rendre imparfait ET créer les tunnels
        if not MODE_API:
            print("🌀 Ajout d'imperfections et de tunnels...")
        
        labyrinthe_imparfait, tunnels_h, tunnels_v = imperfecteur.rendre_imparfait(
            labyrinthe_parfait, 
            murs_restants, 
            NIVEAU_IMPERFECTION,
            LARGEUR, HAUTEUR,
            NB_TUNNELS_HORIZONTAUX,
            NB_TUNNELS_VERTICAUX
        )

        # 4. Calculer les métriques avec le TesteurLabyrinthe
        import os
        # Ajouter le répertoire racine au path pour permettre l'import de test.maze_tester
        sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))
        from test.maze_tester import TesteurLabyrinthe
        
        testeur = TesteurLabyrinthe(labyrinthe_imparfait, LARGEUR, HAUTEUR)
        metriques = testeur.qualifier()
        
        # 5. Sortie selon le mode
        if MODE_API:
            # Mode API : retourner du JSON pour Node.js avec les métriques
            resultat = {
                'labyrinthe': labyrinthe_imparfait,
                'largeur': LARGEUR,
                'hauteur': HAUTEUR,
                'nb_lignes': len(labyrinthe_imparfait),
                'murs_restants': len(murs_restants),
                'niveau_imperfection': NIVEAU_IMPERFECTION,
                'tunnels_horizontaux': NB_TUNNELS_HORIZONTAUX,
                'tunnels_verticaux': NB_TUNNELS_VERTICAUX,
                'metriques': metriques  # Métriques calculées (incluant score de difficulté)
            }
            print(json.dumps(resultat))
        else:
            # Mode Normal : affichage visuel
            print("✅ Labyrinthe final généré :")
            afficher_labyrinthe(labyrinthe_imparfait, LARGEUR, HAUTEUR, tunnels_h, tunnels_v)
