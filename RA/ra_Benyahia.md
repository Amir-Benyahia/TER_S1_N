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
  

## Rapport d'activité – Jour 4

Aujourd'hui, j'ai :
- Corrigé l'imperfecteur (`src/services/mazeGeneration/maze_generator.py`) : normalisation du paramètre (fraction ou %), conversion %→fraction, garantie d'au moins 1 mur cassé et protection des appels à random.sample.
- Ajouté un test local `test/run_generator_test.py` qui vérifie automatiquement que l'imperfecteur augmente le nombre de murs cassés (ex. 419 → 532 sur une exécution).
- Ajusté l'UI (`src/index.html`) : inversion des couleurs pour une inspection visuelle plus claire (murs `#171c85`, couloirs `#040404`).
- Validé le flux local Node → Python → front ; commits locaux puis push après synchronisation avec le dépôt distant.

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
