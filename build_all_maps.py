def build_grid(w, h, fill='M'):
    return [[fill for _ in range(w)] for _ in range(h)]

def to_lines(grid):
    return [''.join(r) for r in grid]

all_maps = {}

# --- TOWNS (24 x 18) ---
def make_town(is_pravoca=False):
    g = build_grid(24, 18, '.')
    for x in range(24):
        g[0][x] = 'W'
        g[17][x] = 'W'
    for y in range(18):
        g[y][0] = 'W'
        g[y][23] = 'W'
    # House NW
    for y in range(2, 4):
        for x in range(2, 6):
            g[y][x] = 'H'
    g[4][3] = 'H'
    # Shop NE
    for y in range(2, 4):
        for x in range(18, 22):
            g[y][x] = 'P'
    g[4][19] = 'P'
    # Inn SW
    for y in range(14, 16):
        for x in range(2, 6):
            g[y][x] = 'I'
    g[13][3] = 'I'
    # Toolsmith SE
    for y in range(14, 16):
        for x in range(18, 22):
            g[y][x] = 'E'
    g[13][19] = 'E'
    # Canal
    for y in range(1, 17):
        g[y][15] = '~'
    g[3][15] = 'B'
    g[8][15] = 'B'
    g[9][15] = 'B'
    g[14][15] = 'B'
    if not is_pravoca:
        g[8][9] = '~'; g[8][10] = '~'; g[9][9] = '~'; g[9][10] = '~'
    # Lanterns
    g[1][11] = 'L'; g[3][7] = 'L'; g[8][7] = 'L'; g[9][7] = 'L'; g[14][7] = 'L'
    g[7][1] = 'L'; g[10][1] = 'L'; g[7][21] = 'L'; g[10][21] = 'L'
    # Trees
    for y in [5, 6]:
        for x in [4, 5, 20, 21]:
            g[y][x] = 'T'
    for y in [11, 12]:
        for x in [4, 5, 20, 21]:
            g[y][x] = 'T'
    # Flowerbeds
    for x in [3, 4, 6, 7]:
        g[1][x] = 'G'; g[16][x] = 'G'
    for x in [19, 20]:
        g[1][x] = 'G'; g[16][x] = 'G'
    g[16][21] = 'G'
    for x in [8, 9, 11, 12]:
        g[6][x] = 'G'; g[11][x] = 'G'
    # NPCs
    g[7][8] = 'N'
    g[7][18] = 'N'
    g[10][8] = 'N'
    g[10][18] = 'N'
    # Chests
    g[1][22] = 'X'
    g[16][1] = 'X'
    # South Gate
    g[16][10] = '<'
    g[16][11] = '<'
    g[16][12] = '<'
    if is_pravoca:
        for x in [3, 4, 6, 7, 10, 11]:
            g[1][x] = '~'
    return to_lines(g)

all_maps['TOWN_CORNELIA'] = make_town(is_pravoca=False)
all_maps['TOWN_PRAVOCA'] = make_town(is_pravoca=True)
all_maps['TOWN_GAIA'] = make_town(is_pravoca=False)

# --- DUNGEON HELPER (22 x 18) ---
def make_dungeon_f1(has_water=False):
    # Floor 1 template with branching corridors, chambers, chests and stairs
    g = build_grid(22, 18, 'M')
    # Carve main halls
    for x in range(1, 21):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][10] = '.'
        g[y][11] = '.'
    # West chamber (NW)
    for y in range(2, 6):
        for x in range(2, 6):
            g[y][x] = '.'
    # East chamber (NE)
    for y in range(2, 6):
        for x in range(15, 20):
            g[y][x] = '.'
    # SW Chamber
    for y in range(10, 14):
        for x in range(2, 6):
            g[y][x] = '.'
    # SE Chamber
    for y in range(10, 14):
        for x in range(15, 20):
            g[y][x] = '.'
    # Connecting corridors
    for x in range(5, 10):
        g[3][x] = '.'
        g[12][x] = '.'
    for x in range(12, 16):
        g[3][x] = '.'
        g[12][x] = '.'
    for y in range(5, 11):
        g[y][3] = '.'
        g[y][17] = '.'
    # Pillars
    g[3][3] = 'M'
    g[12][3] = 'M'
    g[3][18] = 'M'
    g[12][18] = 'M'
    # Entrance '<' at south (10, 16) and (11, 16)
    g[16][10] = '<'
    g[16][11] = '<'
    # Stairs down '>' at (17, 3)
    g[3][17] = '>'
    # Chests at (4, 3) and (17, 12)
    g[3][4] = 'X'
    g[12][17] = 'X'
    if has_water:
        for y in range(7, 10):
            g[y][10] = '~'
            g[y][11] = '~'
        g[8][10] = 'B'
        g[8][11] = 'B'
    return to_lines(g)

def make_dungeon_f2(boss_char='@', has_water=False):
    # Floor 2 template (Boss Chamber)
    g = build_grid(22, 18, 'M')
    # Main outer loop
    for x in range(1, 21):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][1] = '.'
        g[y][20] = '.'
    # Central Grand Sanctum (rows 5..11, cols 7..14)
    for y in range(5, 12):
        for x in range(7, 15):
            g[y][x] = '.'
    # Sanctum entrance corridors
    for x in range(2, 8):
        g[8][x] = '.'
    for x in range(14, 20):
        g[8][x] = '.'
    # Pillars around sanctum
    g[6][8] = 'M'; g[6][13] = 'M'
    g[10][8] = 'M'; g[10][13] = 'M'
    # Boss in center of sanctum at (11, 8)
    g[8][11] = boss_char
    # Stairs up '<' at (19, 2)
    g[2][19] = '<'
    # Chests in vaults at (3, 3) and (3, 13)
    g[3][3] = 'X'
    g[13][3] = 'X'
    if has_water:
        for x in range(8, 14):
            g[5][x] = '~'
            g[11][x] = '~'
        g[5][11] = 'B'
        g[11][11] = 'B'
    return to_lines(g)

all_maps['DUNGEON_PRELUDIO_1'] = make_dungeon_f1()
all_maps['DUNGEON_PRELUDIO_2'] = make_dungeon_f2()

all_maps['DUNGEON_DESAFIO_1'] = make_dungeon_f1()
all_maps['DUNGEON_DESAFIO_2'] = make_dungeon_f2()

all_maps['DUNGEON_TERRA_1'] = make_dungeon_f1()
all_maps['DUNGEON_TERRA_2'] = make_dungeon_f2()

all_maps['DUNGEON_FOGO_1'] = make_dungeon_f1()
all_maps['DUNGEON_FOGO_2'] = make_dungeon_f2()

all_maps['DUNGEON_AGUA_1'] = make_dungeon_f1(has_water=True)
all_maps['DUNGEON_AGUA_2'] = make_dungeon_f2(has_water=True)

# Mirage Tower (3 Floors)
all_maps['DUNGEON_AR_1'] = make_dungeon_f1()
def make_dungeon_ar2():
    g = build_grid(22, 18, 'M')
    for x in range(1, 21):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][10] = '.'
        g[y][11] = '.'
    for y in range(2, 6):
        for x in range(2, 6):
            g[y][x] = '.'
        for x in range(15, 20):
            g[y][x] = '.'
    for y in range(10, 14):
        for x in range(2, 6):
            g[y][x] = '.'
        for x in range(15, 20):
            g[y][x] = '.'
    for x in range(5, 10):
        g[3][x] = '.'; g[12][x] = '.'
    for x in range(12, 16):
        g[3][x] = '.'; g[12][x] = '.'
    for y in range(5, 11):
        g[y][3] = '.'; g[y][17] = '.'
    # Entry from F1 '<' at (19, 2)
    g[2][19] = '<'
    # Stairs to F3 '>' at (3, 3)
    g[3][3] = '>'
    # Chest at (17, 12)
    g[12][17] = 'X'
    return to_lines(g)

all_maps['DUNGEON_AR_2'] = make_dungeon_ar2()

def make_dungeon_ar3():
    g = build_grid(22, 18, 'M')
    for x in range(1, 21):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][1] = '.'
        g[y][20] = '.'
    for y in range(5, 12):
        for x in range(7, 15):
            g[y][x] = '.'
    for x in range(2, 8):
        g[8][x] = '.'
    for x in range(14, 20):
        g[8][x] = '.'
    g[6][8] = 'M'; g[6][13] = 'M'; g[10][8] = 'M'; g[10][13] = 'M'
    # Boss Tiamat
    g[8][11] = '@'
    # Stairs up '<' at (3, 3)
    g[3][3] = '<'
    # Chest at (17, 13)
    g[13][17] = 'X'
    return to_lines(g)

all_maps['DUNGEON_AR_3'] = make_dungeon_ar3()

# --- CHAOS SHRINE (24 x 18) ---
def make_chaos_f1():
    g = build_grid(24, 18, 'W')
    # Center ceremonial nave
    for y in range(1, 16):
        for x in range(10, 14):
            g[y][x] = '.'
    # Outer corridors connecting bastions
    for x in range(1, 23):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][1] = '.'
        g[y][22] = '.'
    # Corner Bastions
    # NW bastion
    for y in range(2, 5):
        for x in range(2, 6):
            g[y][x] = '.'
    g[3][3] = 'X'
    # NE bastion
    for y in range(2, 5):
        for x in range(18, 22):
            g[y][x] = '.'
    g[3][20] = 'X'
    # SW bastion
    for y in range(11, 14):
        for x in range(2, 6):
            g[y][x] = '.'
    g[12][3] = 'X'
    # SE bastion
    for y in range(11, 14):
        for x in range(18, 22):
            g[y][x] = '.'
    g[12][20] = 'X'
    # Pillars lining the nave
    g[5][9] = 'W'; g[5][14] = 'W'
    g[8][9] = 'W'; g[8][14] = 'W'
    g[11][9] = 'W'; g[11][14] = 'W'
    # Stairs down '>' at (11..12, 3)
    g[3][11] = '>'
    g[3][12] = '>'
    # South Grand Entrance '<' at (10..13, 16)
    g[16][10] = '<'
    g[16][11] = '<'
    g[16][12] = '<'
    g[16][13] = '<'
    return to_lines(g)

def make_chaos_f2():
    g = build_grid(24, 18, 'W')
    for x in range(1, 23):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][1] = '.'
        g[y][22] = '.'
        g[y][11] = '.'
        g[y][12] = '.'
    # Cross halls
    for x in range(1, 23):
        g[8][x] = '.'
    # Vaults
    for y in range(3, 7):
        for x in range(3, 7):
            g[y][x] = '.'
        for x in range(17, 21):
            g[y][x] = '.'
    g[4][4] = 'X'
    g[4][19] = 'X'
    # Stairs up '<' from F1 at (11, 2)
    g[2][11] = '<'
    # Stairs down '>' to F3 at (20, 2)
    g[2][20] = '>'
    return to_lines(g)

def make_chaos_f3():
    g = build_grid(24, 18, 'W')
    for x in range(1, 23):
        g[1][x] = '.'
        g[15][x] = '.'
    for y in range(1, 16):
        g[y][1] = '.'
        g[y][22] = '.'
    # Grand Throne Sanctum
    for y in range(4, 12):
        for x in range(8, 16):
            g[y][x] = '.'
    # Colonnade
    g[5][9] = 'W'; g[5][14] = 'W'
    g[7][9] = 'W'; g[7][14] = 'W'
    g[9][9] = 'W'; g[9][14] = 'W'
    # Boss Chaos
    g[8][11] = '@'
    # Entry stairs '<' from F2 at (20, 2)
    g[2][20] = '<'
    # Legendary Excalibur vaults
    g[3][3] = 'X'
    g[13][3] = 'X'
    return to_lines(g)

all_maps['DUNGEON_FINAL_1'] = make_chaos_f1()
all_maps['DUNGEON_FINAL_2'] = make_chaos_f2()
all_maps['DUNGEON_FINAL_3'] = make_chaos_f3()

# VALIDATE ALL
for name, m in all_maps.items():
    h = len(m)
    w = len(m[0])
    for idx, r in enumerate(m):
        assert len(r) == w, f'{name} row {idx} len {len(r)} != {w}'
    print(f'MAP {name} is VALID! ({w}x{h})')

print('\nALL MAPS CREATED AND VALIDATED SUCCESSFULLY!')
