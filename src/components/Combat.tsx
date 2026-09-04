import React, { useState, useEffect, useRef } from 'react';
import { CombatUnit, Weapon, MapId } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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

export const Combat: React.FC<CombatProps> = ({ mapId, playerUnits, enemyUnits, onVictory, onDefeat }) => {
  const [units, setUnits] = useState<CombatUnit[]>([]);
  const [elevations, setElevations] = useState<number[][]>([]);
  const [turnQueue, setTurnQueue] = useState<string[]>([]);
  const [sceneryItems, setSceneryItems] = useState<{x: number, y: number, emoji: string}[]>([]);
  const [actionText, setActionText] = useState<{text: string, id: number} | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [rotZ, setRotZ] = useState(45);
  const [zoom, setZoom] = useState(1);
  const rotX = 60;
  const [envScenery, setEnvScenery] = useState<{x:number, y:number, emoji:string}[]>([]);
    const [selectedAction, setSelectedAction] = useState<'MOVE' | 'ATTACK' | 'MAGIC' | 'ITEM' | 'SKILL' | null>(null);
  const [actionMenu, setActionMenu] = useState<'MAIN' | 'SKILLS' | 'MAGIC'>('MAIN');
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);

  const [visualEffects, setVisualEffects] = useState<{id: number, unitId: string, type: 'attack' | 'hit', value?: string, x: number, y: number, startX?: number, startY?: number, emoji?: string}[]>([]);
  const [victoryData, setVictoryData] = useState<{ exp: number, gold: number, drops: string[] } | null>(null);

  // Camera State
  

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
    if (isAmbush) showActionText('⚠️ EMBOSCADA!');
    else showActionText('Combate Iniciado!');

    // Generate Scenery
    const sItems = [];
    const emoji = mapId === 'OVERWORLD' ? '🌲' : mapId === 'DUNGEON_FOGO' ? '🪨' : mapId === 'DUNGEON_AGUA' ? '🐚' : mapId === 'DUNGEON_TERRA' ? '🍄' : '☁️';
    for(let i = -2; i <= GRID_SIZE + 1; i++) {
        for(let j = -2; j <= GRID_SIZE + 1; j++) {
            if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) continue;
            if (Math.random() > 0.8) {
                sItems.push({ x: i * 56, y: j * 56, emoji });
            }
        }
    }
    setSceneryItems(sItems);
    
    // Generate environment scenery (outside grid)
    const envItems = [];
    const envEmojis = mapId === 'DUNGEON_TERRA' ? ['🌲', '🌳', '🍄', '🪨'] : mapId === 'DUNGEON_FOGO' ? ['🌋', '🪨', '🔥'] : ['🌲', '🌳', '⛰️'];
    for(let i = 0; i < 40; i++) {
        let ex = Math.floor(Math.random() * 20) - 6;
        let ey = Math.floor(Math.random() * 20) - 6;
        if (ex >= -1 && ex <= GRID_SIZE && ey >= -1 && ey <= GRID_SIZE) continue; // Keep area around board clear
        envItems.push({ x: ex, y: ey, emoji: envEmojis[Math.floor(Math.random() * envEmojis.length)] });
    }
    setEnvScenery(envItems);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showActionText = (msg: string) => {
    const id = Date.now();
    setActionText({ text: msg, id });
    setTimeout(() => setActionText(prev => prev?.id === id ? null : prev), 3000);
  };

  const activeUnit = units.find(u => u.id === activeUnitId);

  const nextTurn = () => {
    setSelectedAction(null);
    setActionMenu('MAIN');
    setSelectedSubItem(null);
    
    setUnits(prev => {
      const newUnits = prev.map(u => {
        if (u.id === activeUnitId) {
          return { ...u, hasMoved: false, hasActed: false }; // reset state
        }
        return u;
      });
      return newUnits;
    });

    setTurnQueue(prev => {
      const newQueue = [...prev.slice(1), prev[0]];
      
      // Skip dead units
      let nextId = newQueue[0];
      let iterations = 0;
      while (iterations < newQueue.length) {
        const u = units.find(unit => unit.id === nextId);
        if (u && u.stats.hp > 0) break;
        newQueue.push(newQueue.shift()!);
        nextId = newQueue[0];
        iterations++;
      }
      
      setActiveUnitId(nextId);
      setSelectedAction(null);
      return newQueue;
    });
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
  };

  const handleCellClick = (x: number, y: number) => {
    if (!activeUnit || !activeUnit.isPlayer) return;

    if (selectedAction === 'MOVE' && !activeUnit.hasMoved) {
      const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
      if (dist > 0 && dist <= activeUnit.stats.mov) {
        if (units.some(u => u.x === x && u.y === y && u.stats.hp > 0)) {
          showActionText('Celula ocupada!');
          return;
        }
        setUnits(prev => prev.map(u => u.id === activeUnit.id ? { ...u, x, y, hasMoved: true } : u));
        showActionText('Moveu-se.');
        setSelectedAction(null);
      } else {
        showActionText('Invalido ou fora de alcance.');
      }
    } 
    else if (selectedAction === 'ATTACK' && !activeUnit.hasActed) {
      const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
      if (target) {
        const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
        if (dist <= activeUnit.weapon.range) {
          const damage = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - target.stats.def);
          
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
             setUnits(nextUnits);
          showActionText(`Ataque causou ${damage} dano!`);
          const effId = Date.now();
          setVisualEffects(prev => [...prev, {id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y}, {id: effId+1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, emoji: activeUnit.weapon?.type === 'ranged' ? '🏹' : activeUnit.weapon?.type === 'magic' ? '✨' : '🗡️'}]);
          setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId+1)), 1000);
          setSelectedAction(null);
          
          if (!checkWinCondition(nextUnits)) {
             setTimeout(nextTurn, 1000);
          }
        }
      }
    }
    else if (selectedAction === 'MAGIC' && !activeUnit.hasActed) {
      if (activeUnit.stats.mp >= 10) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
            if (dist <= 3) {
               const damage = Math.max(1, (activeUnit.stats.int * 2) - target.stats.def);
               
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
               
               setUnits(nextUnits);
               showActionText(`${selectedSubItem} causou ${damage} dano!`);
               const effId = Date.now();
               setVisualEffects(prev => [...prev, {id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y}, {id: effId+1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, emoji: selectedAction === 'MAGIC' ? '✨' : '🔥'}]);
               setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId+1)), 1000);
               setSelectedAction(null);
               
               if (!checkWinCondition(nextUnits)) {
                  setTimeout(nextTurn, 1000);
               }
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
            
            setUnits(nextUnits);
            showActionText(`${logMsg} causou ${damage} critico!`);
            const effId = Date.now();
            setVisualEffects(prev => [...prev, {id: effId, unitId: target.id, type: 'hit', value: `-${damage}`, x: target.x, y: target.y}, {id: effId+1, unitId: target.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, emoji: selectedAction === 'MAGIC' ? '✨' : '🔥'}]);
            setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId+1)), 1000);
            setSelectedAction(null);
            
            if (!checkWinCondition(nextUnits)) {
               setTimeout(nextTurn, 1000);
            }
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

  // AI Turn Simple implementation
  useEffect(() => {
    if (activeUnit && !activeUnit.isPlayer && activeUnit.stats.hp > 0) {
       const aiTurn = async () => {
          await new Promise(r => setTimeout(r, 1000)); // AI thinking delay
          
          const alivePlayers = units.filter(u => u.isPlayer && u.stats.hp > 0);
          if (alivePlayers.length === 0) {
             nextTurn();
             return;
          }

          const aliveEnemies = units.filter(u => !u.isPlayer && u.stats.hp > 0);
          if (aliveEnemies.length < 3 && activeUnit.stats.hp <= (activeUnit.stats.maxHp || 50) * 0.4 && Math.random() < 0.35) {
             showActionText(`${activeUnit.emoji} pediu reforcos (SOS)!`);
             const newId = 'sos_' + Date.now();
             const newEnemy = {
                ...activeUnit,
                id: newId,
                stats: { ...activeUnit.stats, hp: activeUnit.stats.maxHp },
                x: 0, y: 0,
                hasActed: true, hasMoved: true
             };
             // find free pos
             const occupied = new Set(units.map(u => `${u.x},${u.y}`));
             for (let y=0; y<GRID_SIZE; y++) {
                for(let x=GRID_SIZE-1; x>=0; x--) {
                   if (!occupied.has(`${x},${y}`)) {
                      newEnemy.x = x; newEnemy.y = y;
                      break;
                   }
                }
                if (newEnemy.x !== 0) break;
             }
             setUnits(prev => [...prev, newEnemy]);
             // Add a visual effect on spawn
             setVisualEffects(prev => [...prev, {id: Date.now(), unitId: newId, type: 'hit', value: 'SOS', x: newEnemy.x, y: newEnemy.y}]);
             setTimeout(nextTurn, 1500);
             return;
          }

          // Target closest player
          let player = alivePlayers[0];
          let minDist = getDistance(activeUnit.x, activeUnit.y, player.x, player.y);
          for (let p of alivePlayers) {
             const d = getDistance(activeUnit.x, activeUnit.y, p.x, p.y);
             if (d < minDist) {
                minDist = d;
                player = p;
             }
          }

          const dist = minDist;
          
          let acted = false;
          // Try attack first
          if (dist <= activeUnit.weapon.range) {
             const damage = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - player.stats.def);
             
             const nextUnits = units.map(u => {
                if (u.id === player.id) return { ...u, stats: { ...u.stats, hp: Math.max(0, u.stats.hp - damage), sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                return u;
             });setUnits(nextUnits);
             showActionText(`${activeUnit.emoji} atacou causando ${damage} dano!`);
             const effId = Date.now();
             setVisualEffects(prev => [...prev, {id: effId, unitId: player.id, type: 'hit', value: `-${damage}`, x: player.x, y: player.y}, {id: effId+1, unitId: player.id, type: 'attack', startX: activeUnit.x, startY: activeUnit.y, emoji: activeUnit.weapon?.type === 'ranged' ? '🏹' : activeUnit.weapon?.type === 'magic' ? '✨' : '🗡️'}]);
             setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== effId && v.id !== effId+1)), 1000);
             acted = true;
             
             if (checkWinCondition(nextUnits)) {
                return; // End early if game over
             }
          } else {
             // Move towards player
             // simplified AI: just move 1 step in x or y
             const dx = player.x > activeUnit.x ? 1 : (player.x < activeUnit.x ? -1 : 0);
             const dy = player.y > activeUnit.y ? 1 : (player.y < activeUnit.y ? -1 : 0);
             
             let newX = activeUnit.x;
             let newY = activeUnit.y;

             if (dx !== 0 && !units.some(u => u.x === activeUnit.x + dx && u.y === activeUnit.y && u.stats.hp > 0)) {
                newX += dx;
             } else if (dy !== 0 && !units.some(u => u.x === activeUnit.x && u.y === activeUnit.y + dy && u.stats.hp > 0)) {
                newY += dy;
             }

             if (newX !== activeUnit.x || newY !== activeUnit.y) {
                 setUnits(prev => prev.map(u => u.id === activeUnit.id ? { ...u, x: newX, y: newY } : u));
                 showActionText(`${activeUnit.emoji} moveu-se.`);
             }
          }

          await new Promise(r => setTimeout(r, 1000));
          nextTurn();
       };
       aiTurn();
    }
  }, [activeUnitId]);


  // Mouse Drag Camera Handlers
  

    
  const renderUnits = () => {
    return units.filter(u => u.stats.hp > 0).map(unit => {
      const elev = elevations[unit.y]?.[unit.x] || 0;
      const effects = visualEffects.filter(v => v.unitId === unit.id);
      const isHit = effects.some(v => v.type === 'hit');
      const isBuff = effects.some(v => v.type === 'heal' || v.type === 'magic');
      
      return (
        <motion.div 
          key={unit.id}
          className={`absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center ${isHit ? 'animate-pulse' : ''}`}
          initial={false}
          animate={{ 
            left: 8 + unit.x * 56, 
            top: 8 + unit.y * 56,
            z: elev * 16
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          style={{ transformStyle: 'preserve-3d', zIndex: 50 }}
        >
            <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
               <div 
                  className="relative flex flex-col items-center justify-center transition-transform duration-500" 
                  style={{ transformStyle: 'preserve-3d', transform: `translateZ(20px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` }}
               >
                  {isBuff && <div className="absolute inset-0 bg-yellow-400/50 blur-md rounded-full animate-ping" />}
                  {isHit && <div className="absolute inset-0 bg-red-500/80 blur-md rounded-full animate-ping" />}
                  
                  <div className="text-5xl drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]" style={{ transform: 'translateY(-10px)' }}>
                     {unit.emoji}
                  </div>
                  
                  {/* Status Bar */}
                  <div className="absolute -top-6 w-12 h-2 bg-slate-900 border border-slate-700 z-50 rounded-full overflow-hidden shadow-black shadow-sm">
                     <motion.div className="h-full bg-red-500" initial={false} animate={{ width: `${Math.max(0, (unit.stats.hp / unit.stats.maxHp) * 100)}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  
                  {/* Level */}
                  {unit.isPlayer && <div className="absolute -top-10 text-[10px] text-white font-black drop-shadow-md bg-blue-900/80 px-2 py-0.5 border border-blue-400/50 rounded-full">Lvl {unit.level || 1}</div>}
                  
                  {/* Debuffs */}
                  {unit.debuffs && unit.debuffs.length > 0 && (
                     <div className="absolute -top-14 flex gap-1 z-50">
                        {unit.debuffs.map((d, i) => (
                          <span key={i} className="text-sm drop-shadow-md bg-black/80 rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
                            {d.type === 'burn' ? '🔥' : d.type === 'poison' ? '🧪' : '🧊'}
                          </span>
                        ))}
                     </div>
                  )}
               </div>
            </div>
        </motion.div>
      );
    });
  };

  const renderScenery = () => {
    const allScenery = [...sceneryItems, ...envScenery];
    return allScenery.map((item, idx) => {
      const isEnv = idx >= sceneryItems.length;
      const elev = isEnv ? 0 : (elevations[item.y]?.[item.x] || 0);
      return (
        <div key={`scenery-${idx}`} className="absolute w-[56px] h-[56px] pointer-events-none flex items-center justify-center" style={{ left: 8 + item.x * 56, top: 8 + item.y * 56, transformStyle: 'preserve-3d', transform: `translateZ(${elev * 16}px)` }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
               <div className="relative flex items-center justify-center transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: `translateZ(20px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` }}>
                  <div className={`${isEnv ? 'text-6xl' : 'text-5xl'} drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]`} style={{ transform: 'translateY(-10px)' }}>
                      {item.emoji}
                  </div>
               </div>
            </div>
        </div>
      );
    });
  };

  const renderEffects = () => {
    return visualEffects.map(eff => {
      const targetElev = elevations[eff.y]?.[eff.x] || 0;
      const targetZ = targetElev * 16 + 8;
      
      if (eff.type === 'hit') {
        return (
          <motion.div
            key={eff.id}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -60, opacity: 0, scale: 1.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute pointer-events-none flex items-center justify-center z-[100]"
            style={{
              left: 8 + eff.x * 56,
              top: 8 + eff.y * 56,
              width: 56, height: 56,
              transformStyle: 'preserve-3d'
            }}
          >
             <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                <div className="relative text-5xl font-black text-white transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: `translateZ(${targetZ+40}px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)`, WebkitTextStroke: '2px black', filter: 'drop-shadow(0 0 8px rgba(255,255,255,1))' }}>
                  {eff.value}
                </div>
             </div>
          </motion.div>
        );
      }

      if (eff.type === 'attack' && eff.startX !== undefined && eff.startY !== undefined) {
        return (
          <motion.div
            key={eff.id}
            initial={{ left: 8 + eff.startX * 56, top: 8 + eff.startY * 56, scale: 0.5 }}
            animate={{ left: 8 + eff.x * 56, top: 8 + eff.y * 56, scale: 1.5 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="absolute pointer-events-none flex items-center justify-center z-[100]"
            style={{ width: 56, height: 56, transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
               <div className="relative text-6xl transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,1)]" style={{ transformStyle: 'preserve-3d', transform: `translateZ(${targetZ+20}px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` }}>
                  {eff.emoji || '⚔️'}
               </div>
            </div>
          </motion.div>
        );
      }
      
      return (
        <div 
          key={eff.id} 
          className="absolute pointer-events-none flex items-center justify-center z-[100]"
          style={{ 
             left: 8 + eff.x * 56, top: 8 + eff.y * 56, 
             width: 56, height: 56, 
             transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
             <div className="relative flex items-center justify-center transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: `translateZ(${targetZ + 30}px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)` }}>
                 {eff.type === 'magic' && <span className="animate-spin text-blue-300 drop-shadow-[0_0_20px_rgba(0,0,255,1)] text-6xl">✨</span>}
                 {eff.type === 'heal' && <span className="animate-bounce text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,1)] text-6xl">💚</span>}
                 {eff.type === 'damageNumber' && <span className="text-red-500 font-black text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] animate-bounce">-{eff.amount}</span>}
             </div>
          </div>
        </div>
      );
    });
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const elev = elevations[y]?.[x] || 0;
        const unit = units.find(u => u.x === x && u.y === y && u.stats.hp > 0);
        let cellClass = `relative w-[56px] h-[56px] min-w-[56px] min-h-[56px] flex-shrink-0 border ${theme.tileBorder} ${theme.tileBg} flex items-center justify-center text-3xl cursor-pointer transition-colors`;
        
        // Highlight logic
        if (selectedAction === 'MOVE' && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           if (dist > 0 && dist <= activeUnit.stats.mov && !unit) {
               cellClass += " bg-blue-500/30 hover:bg-blue-400/50 shadow-[inset_0_0_10px_rgba(59,130,246,0.5)]";
           } else {
               cellClass += " hover:brightness-125";
           }
        }
        else if ((selectedAction === 'ATTACK' || selectedAction === 'MAGIC') && activeUnit) {
           const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
           const range = selectedAction === 'ATTACK' ? activeUnit.weapon.range : 3; // Magic range is 3
           if (dist > 0 && dist <= range && unit && !unit.isPlayer) {
               cellClass += " bg-red-500/30 hover:bg-red-400/50 shadow-[inset_0_0_10px_rgba(239,68,68,0.5)]";
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
            style={{ transformStyle: 'preserve-3d', transform: `translateZ(${elev * 16}px)` }}
          >
            {elev > 0 && (
              <>
                 <div className="absolute top-full left-0 w-full bg-slate-800 border-x border-b border-slate-900 origin-top" style={{ height: `${elev * 16}px`, transform: 'rotateX(-90deg)' }} />
                 <div className="absolute top-0 right-full h-full bg-slate-700 border-y border-l border-slate-900 origin-right" style={{ width: `${elev * 16}px`, transform: 'rotateY(-90deg)' }} />
              </>
            )}
            
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col font-sans text-slate-200 transition-colors duration-1000 overflow-hidden">
      {/* 3D Battlefield Area */}
      <div className="flex-1 relative flex justify-center items-center bg-black/90 overflow-hidden">
          {/* Logs */}
          {actionText && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
             <div className="rounded-lg border-[4px] border-slate-200 text-white text-2xl md:text-3xl p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in-down font-black uppercase tracking-widest" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}>
                {actionText.text}
             </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-50 flex gap-2">
    <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))} className="w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full font-black text-3xl border-2 border-slate-500 shadow-lg backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center">-</button>
    <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full font-black text-3xl border-2 border-slate-500 shadow-lg backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center">+</button>
    <button onClick={() => setRotZ(z => z - 90)} className="w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full font-black text-2xl border-2 border-slate-500 shadow-lg backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center">↺</button>
    <button onClick={() => setRotZ(z => z + 90)} className="w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full font-black text-2xl border-2 border-slate-500 shadow-lg backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center">↻</button>
  </div>
  
  <div 
    className="relative w-full h-full flex justify-center items-center select-none"
    style={{ perspective: '1200px', transform: `scale(${zoom})`, transformOrigin: 'center' }}
  >
  
  <div 
    className={`relative p-2 rounded-xl shadow-[0_50px_100px_rgba(0,0,0,0.9)] inline-grid grid-cols-8 gap-0 border-4 border-slate-700/80 backdrop-blur-sm ${theme.wrapperBg} transition-transform duration-700 ease-in-out`}
    style={{ 
       transformStyle: 'preserve-3d', 
       minWidth: '464px', minHeight: '464px',
       transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`
    }}
  >
    {/* Base Platform for Environment */}
    <div 
       className="absolute pointer-events-none rounded-[40px] border-[16px] border-[#3a4f33]/80 bg-[#2d3a28]/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-sm"
       style={{ 
         left: -800, right: -800, top: -800, bottom: -800, 
         transform: 'translateZ(-10px)',
         transformStyle: 'preserve-3d'
       }}
    />
  
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
                {victoryData.drops.map((d, i) => <span key={i} className="text-green-400">✨ {d}</span>)}
              </div>
            )}
            <button 
              className="mt-6 px-8 py-3 bg-white text-black hover:bg-slate-300 font-black uppercase rounded shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
              onClick={() => onVictory(victoryData.exp, victoryData.gold, victoryData.drops)}
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
            className="w-1/3 md:w-1/4 rounded-lg border-[4px] border-slate-200 p-2 md:p-4 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             {activeUnit?.isPlayer ? (
                actionMenu === 'MAIN' ? (
                   <div className="flex flex-col gap-1 h-full text-2xl md:text-4xl">
                       <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => setSelectedAction('MOVE')} disabled={activeUnit.hasMoved}>
                           <span className="w-8">{selectedAction === 'MOVE' ? '►' : ''}</span> Mover
                       </button>
                       <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => setSelectedAction('ATTACK')} disabled={activeUnit.hasActed}>
                           <span className="w-8">{selectedAction === 'ATTACK' ? '►' : ''}</span> Atacar
                       </button>
                       {activeUnit.level && activeUnit.level >= 2 && activeUnit.heroClass && (
                           <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => setActionMenu('SKILLS')} disabled={activeUnit.hasActed}>
                               <span className="w-8">{actionMenu === 'SKILLS' ? '►' : ''}</span> {activeUnit.heroClass === 'Cavalheiro' || activeUnit.heroClass === 'Lutador' || activeUnit.heroClass === 'Arqueiro' ? 'Tecnica' : 'Especial'}
                           </button>
                       )}
                       <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => setActionMenu('MAGIC')} disabled={activeUnit.hasActed}>
                           <span className="w-8">{actionMenu === 'MAGIC' ? '►' : ''}</span> Magia
                       </button>
                       <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => {
                           const nextUnits = units.map(u => u.id === activeUnit.id ? { ...u, hasActed: true, stats: { ...u.stats, hp: Math.min(u.stats.maxHp, u.stats.hp + 50) } } : u);
                           setUnits(nextUnits);
                           showActionText(`Usou Pocao e recuperou 50 HP.`);
                           setSelectedAction(null);
                           setTimeout(nextTurn, 1000);
                       }} disabled={activeUnit.hasActed}>
                           <span className="w-8">{selectedAction === 'ITEM' ? '►' : ''}</span> Item
                       </button>
                       <button className="mt-auto flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={nextTurn}><span className="w-8"></span> Fim Turno</button>
                   </div>
                ) : actionMenu === 'SKILLS' ? (
                   <div className="flex flex-col gap-1 h-full text-xl md:text-3xl">
                       <button className="text-yellow-400 mb-2 hover:text-white text-left" onClick={() => setActionMenu('MAIN')}>← VOLTAR</button>
                       
                       <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => { setSelectedSubItem('skill_1'); setSelectedAction('SKILL'); }} disabled={(activeUnit.stats.sp || 0) < 20}>
                           <span className="w-6">{selectedSubItem === 'skill_1' ? '►' : ''}</span> 
                           {activeUnit.heroClass === 'Cavalheiro' ? 'Golpe Esmagador' : 
                            activeUnit.heroClass === 'Mago' ? 'Explosao Arcana' : 
                            activeUnit.heroClass === 'Alquimista' ? 'Pocao Explosiva' :
                            activeUnit.heroClass === 'Arqueiro' ? 'Chuva de Flechas' :
                            activeUnit.heroClass === 'Lutador' ? 'Soco Furacao' : 'Raio Laser'} (20 SP)
                       </button>
                       {activeUnit.level && activeUnit.level >= 3 && (
                          <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => { setSelectedSubItem('skill_2'); setSelectedAction('SKILL'); }} disabled={(activeUnit.stats.sp || 0) < 50}>
                              <span className="w-6">{selectedSubItem === 'skill_2' ? '►' : ''}</span> 
                              {activeUnit.heroClass === 'Cavalheiro' ? 'Defesa Absoluta' : 
                               activeUnit.heroClass === 'Mago' ? 'Dreno de Vida' : 
                               activeUnit.heroClass === 'Alquimista' ? 'Gas Toxico' :
                               activeUnit.heroClass === 'Arqueiro' ? 'Flecha Perfurante' :
                               activeUnit.heroClass === 'Lutador' ? 'Chute Relampago' : 'Torreta Movel'} (50 SP)
                          </button>
                       )}
                       {activeUnit.level && activeUnit.level >= 5 && (
                          <button className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => { setSelectedSubItem('skill_3'); setSelectedAction('SKILL'); }} disabled={(activeUnit.stats.sp || 0) < 100}>
                              <span className="w-6">{selectedSubItem === 'skill_3' ? '►' : ''}</span> 
                              {activeUnit.heroClass === 'Cavalheiro' ? 'Lamina Sagrada' : 
                               activeUnit.heroClass === 'Mago' ? 'Meteoro' : 
                               activeUnit.heroClass === 'Alquimista' ? 'Elixir' :
                               activeUnit.heroClass === 'Arqueiro' ? 'Tiro Fatal' :
                               activeUnit.heroClass === 'Lutador' ? 'Combo Infinito' : 'Autodestruicao'} (100 SP)
                          </button>
                       )}
</div>
                ) : (
                   <div className="flex flex-col gap-1 h-full text-xl md:text-3xl">
                       <button className="text-yellow-400 mb-2 hover:text-white text-left" onClick={() => setActionMenu('MAIN')}>← VOLTAR</button>
                       {(activeUnit as any).magics?.map((magic: string) => (
                           <button key={magic} className="flex items-center text-left hover:bg-white/20 p-1 rounded disabled:opacity-50 text-white" onClick={() => { setSelectedSubItem(magic); setSelectedAction('MAGIC'); }} disabled={activeUnit.stats.mp < 10}>
                               <span className="w-6">{selectedSubItem === magic ? '►' : ''}</span> {magic} (10 MP)
                           </button>
                       ))}
                   </div>
                )
             ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-red-400 animate-pulse text-center">TURNO<br/>INIMIGO</span>
                </div>
             )}
          </div>

          {/* Right Panel: Party Status */}
          <div 
            className="flex-1 rounded-lg border-[4px] border-slate-200 p-2 md:p-4 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
             <div className="flex flex-col gap-1 md:gap-2 h-full justify-around text-xl md:text-3xl">
                {units.filter(u => u.isPlayer).map(player => (
                    <div key={player.id} className={`flex items-center tracking-widest ${activeUnit?.id === player.id ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-slate-100'}`}>
                        <div className="w-40 md:w-64 truncate flex items-center gap-2">
                           <span className="text-2xl hidden md:inline-block">{player.emoji}</span>
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
          </div>
      </div>
    </div>
  );
};
