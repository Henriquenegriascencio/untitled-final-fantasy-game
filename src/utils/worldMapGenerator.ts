import { MapTile } from '../types';

export const OVERWORLD_WIDTH = 160;
export const OVERWORLD_HEIGHT = 120;

export function generateOverworldMap(): MapTile[][] {
  // Initialize with deep water
  const map: MapTile[][] = Array.from({ length: OVERWORLD_HEIGHT }, () => 
    Array.from({ length: OVERWORLD_WIDTH }, () => '~' as MapTile)
  );

  const fillRect = (x1: number, y1: number, w: number, h: number, tile: MapTile) => {
    for (let y = y1; y < y1 + h; y++) {
      if (y < 0 || y >= OVERWORLD_HEIGHT) continue;
      for (let x = x1; x < x1 + w; x++) {
        if (x < 0 || x >= OVERWORLD_WIDTH) continue;
        map[y][x] = tile;
      }
    }
  };

  const fillEllipse = (cx: number, cy: number, rx: number, ry: number, tile: MapTile) => {
    for (let y = cy - ry; y <= cy + ry; y++) {
      if (y < 0 || y >= OVERWORLD_HEIGHT) continue;
      for (let x = cx - rx; x <= cx + rx; x++) {
        if (x < 0 || x >= OVERWORLD_WIDTH) continue;
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) {
          map[y][x] = tile;
        }
      }
    }
  };

  // 1. SOUTHERN CONTINENT (Cornelia Kingdom & Preludio)
  // Large continental landmass
  fillEllipse(50, 92, 38, 20, '.');
  fillEllipse(36, 96, 24, 15, '.');
  fillEllipse(74, 90, 22, 16, '.');

  // Southern coastal sands
  for (let x = 18; x <= 86; x++) {
    for (let y = 106; y <= 112; y++) {
      if (map[y]?.[x] === '.') {
        map[y][x] = 'D';
      }
    }
  }

  // Western mountains shielding Cornelia
  fillEllipse(18, 88, 6, 14, 'M');
  fillRect(14, 80, 5, 18, 'M');

  // Northern mountains of Cornelia
  fillRect(22, 70, 48, 5, 'M');

  // River flowing north-south between Cornelia and Preludio
  for (let y = 72; y <= 110; y++) {
    const rx = 58 + Math.floor(Math.sin(y * 0.25) * 2);
    map[y][rx] = '~';
    map[y][rx + 1] = '~';
  }

  // Bridge across the river
  map[88][58] = 'B';
  map[88][59] = 'B';
  map[88][60] = 'B';

  // Forests in Cornelia region
  fillEllipse(28, 90, 5, 4, 'T');
  fillEllipse(45, 98, 6, 4, 'T');
  fillEllipse(46, 78, 6, 3, 'T');
  fillEllipse(68, 96, 5, 4, 'T');
  fillEllipse(66, 80, 5, 4, 'T');

  // Roads in Southern Realm
  // Spawn at (36, 96) -> North to Cornelia (36, 84)
  for (let y = 84; y <= 98; y++) {
    map[y][36] = '.';
  }
  // Road East to bridge and Preludio
  for (let x = 36; x <= 78; x++) {
    if (map[88][x] !== 'B') {
      map[88][x] = '.';
    }
  }

  // Foothills around Caverna do Preludio
  fillRect(74, 84, 9, 3, 'M');
  fillRect(81, 85, 3, 8, 'M');
  fillRect(74, 92, 9, 3, 'M');

  // Royal Bridge & Gate connecting Southern Realm to Eastern Realm
  for (let y = 76; y <= 80; y++) {
    map[y][86] = 'B';
  }
  // Royal Gate Guard
  map[78][86] = 'G';

  // 2. EASTERN MARITIME REALM (Pravoca, Monte Gulg, Santuario Submerso)
  fillEllipse(116, 82, 30, 24, '.');
  fillEllipse(136, 94, 18, 16, '.');
  fillEllipse(112, 74, 20, 15, '.');

  // Beaches of Pravoca
  for (let y = 64; y <= 84; y++) {
    if (map[y]?.[130] === '.') map[y][130] = 'D';
    if (map[y]?.[131] === '.') map[y][131] = 'D';
  }

  // Forests around Pravoca
  fillEllipse(100, 84, 5, 4, 'T');
  fillEllipse(120, 70, 6, 4, 'T');

  // Road from Royal Bridge (86, 78) to Pravoca (110, 76)
  for (let x = 87; x <= 110; x++) {
    map[76][x] = '.';
  }

  // Southeastern Volcanic Region (Monte Gulg - Fogo)
  fillRect(128, 88, 20, 20, 'S'); // Swamp / volcanic ash
  fillEllipse(138, 98, 10, 10, 'M'); // Volcanic mountains
  fillRect(137, 97, 3, 3, '.'); // Clearing for entrance

  // Eastern Ocean Atoll (Santuario Submerso - Agua)
  fillEllipse(144, 46, 7, 7, '.');
  map[46][144] = '.'; // Shrine platform

  // Bridge path connecting mainland to Submerged Shrine
  for (let x = 132; x <= 140; x++) {
    map[50][x] = 'B';
  }
  for (let y = 46; y <= 50; y++) {
    map[y][140] = 'B';
  }

  // 3. CENTRAL HIGHLANDS (Cidadela dos Desafios)
  fillEllipse(80, 52, 16, 14, '.');
  // High mountain perimeter
  fillEllipse(80, 52, 18, 16, 'M');
  fillEllipse(80, 52, 12, 10, '.'); // Valley hollow

  // Road from Pravoca (110, 76) to Central Pass (80, 52)
  for (let y = 62; y <= 76; y++) {
    map[y][102] = '.';
  }
  for (let x = 80; x <= 102; x++) {
    map[62][x] = (x >= 88 && x <= 92) ? 'B' : '.';
  }
  for (let y = 52; y <= 62; y++) {
    map[y][80] = '.';
  }

  // Mystic Mountain Barrier Gate
  map[42][80] = 'G';
  for (let x = 74; x <= 86; x++) {
    if (x !== 80) map[42][x] = 'M';
  }

  // 4. NORTHERN ALPINE REALM (Gaia & Torre da Miragem)
  fillEllipse(80, 24, 46, 14, '.');
  fillEllipse(96, 24, 20, 12, '.');
  fillEllipse(52, 22, 18, 12, '.');

  // Northern Great Mountain Ridge
  fillRect(36, 10, 88, 5, 'M');
  fillRect(88, 15, 8, 4, 'M');

  // Alpine evergreen forests
  fillEllipse(84, 24, 6, 4, 'T');
  fillEllipse(108, 22, 6, 4, 'T');
  fillEllipse(66, 22, 5, 3, 'T');

  // Wind desert plateau for Torre da Miragem
  fillRect(46, 16, 14, 12, 'D');

  // Road from Mystic Barrier (80, 42) to Gaia (96, 24)
  for (let y = 24; y <= 42; y++) {
    map[y][80] = '.';
  }
  for (let x = 80; x <= 96; x++) {
    map[24][x] = '.';
  }

  // Road from Gaia to Torre da Miragem
  for (let x = 52; x <= 80; x++) {
    map[22][x] = '.';
  }

  // 5. WESTERN ARID CONTINENT (Santuario da Terra)
  fillEllipse(26, 52, 20, 16, 'D');
  fillEllipse(22, 50, 12, 10, '.'); // oasis
  fillEllipse(32, 54, 4, 3, 'T'); // palms

  // Mountains around Santuario da Terra
  fillRect(12, 42, 6, 20, 'M');
  fillRect(18, 42, 14, 4, 'M');

  // Bridge connecting Western Continent to Central Pass
  for (let x = 44; x <= 66; x++) {
    map[52][x] = 'B';
  }

  // 6. NORTHWESTERN ISLE OF CHAOS (Templo de Chaos - Final Dungeon)
  // Completely isolated dark sanctuary
  fillEllipse(16, 14, 12, 10, 'M');
  fillRect(13, 11, 7, 7, '.'); // Altar ground

  // Ocean surrounds it on all sides!

  // ==========================================
  // KEY LANDMARK PLACEMENT
  // ==========================================
  // Cities
  map[84][36] = 'C';   // Cidade de Cornelia (near spawn)
  map[76][110] = 'C';  // Cidade de Pravoca
  map[24][96] = 'C';   // Cidade de Gaia

  // Non-elemental Dungeons
  map[88][78] = '0';   // Caverna do Preludio (Dungeon 0)
  map[52][80] = '6';   // Cidadela dos Desafios (Dungeon 6)

  // Elemental Temples
  map[50][22] = '1';   // Santuario da Terra (Dungeon 1)
  map[98][138] = '2';  // Monte Gulg (Dungeon 2)
  map[46][144] = '3';  // Santuario Submerso (Dungeon 3)
  map[22][52] = '4';   // Torre da Miragem (Dungeon 4)

  // Final Dungeon Portal
  map[14][16] = '5';   // Templo de Chaos (Final Portal)

  return map;
}
