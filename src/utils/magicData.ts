// Definicao e catalogo canonico das Magias nos 3 tipos:
// 1. Cura: Magia restauradora com ponto branco antes do nome. Foco na recuperacao.
// 2. Ataque: Magia ofensiva com ponto preto antes do nome. Foco em dano elemental ou nao elemental.
// 3. Efeito: Magia de status com ponto cinza antes do nome. Foco em suporte, buffs e debuffs.

export type MagicCategory = 'Cura' | 'Ataque' | 'Efeito';

export interface SpellDefinition {
  id: string;
  name: string;
  category: MagicCategory;
  cost: number;
  price: number; // Preco para comprar na Loja de Magia / Tomos
  desc: string;
  targetType: 'ally' | 'enemy' | 'all_allies' | 'all_enemies' | 'self';
  element?: 'fire' | 'ice' | 'lightning' | 'holy' | 'poison' | 'earth' | 'wind' | 'neutral';
  power?: number; // Poder base para cura ou dano
  effectType?: 'buff_atk' | 'buff_def' | 'slow' | 'haste' | 'sleep' | 'poison' | 'shield' | 'dispel';
  canCastInField?: boolean; // Se pode ser conjurada fora de combate no menu
}

// Catalogo completo de magias
export const SPELLS_CATALOG: Record<string, SpellDefinition> = {
  // === MAGIAS DE CURA (Ponto Branco: '○' ou '⚪') ===
  cura: {
    id: 'cura',
    name: 'Cura',
    category: 'Cura',
    cost: 10,
    price: 80,
    targetType: 'ally',
    element: 'holy',
    power: 45,
    desc: 'Restaura HP moderado de um aliado.',
    canCastInField: true
  },
  cura_2: {
    id: 'cura_2',
    name: 'Cura 2',
    category: 'Cura',
    cost: 24,
    price: 250,
    targetType: 'ally',
    element: 'holy',
    power: 110,
    desc: 'Restaura grande quantidade de HP de um aliado.',
    canCastInField: true
  },
  curaga: {
    id: 'curaga',
    name: 'Curaga',
    category: 'Cura',
    cost: 48,
    price: 600,
    targetType: 'all_allies',
    element: 'holy',
    power: 90,
    desc: 'Prece sagrada que restaura o HP de todo o grupo.',
    canCastInField: true
  },
  vida: {
    id: 'vida',
    name: 'Vida',
    category: 'Cura',
    cost: 30,
    price: 350,
    targetType: 'ally',
    element: 'holy',
    power: 50,
    desc: 'Revive um heroi caido com 50 de HP.',
    canCastInField: true
  },
  antidoto_magico: {
    id: 'antidoto_magico',
    name: 'Remedio',
    category: 'Cura',
    cost: 8,
    price: 70,
    targetType: 'ally',
    element: 'holy',
    desc: 'Remove veneno, queimadura e lentidao de um aliado.',
    canCastInField: true
  },

  // === MAGIAS DE ATAQUE (Ponto Preto: '●' ou '⚫') ===
  fogo: {
    id: 'fogo',
    name: 'Fogo',
    category: 'Ataque',
    cost: 10,
    price: 90,
    targetType: 'enemy',
    element: 'fire',
    power: 40,
    desc: 'Chamas ardentes que causam dano de fogo e queimadura.'
  },
  fogo_2: {
    id: 'fogo_2',
    name: 'Fogo 2',
    category: 'Ataque',
    cost: 25,
    price: 300,
    targetType: 'enemy',
    element: 'fire',
    power: 95,
    desc: 'Explosao de chamas intensas com dano massivo de fogo.'
  },
  gelo: {
    id: 'gelo',
    name: 'Gelo',
    category: 'Ataque',
    cost: 10,
    price: 90,
    targetType: 'enemy',
    element: 'ice',
    power: 38,
    desc: 'Estacas pontiagudas de gelo que congelam o alvo.'
  },
  gelo_2: {
    id: 'gelo_2',
    name: 'Gelo 2',
    category: 'Ataque',
    cost: 25,
    price: 300,
    targetType: 'enemy',
    element: 'ice',
    power: 90,
    desc: 'Tempestade de gelo profundo com alto poder de congelamento.'
  },
  trovao: {
    id: 'trovao',
    name: 'Trovao',
    category: 'Ataque',
    cost: 12,
    price: 100,
    targetType: 'enemy',
    element: 'lightning',
    power: 45,
    desc: 'Relampago eletrico veloz de impacto devastador.'
  },
  trovao_2: {
    id: 'trovao_2',
    name: 'Trovao 2',
    category: 'Ataque',
    cost: 28,
    price: 320,
    targetType: 'enemy',
    element: 'lightning',
    power: 105,
    desc: 'Descarga eletrica tempestuosa de altissima voltagem.'
  },
  cometa: {
    id: 'cometa',
    name: 'Cometa',
    category: 'Ataque',
    cost: 35,
    price: 500,
    targetType: 'enemy',
    element: 'neutral',
    power: 120,
    desc: 'Impacto astral nao-elemental que perfura qualquer resistencia.'
  },
  sismo: {
    id: 'sismo',
    name: 'Sismo',
    category: 'Ataque',
    cost: 28,
    price: 340,
    targetType: 'enemy',
    element: 'earth',
    power: 95,
    desc: 'Ruptura tectonica de terra que abala o chao do inimigo.'
  },

  // === MAGIAS DE EFEITO (Ponto Cinza: '•' ou '🔘') ===
  escudo: {
    id: 'escudo',
    name: 'Escudo',
    category: 'Efeito',
    cost: 12,
    price: 120,
    targetType: 'ally',
    effectType: 'buff_def',
    desc: 'Cria barreira protetora que eleva a Defesa do aliado.'
  },
  furia: {
    id: 'furia',
    name: 'Furia',
    category: 'Efeito',
    cost: 14,
    price: 130,
    targetType: 'ally',
    effectType: 'buff_atk',
    desc: 'Energiza a arma do aliado aumentando o Poder de Batalha.'
  },
  pressa: {
    id: 'pressa',
    name: 'Pressa',
    category: 'Efeito',
    cost: 16,
    price: 150,
    targetType: 'ally',
    effectType: 'haste',
    desc: 'Aumenta a Velocidade e o Movimento do heroi no grid.'
  },
  lentidao: {
    id: 'lentidao',
    name: 'Lentidao',
    category: 'Efeito',
    cost: 12,
    price: 110,
    targetType: 'enemy',
    effectType: 'slow',
    desc: 'Reduz a Velocidade e o alcance de movimento do inimigo.'
  },
  sono: {
    id: 'sono',
    name: 'Sono',
    category: 'Efeito',
    cost: 15,
    price: 140,
    targetType: 'enemy',
    effectType: 'sleep',
    desc: 'Mergulha o inimigo em torpor sonolento temporario.'
  },
  veneno: {
    id: 'veneno',
    name: 'Bio Veneno',
    category: 'Efeito',
    cost: 10,
    price: 100,
    targetType: 'enemy',
    effectType: 'poison',
    element: 'poison',
    desc: 'Infecta o alvo com toxina que causa dano a cada turno.'
  },

  // === MAGIAS SUPREMAS DE CLASSES SUPERIORES ===
  fade: {
    id: 'fade',
    name: 'Fade',
    category: 'Cura',
    cost: 60,
    price: 1200,
    targetType: 'all_enemies',
    element: 'holy',
    power: 180,
    desc: 'Luz sagrada primordial exclusiva de Mago Branco Superior que expurga as trevas.'
  },
  flare: {
    id: 'flare',
    name: 'Flare',
    category: 'Ataque',
    cost: 65,
    price: 1400,
    targetType: 'enemy',
    element: 'fire',
    power: 210,
    desc: 'Explosao termonuclear suprema exclusiva de Mago Negro Superior com dano devastador.'
  },
};

// Mapeamento de evolucao de classes
export const CLASS_PROMOTIONS: Record<string, string> = {
  'Guerreiro': 'Cavaleiro',
  'Ladrao': 'Ninja',
  'Monge': 'Mestre',
  'Mago Branco': 'Mago Branco Superior',
  'Mago Negro': 'Mago Negro Superior',
  'Mago Vermelho': 'Mago Vermelho Superior',
  // Retrocompatibilidade
  'Cavalheiro': 'Cavaleiro',
  'Arqueiro': 'Ninja',
  'Lutador': 'Mestre',
  'Alquimista': 'Mago Vermelho Superior',
  'Mago': 'Mago Negro Superior',
  'Inventor': 'Ninja'
};

// Verifica se um heroi pode aprender/equipar uma magia de acordo com sua classe e evolucao
export const canHeroLearnSpell = (heroClass: string, spellId: string): { allowed: boolean; reason?: string } => {
  const normSpell = spellId.toLowerCase().trim();

  // 1. Magia Suprema Branca: Fade
  if (normSpell === 'fade') {
    if (heroClass === 'Mago Branco Superior') return { allowed: true };
    return { allowed: false, reason: 'Exclusivo para Mago Branco Superior' };
  }

  // 2. Magia Suprema Negra: Flare
  if (normSpell === 'flare') {
    if (heroClass === 'Mago Negro Superior') return { allowed: true };
    return { allowed: false, reason: 'Exclusivo para Mago Negro Superior' };
  }

  // 3. Monge e Mestre: Luta desarmada pura, foco em vigor marcial
  if (heroClass === 'Monge' || heroClass === 'Mestre') {
    return { allowed: false, reason: 'Monges e Mestres nao utilizam tomos magicos' };
  }

  // 4. Guerreiro base: Tanque fisico puro, nao usa magia ate evoluir
  if (heroClass === 'Guerreiro') {
    return { allowed: false, reason: 'Guerreiro precisa evoluir para Cavaleiro para usar magia' };
  }

  // 5. Cavaleiro (Guerreiro evoluido): Magias brancas de nivel baixo
  if (heroClass === 'Cavaleiro' || heroClass === 'Cavalheiro') {
    const allowedSpells = ['cura', 'antidoto_magico', 'escudo'];
    if (allowedSpells.includes(normSpell)) return { allowed: true };
    return { allowed: false, reason: 'Cavaleiro domina apenas magias brancas basicas' };
  }

  // 6. Ladrao base: Agilidade e fuga, sem magia
  if (heroClass === 'Ladrao') {
    return { allowed: false, reason: 'Ladrao precisa evoluir para Ninja para usar magia' };
  }

  // 7. Ninja (Ladrao evoluido): Magias brancas e negras de nivel intermediario
  if (heroClass === 'Ninja' || heroClass === 'Arqueiro') {
    const allowedSpells = ['fogo', 'gelo', 'trovao', 'cura', 'antidoto_magico', 'pressa', 'escudo', 'lentidao', 'veneno'];
    if (allowedSpells.includes(normSpell)) return { allowed: true };
    return { allowed: false, reason: 'Ninja usa magias de nivel basico e intermediario' };
  }

  // 8. Mago Branco e Mago Branco Superior: Especialistas em Cura e Suporte
  if (heroClass === 'Mago Branco' || heroClass === 'Mago Branco Superior') {
    const spell = SPELLS_CATALOG[normSpell];
    if (spell && (spell.category === 'Cura' || spell.category === 'Efeito')) return { allowed: true };
    return { allowed: false, reason: 'Mago Branco utiliza apenas magias de Cura e Efeito' };
  }

  // 9. Mago Negro e Mago Negro Superior: Especialistas em Ataque e Debuffs
  if (heroClass === 'Mago Negro' || heroClass === 'Mago Negro Superior') {
    const spell = SPELLS_CATALOG[normSpell];
    if (spell && (spell.category === 'Ataque' || spell.category === 'Efeito')) return { allowed: true };
    return { allowed: false, reason: 'Mago Negro utiliza magias de Ataque e Debuffs' };
  }

  // 10. Mago Vermelho: Pau para toda obra, aprende magias brancas e negras basicas e intermediarias
  if (heroClass === 'Mago Vermelho') {
    const forbiddenHighLevel = ['curaga', 'vida', 'cometa', 'fogo_2', 'gelo_2', 'trovao_2', 'fade', 'flare'];
    if (forbiddenHighLevel.includes(normSpell)) {
      return { allowed: false, reason: 'Mago Vermelho nao domina magias de nivel maximo' };
    }
    return { allowed: true };
  }

  // 11. Mago Vermelho Superior: Melhora o dominio de magias intermediarias e avancadas (exceto as supremas)
  if (heroClass === 'Mago Vermelho Superior' || heroClass === 'Alquimista') {
    if (normSpell === 'fade' || normSpell === 'flare') {
      return { allowed: false, reason: 'Magias supremas sao exclusivas de Magos puros Superiores' };
    }
    return { allowed: true };
  }

  // Classes genericas
  return { allowed: true };
};

// Funcao auxiliar para obter a representacao visual do ponto conforme o tipo:
// Cura: ponto branco
// Ataque: ponto preto
// Efeito: ponto cinza
export const getMagicDotBadge = (category: MagicCategory) => {
  if (category === 'Cura') {
    return {
      dotSymbol: '○',
      dotColorClass: 'text-white drop-shadow-[0_0_2px_#ffffff]',
      label: 'Cura',
      badgeClass: 'bg-white/20 text-white border-white/60'
    };
  }
  if (category === 'Ataque') {
    return {
      dotSymbol: '●',
      dotColorClass: 'text-slate-900 drop-shadow-[0_0_1px_#ffffff]',
      label: 'Ataque',
      badgeClass: 'bg-red-950/60 text-red-300 border-red-500/50'
    };
  }
  // Efeito
  return {
    dotSymbol: '•',
    dotColorClass: 'text-slate-400 drop-shadow-[0_0_1px_#000000]',
    label: 'Efeito',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-500'
  };
};

export const getSpellByIdOrName = (identifier: string): SpellDefinition | undefined => {
  const norm = identifier.toLowerCase().trim();
  return (
    SPELLS_CATALOG[norm] ||
    Object.values(SPELLS_CATALOG).find(s => s.name.toLowerCase() === norm || s.id.toLowerCase() === norm)
  );
};
