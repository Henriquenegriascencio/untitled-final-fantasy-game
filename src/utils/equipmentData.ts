import { Hero, EquipmentItem, EquipmentSlot, HeroEquipment } from '../types';

export const STARTER_EQUIPMENT_CATALOG: EquipmentItem[] = [
  // Armas (Mao Direita / Arma)
  { id: 'w_adaga_mithril', name: 'Adaga de Mithril', slot: 'rHand', batPwr: 18, speed: 2, icon: 'weapon', desc: 'Lamina agil de mithril leve' },
  { id: 'w_espada_longa', name: 'Espada Longa', slot: 'rHand', batPwr: 24, vigor: 3, icon: 'weapon', desc: 'Espada de combate forjada em ferro' },
  { id: 'w_espada_aco', name: 'Espada de Aco', slot: 'rHand', batPwr: 32, vigor: 5, icon: 'weapon', desc: 'Lamina pesada de corte profundo' },
  { id: 'w_cajado_arcano', name: 'Cajado Arcano', slot: 'rHand', batPwr: 16, magPwr: 9, magDef: 6, icon: 'weapon', desc: 'Canalizador de energias misticas' },
  { id: 'w_arco_elfico', name: 'Arco Elfico', slot: 'rHand', batPwr: 26, speed: 4, evade: 3, icon: 'weapon', desc: 'Dispara com precisao silvestre' },
  { id: 'w_luva_couro', name: 'Luvas de Couro', slot: 'rHand', batPwr: 20, stamina: 4, speed: 2, icon: 'weapon', desc: 'Combate corpo a corpo reforcado' },
  { id: 'w_chave_mestra', name: 'Chave Mestra', slot: 'rHand', batPwr: 22, vigor: 2, stamina: 3, icon: 'weapon', desc: 'Ferramenta pesada de impacto' },
  { id: 'w_excalibur', name: 'Excalibur', slot: 'rHand', batPwr: 48, vigor: 8, defense: 8, magPwr: 6, icon: 'weapon', desc: 'Espada sagrada dos reis de Eldoria' },

  // Escudos (Mao Esquerda / Escudo)
  { id: 's_escudo_redondo', name: 'Escudo Redondo', slot: 'lHand', defense: 12, evade: 5, icon: 'shield', desc: 'Escudo pequeno e agil de guarda' },
  { id: 's_ferro', name: 'Escudo de Ferro', slot: 'lHand', defense: 18, mBlock: 3, icon: 'shield', desc: 'Defesa solida contra ataques fisicos' },
  { id: 's_pesado', name: 'Escudo Pesado', slot: 'lHand', defense: 26, stamina: 3, mBlock: 2, icon: 'shield', desc: 'Grande barreira de protecao' },
  { id: 's_mistico', name: 'Broquel Mistico', slot: 'lHand', defense: 16, magDef: 14, mBlock: 7, icon: 'shield', desc: 'Encantado contra feiticos arcanos' },
  { id: 's_prata', name: 'Escudo de Prata', slot: 'lHand', defense: 28, magDef: 18, evade: 8, mBlock: 6, icon: 'shield', desc: 'Brilho de prata que repele as trevas' },

  // Capacetes e Tiaras (Cabeca / Elmo)
  { id: 'h_chapeu_couro', name: 'Chapeu de Couro', slot: 'head', defense: 8, magDef: 4, icon: 'head', desc: 'Chapeu flexivel de couro curtido' },
  { id: 'h_chapeu_mago', name: 'Chapeu de Mago', slot: 'head', magPwr: 5, magDef: 12, mBlock: 4, icon: 'head', desc: 'Aumenta concentracao magica' },
  { id: 'h_elmo_ferro', name: 'Elmo de Ferro', slot: 'head', defense: 15, stamina: 2, icon: 'head', desc: 'Protecao rigida para cavaleiros' },
  { id: 'h_tiara_mithril', name: 'Tiara de Mithril', slot: 'head', magPwr: 7, magDef: 16, mBlock: 6, icon: 'head', desc: 'Tiara ornamentada com gemas puras' },
  { id: 'h_coroa_real', name: 'Coroa Real', slot: 'head', vigor: 4, magPwr: 6, defense: 20, magDef: 18, icon: 'head', desc: 'Simbolo de autoridade soberana' },

  // Armaduras e Mantos (Corpo / Armadura)
  { id: 'b_armadura_couro', name: 'Armadura de Couro', slot: 'body', defense: 20, magDef: 8, icon: 'body', desc: 'Armadura leve para exploradores' },
  { id: 'b_manto_seda', name: 'Manto de Seda', slot: 'body', magPwr: 6, magDef: 24, evade: 4, mBlock: 5, icon: 'body', desc: 'Tecido fino que dissipa magias' },
  { id: 'b_cota_malha', name: 'Cota de Malha', slot: 'body', defense: 34, stamina: 4, magDef: 12, icon: 'body', desc: 'Aneis entreplacados de ferro' },
  { id: 'b_armadura_aco', name: 'Armadura de Aco', slot: 'body', defense: 46, vigor: 5, stamina: 4, icon: 'body', desc: 'Peitoral de aco impenetravel' },
  { id: 'b_manto_eldoria', name: 'Manto de Eldoria', slot: 'body', defense: 42, magDef: 32, magPwr: 8, vigor: 4, icon: 'body', desc: 'Vestimenta sagrada dos herois' },
];

export const getDefaultHeroEquipment = (hero: Hero): HeroEquipment => {
  if (hero.equipment && (hero.equipment.rHand !== undefined || hero.equipment.body !== undefined)) {
    return hero.equipment;
  }

  const cls = hero.heroClass;

  // 1. Monge e Mestre: Lutadores desarmados! Comecam sem armas pesadas para maximizar poder dos punhos
  if (cls === 'Monge' || cls === 'Mestre' || cls === 'Lutador') {
    return {
      rHand: null,
      lHand: null,
      head: {
        id: `starter_head_${hero.id}`,
        name: 'Faixa Marcial',
        slot: 'head',
        defense: 4,
        vigor: 4,
        speed: 2,
        icon: 'head',
        desc: 'Faixa leve para artistas marciais'
      },
      body: {
        id: `starter_body_${hero.id}`,
        name: 'Traje de Treino',
        slot: 'body',
        defense: 12,
        vigor: 6,
        speed: 3,
        icon: 'body',
        desc: 'Vestimenta leve que nao restringe movimentos'
      }
    };
  }

  // 2. Magos (Branco, Negro, Vermelho e evolucoes)
  if (cls === 'Mago Branco' || cls === 'Mago Branco Superior' || cls === 'Mago Negro' || cls === 'Mago Negro Superior') {
    return {
      rHand: {
        id: `starter_wep_${hero.id}`,
        name: cls.includes('Branco') ? 'Maca Sagrada' : 'Cajado Arcano',
        slot: 'rHand',
        batPwr: 14,
        magPwr: 12,
        magDef: 8,
        icon: 'weapon',
        desc: 'Canalizador de energia espiritual'
      },
      lHand: null,
      head: {
        id: `starter_head_${hero.id}`,
        name: 'Chapeu de Mago',
        slot: 'head',
        defense: 6,
        magPwr: 6,
        magDef: 12,
        mBlock: 5,
        icon: 'head',
        desc: 'Aumenta a concentracao arcana'
      },
      body: {
        id: `starter_body_${hero.id}`,
        name: 'Manto de Seda',
        slot: 'body',
        defense: 16,
        magDef: 24,
        magPwr: 8,
        mBlock: 6,
        icon: 'body',
        desc: 'Tecido fino com resistencia mistica'
      }
    };
  }

  // 3. Ladrao / Ninja
  if (cls === 'Ladrao' || cls === 'Ninja' || cls === 'Arqueiro') {
    return {
      rHand: {
        id: `starter_wep_${hero.id}`,
        name: 'Adaga de Mithril',
        slot: 'rHand',
        batPwr: 20,
        speed: 5,
        evade: 4,
        icon: 'weapon',
        desc: 'Lamina veloz para ataques rapidos'
      },
      lHand: {
        id: `starter_shd_${hero.id}`,
        name: 'Escudo Redondo',
        slot: 'lHand',
        defense: 10,
        evade: 6,
        icon: 'shield',
        desc: 'Escudo pequeno de manuseio rapido'
      },
      head: {
        id: `starter_head_${hero.id}`,
        name: 'Capuz de Bandido',
        slot: 'head',
        defense: 7,
        speed: 3,
        evade: 3,
        icon: 'head',
        desc: 'Capuz escuro que auxilia na evasao'
      },
      body: {
        id: `starter_body_${hero.id}`,
        name: 'Colete de Couro',
        slot: 'body',
        defense: 18,
        speed: 4,
        evade: 4,
        icon: 'body',
        desc: 'Vestimenta agil que nao atrapalha a fuga'
      }
    };
  }

  // 4. Guerreiro / Cavaleiro / Mago Vermelho / Padrao
  const defaultWeapon: EquipmentItem = {
    id: `starter_wep_${hero.id}`,
    name: hero.weapon?.name || 'Espada Longa',
    slot: 'rHand',
    batPwr: hero.weapon?.damage || 24,
    vigor: 3,
    icon: 'weapon',
    desc: 'Arma de combate forjada em ferro'
  };

  const defaultShield: EquipmentItem = {
    id: `starter_shd_${hero.id}`,
    name: 'Escudo de Ferro',
    slot: 'lHand',
    defense: 16,
    mBlock: 4,
    icon: 'shield',
    desc: 'Defesa solida contra ataques fisicos'
  };

  const defaultHead: EquipmentItem = {
    id: `starter_head_${hero.id}`,
    name: 'Elmo de Ferro',
    slot: 'head',
    defense: 12,
    vigor: 2,
    icon: 'head',
    desc: 'Protecao rigida para cavaleiros'
  };

  const defaultBody: EquipmentItem = {
    id: `starter_body_${hero.id}`,
    name: 'Cota de Malha',
    slot: 'body',
    defense: 32,
    vigor: 4,
    icon: 'body',
    desc: 'Peitoral de metal de alta durabilidade'
  };

  return {
    rHand: defaultWeapon,
    lHand: defaultShield,
    head: defaultHead,
    body: defaultBody,
  };
};

export interface CalculatedFF6Stats {
  batPwr: number; // Poder de Batalha
  defense: number; // Defesa
  magDef: number; // Defesa Magica
  mBlock: number; // Bloqueio Magico (em porcentagem)
  speed: number; // Velocidade
  vigor: number; // Vigor
  magPwr: number; // Poder de Magia
  stamina?: number;
  evade?: number;
}

export const calculateHeroFF6Stats = (hero: Hero, equipmentOverride?: HeroEquipment): CalculatedFF6Stats => {
  const eq = equipmentOverride || getDefaultHeroEquipment(hero);
  const items = [eq.rHand, eq.lHand, eq.head, eq.body].filter(Boolean) as EquipmentItem[];

  const bonusBatPwr = items.reduce((acc, it) => acc + (it.batPwr || 0), 0);
  const bonusDefense = items.reduce((acc, it) => acc + (it.defense || 0), 0);
  const bonusMagDef = items.reduce((acc, it) => acc + (it.magDef || 0), 0);
  const bonusMBlock = items.reduce((acc, it) => acc + (it.mBlock || 0), 0);
  const bonusSpeed = items.reduce((acc, it) => acc + (it.speed || 0), 0);
  const bonusVigor = items.reduce((acc, it) => acc + (it.vigor || 0), 0);
  const bonusMagPwr = items.reduce((acc, it) => acc + (it.magPwr || 0), 0);

  // Status base do heroi diretamente alinhados aos 7 status solicitados
  let baseBatPwr = hero.stats?.batPwr ?? (eq.rHand ? 24 : 14);
  let baseDefense = hero.stats?.def ?? 16;
  const baseMagDef = hero.stats?.magDef ?? 14;
  const baseMBlock = hero.stats?.mBlock ?? 10;
  let baseSpeed = hero.stats?.vel ?? 10;
  const baseVigor = hero.stats?.vigor ?? (hero.stats?.for ?? 16);
  const baseMagPwr = hero.stats?.magPwr ?? (hero.stats?.int ?? 12);

  // REGRA ESPECIAL DE CLASSE: MONGE & MESTRE
  // "Lutador desarmado. Causa muito dano com os punhos (quanto menos armas e armaduras pesadas usar, mais forte fica)."
  // "Mestre: Aumenta ainda mais o dano dos socos desarmados."
  const isMonkFamily = hero.heroClass === 'Monge' || hero.heroClass === 'Mestre' || hero.heroClass === 'Lutador';
  if (isMonkFamily) {
    const isMaster = hero.heroClass === 'Mestre';
    const isBareHanded = !eq.rHand;
    const isUnshielded = !eq.lHand;
    const hasHeavyArmor = eq.body?.name.includes('Aco') || eq.body?.name.includes('Cota');

    if (isBareHanded) {
      // Bonus massivo de punhos desarmados baseado no nivel e vigor
      const unarmedBonus = (hero.level * (isMaster ? 6 : 4)) + Math.round(baseVigor * (isMaster ? 1.4 : 1.0));
      baseBatPwr += unarmedBonus;
    }
    if (isUnshielded && !hasHeavyArmor) {
      // Bonus de agilidade e reflexos por nao carregar armadura pesada
      baseSpeed += isMaster ? 6 : 4;
      baseDefense += Math.round(hero.level * (isMaster ? 3 : 2));
    }
  }

  return {
    batPwr: baseBatPwr + bonusBatPwr,
    defense: baseDefense + bonusDefense,
    magDef: baseMagDef + bonusMagDef,
    mBlock: baseMBlock + bonusMBlock,
    speed: baseSpeed + bonusSpeed,
    vigor: baseVigor + bonusVigor,
    magPwr: baseMagPwr + bonusMagPwr,
  };
};
