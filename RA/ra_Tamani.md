# Rapport d'activité — Jour 1

## Réorganisation du groupe
J'ai rejoint ce groupe après m'être retrouvé seul pendant les deux premières séances. Donc nous avons fait le point sur l'avancement de chacun. J'ai présenté le travail que j'avais réalisé sur le prototype de la 1ère seance, tandis que les autres membres ont exposé leurs contributions.

Nous avons ensuite réparti les tâches pour la suite du projet, en tenant compte des compétences de chacun et du travail déjà accompli.


# Rapport d'activité — Jour 2
## Objectif du jour :
Implémentation d'un module de visualisation pour les labyrinthes générés, permettant une représentation graphique de la chaîne de caractères (JSON) qui représente notre maze.


## Approche :
Le générateur par les algorithmes Kruskal et Prim produit un format de données spécifique avec alternance de murs horizontaux et verticaux. La visualisation convertit cette structure en une grille pixelisée adaptée à l'affichage graphique.

### Défis :
La conversion du format alterné en une grille homogène a nécessité un recalcul précis des positions. La gestion cohérente des tunnels sur les bords demandait une attention particulière pour maintenir la symétrie. Enfin, la validation de l'exactitude de la représentation de la chaine de caractères.

### Solution :
J'ai implémenté un système de visualisation double. La sortie graphique en PNG sert pour la présentation finale des résultats, tandis que la sortie ASCII permet la vérification de la cohérence entre la structure générée et sa représentation visuelle.


# Rapport d'activité — Jour 3
## Objectif du jour :
Mise en place d'une interface web complète pour interagir avec le générateur de labyrinthes via une API REST.

## Travail effectué :

### 1. Création du service pythonBridge.js
Service indépendant permettant la communication entre Express et Python :
- Exécution du générateur Python (GenerateurKruskal) via `child_process.spawn`
- Parsing des résultats JSON retournés par Python
- Gestion centralisée des erreurs

### 2. Création des routes API (mazeRoutes.js)
Définition des endpoints REST :
- Route `GET /api/generate?largeur=X&hauteur=Y`
- Séparation claire entre routage et logique métier

### 3. Refactorisation du contrôleur (generationController.js)
Amélioration de la logique métier :
- Intégration du service pythonBridge
- Validation des paramètres (dimensions entre 3 et 50)
- Gestion des erreurs avec réponses HTTP appropriées (400, 500)
- Logs console pour le suivi des requêtes

### 4. Restructuration du serveur Express (index.js)
Organisation en architecture MVC :
- Montage des routes sous le préfixe `/api`
- Middleware pour servir les fichiers statiques
- Gestion des routes inexistantes par l'erreur 404

### 5. Restructuration de l'interface web (index.html)
Restructuration de l'interface utilisateur qui affichait au debut qu'un simple messsage pour effectuer le deploiment et se familiariser avec le dashboard à une interface web complete :
- Formulaire de saisie de taille et bouton de génération de labyrinthe
- Affichage de la matrice au format initiale pour l'instant 0/1
- Messages de succès et d'erreur

# Rapport d'activité — Jour 4
## Objectif du jour :
- Finaliser le web service "maze Pacman" avec API REST déployée sur Render.
- Configuration GitHub Actions pour tests automatisés
- Intégration des métriques `TesteurLabyrinthe` dans le pipeline


## Travail effectué :

### 1. Correction des erreurs de déploiement
- Suppression d'un ancien fichier `generationController` en conflit
- Redéploiement réussi sur Render

### 2. Refactorisation de pythonBridge.js
- Remplacement du code Python inline par un appel direct au script
- Amélioration de la séparation JavaScript/Python

### 3. Adaptation de maze_generator.py
- Ajout du support des arguments en ligne de commande
- Validation des dimensions et sortie JSON


## Résultat :
- Web service opérationnel consultable sur l'URL : https://pacmaz-s1-n.onrender.com/


# Rapport d'activité — Jour 5
## Objectif du jour :
Collaboration étroite avec l'équipe pour la refactorisation majeure vers l'architecture PacLab complète.

## Travail effectué :

### 1. Refactorisation collaborative (Co-authored commit avec Belhout et Amir)
Contribution à la migration complète de l'architecture :
- **Architecture MVC complète** : Séparation claire Models/Views/Controllers
- **Nouveaux modèles Mongoose** : Maze, Trajectory, Simulation
- **Structure client-serveur** : Frontend vanilla JS + Backend Express

### 2. Amélioration du système de tests
- Configuration Jest pour tests unitaires JavaScript
- Tests Python avec pytest
- Configuration `.eslintrc.json` pour qualité de code
- Tests sur :
  * Algorithmes de génération
  * IA des fantômes
  * Pathfinding (A*, BFS)
  * API REST endpoints


### 3. Nouveaux modules Python
Contribution au développement de :
- Module `ghost_ai/` : 4 personnalités distinctes (Blinky, Pinky, Inky, Clyde)
- Module `pathfinding/` : A* et BFS implémentés
- Module `simulation/` : Moteur de jeu avec replay
- Module `maze/pellets/` : Placement stratégique des pastilles

## Résultat :
Architecture PacLab complète et modulaire déployée. Tests automatisés en place. Documentation exhaustive pour maintenance future.



# Rapport d'activité — Jour 6 & 7
## Objectif :
Corrections critiques de déploiement et optimisation de l'infrastructure CI/CD.

## Travail effectué :

### 1. Fix Render deployment
**Problème** : Double chemin `src/src/` causé par mauvaise configuration
**Solution** :
- Création de `render.yaml` avec configuration explicite
- Ajout `rootDir` pour éviter double référence
- Correction du chemin `requirements.txt`

### 2. Restructuration package.json 
**Problème** : Render ne trouvait pas les dépendances Node.js
**Solution critique** :
- Migration `package.json` et `package-lock.json` vers `src/`
- Mise à jour des chemins dans GitHub Actions
- Correction workflow CI/CD

## Résultat :
Déploiement Render stable et fonctionnel. Pipeline CI/CD opérationnel avec tests automatisés.



# Rapport d'activité — Jour 8 & 9
## Objectif :
Support aux corrections frontend et stabilisation finale de la plateforme.

## Travail effectué :

### 1. Support corrections frontend (Collaboration avec Belhout)

- Aide à la résolution bugs d'affichage
- Validation de l'intégration API REST
- Tests end-to-end des fonctionnalités

**Corrections apportées par l'équipe** :
- Fix Jest configuration pour tests frontend
- Correction navigation sidebar
- Amélioration métriques de performance
- Fix disparition des pastilles dans le jeu
- Correction affichage des statistiques batches

### 2. IA des fantômes (Collaboration avec Amir)
**Contribution** : Review et tests du commit d'Amir

**Améliorations validées** :
- 4 personnalités distinctes fonctionnelles
- Correction spawn dans les murs
- Gestion affichage fantômes superposés
- Historique Pacman pour direction


### 3. Tests et validation
**Tests réalisés** :
- Tests manuels sur déploiement Render
- Validation endpoints API REST
- Tests performance avec batches de simulations
- Vérification comportement des 4 fantômes
- Tests de génération de labyrinthes (Kruskal, Prim)


**URL Production** : https://pacmaz-s1-n.onrender.com/




