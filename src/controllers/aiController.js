const pythonBridge = require('../services/pythonBridge');

/**
 * Endpoint API pour calculer le mouvement d'un fantôme
 * Reçoit un POST avec : { grid, ghostPos, pacmanPos, strategy, ... }
 */
async function getNextMove(req, res) {
    try {
        const gameData = req.body;

        // Validation basique
        if (!gameData.grid || !gameData.ghostPos || !gameData.pacmanPos) {
            return res.status(400).json({ 
                error: 'Données manquantes (grid, ghostPos ou pacmanPos requis)' 
            });
        }

        // Appel au pont Python
        const moveResult = await pythonBridge.computeGhostMove(gameData);
        
        // Réponse au client (le jeu d'Ahmed)
        res.json(moveResult);

    } catch (error) {
        console.error('❌ Erreur Controller IA:', error.message);
        res.status(500).json({ error: 'Erreur interne IA' });
    }
}

module.exports = { getNextMove };