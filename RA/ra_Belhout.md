## Rapport d'activité — Jour 1

J'ai eu un accident. Je dispose du justificatif. Je me sens bien maintenant👍.

## Rapport d'activité — Jour 2

Résumé
------
Aujourd'hui j'ai rattrapé du retard en lisant l'ensemble des slides (fichier "besoin.pdf") et plusieurs références sur la génération de labyrinthes. Ces lectures m'ont permis de clarifier la modélisation et d'implémenter la partie principale du module `maze_generator.py`, nottament:

- https://www.astrolog.org/labyrnth/algrithm.htm
- Article : "Randomized Pacman maze generation algorithm"

Rôle
-------------------
- Responsable du generation du maze.
- Objectif : concevoir une représentation interne claire du labyrinthe, implémenter au moins deux algorithmes de génération parfaite (Kruskal, Prim ...), puis ajouter un composant permettant de rendre le labyrinthe "imparfait" (ajout de boucles, tunnels ...).

Travaux réalisés
----------------
1. Lecture et synthèse de la littérature pour comprendre et choisir des approches éprouvées (Kruskal, Prim).
2. Conception d'une représentation compacte du labyrinthe adaptée à la génération et à la visualisation.
3. Implémentation d'une architecture modulaire :
	- une classe abstraite `Generateur` (interface commune),
	- `GenerateurKruskal` et `GenerateurPrim` (implémentations concrètes),
	- un `Imperfecteur` pour ajouter des boucles et des tunnels (une sorte de boucle aussi).
4. Ajout d'une fonction de visualisation (`afficher_labyrinthe`) pour rendre le résultat lisible en console.

Modélisation des données
------------------------
Représentation choisie : une structure en "pseudo-matrice" composée de listes de booléens (True = mur présent, False = ouverture).

- Pour un labyrinthe de largeur W (nombre de cellules par ligne) et hauteur H (nombre de cellules par colonne) :
  - la structure contient 2*H - 1 lignes.
  - les lignes d'indice pair (0, 2, 4, ...) représentent les murs horizontaux entre cellules. Chaque ligne paire contient W-1 entrées (murs entre cellules adjacentes horizontalement).
  - les lignes d'indice impair (1, 3, 5, ...) représentent les murs verticaux entre rangées de cellules. Chaque ligne impaire contient W entrées (murs verticaux pour chaque colonne).

Exemple :
- W = 4, H = 3 => nombre de lignes = 5 ; les lignes 0,2,4 ont 3 éléments (W-1) ; les lignes 1 et 3 ont 4 éléments (W).

Cette représentation est compacte et permet une conversion simple vers une sortie ASCII (fonction `afficher_labyrinthe`) et vers le visualiseur finale.

Architecture du code
--------------------
- `Generateur` (classe abstraite) : interface commune avec la méthode `generer(largeur, hauteur)` qui retourne `(labyrinthe, murs_restants)`.
- `GenerateurKruskal` : implémentation basée sur Union-Find ; construit une liste de murs internes et casse ceux qui joignent des composantes différentes.
- `GenerateurPrim` : implémentation basée sur une frontière de murs aléatoire ; casse les murs qui relient une cellule visitée et une cellule non visitée.
- `Imperfecteur` : prend un labyrinthe parfait et casse aléatoirement certains murs restants pour créer des cycles ; peut aussi ajouter des "tunnels" symétriques en haut/bas ou à gauche/droite.
- `afficher_labyrinthe` : convertit la représentation booléenne en dessin ASCII (avec ouverture de tunnels si demandés).

Détails techniques importants
---------------------------
- L'implémentation de Kruskal utilise une structure `UnionFind` pour garantir la création d'un arbre couvrant sans cycles.
- Pour Prim, la frontière est maintenue comme une liste de murs candidates choisies aléatoirement.
- Le module renvoie également `murs_restants` : utile pour l'ajout contrôlé d'imperfections (on casse un pourcentage de ces murs).

Limitations et décisions en suspens
----------------------------------
- Représentation : j'ai testé plusieurs variantes (par ex. utiliser uniquement des listes de longueur uniforme) mais j'ai conservé la représentation décrite ci-dessus car elle est claire et correspond bien aux algorithmes.
- Critères de comparaison des générateurs : il faut définir des métriques (temps d'exécution, longueur moyenne des couloirs, nombre de cycles générés après imperfection) pour construire un "leaderboard" fiable pour m'aider a choisir la strategie de generation selon les different parametres.
