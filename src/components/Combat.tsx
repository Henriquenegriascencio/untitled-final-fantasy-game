import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CombatUnit, Weapon, MapId } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { UnitAvatar } from './HeroPortrait';
import { soundFX, bgm } from '../utils/audio';

type CombatProps = {
  mapId: MapId;
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  onVictory: (exp: number, gold: number, drops: string[]) => void;
  onDefeat: () => void;
};

const GRID_SIZE = 8;

const THEMES: Record<MapId, { bg: string, wrapperBg: string, tileBg: string, tileBorder: string }> = {
  OVERWORLD: { bg: 'bg-green-950', wrapperBg: 'bg-green-900/60', tileBg: 'bg-green-800/80', tileBorder: 'border-green-900/80' },
  DUNGEON_FOGO: { bg: 'bg-red-950', wrapperBg: 'bg-red-900/60', tileBg: 'bg-orange-900/80', tileBorder: 'border-orange-950/80' },
  DUNGEON_AGUA: { bg: 'bg-blue-950', wrapperBg: 'bg-blue-900/60', tileBg: 'bg-cyan-900/80', tileBorder: 'border-cyan-950/80' },
  DUNGEON_AR: { bg: 'bg-slate-900', wrapperBg: 'bg-slate-800/60', tileBg: 'bg-sky-200/80', tileBorder: 'border-white/50' },
  DUNGEON_TERRA: { bg: 'bg-stone-950', wrapperBg: 'bg-stone-900/60', tileBg: 'bg-amber-900/80', tileBorder: 'border-amber-950/80' }
};

interface CombatSkillDef {
  id: string;
  name: string;
  cost: number;
  minLevel: number;
  desc: string;
}

interface CombatMagicDef {
  id: string;
  name: string;
  cost: number;
  element: 'fire' | 'ice' | 'lightning' | 'holy' | 'poison';
  desc: string;
}

interface CombatItemDef {
  id: string;
  name: string;
  desc: string;
  type: 'heal_hp' | 'heal_mp' | 'heal_all' | 'cure_debuff';
  value: number;
}

const CLASS_SKILLS_DATA: Record<string, CombatSkillDef[]> = {
  'Cavalheiro': [
    { id: 'skill_1', name: 'Golpe Esmagador', cost: 20, minLevel: 1, desc: 'Ataque pesado que causa 1.5x de dano fisico.' },
    { id: 'skill_2', name: 'Defesa Absoluta', cost: 50, minLevel: 3, desc: 'Concede postura inabalavel e causa alto dano.' },
    { id: 'skill_3', name: 'Lamina Sagrada', cost: 100, minLevel: 5, desc: 'Golpe divino sagrado com dano critico supremo.' },
  ],
  'Mago': [
    { id: 'skill_1', name: 'Explosao Arcana', cost: 20, minLevel: 1, desc: 'Concentra energia arcana em um estouro magico.' },
    { id: 'skill_2', name: 'Dreno de Vida', cost: 50, minLevel: 3, desc: 'Drena forca vital do alvo e cura o conjurador.' },
    { id: 'skill_3', name: 'Meteoro', cost: 100, minLevel: 5, desc: 'Evoca chuva de meteoros causando destruicao.' },
  ],
  'Arqueiro': [
    { id: 'skill_1', name: 'Chuva de Flechas', cost: 20, minLevel: 1, desc: 'Saraivada precisa disparada a longa distancia.' },
    { id: 'skill_2', name: 'Flecha Perfurante', cost: 50, minLevel: 3, desc: 'Flecha veloz que ignora parte da defesa.' },
    { id: 'skill_3', name: 'Tiro Fatal', cost: 100, minLevel: 5, desc: 'Disparo no ponto vital com poder devastador.' },
  ],
  'Alquimista': [
    { id: 'skill_1', name: 'Pocao Explosiva', cost: 20, minLevel: 1, desc: 'Frasco volatil que explode no contato.' },
    { id: 'skill_2', name: 'Gas Toxico', cost: 50, minLevel: 3, desc: 'Nuvem quimica venenosa com dano prolongado.' },
    { id: 'skill_3', name: 'Elixir Mistico', cost: 100, minLevel: 5, desc: 'Frasco supremo revigorante com grande efeito.' },
  ],
  'Lutador': [
    { id: 'skill_1', name: 'Soco Furacao', cost: 20, minLevel: 1, desc: 'Sequencia veloz de socos com tremendo impacto.' },
    { id: 'skill_2', name: 'Chute Relampago', cost: 50, minLevel: 3, desc: 'Chute supersonico atordoante de alto dano.' },
    { id: 'skill_3', name: 'Combo Infinito', cost: 100, minLevel: 5, desc: 'Sequencia lendaria de golpes fulminantes.' },
  ],
  'Inventor': [
    { id: 'skill_1', name: 'Raio Laser', cost: 20, minLevel: 1, desc: 'Feixe de energia pura condensada.' },
    { id: 'skill_2', name: 'Torreta Movel', cost: 50, minLevel: 3, desc: 'Disparo perfurante automatizado.' },
    { id: 'skill_3', name: 'Autodestruicao', cost: 100, minLevel: 5, desc: 'Detona ogiva experimental com dano massivo.' },
  ]
};

const COMBAT_MAGICS_DATA: CombatMagicDef[] = [
  { id: 'Fogo', name: 'Fogo', cost: 10, element: 'fire', desc: 'Chamas ardentes que causam dano e queimadura por 3 turnos.' },
  { id: 'Gelo', name: 'Gelo', cost: 10, element: 'ice', desc: 'Rajada congelante que reduz a mobilidade do inimigo.' },
  { id: 'Trovao', name: 'Trovao', cost: 12, element: 'lightning', desc: 'Raio de alta voltagem com impacto imediato severo.' },
  { id: 'Cura', name: 'Cura', cost: 10, element: 'holy', desc: 'Prece restauradora que cura 60 HP de um aliado no alcance.' },
  { id: 'Veneno', name: 'Veneno', cost: 8, element: 'poison', desc: 'Miasma venenoso que drena HP a cada turno.' },
];

const COMBAT_ITEMS_DATA: CombatItemDef[] = [
  { id: 'potion', name: 'Pocao de Cura', desc: 'Restaura 50 HP de um aliado.', type: 'heal_hp', value: 50 },
  { id: 'super_potion', name: 'Super Pocao', desc: 'Restaura 120 HP de um aliado.', type: 'heal_hp', value: 120 },
  { id: 'ether', name: 'Eter', desc: 'Restaura 40 MP de um aliado.', type: 'heal_mp', value: 40 },
  { id: 'antidote', name: 'Antidoto', desc: 'Cura efeitos de veneno e queimadura.', type: 'cure_debuff', value: 0 },
  { id: 'elixir', name: 'Elixir', desc: 'Restaura 100 HP e 50 MP de um aliado.', type: 'heal_all', value: 100 },
];

export const Combat: React.FC<CombatProps> = ({ mapId, playerUnits, enemyUnits, onVictory, onDefeat }) => {
  const [units, setUnits] = useState<CombatUnit[]>([]);
  const [elevations, setElevations] = useState<number[][]>([]);
  const [turnQueue, setTurnQueue] = useState<string[]>([]);
  const [sceneryItems, setSceneryItems] = useState<{x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[]>([]);
  const [actionText, setActionText] = useState<{text: string, id: number} | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [isTurnTransitioning, setIsTurnTransitioning] = useState(false);
  const [nextUpcomingUnitId, setNextUpcomingUnitId] = useState<string | null>(null);
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [rotZ, setRotZ] = useState(45);
  const [rotX, setRotX] = useState(55);
  const [dragTool, setDragTool] = useState<'orbit' | 'pan'>('orbit');
  const [envScenery, setEnvScenery] = useState<{x:number, y:number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[]>([]);

  // Camera State: Auto Tracking & Free Camera
  const [isFreeCamera, setIsFreeCamera] = useState(false);
  const [userZoom, setUserZoom] = useState(1);
  const [actionZoomMultiplier, setActionZoomMultiplier] = useState(1);
  const [cameraFocus, setCameraFocus] = useState<{ x: number, y: number }>({ x: 3.5, y: 3.5 });
  const [freeCamOffset, setFreeCamOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isPointerDownRef = useRef(false);
  const dragModeRef = useRef<'pan' | 'orbit'>('pan');
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const handleToggle3D = () => {
    setIs3D(prev => {
      const next = !prev;
      setRotZ(next ? 45 : 0);
      setRotX(next ? 55 : 0);
      return next;
    });
  };
  const [selectedAction, setSelectedAction] = useState<'MOVE' | 'ATTACK' | 'MAGIC' | 'ITEM' | 'SKILL' | null>(null);
  const [actionMenu, setActionMenu] = useState<'MAIN' | 'SKILLS' | 'MAGIC' | 'ITEM'>('MAIN');
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);
  const [isVictoryCelebration, setIsVictoryCelebration] = useState(false);
  const [combatInventory, setCombatInventory] = useState<{ [id: string]: number }>({
    potion: 3,
    super_potion: 2,
    ether: 2,
    antidote: 2,
    elixir: 1
  });

  const [visualEffects, setVisualEffects] = useState<{id: number, unitId: string, type: 'attack' | 'hit' | 'heal' | 'magic', value?: string, x: number, y: number, startX?: number, startY?: number, attackKind?: 'melee' | 'ranged' | 'magic', magicKind?: string}[]>([]);
  const [victoryData, setVictoryData] = useState<{ exp: number, gold: number, drops: string[] } | null>(null);

  // Convert grid coordinates (0..7) to screen offset in pixels
  const getCameraOffset = useCallback((gridX: number, gridY: number) => {
    const localX = (gridX - 3.5) * 56;
    const localY = (gridY - 3.5) * 56;

    const rad = (rotZ * Math.PI) / 180;
    const pitchRad = (rotX * Math.PI) / 180;
    const rotGridX = localX * Math.cos(rad) - localY * Math.sin(rad);
    const rotGridY = localX * Math.sin(rad) + localY * Math.cos(rad);

    const screenX = rotGridX;
    const screenY = is3D ? rotGridY * Math.cos(pitchRad) : rotGridY;

    return {
      x: -screenX,
      y: -screenY,
    };
  }, [rotZ, rotX, is3D]);

  const billboardTransform = is3D ? `rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` : 'none';

  const currentAutoOffset = getCameraOffset(cameraFocus.x, cameraFocus.y);
  const cameraX = isFreeCamera ? freeCamOffset.x : currentAutoOffset.x;
  const cameraY = isFreeCamera ? freeCamOffset.y : currentAutoOffset.y;
  const effectiveZoom = Math.min(2.5, Math.max(0.5, userZoom * actionZoomMultiplier));
  const cameraZ = is3D ? Math.min(500, (effectiveZoom - 1) * 550) : 0;
  const cameraScale = is3D ? Math.pow(effectiveZoom, 0.4) : effectiveZoom;

  const focusOnGrid = useCallback((gx: number, gy: number, zoomMult: number = 1) => {
    setCameraFocus({ x: gx, y: gy });
    setActionZoomMultiplier(zoomMult);
    if (isFreeCamera) {
      setFreeCamOffset(getCameraOffset(gx, gy));
    }
  }, [isFreeCamera, getCameraOffset]);

  const focusBetweenUnits = useCallback((x1: number, y1: number, x2: number, y2: number, zoomMult: number = 1.35) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    focusOnGrid(midX, midY, zoomMult);
  }, [focusOnGrid]);

  const resetActionZoom = useCallback(() => {
    setActionZoomMultiplier(1);
  }, []);

  const snapToActiveUnit = useCallback((targetUnit?: CombatUnit) => {
    const u = targetUnit || units.find(unit => unit.id === activeUnitId);
    if (u) {
      setCameraFocus({ x: u.x, y: u.y });
      setFreeCamOffset(getCameraOffset(u.x, u.y));
    }
    setIsFreeCamera(false);
    setActionZoomMultiplier(1);
  }, [units, activeUnitId, getCameraOffset]);

  const nudgeCamera = (dx: number, dy: number) => {
    if (!isFreeCamera) {
      setIsFreeCamera(true);
      setFreeCamOffset({ x: currentAutoOffset.x + dx, y: currentAutoOffset.y + dy });
    } else {
      setFreeCamOffset(prev => ({
        x: Math.max(-600, Math.min(600, prev.x + dx)),
        y: Math.max(-600, Math.min(600, prev.y + dy)),
      }));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      if (e.button === 2 || e.button === 1) {
        // Botao direito ou meio do mouse: MOVER a camera (Pan)
        dragModeRef.current = 'pan';
      } else if (e.button === 0) {
        // Botao esquerdo do mouse: GIRAR a camera 3D (Orbit), ou mover caso esteja em 2D ou selecionou 'pan'
        if (is3D) {
          dragModeRef.current = dragTool === 'pan' ? 'pan' : 'orbit';
        } else {
          dragModeRef.current = 'pan';
        }
      } else {
        return;
      }
    } else {
      // Touch screen: obedece a ferramenta selecionada (Girar ou Mover)
      dragModeRef.current = (is3D && dragTool === 'orbit') ? 'orbit' : 'pan';
    }
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const totalDist = Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y);
    if (totalDist > 4) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDragging(true);
        if (dragModeRef.current === 'pan' && !isFreeCamera) {
          setIsFreeCamera(true);
          setFreeCamOffset(currentAutoOffset);
        }
      }

      if (dragModeRef.current === 'orbit' && is3D) {
        setRotZ(z => Math.round(z + dx * 0.45));
        setRotX(x => Math.max(25, Math.min(75, Math.round(x - dy * 0.3))));
      } else {
        setFreeCamOffset(prev => ({
          x: Math.max(-600, Math.min(600, prev.x + dx / effectiveZoom)),
          y: Math.max(-600, Math.min(600, prev.y + dy / effectiveZoom)),
        }));
      }
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setUserZoom(z => Math.min(2.2, Math.max(0.5, parseFloat((z + delta).toFixed(2)))));
  };

  const theme = THEMES[mapId] || THEMES.OVERWORLD;

  // Process debuffs on turn start
  useEffect(() => {
    if (!activeUnitId) return;
    setUnits(prev => {
      let changed = false;
      const next = prev.map(u => {
        if (u.id === activeUnitId && u.debuffs && u.debuffs.length > 0) {
          changed = true;
          let newHp = u.stats.hp;
          let remainingDebuffs = [];
          for (const d of u.debuffs) {
            if (d.type === 'burn') {
               newHp -= 10;
               showActionText(`${u.name || 'Inimigo'} sofreu queimadura!`);
            } else if (d.type === 'poison') {
               newHp -= 5;
               showActionText(`${u.name || 'Inimigo'} sofreu veneno!`);
            }
            if (d.duration > 1) {
               remainingDebuffs.push({ ...d, duration: d.duration - 1 });
            }
          }
          newHp = Math.max(0, newHp);
          // If died from debuff, check win condition might need to be triggered later
          return { ...u, stats: { ...u.stats, hp: newHp }, debuffs: remainingDebuffs };
        }
        return u;
      });
      return changed ? next : prev;
    });
  }, [activeUnitId]);


  // Initialize Combat
  useEffect(() => {
    // Generate terrain elevation
    const newElevations: number[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: number[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let elev = 0;
        if (mapId === 'DUNGEON_TERRA' || mapId === 'OVERWORLD' || mapId === 'DUNGEON_FOGO') {
           const r = Math.random();
           if (r > 0.95) elev = 2;
           else if (r > 0.8) elev = 1;
        }
        row.push(elev);
      }
      newElevations.push(row);
    }
    setElevations(newElevations);

        // 1. Calculate max VEL for players and enemies
    const maxPlayerVel = Math.max(...playerUnits.map(p => p.stats.vel));
    const maxEnemyVel = Math.max(...enemyUnits.map(e => e.stats.vel));
    const isAmbush = maxEnemyVel > maxPlayerVel;

    const occupied = new Set<string>();
    const getFreePos = (startX, startY, isEnemy) => {
      let nx = startX, ny = startY;
      while(occupied.has(`${nx},${ny}`)) {
         nx += Math.floor(Math.random() * 3) - 1;
         ny += Math.floor(Math.random() * 3) - 1;
         nx = Math.max(0, Math.min(GRID_SIZE-1, nx));
         ny = Math.max(0, Math.min(GRID_SIZE-1, ny));
      }
      occupied.add(`${nx},${ny}`);
      return {x: nx, y: ny};
    };

    const initPlayers = playerUnits.map((p, idx) => {
      let px = 1 + (idx % 2) + Math.floor(Math.random() * 2);
      let py = 6 - Math.floor(idx/2) - Math.floor(Math.random() * 2);
      const pos = getFreePos(px, py, false);
      return { ...p, ...pos, hasMoved: false, hasActed: false, debuffs: [] };
    });

    const initEnemies = enemyUnits.map((e, idx) => {
      let ex, ey;
      if (isAmbush) {
         ex = 2 + (idx % 3) + Math.floor(Math.random() * 2);
         ey = 3 - Math.floor(idx/2) + Math.floor(Math.random() * 2);
      } else {
         ex = 5 + (idx % 2) + Math.floor(Math.random() * 2);
         ey = 1 + Math.floor(idx/2) + Math.floor(Math.random() * 2);
      }
      const pos = getFreePos(Math.min(7, Math.max(0, ex)), Math.min(7, Math.max(0, ey)), true);
      return { ...e, ...pos, hasMoved: false, hasActed: false, debuffs: [] };
    });
    
    const allUnits = [...initPlayers, ...initEnemies];
    
    const sortedQueue = allUnits.sort((a, b) => b.stats.vel - a.stats.vel).map(u => u.id);
    
    setUnits(allUnits);
    setTurnQueue(sortedQueue);
    setActiveUnitId(sortedQueue[0]);
    if (isAmbush) showActionText('EMBOSCADA!');
    else showActionText('Combate Iniciado!');

    // Generate Scenery
    const sItems: {x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[] = [];
    const defaultProp: 'tree' | 'rock' | 'crystal' | 'spire' = mapId === 'OVERWORLD' ? 'tree' : mapId === 'DUNGEON_FOGO' ? 'spire' : mapId === 'DUNGEON_AGUA' ? 'crystal' : mapId === 'DUNGEON_TERRA' ? 'tree' : 'rock';
    for(let i = -2; i <= GRID_SIZE + 1; i++) {
        for(let j = -2; j <= GRID_SIZE + 1; j++) {
            if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) continue;
            if (Math.random() > 0.8) {
                sItems.push({ x: i, y: j, propType: defaultProp });
            }
        }
    }
    setSceneryItems(sItems);
    
    // Generate environment scenery (outside grid)
    const envItems: {x: number, y: number, propType: 'tree' | 'rock' | 'crystal' | 'spire'}[] = [];
    const envProps: ('tree' | 'rock' | 'crystal' | 'spire')[] = mapId === 'DUNGEON_TERRA' ? ['tree', 'rock'] : mapId === 'DUNGEON_FOGO' ? ['rock', 'spire'] : mapId === 'DUNGEON_AGUA' ? ['crystal', 'rock'] : ['tree', 'rock'];
    for(let i = 0; i < 40; i++) {
        let ex = Math.floor(Math.random() * 20) - 6;
        let ey = Math.floor(Math.random() * 20) - 6;
        if (ex >= -1 && ex <= GRID_SIZE && ey >= -1 && ey <= GRID_SIZE) continue; // Keep area around board clear
        envItems.push({ x: ex, y: ey, propType: envProps[Math.floor(Math.random() * envProps.length)] });
    }
    setEnvScenery(envItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
      }
    };
  }, []);

  const showActionText = (msg: string) => {
    const id = Date.now();
    setActionText({ text: msg, id });
    setTimeout(() => setActionText(prev => prev?.id === id ? null : prev), 3000);
  };

  const activeUnit = units.find(u => u.id === activeUnitId);
  const nextUpcomingUnit = units.find(u => u.id === nextUpcomingUnitId);

  const getNextAliveUnit = (queue: string[], currentUnits: CombatUnit[], currentActiveId: string): CombatUnit | null => {
    if (queue.length === 0) return null;
    const currentIndex = queue.indexOf(currentActiveId);
    const startIdx = currentIndex >= 0 ? currentIndex : 0;
    for (let i = 1; i <= queue.length; i++) {
      const idx = (startIdx + i) % queue.length;
      const candidateId = queue[idx];
      const unit = currentUnits.find(u => u.id === candidateId && u.stats.hp > 0);
      if (unit) return unit;
    }
    return null;
  };

  const nextTurn = () => {
    if (isTurnTransitioning) return;

    setSelectedAction(null);
    setActionMenu('MAIN');
    setSelectedSubItem(null);
    setIsActionBusy(false);
    resetActionZoom();

    // Calculate who is the next unit to act
    const nextUnit = getNextAliveUnit(turnQueue, units, activeUnitId);
    if (!nextUnit) return;

    // Start 1-second transition interval and highlight next unit with glow
    setIsTurnTransitioning(true);
    setNextUpcomingUnitId(nextUnit.id);

    // Smoothly pan camera to the upcoming unit if not in free camera mode
    if (!isFreeCamera) {
      focusOnGrid(nextUnit.x, nextUnit.y, 1.05);
    }

    const displayName = nextUnit.isPlayer 
      ? (nextUnit.name || nextUnit.heroClass || 'Heroi') 
      : (nextUnit.name || 'Inimigo');
    showActionText(nextUnit.isPlayer ? `Proximo a atacar: ${nextUnit.emoji} ${displayName}` : `Vez do Inimigo: ${nextUnit.emoji} ${displayName}`);

    if (turnTimeoutRef.current) {
      clearTimeout(turnTimeoutRef.current);
    }

    turnTimeoutRef.current = setTimeout(() => {
      setUnits(prev => prev.map(u => {
        if (u.id === activeUnitId) {
          return { ...u, hasMoved: false, hasActed: false }; // reset state
        }
        return u;
      }));

      setTurnQueue(prev => {
        const idx = prev.indexOf(nextUnit.id);
        if (idx === -1) return prev;
        return [...prev.slice(idx), ...prev.slice(0, idx)];
      });

      setActiveUnitId(nextUnit.id);
      setNextUpcomingUnitId(null);
      setIsTurnTransitioning(false);

      if (!isFreeCamera) {
        focusOnGrid(nextUnit.x, nextUnit.y, 1.05);
      }
    }, 1000); // 1-second interval with glow indicator
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
  };

  const handleUseItem = (itemDef: CombatItemDef) => {
    if (isActionBusy || activeUnit?.hasActed || !activeUnit) return;
    const count = combatInventory[itemDef.id] || 0;
    if (count <= 0) {
      soundFX.playCancel();
      showActionText('Item esgotado!');
      return;
    }

    const aliveAllies = units.filter(u => u.isPlayer && u.stats.hp > 0);
    if (aliveAllies.length === 0) return;

    let target = activeUnit;
    if (itemDef.type === 'heal_hp' || itemDef.type === 'heal_all') {
      const sorted = [...aliveAllies].sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp));
      target = sorted[0];
    } else if (itemDef.type === 'heal_mp') {
      const sorted = [...aliveAllies].sort((a, b) => (a.stats.mp / a.stats.maxMp) - (b.stats.mp / b.stats.maxMp));
      target = sorted[0];
    }

    soundFX.playHeal();
    setIsActionBusy(true);
    setActionMenu('MAIN');
    setSelectedAction(null);

    if (!isFreeCamera) {
      focusOnGrid(target.x, target.y, 1.35);
    }
    showActionText(`${activeUnit.name || 'Heroi'} usou ${itemDef.name}!`);

    setCombatInventory(prev => ({
      ...prev,
      [itemDef.id]: Math.max(0, (prev[itemDef.id] || 1) - 1)
    }));

    setTimeout(() => {
      let popupVal = `+${itemDef.value}`;
      const nextUnits = units.map(u => {
        if (u.id === target.id) {
          let newHp = u.stats.hp;
          let newMp = u.stats.mp;
          let newDebuffs = u.debuffs || [];
          if (itemDef.type === 'heal_hp') {
            newHp = Math.min(u.stats.maxHp, u.stats.hp + itemDef.value);
          } else if (itemDef.type === 'heal_mp') {
            newMp = Math.min(u.stats.maxMp, u.stats.mp + itemDef.value);
            popupVal = `+${itemDef.value} MP`;
          } else if (itemDef.type === 'heal_all') {
            newHp = Math.min(u.stats.maxHp, u.stats.hp + itemDef.value);
            newMp = Math.min(u.stats.maxMp, u.stats.mp + 50);
            popupVal = `+${itemDef.value} HP/MP`;
          } else if (itemDef.type === 'cure_debuff') {
            newDebuffs = [];
            popupVal = 'CURADO';
          }
          return { ...u, stats: { ...u.stats, hp: newHp, mp: newMp }, debuffs: newDebuffs };
        }
        if (u.id === activeUnit.id) {
          return { ...u, hasActed: true };
        }
        return u;
      });

      setUnits(nextUnits);
      const effId = Date.now();
      setVisualEffects(prev => [
        ...prev,
        { id: effId, unitId: target.id, type: 'heal', value: popupVal, x: target.x, y: target.y }
      ]);
      showActionText(`${target.name || 'Heroi'} recuperou com ${itemDef.name}!`);

      setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1000);

      setTimeout(() => {
        setIsActionBusy(false);
        resetActionZoom();
        nextTurn();
      }, 1200);
    }, 300);
  };

  const handleCellClick = (x: number, y: number) => {
    if (hasDraggedRef.current || isDragging) return;
    if (isTurnTransitioning || isActionBusy || !activeUnit || !activeUnit.isPlayer) return;

    if (selectedAction === 'MOVE' && !activeUnit.hasMoved) {
      const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
      if (dist > 0 && dist <= activeUnit.stats.mov) {
        if (units.some(u => u.x === x && u.y === y && u.stats.hp > 0)) {
          soundFX.playCancel();
          showActionText('Celula ocupada!');
          return;
        }
        soundFX.playCursor();
        setIsActionBusy(true);
        setSelectedAction(null);
        showActionText(`${activeUnit.name || 'Heroi'} moveu-se.`);

        // Camera smoothly follows movement to destination
        if (!isFreeCamera) {
          focusOnGrid(x, y, 1.1);
        }

        setUnits(prev => prev.map(u => u.id === activeUnit.id ? { ...u, x, y, hasMoved: true } : u));
        
        // Small delay so the player sees the move and camera track
        setTimeout(() => {
          setIsActionBusy(false);
        }, 600);
      } else {
        soundFX.playCancel();
        showActionText('Invalido ou fora de alcance.');
      }
    } 
    else if (selectedAction === 'ATTACK' && !activeUnit.hasActed) {
      const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
      if (target) {
        const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
        if (dist <= activeUnit.weapon.range) {
          setIsActionBusy(true);
          setSelectedAction(null);
          soundFX.playAttack();

          // 1. Camera focuses & zooms in on confrontation
          if (!isFreeCamera) {
            focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.35);
          }
          showActionText(`${activeUnit.name || 'Heroi'} prepara ataque!`);

          // 2. Anticipation delay
          setTimeout(() => {
            const damage = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - target.stats.def);
            soundFX.playHit();
            
            const nextUnits = units.map(u => {
              if (u.id === target.id) {
                 const newHp = Math.max(0, u.stats.hp - damage);
                 return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
              }
              if (u.id === activeUnit.id) {
                 return { ...u, hasActed: true, stats: { ...u.stats, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
              }
              return u;
            });
            
            const effId = Date.now();
            const attKind: 'melee' | 'ranged' | 'magic' = activeUnit.weapon?.type === 'ranged' ? 'ranged' : activeUnit.weapon?.type === 'magic' ? 'magic' : 'melee';
            setVisualEffects(prev => [
              ...prev, 
              { id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y }, 
              { id: effId + 1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, attackKind: attKind, x: target.x, y: target.y }
            ]);
            setUnits(nextUnits);
            showActionText(`Ataque causou ${damage} de dano!`);

            setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1000);

            // 3. Delay so player clearly sees the hit, damage numbers and consequence
            setTimeout(() => {
              setIsActionBusy(false);
              resetActionZoom();
              if (!checkWinCondition(nextUnits)) {
                nextTurn();
              }
            }, 1200);
          }, 300);
        }
      }
    }
    else if (selectedAction === 'MAGIC' && !activeUnit.hasActed) {
      if (selectedSubItem === 'Cura') {
        const allyTarget = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && u.isPlayer);
        if (allyTarget) {
          const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
          if (dist <= 3) {
            if (activeUnit.stats.mp < 10) {
              soundFX.playCancel();
              showActionText('MP Insuficiente para Cura!');
              return;
            }
            setIsActionBusy(true);
            setSelectedAction(null);
            soundFX.playHeal();
            if (!isFreeCamera) {
              focusBetweenUnits(activeUnit.x, activeUnit.y, allyTarget.x, allyTarget.y, 1.4);
            }
            showActionText(`Conjurando Cura em ${allyTarget.name || 'Heroi'}...`);
            setTimeout(() => {
              const healAmount = Math.max(35, (activeUnit.stats.int * 2) + 20);
              const nextUnits = units.map(u => {
                if (u.id === allyTarget.id) {
                  return { ...u, stats: { ...u.stats, hp: Math.min(u.stats.maxHp, u.stats.hp + healAmount) } };
                }
                if (u.id === activeUnit.id) {
                  return { ...u, hasActed: true, stats: { ...u.stats, mp: u.stats.mp - 10 } };
                }
                return u;
              });
              const effId = Date.now();
              setVisualEffects(prev => [
                ...prev,
                { id: effId, unitId: allyTarget.id, type: 'heal', value: `+${healAmount}`, x: allyTarget.x, y: allyTarget.y }
              ]);
              setUnits(nextUnits);
              showActionText(`${allyTarget.name || 'Heroi'} recuperou ${healAmount} HP!`);
              setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId)), 1000);
              setTimeout(() => {
                setIsActionBusy(false);
                resetActionZoom();
                nextTurn();
              }, 1200);
            }, 300);
            return;
          } else {
            showActionText('Fora de alcance de Cura.');
            return;
          }
        }
      }

      if (activeUnit.stats.mp >= 10) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
            if (dist <= 3) {
               setIsActionBusy(true);
               setSelectedAction(null);
               soundFX.playMagic();

               if (!isFreeCamera) {
                 focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.4);
               }
               showActionText(`Conjurando ${selectedSubItem}...`);

               setTimeout(() => {
                 const damage = Math.max(1, (activeUnit.stats.int * 2) - target.stats.def);
                 soundFX.playHit();
                 
                 const nextUnits = units.map(u => {
                   if (u.id === target.id) {
                      const newHp = Math.max(0, u.stats.hp - damage);
                      let debuffs = u.debuffs || [];
                      if (selectedSubItem === 'Fogo') debuffs = [...debuffs.filter(d=>d.type!=='burn'), {type: 'burn', duration: 3}];
                      if (selectedSubItem === 'Veneno') debuffs = [...debuffs.filter(d=>d.type!=='poison'), {type: 'poison', duration: 3}];
                      if (selectedSubItem === 'Gelo') debuffs = [...debuffs.filter(d=>d.type!=='freeze'), {type: 'freeze', duration: 2}];
                      return { ...u, debuffs, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
                   }
                   if (u.id === activeUnit.id) {
                      return { ...u, hasActed: true, stats: { ...u.stats, mp: u.stats.mp - 10, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
                   }
                   return u;
                 });
                 
                 const effId = Date.now();
                 setVisualEffects(prev => [
                   ...prev, 
                   { id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y }, 
                   { id: effId + 1, unitId: target.id, type: 'magic', x: target.x, y: target.y, magicKind: selectedSubItem }
                 ]);
                 setUnits(nextUnits);
                 showActionText(`${selectedSubItem} causou ${damage} de dano!`);

                 setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1000);

                 setTimeout(() => {
                   setIsActionBusy(false);
                   resetActionZoom();
                   if (!checkWinCondition(nextUnits)) {
                      nextTurn();
                   }
                 }, 1200);
               }, 300);
            } else {
               showActionText('Fora de alcance.');
            }
        }
      } else {
         showActionText('MP Insuficiente.');
      }
    }
    else if (selectedAction === 'SKILL' && !activeUnit.hasActed) {
      let spCost = 20;
      if (selectedSubItem === 'skill_2') spCost = 50;
      if (selectedSubItem === 'skill_3') spCost = 100;

      if ((activeUnit.stats.sp || 0) >= spCost) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            const skillRange = activeUnit.heroClass === 'Arqueiro' ? 3 : (activeUnit.weapon?.range || 1);
            const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
            if (dist > skillRange) {
              soundFX.playCancel();
              showActionText('Alvo fora do alcance da tecnica.');
              return;
            }

            setIsActionBusy(true);
            setSelectedAction(null);

            if (!isFreeCamera) {
              focusBetweenUnits(activeUnit.x, activeUnit.y, target.x, target.y, 1.45);
            }
            showActionText(`Executando Tecnica Especial!`);
            soundFX.playAttack();

            setTimeout(() => {
              let damage = 0;
              let logMsg = '';
              
              let mult = 1;
              if (spCost === 50) mult = 2.5;
              if (spCost === 100) mult = 5;

              if (activeUnit.heroClass === 'Cavalheiro') { damage = (activeUnit.stats.for * 2.5 * mult) - target.stats.def; logMsg = 'Golpe Esmagador'; }
              if (activeUnit.heroClass === 'Mago') { damage = (activeUnit.stats.int * 3 * mult) - target.stats.def; logMsg = 'Explosao Arcana'; }
              if (activeUnit.heroClass === 'Alquimista') { damage = (activeUnit.stats.int * 2 * mult) + (15 * mult) - target.stats.def; logMsg = 'Pocao Explosiva'; }
              if (activeUnit.heroClass === 'Arqueiro') { damage = (activeUnit.stats.for * 1.5 * mult) + (activeUnit.stats.vel * 1.5 * mult) - target.stats.def; logMsg = 'Chuva de Flechas'; }
              if (activeUnit.heroClass === 'Lutador') { damage = (activeUnit.stats.for * 3 * mult) - target.stats.def; logMsg = 'Soco Furacao'; }
              if (activeUnit.heroClass === 'Inventor') { damage = (activeUnit.stats.int * 1.5 * mult) + (activeUnit.stats.for * 1.5 * mult) - target.stats.def; logMsg = 'Raio Laser'; }
              
              damage = Math.max(1, Math.floor(damage));
              soundFX.playHit();

              const nextUnits = units.map(u => {
                if (u.id === target.id) {
                   const newHp = Math.max(0, u.stats.hp - damage);
                   return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                }
                if (u.id === activeUnit.id) {
                   return { ...u, hasActed: true, stats: { ...u.stats, sp: (u.stats.sp || 0) - spCost } };
                }
                return u;
              });
              
              const effId = Date.now();
              setVisualEffects(prev => [
                ...prev, 
                { id: effId, unitId: target.id, type: 'hit', value: `-${damage}!`, x: target.x, y: target.y }, 
                { id: effId + 1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, attackKind: 'magic' }
              ]);
              setUnits(nextUnits);
              showActionText(`${logMsg} causou ${damage} de dano CRITICO!`);

              setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1000);

              setTimeout(() => {
                setIsActionBusy(false);
                resetActionZoom();
                if (!checkWinCondition(nextUnits)) {
                   nextTurn();
                }
              }, 1300);
            }, 350);
        }
      } else {
         showActionText('SP Insuficiente.');
      }
    }
  };

  const checkWinCondition = (currentUnits: CombatUnit[]) => {
     const aliveEnemies = currentUnits.filter(u => !u.isPlayer && u.stats.hp > 0);
     const alivePlayers = currentUnits.filter(u => u.isPlayer && u.stats.hp > 0);
     
     if (alivePlayers.length === 0) {
        setTimeout(onDefeat, 1500);
        return true;
     } else if (aliveEnemies.length === 0) {
        setIsVictoryCelebration(true);
        bgm.playVictory();
        showActionText('Vitoria!');
        setTimeout(() => {
          const totalExp = enemyUnits.reduce((sum, e) => sum + (e.level || 1) * 20, 0);
          const totalGold = enemyUnits.reduce((sum, e) => sum + (e.level || 1) * 15, 0);
          const drops = [];
          if (Math.random() > 0.5) drops.push('Pocao de Cura');
          if (Math.random() > 0.8) drops.push('Eter');
          
          setVictoryData({ exp: totalExp, gold: totalGold, drops });
        }, 1500);
        return true;
     }
     return false;
  };

  // AI Turn Implementation with camera follow, zoom in on attack, and pacing delays
  useEffect(() => {
    if (!isTurnTransitioning && activeUnit && !activeUnit.isPlayer && activeUnit.stats.hp > 0) {
       let isCancelled = false;

       const runAi = async () => {
          setIsActionBusy(true);

          // 1. Camera focuses on active enemy
          if (!isFreeCamera) {
            focusOnGrid(activeUnit.x, activeUnit.y, 1.15);
          }
          showActionText(`Turno Inimigo: ${activeUnit.name || 'Inimigo'}`);

          // Deliberation pause
          await new Promise(r => setTimeout(r, 900));
          if (isCancelled) return;
          
          const alivePlayers = units.filter(u => u.isPlayer && u.stats.hp > 0);
          if (alivePlayers.length === 0) {
             setIsActionBusy(false);
             nextTurn();
             return;
          }

          const aliveEnemies = units.filter(u => !u.isPlayer && u.stats.hp > 0);
          // SOS Reinforcement logic
          if (aliveEnemies.length < 3 && activeUnit.stats.hp <= (activeUnit.stats.maxHp || 50) * 0.4 && Math.random() < 0.35) {
             showActionText(`${activeUnit.emoji} pediu reforcos (SOS)!`);
             if (!isFreeCamera) {
               focusOnGrid(activeUnit.x, activeUnit.y, 1.25);
             }
             await new Promise(r => setTimeout(r, 600));

             const newId = 'sos_' + Date.now();
             const newEnemy: CombatUnit = {
                ...activeUnit,
                id: newId,
                stats: { ...activeUnit.stats, hp: activeUnit.stats.maxHp },
                x: 0, y: 0,
                hasActed: true, hasMoved: true
             };
             // Find free pos
             const occupied = new Set(units.map(u => `${u.x},${u.y}`));
             for (let y = 0; y < GRID_SIZE; y++) {
                for(let x = GRID_SIZE - 1; x >= 0; x--) {
                   if (!occupied.has(`${x},${y}`)) {
                      newEnemy.x = x; newEnemy.y = y;
                      break;
                   }
                }
                if (newEnemy.x !== 0) break;
             }
             setUnits(prev => [...prev, newEnemy]);
             setVisualEffects(prev => [...prev, {id: Date.now(), unitId: newId, type: 'hit', value: 'SOS', x: newEnemy.x, y: newEnemy.y}]);
             
             await new Promise(r => setTimeout(r, 1200));
             setIsActionBusy(false);
             resetActionZoom();
             nextTurn();
             return;
          }

          // Tactical Advantage AI Target Selection
          // Evaluates all alive player units and scores them based on tactical advantages:
          // 1. Lethal blow: can KO the hero this turn (+150)
          // 2. Wounded hero focus: prioritizes lower HP% to secure elimination (+70 * (1 - hp%))
          // 3. Defense vulnerability: targets where damage output is highest (+potentialDmg * 2.5)
          // 4. Strategic priority: fragile high-threat spellcasters (+40 for Mago/Alquimista)
          // 5. Reachability: bonus if already in attack range (+40), penalty for long distances (-dist * 6)
          let bestPlayer = alivePlayers[0];
          let bestScore = -9999;

          for (const p of alivePlayers) {
             const dist = getDistance(activeUnit.x, activeUnit.y, p.x, p.y);
             const potentialDmg = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - p.stats.def);
             const hpRatio = p.stats.hp / p.stats.maxHp;

             let score = 0;

             // Lethal priority
             if (potentialDmg >= p.stats.hp) {
                score += 150;
             }

             // Wounded target priority
             score += (1 - hpRatio) * 70;

             // Defense vulnerability exploitation
             score += potentialDmg * 2.5;

             // High value spellcaster / ranged threat priority
             if (p.heroClass === 'Mago' || p.heroClass === 'Alquimista') {
                score += 40;
             } else if (p.heroClass === 'Arqueiro') {
                score += 25;
             }

             // In weapon range right now
             if (dist <= activeUnit.weapon.range) {
                score += 40;
             } else {
                score -= dist * 6;
             }

             if (score > bestScore) {
                bestScore = score;
                bestPlayer = p;
             }
          }

          let targetPlayer = bestPlayer;
          let curX = activeUnit.x;
          let curY = activeUnit.y;
          let currentDist = getDistance(curX, curY, targetPlayer.x, targetPlayer.y);

          // If not in attack range, move towards target player first
          if (currentDist > activeUnit.weapon.range) {
             const dx = targetPlayer.x > curX ? 1 : (targetPlayer.x < curX ? -1 : 0);
             const dy = targetPlayer.y > curY ? 1 : (targetPlayer.y < curY ? -1 : 0);
             
             let newX = curX;
             let newY = curY;

             if (dx !== 0 && !units.some(u => u.x === curX + dx && u.y === curY && u.stats.hp > 0)) {
                newX += dx;
             } else if (dy !== 0 && !units.some(u => u.x === curX && u.y === curY + dy && u.stats.hp > 0)) {
                newY += dy;
             }

             if (newX !== curX || newY !== curY) {
                curX = newX;
                curY = newY;
                setUnits(prev => prev.map(u => u.id === activeUnit.id ? { ...u, x: newX, y: newY, hasMoved: true } : u));
                showActionText(`${activeUnit.name || 'Inimigo'} avanca buscando vantagem contra ${targetPlayer.name || 'Heroi'}...`);
                if (!isFreeCamera) {
                   focusOnGrid(newX, newY, 1.15);
                }
                await new Promise(r => setTimeout(r, 700));
                if (isCancelled) return;
             }
          }

          // Recheck distance after moving
          currentDist = getDistance(curX, curY, targetPlayer.x, targetPlayer.y);
          if (currentDist <= activeUnit.weapon.range) {
             // Attack target player with camera zoom!
             if (!isFreeCamera) {
                focusBetweenUnits(curX, curY, targetPlayer.x, targetPlayer.y, 1.35);
             }
             showActionText(`${activeUnit.name || 'Inimigo'} explora vantagem e ataca ${targetPlayer.name || 'Heroi'}!`);
             soundFX.playAttack();
             await new Promise(r => setTimeout(r, 350));
             if (isCancelled) return;

             const damage = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - targetPlayer.stats.def);
             soundFX.playHit();
             const effId = Date.now();
             const attKind: 'melee' | 'ranged' | 'magic' = activeUnit.weapon?.type === 'ranged' ? 'ranged' : activeUnit.weapon?.type === 'magic' ? 'magic' : 'melee';

             setVisualEffects(prev => [
               ...prev, 
               { id: effId, unitId: targetPlayer.id, type: 'hit', value: `-${damage}`, x: targetPlayer.x, y: targetPlayer.y }, 
               { id: effId + 1, unitId: targetPlayer.id, type: 'attack', startX: curX, startY: curY, attackKind: attKind, x: targetPlayer.x, y: targetPlayer.y }
             ]);

             let nextUnits: CombatUnit[] = [];
             setUnits(prev => {
                nextUnits = prev.map(u => {
                   if (u.id === targetPlayer.id) {
                      const newHp = Math.max(0, u.stats.hp - damage);
                      return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                   }
                   return u;
                });
                return nextUnits;
             });

             setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId + 1)), 1000);

             // Delay so player sees attack damage on their hero
             await new Promise(r => setTimeout(r, 1200));
             if (isCancelled) return;

             setIsActionBusy(false);
             resetActionZoom();

             if (checkWinCondition(nextUnits)) {
                return;
             }
          } else {
             // Finished turn without attacking
             await new Promise(r => setTimeout(r, 500));
             setIsActionBusy(false);
             resetActionZoom();
          }

          nextTurn();
       };

       runAi();
       return () => { isCancelled = true; };
    }
  }, [activeUnitId]);


  // Mouse Drag Camera Handlers
  

    
    const renderUnits = () => {
    return units.filter(u => u.stats.hp > 0).map(unit => {
      const elev = elevations[unit.y]?.[unit.x] || 0;
      const effects = visualEffects.filter(v => v.unitId === unit.id);
      const isHit = effects.some(v => v.type === 'hit');
      const isBuff = effects.some(v => v.type === 'heal' || v.type === 'magic');
      const isActive = unit.id === activeUnitId;
      const isNextUpcoming = unit.id === nextUpcomingUnitId;
      const hpPercent = Math.max(0, Math.min(100, (unit.stats.hp / unit.stats.maxHp) * 100));

      return (
        <div 
          key={unit.id}
          className={`absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center transition-all duration-300 ease-out z-30 ${isHit ? 'animate-pulse' : ''}`}
          style={{ 
            left: 8 + unit.x * 56, 
            top: 8 + unit.y * 56,
            transformStyle: is3D ? 'preserve-3d' : 'flat',
            transform: is3D ? `translateZ(${elev * 16 + 2}px)` : 'none'
          }}
        >
          {/* Ground Footprint & Tactical Base Ring (Lies flat on tile floor) */}
          <div 
            className={`absolute w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center shadow-[inset_0_0_0_1px_#000] ${
              isNextUpcoming
                ? 'border-slate-100 ring-2 ring-yellow-400 shadow-[inset_0_0_0_1px_#000,0_0_15px_rgba(250,204,21,1)] scale-105'
                : isActive 
                  ? 'border-slate-200 ring-1 ring-yellow-400 shadow-[inset_0_0_10px_rgba(250,204,21,0.8)] animate-pulse' 
                  : unit.isPlayer 
                    ? 'border-slate-300 shadow-[inset_0_0_0_1px_#000,0_0_6px_rgba(59,130,246,0.8)]' 
                    : 'border-red-400 shadow-[inset_0_0_0_1px_#000,0_0_6px_rgba(239,68,68,0.8)]'
            }`}
            style={{
              background: unit.isPlayer || isNextUpcoming || isActive
                ? 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)'
                : 'linear-gradient(to bottom, #7f1d1d 0%, #000000 100%)',
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: is3D ? 'translateZ(1px)' : 'none'
            }}
          />

          {/* Soft Ground Shadow underneath miniature feet in 3D */}
          {is3D && (
            <div 
              className="absolute w-8 h-3 rounded-full bg-black/50 blur-[1.5px] -bottom-1 pointer-events-none" 
              style={{ transform: 'translateZ(1.5px)' }} 
            />
          )}

          {/* Radiant Aura / Glow on floor for Next Upcoming Attacker */}
          {isNextUpcoming && (
            <>
              <div 
                className="absolute -inset-6 rounded-full bg-yellow-400/40 animate-ping pointer-events-none" 
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? 'translateZ(1px)' : 'none'
                }}
              />
              <div 
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/60 via-yellow-300/80 to-amber-500/60 blur-md animate-pulse pointer-events-none" 
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? 'translateZ(1.5px)' : 'none'
                }}
              />
            </>
          )}

          {/* Upright Standing 3D Miniature Assembly (Billboarded facing the camera directly) */}
          <div 
            className="absolute bottom-[12px] flex flex-col items-center justify-end select-none pointer-events-none z-20"
            style={{
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: is3D ? `${billboardTransform} translateZ(8px)` : 'none',
              transformOrigin: 'center bottom',
              transition: isDragging ? 'none' : 'transform 0.4s ease-out'
            }}
          >
            {/* Victory Celebration Animation */}
            {isVictoryCelebration && unit.isPlayer && (
              <div className="absolute -top-10 flex flex-col items-center pointer-events-none z-40">
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-6, 6, -6], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1 drop-shadow-[0_2px_8px_rgba(250,204,21,1)] font-mono"
                >
                  <span className="text-[10px] text-black font-black tracking-widest bg-yellow-400 border border-black px-1.5 py-0.5 rounded shadow uppercase">
                    VITORIA!
                  </span>
                </motion.div>
              </div>
            )}

            {/* Next upcoming attacker banner in FF6 Battle Menu style */}
            {isNextUpcoming && !isVictoryCelebration && (
              <div className="mb-1 flex flex-col items-center pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <div 
                  className="rounded border-[2px] border-slate-100 px-1.5 py-0.5 shadow-[inset_0_0_0_1px_#000,0_3px_6px_rgba(0,0,0,0.9)] font-mono uppercase font-black text-[10px] whitespace-nowrap flex items-center gap-1"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <span className="text-yellow-400 text-[10px]">►</span>
                  <span className="text-white text-[9px] md:text-[10px] tracking-wider">PROXIMO</span>
                  <span className="text-yellow-400 text-[10px]">◄</span>
                </div>
                <span className="text-yellow-400 text-[10px] font-black leading-none -mt-0.5">▼</span>
              </div>
            )}

            {/* Active unit turn indicator in FF6 Battle Menu style */}
            {isActive && !isNextUpcoming && !isVictoryCelebration && (
              <div className="mb-1 flex flex-col items-center pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <div 
                  className="rounded border border-slate-200 px-1 py-0.5 shadow-[inset_0_0_0_1px_#000,0_2px_4px_rgba(0,0,0,0.9)] font-mono uppercase font-black text-[9px] text-white tracking-wider whitespace-nowrap flex items-center gap-1"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <span className="text-yellow-400 text-[9px]">►</span>
                  <span>TURNO</span>
                </div>
                <span className="text-white text-[9px] leading-none -mt-0.5">▼</span>
              </div>
            )}

            {/* Debuffs */}
            {unit.debuffs && unit.debuffs.length > 0 && (
              <div className="flex gap-0.5 mb-1">
                {unit.debuffs.map((d, i) => (
                  <span key={i} className="text-[9px] font-mono font-bold bg-black/90 px-1 py-0.2 rounded border border-slate-600 shadow text-amber-300">
                    {d.type === 'burn' ? 'FOG' : d.type === 'poison' ? 'TOX' : 'GEL'}
                  </span>
                ))}
              </div>
            )}

            {/* Status Bar (HP) */}
            <div className="w-10 h-2 bg-slate-950 border border-slate-600 rounded-full overflow-hidden shadow-black shadow-sm mb-1">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${hpPercent}%` }} 
              />
            </div>

            {/* Character Avatar Token standing upright with celebration bounce */}
            {isVictoryCelebration && unit.isPlayer ? (
              <motion.div
                animate={{
                  y: [0, -14, 0, -8, 0],
                  scale: [1, 1.15, 1, 1.08, 1],
                  rotate: [0, -6, 6, -3, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (units.filter(u => u.isPlayer).indexOf(unit) * 0.15)
                }}
                className="relative flex items-center justify-center drop-shadow-[0_6px_10px_rgba(250,204,21,0.9)]"
              >
                <UnitAvatar 
                  unit={unit} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded shadow-md border-2 border-yellow-300 overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
              </motion.div>
            ) : (
              <div 
                className={`relative flex items-center justify-center transition-all ${
                  isNextUpcoming 
                    ? 'scale-110 drop-shadow-[0_0_14px_rgba(250,204,21,1)]' 
                    : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]'
                }`}
              >
                <UnitAvatar 
                  unit={unit} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded shadow-md border-2 border-slate-100 overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
                {isBuff && <div className="absolute inset-0 bg-yellow-400/60 blur-sm rounded-full animate-ping pointer-events-none z-30" />}
                {isHit && <div className="absolute inset-0 bg-red-500/80 blur-sm rounded-full animate-ping pointer-events-none z-30" />}
                {isNextUpcoming && (
                  <span className="absolute text-lg -top-1.5 -right-1.5 animate-spin text-yellow-200 drop-shadow-[0_0_8px_rgba(250,204,21,1)] pointer-events-none z-20">✦</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

    const renderScenery = () => {
    const allScenery = is3D ? [...sceneryItems, ...envScenery] : sceneryItems;
    return allScenery.map((item, idx) => {
      const isEnv = idx >= sceneryItems.length;
      const elev = isEnv ? 0 : (elevations[item.y]?.[item.x] || 0);
      return (
        <div 
          key={`scenery-${idx}`} 
          className="absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center" 
          style={{ 
            left: 8 + item.x * 56, 
            top: 8 + item.y * 56, 
            transformStyle: is3D ? 'preserve-3d' : 'flat', 
            transform: is3D ? `translateZ(${elev * 16 + 2}px)` : 'none' 
          }}
        >
          {/* Shadow beneath scenery in 3D */}
          {is3D && (
            <div className="absolute w-8 h-3 rounded-full bg-black/40 blur-[1.5px] -bottom-1" />
          )}
          <div 
            className={`${isEnv ? 'w-10 h-10 opacity-85' : 'w-8 h-8'} select-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] flex items-center justify-center`}
            style={{
              transformStyle: is3D ? 'preserve-3d' : 'flat',
              transform: billboardTransform,
              transformOrigin: 'center bottom',
              transition: isDragging ? 'none' : 'transform 0.4s ease-out'
            }}
          >
            {item.propType === 'tree' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,2 6,16 11,16 4,24 28,24 21,16 26,16" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
                <rect x="13" y="24" width="6" height="7" fill="#78350f" />
              </svg>
            ) : item.propType === 'crystal' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,2 26,12 22,28 10,28 6,12" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                <polygon points="16,2 20,12 16,28 12,12" fill="#bae6fd" opacity="0.7" />
              </svg>
            ) : item.propType === 'spire' ? (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="16,3 25,28 7,28" fill="#b91c1c" stroke="#450a0a" strokeWidth="1.5" />
                <polygon points="16,3 20,28 12,28" fill="#f87171" opacity="0.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <polygon points="8,24 5,16 12,8 22,9 28,18 24,25" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                <polygon points="12,8 20,14 15,22 8,24 5,16" fill="#94a3b8" opacity="0.5" />
              </svg>
            )}
          </div>
        </div>
      );
    });
  };

      const renderEffects = () => {
    return visualEffects.map(eff => {
      const targetElev = elevations[eff.y]?.[eff.x] || 0;
      const targetZ = targetElev * 16 + 40;
      
      if (eff.type === 'hit') {
        return (
          <div
            key={eff.id}
            className="absolute pointer-events-none z-[150]"
            style={{
              left: 8 + eff.x * 56,
              top: 8 + eff.y * 56,
              width: 56, height: 56,
              transformStyle: is3D ? 'preserve-3d' : 'flat',
            }}
          >
            {/* 3D Floating Pop Damage Number directly in front */}
            <motion.div
              initial={{ y: 5, opacity: 0, scale: 0.5 }}
              animate={{ y: -50, opacity: [0, 1, 1, 0], scale: [0.5, 1.45, 1.1] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transformStyle: is3D ? 'preserve-3d' : 'flat',
                transform: is3D ? `translateZ(${targetZ + 36}px) ${billboardTransform}` : 'none'
              }}
            >
              <div 
                className="text-4xl md:text-5xl font-black text-red-500 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tracking-wider" 
                style={{ WebkitTextStroke: '2px black' }}
              >
                {eff.value}
              </div>
            </motion.div>

            {/* 3D Radial Impact Spark Particles in front */}
            {[
              { dx: -26, dy: -24, dz: 36, char: '✦', color: 'text-yellow-300' },
              { dx: 28, dy: -26, dz: 40, char: '✦', color: 'text-amber-400' },
              { dx: -24, dy: 18, dz: 32, char: '★', color: 'text-orange-400' },
              { dx: 26, dy: 20, dz: 34, char: '✦', color: 'text-yellow-200' },
              { dx: 0, dy: -34, dz: 46, char: '✦', color: 'text-red-400' },
              { dx: -14, dy: 26, dz: 30, char: '★', color: 'text-amber-300' },
            ].map((p, pIdx) => (
              <motion.div
                key={`spark-${eff.id}-${pIdx}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className={`absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none ${p.color} text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
                style={{
                  transformStyle: is3D ? 'preserve-3d' : 'flat',
                  transform: is3D ? `translateZ(${targetZ + p.dz}px) ${billboardTransform}` : 'none'
                }}
              >
                {p.char}
              </motion.div>
            ))}
          </div>
        );
      }

      if (eff.type === 'attack' && eff.startX !== undefined && eff.startY !== undefined) {
        const isMelee = eff.attackKind !== 'ranged' && eff.attackKind !== 'magic';
        
        return (
          <div key={eff.id} className="absolute inset-0 pointer-events-none z-[150]" style={{ transformStyle: is3D ? 'preserve-3d' : 'flat' }}>
            <motion.div
              initial={{ 
                left: 8 + eff.startX * 56, 
                top: 8 + eff.startY * 56, 
                scale: 0.7 
              }}
              animate={{ 
                left: 8 + eff.x * 56, 
                top: 8 + eff.y * 56, 
                scale: [0.7, 1.5, 1.25]
              }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute pointer-events-none flex items-center justify-center"
              style={{ 
                width: 56, height: 56, 
                transformStyle: is3D ? 'preserve-3d' : 'flat',
                transform: is3D ? `translateZ(${targetZ + 36}px) ${billboardTransform}` : 'none'
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* 3D Attack Icon Right in Front */}
                <div className="w-14 h-14 relative flex items-center justify-center filter drop-shadow-[0_0_16px_rgba(255,255,255,0.9)]">
                  {eff.attackKind === 'ranged' ? (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-yellow-300 -rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <polyline points="15 5 22 12 15 19" />
                    </svg>
                  ) : eff.attackKind === 'magic' ? (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-cyan-300 animate-spin" fill="currentColor">
                      <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                      <path d="M13 19l6-6" />
                      <path d="M16 16l4 4" />
                      <path d="M19 21l2-2" />
                    </svg>
                  )}
                </div>
                {/* Dynamic Energy Slash Wave for melee attacks */}
                {isMelee && (
                  <div className="absolute -inset-6 border-t-4 border-amber-300 rounded-full animate-spin blur-[0.5px] shadow-[0_0_16px_rgba(252,211,77,1)] pointer-events-none" />
                )}
              </div>
            </motion.div>
          </div>
        );
      }
      
      return (
        <div 
          key={eff.id} 
          className="absolute pointer-events-none flex items-center justify-center z-[150]"
          style={{ 
             left: 8 + eff.x * 56, top: 8 + eff.y * 56, 
             width: 56, height: 56, 
             transformStyle: is3D ? 'preserve-3d' : 'flat',
             transform: is3D ? `translateZ(${targetZ + 36}px)` : 'none'
          }}
        >
          {/* 3D Magic Effect: Runic Aura Circle on Floor + Rising Sparkles in Front */}
          {eff.type === 'magic' && (
            <>
              {is3D && (
                <div 
                  className="absolute w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/90 animate-spin shadow-[0_0_20px_rgba(34,211,238,0.9)]"
                  style={{ transform: 'translateZ(2px)' }}
                />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: [0, 1, 1, 0], scale: 1.5, y: -30 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                style={{ transform: billboardTransform }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 relative flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(59,130,246,1)]">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-cyan-400" fill="currentColor">
                    <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
                  </svg>
                </div>
              </motion.div>
            </>
          )}

          {/* 3D Heal Effect: Green Aura Ring on Floor + Rising Healing Light in Front */}
          {eff.type === 'heal' && (
            <>
              {is3D && (
                <div 
                  className="absolute w-16 h-16 rounded-full border-2 border-green-400/90 animate-ping shadow-[0_0_20px_rgba(74,222,128,0.9)]"
                  style={{ transform: 'translateZ(2px)' }}
                />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 15 }}
                animate={{ opacity: [0, 1, 1, 0], scale: 1.4, y: -35 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ transform: billboardTransform }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 relative flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(74,222,128,1)]">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-400" fill="currentColor">
                    <rect x="9" y="2" width="6" height="20" rx="1" />
                    <rect x="2" y="9" width="20" height="6" rx="1" />
                  </svg>
                </div>
                {eff.value && (
                  <span className="text-green-300 font-black text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,1)] tracking-wider -mt-2">
                    {eff.value}
                  </span>
                )}
              </motion.div>
            </>
          )}
        </div>
      );
    });
  };

  const renderGrid = () => {
    const nextUpcomingUnit = units.find(u => u.id === nextUpcomingUnitId);
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const elev = elevations[y]?.[x] || 0;
        const unit = units.find(u => u.x === x && u.y === y && u.stats.hp > 0);
        const isActiveUnitTile = activeUnit && activeUnit.x === x && activeUnit.y === y;
        const isNextUpcomingTile = nextUpcomingUnit && nextUpcomingUnit.x === x && nextUpcomingUnit.y === y;
        
        let cellClass = `relative w-[56px] h-[56px] min-w-[56px] min-h-[56px] flex-shrink-0 border ${theme.tileBorder} ${theme.tileBg} flex items-center justify-center text-3xl cursor-pointer transition-all duration-150`;
        
        // Next upcoming unit tile highlight with golden radiant glow
        if (isNextUpcomingTile) {
          cellClass += " ring-4 ring-yellow-300 bg-yellow-400/30 shadow-[inset_0_0_18px_rgba(250,204,21,0.8)] animate-pulse";
        }
        // Active Unit Tile Outline
        else if (isActiveUnitTile) {
          cellClass += " ring-2 ring-yellow-400/80 shadow-[inset_0_0_8px_rgba(250,204,21,0.4)]";
        }

        // Highlight logic
        if (selectedAction === 'MOVE' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           if (dist > 0 && dist <= activeUnit.stats.mov && !unit) {
               cellClass += " bg-blue-500/40 hover:bg-blue-400/60 shadow-[inset_0_0_12px_rgba(59,130,246,0.8)] ring-2 ring-blue-300";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if (selectedAction === 'MAGIC' && selectedSubItem === 'Cura' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           if (dist <= 3 && unit && unit.isPlayer) {
               cellClass += " bg-emerald-500/40 hover:bg-emerald-400/60 shadow-[inset_0_0_12px_rgba(16,185,129,0.8)] ring-2 ring-emerald-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if ((selectedAction === 'ATTACK' || selectedAction === 'MAGIC') && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           const range = selectedAction === 'ATTACK' ? activeUnit.weapon.range : 3;
           if (dist > 0 && dist <= range && unit && !unit.isPlayer) {
               cellClass += " bg-red-500/40 hover:bg-red-400/60 shadow-[inset_0_0_12px_rgba(239,68,68,0.8)] ring-2 ring-red-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if (selectedAction === 'SKILL' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           const skillRange = activeUnit.heroClass === 'Arqueiro' ? 3 : (activeUnit.weapon?.range || 1);
           if (dist > 0 && dist <= skillRange && unit && !unit.isPlayer) {
               cellClass += " bg-amber-500/40 hover:bg-amber-400/60 shadow-[inset_0_0_12px_rgba(245,158,11,0.8)] ring-2 ring-amber-400 animate-pulse";
           } else {
               cellClass += " hover:brightness-125";
           }
        } else {
           cellClass += " hover:brightness-125";
        }

        cells.push(
          <div 
            key={`${x}-${y}`} 
            className={cellClass}
            onClick={() => handleCellClick(x, y)}
            style={{ 
              transformStyle: is3D ? 'preserve-3d' : 'flat', 
              transform: is3D ? `translateZ(${elev * 16}px)` : 'none' 
            }}
          >
            {/* In 3D mode, render elevation steps */}
            {is3D && elev > 0 && (
              <>
                 <div className="absolute top-full left-0 w-full bg-slate-800 border-x border-b border-slate-900 origin-top" style={{ height: `${elev * 16}px`, transform: 'rotateX(-90deg)' }} />
                 <div className="absolute top-0 right-full h-full bg-slate-700 border-y border-l border-slate-900 origin-right" style={{ width: `${elev * 16}px`, transform: 'rotateY(-90deg)' }} />
              </>
            )}

            {/* In 2D mode, indicate elevation subtly if elevated */}
            {!is3D && elev > 0 && (
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-slate-300/60 select-none pointer-events-none">
                +{elev}
              </span>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col font-sans text-slate-200 transition-colors duration-1000 overflow-hidden">
      {/* 3D Battlefield Area with Hardware 3D Perspective */}
      <div 
        className="flex-1 relative flex justify-center items-center bg-black/90 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={handleWheel}
        style={{
          perspective: is3D ? '1100px' : 'none',
          perspectiveOrigin: 'center center'
        }}
      >
        {/* Turn Order Queue Ribbon (FF6 Action Menu Style) */}
        <div 
          className="absolute top-3 left-3 z-50 flex items-center gap-1.5 p-1 md:p-1.5 rounded-lg border-2 md:border-[3px] border-slate-200 shadow-[inset_0_0_0_1px_#000,0_3px_5px_rgba(0,0,0,0.5)] max-w-[80vw] overflow-x-auto custom-scrollbar font-mono uppercase font-black select-none pointer-events-auto"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-yellow-400 mr-1 tracking-wider whitespace-nowrap">
            <span style={{ fontSize: '19px', lineHeight: '7px' }}>►</span>
            <span style={{ fontSize: '23px', lineHeight: '29.6667px' }}>ORDEM:</span>
          </div>
          {turnQueue.slice(0, 7).map((id, index) => {
            const u = units.find(unit => unit.id === id);
            if (!u || u.stats.hp <= 0) return null;
            const isCurrent = u.id === activeUnitId;
            const isNext = u.id === nextUpcomingUnitId;
            return (
              <div 
                key={`queue-${u.id}-${index}`}
                className={`relative flex items-center justify-center rounded transition-all duration-300 flex-shrink-0 shadow-[inset_0_0_0_1px_#000] overflow-visible ${
                  isNext 
                    ? 'w-7 h-7 md:w-8 md:h-8 border-[2px] border-yellow-300 bg-blue-700/60 ring-1 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-105 z-10'
                    : isCurrent
                      ? 'w-6 h-6 md:w-7 md:h-7 border-[1.5px] border-white bg-blue-500/50 shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                      : 'w-5 h-5 md:w-6 md:h-6 border border-blue-900 bg-black/60 opacity-60 hover:opacity-100'
                }`}
                title={`${u.name || u.heroClass || 'Unidade'} (HP: ${u.stats.hp}/${u.stats.maxHp})`}
              >
                <UnitAvatar 
                  unit={u} 
                  className="w-full h-full rounded overflow-hidden pointer-events-none" 
                  hideBadge={true}
                />
                {isNext && (
                  <span className="absolute -bottom-2 text-[7px] font-black bg-yellow-400 text-black px-0.5 rounded-[2px] border border-black shadow whitespace-nowrap z-20 leading-none py-0.5">
                    PROX
                  </span>
                )}
                {isCurrent && !isNext && (
                  <span className="absolute -bottom-2 text-[7px] font-black bg-white text-black px-0.5 rounded-[2px] border border-black shadow whitespace-nowrap z-20 leading-none py-0.5">
                    AGORA
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Logs */}
        {actionText && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
             <div className="rounded-lg border-[4px] border-slate-200 text-white text-2xl md:text-3xl p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in-down font-black uppercase tracking-widest" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}>
                {actionText.text}
             </div>
          </div>
        )}

        {/* Camera and View Controls (FF6 Action Menu Style) */}
        <div 
          className="absolute top-3 right-3 z-50 flex items-center gap-1.5 p-1.5 md:p-2 rounded-lg border-[3px] md:border-[4px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black pointer-events-auto"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          {/* Mode Switch: 2D Reto vs 3D Isometrico */}
          <button 
            onClick={handleToggle3D} 
            className={`px-2 py-1 rounded font-mono font-black text-xs transition-all border-[2px] flex items-center gap-1 shadow-[inset_0_0_0_1px_#000] hover:brightness-110 active:scale-95 ${
              is3D 
                ? 'bg-amber-600 text-white border-amber-300' 
                : 'bg-blue-600 text-white border-blue-300'
            }`}
            title={is3D ? "Mudar para 2D Tatico (Deitado e Reto)" : "Mudar para 3D Isometrico"}
          >
            <span style={{ fontSize: '18px', lineHeight: '20px' }}>{is3D ? '3D ISO' : '2D RETO'}</span>
          </button>

          {/* Camera Mode Toggle / Focus Snap */}
          <button
            onClick={() => {
              if (isFreeCamera) {
                snapToActiveUnit();
              } else {
                setIsFreeCamera(true);
                setFreeCamOffset(currentAutoOffset);
              }
            }}
            className={`px-2 py-1 rounded font-mono font-black text-xs transition-all border-[2px] flex items-center gap-1 shadow-[inset_0_0_0_1px_#000] hover:brightness-110 active:scale-95 ${
              isFreeCamera
                ? 'bg-amber-500 text-black border-amber-200 animate-pulse'
                : 'bg-emerald-700 text-white border-emerald-300'
            }`}
            title={isFreeCamera ? "Camera Livre ativada. Clique para travar e seguir o turno" : "Camera seguindo acoes automaticamente. Clique para modo livre"}
          >
            <span style={{ fontSize: '16px', lineHeight: '20px' }}>
              {isFreeCamera ? 'FOCO' : 'AUTO'}
            </span>
          </button>
        </div>

        {/* 3D Camera Controls Quick Helper Pill */}
        {is3D && (
          <div className="absolute bottom-3 left-3 z-40 bg-black/85 border border-blue-800 text-slate-200 text-[11px] px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-none flex items-center gap-2 font-mono">
            <span className="text-yellow-400">►</span>
            <span>
              Botao Esquerdo: <b>Girar 3D</b> • Botao Direito: <b>Mover Camera</b> • Scroll: <b>Zoom</b>
            </span>
          </div>
        )}

        {/* Free Camera Notification Badge */}
        {isFreeCamera && (
          <div 
            onClick={() => snapToActiveUnit()}
            className="absolute bottom-3 right-3 z-40 bg-black/80 hover:bg-blue-950 border border-amber-400/80 text-amber-200 text-xs px-3 py-1.5 rounded-full shadow-lg cursor-pointer flex items-center gap-2 backdrop-blur-sm pointer-events-auto transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Camera Livre • Clique aqui para focar no turno</span>
          </div>
        )}
        
        {/* Dynamic Camera Rig (True 3D Spatial Geometry - NO overflow-hidden flattening) */}
        <div 
          className="relative flex justify-center items-center select-none pointer-events-none"
          style={{ 
            transformStyle: is3D ? 'preserve-3d' : 'flat', 
            transform: is3D 
              ? `translate3d(${cameraX}px, ${cameraY}px, ${cameraZ}px) scale(${cameraScale})` 
              : `translate(${cameraX}px, ${cameraY}px) scale(${effectiveZoom})`, 
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
        
        <div 
          className={`relative p-2 rounded-xl shadow-[0_35px_80px_rgba(0,0,0,0.9)] inline-grid grid-cols-8 gap-0 border-4 border-slate-700/90 ${theme.wrapperBg} pointer-events-auto transition-transform duration-500 ease-out`}
          style={{ 
             transformStyle: is3D ? 'preserve-3d' : 'flat', 
             minWidth: '464px', minHeight: '464px',
             transform: is3D ? `rotateX(${rotX}deg) rotateZ(${rotZ}deg)` : `rotateZ(${rotZ}deg)`,
             transformOrigin: 'center center'
          }}
        >
          {/* Base Platform for Environment in 3D */}
          {is3D && (
            <div 
               className="absolute pointer-events-none rounded-2xl border-4 border-[#3a4f33]/80 bg-[#1e281b] shadow-[0_30px_60px_rgba(0,0,0,0.85)]"
               style={{ 
                 left: -20, right: -20, top: -20, bottom: -20, 
                 transform: 'translateZ(-14px)',
                 transformStyle: 'preserve-3d'
               }}
            >
              <div className="absolute top-full left-0 w-full h-4 bg-[#141b12] origin-top border-x border-b border-black/80" style={{ transform: 'rotateX(-90deg)' }} />
              <div className="absolute top-0 right-full h-full w-4 bg-[#0d120c] origin-right border-y border-l border-black/80" style={{ transform: 'rotateY(-90deg)' }} />
            </div>
          )}
        
          {renderScenery()}
          {renderGrid()}
          {renderUnits()}
          {renderEffects()}
        </div>
      </div>
      </div>

      {victoryData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 font-mono text-xl">
          <div className="rounded-lg border-[4px] border-slate-200 p-8 flex flex-col items-center gap-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] min-w-[300px]" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}>
            <h2 className="text-4xl text-white font-black mb-4 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">Vitoria</h2>
            <div className="flex justify-between w-full border-b border-slate-700 pb-2">
              <span className="text-slate-300">Experiencia:</span>
              <span className="text-white font-bold">+{victoryData.exp} EXP</span>
            </div>
            <div className="flex justify-between w-full border-b border-slate-700 pb-2">
              <span className="text-slate-300">Ouro:</span>
              <span className="text-white font-bold">+{victoryData.gold} G</span>
            </div>
            {victoryData.drops.length > 0 && (
              <div className="flex flex-col w-full text-left mt-2">
                <span className="text-slate-300 mb-2">Itens Encontrados:</span>
                {victoryData.drops.map((d, i) => <span key={i} className="text-green-400">► {d}</span>)}
              </div>
            )}
            <button 
              className="mt-6 px-8 py-3 bg-white text-black hover:bg-slate-300 font-black uppercase rounded shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
              onClick={() => {
                soundFX.playSelect();
                onVictory(victoryData.exp, victoryData.gold, victoryData.drops);
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {/* FF6 Style HUD */}
      <div className="relative z-20 h-56 bg-black p-1 md:p-2 flex gap-1 md:gap-2 shrink-0 border-t-2 border-slate-700 font-mono text-xl uppercase font-black" style={{ background: '#000' }}>
          {/* Left Panel: Action Menu */}
          <div 
            className="w-1/3 md:w-1/4 rounded-lg border-[4px] border-slate-200 p-2 md:p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar select-none"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             {isTurnTransitioning ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-2 font-mono uppercase font-black">
                    <div className="flex items-center gap-1 text-yellow-400 text-base md:text-2xl animate-pulse tracking-wider">
                       <span>►</span>
                       <span>PREPARANDO TURNO</span>
                       <span>◄</span>
                    </div>
                    {nextUpcomingUnit ? (
                       <div className="text-white text-sm md:text-lg mt-1 tracking-wide flex items-center justify-center gap-2">
                          <span className="truncate max-w-[140px] md:max-w-[200px]">{nextUpcomingUnit.name || nextUpcomingUnit.heroClass || (nextUpcomingUnit.isPlayer ? 'Heroi' : 'Inimigo')}</span>
                       </div>
                    ) : (
                       <span className="text-xs md:text-sm text-slate-300 mt-1">Proximo Combatente...</span>
                    )}
                    <span className="text-[10px] md:text-xs text-yellow-300/80 mt-1 tracking-widest">
                       AGUARDE O TURNO
                    </span>
                    <div className="w-full h-2.5 bg-black border border-slate-300 rounded-sm mt-2 overflow-hidden shadow-[inset_0_0_0_1px_#000]">
                       <div className="h-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 animate-pulse w-full" />
                    </div>
                </div>
             ) : activeUnit?.isPlayer ? (
                <div className="flex flex-col gap-1 h-full text-xl md:text-3xl justify-between">
                    <button 
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${selectedAction === 'MOVE' ? 'text-yellow-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setSelectedAction('MOVE'); 
                        setActionMenu('MAIN'); 
                        showActionText('Selecione uma celula azul para mover.');
                      }} 
                      disabled={activeUnit.hasMoved || isActionBusy}
                    >
                        <span className="w-6 text-yellow-400">{selectedAction === 'MOVE' ? '►' : ''}</span> Mover
                    </button>
                    
                    <button 
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${selectedAction === 'ATTACK' ? 'text-yellow-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setSelectedAction('ATTACK'); 
                        setActionMenu('MAIN'); 
                        showActionText('Selecione um inimigo vermelho para atacar.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-yellow-400">{selectedAction === 'ATTACK' ? '►' : ''}</span> Atacar
                    </button>

                    <button 
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'SKILLS' ? 'text-yellow-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setActionMenu('SKILLS'); 
                        setSelectedAction(null);
                        showActionText('Escolha uma tecnica no menu ao lado.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-yellow-400">{actionMenu === 'SKILLS' ? '►' : ''}</span> {activeUnit.heroClass === 'Cavalheiro' || activeUnit.heroClass === 'Lutador' || activeUnit.heroClass === 'Arqueiro' ? 'Tecnica' : 'Especial'}
                    </button>

                    <button 
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'MAGIC' ? 'text-yellow-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => { 
                        soundFX.playSelect(); 
                        setActionMenu('MAGIC'); 
                        setSelectedAction(null);
                        showActionText('Escolha uma magia no menu ao lado.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-yellow-400">{actionMenu === 'MAGIC' ? '►' : ''}</span> Magia
                    </button>

                    <button 
                      className={`flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 transition-colors ${actionMenu === 'ITEM' ? 'text-yellow-300 bg-white/10' : 'text-white'}`} 
                      onClick={() => {
                        soundFX.playSelect();
                        setActionMenu('ITEM');
                        setSelectedAction(null);
                        showActionText('Escolha um item da bolsa para usar.');
                      }} 
                      disabled={activeUnit.hasActed || isActionBusy}
                    >
                        <span className="w-6 text-yellow-400">{actionMenu === 'ITEM' ? '►' : ''}</span> Item
                    </button>

                    <button 
                      className="mt-auto flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-40 text-slate-300 hover:text-white" 
                      onClick={() => { soundFX.playSelect(); nextTurn(); }} 
                      disabled={isTurnTransitioning || isActionBusy}
                    >
                        <span className="w-6"></span> Fim Turno
                    </button>
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-red-400 animate-pulse text-center">TURNO<br/>INIMIGO</span>
                </div>
             )}
          </div>

          {/* Right Panel: Party Status OR Action Submenu (Tecnica, Magia, Item) appearing in front */}
          <div 
            className="flex-1 rounded-lg border-[4px] border-slate-200 p-2 md:p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             {/* Submenu: Tecnicas */}
             {activeUnit?.isPlayer && actionMenu === 'SKILLS' ? (
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                    <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-white text-base md:text-xl font-black tracking-wider">TECNICAS</span>
                            <span className="text-xs md:text-sm text-amber-300 font-bold">SP {activeUnit.stats.sp || 0}/{activeUnit.stats.maxSp || 100}</span>
                        </div>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-yellow-400 hover:text-white font-bold text-xs md:text-sm tracking-wider transition-colors"
                        >
                          ◄ VOLTAR
                        </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {(CLASS_SKILLS_DATA[activeUnit.heroClass || 'Cavalheiro'] || CLASS_SKILLS_DATA['Cavalheiro']).map((skill) => {
                            const isAffordable = (activeUnit.stats.sp || 0) >= skill.cost;
                            const isSelected = selectedAction === 'SKILL' && selectedSubItem === skill.id;
                            return (
                                <button
                                  key={skill.id}
                                  onClick={() => {
                                      if (!isAffordable || isActionBusy) return;
                                      soundFX.playSelect();
                                      setSelectedSubItem(skill.id);
                                      setSelectedAction('SKILL');
                                      showActionText(`${skill.name}: Selecione o alvo no grid`);
                                  }}
                                  disabled={!isAffordable || isActionBusy}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                      isSelected
                                        ? 'text-yellow-300 bg-white/20'
                                        : isAffordable
                                          ? 'text-white hover:bg-white/15'
                                          : 'text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="w-4 text-yellow-400 shrink-0">{isSelected ? '►' : ' '}</span>
                                        <span className="truncate font-bold">{skill.name}</span>
                                    </div>
                                    <span className={`text-xs md:text-sm font-mono shrink-0 ml-2 ${isAffordable ? 'text-amber-300' : 'text-red-400'}`}>
                                        {skill.cost} SP
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 truncate">
                        {(CLASS_SKILLS_DATA[activeUnit.heroClass || 'Cavalheiro'] || CLASS_SKILLS_DATA['Cavalheiro']).find(s => s.id === selectedSubItem)?.desc || 'Selecione uma tecnica'}
                    </div>
                </div>
             ) : activeUnit?.isPlayer && actionMenu === 'MAGIC' ? (
                /* Submenu: Magias */
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                    <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span 
                              className="text-white text-base md:text-xl font-black tracking-wider"
                              style={{ fontSize: '31px', lineHeight: '20px' }}
                            >
                              MAGIAS
                            </span>
                            <span 
                              className="text-xs md:text-sm text-cyan-300 font-bold"
                              style={{ fontSize: '32px', lineHeight: '17px' }}
                            >
                              MP {activeUnit.stats.mp}/{activeUnit.stats.maxMp}
                            </span>
                        </div>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-yellow-400 hover:text-white font-bold text-xs md:text-sm tracking-wider transition-colors"
                        >
                          ◄ VOLTAR
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {COMBAT_MAGICS_DATA.map((magic, idx) => {
                            const isAffordable = activeUnit.stats.mp >= magic.cost;
                            const isSelected = selectedAction === 'MAGIC' && selectedSubItem === magic.name;
                            const isHealSpell = magic.name === 'Cura';
                            return (
                                <button
                                  key={magic.name}
                                  onClick={() => {
                                      if (!isAffordable || isActionBusy) return;
                                      soundFX.playSelect();
                                      setSelectedSubItem(magic.name);
                                      setSelectedAction('MAGIC');
                                      if (isHealSpell) {
                                        showActionText(`${magic.name}: Selecione um aliado no grid`);
                                      } else {
                                        showActionText(`${magic.name}: Selecione um inimigo no grid`);
                                      }
                                  }}
                                  disabled={!isAffordable || isActionBusy}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                      isSelected
                                        ? 'text-yellow-300 bg-white/20'
                                        : isAffordable
                                          ? 'text-white hover:bg-white/15'
                                          : 'text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="w-4 text-yellow-400 shrink-0">{isSelected ? '►' : ' '}</span>
                                        <span 
                                          className="truncate font-bold"
                                          style={{ fontSize: '35px', lineHeight: '16px' }}
                                        >
                                          {magic.name}
                                        </span>
                                    </div>
                                    <span 
                                      className={`text-xs md:text-sm font-mono shrink-0 ml-2 ${isAffordable ? 'text-cyan-300' : 'text-red-400'}`}
                                      style={{ fontSize: '32px', lineHeight: idx === 0 ? '14px' : '17px' }}
                                    >
                                        {magic.cost} MP
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 truncate">
                        {COMBAT_MAGICS_DATA.find(m => m.name === selectedSubItem)?.desc || 'Selecione uma magia'}
                    </div>
                </div>
             ) : activeUnit?.isPlayer && actionMenu === 'ITEM' ? (
                /* Submenu: Itens */
                <div className="flex flex-col h-full overflow-hidden animate-fade-in font-mono">
                    <div className="flex items-center justify-between border-b-2 border-slate-600 pb-1 mb-2">
                        <span className="text-white text-base md:text-xl font-black tracking-wider">ITENS</span>
                        <button 
                          onClick={() => { soundFX.playCancel(); setActionMenu('MAIN'); }}
                          className="px-2 py-0.5 rounded text-yellow-400 hover:text-white font-bold text-xs md:text-sm tracking-wider transition-colors"
                        >
                          ◄ VOLTAR
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 overflow-y-auto custom-scrollbar pr-1 text-base md:text-xl">
                        {COMBAT_ITEMS_DATA.map((item) => {
                            const count = combatInventory[item.id] || 0;
                            const hasItem = count > 0;
                            return (
                                <button
                                  key={item.id}
                                  onClick={() => handleUseItem(item)}
                                  disabled={!hasItem || isActionBusy || activeUnit.hasActed}
                                  className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors uppercase ${
                                      hasItem && !activeUnit.hasActed
                                        ? 'text-white hover:bg-white/15'
                                        : 'text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="w-4 text-yellow-400 shrink-0">{hasItem ? '►' : ' '}</span>
                                        <span className="truncate font-bold">{item.name}</span>
                                    </div>
                                    <span className={`text-xs md:text-sm font-mono shrink-0 ml-2 ${hasItem ? 'text-yellow-300' : 'text-slate-600'}`}>
                                        x{count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-700/80 text-xs md:text-sm text-slate-300 truncate">
                        Selecione um item para utilizar imediatamente
                    </div>
                </div>
             ) : (
                /* Default: Party Status HP/MP/SP Bars */
                <div className="flex flex-col gap-1 md:gap-2 h-full justify-around text-xl md:text-3xl">
                   {units.filter(u => u.isPlayer).map((player) => (
                       <div key={player.id} className={`flex items-center tracking-widest ${activeUnit?.id === player.id ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-slate-100'}`}>
                           <div className="w-40 md:w-64 truncate flex items-center gap-2">
                              {player.name || player.heroClass || 'Heroi'}
                           </div>
                           <div className="w-32 md:w-40 text-right pr-2 md:pr-4">HP {player.stats.hp.toString().padStart(3, '0')}</div>
                           <div className="w-32 md:w-40 text-right pr-2 md:pr-4">MP {player.stats.mp.toString().padStart(3, '0')}</div>
                           <div className="flex-1 flex items-center gap-2">
                              <span className="text-lg md:text-2xl">SP</span>
                              <div className="flex-1 h-3 md:h-4 bg-slate-900 border border-slate-500 rounded overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all" style={{ width: `${(player.stats.sp / player.stats.maxSp) * 100}%` }} />
                              </div>
                           </div>
                       </div>
                   ))}
                </div>
             )}
          </div>
      </div>
    </div>
  );
};
