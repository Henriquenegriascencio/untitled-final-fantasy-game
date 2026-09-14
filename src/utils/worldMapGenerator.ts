import { MapTile } from '../types';

export const OVERWORLD_WIDTH = 160;
export const OVERWORLD_HEIGHT = 120;

export function generateOverworldMap(): MapTile[][] {
  // Initialize with deep ocean
  const map: MapTile[][] = Array.from({ length: OVERWORLD_HEIGHT }, () => 
    Array.from({ length: OVERWORLD_WIDTH }, () => '~' as MapTile)
  );

  const setTile = (x: number, y: number, tile: MapTile) => {
    if (x >= 0 && x < OVERWORLD_WIDTH && y >= 0 && y < OVERWORLD_HEIGHT) {
      map[y][x] = tile;
    }
  };

  const getTile = (x: number, y: number): MapTile => {
    if (x >= 0 && x < OVERWORLD_WIDTH && y >= 0 && y < OVERWORLD_HEIGHT) {
      return map[y][x];
    }
    return '~';
  };

  // Organic landmass drawing with multi-frequency sinusoidal perturbation
  const fillOrganicLand = (
    cx: number, 
    cy: number, 
    rx: number, 
    ry: number, 
    tile: MapTile,
    roughness: number = 0.22
  ) => {
    const minX = Math.max(0, Math.floor(cx - rx * (1 + roughness)));
    const maxX = Math.min(OVERWORLD_WIDTH - 1, Math.ceil(cx + rx * (1 + roughness)));
    const minY = Math.max(0, Math.floor(cy - ry * (1 + roughness)));
    const maxY = Math.min(OVERWORLD_HEIGHT - 1, Math.ceil(cy + ry * (1 + roughness)));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Multi-frequency harmonic perturbation for jagged natural coastlines
        const angle = Math.atan2(dy, dx);
        const noise = 
          Math.sin(angle * 3 + cx * 0.1) * 0.10 +
          Math.sin(angle * 7 - cy * 0.1) * 0.07 +
          Math.cos(angle * 5 + x * 0.05) * 0.05;
        
        const effectiveRadius = 1.0 + noise * (roughness / 0.22);
        if (dist <= effectiveRadius) {
          map[y][x] = tile;
        }
      }
    }
  };

  const fillRect = (x1: number, y1: number, w: number, h: number, tile: MapTile) => {
    for (let y = y1; y < y1 + h; y++) {
      if (y < 0 || y >= OVERWORLD_HEIGHT) continue;
      for (let x = x1; x < x1 + w; x++) {
        if (x < 0 || x >= OVERWORLD_WIDTH) continue;
        map[y][x] = tile;
      }
    }
  };

  // =========================================================================
  // 1. CONTINENTE SUL - REINO DE CORNELIA & VALES DO PRELUDIO (Aberto e vasto)
  // =========================================================================
  // Core continental masses (wide open plains and pastures, not narrow paths)
  fillOrganicLand(42, 94, 28, 18, '.', 0.25); // Central Cornelia core
  fillOrganicLand(22, 94, 16, 14, '.', 0.22); // Western Cape & Peninsula
  fillOrganicLand(74, 92, 22, 18, '.', 0.24); // Eastern Preludio plains & hills
  fillOrganicLand(56, 104, 22, 10, '.', 0.18); // Southern coastal flatlands
  fillOrganicLand(40, 80, 22, 10, '.', 0.20); // Northern Cornelia pastures

  // Natural coastal beaches along the southern ocean
  for (let x = 12; x <= 88; x++) {
    for (let y = 104; y <= 114; y++) {
      if (map[y]?.[x] === '.') {
        if (y >= 109 || (x >= 14 && x <= 26 && y >= 102)) {
          map[y][x] = 'D';
        }
      }
    }
  }

  // Western scenic mountains overlooking the sea, with valleys and grassy gaps
  fillOrganicLand(12, 82, 4, 12, 'M', 0.15);
  fillOrganicLand(16, 76, 5, 8, 'M', 0.15);

  // Northern mountain ridges with wide passes to other regions
  fillOrganicLand(26, 70, 10, 3, 'M', 0.12);
  fillOrganicLand(48, 68, 9, 3, 'M', 0.12);

  // River flowing from northern hills to southern sea, winding naturally
  const riverPoints = [
    { x: 58, y: 70 },
    { x: 59, y: 76 },
    { x: 57, y: 82 },
    { x: 58, y: 88 },
    { x: 60, y: 94 },
    { x: 58, y: 100 },
    { x: 56, y: 106 },
    { x: 56, y: 112 }
  ];
  for (let i = 0; i < riverPoints.length - 1; i++) {
    const p1 = riverPoints[i];
    const p2 = riverPoints[i + 1];
    const steps = Math.max(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y)) * 2;
    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      const rx = Math.round(p1.x + (p2.x - p1.x) * t);
      const ry = Math.round(p1.y + (p2.y - p1.y) * t);
      setTile(rx, ry, '~');
      setTile(rx + 1, ry, '~');
    }
  }

  // River crossings:
  // Main stone bridge at (58, 88)
  map[88][57] = 'B';
  map[88][58] = 'B';
  map[88][59] = 'B';
  // Northern ford / secondary bridge at (59, 76)
  map[76][58] = 'B';
  map[76][59] = 'B';
  map[76][60] = 'B';

  // Rich forest groves scattered naturally across Cornelia realm
  fillOrganicLand(28, 88, 6, 5, 'T', 0.3);  // Whispering Grove west of river
  fillOrganicLand(44, 98, 7, 5, 'T', 0.25); // Southern Royal Woods
  fillOrganicLand(46, 78, 5, 4, 'T', 0.2);  // Northern Pine Forest
  fillOrganicLand(68, 98, 6, 5, 'T', 0.25); // Preludio Forest
  fillOrganicLand(66, 82, 5, 4, 'T', 0.2);  // Riverbank Thicket
  fillOrganicLand(20, 96, 4, 3, 'T', 0.2);  // Cape Grove

  // Foothills and crags surrounding Caverna do Preludio (78, 88)
  fillOrganicLand(78, 84, 8, 3, 'M', 0.15); // North crag
  fillOrganicLand(84, 88, 3, 5, 'M', 0.15); // East bluff
  fillOrganicLand(74, 92, 7, 2, 'M', 0.15); // South ridge
  // Open walkable paths around Preludio
  setTile(78, 88, '0');
  setTile(78, 89, '.');
  setTile(78, 87, '.');
  setTile(77, 88, '.');
  setTile(79, 88, '.');

  // Causeway & Royal Bridge connecting Cornelia realm to Eastern Continent
  fillOrganicLand(84, 80, 6, 5, '.', 0.2);
  fillOrganicLand(92, 78, 7, 6, '.', 0.2);
  for (let y = 76; y <= 80; y++) {
    map[y][86] = 'B';
  }
  // Royal Gate Guard
  map[78][86] = 'G';

  // =========================================================================
  // 2. CONTINENTE LESTE - PRAVOCA, MONTE GULG & SANTUARIO SUBMERSO
  // =========================================================================
  fillOrganicLand(116, 76, 26, 20, '.', 0.24); // Central East maritime plains
  fillOrganicLand(136, 96, 20, 18, '.', 0.22); // South East volcanic basin
  fillOrganicLand(112, 60, 18, 14, '.', 0.20); // North East coastal hills
  fillOrganicLand(100, 76, 12, 10, '.', 0.20); // Bridgehead plains

  // Coastlines and beaches around Pravoca
  for (let x = 118; x <= 138; x++) {
    for (let y = 60; y <= 88; y++) {
      if (map[y]?.[x] === '.' && (getTile(x + 1, y) === '~' || getTile(x, y + 1) === '~')) {
        map[y][x] = 'D';
      }
    }
  }

  // Eastern Archipelago and Causeway to Santuario Submerso (144, 46)
  fillOrganicLand(144, 46, 7, 7, '.', 0.15); // Shrine island
  fillOrganicLand(132, 54, 4, 3, '.', 0.2);
  fillOrganicLand(138, 50, 4, 3, '.', 0.2);
  for (let x = 126; x <= 132; x++) map[56][x] = 'B';
  for (let y = 50; y <= 56; y++) map[y][132] = 'B';
  for (let x = 132; x <= 140; x++) map[50][x] = 'B';
  for (let y = 46; y <= 50; y++) map[y][140] = 'B';
  for (let x = 140; x <= 144; x++) map[46][x] = 'B';
  map[46][144] = '3'; // Submerged Shrine (Water Crystal)

  // Volcanic Badlands & Monte Gulg (138, 98)
  fillOrganicLand(138, 98, 16, 14, 'S', 0.25); // Ash swamps
  fillOrganicLand(138, 98, 10, 8, 'M', 0.20);  // Volcanic caldera ring
  fillOrganicLand(138, 98, 4, 4, '.', 0.1);    // Caldera interior
  setTile(138, 98, '2'); // Fire Temple (Fire Crystal)
  setTile(138, 99, '.');
  setTile(138, 97, '.');
  setTile(137, 98, '.');
  setTile(139, 98, '.');

  // Pravoca city and forest surroundings
  setTile(110, 76, 'C');
  fillOrganicLand(106, 82, 6, 5, 'T', 0.25);
  fillOrganicLand(122, 70, 7, 5, 'T', 0.25);

  // =========================================================================
  // 3. TERRAS ALTAS CENTRAIS - CIDADELA DOS DESAFIOS & ROTAS NAO-LINEARES
  // =========================================================================
  fillOrganicLand(80, 52, 22, 16, '.', 0.22); // Highland plateau
  fillOrganicLand(68, 52, 4, 10, 'M', 0.15);  // West mountain flank
  fillOrganicLand(94, 52, 5, 10, 'M', 0.15);  // East mountain flank
  fillOrganicLand(80, 64, 12, 3, 'M', 0.15);  // South ridge

  // Conexao Nao-Linear 1: Corredor Central conectando Cornelia diretamente ao Planalto Central
  fillOrganicLand(54, 66, 9, 8, '.', 0.2);
  for (let y = 62; y <= 72; y++) {
    for (let x = 52; x <= 58; x++) {
      if (map[y]?.[x] === '~' || map[y]?.[x] === 'M') map[y][x] = '.';
    }
  }

  // Conexao Nao-Linear 2: Passagem do Dragao conectando Planalto Central a Pravoca pelo Leste
  fillOrganicLand(98, 58, 8, 6, '.', 0.2);
  for (let x = 88; x <= 104; x++) {
    for (let y = 58; y <= 66; y++) {
      if (map[y]?.[x] === 'M') map[y][x] = '.';
    }
  }

  // Cidadela dos Desafios (80, 52)
  setTile(80, 52, '6');
  setTile(80, 53, '.');
  setTile(80, 51, '.');
  setTile(79, 52, '.');
  setTile(81, 52, '.');

  // Pine forests and groves in highland plateau
  fillOrganicLand(74, 56, 4, 3, 'T', 0.2);
  fillOrganicLand(86, 48, 5, 3, 'T', 0.2);

  // Northern Mountain Ridge - com amplas passagens abertas para o Norte
  fillOrganicLand(62, 42, 6, 3, 'M', 0.12);
  fillOrganicLand(96, 42, 6, 3, 'M', 0.12);
  // Posto de vigia e passagem ancestral aberta
  map[42][80] = 'G';
  map[41][80] = '.';
  map[43][80] = '.';
  for (let x = 74; x <= 86; x++) {
    map[42][x] = '.';
    map[41][x] = '.';
  }

  // =========================================================================
  // 4. CONTINENTE NORTE - ALDEIA DE GAIA & TORRE DA MIRAGEM
  // =========================================================================
  fillOrganicLand(82, 24, 46, 16, '.', 0.25); // Vast northern landmass
  fillOrganicLand(96, 24, 22, 14, '.', 0.22); // Gaia alpine valley
  fillOrganicLand(54, 22, 20, 14, 'D', 0.22); // Miragem desert plateau

  // Conexao Nao-Linear 3: Trilha Costeira Oriental ligando Pravoca a Gaia pelo Leste
  fillOrganicLand(108, 40, 9, 9, '.', 0.2);
  for (let y = 34; y <= 48; y++) {
    for (let x = 104; x <= 112; x++) {
      if (map[y]?.[x] === '~' || map[y]?.[x] === 'M') map[y][x] = '.';
    }
  }

  // Great northern mountain wall (roof of the world)
  for (let x = 32; x <= 126; x++) {
    if (x < 46 || x > 58) {
      setTile(x, 8, 'M');
      setTile(x, 9, 'M');
    }
  }
  fillOrganicLand(88, 16, 8, 4, 'M', 0.18);
  fillOrganicLand(114, 26, 6, 8, 'M', 0.18);

  // Gaia alpine pines and streams
  fillOrganicLand(86, 24, 7, 5, 'T', 0.25);
  fillOrganicLand(108, 22, 7, 5, 'T', 0.25);
  fillOrganicLand(68, 22, 5, 4, 'T', 0.2);
  setTile(96, 24, 'C'); // Aldeia de Gaia

  // Torre da Miragem in golden windswept sands
  fillRect(46, 16, 14, 12, 'D');
  setTile(52, 22, '4');
  setTile(52, 23, 'D');
  setTile(52, 21, 'D');
  setTile(51, 22, 'D');
  setTile(53, 22, 'D');

  // =========================================================================
  // 5. CONTINENTE OCIDENTAL - DESERTO & SANTUARIO DA TERRA
  // =========================================================================
  fillOrganicLand(26, 52, 24, 20, 'D', 0.24); // Sprawling western desert
  fillOrganicLand(22, 50, 14, 12, '.', 0.18); // Oasis and canyon basin
  fillOrganicLand(32, 54, 5, 4, 'T', 0.2);   // Desert palms
  setTile(32, 44, '~'); // Oasis water
  setTile(33, 44, '~');
  setTile(32, 45, '~');

  // Conexao Nao-Linear 4: Rodovia Costeira Ocidental ligando Cornelia diretamente ao Deserto
  fillOrganicLand(22, 70, 9, 10, '.', 0.2);
  fillOrganicLand(22, 60, 9, 8, 'D', 0.2);
  for (let y = 62; y <= 76; y++) {
    for (let x = 18; x <= 26; x++) {
      if (map[y]?.[x] === '~' || map[y]?.[x] === 'M') map[y][x] = '.';
    }
  }

  // Conexao Nao-Linear 5: Desfiladeiro Ocidental ligando Deserto a Torre da Miragem
  fillOrganicLand(34, 30, 9, 9, 'D', 0.2);
  for (let y = 24; y <= 36; y++) {
    for (let x = 28; x <= 42; x++) {
      if (map[y]?.[x] === '~' || map[y]?.[x] === 'M') map[y][x] = 'D';
    }
  }

  // Redrock canyon bluffs around Santuario da Terra
  fillOrganicLand(14, 44, 6, 14, 'M', 0.18);
  fillOrganicLand(20, 40, 12, 4, 'M', 0.18);
  setTile(22, 50, '1'); // Earth Temple (Earth Crystal)
  setTile(22, 51, '.');
  setTile(22, 49, '.');
  setTile(21, 50, '.');
  setTile(23, 50, '.');

  // Ancient Causeway connecting Western Continent to Central Realm
  for (let x = 44; x <= 66; x++) {
    map[52][x] = 'B';
    map[53][x] = 'B';
  }

  // =========================================================================
  // 6. ILHA SAGRADA DE CHAOS (Noroeste isolado)
  // =========================================================================
  fillOrganicLand(16, 14, 12, 10, 'M', 0.2); // Jagged reef ring
  fillOrganicLand(16, 14, 6, 6, '.', 0.1);   // Sacred obsidian dais
  setTile(16, 14, '5'); // Chaos Portal

  // =========================================================================
  // 7. OVERWORLD TREASURE CHESTS - Segredos de Exploracao Nao-Linear!
  // =========================================================================
  map[92][18] = 'X';   // Cabo Ocidental de Cornelia (18, 92)
  map[96][84] = 'X';   // Colinas do Preludio (84, 96)
  map[84][122] = 'X';  // Costa dos Naufragos (122, 84)
  map[104][148] = 'X'; // Fenda Vulcanica de Gulg (148, 104)
  map[20][116] = 'X';  // Bosque Alpino de Gaia (116, 20)
  map[44][32] = 'X';   // Oasis Perdido do Deserto (32, 44)

  // Final verification of player spawn area (36, 96) and Cornelia (36, 84)
  // Ensure wide open walkable green plains
  fillRect(32, 82, 10, 18, '.');
  map[84][36] = 'C';

  return map;
}
