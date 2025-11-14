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

## Travail effectué :

### 1. Création d'un script de tests automatisés (test_api.sh)
Développement d'un script Bash pour automatiser les tests de l'API :
- 10 scénarios de test couvrant tous les cas d'usage
- Support de plusieurs environnements (local/Render)
- Affichage coloré des résultats (PASS/FAIL)
- Gestion dynamique des timeouts selon l'environnement

### 2. Développement de la collection Postman
Création d'une collection complète pour tests manuels :
- 9 requêtes organisées en 2 dossiers (Génération/Validation)
- Variables d'environnement pour basculer entre local et Render
- Tests des cas valides et invalides

### 4. Découverte et correction d'un bug de validation
Identification d'un problème dans `generationController.js` :
- **Bug** : Paramètres non numériques acceptés silencieusement
- **Cause** : `parseInt("abc") || 10` appliquait la valeur par défaut sans erreur
- **Solution** : Validation avec `isNaN()` AVANT l'application des valeurs par défaut
- Ajout de messages d'erreur explicites (400 Bad Request)



