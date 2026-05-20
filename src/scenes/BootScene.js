/**
 * ZumbiNerd - Boot Scene
 * Minimal loading for essential assets before main preload
 */

import { SCENES } from '../utils/constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        // Boot scene loads minimal assets needed for loading screen
        // Main assets are loaded in PreloadScene
    }

    create() {
        // Set up any global game settings
        this.scale.on('resize', this.resize, this);

        // Transition to preload scene
        this.scene.start(SCENES.PRELOAD);
    }

    resize(gameSize) {
        // Handle window resize if needed
    }
}
