/**
 * ZumbiNerd - Main Entry Point
 */

import './utils/AudioSystem.js';
import gameConfig from './config/gameConfig.js';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    // Initialize Phaser game
    const game = new Phaser.Game(gameConfig);

    // Store game instance globally for debugging
    window.game = game;
});
