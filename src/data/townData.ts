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
    subtitle: 'Tres Casas e Meia Arvore no Meio do Nada',
    welcomeMessage: 'Bem-vindo a Cornelia! A cidade mais generica e reciclada de todo o continente.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_elder',
        name: 'Lord Aldus',
        role: 'Anciao Desocupado',
        avatar: '',
        x: 8,
        y: 7,
        dialogue: [
          'Saudacoes, bando de adolescentes armados! Nosso reino corre perigo mortal.',
          'Em vez de chamar o exercito real ou a policia, vou mandar voces quatro que acabaram de brotar na grama.',
          'Vao ate a Caverna do Preludio no leste matar um monstro generico e pegar o Selo de Cobre.',
          'A guarda trancou a ponte leste e so libera com esse selo. Seguranca publica de altissima qualidade!',
          'Tragam o selo pra ca e talvez eu libere o resto desse jogo barato para voces.'
        ]
      },
      {
        id: 'cornelia_house_resident',
        name: 'Dona Marta',
        role: 'Moradora Conformada',
        avatar: '',
        x: 3,
        y: 4,
        dialogue: [
          'Entrem sem bater na porta, claro! Todo protagonista de RPG acha que a casa dos outros e dominio publico.',
          'Tem um bau no canto da minha sala. Podem pilhar minhas economias a vontade, ninguem aqui liga pra propriedade privada.',
          'A estalagem ali perto cura ferimentos mortais em dois segundos e de graca. Fisica e medicina mandaram lembrancas.'
        ]
      },
      {
        id: 'cornelia_guard',
        name: 'Sir Ronald',
        role: 'Guarda Decorativo',
        avatar: '',
        x: 8,
        y: 10,
        dialogue: [
          'Eu fico parado nesta mesma coordenada o dia inteiro fingindo que vigio a entrada da cidade.',
          'O mundo la fora tem monstros a cada tres passos, mas eu tenho ordens estritas de nao sair deste quadrado.',
          'Comprem espadas no ferramenteiro do sul. Elas custam os olhos da cara, mas o dano sobe tres pontinhos!'
        ]
      },
      {
        id: 'cornelia_scholar',
        name: 'Mestra Elena',
        role: 'Erudita do Copia e Cola',
        avatar: '',
        x: 18,
        y: 7,
        dialogue: [
          'Passei anos estudando os arquivos deste jogo e descobri a verdade: o enredo foi copiado de Final Fantasy de mil novecentos e oitenta e sete.',
          'Primeiro uma caverna boba, depois uma cidadela de teste, e no final quatro templos elementais com cristais de plastico.',
          'Superem essa burocracia de masmorras logo para ver se esse roteiro melhora no final!'
        ]
      },
      {
        id: 'cornelia_citizen',
        name: 'Tobias',
        role: 'Turista Perdido',
        avatar: '',
        x: 18,
        y: 10,
        dialogue: [
          'Dizem que o chefao do mal mora numa ilha isolada no noroeste, sentado num trono esperando a gente subir de nivel.',
          'Por que esses viloes nunca atacam a cidade enquanto a gente ainda esta no nivel um? Falta de nocao estrategica total.',
          'Enfim, durmam na estalagem de graca antes que o desenvolvedor decida cobrar pelo pernoite.'
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
    subtitle: 'Onde Barcos Nunca Saem do Lugar',
    welcomeMessage: 'Bem-vindo ao Porto de Pravoca! Nao repare nos navios parados, a mecanica de velejar nao foi feita.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_captain',
        name: 'Capitao Drake',
        role: 'Pirata Aposentado a Forca',
        avatar: '',
        x: 8,
        y: 7,
        dialogue: [
          'Ahoy! Vejo que voces trouxeram o Selo de Cobre da caverna dos novatos! Sejam bem-vindos a Pravoca.',
          'Nossos navios estao atracados ha decadas porque o programador ainda nao implementou a mecanica de navegar.',
          'Se pretendem subir as montanhas rumo a Gaia, preparem-se para a Cidadela dos Desafios e seus corredores cinzas repetidos!'
        ]
      },
      {
        id: 'pravoca_house_resident',
        name: 'Mestre Barnaby',
        role: 'Construtor Frustrado',
        avatar: '',
        x: 3,
        y: 4,
        dialogue: [
          'Ola marujos! Sou o construtor naval mais frustrado do mundo. Construo barcos lindos que servem apenas de enfeite estatico.',
          'Escondi um bau no canto sudoeste da cidade atras de caixas velhas. Pelo menos os baus funcionam nesse jogo!',
          'Cuidado com os monstros do mar... brincadeira, nem monstros marinhos tem aqui por falta de memoria de video!'
        ]
      },
      {
        id: 'pravoca_sage',
        name: 'Erudito Valerius',
        role: 'Sabio da Parede Invisivel',
        avatar: '',
        x: 18,
        y: 7,
        dialogue: [
          'A estrada norte para a Cidade de Gaia esta selada por uma barreira magica invisivel. Classica desculpa de RPG linear!',
          'Apenas aqueles que conquistarem a Cidadela dos Desafios receberao o Amuleto dos Sabios para liberar a passagem.',
          'O Cavaleiro Sombrio la dentro veste armadura preta e fala grosso, mas morre com tres magias bem encaixadas.'
        ]
      },
      {
        id: 'pravoca_blacksmith',
        name: 'Ferreiro Thorne',
        role: 'Armeiro Oportunista',
        avatar: '',
        x: 18,
        y: 10,
        dialogue: [
          'Forjei pecas de aco novinhas! Sao o mesmo sprite da espada de ferro com uma cor diferente, mas o ataque e maior.',
          'Passem todo o seu ouro no meu balcao antes de subir para a Cidadela dos Desafios!'
        ]
      },
      {
        id: 'pravoca_sailor',
        name: 'Jack Marinheiro',
        role: 'Observador do Vazio',
        avatar: '',
        x: 8,
        y: 10,
        dialogue: [
          'Fico olhando para esse mar azul o dia todo pensando por que a agua nao tem animacao de ondas.',
          'Ao sul do nosso porto fica o ardente Monte Gulg. Um vulcao inteiro de lava so pra derreter a sola dos sapatos dos herois.'
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
    subtitle: 'No Topo do Mundo Onde o FPS Cai',
    welcomeMessage: 'Bem-vindo a Gaia! A cidade sagrada onde os itens custam uma fortuna absurda.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_archmage',
        name: 'Arquimago Zephyr',
        role: 'Patriarca do Roteiro',
        avatar: '',
        x: 8,
        y: 7,
        dialogue: [
          'Inacreditavel! Voces realmente perderam tempo completando aquelas duas masmorras iniciais!',
          'Agora que a barreira do norte sumiu como num truque de magica, temos que inventar mais quatro tarefas para esticar o jogo.',
          'Templo da Terra a oeste, Monte Gulg a sudeste, Santuario da Agua nos mares e a Torre da Miragem nas nuvens!',
          'Juntem os Quatro Cristais para ver se o vilao supremo finalmente para de enrolar no noroeste.'
        ]
      },
      {
        id: 'gaia_house_resident',
        name: 'Hermita Nicholas',
        role: 'Hermita Antissocial',
        avatar: '',
        x: 3,
        y: 4,
        dialogue: [
          'Paz e serenidade. Moro isolado no topo desta montanha para fugir dos cliches de RPG, mas voces me acharam mesmo assim.',
          'A fonte da vila solta um barulho relaxante, mas e so um arquivo de audio curto em loop eterno.',
          'Peguem o item do meu bau e me deixem em paz meditando sobre o enredo sem nexo deste continente.'
        ]
      },
      {
        id: 'gaia_astronomer',
        name: 'Lyanna dos Astros',
        role: 'Observadora Celeste',
        avatar: '',
        x: 18,
        y: 7,
        dialogue: [
          'A Torre da Miragem flutua a oeste. Quem constroi uma torre voadora sem colocar para-raios e escada de incendio?',
          'Nossa loja aqui em Gaia vende armas lendarias com nomes pomposos como Excalibur e Masamune.',
          'Custam um absurdo de moedas, mas voce pode pagar vendendo garras de morcego pro ferreiro da esquina!'
        ]
      },
      {
        id: 'gaia_monk',
        name: 'Irmao Kael',
        role: 'Monge do Grind',
        avatar: '',
        x: 8,
        y: 10,
        dialogue: [
          'Parabens por chegarem a cidade mais alta do mapa! Aqui os monstros dao o dobro de dano para forcar a equipe a farmar nivel.',
          'Se a equipe inteira for derrotada, nao culpe o desenvolvedor: culpe quem esqueceu de comprar trinta pocoes de cura!'
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
    welcomeMessage: 'Voce invadiu a residencia de Dona Marta como se fosse sua casa.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_house_marta',
        name: 'Dona Marta',
        role: 'Moradora Paciente',
        avatar: '',
        x: 10,
        y: 5,
        dialogue: [
          'Ja disse que podem revirar meus armarios e meu bau! Privacidade nao existe em jogos de aventura.',
          'Fico impressionada como quatro guerreiros armados entram na casa de uma idosa e ninguem chama a policia.',
          'Pelo menos fechem a porta quando sairem, porque o vento apaga o fogo da lareira!'
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
    welcomeMessage: 'Bem-vindo ao emporio de pocoes e artigos superfaturados de Cornelia!',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_shop_merchant',
        name: 'Mestre Barnabe',
        role: 'Vendedor Mercenario',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Ola aventureiros! Bem-vindos a minha loja de curas milagrosas.',
          'Quer reviver um amigo que levou um golpe de machado na cabeca? Uma peninha de fenix resolve no mesmo instante!',
          'Interajam com o balcao e gastem todo o seu ouro antes que os monstros fiquem fortes demais!'
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
    welcomeMessage: 'O ferreiro passa o dia batendo ferro frio na bigorna para parecer ocupado.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_toolsmith_vorn',
        name: 'Ferreiro Vorn',
        role: 'Mestre da Obsolescencia',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Saudacoes guerreiros! Bem-vindos a Forja Real de Cornelia.',
          'Passei semanas forjando espadas de ferro que voces vao jogar fora assim que chegarem na proxima cidade.',
          'Aproximem-se do balcao para equipar armas basicas antes da Caverna do Preludio!'
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
    welcomeMessage: 'Um hotel cinco estrelas totalmente gratuito porque o desenvolvedor esqueceu de programar taxas.',
    innCost: 0,
    npcs: [
      {
        id: 'cornelia_inn_cedric',
        name: 'Taberneiro Cedric',
        role: 'Hospedeiro Caridoso',
        avatar: '',
        x: 10,
        y: 4,
        dialogue: [
          'Sejam bem-vindos a Estalagem de Cornelia!',
          'Aqui a estadia e zero moedas porque a economia deste jogo nao faz o menor sentido.',
          'Falem comigo no balcao ou cliquem nas camas para recuperar todo o HP e MP em meio segundo!'
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
    welcomeMessage: 'Projetos de barcos estao espalhados pela sala acumulando poeira ha anos.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_house_barnaby',
        name: 'Mestre Barnaby',
        role: 'Construtor Teotetico',
        avatar: '',
        x: 10,
        y: 5,
        dialogue: [
          'Entrem no meu barraco naval! Podem admirar meus mapas e surrupiar o bau no canto sem cerimonia.',
          'Um dia ainda vou programar uma jangada que navega de verdade pela agua. Ate la, continuem andando a pe!',
          'Pelo menos a Cidadela dos Desafios fica em terra firme. Boa sorte com aquele cavaleiro sombrio!'
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
    welcomeMessage: 'Pocoes importadas que vieram da mesma fabrica de Cornelia, apenas com etiquetas mais caras.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_shop_silas',
        name: 'Mercador Silas',
        role: 'Comerciante Esperto',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Bons ventos tragam o seu ouro ao Mercado do Porto de Pravoca!',
          'Dizem que os elixires vieram das caravelas do sul, mas na verdade comprei no atacado de Cornelia e dobrei o preco.',
          'Venham ao balcao negociar seus suprimentos antes que o estoque esgote!'
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
    welcomeMessage: 'Fagulhas saltam da bigorna enquanto o ferreiro finge trabalhar arduamente.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_toolsmith_thorne',
        name: 'Ferreiro Thorne',
        role: 'Armeiro Naval',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Bem-vindos a Forja Naval de Pravoca!',
          'Vendo espadas flamejantes e tridentes sagrados. Nao me pergunte como uma lamina pega fogo debaixo d agua!',
          'Aproximem-se do balcao para torrar suas moedas em equipamentos de combate!'
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
    welcomeMessage: 'O perfume de madeira polida e a lareira confortavel acolhem os cansados da caminhada.',
    innCost: 0,
    npcs: [
      {
        id: 'pravoca_inn_wendy',
        name: 'Taberneira Wendy',
        role: 'Estalajadeira dos Mares',
        avatar: '',
        x: 10,
        y: 4,
        dialogue: [
          'Bem-vindos a Estalagem do Marinheiro de Pravoca!',
          'Nossas camas sao macias e curam fraturas, envenenamento e cegueira em um piscar de olhos.',
          'Falem comigo no balcao ou usem os colchoes para renovar toda a forca da trupe sem custos!'
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
    welcomeMessage: 'Mais uma casa privada sendo invadida por estranhos armados ate os dentes.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_house_nicholas',
        name: 'Hermita Nicholas',
        role: 'Sabio Exausto',
        avatar: '',
        x: 10,
        y: 5,
        dialogue: [
          'Mais invasores de domicilio! Por que o criador deste jogo nao colocou trancas nas portas das casas?',
          'O bau esta ali no fundo, peguem logo o item e me deixem em paz com meus pensamentos profundos.',
          'E boa sorte escalando a Torre da Miragem, voces vao precisar de muita paciencia!'
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
    welcomeMessage: 'Frascos magicos brilhantes com rotulos caros para arrancar todo o ouro da equipe.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_shop_orion',
        name: 'Sabio Orion',
        role: 'Alquimista Extorsivo',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Saudacoes celestes! Bem-vindos ao Emporio Arcano das Alturas.',
          'Colocamos a palavra Celestial na frente de cada pocao e cobramos o triplo do preco normal.',
          'Interajam com o balcao e comprem elixires antes que os quatro lordes elementais aniquilem voces!'
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
    welcomeMessage: 'O fogo sagrado desta forja consome barras de metal e o saldo bancario dos aventureiros.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_toolsmith_hephaestus',
        name: 'Mestre Hephaestus',
        role: 'Armeiro Mitologico',
        avatar: '',
        x: 10,
        y: 3,
        dialogue: [
          'Bem-vindos a Forja Sagrada das Alturas!',
          'Aqui temos a lendaria espada Excalibur e a katana Masamune juntas na mesma prateleira de aldeia.',
          'Como duas armas de mitologias completamente diferentes vieram parar aqui? Nao faca perguntas dificeis, apenas passe o ouro!'
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
    welcomeMessage: 'Agua mineral e oracoes sagradas que curam ate a dor de cabeca de quem joga ha horas.',
    innCost: 0,
    npcs: [
      {
        id: 'gaia_inn_alistair',
        name: 'Guardiao Alistair',
        role: 'Sacerdote do Descanso',
        avatar: '',
        x: 10,
        y: 4,
        dialogue: [
          'Bem-vindos ao Santuario do Repouso de Gaia.',
          'Nossas camas sao tao abencoadas que restauram a saude fisica, a magia e a paciencia do jogador.',
          'Falem comigo no balcao ou deitem-se nas camas para recuperar toda a tropa antes do confronto final!'
        ]
      }
    ],
    shopItems: [],
    toolsmithWeapons: []
  }
};
