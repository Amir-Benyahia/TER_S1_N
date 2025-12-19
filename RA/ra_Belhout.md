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

## Rapport d'activité — Jour 3

Résumé
------
J'ai recentré la journée sur la mise en place de la couche serveur et sur l'intégration front/back. L'objectif était de valider qu'Express peut servir de passerelle légère pour exposer les services de génération Python et d'en déduire une architecture propre pour la suite du projet.

Objectifs du jour
-----------------
- Valider l'utilisation d'Express comme couche web pour piloter la génération de labyrinthes.
- Définir un canal de communication fiable entre Express et les scripts Python existants.
- Structurer le projet selon un pattern MVC pour faciliter l'évolution des fonctionnalités (API REST, interface web interactive, etc.).

Travaux réalisés
----------------
1. Rédaction d'une note d'intention et présentation au groupe sur l'intérêt d'Express (rapidité de mise en place, familiarité de l'équipe, facilité de déploiement). Les arguments retenus : simplicité de la stack Node.js, middleware riche, réutilisation de compétences acquises en cours.
2. Conception d'un médiateur Express ↔ Python : choix d'une approche par exécution de scripts Python depuis Express dans un premier temps, avec la piste d'un canal HTTP local (Flask/FastAPI) si les performances deviennent un frein.
3. Élaboration et documentation de l'architecture MVC : découpage en `controllers/`, `services/`, `routes/` et `models/`, définition des responsabilités de chaque couche et des conventions de nommage.
4. Initialisation d'un squelette Express conforme à cette architecture (hello world contrôlé par `generationController`) et création des premiers fichiers (`routes`, `controllers`, `services`).
5. Refactoring du code existant pour isoler la logique de génération Python dans `services/mazeGeneration` et préparer la future orchestration par Express.


## Rapport d'activité — Jour 4

Résumé
------
Journée consacrée à l'amélioration de l'interface utilisateur et à la mise en place de l'intégration continue.

Travaux réalisés
----------------
1. Modification du layout front-end (UI/UX) pour afficher un labyrinthe graphique et non plus des 0s et 1s, en utilisant les Canvas HTML5 et un thème visuel unifié.
2. Mise en place d'un pipeline CI/CD pour le front-end avec GitHub Actions.
3. Ajout de tests automatisés pour le pipeline d'intégration continue.

---

## Rapport d'activité — Semaine 5 (13-14 Novembre 2025)

Résumé
------
Semaine dédiée à l'intégration de la base de données MongoDB et à la préparation de la présentation de mi-parcours.

Travaux réalisés
----------------
1. **Intégration MongoDB** :
   - Création du fichier de configuration `src/config/database.js` pour la connexion MongoDB.
   - Implémentation du modèle `Maze.js` avec schéma Mongoose pour stocker les labyrinthes générés.
   - Modification du contrôleur `generationController.js` pour persister les labyrinthes en base de données.
   - Mise à jour des routes et du fichier `.gitignore` pour les variables d'environnement.

2. **Présentation de mi-parcours** :
   - Préparation et push de la présentation.
   - Corrections multiples suite aux retours (présentation, contenu).

3. **Documentation** :
   - Mise à jour complète du `README.md` (+406 lignes) avec les instructions d'installation et d'utilisation.

---

## Rapport d'activité — Semaine 6 (28 Novembre 2025)

Résumé
------
Semaine de travail sur la branche `Seance_5`, principalement du work-in-progress et de la stabilisation.

Travaux réalisés
----------------
1. Travail en cours (WIP) sur la branche de développement.
2. Gestion des fichiers non suivis et indexation.
3. Préparation pour les prochaines fonctionnalités.

---

## Rapport d'activité — Semaine 7 (16 Décembre 2025)

Résumé
------
Semaine majeure de refactoring avec la migration vers l'architecture "PacLab" et le déploiement sur Render.

Travaux réalisés
----------------
1. **Migration PacLab** (co-réalisé avec Ahmed TAMANI et Amir BENYAHIA) :
   - Refactoring complet de l'architecture du projet.
   - Mise en place d'une nouvelle structure de fichiers plus modulaire.
   - Création du fichier `demo.html` pour les démonstrations.
   - Ajout du répertoire `data/trajectories/` pour stocker les trajectoires.

2. **Déploiement Render** :
   - Correction du déploiement : ajustement du `rootDir` pour éviter le double chemin `src/`.
   - Résolution des problèmes de chemins relatifs.

3. **Documentation** :
   - Création de `DEPLOYMENT.md` (guide de déploiement).
   - Création de `MONGODB_SETUP_GUIDE.md` (guide de configuration MongoDB).
   - Création de `PROJECT_SUMMARY.md` (résumé du projet).
   - Création de `SETUP.md` (instructions d'installation).
   - Fichiers `QUICK_START.txt` et `QUICK_MONGODB_SETUP.txt` pour démarrage rapide.

4. **CI/CD** :
   - Suppression de l'ancien workflow `render-cicd.yml`.
   - Création du nouveau workflow `test.yml` avec configuration ESLint.

5. **Interface utilisateur** :
   - Suppression des boutons "details" inutiles.
   - Modification des métriques affichées.

---

## Rapport d'activité — Semaine 8 (17 Décembre 2025)

Résumé
------
Journée intensive de corrections, d'améliorations UI et de stabilisation du pipeline CI/CD.

Travaux réalisés
----------------
1. **Corrections CI/CD (GitHub Actions + Jest)** :
   - Fix du workflow pour utiliser `src/package-lock.json`.
   - Correction de la configuration Jest : utilisation de `<rootDir>` pour trouver les tests.
   - Ajout de `src/node_modules` aux `moduleDirectories` de Jest.
   - Correction du chemin des tests vers `../tests/`.
   - Fix du chargement du fichier `.env`.

2. **Corrections Render** :
   - Modification du chemin `requirements.txt` pour utiliser `cd ..` au lieu de `../`.

3. **Améliorations Front-End** :
   - Ajout d'une page d'accueil (welcome page).
   - Nouveau design front-end (`commited new front`).
   - Modification des logos.
   - Configuration de la barre de navigation.
   - Amélioration de l'affichage des métriques.

4. **Corrections fonctionnelles** :
   - Fix du suivi du score et de la disparition des pellets.
   - Rectification des statistiques de simulation et de batches.

5. **Documentation** :
   - Condensation et réorganisation des fichiers de documentation.
   - Finalisations diverses.

---

## Rapport d'activité — Semaine 9 (18 Décembre 2025)

Résumé
------
Semaine finale dédiée à l'implémentation des algorithmes avancés de Pacman et à la documentation complète du projet.

Travaux réalisés
----------------
1. **Algorithmes d'IA Pacman** :
   - Implémentation de **Minimax** avec élagage alpha-beta (`minimax.py` - 190 lignes).
   - Implémentation de **Expectimax** pour la modélisation probabiliste des fantômes (`expectimax.py` - 200 lignes).
   - Implémentation de **Monte Carlo Tree Search (MCTS)** (`mcts.py` - 241 lignes).
   - Implémentation des **Influence Maps** pour le raisonnement spatial (`influence_map.py` - 157 lignes).
   - Création d'un script de démonstration `demo_advanced_ai.py` (245 lignes).

2. **Intégration Game Engine** :
   - Refactoring majeur de `game_engine.py` (+261 lignes) pour supporter les 8 algorithmes de Pacman.
   - Création d'une sauvegarde `game_engine_backup.py`.
   - Mise à jour de `__init__.py` pour exposer les nouveaux algorithmes.
   - Amélioration de `performance_metrics.py` avec les complexités des nouveaux algorithmes.

3. **Documentation API** :
   - `API_DOCUMENTATION.md` (925 lignes) - Documentation complète de l'API.
   - `API_ARCHITECTURE.md` (350 lignes) - Architecture de l'API.
   - `API_CURL_EXAMPLES.md` (458 lignes) - Exemples cURL.
   - `API_QUICK_REFERENCE.md` (167 lignes) - Référence rapide.
   - `API_QUICK_START_CARD.md` (244 lignes) - Carte de démarrage rapide.
   - `API_INDEX.md` (382 lignes) - Index de la documentation.
   - `API_DOCUMENTATION_SUMMARY.md` (349 lignes) - Résumé.
   - `Pacman_API.postman_collection.json` (428 lignes) - Collection Postman.

4. **Documentation Technique** :
   - `ADVANCED_AI_ALGORITHMS.md` (430 lignes) - Explication des algorithmes avancés.
   - `DECISION_DIAGRAMS.md` (544 lignes) - Diagrammes de décision.
   - `PACMAN_AI_CONFIGURATION.md` (364 lignes) - Guide de configuration des IA.
   - `RAPPORT_FINAL_PACMAN_DECISION_MAKING.md` (1093 lignes) - **Rapport final complet** sur la prise de décision Pacman.

5. **Assets visuels** :
   - Ajout de `a_star.gif` - Animation de l'algorithme A*.
   - Ajout de diagrammes de classes (`class_diag.webp`, `class_diag_1.webp`, `class_diag_2.webp`).
   - Ajout du diagramme de cas d'utilisation (`use_case_diag.webp`).

6. **Front-End** :
   - Mise à jour de `app.js` (+101 lignes) pour l'intégration des nouveaux algorithmes.
   - Amélioration de `components.css` pour le style des nouveaux composants.
   - Suppression temporaire de la welcome page.
   - Rectification des erreurs front-end.

7. **Mise à jour README** :
   - Extension majeure du README (+231 lignes) avec documentation des algorithmes et références API. 