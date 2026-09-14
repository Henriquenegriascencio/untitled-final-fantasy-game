import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Player, Enemy, CombatUnit, EnemyType, MapId, Hero, Cutscene, Weapon } from './types';
import { MAPS, WEAPONS, ITEMS, ENEMY_TEMPLATES, BOSS, GET_DUNGEON_BOSS, generateCombatEnemies, CHESTS_DATA, CUTSCENES_DATA } from './constants';
import { Exploration } from './components/Exploration';
import { Combat } from './components/Combat';
import { Shop } from './components/Shop';
import { CharacterCreation } from './components/CharacterCreation';
import { WorldMenu } from './components/WorldMenu';
import { TitleSettingsModal } from './components/TitleSettingsModal';
import { TitleScreen } from './components/TitleScreen';
import { CutsceneDialog } from './components/CutsceneDialog';
import { TreasureModal } from './components/TreasureModal';
import { PrologueIntro } from './components/PrologueIntro';
import { TownDialogModal } from './components/TownDialogModal';
import { ToolsmithModal } from './components/ToolsmithModal';
import { InnModal } from './components/InnModal';
import { LoadingScreen } from './components/LoadingScreen';
import { MapTransitionOverlay, MAP_TITLES } from './components/MapTransitionOverlay';
import { TOWNS_CONFIG, TownNPC } from './data/townData';
import { soundFX, bgm } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const stepsSinceEncounter = useRef(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTitleSettingsOpen, setIsTitleSettingsOpen] = useState(false);
  const [hasSave, setHasSave] = useState(() => !!localStorage.getItem('eldoria_save'));
  const [totalSteps, setTotalSteps] = useState(0);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  
  // Cutscene and Treasure Modal states
  const [activeCutscene, setActiveCutscene] = useState<Cutscene | null>(null);
  const [treasureModal, setTreasureModal] = useState<{ title: string; message: string } | null>(null);

  // Map Transition State
  const [transitionInfo, setTransitionInfo] = useState<{ isVisible: boolean; label?: string; subtitle?: string }>({ isVisible: false });
  const isTransitioningRef = useRef(false);

  // Town interaction states
  const [activeTownNpc, setActiveTownNpc] = useState<TownNPC | null>(null);
  const [isToolsmithOpen, setIsToolsmithOpen] = useState(false);
  const [isInnOpen, setIsInnOpen] = useState(false);
  const [currentTownId, setCurrentTownId] = useState<string>('TOWN_CORNELIA');

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

  const saveGame = (customPlayer?: Player, customMapId?: MapId) => {
    const p = customPlayer || player;
    const m = customMapId || mapId;
    const data = { player: p, mapId: m, overworldPos, artifacts, totalSteps, playTimeSeconds };
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

  const ensurePartyNames = (party: Hero[]): Hero[] => {
    return party.map((h, i) => {
      const name = h.name && h.name.trim() ? h.name.trim() : `Heroi ${i + 1}`;
      const vigor = h.stats?.vigor ?? h.stats?.for ?? 16;
      const magPwr = h.stats?.magPwr ?? h.stats?.int ?? 12;
      const def = h.stats?.def ?? 14;
      const batPwr = h.stats?.batPwr ?? (vigor + (h.weapon?.damage || 10));
      const magDef = h.stats?.magDef ?? Math.round(magPwr * 0.9 + 5);
      const mBlock = h.stats?.mBlock ?? Math.min(40, Math.round(magPwr * 0.5 + 5));
      const vel = h.stats?.vel ?? 10;
      const mov = h.stats?.mov ?? 3;
      const stats = {
        ...h.stats,
        batPwr,
        def,
        magDef,
        mBlock,
        vel,
        vigor,
        magPwr,
        mov,
        for: vigor,
        int: magPwr
      };
      return { ...h, name, stats };
    });
  };

  const loadGame = () => {
    const data = localStorage.getItem('eldoria_save');
    if (data) {
      const parsed = JSON.parse(data);
      const loadedParty = ensurePartyNames(parsed.player?.party || []);
      const loadedPlayer: Player = {
        ...parsed.player,
        party: loadedParty,
        storyFlags: parsed.player?.storyFlags || {},
        artifacts: parsed.player?.artifacts || parsed.artifacts || [],
        openedChests: parsed.player?.openedChests || []
      };
      setPlayer(loadedPlayer);
      setMapId(parsed.mapId);
      setOverworldPos(parsed.overworldPos);
      
      const groundArtifacts = (parsed.artifacts || []).filter(
        (a: any) => !loadedPlayer.artifacts.includes(a.id)
      );
      setArtifacts(groundArtifacts);

      if (parsed.totalSteps !== undefined) setTotalSteps(parsed.totalSteps);
      if (parsed.playTimeSeconds !== undefined) setPlayTimeSeconds(parsed.playTimeSeconds);
      stepsSinceEncounter.current = 0;
      spawnForMap(parsed.mapId, loadedPlayer);
      setGameState('EXPLORATION');
    }
  };

  const [mapId, setMapId] = useState<MapId>('OVERWORLD');
  const [overworldPos, setOverworldPos] = useState({ x: 36, y: 96 }); // Spawn in Cornelia area on 160x120 map
  
  const [player, setPlayer] = useState<Player>({
    x: 36, y: 96,
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
      case 'LOADING':
        // A musica permanece pausada durante a tela de carregamento para preparar os buffers
        bgm.stop();
        break;
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

  // Duck music volume when dialogue is active
  useEffect(() => {
    if (activeCutscene) {
      bgm.setDucked(true);
    } else {
      bgm.setDucked(false);
    }
  }, [activeCutscene]);

  // Helper to map speaker names to player's actual chosen party names
  const getPartySpeakerName = (originalSpeaker: string): string => {
    const p = player.party;
    if (!p || p.length === 0) return originalSpeaker;

    const lower = originalSpeaker.toLowerCase();
    if (lower.includes('caelen')) {
      return p[0]?.name || originalSpeaker;
    }
    if (lower.includes('lyra')) {
      return p[1]?.name || originalSpeaker;
    }
    if (lower.includes('rowan')) {
      return p[2]?.name || originalSpeaker;
    }
    if (lower.includes('elira')) {
      return p[3]?.name || originalSpeaker;
    }
    return originalSpeaker;
  };

  const adaptCutsceneText = (text: string): string => {
    const p = player.party;
    if (!p || p.length === 0) return text;

    let res = text;
    if (p[0]?.name) {
      res = res.replace(/Caelen Guardiao/gi, p[0].name).replace(/Caelen/gi, p[0].name);
    }
    if (p[1]?.name) {
      res = res.replace(/Lyra Arcanista/gi, p[1].name).replace(/Lyra/gi, p[1].name);
    }
    if (p[2]?.name) {
      res = res.replace(/Rowan Arqueiro/gi, p[2].name).replace(/Rowan/gi, p[2].name);
    }
    if (p[3]?.name) {
      res = res.replace(/Elira Alquimista/gi, p[3].name).replace(/Elira/gi, p[3].name);
    }
    return res;
  };

  // Trigger in-game cutscenes with story flags
  const triggerCutscene = (cutsceneId: string) => {
    if (player.storyFlags?.[cutsceneId]) return;
    const cutsceneDef = CUTSCENES_DATA[cutsceneId];
    if (cutsceneDef) {
      const adaptedMessages = cutsceneDef.messages.map(m => ({
        speaker: getPartySpeakerName(m.speaker),
        text: adaptCutsceneText(m.text)
      }));

      setActiveCutscene({
        ...cutsceneDef,
        messages: adaptedMessages,
        onComplete: () => {
          setPlayer(curr => ({
            ...curr,
            storyFlags: { ...(curr.storyFlags || {}), [cutsceneId]: true }
          }));
          setActiveCutscene(null);
        }
      });
    }
  };

  useEffect(() => {
    if (gameState === 'EXPLORATION' && !player.storyFlags?.['intro_world']) {
      triggerCutscene('intro_world');
    }
  }, [gameState, player.storyFlags]);

  // Spawn logic based on map
  const spawnForMap = (mId: MapId, playerOverride?: Player) => {
    const p = playerOverride || player;
    let newEnemies: Enemy[] = [];
    if (mId === 'DUNGEON_PRELUDIO_2') {
      if (!p.storyFlags?.['boss_preludio_defeated'] && !p.storyFlags?.['boss_preludio']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_PRELUDIO_2'));
      }
    } else if (mId === 'DUNGEON_DESAFIO_2') {
      if (!p.storyFlags?.['cidadela_desafios_defeated'] && !p.storyFlags?.['boss_desafio_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_DESAFIO_2'));
      }
    } else if (mId === 'DUNGEON_TERRA_2') {
      if (!p.artifacts?.includes('Terra') && !p.storyFlags?.['boss_terra_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_TERRA_2'));
      }
    } else if (mId === 'DUNGEON_FOGO_2') {
      if (!p.artifacts?.includes('Fogo') && !p.storyFlags?.['boss_fogo_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_FOGO_2'));
      }
    } else if (mId === 'DUNGEON_AGUA_2') {
      if (!p.artifacts?.includes('Agua') && !p.storyFlags?.['boss_agua_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_AGUA_2'));
      }
    } else if (mId === 'DUNGEON_AR_3') {
      if (!p.artifacts?.includes('Ar') && !p.storyFlags?.['boss_ar_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_AR_3'));
      }
    } else if (mId === 'DUNGEON_FINAL_3') {
      if (!p.storyFlags?.['boss_chaos_defeated'] && !p.storyFlags?.['chaos_defeated']) {
        newEnemies.push(GET_DUNGEON_BOSS('DUNGEON_FINAL_3'));
      }
    } else if (mId.startsWith('TOWN_')) {
      newEnemies = [];
    }
    setEnemies(newEnemies);
  };

  const handleStart = () => {
    setGameState('CHARACTER_CREATION');
  };

  const handleCreationComplete = (party: Hero[]) => {
    setPlayer({
      x: 36, y: 96,
      party: ensurePartyNames(party),
      artifacts: [],
      inventory: { items: [ { ...ITEMS.pocao, count: 3 } ] },
      gold: 50
    });
    setTotalSteps(0);
    setPlayTimeSeconds(0);
    setOverworldPos({ x: 36, y: 96 });
    setMapId('OVERWORLD');
    
    // Set Artifacts locations on boss floors
    setArtifacts([
      { id: 'Terra', mapId: 'DUNGEON_TERRA_2', x: 11, y: 8, emoji: '' },
      { id: 'Fogo', mapId: 'DUNGEON_FOGO_2', x: 11, y: 8, emoji: '' },
      { id: 'Agua', mapId: 'DUNGEON_AGUA_2', x: 11, y: 8, emoji: '' },
      { id: 'Ar', mapId: 'DUNGEON_AR_3', x: 11, y: 8, emoji: '' }
    ]);
    
    spawnForMap('OVERWORLD');
    setGameState('STORY_CRAWL');
  };

  const changeMap = (newMapId: MapId, startX: number, startY: number, soundType: 'door' | 'stairs' | 'teleport' = 'door') => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    if (soundType === 'stairs') {
      soundFX.playStairs();
    } else if (soundType === 'door') {
      soundFX.playDoor();
    } else {
      soundFX.playSelect();
    }

    const titleInfo = MAP_TITLES[newMapId] || { label: newMapId };
    setTransitionInfo({
      isVisible: true,
      label: titleInfo.label,
      subtitle: titleInfo.subtitle
    });

    setTimeout(() => {
      stepsSinceEncounter.current = 0;
      if (mapId === 'OVERWORLD') {
        setOverworldPos({ x: player.x, y: player.y });
      }
      setMapId(newMapId);
      setPlayer(prev => {
        const nextPlayer = { ...prev, x: startX, y: startY };
        spawnForMap(newMapId, nextPlayer);
        return nextPlayer;
      });

      setTimeout(() => {
        setTransitionInfo({ isVisible: false });
        isTransitioningRef.current = false;
      }, 350);
    }, 280);
  };

  const handleInteract = (facingDir: 0 | 1 | 2 | 3 = 0) => {
    if (gameState !== 'EXPLORATION' || isMenuOpen || isTransitioningRef.current) return;
    if (activeTownNpc || isToolsmithOpen || isInnOpen || treasureModal || activeCutscene) return;

    const currentMap = MAPS[mapId];
    if (!currentMap) return;

    const dx = facingDir === 3 ? 1 : facingDir === 2 ? -1 : 0;
    const dy = facingDir === 0 ? 1 : facingDir === 1 ? -1 : 0;

    const checkCoords = [
      { x: player.x + dx, y: player.y + dy },
      { x: player.x, y: player.y },
      { x: player.x, y: player.y + 1 },
      { x: player.x, y: player.y - 1 },
      { x: player.x - 1, y: player.y },
      { x: player.x + 1, y: player.y },
    ];

    // 1. Check Living Bosses / Enemies on Map
    for (const coord of checkCoords) {
      const hitEnemy = enemies.find(e => e.x === coord.x && e.y === coord.y);
      if (hitEnemy) {
        soundFX.playSelect();
        const encounterGroup = generateCombatEnemies(mapId, player.party, true, hitEnemy);
        setCombatEnemies(encounterGroup);
        setGameState('ENCOUNTER_TRANSITION');
        setTimeout(() => {
          setGameState('COMBAT');
        }, 1200);
        return;
      }
    }

    // 2. Check Town & Interior NPCs & Facilities
    if (mapId.startsWith('TOWN_') || mapId.startsWith('INTERIOR_')) {
      const cfg = TOWNS_CONFIG[mapId] || TOWNS_CONFIG[currentTownId];
      for (const coord of checkCoords) {
        if (coord.y >= 0 && coord.y < currentMap.length && coord.x >= 0 && coord.x < currentMap[0].length) {
          const tile = currentMap[coord.y][coord.x];
          
          // NPC interaction
          if (tile === 'N' && cfg) {
            const matched = cfg.npcs.find(n => Math.abs(n.x - coord.x) <= 1 && Math.abs(n.y - coord.y) <= 1) || cfg.npcs[0];
            if (matched) {
              soundFX.playSelect();
              setActiveTownNpc(matched);
              return;
            }
          }

          // Town Building entrances (when interacting with building facade on TOWN_ map)
          if (mapId.startsWith('TOWN_')) {
            if (tile === 'H') {
              const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_HOUSE' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_HOUSE' : 'INTERIOR_GAIA_HOUSE';
              changeMap(interiorMap, 5, 5, 'door');
              return;
            }
            if (tile === 'P') {
              const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_SHOP' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_SHOP' : 'INTERIOR_GAIA_SHOP';
              changeMap(interiorMap, 5, 5, 'door');
              return;
            }
            if (tile === 'E') {
              const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_TOOLSMITH' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_TOOLSMITH' : 'INTERIOR_GAIA_TOOLSMITH';
              changeMap(interiorMap, 5, 5, 'door');
              return;
            }
            if (tile === 'I') {
              const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_INN' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_INN' : 'INTERIOR_GAIA_INN';
              changeMap(interiorMap, 5, 5, 'door');
              return;
            }
          }

          // Interior Counter / Desk / Beds / Bookshelves / Hearth / Exit
          if (mapId.startsWith('INTERIOR_')) {
            if (tile === 'T') {
              if (mapId.includes('_SHOP')) {
                soundFX.playDoor();
                setGameState('SHOP');
                return;
              }
              if (mapId.includes('_TOOLSMITH')) {
                soundFX.playDoor();
                setIsToolsmithOpen(true);
                return;
              }
              if (mapId.includes('_INN')) {
                soundFX.playDoor();
                setIsInnOpen(true);
                return;
              }
              if (mapId.includes('_HOUSE')) {
                soundFX.playSelect();
                if (cfg && cfg.npcs.length > 0) {
                  setActiveTownNpc(cfg.npcs[0]);
                  return;
                }
              }
            }
            if (tile === 'E') {
              soundFX.playDoor();
              setIsToolsmithOpen(true);
              return;
            }
            if (tile === 'I') {
              soundFX.playDoor();
              setIsInnOpen(true);
              return;
            }
            if (tile === 'B') {
              soundFX.playSelect();
              let bookLore = 'Manual de Roteiro: Como reciclar a historia de Final Fantasy mudando apenas os nomes dos lugares.';
              if (mapId.includes('PRAVOCA')) {
                bookLore = 'Cronicas do Pirata: Esperando o desenvolvedor programar um barco navegavel desde mil novecentos e noventa.';
              } else if (mapId.includes('GAIA')) {
                bookLore = 'Tratado dos Sabios: Por que o vilao supremo fica esperando no topo da torre em vez de acabar com o jogo logo no inicio.';
              }
              setTreasureModal({
                title: 'ESTANTE DE LIVROS',
                message: bookLore
              });
              return;
            }
            if (tile === 'H') {
              soundFX.playSelect();
              setTreasureModal({
                title: 'LAREIRA DE PIXELS',
                message: 'O fogo e feito de quadradinhos laranjas piscando. Voce tenta se esquentar mas so sente calor da sua placa de video.'
              });
              return;
            }
            if (tile === '<') {
              const parentTown: MapId = mapId.includes('CORNELIA') ? 'TOWN_CORNELIA' : mapId.includes('PRAVOCA') ? 'TOWN_PRAVOCA' : 'TOWN_GAIA';
              let exitX = 3;
              let exitY = 5;
              if (mapId.includes('_SHOP')) {
                exitX = 19;
                exitY = 5;
              } else if (mapId.includes('_TOOLSMITH')) {
                exitX = 19;
                exitY = 12;
              } else if (mapId.includes('_INN')) {
                exitX = 3;
                exitY = 12;
              }
              changeMap(parentTown, exitX, exitY, 'door');
              return;
            }
          }
        }
      }
    }

    // 3. Check Treasure Chests
    for (const coord of checkCoords) {
      if (coord.y >= 0 && coord.y < currentMap.length && coord.x >= 0 && coord.x < currentMap[0].length) {
        const tile = currentMap[coord.y][coord.x];
        if (tile === 'X') {
          const chestKey = `${mapId}_${coord.x}_${coord.y}`;
          const opened = player.openedChests || [];
          if (opened.includes(chestKey)) {
            soundFX.playCursor();
            setTreasureModal({
              title: 'BAU VAZIO',
              message: 'O bau esta completamente vazio! Alguem chegou antes ou o desenvolvedor esqueceu de colocar loot.'
            });
            return;
          }

          const data = CHESTS_DATA[chestKey] || { type: 'gold', gold: 150, name: '150 Moedas de Ouro' };
          soundFX.playLevelUp();

          setPlayer(prev => {
            let newGold = prev.gold;
            let newItems = [...prev.inventory.items];
            let newParty = [...prev.party];

            if (data.type === 'gold' && data.gold) {
              newGold += data.gold;
            } else if (data.type === 'item' && data.itemId) {
              const itemDef = ITEMS[data.itemId] || { id: data.itemId, name: data.name, type: 'heal', value: 60, price: 50, description: '' };
              const existing = newItems.find(i => i.id === itemDef.id);
              if (existing) {
                existing.count += 1;
              } else {
                newItems.push({ ...itemDef, count: 1 });
              }
            } else if (data.type === 'weapon' && data.weaponId) {
              const wepDef = WEAPONS[data.weaponId];
              if (wepDef && newParty.length > 0) {
                newParty[0] = { ...newParty[0], weapon: wepDef };
              }
            }

            return {
              ...prev,
              gold: newGold,
              inventory: { items: newItems },
              party: newParty,
              openedChests: [...opened, chestKey]
            };
          });

          setTreasureModal({
            title: 'BAU DE TESOURO',
            message: `Recebeu * ${data.name} *!`
          });
          return;
        }
      }
    }
  };

  const handleMove = (dx: number, dy: number) => {
    if (gameState !== 'EXPLORATION' || isMenuOpen || isTransitioningRef.current) return;
    if (activeTownNpc || isToolsmithOpen || isInnOpen || treasureModal || activeCutscene) return;
    
    setPlayer(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      const currentMap = MAPS[mapId];

      if (newY < 0 || newY >= currentMap.length || newX < 0 || newX >= currentMap[0].length) return prev;
      
      const tile = currentMap[newY][newX];
      
      // Solid tiles that block walking
      if (mapId.startsWith('INTERIOR_')) {
        if (tile === 'W' || tile === 'T' || tile === 'I' || tile === 'B' || tile === 'H' || tile === 'E' || tile === 'N' || tile === 'X') {
          return prev;
        }
      } else {
        if (tile === 'M' || tile === '~' || tile === 'W' || tile === 'P' || tile === 'E' || tile === 'I' || tile === 'H' || tile === 'N' || tile === 'X') {
          return prev;
        }
      }

      // Check if enemy occupies the tile
      const enemyOnTile = enemies.find(e => e.x === newX && e.y === newY);
      if (enemyOnTile) {
        return prev;
      }

      // Track successful step
      setTotalSteps(s => s + 1);

      // Interior exit doorway (< or bottom edge)
      if (mapId.startsWith('INTERIOR_') && (tile === '<' || newY >= 14)) {
        const parentTown: MapId = mapId.includes('CORNELIA') ? 'TOWN_CORNELIA' : mapId.includes('PRAVOCA') ? 'TOWN_PRAVOCA' : 'TOWN_GAIA';
        let exitX = 3;
        let exitY = 5;
        if (mapId.includes('_SHOP')) {
          exitX = 19;
          exitY = 5;
        } else if (mapId.includes('_TOOLSMITH')) {
          exitX = 19;
          exitY = 12;
        } else if (mapId.includes('_INN')) {
          exitX = 3;
          exitY = 12;
        }
        changeMap(parentTown, exitX, exitY, 'door');
        return prev;
      }

      // Town building doorways
      if (mapId.startsWith('TOWN_')) {
        // Step into House doorway at (3, 4)
        if (newX === 3 && newY === 4) {
          const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_HOUSE' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_HOUSE' : 'INTERIOR_GAIA_HOUSE';
          changeMap(interiorMap, 9, 13, 'door');
          return prev;
        }
        // Step into Shop doorway at (19, 4)
        if (newX === 19 && newY === 4) {
          const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_SHOP' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_SHOP' : 'INTERIOR_GAIA_SHOP';
          changeMap(interiorMap, 9, 13, 'door');
          return prev;
        }
        // Step into Inn doorway at (3, 13)
        if (newX === 3 && newY === 13) {
          const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_INN' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_INN' : 'INTERIOR_GAIA_INN';
          changeMap(interiorMap, 9, 13, 'door');
          return prev;
        }
        // Step into Toolsmith doorway at (19, 13)
        if (newX === 19 && newY === 13) {
          const interiorMap: MapId = mapId === 'TOWN_CORNELIA' ? 'INTERIOR_CORNELIA_TOOLSMITH' : mapId === 'TOWN_PRAVOCA' ? 'INTERIOR_PRAVOCA_TOOLSMITH' : 'INTERIOR_GAIA_TOOLSMITH';
          changeMap(interiorMap, 9, 13, 'door');
          return prev;
        }
      }

      // Portals, Dungeons and Cities
      if (tile === 'C') {
         setOverworldPos({ x: prev.x, y: prev.y });
         saveGame();
         const distCornelia = Math.abs(newX - 36) + Math.abs(newY - 84);
         const distPravoca = Math.abs(newX - 108) + Math.abs(newY - 84);
         const distGaia = Math.abs(newX - 84) + Math.abs(newY - 24);
         let targetTown: MapId = 'TOWN_CORNELIA';
         if (distCornelia <= distPravoca && distCornelia <= distGaia) {
           targetTown = 'TOWN_CORNELIA';
         } else if (distPravoca <= distGaia) {
           targetTown = 'TOWN_PRAVOCA';
         } else {
           targetTown = 'TOWN_GAIA';
         }
         setCurrentTownId(targetTown);
         changeMap(targetTown, 11, 15, 'door');
         return prev;
      }

      // Town exit gate
      if (mapId.startsWith('TOWN_') && tile === '<') {
        changeMap('OVERWORLD', overworldPos.x, overworldPos.y + 1, 'door');
        return prev;
      }

      // Overworld Dungeon Entrances
      if (tile === '0') {
         changeMap('DUNGEON_PRELUDIO_1', 11, 15, 'stairs');
         triggerCutscene('enter_preludio');
         return prev;
      } else if (tile === '6') {
         changeMap('DUNGEON_DESAFIO_1', 11, 15, 'stairs');
         triggerCutscene('enter_desafio');
         return prev;
      } else if (tile === '1') {
         if (!prev.storyFlags?.['boss_preludio_defeated']) {
           setTreasureModal({
             title: 'ENTRADA BLOQUEADA',
             message: 'A Caverna da Terra esta selada! Este jogo e linear, entao complete a Caverna do Preludio primeiro.'
           });
           return prev;
         }
         if (!prev.storyFlags?.['cidadela_desafios_defeated']) {
           setTreasureModal({
             title: 'ENTRADA BLOQUEADA',
             message: 'O Santuario da Terra exige o Amuleto dos Sabios! Va sofrer na Cidadela dos Desafios primeiro.'
           });
           return prev;
         }
         changeMap('DUNGEON_TERRA_1', 11, 15, 'stairs');
         triggerCutscene('enter_terra');
         return prev;
      } else if (tile === '2') {
         if (!prev.artifacts.includes('Terra')) {
           setTreasureModal({
             title: 'ENTRADA BLOQUEADA',
             message: 'Calor insuportavel! O roteiro exige que voce conquiste o Cristal da Terra antes de vir queimar os pes no magma.'
           });
           return prev;
         }
         changeMap('DUNGEON_FOGO_1', 11, 15, 'stairs');
         triggerCutscene('enter_fogo');
         return prev;
      } else if (tile === '3') {
         if (!prev.artifacts.includes('Fogo')) {
           setTreasureModal({
             title: 'ENTRADA BLOQUEADA',
             message: 'Ondas violentas barram a passagem! O programador exige o Cristal de Fogo antes de liberar a fase da agua.'
           });
           return prev;
         }
         changeMap('DUNGEON_AGUA_1', 11, 15, 'stairs');
         triggerCutscene('enter_agua');
         return prev;
      } else if (tile === '4') {
         if (!prev.artifacts.includes('Agua')) {
           setTreasureModal({
             title: 'ENTRADA BLOQUEADA',
             message: 'Ventos cortantes! Pegue o Cristal da Agua antes de tentar escalar a torre flutuante.'
           });
           return prev;
         }
         changeMap('DUNGEON_AR_1', 11, 15, 'stairs');
         triggerCutscene('enter_ar');
         return prev;
      } else if (tile === '5' || tile === 'F') {
         if (prev.artifacts.length < 4) {
           setTreasureModal({
             title: 'PORTAL SELADO',
             message: `O Portal de Chaos exige os 4 Cristais Elementais! Voce reuniu apenas ${prev.artifacts.length} de 4. Nada de pular fases!`
           });
           return prev;
         }
         changeMap('DUNGEON_FINAL_1', 11, 15, 'door');
         triggerCutscene('enter_final');
         return prev;
      } else if (tile === 'G') {
         // Cornelia Royal Bridge Checkpoint
         if (newX >= 80 && newX <= 92 && newY >= 72 && newY <= 84) {
           setTreasureModal({
             title: 'POSTO REAL DE FRONTEIRA',
             message: 'O Guarda Real avisa com deboche: A estrada esta livre para exploracao! O desenvolvedor removeu as paredes invisiveis. Mas se tentar invadir masmorras avancadas sem os cristais exigidos pela historia, vai levar uma surra!'
           });
         } else {
           setTreasureModal({
             title: 'MARCADOR ANCESTRAL',
             message: 'Um monolito magico zune em tom ironico: Terras abertas para exploracao livre! Lembre-se: o mapa e aberto, mas a progressao das masmorras continua estritamente linear!'
           });
         }
      } else if (tile === '>') {
         // Stairs down
         if (mapId === 'DUNGEON_PRELUDIO_1') { changeMap('DUNGEON_PRELUDIO_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_DESAFIO_1') { changeMap('DUNGEON_DESAFIO_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_TERRA_1') { changeMap('DUNGEON_TERRA_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FOGO_1') { changeMap('DUNGEON_FOGO_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AGUA_1') { changeMap('DUNGEON_AGUA_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AR_1') { changeMap('DUNGEON_AR_2', 19, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AR_2') { changeMap('DUNGEON_AR_3', 3, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FINAL_1') { changeMap('DUNGEON_FINAL_2', 11, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FINAL_2') { changeMap('DUNGEON_FINAL_3', 20, 3, 'stairs'); return prev; }
      } else if (tile === '<') {
         // Stairs up / exit
         if (mapId === 'DUNGEON_PRELUDIO_2') { changeMap('DUNGEON_PRELUDIO_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_DESAFIO_2') { changeMap('DUNGEON_DESAFIO_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_TERRA_2') { changeMap('DUNGEON_TERRA_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FOGO_2') { changeMap('DUNGEON_FOGO_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AGUA_2') { changeMap('DUNGEON_AGUA_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AR_3') { changeMap('DUNGEON_AR_2', 3, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_AR_2') { changeMap('DUNGEON_AR_1', 17, 4, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FINAL_3') { changeMap('DUNGEON_FINAL_2', 20, 3, 'stairs'); return prev; }
         if (mapId === 'DUNGEON_FINAL_2') { changeMap('DUNGEON_FINAL_1', 11, 4, 'stairs'); return prev; }
         changeMap('OVERWORLD', overworldPos.x, overworldPos.y + 1, 'door');
         return prev;
      }

      // Random Encounter Logic (Plains, forests, deserts, swamps, bridges)
      stepsSinceEncounter.current += 1;
      
      const isWildTile = !mapId.startsWith('TOWN_') && ['.', 'T', 'D', 'S', 'B'].includes(tile);
      const encounterRateMultiplier = tile === 'S' ? 0.75 : tile === 'T' ? 0.6 : tile === 'D' ? 0.5 : tile === 'B' ? 0.2 : 0.45;
      const safeSteps = 48;
      const baseChance = Math.max(0, (stepsSinceEncounter.current - safeSteps) * 0.0035);
      
      if (isWildTile && Math.random() < baseChance * encounterRateMultiplier) {
         stepsSinceEncounter.current = 0;
         const encounterGroup = generateCombatEnemies(mapId, prev.party, false);
         
         setCombatEnemies(encounterGroup);
         setGameState('ENCOUNTER_TRANSITION');
         
         setTimeout(() => {
            setGameState('COMBAT');
         }, 1500);
         
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

  const handleCombatVictory = (exp?: number, goldReward?: number, drops?: string[], finalParty?: CombatUnit[], finalInv?: any[]) => {
     stepsSinceEncounter.current = 0;
     const reward = goldReward !== undefined ? goldReward : combatEnemies.reduce((sum, e) => sum + (e.goldReward || 0), 0);
     const expGain = exp !== undefined ? exp : combatEnemies.reduce((sum, e) => sum + (e.expReward || 50), 0);
     
     setEnemies(prev => prev.filter(e => !combatEnemies.find(ce => ce.id === e.id)));
     
     const defeatedBoss = combatEnemies.find(e => e.type === 'boss' || e.id === 'boss' || e.id.startsWith('boss_'));
     if (defeatedBoss) {
        if (defeatedBoss.id === 'boss_chaos' || defeatedBoss.id === 'boss') {
           setPlayer(p => ({
              ...p,
              storyFlags: { ...(p.storyFlags || {}), 'boss_chaos_defeated': true, 'chaos_defeated': true }
           }));
           setGameState('VICTORY');
           return;
        }
        if (defeatedBoss.id === 'boss_preludio') {
           setTreasureModal({
              title: 'SELO DE COBRE OBTIDO!',
              message: 'Voce derrotou a Gargula do Preludio e obteve o Selo de Cobre! A Guarda Real na Ponte de Cornelia agora permitira sua passagem para Pravoca!'
           });
        } else if (defeatedBoss.id === 'boss_desafio') {
           soundFX.playSave();
           setTreasureModal({
              title: 'EVOLUCAO DE CLASSES CONQUISTADA!',
              message: 'Voce conquistou o Amuleto dos Sabios na Cidadela dos Desafios! A energia dos antigos despertou em seus herois: Guerreiro vira Cavaleiro, Ladrao vira Ninja, Monge vira Mestre, Mago Branco vira Mago Branco Superior, Mago Negro vira Mago Negro Superior e Mago Vermelho vira Mago Vermelho Superior! Todas as novas habilidades e poderes foram liberados!'
           });
        } else if (defeatedBoss.id === 'boss_terra') {
           setArtifacts(curr => curr.filter(a => a.id !== 'Terra'));
           setTreasureModal({
              title: 'CRISTAL DA TERRA RESTAURADO!',
              message: 'Voce derrotou o Lich da Terra e purificou o Cristal da Terra! A energia telurica volta a nutrir o continente!'
           });
        } else if (defeatedBoss.id === 'boss_fogo') {
           setArtifacts(curr => curr.filter(a => a.id !== 'Fogo'));
           setTreasureModal({
              title: 'CRISTAL DE FOGO RESTAURADO!',
              message: 'Voce derrotou Marilith e purificou o Cristal de Fogo! As chamas caoticas do Vulcao de Gulg foram acalmadas!'
           });
        } else if (defeatedBoss.id === 'boss_agua') {
           setArtifacts(curr => curr.filter(a => a.id !== 'Agua'));
           setTreasureModal({
              title: 'CRISTAL DA AGUA RESTAURADO!',
              message: 'Voce derrotou Kraken e purificou o Cristal da Agua! Os oceanos e mares de Gaia voltam a fluir limpos!'
           });
        } else if (defeatedBoss.id === 'boss_ar') {
           setArtifacts(curr => curr.filter(a => a.id !== 'Ar'));
           setTreasureModal({
              title: 'CRISTAL DO AR RESTAURADO!',
              message: 'Voce derrotou Tiamat e purificou o Cristal do Ar! Os ventos celestes voltam a soprar em harmonia!'
           });
        }
     }

     let anyLeveledUp = false;
     setPlayer(prev => {
        let currentStoryFlags = { ...(prev.storyFlags || {}) };
        let currentArtifacts = [...prev.artifacts];

        if (defeatedBoss) {
           currentStoryFlags[`${defeatedBoss.id}_defeated`] = true;
           if (defeatedBoss.id === 'boss_preludio') {
              currentStoryFlags['boss_preludio_defeated'] = true;
           } else if (defeatedBoss.id === 'boss_desafio') {
              currentStoryFlags['cidadela_desafios_defeated'] = true;
              currentStoryFlags['class_promoted'] = true;
           } else if (defeatedBoss.id === 'boss_terra') {
              currentStoryFlags['boss_terra_defeated'] = true;
              if (!currentArtifacts.includes('Terra')) currentArtifacts.push('Terra');
           } else if (defeatedBoss.id === 'boss_fogo') {
              currentStoryFlags['boss_fogo_defeated'] = true;
              if (!currentArtifacts.includes('Fogo')) currentArtifacts.push('Fogo');
           } else if (defeatedBoss.id === 'boss_agua') {
              currentStoryFlags['boss_agua_defeated'] = true;
              if (!currentArtifacts.includes('Agua')) currentArtifacts.push('Agua');
           } else if (defeatedBoss.id === 'boss_ar') {
              currentStoryFlags['boss_ar_defeated'] = true;
              if (!currentArtifacts.includes('Ar')) currentArtifacts.push('Ar');
           }
        }

        let workingParty = prev.party;
        if (defeatedBoss && defeatedBoss.id === 'boss_desafio') {
           workingParty = workingParty.map(h => {
              const currentClass = h.heroClass;
              let newClass = currentClass;
              if (currentClass === 'Guerreiro') newClass = 'Cavaleiro';
              else if (currentClass === 'Ladrao') newClass = 'Ninja';
              else if (currentClass === 'Monge') newClass = 'Mestre';
              else if (currentClass === 'Mago Branco') newClass = 'Mago Branco Superior';
              else if (currentClass === 'Mago Negro') newClass = 'Mago Negro Superior';
              else if (currentClass === 'Mago Vermelho') newClass = 'Mago Vermelho Superior';
              else if (currentClass === 'Cavalheiro') newClass = 'Cavaleiro';
              else if (currentClass === 'Arqueiro') newClass = 'Ninja';
              else if (currentClass === 'Lutador') newClass = 'Mestre';
              else if (currentClass === 'Mago') newClass = 'Mago Negro Superior';
              else if (currentClass === 'Alquimista') newClass = 'Mago Vermelho Superior';

              const upgradedMaxHp = h.stats.maxHp + 30;
              const upgradedMaxMp = h.stats.maxMp + 20;
              const upgradedVigor = (h.stats.vigor || 16) + 4;
              const upgradedMagPwr = (h.stats.magPwr || 12) + 4;
              const upgradedDef = (h.stats.def || 14) + 4;
              const upgradedMagDef = (h.stats.magDef || 12) + 4;
              const upgradedVel = (h.stats.vel || 10) + 2;
              const upgradedBatPwr = (h.stats.batPwr || 20) + 6;

              return {
                 ...h,
                 heroClass: newClass,
                 stats: {
                    ...h.stats,
                    hp: upgradedMaxHp,
                    maxHp: upgradedMaxHp,
                    mp: upgradedMaxMp,
                    maxMp: upgradedMaxMp,
                    vigor: upgradedVigor,
                    magPwr: upgradedMagPwr,
                    def: upgradedDef,
                    magDef: upgradedMagDef,
                    vel: upgradedVel,
                    batPwr: upgradedBatPwr,
                    for: upgradedVigor,
                    int: upgradedMagPwr
                 }
              };
           });
        }

        const updatedParty = workingParty.map((hero, i) => {
           let newExp = hero.exp + expGain;
           let newLevel = hero.level;
           let newStats = { ...hero.stats };
           
           // If we have finalParty state from combat, preserve current HP/MP and debuffs
           const combatUnit = finalParty ? finalParty[i] : null;
           let currentHp = combatUnit ? combatUnit.stats.hp : hero.stats.hp;
           let currentMp = combatUnit ? combatUnit.stats.mp : hero.stats.mp;
           let currentDebuffs = combatUnit ? combatUnit.debuffs : hero.debuffs;

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
              currentHp = newStats.maxHp;
              currentMp = newStats.maxMp;
           }

           // Defeated team member recovers with at least 1 HP
           const recoveredHp = currentHp <= 0 ? 1 : Math.min(newStats.maxHp, currentHp + 20);

           return {
              ...hero,
              exp: newExp,
              level: newLevel,
              stats: { ...newStats, hp: recoveredHp, mp: currentMp },
              debuffs: currentDebuffs
           };
        });

        if (anyLeveledUp) {
           soundFX.playLevelUp();
        }

        const invToUse = finalInv ? { items: finalInv } : prev.inventory;

        const updatedPlayer: Player = {
           ...prev,
           gold: prev.gold + reward,
           party: updatedParty,
           inventory: invToUse,
           storyFlags: currentStoryFlags,
           artifacts: currentArtifacts
        };

        // Persist victory state immediately
        try {
           const dataToSave = {
              player: updatedPlayer,
              mapId,
              overworldPos,
              artifacts: artifacts.filter(a => !currentArtifacts.includes(a.id)),
              totalSteps,
              playTimeSeconds
           };
           localStorage.setItem('eldoria_save', JSON.stringify(dataToSave));
           setHasSave(true);
        } catch (e) {
           console.error('Auto save error:', e);
        }

        return updatedPlayer;
     });
     setGameState('EXPLORATION');
  };

  const handleCombatEscape = (finalParty?: CombatUnit[], finalInv?: any[]) => {
     stepsSinceEncounter.current = 0;
     setPlayer(prev => {
        const partyToUse = finalParty && finalParty.length > 0
          ? prev.party.map((hero, i) => {
              const combatUnit = finalParty[i];
              if (combatUnit) {
                return {
                  ...hero,
                  stats: {
                    ...hero.stats,
                    hp: combatUnit.stats.hp <= 0 ? 1 : combatUnit.stats.hp,
                    mp: combatUnit.stats.mp
                  },
                  debuffs: combatUnit.debuffs || []
                };
              }
              return hero;
            })
          : prev.party.map(hero => ({
              ...hero,
              stats: {
                ...hero.stats,
                hp: hero.stats.hp <= 0 ? 1 : hero.stats.hp
              }
            }));

        const invToUse = finalInv ? { items: finalInv } : prev.inventory;

        return {
          ...prev,
          party: partyToUse,
          inventory: invToUse
        };
     });
     setGameState('EXPLORATION');
  };

  const handleCombatDefeat = (finalParty?: CombatUnit[], finalInv?: any[]) => {
     stepsSinceEncounter.current = 0;
     if (finalParty) {
        setPlayer(prev => ({
           ...prev,
           party: prev.party.map((hero, i) => {
              const u = finalParty[i];
              return u ? { ...hero, stats: { ...hero.stats, hp: u.stats.hp, mp: u.stats.mp }, debuffs: u.debuffs || [] } : hero;
           }),
           inventory: finalInv ? { items: finalInv } : prev.inventory
        }));
     }
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

  const handleTeachSpell = (spellId: string, heroId: string, price: number) => {
    if (player.gold < price) return;
    setPlayer(prev => {
      const updatedParty = prev.party.map(hero => {
        if (hero.id === heroId) {
          const currentMagics = hero.magics || [];
          if (!currentMagics.includes(spellId)) {
            return { ...hero, magics: [...currentMagics, spellId] };
          }
        }
        return hero;
      });
      return {
        ...prev,
        gold: prev.gold - price,
        party: updatedParty
      };
    });
  };

  const handleBuyWeaponInToolsmith = (weapon: Weapon, targetHeroIndex: number): boolean => {
    const price = weapon.damage * 18;
    if (player.gold < price) return false;

    setPlayer(prev => {
      const updatedParty = [...prev.party];
      if (updatedParty[targetHeroIndex]) {
        updatedParty[targetHeroIndex] = {
          ...updatedParty[targetHeroIndex],
          weapon
        };
      }
      return {
        ...prev,
        gold: prev.gold - price,
        party: updatedParty
      };
    });
    soundFX.playEquip();
    return true;
  };

  const handleRestAtInn = () => {
    setPlayer(prev => ({
      ...prev,
      party: prev.party.map(hero => ({
        ...hero,
        stats: {
          ...hero.stats,
          hp: hero.stats.maxHp,
          mp: hero.stats.maxMp
        }
      }))
    }));
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden font-sans text-slate-200">
      <div className="relative bg-slate-950 overflow-hidden" style={{ width: 1024, height: 768, transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <AnimatePresence mode="wait">
      
      {gameState === 'LOADING' && (
        <motion.div key="loading" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
          <LoadingScreen onComplete={() => setGameState('START_MENU')} />
        </motion.div>
      )}

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
          <PrologueIntro
            party={player.party}
            onComplete={() => {
              setPlayer(prev => ({
                ...prev,
                storyFlags: { ...(prev.storyFlags || {}), intro_world: true }
              }));
              setGameState('EXPLORATION');
            }}
          />
        </motion.div>
      )}

      {gameState === 'EXPLORATION' && (
        <motion.div key="expl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center">
         {saveMessage && !activeCutscene && <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-black uppercase px-6 py-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.8)] z-50 animate-bounce">{saveMessage}</div>}
         <Exploration 
           mapId={mapId}
           player={player} 
           enemies={enemies} 
           artifacts={artifacts.filter(a => a.mapId === mapId)} 
           onMove={handleMove} 
           onInteract={handleInteract}
           onEquipWeapon={handleEquipWeapon}
           isMenuOpen={isMenuOpen || !!activeTownNpc || isToolsmithOpen || isInnOpen || !!treasureModal}
           onToggleMenu={() => setIsMenuOpen(prev => !prev)}
           isCutsceneActive={!!activeCutscene}
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
           onTeachSpell={handleTeachSpell}
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
            playerUnits={player.party.map(hero => ({ 
              ...hero, 
              stats: { ...hero.stats, hp: hero.stats.hp <= 0 ? 1 : hero.stats.hp },
              isPlayer: true, 
              x: 0, 
              y: 0, 
              hasMoved: false, 
              hasActed: false 
            }))}
            enemyUnits={combatEnemies.map(e => ({ ...e, isPlayer: false, hasMoved: false, hasActed: false }))}
            inventory={player.inventory.items}
            onUpdateInventory={(updatedInv) => {
              setPlayer(p => ({ ...p, inventory: { items: updatedInv } }));
            }}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
            onEscape={handleCombatEscape}
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
            Voce derrotou Chaos e restaurou o equilibrio elemental de Eldoria!
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

      {/* In-Game Cutscene Dialog Overlay */}
      {activeCutscene && (
        <CutsceneDialog 
          cutscene={activeCutscene} 
          onClose={() => {
            if (activeCutscene.onComplete) {
              activeCutscene.onComplete();
            } else {
              setActiveCutscene(null);
            }
          }} 
        />
      )}

      {/* Treasure Chest Loot Modal Overlay */}
      {treasureModal && (
        <TreasureModal 
          title={treasureModal.title}
          message={treasureModal.message}
          onClose={() => setTreasureModal(null)}
        />
      )}

      {/* Town NPC Dialog Modal */}
      {activeTownNpc && (
        <TownDialogModal
          npc={activeTownNpc}
          onClose={() => setActiveTownNpc(null)}
        />
      )}

      {/* Toolsmith Weapon Shop Modal */}
      {isToolsmithOpen && (
        <ToolsmithModal
          party={player.party}
          gold={player.gold}
          availableWeapons={TOWNS_CONFIG[currentTownId]?.toolsmithWeapons || []}
          onBuyWeapon={handleBuyWeaponInToolsmith}
          onClose={() => setIsToolsmithOpen(false)}
        />
      )}

      {/* Inn Resting Modal */}
      {isInnOpen && (
        <InnModal
          townName={TOWNS_CONFIG[currentTownId]?.name || 'Estalagem'}
          party={player.party}
          onRest={handleRestAtInn}
          onClose={() => setIsInnOpen(false)}
        />
      )}
      </div>
    </div>
  );
}
