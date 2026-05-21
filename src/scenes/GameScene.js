/**
 * ZumbiNerd - Game Scene
 * Main gameplay scene with player, platforms, collectibles, hazards, active enemies and goal.
 */

import { SCENES, ASSETS, GAME_WIDTH, GAME_HEIGHT, DEPTH, SCORE, PLAYER_SPEED, PLAYER_RUN_SPEED, PLAYER_JUMP_VELOCITY, PLAYER_STATE } from '../utils/constants.js';
import { LEVELS } from '../config/levels.js';
import audioSystem from '../utils/AudioSystem.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
    }

    init(data) {
        // Read current level (default 1)
        this.currentLevel = data.level || 1;
        this.score = data.score || 0;
        this.levelConfig = LEVELS[this.currentLevel];
        this.isLevelTransitioning = false;
        
        // Clear terminal output logs on new game / retry (Phase 1)
        if (this.currentLevel === 1 && window.clearTerminal) {
            window.clearTerminal();
        }
        
        // Read difficulty from dashboard configuration
        const difficulty = window.getDifficulty ? window.getDifficulty() : 'normal';
        if (difficulty === 'easy') {
            this.lives = data.lives !== undefined ? data.lives : 4;
            this.maxLives = 4;
        } else if (difficulty === 'hard') {
            this.lives = data.lives !== undefined ? data.lives : 1;
            this.maxLives = 1;
        } else {
            this.lives = data.lives !== undefined ? data.lives : 3;
            this.maxLives = 3;
        }

        this.playerState = PLAYER_STATE.IDLE;
        this.isAttacking = false;
        this.facingRight = true;
        this.isInvincible = false;
    }

    create() {
        this.wasOnGround = true;
        this.nextDustTime = 0;

        // Camera fade in
        this.cameras.main.fadeIn(500);

        // Start background music loop
        if (window.audioSystem) {
            window.audioSystem.startMusic('game');
        }

        // Send logs to HTML console
        if (window.logToTerminal) {
            window.logToTerminal(`Fase ${this.currentLevel} iniciada: ${this.levelConfig.name}`, 'game');
            window.logToTerminal(this.levelConfig.description, 'game');
        }

        // Create game layers in order
        this.createBackground();
        this.createGround();
        this.createPlatforms();
        this.createDecorations();
        this.createCollectibles();
        this.createHazards();
        this.createPlayer();
        this.createEnemies();
        this.createGoal();
        this.createUI();

        // Setup input
        this.setupInput();

        // Setup collisions
        this.setupCollisions();

        // Pause functionality
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
        this.input.keyboard.on('keydown-P', () => this.pauseGame());
    }

    pauseGame() {
        this.scene.launch(SCENES.PAUSE);
        this.scene.pause();
    }

    createBackground() {
        // Parallax background - tile it to fill screen
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSETS.BACKGROUND);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setScrollFactor(0);
        bg.setDepth(DEPTH.BACKGROUND);
    }

    createGround() {
        // Static group for ground tiles
        this.groundTiles = this.physics.add.staticGroup();

        const TILE_SIZE = 64;
        const groundY = GAME_HEIGHT - TILE_SIZE;
        const undergroundY = GAME_HEIGHT - TILE_SIZE + 64;

        // Calculate how many tiles we need
        const tilesNeeded = Math.ceil(GAME_WIDTH / TILE_SIZE) + 1;
        const floorGaps = this.levelConfig.floorGaps || [];

        // Create top layer of ground (with grass)
        for (let i = 0; i < tilesNeeded; i++) {
            // Skip tile if it is defined as a gap
            if (floorGaps.includes(i)) {
                continue;
            }

            const x = i * TILE_SIZE + TILE_SIZE / 2;
            let tileKey;

            const isLeftEdge = (i === 0) || floorGaps.includes(i - 1);
            const isRightEdge = (i === tilesNeeded - 1) || floorGaps.includes(i + 1);

            if (isLeftEdge && !isRightEdge) {
                // Left edge of an island
                tileKey = 'tile_1';
            } else if (isRightEdge && !isLeftEdge) {
                // Right edge of an island
                tileKey = 'tile_3';
            } else if (isLeftEdge && isRightEdge) {
                // Single tile island
                tileKey = 'tile_14';
            } else {
                // Middle tiles - alternate between variations
                const midTiles = ['tile_2', 'tile_7', 'tile_11', 'tile_15'];
                tileKey = midTiles[i % midTiles.length];
            }

            const tile = this.groundTiles.create(x, groundY, tileKey);
            tile.setDepth(DEPTH.TILES);
            tile.body.setSize(64, 64);
            tile.body.setOffset(0, 0);
            tile.refreshBody();
        }

        // Create underground layer
        for (let i = 0; i < tilesNeeded; i++) {
            if (floorGaps.includes(i)) {
                continue;
            }

            const x = i * TILE_SIZE + TILE_SIZE / 2;
            let tileKey;

            const isLeftEdge = (i === 0) || floorGaps.includes(i - 1);
            const isRightEdge = (i === tilesNeeded - 1) || floorGaps.includes(i + 1);

            if (isLeftEdge && !isRightEdge) {
                tileKey = 'tile_4';
            } else if (isRightEdge && !isLeftEdge) {
                tileKey = 'tile_6';
            } else {
                // Alternate fill tiles for variety
                const fillTiles = ['tile_5', 'tile_8', 'tile_10'];
                tileKey = fillTiles[i % fillTiles.length];
            }

            const tile = this.groundTiles.create(x, undergroundY, tileKey);
            tile.setDepth(DEPTH.TILES);
            tile.body.setSize(64, 64);
            tile.body.setOffset(0, 0);
            tile.refreshBody();
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        const platformConfigs = this.levelConfig.platforms || [];
        platformConfigs.forEach(config => {
            this.createPlatform(config.x, config.y, config.width);
        });
    }

    createPlatform(startX, y, widthTiles) {
        const TILE_SIZE = 64;

        for (let i = 0; i < widthTiles; i++) {
            const x = startX + (i * TILE_SIZE);
            let tileKey;

            if (widthTiles === 1) {
                tileKey = 'tile_14';
            } else if (i === 0) {
                tileKey = 'tile_14';
            } else if (i === widthTiles - 1) {
                tileKey = 'tile_16';
            } else {
                tileKey = 'tile_15';
            }

            const tile = this.platforms.create(x, y, tileKey);
            tile.setDepth(DEPTH.TILES);
            tile.refreshBody();
            
            // Set thin collision box (16px) at the top of the 64px tile
            // This leaves the bottom 48px completely non-solid
            tile.body.setSize(64, 16);
            tile.body.setOffset(0, 0);
            
            // Make platforms one-way: only collide when falling onto the top surface.
            tile.body.checkCollision.down = false;
            tile.body.checkCollision.left = false;
            tile.body.checkCollision.right = false;
        }
    }

    createDecorations() {
        const decorations = this.levelConfig.decorations || [];
        decorations.forEach(decor => {
            const scale = decor.scale !== undefined ? decor.scale : 1;
            const alpha = decor.alpha !== undefined ? decor.alpha : 1;

            let assetKey;
            switch(decor.type) {
                case 'tree': assetKey = ASSETS.TREE; break;
                case 'tombstone1': assetKey = ASSETS.TOMBSTONE1; break;
                case 'tombstone2': assetKey = ASSETS.TOMBSTONE2; break;
                case 'bush1': assetKey = ASSETS.BUSH1; break;
                case 'bush2': assetKey = ASSETS.BUSH2; break;
                case 'dead-bush': assetKey = ASSETS.DEAD_BUSH; break;
                case 'skeleton_decor': assetKey = ASSETS.SKELETON; break;
                case 'arrow-sign': assetKey = ASSETS.ARROW_SIGN; break;
                case 'sign': assetKey = ASSETS.SIGN; break;
                case 'crate': assetKey = ASSETS.CRATE; break;
            }

            if (assetKey) {
                // Align decoration bottom with the surface Y coordinate of the ground or platform
                const surfaceY = this.getSurfaceY(decor.x, decor.y);

                const img = this.add.image(decor.x, surfaceY, assetKey)
                    .setOrigin(0.5, 1) // Align origin to bottom-center
                    .setScale(scale)
                    .setAlpha(alpha);

                if (decor.depthBg) {
                    img.setDepth(DEPTH.BACKGROUND + 1);
                } else {
                    img.setDepth(DEPTH.TILES + 1);
                }

                // RIP Text label above tombstones for computing humor/lore
                if (decor.label && (decor.type === 'tombstone1' || decor.type === 'tombstone2')) {
                    const actualHeight = (img.height || 64) * scale;
                    const labelY = surfaceY - actualHeight - 12;

                    const labelText = this.add.text(decor.x, labelY, `RIP ${decor.label.toUpperCase()}`, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '7px',
                        color: '#ff6b6b',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5).setDepth(DEPTH.UI);

                    // Float animation
                    this.tweens.add({
                        targets: labelText,
                        y: labelY - 4,
                        duration: 1000 + Math.random() * 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        });
    }

    createCollectibles() {
        this.collectibles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        const collectibleKeys = ['floppy_disk', 'ram_stick', 'coffee_mug'];
        const bonePositions = this.levelConfig.collectibles || [];
        bonePositions.forEach((pos, index) => {
            const itemKey = collectibleKeys[index % collectibleKeys.length];
            const bone = this.collectibles.create(pos.x, pos.y, itemKey);
            bone.setScale(1); // Procedural textures are sized 32x32 / 48x16, no need to downscale
            bone.setDepth(DEPTH.COLLECTIBLES);

            // Floating animation
            this.tweens.add({
                targets: bone,
                y: bone.y - 8,
                duration: 800 + (index * 50),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Subtle rotation (skip or minimize for RAM stick)
            this.tweens.add({
                targets: bone,
                angle: itemKey === 'ram_stick' ? 2 : 5,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createHazards() {
        this.hazards = this.physics.add.staticGroup();
        this.movingHazards = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Static spikes
        const spikes = this.levelConfig.hazards?.spikes || [];
        spikes.forEach(pos => {
            // Determine the surface Y coordinate where the spike should sit
            const surfaceY = this.getSurfaceY(pos.x, pos.y);

            const spike = this.hazards.create(pos.x, surfaceY, ASSETS.SPIKE);
            spike.setOrigin(0.5, 1); // Align origin to bottom-center
            spike.setScale(0.55); // Made spikes larger and more visible
            spike.setDepth(DEPTH.TILES + 2);
            
            // Set body size and offset relative to top-left of the texture (unscaled values)
            const bodyWidth = spike.width * 0.7; // Cover 70% width of the sprite
            const bodyHeight = spike.height * 0.95; // Cover 95% height of the sprite (to catch feet on top)
            const offsetX = (spike.width - bodyWidth) / 2;
            const offsetY = spike.height - bodyHeight;
            
            spike.body.setSize(bodyWidth, bodyHeight);
            spike.body.setOffset(offsetX, offsetY);
            spike.refreshBody(); // MUST be called after setSize and setOffset for static bodies!
        });

        // Moving Saws
        const saws = this.levelConfig.hazards?.saws || [];
        saws.forEach((sawData, idx) => {
            const saw = this.movingHazards.create(sawData.x, sawData.y, ASSETS.SAW);
            saw.setScale(sawData.scale || 0.5);
            saw.setDepth(DEPTH.TILES + 3);

            // Circular hitbox
            saw.body.setCircle(saw.width * 0.38);
            saw.body.setOffset(saw.width * 0.12, saw.height * 0.12);

            // Rotation
            this.tweens.add({
                targets: saw,
                angle: 360,
                duration: 1000,
                repeat: -1,
                ease: 'Linear'
            });

            // Back & forth movement
            if (sawData.type === 'vertical') {
                this.tweens.add({
                    targets: saw,
                    y: saw.y - sawData.range,
                    duration: sawData.speed || 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (sawData.type === 'horizontal') {
                this.tweens.add({
                    targets: saw,
                    x: saw.x - sawData.range,
                    duration: sawData.speed || 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    getSurfaceY(x, y) {
        const TILE_SIZE = 64;
        const groundY = GAME_HEIGHT - TILE_SIZE; // Center of ground tile
        const groundSurfaceY = groundY - 32; // Top surface of the ground (624)

        // Compare distance of y to ground center vs platforms to pick the closest surface
        let bestSurfaceY = groundSurfaceY;
        let minDiff = Math.abs(y - groundY);

        const platformConfigs = this.levelConfig.platforms || [];
        platformConfigs.forEach(p => {
            const pStartX = p.x - 32; // Include half tile offset for safety
            const pEndX = p.x + (p.width * TILE_SIZE) - 32;
            
            if (x >= pStartX && x <= pEndX) {
                const diff = Math.abs(y - p.y);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestSurfaceY = p.y - 32; // Top surface of the platform
                }
            }
        });

        return bestSurfaceY;
    }

    createPlayer() {
        const startX = 150;
        const startY = GAME_HEIGHT - 200;

        this.player = this.physics.add.sprite(startX, startY, 'idle_1');
        this.player.setScale(1);
        this.player.setDepth(DEPTH.PLAYER);
        this.player.setOrigin(0.5, 1); // Fixes origin to bottom-center to prevent visual height jumps

        // Physics settings
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(800); // Smooth stopping
        this.player.setMaxVelocity(400, 800);

        // Centered bottom hitbox
        const hitboxWidth = 30;
        const hitboxHeight = 60;
        this.player.body.setSize(hitboxWidth, hitboxHeight);
        const offsetX = (this.player.width - hitboxWidth) / 2;
        const offsetY = this.player.height - hitboxHeight - 5;
        this.player.body.setOffset(offsetX, offsetY);

        this.player.play('player-idle');
    }

    createEnemies() {
        this.enemyProjectiles = this.physics.add.group();
        this.enemiesGroup = this.physics.add.group();

        const enemyConfigs = this.levelConfig.enemies || [];
        enemyConfigs.forEach((config, idx) => {
            const skeleton = this.enemiesGroup.create(config.x, config.y, ASSETS.SKELETON);
            skeleton.setScale(0.85);
            skeleton.setDepth(DEPTH.ENEMIES);
            skeleton.setCollideWorldBounds(true);
            skeleton.setBounce(0.1);

            skeleton.setData('hp', config.hp || 2);
            skeleton.setData('minX', config.minX);
            skeleton.setData('maxX', config.maxX);
            skeleton.setData('speed', 70);
            skeleton.setData('direction', 1); // 1 = right, -1 = left
            skeleton.setData('isDead', false);

            // Custom body size
            skeleton.body.setSize(40, 68);
            skeleton.body.setOffset(12, 5);

            if (idx === 0 && this.currentLevel === 1 && window.logToTerminal) {
                window.logToTerminal('Alerta: Bugs identificados nas linhas de código à frente!', 'warn');
            }
        });
    }

    createGoal() {
        const goalConfig = this.levelConfig.goal;
        if (!goalConfig) return;

        this.goal = this.physics.add.sprite(goalConfig.x, goalConfig.y, ASSETS.COMPUTER);
        this.goal.setScale(1.3);
        this.goal.setDepth(DEPTH.TILES + 1);
        this.goal.body.setAllowGravity(false);
        this.goal.body.setImmovable(true);

        // Goal text label
        const labelText = this.currentLevel === 1 ? 'PROG_TERMINAL' : 'MAINFRAME_SERVER';
        this.goalText = this.add.text(goalConfig.x, goalConfig.y - 45, labelText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#39ff14',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.UI);

        // Hover text effect
        this.tweens.add({
            targets: this.goalText,
            y: this.goalText.y - 6,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createUI() {
        // Score container
        const scoreContainer = this.add.container(20, 20);

        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x000000, 0.7);
        scoreBg.fillRoundedRect(0, 0, 180, 45, 10);
        scoreBg.lineStyle(2, 0x7cb342, 1);
        scoreBg.strokeRoundedRect(0, 0, 180, 45, 10);

        const itemIcon = this.add.image(28, 22, 'floppy_disk').setScale(0.75);

        this.scoreText = this.add.text(55, 13, `${this.score}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#7cb342'
        });

        scoreContainer.add([scoreBg, itemIcon, this.scoreText]);
        scoreContainer.setScrollFactor(0);
        scoreContainer.setDepth(DEPTH.UI);

        // Lives container
        const livesContainer = this.add.container(20, 75);

        const livesBg = this.add.graphics();
        livesBg.fillStyle(0x000000, 0.7);
        livesBg.fillRoundedRect(0, 0, 30 + (this.maxLives * 30), 40, 10);
        livesBg.lineStyle(2, 0xff6b6b, 1);
        livesBg.strokeRoundedRect(0, 0, 30 + (this.maxLives * 30), 40, 10);

        livesContainer.add(livesBg);

        this.heartIcons = [];
        for (let i = 0; i < this.maxLives; i++) {
            const heart = this.add.text(20 + (i * 30), 10, i < this.lives ? '❤️' : '🖤', { fontSize: '18px' });
            this.heartIcons.push(heart);
            livesContainer.add(heart);
        }

        livesContainer.setScrollFactor(0);
        livesContainer.setDepth(DEPTH.UI);

        // Level name indicator
        this.add.text(GAME_WIDTH - 20, 20, `FASE ${this.currentLevel}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#4ecdc4'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH.UI);

        // Brief instruction text on first phase
        if (this.currentLevel === 1) {
            const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30,
                '← → WASD Mover  |  ESPAÇO Pular  |  ENTER Atacar  |  ESC Pausar', {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#95e1d3',
                backgroundColor: '#00000099',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.UI);

            this.time.delayedCall(6000, () => {
                this.tweens.add({
                    targets: hint,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => hint.destroy()
                });
            });
        }

        // Pause Button at the bottom-right corner
        const pauseButton = this.add.container(GAME_WIDTH - 130, GAME_HEIGHT - 45);
        
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x1a1a2e, 0.85);
        btnBg.fillRoundedRect(0, 0, 110, 30, 6);
        btnBg.lineStyle(2, 0x7cb342, 1);
        btnBg.strokeRoundedRect(0, 0, 110, 30, 6);
        
        const btnText = this.add.text(55, 15, 'MENU (ESC)', {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#7cb342'
        }).setOrigin(0.5);

        const zone = this.add.zone(55, 15, 110, 30).setInteractive({ useHandCursor: true });
        
        pauseButton.add([btnBg, btnText, zone]);
        pauseButton.setScrollFactor(0);
        pauseButton.setDepth(DEPTH.UI);

        // Hover effects
        zone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0x7cb342, 0.3);
            btnBg.fillRoundedRect(0, 0, 110, 30, 6);
            btnBg.lineStyle(2, 0x7cb342, 1);
            btnBg.strokeRoundedRect(0, 0, 110, 30, 6);
            btnText.setColor('#39ff14');
        });

        zone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x1a1a2e, 0.85);
            btnBg.fillRoundedRect(0, 0, 110, 30, 6);
            btnBg.lineStyle(2, 0x7cb342, 1);
            btnBg.strokeRoundedRect(0, 0, 110, 30, 6);
            btnText.setColor('#7cb342');
        });

        zone.on('pointerdown', () => {
            if (window.audioSystem) {
                window.audioSystem.playCollect();
            }
            this.pauseGame();
        });
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        this.runKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    setupCollisions() {
        // Player vs environment
        this.physics.add.collider(this.player, this.groundTiles);
        this.physics.add.collider(this.player, this.platforms, null, (player, platform) => {
            // Only collide if player is moving down (falling/landing) and their feet are above the platform top
            if (player.body.velocity.y >= 0 && player.body.bottom <= platform.body.top + 8) {
                return true;
            }
            return false;
        }, this);

        // Enemies vs environment
        this.physics.add.collider(this.enemiesGroup, this.groundTiles);
        this.physics.add.collider(this.enemiesGroup, this.platforms);

        // Player overlaps
        this.physics.add.overlap(this.player, this.collectibles, this.collectBone, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);
        this.physics.add.overlap(this.player, this.movingHazards, this.hitHazard, null, this);
        this.physics.add.overlap(this.player, this.enemiesGroup, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.hitProjectile, null, this);

        // Player vs Goal Computer
        if (this.goal) {
            this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
        }
    }

    update() {
        if (this.playerState === PLAYER_STATE.DEAD) return;

        // If dashing, bypass normal keyboard input and movement
        if (this.isDashing) {
            this.player.play('player-run', true);
            if (this.time.now > (this.nextDustTime || 0)) {
                this.nextDustTime = this.time.now + 40;
                this.createStepDust();
            }
            return;
        }

        // Check for dash trigger (SHIFT key)
        const dashJustPressed = Phaser.Input.Keyboard.JustDown(this.runKey);
        if (dashJustPressed && !this.isDashing && this.time.now > (this.nextDashTime || 0)) {
            this.triggerDash();
        }

        // Dust particle triggers
        if (this.player && this.player.body) {
            const onGround = this.player.body.onFloor() || this.player.body.blocked.down;
            const isMoving = Math.abs(this.player.body.velocity.x) > 20;

            // Landing dust check
            if (onGround && !this.wasOnGround) {
                this.createLandingDust();
            }
            this.wasOnGround = onGround;

            // Step dust check
            if (onGround && isMoving) {
                if (!this.nextDustTime) this.nextDustTime = 0;
                if (this.time.now > this.nextDustTime) {
                    const delay = 150; // Automatic running speed interval
                    this.nextDustTime = this.time.now + delay;
                    this.createStepDust();
                }
            }
        }

        // Keep body offset centered relative to the current frame size to prevent visual trembling
        if (this.player && this.player.body) {
            const hitboxWidth = 30;
            const hitboxHeight = 60;
            const offsetX = (this.player.width - hitboxWidth) / 2;
            const offsetY = this.player.height - hitboxHeight - 5;
            this.player.body.setOffset(offsetX, offsetY);
        }

        // Pit fall death check (caiu no abismo)
        if (this.player.y > GAME_HEIGHT - 40) {
            this.lives--;
            this.updateLivesDisplay();
            
            if (window.audioSystem) {
                window.audioSystem.playHit();
            }

            if (this.lives <= 0) {
                if (window.logToTerminal) {
                    window.logToTerminal('SEGFAULT: Acesso de memória inválido (caiu no abismo)! Fim de Jogo', 'danger');
                }
                this.playerDeath();
            } else {
                if (window.logToTerminal) {
                    window.logToTerminal(`SEGFAULT: Acesso de memória inválido (caiu no abismo)! Vidas restantes: ${this.lives}`, 'danger');
                }
                
                // Prevent further update loops from messing with player position
                this.playerState = PLAYER_STATE.DEAD;
                this.player.body.enable = false;
                
                // Restart scene keeping score and lives
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start(SCENES.GAME, { level: this.currentLevel, score: this.score, lives: this.lives });
                });
            }
            return;
        }

        this.handleMovement();
        this.handleJump();
        this.handleAttack();
        this.updateAnimations();
        this.handleEnemiesPatrol();
    }

    handleMovement() {
        const onGround = this.player.body.onFloor() || this.player.body.blocked.down;
        const speed = PLAYER_RUN_SPEED; // Running is automatic!

        const leftPressed = this.cursors.left.isDown || this.wasd.left.isDown;
        const rightPressed = this.cursors.right.isDown || this.wasd.right.isDown;

        if (leftPressed && !rightPressed) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.facingRight = false;
            if (onGround) {
                this.playerState = PLAYER_STATE.RUNNING;
            }
        } else if (rightPressed && !leftPressed) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.facingRight = true;
            if (onGround) {
                this.playerState = PLAYER_STATE.RUNNING;
            }
        } else {
            if (onGround) {
                this.player.setVelocityX(0);
                this.playerState = PLAYER_STATE.IDLE;
            }
        }
    }

    handleJump() {
        // Robust ground check: check floor, body collision touching down, or blocked down
        const onGround = this.player.body.onFloor() || this.player.body.touching.down || this.player.body.blocked.down;

        const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.wasd.up);

        if (jumpJustPressed && onGround) {
            this.player.setVelocityY(PLAYER_JUMP_VELOCITY);
            this.playerState = PLAYER_STATE.JUMPING;

            // Play jump sound
            if (window.audioSystem) {
                window.audioSystem.playJump();
            }
        }

        if (!onGround) {
            if (this.player.body.velocity.y < 0) {
                this.playerState = PLAYER_STATE.JUMPING;
            } else if (this.player.body.velocity.y > 50) {
                this.playerState = PLAYER_STATE.FALLING;
            }
        }
    }

    handleAttack() {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.isAttacking = true;
            this.player.play('player-attack');

            // Play attack sound
            if (window.audioSystem) {
                window.audioSystem.playAttack();
            }

            if (window.logToTerminal) {
                window.logToTerminal('Zumbi executou método de ataque.', 'combat');
            }

            // Check attack range hit
            this.checkAttackHit();

            this.player.once('animationcomplete-player-attack', () => {
                this.isAttacking = false;
            });
        }
    }

    checkAttackHit() {
        const attackRange = 85;
        const playerX = this.player.x;
        const playerY = this.player.y;

        this.enemiesGroup.getChildren().forEach(skeleton => {
            if (skeleton.getData('isDead')) return;

            const distX = skeleton.x - playerX;
            const distY = Math.abs(skeleton.y - playerY);

            // In range vertically and horizontally in facing direction
            const inRangeX = this.facingRight ? (distX > 0 && distX < attackRange) : (distX < 0 && distX > -attackRange);
            const inRangeY = distY < 45;

            if (inRangeX && inRangeY) {
                this.damageEnemy(skeleton);
            }
        });
    }

    damageEnemy(skeleton) {
        let hp = skeleton.getData('hp');
        hp--;
        skeleton.setData('hp', hp);

        // Flash red
        skeleton.setTint(0xff3333);
        this.time.delayedCall(150, () => {
            skeleton.clearTint();
        });

        // Knockback skeleton
        const knockbackDir = this.facingRight ? 120 : -120;
        skeleton.body.setVelocity(knockbackDir, -120);

        if (window.audioSystem) {
            window.audioSystem.playHit();
        }

        if (window.logToTerminal) {
            window.logToTerminal(`Bug compilado! Dano causado. HP Restante: ${hp}`, 'combat');
        }

        if (hp <= 0) {
            this.killEnemy(skeleton);
        }
    }

    killEnemy(skeleton) {
        skeleton.setData('isDead', true);
        skeleton.body.enable = false;

        if (window.logToTerminal) {
            window.logToTerminal('Bug deletado da memória! (+250 XP)', 'success');
        }

        this.score += SCORE.ENEMY;
        this.scoreText.setText(`${this.score}`);

        // Binary explosion particle emitter using text and arcade physics
        for (let i = 0; i < 15; i++) {
            const bin = Math.random() > 0.5 ? '0' : '1';
            const color = Math.random() > 0.5 ? '#39ff14' : '#ff3333';
            const p = this.add.text(skeleton.x + Phaser.Math.Between(-15, 15), skeleton.y - 20, bin, {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                color: color,
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(DEPTH.EFFECTS);
            
            this.physics.add.existing(p);
            p.body.setVelocity(
                Phaser.Math.Between(-120, 120),
                Phaser.Math.Between(-280, -100)
            );
            p.body.setGravityY(500); // pull down
            
            this.tweens.add({
                targets: p,
                alpha: 0,
                scale: 0.5,
                duration: 600 + Math.random() * 400,
                onComplete: () => p.destroy()
            });
        }

        // Floating score popup
        const popup = this.add.text(skeleton.x, skeleton.y - 25, `+${SCORE.ENEMY}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ff8a80',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.EFFECTS);

        this.tweens.add({
            targets: popup,
            y: popup.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => popup.destroy()
        });

        // Dead drop animation
        this.tweens.add({
            targets: skeleton,
            angle: this.facingRight ? 90 : -90,
            y: skeleton.y + 15,
            alpha: 0,
            duration: 500,
            onComplete: () => skeleton.destroy()
        });
    }

    handleEnemiesPatrol() {
        this.enemiesGroup.getChildren().forEach(skeleton => {
            if (skeleton.getData('isDead')) return;

            // Check if enemy fell into a pit
            if (skeleton.y > GAME_HEIGHT - 40) {
                skeleton.setData('isDead', true);
                skeleton.destroy();
                return;
            }

            const minX = skeleton.getData('minX');
            const maxX = skeleton.getData('maxX');
            let direction = skeleton.getData('direction');
            const speed = skeleton.getData('speed');

            // Turn around at limits
            if (skeleton.x <= minX) {
                direction = 1;
                skeleton.setFlipX(false);
            } else if (skeleton.x >= maxX) {
                direction = -1;
                skeleton.setFlipX(true);
            }

            skeleton.setData('direction', direction);
            
            // Only move if not currently paused casting an error
            if (!skeleton.getData('isShooting')) {
                skeleton.setVelocityX(direction * speed);
            }

            // Error projectile throw checks
            const distance = Phaser.Math.Distance.Between(skeleton.x, skeleton.y, this.player.x, this.player.y);
            if (distance < 450 && this.playerState !== PLAYER_STATE.DEAD) {
                const timeNow = this.time.now;
                let nextShoot = skeleton.getData('nextShootTime');
                if (nextShoot === undefined) {
                    // Initial grace period of 2.5 to 4 seconds at the start of each level/phase
                    nextShoot = timeNow + Phaser.Math.Between(2500, 4000);
                    skeleton.setData('nextShootTime', nextShoot);
                }
                if (timeNow > nextShoot) {
                    const dirX = this.player.x > skeleton.x ? 1 : -1;
                    skeleton.setData('nextShootTime', timeNow + Phaser.Math.Between(3000, 5000)); // Cooldown between throws (3 to 5 seconds)
                    this.shootProjectile(skeleton, dirX);
                }
            }
        });
    }

    updateAnimations() {
        if (this.playerState === PLAYER_STATE.DEAD || this.isAttacking) return;

        // Use a robust check combining onFloor/blocked with velocity threshold to prevent ground-air flickering
        const onGround = this.player.body.onFloor() || this.player.body.blocked.down || Math.abs(this.player.body.velocity.y) < 15;
        const velocityX = Math.abs(this.player.body.velocity.x);

        let targetAnim = 'player-idle';

        if (!onGround) {
            targetAnim = 'player-jump';
        } else if (velocityX > 15) {
            targetAnim = 'player-run';
        } else {
            targetAnim = 'player-idle';
        }

        const currentAnim = this.player.anims.currentAnim?.key;
        if (currentAnim !== targetAnim) {
            this.player.play(targetAnim, true);
        }
    }

    collectBone(player, bone) {
        if (this.playerState === PLAYER_STATE.DEAD) return;
        
        // Disable physics body immediately to prevent duplicate overlaps during tween
        if (bone.body) {
            bone.body.enable = false;
        }

        // Floating/fade collector tween
        this.tweens.add({
            targets: bone,
            alpha: 0,
            scale: bone.scale * 1.5,
            y: bone.y - 30,
            duration: 300,
            ease: 'Power2',
            onComplete: () => bone.destroy()
        });

        // Audio collect sound
        if (window.audioSystem) {
            window.audioSystem.playCollect();
        }

        // Score update
        this.score += SCORE.BONE;
        this.scoreText.setText(`${this.score}`);

        let itemName = 'Hardware';
        if (bone.texture.key === 'floppy_disk') itemName = 'Disquete 3½ (Código)';
        else if (bone.texture.key === 'ram_stick') itemName = 'Memória RAM (Cache)';
        else if (bone.texture.key === 'coffee_mug') itemName = 'Caneca de Café (Energia)';

        if (window.logToTerminal) {
            window.logToTerminal(`Hardware coletado: ${itemName}! +100 Pontos.`, 'score');
        }

        // Floating points popup
        const popup = this.add.text(bone.x, bone.y - 20, `+${SCORE.BONE}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#7cb342',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.EFFECTS);

        this.tweens.add({
            targets: popup,
            y: popup.y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }

    hitEnemy(player, enemy) {
        if (enemy.getData('isDead') || this.isInvincible || this.playerState === PLAYER_STATE.DEAD) return;
        this.takeDamage('Bug Enqueleto');
    }

    hitHazard(player, hazard) {
        if (this.isInvincible || this.playerState === PLAYER_STATE.DEAD) return;
        this.takeDamage('Obstáculo');
    }

    takeDamage(sourceName = 'Perigo') {
        this.lives--;
        this.updateLivesDisplay();

        // Play damage hit sound
        if (window.audioSystem) {
            window.audioSystem.playHit();
        }

        if (window.logToTerminal) {
            window.logToTerminal(`Erro de tempo de execução! Dano sofrido por ${sourceName}. Vidas: ${this.lives}`, 'danger');
        }

        // Knockback player away
        const knockbackDir = this.facingRight ? -220 : 220;
        this.player.setVelocity(knockbackDir, -300);

        // Damage flashing
        this.isInvincible = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: 7,
            onComplete: () => {
                this.player.setAlpha(1);
                this.isInvincible = false;
            }
        });

        // Screen shake
        this.cameras.main.shake(200, 0.01);

        if (this.lives <= 0) {
            this.playerDeath();
        }
    }

    updateLivesDisplay() {
        this.heartIcons.forEach((heart, index) => {
            if (index >= this.lives) {
                heart.setText('🖤');
            } else {
                heart.setText('❤️');
            }
        });
    }

    reachGoal(player, goal) {
        if (this.playerState === PLAYER_STATE.DEAD || this.isLevelTransitioning) return;
        this.isLevelTransitioning = true;

        const nextLevelNum = this.currentLevel + 1;
        const hasNextLevel = LEVELS[nextLevelNum] !== undefined;

        if (window.audioSystem) {
            window.audioSystem.playLevelWin();
            if (!hasNextLevel) {
                window.audioSystem.stopMusic();
            }
        }

        player.setVelocity(0, 0);
        player.body.enable = false;
        player.play('player-idle');

        if (hasNextLevel) {
            if (window.logToTerminal) {
                window.logToTerminal(`Fase ${this.currentLevel} completada! Upload de dados bem sucedido.`, 'success');
                window.logToTerminal(`Carregando Fase ${nextLevelNum}... Compilando códigos...`, 'success');
            }

            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.GAME, { level: nextLevelNum, score: this.score });
            });
        } else {
            if (window.logToTerminal) {
                window.logToTerminal(`Fase ${this.currentLevel} completada! Servidor Central Hackeado!`, 'success');
                window.logToTerminal('VITÓRIA! O código compilou perfeitamente sem Segfaults!', 'success');
            }

            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.GAME_OVER, { score: this.score, won: true });
            });
        }
    }

    playerDeath() {
        this.playerState = PLAYER_STATE.DEAD;
        this.player.setVelocityX(0); // Stop horizontal velocity, keep vertical gravity active
        
        if (window.audioSystem) {
            window.audioSystem.playGameOver();
            window.audioSystem.startMusic('death');
        }

        this.player.play('player-dead');

        if (window.logToTerminal) {
            window.logToTerminal('FATAL ERROR: Process core dumped. Zumbi programador morreu.', 'danger');
        }

        // Wait for animation to finish AND player to touch floor before transitioning
        let transitioned = false;
        const transition = () => {
            if (transitioned) return;
            transitioned = true;
            this.player.body.enable = false; // Disable physics after landing/completing death
            this.time.delayedCall(800, () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start(SCENES.GAME_OVER, { score: this.score, won: false });
                });
            });
        };

        this.player.once('animationcomplete-player-dead', () => {
            const onGround = this.player.body.onFloor() || this.player.body.blocked.down || this.player.y > GAME_HEIGHT;
            if (onGround) {
                transition();
            } else {
                // Poll until they touch the floor or fall below screen limits
                this.checkLanding = this.time.addEvent({
                    delay: 50,
                    callback: () => {
                        const hitFloor = this.player.body.onFloor() || this.player.body.blocked.down || this.player.y > GAME_HEIGHT;
                        if (hitFloor) {
                            this.checkLanding.destroy();
                            transition();
                        }
                    },
                    loop: true
                });
            }
        });
    }

    createStepDust() {
        const footX = this.player.x;
        const footY = this.player.y;
        const direction = this.facingRight ? -1 : 1;
        
        for (let i = 0; i < 2; i++) {
            const size = Phaser.Math.Between(2, 4);
            const color = Math.random() > 0.5 ? 0x7cb342 : 0x39ff14;
            const dust = this.add.circle(
                footX + (direction * 10) + Phaser.Math.Between(-5, 5),
                footY - size/2 + Phaser.Math.Between(-2, 2),
                size,
                color,
                0.7
            ).setDepth(DEPTH.EFFECTS);
            
            this.physics.add.existing(dust);
            dust.body.setAllowGravity(false);
            dust.body.setVelocity(
                direction * Phaser.Math.Between(20, 50),
                Phaser.Math.Between(-30, -10)
            );
            
            this.tweens.add({
                targets: dust,
                alpha: 0,
                scale: 0.1,
                duration: 300 + Math.random() * 200,
                onComplete: () => dust.destroy()
            });
        }
    }

    createLandingDust() {
        const footX = this.player.x;
        const footY = this.player.y;
        
        for (let i = 0; i < 6; i++) {
            const size = Phaser.Math.Between(3, 6);
            const color = Math.random() > 0.4 ? 0x7cb342 : 0x95e1d3;
            const dust = this.add.circle(
                footX + Phaser.Math.Between(-15, 15),
                footY - size/2,
                size,
                color,
                0.8
            ).setDepth(DEPTH.EFFECTS);
            
            this.physics.add.existing(dust);
            dust.body.setAllowGravity(false);
            
            const angle = (i / 5) * Math.PI;
            const speed = Phaser.Math.Between(40, 100);
            dust.body.setVelocity(
                Math.cos(angle) * speed,
                -Math.abs(Math.sin(angle)) * speed * 0.5
            );
            
            this.tweens.add({
                targets: dust,
                alpha: 0,
                scale: 0.1,
                duration: 400 + Math.random() * 300,
                onComplete: () => dust.destroy()
            });
        }
    }

    triggerDash() {
        this.isDashing = true;
        this.nextDashTime = this.time.now + 1000; // 1s Cooldown
        
        if (window.audioSystem) {
            window.audioSystem.playCollect();
        }

        if (window.logToTerminal) {
            window.logToTerminal('DASH: Executando otimização JIT (Green Code Trail)!', 'success');
        }

        const originalGravityY = this.player.body.gravity.y;
        this.player.body.setAllowGravity(false);
        
        const dashDir = this.facingRight ? 1 : -1;
        this.player.setVelocity(dashDir * 700, 0);
        
        const wasInvincible = this.isInvincible;
        this.isInvincible = true;
        
        const codeSnippets = [
            'import', 'const', 'let', 'function', 'class', 'return', 'if', 'else', 
            'while', 'true', 'false', 'null', 'void', '0', '1', '=>', 'new', 'this'
        ];

        const trailTimer = this.time.addEvent({
            delay: 25,
            callback: () => {
                if (!this.isDashing) return;
                
                const code = codeSnippets[Phaser.Math.Between(0, codeSnippets.length - 1)];
                const offsetDir = this.facingRight ? -25 : 25;
                const text = this.add.text(
                    this.player.x + offsetDir + Phaser.Math.Between(-10, 10), 
                    this.player.y - 35 + Phaser.Math.Between(-15, 15), 
                    code, 
                    {
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        color: '#39ff14',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5).setDepth(DEPTH.EFFECTS);
                
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    y: text.y - 15,
                    duration: 500,
                    onComplete: () => text.destroy()
                });
            },
            repeat: 8
        });

        this.time.delayedCall(200, () => {
            this.isDashing = false;
            this.player.body.setAllowGravity(true);
            if (!wasInvincible) {
                this.isInvincible = false;
            }
            this.player.setVelocityX(dashDir * PLAYER_RUN_SPEED);
        });
    }

    hitProjectile(player, projectile) {
        if (this.isInvincible || this.playerState === PLAYER_STATE.DEAD) return;
        projectile.destroy();
        this.takeDamage('Erro de Compilação');
    }

    shootProjectile(skeleton, dirX) {
        if (skeleton.getData('isShooting')) return;
        skeleton.setData('isShooting', true);
        skeleton.setVelocityX(0);

        skeleton.setFlipX(dirX < 0);
        
        const errors = ['SyntaxError', 'NullPointerException', 'StackOverflow', 'TypeError', 'UndefinedError'];
        const errText = errors[Phaser.Math.Between(0, errors.length - 1)];

        const proj = this.add.text(skeleton.x, skeleton.y - 15, errText, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#ff3333',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(DEPTH.ENEMIES + 1);

        this.enemyProjectiles.add(proj);
        proj.body.setAllowGravity(false);
        proj.body.setVelocity(dirX * 250, 0);

        this.tweens.add({
            targets: proj,
            angle: 360 * dirX,
            duration: 1200,
            repeat: -1,
            ease: 'Linear'
        });

        this.time.delayedCall(2500, () => {
            if (proj.active) proj.destroy();
        });

        this.time.delayedCall(600, () => {
            if (skeleton.active && !skeleton.getData('isDead')) {
                skeleton.setData('isShooting', false);
            }
        });
    }
}
