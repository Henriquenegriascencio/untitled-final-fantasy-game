import { Weapon, MapTile, Item, EnemyType, EntityStats, MapId, Enemy } from './types';
import { generateOverworldMap } from './utils/worldMapGenerator';

export const WEAPONS: Record<string, Weapon> = {
  espada_madeira: { id: 'w0', name: 'Espada de Madeira', type: 'espada', range: 1, damage: 5 },
  espada: { id: 'w1', name: 'Espada Longa', type: 'espada', range: 1, damage: 15 },
  espada_ferro: { id: 'w1_ferro', name: 'Espada de Ferro', type: 'espada', range: 1, damage: 18 },
  espada_aco: { id: 'w1b', name: 'Espada de Aco', type: 'espada', range: 1, damage: 25 },
  espada_flamejante: { id: 'w1c', name: 'Espada Flamejante', type: 'espada', range: 1, damage: 38 },
  excalibur: { id: 'w_excalibur', name: 'Excalibur Sagrada', type: 'espada', range: 1, damage: 55 },
  masamune: { id: 'w_masamune', name: 'Masamune Lendaria', type: 'espada', range: 1, damage: 65 },
  arco: { id: 'w2', name: 'Arco Curto', type: 'arco', range: 3, damage: 10 },
  arco_longo: { id: 'w2b', name: 'Arco Longo', type: 'arco', range: 4, damage: 20 },
  arco_elfico: { id: 'w2_elfico', name: 'Arco Elfico', type: 'arco', range: 4, damage: 32 },
  arco_celestial: { id: 'w2c', name: 'Arco Celestial', type: 'arco', range: 4, damage: 45 },
  cajado: { id: 'w3', name: 'Cajado Magico', type: 'cajado', range: 2, damage: 12, aoe: true },
  cajado_aprendiz: { id: 'w3_aprendiz', name: 'Cajado de Aprendiz', type: 'cajado', range: 2, damage: 16, aoe: true },
  cajado_anciao: { id: 'w3b', name: 'Cajado do Anciao', type: 'cajado', range: 3, damage: 22, aoe: true },
  cajado_arcano: { id: 'w3c', name: 'Cajado Arcano', type: 'cajado', range: 3, damage: 38, aoe: true },
  luva_ferro: { id: 'w_luva', name: 'Luvas de Ferro', type: 'espada', range: 1, damage: 22 },
  chave_inglesa: { id: 'w_chave', name: 'Chave Mestra Mecanica', type: 'espada', range: 1, damage: 20 },
  tridente_sagrado: { id: 'w4', name: 'Tridente Sagrado', type: 'lanca', range: 2, damage: 42 },
};

export const ITEMS: Record<string, Item> = {
  pocao: { id: 'i1', name: 'Pocao', heal: 50, count: 0, price: 10, desc: 'Restaura 50 HP' },
  hi_pocao: { id: 'i2', name: 'Hi-Pocao', heal: 150, count: 0, price: 30, desc: 'Restaura 150 HP' },
  super_pocao: { id: 'i2b', name: 'Super Pocao', heal: 250, count: 0, price: 60, desc: 'Restaura 250 HP' },
  eter: { id: 'i3', name: 'Eter', heal: 0, mpHeal: 35, count: 0, price: 25, desc: 'Restaura 35 MP' },
  elixir: { id: 'i4', name: 'Elixir', heal: 200, mpHeal: 60, count: 0, price: 75, desc: 'Restaura 200 HP e 60 MP' },
  antidoto: { id: 'i5', name: 'Erva Antidoto', heal: 30, count: 0, price: 15, desc: 'Purifica e restaura 30 HP' },
  fenix: { id: 'i6', name: 'Pluma de Fenix', heal: 100, mpHeal: 30, revive: true, count: 0, price: 100, desc: 'Revive aliado caido com 100 HP' },
  pluma_fenix: { id: 'i6', name: 'Pluma de Fenix', heal: 100, mpHeal: 30, revive: true, count: 0, price: 100, desc: 'Revive aliado caido com 100 HP' },
};

export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  for: 15,
  int: 10,
  def: 10,
  mov: 3,
  vel: 12,
};

export const TILE_SIZE = 40;
export const VIEWPORT_W = 20;
export const VIEWPORT_H = 15;

export interface WorldLandmark {
  name: string;
  x: number;
  y: number;
  description: string;
}

export const WORLD_LANDMARKS: WorldLandmark[] = [
  { name: 'REINO DE CORNELIA', x: 36, y: 84, description: 'Castelo e Cidade Real de Cornelia' },
  { name: 'CAVERNA DO PRELUDIO', x: 78, y: 88, description: 'Primeira Masmorra Guardiao Nao-Elemental' },
  { name: 'PONTE REAL DE CORNELIA', x: 86, y: 78, description: 'Passagem para o Continente Leste' },
  { name: 'PORTO DE PRAVOCA', x: 110, y: 76, description: 'Cidade costeira do leste' },
  { name: 'CIDADELA DOS DESAFIOS', x: 80, y: 52, description: 'Segunda Masmorra Guardiao Nao-Elemental' },
  { name: 'BARREIRA ANCESTRAL', x: 80, y: 42, description: 'Bloqueio mistico para Gaia e Templos Elementais' },
  { name: 'ALDEIA DE GAIA', x: 96, y: 24, description: 'Refugio nas montanhas do norte' },
  { name: 'SANTUARIO DA TERRA', x: 22, y: 50, description: 'Templo Elemental do Cristal da Terra' },
  { name: 'MONTE GULG', x: 138, y: 98, description: 'Vulcao ardente do Cristal de Fogo' },
  { name: 'SANTUARIO SUBMERSO', x: 144, y: 46, description: 'Templo no oceano do Cristal de Agua' },
  { name: 'TORRE DA MIRAGEM', x: 52, y: 22, description: 'Pinaculo celestial do Cristal de Ar' },
  { name: 'TEMPLO DO CAOS', x: 16, y: 14, description: 'Ilha proibida e Masmorra Final' },
];

export const MAPS: Record<string, MapTile[][]> = {
  OVERWORLD: generateOverworldMap(),

  // CIDADES DO JOGO
  TOWN_CORNELIA: [
    "WWWWWWWWWWWWWWWWWWWW",
    "W........GG........W",
    "W..H.....GG.....P..W",
    "W..................W",
    "W...TT...~~...TT...W",
    "W...TT..~~~~..TT...W",
    "W...N...~~~~...N...W",
    "W...L....~~....L...W",
    "W..................W",
    "W........GG........W",
    "W..I.....GG.....E..W",
    "W..................W",
    "W...N....NN....N...W",
    "W..................W",
    "W........<<........W",
    "WWWWWWWWWWWWWWWWWWWW"
  ].map(row => row.split('') as MapTile[]),

  TOWN_PRAVOCA: [
    "WWWWWWWWWWWWWWWWWWWW",
    "W.......~~~~.......W",
    "W..H....~BB~...PP..W",
    "W.......~BB~.......W",
    "W...TT..~~~~..TT...W",
    "W...TT...~~...TT...W",
    "W...N....~~....N...W",
    "W...L..........L...W",
    "W..................W",
    "W........X.........W",
    "W..I............E..W",
    "W.......GGGG.......W",
    "W...N....NN....N...W",
    "W..................W",
    "W........<<........W",
    "WWWWWWWWWWWWWWWWWWWW"
  ].map(row => row.split('') as MapTile[]),

  TOWN_GAIA: [
    "WWWWWWWWWWWWWWWWWWWW",
    "W.......MMMM.......W",
    "W..H....MMMM....P..W",
    "W..................W",
    "W...TT...~~...TT...W",
    "W...TT..~~~~..TT...W",
    "W...N...~~~~...N...W",
    "W...L....~~....L...W",
    "W........X.........W",
    "W.......GGGG.......W",
    "W..I....GGGG....E..W",
    "W..................W",
    "W...N....NN....N...W",
    "W..................W",
    "W........<<........W",
    "WWWWWWWWWWWWWWWWWWWW"
  ].map(row => row.split('') as MapTile[]),

  // INTERIORES DAS CIDADES (Cornelia, Pravoca e Gaia)
  INTERIOR_CORNELIA_HOUSE: [
    "WWWWWWWWWWW",
    "WII..B..HHW",
    "W....N....W",
    "W..TTT....W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_CORNELIA_SHOP: [
    "WWWWWWWWWWW",
    "W.BB.TT.BBW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_CORNELIA_TOOLSMITH: [
    "WWWWWWWWWWW",
    "W.EE.EE.EEW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_CORNELIA_INN: [
    "WWWWWWWWWWW",
    "WII..B..IIW",
    "WII..N..IIW",
    "W..TTTT...W",
    "W.........W",
    "W.........W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_PRAVOCA_HOUSE: [
    "WWWWWWWWWWW",
    "WII..B..HHW",
    "W....N....W",
    "W..TTT....W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_PRAVOCA_SHOP: [
    "WWWWWWWWWWW",
    "W.BB.TT.BBW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_PRAVOCA_TOOLSMITH: [
    "WWWWWWWWWWW",
    "W.EE.EE.EEW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_PRAVOCA_INN: [
    "WWWWWWWWWWW",
    "WII..B..IIW",
    "WII..N..IIW",
    "W..TTTT...W",
    "W.........W",
    "W.........W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_GAIA_HOUSE: [
    "WWWWWWWWWWW",
    "WII..B..HHW",
    "W....N....W",
    "W..TTT....W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_GAIA_SHOP: [
    "WWWWWWWWWWW",
    "W.BB.TT.BBW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_GAIA_TOOLSMITH: [
    "WWWWWWWWWWW",
    "W.EE.EE.EEW",
    "W....N....W",
    "W..TTTTT..W",
    "W.........W",
    "W....X....W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  INTERIOR_GAIA_INN: [
    "WWWWWWWWWWW",
    "WII..B..IIW",
    "WII..N..IIW",
    "W..TTTT...W",
    "W.........W",
    "W.........W",
    "W.........W",
    "WWWW.<<WWWW"
  ].map(row => row.split('') as MapTile[]),

  // MASMORRA NAO-ELEMENTAL 2: CIDADELA DOS DESAFIOS (2 floors)
  DUNGEON_DESAFIO_1: [
    "WWWWWWWWWWWWWWW",
    "W.............W",
    "W.WWW.WWW.WWW.W",
    "W.W.X...X...W.W",
    "W.W.WWW.WWW.W.W",
    "W.W.........W.W",
    "W.WWW.WWW.WWW.W",
    "W...W.W>W.W...W",
    "W.WWW.W.W.WWW.W",
    "W.............W",
    "WWWWWWW.WWWWWWW",
    "WWWWWWW<WWWWWWW"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_DESAFIO_2: [
    "WWWWWWWWWWWWWWW",
    "W.............W",
    "W..X.......X..W",
    "W....WWWWW....W",
    "W....W.@.W....W",
    "W....W...W....W",
    "W....WW.WW....W",
    "W.............W",
    "W......<......W",
    "WWWWWWWWWWWWWWW"
  ].map(row => row.split('') as MapTile[]),

  // 1. DUNGEON PRELUDIO (2 floors)
  DUNGEON_PRELUDIO_1: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MMMMM.MMMMM.M",
    "M.M.........M.M",
    "M.M.X...M.M.M.M",
    "M.M.....M.M.M.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M...........>.M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_PRELUDIO_2: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MMM.....MMM.M",
    "M.M.........M.M",
    "M.M.X...@.X.M.M",
    "M.M.........M.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M.<...........M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  // 2. DUNGEON TERRA (2 floors)
  DUNGEON_TERRA_1: [
    "MMMMMMMMMMMMMMM",
    "M.......M.....M",
    "M.MMMMM.M.MMM.M",
    "M.M.X...M.M.>.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMM.M.M",
    "M.......M...M.M",
    "MMMMMMM.M.MMM.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_TERRA_2: [
    "MMMMMMMMMMMMMMM",
    "M.X.....M...X.M",
    "M.MMMMM.M.MMM.M",
    "M.M.........M.M",
    "M.M...MMMMM.M.M",
    "M.....M.@.M...M",
    "M.MMM.MMMMM.M.M",
    "M.M.........M.M",
    "M.M.MMMMMMM.M.M",
    "M.<...........M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  // 3. DUNGEON FOGO (2 floors)
  DUNGEON_FOGO_1: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MMM...MMMMM.M",
    "M.M.X.......M.M",
    "M.M.M...M.M.M.M",
    "M.M.M...M.M.M.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M...........>.M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_FOGO_2: [
    "MMMMMMMMMMMMMMM",
    "M...X.....X...M",
    "M.MMMMMMMMMMM.M",
    "M.M.........M.M",
    "M.M...MMM...M.M",
    "M.M...M@M...M.M",
    "M.M...MMM...M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M.<...........M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  // 4. DUNGEON AGUA (2 floors)
  DUNGEON_AGUA_1: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.~~~~.~~~~~~.M",
    "M.~.X.......~.M",
    "M.~.~~.~~~~.~.M",
    "M.~.~......~.~.M",
    "M.~.~~~~~~~.~.M",
    "M.~.........~.M",
    "M.~~~~~~~~~~~.M",
    "M...........>.M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_AGUA_2: [
    "MMMMMMMMMMMMMMM",
    "M.X.........X.M",
    "M.~~~~~~~~~~~.M",
    "M.~.........~.M",
    "M.~...~~~...~.M",
    "M.~...~@~...~.M",
    "M.~...~~~...~.M",
    "M.~.........~.M",
    "M.~~~~~~~~~~~.M",
    "M.<...........M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  // 5. DUNGEON AR / TORRE DA MIRAGEM (3 floors)
  DUNGEON_AR_1: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MM.MM.MM.MM.M",
    "M.X.........M.M",
    "M.MM.MM.MM.MM.M",
    "M.............M",
    "M.MM.MM.MM.MM.M",
    "M...........>.M",
    "M.MM.MM.MM.MM.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_AR_2: [
    "MMMMMMMMMMMMMMM",
    "M.<.........>.M",
    "M.MMMMMMMMMMM.M",
    "M.M.........M.M",
    "M.M.X.....X.M.M",
    "M.M.........M.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M.............M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_AR_3: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M...MMMMMMM...M",
    "M...M..X..M...M",
    "M...M.....M...M",
    "M...M..@..M...M",
    "M...M.....M...M",
    "M...MMMMMMM...M",
    "M.............M",
    "M.<...........M",
    "MMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  // 6. DUNGEON FINAL / TEMPLO DO CAOS (3 floors)
  DUNGEON_FINAL_1: [
    "MMMMMMMMMMMMMMMMM",
    "M...............M",
    "M.MMMMMM.MMMMMM.M",
    "M.M...X......X.MM",
    "M.M.MMMMMMMMM.M.M",
    "M.M.M.......M.M.M",
    "M.M.M.MMMMM.M.M.M",
    "M.M.M.M...M.M.M.M",
    "M.M.M.MMM.M.M.M.M",
    "M.M.M.....M.M.M.M",
    "M.M.MMMMMMM.M.M.M",
    "M.M.........M.>.M",
    "M.MMMMMMMMMMM.M.M",
    "MMMMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_FINAL_2: [
    "MMMMMMMMMMMMMMMMM",
    "M.<...........>.M",
    "M.MMMMMM.MMMMMM.M",
    "M.M...X......X.MM",
    "M.M.MMMMMMMMM.M.M",
    "M.M.M.......M.M.M",
    "M.M.M.MMMMM.M.M.M",
    "M.M.M.M...M.M.M.M",
    "M.M.M.MMM.M.M.M.M",
    "M.M.M.....M.M.M.M",
    "M.M.MMMMMMM.M.M.M",
    "M.M.........M.M.M",
    "M.MMMMMMMMMMM.M.M",
    "MMMMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_FINAL_3: [
    "MMMMMMMMMMMMMMMMM",
    "M...............M",
    "M.MMMMMMMMMMMMM.M",
    "M.M...........M.M",
    "M.M.X.......X.M.M",
    "M.M...........M.M",
    "M.M.....@.....M.M",
    "M.M...........M.M",
    "M.M...........M.M",
    "M.M...........M.M",
    "M.MMMMMMMMMMMMM.M",
    "M.<.............M",
    "MMMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMMM"
  ].map(row => row.split('') as MapTile[]),
};

// Aliases for backward compatibility
MAPS.DUNGEON_FOGO = MAPS.DUNGEON_FOGO_1;
MAPS.DUNGEON_AGUA = MAPS.DUNGEON_AGUA_1;
MAPS.DUNGEON_AR = MAPS.DUNGEON_AR_1;
MAPS.DUNGEON_TERRA = MAPS.DUNGEON_TERRA_1;

export type DropTableEntry = {
  itemId: string;
  name: string;
  chance: number; // 0.0 to 1.0
};

export type EnemyTemplate = {
  name: string;
  emoji: string;
  stats: EntityStats;
  weapon: Weapon;
  gold: number;
  baseGold: number;
  baseExp: number;
  drops: DropTableEntry[];
};

export const ENEMY_TEMPLATES: Record<EnemyType, EnemyTemplate> = {
  slime: {
    name: 'Slime Verde',
    emoji: '',
    stats: { hp: 35, maxHp: 35, mp: 0, maxMp: 0, sp: 0, maxSp: 100, batPwr: 14, def: 8, magDef: 8, mBlock: 5, vel: 5, vigor: 10, magPwr: 4, mov: 2, for: 10, int: 4 },
    weapon: WEAPONS.espada_madeira,
    gold: 8,
    baseGold: 8,
    baseExp: 35,
    drops: [
      { itemId: 'pocao', name: 'Pocao', chance: 0.45 },
      { itemId: 'antidoto', name: 'Erva Antidoto', chance: 0.20 },
    ]
  },
  goblin: {
    name: 'Goblin Salteador',
    emoji: '',
    stats: { hp: 50, maxHp: 50, mp: 10, maxMp: 10, sp: 0, maxSp: 100, batPwr: 20, def: 10, magDef: 8, mBlock: 8, vel: 8, vigor: 14, magPwr: 6, mov: 3, for: 14, int: 6 },
    weapon: WEAPONS.arco,
    gold: 18,
    baseGold: 18,
    baseExp: 55,
    drops: [
      { itemId: 'pocao', name: 'Pocao', chance: 0.35 },
      { itemId: 'hi_pocao', name: 'Hi-Pocao', chance: 0.20 },
      { itemId: 'eter', name: 'Eter', chance: 0.15 },
    ]
  },
  orc: {
    name: 'Orc Guerreiro',
    emoji: '',
    stats: { hp: 90, maxHp: 90, mp: 0, maxMp: 0, sp: 0, maxSp: 100, batPwr: 28, def: 18, magDef: 10, mBlock: 6, vel: 6, vigor: 24, magPwr: 4, mov: 2, for: 24, int: 4 },
    weapon: WEAPONS.espada,
    gold: 40,
    baseGold: 40,
    baseExp: 100,
    drops: [
      { itemId: 'hi_pocao', name: 'Hi-Pocao', chance: 0.35 },
      { itemId: 'eter', name: 'Eter', chance: 0.25 },
      { itemId: 'elixir', name: 'Elixir', chance: 0.08 },
    ]
  },
  elemental: {
    name: 'Elemental Arcano',
    emoji: '',
    stats: { hp: 70, maxHp: 70, mp: 60, maxMp: 60, sp: 0, maxSp: 100, batPwr: 12, def: 10, magDef: 24, mBlock: 20, vel: 12, vigor: 8, magPwr: 26, mov: 3, for: 8, int: 26 },
    weapon: WEAPONS.cajado,
    gold: 55,
    baseGold: 55,
    baseExp: 135,
    drops: [
      { itemId: 'eter', name: 'Eter', chance: 0.40 },
      { itemId: 'hi_pocao', name: 'Hi-Pocao', chance: 0.25 },
      { itemId: 'elixir', name: 'Elixir', chance: 0.15 },
    ]
  },
  boss: {
    name: 'Dragao Anciao',
    emoji: '',
    stats: { hp: 350, maxHp: 350, mp: 120, maxMp: 120, sp: 0, maxSp: 100, batPwr: 42, def: 26, magDef: 24, mBlock: 18, vel: 15, vigor: 35, magPwr: 28, mov: 2, for: 35, int: 28 },
    weapon: WEAPONS.cajado_anciao,
    gold: 750,
    baseGold: 750,
    baseExp: 650,
    drops: [
      { itemId: 'elixir', name: 'Elixir', chance: 1.0 },
      { itemId: 'hi_pocao', name: 'Hi-Pocao', chance: 1.0 },
      { itemId: 'eter', name: 'Eter', chance: 0.8 },
    ]
  }
};

export const AREA_MODIFIERS: Record<string, {
  name: string;
  expMult: number;
  goldMult: number;
  minEnemies: number;
  maxEnemies: number;
  allowedTypes: EnemyType[];
}> = {
  OVERWORLD: {
    name: 'Planicies de Cornelia',
    expMult: 1.0,
    goldMult: 1.0,
    minEnemies: 2,
    maxEnemies: 4,
    allowedTypes: ['slime', 'goblin']
  },
  TOWN_CORNELIA: {
    name: 'Cidade de Cornelia',
    expMult: 1.0,
    goldMult: 1.0,
    minEnemies: 0,
    maxEnemies: 0,
    allowedTypes: []
  },
  TOWN_PRAVOCA: {
    name: 'Cidade de Pravoca',
    expMult: 1.0,
    goldMult: 1.0,
    minEnemies: 0,
    maxEnemies: 0,
    allowedTypes: []
  },
  TOWN_GAIA: {
    name: 'Cidade de Gaia',
    expMult: 1.0,
    goldMult: 1.0,
    minEnemies: 0,
    maxEnemies: 0,
    allowedTypes: []
  },
  DUNGEON_PRELUDIO_1: {
    name: 'Caverna do Preludio - Andar 1',
    expMult: 1.15,
    goldMult: 1.1,
    minEnemies: 2,
    maxEnemies: 4,
    allowedTypes: ['slime', 'goblin']
  },
  DUNGEON_PRELUDIO_2: {
    name: 'Caverna do Preludio - Andar 2',
    expMult: 1.25,
    goldMult: 1.2,
    minEnemies: 2,
    maxEnemies: 4,
    allowedTypes: ['goblin', 'orc']
  },
  DUNGEON_DESAFIO_1: {
    name: 'Cidadela dos Desafios - Andar 1',
    expMult: 1.25,
    goldMult: 1.2,
    minEnemies: 2,
    maxEnemies: 4,
    allowedTypes: ['goblin', 'orc']
  },
  DUNGEON_DESAFIO_2: {
    name: 'Cidadela dos Desafios - Trono',
    expMult: 1.35,
    goldMult: 1.25,
    minEnemies: 2,
    maxEnemies: 4,
    allowedTypes: ['orc', 'elemental']
  },
  DUNGEON_TERRA_1: {
    name: 'Santuario da Terra - Andar 1',
    expMult: 1.35,
    goldMult: 1.3,
    minEnemies: 2,
    maxEnemies: 5,
    allowedTypes: ['goblin', 'orc']
  },
  DUNGEON_TERRA_2: {
    name: 'Santuario da Terra - Andar 2',
    expMult: 1.45,
    goldMult: 1.35,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['orc', 'elemental']
  },
  DUNGEON_FOGO_1: {
    name: 'Monte Gulg - Andar 1',
    expMult: 1.5,
    goldMult: 1.4,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['orc', 'elemental']
  },
  DUNGEON_FOGO_2: {
    name: 'Monte Gulg - Andar 2',
    expMult: 1.6,
    goldMult: 1.45,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['orc', 'elemental']
  },
  DUNGEON_AGUA_1: {
    name: 'Santuario Submerso - Andar 1',
    expMult: 1.65,
    goldMult: 1.5,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['slime', 'orc', 'elemental']
  },
  DUNGEON_AGUA_2: {
    name: 'Santuario Submerso - Andar 2',
    expMult: 1.75,
    goldMult: 1.55,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['slime', 'orc', 'elemental']
  },
  DUNGEON_AR_1: {
    name: 'Torre da Miragem - Andar 1',
    expMult: 1.8,
    goldMult: 1.6,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['elemental', 'orc']
  },
  DUNGEON_AR_2: {
    name: 'Torre da Miragem - Andar 2',
    expMult: 1.9,
    goldMult: 1.65,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['elemental', 'orc']
  },
  DUNGEON_AR_3: {
    name: 'Torre da Miragem - Topo',
    expMult: 2.0,
    goldMult: 1.7,
    minEnemies: 3,
    maxEnemies: 5,
    allowedTypes: ['elemental', 'boss']
  },
  DUNGEON_FINAL_1: {
    name: 'Templo do Caos - Andar 1',
    expMult: 2.2,
    goldMult: 1.8,
    minEnemies: 4,
    maxEnemies: 5,
    allowedTypes: ['orc', 'elemental']
  },
  DUNGEON_FINAL_2: {
    name: 'Templo do Caos - Andar 2',
    expMult: 2.4,
    goldMult: 1.9,
    minEnemies: 4,
    maxEnemies: 5,
    allowedTypes: ['orc', 'elemental', 'boss']
  },
  DUNGEON_FINAL_3: {
    name: 'Templo do Caos - Altar do Vazio',
    expMult: 2.6,
    goldMult: 2.0,
    minEnemies: 4,
    maxEnemies: 5,
    allowedTypes: ['elemental', 'boss']
  },
  // Backward compatibility
  DUNGEON_FOGO: { name: 'Monte Gulg', expMult: 1.5, goldMult: 1.4, minEnemies: 3, maxEnemies: 5, allowedTypes: ['orc', 'elemental'] },
  DUNGEON_AGUA: { name: 'Santuario Submerso', expMult: 1.65, goldMult: 1.5, minEnemies: 3, maxEnemies: 5, allowedTypes: ['slime', 'orc', 'elemental'] },
  DUNGEON_AR: { name: 'Torre da Miragem', expMult: 1.8, goldMult: 1.6, minEnemies: 3, maxEnemies: 5, allowedTypes: ['elemental', 'orc'] },
  DUNGEON_TERRA: { name: 'Santuario da Terra', expMult: 1.35, goldMult: 1.3, minEnemies: 3, maxEnemies: 5, allowedTypes: ['goblin', 'orc'] }
};

export const GET_DUNGEON_BOSS = (mapId: MapId): Enemy => {
  if (mapId === 'DUNGEON_PRELUDIO_2') {
    return {
      id: 'boss_preludio',
      name: 'Gargula do Preludio',
      x: 8,
      y: 4,
      type: 'boss',
      stats: { hp: 220, maxHp: 220, mp: 60, maxMp: 60, sp: 0, maxSp: 100, batPwr: 28, def: 16, magDef: 14, mBlock: 10, vel: 11, vigor: 20, magPwr: 14, mov: 3, for: 20, int: 14 },
      weapon: WEAPONS.espada_aco,
      emoji: '',
      goldReward: 250,
      expReward: 300
    };
  }
  if (mapId === 'DUNGEON_DESAFIO_2') {
    return {
      id: 'boss_desafio',
      name: 'Cavaleiro Sombrio Ancestral',
      x: 7,
      y: 4,
      type: 'boss',
      stats: { hp: 320, maxHp: 320, mp: 80, maxMp: 80, sp: 0, maxSp: 100, batPwr: 36, def: 22, magDef: 18, mBlock: 14, vel: 12, vigor: 28, magPwr: 18, mov: 3, for: 28, int: 18 },
      weapon: WEAPONS.espada_aco,
      emoji: '',
      goldReward: 400,
      expReward: 450
    };
  }
  if (mapId === 'DUNGEON_TERRA_2') {
    return {
      id: 'boss_terra',
      name: 'Lich da Terra',
      x: 8,
      y: 5,
      type: 'boss',
      stats: { hp: 380, maxHp: 380, mp: 120, maxMp: 120, sp: 0, maxSp: 100, batPwr: 32, def: 20, magDef: 30, mBlock: 24, vel: 13, vigor: 22, magPwr: 32, mov: 3, for: 22, int: 32 },
      weapon: WEAPONS.cajado_anciao,
      emoji: '',
      goldReward: 500,
      expReward: 550
    };
  }
  if (mapId === 'DUNGEON_FOGO_2') {
    return {
      id: 'boss_fogo',
      name: 'Marilith de Fogo',
      x: 7,
      y: 5,
      type: 'boss',
      stats: { hp: 480, maxHp: 480, mp: 130, maxMp: 130, sp: 0, maxSp: 100, batPwr: 45, def: 24, magDef: 22, mBlock: 18, vel: 16, vigor: 36, magPwr: 28, mov: 3, for: 36, int: 28 },
      weapon: WEAPONS.espada_flamejante,
      emoji: '',
      goldReward: 700,
      expReward: 750
    };
  }
  if (mapId === 'DUNGEON_AGUA_2') {
    return {
      id: 'boss_agua',
      name: 'Kraken Abissal',
      x: 7,
      y: 5,
      type: 'boss',
      stats: { hp: 580, maxHp: 580, mp: 150, maxMp: 150, sp: 0, maxSp: 100, batPwr: 48, def: 26, magDef: 26, mBlock: 20, vel: 15, vigor: 38, magPwr: 32, mov: 3, for: 38, int: 32 },
      weapon: WEAPONS.tridente_sagrado,
      emoji: '',
      goldReward: 900,
      expReward: 950
    };
  }
  if (mapId === 'DUNGEON_AR_3' || mapId === 'DUNGEON_AR_2' || mapId === 'DUNGEON_AR_1') {
    return {
      id: 'boss_ar',
      name: 'Tiamat dos Ceus',
      x: 7,
      y: 5,
      type: 'boss',
      stats: { hp: 700, maxHp: 700, mp: 180, maxMp: 180, sp: 0, maxSp: 100, batPwr: 54, def: 28, magDef: 30, mBlock: 25, vel: 18, vigor: 42, magPwr: 38, mov: 3, for: 42, int: 38 },
      weapon: WEAPONS.arco_celestial,
      emoji: '',
      goldReward: 1200,
      expReward: 1300
    };
  }
  // FINAL BOSS: CHAOS
  return {
    id: 'boss_chaos',
    name: 'Chaos Supremo',
    x: 8,
    y: 6,
    type: 'boss',
    stats: { hp: 1000, maxHp: 1000, mp: 300, maxMp: 300, sp: 0, maxSp: 100, batPwr: 68, def: 38, magDef: 40, mBlock: 30, vel: 20, vigor: 52, magPwr: 48, mov: 3, for: 52, int: 48 },
    weapon: WEAPONS.masamune,
    emoji: '',
    goldReward: 3000,
    expReward: 3500
  };
};

export const BOSS: Enemy = {
  ...GET_DUNGEON_BOSS('DUNGEON_FINAL_3'),
  x: 8,
  y: 6
};

// Baús de tesouro espalhados por dungeons e cidades
export const CHESTS_DATA: Record<string, { type: 'item' | 'weapon' | 'gold'; itemId?: string; weaponId?: string; gold?: number; name: string }> = {
  // Preludio Floor 1
  'DUNGEON_PRELUDIO_1_3_3': { type: 'item', itemId: 'pocao', name: 'Pocao de Cura' },
  'DUNGEON_PRELUDIO_1_11_3': { type: 'gold', gold: 100, name: '100 Moedas de Ouro' },
  // Preludio Floor 2
  'DUNGEON_PRELUDIO_2_3_3': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix' },
  'DUNGEON_PRELUDIO_2_11_7': { type: 'weapon', weaponId: 'espada_ferro', name: 'Espada de Ferro Reforcada' },

  // Desafio Floor 1
  'DUNGEON_DESAFIO_1_4_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao' },
  'DUNGEON_DESAFIO_1_8_3': { type: 'gold', gold: 300, name: '300 Moedas de Ouro' },
  // Desafio Floor 2
  'DUNGEON_DESAFIO_2_3_2': { type: 'item', itemId: 'eter', name: 'Eter Magico' },
  'DUNGEON_DESAFIO_2_11_2': { type: 'weapon', weaponId: 'espada_aco', name: 'Lamina dos Campeoes' },

  // Terra Floor 1
  'DUNGEON_TERRA_1_3_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao' },
  'DUNGEON_TERRA_1_11_3': { type: 'gold', gold: 250, name: '250 Moedas de Ouro' },
  // Terra Floor 2
  'DUNGEON_TERRA_2_3_3': { type: 'item', itemId: 'eter', name: 'Eter Magico' },
  'DUNGEON_TERRA_2_11_7': { type: 'weapon', weaponId: 'espada_aco', name: 'Espada de Aco Titanesco' },

  // Fogo Floor 1
  'DUNGEON_FOGO_1_3_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao' },
  'DUNGEON_FOGO_1_11_3': { type: 'gold', gold: 350, name: '350 Moedas de Ouro' },
  // Fogo Floor 2
  'DUNGEON_FOGO_2_3_3': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix' },
  'DUNGEON_FOGO_2_11_7': { type: 'weapon', weaponId: 'espada_flamejante', name: 'Lamina Flamejante' },

  // Agua Floor 1
  'DUNGEON_AGUA_1_3_3': { type: 'item', itemId: 'elixir', name: 'Elixir Raro' },
  'DUNGEON_AGUA_1_11_3': { type: 'gold', gold: 450, name: '450 Moedas de Ouro' },
  // Agua Floor 2
  'DUNGEON_AGUA_2_3_3': { type: 'item', itemId: 'eter', name: 'Super Eter' },
  'DUNGEON_AGUA_2_11_7': { type: 'weapon', weaponId: 'cajado_arcano', name: 'Cajado Arcano das Mares' },

  // Ar Floor 1
  'DUNGEON_AR_1_3_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao' },
  'DUNGEON_AR_1_11_3': { type: 'gold', gold: 600, name: '600 Moedas de Ouro' },
  // Ar Floor 2
  'DUNGEON_AR_2_3_3': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix' },
  'DUNGEON_AR_2_11_7': { type: 'weapon', weaponId: 'arco_elfico', name: 'Arco Elfico das Nuvens' },

  // Final Floor 1
  'DUNGEON_FINAL_1_3_3': { type: 'item', itemId: 'elixir', name: 'Elixir Supremo' },
  'DUNGEON_FINAL_1_11_3': { type: 'gold', gold: 1000, name: '1000 Moedas de Ouro' },
  // Final Floor 2
  'DUNGEON_FINAL_2_3_3': { type: 'item', itemId: 'elixir', name: 'Elixir Divino' },
  'DUNGEON_FINAL_2_11_7': { type: 'weapon', weaponId: 'excalibur', name: 'Lendaria Espada Excalibur' },

  // Baus dos Interiores das Cidades
  'INTERIOR_CORNELIA_HOUSE_5_5': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao de Dona Marta' },
  'INTERIOR_CORNELIA_SHOP_5_5': { type: 'gold', gold: 120, name: '120 Moedas de Ouro' },
  'INTERIOR_CORNELIA_TOOLSMITH_5_5': { type: 'weapon', weaponId: 'espada_ferro', name: 'Espada de Ferro da Oficina' },
  'INTERIOR_PRAVOCA_HOUSE_5_5': { type: 'item', itemId: 'eter', name: 'Eter do Construtor Naval' },
  'INTERIOR_PRAVOCA_SHOP_5_5': { type: 'gold', gold: 200, name: '200 Moedas de Ouro' },
  'INTERIOR_PRAVOCA_TOOLSMITH_5_5': { type: 'weapon', weaponId: 'arco_longo', name: 'Arco Longo da Marinha' },
  'INTERIOR_GAIA_HOUSE_5_5': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix Ancestral' },
  'INTERIOR_GAIA_SHOP_5_5': { type: 'item', itemId: 'elixir', name: 'Elixir dos Sabios' },
  'INTERIOR_GAIA_TOOLSMITH_5_5': { type: 'weapon', weaponId: 'espada_flamejante', name: 'Lamina Forjada em Fogo Sagrado' }
};

// Sistema de Cutscenes com dialogos e quebra de quarta parede (SEM ACENTOS)
export const CUTSCENES_DATA: Record<string, { id: string; title: string; messages: { speaker: string; text: string }[] }> = {
  'intro_world': {
    id: 'intro_world',
    title: 'A JORNADA COMECA',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'Finalmente alcancamos o continente de Eldoria! Mas esperem... quem compos essa trilha sonora dramatica?' },
      { speaker: 'Lyra Arcanista', text: 'E o desenvolvedor do jogo, obviamente. E por que minhas roupas parecem saidas de um RPG de 16-bits?' },
      { speaker: 'Rowan Arqueiro', text: 'Nao reclame dos pixels, Lyra! Olhe o mapa: temos 6 masmorras inteiras para explorar.' },
      { speaker: 'Elira Alquimista', text: 'O fluxo e linear! Precisamos comecar pela Caverna do Preludio no leste antes de encarar os 4 templos elementais!' },
      { speaker: 'Caelen Guardiao', text: 'Entao vamos em frente! E quem estiver controlando o teclado, tente nao nos jogar contra as montanhas!' }
    ]
  },
  'enter_preludio': {
    id: 'enter_preludio',
    title: 'CAVERNA DO PRELUDIO',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'Entramos na Caverna do Preludio. O ar aqui e frio e cheira a mofo antigo.' },
      { speaker: 'Rowan Arqueiro', text: 'Vejam aquelas escadas no fundo! As masmorras agora tem multiplos andares.' },
      { speaker: 'Lyra Arcanista', text: 'E fiquem atentos aos baus com a marca X! Eles contem pocoes, equipamentos e moedas.' },
      { speaker: 'Elira Alquimista', text: 'Derrotem os monstros e alcancem o segundo andar para conquistar a primeira chave!' }
    ]
  },
  'enter_desafio': {
    id: 'enter_desafio',
    title: 'CIDADELA DOS DESAFIOS',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'Chegamos a lendaria Cidadela dos Desafios, a segunda masmorra guardiao!' },
      { speaker: 'Rowan Arqueiro', text: 'Os anciaos de Pravoca avisaram: o Cavaleiro Sombrio protege o Amuleto dos Sabios no andar superior.' },
      { speaker: 'Lyra Arcanista', text: 'Sem esse amuleto, a Barreira Ancestral continuara bloqueando o caminho para Gaia e os Templos Elementais.' },
      { speaker: 'Elira Alquimista', text: 'Preparem suas melhores armas e pocoes. Esta vitoria abrira os caminhos do mundo!' }
    ]
  },
  'enter_terra': {
    id: 'enter_terra',
    title: 'TEMPLO DA TERRA',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'As pedras deste templo tremem sob nossos pes. O Cristal da Terra esta aqui dentro!' },
      { speaker: 'Lyra Arcanista', text: 'Sinto a presenca do Lich no andar subterraneo mais profundo.' },
      { speaker: 'Rowan Arqueiro', text: 'Um classico trope de fantasia: o chefe morto-vivo que guarda o cristal. Que original!' },
      { speaker: 'Caelen Guardiao', text: 'Original ou nao, afiem suas armas e vamos descer!' }
    ]
  },
  'enter_fogo': {
    id: 'enter_fogo',
    title: 'TEMPLO DO FOGO',
    messages: [
      { speaker: 'Elira Alquimista', text: 'Ufa! A temperatura aqui dentro esta derretendo ate os meus frascos de alquimia!' },
      { speaker: 'Lyra Arcanista', text: 'Marilith comanda as chamas no fundo do segundo andar. Tenham cuidado com fogo cruzado!' },
      { speaker: 'Rowan Arqueiro', text: 'Sorte que eu comprei flechas resistentes ao calor. Pelo menos e o que o vendedor me disse...' },
      { speaker: 'Caelen Guardiao', text: 'Mantenham a formacao e procurem pelos baus de tesouro!' }
    ]
  },
  'enter_agua': {
    id: 'enter_agua',
    title: 'TEMPLO DA AGUA',
    messages: [
      { speaker: 'Rowan Arqueiro', text: 'Espero que todos saibam nadar, porque este templo esta semi-inundado.' },
      { speaker: 'Lyra Arcanista', text: 'Kraken habita as profundezas. Magias eletricas devem ser uteis contra ele!' },
      { speaker: 'Elira Alquimista', text: 'Seus tentaculos sao perfeitos para ingredientes de pocoes raras. Derrotem-no para mim!' },
      { speaker: 'Caelen Guardiao', text: 'Foco na missao! Recuperar o Cristal da Agua e salvar Eldoria!' }
    ]
  },
  'enter_ar': {
    id: 'enter_ar',
    title: 'TEMPLO DO AR',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'Estamos no topo dos ventos! Um passo em falso e cairemos no abismo!' },
      { speaker: 'Rowan Arqueiro', text: 'A Tiamat guarda o ultimo elemento. Este e o quarto templo elementar.' },
      { speaker: 'Lyra Arcanista', text: 'Apos este cristal, apenas a Cidadela Final restara no horizonte.' },
      { speaker: 'Elira Alquimista', text: 'Vamos reunir todos os quatro cristais elementais e abrir o portal supremo!' }
    ]
  },
  'enter_final': {
    id: 'enter_final',
    title: 'CIDADELA FINAL DE CHAOS',
    messages: [
      { speaker: 'Caelen Guardiao', text: 'Chegamos ao covil de Chaos! O destino de todo o reino sera decidido agora!' },
      { speaker: 'Lyra Arcanista', text: 'Se o jogador salvar o jogo agora, teremos chance se algo der errado!' },
      { speaker: 'Rowan Arqueiro', text: 'Sem piadas agora. O poder das sombras e real. Preparem os melhores itens!' },
      { speaker: 'Elira Alquimista', text: 'Distribuam os elixires e vamos lutar com toda a nossa forca!' }
    ]
  }
};

export const generateCombatEnemies = (
  mapId: MapId,
  playerParty: { stats: { vel: number } }[],
  isBoss: boolean = false,
  customBoss?: Enemy
): Enemy[] => {
  if (isBoss) {
    const bossToSpawn = customBoss || GET_DUNGEON_BOSS(mapId);
    const minionCount = Math.floor(Math.random() * 2) + 2; // 2 to 3 minions
    const minions: Enemy[] = [];
    const maxPartyVel = Math.max(...playerParty.map(p => p.stats.vel), 10);

    for (let i = 0; i < minionCount; i++) {
      const type: EnemyType = i % 2 === 0 ? 'elemental' : 'orc';
      const template = ENEMY_TEMPLATES[type];
      const isFast = Math.random() < 0.5;
      const vel = isFast ? maxPartyVel + Math.floor(Math.random() * 3) + 1 : Math.round(template.stats.vel * 1.2);

      minions.push({
        id: `boss_guard_${i}_${Date.now()}`,
        name: `${template.name} Guardiao ${String.fromCharCode(65 + i)}`,
        x: 0,
        y: 0,
        type,
        stats: {
          ...template.stats,
          hp: Math.round(template.stats.hp * 1.3),
          maxHp: Math.round(template.stats.maxHp * 1.3),
          batPwr: Math.round(template.stats.batPwr * 1.2),
          def: Math.round(template.stats.def * 1.2),
          magDef: Math.round(template.stats.magDef * 1.2),
          mBlock: Math.min(40, Math.round(template.stats.mBlock * 1.2)),
          vel,
          vigor: Math.round(template.stats.vigor * 1.2),
          magPwr: Math.round(template.stats.magPwr * 1.2),
          mov: 2,
          for: Math.round((template.stats.vigor || 15) * 1.2),
          int: Math.round((template.stats.magPwr || 10) * 1.2),
        },
        weapon: template.weapon,
        emoji: '',
        goldReward: Math.round(template.gold * 1.3),
        expReward: Math.round(template.baseExp * 1.3)
      });
    }

    return [bossToSpawn, ...minions];
  }

  const area = AREA_MODIFIERS[mapId] || AREA_MODIFIERS.OVERWORLD;
  const count = Math.floor(Math.random() * (area.maxEnemies - area.minEnemies + 1)) + area.minEnemies;
  const maxPartyVel = Math.max(...playerParty.map(p => p.stats.vel), 8);
  const result: Enemy[] = [];

  const roleTitles = ['Alfa', 'Bruto', 'Agil', 'Veterano', 'Sentinela'];

  for (let i = 0; i < count; i++) {
    const allowed = area.allowedTypes;
    const type = allowed[Math.floor(Math.random() * allowed.length)];
    const template = ENEMY_TEMPLATES[type];

    const areaMult = area.expMult;
    const individualVar = 0.85 + Math.random() * 0.4;
    const isSpecialVariant = Math.random() < 0.4 || i === 0;

    let finalVel: number;
    let finalBatPwr: number;
    let finalVigor: number;
    let finalHp: number;
    let finalDef: number;
    let finalMagDef: number;
    let finalMBlock: number;
    let finalMagPwr: number;
    let nameSuffix: string;

    if (isSpecialVariant) {
      const specialType = Math.random();
      if (specialType < 0.5) {
        finalVel = maxPartyVel + Math.floor(Math.random() * 3) + 1; // faster than the entire party
        finalBatPwr = Math.round(template.stats.batPwr * areaMult * 1.25);
        finalVigor = Math.round(template.stats.vigor * areaMult * 1.25);
        finalHp = Math.round(template.stats.hp * areaMult * 1.15);
        finalDef = Math.round(template.stats.def * areaMult * 1.1);
        finalMagDef = Math.round(template.stats.magDef * areaMult * 1.1);
        finalMBlock = Math.min(45, Math.round(template.stats.mBlock * 1.2));
        finalMagPwr = Math.round(template.stats.magPwr * areaMult * 1.2);
        nameSuffix = 'Agil';
      } else {
        finalVel = Math.max(5, Math.round(template.stats.vel * areaMult * individualVar));
        finalBatPwr = Math.round(template.stats.batPwr * areaMult * 1.4);
        finalVigor = Math.round(template.stats.vigor * areaMult * 1.4);
        finalHp = Math.round(template.stats.hp * areaMult * 1.45);
        finalDef = Math.round(template.stats.def * areaMult * 1.3);
        finalMagDef = Math.round(template.stats.magDef * areaMult * 1.25);
        finalMBlock = Math.min(45, Math.round(template.stats.mBlock * 1.3));
        finalMagPwr = Math.round(template.stats.magPwr * areaMult * 1.3);
        nameSuffix = 'Veterano';
      }
    } else {
      finalVel = Math.max(4, Math.round(template.stats.vel * areaMult * individualVar));
      finalBatPwr = Math.max(10, Math.round(template.stats.batPwr * areaMult * individualVar));
      finalVigor = Math.max(1, Math.round(template.stats.vigor * areaMult * individualVar));
      finalHp = Math.max(15, Math.round(template.stats.hp * areaMult * individualVar));
      finalDef = Math.max(1, Math.round(template.stats.def * areaMult * individualVar));
      finalMagDef = Math.max(1, Math.round(template.stats.magDef * areaMult * individualVar));
      finalMBlock = Math.min(35, Math.max(3, Math.round(template.stats.mBlock * individualVar)));
      finalMagPwr = Math.max(1, Math.round(template.stats.magPwr * areaMult * individualVar));
      nameSuffix = roleTitles[i % roleTitles.length];
    }

    const enemyName = `${template.name} ${nameSuffix} ${String.fromCharCode(65 + i)}`;

    result.push({
      id: `enemy_${Date.now()}_${i}`,
      name: enemyName,
      x: 0,
      y: 0,
      type,
      stats: {
        hp: finalHp,
        maxHp: finalHp,
        mp: template.stats.mp,
        maxMp: template.stats.maxMp,
        sp: 0,
        maxSp: 100,
        batPwr: finalBatPwr,
        def: finalDef,
        magDef: finalMagDef,
        mBlock: finalMBlock,
        vel: finalVel,
        vigor: finalVigor,
        magPwr: finalMagPwr,
        mov: template.stats.mov,
        for: finalVigor,
        int: finalMagPwr
      },
      weapon: template.weapon,
      emoji: '',
      goldReward: Math.round(template.gold * area.goldMult * individualVar),
      expReward: Math.round(template.baseExp * area.expMult * individualVar)
    });
  }

  return result;
};
