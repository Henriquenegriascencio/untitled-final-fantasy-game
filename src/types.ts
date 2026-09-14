export type GameState = 'LOADING' | 'START_MENU' | 'CHARACTER_CREATION' | 'STORY_CRAWL' | 'EXPLORATION' | 'COMBAT' | 'SHOP' | 'GAME_OVER' | 'VICTORY' | 'ENCOUNTER_TRANSITION';

export type MapId = 
  | 'OVERWORLD'
  | 'TOWN_CORNELIA' | 'TOWN_PRAVOCA' | 'TOWN_GAIA'
  | 'INTERIOR_CORNELIA_HOUSE' | 'INTERIOR_CORNELIA_SHOP' | 'INTERIOR_CORNELIA_TOOLSMITH' | 'INTERIOR_CORNELIA_INN'
  | 'INTERIOR_PRAVOCA_HOUSE' | 'INTERIOR_PRAVOCA_SHOP' | 'INTERIOR_PRAVOCA_TOOLSMITH' | 'INTERIOR_PRAVOCA_INN'
  | 'INTERIOR_GAIA_HOUSE' | 'INTERIOR_GAIA_SHOP' | 'INTERIOR_GAIA_TOOLSMITH' | 'INTERIOR_GAIA_INN'
  | 'DUNGEON_PRELUDIO_1' | 'DUNGEON_PRELUDIO_2'
  | 'DUNGEON_DESAFIO_1' | 'DUNGEON_DESAFIO_2'
  | 'DUNGEON_TERRA_1' | 'DUNGEON_TERRA_2'
  | 'DUNGEON_FOGO_1' | 'DUNGEON_FOGO_2'
  | 'DUNGEON_AGUA_1' | 'DUNGEON_AGUA_2'
  | 'DUNGEON_AR_1' | 'DUNGEON_AR_2' | 'DUNGEON_AR_3'
  | 'DUNGEON_FINAL_1' | 'DUNGEON_FINAL_2' | 'DUNGEON_FINAL_3'
  | 'DUNGEON_FOGO' | 'DUNGEON_AGUA' | 'DUNGEON_AR' | 'DUNGEON_TERRA';

export type BaseHeroClass = 'Guerreiro' | 'Ladrao' | 'Monge' | 'Mago Branco' | 'Mago Negro' | 'Mago Vermelho';
export type AdvancedHeroClass = 'Cavaleiro' | 'Ninja' | 'Mestre' | 'Mago Branco Superior' | 'Mago Negro Superior' | 'Mago Vermelho Superior';
export type HeroClass = BaseHeroClass | AdvancedHeroClass | 'Cavalheiro' | 'Mago' | 'Alquimista' | 'Arqueiro' | 'Lutador' | 'Inventor';

export type EntityStats = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sp: number; // Special Points
  maxSp: number;
  // Os 7 status canonicos do jogo:
  batPwr: number; // Poder de Batalha
  def: number; // Defesa
  magDef: number; // Defesa Magica
  mBlock: number; // Bloqueio Magico (em porcentagem)
  vel: number; // Velocidade
  vigor: number; // Vigor
  magPwr: number; // Poder de Magia
  mov: number; // Mobilidade no grid
  // Campos legados para compatibilidade:
  for?: number; // Compatibilidade com vigor
  int?: number; // Compatibilidade com magPwr
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

export type EncounterType = 'NORMAL' | 'AMBUSH' | 'PREEMPTIVE';

export type Item = {
  id: string;
  name: string;
  heal: number;
  mpHeal?: number;
  revive?: boolean;
  count: number;
  price: number;
  desc?: string;
};

export type EquipmentSlot = 'rHand' | 'lHand' | 'head' | 'body';

export type EquipmentItem = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  vigor?: number;
  speed?: number;
  stamina?: number;
  magPwr?: number;
  batPwr?: number;
  defense?: number;
  evade?: number;
  magDef?: number;
  mBlock?: number;
  icon?: string;
  desc?: string;
};

export type HeroEquipment = {
  rHand?: EquipmentItem | null;
  lHand?: EquipmentItem | null;
  head?: EquipmentItem | null;
  body?: EquipmentItem | null;
};

export type Hero = {
  id: string;
  name: string;
  secondName?: string;
  heroClass: HeroClass;
  level: number;
  exp: number;
  stats: EntityStats;
  weapon: Weapon;
  equipment?: HeroEquipment;
  emoji: string;
  magics: string[];
  debuffs?: { type: string, duration: number }[];
};

export type Chest = {
  id: string;
  mapId: MapId;
  x: number;
  y: number;
  type: 'item' | 'weapon' | 'gold';
  itemId?: string;
  weaponId?: string;
  gold?: number;
  name: string;
  opened?: boolean;
};

export type CutsceneMessage = {
  speaker: string;
  text: string;
  avatar?: string;
  speakerClass?: HeroClass;
};

export type Cutscene = {
  id: string;
  title?: string;
  messages: CutsceneMessage[];
  onComplete?: () => void;
};

export type Player = {
  x: number;
  y: number;
  party: Hero[];
  artifacts: string[]; // 'Fogo', 'Agua', 'Ar', 'Terra'
  inventory: { items: Item[]; equipment?: EquipmentItem[]; magicTomos?: string[] };
  gold: number;
  openedChests?: string[];
  storyFlags?: Record<string, boolean>;
  weapon?: Weapon; // Safe fallback
};

export type EnemyType = 'slime' | 'goblin' | 'orc' | 'elemental' | 'boss';

export type Enemy = {
  id: string;
  name?: string;
  x: number;
  y: number;
  type: EnemyType;
  stats: EntityStats;
  weapon: Weapon;
  emoji: string;
  goldReward: number;
  expReward?: number;
};

export type CombatUnit = {
  id: string;
  name?: string;
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
  expReward?: number;
  goldReward?: number;
  enemyType?: EnemyType;
};

export type MapTile = '.' | 'M' | '~' | 'W' | 'C' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | 'F' | '<' | '>' | 'X' | 'G' | '@' | 'T' | 'D' | 'S' | 'B' | 'H' | 'P' | 'E' | 'I' | 'N' | 'L'; 
// . = Grass/Path, M = Mountain, ~ = Water, W = Wall, C = City, 0..6 = Dungeons, F = Final Portal, < = Stairs Up / Exit, > = Stairs Down, X = Chest, G = Gate / Guard / Garden, @ = Boss/Artifact, T = Forest / Table, D = Desert, S = Swamp, B = Bridge / Bookshelf, H = House / Hearth, P = Item Shop, E = Equipment/Toolsmith/Forge, I = Inn/Bed, N = NPC, L = Lantern

