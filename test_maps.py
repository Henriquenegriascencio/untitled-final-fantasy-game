maps = {}

# TOWNS (24 x 18)
maps['TOWN_CORNELIA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'W..GG.GG...L...~...GG.XW',
    'W.HHHH.........~..PPPP.W',
    'W.HHHH.L.......B..PPPP.W',
    'W..H...........~...P...W',
    'W...TT.........~....TT.W',
    'W...TT..GG.GG..~....TT.W',
    'W.L....N.......~...N.L.W',
    'W.....L..~~....B.......W',
    'W.....L..~~....B.......W',
    'W.L....N.......~...N.L.W',
    'W...TT..GG.GG..~....TT.W',
    'W...TT.........~....TT.W',
    'W..I...........~...E...W',
    'W.IIII.L.......B..EEEE.W',
    'W.IIII.........~..EEEE.W',
    'WX.GG.GG..<<<..~...GG.GW',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
]

maps['TOWN_PRAVOCA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'W..~~..~~..~~..~...GG.XW',
    'W.HHHH.........B..PPPP.W',
    'W.HHHH.L.......~..PPPP.W',
    'W..H...........~...P...W',
    'W...TT.........~....TT.W',
    'W...TT..GG.GG..~....TT.W',
    'W.L....N.......~...N.L.W',
    'W......L.......B.......W',
    'W......L.......B.......W',
    'W.L....N.......~...N.L.W',
    'W...TT..GG.GG..~....TT.W',
    'W...TT.........~....TT.W',
    'W..I...........~...E...W',
    'W.IIII.L.......B..EEEE.W',
    'W.IIII.........~..EEEE.W',
    'WX.GG.GG..<<<..~...GG.GW',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
]

maps['TOWN_GAIA'] = [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'W..GG.GG...L...~...GG.XW',
    'W.HHHH.........~..PPPP.W',
    'W.HHHH.L.......B..PPPP.W',
    'W..H...........~...P...W',
    'W...TT.........~....TT.W',
    'W...TT..GG.GG..~....TT.W',
    'W.L....N.......~...N.L.W',
    'W.....L..~~....B.......W',
    'W.....L..~~....B.......W',
    'W.L....N.......~...N.L.W',
    'W...TT..GG.GG..~....TT.W',
    'W...TT.........~....TT.W',
    'W..I...........~...E...W',
    'W.IIII.L.......B..EEEE.W',
    'W.IIII.........~..EEEE.W',
    'WX.GG.GG..<<<..~...GG.GW',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
]

# DUNGEONS (22 x 18)
maps['DUNGEON_PRELUDIO_1'] = [
    'MMMMMMMMMMMMMMMMMMMMMM',
    'M....M.....M......M..M',
    'M.MM.M.MMM.M.MMMM.M..M',
    'M.XM...M.M.M....M.M.>M',
    'M.MMMM.M.M.MMMM.M.M..M',
    'M......M.M....M.M.MM.M',
    'MMMMMM.M.MMMM.M.M....M',
    'M......M....M.M.MMMM.M',
    'M.MMMMMM.MM.M.M......M',
    'M........M..M.MMMMMM.M',
    'MMMMMMMM.M.MM......M.M',
    'M........M....MMMM.M.M',
    'M.MMMMMMMMMMM....M.M.M',
    'M.M.........MMMM.M.X.M',
    'M.M.MMMMMMM....M.MMMMM',
    'M.M.......MMMM.M.....M',
    'M.MMMMMMM..<<..MMMMM.M',
    'MMMMMMMMMMMMMMMMMMMMMM'
]

maps['DUNGEON_PRELUDIO_2'] = [
    'MMMMMMMMMMMMMMMMMMMMMM',
    'M....M.....M......M..M',
    'M.MM.M.MMM.M.MMMM.M..M',
    'M.XM...M.....M..M.M.<M',
    'M.MMMM.M..M..M..M.MM.M',
    'M......M.MMM.M..M....M',
    'MMMMMM.M.....M.MMMM.M',
    'M......M..@..M......M',
    'M.MMMM.M.....M.MMMM.M',
    'M....M.MM...MM.M....M',
    'M.MM.M...MMM...M.MM.M',
    'M..M.MMM.....MMM.M..M',
    'MM.M...MMMMMMM...M.MM',
    'M.XM.M.........M.M..M',
    'M.MM.MMMMMMMMMMM.MM.M',
    'M....................M',
    'MMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMM'
]

# Validate so far
for k, m in maps.items():
    w = len(m[0])
    for idx, r in enumerate(m):
        assert len(r) == w, f'Map {k} row {idx} has length {len(r)} expected {w}'
    print(f'Map {k}: OK ({w}x{len(m)})')
