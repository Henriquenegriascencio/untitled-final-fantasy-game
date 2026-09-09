import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Player, EnemyType, MapTile, MapId, Hero, HeroClass } from '../types';
import { MAPS, TILE_SIZE } from '../constants';
import { generateTextures } from '../utils/textures';

type ExplorationProps = {
  mapId: MapId;
  player: Player;
  enemies: { id: string; x: number; y: number; emoji: string; type: EnemyType }[];
  artifacts: { id: string; x: number; y: number; emoji: string }[];
  onMove: (dx: number, dy: number) => void;
  onInteract: () => void;
  onEquipWeapon: (wType: string) => void;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
};

// Default fallback party with all 4 classes if not yet initialized
const DEFAULT_FALLBACK_PARTY: Hero[] = [
  {
    id: 'hero_1',
    name: 'Caelen',
    heroClass: 'Cavalheiro',
    level: 1,
    exp: 0,
    stats: { hp: 120, maxHp: 120, mp: 20, maxMp: 20, sp: 0, maxSp: 100, for: 15, int: 5, def: 12, mov: 3, vel: 5 },
    weapon: { id: 'w_sword', name: 'Espada Longa', type: 'espada', range: 1, damage: 15 },
    emoji: '',
    magics: []
  },
  {
    id: 'hero_2',
    name: 'Lyra',
    heroClass: 'Mago',
    level: 1,
    exp: 0,
    stats: { hp: 60, maxHp: 60, mp: 100, maxMp: 100, sp: 0, maxSp: 100, for: 3, int: 18, def: 4, mov: 3, vel: 6 },
    weapon: { id: 'w_staff', name: 'Cajado de Aprendiz', type: 'cajado', range: 3, damage: 8, aoe: true },
    emoji: '',
    magics: ['Fogo', 'Cura']
  },
  {
    id: 'hero_3',
    name: 'Rowan',
    heroClass: 'Arqueiro',
    level: 1,
    exp: 0,
    stats: { hp: 75, maxHp: 75, mp: 30, maxMp: 30, sp: 0, maxSp: 100, for: 12, int: 6, def: 6, mov: 4, vel: 9 },
    weapon: { id: 'w_bow', name: 'Arco Curto', type: 'arco', range: 4, damage: 12 },
    emoji: '',
    magics: []
  },
  {
    id: 'hero_4',
    name: 'Elira',
    heroClass: 'Alquimista',
    level: 1,
    exp: 0,
    stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, sp: 0, maxSp: 100, for: 6, int: 14, def: 8, mov: 3, vel: 7 },
    weapon: { id: 'w_flask', name: 'Frasco Quimico', type: 'ferramenta', range: 2, damage: 10 },
    emoji: '',
    magics: ['Veneno']
  }
];

// Facing directions: 0 = Down, 1 = Up, 2 = Left, 3 = Right
type FacingDir = 0 | 1 | 2 | 3;

interface TrailNode {
  x: number;
  y: number;
  dir: FacingDir;
}

export const Exploration: React.FC<ExplorationProps> = ({ 
  mapId, 
  player, 
  enemies, 
  artifacts, 
  onMove, 
  onInteract, 
  onEquipWeapon,
  isMenuOpen = false,
  onToggleMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textures = useMemo(() => generateTextures(TILE_SIZE), []);

  // Mode 7 / 3D tilt option: enabled by default on OVERWORLD
  const [isTilted, setIsTilted] = useState(mapId === 'OVERWORLD');

  // Keep tilt synced with OVERWORLD
  useEffect(() => {
    if (mapId === 'OVERWORLD') {
      setIsTilted(true);
    }
  }, [mapId]);

  // Guaranteed 4-member party
  const partyHeroes = useMemo<Hero[]>(() => {
    if (player.party && player.party.length >= 4) {
      return player.party.slice(0, 4);
    }
    if (player.party && player.party.length > 0) {
      const list = [...player.party];
      for (const def of DEFAULT_FALLBACK_PARTY) {
        if (list.length >= 4) break;
        if (!list.some(h => h.heroClass === def.heroClass)) {
          list.push(def);
        }
      }
      while (list.length < 4) {
        list.push(DEFAULT_FALLBACK_PARTY[list.length]);
      }
      return list;
    }
    return DEFAULT_FALLBACK_PARTY;
  }, [player.party]);

  // Movement State Machine with fixed cadence
  // STEP_DURATION: exactly 210ms per tile. Holding a key will never exceed this speed!
  const STEP_DURATION = 210;
  
  const isMovingRef = useRef(false);
  const stepStartTimeRef = useRef(0);
  const moveDirectionRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const stepStartPosRef = useRef<{ x: number; y: number }>({ x: player.x, y: player.y });
  const stepTargetPosRef = useRef<{ x: number; y: number }>({ x: player.x, y: player.y });
  const leaderDirRef = useRef<FacingDir>(0);

  // Trail history for 4-member caterpillar followers
  const trailRef = useRef<TrailNode[]>([
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
  ]);

  // Current interpolated visual positions for camera and rendering
  const visualPositionsRef = useRef<Array<{ x: number; y: number; dir: FacingDir }>>([
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
    { x: player.x, y: player.y, dir: 0 },
  ]);

  // Track active held directional keys
  const heldKeysRef = useRef<Set<string>>(new Set());

  // Re-sync if player coordinate jumps (e.g. teleport/map change)
  useEffect(() => {
    const currentLeader = trailRef.current[0];
    if (Math.abs(player.x - currentLeader.x) > 1 || Math.abs(player.y - currentLeader.y) > 1) {
      isMovingRef.current = false;
      stepStartPosRef.current = { x: player.x, y: player.y };
      stepTargetPosRef.current = { x: player.x, y: player.y };
      trailRef.current = [
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
      ];
      visualPositionsRef.current = [
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
        { x: player.x, y: player.y, dir: 0 },
      ];
    }
  }, [player.x, player.y, mapId]);

  // Input event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Menu toggle
      if (e.key === 'm' || e.key === 'M') {
        if (onToggleMenu) {
          e.preventDefault();
          onToggleMenu();
          return;
        }
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onInteract();
        return;
      }

      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        heldKeysRef.current.add(e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        heldKeysRef.current.delete(e.key.toLowerCase());
      }
    };

    const handleBlur = () => {
      heldKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onToggleMenu, onInteract]);

  // Helper to determine facing direction from delta
  const getDirFromDelta = (dx: number, dy: number, currentDir: FacingDir): FacingDir => {
    if (dy > 0) return 0; // Down
    if (dy < 0) return 1; // Up
    if (dx < 0) return 2; // Left
    if (dx > 0) return 3; // Right
    return currentDir;
  };

  // Check if a tile can be stepped into
  const isTileWalkable = (x: number, y: number): boolean => {
    const currentMap = MAPS[mapId];
    if (y < 0 || y >= currentMap.length || x < 0 || x >= currentMap[0].length) return false;
    const tile = currentMap[y][x];
    if (tile === 'M' || tile === '~') return false; // Mountain and Water block
    return true;
  };

  // Attempt to initiate a fixed-cadence step
  const tryStartStep = (dx: number, dy: number) => {
    if (isMovingRef.current || isMenuOpen) return;

    const currentX = trailRef.current[0].x;
    const currentY = trailRef.current[0].y;
    const targetX = currentX + dx;
    const targetY = currentY + dy;

    // Always update facing direction even if blocked by mountain/water
    leaderDirRef.current = getDirFromDelta(dx, dy, leaderDirRef.current);
    trailRef.current[0].dir = leaderDirRef.current;

    // Check collision
    if (!isTileWalkable(targetX, targetY)) {
      return;
    }

    // Begin step transition
    isMovingRef.current = true;
    stepStartTimeRef.current = performance.now();
    moveDirectionRef.current = { dx, dy };
    stepStartPosRef.current = { x: currentX, y: currentY };
    stepTargetPosRef.current = { x: targetX, y: targetY };
  };

  // Resolve which direction key is currently held
  const getActiveDirection = (): { dx: number; dy: number } | null => {
    const keys = heldKeysRef.current;
    if (keys.has('w') || keys.has('arrowup')) return { dx: 0, dy: -1 };
    if (keys.has('s') || keys.has('arrowdown')) return { dx: 0, dy: 1 };
    if (keys.has('a') || keys.has('arrowleft')) return { dx: -1, dy: 0 };
    if (keys.has('d') || keys.has('arrowright')) return { dx: 1, dy: 0 };
    return null;
  };

  // Main Render and Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const currentMap = MAPS[mapId];

    // ZOOM level: 1.3x makes characters and tiles large, bold, and clear
    const ZOOM = 1.3;
    const effectiveTile = TILE_SIZE * ZOOM;
    const viewW = 1024 / effectiveTile;
    const viewH = 768 / effectiveTile;

    const render = (timestamp: number) => {
      // 1. STEP STATE MACHINE UPDATE
      if (isMovingRef.current) {
        const elapsed = timestamp - stepStartTimeRef.current;
        let progress = Math.min(1, elapsed / STEP_DURATION);

        // Interpolate Leader (index 0)
        const start = stepStartPosRef.current;
        const target = stepTargetPosRef.current;
        visualPositionsRef.current[0] = {
          x: start.x + (target.x - start.x) * progress,
          y: start.y + (target.y - start.y) * progress,
          dir: leaderDirRef.current
        };

        // Interpolate Followers 1, 2, 3
        // Each follower moves from trail[i] towards trail[i - 1]
        for (let i = 1; i < 4; i++) {
          const fromNode = trailRef.current[i];
          const toNode = trailRef.current[i - 1];
          const followDx = toNode.x - fromNode.x;
          const followDy = toNode.y - fromNode.y;
          const followerDir = getDirFromDelta(followDx, followDy, fromNode.dir);

          visualPositionsRef.current[i] = {
            x: fromNode.x + followDx * progress,
            y: fromNode.y + followDy * progress,
            dir: followerDir
          };
        }

        // Check step completion
        if (progress >= 1) {
          isMovingRef.current = false;

          // Commit destination to trail
          const finalLeaderPos = {
            x: stepTargetPosRef.current.x,
            y: stepTargetPosRef.current.y,
            dir: leaderDirRef.current
          };

          const newTrail: TrailNode[] = [finalLeaderPos];
          for (let i = 0; i < 3; i++) {
            newTrail.push({ ...trailRef.current[i] });
          }
          trailRef.current = newTrail;

          // Snap visual positions to exact tiles
          for (let i = 0; i < 4; i++) {
            visualPositionsRef.current[i] = { ...trailRef.current[i] };
          }

          // Trigger game step callback
          const { dx, dy } = moveDirectionRef.current;
          onMove(dx, dy);

          // If a direction is STILL held, seamlessly chain the next step at exact cadence
          const nextDir = getActiveDirection();
          if (nextDir) {
            tryStartStep(nextDir.dx, nextDir.dy);
          }
        }
      } else {
        // When stationary, check if direction key is held
        const nextDir = getActiveDirection();
        if (nextDir) {
          tryStartStep(nextDir.dx, nextDir.dy);
        }
      }

      // 2. CAMERA CALCULATION (Centered on Leader)
      const leaderVisual = visualPositionsRef.current[0];
      const cameraX = Math.max(0, Math.min(currentMap[0].length - viewW, leaderVisual.x - viewW / 2 + 0.5));
      const cameraY = Math.max(0, Math.min(currentMap.length - viewH, leaderVisual.y - viewH / 2 + 0.5));

      // 3. DRAW CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(ZOOM, ZOOM);

      // Draw Map Ground Tiles
      const startX = Math.floor(cameraX);
      const startY = Math.floor(cameraY);
      const offsetX = (cameraX - startX) * TILE_SIZE;
      const offsetY = (cameraY - startY) * TILE_SIZE;

      for (let y = -1; y <= viewH + 2; y++) {
        for (let x = -1; x <= viewW + 2; x++) {
          const mapX = startX + x;
          const mapY = startY + y;

          let tile: string | MapTile = 'M';
          if (mapY >= 0 && mapY < currentMap.length && mapX >= 0 && mapX < currentMap[0].length) {
            tile = currentMap[mapY][mapX];
          }

          const drawX = x * TILE_SIZE - offsetX;
          const drawY = y * TILE_SIZE - offsetY;

          let texture = textures.grass;
          if (tile === '~') texture = textures.water;
          else if (tile === 'M') texture = textures.mountain;
          else if (['1','2','3','4'].includes(tile as string)) texture = textures.dungeon;
          else if (tile === 'F' || tile === '<') texture = textures.dungeon;
          else if (tile === 'S' || tile === 'C') texture = textures.town;

          ctx.drawImage(texture, drawX, drawY);

          // Subtle grid line / tile relief
          ctx.strokeStyle = 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

          // Final boss portal seal
          if (tile === 'F' && player.artifacts.length < 4) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#ef4444';
            ctx.strokeRect(drawX + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          }

          // Town / City entrance landmark
          if (tile === 'C') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
            ctx.beginPath();
            ctx.arc(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('CIDADE', drawX + TILE_SIZE / 2, drawY + TILE_SIZE - 3);
          }
        }
      }

      // Draw Artifacts with glowing pulse and floating hover
      const floatOffset = Math.sin(timestamp * 0.005) * 3;
      artifacts.forEach(art => {
        if (art.x >= cameraX - 1 && art.x < cameraX + viewW + 1 && art.y >= cameraY - 1 && art.y < cameraY + viewH + 1) {
          const screenX = (art.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
          const screenY = (art.y - cameraY) * TILE_SIZE + TILE_SIZE / 2;

          // Golden glow ring
          ctx.save();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.beginPath();
          ctx.arc(screenX, screenY + 4, 18, 0, Math.PI * 2);
          ctx.fill();

          // Drop shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 12, 12, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(art.emoji, screenX, screenY + floatOffset);
          ctx.restore();
        }
      });

      // Draw Enemies
      enemies.forEach(enemy => {
        if (enemy.x >= cameraX - 1 && enemy.x < cameraX + viewW + 1 && enemy.y >= cameraY - 1 && enemy.y < cameraY + viewH + 1) {
          const screenX = (enemy.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
          const screenY = (enemy.y - cameraY) * TILE_SIZE + TILE_SIZE / 2;

          ctx.save();
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 12, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          if (enemy.id === 'boss') {
            // Boss menacing aura
            ctx.fillStyle = 'rgba(220, 38, 38, 0.4)';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '40px sans-serif';
          } else {
            ctx.font = '32px sans-serif';
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(enemy.emoji, screenX, screenY);
          ctx.restore();
        }
      });

      // 4. DRAW THE 4 PARTY CHARACTERS (Sorted by Y for correct isometric depth)
      // Each character is drawn at prominent 56px height with class colors, walk bobbing & facing direction!
      const walkPhase = isMovingRef.current ? ((timestamp - stepStartTimeRef.current) / STEP_DURATION) : 0;

      // Prepare party render items
      const partyToRender = partyHeroes.map((hero, index) => {
        const pos = visualPositionsRef.current[index];
        const screenX = (pos.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
        const screenY = (pos.y - cameraY) * TILE_SIZE + TILE_SIZE / 2;
        return {
          hero,
          index,
          screenX,
          screenY,
          pos,
          facingDir: pos.dir
        };
      });

      // Sort by Y so units standing in front occlude units behind them
      partyToRender.sort((a, b) => a.screenY - b.screenY);

      partyToRender.forEach(({ hero, index, screenX, screenY, facingDir }) => {
        drawPartyHero(
          ctx,
          hero,
          screenX,
          screenY,
          facingDir,
          walkPhase,
          isMovingRef.current,
          index
        );
      });

      ctx.restore(); // Restore zoom scale

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [partyHeroes, enemies, artifacts, mapId, isMenuOpen, onMove]);

  return (
    <div 
      className="absolute inset-0 bg-[#020617] overflow-hidden select-none"
      style={{
        perspective: '950px',
        perspectiveOrigin: '50% 65%',
      }}
    >
      {/* 3D Mode 7 Tilted World Map Container */}
      <div
        className="w-full h-full origin-[50%_65%] transition-transform duration-500 ease-out"
        style={{
          transform: isTilted ? 'rotateX(22deg) scale(1.18)' : 'none',
          transformStyle: 'preserve-3d',
        }}
      >
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          className="block w-full h-full object-cover"
        />
      </div>

      {/* TOP LEFT: Artifacts Tracker */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        {['Fogo', 'Agua', 'Ar', 'Terra'].map((art) => (
          <span 
            key={art} 
            className={`px-3.5 py-1.5 rounded-full text-sm md:text-base font-black tracking-wide shadow-lg transition-colors ${
              player.artifacts.includes(art) 
                ? 'bg-yellow-400 text-yellow-950 shadow-yellow-400/60 ring-2 ring-yellow-300' 
                : 'bg-slate-900/90 text-slate-400 border border-slate-700'
            }`}
          >
            {art}
          </span>
        ))}
      </div>

      {/* TOP RIGHT: Tilt Toggle, Menu Button, Gold and Realm Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
        {/* Perspective Mode 7 Toggle */}
        <button
          id="toggle_map_tilt_btn"
          onClick={() => setIsTilted(prev => !prev)}
          className={`px-3 py-2 rounded-xl text-xs md:text-sm font-black border flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
            isTilted 
              ? 'bg-blue-600 text-white border-blue-300 shadow-blue-500/40' 
              : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
          }`}
          title="Alternar Inclinacao 3D do Mapa (Mode 7)"
        >
          <span>{isTilted ? 'MODO 3D' : 'MODO 2D'}</span>
        </button>

        {/* Menu Button */}
        <button
          id="hud_open_menu_btn"
          onClick={onToggleMenu}
          className="px-4 py-2 bg-gradient-to-b from-blue-700 via-blue-900 to-[#050b33] hover:from-blue-600 hover:to-blue-800 text-white font-black text-sm md:text-base rounded-xl border-2 border-[#d8d8d8] shadow-[inset_0_0_0_1px_#000028,0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider select-none hover:shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          title="Abrir Menu do Jogo (Tecla M)"
        >
          <span className="text-yellow-400 font-bold">►</span>
          <span className="drop-shadow-[1px_1px_0_#000]">MENU [M]</span>
        </button>

        {/* Map & Gold Badge */}
        <div className="bg-slate-900/95 py-2 px-4 rounded-xl border border-slate-700 text-white font-black text-sm md:text-base flex items-center gap-4 shadow-xl backdrop-blur-sm">
          <span className="text-slate-100 font-extrabold">
            {mapId === 'OVERWORLD' ? 'Mundo de Eldoria' : 'Masmorra'}
          </span>
          <span className="text-yellow-400 font-black">{player.gold} G</span>
        </div>
      </div>

      {/* BOTTOM LEFT: Party Squad Strip Preview */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-black uppercase text-slate-400 px-1">Grupo:</div>
        {partyHeroes.map((hero, idx) => (
          <div 
            key={hero.id || idx} 
            className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700/60"
            title={`${hero.name} (${hero.heroClass}) - Nivel ${hero.level}`}
          >
            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
              idx === 0 ? 'bg-yellow-400 text-black' : 'bg-blue-700 text-white'
            }`}>
              {idx + 1}
            </span>
            <span className="text-xs font-bold text-slate-200">{hero.name}</span>
          </div>
        ))}
      </div>

      {/* BOTTOM RIGHT: Controls hint */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-950/90 py-2 px-4 rounded-xl border border-slate-700/80 text-white text-xs md:text-sm font-bold shadow-xl backdrop-blur-md flex items-center gap-3">
        <span>Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 font-mono text-xs">WASD</kbd> ou <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 font-mono text-xs">Setas</kbd> para caminhar</span>
      </div>
    </div>
  );
};

// ==========================================
// DETAILED PARTY HERO SPRITE DRAWING ENGINE
// ==========================================
function drawPartyHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  screenX: number,
  screenY: number,
  facingDir: FacingDir,
  walkPhase: number,
  isMoving: boolean,
  slotIndex: number
) {
  ctx.save();

  // Walk bobbing & leg swing
  const bob = isMoving ? Math.abs(Math.sin(walkPhase * Math.PI * 2)) * 3.5 : 0;
  const legSwing = isMoving ? Math.sin(walkPhase * Math.PI * 2) * 5 : 0;

  // Ground circular base / shadow - centered neatly on the tile
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + 3, 15, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base Y for character feet standing on the centered circular base
  const feetY = screenY + 2 - bob;

  // Class palette mapping
  const heroClass = hero.heroClass || 'Cavalheiro';

  // 1. LEGS / BOOTS
  ctx.fillStyle = '#1e293b'; // dark boot base
  if (facingDir === 2 || facingDir === 3) {
    // Side profile legs
    const flip = facingDir === 2 ? -1 : 1;
    ctx.fillRect(screenX - 4 + legSwing * flip, feetY - 10, 8, 10);
  } else {
    // Front / Back dual legs
    ctx.fillRect(screenX - 8, feetY - 10 + legSwing * 0.3, 6, 10);
    ctx.fillRect(screenX + 2, feetY - 10 - legSwing * 0.3, 6, 10);
  }

  // 2. CAPE / BACK COAT (drawn behind if facing Down/Left/Right)
  if (facingDir !== 1) {
    drawCapeOrCoat(ctx, heroClass, screenX, feetY - 26, facingDir, isMoving, walkPhase);
  }

  // 3. TORSO / ARMOR / TUNIC
  drawTorso(ctx, heroClass, screenX, feetY - 26, facingDir);

  // 4. CAPE (drawn in front if facing Up)
  if (facingDir === 1) {
    drawCapeOrCoat(ctx, heroClass, screenX, feetY - 26, facingDir, isMoving, walkPhase);
  }

  // 5. HEAD & FACE
  drawHead(ctx, heroClass, screenX, feetY - 38, facingDir);

  // 6. CLASS WEAPON / GEAR
  drawWeaponOrGear(ctx, heroClass, screenX, feetY - 20, facingDir, isMoving, walkPhase);

  // 7. SQUAD FORMATION NUMBER BADGE (1 = Leader, 2, 3, 4)
  const badgeY = feetY - 48;
  ctx.fillStyle = slotIndex === 0 ? '#facc15' : '#38bdf8';
  ctx.beginPath();
  ctx.arc(screenX, badgeY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${slotIndex + 1}`, screenX, badgeY);

  ctx.restore();
}

// Draw Cape / Coat
function drawCapeOrCoat(
  ctx: CanvasRenderingContext2D,
  heroClass: HeroClass,
  x: number,
  y: number,
  facingDir: FacingDir,
  isMoving: boolean,
  walkPhase: number
) {
  const sway = isMoving ? Math.sin(walkPhase * Math.PI * 2) * 2.5 : 0;

  switch (heroClass) {
    case 'Cavalheiro':
      ctx.fillStyle = '#1e3a8a'; // Royal blue cape
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x + 12 + sway, y + 18);
      ctx.lineTo(x - 12 + sway, y + 18);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mago':
      ctx.fillStyle = '#312e81'; // Deep mystic cowl
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 4);
      ctx.lineTo(x + 10, y - 4);
      ctx.lineTo(x + 13 + sway, y + 20);
      ctx.lineTo(x - 13 + sway, y + 20);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Arqueiro':
      ctx.fillStyle = '#14532d'; // Forest cape
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 2);
      ctx.lineTo(x + 8, y - 2);
      ctx.lineTo(x + 10 + sway, y + 16);
      ctx.lineTo(x - 10 + sway, y + 16);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Alquimista':
      ctx.fillStyle = '#065f46'; // Alchemist coat
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x + 11 + sway, y + 16);
      ctx.lineTo(x - 11 + sway, y + 16);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Lutador':
      // Red headband flutter ribbons
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 10);
      ctx.lineTo(x - 14 - sway * 2, y - 6);
      ctx.lineTo(x - 12 - sway * 2, y - 2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Inventor':
      ctx.fillStyle = '#78350f'; // Leather utility apron straps
      ctx.fillRect(x - 9, y + 2, 18, 14);
      break;
  }
}

// Draw Character Torso & Armor
function drawTorso(
  ctx: CanvasRenderingContext2D,
  heroClass: HeroClass,
  x: number,
  y: number,
  facingDir: FacingDir
) {
  switch (heroClass) {
    case 'Cavalheiro':
      // Royal blue chestplate with golden shoulder pauldrons
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#facc15'; // Gold trim
      ctx.fillRect(x - 10, y - 2, 6, 6);
      ctx.fillRect(x + 4, y - 2, 6, 6);
      ctx.fillStyle = '#e2e8f0'; // Silver breastplate
      ctx.fillRect(x - 4, y + 3, 8, 8);
      break;

    case 'Mago':
      // Violet robe with gold collar brooch
      ctx.fillStyle = '#4338ca';
      ctx.fillRect(x - 8, y, 16, 17);
      ctx.fillStyle = '#38bdf8'; // Glowing brooch
      ctx.beginPath();
      ctx.arc(x, y + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'Alquimista':
      // Green explorer coat with potion flask straps
      ctx.fillStyle = '#059669';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#78350f'; // Leather belt
      ctx.fillRect(x - 9, y + 10, 18, 3);
      // Potion flask
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 5, y + 8, 4, 6);
      break;

    case 'Arqueiro':
      // Hunter green tunic with leather bracers
      ctx.fillStyle = '#166534';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#854d0e'; // Leather vest trim
      ctx.fillRect(x - 4, y, 8, 14);
      break;

    case 'Lutador':
      // Muscular training gi
      ctx.fillStyle = '#fdba74'; // Tanned skin
      ctx.fillRect(x - 7, y - 1, 14, 15);
      ctx.fillStyle = '#1e293b'; // Dark open vest
      ctx.fillRect(x - 8, y, 4, 15);
      ctx.fillRect(x + 4, y, 4, 15);
      ctx.fillStyle = '#0f172a'; // Black belt
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Inventor':
      // Leather overalls with brass gear buckle
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#f59e0b'; // Brass gear
      ctx.beginPath();
      ctx.arc(x, y + 8, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

// Draw Character Head & Hair
function drawHead(
  ctx: CanvasRenderingContext2D,
  heroClass: HeroClass,
  x: number,
  y: number,
  facingDir: FacingDir
) {
  // Base face
  ctx.fillStyle = '#fed7aa'; // Natural peachy face
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();

  // Face eyes (only when facing down, left, right)
  if (facingDir !== 1) {
    ctx.fillStyle = '#0f172a';
    if (facingDir === 2) {
      // Looking left
      ctx.fillRect(x - 5, y - 1, 2, 2.5);
    } else if (facingDir === 3) {
      // Looking right
      ctx.fillRect(x + 3, y - 1, 2, 2.5);
    } else {
      // Looking down/front
      ctx.fillRect(x - 3, y - 1, 2, 2.5);
      ctx.fillRect(x + 2, y - 1, 2, 2.5);
    }
  }

  // Class Headwear / Hair
  switch (heroClass) {
    case 'Cavalheiro':
      // Golden blonde flowing hair & silver tiara
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 2, 3, 7);
      ctx.fillRect(x + 5, y - 2, 3, 7);
      // Silver tiara
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 5, y - 5, 10, 2);
      break;

    case 'Mago':
      // Pointed wizard hat
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 3);
      ctx.lineTo(x + 10, y - 3);
      ctx.lineTo(x, y - 16);
      ctx.closePath();
      ctx.fill();
      // Glowing star on hat
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - 1.5, y - 8, 3, 3);
      break;

    case 'Alquimista':
      // Wild silver hair with brass goggles
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(x, y - 2, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();
      // Brass twin goggles
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 6, y - 6, 12, 4);
      ctx.fillStyle = '#34d399'; // Green lenses
      ctx.fillRect(x - 5, y - 5, 3.5, 2.5);
      ctx.fillRect(x + 1.5, y - 5, 3.5, 2.5);
      break;

    case 'Arqueiro':
      // Hooded green cowl with red feather
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // Scarlet feather
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 4);
      ctx.lineTo(x - 11, y - 11);
      ctx.lineTo(x - 8, y - 7);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Lutador':
      // Spiky dark hair & red headband
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x, y - 2, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();
      // Red headband band
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 7, y - 4, 14, 3);
      break;

    case 'Inventor':
      // Aviator cap & monocle
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 2, 3, 6);
      ctx.fillRect(x + 5, y - 2, 3, 6);
      // Brass eyepiece
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + 2, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

// Draw Character Weapon / Handheld Gear
function drawWeaponOrGear(
  ctx: CanvasRenderingContext2D,
  heroClass: HeroClass,
  x: number,
  y: number,
  facingDir: FacingDir,
  isMoving: boolean,
  walkPhase: number
) {
  const armSwing = isMoving ? Math.sin(walkPhase * Math.PI * 2) * 3 : 0;

  switch (heroClass) {
    case 'Cavalheiro':
      // Silver Broadsword
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#e2e8f0'; // Blade
      ctx.fillRect(0, -10, 2.5, 14);
      ctx.fillStyle = '#facc15'; // Guard
      ctx.fillRect(-2, 1, 6.5, 2);
      ctx.fillStyle = '#78350f'; // Grip
      ctx.fillRect(0, 3, 2.5, 4);
      ctx.restore();
      break;

    case 'Mago':
      // Wooden staff with pulsing crystal orb
      ctx.save();
      ctx.translate(x + 9, y - 2 - armSwing);
      ctx.fillStyle = '#78350f'; // Staff pole
      ctx.fillRect(0, -12, 2.5, 22);
      // Pulsing cyan crystal
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(1.2, -13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1.2, -13, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Arqueiro':
      // Wooden bow
      ctx.save();
      ctx.translate(x - 9, y + armSwing);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, Math.PI * 0.4, Math.PI * 1.6);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -6);
      ctx.lineTo(-5, 6);
      ctx.stroke();
      ctx.restore();
      break;

    case 'Alquimista':
      // Chemical flask
      ctx.save();
      ctx.translate(x - 9, y + 4 + armSwing);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1, -4, 2, 2);
      ctx.restore();
      break;

    case 'Lutador':
      // White wrapped boxing/fighting hand wraps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 10, y + 3 + armSwing, 4, 4);
      ctx.fillRect(x + 7, y + 3 - armSwing, 4, 4);
      break;

    case 'Inventor':
      // Big metal wrench
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, -6, 2.5, 12);
      ctx.fillRect(-1.5, -9, 5.5, 4);
      ctx.clearRect(0, -8, 2.5, 2);
      ctx.restore();
      break;
  }
}
