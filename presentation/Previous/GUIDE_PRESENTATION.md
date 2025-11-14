# 🎯 Guide de Présentation TER S1

Ce guide vous aide à préparer et présenter votre TER demain.

## 📁 Fichiers Créés

1. **`presentation_slides.md`** - Version Markdown complète (18 sections)
2. **`presentation.html`** - Version HTML interactive (18 slides)
3. **`GUIDE_PRESENTATION.md`** - Ce guide

---

## 🚀 Option 1: Présentation HTML Interactive (RECOMMANDÉ)

### Avantages
- ✅ Navigation au clavier (flèches gauche/droite)
- ✅ Design moderne et professionnel
- ✅ Compteur de slides
- ✅ Animations fluides
- ✅ Pas besoin d'installation

### Comment utiliser

1. **Ouvrir le fichier:**
   ```
   Double-cliquer sur: presentation.html
   ```
   Le fichier s'ouvrira dans votre navigateur par défaut.

2. **Naviguer:**
   - **Souris:** Cliquer sur "Précédent" / "Suivant"
   - **Clavier:** Flèches ← et →
   
3. **Mode plein écran:**
   - Appuyez sur `F11` (Windows) ou `Cmd+Ctrl+F` (Mac)

4. **Pendant la présentation:**
   - Le compteur en haut à droite montre votre progression (ex: 3 / 18)
   - Prenez votre temps sur chaque slide
   - Maximum 4 minutes par personne = environ 6 slides

---

## 📝 Option 2: Version Markdown

### Conversion en PowerPoint

**Méthode A: Utiliser Pandoc**
```bash
# Installer Pandoc: https://pandoc.org/installing.html
pandoc presentation_slides.md -o presentation.pptx
```

**Méthode B: Utiliser Marp (pour développeurs)**
```bash
# Installer Marp CLI
npm install -g @marp-team/marp-cli

# Convertir en PowerPoint
marp presentation_slides.md --pptx -o presentation.pptx

# Ou en PDF
marp presentation_slides.md --pdf -o presentation.pdf
```

**Méthode C: Copier-coller manuel**
1. Ouvrir `presentation_slides.md` dans un éditeur de texte
2. Créer une présentation PowerPoint vide
3. Copier le contenu de chaque section (entre les `---`)
4. Coller dans des slides PowerPoint
5. Ajuster la mise en forme

---

## 🎤 Structure de la Présentation

### Durée Totale: ~12 minutes (4 min × 3 personnes)

### Répartition par Personne

#### **Oussama (Architecte) - 4 minutes**
**Slides à couvrir:**
1. **Slide 1:** Title (30 sec) - Introduction rapide
2. **Slide 2-3:** Overview (1 min) - Évolution et résultat final
3. **Slide 4:** Architecture MVC (1 min)
4. **Slide 5:** REST API (1 min)
5. **Slide 6:** CI/CD (30 sec)
6. **Slide 7:** Database (1 min)

**Points clés:**
- Expliquer l'architecture générale du projet
- Montrer l'évolution (jour 1 → jour 5)
- Présenter les endpoints principaux
- Expliquer l'intégration MongoDB Atlas

---

#### **Amir (Quality Assurance) - 4 minutes**
**Slides à couvrir:**
1. **Slide 8:** Tests Unitaires (1 min)
2. **Slide 9:** Tests d'Intégration (1 min)
3. **Slide 10:** Métriques d'Évaluation (2 min)

**Points clés:**
- Expliquer le module TesteurLabyrinthe
- Montrer les résultats des tests (419 → 532 murs)
- Présenter les 10 métriques d'évaluation
- Montrer le système de notation par étoiles

---

#### **Ahmed (DevOps) - 4 minutes**
**Slides à couvrir:**
1. **Slide 11:** Spécifications Techniques (1 min) - Bridge Python
2. **Slide 12:** Déploiement (1.5 min) - Render + infra
3. **Slide 13:** Monitoring (1.5 min) - cURL, Postman, métriques

**Points clés:**
- Expliquer le bridge Node.js ↔ Python
- Montrer l'infrastructure déployée (Render + MongoDB Atlas)
- Présenter les outils de monitoring
- Montrer les métriques de performance (temps de réponse)

---

#### **Tous Ensemble - 2 minutes**
**Slides à couvrir:**
1. **Slide 14-15:** Daily Routine (1 min) - Git workflow, communication
2. **Slide 16:** Bilan (30 sec) - Résultats quantitatifs
3. **Slide 17:** Questions (30 sec)

---

## 💡 Conseils pour la Présentation

### Avant la Présentation

1. **Testez votre setup:**
   - Ouvrez `presentation.html` et parcourez toutes les slides
   - Vérifiez que tout s'affiche correctement
   - Testez la navigation au clavier

2. **Préparez votre discours:**
   - Relisez vos rapports d'activité (RA/)
   - Notez les points clés à mentionner
   - Chronométrez-vous (4 min max par personne)

3. **Préparez la démo (optionnel):**
   - Testez que le site est accessible: https://pacmaz-s1-n.onrender.com/
   - ⚠️ **Important:** Le site peut dormir après 15 min (free tier)
   - Faites une requête 5 min avant la présentation pour le "réveiller"

### Pendant la Présentation

1. **Introduction (Slide 1 - 30 sec):**
   - "Bonjour, nous sommes l'équipe X"
   - "Nous allons présenter notre projet de génération de labyrinthes Pacman"
   - "Nous sommes 3 personnes avec des rôles complémentaires"

2. **Corps de la présentation:**
   - **Parlez naturellement**, pas besoin de lire mot à mot
   - **Montrez l'enthousiasme** pour votre travail
   - **Utilisez des exemples concrets** de vos RA
   - **Référencez les slides:** "Comme vous pouvez le voir ici..."

3. **Transitions:**
   - **Oussama → Amir:** "Maintenant, Amir va vous présenter tout ce qui concerne la qualité et les tests"
   - **Amir → Ahmed:** "Je passe la parole à Ahmed pour la partie déploiement et monitoring"
   - **Ahmed → Tous:** "Pour finir, je vais vous parler rapidement de notre routine quotidienne"

4. **Conclusion (Slide 16-17 - 1 min):**
   - Résumer les résultats (2000+ lignes de code, 6 endpoints, déployé en prod)
   - Mentionner les perspectives (auth, React UI, ML)
   - "Merci de votre attention, avez-vous des questions ?"

---

## 🎬 Option: Démonstration Live

Si vous avez le temps (et une bonne connexion), vous pouvez faire une démo rapide (1 min):

### Scénario de Démo (60 secondes)

1. **Ouvrir le site** (10 sec)
   ```
   https://pacmaz-s1-n.onrender.com/
   ```

2. **Générer un labyrinthe** (20 sec)
   - Entrer: largeur=15, hauteur=10
   - Cliquer "Générer"
   - Montrer le labyrinthe affiché

3. **Montrer les métriques** (20 sec)
   - Scroller vers le bas
   - Montrer les 10 métriques calculées
   - Montrer les couleurs (vert/orange/rouge)

4. **Montrer l'API** (10 sec)
   - Ouvrir un nouvel onglet
   - Aller sur: `/api/stats`
   - Montrer le JSON retourné

**⚠️ Attention:**
- Le site peut être lent (free tier Render)
- Préparez un screenshot de secours au cas où
- **Testez 5 minutes avant !**

---

## 📋 Checklist du Jour J

### 30 Minutes Avant

- [ ] Ouvrir `presentation.html` sur votre ordinateur
- [ ] Tester la navigation (flèches, boutons)
- [ ] Vérifier que le site est accessible (https://pacmaz-s1-n.onrender.com/)
- [ ] Faire une requête pour "réveiller" le serveur
- [ ] Préparer votre matériel (ordinateur portable, câbles, adaptateurs)

### 10 Minutes Avant

- [ ] Connecter votre ordinateur au projecteur
- [ ] Tester l'affichage (mode duplication ou extension)
- [ ] Ouvrir `presentation.html` en mode plein écran (F11)
- [ ] Positionner les slides sur la première (Title)
- [ ] Prendre une grande respiration 😊

### Pendant

- [ ] Parler clairement et pas trop vite
- [ ] Regarder l'audience, pas l'écran
- [ ] Utiliser les flèches du clavier pour naviguer
- [ ] Respecter le timing (4 min max)
- [ ] Sourire !

---

## 🆘 Plan B: Si Problème Technique

### Problème 1: Ordinateur ne se connecte pas au projecteur
**Solution:**
- Utilisez l'ordinateur de la salle
- Ou présentez sur votre écran (si petit groupe)
- Ou imprimez les slides principales (backup papier)

### Problème 2: Présentation HTML ne s'ouvre pas
**Solution:**
- Ouvrez `presentation_slides.md` dans un éditeur de texte
- Lisez directement depuis le Markdown
- Ou improvisez en suivant la structure des RA

### Problème 3: Site web inaccessible (pour la démo)
**Solution:**
- Montrez des screenshots préparés à l'avance
- Expliquez verbalement: "Le site est déployé sur Render mais peut être en veille"
- Montrez le code dans `src/` à la place

---

## 📸 Screenshots à Préparer (Backup)

Si vous voulez des screenshots de secours, prenez:

1. **Interface web avec labyrinthe généré**
   - Screenshot complet de l'interface
   - Avec métriques visibles

2. **Postman collection**
   - Screenshot de vos requêtes organisées

3. **MongoDB Atlas dashboard**
   - Screenshot de la collection `mazes`

4. **GitHub Actions**
   - Screenshot des tests qui passent (green checkmarks)

Sauvegardez-les dans un dossier `screenshots/` au cas où.

---

## 🎯 Messages Clés à Retenir

**Si vous ne retenez que 3 choses:**

1. **Nous avons livré un web service complet et fonctionnel**
   - Déployé en production (Render)
   - Avec base de données cloud (MongoDB Atlas)
   - API REST complète (6 endpoints)

2. **Nous avons assuré la qualité**
   - Tests automatisés (10/10 passing)
   - 10 métriques d'évaluation
   - Pipeline CI/CD

3. **Nous avons travaillé en équipe**
   - Répartition claire des rôles
   - Git workflow collaboratif
   - Documentation quotidienne (RA)

---

## ✅ Dernières Vérifications

Avant de dormir ce soir:
- [ ] Relire ce guide
- [ ] Parcourir toutes les slides une fois
- [ ] Relire votre RA personnel
- [ ] Vérifier que le site fonctionne
- [ ] Charger votre ordinateur portable
- [ ] Préparer vos adaptateurs/câbles

**Demain matin:**
- [ ] Arriver 10 minutes en avance
- [ ] Tester le setup avec le projecteur
- [ ] Respirer profondément
- [ ] Vous allez assurer ! 🚀

---

## 📞 Questions Fréquentes

**Q: Combien de temps dure la présentation ?**
R: ~12 minutes (4 min × 3 personnes) + 2-3 min de questions

**Q: Faut-il montrer le code ?**
R: Pas nécessaire, les slides suffisent. Mais vous pouvez montrer un extrait si on vous pose une question technique.

**Q: Faut-il faire une démo live ?**
R: Optionnel. Si le temps le permet et que la connexion est bonne, ça fait toujours effet. Sinon, les slides suffisent.

**Q: Que faire si on nous pose une question difficile ?**
R: 
1. Ne paniquez pas
2. Reformulez la question pour gagner du temps
3. Si vous savez pas: "C'est une bonne question, nous n'avons pas encore exploré cet aspect"
4. Ou: "Je peux vous montrer dans le code après la présentation"

**Q: Faut-il mémoriser les chiffres (lignes de code, etc.) ?**
R: Non, ils sont sur les slides. Mais retenez les principaux:
- 6 endpoints REST
- 10 métriques d'évaluation
- 10/10 tests passing
- 3-50 dimensions supportées

---

## 🎉 Bonne Chance !

Vous avez fait un excellent travail pendant ces 5 jours. Vous avez livré:
- ✅ Un système complet et fonctionnel
- ✅ Une architecture propre (MVC)
- ✅ Des tests automatisés
- ✅ Un déploiement en production
- ✅ Une documentation complète

**Vous êtes prêts. Vous allez cartonner ! 💪**

---

**Dernière chose:** Amusez-vous ! La présentation est l'occasion de montrer votre travail et d'en être fiers. Souriez, parlez avec enthousiasme, et tout ira bien.

**Bon courage pour demain ! 🚀**

