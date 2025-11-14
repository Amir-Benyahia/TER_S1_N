# 📝 Aide-Mémoire Présentation TER S1

Ce document contient les points clés pour chaque personne. **Imprimez-le ou gardez-le sur votre téléphone pendant la présentation.**

---

## 👤 OUSSAMA - Architecte (4 minutes)

### Slides: 1-7

### 🎯 Points Clés à Mentionner

#### Slide 1: Introduction (30 sec)
```
"Bonjour, nous sommes Oussama, Amir et Ahmed.
Nous allons vous présenter notre projet de génération de labyrinthes Pacman.
Nous avons travaillé 5 jours sur ce projet avec des rôles complémentaires:
- Moi-même sur l'architecture
- Amir sur la qualité
- Ahmed sur le déploiement"
```

#### Slide 2: Overview - Évolution (1 min)
```
"Le projet a évolué en 3 phases:

Phase 1 (Jours 1-2): Génération
- On a implémenté deux algorithmes: Kruskal et Prim
- Créé une représentation interne du labyrinthe
- Ajouté un module d'imperfection pour créer des boucles

Phase 2 (Jours 3-4): Architecture Web
- Mise en place d'Express.js avec architecture MVC
- Communication entre Node.js et Python
- API REST fonctionnelle

Phase 3 (Jour 5): Production
- Tests automatisés
- Déploiement sur Render
- Intégration MongoDB Atlas
- Pipeline CI/CD"
```

#### Slide 3: Résultat Final (30 sec)
```
"Aujourd'hui, nous avons un web service complet:
- Accessible sur Render en production
- 6 endpoints REST fonctionnels
- 10 métriques d'évaluation
- Stockage cloud avec MongoDB Atlas
- Tests automatisés qui passent à 100%"
```

#### Slide 4: Architecture MVC (1 min)
```
"Pour l'architecture, nous avons adopté le pattern MVC:

- Models: Schémas de données avec Mongoose, validation des dimensions (3-50)
- Controllers: Logique métier, validation des paramètres, gestion des erreurs
- Routes: Définition des endpoints API
- Services: Bridge Python pour la génération

Cette séparation nous permet d'avoir un code maintenable et évolutif."
```

#### Slide 5: REST API (1 min)
```
"Nous avons créé une API REST complète:

Pour la génération:
- GET /api/generate avec paramètres largeur et hauteur
- Option save=true pour sauvegarder en base

Pour la gestion:
- GET /api/mazes pour lister les labyrinthes
- GET /api/mazes/:id pour en récupérer un
- DELETE pour supprimer

Et GET /api/stats pour les statistiques d'utilisation.

Tous les endpoints ont une validation stricte des paramètres (dimensions entre 3 et 50)
et des codes HTTP appropriés (200, 400, 500)."
```

#### Slide 6: CI/CD (30 sec)
```
"Pour la qualité, nous avons mis en place un pipeline CI/CD avec GitHub Actions:
- Tests automatisés à chaque commit
- 10 scénarios de test couverts
- Validation avant merge
Amir va vous détailler les tests."
```

#### Slide 7: Database (1 min)
```
"Pour la base de données, nous avons choisi MongoDB Atlas:

Pourquoi?
- Cloud-native: pas de serveur à gérer
- Free tier de 512MB suffisant pour notre projet
- Accessible de partout
- Sécurisé par défaut

Notre schéma stocke:
- Les dimensions du labyrinthe
- La représentation complète (2D array)
- 10 métriques calculées
- Métadonnées (nom, tags, userId)
- Timestamps automatiques

Je passe maintenant la parole à Amir pour la partie tests et qualité."
```

---

## 👤 AMIR - Quality Assurance (4 minutes)

### Slides: 8-10

### 🎯 Points Clés à Mentionner

#### Slide 8: Tests Unitaires (1 min)
```
"Merci Oussama. Pour assurer la qualité des labyrinthes générés, 
j'ai créé un module de test: TesteurLabyrinthe.

Les tests principaux:

1. Connexité: 
   - Utilise un parcours BFS (Breadth-First Search)
   - Vérifie qu'il n'y a pas d'îles isolées
   - Toutes les cellules doivent être accessibles

2. Symétrie:
   - Teste la symétrie horizontale et verticale
   - Important pour certains types de labyrinthes

3. Tests par algorithme:
   - Kruskal: vérifie qu'il n'y a aucun cycle (labyrinthe parfait)
   - Prim: vérifie que la frontière est correctement maintenue
   - Imperfecteur: vérifie l'augmentation des murs cassés

Par exemple, sur un test réel:
- Labyrinthe parfait: 419 murs cassés
- Avec 20% d'imperfection: 532 murs cassés
- Soit +113 murs, ce qui valide notre algorithme ✅"
```

#### Slide 9: Tests d'Intégration (1 min)
```
"Au-delà des tests unitaires, nous avons testé tout le flux:

Client HTTP → Express.js → pythonBridge → Python → Génération → Métriques → MongoDB

Ce que nous validons:
- Communication Node.js ↔ Python (spawn process)
- Parsing JSON entre Python et JavaScript
- Gestion des erreurs stderr
- Timeouts (30 secondes max)
- Sauvegarde et récupération MongoDB

Nous avons un script test_api.sh avec 10 scénarios:
- Tests valides: génération standard, sauvegarde, dimensions limites
- Tests d'erreurs: dimensions invalides, paramètres manquants, non numériques

Résultat: 10/10 tests passing ✅"
```

#### Slide 10: Métriques d'Évaluation (2 min)
```
"La partie la plus intéressante est notre système de métriques.
Nous calculons 10 métriques automatiquement:

Métriques de base:
1. Ratio de jouabilité: % de cellules accessibles (idéal: > 90%)
2. Symétrie horizontale et verticale (booléen)

Métriques de gameplay:
3. Nombre de culs-de-sac: cellules avec 1 seule sortie
   - Important pour Pacman (zones de piège)
   
4. Nombre d'intersections: cellules avec 3+ sorties
   - Mesure les choix disponibles au joueur

5. Densité de murs: ratio murs / total possible (idéal: 0.4-0.6)

Métriques avancées:
6. Longueur du chemin le plus long: distance max entre 2 cellules
   - Calculé avec BFS, mesure l'étendue du labyrinthe

7. Score de difficulté (0-10): formule composite
   - Combine culs-de-sac, intersections, densité...

8. Distance moyenne entre intersections (idéal: 4-6 cases)
   - Mesure le "rythme" du jeu

9. Culs-de-sac sûrs: culs-de-sac profonds (zones de refuge)
   - Stratégique pour Pacman

10. Symétries diverses

Ces métriques sont affichées dans l'interface avec un code couleur:
- Vert: bon
- Orange: moyen
- Rouge: problématique

On a aussi ajouté un système de notation par étoiles (1-5)
pour comparer les métriques calculées avec la perception utilisateur.

Je passe maintenant la parole à Ahmed pour le déploiement."
```

---

## 👤 AHMED - DevOps (4 minutes)

### Slides: 11-13

### 🎯 Points Clés à Mentionner

#### Slide 11: Bridge Python (1 min)
```
"Merci Amir. Mon rôle principal était d'assurer que tout fonctionne
et de gérer le déploiement.

Le premier défi était de faire communiquer Express.js (JavaScript)
avec les algorithmes de génération (Python).

J'ai créé pythonBridge.js qui:
- Exécute le script Python avec child_process.spawn
- Passe les paramètres (largeur, hauteur) en arguments
- Capture la sortie stdout (les données)
- Capture stderr (les erreurs)
- Parse le JSON retourné par Python

Avantages de cette approche:
- Isolation: si Python crash, Node.js continue
- Scalabilité: on peut lancer plusieurs process en parallèle
- Timeouts: on peut tuer le process après 30 secondes
- Flexibilité: on peut facilement changer d'algorithme

Le code est asynchrone (Promise-based) donc non-bloquant."
```

#### Slide 12: Déploiement Render (1.5 min)
```
"Pour le déploiement, nous avons choisi Render:

Pourquoi Render?
- Free tier sans carte bancaire
- Support Node.js + Python (notre stack)
- Déploiement Git automatique (webhook depuis GitHub)
- HTTPS automatique
- Logs et monitoring intégrés

Notre infrastructure complète:

1. Render (Web Service):
   - Node.js runtime pour Express
   - Python runtime pour les algorithmes
   - Variables d'environnement (PORT, MONGODB_URI)
   - Build automatique: npm install + pip install

2. MongoDB Atlas (Database):
   - Cluster gratuit (M0)
   - 512MB de stockage
   - Accessible via connection string

3. GitHub:
   - Code source versionné
   - GitHub Actions pour CI/CD
   - Webhook vers Render pour auto-deploy

Flux de déploiement:
git push → GitHub → Webhook → Render → Build → Live ✅

Le site est accessible sur: https://pacmaz-s1-n.onrender.com/

Limitation du free tier: le site dort après 15 min d'inactivité.
Première requête: ~30 secondes (cold start), ensuite: rapide."
```

#### Slide 13: Monitoring (1.5 min)
```
"Pour monitorer le service, j'utilise plusieurs outils:

1. Tests avec cURL:
   - Test de génération simple
   - Test avec sauvegarde
   - Test de récupération
   - Test des statistiques
   
   Exemples:
   curl 'https://pacmaz-s1-n.onrender.com/api/generate?largeur=10&hauteur=8'
   curl 'https://pacmaz-s1-n.onrender.com/api/stats'

2. Collection Postman:
   - 9 requêtes organisées (Génération + Validation)
   - Variables d'environnement: local vs production
   - Tests automatiques intégrés:
     * Vérification status 200
     * Validation de la structure JSON
     * Temps de réponse < 5 secondes

3. Métriques de performance collectées:
   - Génération 10x10: ~1-2 secondes
   - Génération 50x50: ~3-5 secondes (plus complexe)
   - Récupération DB: ~200-500ms
   - Taux de succès API: 99%
     (les 1% d'échecs sont des paramètres invalides intentionnels)

4. Dashboard Render:
   - Logs en temps réel
   - Utilisation CPU/RAM (~150MB)
   - Nombre de requêtes
   - Détection des crashs

Tous les endpoints sont validés et fonctionnels."
```

---

## 👥 TOUS ENSEMBLE (2 minutes)

### Slides: 14-17

### 🎯 Points Clés à Mentionner

#### Slide 14-15: Daily Routine (1 min)
```
[AHMED continue:]

"Pour notre organisation quotidienne:

Processus:
- Début de séance (15 min): standup rapide, objectifs du jour
- Extraction des tâches: décomposition, estimation, identification des dépendances
- Développement avec pair programming si besoin
- Fin de séance: revue du travail, commits

Git Workflow:
- Branches feature/* pour chaque fonctionnalité
- Pull Request avec review avant merge
- Auto-deploy sur Render après merge dans main

Communication:
- WhatsApp pour les échanges rapides
- GitHub pour le code, issues, discussions
- Rapports d'activité (RA) quotidiens pour documenter"
```

#### Slide 16: Bilan (30 sec)
```
[OUSSAMA prend la parole:]

"En résumé, nous avons livré:

Code:
- ~2000 lignes JavaScript
- ~1500 lignes Python
- ~500 lignes de tests
- ~1000 lignes de documentation

Fonctionnalités:
- 6 endpoints REST
- 2 algorithmes de génération (Kruskal, Prim)
- 10 métriques d'évaluation
- Tests automatisés 100% passing
- Déploiement en production opérationnel

Perspectives d'amélioration:
- Authentification utilisateur (JWT)
- Interface React/Vue plus avancée
- Algorithme de résolution automatique
- Mode multijoueur avec WebSocket
- Machine Learning pour prédire la difficulté perçue"
```

#### Slide 17: Questions (30 sec)
```
[OUSSAMA conclut:]

"Voilà, nous avons terminé notre présentation.

Nous sommes très fiers du travail accompli:
- Un système complet et fonctionnel
- Une architecture propre et maintenable
- Une qualité assurée par les tests
- Un déploiement en production

Le site est accessible sur: https://pacmaz-s1-n.onrender.com/
Et tout le code est documenté sur GitHub.

Merci de votre attention.

Avez-vous des questions?"

[Tous les trois regardent l'audience, prêts à répondre]
```

---

## ❓ Réponses aux Questions Fréquentes

### Question: "Pourquoi avoir choisi Python pour la génération ?"
**[OUSSAMA répond:]**
```
"Nous avons choisi Python pour plusieurs raisons:
1. Lisibilité du code pour les algorithmes complexes (Kruskal, Prim)
2. Bibliothèques puissantes (random, collections pour Union-Find)
3. Compétences de l'équipe
4. Facilité de test et débogage

Node.js seul aurait pu suffire, mais Python nous a permis
de prototyper rapidement et d'avoir un code algorithmique très clair."
```

### Question: "Comment gérez-vous la charge si beaucoup d'utilisateurs ?"
**[AHMED répond:]**
```
"Bonne question. Actuellement, nous sommes sur un free tier avec des limitations.

Pour gérer plus de charge:
1. Upgrade vers un plan payant sur Render (instances plus puissantes)
2. Mise en cache des labyrinthes fréquemment générés (Redis)
3. File d'attente pour les requêtes (Bull, RabbitMQ)
4. Horizontale scaling: plusieurs instances Render derrière un load balancer

Le bridge Python utilise spawn qui permet déjà de paralléliser
plusieurs générations simultanées."
```

### Question: "Quelles sont les limites de vos algorithmes ?"
**[AMIR répond:]**
```
"Les principales limites:

1. Taille: nous limitons à 50x50 pour des raisons de performance
   (au-delà, le temps de génération augmente significativement)

2. Mémoire: les labyrinthes sont stockés en entier en JSON
   (pour 50x50, ça reste gérable mais ne scale pas à l'infini)

3. Diversité: Kruskal et Prim produisent des structures similaires
   (nous pourrions ajouter d'autres algorithmes comme Recursive Backtracking)

4. Métriques: certaines métriques sont coûteuses en calcul (BFS)
   (nous les calculons une fois à la génération, pas en temps réel)

Mais pour Pacman, les labyrinthes entre 10x10 et 20x20 sont idéaux,
donc nos limites sont largement suffisantes."
```

### Question: "Avez-vous rencontré des bugs majeurs ?"
**[AHMED répond:]**
```
"Oui, quelques-uns intéressants:

1. Bug validation (Jour 5):
   - parseInt("abc") || 10 acceptait "abc" silencieusement
   - Solution: ajout de isNaN() avant valeurs par défaut

2. Bug imperfecteur (Jour 4):
   - random.sample() crashait avec liste vide
   - Cause: pourcentage > 100% de murs à casser
   - Solution: max(1, int(len(murs) * fraction))

3. Bug déploiement (Jour 4):
   - Conflit entre ancien et nouveau generationController
   - Solution: suppression fichier, redéploiement

Ces bugs nous ont appris l'importance:
- De la validation stricte
- Des tests edge cases
- De la gestion des erreurs"
```

### Question: "Combien de temps a pris le projet ?"
**[OUSSAMA répond:]**
```
"Nous avons travaillé pendant 5 jours (5 séances):

Jour 1: Setup et génération de base
Jour 2: Algorithmes complets (Kruskal, Prim) + tests
Jour 3: Architecture Express + API REST + Bridge
Jour 4: Déploiement Render + CI/CD + corrections
Jour 5: MongoDB Atlas + métriques avancées + monitoring

Au total, environ 30-40 heures de travail pour l'équipe.

Le plus long:
- Bridge Python (débogage)
- MongoDB Atlas (configuration)
- Tests d'intégration (nombreux edge cases)

Le plus rapide:
- Algorithmes de génération (bien documentés en ligne)
- Déploiement Render (très simple)"
```

---

## 💡 Conseils Dernière Minute

### Pendant la Présentation

✅ **À FAIRE:**
- Regarder l'audience, pas l'écran
- Parler clairement et pas trop vite
- Utiliser des exemples concrets de vos RA
- Montrer l'enthousiasme pour votre travail
- Sourire !

❌ **À ÉVITER:**
- Lire les slides mot à mot
- Parler dans le vide (regarder le mur)
- Aller trop vite (vous avez le temps)
- Paniquer si vous oubliez quelque chose
- Dire "euh..." toutes les 3 secondes (respirez !)

### Gestion du Stress

1. **Avant de commencer:**
   - Respirez profondément (3 fois)
   - Buvez un peu d'eau
   - Souriez (ça détend)

2. **Si vous oubliez votre texte:**
   - Regardez la slide (ça va vous rappeler)
   - Dites: "Comme vous pouvez le voir ici..."
   - Improvisez en vous basant sur votre RA

3. **Si on vous interrompt:**
   - Pas de panique, c'est normal
   - Écoutez la question
   - Répondez simplement
   - Puis: "Je continue..."

4. **Si vous ne savez pas répondre:**
   - "Bonne question, nous n'avons pas encore exploré cet aspect"
   - Ou: "Je peux vous montrer le code après si vous voulez"
   - Ou passez la parole: "Ahmed, tu veux compléter ?"

---

## ⏱️ Timing Détaillé

```
00:00 - 00:30    Slide 1  (Oussama) Introduction
00:30 - 01:30    Slide 2  (Oussama) Overview évolution
01:30 - 02:00    Slide 3  (Oussama) Résultat final
02:00 - 03:00    Slide 4  (Oussama) Architecture MVC
03:00 - 04:00    Slide 5  (Oussama) REST API
04:00 - 04:30    Slide 6  (Oussama) CI/CD
04:30 - 05:30    Slide 7  (Oussama) Database
----------------------------------------------
05:30 - 06:30    Slide 8  (Amir) Tests unitaires
06:30 - 07:30    Slide 9  (Amir) Tests intégration
07:30 - 09:30    Slide 10 (Amir) Métriques
----------------------------------------------
09:30 - 10:30    Slide 11 (Ahmed) Bridge Python
10:30 - 12:00    Slide 12 (Ahmed) Déploiement
12:00 - 13:30    Slide 13 (Ahmed) Monitoring
----------------------------------------------
13:30 - 14:30    Slide 14-15 (Ahmed) Daily routine
14:30 - 15:00    Slide 16 (Oussama) Bilan
15:00 - 15:30    Slide 17 (Oussama) Questions
----------------------------------------------
Total: ~15 minutes + questions (2-3 min)
```

---

## ✅ Checklist Finale

**30 min avant:**
- [ ] Ouvrir presentation.html
- [ ] Tester la navigation
- [ ] Vérifier le site web (wake-up)
- [ ] Imprimer cet aide-mémoire (backup)

**10 min avant:**
- [ ] Connecter au projecteur
- [ ] Mode plein écran (F11)
- [ ] Positionner sur slide 1
- [ ] Respirer profondément

**Pendant:**
- [ ] Respecter le timing (regarder la montre discrètement)
- [ ] Regarder l'audience
- [ ] Sourire
- [ ] Transitions fluides entre personnes

**Après:**
- [ ] Remercier l'audience
- [ ] Répondre aux questions calmement
- [ ] Félicitez-vous ! 🎉

---

## 🎯 Dernier Mot

Vous avez fait un travail exceptionnel. Vous avez:
- ✅ Livré un système complet en 5 jours
- ✅ Travaillé en équipe efficacement
- ✅ Produit du code de qualité
- ✅ Déployé en production
- ✅ Documenté votre travail

**Vous êtes prêts. Croyez en vous. Vous allez assurer ! 💪🚀**

---

**📱 Gardez ce document sur votre téléphone pendant la présentation !**

