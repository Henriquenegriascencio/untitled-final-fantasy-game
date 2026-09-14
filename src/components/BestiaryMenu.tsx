import React, { useState, useEffect, useMemo } from 'react';
import { BESTIARY_CATALOG, BestiaryEntry } from '../utils/bestiaryData';
import { EnemyPortrait } from './HeroPortrait';
import { soundFX } from '../utils/audio';

interface BestiaryMenuProps {
  onBack: () => void;
  defeatedEnemies?: string[];
}

type BestiaryCategory = 'TODOS' | 'COMUNS' | 'CHEFES' | 'LENDARIOS';

export const BestiaryMenu: React.FC<BestiaryMenuProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<BestiaryCategory>('TODOS');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const categories: BestiaryCategory[] = ['TODOS', 'COMUNS', 'CHEFES', 'LENDARIOS'];

  // Filter entries based on active category
  const filteredCatalog: BestiaryEntry[] = useMemo(() => {
    if (activeCategory === 'TODOS') return BESTIARY_CATALOG;
    if (activeCategory === 'COMUNS') return BESTIARY_CATALOG.filter(e => e.category === 'COMUM');
    if (activeCategory === 'CHEFES') return BESTIARY_CATALOG.filter(e => e.category === 'CHEFE');
    if (activeCategory === 'LENDARIOS') return BESTIARY_CATALOG.filter(e => e.category === 'LENDARIO');
    return BESTIARY_CATALOG;
  }, [activeCategory]);

  const selectedEnemy: BestiaryEntry | undefined = filteredCatalog[selectedIndex] || filteredCatalog[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        soundFX.playCancel();
        onBack();
        return;
      }

      // Cycle category with Q / E
      if (e.key === 'q' || e.key === 'Q') {
        soundFX.playCursor();
        setActiveCategory(prev => {
          const idx = categories.indexOf(prev);
          const nextIdx = (idx - 1 + categories.length) % categories.length;
          return categories[nextIdx];
        });
        setSelectedIndex(0);
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        soundFX.playCursor();
        setActiveCategory(prev => {
          const idx = categories.indexOf(prev);
          const nextIdx = (idx + 1) % categories.length;
          return categories[nextIdx];
        });
        setSelectedIndex(0);
        return;
      }

      // Vertical list navigation
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        soundFX.playCursor();
        setSelectedIndex(prev => (prev - 1 + filteredCatalog.length) % filteredCatalog.length);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        soundFX.playCursor();
        setSelectedIndex(prev => (prev + 1) % filteredCatalog.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        soundFX.playCursor();
        setActiveCategory(prev => {
          const idx = categories.indexOf(prev);
          const nextIdx = (idx - 1 + categories.length) % categories.length;
          return categories[nextIdx];
        });
        setSelectedIndex(0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        soundFX.playCursor();
        setActiveCategory(prev => {
          const idx = categories.indexOf(prev);
          const nextIdx = (idx + 1) % categories.length;
          return categories[nextIdx];
        });
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCatalog.length, categories, onBack]);

  return (
    <div
      id="ff6_bestiary_screen"
      className="absolute inset-0 rounded-lg border-2 border-slate-300 p-3 md:p-5 z-40 flex flex-col font-mono uppercase font-black overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(to bottom, #1d2b7a 0%, #0d1645 50%, #050824 100%)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-blue-400/40 pb-2.5 mb-2.5 shrink-0">
        <button
          id="ff6_bestiary_back_btn"
          onClick={() => {
            soundFX.playCancel();
            onBack();
          }}
          className="text-yellow-400 hover:text-white font-mono font-black text-lg md:text-xl flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>◄</span>
          <span>VOLTAR</span>
        </button>

        <div className="text-white text-xl md:text-2xl font-black uppercase tracking-wider">
          BESTIARIO
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5">
          {categories.map(cat => {
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                id={`ff6_bestiary_tab_${cat.toLowerCase()}`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded text-sm md:text-base font-black transition-colors cursor-pointer ${
                  isCatActive
                    ? 'bg-blue-600 text-yellow-300 border border-yellow-400'
                    : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Column: Simple Enemy List */}
        <div
          id="ff6_bestiary_enemy_list"
          className="col-span-4 rounded border border-blue-500/40 p-2 bg-black/40 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar"
        >
          {filteredCatalog.map((enemy, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={enemy.id}
                id={`ff6_bestiary_item_${enemy.id}`}
                onClick={() => {
                  soundFX.playCursor();
                  setSelectedIndex(idx);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors cursor-pointer text-sm md:text-base ${
                  isSelected
                    ? 'bg-blue-600 text-white font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="w-4 shrink-0 text-yellow-400 text-base">
                  {isSelected ? '►' : ' '}
                </span>
                <span className="truncate flex-1 font-bold">
                  {enemy.name}
                </span>
                <span className="text-xs md:text-sm text-cyan-300 shrink-0 font-normal">
                  HP {enemy.hp}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Clean Dossier */}
        {selectedEnemy && (
          <div
            id="ff6_bestiary_dossier"
            className="col-span-8 rounded border border-blue-500/40 p-3.5 bg-black/40 flex flex-col justify-between overflow-y-auto custom-scrollbar gap-3 text-sm md:text-base"
          >
            {/* Header: Portrait + Basic Identity */}
            <div className="flex items-center gap-3.5 pb-2.5 border-b border-blue-400/30">
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded border border-slate-400 bg-slate-950 p-1">
                <EnemyPortrait enemyType={selectedEnemy.id} className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl md:text-2xl font-black text-white truncate">
                    {selectedEnemy.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-950 border border-blue-400 text-yellow-300 shrink-0">
                    {selectedEnemy.category}
                  </span>
                </div>

                <div className="text-yellow-400 text-sm md:text-base mt-1 font-normal truncate">
                  * {selectedEnemy.subtitle} *
                </div>

                <div className="flex items-center gap-5 text-sm md:text-base text-cyan-300 mt-1.5 font-normal">
                  <span>EXP: {selectedEnemy.exp}</span>
                  <span>OURO: {selectedEnemy.gold} GP</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-6 gap-2 bg-black/50 p-2.5 rounded border border-slate-700 text-center">
              <div>
                <div className="text-slate-400 text-xs md:text-sm">HP</div>
                <div className="text-green-400 font-bold text-base md:text-lg">{selectedEnemy.hp}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs md:text-sm">MP</div>
                <div className="text-cyan-400 font-bold text-base md:text-lg">{selectedEnemy.mp}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs md:text-sm">ATK</div>
                <div className="text-yellow-400 font-bold text-base md:text-lg">{selectedEnemy.attack}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs md:text-sm">DEF</div>
                <div className="text-white font-bold text-base md:text-lg">{selectedEnemy.defense}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs md:text-sm">M.DEF</div>
                <div className="text-purple-300 font-bold text-base md:text-lg">{selectedEnemy.magDef}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs md:text-sm">VEL</div>
                <div className="text-orange-400 font-bold text-base md:text-lg">{selectedEnemy.speed}</div>
              </div>
            </div>

            {/* Info Lines */}
            <div className="flex flex-col gap-1.5 text-sm md:text-base">
              <div>
                <span className="text-yellow-400 font-black">HABITAT: </span>
                <span className="text-slate-200 font-normal">{selectedEnemy.habitat}</span>
              </div>
              <div>
                <span className="text-red-400 font-black">FRAQUEZA: </span>
                <span className="text-slate-200 font-normal">{selectedEnemy.weakness}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-black">DROPS: </span>
                <span className="text-slate-200 font-normal">{selectedEnemy.drops}</span>
              </div>
            </div>

            {/* Sarcastic Lore Description */}
            <div className="bg-blue-950/60 p-3 rounded border border-blue-500/30 flex flex-col gap-1.5">
              <div className="text-yellow-400 text-sm md:text-base font-bold">
                ► RELATORIO DE BATALHA:
              </div>
              <p className="text-slate-100 text-sm md:text-base leading-relaxed font-normal">
                {selectedEnemy.sarcasticLore}
              </p>
            </div>

            {/* Parody Battle Tip */}
            <div className="bg-black/40 p-2.5 rounded border border-amber-600/40 flex items-start gap-2 text-sm md:text-base">
              <span className="text-yellow-400 font-bold shrink-0">DICA:</span>
              <p className="text-amber-200/95 font-normal leading-snug">
                {selectedEnemy.parodyTip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
