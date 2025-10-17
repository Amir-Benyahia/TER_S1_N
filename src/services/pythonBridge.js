/**
 * pythonBridge.js
 * Service indépendant pour exécuter du code Python depuis Node.js
 * Gère la communication entre l'API Express et le générateur de labyrinthes Python
 */

const { spawn } = require('child_process');
const path = require('path');

class PythonBridge {
    constructor() {
    // Chemin vers Python - utilise le venv local si disponible, sinon Python système
    const venvPath = path.join(__dirname, '..', '..', '.venv', 'bin', 'python3');
    const fs = require('fs');
    
    // Vérifie si le venv existe, sinon utilise python3 du système
    if (fs.existsSync(venvPath)) {
        this.pythonPath = venvPath;
    } else {
        // Sur Render ou autres environnements, utilise python3 du système
        this.pythonPath = 'python3';
    }
    
    this.timeout = 10000; 
}

    /**
     * Exécute un script Python et retourne le résultat
     * @param {string|null} scriptPath - Chemin du script 
     * @param {Array} args - Arguments pour Python
     * @param {number} timeout - Temps max d'exécution en ms
     * @returns {Promise<Object>} Résultat parsé en JSON
     */
    executeScript(scriptPath, args = [], timeout = this.timeout) {
        return new Promise((resolve, reject) => {
            const scriptArgs = scriptPath ? [scriptPath, ...args] : args;
            const pythonProcess = spawn(this.pythonPath, scriptArgs);
            
            let dataString = '';
            let errorString = '';
            
            // Timer pour éviter les blocages
            const timeoutId = setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Timeout: Le script Python a pris trop de temps'));
            }, timeout);
            
            // Récupération de la sortie standard (résultat JSON)
            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });
            
            // Récupération des erreurs Python
            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });
            
            // Gestion des erreurs de lancement
            pythonProcess.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(new Error(`Erreur lors du démarrage du processus Python: ${error.message}`));
            });
            
            // Traitement de la fin du processus
            pythonProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                
                if (code !== 0) {
                    reject(new Error(`Le script Python a échoué (code ${code}): ${errorString}`));
                    return;
                }
                
                // Parse le JSON retourné par Python
                try {
                    const result = JSON.parse(dataString);
                    resolve(result);
                } catch (e) {
                    reject(new Error(`Erreur de parsing JSON: ${e.message}\nDonnées reçues: ${dataString}`));
                }
            });
        });
    }

    /**
     * Génère un labyrinthe en appelant le générateur Python
     * @param {number} largeur - Largeur du labyrinthe (3-50)
     * @param {number} hauteur - Hauteur du labyrinthe (3-50)
     * @returns {Promise<Object>} Objet contenant la matrice et métadonnées
     */
    async generateMaze(largeur, hauteur) {
        // Validation des dimensions
        if (largeur < 3 || largeur > 50 || hauteur < 3 || hauteur > 50) {
            throw new Error('Les dimensions doivent être entre 3 et 50');
        }
        
        // Code Python exécuté directement (utilise GenerateurKruskal)
        const pythonCode = `
import sys
import json
sys.path.insert(0, '${path.join(__dirname, 'mazeGeneration').replace(/\\/g, '/')}')
from maze_generator import GenerateurKruskal

largeur = ${largeur}
hauteur = ${hauteur}

generateur = GenerateurKruskal()
labyrinthe, murs_restants = generateur.generer(largeur, hauteur)

resultat = {
    'labyrinthe': labyrinthe,
    'largeur': largeur,
    'hauteur': hauteur,
    'nb_lignes': len(labyrinthe),
    'murs_restants': len(murs_restants)
}

print(json.dumps(resultat))
`;
        
        // Exécution du code Python et retour du résultat
        const result = await this.executeScript(null, ['-c', pythonCode]);
        return result;
    }
}

// Export d'une instance unique (pattern Singleton)
module.exports = new PythonBridge();
