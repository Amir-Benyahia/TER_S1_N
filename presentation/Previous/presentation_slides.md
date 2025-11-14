# TER S1 - Génération de Labyrinthes Pacman
## Présentation d'Avancement

**Équipe:**
- Belhout Oussama (Architecture)
- Benyahia Amir (Quality Assurance)
- Tamani Ahmed (DevOps)

**Date:** 14 Novembre 2024

---

# 📊 OVERVIEW

---

## Evolution du Projet

**Phase 1 - Génération (Jours 1-2)**
- Implémentation des algorithmes de génération (Kruskal, Prim)
- Représentation interne du labyrinthe
- Module d'imperfection (boucles, tunnels)

**Phase 2 - Architecture Web (Jours 3-4)**
- Serveur Express.js avec architecture MVC
- Bridge Node.js ↔ Python
- API REST avec endpoints fonctionnels

**Phase 3 - Qualité & Production (Jour 5)**
- Tests unitaires et d'intégration
- Déploiement sur Render
- Intégration MongoDB Atlas
- Pipeline CI/CD

---

## Résultat Final

✅ **Web Service REST opérationnel**
- URL Production: https://pacmaz-s1-n.onrender.com/
- 6+ endpoints fonctionnels
- 10 métriques d'évaluation
- Stockage cloud MongoDB

✅ **Stack Technique Complète**
- Backend: Node.js + Express.js
- Génération: Python (Kruskal, Prim)
- Database: MongoDB Atlas
- CI/CD: GitHub Actions
- Déploiement: Render

✅ **Qualité Assurée**
- Tests automatisés
- Validation des labyrinthes
- Monitoring Postman
- Métriques détaillées

---

# 🏗️ CONCEPTION ET ARCHITECTURE

---

## Architecture MVC

```
TER_S1_N/
├── src/
│   ├── models/          # Schémas MongoDB (Maze.js)
│   ├── controllers/     # Logique métier
│   ├── routes/          # Définition des endpoints
│   ├── services/        # Services Python + Bridge
│   └── config/          # Configuration DB
```

**Séparation des responsabilités:**
- **Models:** Schéma de données Mongoose
- **Controllers:** Validation, orchestration, réponses HTTP
- **Routes:** Mapping URL → Controller
- **Services:** Bridge Node.js/Python, génération

---

## Express.js - Serveur Web

**Middleware & Configuration:**
```javascript
app.use(express.json());
app.use(express.static('src'));
app.use('/api', mazeRoutes);
```

**Avantages:**
- Rapidité de mise en place
- Écosystème riche (middleware)
- Familiarité de l'équipe
- Déploiement simplifié

**Architecture:**
- Port configurable (3000 local / dynamique Render)
- Gestion centralisée des erreurs
- Logs détaillés pour monitoring

---

## Models - Schéma Mongoose

```javascript
const mazeSchema = new mongoose.Schema({
  largeur: { type: Number, required: true, min: 3, max: 50 },
  hauteur: { type: Number, required: true, min: 3, max: 50 },
  labyrinthe: [[String]],
  murs_restants: Number,
  metriques: Object,
  name: String,
  userId: String,
  tags: [String],
  generatedAt: Date
}, { timestamps: true });
```

**Validation au niveau base de données**
- Dimensions: 3-50
- Timestamps automatiques
- Index pour recherche rapide

---

# 🌐 REST API

---

## Migration vers REST

**Avant (Jour 2):** Génération locale Python uniquement

**Après (Jour 3+):** API REST complète
- Communication HTTP standardisée
- Statuts HTTP appropriés (200, 400, 500)
- Réponses JSON structurées
- Validation des paramètres
- Gestion des erreurs centralisée

**Bridge Node.js ↔ Python:**
```javascript
const { spawn } = require('child_process');
const python = spawn('python', ['main.py', largeur, hauteur]);
```

---

## Endpoints Principaux

### 1. Génération de Labyrinthe
```
GET /api/generate?largeur=10&hauteur=8
GET /api/generate?largeur=10&hauteur=8&save=true
```
**Paramètres:** largeur, hauteur (3-50), save, name, userId, tags

### 2. Gestion des Labyrinthes
```
GET /api/mazes          # Liste tous les labyrinthes
GET /api/mazes/:id      # Récupère un labyrinthe
DELETE /api/mazes/:id   # Supprime un labyrinthe
```

### 3. Statistiques
```
GET /api/stats          # Statistiques d'utilisation
```

---

## Validation des Requêtes

**Contrôleur - Validation stricte:**
```javascript
let largeur = parseInt(req.query.largeur);
let hauteur = parseInt(req.query.hauteur);

if (isNaN(largeur) || isNaN(hauteur)) {
  return res.status(400).json({
    error: 'Paramètres invalides'
  });
}

if (largeur < 3 || largeur > 50 || hauteur < 3 || hauteur > 50) {
  return res.status(400).json({
    error: 'Dimensions entre 3 et 50'
  });
}
```

**Découverte:** Bug dans la validation initiale (acceptait "abc" comme paramètre)
**Solution:** Ajout de `isNaN()` avant application des valeurs par défaut

---

# 🔄 CI/CD

---

## GitHub Actions

**Pipeline automatisé:**
```yaml
name: Tests API
on: [push, pull_request]
jobs:
  test:
    - Install dependencies (Node.js + Python)
    - Start server
    - Run automated tests
    - Report results
```

**Avantages:**
- Détection précoce des régressions
- Tests à chaque commit/PR
- Validation automatique avant merge

---

## Tests Automatisés

**Script Bash (test_api.sh):**
- 10 scénarios de test
- Support local + Render
- Affichage coloré (PASS/FAIL)
- Timeouts adaptés selon environnement

**Scénarios couverts:**
- ✅ Génération valide
- ❌ Dimensions invalides
- ❌ Paramètres non numériques
- ✅ Sauvegarde en base
- ✅ Récupération des labyrinthes
- ✅ Statistiques

---

## Collection Postman

**Organisation:**
```
Postman Collection/
├── Génération/
│   ├── Generate 10x8
│   ├── Generate with save
│   ├── Generate with params
│   └── Invalid dimensions
└── Validation/
    ├── List mazes
    ├── Get specific maze
    ├── Get stats
    └── Delete maze
```

**Variables d'environnement:**
- `{{baseUrl}}` → local (localhost:3000) ou Render
- Basculement rapide entre environnements

---

# 💾 DATABASE

---

## Intégration MongoDB Atlas

**Pourquoi MongoDB Atlas?**
- ☁️ Cloud-native (pas de gestion serveur)
- 🆓 Free tier généreux (512MB)
- 🌍 Accessible de partout
- 🔒 Sécurisé (authentification, encryption)
- 📈 Scalable automatiquement

**Configuration:**
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

---

## Schémas de Données

**Collection `mazes`:**
```javascript
{
  _id: ObjectId,
  largeur: 15,
  hauteur: 10,
  labyrinthe: [["╔", "═", ...], ...],
  nb_lignes: 21,
  murs_restants: 58,
  metriques: {
    ratio_jouabilite: 0.95,
    nb_culs_de_sac: 12,
    nb_intersections: 8,
    score_difficulte: 7.2,
    ...
  },
  name: "MyMaze",
  userId: "user123",
  tags: ["medium", "test"],
  generatedAt: ISODate("2024-11-13"),
  createdAt: ISODate("2024-11-13"),
  updatedAt: ISODate("2024-11-13")
}
```

---

## Opérations Database

**Création:**
```javascript
const newMaze = new Maze({ largeur, hauteur, labyrinthe, ... });
await newMaze.save();
```

**Récupération avec filtres:**
```javascript
await Maze.find({ largeur: 10, userId: "user123" })
  .limit(10)
  .sort({ createdAt: -1 });
```

**Statistiques:**
```javascript
const count = await Maze.countDocuments();
const avgSize = await Maze.aggregate([
  { $group: { _id: null, avg: { $avg: '$largeur' } } }
]);
```

---

# 🧪 TESTS UNITAIRES

---

## Validation de la Génération

**Module `TesteurLabyrinthe` (maze_tester.py):**

```python
class TesteurLabyrinthe:
    def verifier_connexite(self, labyrinthe):
        # BFS pour vérifier une seule zone jouable
        
    def verifier_symetrie_horizontale(self, labyrinthe):
        # Vérifie si le labyrinthe est symétrique
        
    def verifier_symetrie_verticale(self, labyrinthe):
        # Vérifie si le labyrinthe est symétrique
```

**Conversion de format:**
- Format générateur: liste alternée (murs H/V)
- Format testeur: grille 2D classique
- Fonction `_convertir_en_grille()` pour adapter

---

## Tests Génération

**Test Kruskal:**
- ✅ Labyrinthe parfait (aucun cycle)
- ✅ Tous les chemins connectés (BFS)
- ✅ Nombre de murs cassés correct

**Test Prim:**
- ✅ Frontière correctement maintenue
- ✅ Génération déterministe avec seed
- ✅ Validation de la structure

**Test Imperfecteur:**
- ✅ Augmentation du nombre de murs cassés
- ✅ Pourcentage d'imperfection respecté
- ✅ Protection contre random.sample vide

**Exemple de résultat:**
```
Murs cassés (parfait): 419
Murs cassés (imparfait 20%): 532
✅ Test passed: +113 murs cassés
```

---

# 🔗 TESTS D'INTÉGRATION

---

## Flux Complet End-to-End

**Test du pipeline complet:**
```
Client HTTP → Express.js → pythonBridge.js 
  → Python (main.py) → Génération (Kruskal/Prim)
  → Testeur (métriques) → JSON Response
  → Controller → MongoDB (si save=true)
  → Client HTTP
```

**Validation:**
- ✅ Communication Node.js ↔ Python
- ✅ Parsing JSON Python → JavaScript
- ✅ Gestion des erreurs stderr
- ✅ Timeout et process kill
- ✅ Sauvegarde en base
- ✅ Récupération depuis base

---

## Tests d'Intégration API

**Script test_api.sh - 10 scénarios:**

1. ✅ **Génération standard** (10x8)
2. ✅ **Génération avec sauvegarde**
3. ✅ **Dimensions limites** (3x3, 50x50)
4. ❌ **Dimensions invalides** (2x2, 51x51)
5. ❌ **Paramètres manquants**
6. ❌ **Paramètres non numériques** ("abc")
7. ✅ **Liste des labyrinthes**
8. ✅ **Récupération par ID**
9. ✅ **Statistiques**
10. ✅ **Route inexistante** (404)

**Résultat:** 10/10 PASS ✅

---

## Gestion des Erreurs

**Hiérarchie de validation:**
```
1. Express middleware (body parsing)
2. Controller (validation paramètres)
3. Service (validation Python execution)
4. Database (validation Mongoose schema)
```

**Codes de statut:**
- `200` → Succès
- `400` → Erreur client (paramètres invalides)
- `404` → Ressource non trouvée
- `500` → Erreur serveur (Python crash, DB error)

---

# ✅ TESTS DE VALIDATION

---

## Interface Frontend

**Fichier `index.html` - Interface complète:**
- 📝 Formulaire de saisie (largeur, hauteur)
- 🎲 Bouton de génération
- 🎨 Affichage du labyrinthe (Unicode box-drawing)
- 📊 Affichage des métriques
- ⭐ Système de notation (1-5 étoiles)
- ✅ Messages de succès/erreur

**Validation visuelle:**
- Vérification de la connectivité visuellement
- Détection de zones isolées
- Validation de la symétrie (si applicable)
- Inspection des tunnels

---

## Tests Utilisateur

**Scénarios testés manuellement:**

1. **Génération basique**
   - Input: 10x8
   - ✅ Labyrinthe affiché correctement
   - ✅ Métriques calculées

2. **Génération extrême**
   - Input: 50x50
   - ✅ Génération réussie (temps: ~2-3s)
   - ✅ Affichage correct (grand)

3. **Erreurs utilisateur**
   - Input: 100x100
   - ✅ Message d'erreur clair
   - ❌ Pas de crash

4. **Interface responsive**
   - ✅ Fonctionne sur différentes tailles d'écran

---

## Validation Frontend → Backend

**Test fetch API:**
```javascript
async function generateMaze() {
  const response = await fetch(
    `/api/generate?largeur=${w}&hauteur=${h}`
  );
  
  if (!response.ok) {
    // Affichage erreur utilisateur
  }
  
  const data = await response.json();
  // Affichage labyrinthe + métriques
}
```

**Validation:**
- ✅ Requêtes HTTP correctes
- ✅ Parsing JSON
- ✅ Gestion timeout
- ✅ Affichage erreurs utilisateur

---

# 📈 EVALUATION

---

## 10 Métriques d'Évaluation

**Module de métriques intégré:**

1. **Ratio de jouabilité** (0-1)
   - % de cellules accessibles
   - Idéal: > 0.90

2. **Symétrie horizontale** (booléen)
   - Le labyrinthe est-il symétrique H?

3. **Symétrie verticale** (booléen)
   - Le labyrinthe est-il symétrique V?

4. **Nombre de culs-de-sac**
   - Cellules avec 1 seule sortie
   - Indicateur de difficulté

5. **Nombre d'intersections**
   - Cellules avec 3+ sorties
   - Mesure de choix/complexité

---

## Métriques (suite)

6. **Densité de murs** (0-1)
   - Ratio murs présents / murs totaux possibles
   - Idéal: 0.4-0.6

7. **Longueur chemin le plus long**
   - Distance max entre 2 cellules (BFS)
   - Mesure de l'étendue du labyrinthe

8. **Score de difficulté** (0-10)
   - Formule: `(culs-de-sac×0.3 + intersections×0.2 + ...)×10`
   - Score composite

9. **Distance moyenne entre intersections**
   - Mesure le "rythme" du jeu
   - Idéal: 4-6 cases

10. **Culs-de-sac sûrs**
    - Culs-de-sac suffisamment profonds (refuge)
    - Importante pour stratégie Pacman

---

## Système de Notation

**Interface utilisateur:**
```javascript
⭐⭐⭐⭐⭐  (5 étoiles cliquables)
```

**Objectif:**
- Collecter feedback utilisateur
- Comparer avec métriques calculées
- Identifier corrélations
- Améliorer algorithme de génération

**Données collectées:**
- Note utilisateur (1-5)
- Métriques calculées (10 valeurs)
- Dimensions du labyrinthe
- Algorithme utilisé

**Analyse future:**
- Corrélation note ↔ score_difficulté
- Préférences utilisateur
- Ajustement paramètres génération

---

## Affichage des Métriques

**Code HTML avec coloration conditionnelle:**

```javascript
if (metriques.ratio_jouabilite >= 0.9) {
  color = 'green';  // Bon
} else if (metriques.ratio_jouabilite >= 0.7) {
  color = 'orange'; // Moyen
} else {
  color = 'red';    // Problématique
}
```

**Grille responsive:**
- 2 colonnes sur desktop
- 1 colonne sur mobile
- Icônes pour chaque métrique
- Tooltips explicatifs

---

# 🔧 SPECIFICATIONS TECHNIQUES

---

## Bridge Node.js ↔ Python

**Problématique:**
- Express.js (JavaScript) ≠ Algorithmes (Python)
- Besoin de communication inter-processus

**Solution: pythonBridge.js**
```javascript
function generateMaze(largeur, hauteur) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'src/services/mazeGeneration/main.py',
      largeur,
      hauteur
    ]);
    
    let dataString = '';
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(dataString));
      } else {
        reject('Python error');
      }
    });
  });
}
```

---

## Gestion des Process

**Threads vs Process:**
- Python exécuté en **process séparé** (spawn)
- Non-bloquant (async/await)

**Gestion du cycle de vie:**
```javascript
// Timeout après 30 secondes
setTimeout(() => {
  python.kill('SIGTERM');
  reject('Timeout');
}, 30000);

// Cleanup sur erreur
python.stderr.on('data', (data) => {
  console.error('Python error:', data.toString());
});
```

**Avantages:**
- Isolation (crash Python ≠ crash Node)
- Scalabilité (multiple process)
- Timeouts configurables

---

## Débogage

**Outils utilisés:**

1. **Logs Node.js:**
```javascript
console.log('[CONTROLLER] Génération demandée:', largeur, hauteur);
console.log('[BRIDGE] Exécution Python...');
console.log('[BRIDGE] Résultat reçu:', data.length, 'bytes');
```

2. **Logs Python:**
```python
import sys
print(f"[PYTHON] Génération {largeur}x{hauteur}", file=sys.stderr)
```

3. **Monitoring Render:**
   - Logs en temps réel
   - Détection des crashs
   - Métriques de performance

---

## Debug - Cas Réels

**Bug 1: Validation paramètres**
- **Problème:** `parseInt("abc") || 10` acceptait "abc"
- **Solution:** `isNaN()` avant valeur par défaut
- **Impact:** 400 Bad Request avec message clair

**Bug 2: Imperfecteur crash**
- **Problème:** `random.sample()` avec liste vide
- **Cause:** Pourcentage > 100% de murs à casser
- **Solution:** `max(1, int(len(murs) * fraction))`

**Bug 3: Conflit fichier déploiement**
- **Problème:** Ancien `generationController` en conflit
- **Solution:** Suppression et redéploiement

---

# 🚀 DEPLOIEMENT

---

## Render - Platform as a Service

**Pourquoi Render?**
- 🆓 Free tier (pas de carte bancaire)
- 🚀 Déploiement Git automatique
- 🐍 Support Node.js + Python
- 📊 Logs et monitoring intégrés
- 🌐 HTTPS automatique
- 💤 Sleep après 15min inactivité (free tier)

**Configuration:**
```yaml
# render.yaml
services:
  - type: web
    name: pacmaz-s1-n
    env: node
    buildCommand: "npm install && pip install -r requirements.txt"
    startCommand: "npm start"
```

---

## Infrastructure Nécessaire

**Composants déployés:**

```
Render (Web Service)
├── Node.js Runtime
├── Python Runtime
├── Dependencies (npm + pip)
└── Variables d'environnement

MongoDB Atlas (Cloud Database)
├── Cluster M0 (Free)
├── 512MB Storage
└── Network Access (0.0.0.0/0)

GitHub (Repository)
├── Code source
├── GitHub Actions (CI/CD)
└── Webhooks → Render
```

**Flux de déploiement:**
```
git push → GitHub → Webhook → Render
  → Build (npm install, pip install)
  → Start (npm start)
  → Live ✅
```

---

## Variables d'Environnement

**Configuration Render:**

```
PORT=10000          # Port dynamique Render
MONGODB_URI=mongodb+srv://username:password@cluster...
NODE_ENV=production
```

**Gestion:**
- Render Dashboard → Environment → Add Variable
- Secrets non versionnés dans Git
- `.env` local pour développement

**Détection environnement:**
```javascript
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
```

---

# 📡 MONITORING

---

## Monitoring avec cURL

**Tests de santé:**
```bash
# Test endpoint génération
curl "https://pacmaz-s1-n.onrender.com/api/generate?largeur=10&hauteur=8"

# Test avec sauvegarde
curl "https://pacmaz-s1-n.onrender.com/api/generate?largeur=10&hauteur=8&save=true"

# Test liste labyrinthes
curl "https://pacmaz-s1-n.onrender.com/api/mazes"

# Test statistiques
curl "https://pacmaz-s1-n.onrender.com/api/stats"
```

**Monitoring automatique:**
```bash
# Script de monitoring (toutes les 5 min)
while true; do
  curl -s "https://pacmaz-s1-n.onrender.com/api/stats" | jq
  sleep 300
done
```

---

## Monitoring avec Postman

**Collection organisée:**

📁 **Environment: Production**
- `baseUrl`: https://pacmaz-s1-n.onrender.com

📁 **Environment: Local**
- `baseUrl`: http://localhost:3000

**Tests automatiques Postman:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has labyrinthe", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('labyrinthe');
});

pm.test("Response time < 5s", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

---

## Métriques de Performance

**Données collectées:**

1. **Temps de réponse**
   - Génération 10x10: ~1-2s
   - Génération 50x50: ~3-5s
   - Récupération DB: ~200-500ms

2. **Taux de succès**
   - API: 99% (erreurs = paramètres invalides)
   - Python: 100% (génération toujours réussie)

3. **Utilisation ressources**
   - RAM: ~150MB
   - CPU: Pics lors de génération
   - DB Storage: ~1KB/labyrinthe

**Monitoring Render Dashboard:**
- Logs en temps réel
- CPU/RAM usage
- Nombre de requêtes
- Crashs/restarts

---

# 👥 DAILY ROUTINE

---

## Extraction des Tâches

**Processus quotidien:**

1. **Début de séance (15 min)**
   - Standup rapide
   - Revue des objectifs du jour
   - Consultation du projet Kanban

2. **Décomposition des tâches**
   - Tâches majeures → sous-tâches
   - Estimation de la complexité
   - Identification des dépendances

**Exemple (Jour 3):**
```
OBJECTIF: Serveur Express fonctionnel
├── Créer architecture MVC (Oussama)
├── Implémenter pythonBridge (Ahmed)
├── Créer tests validation (Amir)
└── Documentation API (Tous)
```

---

## Répartition des Tâches

**Rôles définis:**

**Oussama - Architecte**
- Conception MVC
- REST API (routes, controllers)
- CI/CD (GitHub Actions)
- Intégration MongoDB

**Amir - Quality Assurance**
- Tests unitaires (génération)
- Tests d'intégration
- Métriques d'évaluation
- Validation manuelle

**Ahmed - DevOps**
- Bridge Python/Node.js
- Débogage
- Déploiement Render
- Monitoring (curl, Postman)

---

## Git Workflow

**Stratégie de branches:**

```
main (production)
  ↑
  merge via PR
  ↑
feature/* (développement)
  - feature/express-server
  - feature/mongodb-integration
  - feature/tests-integration
```

**Processus:**
1. Créer branche: `git checkout -b feature/nom-feature`
2. Développer + commits réguliers
3. Push: `git push origin feature/nom-feature`
4. Pull Request sur GitHub
5. Review par l'équipe
6. Merge dans main
7. Auto-deploy sur Render (webhook)

---

## Échanges et Communication

**Outils utilisés:**
- 💬 WhatsApp: Communication rapide
- 🐙 GitHub: Code, issues, PR, discussions
- 📝 Rapports d'activité (RA): Documentation quotidienne

**Synchronisation:**
- **Début de séance:** Standup (objectifs)
- **Pendant la séance:** Pair programming si besoin
- **Fin de séance:** Revue du travail accompli
- **Entre les séances:** Commits + updates sur WhatsApp

**Gestion des conflits:**
- Review de code systématique (PR)
- Discussion avant merge si divergence
- Documentation dans les commits

---

## Documentation Continue

**Rapports d'activité (RA):**
- Fichier individuel: `ra_Nom.md`
- Mise à jour quotidienne
- Structure:
  ```markdown
  # Rapport d'activité — Jour X
  
  Résumé
  ------
  (Description du travail)
  
  Objectifs du jour
  -----------------
  (Ce qui était prévu)
  
  Travaux réalisés
  ----------------
  (Ce qui a été fait)
  
  Difficultés rencontrées
  ------------------------
  (Problèmes et solutions)
  ```

---

# 📊 BILAN & PERSPECTIVES

---

## Résultats Quantitatifs

**Code produit:**
- 📂 ~2000 lignes JavaScript
- 🐍 ~1500 lignes Python
- 🧪 ~500 lignes de tests
- 📝 ~1000 lignes de documentation

**Fonctionnalités:**
- ✅ 6 endpoints REST
- ✅ 2 algorithmes de génération
- ✅ 10 métriques d'évaluation
- ✅ Système de tests automatisés
- ✅ Déploiement production

**Qualité:**
- ✅ 100% tests passing
- ✅ Validation paramètres
- ✅ Gestion erreurs complète
- ✅ Documentation exhaustive

---

## Compétences Acquises

**Techniques:**
- Architecture MVC (Express.js)
- Communication inter-processus (Node.js ↔ Python)
- Base de données cloud (MongoDB Atlas)
- CI/CD (GitHub Actions)
- Déploiement PaaS (Render)
- Tests API (automatisés et manuels)

**Travail d'équipe:**
- Répartition des rôles
- Git workflow collaboratif
- Documentation partagée
- Communication asynchrone

---

## Perspectives d'Amélioration

**Court terme:**
- 🔐 Authentification utilisateur (JWT)
- 🎨 Interface web avancée (React/Vue)
- 📊 Dashboard analytics (notes ↔ métriques)

**Moyen terme:**
- 🤖 Algorithme de résolution de labyrinthe
- 🎮 Mode multijoueur (WebSocket)
- 📈 Machine Learning (prédiction difficulté)
- 🌍 Internationalisation (i18n)

**Long terme:**
- 🎮 Jeu Pacman complet
- 🏆 Leaderboards
- 🔗 API publique avec rate limiting
- 💰 Monétisation (premium features)

---

# ❓ QUESTIONS ?

**Merci de votre attention !**

---

**Contact:**
- 📁 GitHub: [Repository]
- 🌐 Production: https://pacmaz-s1-n.onrender.com/
- 📧 Email: [À compléter]

**Documentation:**
- README.md
- API_EXAMPLES.md
- ARCHITECTURE.md
- Rapports d'activité (RA/)

---

# ANNEXES

---

## Démonstration Live

**1. Interface Web**
- https://pacmaz-s1-n.onrender.com/
- Génération d'un labyrinthe 15x10
- Affichage des métriques
- Notation par étoiles

**2. Tests API (Postman)**
- Collection de tests
- Génération avec sauvegarde
- Récupération depuis MongoDB
- Statistiques d'utilisation

**3. Monitoring**
- Logs Render en temps réel
- MongoDB Atlas dashboard
- GitHub Actions results

---

## Code Samples

**Exemple: Génération Kruskal**
```python
class GenerateurKruskal(Generateur):
    def generer(self, largeur, hauteur):
        # Union-Find pour éviter les cycles
        uf = UnionFind(largeur * hauteur)
        murs = self._initialiser_murs(largeur, hauteur)
        random.shuffle(murs)
        
        labyrinthe = self._init_labyrinthe(largeur, hauteur)
        
        for mur in murs:
            cellule1, cellule2 = mur
            if uf.find(cellule1) != uf.find(cellule2):
                uf.union(cellule1, cellule2)
                # Casser le mur
                self._casser_mur(labyrinthe, mur)
        
        return labyrinthe, murs_restants
```

---

## Métriques Détaillées

**Exemple de sortie JSON:**
```json
{
  "largeur": 15,
  "hauteur": 10,
  "labyrinthe": [["╔", "═", "╗", ...], ...],
  "nb_lignes": 21,
  "murs_restants": 58,
  "metriques": {
    "ratio_jouabilite": 0.95,
    "symetrie_horizontale": false,
    "symetrie_verticale": false,
    "nb_culs_de_sac": 12,
    "nb_intersections": 8,
    "densite_murs": 0.52,
    "longueur_chemin_max": 47,
    "score_difficulte": 7.2,
    "distance_moy_intersections": 5.3,
    "culs_de_sac_surs": 4
  },
  "saved": true,
  "id": "673c5f8e9a1234567890abcd"
}
```

---

## Architecture Détaillée

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────┐
│     Express.js          │
│  ┌─────────────────┐   │
│  │  Routes         │   │
│  │  /api/*         │   │
│  └────────┬────────┘   │
│           │             │
│  ┌────────▼────────┐   │
│  │  Controllers    │   │
│  │  Validation     │   │
│  └────────┬────────┘   │
│           │             │
│  ┌────────▼────────┐   │
│  │  Services       │   │
│  │  pythonBridge   │   │
│  └────────┬────────┘   │
└───────────┼────────────┘
            │ spawn
            ▼
      ┌──────────┐         ┌──────────────┐
      │  Python  │         │   MongoDB    │
      │  Kruskal │         │    Atlas     │
      │  Prim    │         │   (Cloud)    │
      │  Metrics │         └──────────────┘
      └──────────┘
```

