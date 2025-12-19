# Rapport d’activité – Jour 1

Aujourd’hui, j’ai :
- Créé le dépôt GitHub privé du projet
- Mis en place la structure (README, RA, mazes.md)
- Exploré les documents de référence (Mazes for Programmers, slides du projet)

# Rapport d'activité – Jour 2
Aujourd'hui, mon objectif était de coder le module de test (Testeur) pour analyser les labyrinthes.

J'ai commencé par implémenter les fonctionnalités de base dans la classe TesteurLabyrinthe :

Un test de connexité avec un parcours BFS pour vérifier que le labyrinthe est bien une seule zone jouable, sans îles isolées.

Des tests pour la symétrie horizontale et verticale.

Ensuite, le plus gros travail a été d'adapter le testeur au nouveau générateur de mon camarade. Le format des données était complètement différent (une liste de murs au lieu d'une grille simple), donc mes tests ne fonctionnaient plus.

Pour résoudre ce problème, j'ai dû coder une fonction de conversion (_convertir_en_grille) qui "traduit" le labyrinthe pour que mes tests puissent fonctionner dessus.

Le code final est dans le fichier maze_tester.py, et il est maintenant compatible avec le générateur principal de l'équipe.

# Rapport d'activité — Jour 3  

Objectif du jour :  
Finaliser et valider la communication entre le serveur Express.js et le script Python, afin d’obtenir un flux complet de génération de labyrinthes côté backend.


Travail effectué :  

1. Refactorisation du contrôleur (`generationController.js`)  
   - Analyse et réécriture du contrôleur pour le rendre asynchrone et plus robuste.  
   - Suppression du code de communication directe avec Python (`child_process.spawn`) au profit d’un service dédié (`pythonBridge.js`).  
   - Ajout de logs détaillés pour suivre le déroulement complet du processus côté serveur.  

2. Gestion des retours et erreurs Python  
   - Mise en place d’un système centralisé de capture des erreurs (`stderr`).  
   - Envoi d’une réponse HTTP 500 avec message explicite en cas d’échec du script Python.  
   - Vérification et parsing des données JSON renvoyées par Python avant leur traitement.  

3. Validation et standardisation des réponses Express 
   - Vérification du format JSON avant envoi au client, avec gestion d’erreurs via `try/catch`.  
   - Mise en place d’un format de réponse unifié (succès/erreur) pour faciliter l’intégration front-end.  
   - Contrôle des statuts HTTP : `200` pour succès, `400` pour erreur de paramètre, `500` pour erreur interne.  

4. Tests et validation du flux complet 
   - Tests réalisés avec différentes tailles de labyrinthes pour vérifier la stabilité du service.  
   - Validation du comportement du serveur après exécution du script Python.  
   - Vérification de la cohérence des logs et du respect des statuts HTTP attendus.
  

## Rapport d’activité – Jour 4

Aujourd'hui, j’ai :
- Corrigé l'imperfecteur (`src/services/mazeGeneration/maze_generator.py`) : normalisation du paramètre (fraction ou %), conversion %→fraction, garantie d'au moins 1 mur cassé et protection des appels à random.sample.
- Ajouté un test local `test/run_generator_test.py` qui vérifie automatiquement que l'imperfecteur augmente le nombre de murs cassés (ex. 419 → 532 sur une exécution).
- Ajusté l'UI (`src/index.html`) : inversion des couleurs pour une inspection visuelle plus claire (murs `#171c85`, couloirs `#040404`).
- Validé le flux local Node → Python → front ; commits locaux puis push après synchronisation avec le dépôt distant.


Résultat :  
La communication entre Express et Python est désormais fonctionnelle, claire et maintenable.  
Le contrôleur `generationController.js`, associé au service `pythonBridge.js`, constitue une base solide pour la suite du projet et le futur déploiement du web service REST.

## Rapport d'activité – Jour 5

Aujourd'hui, j'ai :

- Étendu le module de test (`test/maze_tester.py`) avec 10 métriques d'évaluation des labyrinthes :
  - Métriques existantes : ratio de jouabilité, symétrie horizontale/verticale
  - Nouvelles métriques : nombre de culs-de-sac, nombre d'intersections, densité de murs, longueur du chemin le plus long, score de difficulté (0-10), distance moyenne entre intersections (mesure le rythme du jeu), culs-de-sac sûrs (zones de refuge stratégiques)
  - Algorithmes utilisés : BFS pour explorer le graphe du labyrinthe et calculer les distances maximales

- Intégré les métriques dans le générateur Python (`src/services/mazeGeneration/maze_generator.py`) :
  - Import dynamique du testeur via ajustement du `sys.path`
  - Calcul automatique des métriques après génération
  - Enrichissement du JSON retourné avec le champ `metriques`
  - Création de `test/__init__.py` pour rendre le module importable

- Créé un système de notation par étoiles dans l'interface (`src/index.html`) :
  - Section de notation affichée après génération du labyrinthe
  - 5 étoiles cliquables (1-5) pour que l'utilisateur évalue la difficulté perçue
  - Fonction `rateLabyrinthe()` avec feedback visuel (étoiles dorées + message de confirmation)
  - CSS interactif : effet hover, transitions fluides

- Amélioré l'affichage des métriques :
  - Section `#metricsContainer` avec grille responsive
  - Coloration conditionnelle : vert (bon), orange (moyen), rouge (problématique)
  - Logique spécifique pour chaque métrique (ex: distance intersections idéale = 4-6 cases)

- Testé et validé :
  - Tests en ligne de commande : génération avec différentes tailles
  - Vérification du JSON retourné (10 métriques présentes)
  - Validation de l'affichage dans l'interface web

Résultat :  
Le système d'évaluation et de notation est opérationnel. L'utilisateur peut générer un labyrinthe, consulter 10 métriques détaillées, et noter sa difficulté perçue. L'architecture est prête pour stocker ces données dans MongoDB et analyser la corrélation entre métriques calculées et notes utilisateurs.


## Rapport d'activité – Jour 6
Aujourd'hui, j'ai :

- Développé le système d'Agents Fantômes (src/services/mazeGeneration/agents.py) :
   - Création de la classe GhostAgent définissant le comportement des entités autonomes
   - Implémentation de la stratégie de base "Random" pour servir de référence (baseline)
   - Implémentation de la stratégie intelligente "BFS Réactif" (Breadth-First Search) qui recalcule le chemin optimal vers la cible à chaque tour

- Créé un Framework de Benchmark (src/services/mazeGeneration/benchmark.py) :
   - Conception d'un script de simulation "headless" (sans interface graphique)
   - Mise en place d'une boucle de jeu virtuelle pour mesurer la performance des algorithmes
   - Collecte de métriques brutes : succès de l'interception et nombre de pas effectués

- Résolu un problème critique de navigation :
   - Identification d'une incompatibilité entre le format de données du générateur (murs compressés) et la vision des agents
   - Développement de la fonction utilitaire convert_to_matrix pour transformer le labyrinthe abstrait en une grille de navigation matricielle (0 = chemin, 1 = mur)
   - Correction validée : le taux de succès du BFS est passé de 0% (bloqué) à 100%

Résultat :
Les "cerveaux" des fantômes sont opérationnels. Ils sont capables de percevoir l'environnement correctement grâce au convertisseur matriciel et de naviguer vers une cible. Le framework de test est prêt pour l'analyse comparative.


## Rapport d'activité – Jour 7
Aujourd'hui, j'ai :

- Implémenté l'Intelligence Collaborative "Squad" (src/services/mazeGeneration/agents.py) :
   - Développement d'une stratégie de groupe divisant le terrain en 4 quadrants de patrouille distincts
   - Mise en place d'une mémoire partagée (shared_memory) permettant aux fantômes de communiquer la position de Pac-Man instantanément
   - Logique de comportement hybride : Patrouille de zone puis Chasse coordonnée lors de la détection

- Conduit une campagne de validation scientifique (src/services/mazeGeneration/benchmark.py) :
   - Extension du benchmark pour exécuter des campagnes statistiques (batchs de 50 parties)
   - Comparaison des performances : Random vs BFS Solo vs Squad Collaborative
   - Validation des résultats : la stratégie d'équipe capture la cible environ 25% plus rapidement (en nombre de pas) que l'agent seul

- Intégré l'IA au serveur Node.js (src/services/pythonBridge.js & src/controllers/aiController.js) :
    - Création du script passerelle ai_bridge.py pour gérer les entrées/sorties en JSON standardisé
    - Ajout de la route API POST /move permettant à l'interface graphique d'interroger l'IA tour par tour
    - Sécurisation des échanges de données (gestion des types booléens/entiers entre JS et Python)

Résultat :
L'intelligence artificielle est entièrement connectée au projet global. L'API est prête à être consommée par l'interface utilisateur pour animer les fantômes. La supériorité de l'approche collaborative a été démontrée et quantifiée via le framework de benchmark.

---

## Rapport d'activité – Jour 8

Aujourd'hui, j'ai :

- **Corrigé les problèmes de CI/CD et Jest** :
   - Résolution du problème de chemin Jest en mettant à jour la configuration pour utiliser `<rootDir>`
   - Correction du workflow GitHub Actions pour utiliser `src/package-lock.json`
   - Ajustement des chemins de tests vers `../tests/` pour correspondre à la nouvelle structure
   - Fix du chargement du fichier `.env` dans les tests

- **Correction du déploiement Render** :
   - Modification du chemin `requirements.txt` pour utiliser `cd ..` au lieu de `../`
   - Validation du pipeline de déploiement automatisé

- **Collaboration sur l'architecture PacLab** (avec Ahmed TAMANI et Belhout) :
   - Participation à la migration complète vers l'architecture modulaire PacLab
   - Restructuration des fichiers et dossiers pour une meilleure organisation
   - Mise en place de la nouvelle structure `data/trajectories/`
   - Création du fichier `demo.html` pour les démonstrations

- **Documentation** :
   - Contribution aux guides de déploiement et de configuration
   - Validation des instructions d'installation

Résultat :  
L'infrastructure CI/CD est désormais stable avec des tests automatisés fonctionnels. Le déploiement Render est opérationnel et la nouvelle architecture PacLab est en place pour supporter les futures évolutions.

---

## Rapport d'activité – Jour 9

Aujourd'hui, j'ai :

- **Amélioration de l'IA des fantômes** :
   - Implémentation de comportements différenciés pour les 4 fantômes (Blinky, Pinky, Inky, Clyde)
   - Chaque fantôme possède désormais sa propre personnalité et stratégie de chasse :
     * **Blinky (Rouge)** : Chasseur agressif qui poursuit directement Pacman
     * **Pinky (Rose)** : Stratège qui anticipe la position future de Pacman (4 cases devant)
     * **Inky (Cyan)** : Embusqueur qui utilise Blinky comme référence pour des attaques coordonnées
     * **Clyde (Orange)** : Patrouilleur timide qui alterne entre chasse et fuite selon la distance
   
- **Corrections de bugs critiques** :
   - Fix du problème de spawn des fantômes dans les murs
   - Correction de l'affichage des fantômes superposés (système de décalage visuel)
   - Amélioration du suivi de direction de Pacman avec historique des mouvements
   - Gestion améliorée des collisions et détections

- **Amélioration du moteur de jeu** (`game_engine.py`) :
   - Intégration des nouvelles personnalités de fantômes dans le moteur de simulation
   - Ajout de la logique de comportement spécifique pour chaque fantôme
   - Amélioration de la synchronisation des mouvements

- **Mise à jour de l'interface de visualisation** :
   - Amélioration de `SimulationViewer.js` pour afficher les comportements différenciés
   - Mise à jour de `MazeCanvas.js` pour la gestion visuelle des fantômes superposés
   - Amélioration de l'animation et du rendu des entités

- **Documentation technique** :
   - Création de `GHOST_AI_README.md` documentant :
     * Les algorithmes de chaque fantôme
     * Les stratégies de poursuite et d'embuscade
     * Les paramètres de configuration
     * Les diagrammes de comportement

- **Mise à jour du README** :
   - Amélioration de la documentation générale du projet
   - Correction du formatage de la liste des membres du groupe
   - Ajout de références aux nouvelles fonctionnalités IA

Résultat :  
Les fantômes possèdent désormais des comportements distincts et réalistes, rendant le jeu plus stratégique et imprévisible. L'IA est complètement fonctionnelle avec 4 personnalités différenciées validées. La documentation technique permet une compréhension approfondie des algorithmes implémentés.

---

## Rapport d'activité – Jour 10

Aujourd'hui, j'ai :

- **Développement du système de comparaison par batches** :
   - Création d'un système complet d'expérimentation et de benchmarking dans le dossier `experiments/`
   - Architecture modulaire avec 10+ scripts Python spécialisés pour différents aspects de l'analyse

- **Scripts de génération de batches** :
   - `batch_runner.py` : Générateur de batches de simulations avec support des IA Pacman vs algorithmes fantômes
   - `create_batch_with_sims.py` : Création de batches avec simulations réelles via l'API REST
   - `benchmark_runner.py` : Exécution de campagnes de benchmarks automatisées
   
- **Scripts de visualisation et analyse** :
   - `visualize_3d.py` : Génération de graphiques 3D comparant les performances (score, durée, frames)
   - `compare_batches_from_api.py` : Comparaison de batches en temps réel depuis l'API
   - `compare_batches_clean.py` : Analyse statistique détaillée des résultats de batches
   - `graph_generator.py` : Génération de visualisations avancées

- **Infrastructure de données** :
   - `upload_to_db.py` : Téléversement automatique des résultats vers MongoDB
   - `list_batches_db.py` : Listage et consultation des batches stockés
   - Configuration via `config.yaml` pour paramétrer les expériences

- **Génération de 24 batches de test** :
   - Création de 24 dossiers de batches avec configurations complètes
   - Chaque batch contient : `config.json`, `maze.json`, `results.json`, `statistics.json`
   - Total de ~30 simulations par batch pour validation statistique
   - Tests de différentes combinaisons : IA Pacman (DEFENSIVE, AGGRESSIVE, GREEDY) vs Algorithmes fantômes (A*, BFS, GREEDY)

- **Génération de visualisations 3D** :
   - 5 graphiques PNG générés dans `experiments/outputs/` :
     * `comparison_3d.png` : Comparaison globale des batches
     * `comparison_3d_render.png` : Visualisation optimisée pour Render
     * `batch_comparison.png` : Vue d'ensemble des performances
     * 2 graphiques spécifiques de batches individuels

- **Intégration backend** :
   - Mise à jour de `batchController.js` pour gérer les nouveaux champs `pacmanAlgorithm` et `ghostAlgorithm`
   - Création de `comparisonController.js` pour les endpoints de comparaison
   - Nouveau modèle `Comparison.js` et `SimulationBatch.js`
   - Routes API `/api/comparisons` via `comparisonRoutes.js`

- **Documentation complète** :
   - `experiments/README.md` : Guide d'utilisation du système d'expérimentation
   - Documentation des scripts, des paramètres et des workflows
   - Exemples d'utilisation et de configuration

- **Déploiement et validation** :
   - Push du système complet vers le dépôt principal
   - Tests de génération de batches sur Render
   - Validation de l'API de comparaison en production
   - Vérification de la cohérence des visualisations 3D

Résultat :  
Système d'expérimentation et de benchmarking entièrement fonctionnel permettant de comparer scientifiquement les performances des différentes combinaisons d'algorithmes (IA Pacman vs stratégies fantômes). Les visualisations 3D offrent une vue claire et synthétique des résultats. L'infrastructure est prête pour des analyses à grande échelle et l'optimisation des algorithmes basée sur des données quantitatives.
