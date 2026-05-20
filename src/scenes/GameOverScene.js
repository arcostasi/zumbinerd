/**
 * ZumbiNerd - Game Over / Victory Scene
 * Shows final score and options to retry or return to menu
 */

import { SCENES, ASSETS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME_OVER });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.won = data.won || false;
    }

    create() {
        // Fade in
        this.cameras.main.fadeIn(500);

        // Background
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSETS.BACKGROUND);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // Dark overlay
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

        // Title configurations based on victory or defeat
        const titleText = this.won ? 'SUCESSO DE COMPILAÇAO' : 'GAME OVER';
        const titleColor = this.won ? '#39ff14' : '#ff6b6b';
        const titleShadowColor = this.won ? '#1b5e20' : '#5c0000';

        // Title with animation
        const titleShadow = this.add.text(GAME_WIDTH / 2 + 4, 120 + 4, titleText, {
            fontFamily: 'Creepster',
            fontSize: this.won ? '56px' : '72px',
            color: titleShadowColor
        }).setOrigin(0.5);

        const title = this.add.text(GAME_WIDTH / 2, 120, titleText, {
            fontFamily: 'Creepster',
            fontSize: this.won ? '56px' : '72px',
            color: titleColor
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Zombie sprite presentation
        const zombieAnim = this.won ? 'player-idle' : 'player-dead';
        const zombie = this.add.sprite(GAME_WIDTH / 2, 250, this.won ? 'idle_1' : 'dead_10');
        zombie.setScale(2.2);
        
        if (this.won) {
            zombie.play('player-idle');
        }

        // Subtitle message
        const subMsg = this.won ? 'O código compilou com 0 avisos e 0 erros!' : 'Segfault na linha 404: Stack Overflow.';
        this.add.text(GAME_WIDTH / 2, 320, subMsg, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: this.won ? '#39ff14' : '#95e1d3'
        }).setOrigin(0.5);

        // Score panel
        const panelWidth = 380;
        const panelHeight = 110;
        const panelX = GAME_WIDTH / 2;
        const panelY = 410;

        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 0.95);
        panel.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 12);
        panel.lineStyle(2, this.won ? 0x39ff14 : 0x7cb342, 1);
        panel.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 12);

        // Score label
        this.add.text(panelX, panelY - 25, 'PONTUAÇÃO FINAL', {
            fontFamily: '"Press Start 2P"',
            fontSize: '11px',
            color: '#95e1d3'
        }).setOrigin(0.5);

        // Score value with counting animation
        const scoreText = this.add.text(panelX, panelY + 15, '0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            color: this.won ? '#39ff14' : '#7cb342'
        }).setOrigin(0.5);

        this.tweens.addCounter({
            from: 0,
            to: this.finalScore,
            duration: 1200,
            ease: 'Power2',
            onUpdate: (tween) => {
                scoreText.setText(Math.floor(tween.getValue()).toString());
            }
        });

        // Highscore records checking
        const highscores = JSON.parse(localStorage.getItem('zumbinerd_scores')) || [];
        const currentMinRecord = highscores.length < 5 ? 0 : highscores[highscores.length - 1].score;
        const legacyRecord = parseInt(localStorage.getItem('zumbinerd_highscore')) || 0;
        const isNewRecord = this.finalScore > 0 && (this.finalScore > currentMinRecord || this.finalScore > legacyRecord);

        // Submit and update leaderboard if new record
        if (isNewRecord) {
            const newRecordText = this.add.text(GAME_WIDTH / 2, 485, '🏆 NOVO RECORDE! 🏆', {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                color: '#ffd700'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: newRecordText,
                alpha: 0.4,
                duration: 400,
                yoyo: true,
                repeat: -1
            });

            // Prompt user for developer tag after score counter finishes
            this.time.delayedCall(1500, () => {
                if (window.openHighscoreInputModal) {
                    window.openHighscoreInputModal(this.finalScore);
                } else {
                    const devTag = prompt('Você quebrou o recorde! Insira sua TAG de programador (máx 10 letras):', 'DEV');
                    if (window.addHighScore) {
                        window.addHighScore(devTag || 'DEV', this.finalScore);
                    }
                }
            });
        } else {
            // Display static best record
            const bestScore = highscores[0]?.score || legacyRecord;
            this.add.text(panelX, panelY + 40, `RECORDE ATUAL: ${bestScore}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#4a4a6a'
            }).setOrigin(0.5);
        }

        // Action Buttons
        const buttonY = 540;
        this.createButton(GAME_WIDTH / 2 - 130, buttonY, 'JOGAR NOVAMENTE', () => {
            if (this.countdownTimer) this.countdownTimer.destroy();
            this.retryGame();
        });
        this.createButton(GAME_WIDTH / 2 + 130, buttonY, 'MENU PRINCIPAL', () => {
            if (this.countdownTimer) this.countdownTimer.destroy();
            this.goToMenu();
        });

        // 30-second countdown text at the bottom center
        this.countdownText = this.add.text(GAME_WIDTH / 2, 582, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#ff6b6b'
        }).setOrigin(0.5);

        this.countdown = 30;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                const modal = document.getElementById('highscore-modal');
                const isModalActive = modal && modal.classList.contains('active');
                
                if (isModalActive) {
                    this.countdownText.setText('');
                    return;
                }
                
                this.countdownText.setText(`RETORNANDO AO MENU EM ${this.countdown}S`);
                
                if (this.countdown <= 0) {
                    this.countdownTimer.destroy();
                    this.goToMenu();
                }
                
                this.countdown--;
            },
            callbackScope: this,
            loop: true
        });
    }

    createButton(x, y, text, callback) {
        const buttonWidth = 230;
        const buttonHeight = 45;

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x1a1a2e, 0.9);
        buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x7cb342, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

        const buttonText = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#eaeaea'
        }).setOrigin(0.5);

        const hitZone = this.add.rectangle(x, y, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x7cb342, 0.3);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(3, 0x7cb342, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonText.setColor('#39ff14');
        });

        hitZone.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x1a1a2e, 0.9);
            buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonBg.lineStyle(2, 0x7cb342, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            buttonText.setColor('#eaeaea');
        });

        hitZone.on('pointerup', callback);
    }

    retryGame() {
        this.cameras.main.fadeOut(300);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.GAME, { level: 1, score: 0 });
        });
    }

    goToMenu() {
        this.cameras.main.fadeOut(300);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.MENU);
        });
    }
}
