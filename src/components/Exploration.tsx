import React, { useEffect, useRef, useState } from 'react';
import { Player, EnemyType, MapTile, MapId } from '../types';
import { MAPS, TILE_SIZE, BOSS } from '../constants';

type ExplorationProps = {
  mapId: MapId;
  player: Player;
  enemies: { id: string; x: number; y: number; emoji: string; type: EnemyType }[];
  artifacts: { id: string; x: number; y: number; emoji: string }[];
  onMove: (dx: number, dy: number) => void;
  onInteract: () => void;
  onEquipWeapon: (wType: string) => void;
};

export const Exploration: React.FC<ExplorationProps> = ({ mapId, player, enemies, artifacts, onMove, onInteract, onEquipWeapon }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRenderPos = useRef({ x: player.x, y: player.y });

  // Keyboard controls
  const lastMoveTime = useRef(0);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && now - lastMoveTime.current < 150) return;
      let moved = false;
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          onMove(0, -1);
          moved = true;
          break;
        case 's':
        case 'ArrowDown':
          onMove(0, 1);
          moved = true;
          break;
        case 'a':
        case 'ArrowLeft':
          onMove(-1, 0);
          moved = true;
          break;
        case 'd':
        case 'ArrowRight':
          onMove(1, 0);
          moved = true;
          break;
        case 'Enter':
        case ' ':
          onInteract();
          break;
      }
      if (moved) lastMoveTime.current = now;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onInteract]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const currentMap = MAPS[mapId];

    const viewW = 1024 / TILE_SIZE;
    const viewH = 768 / TILE_SIZE;

    const render = () => {
      // Interpolate player position for sliding animation
      const dx = player.x - playerRenderPos.current.x;
      const dy = player.y - playerRenderPos.current.y;
      playerRenderPos.current.x += dx * 0.15;
      playerRenderPos.current.y += dy * 0.15;

      // Snap if very close
      if (Math.abs(dx) < 0.01) playerRenderPos.current.x = player.x;
      if (Math.abs(dy) < 0.01) playerRenderPos.current.y = player.y;

      const px = playerRenderPos.current.x;
      const py = playerRenderPos.current.y;

      // Camera Calculation
      const cameraX = Math.max(0, Math.min(currentMap[0].length - viewW, px - Math.floor(viewW / 2)));
      const cameraY = Math.max(0, Math.min(currentMap.length - viewH, py - Math.floor(viewH / 2)));

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Map
      const startX = Math.floor(cameraX);
      const startY = Math.floor(cameraY);
      const offsetX = (cameraX - startX) * TILE_SIZE;
      const offsetY = (cameraY - startY) * TILE_SIZE;

      for (let y = -1; y <= viewH + 1; y++) {
        for (let x = -1; x <= viewW + 1; x++) {
          const mapX = startX + x;
          const mapY = startY + y;
          
          let tile: string | MapTile = 'M';
          if (mapY >= 0 && mapY < currentMap.length && mapX >= 0 && mapX < currentMap[0].length) {
             tile = currentMap[mapY][mapX];
          }
          
          const drawX = x * TILE_SIZE - offsetX;
          const drawY = y * TILE_SIZE - offsetY;

          if (tile === '~') ctx.fillStyle = '#0ea5e9';
          else if (tile === 'M') ctx.fillStyle = '#475569';
          else if (['1','2','3','4'].includes(tile as string)) ctx.fillStyle = '#334155';
          else if (tile === 'F') ctx.fillStyle = player.artifacts.length >= 4 ? '#a855f7' : '#1e293b';
          else if (tile === '<') ctx.fillStyle = '#f59e0b';
          else if (tile === 'S') ctx.fillStyle = '#eab308';
          else ctx.fillStyle = '#22c55e';
          
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

          if (tile === 'M' || tile === '~' || tile === 'C' || ['1','2','3','4','F','<'].includes(tile as string)) {
            ctx.strokeStyle = '#0f172a';
            ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          }

          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (tile === 'C') ctx.fillText('🏠', drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
          if (tile === 'S') ctx.fillText('⭐', drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
          if (['1','2','3','4'].includes(tile as string)) ctx.fillText('🚪', drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
          if (tile === '<') ctx.fillText('🪜', drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
        }
      }

      // Draw Artifacts
      artifacts.forEach(art => {
        if (art.x >= cameraX && art.x < cameraX + viewW && art.y >= cameraY && art.y < cameraY + viewH) {
          ctx.fillText(art.emoji, (art.x - cameraX) * TILE_SIZE + TILE_SIZE / 2, (art.y - cameraY) * TILE_SIZE + TILE_SIZE / 2);
        }
      });

      // Draw Enemies
      enemies.forEach(enemy => {
        if (enemy.x >= cameraX && enemy.x < cameraX + viewW && enemy.y >= cameraY && enemy.y < cameraY + viewH) {
          ctx.fillText(enemy.emoji, (enemy.x - cameraX) * TILE_SIZE + TILE_SIZE / 2, (enemy.y - cameraY) * TILE_SIZE + TILE_SIZE / 2);
        }
      });

      // Draw Player
      ctx.fillText('🧙‍♂️', (px - cameraX) * TILE_SIZE + TILE_SIZE / 2, (py - cameraY) * TILE_SIZE + TILE_SIZE / 2);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [player, enemies, artifacts, mapId]);

  return (
    <div className="absolute inset-0 bg-slate-900 overflow-hidden">
        <canvas
            ref={canvasRef}
            width={1024}
            height={768}
            className="block w-full h-full object-cover"
        />
        
        {/* Simple HUD Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
            {['Fogo', 'Agua', 'Ar', 'Terra'].map(art => (
              <span key={art} className={`px-3 py-1 rounded-full text-sm font-bold shadow-md transition-colors ${player.artifacts.includes(art) ? 'bg-yellow-400 text-yellow-950 shadow-yellow-400/50' : 'bg-slate-800 text-slate-500'}`}>
                {art}
              </span>
            ))}
        </div>
        <div className="absolute top-4 right-4 bg-slate-900/80 p-2 px-4 rounded-lg border border-slate-700 text-white font-bold flex gap-4">
            <span>{mapId === 'OVERWORLD' ? 'Mundo de Eldoria' : 'Masmorra'}</span>
            <span className="text-yellow-400">{player.gold} G</span>
        </div>
        <div className="absolute bottom-4 left-4 bg-slate-900/80 p-2 px-4 rounded-lg border border-slate-700 text-white text-sm">
            Use WASD para mover. Cidades (🏠), Masmorras (🚪).
        </div>
        <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 px-4 rounded-lg border border-slate-700 text-white text-sm">
            Dica: Lute e upe de nível antes de ir para as masmorras.
        </div>
    </div>
  );
};
