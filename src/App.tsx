import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Player, Enemy, CombatUnit, EnemyType, MapId, Hero } from './types';
import { MAPS, WEAPONS, ITEMS, ENEMY_TEMPLATES, BOSS } from './constants';
import { Exploration } from './components/Exploration';
import { Combat } from './components/Combat';
import { Shop } from './components/Shop';
import { CharacterCreation } from './components/CharacterCreation';
import { WorldMenu } from './components/WorldMenu';
import { TitleSettingsModal } from './components/TitleSettingsModal';
import { TitleScreen } from './components/TitleScreen';
import { soundFX, bgm } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START_MENU');
  const stepsSinceEncounter = useRef(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTitleSettingsOpen, setIsTitleSettingsOpen] = useState(false);
  const [hasSave, setHasSave] = useState(() => !!localStorage.getItem('eldoria_save'));
  const [totalSteps, setTotalSteps] = useState(48392);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(1108); // Starts at 18:28 like the classic reference or ticks up

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1024;
      const scaleY = window.innerHeight / 768;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer tick for playtime
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayTimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const saveGame = () => {
    const data = { player, mapId, overworldPos, artifacts, totalSteps, playTimeSeconds };
    localStorage.setItem('eldoria_save', JSON.stringify(data));
    setHasSave(true);
    soundFX.playSave();
    setSaveMessage('Jogo Salvo com Sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteSave = () => {
    localStorage.removeItem('eldoria_save');
    setHasSave(false);
  };

  const loadGame = () => {
    const data = localStorage.getItem('eldoria_save');
    if (data) {
      const parsed = JSON.parse(data);
      setPlayer(parsed.player);
      setMapId(parsed.mapId);
      setOverworldPos(parsed.overworldPos);
      setArtifacts(parsed.artifacts);
      if (parsed.totalSteps !== undefined) setTotalSteps(parsed.totalSteps);
      if (parsed.playTimeSeconds !== undefined) setPlayTimeSeconds(parsed.playTimeSeconds);
      spawnForMap(parsed.mapId);
      setGameState('EXPLORATION');
    }
  };

  const [mapId, setMapId] = useState<MapId>('OVERWORLD');
  const [overworldPos, setOverworldPos] = useState({ x: 5, y: 5 }); // To restore pos after dungeon/shop
  
  const [player, setPlayer] = useState<Player>({
    x: 10, y: 15,
    party: [],
    artifacts: [],
    inventory: { items: [ { ...ITEMS.pocao, count: 3 } ] },
    gold: 50
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [artifacts, setArtifacts] = useState<{id: string, x: number, y: number, emoji: string, mapId: MapId}[]>([]);
  const [combatEnemies, setCombatEnemies] = useState<Enemy[]>([]);

  // Background Music (BGM) playback based on GameState
  useEffect(() => {
    switch (gameState) {
      case 'START_MENU':
      case 'CHARACTER_CREATION':
      case 'STORY_CRAWL':
        bgm.playPrologue();
        break;
      case 'EXPLORATION':
      case 'SHOP':
        bgm.playOverworld();
        break;
      case 'ENCOUNTER_TRANSITION':
      case 'COMBAT':
        if (combatEnemies.some(e => e.id === 'boss' || e.type === 'boss')) {
          bgm.playBoss();
        } else {
          bgm.playBattle();
        }
        break;
      case 'VICTORY':
        bgm.playVictory();
        break;
      case 'GAME_OVER':
        bgm.stop();
        break;
    }
  }, [gameState, combatEnemies]);

  // Spawn logic based on map
  const spawnForMap = (mId: MapId) => {
    let newEnemies: Enemy[] = [];
    if (mId === 'OVERWORLD') {
      newEnemies.push(BOSS); // Boss sits at F
    }
    setEnemies(newEnemies);
  };

  const handleStart = () => {
    setGameState('CHARACTER_CREATION');
  };

  const handleCreationComplete = (party: Hero[]) => {
    setPlayer({
      x: 10, y: 15,
      party,
      artifacts: [],
      inventory: { items: [ { ...ITEMS.pocao, count: 3 } ] },
      gold: 50
    });
    setMapId('OVERWORLD');
    
    // Set Artifacts locations
    setArtifacts([
      { id: 'Fogo', mapId: 'DUNGEON_FOGO', x: 7, y: 5, emoji: '' },
      { id: 'Agua', mapId: 'DUNGEON_AGUA', x: 7, y: 5, emoji: '' },
      { id: 'Ar', mapId: 'DUNGEON_AR', x: 7, y: 5, emoji: '' },
      { id: 'Terra', mapId: 'DUNGEON_TERRA', x: 13, y: 3, emoji: '' }
    ]);
    
    spawnForMap('OVERWORLD');
    setGameState('STORY_CRAWL');
  };

  const changeMap = (newMapId: MapId, startX: number, startY: number) => {
    if (mapId === 'OVERWORLD') {
      setOverworldPos({ x: player.x, y: player.y });
    }
    setMapId(newMapId);
    setPlayer(prev => ({ ...prev, x: startX, y: startY }));
    spawnForMap(newMapId);
  };

  const handleMove = (dx: number, dy: number) => {
    if (gameState !== 'EXPLORATION' || isMenuOpen) return;
    
    setPlayer(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      const currentMap = MAPS[mapId];

      if (newY < 0 || newY >= currentMap.length || newX < 0 || newX >= currentMap[0].length) return prev;
      
      const tile = currentMap[newY][newX];
      
      // Walls / Water blocking
      if (tile === 'M' || tile === '~') return prev;

      // Track successful step
      setTotalSteps(s => s + 1);

      if (tile === 'S') {
         saveGame();
         return prev;
      } 

      // Portals and Cities
      if (tile === 'F') {
         if (prev.artifacts.length < 4) {
             console.log("Portal bloqueado");
             return prev;
         }
         // Boss fight
         const hitBoss = enemies.find(e => e.id === 'boss');
         if (hitBoss) {
           setCombatEnemies([hitBoss]);
           setGameState('COMBAT');
           return prev;
         }
      } else if (tile === 'C') {
         setOverworldPos({ x: prev.x, y: prev.y });
         setGameState('SHOP');
         return prev; // don't move into city block, stay next to it
      } else if (tile === '1') { changeMap('DUNGEON_FOGO', 7, 1); return prev; }
        else if (tile === '2') { changeMap('DUNGEON_AGUA', 7, 1); return prev; }
        else if (tile === '3') { changeMap('DUNGEON_AR', 7, 1); return prev; }
        else if (tile === '4') { changeMap('DUNGEON_TERRA', 7, 1); return prev; }
        else if (tile === '<') { changeMap('OVERWORLD', overworldPos.x, overworldPos.y); return prev; }

      // Check boss encounter explicitly (since it is the only static enemy left)
      const hitEnemy = enemies.find(e => e.x === newX && e.y === newY);
      if (hitEnemy) {
        setCombatEnemies([hitEnemy]);
        setGameState('COMBAT');
        return prev;
      }

      // Random Encounter Logic (Only on floor tiles, outside cities)
      // The user specifically requested not to spawn on cities, but we don't allow walking on C tiles anyway.
      // We will trigger a random encounter on normal floor `.`
      stepsSinceEncounter.current += 1;
      
      // Encounter chance increases the more steps you take without one.
      // Base chance 0% for first 5 steps, then increases.
      const baseChance = Math.max(0, (stepsSinceEncounter.current - 5) * 0.02);
      
      if (tile === '.' && Math.random() < baseChance) {
         stepsSinceEncounter.current = 0;
         let allowedTypes: EnemyType[] = mapId === 'OVERWORLD' ? ['slime', 'goblin'] : ['orc', 'elemental'];
         const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
         const template = ENEMY_TEMPLATES[type];
         
         const randomEnemy: Enemy = {
            id: `encounter_${Date.now()}`,
            x: 0, y: 0, // Doesn't matter for combat board
            type,
            stats: { ...template.stats },
            weapon: template.weapon,
            emoji: template.emoji,
            goldReward: template.gold
         };
         
         setCombatEnemies([randomEnemy]);
         setGameState('ENCOUNTER_TRANSITION');
         
         // Transition to COMBAT after effect
         setTimeout(() => {
            setGameState('COMBAT');
         }, 2000);
         
         return { ...prev, x: newX, y: newY };
      }

      // Auto-pickup artifacts
      const foundArtifact = artifacts.find(a => a.mapId === mapId && a.x === newX && a.y === newY);
      if (foundArtifact) {
         soundFX.playLevelUp();
         setPlayer(curr => ({ ...curr, artifacts: [...curr.artifacts, foundArtifact.id] }));
         setArtifacts(curr => curr.filter(a => a.id !== foundArtifact.id));
      }

      return { ...prev, x: newX, y: newY };
    });
  };

  const handleCombatVictory = () => {
     const reward = combatEnemies.reduce((sum, e) => sum + (e.goldReward || 0), 0);
     const expGain = combatEnemies.reduce((sum, e) => sum + 50, 0); // 50 exp per enemy for now
     
     setEnemies(prev => prev.filter(e => !combatEnemies.find(ce => ce.id === e.id)));
     
     if (combatEnemies.find(e => e.id === 'boss')) {
        setGameState('VICTORY');
     } else {
        let anyLeveledUp = false;
        setPlayer(prev => {
           const updatedParty = prev.party.map(hero => {
              let newExp = hero.exp + expGain;
              let newLevel = hero.level;
              let newStats = { ...hero.stats };
              
              // Level up logic (every 100 exp)
              while (newExp >= newLevel * 100) {
                 newExp -= newLevel * 100;
                 newLevel++;
                 anyLeveledUp = true;
                 // Stat growth
                 newStats.maxHp += 15;
                 newStats.maxMp += 10;
                 newStats.for += 3;
                 newStats.int += 3;
                 newStats.def += 2;
                 newStats.vel += 1;
              }

              return {
                 ...hero,
                 exp: newExp,
                 level: newLevel,
                 stats: { ...newStats, hp: Math.min(newStats.maxHp, newStats.hp + 20) } // Heal slightly after battle
              };
           });

           if (anyLeveledUp) {
              soundFX.playLevelUp();
           }

           return {
              ...prev,
              gold: prev.gold + reward,
              party: updatedParty
           };
        });
        setGameState('EXPLORATION');
     }
  };

  const handleCombatDefeat = () => {
     setGameState('GAME_OVER');
  };

  const handleEquipWeapon = (wType: string) => {
     // Check if weapon is owned (for now, simply allowing to equip owned weapons might need a weapon inventory, but since this is simplified, they only have 1 active weapon. Wait, we need to allow them to equip from an inventory. Let's adapt the UI so they can just swap if they own it... Actually, if they buy it, they just equip it instantly. But the sidebar allows swapping. Let's make it so if they buy an upgrade, it overwrites the base weapon slot.)
     // To keep it simple: the player always has exactly 3 weapon slots available to hot-swap based on their types.
     // In a full game, we'd check inventory. For this demo, we'll allow swapping to the base weapons, or if they own upgraded ones, we should swap to those.
     // Let's just find the best weapon they have of that type.
     
     // Note: In Shop, buying a weapon equips it and they lose the old one for simplicity in this demo.
     // If they swap here, they swap to base weapons.
     let targetId = wType === 'espada' ? 'w1' : wType === 'arco' ? 'w2' : 'w3';
     if (WEAPONS[targetId]) {
        setPlayer(prev => ({ ...prev, weapon: WEAPONS[targetId] }));
     }
  };

  const handleBuyItem = (itemId: string) => {
    const itemInfo = ITEMS[Object.keys(ITEMS).find(k => ITEMS[k].id === itemId) || ''];
    if (itemInfo && player.gold >= itemInfo.price) {
      setPlayer(prev => {
        const inv = [...prev.inventory.items];
        const existing = inv.find(i => i.id === itemId);
        if (existing) { existing.count += 1; }
        else { inv.push({ ...itemInfo, count: 1 }); }
        return { ...prev, gold: prev.gold - itemInfo.price, inventory: { items: inv } };
      });
    }
  };

  const handleBuyWeapon = (weaponId: string, price: number) => {
    const w = Object.values(WEAPONS).find(w => w.id === weaponId);
    if (w && player.gold >= price) {
      setPlayer(prev => ({
        ...prev,
        gold: prev.gold - price,
        weapon: w
      }));
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden font-sans text-slate-200">
      <div className="relative bg-slate-950 overflow-hidden" style={{ width: 1024, height: 768, transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <AnimatePresence mode="wait">
      
      {gameState === 'START_MENU' && (
        <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <TitleScreen
            hasSave={hasSave}
            onNewGame={handleStart}
            onLoadGame={loadGame}
            onOpenOptions={() => setIsTitleSettingsOpen(true)}
          />

          {/* Title Settings Modal */}
          <TitleSettingsModal
            isOpen={isTitleSettingsOpen}
            onClose={() => setIsTitleSettingsOpen(false)}
            hasSave={hasSave}
            onDeleteSave={handleDeleteSave}
          />
        </motion.div>
      )}
      {gameState === 'CHARACTER_CREATION' && (
        <motion.div key="char" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
         <CharacterCreation onComplete={handleCreationComplete} />
        </motion.div>
      )}

      {gameState === 'STORY_CRAWL' && (
        <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center bg-slate-950">
        <div className="relative w-full max-w-3xl h-[80vh] overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
          
          <motion.div
            initial={{ y: '100vh' }}
            animate={{ y: '-100vh' }}
            transition={{ duration: 45, ease: 'linear' }}
            onAnimationComplete={() => setGameState('EXPLORATION')}
            className="text-center text-3xl md:text-5xl text-slate-300 font-serif leading-relaxed px-4 space-y-12 z-0"
          >
            <p>Ha muitas eras, o mundo de Eldoria vivia em perfeita harmonia, sustentado pela magia cristalina dos Quatro Artefatos Elementais...</p>
            <p>Mas a paz foi estilhacada quando o Dragao Anciao despertou das profundezas, roubando a essencia da vida e espalhando seus monstros pelas planicies.</p>
            <p>O caos consumiu a terra. O ceu escureceu, e os mares recuaram.</p>
            <p>Apenas um guerreiro valente, dominando a lamina, o arco e a magia antiga, pode encontrar os artefatos perdidos e destrancar os portoes da Dungeon Final.</p>
            <p>A esperanca de toda uma era repousa em suas maos.</p>
            <p>Seu destino aguarda.</p>
          </motion.div>

          <button 
            onClick={() => setGameState('EXPLORATION')}
            className="absolute bottom-8 right-8 z-20 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-full text-sm uppercase tracking-widest transition-colors"
          >
            Pular Cena
          </button>
        </div>
        </motion.div>
      )}

      {gameState === 'EXPLORATION' && (
        <motion.div key="expl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center">
         {saveMessage && <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-black uppercase px-6 py-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.8)] z-50 animate-bounce">{saveMessage}</div>}
         <Exploration 
           mapId={mapId}
           player={player} 
           enemies={enemies} 
           artifacts={artifacts.filter(a => a.mapId === mapId)} 
           onMove={handleMove} 
           onInteract={() => {}}
           onEquipWeapon={handleEquipWeapon}
           isMenuOpen={isMenuOpen}
           onToggleMenu={() => setIsMenuOpen(prev => !prev)}
         />
         {isMenuOpen && (
           <WorldMenu 
             player={player}
             playTimeSeconds={playTimeSeconds}
             totalSteps={totalSteps}
             onClose={() => setIsMenuOpen(false)}
             onSave={saveGame}
             onUpdateParty={(updatedParty, updatedItems) => {
               setPlayer(prev => ({
                 ...prev,
                 party: updatedParty,
                 inventory: { ...prev.inventory, items: updatedItems }
               }));
             }}
           />
         )}
        </motion.div>
      )}

      {gameState === 'SHOP' && (
         <Shop 
           player={player}
           onBuyItem={handleBuyItem}
           onBuyWeapon={handleBuyWeapon}
           onExit={() => setGameState('EXPLORATION')}
         />
      )}

            {gameState === 'ENCOUNTER_TRANSITION' && (
        <motion.div key="enc" className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 grid grid-cols-5 md:grid-cols-10 grid-rows-5 md:grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1.1, opacity: 1 }} 
                    transition={{ delay: Math.random() * 0.5, duration: 0.3 }} 
                    className="bg-black w-full h-full" 
                 />
              ))}
           </div>
           <motion.div 
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="z-10 bg-slate-900 border-4 border-slate-700 p-8 rounded-xl shadow-[0_0_50px_rgba(255,0,0,0.5)] flex flex-col items-center justify-center gap-4"
           >
              <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 0.5 }}
              >
                 <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] text-center">INIMIGO<br/>APROXIMA-SE!</h1>
              </motion.div>
           </motion.div>
        </motion.div>
      )}

      {gameState === 'COMBAT' && (
        <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center">
         <Combat 
            mapId={mapId}
            playerUnits={player.party.map(hero => ({ ...hero, isPlayer: true, x: 0, y: 0, hasMoved: false, hasActed: false }))}
            enemyUnits={combatEnemies.map(e => ({ ...e, isPlayer: false, hasMoved: false, hasActed: false }))}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
         />
        </motion.div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-black text-red-600">GAME OVER</h1>
          <p className="text-xl text-slate-400">Sua jornada termina aqui...</p>
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xl"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {gameState === 'VICTORY' && (
        <div className="text-center space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-6xl font-black text-yellow-400">VITORIA!</h1>
          <p className="text-xl text-slate-400 max-w-md mx-auto">
            Voce derrotou o Dragao Anciao e restaurou o equilibrio elemental.
          </p>
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg text-xl"
          >
            Jogar Novamente
          </button>
        </div>
      )}
      
      </AnimatePresence>
      </div>
    </div>
  );
}
