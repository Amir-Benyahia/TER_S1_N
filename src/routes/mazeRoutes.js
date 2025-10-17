/**
 * mazeRoutes.js
 * Définit les endpoints API pour la génération de labyrinthes
 */

const express = require('express');
const router = express.Router();
const generationController = require('../controllers/generationController');

// Génère un labyrinthe avec les dimensions spécifiées
router.get('/generate', generationController.generateMaze);

module.exports = router;
