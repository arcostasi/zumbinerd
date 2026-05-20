/**
 * ZumbiNerd - Menu Scene
 * Main menu with animated background and interactive buttons
 */

import { SCENES, ASSETS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        // Add parallax background
        this.createBackground();

        // Add title
        this.createTitle();

        // Add menu buttons
        this.createMenuButtons();

        // Add animated zombie character
        this.createMenuZombie();

        // Add decorative elements
        this.createDecorations();

        // Add version text
        this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'v1.0.0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#4a4a4a'
        }).setOrigin(1, 1);
    }

    createBackground() {
        // Create tiled background
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSETS.BACKGROUND);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // Add dark overlay for better text readability
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4);

        // Add vignette effect
        const vignette = this.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
        vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    createTitle() {
        // Main title with glow effect
        const titleShadow = this.add.text(GAME_WIDTH / 2 + 4, 120 + 4, 'ZUMBINERD', {
            fontFamily: 'Creepster',
            fontSize: '96px',
            color: '#2d5016'
        }).setOrigin(0.5);

        const title = this.add.text(GAME_WIDTH / 2, 120, 'ZUMBINERD', {
            fontFamily: 'Creepster',
            fontSize: '96px',
            color: '#7cb342'
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(GAME_WIDTH / 2, 190, 'O Zumbi Programador', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#95e1d3'
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Animate subtitle with floating effect
        this.tweens.add({
            targets: subtitle,
            y: subtitle.y + 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenuButtons() {
        const buttonConfig = [
            { text: 'JOGAR', callback: () => this.startGame() },
            { text: 'HISTÓRIA', callback: () => this.showStory() },
            { text: 'OPÇÕES', callback: () => this.showOptions() },
            { text: 'CRÉDITOS', callback: () => this.showCredits() }
        ];

        const startY = 280;
        const spacing = 65;

        buttonConfig.forEach((config, index) => {
            this.createButton(GAME_WIDTH / 2, startY + (index * spacing), config.text, config.callback);
        });
    }

    createButton(x, y, text, callback) {
        // Button background
        const buttonBg = this.add.graphics();
        const buttonWidth = 280;
        const buttonHeight = 50;

        // Draw button shape
        buttonBg.fillStyle(0x1a1a2e, 0.9);
        buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x7cb342, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#eaeaea'
        }).setOrigin(0.5);

        // Create interactive zone
        const hitZone = this.add.rectangle(x, y, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true });

        // Hover effects
        hitZone.on('pointerover', () => {
            // Lazy load audio system context
            if (window.audioSystem) {
                window.audioSystem.initContext();
                if (window.audioSystem.musicEnabled && window.audioSystem.currentMusicType !== 'intro') {
                    window.audioSystem.startMusic('intro');
                }
            }
            buttonBg.clear();
            buttonBg.fillStyle(0x7cb342, 0.3);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(3, 0x7cb342, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonText.setColor('#7cb342');
            buttonText.setScale(1.05);
        });

        hitZone.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x1a1a2e, 0.9);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(2, 0x7cb342, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonText.setColor('#eaeaea');
            buttonText.setScale(1);
        });

        hitZone.on('pointerdown', () => {
            buttonText.setScale(0.95);
        });

        hitZone.on('pointerup', () => {
            buttonText.setScale(1.05);
            callback();
        });

        return { bg: buttonBg, text: buttonText, zone: hitZone };
    }

    createMenuZombie() {
        // Add zombie character on the right side
        const zombie = this.add.sprite(GAME_WIDTH - 200, GAME_HEIGHT - 170, 'idle_1');
        zombie.setScale(2);
        zombie.play('player-idle');

        // Add floating animation
        this.tweens.add({
            targets: zombie,
            y: zombie.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createDecorations() {
        // Add tombstones
        const tomb1 = this.add.image(100, GAME_HEIGHT - 80, ASSETS.TOMBSTONE1).setScale(2).setAlpha(0.6);
        const tomb2 = this.add.image(200, GAME_HEIGHT - 90, ASSETS.TOMBSTONE2).setScale(1.8).setAlpha(0.5);

        // Add dead bush
        const bush = this.add.image(150, GAME_HEIGHT - 60, ASSETS.DEAD_BUSH).setScale(0.8).setAlpha(0.4);

        // Add tree silhouette on left
        const tree = this.add.image(80, GAME_HEIGHT - 180, ASSETS.TREE).setScale(0.8).setAlpha(0.3);

        // Add floating particles effect
        this.createParticles();
    }

    createParticles() {
        // Create simple floating particle effect using graphics
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(0, GAME_HEIGHT);
            const size = Phaser.Math.Between(2, 5);

            const particle = this.add.circle(x, y, size, 0x7cb342, 0.3);

            this.tweens.add({
                targets: particle,
                y: particle.y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    particle.y = GAME_HEIGHT + 10;
                    particle.x = Phaser.Math.Between(0, GAME_WIDTH);
                    particle.alpha = 0.3;
                }
            });
        }
    }

    startGame() {
        if (window.audioSystem) {
            window.audioSystem.initContext();
            window.audioSystem.playCollect(); // Play select beep
        }

        // Fade out transition
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.GAME, { level: 1, score: 0 });
        });
    }

    showOptions() {
        if (window.audioSystem) {
            window.audioSystem.playCollect();
        }
        if (window.openHtmlModal) {
            window.openHtmlModal('options');
        } else {
            console.log('Options clicked');
        }
    }

    showCredits() {
        if (window.audioSystem) {
            window.audioSystem.playCollect();
        }
        if (window.openHtmlModal) {
            window.openHtmlModal('credits');
        } else {
            console.log('Credits clicked');
        }
    }

    showStory() {
        if (window.audioSystem) {
            window.audioSystem.playCollect();
        }
        if (window.openHtmlModal) {
            window.openHtmlModal('story');
        } else {
            console.log('Story clicked');
        }
    }
}
