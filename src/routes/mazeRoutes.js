/**
 * mazeRoutes.js
 * Définit les endpoints API pour la génération de labyrinthes
 */

const express = require('express');
const router = express.Router();
// Extension explicite pour éviter les collisions avec les anciens fichiers sans export
const generationController = require('../controllers/generationController.js');

// ========== Routes de génération ==========
// Génère un labyrinthe avec les dimensions spécifiées
// Query params: largeur, hauteur, save (true/false), name, userId, tags
// Exemple: /api/generate?largeur=10&hauteur=8&save=true&name=MonLabyrinthe
router.get('/generate', generationController.generateMaze);

// ========== Routes de récupération ==========
// Récupère tous les labyrinthes sauvegardés
// Query params: largeur, hauteur, limit, userId
// Exemple: /api/mazes?largeur=10&limit=20
router.get('/mazes', generationController.getAllMazes);

// Récupère un labyrinthe spécifique par ID
// Exemple: /api/mazes/673c5f8e9a1234567890abcd
router.get('/mazes/:id', generationController.getMazeById);

// Obtient des statistiques sur les labyrinthes
// Exemple: /api/stats
router.get('/stats', generationController.getMazeStats);

// ========== Routes de suppression ==========
// Supprime un labyrinthe par ID
// Exemple: DELETE /api/mazes/673c5f8e9a1234567890abcd
router.delete('/mazes/:id', generationController.deleteMaze);

module.exports = router;
