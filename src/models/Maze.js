/**
 * Maze.js
 * Modèle Mongoose pour les labyrinthes
 */

const mongoose = require('mongoose');

const mazeSchema = new mongoose.Schema({
  // Dimensions du labyrinthe
  largeur: {
    type: Number,
    required: true,
    min: 3,
    max: 50
  },
  hauteur: {
    type: Number,
    required: true,
    min: 3,
    max: 50
  },
  
  // Structure du labyrinthe (tableau 2D)
  labyrinthe: {
    type: [[String]],
    required: true
  },
  
  // Métadonnées
  nb_lignes: {
    type: Number,
    required: true
  },
  murs_restants: {
    type: Number,
    required: true
  },
  
  // Informations de génération
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Optionnel: Métadonnées utilisateur
  userId: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false,
    default: function() {
      return `Maze_${this.largeur}x${this.hauteur}_${Date.now()}`;
    }
  },
  
  // Tags pour classification
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'mazes' // Nom de la collection dans MongoDB
});

// Index pour recherche rapide
mazeSchema.index({ largeur: 1, hauteur: 1 });
mazeSchema.index({ generatedAt: -1 });
mazeSchema.index({ userId: 1 });

// Méthode virtuelle pour obtenir la taille totale
mazeSchema.virtual('size').get(function() {
  return this.largeur * this.hauteur;
});

// Méthode pour obtenir des statistiques
mazeSchema.methods.getStats = function() {
  return {
    id: this._id,
    dimensions: `${this.largeur}x${this.hauteur}`,
    totalCells: this.largeur * this.hauteur,
    wallsRemaining: this.murs_restants,
    linesInMaze: this.nb_lignes,
    generatedAt: this.generatedAt
  };
};

// Méthode statique pour trouver les labyrinthes par dimensions
mazeSchema.statics.findByDimensions = function(largeur, hauteur) {
  return this.find({ largeur, hauteur }).sort({ generatedAt: -1 });
};

const Maze = mongoose.model('Maze', mazeSchema);

module.exports = Maze;

