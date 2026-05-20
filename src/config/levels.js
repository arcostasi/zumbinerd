/**
 * ZumbiNerd - Levels Configurations
 * Layout data for each level: platforms, collectibles, hazards, enemies, gaps, and goals.
 */

import { GAME_HEIGHT } from '../utils/constants.js';

export const LEVELS = {
    1: {
        name: "FASE 1: DEPÓSITO DE CODIGOS MORTOS",
        description: "Você está no 'Project Graveyard' da NeoCorp, onde softwares cancelados e servidores antigos foram enterrados.",
        background: "background",
        floorGaps: [], // No gaps in Phase 1
        platforms: [
            { x: 250, y: GAME_HEIGHT - 180, width: 3 },
            { x: 900, y: GAME_HEIGHT - 160, width: 4 },
            { x: 500, y: GAME_HEIGHT - 280, width: 3 },
            { x: 180, y: GAME_HEIGHT - 380, width: 2 },
            { x: 700, y: GAME_HEIGHT - 400, width: 3 }
        ],
        decorations: [
            // Background trees for depth
            { type: 'tree', x: 80, y: GAME_HEIGHT - 100, scale: 0.8, alpha: 0.7, depthBg: true },
            { type: 'tree', x: 1000, y: GAME_HEIGHT - 100, scale: 1.0, alpha: 0.5, depthBg: true },
            
            // Graveyard scenes (tombstones)
            { type: 'tombstone1', x: 350, y: GAME_HEIGHT - 80, scale: 1.4, label: "Flash Player" },
            { type: 'tombstone2', x: 750, y: GAME_HEIGHT - 80, scale: 1.3, label: "Google Reader" },

            // Guiding sign
            { type: 'arrow-sign', x: 100, y: GAME_HEIGHT - 80, scale: 1.3 }
        ],
        collectibles: [
            { x: 300, y: GAME_HEIGHT - 120 },
            { x: 280, y: GAME_HEIGHT - 230 },
            { x: 950, y: GAME_HEIGHT - 210 },
            { x: 200, y: GAME_HEIGHT - 430 }
        ],
        hazards: {
            spikes: [
                { x: 600, y: GAME_HEIGHT - 75 }
            ],
            saws: [] // No saws in Phase 1
        },
        enemies: [
            { x: 550, y: GAME_HEIGHT - 330, type: 'skeleton', minX: 500, maxX: 650, hp: 2 }
        ],
        goal: {
            x: 1200,
            y: GAME_HEIGHT - 120, // Ground level
            type: 'computer'
        }
    },
    2: {
        name: "FASE 2: ALA DOS PROJETOS ABORTADOS",
        description: "Cuidado: Aqui repousam o Windows Vista e outros fracassos. Bugs de memória física patrulham a ala.",
        background: "background",
        floorGaps: [8, 9, 10, 14, 15], 
        platforms: [
            { x: 150, y: GAME_HEIGHT - 160, width: 2 },
            { x: 320, y: GAME_HEIGHT - 260, width: 2 },
            { x: 520, y: GAME_HEIGHT - 380, width: 3 },
            { x: 800, y: GAME_HEIGHT - 280, width: 2 },
            { x: 1050, y: GAME_HEIGHT - 180, width: 2 },
            { type: 'platform', x: 1100, y: GAME_HEIGHT - 320, width: 3 }
        ],
        decorations: [
            { type: 'tree', x: 80, y: GAME_HEIGHT - 100, scale: 0.6, alpha: 0.5, depthBg: true },
            
            // Tombstones
            { type: 'tombstone1', x: 200, y: GAME_HEIGHT - 165, scale: 1.1, label: "Windows Vista" },
            { type: 'tombstone2', x: 830, y: GAME_HEIGHT - 80, scale: 1.3, label: "IE 6" },
            { type: 'skeleton_decor', x: 450, y: GAME_HEIGHT - 80, scale: 0.6 }
        ],
        collectibles: [
            { x: 180, y: GAME_HEIGHT - 210 },
            { x: 350, y: GAME_HEIGHT - 310 },
            { x: 550, y: GAME_HEIGHT - 430 },
            { x: 830, y: GAME_HEIGHT - 330 },
            { x: 1150, y: GAME_HEIGHT - 370 }
        ],
        hazards: {
            spikes: [
                { x: 780, y: GAME_HEIGHT - 75 }  // Spikes after the first gap on the ground
            ],
            saws: [
                { x: 480, y: GAME_HEIGHT - 200, scale: 0.55, type: 'vertical', range: 160, speed: 2000 },
                { x: 620, y: GAME_HEIGHT - 340, scale: 0.45, type: 'horizontal', range: 120, speed: 2500 }
            ]
        },
        enemies: [
            { x: 180, y: GAME_HEIGHT - 210, type: 'skeleton', minX: 130, maxX: 230, hp: 2 },
            { x: 550, y: GAME_HEIGHT - 430, type: 'skeleton', minX: 500, maxX: 640, hp: 2 },
            { x: 1050, y: GAME_HEIGHT - 230, type: 'skeleton', minX: 1010, maxX: 1090, hp: 2 }
        ],
        goal: {
            x: 1180,
            y: GAME_HEIGHT - 375,
            type: 'computer'
        }
    },
    3: {
        name: "FASE 3: CORREDOR DO LEGACY CODE",
        description: "Scripts em COBOL e Netscape assombram as partições de backup. Depure a infraestrutura!",
        background: "background",
        floorGaps: [5, 10, 15],
        platforms: [
            { x: 260, y: GAME_HEIGHT - 160, width: 3 },
            { x: 480, y: GAME_HEIGHT - 280, width: 4 },
            { x: 740, y: GAME_HEIGHT - 160, width: 3 },
            { x: 900, y: GAME_HEIGHT - 300, width: 3 }
        ],
        decorations: [
            { type: 'tombstone1', x: 220, y: GAME_HEIGHT - 80, scale: 1.4, label: "COBOL" },
            { type: 'tombstone2', x: 880, y: GAME_HEIGHT - 80, scale: 1.3, label: "Netscape" },
            { type: 'sign', x: 420, y: GAME_HEIGHT - 80, scale: 1.2 }
        ],
        collectibles: [
            { x: 300, y: GAME_HEIGHT - 210 },
            { x: 550, y: GAME_HEIGHT - 330 },
            { x: 800, y: GAME_HEIGHT - 210 },
            { x: 950, y: GAME_HEIGHT - 350 }
        ],
        hazards: {
            spikes: [
                { x: 700, y: GAME_HEIGHT - 75 }  // Floor spike between gaps
            ],
            saws: [
                { x: 350, y: GAME_HEIGHT - 100, scale: 0.55, type: 'vertical', range: 200, speed: 1200 },
                { x: 990, y: GAME_HEIGHT - 120, scale: 0.6, type: 'vertical', range: 250, speed: 1000 }
            ]
        },
        enemies: [
            { x: 260, y: GAME_HEIGHT - 210, type: 'skeleton', minX: 200, maxX: 320, hp: 2 },
            { x: 560, y: GAME_HEIGHT - 330, type: 'skeleton', minX: 490, maxX: 700, hp: 3 },
            { x: 800, y: GAME_HEIGHT - 210, type: 'skeleton', minX: 750, maxX: 890, hp: 2 },
            { x: 1080, y: GAME_HEIGHT - 120, type: 'skeleton', minX: 1040, maxX: 1150, hp: 3 }
        ],
        goal: {
            x: 1210,
            y: GAME_HEIGHT - 120,
            type: 'computer'
        }
    },
    4: {
        name: "FASE 4: PILHA DE RECURSÃO INFINITA",
        description: "O labirinto vertical de servidores antigos da NeoCorp. Suba desviando do abismo de overflow.",
        background: "background",
        floorGaps: [4, 5, 6, 7, 8, 12, 13, 14, 15],
        platforms: [
            { x: 100, y: GAME_HEIGHT - 180, width: 2 },
            { x: 280, y: GAME_HEIGHT - 260, width: 1 },
            { x: 400, y: GAME_HEIGHT - 360, width: 2 },
            { x: 580, y: GAME_HEIGHT - 440, width: 1 },
            { x: 720, y: GAME_HEIGHT - 340, width: 2 },
            { x: 900, y: GAME_HEIGHT - 240, width: 1 },
            { x: 1080, y: GAME_HEIGHT - 320, width: 2 }
        ],
        decorations: [
            { type: 'tree', x: 80, y: GAME_HEIGHT - 100, scale: 0.7, alpha: 0.5, depthBg: true },
            { type: 'tombstone2', x: 160, y: GAME_HEIGHT - 185, scale: 1.1, label: "Windows ME" },
            { type: 'skeleton_decor', x: 760, y: GAME_HEIGHT - 345, scale: 0.55, alpha: 0.8 }
        ],
        collectibles: [
            { x: 120, y: GAME_HEIGHT - 230 },
            { x: 420, y: GAME_HEIGHT - 410 },
            { x: 740, y: GAME_HEIGHT - 390 },
            { x: 1100, y: GAME_HEIGHT - 370 }
        ],
        hazards: {
            spikes: [
                { x: 400, y: GAME_HEIGHT - 365 }, // Left edge of Platform 3
                { type: 'spike', x: 1080, y: GAME_HEIGHT - 325 } // Left edge of Platform 7
            ],
            saws: [
                { x: 380, y: GAME_HEIGHT - 290, scale: 0.5, type: 'horizontal', range: 120, speed: 2000 },
                { x: 680, y: GAME_HEIGHT - 380, scale: 0.5, type: 'vertical', range: 150, speed: 1800 }
            ]
        },
        enemies: [
            { x: 420, y: GAME_HEIGHT - 410, type: 'skeleton', minX: 410, maxX: 490, hp: 2 },
            { x: 760, y: GAME_HEIGHT - 390, type: 'skeleton', minX: 730, maxX: 810, hp: 3 },
            { x: 1130, y: GAME_HEIGHT - 370, type: 'skeleton', minX: 1090, maxX: 1170, hp: 3 }
        ],
        goal: {
            x: 1150,
            y: GAME_HEIGHT - 345,
            type: 'computer'
        }
    },
    5: {
        name: "FASE 5: MAINFRAME CENTRAL (DEBUG FINAL)",
        description: "Você alcançou o coração dos servidores da NeoCorp! Depure o mainframe para reestabelecer o sistema.",
        background: "background",
        floorGaps: [3, 4, 9, 10, 11, 16, 17],
        platforms: [
            { x: 220, y: GAME_HEIGHT - 160, width: 3 },
            { x: 450, y: GAME_HEIGHT - 260, width: 2 },
            { x: 620, y: GAME_HEIGHT - 380, width: 4 },
            { x: 920, y: GAME_HEIGHT - 240, width: 3 },
            { x: 1100, y: GAME_HEIGHT - 360, width: 3 }
        ],
        decorations: [
            { type: 'tree', x: 80, y: GAME_HEIGHT - 100, scale: 0.9, alpha: 0.6, depthBg: true },
            { type: 'tombstone1', x: 150, y: GAME_HEIGHT - 80, scale: 1.4, label: "Google Glass" },
            { type: 'tombstone2', x: 530, y: GAME_HEIGHT - 80, scale: 1.3, label: "Delphi 7" },
            { type: 'arrow-sign', x: 1100, y: GAME_HEIGHT - 80, scale: 1.3 }
        ],
        collectibles: [
            { x: 250, y: GAME_HEIGHT - 210 },
            { x: 480, y: GAME_HEIGHT - 310 },
            { x: 650, y: GAME_HEIGHT - 430 },
            { x: 950, y: GAME_HEIGHT - 290 }
        ],
        hazards: {
            spikes: [
                { x: 680, y: GAME_HEIGHT - 385 }, // Middle of wide Platform 3
                { x: 1100, y: GAME_HEIGHT - 365 } // Entry edge of Platform 5
            ],
            saws: [
                { x: 380, y: GAME_HEIGHT - 250, scale: 0.6, type: 'vertical', range: 180, speed: 1400 },
                { x: 860, y: GAME_HEIGHT - 300, scale: 0.6, type: 'vertical', range: 200, speed: 1200 },
                { x: 1050, y: GAME_HEIGHT - 200, scale: 0.55, type: 'horizontal', range: 150, speed: 1800 }
            ]
        },
        enemies: [
            { x: 280, y: GAME_HEIGHT - 210, type: 'skeleton', minX: 230, maxX: 380, hp: 3 },
            { x: 680, y: GAME_HEIGHT - 430, type: 'skeleton', minX: 630, maxX: 840, hp: 3 },
            { x: 1140, y: GAME_HEIGHT - 410, type: 'skeleton', minX: 1110, maxX: 1250, hp: 4 }
        ],
        goal: {
            x: 1220,
            y: GAME_HEIGHT - 415,
            type: 'computer'
        }
    }
};
