import React, { useEffect, useRef, useState } from 'react';
import { MapId, EnemyType } from '../types';
import { MAPS } from '../constants';

export type MinimapMode = 'corner' | 'expanded' | 'hidden';

interface MinimapOverlayProps {
  mapId: MapId;
  playerPos: { x: number; y: number };
  enemies?: { id: string; x: number; y: number; type: EnemyType }[];
  artifacts?: { id: string; x: number; y: number }[];
  openedChests?: string[];
  isMenuOpen?: boolean;
}

const MAP_NAMES: Record<string, string> = {
  OVERWORLD: 'MAPA MUNDI - ELDORIA',
  TOWN_CORNELIA: 'CIDADE DE CORNELIA',
  TOWN_PRAVOCA: 'PORTO DE PRAVOCA',
  TOWN_GAIA: 'ALDEIA DE GAIA',
  DUNGEON_PRELUDIO_1: 'CAVERNA DO PRELUDIO - P1',
  DUNGEON_PRELUDIO_2: 'CAVERNA DO PRELUDIO - P2 - CHEFE',
  DUNGEON_DESAFIO_1: 'CIDADELA DOS DESAFIOS - P1',
  DUNGEON_DESAFIO_2: 'CIDADELA DOS DESAFIOS - P2 - CHEFE',
  DUNGEON_TERRA_1: 'SANTUARIO DA TERRA - P1',
  DUNGEON_TERRA_2: 'SANTUARIO DA TERRA - P2 - CRISTAL',
  DUNGEON_TERRA: 'SANTUARIO DA TERRA',
  DUNGEON_FOGO_1: 'MONTE GULG - P1',
  DUNGEON_FOGO_2: 'MONTE GULG - P2 - CRISTAL',
  DUNGEON_FOGO: 'MONTE GULG',
  DUNGEON_AGUA_1: 'SANTUARIO SUBMERSO - P1',
  DUNGEON_AGUA_2: 'SANTUARIO SUBMERSO - P2 - CRISTAL',
  DUNGEON_AGUA: 'SANTUARIO SUBMERSO',
  DUNGEON_AR_1: 'TORRE DA MIRAGEM - P1',
  DUNGEON_AR_2: 'TORRE DA MIRAGEM - P2',
  DUNGEON_AR_3: 'TORRE DA MIRAGEM - PINACULO',
  DUNGEON_AR: 'TORRE DA MIRAGEM',
  DUNGEON_FINAL_1: 'TEMPLO DO CAOS - ENTRADA',
  DUNGEON_FINAL_2: 'TEMPLO DO CAOS - CAMARA',
  DUNGEON_FINAL_3: 'TEMPLO DO CAOS - TRONO FINAL',
};

export const MinimapOverlay: React.FC<MinimapOverlayProps> = ({
  mapId,
  playerPos,
  enemies = [],
  artifacts = [],
  openedChests = [],
  isMenuOpen = false,
}) => {
  const [mode, setMode] = useState<MinimapMode>('corner');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef(0);

  const currentMap = MAPS[mapId] || [];
  const mapHeight = currentMap.length;
  const mapWidth = mapHeight > 0 ? currentMap[0].length : 0;
  const isLargeMap = mapWidth > 45 || mapHeight > 45;

  // Keyboard shortcut: Tab or N to toggle minimap modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen) return;
      if (e.key === 'Tab' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setMode((prev) => {
          if (prev === 'corner') return 'expanded';
          if (prev === 'expanded') return 'hidden';
          return 'corner';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Minimap rendering loop
  useEffect(() => {
    if (mode === 'hidden' || !currentMap || mapWidth === 0 || mapHeight === 0) return;

    let animId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      pulseRef.current = time;
      const pulse = (Math.sin(time * 0.006) + 1) / 2; // 0 to 1

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Background
      ctx.fillStyle = '#050c1e';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (isLargeMap && mode === 'corner') {
        // RADAR / VIEWPORT FOCUSED ON PLAYER FOR HUGE OVERWORLD MAPS
        const viewTileRadiusX = 18;
        const viewTileRadiusY = 14;
        const startTileX = Math.max(0, Math.min(mapWidth - viewTileRadiusX * 2, Math.floor(playerPos.x - viewTileRadiusX)));
        const startTileY = Math.max(0, Math.min(mapHeight - viewTileRadiusY * 2, Math.floor(playerPos.y - viewTileRadiusY)));
        const endTileX = Math.min(mapWidth, startTileX + viewTileRadiusX * 2);
        const endTileY = Math.min(mapHeight, startTileY + viewTileRadiusY * 2);

        const tileW = canvasWidth / (endTileX - startTileX);
        const tileH = canvasHeight / (endTileY - startTileY);

        // Draw local tiles
        for (let y = startTileY; y < endTileY; y++) {
          for (let x = startTileX; x < endTileX; x++) {
            const tile = currentMap[y]?.[x];
            const dx = (x - startTileX) * tileW;
            const dy = (y - startTileY) * tileH;

            ctx.fillStyle = getTileColor(tile, mapId);
            ctx.fillRect(dx, dy, tileW + 0.5, tileH + 0.5);
          }
        }

        // Draw Landmarks / POIs
        for (let y = startTileY; y < endTileY; y++) {
          for (let x = startTileX; x < endTileX; x++) {
            const tile = currentMap[y]?.[x];
            const dx = (x - startTileX) * tileW + tileW / 2;
            const dy = (y - startTileY) * tileH + tileH / 2;

            if (['0', '1', '2', '3', '4', '5', '6', 'F', 'C'].includes(tile as string)) {
              ctx.fillStyle = tile === 'C' ? '#facc15' : '#f87171';
              ctx.beginPath();
              ctx.arc(dx, dy, Math.max(3, tileW * 0.7), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Draw Enemies in view
        enemies.forEach((enemy) => {
          if (enemy.x >= startTileX && enemy.x < endTileX && enemy.y >= startTileY && enemy.y < endTileY) {
            const ex = (enemy.x - startTileX) * tileW + tileW / 2;
            const ey = (enemy.y - startTileY) * tileH + tileH / 2;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(ex, ey, Math.max(2.5, tileW * 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw Player blip
        const px = (playerPos.x - startTileX) * tileW + tileW / 2;
        const py = (playerPos.y - startTileY) * tileH + tileH / 2;

        // Pulse radar ring
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(5, tileW * (0.8 + pulse * 0.5)), 0, Math.PI * 2);
        ctx.stroke();

        // Solid player core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(3, tileW * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.8, tileW * 0.35), 0, Math.PI * 2);
        ctx.fill();
      } else {
        // FULL MAP FIT FOR DUNGEONS, TOWNS, OR EXPANDED OVERWORLD
        const scaleX = canvasWidth / mapWidth;
        const scaleY = canvasHeight / mapHeight;
        const tileScale = Math.min(scaleX, scaleY);

        const offsetX = (canvasWidth - mapWidth * tileScale) / 2;
        const offsetY = (canvasHeight - mapHeight * tileScale) / 2;

        // Draw map tiles
        for (let y = 0; y < mapHeight; y++) {
          for (let x = 0; x < mapWidth; x++) {
            const tile = currentMap[y]?.[x];
            const dx = offsetX + x * tileScale;
            const dy = offsetY + y * tileScale;

            ctx.fillStyle = getTileColor(tile, mapId);
            ctx.fillRect(dx, dy, tileScale + 0.4, tileScale + 0.4);

            // Special POI Icons
            if (tile === '<') {
              // Stairs Up / Exit
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(dx + tileScale * 0.15, dy + tileScale * 0.15, tileScale * 0.7, tileScale * 0.7);
            } else if (tile === '>') {
              // Stairs Down
              ctx.fillStyle = '#c084fc';
              ctx.fillRect(dx + tileScale * 0.15, dy + tileScale * 0.15, tileScale * 0.7, tileScale * 0.7);
            } else if (tile === 'X') {
              // Chest
              const chestKey = `${mapId}_${x}_${y}`;
              const isOpened = openedChests.includes(chestKey);
              ctx.fillStyle = isOpened ? '#78350f' : '#facc15';
              ctx.fillRect(dx + tileScale * 0.2, dy + tileScale * 0.2, tileScale * 0.6, tileScale * 0.6);
            } else if (tile === '@') {
              // Boss / Altar
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(dx + tileScale * 0.1, dy + tileScale * 0.1, tileScale * 0.8, tileScale * 0.8);
            } else if (['0', '1', '2', '3', '4', '5', '6', 'F', 'C'].includes(tile as string)) {
              // Landmark / Portal
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.arc(dx + tileScale / 2, dy + tileScale / 2, tileScale * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else if (['P', 'E', 'I', 'H', 'D', 'M'].includes(tile as string)) {
              // Town building
              ctx.fillStyle = '#fb923c';
              ctx.fillRect(dx + tileScale * 0.2, dy + tileScale * 0.2, tileScale * 0.6, tileScale * 0.6);
            }
          }
        }

        // Draw Artifacts
        artifacts.forEach((art) => {
          const ax = offsetX + art.x * tileScale + tileScale / 2;
          const ay = offsetY + art.y * tileScale + tileScale / 2;
          ctx.fillStyle = '#e879f9';
          ctx.beginPath();
          ctx.arc(ax, ay, Math.max(3, tileScale * 0.45), 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Enemies
        enemies.forEach((enemy) => {
          const ex = offsetX + enemy.x * tileScale + tileScale / 2;
          const ey = offsetY + enemy.y * tileScale + tileScale / 2;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ex, ey, Math.max(2.5, tileScale * 0.4), 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Player Marker
        const px = offsetX + playerPos.x * tileScale + tileScale / 2;
        const py = offsetY + playerPos.y * tileScale + tileScale / 2;

        // Outer pulsing halo
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + pulse * 0.6})`;
        ctx.lineWidth = Math.max(1.5, tileScale * 0.3);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(4, tileScale * (0.8 + pulse * 0.5)), 0, Math.PI * 2);
        ctx.stroke();

        // Player Center Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(3, tileScale * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.5, tileScale * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // In expanded mode, draw a subtle grid overlay for clarity
        if (mode === 'expanded') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          for (let x = 0; x <= mapWidth; x += 5) {
            const gx = offsetX + x * tileScale;
            ctx.beginPath();
            ctx.moveTo(gx, offsetY);
            ctx.lineTo(gx, offsetY + mapHeight * tileScale);
            ctx.stroke();
          }
          for (let y = 0; y <= mapHeight; y += 5) {
            const gy = offsetY + y * tileScale;
            ctx.beginPath();
            ctx.moveTo(offsetX, gy);
            ctx.lineTo(offsetX + mapWidth * tileScale, gy);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, mapId, playerPos, enemies, artifacts, openedChests, currentMap, mapWidth, mapHeight, isLargeMap]);

  // If hidden, render small toggle badge
  if (mode === 'hidden') {
    return (
      <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
        <button
          id="minimap_expand_toggle_btn"
          onClick={() => setMode('corner')}
          className="px-3 py-1.5 bg-gradient-to-b from-blue-700 via-blue-900 to-[#050b33] text-white font-mono font-black text-xs md:text-sm rounded-lg border-2 border-slate-300 shadow-[inset_0_0_0_1px_#000,0_4px_10px_rgba(0,0,0,0.8)] flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all uppercase cursor-pointer"
          title="Mostrar Minimapa - TECLA TAB"
        >
          <span className="text-yellow-400">🗺</span>
          <span>MAPA - TAB</span>
        </button>
      </div>
    );
  }

  // EXPANDED / TACTICAL FULLSCREEN OVERLAY
  if (mode === 'expanded') {
    return (
      <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-3 md:p-6 pointer-events-auto select-none backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border-[4px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_10px_30px_rgba(0,0,0,0.95)] font-mono overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #050c1e 100%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-blue-400/50 bg-black/40">
            <div className="flex items-center gap-2.5">
              <span className="text-yellow-400 text-base md:text-lg font-black">🗺</span>
              <div>
                <h3 className="text-white text-sm md:text-base font-black tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {MAP_NAMES[mapId] || mapId}
                </h3>
                <p className="text-slate-300 text-[10px] md:text-xs font-bold">
                  POSICAO ATUAL - X: {Math.floor(playerPos.x)} Y: {Math.floor(playerPos.y)} - AREA: {mapWidth}x{mapHeight}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('corner')}
                className="px-2.5 py-1 bg-blue-700/80 hover:bg-blue-600 text-white text-xs font-black rounded border border-blue-300 transition-all cursor-pointer uppercase shadow"
                title="Minimizar para o canto"
              >
                CANTO - TAB
              </button>
              <button
                onClick={() => setMode('hidden')}
                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-800 text-red-200 hover:text-white text-xs font-black rounded border border-red-500/80 transition-all cursor-pointer uppercase shadow"
                title="Fechar mapa"
              >
                FECHAR - ESC
              </button>
            </div>
          </div>

          {/* Map Display Canvas */}
          <div className="flex-1 flex items-center justify-center p-3 bg-[#020617]/90 min-h-[320px] max-h-[520px] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={720}
              height={460}
              className="w-full h-full max-h-[460px] object-contain rounded-lg border-2 border-slate-700/90 shadow-inner"
            />
          </div>

          {/* Legend and Info Bar */}
          <div className="px-4 py-2 bg-black/60 border-t border-blue-400/30 flex flex-wrap items-center justify-between gap-3 text-[10px] md:text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white shadow-sm inline-block animate-pulse" />
                <span className="font-bold">JOGADOR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="font-bold">INIMIGO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-yellow-400 inline-block rounded-xs" />
                <span className="font-bold">TESOURO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-cyan-400 inline-block rounded-xs" />
                <span className="font-bold">ESCADA / SAIDA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-purple-400 inline-block rounded-xs" />
                <span className="font-bold">DESCIDA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-600 inline-block rounded-xs" />
                <span className="font-bold">CHEFE / GUARDIAO</span>
              </div>
            </div>

            <div className="text-cyan-300 font-bold uppercase tracking-wider text-[10px]">
              Pressione TAB ou N para alternar
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CORNER DOCKED MINIMAP (Default)
  return (
    <div className="absolute bottom-4 right-4 z-30 pointer-events-auto select-none">
      <div
        className="w-52 md:w-60 rounded-xl border-[3px] border-slate-300 shadow-[inset_0_0_0_2px_#000,0_8px_20px_rgba(0,0,0,0.85)] font-mono overflow-hidden transition-all duration-300 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #050c1e 100%)' }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-blue-400/40 bg-black/40">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-yellow-400 text-xs"></span>
            <span className="text-white text-[10px] md:text-xs font-black tracking-wider uppercase truncate">
              {MAP_NAMES[mapId] || mapId}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setMode('expanded')}
              className="text-[10px] px-2 py-0.5 bg-blue-700/80 hover:bg-blue-600 text-white rounded font-black border border-blue-300/80 uppercase cursor-pointer"
              title="Expandir Mapa Geral - TAB"
            >
              +
            </button>
            <button
              onClick={() => setMode('hidden')}
              className="text-[10px] px-2 py-0.5 bg-black/60 hover:bg-red-900/80 text-slate-300 hover:text-white rounded font-black border border-slate-600 uppercase cursor-pointer"
              title="Ocultar Minimapa"
            >
              -
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div 
          onClick={() => setMode('expanded')}
          className="relative bg-[#020617]/90 cursor-pointer p-1 group"
          title="Clique para Expandir o Mapa Tatico"
        >
          <canvas
            ref={canvasRef}
            width={240}
            height={160}
            className="w-full h-32 md:h-36 object-contain rounded border border-slate-800"
          />
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 bg-black/80 border border-cyan-400 text-cyan-300 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow transition-opacity">
              Clique para Expandir
            </span>
          </div>
        </div>

        {/* Footer info: Player Coordinates */}
        <div className="px-2 py-1 bg-black/60 border-t border-blue-400/30 flex items-center justify-between text-[9px] text-slate-300">
          <span className="font-bold text-yellow-300">
            X: {Math.floor(playerPos.x)} Y: {Math.floor(playerPos.y)}
          </span>
          <span className="text-cyan-300 font-bold uppercase">
            TAB Alternar
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper to determine pixel tile colors
function getTileColor(tile: string | undefined, mapId: string): string {
  if (!tile) return '#0f172a';

  switch (tile) {
    case 'M': // Mountain or Rock Wall
      return mapId === 'OVERWORLD' ? '#334155' : '#1e293b';
    case 'W': // Brick/Stone Wall
      return '#334155';
    case '.': // Floor / Ground
      if (mapId === 'OVERWORLD') return '#15803d'; // Green grass
      if (mapId.startsWith('TOWN')) return '#475569'; // Town cobblestone
      return '#64748b'; // Dungeon path
    case '~': // Water / Ocean
      return '#0284c7';
    case 'T': // Forest / Trees
      return '#14532d';
    case 'B': // Bridge / Plank
      return '#78350f';
    case '<': // Stairs Up
      return '#38bdf8';
    case '>': // Stairs Down
      return '#a855f7';
    case 'X': // Treasure Chest
      return '#facc15';
    case '@': // Boss / Altar
      return '#ef4444';
    case 'C': // Town Entrance
      return '#fbbf24';
    case 'H': // House
      return '#3b82f6';
    case 'P': // Potion Shop
      return '#fb923c';
    case 'E': // Equipment Shop
      return '#ea580c';
    case 'I': // Inn
      return '#06b6d4';
    case 'N': // NPC
      return '#a3e635';
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case 'F':
      return '#f87171'; // Dungeon entry point
    default:
      return '#475569';
  }
}
