/**
 * index.js
 * Serveur Express principal - Point d'entrée de l'application
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const mazeRoutes = require('./routes/mazeRoutes');
const connectDB = require('./config/database');

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

// Connexion à MongoDB puis démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB Atlas
    await connectDB();
    
    // Démarrage du serveur
    app.listen(port, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
      console.log(`📡 API Endpoints:`);
      console.log(`   - Générer: http://localhost:${port}/api/generate?largeur=10&hauteur=8`);
      console.log(`   - Sauvegarder: http://localhost:${port}/api/generate?largeur=10&hauteur=8&save=true`);
      console.log(`   - Liste: http://localhost:${port}/api/mazes`);
      console.log(`   - Stats: http://localhost:${port}/api/stats`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error.message);
    process.exit(1);
  }
};

startServer();
