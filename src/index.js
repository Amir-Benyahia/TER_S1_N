/**
 * index.js
 * Serveur Express principal - Point d'entrée de l'application
 */

const express = require('express');
const path = require('path');
const mazeRoutes = require('./routes/mazeRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(__dirname));

// Route principale - Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Montage des routes API
app.use('/api', mazeRoutes);

// Gestion des erreurs 404 pour les routes non définies
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`📡 API disponible sur http://localhost:${port}/api/generate`);
});
