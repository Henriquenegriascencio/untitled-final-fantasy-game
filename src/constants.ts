import { Weapon, MapTile, Item, EnemyType, EntityStats } from './types';

export const WEAPONS: Record<string, Weapon> = {
  espada_madeira: { id: 'w0', name: 'Espada de Madeira', type: 'espada', range: 1, damage: 5 },
  espada: { id: 'w1', name: 'Espada Longa', type: 'espada', range: 1, damage: 15 },
  espada_aco: { id: 'w1b', name: 'Espada de Aco', type: 'espada', range: 1, damage: 25 },
  arco: { id: 'w2', name: 'Arco Curto', type: 'arco', range: 3, damage: 10 },
  arco_longo: { id: 'w2b', name: 'Arco Longo', type: 'arco', range: 4, damage: 18 },
  cajado: { id: 'w3', name: 'Cajado Magico', type: 'cajado', range: 2, damage: 12, aoe: true },
  cajado_anciao: { id: 'w3b', name: 'Cajado do Anciao', type: 'cajado', range: 3, damage: 22, aoe: true },
};

export const ITEMS: Record<string, Item> = {
  pocao: { id: 'i1', name: 'Pocao', heal: 50, count: 0, price: 10 },
  hi_pocao: { id: 'i2', name: 'Hi-Pocao', heal: 150, count: 0, price: 30 },
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

export const MAPS = {
  OVERWORLD: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~MMMMM~~~~~~~~~~~~~~~~~MMMMM~~~~~~~~",
    "~~~MMM...MMMM~~~~~~~~~~~~MMM...MM~~~~~~~",
    "~~MM........MM~~~~~~~~~~MM......MM~~~~~~",
    "~~M..........MMMMMMMMMMMM........M~~~~~~",
    "~~M...C..........................M~~~~~~",
    "~~M..............................M~~~~~~",
    "~~MMMMM..........................MM~~~~~",
    "~~~~~~M...1.......................M~~~~~",
    "~~~~~~MMMMMMMMMMMMMMMMMMMMM...M...M~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~M.......M...M~~~~~",
    "~~~~~MMMMMMMM~~~~~~~~~M...C...M...M~~~~~",
    "~~~~MM......MM~~~~~~~~M.......M...M~~~~~",
    "~~~MM...2....MMMMMMMMMM.......M...M~~~~~",
    "~~MM..........................M...MM~~~~",
    "~~M...........................M....M~~~~",
    "~~M.......MMMMMMMMMMMMMMMMMMMMM....M~~~~",
    "~~MMMMMMMMM~~~~~~~~~~~~~~~~~~~M....M~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~M....M~~~~",
    "~~MMMMMMMMM~~~~~~~~~~~~~~~~~~~M....M~~~~",
    "~~M.......MMMMMMMMMMMMMMMMMMMMM....M~~~~",
    "~~M...3............................M~~~~",
    "~~MM.....................C.........M~~~~",
    "~~~MM...MMMMMMMMMMMMMMMM...........MM~~~",
    "~~~~MMMMM~~~~~~~~~~~~~~M............M~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~M....4.......M~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~M............M~~~",
    "~~~~~~~~~~MMMMMMMMMMMMMM...........MM~~~",
    "~~~~~~~~~MM.......................~~~~~~",
    "~~~~~~~~~M..........S............M~~~~~~",
    "~~~~~~~~~M...MMMMMMMMMMMMMMMMM...M~~~~~~",
    "~~~~~~~~~M...M~~~~~~~~~~~~~~~M...M~~~~~~",
    "~~~~~~~~~M...M~~~~~~~~~~~~~~~M...M~~~~~~",
    "~~~~~~~~~M...M~~~~~~~~~~~~~~~M...M~~~~~~",
    "~~~~~~~~~M...M~~~~~MMMMM~~~~~M...M~~~~~~",
    "~~~~~~~~~M...M~~~~~M...M~~~~~M...M~~~~~~",
    "~~~~~~~~~M...M~~~~~M.F.M~~~~~M...M~~~~~~",
    "~~~~~~~~~M...MMMMMMM...MMMMMMM...M~~~~~~",
    "~~~~~~~~~M.......................M~~~~~~",
    "~~~~~~~~~MMMMMMMMMMMMMMMMMMMMMMMMM~~~~~~"
  ].map(row => row.split('') as MapTile[]),
  
  DUNGEON_FOGO: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MMMMM.MMMMM.M",
    "M.M.........M.M",
    "M.M.MMM.M.M.M.M",
    "M.M.M...@.M.M.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMMMM.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_AGUA: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.~~~~~~~~~~~.M",
    "M.~.........~.M",
    "M.~.~~~~~~~.~.M",
    "M.~.~..@..~.~.M",
    "M.~.~~~~~~~.~.M",
    "M.~.........~.M",
    "M.~~~~~~~~~~~.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_AR: [
    "MMMMMMMMMMMMMMM",
    "M.............M",
    "M.MM.MM.MM.MM.M",
    "M.............M",
    "M.MM.MM.MM.MM.M",
    "M......@......M",
    "M.MM.MM.MM.MM.M",
    "M.............M",
    "M.MM.MM.MM.MM.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),

  DUNGEON_TERRA: [
    "MMMMMMMMMMMMMMM",
    "M.......M.....M",
    "M.MMMMM.M.MMM.M",
    "M.M.....M.M.@.M",
    "M.M.MMMMMMM.M.M",
    "M.M.........M.M",
    "M.MMMMMMMMM.M.M",
    "M.......M...M.M",
    "MMMMMMM.M.MMM.M",
    "M.............M",
    "MMMMMMM.MMMMMMM",
    "MMMMMMM<MMMMMMM"
  ].map(row => row.split('') as MapTile[]),
};

export const ENEMY_TEMPLATES: Record<EnemyType, { emoji: string, stats: EntityStats, weapon: Weapon, gold: number }> = {
  slime: { emoji: '🦠', stats: { hp: 30, maxHp: 30, mp: 0, maxMp: 0, sp: 0, maxSp: 100, for: 5, int: 2, def: 2, mov: 2, vel: 5 }, weapon: WEAPONS.espada_madeira, gold: 5 },
  goblin: { emoji: '👺', stats: { hp: 45, maxHp: 45, mp: 0, maxMp: 0, sp: 0, maxSp: 100, for: 8, int: 2, def: 4, mov: 3, vel: 8 }, weapon: WEAPONS.arco, gold: 10 },
  orc: { emoji: '👹', stats: { hp: 80, maxHp: 80, mp: 0, maxMp: 0, sp: 0, maxSp: 100, for: 15, int: 2, def: 8, mov: 2, vel: 6 }, weapon: WEAPONS.espada, gold: 25 },
  elemental: { emoji: '☄️', stats: { hp: 60, maxHp: 60, mp: 50, maxMp: 50, sp: 0, maxSp: 100, for: 5, int: 15, def: 5, mov: 3, vel: 12 }, weapon: WEAPONS.cajado, gold: 30 },
  boss: { emoji: '🐉', stats: { hp: 300, maxHp: 300, mp: 100, maxMp: 100, sp: 0, maxSp: 100, for: 25, int: 20, def: 18, mov: 2, vel: 15 }, weapon: WEAPONS.cajado_anciao, gold: 500 }
};

export const BOSS = {
  id: 'boss', type: 'boss' as EnemyType, x: 21, y: 36, emoji: '🐉', stats: { hp: 300, maxHp: 300, mp: 100, maxMp: 100, sp: 0, maxSp: 100, for: 25, int: 20, def: 18, mov: 2, vel: 15 }, weapon: WEAPONS.cajado_anciao, goldReward: 1000
};
