/**
 * mazeRoutes.js
 * Définit les endpoints API pour la génération de labyrinthes
 */
// Import des dépendances
const express = require('express');
const router = express.Router();
const generationController = require('../controllers/generationController');
const aiController = require('../controllers/aiController'); 

// Route existante pour générer le labyrinthe
router.get('/generate', generationController.generateMaze);

// Nouvelle route pour calculer le mouvement du fantôme
router.post('/move', aiController.getNextMove);

module.exports = router;