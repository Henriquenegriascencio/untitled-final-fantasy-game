import { Item, Weapon } from '../types';
import { WEAPONS, ITEMS } from '../constants';

export type TownNPC = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  x: number;
  y: number;
  dialogue: string[];
};

export type TownData = {
  id: string;
  name: string;
  subtitle: string;
  welcomeMessage: string;
  innCost: number;
  npcs: TownNPC[];
  shopItems: Item[];
  toolsmithWeapons: Weapon[];
};

export const TOWNS_CONFIG: Record<string, TownData> = {
  TOWN_CORNELIA: {
    id: 'TOWN_CORNELIA',
    name: 'Cidade de Cornelia',
    subtitle: 'Capital da Esperanca e Berco dos Herois',
    welcomeMessage: 'Bem-vindo a Cidade de Cornelia! O comercio esta ativo e os anciaos estao a disposicao.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_elder',
        name: 'Lord Aldus',
        role: 'Anciao de Cornelia',
        avatar: '',
        x: 4,
        y: 6,
        dialogue: [
          'Saudacoes, valorosos guerreiros! Nosso mundo esta em grande perigo.',
          'A leste destas terras fica a Caverna do Preludio, a primeira de duas masmorras guardias ancestrais.',
          'A fera que habita o segundo andar da caverna guarda o Selo de Cobre!',
          'Sem esse selo, a Guarda Real mantem a ponte leste trancada e ninguem pode viajar para a Cidade de Pravoca.',
          'Derrotem a criatura na Caverna do Preludio e tragam o Selo de Cobre para abrir o caminho!'
        ]
      },
      {
        id: 'cornelia_house_resident',
        name: 'Dona Marta',
        role: 'Moradora de Cornelia',
        avatar: '',
        x: 3,
        y: 2,
        dialogue: [
          'Ola, aventureiros! Esta e a minha humilde residencia.',
          'Dizem que no canto sudoeste da cidade, a Estalagem oferece camas macias e recupera toda a forca sem cobrar moedas.',
          'Se forem para a Caverna do Preludio, comprem varias Pocoes na Loja de Itens ao norte!'
        ]
      },
      {
        id: 'cornelia_guard',
        name: 'Sir Ronald',
        role: 'Guarda da Praca',
        avatar: '',
        x: 9,
        y: 12,
        dialogue: [
          'Eu vigio o portao de Cornelia! O mundo la fora e dez vezes mais vasto do que parece.',
          'Visitem o Ferramenteiro no canto sudeste da cidade para comprar laminas afiadas e arcos.',
          'E a Loja de Itens no nordeste vende Pocoes e Eteres para curar sua equipe durante as jornadas.'
        ]
      },
      {
        id: 'cornelia_scholar',
        name: 'Mestra Elena',
        role: 'Erudita dos Cristais',
        avatar: '',
        x: 15,
        y: 6,
        dialogue: [
          'Minhas pesquisas revelam que existem duas masmorras nao-elementais primordiais: a Caverna do Preludio e a Cidadela dos Desafios.',
          'Elas foram erguidas pelos povos antigos como provacoes obrigatorias para proteger o acesso as grandes cidades e aos Templos Elementais.',
          'Superem ambas as masmorras antes de tentar desafiar os Quatro Cristais!'
        ]
      },
      {
        id: 'cornelia_citizen',
        name: 'Tobias',
        role: 'Cidadao Viajante',
        avatar: '',
        x: 10,
        y: 12,
        dialogue: [
          'O Templo de Chaos fica em uma ilha isolada no extremo noroeste do mundo, cercada por montanhas colossais e mares profundos.',
          'Ninguem consegue alcanca-lo sem antes reunir o poder dos quatro templos elementais.',
          'Descansem sempre na Estalagem a oeste para recuperar todo o HP e MP da equipe sem custos!'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.pocao, count: 99, price: 25 },
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.antidoto, count: 99, price: 30 },
      { ...ITEMS.fenix, count: 99, price: 150 }
    ],
    toolsmithWeapons: [
      WEAPONS.espada_ferro,
      WEAPONS.espada_aco,
      WEAPONS.arco_longo,
      WEAPONS.cajado_aprendiz,
      WEAPONS.cajado_arcano,
      WEAPONS.luva_ferro,
      WEAPONS.chave_inglesa
    ]
  },

  TOWN_PRAVOCA: {
    id: 'TOWN_PRAVOCA',
    name: 'Cidade de Pravoca',
    subtitle: 'Porto Maritimo do Oceano Oriental',
    welcomeMessage: 'Bem-vindo ao Porto de Pravoca! A brisa marinha refresca os marinheiros e aventureiros.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_captain',
        name: 'Capitao Drake',
        role: 'Comandante do Porto',
        avatar: '',
        x: 4,
        y: 6,
        dialogue: [
          'Ahoy! Vejo que voces trazem o Selo de Cobre da Caverna do Preludio! Sejam bem-vindos a Pravoca.',
          'Nossos navios estao atracados porque as aguas do Santuario Submerso ao largo da costa ficaram violentas.',
          'Se pretendem subir as montanhas rumo a Cidade de Gaia, preparem-se para o maior teste de suas vidas!'
        ]
      },
      {
        id: 'pravoca_house_resident',
        name: 'Mestre Barnaby',
        role: 'Construtor Naval',
        avatar: '',
        x: 3,
        y: 2,
        dialogue: [
          'Ola, marujos! Aqui guardo minhas cartas nauticas e madeira tratada.',
          'Dizem que no canto sudoeste da cidade, atras das velhas caixas do porto, ha um bau com tesouro escondido!',
          'Explorem com cuidado cada viela da cidade!'
        ]
      },
      {
        id: 'pravoca_sage',
        name: 'Erudito Valerius',
        role: 'Sabio do Desfiladeiro',
        avatar: '',
        x: 15,
        y: 6,
        dialogue: [
          'A estrada norte para a Cidade de Gaia esta selada pela Barreira Ancestral.',
          'Apenas aqueles que conquistarem a Cidadela dos Desafios - nossa segunda masmorra ancestral nao-elemental - receberao o Amuleto dos Sabios!',
          'A Cidadela fica no planalto central entre as montanhas. O Cavaleiro Sombrio la dentro e impiedoso!'
        ]
      },
      {
        id: 'pravoca_blacksmith',
        name: 'Ferreiro Thorne',
        role: 'Armeiro Naval',
        avatar: '',
        x: 14,
        y: 12,
        dialogue: [
          'Forjei pecas reforcadas em aco temperado! Venha ao Ferramenteiro renovar suas armas antes de subir para a Cidadela dos Desafios.',
          'Criaturas blindadas habitam aquela fortaleza de pedra.'
        ]
      },
      {
        id: 'pravoca_sailor',
        name: 'Jack Marinheiro',
        role: 'Navegador Veterano',
        avatar: '',
        x: 9,
        y: 12,
        dialogue: [
          'Mais ao sul de nosso porto fica o ardente Monte Gulg, onde o magma consome tudo.',
          'Mas nada se compara ao frio da Cidadela dos Desafios. Sem o Amuleto dos Sabios, ninguem pisa no norte!'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.pocao, count: 99, price: 25 },
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.antidoto, count: 99, price: 30 },
      { ...ITEMS.fenix, count: 99, price: 150 },
      { ...ITEMS.elixir, count: 99, price: 500 }
    ],
    toolsmithWeapons: [
      WEAPONS.espada_aco,
      WEAPONS.espada_flamejante,
      WEAPONS.arco_longo,
      WEAPONS.arco_elfico,
      WEAPONS.cajado_arcano,
      WEAPONS.cajado_anciao,
      WEAPONS.tridente_sagrado
    ]
  },

  TOWN_GAIA: {
    id: 'TOWN_GAIA',
    name: 'Cidade de Gaia',
    subtitle: 'Santuario dos Sabios nas Alturas',
    welcomeMessage: 'Bem-vindo a Gaia! Os ventos sagrados sopram sobre o refugio dos mestres elementais.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_archmage',
        name: 'Arquimago Zephyr',
        role: 'Patriarca de Gaia',
        avatar: '',
        x: 4,
        y: 6,
        dialogue: [
          'Voces superaram a Caverna do Preludio e a Cidadela dos Desafios! O Amuleto dos Sabios resplandece com voces.',
          'Agora, a barreira esta aberta e os caminhos para os Quatro Templos Elementais estao liberados:',
          'O Templo da Terra a oeste, o Monte Gulg a sudeste, o Santuario Submerso nos mares, e a Torre da Miragem a oeste daqui!',
          'Reunam os 4 Cristais Sagrados para dissipar as trevas que cercam o Templo de Chaos no noroeste!'
        ]
      },
      {
        id: 'gaia_house_resident',
        name: 'Hermita Nicholas',
        role: 'Hermita da Montanha',
        avatar: '',
        x: 3,
        y: 2,
        dialogue: [
          'Paz e serenidade a voces, viajantes das estrelas.',
          'As fontes termais de Gaia acalmam qualquer ferida de batalha.',
          'No centro de nossa vila, a fonte sagrada emana pureza primordial.'
        ]
      },
      {
        id: 'gaia_astronomer',
        name: 'Lyanna dos Astros',
        role: 'Observadora Celeste',
        avatar: '',
        x: 15,
        y: 6,
        dialogue: [
          'A Torre da Miragem toca os ceus a oeste de nosso vale. La reside o Tiamat e o Cristal do Ar.',
          'Nossa forja em Gaia e a mais avancada do mundo. Compre armas lendarias com nosso mestre ferramenteiro antes das batalhas finais!'
        ]
      },
      {
        id: 'gaia_monk',
        name: 'Irmao Kael',
        role: 'Guardiao da Paz',
        avatar: '',
        x: 9,
        y: 12,
        dialogue: [
          'O mundo aguardava por campeoes como voces. As duas masmorras guardias provaram sua forca e sabedoria.',
          'Descansem sempre na nossa Estalagem antes de encarar cada um dos quatro lordes elementais.'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.fenix, count: 99, price: 150 },
      { ...ITEMS.elixir, count: 99, price: 450 }
    ],
    toolsmithWeapons: [
      WEAPONS.espada_aco,
      WEAPONS.espada_flamejante,
      WEAPONS.excalibur,
      WEAPONS.arco_elfico,
      WEAPONS.cajado_anciao,
      WEAPONS.masamune
    ]
  },

  // Interiores de Cornelia
  INTERIOR_CORNELIA_HOUSE: {
    id: 'INTERIOR_CORNELIA_HOUSE',
    name: 'Residencia de Cornelia',
    subtitle: 'Casa de Dona Marta',
    welcomeMessage: 'Voce entrou na residencia aconchegante de Dona Marta.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_house_marta',
        name: 'Dona Marta',
        role: 'Moradora Acolhedora',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bem-vindos a minha humilde casa em Cornelia!',
          'Fico muito feliz em receber aventureiros tao nobres e dedicados.',
          'Meu bau no canto tem um suprimento guardado, podem pegar livremente!',
          'Lembrem de visitar o Ferramenteiro e a Loja de Magias ao lado para estarem prontos.'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  },

  INTERIOR_CORNELIA_SHOP: {
    id: 'INTERIOR_CORNELIA_SHOP',
    name: 'Loja de Itens e Magias',
    subtitle: 'Emporio Comercial de Cornelia',
    welcomeMessage: 'Bem-vindo a Loja de Itens e Magias de Cornelia!',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_shop_merchant',
        name: 'Mestre Barnabe',
        role: 'Vendedor de Pocoes e Magias',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Ola viajantes! Bem-vindos ao Emporio de Cornelia.',
          'Aqui temos as melhores Pocoes de cura, Eteres e Magias para a sua equipe.',
          'Interajam com o balcao ou comigo para abrir o catalogo de compras e vendas!'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.pocao, count: 99, price: 25 },
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.antidoto, count: 99, price: 30 },
      { ...ITEMS.fenix, count: 99, price: 150 }
    ],
    toolsmithWeapons: []
  },

  INTERIOR_CORNELIA_TOOLSMITH: {
    id: 'INTERIOR_CORNELIA_TOOLSMITH',
    name: 'Forja e Ferramenteiro',
    subtitle: 'Oficina Real de Cornelia',
    welcomeMessage: 'O calor da forja e o som do martelo ecoam pela oficina.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_toolsmith_vorn',
        name: 'Ferreiro Vorn',
        role: 'Mestre Armeiro',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Saudacoes guerreiros! Bem-vindos a Forja Real de Cornelia.',
          'Trabalho com aco e ferro temperado de primeira qualidade.',
          'Aproximem-se do balcao para equipar seus combatentes com novas armas!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: [
      WEAPONS.espada_ferro,
      WEAPONS.espada_aco,
      WEAPONS.arco_longo,
      WEAPONS.cajado_aprendiz,
      WEAPONS.cajado_arcano,
      WEAPONS.luva_ferro,
      WEAPONS.chave_inglesa
    ]
  },

  INTERIOR_CORNELIA_INN: {
    id: 'INTERIOR_CORNELIA_INN',
    name: 'Estalagem de Cornelia',
    subtitle: 'Repouso dos Guerreiros da Luz',
    welcomeMessage: 'O ambiente calmo e acolhedor da estalagem revigora os espiritos.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_inn_cedric',
        name: 'Taberneiro Cedric',
        role: 'Hospedeiro de Cornelia',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Sejam bem-vindos a Estalagem de Cornelia!',
          'Aqui a estadia e gratuita para os nobres guerreiros da profecia.',
          'Falem comigo no balcao ou deitem-se nas camas para recuperar todo o HP e MP!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  },

  // Interiores de Pravoca
  INTERIOR_PRAVOCA_HOUSE: {
    id: 'INTERIOR_PRAVOCA_HOUSE',
    name: 'Residencia de Pravoca',
    subtitle: 'Casa de Mestre Barnaby',
    welcomeMessage: 'Plantas nauticas e maquetes de caravelas decoram a sala.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_house_barnaby',
        name: 'Mestre Barnaby',
        role: 'Construtor Naval Veterano',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Ahoy aventureiros! Bem-vindos ao meu estudio naval.',
          'Aqui desenho as quilhas dos navios mais velozes do oceano oriental.',
          'Ha um bau de provisao no canto da sala se precisarem de ajuda na jornada!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  },

  INTERIOR_PRAVOCA_SHOP: {
    id: 'INTERIOR_PRAVOCA_SHOP',
    name: 'Loja de Itens do Porto',
    subtitle: 'Emporio Maritimo de Pravoca',
    welcomeMessage: 'Frascos de pocoes aromaticas e pergaminhos preenchem as prateleiras.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_shop_silas',
        name: 'Mercador Silas',
        role: 'Comerciante do Porto',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bons ventos os tragam ao Mercado do Porto de Pravoca!',
          'Temos elixires e itens magicos trazidos pelas caravelas do mar do sul.',
          'Interajam com o balcao para negociar seus suprimentos de viagem!'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.pocao, count: 99, price: 25 },
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.antidoto, count: 99, price: 30 },
      { ...ITEMS.fenix, count: 99, price: 150 },
      { ...ITEMS.elixir, count: 99, price: 500 }
    ],
    toolsmithWeapons: []
  },

  INTERIOR_PRAVOCA_TOOLSMITH: {
    id: 'INTERIOR_PRAVOCA_TOOLSMITH',
    name: 'Forja dos Mares',
    subtitle: 'Oficina de Armas de Pravoca',
    welcomeMessage: 'Fagulhas brilhantes saltam da bigorna do armeiro naval.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_toolsmith_thorne',
        name: 'Ferreiro Thorne',
        role: 'Armeiro Naval',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bem-vindos a Forja Naval de Pravoca!',
          'Minhas laminas flamejantes e arcos longos resistem aos monstros marinhos.',
          'Aproximem-se do balcao para forjar seu novo equipamento de batalha!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: [
      WEAPONS.espada_aco,
      WEAPONS.espada_flamejante,
      WEAPONS.arco_longo,
      WEAPONS.arco_elfico,
      WEAPONS.cajado_arcano,
      WEAPONS.cajado_anciao,
      WEAPONS.tridente_sagrado
    ]
  },

  INTERIOR_PRAVOCA_INN: {
    id: 'INTERIOR_PRAVOCA_INN',
    name: 'Estalagem do Marinheiro',
    subtitle: 'Repouso dos Navegantes de Pravoca',
    welcomeMessage: 'O perfume de madeira polida e a lareira confortavel acolhem os viajantes.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_inn_wendy',
        name: 'Taberneira Wendy',
        role: 'Estalajadeira dos Mares',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bem-vindos a Estalagem do Marinheiro de Pravoca!',
          'Nossas camas sao confortaveis e o repouso aqui renova todo o seu vigor.',
          'Falem comigo no balcao para descansar a equipe sem custos!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  },

  // Interiores de Gaia
  INTERIOR_GAIA_HOUSE: {
    id: 'INTERIOR_GAIA_HOUSE',
    name: 'Retiro da Montanha',
    subtitle: 'Casa de Hermita Nicholas',
    welcomeMessage: 'O silencio sagrado da montanha traz serenidade absoluta.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_house_nicholas',
        name: 'Hermita Nicholas',
        role: 'Sabio da Montanha',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'A paz das alturas esteja com voces em meu retiro de Gaia.',
          'Medito diariamente sobre a harmonia dos Quatro Elementos Sagrados.',
          'Um tesouro ancestral descansa no bau ao fundo para ajudar os nobres campeoes.'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  },

  INTERIOR_GAIA_SHOP: {
    id: 'INTERIOR_GAIA_SHOP',
    name: 'Loja Celestial de Gaia',
    subtitle: 'Emporio Arcano dos Sabios',
    welcomeMessage: 'Vapores magicos e frascos celestiais brilham na penumbra.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_shop_orion',
        name: 'Sabio Orion',
        role: 'Alquimista Celestial',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Saudacoes celestes! Bem-vindos ao Emporio Arcano de Gaia.',
          'Dispomos de Elixires Divinos e Penas de Fenix de pureza incomparavel.',
          'Interajam com o balcao para adquirir suprimentos supremos!'
        ]
      }
    ],
    shopItems: [
      { ...ITEMS.hi_pocao, count: 99, price: 80 },
      { ...ITEMS.eter, count: 99, price: 75 },
      { ...ITEMS.fenix, count: 99, price: 150 },
      { ...ITEMS.elixir, count: 99, price: 450 }
    ],
    toolsmithWeapons: []
  },

  INTERIOR_GAIA_TOOLSMITH: {
    id: 'INTERIOR_GAIA_TOOLSMITH',
    name: 'Forja Lendaria de Gaia',
    subtitle: 'Oficina Sagrada dos Sabios',
    welcomeMessage: 'O fogo sagrado desta forja queima com a forca dos quatro elementos.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_toolsmith_hephaestus',
        name: 'Mestre Hephaestus',
        role: 'Armeiro dos Sabios',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bem-vindos a Forja Sagrada das Alturas!',
          'Aqui forjamos pecas lendarias como a gloriosa Excalibur e a katana Masamune.',
          'Aproximem-se do balcao para empunhar as melhores armas de todo o reino!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: [
      WEAPONS.espada_aco,
      WEAPONS.espada_flamejante,
      WEAPONS.excalibur,
      WEAPONS.arco_elfico,
      WEAPONS.cajado_anciao,
      WEAPONS.masamune
    ]
  },

  INTERIOR_GAIA_INN: {
    id: 'INTERIOR_GAIA_INN',
    name: 'Estalagem das Alturas',
    subtitle: 'Santuario do Repouso de Gaia',
    welcomeMessage: 'Agua benta e canticos de monges proporcionam a cura perfeita.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_inn_alistair',
        name: 'Guardiao Alistair',
        role: 'Sacerdote do Repouso',
        avatar: '',
        x: 5,
        y: 2,
        dialogue: [
          'Bem-vindos ao Santuario do Repouso de Gaia.',
          'Nossas preces restauram plenamente a forca e a magia de toda a sua equipe.',
          'Falem comigo no balcao ou deitem-se nas camas sagradas para descanso total!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  }
};
