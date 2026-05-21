/**
 * ZumbiNerd - Game Constants
 * All game-wide constants and configuration values
 */

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Physics
export const GRAVITY = 1100;
export const PLAYER_SPEED = 200;
export const PLAYER_RUN_SPEED = 350;
export const PLAYER_JUMP_VELOCITY = -760;

// Animation frame rates
export const ANIM_FRAMERATE = {
    IDLE: 10,
    WALK: 12,
    RUN: 14,
    JUMP: 12,
    ATTACK: 16,
    DEAD: 8
};

// Score values
export const SCORE = {
    BONE: 100,
    ENEMY: 250,
    LEVEL_COMPLETE: 500,
    COMBO_MULTIPLIER: 1.5
};

// Player states
export const PLAYER_STATE = {
    IDLE: 'idle',
    WALKING: 'walking',
    RUNNING: 'running',
    JUMPING: 'jumping',
    FALLING: 'falling',
    ATTACKING: 'attacking',
    DEAD: 'dead'
};

// Layer depths for proper rendering order
export const DEPTH = {
    BACKGROUND: 0,
    TILES: 10,
    COLLECTIBLES: 20,
    ENEMIES: 30,
    PLAYER: 40,
    EFFECTS: 50,
    UI: 100
};

// Colors matching CSS theme
export const COLORS = {
    ZOMBIE_GREEN: 0x7cb342,
    DARK_BG: 0x0a0a0f,
    PRIMARY: 0x4ecdc4,
    SECONDARY: 0xff6b6b,
    TEXT: 0xeaeaea
};

// Asset keys
export const ASSETS = {
    // Spritesheets
    PLAYER_IDLE: 'player-idle',
    PLAYER_IDLE2: 'player-idle2',
    PLAYER_WALK: 'player-walk',
    PLAYER_WALK2: 'player-walk2',
    PLAYER_RUN: 'player-run',
    PLAYER_JUMP: 'player-jump',
    PLAYER_ATTACK: 'player-attack',
    PLAYER_DEAD: 'player-dead',

    // Background and tiles
    BACKGROUND: 'background',

    // Objects
    TREE: 'tree',
    TOMBSTONE1: 'tombstone1',
    TOMBSTONE2: 'tombstone2',
    SKELETON: 'skeleton',
    ARROW_SIGN: 'arrow-sign',
    SIGN: 'sign',
    CRATE: 'crate',
    BUSH1: 'bush1',
    BUSH2: 'bush2',
    DEAD_BUSH: 'dead-bush',
    SPIKE: 'spike',
    SAW: 'saw',
    COMPUTER: 'computer'
};

// Scene keys
export const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    PAUSE: 'PauseScene',
    GAME_OVER: 'GameOverScene'
};
