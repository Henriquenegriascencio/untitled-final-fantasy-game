import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CombatUnit, Weapon, MapId, Item } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { UnitAvatar } from './HeroPortrait';
import { soundFX, bgm } from '../utils/audio';
import { generateCombatTextures } from '../utils/textures';
import { SPELLS_CATALOG, getMagicDotBadge, getSpellByIdOrName, MagicCategory, SpellDefinition } from '../utils/magicData';

type CombatProps = {
  mapId: MapId;
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  inventory?: Item[];
  onVictory: (exp: number, gold: number, drops: string[], finalParty: CombatUnit[], finalInventory: Item[]) => void;
  onDefeat: (finalParty: CombatUnit[], finalInventory: Item[]) => void;
  onEscape?: (finalParty: CombatUnit[], finalInventory: Item[]) => void;
  onUpdateInventory?: (items: Item[]) => void;
};

const GRID_SIZE = 8;

const THEMES: Record<MapId, { bg: string, wrapperBg: string, tileBg: string, tileBorder: string }> = {
  OVERWORLD: { bg: 'bg-green-950', wrapperBg: 'bg-green-900/60', tileBg: 'bg-green-800/80', tileBorder: 'border-green-900/80' },
  DUNGEON_PRELUDIO_1: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' },
  DUNGEON_PRELUDIO_2: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' },
  DUNGEON_DESAFIO_1: { bg: 'bg-indigo-950', wrapperBg: 'bg-indigo-900/60', tileBg: 'bg-slate-800/80', tileBorder: 'border-indigo-950/80' },
  DUNGEON_DESAFIO_2: { bg: 'bg-indigo-950', wrapperBg: 'bg-indigo-900/60', tileBg: 'bg-slate-800/80', tileBorder: 'border-indigo-950/80' },
  TOWN_CORNELIA: { bg: 'bg-emerald-950', wrapperBg: 'bg-emerald-900/60', tileBg: 'bg-emerald-800/80', tileBorder: 'border-emerald-950/80' },
  TOWN_PRAVOCA: { bg: 'bg-teal-950', wrapperBg: 'bg-teal-900/60', tileBg: 'bg-teal-800/80', tileBorder: 'border-teal-950/80' },
  TOWN_GAIA: { bg: 'bg-cyan-950', wrapperBg: 'bg-cyan-900/60', tileBg: 'bg-cyan-800/80', tileBorder: 'border-cyan-950/80' },
  DUNGEON_TERRA_1: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' },
  DUNGEON_TERRA_2: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' },
  DUNGEON_FOGO_1: { bg: 'bg-red-950', wrapperBg: 'bg-red-900/60', tileBg: 'bg-orange-900/80', tileBorder: 'border-orange-950/80' },
  DUNGEON_FOGO_2: { bg: 'bg-red-950', wrapperBg: 'bg-red-900/60', tileBg: 'bg-orange-900/80', tileBorder: 'border-orange-950/80' },
  DUNGEON_AGUA_1: { bg: 'bg-blue-950', wrapperBg: 'bg-blue-900/60', tileBg: 'bg-cyan-900/80', tileBorder: 'border-cyan-950/80' },
  DUNGEON_AGUA_2: { bg: 'bg-blue-950', wrapperBg: 'bg-blue-900/60', tileBg: 'bg-cyan-900/80', tileBorder: 'border-cyan-950/80' },
  DUNGEON_AR_1: { bg: 'bg-slate-900', wrapperBg: 'bg-slate-800/60', tileBg: 'bg-sky-200/80', tileBorder: 'border-white/50' },
  DUNGEON_AR_2: { bg: 'bg-slate-900', wrapperBg: 'bg-slate-800/60', tileBg: 'bg-sky-200/80', tileBorder: 'border-white/50' },
  DUNGEON_AR_3: { bg: 'bg-slate-900', wrapperBg: 'bg-slate-800/60', tileBg: 'bg-sky-200/80', tileBorder: 'border-white/50' },
  DUNGEON_FINAL_1: { bg: 'bg-purple-950', wrapperBg: 'bg-purple-900/60', tileBg: 'bg-purple-900/80', tileBorder: 'border-purple-950/80' },
  DUNGEON_FINAL_2: { bg: 'bg-purple-950', wrapperBg: 'bg-purple-900/60', tileBg: 'bg-purple-900/80', tileBorder: 'border-purple-950/80' },
  DUNGEON_FINAL_3: { bg: 'bg-purple-950', wrapperBg: 'bg-purple-900/60', tileBg: 'bg-purple-900/80', tileBorder: 'border-purple-950/80' },
  DUNGEON_FOGO: { bg: 'bg-red-950', wrapperBg: 'bg-red-900/60', tileBg: 'bg-orange-900/80', tileBorder: 'border-orange-950/80' },
  DUNGEON_AGUA: { bg: 'bg-blue-950', wrapperBg: 'bg-blue-900/60', tileBg: 'bg-cyan-900/80', tileBorder: 'border-cyan-950/80' },
  DUNGEON_AR: { bg: 'bg-slate-900', wrapperBg: 'bg-slate-800/60', tileBg: 'bg-sky-200/80', tileBorder: 'border-white/50' },
  DUNGEON_TERRA: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' },
  INTERIOR_CORNELIA_HOUSE: { bg: 'bg-amber-950', wrapperBg: 'bg-amber-900/60', tileBg: 'bg-amber-800/80', tileBorder: 'border-amber-950/80' },
  INTERIOR_CORNELIA_SHOP: { bg: 'bg-amber-950', wrapperBg: 'bg-amber-900/60', tileBg: 'bg-amber-800/80', tileBorder: 'border-amber-950/80' },
  INTERIOR_CORNELIA_TOOLSMITH: { bg: 'bg-amber-950', wrapperBg: 'bg-amber-900/60', tileBg: 'bg-amber-800/80', tileBorder: 'border-amber-950/80' },
  INTERIOR_CORNELIA_INN: { bg: 'bg-amber-950', wrapperBg: 'bg-amber-900/60', tileBg: 'bg-amber-800/80', tileBorder: 'border-amber-950/80' },
  INTERIOR_PRAVOCA_HOUSE: { bg: 'bg-teal-950', wrapperBg: 'bg-teal-900/60', tileBg: 'bg-teal-800/80', tileBorder: 'border-teal-950/80' },
  INTERIOR_PRAVOCA_SHOP: { bg: 'bg-teal-950', wrapperBg: 'bg-teal-900/60', tileBg: 'bg-teal-800/80', tileBorder: 'border-teal-950/80' },
  INTERIOR_PRAVOCA_TOOLSMITH: { bg: 'bg-teal-950', wrapperBg: 'bg-teal-900/60', tileBg: 'bg-teal-800/80', tileBorder: 'border-teal-950/80' },
  INTERIOR_PRAVOCA_INN: { bg: 'bg-teal-950', wrapperBg: 'bg-teal-900/60', tileBg: 'bg-teal-800/80', tileBorder: 'border-teal-950/80' },
  INTERIOR_GAIA_HOUSE: { bg: 'bg-cyan-950', wrapperBg: 'bg-cyan-900/60', tileBg: 'bg-cyan-800/80', tileBorder: 'border-cyan-950/80' },
  INTERIOR_GAIA_SHOP: { bg: 'bg-cyan-950', wrapperBg: 'bg-cyan-900/60', tileBg: 'bg-cyan-800/80', tileBorder: 'border-cyan-950/80' },
  INTERIOR_GAIA_TOOLSMITH: { bg: 'bg-cyan-950', wrapperBg: 'bg-cyan-900/60', tileBg: 'bg-cyan-800/80', tileBorder: 'border-cyan-950/80' },
  INTERIOR_GAIA_INN: { bg: 'bg-cyan-950', wrapperBg: 'bg-cyan-900/60', tileBg: 'bg-cyan-800/80', tileBorder: 'border-cyan-950/80' }
};

interface CombatSkillDef {
  id: string;
  name: string;
  cost: number;
  minLevel: number;
  desc: string;
}

interface CombatMagicDef {
  id: string;
  name: string;
  category: MagicCategory; // Cura, Ataque, Efeito
  cost: number;
  element?: 'fire' | 'ice' | 'lightning' | 'holy' | 'poison' | 'earth' | 'neutral';
  desc: string;
  targetType?: 'ally' | 'enemy' | 'all_allies' | 'all_enemies';
  power?: number;
}

interface CombatItemDef {
  id: string;
  name: string;
  desc: string;
  type: 'heal_hp' | 'heal_mp' | 'heal_all' | 'cure_debuff';
  value: number;
}

const CLASS_SKILLS_DATA: Record<string, CombatSkillDef[]> = {
  'Guerreiro': [
    { id: 'skill_1', name: 'Golpe Esmagador', cost: 20, minLevel: 1, desc: 'Ataque pesado que causa 1.5x de dano fisico.' },
    { id: 'skill_2', name: 'Escudo Protetor', cost: 50, minLevel: 3, desc: 'Assume postura inabalavel e causa alto dano.' },
    { id: 'skill_3', name: 'Corte Supremo', cost: 100, minLevel: 5, desc: 'Golpe de espada lendario com impacto devastador.' },
  ],
  'Cavaleiro': [
    { id: 'skill_1', name: 'Golpe Real', cost: 20, minLevel: 1, desc: 'Ataque honrado com bonus sagrado de combate.' },
    { id: 'skill_2', name: 'Baluaete Sagrado', cost: 50, minLevel: 3, desc: 'Defesa impenetravel com contra-golpe pesado.' },
    { id: 'skill_3', name: 'Lamina Divina', cost: 100, minLevel: 5, desc: 'Corte da luz sagrada com dano critico maximo.' },
  ],
  'Ladrao': [
    { id: 'skill_1', name: 'Golpe Furtivo', cost: 20, minLevel: 1, desc: 'Ataque rapido que aproveita a agilidade.' },
    { id: 'skill_2', name: 'Passo das Sombras', cost: 50, minLevel: 3, desc: 'Investida celere que perfura a defesa inimiga.' },
    { id: 'skill_3', name: 'Assalto Veloz', cost: 100, minLevel: 5, desc: 'Combo relampago com multiplos golpes criticos.' },
  ],
  'Ninja': [
    { id: 'skill_1', name: 'Shuriken Letal', cost: 20, minLevel: 1, desc: 'Disparo ninja veloz que atinge pontos vitais.' },
    { id: 'skill_2', name: 'Ninjutsu Sombrio', cost: 50, minLevel: 3, desc: 'Golpe das sombras com alto dano de agilidade.' },
    { id: 'skill_3', name: 'Furacao Oculto', cost: 100, minLevel: 5, desc: 'Tecnica secreta ninja de destruicao total.' },
  ],
  'Monge': [
    { id: 'skill_1', name: 'Soco de Ferro', cost: 20, minLevel: 1, desc: 'Impacto fulminante desarmado de alto dano.' },
    { id: 'skill_2', name: 'Chute Voador', cost: 50, minLevel: 3, desc: 'Chute acrobatico marcial que quebra a postura.' },
    { id: 'skill_3', name: 'Explosao de Ki', cost: 100, minLevel: 5, desc: 'Libera toda a energia espiritual em ondas de choque.' },
  ],
  'Mestre': [
    { id: 'skill_1', name: 'Palma do Dragao', cost: 20, minLevel: 1, desc: 'Golpe lendario marcial com energia interior.' },
    { id: 'skill_2', name: 'Combo do Tigre', cost: 50, minLevel: 3, desc: 'Sequencia avassaladora de socos imparaveis.' },
    { id: 'skill_3', name: 'Punho dos Deuses', cost: 100, minLevel: 5, desc: 'O ápice das artes marciais com forca devastadora.' },
  ],
  'Mago Branco': [
    { id: 'skill_1', name: 'Luz Sagrada', cost: 20, minLevel: 1, desc: 'Feixe divino que expurga a escuridao.' },
    { id: 'skill_2', name: 'Prece Curativa', cost: 50, minLevel: 3, desc: 'Bencao sagrada que alivia ferimentos.' },
    { id: 'skill_3', name: 'Julgamento Santo', cost: 100, minLevel: 5, desc: 'Poder sagrado maximo que castiga inimigos.' },
  ],
  'Mago Branco Superior': [
    { id: 'skill_1', name: 'Luz Divina', cost: 20, minLevel: 1, desc: 'Raio de pureza sagrada de altissimo poder.' },
    { id: 'skill_2', name: 'Aura Celestial', cost: 50, minLevel: 3, desc: 'Energia do paraiso que purifica os aliados.' },
    { id: 'skill_3', name: 'Luz Suprema', cost: 100, minLevel: 5, desc: 'Cataclisma sagrado que desintegra as trevas.' },
  ],
  'Mago Negro': [
    { id: 'skill_1', name: 'Estouro Arcano', cost: 20, minLevel: 1, desc: 'Concentra magia destrutiva em um tiro potente.' },
    { id: 'skill_2', name: 'Dreno Caotico', cost: 50, minLevel: 3, desc: 'Drena a essencia magica inimiga.' },
    { id: 'skill_3', name: 'Meteoro Negro', cost: 100, minLevel: 5, desc: 'Chuva de meteoros arcanos de poder calamitoso.' },
  ],
  'Mago Negro Superior': [
    { id: 'skill_1', name: 'Explosao Astral', cost: 20, minLevel: 1, desc: 'Vortex magico concentrado de pura destruicao.' },
    { id: 'skill_2', name: 'Singularidade', cost: 50, minLevel: 3, desc: 'Buraco de gravidade magica com dano massivo.' },
    { id: 'skill_3', name: 'Apocalipse', cost: 100, minLevel: 5, desc: 'O feitiço primordial proibido dos arcanistas.' },
  ],
  'Mago Vermelho': [
    { id: 'skill_1', name: 'Estocada Arcana', cost: 20, minLevel: 1, desc: 'Combina florete e magia em um golpe perfurante.' },
    { id: 'skill_2', name: 'Lamina Elemental', cost: 50, minLevel: 3, desc: 'Encanta a lamina com fogo e gelo simultaneos.' },
    { id: 'skill_3', name: 'Magia Dupla', cost: 100, minLevel: 5, desc: 'Desfere sequencia perfeita fisica e magica.' },
  ],
  'Mago Vermelho Superior': [
    { id: 'skill_1', name: 'Corte Escarlate', cost: 20, minLevel: 1, desc: 'Golpe magistral com esgrima e magia nobres.' },
    { id: 'skill_2', name: 'Fusao Primordial', cost: 50, minLevel: 3, desc: 'Harmonia absoluta entre magias brancas e negras.' },
    { id: 'skill_3', name: 'Mestre Rubro', cost: 100, minLevel: 5, desc: 'Poder supremo do Mago Vermelho lendario.' },
  ],
  'Cavalheiro': [
    { id: 'skill_1', name: 'Golpe Esmagador', cost: 20, minLevel: 1, desc: 'Ataque pesado que causa 1.5x de dano fisico.' },
    { id: 'skill_2', name: 'Defesa Absoluta', cost: 50, minLevel: 3, desc: 'Concede postura inabalavel e causa alto dano.' },
    { id: 'skill_3', name: 'Lamina Sagrada', cost: 100, minLevel: 5, desc: 'Golpe divino sagrado com dano critico supremo.' },
  ],
  'Mago': [
    { id: 'skill_1', name: 'Explosao Arcana', cost: 20, minLevel: 1, desc: 'Concentra energia arcana em um estouro magico.' },
    { id: 'skill_2', name: 'Dreno de Vida', cost: 50, minLevel: 3, desc: 'Drena forca vital do alvo e cura o conjurador.' },
    { id: 'skill_3', name: 'Meteoro', cost: 100, minLevel: 5, desc: 'Evoca chuva de meteoros causando destruicao.' },
  ],
  'Arqueiro': [
    { id: 'skill_1', name: 'Chuva de Flechas', cost: 20, minLevel: 1, desc: 'Saraivada precisa disparada a longa distancia.' },
    { id: 'skill_2', name: 'Flecha Perfurante', cost: 50, minLevel: 3, desc: 'Flecha veloz que ignora parte da defesa.' },
    { id: 'skill_3', name: 'Tiro Fatal', cost: 100, minLevel: 5, desc: 'Disparo no ponto vital com poder devastador.' },
  ],
  'Alquimista': [
    { id: 'skill_1', name: 'Pocao Explosiva', cost: 20, minLevel: 1, desc: 'Frasco volatil que explode no contato.' },
    { id: 'skill_2', name: 'Gas Toxico', cost: 50, minLevel: 3, desc: 'Nuvem quimica venenosa com dano prolongado.' },
    { id: 'skill_3', name: 'Elixir Mistico', cost: 100, minLevel: 5, desc: 'Frasco supremo revigorante com grande efeito.' },
  ],
  'Lutador': [
    { id: 'skill_1', name: 'Soco Furacao', cost: 20, minLevel: 1, desc: 'Sequencia veloz de socos com tremendo impacto.' },
    { id: 'skill_2', name: 'Chute Relampago', cost: 50, minLevel: 3, desc: 'Chute supersonico atordoante de alto dano.' },
    { id: 'skill_3', name: 'Combo Infinito', cost: 100, minLevel: 5, desc: 'Sequencia lendaria de golpes fulminantes.' },
  ],
  'Inventor': [
    { id: 'skill_1', name: 'Raio Laser', cost: 20, minLevel: 1, desc: 'Feixe de energia pura condensada.' },
    { id: 'skill_2', name: 'Torreta Movel', cost: 50, minLevel: 3, desc: 'Disparo perfurante automatizado.' },
    { id: 'skill_3', name: 'Autodestruicao', cost: 100, minLevel: 5, desc: 'Detona ogiva experimental com dano massivo.' },
  ]
};

const COMBAT_MAGICS_DATA: CombatMagicDef[] = [
  // 1. CURA (Ponto Branco: '○') - Magia restauradora e de recuperacao
  { id: 'Cura', name: 'Cura', category: 'Cura', cost: 10, element: 'holy', targetType: 'ally', power: 45, desc: 'Prece sagrada que restaura HP de um aliado.' },
  { id: 'Cura 2', name: 'Cura 2', category: 'Cura', cost: 24, element: 'holy', targetType: 'ally', power: 110, desc: 'Restaura grande quantidade de HP de um aliado.' },
  { id: 'Curaga', name: 'Curaga', category: 'Cura', cost: 48, element: 'holy', targetType: 'all_allies', power: 90, desc: 'Cura benevolente que restaura todo o grupo.' },
  { id: 'Remedio', name: 'Remedio', category: 'Cura', cost: 8, element: 'holy', targetType: 'ally', desc: 'Purifica veneno, congelamento e debuffs do aliado.' },

  // 2. ATAQUE (Ponto Preto: '●') - Magia ofensiva de dano elemental e nao-elemental
  { id: 'Fogo', name: 'Fogo', category: 'Ataque', cost: 10, element: 'fire', targetType: 'enemy', power: 40, desc: 'Chamas ardentes que causam dano de fogo e queimadura.' },
  { id: 'Fogo 2', name: 'Fogo 2', category: 'Ataque', cost: 25, element: 'fire', targetType: 'enemy', power: 95, desc: 'Explosao de chamas intensas de alto dano igneo.' },
  { id: 'Gelo', name: 'Gelo', category: 'Ataque', cost: 10, element: 'ice', targetType: 'enemy', power: 38, desc: 'Estacas pontiagudas de gelo que congelam o alvo.' },
  { id: 'Trovao', name: 'Trovao', category: 'Ataque', cost: 12, element: 'lightning', targetType: 'enemy', power: 45, desc: 'Raio de alta voltagem com impacto eletrico imediato.' },
  { id: 'Cometa', name: 'Cometa', category: 'Ataque', cost: 35, element: 'neutral', targetType: 'enemy', power: 120, desc: 'Impacto astral nao-elemental devastador.' },
  { id: 'Sismo', name: 'Sismo', category: 'Ataque', cost: 28, element: 'earth', targetType: 'enemy', power: 95, desc: 'Terremoto tectonico que abala a terra sob o alvo.' },

  // 3. EFEITO (Ponto Cinza: '•') - Magia de status e suporte
  { id: 'Escudo', name: 'Escudo', category: 'Efeito', cost: 12, targetType: 'ally', desc: 'Cria barreira protetora que eleva a Defesa do aliado.' },
  { id: 'Furia', name: 'Furia', category: 'Efeito', cost: 14, targetType: 'ally', desc: 'Energiza a arma aumentando o Poder de Batalha.' },
  { id: 'Pressa', name: 'Pressa', category: 'Efeito', cost: 16, targetType: 'ally', desc: 'Aumenta a Velocidade e alcance de movimento.' },
  { id: 'Lentidao', name: 'Lentidao', category: 'Efeito', cost: 12, targetType: 'enemy', desc: 'Reduz a Velocidade e movimento do alvo.' },
  { id: 'Sono', name: 'Sono', category: 'Efeito', cost: 15, targetType: 'enemy', desc: 'Mergulha o inimigo em torpor sonolento.' },
  { id: 'Veneno', name: 'Veneno', category: 'Efeito', cost: 8, element: 'poison', targetType: 'enemy', desc: 'Miasma venenoso que drena HP a cada turno.' },
];

const COMBAT_ITEMS_DATA: CombatItemDef[] = [
  { id: 'potion', name: 'Pocao de Cura', desc: 'Restaura 50 HP de um aliado.', type: 'heal_hp', value: 50 },
  { id: 'super_potion', name: 'Super Pocao', desc: 'Restaura 120 HP de um aliado.', type: 'heal_hp', value: 120 },
  { id: 'ether', name: 'Eter', desc: 'Restaura 40 MP de um aliado.', type: 'heal_mp', value: 40 },
  { id: 'antidote', name: 'Antidoto', desc: 'Cura efeitos de veneno e queimadura.', type: 'cure_debuff', value: 0 },
  { id: 'elixir', name: 'Elixir', desc: 'Restaura 100 HP e 50 MP de um aliado.', type: 'heal_all', value: 100 },
];

export type ElementType = 'Fogo' | 'Gelo' | 'Trovao' | 'Veneno';

export interface EnemyWeaknessInfo {
  element: ElementType;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  desc: string;
}

export const getEnemyWeakness = (unit: CombatUnit): EnemyWeaknessInfo => {
  const nameLower = (unit.name || '').toLowerCase();
  const type = unit.enemyType || (nameLower.includes('slime') ? 'slime' : nameLower.includes('goblin') ? 'goblin' : nameLower.includes('orc') ? 'orc' : nameLower.includes('elemental') ? 'elemental' : 'boss');

  if (type === 'slime') {
    return { element: 'Fogo', badgeBg: 'bg-red-950/90', badgeBorder: 'border-red-500', badgeText: 'text-red-300', desc: 'Vulneravel a Chamas' };
  }
  if (type === 'goblin') {
    return { element: 'Trovao', badgeBg: 'bg-amber-950/90', badgeBorder: 'border-amber-500', badgeText: 'text-amber-300', desc: 'Vulneravel a Eletricidade' };
  }
  if (type === 'orc') {
    return { element: 'Veneno', badgeBg: 'bg-emerald-950/90', badgeBorder: 'border-emerald-500', badgeText: 'text-emerald-300', desc: 'Vulneravel a Toxinas' };
  }
  if (type === 'elemental') {
    return { element: 'Gelo', badgeBg: 'bg-cyan-950/90', badgeBorder: 'border-cyan-500', badgeText: 'text-cyan-300', desc: 'Vulneravel ao Congelamento' };
  }
  // boss / default
  return { element: 'Gelo', badgeBg: 'bg-cyan-950/90', badgeBorder: 'border-cyan-500', badgeText: 'text-cyan-300', desc: 'Vulneravel ao Frio Extremo' };
};

export const Combat: React.FC<CombatProps> = ({ mapId, playerUnits, enemyUnits, inventory, onVictory, onDefeat, onEscape, onUpdateInventory }) => {
  const combatTextures = useMemo(() => generateCombatTextures(), []);
  const currentCombatTex = combatTextures[mapId] || combatTextures.OVERWORLD;

  const [units, setUnits] = useState<CombatUnit[]>([]);
  const [elevations, setElevations] = useState<number[][]>([]);
  const [turnQueue, setTurnQueue] = useState<string[]>([]);
  const [sceneryItems, setSceneryItems] = useState<{x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[]>([]);
  const [actionText, setActionText] = useState<{text: string, id: number} | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [isTurnTransitioning, setIsTurnTransitioning] = useState(false);
  const [nextUpcomingUnitId, setNextUpcomingUnitId] = useState<string | null>(null);
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unitsRef = useRef<CombatUnit[]>([]);
  const turnQueueRef = useRef<string[]>([]);
  unitsRef.current = units;
  turnQueueRef.current = turnQueue;

  const [is3D, setIs3D] = useState(true);
  const [rotZ, setRotZ] = useState(35);
  const [rotX, setRotX] = useState(50);
  const [dragTool, setDragTool] = useState<'orbit' | 'pan'>('orbit');
  const [envScenery, setEnvScenery] = useState<{x:number, y:number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[]>([]);

  // Requirement 2: First Combat humorous dialogue with turn-based tips
  const [combatTutorialStep, setCombatTutorialStep] = useState<number | null>(() => {
    try {
      const seen = localStorage.getItem('eldoria_seen_first_combat_dialogue');
      return seen === 'true' ? null : 0;
    } catch {
      return null;
    }
  });

  const tutorialHeroes = playerUnits.length >= 4 ? playerUnits : [
    { name: playerUnits[0]?.name || 'Guerreiro', heroClass: 'Lider' },
    { name: playerUnits[1]?.name || 'Mago', heroClass: 'Mago' },
    { name: playerUnits[2]?.name || 'Arqueiro', heroClass: 'Arqueiro' },
    { name: playerUnits[3]?.name || 'Lutador', heroClass: 'Lutador' }
  ];

  const COMBAT_TUTORIAL_LINES = [
    {
      speaker: tutorialHeroes[0]?.name || 'Lider',
      role: tutorialHeroes[0]?.heroClass || 'Lider',
      text: 'Monstros bloquearam nosso caminho! Empunhem suas armas e preparem-se para a luta!'
    },
    {
      speaker: tutorialHeroes[1]?.name || 'Mago',
      role: tutorialHeroes[1]?.heroClass || 'Mago',
      text: 'Espera ai... por que todo mundo congelou? Por que a gente nao corre e ataca todo mundo de uma vez?'
    },
    {
      speaker: tutorialHeroes[2]?.name || 'Arqueiro',
      role: tutorialHeroes[2]?.heroClass || 'Arqueiro',
      text: 'Sao as leis sagradas do combate por turnos! Voce anda no grid, escolhe Atacar, Tecnica ou Magia, e depois espera pacientemente enquanto o monstro pensa!'
    },
    {
      speaker: tutorialHeroes[3]?.name || 'Lutador',
      role: tutorialHeroes[3]?.heroClass || 'Lutador',
      text: 'Que cavalheirismo absurdo... Entao quem tiver mais Velocidade VEL comeca primeiro?'
    },
    {
      speaker: tutorialHeroes[0]?.name || 'Lider',
      role: tutorialHeroes[0]?.heroClass || 'Lider',
      text: 'Exato! Olhem a ordem na barra superior. E prestem atencao: subir em Terreno Alto em plataformas elevadas reduz em 35 de dano recebido!'
    },
    {
      speaker: tutorialHeroes[1]?.name || 'Mago',
      role: tutorialHeroes[1]?.heroClass || 'Mago',
      text: 'E se a coisa apertar, o comando Fugir esta no menu... sem vergonha, apenas retirada tatica! Vamos a vitoria!'
    }
  ];

  // Camera State: Auto Tracking & Free Camera
  const [isFreeCamera, setIsFreeCamera] = useState(false);
  const [userZoom, setUserZoom] = useState(1);
  const [actionZoomMultiplier, setActionZoomMultiplier] = useState(1);
  const [cameraFocus, setCameraFocus] = useState<{ x: number, y: number }>({ x: 3.5, y: 3.5 });
  const [freeCamOffset, setFreeCamOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isPointerDownRef = useRef(false);
  const dragModeRef = useRef<'pan' | 'orbit'>('pan');
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const handleToggle3D = () => {
    setIs3D(prev => {
      const next = !prev;
      setRotZ(next ? 35 : 0);
      setRotX(next ? 50 : 0);
      return next;
    });
  };

  const setCameraIso = () => {
    setIs3D(true);
    setRotZ(35);
    setRotX(50);
  };
  const setCameraAereo = () => {
    setIs3D(true);
    setRotZ(0);
    setRotX(20);
  };
  const setCameraFront = () => {
    setIs3D(true);
    setRotZ(0);
    setRotX(65);
  };

  useEffect(() => {
    if (combatTutorialStep === null) return;
    const handleTutorialKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (combatTutorialStep < COMBAT_TUTORIAL_LINES.length - 1) {
          setCombatTutorialStep(prev => (prev !== null ? prev + 1 : null));
        } else {
          localStorage.setItem('eldoria_seen_first_combat_dialogue', 'true');
          setCombatTutorialStep(null);
          showActionText('Dica: Suba em Terreno Alto para reduzir 35 de dano!');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        localStorage.setItem('eldoria_seen_first_combat_dialogue', 'true');
        setCombatTutorialStep(null);
        showActionText('Dica: Suba em Terreno Alto para reduzir 35 de dano!');
      }
    };
    window.addEventListener('keydown', handleTutorialKey);
    return () => window.removeEventListener('keydown', handleTutorialKey);
  }, [combatTutorialStep]);
  const [selectedAction, setSelectedAction] = useState<'MOVE' | 'ATTACK' | 'MAGIC' | 'ITEM' | 'SKILL' | null>(null);
  const [actionMenu, setActionMenu] = useState<'MAIN' | 'SKILLS' | 'MAGIC' | 'ITEM'>('MAIN');
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);
  const [isVictoryCelebration, setIsVictoryCelebration] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Item[]>(() => {
    if (inventory && inventory.length > 0) return inventory;
    return [
      { id: 'i1', name: 'Pocao de Cura', price: 20, heal: 50, count: 3, description: 'Restaura 50 HP de um aliado' },
      { id: 'i3', name: 'Eter', price: 50, heal: 0, mpHeal: 40, count: 2, description: 'Restaura 40 MP de um aliado' },
      { id: 'i5', name: 'Antidoto', price: 25, heal: 0, count: 2, description: 'Cura veneno e queimadura' }
    ];
  });

  useEffect(() => {
    if (inventory) {
      setCurrentInventory(inventory);
    }
  }, [inventory]);

  const [visualEffects, setVisualEffects] = useState<{id: number, unitId: string, type: 'attack' | 'hit' | 'heal' | 'magic', value?: string, x: number, y: number, startX?: number, startY?: number, attackKind?: 'melee' | 'ranged' | 'magic', magicKind?: string}[]>([]);
  const [victoryData, setVictoryData] = useState<{ exp: number, gold: number, drops: string[] } | null>(null);

  // Convert grid coordinates (0..7) to screen offset in pixels
  const getCameraOffset = useCallback((gridX: number, gridY: number) => {
    const localX = (gridX - 3.5) * 56;
    const localY = (gridY - 3.5) * 56;

    const rad = (rotZ * Math.PI) / 180;
    const pitchRad = (rotX * Math.PI) / 180;
    const rotGridX = localX * Math.cos(rad) - localY * Math.sin(rad);
    const rotGridY = localX * Math.sin(rad) + localY * Math.cos(rad);

    const screenX = rotGridX;
    const screenY = is3D ? rotGridY * Math.cos(pitchRad) : rotGridY;

    return {
      x: -screenX,
      y: -screenY,
    };
  }, [rotZ, rotX, is3D]);

  const billboardTransform = is3D ? `rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` : 'none';

  const currentAutoOffset = getCameraOffset(cameraFocus.x, cameraFocus.y);
  const cameraX = isFreeCamera ? freeCamOffset.x : currentAutoOffset.x;
  const cameraY = isFreeCamera ? freeCamOffset.y : currentAutoOffset.y;
  const effectiveZoom = Math.min(2.5, Math.max(0.5, userZoom * actionZoomMultiplier));
  const cameraZ = is3D ? Math.min(500, (effectiveZoom - 1) * 550) : 0;
  const cameraScale = is3D ? Math.pow(effectiveZoom, 0.4) : effectiveZoom;

  const focusOnGrid = useCallback((gx: number, gy: number, zoomMult: number = 1) => {
    setCameraFocus({ x: gx, y: gy });
    setActionZoomMultiplier(zoomMult);
    if (isFreeCamera) {
      setFreeCamOffset(getCameraOffset(gx, gy));
    }
  }, [isFreeCamera, getCameraOffset]);

  const focusBetweenUnits = useCallback((x1: number, y1: number, x2: number, y2: number, zoomMult: number = 1.35) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    focusOnGrid(midX, midY, zoomMult);
  }, [focusOnGrid]);

  const resetActionZoom = useCallback(() => {
    setActionZoomMultiplier(1);
  }, []);

  const snapToActiveUnit = useCallback((targetUnit?: CombatUnit) => {
    const u = targetUnit || units.find(unit => unit.id === activeUnitId);
    if (u) {
      setCameraFocus({ x: u.x, y: u.y });
      setFreeCamOffset(getCameraOffset(u.x, u.y));
    }
    setIsFreeCamera(false);
    setActionZoomMultiplier(1);
  }, [units, activeUnitId, getCameraOffset]);

  const nudgeCamera = (dx: number, dy: number) => {
    if (!isFreeCamera) {
      setIsFreeCamera(true);
      setFreeCamOffset({ x: currentAutoOffset.x + dx, y: currentAutoOffset.y + dy });
    } else {
      setFreeCamOffset(prev => ({
        x: Math.max(-600, Math.min(600, prev.x + dx)),
        y: Math.max(-600, Math.min(600, prev.y + dy)),
      }));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      if (e.button === 2 || e.button === 1) {
        // Botao direito ou meio do mouse: MOVER a camera (Pan)
        dragModeRef.current = 'pan';
      } else if (e.button === 0) {
        // Botao esquerdo do mouse: GIRAR a camera 3D (Orbit), ou mover caso esteja em 2D ou selecionou 'pan'
        if (is3D) {
          dragModeRef.current = dragTool === 'pan' ? 'pan' : 'orbit';
        } else {
          dragModeRef.current = 'pan';
        }
      } else {
        return;
      }
    } else {
      // Touch screen: obedece a ferramenta selecionada (Girar ou Mover)
      dragModeRef.current = (is3D && dragTool === 'orbit') ? 'orbit' : 'pan';
    }
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const totalDist = Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y);
    if (totalDist > 4) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDragging(true);
        if (dragModeRef.current === 'pan' && !isFreeCamera) {
          setIsFreeCamera(true);
          setFreeCamOffset(currentAutoOffset);
        }
      }

      if (dragModeRef.current === 'orbit' && is3D) {
        setRotZ(z => Math.round(z + dx * 0.45));
        setRotX(x => Math.max(25, Math.min(75, Math.round(x - dy * 0.3))));
      } else {
        setFreeCamOffset(prev => ({
          x: Math.max(-600, Math.min(600, prev.x + dx / effectiveZoom)),
          y: Math.max(-600, Math.min(600, prev.y + dy / effectiveZoom)),
        }));
      }
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setUserZoom(z => Math.min(2.2, Math.max(0.5, parseFloat((z + delta).toFixed(2)))));
  };

  const theme = THEMES[mapId] || THEMES.OVERWORLD;

  // Initialize Combat
  useEffect(() => {
    const isBossFight = enemyUnits.some(e => 
      e.type === 'boss' || 
      e.id.includes('boss') || 
      (e.name && (
        e.name.toLowerCase().includes('garland') || 
        e.name.toLowerCase().includes('gargula') || 
        e.name.toLowerCase().includes('cavaleiro') || 
        e.name.toLowerCase().includes('lich') || 
        e.name.toLowerCase().includes('marilith') || 
        e.name.toLowerCase().includes('kraken') || 
        e.name.toLowerCase().includes('tiamat') || 
        e.name.toLowerCase().includes('chaos')
      ))
    );

    const newElevations: number[][] = [];

    if (isBossFight) {
      // ARENA PERFEITA DE CHEFE:
      // Grande arena tatica com trono elevado central para o chefe e bastioes taticos elevados para os herois
      for (let y = 0; y < GRID_SIZE; y++) {
        const row: number[] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
          let elev = 0;
          // Trono Central do Chefe (fundo central)
          if ((x === 3 || x === 4) && (y === 1 || y === 2)) {
            elev = 2;
          }
          // Bastioes Taticos Elevados (Terreno Alto para a equipe se posicionar estrategicamente)
          else if ((x === 1 && (y === 1 || y === 2)) || (x === 6 && (y === 1 || y === 2))) {
            elev = 2; // Bastioes avancados noroeste e nordeste
          }
          else if ((x === 1 && (y === 5 || y === 6)) || (x === 6 && (y === 5 || y === 6))) {
            elev = 2; // Bastioes de retaguarda sudoeste e sudeste
          }
          else if ((x === 3 || x === 4) && (y === 0 || y === 3)) {
            elev = 1; // Rampas de acesso ao trono
          }
          else if ((x === 2 || x === 5) && (y === 2 || y === 5)) {
            elev = 1; // Rampas de acesso aos bastioes
          }
          row.push(elev);
        }
        newElevations.push(row);
      }
    } else {
      // Generate terrain elevation: 40% chance of 'zigzag' board layout!
      const boardPatternRoll = Math.random();

      if (boardPatternRoll < 0.40) {
        // ZIGUE-ZAGUE battlefield layout:
        // Alternating elevated ridge platforms that form a winding serpentine zigzag route
        for (let y = 0; y < GRID_SIZE; y++) {
          const row: number[] = [];
          for (let x = 0; x < GRID_SIZE; x++) {
            let elev = 0;
            if (y === 1 && x <= 5) elev = 2;
            else if (y === 3 && x >= 2) elev = 2;
            else if (y === 5 && x <= 5) elev = 2;
            else if (y === 2 && (x === 0 || x === 7)) elev = 1;
            else if (y === 4 && (x === 0 || x === 7)) elev = 1;
            else if ((x === 6 && y === 1) || (x === 1 && y === 3) || (x === 6 && y === 5)) elev = 1;
            row.push(elev);
          }
          newElevations.push(row);
        }
      } else if (boardPatternRoll < 0.70) {
        // Elevated plateau center
        for (let y = 0; y < GRID_SIZE; y++) {
          const row: number[] = [];
          for (let x = 0; x < GRID_SIZE; x++) {
            let elev = 0;
            if (x >= 2 && x <= 5 && y >= 2 && y <= 5) elev = 2;
            else if (x >= 1 && x <= 6 && y >= 1 && y <= 6) elev = 1;
            row.push(elev);
          }
          newElevations.push(row);
        }
      } else {
        // Scattered tactical rocks/hills
        for (let y = 0; y < GRID_SIZE; y++) {
          const row: number[] = [];
          for (let x = 0; x < GRID_SIZE; x++) {
            let elev = 0;
            const r = Math.random();
            if (r > 0.88) elev = 2;
            else if (r > 0.72) elev = 1;
            row.push(elev);
          }
          newElevations.push(row);
        }
      }
    }
    setElevations(newElevations);

    // 1. Calculate max VEL for players and enemies
    const maxPlayerVel = Math.max(...playerUnits.map(p => p.stats.vel));
    const maxEnemyVel = Math.max(...enemyUnits.map(e => e.stats.vel));
    // High ambush chance (~50%) or if enemies are faster
    const isAmbush = maxEnemyVel > maxPlayerVel || Math.random() < 0.45;
    const isPincer = isAmbush && Math.random() < 0.55;

    const occupied = new Set<string>();

    const getFreePosFromCandidates = (candidates: { x: number; y: number }[]) => {
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      for (const pos of shuffled) {
        if (!occupied.has(`${pos.x},${pos.y}`)) {
          occupied.add(`${pos.x},${pos.y}`);
          return pos;
        }
      }
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!occupied.has(`${c},${r}`)) {
            occupied.add(`${c},${r}`);
            return { x: c, y: r };
          }
        }
      }
      return { x: 0, y: 0 };
    };

    let initPlayers: CombatUnit[] = [];
    let initEnemies: CombatUnit[] = [];

    if (isPincer) {
      // EMBOSCADA EM PINCA:
      // Players in center pocket (surrounded)
      const playerCandidates: { x: number; y: number }[] = [
        { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 },
        { x: 2, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 5 }
      ];
      initPlayers = playerUnits.map(p => {
        const pos = getFreePosFromCandidates(playerCandidates);
        return { ...p, ...pos, hasMoved: false, hasActed: false, debuffs: p.debuffs || [] };
      });

      // Enemies split between Left Pincer (cols 0, 1) and Right Pincer (cols 6, 7)
      const leftPincer: { x: number; y: number }[] = [];
      const rightPincer: { x: number; y: number }[] = [];
      for (let r = 1; r < 7; r++) {
        leftPincer.push({ x: 0, y: r }, { x: 1, y: r });
        rightPincer.push({ x: 6, y: r }, { x: 7, y: r });
      }

      initEnemies = enemyUnits.map((e, idx) => {
        const flank = (idx % 2 === 0) ? leftPincer : rightPincer;
        const pos = getFreePosFromCandidates(flank);
        return { ...e, ...pos, hasMoved: false, hasActed: false, debuffs: [] };
      });
    } else if (isAmbush) {
      // Frontal Ambush: Enemies push aggressively close
      const playerCandidates: { x: number; y: number }[] = [];
      for (let r = 3; r < 8; r++) {
        for (let c = 0; c < 3; c++) {
          playerCandidates.push({ x: c, y: r });
        }
      }
      initPlayers = playerUnits.map(p => {
        const pos = getFreePosFromCandidates(playerCandidates);
        return { ...p, ...pos, hasMoved: false, hasActed: false, debuffs: p.debuffs || [] };
      });

      const enemyCandidates: { x: number; y: number }[] = [];
      for (let r = 1; r < 6; r++) {
        for (let c = 3; c < 6; c++) {
          enemyCandidates.push({ x: c, y: r });
        }
      }
      initEnemies = enemyUnits.map(e => {
        const pos = getFreePosFromCandidates(enemyCandidates);
        return { ...e, ...pos, hasMoved: false, hasActed: false, debuffs: [] };
      });
    } else {
      // Standard / Scattered Encounter with randomized distribution
      const playerCandidates: { x: number; y: number }[] = [];
      for (let r = 1; r < 7; r++) {
        for (let c = 0; c < 4; c++) {
          playerCandidates.push({ x: c, y: r });
        }
      }
      initPlayers = playerUnits.map(p => {
        const pos = getFreePosFromCandidates(playerCandidates);
        return { ...p, ...pos, hasMoved: false, hasActed: false, debuffs: p.debuffs || [] };
      });

      const enemyCandidates: { x: number; y: number }[] = [];
      for (let r = 1; r < 7; r++) {
        for (let c = 4; c < 8; c++) {
          enemyCandidates.push({ x: c, y: r });
        }
      }
      initEnemies = enemyUnits.map(e => {
        const pos = getFreePosFromCandidates(enemyCandidates);
        return { ...e, ...pos, hasMoved: false, hasActed: false, debuffs: [] };
      });
    }
    
    const allUnits = [...initPlayers, ...initEnemies];
    unitsRef.current = allUnits;
    
    const sortedQueue = allUnits.sort((a, b) => b.stats.vel - a.stats.vel).map(u => u.id);
    turnQueueRef.current = sortedQueue;
    
    setUnits(allUnits);
    setTurnQueue(sortedQueue);
    setActiveUnitId(sortedQueue[0]);
    if (isPincer) showActionText('EMBOSCADA EM PINCA! Tropa cercada!');
    else if (isAmbush) showActionText('EMBOSCADA! Inimigos atacam!');
    else showActionText('Combate Iniciado!');

    // Generate Scenery
    const sItems: {x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[] = [];
    const defaultProp: 'tree' | 'rock' | 'crystal' | 'spire' = mapId === 'OVERWORLD' ? 'tree' : mapId === 'DUNGEON_FOGO' ? 'spire' : mapId === 'DUNGEON_AGUA' ? 'crystal' : mapId === 'DUNGEON_TERRA' ? 'tree' : 'rock';
    for(let i = -2; i <= GRID_SIZE + 1; i++) {
        for(let j = -2; j <= GRID_SIZE + 1; j++) {
            if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) continue;
            if (Math.random() > 0.8) {
                sItems.push({ x: i, y: j, propType: defaultProp });
            }
        }
    }
    setSceneryItems(sItems);
    
    // Generate environment scenery (outside grid)
    const envItems: {x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[] = [];
    const envProps: ('tree' | 'rock' | 'crystal' | 'spire')[] = mapId === 'DUNGEON_TERRA' ? ['tree', 'rock'] : mapId === 'DUNGEON_FOGO' ? ['rock', 'spire'] : mapId === 'DUNGEON_AGUA' ? ['crystal', 'rock'] : ['tree', 'rock'];
    for(let i = 0; i < 40; i++) {
        let ex = Math.floor(Math.random() * 20) - 6;
        let ey = Math.floor(Math.random() * 20) - 6;
        if (ex >= -1 && ex <= GRID_SIZE && ey >= -1 && ey <= GRID_SIZE) continue; // Keep area around board clear
        envItems.push({ x: ex, y: ey, propType: envProps[Math.floor(Math.random() * envProps.length)] });
    }
    setEnvScenery(envItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
      }
    };
  }, []);

  const showActionText = (msg: string) => {
    const id = Date.now();
    setActionText({ text: msg, id });
    setTimeout(() => setActionText(prev => prev?.id === id ? null : prev), 4500);
  };

  const activeUnit = units.find(u => u.id === activeUnitId);
  const nextUpcomingUnit = units.find(u => u.id === nextUpcomingUnitId);

  const checkWinCondition = (currentUnits: CombatUnit[]) => {
     const aliveEnemies = currentUnits.filter(u => !u.isPlayer && u.stats.hp > 0);
     const alivePlayers = currentUnits.filter(u => u.isPlayer && u.stats.hp > 0);
     
     if (alivePlayers.length === 0) {
        setTimeout(() => {
          onDefeat(unitsRef.current.filter(u => u.isPlayer), currentInventory);
        }, 1200);
        return true;
     } else if (aliveEnemies.length === 0) {
        setIsVictoryCelebration(true);
        bgm.playVictory();
        showActionText('Vitoria!');
        setTimeout(() => {
          const totalExp = enemyUnits.reduce((sum, e) => sum + (e.expReward || 50), 0);
          const totalGold = enemyUnits.reduce((sum, e) => sum + (e.goldReward || 40), 0);
          const drops: string[] = [];
          if (Math.random() > 0.4) drops.push('Pocao de Cura');
          if (Math.random() > 0.7) drops.push('Eter');
          if (Math.random() > 0.9) drops.push('Elixir');
          
          setVictoryData({ exp: totalExp, gold: totalGold, drops });
        }, 1200);
        return true;
     }
     return false;
  };

  const getNextAliveUnit = (queue: string[], currentUnits: CombatUnit[], currentActiveId: string): CombatUnit | null => {
    if (queue.length === 0) return null;
    const currentIndex = queue.indexOf(currentActiveId);
    const startIdx = currentIndex >= 0 ? currentIndex : 0;
    for (let i = 1; i <= queue.length; i++) {
      const idx = (startIdx + i) % queue.length;
      const candidateId = queue[idx];
      const unit = currentUnits.find(u => u.id === candidateId && u.stats.hp > 0);
      if (unit) return unit;
    }
    return null;
  };

  const nextTurn = () => {
    if (isTurnTransitioning || combatTutorialStep !== null) return;

    setSelectedAction(null);
    setActionMenu('MAIN');
    setSelectedSubItem(null);
    setIsActionBusy(false);
    resetActionZoom();

    const currentQueue = turnQueueRef.current.length > 0 ? turnQueueRef.current : turnQueue;
    const currentUnits = unitsRef.current.length > 0 ? unitsRef.current : units;

    // Check if combat is already concluded
    const aliveEnemies = currentUnits.filter(u => !u.isPlayer && u.stats.hp > 0);
    const alivePlayers = currentUnits.filter(u => u.isPlayer && u.stats.hp > 0);
    if (aliveEnemies.length === 0 || alivePlayers.length === 0) {
      checkWinCondition(currentUnits);
      return;
    }

    // Calculate next alive unit to act
    const nextUnit = getNextAliveUnit(currentQueue, currentUnits, activeUnitId);
    if (!nextUnit) {
      checkWinCondition(currentUnits);
      return;
    }

    // 1.6-second transition interval and highlight next unit
    setIsTurnTransitioning(true);
    setNextUpcomingUnitId(nextUnit.id);
    showActionText(`Turno de ${nextUnit.name || 'Combatente'}!`);

    if (!isFreeCamera) {
      focusOnGrid(nextUnit.x, nextUnit.y, 1.05);
    }

    if (turnTimeoutRef.current) {
      clearTimeout(turnTimeoutRef.current);
    }

    turnTimeoutRef.current = setTimeout(() => {
      setUnits(prev => prev.map(u => {
        if (u.id === activeUnitId) {
          return { ...u, hasMoved: false, hasActed: false };
        }
        return u;
      }));

      setTurnQueue(prev => {
        const idx = prev.indexOf(nextUnit.id);
        if (idx === -1) return prev;
        return [...prev.slice(idx), ...prev.slice(0, idx)];
      });

      setActiveUnitId(nextUnit.id);
      setNextUpcomingUnitId(null);
      setIsTurnTransitioning(false);

      if (!isFreeCamera) {
        focusOnGrid(nextUnit.x, nextUnit.y, 1.05);
      }
    }, 1600);
  };

  const handleEscape = () => {
    if (isActionBusy || isTurnTransitioning || combatTutorialStep !== null) return;
    soundFX.playSelect();
    const isBossFight = enemyUnits.some(e => e.id === 'boss' || e.type === 'boss' || (e.name && e.name.toLowerCase().includes('chefe')));
    if (isBossFight) {
      soundFX.playCancel();
      showActionText('Nao e possivel fugir de uma batalha contra Chefe!');
      return;
    }

    // FF1/FF6 Authentic Escape calculation: Ladrao / Ninja have highest escape rate
    const hasThief = units.some(u => u.isPlayer && u.stats.hp > 0 && (u.heroClass === 'Ladrao' || u.heroClass === 'Ninja' || u.heroClass === 'Arqueiro'));
    const activeIsThief = activeUnit?.heroClass === 'Ladrao' || activeUnit?.heroClass === 'Ninja';
    const vel = activeUnit?.stats.vel || 10;
    
    let escapeChance = 0.55;
    if (hasThief) escapeChance += 0.30;
    if (activeIsThief) escapeChance += 0.15;
    if (vel > 15) escapeChance += 0.10;

    const roll = Math.random();
    if (roll < escapeChance) {
      setIsActionBusy(true);
      showActionText('A equipe fugiu da batalha com sucesso!');
      soundFX.playCursor();
      setTimeout(() => {
        setIsActionBusy(false);
        const updatedParty = unitsRef.current.filter(u => u.isPlayer);
        if (onEscape) {
          onEscape(updatedParty, currentInventory);
        } else {
          onDefeat(updatedParty, currentInventory);
        }
      }, 1000);
    } else {
      setIsActionBusy(true);
      showActionText('Tentativa de fuga falhou!');
      soundFX.playCancel();
      setTimeout(() => {
        setIsActionBusy(false);
        nextTurn();
      }, 1200);
    }
  };

  // Process debuffs on turn start and guard against softlocks when units die from debuffs
  useEffect(() => {
    if (!activeUnitId) return;

    let unitDied = false;
    let updatedSnapshot: CombatUnit[] = [];

    setUnits(prev => {
      let changed = false;
      const next = prev.map(u => {
        if (u.id === activeUnitId && u.debuffs && u.debuffs.length > 0 && u.stats.hp > 0) {
          changed = true;
          let newHp = u.stats.hp;
          let remainingDebuffs = [];
          for (const d of u.debuffs) {
            if (d.type === 'burn') {
               newHp -= 10;
               showActionText(`${u.name || 'Combatente'} sofreu 10 de dano por Queimadura!`);
               const effId = Date.now() + Math.floor(Math.random() * 50);
               setVisualEffects(v => [...v, { id: effId, unitId: u.id, type: 'hit', value: '-10 FOGO', x: u.x, y: u.y }]);
               setTimeout(() => setVisualEffects(v => v.filter(item => item.id !== effId)), 1000);
            } else if (d.type === 'poison') {
               newHp -= 5;
               showActionText(`${u.name || 'Combatente'} sofreu 5 de dano por Veneno!`);
               const effId = Date.now() + Math.floor(Math.random() * 50);
               setVisualEffects(v => [...v, { id: effId, unitId: u.id, type: 'hit', value: '-5 VENENO', x: u.x, y: u.y }]);
               setTimeout(() => setVisualEffects(v => v.filter(item => item.id !== effId)), 1000);
            }
            if (d.duration > 1) {
               remainingDebuffs.push({ ...d, duration: d.duration - 1 });
            }
          }
          newHp = Math.max(0, newHp);
          if (newHp <= 0) {
            unitDied = true;
          }
          return { ...u, stats: { ...u.stats, hp: newHp }, debuffs: remainingDebuffs };
        }
        return u;
      });
      updatedSnapshot = changed ? next : prev;
      return changed ? next : prev;
    });

    if (unitDied) {
      const deadUnit = units.find(u => u.id === activeUnitId);
      showActionText(`${deadUnit?.name || 'Unidade'} sucumbiu ao debuff!`);
      const isOver = checkWinCondition(updatedSnapshot);
      if (!isOver) {
        setTimeout(() => {
          nextTurn();
        }, 1400);
      }
    }
  }, [activeUnitId]);

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
  };

  const handleUseItem = (item: Item) => {
    if (isActionBusy || combatTutorialStep !== null || activeUnit?.hasActed || !activeUnit) return;
    if (!item || (item.count || 0) <= 0) {
      soundFX.playCancel();
      showActionText('Item esgotado!');
      return;
    }

    const playerAllies = units.filter(u => u.isPlayer);
    const deadAllies = playerAllies.filter(u => u.stats.hp <= 0);
    const aliveAllies = playerAllies.filter(u => u.stats.hp > 0);

    let target: CombatUnit | undefined = activeUnit;

    if (item.revive) {
      if (deadAllies.length === 0) {
        soundFX.playCancel();
        showActionText('Nenhum aliado derrotado!');
        return;
      }
      target = deadAllies[0];
    } else {
      if (aliveAllies.length === 0) return;
      if (item.heal && item.heal > 0) {
        const sorted = [...aliveAllies].sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp));
        target = sorted[0];
      } else if (item.mpHeal && item.mpHeal > 0) {
        const sorted = [...aliveAllies].sort((a, b) => (a.stats.mp / a.stats.maxMp) - (b.stats.mp / b.stats.maxMp));
        target = sorted[0];
      } else if (item.id === 'i5' || item.name.toLowerCase().includes('antidoto')) {
        const withDebuff = aliveAllies.find(u => (u.debuffs || []).length > 0);
        target = withDebuff || activeUnit;
      }
    }

    if (!target) return;

    soundFX.playHeal();
    setIsActionBusy(true);
    setActionMenu('MAIN');
    setSelectedAction(null);

    if (!isFreeCamera) {
      focusOnGrid(target.x, target.y, 1.35);
    }
    showActionText(`${activeUnit.name || 'Heroi'} usou ${item.name}!`);

    const updatedInv = currentInventory
      .map(it => it.id === item.id ? { ...it, count: it.count - 1 } : it)
      .filter(it => it.count > 0);
    setCurrentInventory(updatedInv);
    if (onUpdateInventory) {
      onUpdateInventory(updatedInv);
    }

    setTimeout(() => {
      let popupVal = `+${item.heal || 50}`;
      const nextUnits = units.map(u => {
        if (u.id === target!.id) {
          let newHp = u.stats.hp;
          let newMp = u.stats.mp;
          let newDebuffs = u.debuffs || [];
          if (item.revive) {
            newHp = Math.min(u.stats.maxHp, item.heal || 100);
            newDebuffs = [];
            popupVal = `REVIVEU +${newHp}`;
          } else if (item.heal && item.mpHeal) {
            newHp = Math.min(u.stats.maxHp, u.stats.hp + item.heal);
            newMp = Math.min(u.stats.maxMp, u.stats.mp + item.mpHeal);
            popupVal = `+${item.heal} HP/MP`;
          } else if (item.heal) {
            newHp = Math.min(u.stats.maxHp, u.stats.hp + item.heal);
            popupVal = `+${item.heal} HP`;
          } else if (item.mpHeal) {
            newMp = Math.min(u.stats.maxMp, u.stats.mp + item.mpHeal);
            popupVal = `+${item.mpHeal} MP`;
          } else if (item.id === 'i5' || item.name.toLowerCase().includes('antidoto')) {
            newDebuffs = [];
            newHp = Math.min(u.stats.maxHp, u.stats.hp + 30);
            popupVal = 'CURADO';
          }
          return { ...u, stats: { ...u.stats, hp: newHp, mp: newMp }, debuffs: newDebuffs };
        }
        if (u.id === activeUnit.id) {
          return { ...u, hasActed: true };
        }
        return u;
      });

      setUnits(nextUnits);
      unitsRef.current = nextUnits;
      const effId = Date.now();
      setVisualEffects(prev => [
        ...prev,
        { id: effId, unitId: target!.id, type: 'heal', value: popupVal, x: target!.x, y: target!.y }
      ]);
      showActionText(`${target!.name || 'Heroi'} recuperou com ${item.name}!`);

      setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1200);

      setTimeout(() => {
        setIsActionBusy(false);
        resetActionZoom();
        nextTurn();
      }, 2000);
    }, 400);
  };

  const handleCellClick = (x: number, y: number) => {
    if (combatTutorialStep !== null || hasDraggedRef.current || isDragging) return;
    if (isTurnTransitioning || isActionBusy || !activeUnit || !activeUnit.isPlayer) return;

    if (selectedAction === 'MOVE' && !activeUnit.hasMoved) {
      const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
      if (dist > 0 && dist <= activeUnit.stats.mov) {
        if (units.some(u => u.x === x && u.y === y && u.stats.hp > 0)) {
          soundFX.playCancel();
          showActionText('Celula ocupada!');
          return;
        }
        soundFX.playCursor();
        setIsActionBusy(true);
        setSelectedAction(null);

        // Camera smoothly follows movement to destination
        if (!isFreeCamera) {
          focusOnGrid(x, y, 1.1);
        }

        setUnits(prev => {
          const updated = prev.map(u => u.id === activeUnit.id ? { ...u, x, y, hasMoved: true } : u);
          unitsRef.current = updated;
          return updated;
        });
        showActionText(`${activeUnit.name || 'Heroi'} moveu-se no campo.`);
        
        // Generous interval after move so player sees the movement and reads log
        setTimeout(() => {
          setIsActionBusy(false);
        }, 1200);
      } else {
        soundFX.playCancel();
      }
    } 
    else if (selectedAction === 'ATTACK' && !activeUnit.hasActed) {
      const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
      if (target) {
        const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
        if (dist <= activeUnit.weapon.range) {
          setIsActionBusy(true);
          setSelectedAction(null);
          soundFX.playAttack();

          // 1. Camera focuses & zooms in on confrontation
          if (!isFreeCamera) {
            focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.35);
          }

          // 2. Anticipation delay
          setTimeout(() => {
            const targetElev = elevations[target.y]?.[target.x] || 0;
            const attackerElev = elevations[activeUnit.y]?.[activeUnit.x] || 0;
            const isHighGround = targetElev > attackerElev && targetElev > 0;

            const atkPwr = (activeUnit.stats.batPwr || activeUnit.stats.vigor || activeUnit.stats.for || 16) + (activeUnit.weapon?.damage || 0);
            const targetDef = target.stats.def || 10;
            const rawDamage = Math.max(1, atkPwr - targetDef);
            const damage = isHighGround ? Math.max(1, Math.round(rawDamage * 0.65)) : rawDamage;
            soundFX.playHit();
            
            const nextUnits = units.map(u => {
              if (u.id === target.id) {
                 const newHp = Math.max(0, u.stats.hp - damage);
                 return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
              }
              if (u.id === activeUnit.id) {
                 return { ...u, hasActed: true, stats: { ...u.stats, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
              }
              return u;
            });
            unitsRef.current = nextUnits;
            
            const effId = Date.now();
            const attKind: 'melee' | 'ranged' | 'magic' = activeUnit.weapon?.type === 'ranged' ? 'ranged' : activeUnit.weapon?.type === 'magic' ? 'magic' : 'melee';
            setVisualEffects(prev => [
              ...prev, 
              { id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y }, 
              { id: effId + 1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, attackKind: attKind, x: target.x, y: target.y }
            ]);
            setUnits(nextUnits);
            if (isHighGround) {
              showActionText(`${activeUnit.name || 'Heroi'} atacou ${target.name || 'Inimigo'} causando ${damage} de dano - Terreno Alto: -35 de dano`);
            } else {
              showActionText(`${activeUnit.name || 'Heroi'} atacou ${target.name || 'Inimigo'} causando ${damage} de dano!`);
            }

            setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1200);

            // 3. Generous interval (2200ms) so player clearly sees the hit, damage numbers and reads the log
            setTimeout(() => {
              setIsActionBusy(false);
              resetActionZoom();
              if (!checkWinCondition(nextUnits)) {
                nextTurn();
              }
            }, 2200);
          }, 450);
        }
      }
    }
    else if (selectedAction === 'MAGIC' && !activeUnit.hasActed) {
      const spellDef = COMBAT_MAGICS_DATA.find(m => m.name === selectedSubItem) || COMBAT_MAGICS_DATA[0];
      const spellCategory = spellDef.category;
      const spellCost = spellDef.cost;

      if (activeUnit.stats.mp < spellCost) {
        soundFX.playCancel();
        showActionText(`MP Insuficiente para ${spellDef.name}! Requer ${spellCost} MP`);
        return;
      }

      // 1. MAGIAS DE CURA (Restauracao, ponto branco) ou EFEITO DE SUPORTE EM ALIADOS
      if (spellCategory === 'Cura' || (spellCategory === 'Efeito' && (spellDef.targetType === 'ally' || spellDef.targetType === 'all_allies'))) {
        const allyTarget = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && u.isPlayer);
        if (allyTarget) {
          const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
          if (dist <= 3) {
            setIsActionBusy(true);
            setSelectedAction(null);
            soundFX.playHeal();
            if (!isFreeCamera) {
              focusBetweenUnits(activeUnit.x, activeUnit.y, allyTarget.x, allyTarget.y, 1.4);
            }
            showActionText(`Conjurando ${spellDef.name} em ${allyTarget.name || 'Heroi'}...`);

            setTimeout(() => {
              const magPwr = activeUnit.stats.magPwr || activeUnit.stats.int || 15;
              let healAmount = Math.max(35, (magPwr * 2) + (spellDef.power || 30));
              let effectMsg = `${allyTarget.name || 'Heroi'} recuperou ${healAmount} HP!`;

              const nextUnits = units.map(u => {
                if (u.id === allyTarget.id) {
                  let newHp = Math.min(u.stats.maxHp, u.stats.hp + healAmount);
                  let newStats = { ...u.stats };
                  let debuffs = u.debuffs || [];

                  if (spellDef.id === 'Remedio') {
                    debuffs = [];
                    newHp = Math.min(u.stats.maxHp, u.stats.hp + 20);
                    effectMsg = `${allyTarget.name || 'Heroi'} foi purificado de todos os efeitos negativos!`;
                  } else if (spellDef.id === 'Escudo') {
                    newStats.def = (newStats.def || 10) + 12;
                    effectMsg = `Escudo ativado! Defesa de ${allyTarget.name} aumentada em 12!`;
                  } else if (spellDef.id === 'Furia') {
                    newStats.batPwr = (newStats.batPwr || 20) + 10;
                    effectMsg = `Furia ativada! Poder de Batalha de ${allyTarget.name} aumentado em 10!`;
                  } else if (spellDef.id === 'Pressa') {
                    newStats.vel = (newStats.vel || 10) + 6;
                    newStats.mov = (newStats.mov || 3) + 1;
                    effectMsg = `Pressa ativada! Velocidade e Movimento de ${allyTarget.name} aumentados!`;
                  }

                  return { ...u, debuffs, stats: { ...newStats, hp: newHp } };
                }
                if (u.id === activeUnit.id) {
                  return { ...u, hasActed: true, stats: { ...u.stats, mp: u.stats.mp - spellCost } };
                }
                return u;
              });

              const effId = Date.now();
              setVisualEffects(prev => [
                ...prev,
                { id: effId, unitId: allyTarget.id, type: 'heal', value: spellCategory === 'Cura' ? `+${healAmount}` : 'BUFF!', x: allyTarget.x, y: allyTarget.y }
              ]);
              setUnits(nextUnits);
              showActionText(effectMsg);
              setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1200);
              setTimeout(() => {
                setIsActionBusy(false);
                resetActionZoom();
                nextTurn();
              }, 2200);
            }, 450);
            return;
          } else {
            showActionText(`Fora de alcance de ${spellDef.name}.`);
            return;
          }
        }
      }

      // 2. MAGIAS DE ATAQUE (Dano ofensivo, ponto preto) e EFEITOS EM INIMIGOS (Status/Debuff, ponto cinza)
      const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
      if (target) {
        const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
        if (dist <= 3) {
          setIsActionBusy(true);
          setSelectedAction(null);
          soundFX.playMagic();

          if (!isFreeCamera) {
            focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.4);
          }
          showActionText(`Conjurando ${spellDef.name} em ${target.name}...`);

          setTimeout(() => {
            const weaknessInfo = getEnemyWeakness(target);
            const isWeaknessHit = weaknessInfo && spellDef.element && (
              (spellDef.name.includes('Fogo') && weaknessInfo.element === 'Fogo') ||
              (spellDef.name.includes('Gelo') && weaknessInfo.element === 'Gelo') ||
              (spellDef.name.includes('Trovao') && weaknessInfo.element === 'Trovao') ||
              (spellDef.name.includes('Veneno') && weaknessInfo.element === 'Veneno')
            );

            const targetElev = elevations[target.y]?.[target.x] || 0;
            const attackerElev = elevations[activeUnit.y]?.[activeUnit.x] || 0;
            const isHighGround = targetElev > attackerElev && targetElev > 0;

            const isBlocked = (target.stats.mBlock || 0) > 0 && Math.random() * 100 < (target.stats.mBlock || 0);
            const magPwr = activeUnit.stats.magPwr || activeUnit.stats.int || 15;
            const targetMagDef = target.stats.magDef || target.stats.def || 10;
            const spellPowerBonus = spellDef.power || 30;
            const baseDamage = ((magPwr * 2) + spellPowerBonus) - targetMagDef;
            let rawDamage = Math.max(1, Math.round(isWeaknessHit ? baseDamage * 1.5 : baseDamage));
            if (isBlocked) {
              rawDamage = Math.max(1, Math.round(rawDamage * 0.4));
            }
            const damage = isHighGround ? Math.max(1, Math.round(rawDamage * 0.65)) : rawDamage;
            soundFX.playHit();

            const nextUnits = units.map(u => {
              if (u.id === target.id) {
                const newHp = Math.max(0, u.stats.hp - damage);
                let debuffs = u.debuffs || [];
                let stats = { ...u.stats };

                if (spellDef.name.includes('Fogo')) debuffs = [...debuffs.filter(d=>d.type!=='burn'), {type: 'burn', duration: 3}];
                if (spellDef.name.includes('Veneno')) debuffs = [...debuffs.filter(d=>d.type!=='poison'), {type: 'poison', duration: 3}];
                if (spellDef.name.includes('Gelo')) debuffs = [...debuffs.filter(d=>d.type!=='freeze'), {type: 'freeze', duration: 2}];
                if (spellDef.id === 'Lentidao') {
                  stats.vel = Math.max(2, (stats.vel || 10) - 5);
                  stats.mov = Math.max(1, (stats.mov || 3) - 1);
                }
                if (spellDef.id === 'Sono') {
                  debuffs = [...debuffs.filter(d=>d.type!=='sleep'), {type: 'sleep', duration: 2}];
                }

                return { ...u, debuffs, stats: { ...stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
              }
              if (u.id === activeUnit.id) {
                return { ...u, hasActed: true, stats: { ...u.stats, mp: u.stats.mp - spellCost, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
              }
              return u;
            });
            unitsRef.current = nextUnits;

            const effId = Date.now();
            setVisualEffects(prev => [
              ...prev, 
              { id: effId, unitId: target.id, type: 'hit', value: isBlocked ? `-${damage} BLOQ!` : isWeaknessHit ? `-${damage} FRAQ!` : `-${damage}`, x: target.x, y: target.y }, 
              { id: effId + 1, unitId: target.id, type: 'magic', x: target.x, y: target.y, magicKind: spellDef.name }
            ]);
            setUnits(nextUnits);
            if (isBlocked) {
              showActionText(`${target.name || 'Alvo'} ativou Bloqueio Magico! ${damage} de dano!`);
            } else if (isWeaknessHit) {
              showActionText(`${spellDef.name} acertou a FRAQUEZA! ${damage} de dano!`);
            } else {
              showActionText(`${spellDef.name} causou ${damage} de dano!`);
            }

            setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1200);

            setTimeout(() => {
              setIsActionBusy(false);
              resetActionZoom();
              if (!checkWinCondition(nextUnits)) {
                nextTurn();
              }
            }, 2200);
          }, 450);
        } else {
          showActionText('Fora de alcance.');
        }
      }
    }
    else if (selectedAction === 'SKILL' && !activeUnit.hasActed) {
      let spCost = 20;
      if (selectedSubItem === 'skill_2') spCost = 50;
      if (selectedSubItem === 'skill_3') spCost = 100;

      if ((activeUnit.stats.sp || 0) >= spCost) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            const skillRange = activeUnit.heroClass === 'Arqueiro' ? 3 : (activeUnit.weapon?.range || 1);
            const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
            if (dist > skillRange) {
              soundFX.playCancel();
              showActionText('Alvo fora do alcance da tecnica.');
              return;
            }

            setIsActionBusy(true);
            setSelectedAction(null);

            if (!isFreeCamera) {
              focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.45);
            }
            showActionText(`Executando Tecnica Especial!`);
            soundFX.playAttack();

            setTimeout(() => {
              let damage = 0;
              let logMsg = '';
              
              let mult = 1;
              if (spCost === 50) mult = 2.5;
              if (spCost === 100) mult = 5;

              const targetElev = elevations[target.y]?.[target.x] || 0;
              const attackerElev = elevations[activeUnit.y]?.[activeUnit.x] || 0;
              const isHighGround = targetElev > attackerElev && targetElev > 0;

              const cls = activeUnit.heroClass || 'Guerreiro';
              if (cls === 'Guerreiro' || cls === 'Cavalheiro') { damage = ((activeUnit.stats.batPwr || activeUnit.stats.vigor || 26) * 2.6 * mult) - (target.stats.def || 10); logMsg = 'Golpe Esmagador'; }
              else if (cls === 'Cavaleiro') { damage = ((activeUnit.stats.batPwr || activeUnit.stats.vigor || 30) * 3.2 * mult) - (target.stats.def || 10); logMsg = 'Lamina Divina'; }
              else if (cls === 'Ladrao') { damage = (((activeUnit.stats.batPwr || 20) * 1.5 + (activeUnit.stats.vel || 18) * 1.5) * mult) - (target.stats.def || 10); logMsg = 'Golpe Furtivo'; }
              else if (cls === 'Ninja' || cls === 'Arqueiro') { damage = (((activeUnit.stats.batPwr || 24) * 1.8 + (activeUnit.stats.vel || 22) * 1.8) * mult) - (target.stats.def || 10); logMsg = 'Shuriken Letal'; }
              else if (cls === 'Monge' || cls === 'Lutador') { damage = ((activeUnit.stats.vigor || activeUnit.stats.batPwr || 26) * 3 * mult) - (target.stats.def || 10); logMsg = 'Soco de Ferro'; }
              else if (cls === 'Mestre') { damage = ((activeUnit.stats.vigor || activeUnit.stats.batPwr || 32) * 3.8 * mult) - (target.stats.def || 10); logMsg = 'Punho dos Deuses'; }
              else if (cls === 'Mago Branco') { damage = ((activeUnit.stats.magPwr || 24) * 2.5 * mult) - (target.stats.magDef || target.stats.def || 10); logMsg = 'Luz Sagrada'; }
              else if (cls === 'Mago Branco Superior') { damage = ((activeUnit.stats.magPwr || 30) * 3.2 * mult) - (target.stats.magDef || target.stats.def || 10); logMsg = 'Luz Suprema'; }
              else if (cls === 'Mago Negro' || cls === 'Mago') { damage = ((activeUnit.stats.magPwr || 28) * 3.2 * mult) - (target.stats.magDef || target.stats.def || 10); logMsg = 'Estouro Arcano'; }
              else if (cls === 'Mago Negro Superior') { damage = ((activeUnit.stats.magPwr || 36) * 4.2 * mult) - (target.stats.magDef || target.stats.def || 10); logMsg = 'Apocalipse'; }
              else if (cls === 'Mago Vermelho') { damage = (((activeUnit.stats.batPwr || 20) * 1.4 + (activeUnit.stats.magPwr || 20) * 1.6) * mult) - (target.stats.def || 10); logMsg = 'Estocada Arcana'; }
              else if (cls === 'Mago Vermelho Superior') { damage = (((activeUnit.stats.batPwr || 26) * 1.8 + (activeUnit.stats.magPwr || 26) * 2.0) * mult) - (target.stats.def || 10); logMsg = 'Mestre Rubro'; }
              else { damage = ((activeUnit.stats.batPwr || 20) * 2.2 * mult) - (target.stats.def || 10); logMsg = 'Ataque Especial'; }
              
              if (isHighGround) {
                damage = Math.max(1, Math.floor(damage * 0.65));
              } else {
                damage = Math.max(1, Math.floor(damage));
              }
              soundFX.playHit();

              const nextUnits = units.map(u => {
                if (u.id === target.id) {
                   const newHp = Math.max(0, u.stats.hp - damage);
                   return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                }
                if (u.id === activeUnit.id) {
                   return { ...u, hasActed: true, stats: { ...u.stats, sp: (u.stats.sp || 0) - spCost } };
                }
                return u;
              });
              
              const effId = Date.now();
              setVisualEffects(prev => [
                ...prev, 
                { id: effId, unitId: target.id, type: 'hit', value: `-${damage}!`, x: target.x, y: target.y }, 
                { id: effId + 1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, attackKind: 'magic' }
              ]);
              setUnits(nextUnits);
              showActionText(`${logMsg} causou ${damage} de dano CRITICO!`);

              setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1200);

              // Generous interval for reading skill damage and log
              setTimeout(() => {
                setIsActionBusy(false);
                resetActionZoom();
                if (!checkWinCondition(nextUnits)) {
                   nextTurn();
                }
              }, 2200);
            }, 450);
        }
      } else {
         showActionText('SP Insuficiente.');
      }
    }
  };

  // AI Turn Implementation with camera follow, zoom in on attack, and pacing delays
  useEffect(() => {
    if (combatTutorialStep === null && !isTurnTransitioning && activeUnit && !activeUnit.isPlayer) {
       // Safety: if enemy is dead, immediately advance turn to prevent softlock
       if (activeUnit.stats.hp <= 0) {
          nextTurn();
          return;
       }

       let isCancelled = false;

        const runAi = async () => {
          setIsActionBusy(true);

          // 1. Camera focuses on active enemy
          if (!isFreeCamera) {
            focusOnGrid(activeUnit.x, activeUnit.y, 1.15);
          }

          // Deliberation pause for readable turn transition
          await new Promise(r => setTimeout(r, 1200));
          if (isCancelled) return;
          
          const alivePlayers = units.filter(u => u.isPlayer && u.stats.hp > 0);
          if (alivePlayers.length === 0) {
             setIsActionBusy(false);
             nextTurn();
             return;
          }

          const aliveEnemies = units.filter(u => !u.isPlayer && u.stats.hp > 0);
          // SOS Reinforcement logic (Fixed: adds new enemy to turn queue and updates units ref)
          if (aliveEnemies.length < 4 && activeUnit.stats.hp <= (activeUnit.stats.maxHp || 50) * 0.45 && Math.random() < 0.40) {
             showActionText(`${activeUnit.name || 'Inimigo'} convocou reforcos pelo Chamado SOS!`);
             if (!isFreeCamera) {
               focusOnGrid(activeUnit.x, activeUnit.y, 1.25);
             }
             soundFX.playMagic();
             await new Promise(r => setTimeout(r, 700));

             const newId = 'sos_' + Date.now();
             const occupied = new Set(units.filter(u => u.stats.hp > 0).map(u => `${u.x},${u.y}`));
             let spawnX = activeUnit.x;
             let spawnY = activeUnit.y;
             let foundPos = false;

             const offsets = [[1, 0], [0, 1], [0, -1], [-1, 0], [1, 1], [1, -1]];
             for (const [ox, oy] of offsets) {
               const tx = activeUnit.x + ox;
               const ty = activeUnit.y + oy;
               if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE && !occupied.has(`${tx},${ty}`)) {
                 spawnX = tx;
                 spawnY = ty;
                 foundPos = true;
                 break;
               }
             }
             if (!foundPos) {
               for (let r = 0; r < GRID_SIZE; r++) {
                 for (let c = GRID_SIZE - 1; c >= 0; c--) {
                   if (!occupied.has(`${c},${r}`)) {
                     spawnX = c;
                     spawnY = r;
                     foundPos = true;
                     break;
                   }
                 }
                 if (foundPos) break;
               }
             }

             const newEnemyHp = Math.round((activeUnit.stats.maxHp || 50) * 0.85);
             const newEnemy: CombatUnit = {
                ...activeUnit,
                id: newId,
                name: `${activeUnit.name ? activeUnit.name.split(' ')[0] : 'Inimigo'} Reforco`,
                stats: { 
                  ...activeUnit.stats, 
                  hp: newEnemyHp, 
                  maxHp: newEnemyHp,
                  vel: Math.max(5, (activeUnit.stats.vel || 10) - 1)
                },
                x: spawnX, 
                y: spawnY,
                hasActed: false, 
                hasMoved: false,
                debuffs: []
             };

             setUnits(prev => {
                const updated = [...prev, newEnemy];
                unitsRef.current = updated;
                return updated;
             });
             setTurnQueue(prev => {
                const updated = [...prev, newId];
                turnQueueRef.current = updated;
                return updated;
             });

             setVisualEffects(prev => [...prev, {id: Date.now(), unitId: newId, type: 'hit', value: 'SOS', x: newEnemy.x, y: newEnemy.y}]);
             
             await new Promise(r => setTimeout(r, 1800));
             setIsActionBusy(false);
             resetActionZoom();
             nextTurn();
             return;
          }

          // Support Action: Healing or Buffing an Ally
          const otherAliveEnemies = aliveEnemies.filter(u => u.id !== activeUnit.id);
          const woundedAlly = otherAliveEnemies.find(ally => ally.stats.hp < ally.stats.maxHp * 0.65 && getDistance(activeUnit.x, activeUnit.y, ally.x, ally.y) <= 3);

          if (woundedAlly && Math.random() < 0.65) {
             if (!isFreeCamera) {
               focusBetweenUnits(activeUnit.x, activeUnit.y, woundedAlly.x, woundedAlly.y, 1.35);
             }
             showActionText(`${activeUnit.name || 'Inimigo'} usou Cura Sombria em ${woundedAlly.name || 'Aliado'}!`);
             soundFX.playHeal();
             await new Promise(r => setTimeout(r, 550));
             if (isCancelled) return;

             const healVal = Math.round(woundedAlly.stats.maxHp * 0.35 + 10);
             const effId = Date.now();
             setVisualEffects(prev => [
                ...prev,
                { id: effId, unitId: woundedAlly.id, type: 'heal', value: `+${healVal}`, x: woundedAlly.x, y: woundedAlly.y }
             ]);
             setUnits(prev => {
                const updated = prev.map(u => u.id === woundedAlly.id ? { ...u, stats: { ...u.stats, hp: Math.min(u.stats.maxHp, u.stats.hp + healVal) } } : u);
                unitsRef.current = updated;
                return updated;
             });
             setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1200);

             await new Promise(r => setTimeout(r, 1800));
             if (isCancelled) return;
             setIsActionBusy(false);
             resetActionZoom();
             nextTurn();
             return;
          }

          const nearbyAlly = otherAliveEnemies.find(ally => getDistance(activeUnit.x, activeUnit.y, ally.x, ally.y) <= 2);
          if (nearbyAlly && Math.random() < 0.30) {
             if (!isFreeCamera) {
               focusBetweenUnits(activeUnit.x, activeUnit.y, nearbyAlly.x, nearbyAlly.y, 1.35);
             }
             showActionText(`${activeUnit.name || 'Inimigo'} usou Grito de Guerra fortalecendo ${nearbyAlly.name || 'Aliado'}!`);
             soundFX.playMagic();
             await new Promise(r => setTimeout(r, 550));
             if (isCancelled) return;

             const effId = Date.now();
             setVisualEffects(prev => [
                ...prev,
                { id: effId, unitId: nearbyAlly.id, type: 'magic', value: '+ATK', x: nearbyAlly.x, y: nearbyAlly.y }
             ]);
             setUnits(prev => {
                const updated = prev.map(u => u.id === nearbyAlly.id ? { ...u, stats: { ...u.stats, batPwr: (u.stats.batPwr || 20) + 3, vigor: (u.stats.vigor || 20) + 3, for: (u.stats.for || 20) + 3 } } : u);
                unitsRef.current = updated;
                return updated;
             });
             setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1200);

             await new Promise(r => setTimeout(r, 1800));
             if (isCancelled) return;
             setIsActionBusy(false);
             resetActionZoom();
             nextTurn();
             return;
          }

          // Tactical Advantage AI Target Selection
          let bestPlayer = alivePlayers[0];
          let bestScore = -9999;

          for (const p of alivePlayers) {
             const dist = getDistance(activeUnit.x, activeUnit.y, p.x, p.y);
             const attackerAtk = (activeUnit.stats.batPwr || activeUnit.stats.vigor || activeUnit.stats.for || 16) + (activeUnit.weapon?.damage || 0);
             const potentialDmg = Math.max(1, attackerAtk - (p.stats.def || 10));
             const hpRatio = p.stats.hp / p.stats.maxHp;

             let score = 0;

             if (potentialDmg >= p.stats.hp) {
                score += 150;
             }
             score += (1 - hpRatio) * 70;
             score += potentialDmg * 2.5;

             if (p.heroClass === 'Mago' || p.heroClass === 'Alquimista') {
                score += 40;
             } else if (p.heroClass === 'Arqueiro') {
                score += 25;
             }

             if (dist <= activeUnit.weapon.range) {
                score += 40;
             } else {
                score -= dist * 6;
             }

             if (score > bestScore) {
                bestScore = score;
                bestPlayer = p;
             }
          }

          let targetPlayer = bestPlayer;
          let curX = activeUnit.x;
          let curY = activeUnit.y;
          let currentDist = getDistance(curX, curY, targetPlayer.x, targetPlayer.y);

          // Enemy follows same movement rules as player: moves up to its 'mov' stat towards target
          const maxMov = activeUnit.stats.mov || 2;
          let stepsTaken = 0;

          while (stepsTaken < maxMov && getDistance(curX, curY, targetPlayer.x, targetPlayer.y) > activeUnit.weapon.range) {
             const dx = targetPlayer.x > curX ? 1 : (targetPlayer.x < curX ? -1 : 0);
             const dy = targetPlayer.y > curY ? 1 : (targetPlayer.y < curY ? -1 : 0);

             let stepX = curX;
             let stepY = curY;

             if (Math.abs(targetPlayer.x - curX) >= Math.abs(targetPlayer.y - curY)) {
                if (dx !== 0 && !units.some(u => u.x === curX + dx && u.y === curY && u.stats.hp > 0)) {
                   stepX += dx;
                } else if (dy !== 0 && !units.some(u => u.x === curX && u.y === curY + dy && u.stats.hp > 0)) {
                   stepY += dy;
                }
             } else {
                if (dy !== 0 && !units.some(u => u.x === curX && u.y === curY + dy && u.stats.hp > 0)) {
                   stepY += dy;
                } else if (dx !== 0 && !units.some(u => u.x === curX + dx && u.y === curY + dy && u.stats.hp > 0)) {
                   stepX += dx;
                }
             }

             if (stepX === curX && stepY === curY) break; // blocked
             curX = stepX;
             curY = stepY;
             stepsTaken++;
          }

          if (stepsTaken > 0) {
             setUnits(prev => {
                const updated = prev.map(u => u.id === activeUnit.id ? { ...u, x: curX, y: curY, hasMoved: true } : u);
                unitsRef.current = updated;
                return updated;
             });
             showActionText(`${activeUnit.name || 'Inimigo'} avancou no campo.`);
             if (!isFreeCamera) {
                focusOnGrid(curX, curY, 1.15);
             }
             // Interval after move so player sees the movement
             await new Promise(r => setTimeout(r, 1600));
             if (isCancelled) return;
          }

          // Recheck distance after moving
          currentDist = getDistance(curX, curY, targetPlayer.x, targetPlayer.y);
          if (currentDist <= activeUnit.weapon.range) {
             if (!isFreeCamera) {
                focusBetweenUnits(curX, curY, targetPlayer.x, targetPlayer.y, 1.35);
             }

             // Enemy special technique roll (40% chance)
             const isSpecial = Math.random() < 0.40;
             let specialName = '';
             let dmgMult = 1.0;
             let debuffType: string | null = null;
             const eType = activeUnit.enemyType || (activeUnit.name?.toLowerCase().includes('slime') ? 'slime' : activeUnit.name?.toLowerCase().includes('goblin') ? 'goblin' : activeUnit.name?.toLowerCase().includes('orc') ? 'orc' : activeUnit.name?.toLowerCase().includes('elemental') ? 'elemental' : 'boss');

             if (isSpecial) {
                if (eType === 'boss') {
                   specialName = 'Sopro Ancestral';
                   dmgMult = 1.45;
                   debuffType = 'burn';
                } else if (eType === 'orc') {
                   specialName = 'Golpe Demolidor';
                   dmgMult = 1.35;
                } else if (eType === 'goblin') {
                   specialName = 'Disparo Envenenado';
                   dmgMult = 1.20;
                   debuffType = 'poison';
                } else if (eType === 'elemental') {
                   specialName = 'Rajada Gelida';
                   dmgMult = 1.25;
                   debuffType = 'freeze';
                } else if (eType === 'slime') {
                   specialName = 'Ataque Viscoso';
                   dmgMult = 1.15;
                   debuffType = 'poison';
                }
             }

             soundFX.playAttack();
             await new Promise(r => setTimeout(r, 500));
             if (isCancelled) return;

             const targetElev = elevations[targetPlayer.y]?.[targetPlayer.x] || 0;
             const attackerElev = elevations[curY]?.[curX] || 0;
             const isHighGround = targetElev > attackerElev && targetElev > 0;

             const isMagicAttack = activeUnit.weapon?.type === 'magic' || activeUnit.type === 'elemental';
             const isBlocked = isMagicAttack && (targetPlayer.stats.mBlock || 0) > 0 && Math.random() * 100 < (targetPlayer.stats.mBlock || 0);
             const attackerAtk = (activeUnit.stats.batPwr || activeUnit.stats.vigor || activeUnit.stats.for || 16) + (activeUnit.weapon?.damage || 0);
             const defVal = isMagicAttack ? (targetPlayer.stats.magDef || targetPlayer.stats.def || 10) : (targetPlayer.stats.def || 10);
             let rawDamage = Math.max(1, Math.round(attackerAtk * dmgMult - defVal));
             if (isBlocked) {
                rawDamage = Math.max(1, Math.round(rawDamage * 0.4));
             }
             const damage = isHighGround ? Math.max(1, Math.round(rawDamage * 0.65)) : rawDamage;
             
             if (isBlocked) {
                showActionText(`${targetPlayer.name || 'Heroi'} ativou Bloqueio Magico! ${damage} de dano!`);
             } else if (isHighGround) {
                showActionText(`${targetPlayer.name || 'Heroi'} defendeu em Terreno Alto! -35 de dano: ${damage}`);
             } else if (specialName) {
                showActionText(`${activeUnit.name || 'Inimigo'} usou ${specialName} em ${targetPlayer.name || 'Heroi'} causando ${damage} de dano!`);
             } else {
                showActionText(`${activeUnit.name || 'Inimigo'} atacou ${targetPlayer.name || 'Heroi'} causando ${damage} de dano!`);
             }

             soundFX.playHit();
             const effId = Date.now();
             const attKind: 'melee' | 'ranged' | 'magic' = activeUnit.weapon?.type === 'ranged' ? 'ranged' : activeUnit.weapon?.type === 'magic' ? 'magic' : 'melee';

             setVisualEffects(prev => [
               ...prev, 
               { id: effId, unitId: targetPlayer.id, type: 'hit', value: isBlocked ? `-${damage} BLOQ!` : `-${damage}`, x: targetPlayer.x, y: targetPlayer.y }, 
               { id: effId + 1, unitId: targetPlayer.id, type: 'attack', startX: curX, startY: curY, attackKind: attKind, x: targetPlayer.x, y: targetPlayer.y }
             ]);

             let nextUnits: CombatUnit[] = [];
             setUnits(prev => {
                nextUnits = prev.map(u => {
                   if (u.id === targetPlayer.id) {
                      const newHp = Math.max(0, u.stats.hp - damage);
                      const currentDebuffs = u.debuffs || [];
                      const updatedDebuffs = debuffType ? [...currentDebuffs.filter(d => d.type !== debuffType), { type: debuffType, duration: 2 }] : currentDebuffs;
                      return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) }, debuffs: updatedDebuffs };
                   }
                   return u;
                });
                unitsRef.current = nextUnits;
                return nextUnits;
             });

             setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1200);

             // 2.4-second interval after attack so player reads log and sees damage clearly
             await new Promise(r => setTimeout(r, 2400));
             if (isCancelled) return;

             setIsActionBusy(false);
             resetActionZoom();

             if (checkWinCondition(nextUnits)) {
                return;
             }
          } else {
             // Interval if no attack
             showActionText(`${activeUnit.name || 'Inimigo'} encerrou seu movimento.`);
             await new Promise(r => setTimeout(r, 1600));
             setIsActionBusy(false);
             resetActionZoom();
          }

          nextTurn();
       };

       runAi();
       return () => { isCancelled = true; };
    }
  }, [activeUnitId, combatTutorialStep, isTurnTransitioning]);

  // Safety check: if player unit is dead at turn start, advance immediately
  useEffect(() => {
    if (!isTurnTransitioning && activeUnit && activeUnit.isPlayer && activeUnit.stats.hp <= 0) {
      nextTurn();
    }
  }, [activeUnit, isTurnTransitioning]);


  // Mouse Drag Camera Handlers
  

    
    const renderUnits = () => {
    return units.filter(u => u.stats.hp > 0).map(unit => {
      const elev = elevations[unit.y]?.[unit.x] || 0;
      const effects = visualEffects.filter(v => v.unitId === unit.id);
      const isHit = effects.some(v => v.type === 'hit');
      const isBuff = effects.some(v => v.type === 'heal' || v.type === 'magic');
      const isActive = unit.id === activeUnitId;
      const isNextUpcoming = unit.id === nextUpcomingUnitId;
      const hpPercent = Math.max(0, Math.min(100, (unit.stats.hp / unit.stats.maxHp) * 100));

      return (
        <div 
          key={unit.id}
          className={`absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center transition-all duration-300 ease-out z-30 ${isHit ? 'animate-pulse' : ''}`}
          style={{ 
            left: 8 + unit.x * 56, 
            top: 8 + unit.y * 56,
            transformStyle: is3D ? 'preserve-3d' : 'flat',
            transform: is3D ? `translateZ(${elev * 16 + 2}px)` : 'none'
          }}
        >
          {/* Ground Footprint & Tactical Base Ring (Lies flat on tile floor) */}
          <div 
            className={`absolute w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center shadow-[inset_0_0_0_1px_#000] ${
              isNextUpcoming
                ? 'border-slate-100 ring-2 ring-cyan-400 shadow-[inset_0_0_0_1px_#000,0_0_15px_rgba(6,182,212,1)] scale-105'
                : isActive 
                  ? 'border-slate-200 ring-1 ring-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.8)] animate-pulse' 
                  : unit.isPlayer 
                    ? 'border-slate-300 shadow-[inset_0_0_0_1px_#000,0_0_6px_rgba(59,130,246,0.8)]' 
                    : 'border-red-400 shadow-[inset_0_0_0_1px_#000,0_0_6px_rgba(239,68,68,0.8)]'
            }`}
            style={{
              background: unit.isPlayer || isNextUpcoming || isActive
                ? 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)'
                : 'linear-gradient(to bottom, #7f1d1d 0%, #000000 100%)',
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: is3D ? 'translateZ(1px)' : 'none'
            }}
          />

          {/* Soft Ground Shadow underneath miniature feet in 3D */}
          {is3D && (
            <div 
              className="absolute w-8 h-3 rounded-full bg-black/50 blur-[1.5px] -bottom-1 pointer-events-none" 
              style={{ transform: 'translateZ(1.5px)' }} 
            />
          )}

          {/* Radiant Aura / Glow on floor for Next Upcoming Attacker */}
          {isNextUpcoming && (
            <>
              <div 
                className="absolute -inset-6 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" 
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? 'translateZ(1px)' : 'none'
                }}
              />
              <div 
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-400/60 via-blue-300/80 to-indigo-500/60 blur-md animate-pulse pointer-events-none" 
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? 'translateZ(1.5px)' : 'none'
                }}
              />
            </>
          )}

          {/* Upright Standing 3D Miniature Assembly (Billboarded facing the camera directly) */}
          <div 
            className="absolute bottom-[12px] flex flex-col items-center justify-end select-none pointer-events-none z-20"
            style={{
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: is3D ? `${billboardTransform} translateZ(8px)` : 'none',
              transformOrigin: 'center bottom',
              transition: isDragging ? 'none' : 'transform 0.4s ease-out'
            }}
          >
            {/* Overhead balloons removed in favor of top action banner */}

            {/* Enemy Weakness Badge */}
            {!unit.isPlayer && (() => {
              const w = getEnemyWeakness(unit);
              return (
                <div 
                  className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded border mb-0.5 flex items-center gap-0.5 shadow-[inset_0_0_0_1px_#000] ${w.badgeBg} ${w.badgeBorder} ${w.badgeText}`}
                >
                  <span className="text-[7px] text-slate-300">FRAQ:</span>
                  <span>{w.element}</span>
                </div>
              );
            })()}

            {/* Visual Debuff Status Badges with Clear Icons and Labels */}
            {unit.debuffs && unit.debuffs.length > 0 && (
              <div className="flex flex-col gap-0.5 mb-1 items-center z-30">
                {unit.debuffs.map((d, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-1 text-[8px] md:text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border shadow-lg tracking-wider whitespace-nowrap leading-none ${
                      d.type === 'burn'
                        ? 'bg-red-950/95 border-red-500 text-amber-300 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                        : d.type === 'poison'
                        ? 'bg-purple-950/95 border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse'
                        : 'bg-cyan-950/95 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse'
                    }`}
                  >
                    <span>{d.type === 'burn' ? '🔥' : d.type === 'poison' ? '☠' : '❄'}</span>
                    <span>{d.type === 'burn' ? 'QUEIMADURA' : d.type === 'poison' ? 'VENENO' : 'CONGELADO'}</span>
                    <span className="text-[7px] text-slate-300 font-bold"> - {d.duration}t</span>
                  </div>
                ))}
              </div>
            )}

            {/* Status Bar (HP) */}
            <div className="w-10 h-2 bg-slate-950 border border-slate-600 rounded-full overflow-hidden shadow-black shadow-sm mb-1">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${hpPercent}%` }} 
              />
            </div>

            {/* Character Avatar Token standing upright with celebration bounce */}
            {isVictoryCelebration && unit.isPlayer ? (
              <motion.div
                animate={{
                  y: [0, -14, 0, -8, 0],
                  scale: [1, 1.15, 1, 1.08, 1],
                  rotate: [0, -6, 6, -3, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (units.filter(u => u.isPlayer).indexOf(unit) * 0.15)
                }}
                className="relative flex items-center justify-center drop-shadow-[0_6px_10px_rgba(250,204,21,0.9)]"
              >
                <UnitAvatar 
                  unit={unit} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded shadow-md border-2 border-cyan-300 overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
              </motion.div>
            ) : (
              <div 
                className={`relative flex items-center justify-center transition-all ${
                  isNextUpcoming 
                    ? 'scale-110 drop-shadow-[0_0_14px_rgba(250,204,21,1)]' 
                    : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]'
                }`}
              >
                {/* Visual Debuff Auras & Effects around Avatar */}
                {unit.debuffs?.some(d => d.type === 'burn') && (
                  <>
                    <div className="absolute -inset-2 rounded-lg bg-gradient-to-t from-red-600/70 via-orange-500/50 to-amber-300/30 blur-[1px] animate-pulse pointer-events-none z-20 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                    <div className="absolute -inset-3 pointer-events-none z-20 flex justify-between items-end px-0.5">
                      <span className="text-xs animate-bounce" style={{ animationDuration: '0.6s' }}>🔥</span>
                      <span className="text-xs animate-bounce" style={{ animationDuration: '0.85s' }}>🔥</span>
                    </div>
                  </>
                )}
                {unit.debuffs?.some(d => d.type === 'poison') && (
                  <>
                    <div className="absolute -inset-2 rounded-lg bg-purple-700/60 blur-[1px] animate-pulse pointer-events-none z-20 shadow-[0_0_14px_rgba(168,85,247,0.9)]" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center animate-bounce" style={{ animationDuration: '1s' }}>
                      <span className="text-xs text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,1)]">☠</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 pointer-events-none z-20 animate-pulse">
                      <span className="text-[10px] text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,1)]">☣</span>
                    </div>
                  </>
                )}
                {unit.debuffs?.some(d => d.type === 'freeze') && (
                  <>
                    <div className="absolute -inset-1.5 rounded-lg border-2 border-cyan-300 bg-cyan-400/30 backdrop-blur-[1px] shadow-[0_0_16px_rgba(6,182,212,0.9)] animate-pulse pointer-events-none z-20" />
                    <div className="absolute -top-2.5 -left-1 pointer-events-none z-20 animate-spin" style={{ animationDuration: '4s' }}>
                      <span className="text-xs text-cyan-200 drop-shadow-[0_0_6px_rgba(103,232,249,1)]">❄</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 pointer-events-none z-20">
                      <span className="text-xs text-blue-300 drop-shadow-[0_0_6px_rgba(147,197,253,1)]">❄</span>
                    </div>
                  </>
                )}

                <UnitAvatar 
                  unit={unit} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded shadow-md border-2 border-slate-100 overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
                {isBuff && <div className="absolute inset-0 bg-yellow-400/60 blur-sm rounded-full animate-ping pointer-events-none z-30" />}
                {isHit && <div className="absolute inset-0 bg-red-500/80 blur-sm rounded-full animate-ping pointer-events-none z-30" />}
                {isNextUpcoming && (
                  <span className="absolute text-lg -top-1.5 -right-1.5 animate-spin text-yellow-200 drop-shadow-[0_0_8px_rgba(250,204,21,1)] pointer-events-none z-20">✦</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

    const renderScenery = () => {
    const allScenery = is3D ? [...sceneryItems, ...envScenery] : sceneryItems;
    return allScenery.map((item, idx) => {
      const isEnv = idx >= sceneryItems.length;
      const elev = isEnv ? 0 : (elevations[item.y]?.[item.x] || 0);
      return (
        <div 
          key={`scenery-${idx}`} 
          className="absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center" 
          style={{ 
            left: 8 + item.x * 56, 
            top: 8 + item.y * 56, 
            transformStyle: is3D ? 'preserve-3d' : 'flat', 
            transform: is3D ? `translateZ(${elev * 16 + 2}px)` : 'none' 
          }}
        >
          {/* Shadow beneath scenery in 3D */}
          {is3D && (
            <div className="absolute w-8 h-3 rounded-full bg-black/40 blur-[1.5px] -bottom-1" />
          )}
          <div 
            className={`${isEnv ? 'w-10 h-10 opacity-85' : 'w-8 h-8'} select-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] flex items-center justify-center`}
            style={{
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: billboardTransform,
              transformOrigin: 'center bottom',
              transition: isDragging ? 'none' : 'transform 0.4s ease-out'
            }}
          >
            {item.propType === 'tree' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,2 6,16 11,16 4,24 28,24 21,16 26,16" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
                <rect x="13" y="24" width="6" height="7" fill="#78350f" />
              </svg>
            ) : item.propType === 'crystal' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,2 26,12 22,28 10,28 6,12" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                <polygon points="16,2 20,12 16,28 12,12" fill="#bae6fd" opacity="0.7" />
              </svg>
            ) : item.propType === 'spire' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,3 25,28 7,28" fill="#b91c1c" stroke="#450a0a" strokeWidth="1.5" />
                <polygon points="16,3 20,28 12,28" fill="#f87171" opacity="0.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="8,24 5,16 12,8 22,9 28,18 24,25" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                <polygon points="12,8 20,14 15,22 8,24 5,16" fill="#94a3b8" opacity="0.5" />
              </svg>
            )}
          </div>
        </div>
      );
    });
  };

      const renderEffects = () => {
    return visualEffects.map(eff => {
      const targetElev = elevations[eff.y]?.[eff.x] || 0;
      const targetZ = targetElev * 16 + 40;
      
      if (eff.type === 'hit') {
        return (
          <div
            key={eff.id}
            className="absolute pointer-events-none z-[150]"
            style={{
              left: 8 + eff.x * 56,
              top: 8 + eff.y * 56,
              width: 56, height: 56,
              transformStyle: is3D ? 'preserve-3d' : 'flat',
            }}
          >
            {/* 3D Floating Pop Damage Number directly in front */}
            <motion.div
              initial={{ y: 5, opacity: 0, scale: 0.5 }}
              animate={{ y: -50, opacity: [0, 1, 1, 0], scale: [0.5, 1.45, 1.1] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transformStyle: is3D ? 'preserve-3d' : 'flat',
                transform: is3D ? `translateZ(${targetZ + 36}px) ${billboardTransform}` : 'none'
              }}
            >
              <div 
                className="text-4xl md:text-5xl font-black text-red-500 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tracking-wider" 
                style={{ WebkitTextStroke: '2px black' }}
              >
                {eff.value}
              </div>
            </motion.div>

            {/* 3D Radial Impact Spark Particles in front */}
            {[
              { dx: -26, dy: -24, dz: 36, char: '✦', color: 'text-yellow-300' },
              { dx: 28, dy: -26, dz: 40, char: '✦', color: 'text-amber-400' },
              { dx: -24, dy: 18, dz: 32, char: '★', color: 'text-orange-400' },
              { dx: 26, dy: 20, dz: 34, char: '✦', color: 'text-yellow-200' },
              { dx: 0, dy: -34, dz: 46, char: '✦', color: 'text-red-400' },
              { dx: -14, dy: 26, dz: 30, char: '★', color: 'text-amber-300' },
            ].map((p, pIdx) => (
              <motion.div
                key={`spark-${eff.id}-${pIdx}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className={`absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none ${p.color} text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? `translateZ(${targetZ + p.dz}px) ${billboardTransform}` : 'none'
                }}
              >
                {p.char}
              </motion.div>
            ))}
          </div>
        );
      }

      if (eff.type === 'attack' && eff.startX !== undefined && eff.startY !== undefined) {
        const isMelee = eff.attackKind !== 'ranged' && eff.attackKind !== 'magic';
        
        return (
          <div key={eff.id} className="absolute inset-0 pointer-events-none z-[150]" style={{ transformStyle: is3D ? 'preserve-3d' : 'flat' }}>
            <motion.div
              initial={{ 
                left: 8 + eff.startX * 56, 
                top: 8 + eff.startY * 56, 
                scale: 0.7 
              }}
              animate={{ 
                left: 8 + eff.x * 56, 
                top: 8 + eff.y * 56, 
                scale: [0.7, 1.5, 1.25]
              }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute pointer-events-none flex items-center justify-center"
              style={{ 
                width: 56, height: 56, 
                transformStyle: is3D ? 'preserve-3d' : 'flat',
                transform: is3D ? `translateZ(${targetZ + 36}px) ${billboardTransform}` : 'none'
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* 3D Attack Icon Right in Front */}
                <div className="w-14 h-14 relative flex items-center justify-center filter drop-shadow-[0_0_16px_rgba(255,255,255,0.9)]">
                  {eff.attackKind === 'ranged' ? (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-yellow-300 -rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <polyline points="15 5 22 12 15 19" />
                    </svg>
                  ) : eff.attackKind === 'magic' ? (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-cyan-300 animate-spin" fill="currentColor">
                      <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                      <path d="M13 19l6-6" />
                      <path d="M16 16l4 4" />
                      <path d="M19 21l2-2" />
                    </svg>
                  )}
                </div>
                {/* Dynamic Energy Slash Wave for melee attacks */}
                {isMelee && (
                  <div className="absolute -inset-6 border-t-4 border-amber-300 rounded-full animate-spin blur-[0.5px] shadow-[0_0_16px_rgba(252,211,77,1)] pointer-events-none" />
                )}
              </div>
            </motion.div>
          </div>
        );
      }
      
      return (
        <div 
          key={eff.id} 
          className="absolute pointer-events-none flex items-center justify-center z-[150]"
          style={{ 
             left: 8 + eff.x * 56, top: 8 + eff.y * 56, 
             width: 56, height: 56, 
             transformStyle: is3D ? 'preserve-3d' : 'flat',
             transform: is3D ? `translateZ(${targetZ + 36}px)` : 'none'
          }}
        >
          {/* 3D Magic Effect: Runic Aura Circle on Floor + Rising Sparkles in Front */}
          {eff.type === 'magic' && (
            <>
              {is3D && (
                <div 
                  className="absolute w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/90 animate-spin shadow-[0_0_20px_rgba(34,211,238,0.9)]"
                  style={{ transform: 'translateZ(2px)' }}
                />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: [0, 1, 1, 0], scale: 1.5, y: -30 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                style={{ transform: billboardTransform }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 relative flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(59,130,246,1)]">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-cyan-400" fill="currentColor">
                    <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
                  </svg>
                </div>
              </motion.div>
            </>
          )}

          {/* 3D Heal Effect: Green Aura Ring on Floor + Rising Healing Light in Front */}
          {eff.type === 'heal' && (
            <>
              {is3D && (
                <div 
                  className="absolute w-16 h-16 rounded-full border-2 border-green-400/90 animate-ping shadow-[0_0_20px_rgba(74,222,128,0.9)]"
                  style={{ transform: 'translateZ(2px)' }}
                />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 15 }}
                animate={{ opacity: [0, 1, 1, 0], scale: 1.4, y: -35 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ transform: billboardTransform }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 relative flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(74,222,128,1)]">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-400" fill="currentColor">
                    <rect x="9" y="2" width="6" height="20" rx="1" />
                    <rect x="2" y="9" width="20" height="6" rx="1" />
                  </svg>
                </div>
                {eff.value && (
                  <span className="text-green-300 font-black text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,1)] tracking-wider -mt-2">
                    {eff.value}
                  </span>
                )}
              </motion.div>
            </>
          )}
        </div>
      );
    });
  };

  const renderGrid = () => {
    const nextUpcomingUnit = units.find(u => u.id === nextUpcomingUnitId);
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const elev = elevations[y]?.[x] || 0;
        const unit = units.find(u => u.x === x && u.y === y && u.stats.hp > 0);
        const isActiveUnitTile = activeUnit && activeUnit.x === x && activeUnit.y === y;
        const isNextUpcomingTile = nextUpcomingUnit && nextUpcomingUnit.x === x && nextUpcomingUnit.y === y;
        
        let cellClass = `relative w-[56px] h-[56px] min-w-[56px] min-h-[56px] flex-shrink-0 border ${theme.tileBorder} ${theme.tileBg} flex items-center justify-center text-3xl cursor-pointer transition-all duration-150`;
        
        // Next upcoming unit tile highlight with golden radiant glow
        if (isNextUpcomingTile) {
          cellClass += " ring-4 ring-cyan-300 bg-cyan-400/30 shadow-[inset_0_0_18px_rgba(6,182,212,0.8)] animate-pulse";
        }
        // Active Unit Tile Outline
        else if (isActiveUnitTile) {
          cellClass += " ring-2 ring-cyan-400/80 shadow-[inset_0_0_8px_rgba(6,182,212,0.4)]";
        }

        // Highlight logic
        if (selectedAction === 'MOVE' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           if (dist > 0 && dist <= activeUnit.stats.mov && !unit) {
               cellClass += " bg-blue-500/40 hover:bg-blue-400/60 shadow-[inset_0_0_12px_rgba(59,130,246,0.8)] ring-2 ring-blue-300";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if (selectedAction === 'MAGIC' && selectedSubItem === 'Cura' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           if (dist <= 3 && unit && unit.isPlayer) {
               cellClass += " bg-emerald-500/40 hover:bg-emerald-400/60 shadow-[inset_0_0_12px_rgba(16,185,129,0.8)] ring-2 ring-emerald-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if ((selectedAction === 'ATTACK' || selectedAction === 'MAGIC') && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           const range = selectedAction === 'ATTACK' ? activeUnit.weapon.range : 3;
           if (dist > 0 && dist <= range && unit && !unit.isPlayer) {
               cellClass += " bg-red-500/40 hover:bg-red-400/60 shadow-[inset_0_0_12px_rgba(239,68,68,0.8)] ring-2 ring-red-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if (selectedAction === 'SKILL' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           const skillRange = activeUnit.heroClass === 'Arqueiro' ? 3 : (activeUnit.weapon?.range || 1);
           if (dist > 0 && dist <= skillRange && unit && !unit.isPlayer) {
               cellClass += " bg-amber-500/40 hover:bg-amber-400/60 shadow-[inset_0_0_12px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        } else {
           cellClass += " hover:brightness-125";
        }

        cells.push(
          <div 
            key={`${x}-${y}`} 
            className={cellClass}
            onClick={() => handleCellClick(x, y)}
            style={{ 
              transformStyle: is3D ? 'preserve-3d' : 'flat', 
              transform: is3D ? `translateZ(${elev * 16}px)` : 'none',
              backgroundImage: `url(${currentCombatTex.tileDataUrl})`,
              backgroundSize: 'cover',
              imageRendering: 'pixelated',
            }}
          >
            {/* In 3D mode, render elevation steps with textures and high ground indicator */}
            {is3D && elev > 0 && (
              <>
                 <div 
                   className="absolute top-full left-0 w-full border-x border-b border-black/80 origin-top shadow-md" 
                   style={{ 
                     height: `${elev * 16}px`, 
                     transform: 'rotateX(-90deg)',
                     backgroundImage: `url(${currentCombatTex.wallDataUrl})`,
                     backgroundSize: '56px 16px',
                     imageRendering: 'pixelated'
                   }} 
                 />
                 <div 
                   className="absolute top-0 right-full h-full border-y border-l border-black/80 origin-right shadow-md" 
                   style={{ 
                     width: `${elev * 16}px`, 
                     transform: 'rotateY(-90deg)',
                     backgroundImage: `url(${currentCombatTex.wallDataUrl})`,
                     backgroundSize: '16px 56px',
                     imageRendering: 'pixelated'
                   }} 
                 />
              </>
            )}

            {/* High Ground Tactical Indicator Badge */}
            {elev >= 2 && (
              <div 
                className="absolute top-0.5 left-0.5 pointer-events-none px-1 rounded bg-black/80 border border-cyan-400 text-[8px] font-mono font-black text-cyan-300 uppercase tracking-tighter z-10 shadow"
                style={{ transform: is3D ? 'translateZ(1px)' : 'none' }}
              >
                ▲ ALTO
              </div>
            )}

            {/* In 3D mode, subtle rim on high ground */}
            {is3D && elev >= 2 && (
              <div 
                className="absolute inset-0 border border-cyan-400/50 pointer-events-none rounded-sm shadow-[inset_0_0_6px_rgba(6,182,212,0.25)]"
                style={{ transform: 'translateZ(1px)' }}
              />
            )}

            {/* In 2D mode, indicate elevation subtly if elevated */}
            {!is3D && elev > 0 && (
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-slate-100 bg-black/60 px-1 rounded select-none pointer-events-none">
                +{elev}
              </span>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col font-sans text-slate-200 transition-colors duration-1000 overflow-hidden">
      {/* 3D Battlefield Area with Hardware 3D Perspective */}
      <div 
        className="flex-1 relative flex justify-center items-center bg-black/90 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={handleWheel}
        style={{
          perspective: is3D ? '1100px' : 'none',
          perspectiveOrigin: 'center center'
        }}
      >
        {/* Turn Order Queue Ribbon (FF6 Action Menu Style) */}
        <div 
          className="absolute top-3 left-3 z-50 flex items-center gap-1.5 p-1 md:p-1.5 rounded-lg border-2 md:border-[3px] border-slate-200 shadow-[inset_0_0_0_1px_#000,0_3px_5px_rgba(0,0,0,0.5)] max-w-[80vw] overflow-x-auto custom-scrollbar font-mono uppercase font-black select-none pointer-events-auto"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-cyan-300 mr-1 tracking-wider whitespace-nowrap">
            <span style={{ fontSize: '19px', lineHeight: '7px' }}></span>
            <span style={{ fontSize: '23px', lineHeight: '29.6667px' }}>ORDEM:</span>
          </div>
          {turnQueue.slice(0, 7).map((id, index) => {
            const u = units.find(unit => unit.id === id);
            if (!u || u.stats.hp <= 0) return null;
            const isCurrent = u.id === activeUnitId;
            const isNext = u.id === nextUpcomingUnitId;
            return (
              <div 
                key={`queue-${u.id}-${index}`}
                className={`relative flex items-center justify-center rounded transition-all duration-300 flex-shrink-0 shadow-[inset_0_0_0_1px_#000] overflow-visible ${
                  isNext 
                    ? 'w-7 h-7 md:w-8 md:h-8 border-[2px] border-cyan-300 bg-blue-700/60 ring-1 ring-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-105 z-10'
                    : isCurrent
                      ? 'w-6 h-6 md:w-7 md:h-7 border-[1.5px] border-white bg-blue-500/50 shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                      : 'w-5 h-5 md:w-6 md:h-6 border border-blue-900 bg-black/60 opacity-60 hover:opacity-100'
                }`}
                title={`${u.name || u.heroClass || 'Unidade'} (HP: ${u.stats.hp}/${u.stats.maxHp})`}
              >
                <UnitAvatar 
                  unit={u} 
                  className="w-full h-full rounded overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
                {isNext && (
                  <span className="absolute -bottom-2 text-[7px] font-black bg-cyan-300 text-black px-0.5 rounded-[2px] border border-black shadow whitespace-nowrap z-20 leading-none py-0.5">
                    PROX
                  </span>
                )}
                {isCurrent && !isNext && (
                  <span className="absolute -bottom-2 text-[7px] font-black bg-white text-black px-0.5 rounded-[2px] border border-black shadow whitespace-nowrap z-20 leading-none py-0.5">
                    AGORA
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Combat Action Log & Tutorial Dialogue */}
        {combatTutorialStep !== null ? (
          <div 
            className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto max-w-xl md:max-w-2xl w-[92%] cursor-pointer select-none"
            onClick={() => {
              if (combatTutorialStep < COMBAT_TUTORIAL_LINES.length - 1) {
                setCombatTutorialStep(prev => (prev !== null ? prev + 1 : null));
              } else {
                localStorage.setItem('eldoria_seen_first_combat_dialogue', 'true');
                setCombatTutorialStep(null);
                showActionText('Combate Iniciado! Dica: Terreno Alto reduz dano!');
              }
            }}
          >
            <div 
              className="rounded-lg border-[4px] border-slate-200 p-3 md:p-4 shadow-[inset_0_0_0_2px_#000,0_8px_20px_rgba(0,0,0,0.8)] backdrop-blur-md animate-fade-in-down font-mono flex flex-col gap-2"
              style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
            >
              {/* Speaker Tag + Counter + Skip */}
              <div className="flex items-center justify-between border-b border-blue-400/40 pb-1.5 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-black uppercase tracking-wider text-sm md:text-base">
                    {COMBAT_TUTORIAL_LINES[combatTutorialStep].speaker}
                  </span>
                  <span className="text-slate-400 text-xs font-bold uppercase">
                    - {COMBAT_TUTORIAL_LINES[combatTutorialStep].role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-bold">
                    {combatTutorialStep + 1} de {COMBAT_TUTORIAL_LINES.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem('eldoria_seen_first_combat_dialogue', 'true');
                      setCombatTutorialStep(null);
                      showActionText('Combate Iniciado! Dica: Terreno Alto reduz dano!');
                    }}
                    className="text-[10px] md:text-xs text-slate-300 hover:text-white px-1.5 py-0.5 rounded border border-slate-500/80 bg-black/40 hover:bg-white/20 uppercase font-black"
                  >
                    Pular - ESC
                  </button>
                </div>
              </div>

              {/* Dialogue Text */}
              <div className="text-white text-sm md:text-base font-black uppercase leading-snug tracking-wide py-0.5">
                {COMBAT_TUTORIAL_LINES[combatTutorialStep].text}
              </div>

              {/* Advance Hint */}
              <div className="flex justify-end items-center text-[10px] md:text-xs text-cyan-300 font-black uppercase tracking-wider gap-1">
                <span>Clique ou ESPACO para avancar</span>
                <span className="animate-bounce">▶</span>
              </div>
            </div>
          </div>
        ) : actionText ? (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
             <div className="rounded-lg border-[4px] border-slate-200 text-white text-2xl md:text-3xl p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in-down font-black uppercase tracking-widest" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}>
                {actionText.text}
             </div>
          </div>
        ) : null}

        {/* Camera and View Controls (FF6 Action Menu Style) */}
        <div 
          className="absolute top-3 right-3 z-50 flex items-center gap-1.5 p-1.5 md:p-2 rounded-lg border-[3px] md:border-[4px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black pointer-events-auto"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          {/* Mode Switch: 2D Reto vs 3D Isometrico */}
          <button 
            onClick={handleToggle3D} 
            className={`px-2 py-1 rounded font-mono font-black text-xs transition-all border-[2px] flex items-center gap-1 shadow-[inset_0_0_0_1px_#000] hover:brightness-110 active:scale-95 ${
              is3D 
                ? 'bg-blue-600 text-white border-cyan-300' 
                : 'bg-slate-700 text-white border-slate-400'
            }`}
            title={is3D ? "Mudar para 2D Tatico (Deitado e Reto)" : "Mudar para 3D Isometrico"}
          >
            <span style={{ fontSize: '18px', lineHeight: '20px' }}>{is3D ? '3D ISO' : '2D RETO'}</span>
          </button>

          {/* 3D Camera Angle Presets */}
          {is3D && (
            <div className="hidden sm:flex items-center gap-1 border-l border-r border-slate-400/50 px-1">
              <button
                onClick={setCameraIso}
                className="px-1.5 py-0.5 rounded text-[11px] font-black bg-white/10 hover:bg-white/25 text-white border border-slate-300"
                title="Visao Isometrica Padrao"
              >
                ISO
              </button>
              <button
                onClick={setCameraAereo}
                className="px-1.5 py-0.5 rounded text-[11px] font-black bg-white/10 hover:bg-white/25 text-white border border-slate-300"
                title="Visao Aerea Top-Down"
              >
                TOPO
              </button>
              <button
                onClick={setCameraFront}
                className="px-1.5 py-0.5 rounded text-[11px] font-black bg-white/10 hover:bg-white/25 text-white border border-slate-300"
                title="Visao Frontal Cinematica"
              >
                FRONT
              </button>
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUserZoom(prev => Math.min(1.6, prev + 0.15))}
              className="px-1.5 py-0.5 rounded text-xs font-black bg-black/40 hover:bg-white/20 text-white border border-slate-400"
              title="Aumentar Zoom"
            >
              +
            </button>
            <button
              onClick={() => setUserZoom(prev => Math.max(0.7, prev - 0.15))}
              className="px-1.5 py-0.5 rounded text-xs font-black bg-black/40 hover:bg-white/20 text-white border border-slate-400"
              title="Diminuir Zoom"
            >
              -
            </button>
          </div>

          {/* Camera Mode Toggle / Focus Snap */}
          <button
            onClick={() => {
              if (isFreeCamera) {
                snapToActiveUnit();
              } else {
                setIsFreeCamera(true);
                setFreeCamOffset(currentAutoOffset);
              }
            }}
            className={`px-2 py-1 rounded font-mono font-black text-xs transition-all border-[2px] flex items-center gap-1 shadow-[inset_0_0_0_1px_#000] hover:brightness-110 active:scale-95 ${
              isFreeCamera
                ? 'bg-cyan-600 text-white border-cyan-200 animate-pulse'
                : 'bg-emerald-700 text-white border-emerald-300'
            }`}
            title={isFreeCamera ? "Camera Livre ativada. Clique para travar e seguir o turno" : "Camera seguindo acoes automaticamente. Clique para modo livre"}
          >
            <span style={{ fontSize: '16px', lineHeight: '20px' }}>
              {isFreeCamera ? 'FOCO' : 'AUTO'}
            </span>
          </button>
        </div>

        {/* Free Camera Notification Badge */}
        {isFreeCamera && (
          <div 
            onClick={() => snapToActiveUnit()}
            className="absolute bottom-3 right-3 z-40 bg-black/80 hover:bg-blue-950 border border-cyan-400/80 text-cyan-200 text-xs px-3 py-1.5 rounded-full shadow-lg cursor-pointer flex items-center gap-2 backdrop-blur-sm pointer-events-auto transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Camera Livre (Clique para Focar)</span>
          </div>
        )}
        
        {/* Dynamic Camera Rig (True 3D Spatial Geometry - NO overflow-hidden flattening) */}
        <div 
          className="relative flex justify-center items-center select-none pointer-events-none"
          style={{ 
            transformStyle: is3D ? 'preserve-3d' : 'flat', 
            transform: is3D 
              ? `translate3d(${cameraX}px, ${cameraY}px, ${cameraZ}px) scale(${cameraScale})` 
              : `translate(${cameraX}px, ${cameraY}px) scale(${effectiveZoom})`, 
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
        
        <div 
          className={`relative p-2 rounded-xl shadow-[0_35px_80px_rgba(0,0,0,0.9)] inline-grid grid-cols-8 gap-0 border-4 border-slate-700/90 ${theme.wrapperBg} pointer-events-auto transition-transform duration-500 ease-out`}
          style={{ 
             transformStyle: is3D ? 'preserve-3d' : 'flat', 
             minWidth: '464px', minHeight: '464px',
             transform: is3D ? `rotateX(${rotX}deg) rotateZ(${rotZ}deg)` : `rotateZ(${rotZ}deg)`,
             transformOrigin: 'center center'
          }}
        >
          {/* Base Platform for Environment in 3D */}
          {is3D && (
            <div 
               className="absolute pointer-events-none rounded-2xl border-4 border-black/80 shadow-[0_30px_60px_rgba(0,0,0,0.85)]"
               style={{ 
                 inset: '-6px',
                 transform: 'translateZ(-14px)',
                 transformStyle: 'preserve-3d',
                 backgroundImage: `url(${currentCombatTex.wallDataUrl})`,
                 backgroundSize: '32px 32px',
                 imageRendering: 'pixelated'
               }}
            >
              <div 
                className="absolute top-full left-0 w-full h-4 origin-top border-x border-b border-black/90 shadow-lg" 
                style={{ 
                  transform: 'rotateX(-90deg)',
                  backgroundImage: `url(${currentCombatTex.wallDataUrl})`,
                  backgroundSize: '56px 16px',
                  imageRendering: 'pixelated'
                }} 
              />
              <div 
                className="absolute top-0 right-full h-full w-4 origin-right border-y border-l border-black/90 shadow-lg" 
                style={{ 
                  transform: 'rotateY(-90deg)',
                  backgroundImage: `url(${currentCombatTex.wallDataUrl})`,
                  backgroundSize: '16px 56px',
                  imageRendering: 'pixelated'
                }} 
              />
            </div>
          )}
        
          {renderScenery()}
          {renderGrid()}
          {renderUnits()}
          {renderEffects()}
        </div>
      </div>
      </div>

      {victoryData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 font-mono text-xl">
          <div className="rounded-lg border-[4px] border-slate-200 p-8 flex flex-col items-center gap-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] min-w-[300px]" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}>
            <h2 className="text-4xl text-white font-black mb-4 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">Vitoria</h2>
            <div className="flex justify-between w-full border-b border-slate-700 pb-2">
              <span className="text-slate-300">Experiencia:</span>
              <span className="text-white font-bold">+{victoryData.exp} EXP</span>
            </div>
            <div className="flex justify-between w-full border-b border-slate-700 pb-2">
              <span className="text-slate-300">GP:</span>
              <span className="text-white font-bold">+{victoryData.gold} GP</span>
            </div>
            {victoryData.drops.length > 0 && (
              <div className="flex flex-col w-full text-left mt-2">
                <span className="text-slate-300 mb-2">Itens Encontrados:</span>
                {victoryData.drops.map((d, i) => <span key={i} className="text-green-400">► {d}</span>)}
              </div>
            )}
            <button 
              className="mt-6 px-8 py-3 bg-white text-black hover:bg-slate-300 font-black uppercase rounded shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
              onClick={() => {
                soundFX.playSelect();
                const finalParty = unitsRef.current.filter(u => u.isPlayer);
                const finalInv = currentInventory.map(it => ({ ...it }));
                for (const dropName of victoryData.drops) {
                  let itemId = 'i1';
                  let price = 20;
                  let desc = 'Restaura 50 HP';
                  let heal = 50;
                  let mpHeal = 0;
                  let revive = false;

                  if (dropName === 'Super Pocao') { itemId = 'i2'; heal = 120; price = 60; desc = 'Restaura 120 HP'; }
                  else if (dropName === 'Eter') { itemId = 'i3'; heal = 0; mpHeal = 40; price = 50; desc = 'Restaura 40 MP'; }
                  else if (dropName === 'Elixir') { itemId = 'i4'; heal = 100; mpHeal = 50; price = 150; desc = 'Restaura 100 HP e 50 MP'; }
                  else if (dropName === 'Antidoto') { itemId = 'i5'; heal = 0; price = 25; desc = 'Cura veneno e queimadura'; }
                  else if (dropName === 'Pluma de Fenix') { itemId = 'i6'; heal = 100; price = 200; revive = true; desc = 'Revive aliado com 100 HP'; }

                  const exist = finalInv.find(it => it.name === dropName || it.id === itemId);
                  if (exist) {
                    exist.count = (exist.count || 0) + 1;
                  } else {
                    finalInv.push({ id: itemId, name: dropName, price, heal, mpHeal, revive, count: 1, description: desc });
                  }
                }
                onVictory(victoryData.exp, victoryData.gold, victoryData.drops, finalParty, finalInv);
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {/* FF6 Style HUD */}
      <div className="relative z-20 h-56 bg-black p-1 md:p-2 flex gap-1 md:gap-2 shrink-0 border-t-2 border-slate-700 font-mono text-xl uppercase font-black" style={{ background: '#000' }}>
          {/* Left Panel: Action Menu */}
          <div 
            className="w-1/3 md:w-1/4 rounded-lg border-[4px] border-slate-200 p-2 md:p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar select-none"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             {isTurnTransitioning ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-2 font-mono uppercase font-black">
                    <div className="flex items-center gap-1 text-cyan-300 text-base md:text-2xl animate-pulse tracking-wider">
                       <span></span>
                       <span>PREPARANDO TURNO</span>
                       <span></span>
                    </div>
                    {nextUpcomingUnit ? (
                       <div className="text-white text-sm md:text-lg mt-1 tracking-wide flex items-center justify-center gap-2">
                          <span className="truncate max-w-[140px] md:max-w-[200px]">{nextUpcomingUnit.name || nextUpcomingUnit.heroClass || (nextUpcomingUnit.isPlayer ? 'Heroi' : 'Inimigo')}</span>
                       </div>
                    ) : (
                       <span className="text-xs md:text-sm text-slate-300 mt-1">Proximo Combatente...</span>
                    )}
                    <span className="text-[10px] md:text-xs text-cyan-200/80 mt-1 tracking-widest">
                       AGUARDE O TURNO
                    </span>
                    <div className="w-full h-2.5 bg-black border border-slate-300 rounded-sm mt-2 overflow-hidden shadow-[inset_0_0_0_1px_#000]">
                       <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 animate-pulse w-full" />
                    </div>
                </div>
             ) : activeUnit?.isPlayer ? (
                <div className="flex flex-col gap-1 h-full justify-between select-none">
                    <button 
                      id="ff6_cmd_move"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${selectedAction === 'MOVE' ? 'text-cyan-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setSelectedAction('MOVE'); 
                        setActionMenu('MAIN'); 
                        showActionText('Selecione uma celula azul para mover.');
                      }} 
                      disabled={activeUnit.hasMoved || isActionBusy}
                    >
                        <span className="w-6 text-cyan-300">{selectedAction === 'MOVE' ? '►' : ''}</span> Mover
                    </button>
                    
                    <button 
                      id="ff6_cmd_attack"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${selectedAction === 'ATTACK' ? 'text-cyan-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setSelectedAction('ATTACK'); 
                        setActionMenu('MAIN'); 
                        showActionText('Selecione um inimigo vermelho para atacar.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-cyan-300">{selectedAction === 'ATTACK' ? '►' : ''}</span> Atacar
                    </button>

                    <button 
                      id="ff6_cmd_skills"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'SKILLS' ? 'text-cyan-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setActionMenu('SKILLS'); 
                        setSelectedAction(null); 
                        showActionText('Escolha uma tecnica no menu ao lado.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-cyan-300">{actionMenu === 'SKILLS' ? '►' : ''}</span> {activeUnit.heroClass === 'Guerreiro' || activeUnit.heroClass === 'Cavaleiro' || activeUnit.heroClass === 'Ladrao' || activeUnit.heroClass === 'Ninja' || activeUnit.heroClass === 'Monge' || activeUnit.heroClass === 'Mestre' || activeUnit.heroClass === 'Cavalheiro' || activeUnit.heroClass === 'Lutador' ? 'Tecnica' : 'Especial'}
                    </button>

                    <button 
                      id="ff6_cmd_magic"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'MAGIC' ? 'text-cyan-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setActionMenu('MAGIC'); 
                        setSelectedAction(null); 
                        showActionText('Escolha uma magia no menu ao lado.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-cyan-300">{actionMenu === 'MAGIC' ? '►' : ''}</span> Magia
                    </button>

                    <button 
                      id="btn-item-combat"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'ITEM' ? 'text-cyan-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setActionMenu('ITEM'); 
                        setSelectedAction(null); 
                        showActionText('Escolha um item da bolsa para usar.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-cyan-300">{actionMenu === 'ITEM' ? '►' : ''}</span> Item
                    </button>

                    <button 
                      id="btn-escape-combat"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 text-slate-300 hover:text-white transition-colors" 
                      onClick={handleEscape} 
                      disabled={isTurnTransitioning || isActionBusy}
                    >
                        <span className="w-6 shrink-0"></span> Fugir
                    </button>

                    <button 
                      id="btn-end-turn-combat"
                      style={{ fontSize: '35px', lineHeight: '16px' }}
                      className="mt-auto flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 text-slate-300 hover:text-white" 
                      onClick={() => { soundFX.playSelect(); nextTurn(); }} 
                      disabled={isTurnTransitioning || isActionBusy}
                    >
                        <span className="w-6"></span> Fim Turno
                    </button>
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-red-400 animate-pulse text-center">TURNO<br/>INIMIGO</span>
                </div>
             )}
          </div>

          {/* Right Panel: Party Status OR Action Submenu (Tecnica, Magia, Item) appearing in front */}
          <div 
            className="flex-1 rounded-lg border-[4px] border-slate-200 p-2 md:p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             {/* Submenu: Tecnicas */}
             {activeUnit?.isPlayer && actionMenu === 'SKILLS' ? (
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                     <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span 
                              className="text-white font-black tracking-wider"
                              style={{ fontSize: '35px', lineHeight: '16px' }}
                            >
                              TECNICAS
                            </span>
                            <span 
                              className="text-cyan-300 font-bold"
                              style={{ fontSize: '35px', lineHeight: '16px' }}
                            >
                              SP {activeUnit.stats.sp || 0}/{activeUnit.stats.maxSp || 100}
                            </span>
                        </div>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-cyan-300 hover:text-white font-bold tracking-wider transition-colors"
                        >
                          <span style={{ fontSize: '35px', lineHeight: '16px' }}>Voltar</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {(CLASS_SKILLS_DATA[activeUnit.heroClass || 'Cavalheiro'] || CLASS_SKILLS_DATA['Cavalheiro']).map((skill) => {
                            const isAffordable = (activeUnit.stats.sp || 0) >= skill.cost;
                            const isSelected = selectedAction === 'SKILL' && selectedSubItem === skill.id;
                            return (
                                <button
                                  key={skill.id}
                                  onClick={() => {
                                      if (!isAffordable || isActionBusy) return;
                                      soundFX.playSelect();
                                      setSelectedSubItem(skill.id);
                                      setSelectedAction('SKILL');
                                      showActionText(`${skill.name}: Selecione o alvo no grid`);
                                  }}
                                  disabled={!isAffordable || isActionBusy}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                      isSelected
                                        ? 'text-cyan-300 bg-white/20'
                                        : isAffordable
                                          ? 'text-white hover:bg-white/15'
                                          : 'text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                     <div className="flex items-center gap-1 min-w-0">
                                        <span className="w-4 text-cyan-300 shrink-0">{isSelected ? '►' : ' '}</span>
                                        <span 
                                          className="truncate font-bold"
                                          style={{ fontSize: '35px', lineHeight: '16px' }}
                                        >
                                          {skill.name}
                                        </span>
                                    </div>
                                    <span 
                                      className={`font-mono shrink-0 ml-2 ${isAffordable ? 'text-cyan-300' : 'text-red-400'}`}
                                      style={{ fontSize: '35px', lineHeight: '16px' }}
                                    >
                                        {skill.cost} SP
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 truncate">
                        {(CLASS_SKILLS_DATA[activeUnit.heroClass || 'Cavalheiro'] || CLASS_SKILLS_DATA['Cavalheiro']).find(s => s.id === selectedSubItem)?.desc || 'Selecione uma tecnica'}
                    </div>
                </div>
             ) : activeUnit?.isPlayer && actionMenu === 'MAGIC' ? (
                /* Submenu: Magias */
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                    <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span 
                              className="text-white text-base md:text-xl font-black tracking-wider"
                              style={{ fontSize: '35px', lineHeight: '16px' }}
                            >
                              MAGIAS
                            </span>
                            <span 
                              className="text-cyan-300 font-bold"
                              style={{ fontSize: '35px', lineHeight: '16px' }}
                            >
                              MP {activeUnit.stats.mp}/{activeUnit.stats.maxMp}
                            </span>
                        </div>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-cyan-300 hover:text-white font-bold tracking-wider transition-colors"
                        >
                          <span style={{ fontSize: '35px', lineHeight: '16px' }}>Voltar</span>
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {COMBAT_MAGICS_DATA.map((magic) => {
                            const isAffordable = activeUnit.stats.mp >= magic.cost;
                            const isSelected = selectedAction === 'MAGIC' && selectedSubItem === magic.name;
                            const badge = getMagicDotBadge(magic.category);
                            const isAllyTarget = magic.targetType === 'ally' || magic.targetType === 'all_allies';

                            return (
                                <button
                                  key={magic.name}
                                  onClick={() => {
                                      if (!isAffordable || isActionBusy) return;
                                      soundFX.playSelect();
                                      setSelectedSubItem(magic.name);
                                      setSelectedAction('MAGIC');
                                      if (isAllyTarget) {
                                        showActionText(`${magic.name} - ${magic.category}: Selecione um aliado no grid`);
                                      } else {
                                        showActionText(`${magic.name} - ${magic.category}: Selecione um inimigo no grid`);
                                      }
                                  }}
                                  disabled={!isAffordable || isActionBusy}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                      isSelected
                                        ? 'text-cyan-300 bg-white/20'
                                        : isAffordable
                                          ? 'text-white hover:bg-white/15'
                                          : 'text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-3 text-cyan-300 shrink-0">{isSelected ? '►' : ' '}</span>
                                        {/* Ponto representativo da categoria da magia:
                                            Cura: ponto branco (○)
                                            Ataque: ponto preto (●)
                                            Efeito: ponto cinza (•) */}
                                        <span className={`text-xl shrink-0 ${badge.dotColorClass}`}>{badge.dotSymbol}</span>
                                        <span 
                                          className="truncate font-bold"
                                          style={{ fontSize: '32px', lineHeight: '16px' }}
                                        >
                                          {magic.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <span 
                                          className={`font-mono ${isAffordable ? 'text-cyan-300' : 'text-red-400'}`}
                                          style={{ fontSize: '30px', lineHeight: '16px' }}
                                        >
                                          {magic.cost} MP
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 flex items-center justify-between">
                        {(() => {
                          const curr = COMBAT_MAGICS_DATA.find(m => m.name === selectedSubItem);
                          if (!curr) return <span>Selecione uma magia - Branco: Cura | Preto: Ataque | Cinza: Efeito</span>;
                          const b = getMagicDotBadge(curr.category);
                          return (
                            <div className="flex items-center gap-2 truncate">
                              <span className={`text-base ${b.dotColorClass}`}>{b.dotSymbol}</span>
                              <span className="text-yellow-300 font-bold">{curr.category}:</span>
                              <span className="truncate">{curr.desc}</span>
                            </div>
                          );
                        })()}
                    </div>
                </div>
             ) : activeUnit?.isPlayer && actionMenu === 'ITEM' ? (
                /* Submenu: Itens */
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                    <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <span 
                          className="text-white font-black tracking-wider"
                          style={{ fontSize: '35px', lineHeight: '16px' }}
                        >
                          ITENS
                        </span>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-cyan-300 hover:text-white font-bold tracking-wider transition-colors"
                        >
                          <span style={{ fontSize: '35px', lineHeight: '16px' }}>Voltar</span>
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {currentInventory.length === 0 ? (
                            <div className="col-span-2 text-center text-slate-400 py-4 font-mono">
                                Nenhum item na mochila
                            </div>
                        ) : (
                            currentInventory.map((item) => {
                                const count = item.count || 0;
                                const hasItem = count > 0;
                                return (
                                    <button
                                      key={item.id}
                                      onClick={() => handleUseItem(item)}
                                      disabled={!hasItem || isActionBusy || activeUnit.hasActed}
                                      className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                          hasItem && !activeUnit.hasActed
                                            ? 'text-white hover:bg-white/15'
                                            : 'text-slate-500 cursor-not-allowed'
                                      }`}
                                    >
                                        <div className="flex items-center gap-1 min-w-0">
                                            <span className="w-4 text-cyan-300 shrink-0">{hasItem ? '►' : ' '}</span>
                                            <span 
                                              className="truncate font-bold"
                                              style={{ fontSize: '35px', lineHeight: '16px' }}
                                            >
                                              {item.name}
                                            </span>
                                        </div>
                                        <span 
                                          className={`font-mono shrink-0 ml-2 ${hasItem ? 'text-cyan-300' : 'text-slate-600'}`}
                                          style={{ fontSize: '35px', lineHeight: '16px' }}
                                        >
                                            x{count}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 truncate">
                        Selecione um item para utilizar imediatamente
                    </div>
                </div>
             ) : (
                /* Default: Party Status HP/MP/SP Bars */
                <div className="flex flex-col gap-1 md:gap-2 h-full justify-around text-xl md:text-3xl">
                   {units.filter(u => u.isPlayer).map((player) => {
                       const isDefeated = player.stats.hp <= 0;
                       return (
                         <div 
                           key={player.id} 
                           className={`flex items-center tracking-widest ${
                             isDefeated 
                               ? 'text-red-500/70' 
                               : activeUnit?.id === player.id 
                                 ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                                 : 'text-slate-100'
                           }`}
                         >
                             <div className="w-40 md:w-64 truncate flex items-center gap-2">
                                {player.name || player.heroClass || 'Heroi'}
                             </div>
                             {isDefeated ? (
                               <div className="flex-1 text-center font-bold text-red-500 tracking-widest text-lg md:text-2xl">
                                 DERROTADO
                               </div>
                             ) : (
                               <>
                                 <div className="w-32 md:w-40 text-right pr-2 md:pr-4">HP {player.stats.hp.toString().padStart(3, '0')}</div>
                                 <div className="w-32 md:w-40 text-right pr-2 md:pr-4">MP {player.stats.mp.toString().padStart(3, '0')}</div>
                                 <div className="flex-1 flex items-center gap-2">
                                    <span className="text-lg md:text-2xl">SP</span>
                                    <div className="flex-1 h-3 md:h-4 bg-slate-900 border border-slate-500 rounded overflow-hidden">
                                       <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all" style={{ width: `${(player.stats.sp / player.stats.maxSp) * 100}%` }} />
                                    </div>
                                 </div>
                               </>
                             )}
                         </div>
                       );
                   })}
                </div>
             )}
          </div>
      </div>
    </div>
  );
};
