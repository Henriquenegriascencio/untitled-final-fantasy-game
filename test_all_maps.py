import sys

maps = {}

# 1. TOWNS (24 x 18)
maps['TOWN_CORNELIA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W..GG.GG...L...~...GG.XW', # 1 - secret chest at (22, 1)
    'W.HHHH.........~..PPPP.W', # 2
    'W.HHHH.L.......B..PPPP.W', # 3 - bridge to shop at (15, 3)
    'W..H...........~...P...W', # 4 - doors at (3, 4) and (19, 4)
    'W...TT.........~....TT.W', # 5
    'W...TT..GG.GG..~....TT.W', # 6
    'W.L....N.......~...N.L.W', # 7 - NPCs at (7, 7) and (19, 7)
    'W.....L..~~....B.......W', # 8 - fountain at (9, 8)-(10, 9), bridge at (15, 8)
    'W.....L..~~....B.......W', # 9 - bridge at (15, 9)
    'W.L....N.......~...N.L.W', # 10 - NPCs at (7, 10) and (19, 10)
    'W...TT..GG.GG..~....TT.W', # 11
    'W...TT.........~....TT.W', # 12
    'W..I...........~...E...W', # 13 - doors at (3, 13) and (19, 13)
    'W.IIII.L.......B..EEEE.W', # 14 - bridge to forge at (15, 14)
    'W.IIII.........~..EEEE.W', # 15
    'WX.GG.GG..<<<..~...GG.GW', # 16 - south gate at (10..12, 16), chest at (1, 16)
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

maps['TOWN_PRAVOCA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W..~~..~~..~~..~...GG.XW', # 1
    'W.HHHH.........B..PPPP.W', # 2
    'W.HHHH.L.......~..PPPP.W', # 3
    'W..H...........~...P...W', # 4
    'W...TT.........~....TT.W', # 5
    'W...TT..GG.GG..~....TT.W', # 6
    'W.L....N.......~...N.L.W', # 7
    'W......L.......B.......W', # 8
    'W......L.......B.......W', # 9
    'W.L....N.......~...N.L.W', # 10
    'W...TT..GG.GG..~....TT.W', # 11
    'W...TT.........~....TT.W', # 12
    'W..I...........~...E...W', # 13
    'W.IIII.L.......B..EEEE.W', # 14
    'W.IIII.........~..EEEE.W', # 15
    'WX.GG.GG..<<<..~...GG.GW', # 16
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

maps['TOWN_GAIA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W..GG.GG...L...~...GG.XW', # 1
    'W.HHHH.........~..PPPP.W', # 2
    'W.HHHH.L.......B..PPPP.W', # 3
    'W..H...........~...P...W', # 4
    'W...TT.........~....TT.W', # 5
    'W...TT..GG.GG..~....TT.W', # 6
    'W.L....N.......~...N.L.W', # 7
    'W.....L..~~....B.......W', # 8
    'W.....L..~~....B.......W', # 9
    'W.L....N.......~...N.L.W', # 10
    'W...TT..GG.GG..~....TT.W', # 11
    'W...TT.........~....TT.W', # 12
    'W..I...........~...E...W', # 13
    'W.IIII.L.......B..EEEE.W', # 14
    'W.IIII.........~..EEEE.W', # 15
    'WX.GG.GG..<<<..~...GG.GW', # 16
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

# 2. DUNGEON PRELUDIO (22 x 18)
maps['DUNGEON_PRELUDIO_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.M.M....M.M.>M', # 3 - chest at (2, 3), stairs down at (20, 3)
    'M.MMMM.M.M.MMMM.M.M..M', # 4
    'M......M.M....M.M.MM.M', # 5
    'MMMMMM.M.MMMM.M.M....M', # 6
    'M......M....M.M.MMMM.M', # 7
    'M.MMMMMM.MM.M.M......M', # 8
    'M........M..M.MMMMMM.M', # 9
    'MMMMMMMM.M.MM......M.M', # 10
    'M........M....MMMM.M.M', # 11
    'M.MMMMMMMMMMM....M.M.M', # 12
    'M.M.........MMMM.M.X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM....M.MMMMM', # 14
    'M.M.......MMMM.M.....M', # 15
    'M.MMMMMMM..<<..MMMMM.M', # 16 - stairs up/exit at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_PRELUDIO_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.....M..M.M.<M', # 3 - chest at (2, 3), stairs up at (20, 3)
    'M.MMMM.M..M..M..M.MM.M', # 4
    'M......M.MMM.M..M....M', # 5
    'MMMMMM.M.....M..MMMM.M', # 6
    'M......M..@..M.......M', # 7 - Boss Gargoyle at (10, 7)
    'M.MMMM.M.....M..MMMM.M', # 8
    'M....M.MM...MM..M....M', # 9
    'M.MM.M...MMM....M.MM.M', # 10
    'M..M.MMM.....MMM.M..M', # 11
    'MM.M...MMMMMMM...M.MM', # 12
    'M.XM.M.........M.M..M', # 13 - chest at (2, 13)
    'M.MM.MMMMMMMMMMM.MM.M', # 14
    'M....................M', # 15
    'MMMMMMMMMMMMMMMMMMMMMM', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 3. DUNGEON DESAFIO (22 x 18)
maps['DUNGEON_DESAFIO_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M....M....M', # 1
    'M.MM.M.MMM.>.MM.M.MM.M', # 2 - stairs down at (11, 2)
    'M.XM...M.M...M....M.XM', # 3 - chest at (2, 3) and (20, 3)
    'M.MMMM.M.MMMMM.MMMM.M', # 4
    'M......M.......M....M', # 5
    'MMMMMM.MMMM.MMMM.MM.M', # 6
    'M........M...M......M', # 7
    'M.MMMMMM.M.M.M.MMMM.M', # 8
    'M......M.M.M.M.M....M', # 9
    'M.MMMM.M.M.M.M.M.MM.M', # 10
    'M....M.M.M...M.M..M.M', # 11
    'MMMM.M.M.MMMMM.MM.M.M', # 12
    'M....M.........M....M', # 13
    'M.MMMMMMMM.MMMMM.MM.M', # 14
    'M........M.....M....M', # 15
    'MMMMMMMM...<<...MMMMM', # 16 - stairs up at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_DESAFIO_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M........M.M........M', # 1
    'M.MMMMMM.M<M.MMMMMM.M', # 2 - stairs up at (10, 2)
    'M.M......M.M......M.M', # 3
    'M.M.MMMM.M.M.MMMM.M.M', # 4
    'M.M.M....M.M....M.M.M', # 5
    'M.M.M.MM.M.M.MM.M.M.M', # 6
    'M...M.M..M.M..M.M...M', # 7
    'MMM.M.M..@....M.M.MMM', # 8 - Boss Cavaleiro at (9, 8)
    'M...M.M.......M.M...M', # 9
    'M.MMM.MM.M.M.MM.MMM.M', # 10
    'M.M......M.M......M.M', # 11
    'M.M.MMMM.M.M.MMMM.M.M', # 12
    'M.X.M....M.M....M.X.M', # 13 - chest at (2, 13) and (19, 13)
    'MMMMM.MM.M.M.MM.MMMMM', # 14
    'M........M.M........M', # 15
    'M.MMMMMMMM.MMMMMMMM.M', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 4. DUNGEON TERRA (22 x 18)
maps['DUNGEON_TERRA_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.M.M....M.M.>M', # 3 - chest at (2, 3), stairs down at (20, 3)
    'M.MMMM.M.M.MMMM.M.M..M', # 4
    'M......M.M....M.M.MM.M', # 5
    'MMMMMM.M.MMMM.M.M....M', # 6
    'M......M....M.M.MMMM.M', # 7
    'M.MMMMMM.MM.M.M......M', # 8
    'M........M..M.MMMMMM.M', # 9
    'MMMMMMMM.M.MM......M.M', # 10
    'M........M....MMMM.M.M', # 11
    'M.MMMMMMMMMMM....M.M.M', # 12
    'M.M.........MMMM.M.X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM....M.MMMMM', # 14
    'M.M.......MMMM.M.....M', # 15
    'M.MMMMMMM..<<..MMMMM.M', # 16 - stairs up/exit at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_TERRA_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.....M..M.M.<M', # 3 - chest at (2, 3), stairs up at (20, 3)
    'M.MMMM.M..M..M..M.MM.M', # 4
    'M......M.MMM.M..M....M', # 5
    'MMMMMM.M.....M..MMMM.M', # 6
    'M......M..@..M.......M', # 7 - Boss Lich at (10, 7)
    'M.MMMM.M.....M..MMMM.M', # 8
    'M....M.MM...MM..M....M', # 9
    'M.MM.M...MMM....M.MM.M', # 10
    'M..M.MMM.....MMM.M..M', # 11
    'MM.M...MMMMMMM...M.MM', # 12
    'M.XM.M.........M.M..M', # 13 - chest at (2, 13)
    'M.MM.MMMMMMMMMMM.MM.M', # 14
    'M....................M', # 15
    'MMMMMMMMMMMMMMMMMMMMMM', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 5. DUNGEON FOGO (22 x 18)
maps['DUNGEON_FOGO_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.M.M....M.M.>M', # 3 - chest at (2, 3), stairs down at (20, 3)
    'M.MMMM.M.M.MMMM.M.M..M', # 4
    'M......M.M....M.M.MM.M', # 5
    'MMMMMM.M.MMMM.M.M....M', # 6
    'M......M....M.M.MMMM.M', # 7
    'M.MMMMMM.MM.M.M......M', # 8
    'M........M..M.MMMMMM.M', # 9
    'MMMMMMMM.M.MM......M.M', # 10
    'M........M....MMMM.M.M', # 11
    'M.MMMMMMMMMMM....M.M.M', # 12
    'M.M.........MMMM.M.X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM....M.MMMMM', # 14
    'M.M.......MMMM.M.....M', # 15
    'M.MMMMMMM..<<..MMMMM.M', # 16 - stairs up/exit at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_FOGO_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.....M..M.M.<M', # 3 - chest at (2, 3), stairs up at (20, 3)
    'M.MMMM.M..M..M..M.MM.M', # 4
    'M......M.MMM.M..M....M', # 5
    'MMMMMM.M.....M..MMMM.M', # 6
    'M......M..@..M.......M', # 7 - Boss Marilith at (10, 7)
    'M.MMMM.M.....M..MMMM.M', # 8
    'M....M.MM...MM..M....M', # 9
    'M.MM.M...MMM....M.MM.M', # 10
    'M..M.MMM.....MMM.M..M', # 11
    'MM.M...MMMMMMM...M.MM', # 12
    'M.XM.M.........M.M..M', # 13 - chest at (2, 13)
    'M.MM.MMMMMMMMMMM.MM.M', # 14
    'M....................M', # 15
    'MMMMMMMMMMMMMMMMMMMMMM', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 6. DUNGEON AGUA (22 x 18)
maps['DUNGEON_AGUA_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...~.~.M....M.M.>M', # 3 - chest at (2, 3), stairs down at (20, 3)
    'M.MMMM.~.~.MMMM.M.M..M', # 4
    'M......~.~....M.M.MM.M', # 5
    'MMMMMM.B.BMMM.M.M....M', # 6 - stone bridges across water
    'M......~.~..M.M.MMMM.M', # 7
    'M.MMMMMM.MM.M.M......M', # 8
    'M........M..M.MMMMMM.M', # 9
    'MMMMMMMM.M.MM......M.M', # 10
    'M........M....MMMM.M.M', # 11
    'M.MMMMMMMMMMM....M.M.M', # 12
    'M.M.........MMMM.M.X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM....M.MMMMM', # 14
    'M.M.......MMMM.M.....M', # 15
    'M.MMMMMMM..<<..MMMMM.M', # 16 - stairs up/exit at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_AGUA_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.....M..M.M.<M', # 3 - chest at (2, 3), stairs up at (20, 3)
    'M.MMMM.M..~..M..M.MM.M', # 4
    'M......M.~~~.M..M....M', # 5
    'MMMMMM.M.~B~.M..MMMM.M', # 6 - bridge across pool
    'M......M..@..M.......M', # 7 - Boss Kraken at (10, 7)
    'M.MMMM.M.~~~.M..MMMM.M', # 8
    'M....M.MM~.~MM..M....M', # 9
    'M.MM.M...MMM....M.MM.M', # 10
    'M..M.MMM.....MMM.M..M', # 11
    'MM.M...MMMMMMM...M.MM', # 12
    'M.XM.M.........M.M..M', # 13 - chest at (2, 13)
    'M.MM.MMMMMMMMMMM.MM.M', # 14
    'M....................M', # 15
    'MMMMMMMMMMMMMMMMMMMMMM', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 7. DUNGEON AR (22 x 18)
maps['DUNGEON_AR_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.XM...M.M.M....M.M.>M', # 3 - chest at (2, 3), stairs down at (20, 3)
    'M.MMMM.M.M.MMMM.M.M..M', # 4
    'M......M.M....M.M.MM.M', # 5
    'MMMMMM.M.MMMM.M.M....M', # 6
    'M......M....M.M.MMMM.M', # 7
    'M.MMMMMM.MM.M.M......M', # 8
    'M........M..M.MMMMMM.M', # 9
    'MMMMMMMM.M.MM......M.M', # 10
    'M........M....MMMM.M.M', # 11
    'M.MMMMMMMMMMM....M.M.M', # 12
    'M.M.........MMMM.M.X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM....M.MMMMM', # 14
    'M.M.......MMMM.M.....M', # 15
    'M.MMMMMMM..<<..MMMMM.M', # 16 - stairs up/exit at (11..12, 16)
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_AR_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.>M...M.M.M....M.M.<M', # 3 - stairs down at (2, 3), stairs up at (20, 3)
    'M.MMMM.M.M.MMMM.M.MM.M', # 4
    'M......M.M....M.M....M', # 5
    'MMMMMM.M.MMMM.M.MMMM.M', # 6
    'M......M....M.M......M', # 7
    'M.MMMMMM.MM.M.M.MMMM.M', # 8
    'M........M..M.M......M', # 9
    'MMMMMMMM.M.MM.M.MMMM.M', # 10
    'M........M....M......M', # 11
    'M.MMMMMMMMMMM.MMMMMM.M', # 12
    'M.M.........M......X.M', # 13 - chest at (19, 13)
    'M.M.MMMMMMM.MMMM.MMMMM', # 14
    'M.M.......M....M.....M', # 15
    'M.MMMMMMM.MMMM.MMMMM.M', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

maps['DUNGEON_AR_3'] = [
    'MMMMMMMMMMMMMMMMMMMMMM', # 0
    'M....M.....M......M..M', # 1
    'M.MM.M.MMM.M.MMMM.M..M', # 2
    'M.<M...M.....M..M.M..M', # 3 - stairs up at (2, 3)
    'M.MMMM.M..M..M..M.MM.M', # 4
    'M......M.MMM.M..M....M', # 5
    'MMMMMM.M.....M..MMMM.M', # 6
    'M......M..@..M.......M', # 7 - Boss Tiamat at (10, 7)
    'M.MMMM.M.....M..MMMM.M', # 8
    'M....M.MM...MM..M....M', # 9
    'M.MM.M...MMM....M.MM.M', # 10
    'M..M.MMM.....MMM.M..M', # 11
    'MM.M...MMMMMMM...M.MM', # 12
    'M.XM.M.........M.M..M', # 13 - chest at (2, 13)
    'M.MM.MMMMMMMMMMM.MM.M', # 14
    'M....................M', # 15
    'MMMMMMMMMMMMMMMMMMMMMM', # 16
    'MMMMMMMMMMMMMMMMMMMMMM'  # 17
]

# 8. DUNGEON FINAL (CHAOS SHRINE) (24 x 18) - Image 6 Symmetrical Temple
maps['DUNGEON_FINAL_1'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W..W.W.W........W.W.W..W', # 1
    'W.XW.W.W...MM...W.W.WX.W', # 2 - chests in NW bastion at (2, 2) and NE bastion at (21, 2)
    'W..W.W.W...MM...W.W.W..W', # 3
    'W..........>>..........W', # 4 - stairs down to sanctum at (11..12, 4)
    'W.WW.WW.WW....WW.WW.WW.W', # 5
    'W.W......W....W......W.W', # 6
    'W.W......W....W......W.W', # 7
    'W.W.WWWW.W....W.WWWW.W.W', # 8
    'W.W.W....W....W....W.W.W', # 9
    'W.W.W....W....W....W.W.W', # 10
    'W.W.WWWW.W....W.WWWW.W.W', # 11
    'W.W......W....W......W.W', # 12
    'W..W.W.W...<<...W.W.W..W', # 13
    'W.XW.W.W........W.W.WX.W', # 14 - chests in SW bastion at (2, 14) and SE bastion at (21, 14)
    'W..W.W.W........W.W.W..W', # 15
    'WW.W.W.W..<<<<..W.W.W.WW', # 16 - south grand entrance gate at (10..13, 16)
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

maps['DUNGEON_FINAL_2'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W....W.....W....W.....WW', # 1
    'W.WW.W.WWW.W.WW.W.WWW.WW', # 2
    'W.XW...W.W.W....W.W..>WW', # 3 - chest at (2, 3), stairs down at (21, 3)
    'W.WWWW.W.W.WWWW.W.WW.WW', # 4
    'W......W.W<<..W.W....WW', # 5 - stairs up at (10..11, 5)
    'WWWWWW.W.WWWW.W.WWWW.WW', # 6
    'W......W....W.W......WW', # 7
    'W.WWWWWW.WW.W.W.WWWW.WW', # 8
    'W........W..W.W......WW', # 9
    'WWWWWWWW.W.WW.W.WWWW.WW', # 10
    'W........W....W......WW', # 11
    'W.WWWWWWWWWWW.WWWWWW.WW', # 12
    'W.W.........W......X.WW', # 13 - chest at (19, 13)
    'W.W.WWWWWWW.WWWW.WWWWWW', # 14
    'W.W.......W....W.....WW', # 15
    'W.WWWWWWW.WWWW.WWWWW.WW', # 16
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

maps['DUNGEON_FINAL_3'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW', # 0
    'W..W.W.W........W.W.W..W', # 1
    'W.XW.W.W...MM...W.W.W<WW', # 2 - chest at (2, 2), stairs up at (21, 2)
    'W..W.W.W...MM...W.W.W..W', # 3
    'W......................W', # 4
    'W.WW.WW.WW....WW.WW.WW.W', # 5
    'W.W......W....W......W.W', # 6
    'W.W......W.@..W......W.W', # 7 - Boss Chaos at (11, 7)
    'W.W.WWWW.W....W.WWWW.W.W', # 8
    'W.W.W....W....W....W.W.W', # 9
    'W.W.W....W....W....W.W.W', # 10
    'W.W.WWWW.W....W.WWWW.W.W', # 11
    'W.W......W....W......W.W', # 12
    'W..W.W.W........W.W.W..W', # 13
    'W.XW.W.W........W.W.WX.W', # 14 - chest at (2, 14) and (21, 14)
    'W..W.W.W........W.W.W..W', # 15
    'WW.W.W.W........W.W.W.WW', # 16
    'WWWWWWWWWWWWWWWWWWWWWWWW'  # 17
]

errors = 0
for k, m in maps.items():
    h = len(m)
    w = len(m[0])
    for idx, r in enumerate(m):
        if len(r) != w:
            print(f'ERROR: {k} row {idx} len={len(r)} expected {w}')
            errors += 1
    print(f'Validated {k}: {w}x{h}')

if errors == 0:
    print('ALL MAPS 100% VALID!')
else:
    sys.exit(1)
