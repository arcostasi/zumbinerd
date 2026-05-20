/**
 * ZumbiNerd - Pause Scene
 * Overlay pause menu with resume, restart, and quit options
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PAUSE });
    }

    create() {
        // Semi-transparent overlay
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

        // Pause panel
        const panelWidth = 400;
        const panelHeight = 350;

        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.95);
        panel.fillRoundedRect(GAME_WIDTH / 2 - panelWidth / 2, GAME_HEIGHT / 2 - panelHeight / 2, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0x7cb342, 1);
        panel.strokeRoundedRect(GAME_WIDTH / 2 - panelWidth / 2, GAME_HEIGHT / 2 - panelHeight / 2, panelWidth, panelHeight, 16);

        // Pause title
        const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'PAUSADO', {
            fontFamily: 'Creepster',
            fontSize: '48px',
            color: '#7cb342'
        }).setOrigin(0.5);

        // Menu buttons
        const buttonConfigs = [
            { text: 'CONTINUAR', callback: () => this.resumeGame() },
            { text: 'REINICIAR', callback: () => this.restartGame() },
            { text: 'MENU', callback: () => this.goToMenu() }
        ];

        const startY = GAME_HEIGHT / 2 - 30;
        const spacing = 60;

        buttonConfigs.forEach((config, index) => {
            this.createButton(GAME_WIDTH / 2, startY + (index * spacing), config.text, config.callback);
        });

        // Resume on ESC or P
        this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
        this.input.keyboard.once('keydown-P', () => this.resumeGame());
    }

    createButton(x, y, text, callback) {
        const buttonWidth = 220;
        const buttonHeight = 45;

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x0a0a0f, 0.8);
        buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
        buttonBg.lineStyle(2, 0x7cb342, 0.8);
        buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);

        const buttonText = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#eaeaea'
        }).setOrigin(0.5);

        const hitZone = this.add.rectangle(x, y, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x7cb342, 0.3);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
            buttonBg.lineStyle(2, 0x7cb342, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
            buttonText.setColor('#7cb342');
        });

        hitZone.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x0a0a0f, 0.8);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
            buttonBg.lineStyle(2, 0x7cb342, 0.8);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
            buttonText.setColor('#eaeaea');
        });

        hitZone.on('pointerup', callback);
    }

    resumeGame() {
        this.scene.resume(SCENES.GAME);
        this.scene.stop();
    }

    restartGame() {
        if (window.audioSystem) {
            window.audioSystem.stopMusic();
        }
        this.scene.stop(SCENES.GAME);
        this.scene.start(SCENES.GAME, { level: 1, score: 0 });
        this.scene.stop();
    }

    goToMenu() {
        if (window.audioSystem) {
            window.audioSystem.stopMusic();
        }
        this.scene.stop(SCENES.GAME);
        this.scene.start(SCENES.MENU);
        this.scene.stop();
    }
}
