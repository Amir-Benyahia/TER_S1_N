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


