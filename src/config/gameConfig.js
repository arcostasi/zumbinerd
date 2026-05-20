/**
 * ZumbiNerd - Game Configuration
 * Phaser 3 configuration object
 */

import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, SCENES } from '../utils/constants.js';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import PauseScene from '../scenes/PauseScene.js';
import GameOverScene from '../scenes/GameOverScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0a0a0f',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY },
            debug: false,
            fps: 60,
            fixedStep: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 640,
            height: 360
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        PauseScene,
        GameOverScene
    ]
};

export default gameConfig;
