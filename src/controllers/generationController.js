// generationController.js
// This script triggers the Python maze generator and prints the result in the browser

function generateMaze() {
    // Use Node.js child_process to run the Python main script
    const { spawn } = require('child_process');
    const path = require('path');
    const pythonProcess = spawn('python', [
        path.join(__dirname, '../services/mazeGeneration/main.py')
    ]);

    pythonProcess.stdout.on('data', (data) => {
        // Print the maze matrix and output to the console
        console.log(data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}

module.exports = { generateMaze };
