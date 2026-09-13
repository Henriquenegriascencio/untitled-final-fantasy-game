import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Player, EnemyType, MapTile, MapId, Hero, HeroClass } from '../types';
import { MAPS, TILE_SIZE, WORLD_LANDMARKS } from '../constants';
import { generateTextures } from '../utils/textures';
import { MinimapOverlay } from './MinimapOverlay';

type ExplorationProps = {
  mapId: MapId;
  player: Player;
  enemies: { id: string; name: string; x: number; y: number; emoji: string; type: EnemyType }[];
  artifacts: { id: string; x: number; y: number; emoji: string }[];
  onMove: (dx: number, dy: number) => void;
  onInteract: (facingDir: FacingDir) => void;
  onEquipWeapon: (wType: string) => void;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  isCutsceneActive?: boolean;
};

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
  isCutsceneActive = false,
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

  // Use only player-created party
  const partyHeroes = useMemo<Hero[]>(() => {
    return player.party || [];
  }, [player.party]);

  // Active landmark discovery in Overworld
  const currentLandmark = useMemo(() => {
    if (mapId !== 'OVERWORLD') return null;
    return WORLD_LANDMARKS.find(lm => {
      const dist = Math.hypot(lm.x - player.x, lm.y - player.y);
      return dist <= 3.2;
    });
  }, [mapId, player.x, player.y]);

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

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        onInteract(leaderDirRef.current);
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

    if (mapId.startsWith('INTERIOR_')) {
      if (tile === 'W' || tile === 'T' || tile === 'I' || tile === 'B' || tile === 'H' || tile === 'E' || tile === 'N' || tile === 'X' || tile === '@') {
        return false;
      }
      return true;
    }

    if (tile === 'M' || tile === '~' || tile === 'W' || tile === 'P' || tile === 'E' || tile === 'I' || tile === 'H' || tile === 'N' || tile === 'X' || tile === '@') {
      return false;
    }
    if (enemies.some(e => e.x === x && e.y === y)) {
      return false;
    }
    return true;
  };

  // Detect adjacent interactable for HUD prompt
  const adjacentInteractable = useMemo(() => {
    const currentMap = MAPS[mapId];
    if (!currentMap) return null;
    const facing = trailRef.current[0].dir;
    const dx = facing === 3 ? 1 : facing === 2 ? -1 : 0;
    const dy = facing === 0 ? 1 : facing === 1 ? -1 : 0;
    const facingX = player.x + dx;
    const facingY = player.y + dy;

    const checkCoords = [
      { x: facingX, y: facingY },
      { x: player.x, y: player.y },
      { x: player.x, y: player.y + 1 },
      { x: player.x, y: player.y - 1 },
      { x: player.x - 1, y: player.y },
      { x: player.x + 1, y: player.y },
    ];

    for (const c of checkCoords) {
      const e = enemies.find(en => en.x === c.x && en.y === c.y);
      if (e) {
        return { label: `DESAFIAR: ${e.name ? e.name.toUpperCase() : 'CHEFE'}`, icon: '⚔' };
      }
    }

    for (const c of checkCoords) {
      if (c.y >= 0 && c.y < currentMap.length && c.x >= 0 && c.x < currentMap[0].length) {
        const t = currentMap[c.y][c.x];
        if (mapId.startsWith('INTERIOR_')) {
          if (t === 'N') {
            if (mapId.includes('_SHOP')) return { label: 'CONVERSAR COM VENDEDOR', icon: '💬' };
            if (mapId.includes('_TOOLSMITH')) return { label: 'CONVERSAR COM FERREIRO', icon: '💬' };
            if (mapId.includes('_INN')) return { label: 'CONVERSAR COM ESTALAJADEIRO', icon: '💬' };
            return { label: 'CONVERSAR COM MORADOR', icon: '💬' };
          }
          if (t === 'T') {
            if (mapId.includes('_SHOP')) return { label: 'VER ITENS E MAGIAS', icon: '✨' };
            if (mapId.includes('_TOOLSMITH')) return { label: 'VER ARMAS E FORJA', icon: '🗡' };
            if (mapId.includes('_INN')) return { label: 'DESCANSAR NA POUSADA', icon: '🛏' };
            return { label: 'EXAMINAR BALCAO', icon: '✨' };
          }
          if (t === 'E') return { label: 'FORJAR ARMAS', icon: '🗡' };
          if (t === 'I') return { label: 'DESCANSAR NA CAMA', icon: '🛏' };
          if (t === 'B') return { label: 'EXAMINAR ESTANTE DE LIVROS', icon: '📖' };
          if (t === 'H') return { label: 'AQUECER NA LAREIRA', icon: '🔥' };
          if (t === '<') return { label: 'SAIR PARA A CIDADE', icon: '🚪' };
        } else {
          if (t === 'N') return { label: 'CONVERSAR COM CIDADAO', icon: '💬' };
          if (t === 'P') return { label: 'ENTRAR NA LOJA DE MAGIAS', icon: '✨' };
          if (t === 'E') return { label: 'ENTRAR NA FORJA DE ARMAS', icon: '🗡' };
          if (t === 'I') return { label: 'ENTRAR NA POUSADA', icon: '🛏' };
          if (t === 'H') return { label: 'ENTRAR NA RESIDENCIA', icon: '🏠' };
        }
        if (t === 'X') {
          const chestKey = `${mapId}_${c.x}_${c.y}`;
          const isOpened = player.openedChests?.includes(chestKey);
          return { label: isOpened ? 'VERIFICAR BAU VAZIO' : 'ABRIR BAU DE TESOURO', icon: '📦' };
        }
      }
    }

    return null;
  }, [mapId, player.x, player.y, enemies, player.openedChests]);

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
    const isInterior = mapId.startsWith('INTERIOR_');
    const mapW = currentMap[0].length;
    const mapH = currentMap.length;

    // ZOOM level: 1.3x default, auto-fit interior maps so they fill full canvas screen
    let ZOOM = 1.3;
    if (isInterior) {
      const fitZoomX = 1024 / (mapW * TILE_SIZE);
      const fitZoomY = 768 / (mapH * TILE_SIZE);
      ZOOM = Math.max(fitZoomX, fitZoomY);
    }
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

      // 2. CAMERA CALCULATION (Centered on Leader or centered on small interior map)
      const leaderVisual = visualPositionsRef.current[0];
      let cameraX: number;
      let cameraY: number;

      if (mapW <= viewW) {
        cameraX = (mapW - viewW) / 2;
      } else {
        cameraX = Math.max(0, Math.min(mapW - viewW, leaderVisual.x - viewW / 2 + 0.5));
      }

      if (mapH <= viewH) {
        cameraY = (mapH - viewH) / 2;
      } else {
        cameraY = Math.max(0, Math.min(mapH - viewH, leaderVisual.y - viewH / 2 + 0.5));
      }

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

          let tile: string | MapTile = isInterior ? 'W' : 'M';
          if (mapY >= 0 && mapY < currentMap.length && mapX >= 0 && mapX < currentMap[0].length) {
            tile = currentMap[mapY][mapX];
          }

          const drawX = x * TILE_SIZE - offsetX;
          const drawY = y * TILE_SIZE - offsetY;

          let texture = mapId.startsWith('INTERIOR_')
            ? textures.interiorWoodFloor
            : mapId.startsWith('TOWN_')
            ? textures.cobble
            : textures.grass;

          if (mapId.startsWith('INTERIOR_')) {
            if (tile === 'W') {
              texture = textures.interiorWall;
            } else if (tile === 'T') {
              texture = textures.interiorCounter;
            } else if (tile === 'I') {
              texture = textures.interiorBed;
            } else if (tile === 'B') {
              texture = textures.interiorBookshelf;
            } else if (tile === 'H') {
              texture = textures.interiorFireplace;
            } else if (tile === 'E') {
              texture = textures.interiorForge;
            } else if (tile === '<') {
              texture = textures.interiorDoormat;
            } else if (tile === 'N') {
              if (mapId.includes('_SHOP')) {
                texture = textures.npcMerchant;
              } else if (mapId.includes('_TOOLSMITH')) {
                texture = textures.npcBlacksmith;
              } else if (mapId.includes('_INN')) {
                texture = textures.npcInnkeeper;
              } else {
                texture = textures.npcResident;
              }
            } else if (tile === 'X') {
              const chestKey = `${mapId}_${mapX}_${mapY}`;
              const isOpened = player.openedChests?.includes(chestKey);
              texture = isOpened ? textures.chestOpen : textures.chest;
            }
          } else {
            if (tile === '~') {
              const waterFrameIdx = Math.floor((timestamp / 110) % textures.waterFrames.length);
              texture = mapId.startsWith('TOWN_') ? textures.fountain : (textures.waterFrames[waterFrameIdx] || textures.water);
            } else if (tile === 'M') {
              texture = textures.mountain;
            } else if (tile === 'W') {
              texture = mapId.startsWith('TOWN_') ? textures.wallStone : textures.mountain;
            } else if (tile === 'G') {
              texture = textures.flowerbed;
            } else if (tile === 'L') {
              texture = textures.lantern;
            } else if (tile === 'T') {
              texture = textures.forest;
            } else if (tile === 'D') {
              texture = textures.desert;
            } else if (tile === 'S') {
              texture = textures.marsh;
            } else if (tile === 'B') {
              const isH = (mapX > 0 && currentMap[mapY]?.[mapX - 1] === 'B') || (mapX < currentMap[0].length - 1 && currentMap[mapY]?.[mapX + 1] === 'B');
              texture = isH ? textures.bridgeH : textures.bridgeV;
            } else if (tile === 'C') {
              texture = textures.town;
            } else if (tile === 'H') {
              texture = textures.house;
            } else if (tile === 'P') {
              texture = textures.itemShop;
            } else if (tile === 'E') {
              texture = textures.toolsmith;
            } else if (tile === 'I') {
              texture = textures.inn;
            } else if (tile === 'N') {
              texture = textures.npcCitizen;
            } else if (tile === '0') {
              texture = textures.dungeonPreludio;
            } else if (tile === '6') {
              texture = textures.dungeonDesafio;
            } else if (tile === '1') {
              texture = textures.dungeonTerra;
            } else if (tile === '2') {
              texture = textures.dungeonFogo;
            } else if (tile === '3') {
              texture = textures.dungeonAgua;
            } else if (tile === '4') {
              texture = textures.dungeonAr;
            } else if (tile === '5' || tile === 'F') {
              texture = textures.portalChaos;
            } else if (tile === '<') {
              texture = textures.stairsUp;
            } else if (tile === '>') {
              texture = textures.stairsDown;
            } else if (tile === 'X') {
              const chestKey = `${mapId}_${mapX}_${mapY}`;
              const isOpened = player.openedChests?.includes(chestKey);
              texture = isOpened ? textures.chestOpen : textures.chest;
            }
          }

          ctx.drawImage(texture, drawX, drawY);

          // Animated town lantern warm light halo
          if (tile === 'L') {
            const flicker = Math.sin(timestamp * 0.005 + mapX * 2 + mapY * 3) * 0.08 + 0.32;
            const grad = ctx.createRadialGradient(
              drawX + TILE_SIZE * 0.5, drawY + TILE_SIZE * 0.5, 2,
              drawX + TILE_SIZE * 0.5, drawY + TILE_SIZE * 0.5, TILE_SIZE * 1.2
            );
            grad.addColorStop(0, `rgba(253, 224, 71, ${flicker})`);
            grad.addColorStop(0.5, `rgba(251, 146, 60, ${flicker * 0.4})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(drawX + TILE_SIZE * 0.5, drawY + TILE_SIZE * 0.5, TILE_SIZE * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Animated town fountain sparkles
          if (tile === '~' && mapId.startsWith('TOWN_')) {
            const sparkle = Math.sin(timestamp * 0.008 + mapX + mapY) > 0.3;
            if (sparkle) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(drawX + TILE_SIZE * 0.5 - 1 + Math.sin(timestamp * 0.01) * 4, drawY + TILE_SIZE * 0.5 - 2, 2, 2);
            }
          }

          // Town Building Sign Labels
          if (mapId.startsWith('TOWN_')) {
            if (tile === 'P') {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#38bdf8';
              ctx.textAlign = 'center';
              ctx.fillText('LOJA', drawX + TILE_SIZE * 0.5, drawY + 8);
            } else if (tile === 'E') {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#f97316';
              ctx.textAlign = 'center';
              ctx.fillText('FORJA', drawX + TILE_SIZE * 0.5, drawY + 8);
            } else if (tile === 'I') {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#4ade80';
              ctx.textAlign = 'center';
              ctx.fillText('POUSADA', drawX + TILE_SIZE * 0.5, drawY + 8);
            } else if (tile === 'H') {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#fbbf24';
              ctx.textAlign = 'center';
              ctx.fillText('CASA', drawX + TILE_SIZE * 0.5, drawY + 8);
            } else if (tile === '<') {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#e2e8f0';
              ctx.textAlign = 'center';
              ctx.fillText('SAIDA', drawX + TILE_SIZE * 0.5, drawY + TILE_SIZE - 2);
            }
          }

          // Animated shoreline foam when water borders land
          if (tile === '~' && mapY >= 0 && mapY < currentMap.length && mapX >= 0 && mapX < currentMap[0].length) {
            const foamWave = Math.sin(timestamp * 0.006 + (mapX * 0.7) + (mapY * 0.9)) * 1.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            // Top is land
            if (mapY > 0 && currentMap[mapY - 1]?.[mapX] !== '~' && currentMap[mapY - 1]?.[mapX] !== 'B') {
              ctx.fillRect(drawX, drawY, TILE_SIZE, 3 + foamWave);
            }
            // Bottom is land
            if (mapY < currentMap.length - 1 && currentMap[mapY + 1]?.[mapX] !== '~' && currentMap[mapY + 1]?.[mapX] !== 'B') {
              ctx.fillRect(drawX, drawY + TILE_SIZE - (3 + foamWave), TILE_SIZE, 3 + foamWave);
            }
            // Left is land
            if (mapX > 0 && currentMap[mapY]?.[mapX - 1] !== '~' && currentMap[mapY]?.[mapX - 1] !== 'B') {
              ctx.fillRect(drawX, drawY, 3 + foamWave, TILE_SIZE);
            }
            // Right is land
            if (mapX < currentMap[0].length - 1 && currentMap[mapY]?.[mapX + 1] !== '~' && currentMap[mapY]?.[mapX + 1] !== 'B') {
              ctx.fillRect(drawX + TILE_SIZE - (3 + foamWave), drawY, 3 + foamWave, TILE_SIZE);
            }
          }

          // Subtle grid line / tile relief for paths and terrain
          if (tile !== '~') {
            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          }

          // Final boss portal seal
          if (tile === 'F' && player.artifacts.length < 4) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#ef4444';
            ctx.strokeRect(drawX + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          }

          // Town / City entrance landmark highlight
          if (tile === 'C') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
            ctx.beginPath();
            ctx.arc(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('CIDADE', drawX + TILE_SIZE / 2, drawY + TILE_SIZE - 3);
          } else if (['0', '1', '2', '3', '4', '5', '6'].includes(tile as string)) {
            const dungeonNames: Record<string, string> = { 
              '0': 'PRELUDIO', 
              '6': 'DESAFIO',
              '1': 'TERRA', 
              '2': 'FOGO', 
              '3': 'AGUA', 
              '4': 'AR', 
              '5': 'CHAOS' 
            };
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fca5a5';
            ctx.textAlign = 'center';
            ctx.fillText(dungeonNames[tile as string] || 'DUNGEON', drawX + TILE_SIZE / 2, drawY + TILE_SIZE - 3);
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

      // Draw Enemies & Bosses
      enemies.forEach(enemy => {
        if (enemy.x >= cameraX - 1 && enemy.x < cameraX + viewW + 1 && enemy.y >= cameraY - 1 && enemy.y < cameraY + viewH + 1) {
          const screenX = (enemy.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
          const screenY = (enemy.y - cameraY) * TILE_SIZE + TILE_SIZE / 2;
          drawMapEnemy(ctx, enemy, screenX, screenY, timestamp);
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

      {/* HUD Elements (Hidden during active cutscenes/dialogues) */}
      {!isCutsceneActive && (
        <>
          {/* TOP CENTER: Active Landmark Discovery Banner */}
          {currentLandmark && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300">
              <div 
                className="px-6 py-2 rounded-xl border-2 border-yellow-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.9)] font-mono text-center select-none backdrop-blur-md"
                style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #050b33 100%)' }}
              >
                <div className="text-yellow-300 font-black text-sm md:text-base tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {currentLandmark.name}
                </div>
                <div className="text-slate-200 text-[10px] md:text-xs font-bold tracking-wide">
                  {currentLandmark.description}
                </div>
              </div>
            </div>
          )}

          {/* TOP RIGHT: Tilt Toggle & Menu Button */}
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
              title="Alternar Inclinacao 3D do Mapa"
            >
              <span>{isTilted ? '3D' : '2D'}</span>
            </button>

            {/* Menu Button */}
            <button
              id="hud_open_menu_btn"
              onClick={onToggleMenu}
              className="px-4 py-2 bg-gradient-to-b from-blue-700 via-blue-900 to-[#050b33] hover:from-blue-600 hover:to-blue-800 text-white font-black text-sm md:text-base rounded-xl border-2 border-[#d8d8d8] shadow-[inset_0_0_0_1px_#000028,0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider select-none hover:shadow-[0_0_15px_rgba(56,189,248,0.5)]"
              title="Abrir Menu do Jogo - Tecla M"
            >
              <span className="text-yellow-400 font-bold"></span>
              <span className="drop-shadow-[1px_1px_0_#000]">MENU - M</span>
            </button>
          </div>

          {/* OVERLAY MINIMAP */}
          <MinimapOverlay
            mapId={mapId}
            playerPos={{ x: player.x, y: player.y }}
            enemies={enemies}
            artifacts={artifacts}
            openedChests={player.openedChests || []}
            isMenuOpen={isMenuOpen}
          />

          {/* BOTTOM CENTER: Contextual Interaction Banner & Action Button */}
          {adjacentInteractable && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce">
              <button
                id="hud_interact_action_btn"
                onClick={() => onInteract(leaderDirRef.current)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-sm md:text-base rounded-full border-2 border-white shadow-[0_0_20px_rgba(234,179,8,0.8)] cursor-pointer flex items-center gap-2.5 transition-transform active:scale-95 uppercase tracking-wider select-none"
              >
                <span className="text-lg">{adjacentInteractable.icon}</span>
                <span>{adjacentInteractable.label}</span>
                <span className="bg-slate-950 text-yellow-300 text-xs px-2 py-0.5 rounded font-mono font-bold">ESPACO</span>
              </button>
            </div>
          )}
        </>
      )}
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

  // Numbers above characters removed per user request for authentic clean world map

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
    case 'Guerreiro':
      ctx.fillStyle = '#991b1b'; // Red warrior cape
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x + 12 + sway, y + 18);
      ctx.lineTo(x - 12 + sway, y + 18);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Cavaleiro':
    case 'Cavalheiro':
      ctx.fillStyle = '#1e3a8a'; // Royal blue knight cape
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x + 12 + sway, y + 19);
      ctx.lineTo(x - 12 + sway, y + 19);
      ctx.closePath();
      ctx.fill();
      // Gold trim on cape hem
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 12 + sway, y + 17, 24, 2);
      break;

    case 'Ladrao':
      ctx.fillStyle = '#047857'; // Forest green rogue scarf/cape
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.lineTo(x + 10 + sway, y + 15);
      ctx.lineTo(x - 10 + sway, y + 15);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Ninja':
    case 'Arqueiro':
      // Red flowing ninja scarf
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 4);
      ctx.lineTo(x - 14 - sway * 2.5, y + 6);
      ctx.lineTo(x - 12 - sway * 2.5, y + 10);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Monge':
    case 'Lutador':
      // Amber martial sash ribbons
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 8);
      ctx.lineTo(x - 14 - sway * 2, y - 4);
      ctx.lineTo(x - 12 - sway * 2, y);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mestre':
      // Legendary red dragon master sash
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 8);
      ctx.lineTo(x - 16 - sway * 2.5, y - 2);
      ctx.lineTo(x - 13 - sway * 2.5, y + 3);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mago Branco':
      // White cowl back
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 2);
      ctx.lineTo(x + 9, y - 2);
      ctx.lineTo(x + 12 + sway, y + 18);
      ctx.lineTo(x - 12 + sway, y + 18);
      ctx.closePath();
      ctx.fill();
      // Red triangles on hem
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 10 + sway, y + 16, 20, 2);
      break;

    case 'Mago Branco Superior':
      // Pure radiant white cape with gold hem
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 3);
      ctx.lineTo(x + 10, y - 3);
      ctx.lineTo(x + 13 + sway, y + 19);
      ctx.lineTo(x - 13 + sway, y + 19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 12 + sway, y + 17, 24, 2.5);
      break;

    case 'Mago Negro':
    case 'Mago':
      ctx.fillStyle = '#1e1b4b'; // Deep mystic cowl
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 4);
      ctx.lineTo(x + 10, y - 4);
      ctx.lineTo(x + 13 + sway, y + 20);
      ctx.lineTo(x - 13 + sway, y + 20);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mago Negro Superior':
      ctx.fillStyle = '#3b0764'; // Royal purple astral cloak
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 4);
      ctx.lineTo(x + 10, y - 4);
      ctx.lineTo(x + 14 + sway, y + 21);
      ctx.lineTo(x - 14 + sway, y + 21);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x - 13 + sway, y + 19, 26, 2);
      break;

    case 'Mago Vermelho':
      ctx.fillStyle = '#991b1b'; // Red noble cape
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 1);
      ctx.lineTo(x + 9, y - 1);
      ctx.lineTo(x + 12 + sway, y + 18);
      ctx.lineTo(x - 12 + sway, y + 18);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mago Vermelho Superior':
    case 'Alquimista':
    case 'Inventor':
    default:
      ctx.fillStyle = '#7f1d1d'; // Grandmaster crimson cape with gold edge
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 2);
      ctx.lineTo(x + 10, y - 2);
      ctx.lineTo(x + 13 + sway, y + 19);
      ctx.lineTo(x - 13 + sway, y + 19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 12 + sway, y + 17, 24, 2);
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
    case 'Guerreiro':
      // Heavy iron plate armor with red tunic trim
      ctx.fillStyle = '#475569'; // Steel chestplate
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#94a3b8'; // Iron shoulder pauldrons
      ctx.fillRect(x - 10, y - 2, 5, 6);
      ctx.fillRect(x + 5, y - 2, 5, 6);
      ctx.fillStyle = '#991b1b'; // Red inner tunic
      ctx.fillRect(x - 4, y + 4, 8, 8);
      ctx.fillStyle = '#1e293b'; // Belt
      ctx.fillRect(x - 8, y + 12, 16, 3);
      break;

    case 'Cavaleiro':
    case 'Cavalheiro':
      // Royal blue chestplate with golden shoulder pauldrons and silver breastplate
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#facc15'; // Gold trim
      ctx.fillRect(x - 10, y - 2, 6, 6);
      ctx.fillRect(x + 4, y - 2, 6, 6);
      ctx.fillStyle = '#e2e8f0'; // Silver breastplate
      ctx.fillRect(x - 4, y + 3, 8, 8);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(x - 8, y + 12, 16, 3);
      break;

    case 'Ladrao':
      // Green agile rogue tunic with leather belt and dagger strap
      ctx.fillStyle = '#065f46';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#047857';
      ctx.fillRect(x - 6, y + 2, 12, 12);
      ctx.fillStyle = '#78350f'; // Leather belt & strap
      ctx.fillRect(x - 8, y + 11, 16, 3);
      ctx.fillRect(x - 4, y + 1, 3, 12);
      break;

    case 'Ninja':
    case 'Arqueiro':
      // Dark shinobi shozoku outfit with red sash
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 6, y + 2, 12, 12);
      ctx.fillStyle = '#dc2626'; // Red ninja sash
      ctx.fillRect(x - 8, y + 10, 16, 4);
      break;

    case 'Monge':
    case 'Lutador':
      // Muscular monk gi with open chest
      ctx.fillStyle = '#fed7aa'; // Tanned skin
      ctx.fillRect(x - 7, y - 1, 14, 15);
      ctx.fillStyle = '#b45309'; // Orange/brown open gi vest
      ctx.fillRect(x - 8, y, 4, 15);
      ctx.fillRect(x + 4, y, 4, 15);
      ctx.fillStyle = '#18181b'; // Black sash belt
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Mestre':
      // Legendary Master crimson gi with gold dragon trim
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(x - 7, y - 1, 14, 15);
      ctx.fillStyle = '#991b1b'; // Crimson master gi
      ctx.fillRect(x - 8, y, 4, 15);
      ctx.fillRect(x + 4, y, 4, 15);
      ctx.fillStyle = '#facc15'; // Gold master belt
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Mago Branco':
      // White robe with red triangles
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 8, y, 16, 17);
      ctx.fillStyle = '#dc2626'; // Red signature triangles
      ctx.fillRect(x - 7, y + 12, 4, 3);
      ctx.fillRect(x + 3, y + 12, 4, 3);
      ctx.fillStyle = '#0284c7'; // Blue collar gem
      ctx.fillRect(x - 2, y + 2, 4, 3);
      break;

    case 'Mago Branco Superior':
      // Divine white robe with gold and red holy trims
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 8, y, 16, 17);
      ctx.fillStyle = '#facc15'; // Gold holy trim
      ctx.fillRect(x - 8, y + 12, 16, 3);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x - 6, y + 4, 12, 2);
      ctx.fillStyle = '#38bdf8'; // Holy cyan sapphire
      ctx.beginPath();
      ctx.arc(x, y + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'Mago Negro':
    case 'Mago':
      // Classic Blue wizard robe
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 8, y, 16, 17);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(x - 6, y + 2, 12, 13);
      ctx.fillStyle = '#78350f'; // Leather belt
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Mago Negro Superior':
      // Deep purple robe with arcane runes
      ctx.fillStyle = '#581c87';
      ctx.fillRect(x - 8, y, 16, 17);
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(x - 6, y + 2, 12, 13);
      ctx.fillStyle = '#c084fc'; // Arcane runes
      ctx.fillRect(x - 2, y + 3, 4, 8);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Mago Vermelho':
      // Scarlet red tunic with white collar
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#ffffff'; // White noble collar
      ctx.fillRect(x - 4, y, 8, 4);
      ctx.fillStyle = '#78350f'; // Belt
      ctx.fillRect(x - 8, y + 11, 16, 3);
      break;

    case 'Mago Vermelho Superior':
    case 'Alquimista':
    case 'Inventor':
    default:
      // Grandmaster crimson tunic with gold trims
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = '#facc15'; // Gold trim
      ctx.fillRect(x - 8, y - 1, 16, 2);
      ctx.fillRect(x - 8, y + 11, 16, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 3, y + 1, 6, 4);
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

  // Class Headwear / Hair / Hats
  switch (heroClass) {
    case 'Guerreiro':
      // Spiked red/brown warrior hair & steel brow band
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(x, y - 2, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 2, 3, 6);
      ctx.fillRect(x + 5, y - 2, 3, 6);
      // Steel headband
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x - 6, y - 4, 12, 2.5);
      break;

    case 'Cavaleiro':
      // Knight silver helmet with gold plume
      ctx.fillStyle = '#cbd5e1'; // Silver helm
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI * 0.7, Math.PI * 2.3);
      ctx.fill();
      ctx.fillRect(x - 7, y - 5, 14, 5);
      // Golden plume on top
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 7);
      ctx.lineTo(x + 2, y - 7);
      ctx.lineTo(x, y - 14);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Cavalheiro':
      // Golden blonde flowing hair & silver tiara
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 2, 3, 7);
      ctx.fillRect(x + 5, y - 2, 3, 7);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 5, y - 5, 10, 2);
      break;

    case 'Ladrao':
      // Blue rogue bandana with messy brown hair bangs
      ctx.fillStyle = '#0284c7'; // Blue bandana
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 4, 16, 4);
      // Bandana tail
      ctx.fillRect(x - 10, y - 2, 3, 5);
      break;

    case 'Ninja':
    case 'Arqueiro':
      // Black ninja mask covering lower face and dark hood with red headband
      ctx.fillStyle = '#18181b'; // Black hood
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // Lower mask covering face
      ctx.fillRect(x - 6, y + 1, 12, 6);
      // Red forehead protector
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 6, y - 4, 12, 2.5);
      break;

    case 'Monge':
    case 'Lutador':
      // Spiky dark monk hair & orange/gold headband
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(x, y - 2, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 7, y - 2, 2.5, 4);
      ctx.fillRect(x + 4.5, y - 2, 2.5, 4);
      // Yellow headband
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x - 7, y - 4, 14, 3);
      break;

    case 'Mestre':
      // Flowing pure white hair & golden master headband
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 2, 3, 7);
      ctx.fillRect(x + 5, y - 2, 3, 7);
      // Golden headband
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 7, y - 4, 14, 3);
      break;

    case 'Mago Branco':
      // White hooded cowl with red triangle trims
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 3, 3, 7);
      ctx.fillRect(x + 5, y - 3, 3, 7);
      // Red cowl trim
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 6, y - 6, 12, 2);
      break;

    case 'Mago Branco Superior':
      // Radiant white hood with golden holy tiara
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - 2, 8.5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(x - 8.5, y - 3, 3.5, 8);
      ctx.fillRect(x + 5, y - 3, 3.5, 8);
      // Gold tiara with cyan gem
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x - 6, y - 6, 12, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - 1, y - 7, 2, 2);
      break;

    case 'Mago Negro':
    case 'Mago':
      // Pointed Yellow Wizard Hat with shadowed face and glowing yellow eyes
      ctx.fillStyle = '#d97706'; // Hat base
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 2);
      ctx.lineTo(x + 11, y - 2);
      ctx.lineTo(x + 2, y - 18);
      ctx.lineTo(x - 2, y - 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f59e0b'; // Hat highlight
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 2);
      ctx.lineTo(x + 7, y - 2);
      ctx.lineTo(x, y - 16);
      ctx.closePath();
      ctx.fill();
      // Shadowed black face inside hat
      ctx.fillStyle = '#020617';
      ctx.fillRect(x - 6, y - 2, 12, 7);
      // Glowing yellow eyes
      if (facingDir !== 1) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - 4, y, 2.5, 2);
        ctx.fillRect(x + 1.5, y, 2.5, 2);
      }
      break;

    case 'Mago Negro Superior':
      // Royal purple tall pointed archmage hat with glowing runes & glowing magenta eyes
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 2);
      ctx.lineTo(x + 11, y - 2);
      ctx.lineTo(x + 2, y - 19);
      ctx.lineTo(x - 2, y - 19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 2);
      ctx.lineTo(x + 7, y - 2);
      ctx.lineTo(x, y - 17);
      ctx.closePath();
      ctx.fill();
      // Purple rune on hat
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x - 1.5, y - 10, 3, 3);
      // Shadowed black face
      ctx.fillStyle = '#020617';
      ctx.fillRect(x - 6, y - 2, 12, 7);
      // Glowing magenta-yellow eyes
      if (facingDir !== 1) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x - 4, y, 2.5, 2);
        ctx.fillRect(x + 1.5, y, 2.5, 2);
      }
      break;

    case 'Mago Vermelho':
      // Red cavalier / musketeer hat with long white feather plume
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 2);
      ctx.lineTo(x + 10, y - 2);
      ctx.lineTo(x + 3, y - 12);
      ctx.lineTo(x - 7, y - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - 8, y - 4, 16, 3);
      // White feather plume
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + 4, y - 4);
      ctx.lineTo(x + 12, y - 14);
      ctx.lineTo(x + 8, y - 8);
      ctx.closePath();
      ctx.fill();
      break;

    case 'Mago Vermelho Superior':
    case 'Alquimista':
    case 'Inventor':
    default:
      // Grandmaster crimson cavalier hat with golden feather plume
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 2);
      ctx.lineTo(x + 11, y - 2);
      ctx.lineTo(x + 4, y - 13);
      ctx.lineTo(x - 8, y - 13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x - 9, y - 4, 18, 3);
      // Golden feather plume
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(x + 4, y - 4);
      ctx.lineTo(x + 13, y - 15);
      ctx.lineTo(x + 8, y - 9);
      ctx.closePath();
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
    case 'Guerreiro':
      // Iron Broadsword
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#cbd5e1'; // Blade
      ctx.fillRect(0, -10, 3, 15);
      ctx.fillStyle = '#94a3b8'; // Crossguard
      ctx.fillRect(-2, 2, 7, 2.5);
      ctx.fillStyle = '#78350f'; // Grip
      ctx.fillRect(0.5, 4.5, 2, 3.5);
      ctx.restore();
      break;

    case 'Cavaleiro':
    case 'Cavalheiro':
      // Radiant Holy Excalibur
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#f8fafc'; // Gleaming silver blade
      ctx.fillRect(0, -12, 3, 17);
      ctx.fillStyle = '#facc15'; // Gold guard
      ctx.fillRect(-2.5, 1, 8, 3);
      ctx.fillStyle = '#38bdf8'; // Blue gem in hilt
      ctx.fillRect(0.5, 1.5, 2, 2);
      ctx.restore();
      break;

    case 'Ladrao':
      // Quick Dagger
      ctx.save();
      ctx.translate(x + 8, y + 4 + armSwing);
      ctx.fillStyle = '#94a3b8'; // Blade
      ctx.fillRect(0, -6, 2.5, 10);
      ctx.fillStyle = '#78350f'; // Grip
      ctx.fillRect(0, 4, 2.5, 3);
      ctx.restore();
      break;

    case 'Ninja':
    case 'Arqueiro':
      // Ninja Kunai & Shuriken
      ctx.save();
      ctx.translate(x + 8, y + 3 + armSwing);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(1, -7);
      ctx.lineTo(3.5, 0);
      ctx.lineTo(1, 4);
      ctx.lineTo(-1.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 4, 2, 3);
      ctx.restore();
      break;

    case 'Monge':
    case 'Lutador':
      // Martial Fist Wraps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x - 10, y + 3 + armSwing, 4, 4);
      ctx.fillRect(x + 7, y + 3 - armSwing, 4, 4);
      break;

    case 'Mestre':
      // Glowing Golden Ki Auras on fists
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(x - 8, y + 5 + armSwing, 3.5, 0, Math.PI * 2);
      ctx.arc(x + 9, y + 5 - armSwing, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 9, y + 4 + armSwing, 2, 2);
      ctx.fillRect(x + 8, y + 4 - armSwing, 2, 2);
      break;

    case 'Mago Branco':
      // Oak Healing Staff with Holy Orb
      ctx.save();
      ctx.translate(x + 9, y - 2 - armSwing);
      ctx.fillStyle = '#78350f'; // Pole
      ctx.fillRect(0, -12, 2.5, 22);
      // Holy pearl
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1.2, -13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(1.2, -13, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Mago Branco Superior':
      // Angelic Caduceus with glowing golden wings
      ctx.save();
      ctx.translate(x + 9, y - 3 - armSwing);
      ctx.fillStyle = '#facc15'; // Golden staff
      ctx.fillRect(0, -13, 2.5, 23);
      ctx.fillStyle = '#ffffff'; // Angel wings
      ctx.fillRect(-3, -15, 8.5, 3);
      ctx.fillStyle = '#38bdf8'; // Crystal orb
      ctx.beginPath();
      ctx.arc(1.2, -14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Mago Negro':
    case 'Mago':
      // Gnarled Wooden Staff with Arcane Crystal
      ctx.save();
      ctx.translate(x + 9, y - 2 - armSwing);
      ctx.fillStyle = '#451a03'; // Dark pole
      ctx.fillRect(0, -12, 2.5, 22);
      // Glowing purple/cyan crystal
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(1.2, -13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1.2, -13, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Mago Negro Superior':
      // Cosmic Staff with dark pulsar orb
      ctx.save();
      ctx.translate(x + 9, y - 3 - armSwing);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, -13, 2.5, 23);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(1.2, -14, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(1.2, -14, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Mago Vermelho':
      // Fine Fencing Rapier
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#cbd5e1'; // Slim blade
      ctx.fillRect(0.5, -11, 2, 16);
      ctx.fillStyle = '#facc15'; // Basket hilt
      ctx.beginPath();
      ctx.arc(1.5, 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;

    case 'Mago Vermelho Superior':
    case 'Alquimista':
    case 'Inventor':
    default:
      // Enchanted Flame Rapier
      ctx.save();
      ctx.translate(x + 9, y + 2 + armSwing);
      ctx.fillStyle = '#f59e0b'; // Glowing blade
      ctx.fillRect(0.5, -12, 2, 17);
      ctx.fillStyle = '#ef4444'; // Flame aura tip
      ctx.fillRect(0, -14, 3, 3);
      ctx.fillStyle = '#facc15'; // Gold guard
      ctx.beginPath();
      ctx.arc(1.5, 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
  }
}

// ==========================================
// DETAILED MAP ENEMY & BOSS SPRITE DRAWING
// ==========================================
function drawMapEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: { id: string; name: string; x: number; y: number; emoji: string; type: EnemyType },
  screenX: number,
  screenY: number,
  timestamp: number
) {
  ctx.save();

  const isBoss = enemy.type === 'boss' || enemy.id === 'boss' || enemy.id.startsWith('boss_');
  const floatAnim = Math.sin(timestamp / 240) * 3;
  const pulseAnim = 0.8 + Math.sin(timestamp / 300) * 0.2;

  // Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + 14, isBoss ? 24 : 14, isBoss ? 9 : 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isBoss) {
    // Menacing Boss Pulsing Aura
    const auraGrad = ctx.createRadialGradient(screenX, screenY, 6, screenX, screenY, 36 * pulseAnim);
    if (enemy.id === 'boss_terra') {
      auraGrad.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
      auraGrad.addColorStop(1, 'rgba(22, 101, 52, 0)');
    } else if (enemy.id === 'boss_fogo') {
      auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
      auraGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    } else if (enemy.id === 'boss_agua') {
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      auraGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
    } else if (enemy.id === 'boss_ar') {
      auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
      auraGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
    } else if (enemy.id === 'boss_desafio') {
      auraGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
      auraGrad.addColorStop(1, 'rgba(107, 33, 168, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(220, 38, 38, 0.7)');
      auraGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    }

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 36 * pulseAnim, 0, Math.PI * 2);
    ctx.fill();

    const yOff = screenY + floatAnim - 4;

    if (enemy.id === 'boss_preludio') {
      // Gargoyle Boss
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(screenX - 22, yOff - 12);
      ctx.lineTo(screenX - 8, yOff - 2);
      ctx.lineTo(screenX - 16, yOff + 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(screenX + 22, yOff - 12);
      ctx.lineTo(screenX + 8, yOff - 2);
      ctx.lineTo(screenX + 16, yOff + 10);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(screenX - 10, yOff - 10, 20, 22);
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX - 8, yOff - 22, 16, 13);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(screenX - 6, yOff - 17, 3.5, 3.5);
      ctx.fillRect(screenX + 2.5, yOff - 17, 3.5, 3.5);
    } else if (enemy.id === 'boss_desafio') {
      // Dark Knight of Desafio
      ctx.fillStyle = '#09090b';
      ctx.fillRect(screenX - 12, yOff - 12, 24, 25);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(screenX - 10, yOff - 2, 20, 3);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(screenX - 9, yOff - 24, 18, 14);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(screenX - 7, yOff - 18, 14, 3);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(screenX + 13, yOff - 26, 4, 36);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(screenX + 10, yOff - 6, 10, 3);
    } else if (enemy.id === 'boss_terra') {
      // Lich of Earth
      ctx.fillStyle = '#14532d';
      ctx.fillRect(screenX - 12, yOff - 8, 24, 24);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(screenX - 8, yOff - 22, 16, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(screenX - 6, yOff - 17, 3, 3);
      ctx.fillRect(screenX + 3, yOff - 17, 3, 3);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(screenX - 15, yOff - 24, 3, 34);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(screenX - 13.5, yOff - 25, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.id === 'boss_fogo') {
      // Marilith of Fire
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(screenX - 11, yOff - 6, 22, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(screenX - 18, yOff - 18, 3, 20);
      ctx.fillRect(screenX - 14, yOff - 10, 3, 18);
      ctx.fillRect(screenX + 11, yOff - 10, 3, 18);
      ctx.fillRect(screenX + 15, yOff - 18, 3, 20);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(screenX - 9, yOff - 22, 18, 14);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(screenX - 6, yOff - 17, 3, 3);
      ctx.fillRect(screenX + 3, yOff - 17, 3, 3);
    } else if (enemy.id === 'boss_agua') {
      // Kraken of Water
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(screenX - 14, yOff - 20, 28, 22);
      ctx.fillStyle = '#0284c7';
      for (let i = -12; i <= 12; i += 6) {
        ctx.fillRect(screenX + i, yOff + 2, 4, 14 + Math.sin((timestamp + i * 50) / 200) * 4);
      }
      ctx.fillStyle = '#fde047';
      ctx.fillRect(screenX - 8, yOff - 12, 5, 5);
      ctx.fillRect(screenX + 3, yOff - 12, 5, 5);
    } else if (enemy.id === 'boss_ar') {
      // Tiamat of Wind
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(screenX - 26, yOff - 18);
      ctx.lineTo(screenX - 6, yOff - 2);
      ctx.lineTo(screenX - 18, yOff + 12);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(screenX + 26, yOff - 18);
      ctx.lineTo(screenX + 6, yOff - 2);
      ctx.lineTo(screenX + 18, yOff + 12);
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(screenX - 12, yOff - 10, 24, 22);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(screenX - 9, yOff - 24, 18, 15);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(screenX - 6, yOff - 18, 3.5, 3.5);
      ctx.fillRect(screenX + 2.5, yOff - 18, 3.5, 3.5);
    } else {
      // Chaos Supreme Overlord
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(screenX - 28, yOff - 20);
      ctx.lineTo(screenX - 8, yOff);
      ctx.lineTo(screenX - 20, yOff + 16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(screenX + 28, yOff - 20);
      ctx.lineTo(screenX + 8, yOff);
      ctx.lineTo(screenX + 20, yOff + 16);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX - 14, yOff - 12, 28, 26);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(screenX, yOff + 1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screenX - 10, yOff - 26, 20, 16);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(screenX - 7, yOff - 20, 4, 4);
      ctx.fillRect(screenX + 3, yOff - 20, 4, 4);
    }

    const bossLabel = enemy.name ? enemy.name.toUpperCase() : 'CHEFE';
    ctx.font = 'bold 10px monospace';
    const textW = ctx.measureText(bossLabel).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(screenX - textW / 2 - 6, yOff - 38, textW + 12, 14);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX - textW / 2 - 6, yOff - 38, textW + 12, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bossLabel, screenX, yOff - 31);
  } else {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(enemy.emoji || '👾', screenX, screenY + floatAnim);
  }

  ctx.restore();
}
