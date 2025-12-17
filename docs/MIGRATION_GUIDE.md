# Guide de Migration - Métriques de Performance

## Pour les utilisateurs existants

Si vous avez déjà des simulations et batches dans votre base de données, ce guide vous aidera à migrer vers le nouveau système de métriques.

## ⚠️ Changements Importants

### Schéma de Base de Données

Les modèles MongoDB ont été étendus avec de nouveaux champs. Les anciennes simulations continueront de fonctionner, mais n'auront pas les nouvelles métriques.

### Compatibilité Ascendante

✅ Les anciennes simulations restent valides
✅ Les anciens batches continuent de fonctionner
✅ Pas de perte de données existantes
✅ Migration progressive possible

## 🔄 Options de Migration

### Option 1: Migration Passive (Recommandée)

**Aucune action requise**. Les nouvelles simulations auront automatiquement les métriques, les anciennes continueront sans.

**Avantages**:
- Aucun risque
- Pas de downtime
- Migration naturelle au fil du temps

**Inconvénients**:
- Statistiques de batch incomplètes au début
- Pas de métriques pour anciennes simulations

### Option 2: Ré-exécution des Simulations

Ré-exécuter les simulations existantes pour obtenir les métriques.

```bash
# Script de ré-exécution (à créer)
node scripts/rerun-simulations.js --batch-id <id>
```

**Avantages**:
- Métriques complètes pour toutes les simulations
- Statistiques de batch précises

**Inconvénients**:
- Temps de calcul important
- Peut modifier légèrement les résultats

### Option 3: Migration Manuelle de la Base de Données

Ajouter des valeurs par défaut pour les anciennes simulations.

```javascript
// Script MongoDB
db.simulations.updateMany(
  { "results.performanceMetrics": { $exists: false } },
  {
    $set: {
      "results.duration": 0,
      "results.score": 0,
      "results.performanceMetrics": {
        "pacman": {
          "memoryUsage": 0,
          "timeComplexity": "O(1)",
          "avgDecisionTime": 0
        },
        "ghosts": []
      }
    }
  }
);
```

**Avantages**:
- Rapide
- Pas de recalcul

**Inconvénients**:
- Métriques à zéro (non représentatives)
- Nécessite accès direct à MongoDB

## 📋 Checklist de Migration

### Pour les Développeurs

- [ ] Mettre à jour les dépendances Python
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Mettre à jour les dépendances Node.js
  ```bash
  npm install
  ```

- [ ] Vérifier que MongoDB est à jour (v4.0+)
  ```bash
  mongo --version
  ```

- [ ] Tester les nouvelles fonctionnalités
  ```bash
  python tests/test_performance_metrics.py
  npm test
  ```

- [ ] Redémarrer les services
  ```bash
  # Backend
  npm start
  
  # Frontend
  # Ouvrir index.html ou servir via HTTP
  ```

### Pour les Utilisateurs

- [ ] Rafraîchir la page web (Ctrl+F5)
- [ ] Vérifier que les nouveaux styles CSS sont chargés
- [ ] Créer une nouvelle simulation test
- [ ] Vérifier l'affichage des métriques
- [ ] Consulter les statistiques d'un batch

## 🐛 Résolution de Problèmes

### Problème: Les métriques n'apparaissent pas

**Solutions**:
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Vérifier la console JavaScript (F12)
3. Confirmer que `performance-metrics.css` est chargé
4. Vérifier que `PerformanceMetrics.js` est inclus

### Problème: Erreur "tracemalloc not available"

**Solution**:
```bash
# Vérifier la version de Python
python --version  # Doit être 3.7+

# Réinstaller Python si nécessaire
```

### Problème: Statistiques de batch incorrectes

**Solution**:
```javascript
// Recalculer manuellement via API
fetch('/api/batches/:id/recalculate', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Problème: Performance dégradée

Le tracking de mémoire ajoute un overhead de ~5-10%.

**Solutions**:
- Normal pour un environnement de développement
- En production, considérer un sampling (1 frame sur 10)
- Désactiver le tracking si nécessaire (voir configuration)

## 🔧 Configuration Optionnelle

### Désactiver le Tracking Mémoire

Dans `performance_metrics.py`:
```python
class PerformanceTracker:
    def __init__(self, enable_memory_tracking=False):
        self.enable_memory_tracking = enable_memory_tracking
        # ...
```

### Ajuster le Calcul de Score

Dans `performance_metrics.py`:
```python
class ScoreCalculator:
    # Modifier les constantes
    BASE_SCORE = 1000
    PELLET_VALUE = 10
    POWER_PELLET_VALUE = 50
    # ...
```

### Personnaliser l'Affichage

Dans `PerformanceMetrics.js`:
```javascript
// Modifier les seuils d'affichage
static formatBytes(bytes) {
    // Personnaliser le formatage
}
```

## 📊 Validation de la Migration

### Tests de Validation

```bash
# 1. Créer une simulation test
curl -X POST http://localhost:3000/api/simulations \
  -H "Content-Type: application/json" \
  -d @test-simulation.json

# 2. Vérifier les métriques
curl http://localhost:3000/api/simulations/:id

# 3. Créer un batch
curl -X POST http://localhost:3000/api/batches \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Batch"}'

# 4. Ajouter la simulation au batch
curl -X POST http://localhost:3000/api/batches/:id/add-simulations \
  -H "Content-Type: application/json" \
  -d '{"simulationIds":["sim-id"]}'

# 5. Vérifier les statistiques
curl http://localhost:3000/api/batches/:id
```

### Vérifications Manuelles

1. **Frontend**: Ouvrir une simulation et vérifier l'affichage des métriques
2. **Backend**: Consulter MongoDB et vérifier la structure des documents
3. **Performance**: Mesurer le temps d'exécution avant/après

## 🎯 Étapes Post-Migration

### 1. Monitoring
- Surveiller les performances système
- Vérifier les logs pour erreurs
- Monitorer l'utilisation mémoire du serveur

### 2. Documentation Équipe
- Former l'équipe aux nouvelles métriques
- Partager le guide d'interprétation
- Définir les KPIs à suivre

### 3. Optimisation
- Identifier les algorithmes les plus performants
- Ajuster les configurations selon les métriques
- Documenter les best practices

## 📚 Ressources Supplémentaires

- **Guide Complet**: `PERFORMANCE_METRICS_GUIDE.md`
- **Documentation Technique**: `METRICS_UPDATE_README.md`
- **Exemples de Données**: `METRICS_DATA_EXAMPLES.json`
- **Résumé Visuel**: `METRICS_VISUAL_SUMMARY.md`

## 🆘 Support

En cas de problème:

1. Consulter les logs serveur
2. Vérifier la console navigateur
3. Consulter la documentation
4. Ouvrir une issue sur GitHub

## ✅ Validation Finale

La migration est réussie si:

- ✅ Nouvelles simulations ont des métriques complètes
- ✅ Batches affichent des statistiques enrichies
- ✅ Interface affiche correctement les métriques
- ✅ Pas d'erreur dans les logs
- ✅ Performance acceptable (<10% overhead)

---

**Date de Migration**: Décembre 2025  
**Version**: 2.0.0  
**Compatibilité**: Versions 1.x toujours supportées
