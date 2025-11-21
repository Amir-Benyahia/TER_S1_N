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
        
        // Appel direct du générateur principal avec arguments
        const scriptPath = path.join(__dirname, 'mazeGeneration', 'maze_generator.py');
        const result = await this.executeScript(scriptPath, [
            largeur.toString(), 
            hauteur.toString()
        ]);
        return result;
    }
    /**
     * Calcule le prochain déplacement d'un fantôme via le script Python
     * @param {Object} gameData - Données du jeu (grid, positions, strategy...)
     * @returns {Promise<Object>} { nextMove: [y, x], sharedMemory: {...} }
     */
    async computeGhostMove(gameData) {
        // Chemin vers ton nouveau script passerelle
        const scriptPath = path.join(__dirname, 'mazeGeneration', 'ai_bridge.py');
        
        // On convertit l'objet JS en chaîne JSON pour l'envoyer à Python
        // Attention : on doit passer un seul argument qui est la string JSON
        const jsonArgs = JSON.stringify(gameData);
        
        try {
            const result = await this.executeScript(scriptPath, [jsonArgs]);
            return result;
        } catch (error) {
            console.error("Erreur Python Bridge:", error);
            // Fallback de sécurité : si Python plante, le fantôme ne bouge pas
            return { nextMove: gameData.ghostPos, sharedMemory: gameData.sharedMemory };
        }
    }
}

// Export d'une instance unique (pattern Singleton)
module.exports = new PythonBridge();
