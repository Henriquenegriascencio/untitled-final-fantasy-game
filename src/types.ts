export type GameState = 'START_MENU' | 'CHARACTER_CREATION' | 'STORY_CRAWL' | 'EXPLORATION' | 'COMBAT' | 'SHOP' | 'GAME_OVER' | 'VICTORY' | 'ENCOUNTER_TRANSITION';

export type MapId = 'OVERWORLD' | 'DUNGEON_FOGO' | 'DUNGEON_AGUA' | 'DUNGEON_AR' | 'DUNGEON_TERRA';

export type HeroClass = 'Cavalheiro' | 'Mago' | 'Alquimista' | 'Arqueiro' | 'Lutador' | 'Inventor';

export type EntityStats = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sp: number; // Special Points
  maxSp: number;
  for: number; // Forca
  int: number; // Inteligencia
  def: number; // Defesa
  mov: number; // Mobilidade
  vel: number; // Velocidade
};

export type WeaponType = 'espada' | 'arco' | 'cajado' | 'lanca' | 'punho' | 'ferramenta';

export type Weapon = {
  id: string;
  name: string;
  type: WeaponType;
  range: number;
  damage: number;
  aoe?: boolean; // area of effect (for staff)
};

export type Item = {
  id: string;
  name: string;
  heal: number;
  count: number;
  price: number;
};

export type Hero = {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  exp: number;
  stats: EntityStats;
  weapon: Weapon;
  emoji: string;
  magics: string[];
};

export type Player = {
  x: number;
  y: number;
  party: Hero[];
  artifacts: string[]; // 'Fogo', 'Agua', 'Ar', 'Terra'
  inventory: { items: Item[] };
  gold: number;
};

export type EnemyType = 'slime' | 'goblin' | 'orc' | 'elemental' | 'boss';

export type Enemy = {
  id: string;
  x: number;
  y: number;
  type: EnemyType;
  stats: EntityStats;
  weapon: Weapon;
  emoji: string;
  goldReward: number;
};

export type CombatUnit = {
  id: string;
  isPlayer: boolean;
  x: number;
  y: number;
  stats: EntityStats;
  weapon: Weapon;
  emoji: string;
  hasMoved: boolean;
  hasActed: boolean;
  heroClass?: HeroClass;
  level?: number;
  debuffs?: { type: string, duration: number }[];
};

export type MapTile = '.' | 'M' | '~' | 'C' | '1' | '2' | '3' | '4' | 'F' | '<' | '@'; 
// . = Grass/Floor, M = Mountain, ~ = Water, C = City, 1/2/3/4 = Dungeons, F = Final Portal, < = Exit, @ = Artifact
