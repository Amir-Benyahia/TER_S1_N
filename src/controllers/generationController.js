/**
 * generationController.js
 * Contrôleur gérant la logique métier de la génération de labyrinthes
 */

// Import du service PythonBridge
const pythonBridge = require('../services/pythonBridge');
const Maze = require('../models/Maze');

/**
 * Génère un labyrinthe avec les dimensions demandées
 * @param {Object} req - Requête Express (query: largeur, hauteur)
 * @param {Object} res - Réponse Express (JSON: labyrinthe, largeur, hauteur, nb_lignes, murs_restants)
 */
async function generateMaze(req, res) {
    try {
        // Récupération et conversion des paramètres
        const largeur = parseInt(req.query.largeur) || 10;
        const hauteur = parseInt(req.query.hauteur) || 8;
        
        // Validation des types
        if (isNaN(largeur) || isNaN(hauteur)) {
            return res.status(400).json({
                error: 'Les paramètres largeur et hauteur doivent être des nombres'
            });
        }
        
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
        
        // Sauvegarde dans MongoDB (optionnel - paramètre save=true)
        let savedMaze = null;
        if (req.query.save === 'true') {
            try {
                const mazeData = {
                    largeur: result.largeur,
                    hauteur: result.hauteur,
                    labyrinthe: result.labyrinthe,
                    nb_lignes: result.nb_lignes,
                    murs_restants: result.murs_restants,
                    name: req.query.name || undefined,
                    userId: req.query.userId || undefined,
                    tags: req.query.tags ? req.query.tags.split(',') : []
                };
                
                savedMaze = await Maze.create(mazeData);
                console.log(`💾 Labyrinthe sauvegardé avec l'ID: ${savedMaze._id}`);
            } catch (dbError) {
                console.error('⚠️ Erreur lors de la sauvegarde:', dbError.message);
                // Continue même si la sauvegarde échoue
            }
        }
        
        res.json({
            ...result,
            saved: !!savedMaze,
            id: savedMaze ? savedMaze._id : null
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error.message);
        res.status(500).json({
            error: 'Erreur lors de la génération du labyrinthe',
            details: error.message
        });
    }
}

/**
 * Récupère tous les labyrinthes sauvegardés
 * @param {Object} req - Requête Express (query optionnel: largeur, hauteur, limit)
 * @param {Object} res - Réponse Express (JSON: array de labyrinthes)
 */
async function getAllMazes(req, res) {
    try {
        const { largeur, hauteur, limit = 50, userId } = req.query;
        
        // Construction du filtre
        const filter = {};
        if (largeur) filter.largeur = parseInt(largeur);
        if (hauteur) filter.hauteur = parseInt(hauteur);
        if (userId) filter.userId = userId;
        
        const mazes = await Maze.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-labyrinthe'); // Exclure le labyrinthe pour économiser la bande passante
        
        console.log(`📚 ${mazes.length} labyrinthe(s) récupéré(s)`);
        
        res.json({
            count: mazes.length,
            mazes: mazes.map(maze => maze.getStats())
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.message);
        res.status(500).json({
            error: 'Erreur lors de la récupération des labyrinthes',
            details: error.message
        });
    }
}

/**
 * Récupère un labyrinthe spécifique par son ID
 * @param {Object} req - Requête Express (params: id)
 * @param {Object} res - Réponse Express (JSON: labyrinthe complet)
 */
async function getMazeById(req, res) {
    try {
        const maze = await Maze.findById(req.params.id);
        
        if (!maze) {
            return res.status(404).json({
                error: 'Labyrinthe non trouvé'
            });
        }
        
        console.log(`🔍 Labyrinthe ${req.params.id} récupéré`);
        
        res.json({
            id: maze._id,
            largeur: maze.largeur,
            hauteur: maze.hauteur,
            labyrinthe: maze.labyrinthe,
            nb_lignes: maze.nb_lignes,
            murs_restants: maze.murs_restants,
            name: maze.name,
            tags: maze.tags,
            createdAt: maze.createdAt,
            stats: maze.getStats()
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.message);
        res.status(500).json({
            error: 'Erreur lors de la récupération du labyrinthe',
            details: error.message
        });
    }
}

/**
 * Supprime un labyrinthe par son ID
 * @param {Object} req - Requête Express (params: id)
 * @param {Object} res - Réponse Express (JSON: confirmation)
 */
async function deleteMaze(req, res) {
    try {
        const maze = await Maze.findByIdAndDelete(req.params.id);
        
        if (!maze) {
            return res.status(404).json({
                error: 'Labyrinthe non trouvé'
            });
        }
        
        console.log(`🗑️ Labyrinthe ${req.params.id} supprimé`);
        
        res.json({
            message: 'Labyrinthe supprimé avec succès',
            id: req.params.id
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error.message);
        res.status(500).json({
            error: 'Erreur lors de la suppression du labyrinthe',
            details: error.message
        });
    }
}

/**
 * Obtient des statistiques sur les labyrinthes
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express (JSON: statistiques)
 */
async function getMazeStats(req, res) {
    try {
        const totalMazes = await Maze.countDocuments();
        const dimensionStats = await Maze.aggregate([
            {
                $group: {
                    _id: { largeur: '$largeur', hauteur: '$hauteur' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        const recentMazes = await Maze.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('largeur hauteur createdAt name');
        
        res.json({
            total: totalMazes,
            topDimensions: dimensionStats.map(stat => ({
                dimensions: `${stat._id.largeur}x${stat._id.hauteur}`,
                count: stat.count
            })),
            recent: recentMazes
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du calcul des statistiques:', error.message);
        res.status(500).json({
            error: 'Erreur lors du calcul des statistiques',
            details: error.message
        });
    }
}

module.exports = { 
    generateMaze,
    getAllMazes,
    getMazeById,
    deleteMaze,
    getMazeStats
};
