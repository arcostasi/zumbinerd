/**
 * ZumbiNerd - Preload Scene
 * Loads all game assets with progress bar
 */

import { SCENES, ASSETS, ANIM_FRAMERATE } from '../utils/constants.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PRELOAD });
    }

    preload() {
        // Get loading bar element from HTML
        const loadingBar = document.querySelector('.loading-bar');
        const loadingText = document.querySelector('.loading-text');

        // Update loading progress
        this.load.on('progress', (value) => {
            if (loadingBar) {
                loadingBar.style.width = `${value * 100}%`;
            }
            if (loadingText) {
                loadingText.textContent = `Carregando... ${Math.floor(value * 100)}%`;
            }
        });

        this.load.on('complete', () => {
            if (loadingText) {
                loadingText.textContent = 'Pronto!';
            }
        });

        // Load background
        this.load.image(ASSETS.BACKGROUND, 'assets/tileset/background.png');

        // Load player sprite frames as individual images
        // We'll create texture atlases from these
        this.loadPlayerSprites();

        // Load objects
        this.loadObjects();

        // Load tiles
        this.loadTiles();
    }

    loadPlayerSprites() {
        const basePath = 'assets/nerd/';

        // Idle animation (10 frames)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`idle_${i}`, `${basePath}Idle (${i}).png`);
        }

        // Idle 2 animation (10 frames)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`idle2_${i}`, `${basePath}Idle 2 (${i}).png`);
        }

        // Walk animation (10 frames)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`walk_${i}`, `${basePath}Walk (${i}).png`);
        }

        // Walk 2 animation (10 frames)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`walk2_${i}`, `${basePath}Walk 2 (${i}).png`);
        }

        // Run animation (8 frames)
        for (let i = 1; i <= 8; i++) {
            this.load.image(`run_${i}`, `${basePath}Run (${i}).png`);
        }

        // Jump animation (15 frames)
        for (let i = 1; i <= 15; i++) {
            this.load.image(`jump_${i}`, `${basePath}Jump (${i}).png`);
        }

        // Attack animation (8 frames)
        for (let i = 1; i <= 8; i++) {
            this.load.image(`attack_${i}`, `${basePath}Attack (${i}).png`);
        }

        // Dead animation (10 frames)
        for (let i = 1; i <= 10; i++) {
            this.load.image(`dead_${i}`, `${basePath}Dead (${i}).png`);
        }
    }

    loadObjects() {
        const basePath = 'assets/tileset/objects/';

        this.load.image(ASSETS.TREE, `${basePath}Tree.png`);
        this.load.image(ASSETS.TOMBSTONE1, `${basePath}TombStone (1).png`);
        this.load.image(ASSETS.TOMBSTONE2, `${basePath}TombStone (2).png`);
        this.load.image(ASSETS.SKELETON, `${basePath}Skeleton.png`);
        this.load.image(ASSETS.ARROW_SIGN, `${basePath}ArrowSign.png`);
        this.load.image(ASSETS.SIGN, `${basePath}Sign.png`);
        this.load.image(ASSETS.CRATE, `${basePath}Crate.png`);
        this.load.image(ASSETS.BUSH1, `${basePath}Bush (1).png`);
        this.load.image(ASSETS.BUSH2, `${basePath}Bush (2).png`);
        this.load.image(ASSETS.DEAD_BUSH, `${basePath}DeadBush.png`);
        this.load.image(ASSETS.SPIKE, `${basePath}spike.png`);
        this.load.image(ASSETS.COMPUTER, 'assets/tileset/separate/sign (2).png');
    }

    loadTiles() {
        const basePath = 'assets/tileset/tiles/';

        // Load platform tiles
        for (let i = 1; i <= 16; i++) {
            this.load.image(`tile_${i}`, `${basePath}Tile (${i}).png`);
        }

        // Load bones for collectibles
        for (let i = 1; i <= 4; i++) {
            this.load.image(`bone_${i}`, `${basePath}Bone (${i}).png`);
        }

        // Load saw for hazards from separate folder
        this.load.image(ASSETS.SAW, 'assets/tileset/separate/saw.png');
    }

    create() {
        // Create player animations
        this.createPlayerAnimations();

        // Generate procedural textures for tech collectibles (Floppy Disk, RAM, Coffee Mug)
        this.createProceduralTextures();

        // Hide loading screen with fade
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }

        // Go to menu
        this.scene.start(SCENES.MENU);
    }

    createPlayerAnimations() {
        // Idle animation
        this.anims.create({
            key: 'player-idle',
            frames: this.createFrameArray('idle_', 10),
            frameRate: ANIM_FRAMERATE.IDLE,
            repeat: -1
        });

        // Idle 2 animation
        this.anims.create({
            key: 'player-idle2',
            frames: this.createFrameArray('idle2_', 10),
            frameRate: ANIM_FRAMERATE.IDLE,
            repeat: -1
        });

        // Walk animation
        this.anims.create({
            key: 'player-walk',
            frames: this.createFrameArray('walk_', 10),
            frameRate: ANIM_FRAMERATE.WALK,
            repeat: -1
        });

        // Walk 2 animation
        this.anims.create({
            key: 'player-walk2',
            frames: this.createFrameArray('walk2_', 10),
            frameRate: ANIM_FRAMERATE.WALK,
            repeat: -1
        });

        // Run animation
        this.anims.create({
            key: 'player-run',
            frames: this.createFrameArray('run_', 8),
            frameRate: ANIM_FRAMERATE.RUN,
            repeat: -1
        });

        // Jump animation
        this.anims.create({
            key: 'player-jump',
            frames: this.createFrameArray('jump_', 15),
            frameRate: ANIM_FRAMERATE.JUMP,
            repeat: 0
        });

        // Attack animation
        this.anims.create({
            key: 'player-attack',
            frames: this.createFrameArray('attack_', 8),
            frameRate: ANIM_FRAMERATE.ATTACK,
            repeat: 0
        });

        // Dead animation
        this.anims.create({
            key: 'player-dead',
            frames: this.createFrameArray('dead_', 10),
            frameRate: ANIM_FRAMERATE.DEAD,
            repeat: 0
        });
    }

    createFrameArray(prefix, count) {
        const frames = [];
        for (let i = 1; i <= count; i++) {
            frames.push({ key: `${prefix}${i}` });
        }
        return frames;
    }

    createProceduralTextures() {
        // 1. Cyber Floppy Disk (32x32)
        {
            const canvas = this.textures.createCanvas('floppy_disk', 32, 32);
            const ctx = canvas.context;
            
            // Draw dark carbon fiber/black floppy body
            ctx.fillStyle = '#18181c';
            ctx.beginPath();
            ctx.moveTo(2, 2);
            ctx.lineTo(26, 2);
            ctx.lineTo(30, 6); // Cut corner
            ctx.lineTo(30, 30);
            ctx.lineTo(2, 30);
            ctx.closePath();
            ctx.fill();
            
            // Neon cyan border
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Metal slide (top) in neon green
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(8, 3, 10, 8);
            ctx.fillStyle = '#0f5108';
            ctx.fillRect(11, 4, 3, 6);
            
            // Cyber glowing label (bottom)
            ctx.fillStyle = '#0a192f'; // Dark navy cyber bg
            ctx.fillRect(6, 16, 20, 12);
            ctx.strokeStyle = '#39ff14';
            ctx.lineWidth = 1;
            ctx.strokeRect(6, 16, 20, 12);
            
            // Glowing lines (fake code lines in cyan)
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(9, 20, 14, 2);
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(9, 24, 10, 2);
            
            canvas.refresh();
        }

        // 2. RAM Stick (48x16)
        {
            const canvas = this.textures.createCanvas('ram_stick', 48, 16);
            const ctx = canvas.context;
            
            // Board
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(2, 2, 44, 12);
            
            // Neon border
            ctx.strokeStyle = '#39ff14';
            ctx.lineWidth = 1;
            ctx.strokeRect(2, 2, 44, 12);
            
            // Chips
            ctx.fillStyle = '#212121';
            ctx.fillRect(6, 4, 6, 8);
            ctx.fillRect(14, 4, 6, 8);
            ctx.fillRect(22, 4, 6, 8);
            ctx.fillRect(30, 4, 6, 8);
            ctx.fillRect(38, 4, 6, 8);
            
            // Pins (Gold)
            ctx.fillStyle = '#ffd700';
            for (let x = 4; x < 44; x += 3) {
                ctx.fillRect(x, 12, 2, 2);
            }
            
            canvas.refresh();
        }

        // 3. Cyber Caffeine Mug (32x32)
        {
            const canvas = this.textures.createCanvas('coffee_mug', 32, 32);
            const ctx = canvas.context;
            
            // Saucer (Pires) at the bottom (x=2 to x=30, y=27 to y=29)
            ctx.fillStyle = '#1e1e24'; // Matte dark gray saucer
            ctx.fillRect(2, 27, 28, 2);
            ctx.fillStyle = '#00f0ff'; // Neon cyan highlight on saucer
            ctx.fillRect(5, 27, 22, 1);
            
            // Mug/Cup Body (Curved base, wider, from y=10 to y=26)
            ctx.fillStyle = '#121214'; // Matte dark black cup
            ctx.beginPath();
            ctx.moveTo(4, 10);
            ctx.lineTo(24, 10);
            ctx.lineTo(21, 26);
            ctx.lineTo(7, 26);
            ctx.closePath();
            ctx.fill();
            
            // Glow border around the cup body (Neon magenta/pink outline!)
            ctx.strokeStyle = '#ff007f'; 
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Handle on the right (centered at x=23, y=17, radius 5)
            ctx.strokeStyle = '#ff007f';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(23, 17, 5, -Math.PI/2, Math.PI/2);
            ctx.stroke();
            
            // Coffee liquid (Dark brown coffee, y=11 to y=13)
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(6, 11, 16, 3);
            ctx.fillStyle = '#8d6e63'; // Light brown coffee surface reflection
            ctx.fillRect(6, 11, 16, 1);
            
            // Cyber Steam (Neon Cyan)
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            
            // Steam line 1
            ctx.beginPath();
            ctx.moveTo(9, 8);
            ctx.bezierCurveTo(7, 6, 11, 4, 9, 1);
            ctx.stroke();
            
            // Steam line 2
            ctx.beginPath();
            ctx.moveTo(17, 8);
            ctx.bezierCurveTo(15, 6, 19, 4, 17, 1);
            ctx.stroke();
            
            canvas.refresh();
        }
    }
}
