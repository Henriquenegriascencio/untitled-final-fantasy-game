// Textures generator for Overworld, Dungeons, and Combat Battlefields
// Features multi-frame animated water, shore foam, authentic 16-bit RPG terrain,
// and textured battle arena surfaces for 3D/2D combat.

import { MapId } from '../types';

export interface ExplorationTextures {
  waterFrames: HTMLCanvasElement[];
  foamFrames: HTMLCanvasElement[];
  water: HTMLCanvasElement;
  grass: HTMLCanvasElement;
  forest: HTMLCanvasElement;
  mountain: HTMLCanvasElement;
  desert: HTMLCanvasElement;
  marsh: HTMLCanvasElement;
  bridgeH: HTMLCanvasElement;
  bridgeV: HTMLCanvasElement;
  town: HTMLCanvasElement;
  dungeon: HTMLCanvasElement;
  dungeonFogo: HTMLCanvasElement;
  dungeonAgua: HTMLCanvasElement;
  dungeonAr: HTMLCanvasElement;
  dungeonTerra: HTMLCanvasElement;
  portalChaos: HTMLCanvasElement;
  stairsDown: HTMLCanvasElement;
  stairsUp: HTMLCanvasElement;
  chest: HTMLCanvasElement;
  chestOpen: HTMLCanvasElement;
  dungeonPreludio: HTMLCanvasElement;
  dungeonDesafio: HTMLCanvasElement;
  dungeonFinal: HTMLCanvasElement;
  house: HTMLCanvasElement;
  itemShop: HTMLCanvasElement;
  toolsmith: HTMLCanvasElement;
  inn: HTMLCanvasElement;
  cobble: HTMLCanvasElement;
  fountain: HTMLCanvasElement;
  npcCitizen: HTMLCanvasElement;
  flowerbed?: HTMLCanvasElement;
  lantern?: HTMLCanvasElement;
  wallStone?: HTMLCanvasElement;
  interiorWoodFloor: HTMLCanvasElement;
  interiorWall: HTMLCanvasElement;
  interiorCounter: HTMLCanvasElement;
  interiorBed: HTMLCanvasElement;
  interiorBookshelf: HTMLCanvasElement;
  interiorFireplace: HTMLCanvasElement;
  interiorForge: HTMLCanvasElement;
  interiorDoormat: HTMLCanvasElement;
  npcMerchant: HTMLCanvasElement;
  npcBlacksmith: HTMLCanvasElement;
  npcInnkeeper: HTMLCanvasElement;
  npcResident: HTMLCanvasElement;
}

export interface CombatEnvironmentTextures {
  tileDataUrl: string;
  wallDataUrl: string;
  accentColor: string;
}

const createTileCanvas = (size: number, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
  }
  return canvas;
};

// Generate rich textures for overworld exploration
export const generateTextures = (tileSize: number): ExplorationTextures => {
  // 1. ANIMATED WATER (8 smoothly looping animation frames)
  const WATER_FRAME_COUNT = 8;
  const waterFrames: HTMLCanvasElement[] = [];
  const foamFrames: HTMLCanvasElement[] = [];

  for (let f = 0; f < WATER_FRAME_COUNT; f++) {
    const phase = (f / WATER_FRAME_COUNT) * Math.PI * 2;

    // Ocean Water Tile
    const waterCanvas = createTileCanvas(tileSize, (ctx) => {
      // Deep blue gradient base
      const grad = ctx.createLinearGradient(0, 0, tileSize, tileSize);
      grad.addColorStop(0, '#1a3d82');
      grad.addColorStop(0.5, '#1e4896');
      grad.addColorStop(1, '#163574');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, tileSize, tileSize);

      // Subtle deeper oceanic currents
      ctx.fillStyle = '#142c60';
      ctx.fillRect(0, tileSize * 0.7, tileSize, tileSize * 0.3);

      // Shifting sinusoidal wave crests
      const waveOffsets = [
        { yBase: 0.2, amp: 2, freq: 0.25, speed: 1.0, color: '#38bdf8' },
        { yBase: 0.5, amp: 2.5, freq: 0.3, speed: -1.0, color: '#60a5fa' },
        { yBase: 0.8, amp: 2, freq: 0.2, speed: 0.8, color: '#2563eb' },
      ];

      waveOffsets.forEach(w => {
        ctx.fillStyle = w.color;
        ctx.beginPath();
        for (let x = 0; x < tileSize; x += 2) {
          const waveY = (w.yBase * tileSize) + Math.sin((x * w.freq) + (phase * w.speed)) * w.amp;
          ctx.fillRect(x, Math.floor(waveY), 3, 2);
        }
      });

      // Shimmering water foam glints
      const glints = [
        { x: (tileSize * 0.25 + Math.sin(phase) * 3) % tileSize, y: tileSize * 0.3 },
        { x: (tileSize * 0.65 + Math.cos(phase) * 4) % tileSize, y: tileSize * 0.6 },
        { x: (tileSize * 0.85 + Math.sin(phase + 1) * 3) % tileSize, y: tileSize * 0.15 },
        { x: (tileSize * 0.4 + Math.cos(phase + 2) * 3) % tileSize, y: tileSize * 0.85 },
      ];

      ctx.fillStyle = '#ffffff';
      glints.forEach(g => {
        const gx = Math.floor((g.x + tileSize) % tileSize);
        const gy = Math.floor(g.y);
        ctx.fillRect(gx, gy, 2, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(gx - 1, gy, 1, 2);
        ctx.fillRect(gx + 2, gy, 1, 2);
        ctx.fillStyle = '#ffffff';
      });
    });

    // Coastal Shoreline Foam Overlay Tile
    const foamCanvas = createTileCanvas(tileSize, (ctx) => {
      ctx.clearRect(0, 0, tileSize, tileSize);
      const foamOffset = Math.sin(phase) * 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(0, 0, tileSize, 3 + Math.floor(foamOffset));
      ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.fillRect(0, 3 + Math.floor(foamOffset), tileSize, 2);
    });

    waterFrames.push(waterCanvas);
    foamFrames.push(foamCanvas);
  }

  // 2. LUSH GRASS / PLAINS
  const grass = createTileCanvas(tileSize, (ctx) => {
    // Rich green base
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Subtle natural earth shading
    ctx.fillStyle = '#266929';
    ctx.fillRect(0, tileSize - 4, tileSize, 4);
    ctx.fillRect(tileSize - 4, 0, 4, tileSize);

    // Multi-shade grass specks and blades
    const blades = [
      { color: '#4caf50', points: [[4, 6], [12, 18], [24, 8], [32, 22], [8, 30], [20, 34]] },
      { color: '#81c784', points: [[6, 8], [14, 20], [26, 10], [34, 24], [10, 32], [22, 36]] },
      { color: '#1b5e20', points: [[2, 14], [18, 12], [28, 28], [6, 24], [30, 6]] },
    ];

    blades.forEach(b => {
      ctx.fillStyle = b.color;
      b.points.forEach(([bx, by]) => {
        const x = bx % tileSize;
        const y = by % tileSize;
        ctx.fillRect(x, y, 2, 3);
        ctx.fillRect(x + 1, y - 1, 2, 2);
      });
    });

    // Tiny wildflowers / clover
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(10, 10, 2, 2);
    ctx.fillRect(28, 26, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 30, 2, 2);
  });

  // 3. FOREST / WOODS
  const forest = createTileCanvas(tileSize, (ctx) => {
    // Green woodland floor base
    ctx.fillStyle = '#1e5422';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Helper to draw a classic 16-bit RPG pine/canopy tree
    const drawTree = (cx: number, cy: number, scale: number) => {
      const w = 12 * scale;
      const h = 18 * scale;

      // Tree drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.45, w * 0.7, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tree trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 2 * scale, cy + h * 0.2, 4 * scale, 6 * scale);

      // Layer 1: lower canopy
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.2);
      ctx.lineTo(cx + w * 0.6, cy + h * 0.25);
      ctx.lineTo(cx - w * 0.6, cy + h * 0.25);
      ctx.fill();

      // Layer 2: middle canopy
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.45);
      ctx.lineTo(cx + w * 0.5, cy);
      ctx.lineTo(cx - w * 0.5, cy);
      ctx.fill();

      // Layer 3: upper canopy tip with sun highlight
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.6);
      ctx.lineTo(cx + w * 0.35, cy - h * 0.2);
      ctx.lineTo(cx - w * 0.35, cy - h * 0.2);
      ctx.fill();

      // Highlight speck on left shoulder
      ctx.fillStyle = '#86efac';
      ctx.fillRect(cx - 2 * scale, cy - h * 0.35, 3 * scale, 2 * scale);
    };

    // Draw clustered forest trees
    drawTree(tileSize * 0.3, tileSize * 0.4, 0.9);
    drawTree(tileSize * 0.75, tileSize * 0.45, 0.85);
    drawTree(tileSize * 0.5, tileSize * 0.75, 1.05);
  });

  // 4. MOUNTAINS (Snow-capped peaks with rocky ridges)
  const mountain = createTileCanvas(tileSize, (ctx) => {
    // Base dark slate earth
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Large main mountain peak
    const peakX = tileSize * 0.5;
    const peakY = 4;
    const leftBaseX = 2;
    const rightBaseX = tileSize - 2;
    const baseY = tileSize - 2;

    // Shadow side (East flank)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(rightBaseX, baseY);
    ctx.lineTo(peakX, baseY);
    ctx.fill();

    // Lit side (West flank)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(leftBaseX, baseY);
    ctx.lineTo(peakX, baseY);
    ctx.fill();

    // Rocky ridges / strata cuts
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX + 4, baseY * 0.5);
    ctx.lineTo(peakX + 2, baseY);
    ctx.stroke();

    // Snow-capped peak summit
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX + 7, peakY + 11);
    ctx.lineTo(peakX + 2, peakY + 9);
    ctx.lineTo(peakX - 3, peakY + 12);
    ctx.lineTo(peakX - 7, peakY + 10);
    ctx.fill();

    // Subtle blue shadow on the snow east flank
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX + 7, peakY + 11);
    ctx.lineTo(peakX, peakY + 10);
    ctx.fill();

    // Secondary smaller ridge in foreground
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.25, tileSize * 0.6);
    ctx.lineTo(tileSize * 0.5, baseY);
    ctx.lineTo(0, baseY);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(leftBaseX + 4, baseY - 4, 3, 2);
  });

  // 5. DESERT / SAND (Golden dunes with wind ripples)
  const desert = createTileCanvas(tileSize, (ctx) => {
    // Warm golden sand base
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Dune ridges
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, tileSize, tileSize * 0.4);

    // Wind wave curves
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < tileSize; i += 4) {
      const y1 = Math.floor(8 + Math.sin(i * 0.3) * 2);
      const y2 = Math.floor(22 + Math.cos(i * 0.25) * 3);
      ctx.fillRect(i, y1, 3, 1.5);
      ctx.fillRect(i, y2, 3, 1.5);
    }

    // Shadow in dune troughs
    ctx.fillStyle = '#b45309';
    for (let i = 2; i < tileSize; i += 6) {
      const y1 = Math.floor(11 + Math.sin(i * 0.3) * 2);
      const y2 = Math.floor(25 + Math.cos(i * 0.25) * 3);
      ctx.fillRect(i, y1, 2, 1);
      ctx.fillRect(i, y2, 2, 1);
    }

    // Sandstone pebble specks
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 14, 2, 2);
    ctx.fillRect(26, 30, 2, 2);
    ctx.fillRect(32, 6, 2, 2);
  });

  // 6. SWAMP / MARSH
  const marsh = createTileCanvas(tileSize, (ctx) => {
    // Dark olive murky bog
    ctx.fillStyle = '#3f4f24';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stagnant brackish water pools
    ctx.fillStyle = '#1e2e14';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.4, tileSize * 0.5, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2b3e1c';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.75, tileSize * 0.25, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reeds / cattails sticking out
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(tileSize * 0.2, tileSize * 0.3, 1.5, 8);
    ctx.fillRect(tileSize * 0.25, tileSize * 0.32, 1.5, 9);
    ctx.fillRect(tileSize * 0.6, tileSize * 0.6, 1.5, 10);
    ctx.fillRect(tileSize * 0.65, tileSize * 0.58, 1.5, 8);

    // Brown cattail tips
    ctx.fillStyle = '#713f12';
    ctx.fillRect(tileSize * 0.19, tileSize * 0.28, 2, 4);
    ctx.fillRect(tileSize * 0.59, tileSize * 0.56, 2, 4);
  });

  // 7. BRIDGES (Horizontal & Vertical wooden plank bridges over water)
  const bridgeH = createTileCanvas(tileSize, (ctx) => {
    // Water background underneath
    ctx.fillStyle = '#1e4896';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Wooden bridge deck
    const bridgeY = Math.floor(tileSize * 0.2);
    const bridgeH = Math.floor(tileSize * 0.6);

    ctx.fillStyle = '#78350f'; // wood base
    ctx.fillRect(0, bridgeY, tileSize, bridgeH);

    // Planks
    for (let x = 0; x < tileSize; x += 5) {
      ctx.fillStyle = x % 10 === 0 ? '#92400e' : '#b45309';
      ctx.fillRect(x, bridgeY + 2, 4, bridgeH - 4);
      ctx.fillStyle = '#451a03'; // plank border line
      ctx.fillRect(x + 4, bridgeY, 1, bridgeH);
    }

    // Top and bottom guide railings
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, bridgeY, tileSize, 2);
    ctx.fillRect(0, bridgeY + bridgeH - 2, tileSize, 2);
    ctx.fillStyle = '#cbd5e1'; // iron fasteners
    for (let x = 2; x < tileSize; x += 10) {
      ctx.fillRect(x, bridgeY, 2, 2);
      ctx.fillRect(x, bridgeY + bridgeH - 2, 2, 2);
    }
  });

  const bridgeV = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#1e4896';
    ctx.fillRect(0, 0, tileSize, tileSize);

    const bridgeX = Math.floor(tileSize * 0.2);
    const bridgeW = Math.floor(tileSize * 0.6);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(bridgeX, 0, bridgeW, tileSize);

    for (let y = 0; y < tileSize; y += 5) {
      ctx.fillStyle = y % 10 === 0 ? '#92400e' : '#b45309';
      ctx.fillRect(bridgeX + 2, y, bridgeW - 4, 4);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bridgeX, y + 4, bridgeW, 1);
    }

    ctx.fillStyle = '#451a03';
    ctx.fillRect(bridgeX, 0, 2, tileSize);
    ctx.fillRect(bridgeX + bridgeW - 2, 0, 2, tileSize);
    ctx.fillStyle = '#cbd5e1';
    for (let y = 2; y < tileSize; y += 10) {
      ctx.fillRect(bridgeX, y, 2, 2);
      ctx.fillRect(bridgeX + bridgeW - 2, y, 2, 2);
    }
  });

  // 8. TOWN / CASTLE (Cornelia, Elfheim, Pravoca, etc.)
  const town = createTileCanvas(tileSize, (ctx) => {
    // Cobblestone / grass base
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Cobblestone town plaza perimeter
    ctx.fillStyle = '#64748b';
    ctx.fillRect(4, 8, tileSize - 8, tileSize - 10);

    // Castle towers on left and right
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(4, 6, 8, tileSize - 8);
    ctx.fillRect(tileSize - 12, 6, 8, tileSize - 8);

    // Tower battlements (crenellations)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillRect(9, 4, 3, 3);
    ctx.fillRect(tileSize - 12, 4, 3, 3);
    ctx.fillRect(tileSize - 7, 4, 3, 3);

    // Red clay tiled main keep roof
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 10, 14);
    ctx.lineTo(10, 14);
    ctx.fill();

    // Central stone wall
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, 14, tileSize - 20, tileSize - 16);

    // Arched portcullis gate
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 2, 5, Math.PI, 0);
    ctx.fill();

    // Gate iron bars
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5 - 2, tileSize - 7);
    ctx.lineTo(tileSize * 0.5 - 2, tileSize - 2);
    ctx.moveTo(tileSize * 0.5 + 2, tileSize - 7);
    ctx.lineTo(tileSize * 0.5 + 2, tileSize - 2);
    ctx.stroke();

    // Golden banner atop the keep
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(tileSize * 0.5 - 1, 0, 2, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(tileSize * 0.5 + 1, 0, 4, 3);
  });

  // 9. DUNGEON 1: MT. GULG (Fire Volcano - Fogo)
  const dungeonFogo = createTileCanvas(tileSize, (ctx) => {
    // Dark basalt volcano base
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Volcano slope
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 6);
    ctx.lineTo(tileSize - 4, tileSize - 2);
    ctx.lineTo(4, tileSize - 2);
    ctx.fill();

    // Molten lava fissures dripping down slopes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 12);
    ctx.lineTo(tileSize * 0.35, tileSize - 4);
    ctx.moveTo(tileSize * 0.52, 12);
    ctx.lineTo(tileSize * 0.7, tileSize - 6);
    ctx.stroke();

    // Volcanic caldera with glowing orange magma
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, 9, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, 9, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rising smoke plume
    ctx.fillStyle = 'rgba(120, 113, 108, 0.6)';
    ctx.beginPath();
    ctx.arc(tileSize * 0.48, 4, 3, 0, Math.PI * 2);
    ctx.arc(tileSize * 0.53, 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 10. DUNGEON 2: SUNKEN SHRINE (Water Temple - Agua)
  const dungeonAgua = createTileCanvas(tileSize, (ctx) => {
    // Ocean base
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Submerged temple platform
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(6, 6, tileSize - 12, tileSize - 10);

    // Aquamarine carved pillars
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect(8, 8, 5, tileSize - 14);
    ctx.fillRect(tileSize - 13, 8, 5, tileSize - 14);

    // Temple pediment / roof with sea-green rune
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 4);
    ctx.lineTo(tileSize - 6, 12);
    ctx.lineTo(6, 12);
    ctx.fill();

    // Deep undersea portal with glowing sapphire orb
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(14, 14, tileSize - 28, tileSize - 18);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize * 0.6, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 11. DUNGEON 3: MIRAGE TOWER (Air / Wind Spire - Ar)
  const dungeonAr = createTileCanvas(tileSize, (ctx) => {
    // Desert or sky base
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Tower base platform
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(8, tileSize - 8, tileSize - 16, 6);

    // Soaring white marble spire
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 12, tileSize - 8);
    ctx.lineTo(12, tileSize - 8);
    ctx.fill();

    // Golden spire crown
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(tileSize * 0.5 - 2, 2, 4, 5);

    // Floating celestial clouds around tower
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.3, tileSize * 0.5, 7, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(tileSize * 0.7, tileSize * 0.35, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tower arched entry
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(tileSize * 0.5 - 3, tileSize - 12, 6, 7);
  });

  // 12. DUNGEON 4: TERRA CAVERN (Earth Cavern - Terra)
  const dungeonTerra = createTileCanvas(tileSize, (ctx) => {
    // Rocky forest/mountain ground
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Cavern rock mound
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 4);
    ctx.lineTo(tileSize - 2, tileSize - 2);
    ctx.lineTo(2, tileSize - 2);
    ctx.fill();

    // Overgrown moss layer
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 4);
    ctx.lineTo(tileSize * 0.7, 14);
    ctx.lineTo(tileSize * 0.3, 14);
    ctx.fill();

    // Deep dark cavern mouth
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 2, 9, Math.PI, 0);
    ctx.fill();

    // Earth runes on lintel
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(tileSize * 0.5 - 7, tileSize - 13, 14, 3);
  });

  // 13. TEMPLE OF CHAOS (Final Portal - F)
  const portalChaos = createTileCanvas(tileSize, (ctx) => {
    // Ruined charred earth
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Gothic temple pillars
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(4, 4, 6, tileSize - 6);
    ctx.fillRect(tileSize - 10, 4, 6, tileSize - 6);

    // Broken archway
    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 4, 8);
    ctx.lineTo(4, 8);
    ctx.fill();

    // Chaos Void Portal in center
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize * 0.55, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize * 0.55, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tileSize * 0.5 - 1, tileSize * 0.55 - 3, 2, 6);
  });

  // 14. STAIRS DOWN (>)
  const stairsDown = createTileCanvas(tileSize, (ctx) => {
    // Dungeon floor base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, tileSize - 4, tileSize - 4);

    // Dark descending stairway
    const stepCount = 5;
    for (let i = 0; i < stepCount; i++) {
      const y = 6 + i * 5;
      const shade = Math.floor(60 - i * 10);
      ctx.fillStyle = `rgb(${shade}, ${shade + 5}, ${shade + 15})`;
      ctx.fillRect(6, y, tileSize - 12, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(6, y, tileSize - 12, 1);
    }

    // Downward indicator arrow in gold
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, tileSize - 6);
    ctx.lineTo(tileSize * 0.5 - 4, tileSize - 11);
    ctx.lineTo(tileSize * 0.5 + 4, tileSize - 11);
    ctx.fill();
  });

  // 15. STAIRS UP (<)
  const stairsUp = createTileCanvas(tileSize, (ctx) => {
    // Dungeon floor base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, tileSize - 4, tileSize - 4);

    // Illuminated ascending stairway
    const stepCount = 5;
    for (let i = 0; i < stepCount; i++) {
      const y = tileSize - 10 - i * 5;
      const shade = Math.floor(40 + i * 15);
      ctx.fillStyle = `rgb(${shade}, ${shade + 10}, ${shade + 20})`;
      ctx.fillRect(6, y, tileSize - 12, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(6, y, tileSize - 12, 1);
    }

    // Upward indicator arrow in cyan
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 6);
    ctx.lineTo(tileSize * 0.5 - 4, 11);
    ctx.lineTo(tileSize * 0.5 + 4, 11);
    ctx.fill();
  });

  // 16. TREASURE CHEST CLOSED (X)
  const chest = createTileCanvas(tileSize, (ctx) => {
    // Floor background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 6, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest Wooden Body
    const cx = 7;
    const cy = 10;
    const cw = tileSize - 14;
    const ch = tileSize - 18;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx, cy, cw, ch);

    // Wood grain detail
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx + 2, cy + 2, cw - 4, 6);
    ctx.fillRect(cx + 2, cy + 10, cw - 4, ch - 12);

    // Gold / Bronze Bands
    ctx.fillStyle = '#eab308';
    ctx.fillRect(cx, cy, cw, 2); // Top rim
    ctx.fillRect(cx, cy + 7, cw, 2); // Middle latch line
    ctx.fillRect(cx, cy + ch - 2, cw, 2); // Bottom rim
    ctx.fillRect(cx + 3, cy, 3, ch); // Left vertical band
    ctx.fillRect(cx + cw - 6, cy, 3, ch); // Right vertical band

    // Golden Keyhole Lock
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(tileSize * 0.5 - 2, cy + 6, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(tileSize * 0.5 - 1, cy + 7, 2, 2);
  });

  // 17. TREASURE CHEST OPEN (X when opened)
  const chestOpen = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 6, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = 7;
    const cy = 13;
    const cw = tileSize - 14;
    const ch = tileSize - 20;

    // Dark empty interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx, cy, cw, ch);

    // Chest box rim
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx, cy + 3, cw, ch - 3);
    ctx.fillStyle = '#eab308';
    ctx.strokeRect(cx, cy + 3, cw, ch - 3);

    // Tilted Open Lid
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx - 1, cy - 6, cw + 2, 6);
    ctx.fillStyle = '#eab308';
    ctx.strokeRect(cx - 1, cy - 6, cw + 2, 6);
  });

  // 18. DUNGEON PRELUDIO (0)
  const dungeonPreludio = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Gray rocky cavern mound
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 4);
    ctx.lineTo(tileSize - 3, tileSize - 2);
    ctx.lineTo(3, tileSize - 2);
    ctx.fill();

    // Dark entrance
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 2, 8, Math.PI, 0);
    ctx.fill();

    // Torch on side
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(tileSize * 0.5 - 9, tileSize - 10, 2, 4);
    ctx.fillRect(tileSize * 0.5 + 7, tileSize - 10, 2, 4);
  });

  // 19. DUNGEON DESAFIO (Non-elemental challenge citadel)
  const dungeonDesafio = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Dark granite ancestral citadel
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 8, tileSize - 8, tileSize - 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(7, 4, tileSize - 14, 6);

    // Twin warrior banners
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(6, 4, 3, 7);
    ctx.fillRect(tileSize - 9, 4, 3, 7);

    // Arched portcullis gate
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 2, 7, Math.PI, 0);
    ctx.fill();

    // Golden symbol above gate
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tileSize * 0.5 - 2, 10, 4, 3);
  });

  // 20. TOWN HOUSE (Residential cottage)
  const house = createTileCanvas(tileSize, (ctx) => {
    // Cobblestone ground
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // House walls (timber and plaster)
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(4, 12, tileSize - 8, tileSize - 14);

    // Corner timber posts
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 12, 3, tileSize - 14);
    ctx.fillRect(tileSize - 7, 12, 3, tileSize - 14);

    // Terracotta roof
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 2, 14);
    ctx.lineTo(2, 14);
    ctx.fill();

    // Wooden door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(tileSize * 0.5 - 3, tileSize - 11, 6, 9);
    ctx.fillStyle = '#fef08a'; // brass doorknob
    ctx.fillRect(tileSize * 0.5 + 1, tileSize - 7, 1.5, 1.5);

    // Warm lighted window
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(tileSize * 0.5 - 10, 16, 5, 5);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(tileSize * 0.5 - 10, 16, 5, 5);
  });

  // 21. TOWN ITEM SHOP (Loja de Itens / Pocao)
  const itemShop = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shop walls
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 12, tileSize - 8, tileSize - 14);

    // Blue potion guild roof
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 2, 14);
    ctx.lineTo(2, 14);
    ctx.fill();

    // Shop door
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(tileSize * 0.5 - 4, tileSize - 11, 8, 9);

    // Potion bottle sign hanging
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 17, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tileSize * 0.5 - 1, 13, 2, 2);
  });

  // 22. TOWN TOOLSMITH (Ferramenteiro / Forja)
  const toolsmith = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Dark soot-stained stone forge walls
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 12, tileSize - 8, tileSize - 14);

    // Brick chimney on roof puffing white smoke
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(tileSize - 10, 3, 5, 11);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(tileSize - 7.5, 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Steel roof
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5 - 2, 4);
    ctx.lineTo(tileSize - 3, 14);
    ctx.lineTo(3, 14);
    ctx.fill();

    // Forge door with glowing embers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tileSize * 0.5 - 4, tileSize - 11, 8, 9);
    ctx.fillStyle = '#f97316'; // glow
    ctx.fillRect(tileSize * 0.5 - 2, tileSize - 6, 4, 3);

    // Anvil sign
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(tileSize * 0.5 - 4, 16, 8, 3);
  });

  // 23. TOWN INN (Estalagem)
  const inn = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Warm timber walls
    ctx.fillStyle = '#d97706';
    ctx.fillRect(4, 12, tileSize - 8, tileSize - 14);

    // Green shingled roof
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, 2);
    ctx.lineTo(tileSize - 2, 14);
    ctx.lineTo(2, 14);
    ctx.fill();

    // Large welcoming wooden double door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(tileSize * 0.5 - 4, tileSize - 11, 8, 9);

    // Golden bed / rest sign
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tileSize * 0.5 - 4, 16, 8, 4);
  });

  // 24. TOWN COBBLESTONE (Paved streets)
  const cobble = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Pavers pattern
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    for (let y = 0; y < tileSize; y += 8) {
      const offset = (y % 16 === 0) ? 0 : 8;
      for (let x = offset; x < tileSize; x += 16) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#94a3b8' : '#64748b';
        ctx.fillRect(x + 1, y + 1, 14, 6);
        ctx.strokeRect(x, y, 16, 8);
      }
    }
  });

  // 25. TOWN FOUNTAIN
  const fountain = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Circular stone rim
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize * 0.5, 15, 0, Math.PI * 2);
    ctx.fill();

    // Sparkling blue fountain pool
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize * 0.5, 11, 0, Math.PI * 2);
    ctx.fill();

    // Center spray fountain
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 26. NPC TOWNSFOLK
  const npcCitizen = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / tunic (amber-red)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(tileSize * 0.5 - 5, 16, 10, 13);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 11, 5, 0, Math.PI * 2);
    ctx.fill();

    // Brown hair
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 9, 5.5, Math.PI, Math.PI * 2);
    ctx.fill();

    // Exclamation / dialogue bubble hint above head
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5 + 8, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tileSize * 0.5 + 7.5, 4, 1.5, 3);
    ctx.fillRect(tileSize * 0.5 + 7.5, 8, 1.5, 1.5);
  });

  // 27. TOWN FLOWERBED / JARDIM FLORIDO (G)
  const flowerbed = createTileCanvas(tileSize, (ctx) => {
    // Soil and grass base
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone border curb
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, tileSize - 2, tileSize - 2);

    // Colorful blooming flowers
    const flowers = [
      { x: 8, y: 8, c: '#ef4444' }, // red rose
      { x: 22, y: 9, c: '#facc15' }, // yellow marigold
      { x: 15, y: 16, c: '#38bdf8' }, // blue blossom
      { x: 8, y: 23, c: '#f43f5e' }, // pink petal
      { x: 23, y: 22, c: '#ffffff' }, // white daisy
    ];

    flowers.forEach(f => {
      // Petals
      ctx.fillStyle = f.c;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // Center pollen dot
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(f.x - 0.75, f.y - 0.75, 1.5, 1.5);
    });
  });

  // 28. TOWN STREET LANTERN / POSTE DE LUZ (L)
  const lantern = createTileCanvas(tileSize, (ctx) => {
    // Cobblestone ground base
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Ground warm golden glow circle
    ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize * 0.5, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dark iron post base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tileSize * 0.5 - 2, tileSize - 8, 4, 6);
    ctx.fillRect(tileSize * 0.5 - 1, 10, 2, tileSize - 18);

    // Wrought iron lantern cage
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tileSize * 0.5 - 4, 6, 8, 8);
    ctx.fillStyle = '#334155';
    ctx.fillRect(tileSize * 0.5 - 5, 4, 10, 2);

    // Glowing flame core
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(tileSize * 0.5 - 2, 8, 4, 4);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(tileSize * 0.5 - 1, 9, 2, 2);
  });

  // 29. TOWN CASTLE STONE WALL (W)
  const wallStone = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone masonry brick lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 0; y < tileSize; y += 8) {
      const offset = (y % 16 === 0) ? 0 : 8;
      for (let x = offset; x < tileSize; x += 16) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#475569' : '#334155';
        ctx.fillRect(x + 1, y + 1, 14, 6);
        ctx.strokeRect(x, y, 16, 8);
      }
    }

    // Top stone battlements trim
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, tileSize, 2);
  });

  // 30. INTERIOR WOOD FLOOR (.)
  const interiorWoodFloor = createTileCanvas(tileSize, (ctx) => {
    // Rich warm oak parquet floor
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Floor planks
    for (let y = 0; y < tileSize; y += 8) {
      const offset = (y % 16 === 0) ? 0 : 8;
      for (let x = offset; x < tileSize; x += 16) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#92400e' : '#b45309';
        ctx.fillRect(x + 1, y + 1, 14, 6);
        ctx.fillStyle = '#451a03'; // plank seams
        ctx.fillRect(x, y, 16, 1);
        ctx.fillRect(x, y, 1, 8);
      }
    }

    // Subtle nail pins
    ctx.fillStyle = '#271003';
    for (let y = 3; y < tileSize; y += 8) {
      for (let x = 3; x < tileSize; x += 8) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  // 31. INTERIOR WALL (W)
  const interiorWall = createTileCanvas(tileSize, (ctx) => {
    // Upper plaster / stone wallpaper
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stately wood wainscoting panel base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, tileSize * 0.55, tileSize, tileSize * 0.45);

    // Wainscot wood molding border
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, tileSize * 0.55, tileSize, 2);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, tileSize * 0.55 + 2, tileSize, 1);

    // Panel vertical insets
    ctx.fillStyle = '#5c2306';
    ctx.fillRect(3, tileSize * 0.62, 10, tileSize * 0.3);
    ctx.fillRect(tileSize - 13, tileSize * 0.62, 10, tileSize * 0.3);

    // Warm wall sconce / decorative lantern
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 9, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(tileSize * 0.5 - 1, 8, 2, 2);
  });

  // 32. INTERIOR COUNTER (T)
  const interiorCounter = createTileCanvas(tileSize, (ctx) => {
    // Floor background
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Counter shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, tileSize * 0.75, tileSize, tileSize * 0.25);

    // Polished mahogany counter top
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, 4, tileSize, tileSize - 8);

    // Counter trim and golden highlight
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 4, tileSize, 3);
    ctx.fillStyle = '#f59e0b'; // golden front rail
    ctx.fillRect(0, 7, tileSize, 1.5);

    // Front wood panel
    ctx.fillStyle = '#78350f';
    ctx.fillRect(2, 11, tileSize - 4, tileSize - 18);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 12, tileSize - 6, tileSize - 20);

    // Decorative potion flask or shop scale
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(tileSize * 0.5 - 3, 2, 6, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tileSize * 0.5 - 1, 1, 2, 2);
  });

  // 33. INTERIOR BED (I)
  const interiorBed = createTileCanvas(tileSize, (ctx) => {
    // Floor
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Bed shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(3, 5, tileSize - 6, tileSize - 7);

    // Dark oak headboard
    ctx.fillStyle = '#451a03';
    ctx.fillRect(4, 3, tileSize - 8, 7);

    // Mattress & Bedspread (Rich Royal Red Blanket)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(5, 8, tileSize - 10, tileSize - 11);

    // Blanket gold embroidery trim
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(5, 12, tileSize - 10, 2);

    // White fluffy pillow
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tileSize * 0.5 - 7, 6, 14, 5);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(tileSize * 0.5 - 7, 6, 14, 5);
  });

  // 34. INTERIOR BOOKSHELF (B)
  const interiorBookshelf = createTileCanvas(tileSize, (ctx) => {
    // Wall behind
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Bookshelf dark oak frame
    ctx.fillStyle = '#451a03';
    ctx.fillRect(2, 2, tileSize - 4, tileSize - 3);

    // Shelves
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 4, tileSize - 8, tileSize - 7);

    // Shelf dividers
    ctx.fillStyle = '#451a03';
    ctx.fillRect(4, 13, tileSize - 8, 2);
    ctx.fillRect(4, 22, tileSize - 8, 2);

    // Top shelf colorful books
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#ea580c'];
    let curX = 6;
    while (curX < tileSize - 8) {
      const color = bookColors[(curX * 3) % bookColors.length];
      const width = Math.min(3, tileSize - 8 - curX);
      ctx.fillStyle = color;
      ctx.fillRect(curX, 5, width, 8);
      curX += width + 1;
    }

    // Bottom shelf books and ancient scrolls
    curX = 6;
    while (curX < tileSize - 8) {
      const color = bookColors[(curX * 5) % bookColors.length];
      const width = Math.min(3, tileSize - 8 - curX);
      ctx.fillStyle = color;
      ctx.fillRect(curX, 15, width, 7);
      curX += width + 1;
    }
  });

  // 35. INTERIOR FIREPLACE (H)
  const interiorFireplace = createTileCanvas(tileSize, (ctx) => {
    // Wall behind
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Brick chimney mantel
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(3, 2, tileSize - 6, tileSize - 3);

    // Brick mortar lines
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1;
    for (let y = 2; y < tileSize; y += 4) {
      ctx.strokeRect(3, y, tileSize - 6, 4);
    }

    // Fire hearth opening
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(7, 10, tileSize - 14, tileSize - 12);

    // Burning glowing fire & embers
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 7, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, tileSize - 6, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tileSize * 0.5 - 1, tileSize - 6, 2, 2);
  });

  // 36. INTERIOR FORGE / ANVIL (E)
  const interiorForge = createTileCanvas(tileSize, (ctx) => {
    // Floor
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone forge platform
    ctx.fillStyle = '#475569';
    ctx.fillRect(3, 8, tileSize - 6, tileSize - 10);

    // Anvil base (stump)
    ctx.fillStyle = '#334155';
    ctx.fillRect(tileSize * 0.5 - 6, 12, 12, 12);

    // Iron anvil horn and flat
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(tileSize * 0.5 - 9, 8, 18, 5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(tileSize * 0.5 - 9, 8, 18, 2);

    // Glowing red tongs / steel ingot
    ctx.fillStyle = '#f97316';
    ctx.fillRect(tileSize * 0.5 - 4, 9, 8, 2);
  });

  // 37. INTERIOR DOORMAT / EXIT (<)
  const interiorDoormat = createTileCanvas(tileSize, (ctx) => {
    // Wood floor base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Ornate red welcome mat
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(4, 4, tileSize - 8, tileSize - 8);

    // Gold braided fringe border
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 5, tileSize - 10, tileSize - 10);

    // Golden exit arrow pointing outside
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(tileSize * 0.5, tileSize - 7);
    ctx.lineTo(tileSize * 0.5 - 4, tileSize - 12);
    ctx.lineTo(tileSize * 0.5 + 4, tileSize - 12);
    ctx.fill();
  });

  // 38. NPC MERCHANT
  const npcMerchant = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue wizard / merchant robe
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(tileSize * 0.5 - 5, 15, 10, 14);

    // Gold trim robe
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tileSize * 0.5 - 1, 15, 2, 14);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Merchant hat with feather
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 8, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(tileSize * 0.5 + 3, 3, 2, 5);
  });

  // 39. NPC BLACKSMITH
  const npcBlacksmith = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Muscular body with brown leather apron
    ctx.fillStyle = '#92400e';
    ctx.fillRect(tileSize * 0.5 - 6, 14, 12, 15);
    ctx.fillStyle = '#451a03'; // apron strap
    ctx.fillRect(tileSize * 0.5 - 4, 14, 2, 6);
    ctx.fillRect(tileSize * 0.5 + 2, 14, 2, 6);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 9, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Red bandana
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(tileSize * 0.5 - 6, 6, 12, 3);
  });

  // 40. NPC INNKEEPER
  const npcInnkeeper = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green innkeeper vest & white shirt
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tileSize * 0.5 - 5, 15, 10, 14);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(tileSize * 0.5 - 5, 15, 3, 14);
    ctx.fillRect(tileSize * 0.5 + 2, 15, 3, 14);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Neat hair
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 8, 5.5, Math.PI, 0);
    ctx.fill();
  });

  // 41. NPC RESIDENT
  const npcResident = createTileCanvas(tileSize, (ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(tileSize * 0.5, tileSize - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cozy teal/purple tunic
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(tileSize * 0.5 - 5, 15, 10, 14);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hair with hairpin
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.arc(tileSize * 0.5, 8, 5.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(tileSize * 0.5 + 3, 6, 2, 2);
  });

  // 19. DUNGEON FINAL (5)
  const dungeonFinal = portalChaos;

  // Generic fallback dungeon
  const dungeon = dungeonTerra;

  return {
    waterFrames,
    foamFrames,
    water: waterFrames[0],
    grass,
    forest,
    mountain,
    desert,
    marsh,
    bridgeH,
    bridgeV,
    town,
    dungeon,
    dungeonFogo,
    dungeonAgua,
    dungeonAr,
    dungeonTerra,
    portalChaos,
    stairsDown,
    stairsUp,
    chest,
    chestOpen,
    dungeonPreludio,
    dungeonDesafio,
    dungeonFinal,
    house,
    itemShop,
    toolsmith,
    inn,
    cobble,
    fountain,
    npcCitizen,
    flowerbed,
    lantern,
    wallStone,
    interiorWoodFloor,
    interiorWall,
    interiorCounter,
    interiorBed,
    interiorBookshelf,
    interiorFireplace,
    interiorForge,
    interiorDoormat,
    npcMerchant,
    npcBlacksmith,
    npcInnkeeper,
    npcResident
  };
};

// Generate high-resolution pixel art textures for combat arenas (OVERWORLD and DUNGEONS)
export const generateCombatTextures = (): Record<MapId, CombatEnvironmentTextures> => {
  const size = 64;

  const createCombatSet = (
    drawTile: (ctx: CanvasRenderingContext2D) => void,
    drawWall: (ctx: CanvasRenderingContext2D) => void,
    accentColor: string
  ): CombatEnvironmentTextures => {
    const tileCanvas = createTileCanvas(size, drawTile);
    const wallCanvas = createTileCanvas(size, drawWall);
    return {
      tileDataUrl: tileCanvas.toDataURL('image/png'),
      wallDataUrl: wallCanvas.toDataURL('image/png'),
      accentColor,
    };
  };

  // 1. OVERWORLD: Lush tactical cobblestone & meadow pavers
  const overworld = createCombatSet(
    (ctx) => {
      // Grass turf base
      ctx.fillStyle = '#1e4620';
      ctx.fillRect(0, 0, size, size);

      // Central stone flagstone
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(2, 2, size - 4, size - 4);

      // Cut cobblestone paver pattern
      ctx.strokeStyle = '#143316';
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, size - 6, size - 6);

      // Inner flagstone tone
      ctx.fillStyle = '#3a6f33';
      ctx.fillRect(6, 6, size - 12, size - 12);

      // Stone highlights & cracks
      ctx.fillStyle = '#4c8c43';
      ctx.fillRect(6, 6, size - 12, 2);
      ctx.fillRect(6, 6, 2, size - 12);

      // Grass tufts along the edges
      ctx.fillStyle = '#56a74b';
      ctx.fillRect(4, 8, 3, 2);
      ctx.fillRect(size - 8, 14, 3, 2);
      ctx.fillRect(18, size - 6, 3, 2);
      ctx.fillRect(36, 4, 3, 2);

      // Soil specks
      ctx.fillStyle = '#173315';
      ctx.fillRect(12, 20, 2, 2);
      ctx.fillRect(44, 38, 2, 2);
    },
    (ctx) => {
      // Rocky earth foundation wall
      ctx.fillStyle = '#1b3318';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#294d25';
      for (let y = 0; y < size; y += 16) {
        ctx.fillRect(0, y, size, 2);
        for (let x = (y % 32 === 0 ? 0 : 16); x < size; x += 32) {
          ctx.fillRect(x, y, 2, 16);
        }
      }
    },
    '#22c55e'
  );

  // 2. DUNGEON FOGO: Scorched volcanic basalt with glowing lava veins
  const dungeonFogo = createCombatSet(
    (ctx) => {
      // Dark volcanic basalt base
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, size, size);

      // Scorched stone bevel
      ctx.fillStyle = '#292524';
      ctx.fillRect(3, 3, size - 6, size - 6);

      // Obsidian paver surface
      ctx.fillStyle = '#44403c';
      ctx.fillRect(6, 6, size - 12, size - 12);

      // Incandescent lava fissure cracks
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, size * 0.4);
      ctx.lineTo(size * 0.4, size * 0.5);
      ctx.lineTo(size * 0.7, size * 0.35);
      ctx.lineTo(size - 6, size * 0.7);
      ctx.stroke();

      // Hot core of the fissure
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, size * 0.4);
      ctx.lineTo(size * 0.4, size * 0.5);
      ctx.lineTo(size * 0.7, size * 0.35);
      ctx.lineTo(size - 8, size * 0.7);
      ctx.stroke();

      // Charred embers
      ctx.fillStyle = '#f97316';
      ctx.fillRect(14, 16, 2, 2);
      ctx.fillRect(48, 44, 2, 2);
    },
    (ctx) => {
      // Volcanic rock wall with cooled magma
      ctx.fillStyle = '#181411';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, size * 0.5, size, 2);
      ctx.fillStyle = '#431407';
      ctx.fillRect(12, 0, 4, size);
      ctx.fillRect(38, 0, 4, size);
    },
    '#f97316'
  );

  // 3. DUNGEON AGUA: Sunken aquamarine flagstones with rippling tide sheen
  const dungeonAgua = createCombatSet(
    (ctx) => {
      // Deep sea stone base
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(0, 0, size, size);

      // Teal carved tile
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(3, 3, size - 6, size - 6);

      ctx.fillStyle = '#115e59';
      ctx.fillRect(6, 6, size - 12, size - 12);

      // Wet water sheen reflection curves
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(size * 0.5, size * 0.5, 18, 0, Math.PI * 0.6);
      ctx.stroke();

      ctx.strokeStyle = '#5eead4';
      ctx.beginPath();
      ctx.arc(size * 0.5, size * 0.5, 12, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      // Ancient temple corner glyphs
      ctx.fillStyle = '#99f6e4';
      ctx.fillRect(8, 8, 3, 3);
      ctx.fillRect(size - 11, 8, 3, 3);
      ctx.fillRect(8, size - 11, 3, 3);
      ctx.fillRect(size - 11, size - 11, 3, 3);
    },
    (ctx) => {
      // Undersea temple masonry wall
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#0f766e';
      for (let y = 0; y < size; y += 16) {
        ctx.fillRect(0, y, size, 2);
      }
    },
    '#06b6d4'
  );

  // 4. DUNGEON AR: Celestial opalescent marble mosaic with gold filigree
  const dungeonAr = createCombatSet(
    (ctx) => {
      // Sky blue backing
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, size, size);

      // Polished white marble paver
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(3, 3, size - 6, size - 6);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(6, 6, size - 12, size - 12);

      // Gold inlay borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(8, 8, size - 16, size - 16);

      // Celestial central cross
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(size * 0.5 - 4, size * 0.5 - 1, 8, 2);
      ctx.fillRect(size * 0.5 - 1, size * 0.5 - 4, 2, 8);

      // Marble vein streaks
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(12, 20);
      ctx.lineTo(24, 32);
      ctx.lineTo(36, 26);
      ctx.stroke();
    },
    (ctx) => {
      // White column marble wall
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, size, 3);
      ctx.fillRect(0, size - 3, size, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(16, 0, 2, size);
      ctx.fillRect(32, 0, 2, size);
      ctx.fillRect(48, 0, 2, size);
    },
    '#38bdf8'
  );

  // 5. DUNGEON TERRA: Heavy weathered granite flagstone with crystal veins
  const dungeonTerra = createCombatSet(
    (ctx) => {
      // Subterranean earth base
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, size, size);

      // Granite paver bevel
      ctx.fillStyle = '#44403c';
      ctx.fillRect(3, 3, size - 6, size - 6);

      ctx.fillStyle = '#57534e';
      ctx.fillRect(6, 6, size - 12, size - 12);

      // Chisel grooves & fractures
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 14);
      ctx.lineTo(30, 24);
      ctx.lineTo(44, 18);
      ctx.lineTo(54, 38);
      ctx.stroke();

      // Embedded crystal flecks
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(18, 40, 3, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(42, 12, 3, 3);

      // Moss creeping in from edges
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(4, 4, 6, 2);
      ctx.fillRect(size - 10, 4, 6, 2);
    },
    (ctx) => {
      // Stratified bedrock wall
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#44403c';
      for (let y = 0; y < size; y += 14) {
        ctx.fillRect(0, y, size, 2);
        for (let x = (y % 28 === 0 ? 0 : 14); x < size; x += 28) {
          ctx.fillRect(x, y, 2, 14);
        }
      }
    },
    '#ca8a04'
  );

  return {
    OVERWORLD: overworld,
    DUNGEON_PRELUDIO_1: dungeonTerra,
    DUNGEON_PRELUDIO_2: dungeonTerra,
    DUNGEON_DESAFIO_1: dungeonAr,
    DUNGEON_DESAFIO_2: dungeonAr,
    TOWN_CORNELIA: overworld,
    TOWN_PRAVOCA: overworld,
    TOWN_GAIA: overworld,
    INTERIOR_CORNELIA_HOUSE: overworld,
    INTERIOR_CORNELIA_SHOP: overworld,
    INTERIOR_CORNELIA_TOOLSMITH: overworld,
    INTERIOR_CORNELIA_INN: overworld,
    INTERIOR_PRAVOCA_HOUSE: overworld,
    INTERIOR_PRAVOCA_SHOP: overworld,
    INTERIOR_PRAVOCA_TOOLSMITH: overworld,
    INTERIOR_PRAVOCA_INN: overworld,
    INTERIOR_GAIA_HOUSE: overworld,
    INTERIOR_GAIA_SHOP: overworld,
    INTERIOR_GAIA_TOOLSMITH: overworld,
    INTERIOR_GAIA_INN: overworld,
    DUNGEON_TERRA_1: dungeonTerra,
    DUNGEON_TERRA_2: dungeonTerra,
    DUNGEON_FOGO_1: dungeonFogo,
    DUNGEON_FOGO_2: dungeonFogo,
    DUNGEON_AGUA_1: dungeonAgua,
    DUNGEON_AGUA_2: dungeonAgua,
    DUNGEON_AR_1: dungeonAr,
    DUNGEON_AR_2: dungeonAr,
    DUNGEON_AR_3: dungeonAr,
    DUNGEON_FINAL_1: dungeonFogo,
    DUNGEON_FINAL_2: dungeonFogo,
    DUNGEON_FINAL_3: dungeonFogo,
    DUNGEON_FOGO: dungeonFogo,
    DUNGEON_AGUA: dungeonAgua,
    DUNGEON_AR: dungeonAr,
    DUNGEON_TERRA: dungeonTerra,
  };
};
