/**
 * database.js
 * Configuration de la connexion MongoDB Atlas
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connecté à MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Erreur de connexion Mongoose: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose déconnecté de MongoDB Atlas');
});

module.exports = connectDB;

