import build_all_maps

def format_ts_map(name, lines, comment=""):
    out = []
    if comment:
        out.append(f"  // {comment}")
    out.append(f"  {name}: [")
    for r in lines:
        out.append(f'    "{r}",')
    # remove trailing comma on last line
    out[-1] = out[-1][:-1]
    out.append("  ].map(row => row.split('') as MapTile[]),")
    return "\n".join(out)

# Generate towns
towns_ts = []
towns_ts.append(format_ts_map("TOWN_CORNELIA", build_all_maps.all_maps["TOWN_CORNELIA"], "CIDADE DE CORNELIA (Inspirada no modelo classico de cidade fortificada)"))
towns_ts.append(format_ts_map("TOWN_PRAVOCA", build_all_maps.all_maps["TOWN_PRAVOCA"], "CIDADE DE PRAVOCA (Porto maritimo com canais e docas)"))
towns_ts.append(format_ts_map("TOWN_GAIA", build_all_maps.all_maps["TOWN_GAIA"], "CIDADE DE GAIA (Santuario sagrado das montanhas)"))

with open("towns_ts.txt", "w") as f:
    f.write("\n\n".join(towns_ts))

# Generate dungeons
dungeons_ts = []
dungeons_ts.append(format_ts_map("DUNGEON_DESAFIO_1", build_all_maps.all_maps["DUNGEON_DESAFIO_1"], "MASMORRA NAO-ELEMENTAL 2: CIDADELA DOS DESAFIOS (Andar 1 - Labirinto de Provas)"))
dungeons_ts.append(format_ts_map("DUNGEON_DESAFIO_2", build_all_maps.all_maps["DUNGEON_DESAFIO_2"], "CIDADELA DOS DESAFIOS (Andar 2 - Arena dos Campeoes)"))

dungeons_ts.append(format_ts_map("DUNGEON_PRELUDIO_1", build_all_maps.all_maps["DUNGEON_PRELUDIO_1"], "1. DUNGEON PRELUDIO (Andar 1 - Caverna dos Novatos)"))
dungeons_ts.append(format_ts_map("DUNGEON_PRELUDIO_2", build_all_maps.all_maps["DUNGEON_PRELUDIO_2"], "DUNGEON PRELUDIO (Andar 2 - Covil da Gargula)"))

dungeons_ts.append(format_ts_map("DUNGEON_TERRA_1", build_all_maps.all_maps["DUNGEON_TERRA_1"], "2. DUNGEON TERRA (Andar 1 - Cavernas Rochosas de Lich)"))
dungeons_ts.append(format_ts_map("DUNGEON_TERRA_2", build_all_maps.all_maps["DUNGEON_TERRA_2"], "DUNGEON TERRA (Andar 2 - Sepulcro do Cristal da Terra)"))

dungeons_ts.append(format_ts_map("DUNGEON_FOGO_1", build_all_maps.all_maps["DUNGEON_FOGO_1"], "3. DUNGEON FOGO (Andar 1 - Caldeira de Monte Gulg)"))
dungeons_ts.append(format_ts_map("DUNGEON_FOGO_2", build_all_maps.all_maps["DUNGEON_FOGO_2"], "DUNGEON FOGO (Andar 2 - Nucleo Magmatico de Marilith)"))

dungeons_ts.append(format_ts_map("DUNGEON_AGUA_1", build_all_maps.all_maps["DUNGEON_AGUA_1"], "4. DUNGEON AGUA (Andar 1 - Santuario Submerso Aquatico)"))
dungeons_ts.append(format_ts_map("DUNGEON_AGUA_2", build_all_maps.all_maps["DUNGEON_AGUA_2"], "DUNGEON AGUA (Andar 2 - Abismo Abissal do Kraken)"))

dungeons_ts.append(format_ts_map("DUNGEON_AR_1", build_all_maps.all_maps["DUNGEON_AR_1"], "5. DUNGEON AR / TORRE DA MIRAGEM (Andar 1 - Vestibulo Celeste)"))
dungeons_ts.append(format_ts_map("DUNGEON_AR_2", build_all_maps.all_maps["DUNGEON_AR_2"], "DUNGEON AR (Andar 2 - Labirinto dos Ventos)"))
dungeons_ts.append(format_ts_map("DUNGEON_AR_3", build_all_maps.all_maps["DUNGEON_AR_3"], "DUNGEON AR (Andar 3 - Pinaculo de Tiamat)"))

dungeons_ts.append(format_ts_map("DUNGEON_FINAL_1", build_all_maps.all_maps["DUNGEON_FINAL_1"], "6. DUNGEON FINAL / TEMPLO DO CAOS (Andar 1 - Templo Simetrico com Bastioes)"))
dungeons_ts.append(format_ts_map("DUNGEON_FINAL_2", build_all_maps.all_maps["DUNGEON_FINAL_2"], "DUNGEON FINAL (Andar 2 - Catacumbas do Vazio)"))
dungeons_ts.append(format_ts_map("DUNGEON_FINAL_3", build_all_maps.all_maps["DUNGEON_FINAL_3"], "DUNGEON FINAL (Andar 3 - Trono Supremo de Chaos)"))

with open("dungeons_ts.txt", "w") as f:
    f.write("\n\n".join(dungeons_ts))

print("TS snippets generated successfully!")
