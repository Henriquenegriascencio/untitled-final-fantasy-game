import re

with open('src/constants.ts', 'r') as f:
    content = f.read()

# Let's extract all maps
map_regex = re.compile(r'^\s*([A-Z0-9_]+):\s*\[(.*?)\]\.map\(row => row\.split', re.DOTALL | re.MULTILINE)
matches = map_regex.findall(content)

errors = []
for map_name, grid_str in matches:
    lines = [l.strip().strip('"').strip(',') for l in grid_str.strip().split('\n') if l.strip().startswith('"')]
    if not lines:
        continue
    w = len(lines[0])
    h = len(lines)
    for idx, line in enumerate(lines):
        if len(line) != w:
            errors.append(f"{map_name} row {idx} len={len(line)} expected {w}: {line}")
    print(f"Map {map_name}: {w}x{h} OK")

if errors:
    print("\nERRORS FOUND:")
    for e in errors:
        print(e)
    exit(1)
else:
    print("\nALL MAPS IN src/constants.ts ARE 100% VALID AND EXACT RECTANGLES!")
