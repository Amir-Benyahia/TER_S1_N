/**
 * mazeRoutes.js
 * Définit les endpoints API pour la génération de labyrinthes
 */

const express = require('express');
const router = express.Router();
// Extension explicite pour éviter les collisions avec les anciens fichiers sans export
const generationController = require('../controllers/generationController.js');
// adding a comment
// Génère un labyrinthe avec les dimensions spécifiées
router.get('/generate', generationController.generateMaze);

module.exports = router;
