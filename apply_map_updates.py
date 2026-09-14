with open('src/constants.ts', 'r') as f:
    content = f.read()

with open('towns_ts.txt', 'r') as f:
    towns_ts = f.read()

with open('dungeons_ts.txt', 'r') as f:
    dungeons_ts = f.read()

# 1. Towns replacement
start_towns_marker = "  // CIDADES DO JOGO\n  TOWN_CORNELIA: ["
end_towns_marker = "  // INTERIORES DAS CIDADES (Cornelia, Pravoca e Gaia)"

start_idx = content.find(start_towns_marker)
end_idx = content.find(end_towns_marker)
assert start_idx != -1, "start_towns_marker not found"
assert end_idx != -1, "end_towns_marker not found"

new_content = content[:start_idx] + towns_ts + "\n\n  " + content[end_idx:]

# 2. Dungeons replacement
start_dungeons_marker = "  // MASMORRA NAO-ELEMENTAL 2: CIDADELA DOS DESAFIOS (2 floors)\n  DUNGEON_DESAFIO_1: ["
end_dungeons_marker = "};\n\n// Aliases for backward compatibility"

start_d_idx = new_content.find(start_dungeons_marker)
end_d_idx = new_content.find(end_dungeons_marker)
assert start_d_idx != -1, "start_dungeons_marker not found"
assert end_d_idx != -1, "end_dungeons_marker not found"

new_content = new_content[:start_d_idx] + dungeons_ts + "\n" + new_content[end_d_idx:]

# 3. GET_DUNGEON_BOSS update coordinates
# Preludio
new_content = new_content.replace(
"""      id: 'boss_preludio',
      name: 'Gargula do Preludio',
      x: 8,
      y: 4,""",
"""      id: 'boss_preludio',
      name: 'Gargula do Preludio',
      x: 11,
      y: 8,"""
)
# Desafio
new_content = new_content.replace(
"""      id: 'boss_desafio',
      name: 'Cavaleiro Sombrio Ancestral',
      x: 7,
      y: 4,""",
"""      id: 'boss_desafio',
      name: 'Cavaleiro Sombrio Ancestral',
      x: 11,
      y: 8,"""
)
# Terra
new_content = new_content.replace(
"""      id: 'boss_terra',
      name: 'Lich da Terra',
      x: 8,
      y: 5,""",
"""      id: 'boss_terra',
      name: 'Lich da Terra',
      x: 11,
      y: 8,"""
)
# Fogo
new_content = new_content.replace(
"""      id: 'boss_fogo',
      name: 'Marilith de Fogo',
      x: 7,
      y: 5,""",
"""      id: 'boss_fogo',
      name: 'Marilith de Fogo',
      x: 11,
      y: 8,"""
)
# Agua
new_content = new_content.replace(
"""      id: 'boss_agua',
      name: 'Kraken Abissal',
      x: 7,
      y: 5,""",
"""      id: 'boss_agua',
      name: 'Kraken Abissal',
      x: 11,
      y: 8,"""
)
# Ar
new_content = new_content.replace(
"""      id: 'boss_ar',
      name: 'Tiamat dos Ceus',
      x: 7,
      y: 5,""",
"""      id: 'boss_ar',
      name: 'Tiamat dos Ceus',
      x: 11,
      y: 8,"""
)
# Chaos
new_content = new_content.replace(
"""    id: 'boss_chaos',
    name: 'Chaos Supremo',
    x: 8,
    y: 6,""",
"""    id: 'boss_chaos',
    name: 'Chaos Supremo',
    x: 11,
    y: 8,"""
)

# 4. Update CHESTS_DATA in new_content
chests_replacement = """export const CHESTS_DATA: Record<string, { type: 'item' | 'weapon' | 'gold'; itemId?: string; weaponId?: string; gold?: number; name: string }> = {
  // Cidades - Pracas e Jardins
  'TOWN_CORNELIA_22_1': { type: 'gold', gold: 100, name: '100 Moedas da Fonte de Cornelia' },
  'TOWN_CORNELIA_1_16': { type: 'item', itemId: 'pocao', name: 'Pocao dos Guardas de Cornelia' },
  'TOWN_PRAVOCA_22_1': { type: 'gold', gold: 150, name: '150 Moedas do Cais de Pravoca' },
  'TOWN_PRAVOCA_1_16': { type: 'item', itemId: 'antidoto', name: 'Antidoto dos Marinheiros' },
  'TOWN_GAIA_22_1': { type: 'gold', gold: 300, name: '300 Moedas Sagradas de Gaia' },
  'TOWN_GAIA_1_16': { type: 'item', itemId: 'eter', name: 'Eter Mago Celestial' },

  // Preludio Floor 1 & 2
  'DUNGEON_PRELUDIO_1_4_3': { type: 'item', itemId: 'pocao', name: 'Pocao de Cura da Ala Oeste' },
  'DUNGEON_PRELUDIO_1_17_12': { type: 'gold', gold: 120, name: '120 Moedas da Ala Leste' },
  'DUNGEON_PRELUDIO_2_3_3': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix do Santuario' },
  'DUNGEON_PRELUDIO_2_3_13': { type: 'weapon', weaponId: 'espada_ferro', name: 'Espada de Ferro Reforcada' },

  // Desafio Floor 1 & 2
  'DUNGEON_DESAFIO_1_4_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao da Prova de Coragem' },
  'DUNGEON_DESAFIO_1_17_12': { type: 'gold', gold: 300, name: '300 Moedas dos Campeoes' },
  'DUNGEON_DESAFIO_2_3_3': { type: 'item', itemId: 'eter', name: 'Eter Puro da Arena' },
  'DUNGEON_DESAFIO_2_3_13': { type: 'weapon', weaponId: 'espada_aco', name: 'Lamina dos Campeoes' },

  // Terra Floor 1 & 2
  'DUNGEON_TERRA_1_4_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao Mineral de Lich' },
  'DUNGEON_TERRA_1_17_12': { type: 'gold', gold: 280, name: '280 Moedas Petrificadas' },
  'DUNGEON_TERRA_2_3_3': { type: 'item', itemId: 'eter', name: 'Eter Magico da Terra' },
  'DUNGEON_TERRA_2_3_13': { type: 'weapon', weaponId: 'espada_aco', name: 'Espada de Aco Titanesco' },

  // Fogo Floor 1 & 2
  'DUNGEON_FOGO_1_4_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao Termica de Gulg' },
  'DUNGEON_FOGO_1_17_12': { type: 'gold', gold: 380, name: '380 Moedas da Caldeira' },
  'DUNGEON_FOGO_2_3_3': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix Flamejante' },
  'DUNGEON_FOGO_2_3_13': { type: 'weapon', weaponId: 'espada_flamejante', name: 'Lamina Flamejante de Marilith' },

  // Agua Floor 1 & 2
  'DUNGEON_AGUA_1_4_3': { type: 'item', itemId: 'elixir', name: 'Elixir das Correntes do Mar' },
  'DUNGEON_AGUA_1_17_12': { type: 'gold', gold: 450, name: '450 Moedas Submersas' },
  'DUNGEON_AGUA_2_3_3': { type: 'item', itemId: 'eter', name: 'Super Eter dos Oceanos' },
  'DUNGEON_AGUA_2_3_13': { type: 'weapon', weaponId: 'cajado_arcano', name: 'Cajado Arcano das Mares' },

  // Ar Floor 1, 2, 3
  'DUNGEON_AR_1_4_3': { type: 'item', itemId: 'hi_pocao', name: 'Hi-Pocao Celeste dos Ventos' },
  'DUNGEON_AR_1_17_12': { type: 'gold', gold: 600, name: '600 Moedas da Miragem' },
  'DUNGEON_AR_2_17_12': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix do Furacao' },
  'DUNGEON_AR_3_17_13': { type: 'weapon', weaponId: 'arco_elfico', name: 'Arco Elfico das Nuvens de Tiamat' },

  // Final Floor 1 (4 Bastioes), Floor 2 (Catacumbas), Floor 3 (Trono de Chaos)
  'DUNGEON_FINAL_1_3_3': { type: 'item', itemId: 'elixir', name: 'Elixir do Bastiao Noroeste' },
  'DUNGEON_FINAL_1_20_3': { type: 'gold', gold: 1200, name: '1200 Moedas do Bastiao Nordeste' },
  'DUNGEON_FINAL_1_3_12': { type: 'item', itemId: 'fenix', name: 'Pena de Fenix do Bastiao Sudoeste' },
  'DUNGEON_FINAL_1_20_12': { type: 'gold', gold: 1200, name: '1200 Moedas do Bastiao Sudeste' },
  'DUNGEON_FINAL_2_4_4': { type: 'item', itemId: 'elixir', name: 'Elixir das Catacumbas' },
  'DUNGEON_FINAL_2_19_4': { type: 'gold', gold: 1500, name: '1500 Moedas Antigas' },
  'DUNGEON_FINAL_3_3_3': { type: 'item', itemId: 'elixir', name: 'Elixir Supremo do Caos' },
  'DUNGEON_FINAL_3_3_13': { type: 'weapon', weaponId: 'excalibur', name: 'Lendaria Espada Excalibur' },"""

# Replace from export const CHESTS_DATA: Record<string, { ... up to // Baus dos Interiores
chests_start_marker = "export const CHESTS_DATA: Record<string, { type: 'item' | 'weapon' | 'gold'; itemId?: string; weaponId?: string; gold?: number; name: string }> = {"
chests_end_marker = "  // Baus dos Interiores das Cidades (Expandidos 20x15)"

c_start = new_content.find(chests_start_marker)
c_end = new_content.find(chests_end_marker)
assert c_start != -1, "chests_start_marker not found"
assert c_end != -1, "chests_end_marker not found"

new_content = new_content[:c_start] + chests_replacement + "\n\n" + new_content[c_end:]

with open('src/constants.ts', 'w') as f:
    f.write(new_content)

print("src/constants.ts updated successfully!")
