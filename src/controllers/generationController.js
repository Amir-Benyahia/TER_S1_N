/**
 * generationController.js
 * Contrôleur gérant la logique métier de la génération de labyrinthes
 */


// Import du service PythonBridge
const pythonBridge = require('../services/pythonBridge');

/**
 * Génère un labyrinthe avec les dimensions demandées
 * @param {Object} req - Requête Express (query: largeur, hauteur)
 * @param {Object} res - Réponse Express (JSON: labyrinthe, largeur, hauteur, nb_lignes, murs_restants)
 */
async function generateMaze(req, res) {
    try {
        // Récupération des paramètres bruts
        const largeurParam = req.query.largeur;
        const hauteurParam = req.query.hauteur;
        
        // Validation des types AVANT conversion
        // Si les paramètres sont fournis, ils doivent être numériques
        if (largeurParam !== undefined && isNaN(Number(largeurParam))) {
            return res.status(400).json({
                error: 'Le paramètre largeur doit être un nombre'
            });
        }
        if (hauteurParam !== undefined && isNaN(Number(hauteurParam))) {
            return res.status(400).json({
                error: 'Le paramètre hauteur doit être un nombre'
            });
        }
        
        // Conversion avec valeurs par défaut
        const largeur = largeurParam !== undefined ? parseInt(largeurParam) : 10;
        const hauteur = hauteurParam !== undefined ? parseInt(hauteurParam) : 8;
        
        // Validation des bornes (min: 3 - max: 50)
        if (largeur < 3 || largeur > 50 || hauteur < 3 || hauteur > 50) {
            return res.status(400).json({
                error: 'Les dimensions doivent être entre 3 et 50'
            });
        }
        
        console.log(`📊 Génération d'un labyrinthe ${largeur}x${hauteur}...`);

        // Appel au générateur Python via le bridge
        const result = await pythonBridge.generateMaze(largeur, hauteur);
        
        console.log(`✅ Labyrinthe généré avec succès (${result.nb_lignes} lignes)`);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error.message);
        res.status(500).json({
            error: 'Erreur lors de la génération du labyrinthe',
            details: error.message
        });
    }
}

module.exports = { generateMaze };
