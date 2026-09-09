import React, { useState } from 'react';
import { HeroClass, Hero, Weapon } from '../types';
import { HeroPortrait } from './HeroPortrait';

type CharacterCreationProps = {
  onComplete: (party: Hero[]) => void;
};

const CLASS_INFO: Record<HeroClass, { emoji: string, weapon: Weapon, stats: any }> = {
  Cavalheiro: {
    emoji: '',
    weapon: { id: 'w_sword', name: 'Espada Longa', type: 'espada', range: 1, damage: 15 },
    stats: { hp: 120, maxHp: 120, mp: 20, maxMp: 20, sp: 0, maxSp: 100, for: 15, int: 5, def: 12, mov: 3, vel: 5 }
  },
  Mago: {
    emoji: '',
    weapon: { id: 'w_staff', name: 'Cajado de Aprendiz', type: 'cajado', range: 3, damage: 8, aoe: true },
    stats: { hp: 60, maxHp: 60, mp: 100, maxMp: 100, sp: 0, maxSp: 100, for: 3, int: 18, def: 4, mov: 3, vel: 6 }
  },
  Alquimista: {
    emoji: '',
    weapon: { id: 'w_flask', name: 'Frasco Quimico', type: 'ferramenta', range: 2, damage: 10 },
    stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, sp: 0, maxSp: 100, for: 6, int: 14, def: 8, mov: 3, vel: 7 }
  },
  Arqueiro: {
    emoji: '',
    weapon: { id: 'w_bow', name: 'Arco Curto', type: 'arco', range: 4, damage: 12 },
    stats: { hp: 75, maxHp: 75, mp: 30, maxMp: 30, sp: 0, maxSp: 100, for: 12, int: 6, def: 6, mov: 4, vel: 9 }
  },
  Lutador: {
    emoji: '',
    weapon: { id: 'w_fist', name: 'Luvas de Couro', type: 'punho', range: 1, damage: 10 },
    stats: { hp: 100, maxHp: 100, mp: 40, maxMp: 40, sp: 0, maxSp: 100, for: 14, int: 4, def: 10, mov: 5, vel: 12 }
  },
  Inventor: {
    emoji: '',
    weapon: { id: 'w_wrench', name: 'Chave Inglesa', type: 'ferramenta', range: 1, damage: 14 },
    stats: { hp: 90, maxHp: 90, mp: 50, maxMp: 50, sp: 0, maxSp: 100, for: 10, int: 12, def: 10, mov: 4, vel: 6 }
  }
};

const FFWindow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={`rounded-lg border-[4px] border-slate-200 p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] ${className}`}
    style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
  >
    <div className="h-full w-full flex flex-col items-center justify-between">
      {children}
    </div>
  </div>
);

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const [party, setParty] = useState<(Hero | null)[]>([null, null, null, null]);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  
  const [currentName, setCurrentName] = useState('');
  const [currentClass, setCurrentClass] = useState<HeroClass>('Cavalheiro');

  const isClassTaken = (cls: HeroClass) => {
    return party.some((h, i) => h && h.heroClass === cls && i !== editingSlot);
  };
  
  const getFirstAvailableClass = (): HeroClass => {
    const all = Object.keys(CLASS_INFO) as HeroClass[];
    for (const c of all) {
      if (!isClassTaken(c)) return c;
    }
    return 'Cavalheiro';
  };

  const handleSlotClick = (index: number) => {
    setEditingSlot(index);
    if (party[index]) {
      setCurrentName(party[index]!.name);
      setCurrentClass(party[index]!.heroClass);
    } else {
      setCurrentName('');
      setCurrentClass(getFirstAvailableClass());
    }
  };

  const handleSaveHero = () => {
    if (editingSlot === null) return;
    if (!currentName.trim()) return;

    const info = CLASS_INFO[currentClass];
    const newHero: Hero = {
      id: `hero_${Date.now()}_${editingSlot}`,
      name: currentName.substring(0, 8), // FF1 style short names
      heroClass: currentClass,
      level: 1,
      exp: 0,
      stats: { ...info.stats },
      weapon: { ...info.weapon },
      emoji: info.emoji,
      magics: ['Fogo', 'Cura']
    };

    const newParty = [...party];
    newParty[editingSlot] = newHero;
    setParty(newParty);
    setEditingSlot(null);
  };

  const handleStart = () => {
    const finalParty = party.filter(h => h !== null) as Hero[];
    if (finalParty.length === 4) {
      onComplete(finalParty);
    }
  };

  const allFilled = party.every(h => h !== null);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-2 md:p-4 font-mono select-none z-50 overflow-hidden">
      <h1 className="text-white text-2xl md:text-4xl font-black uppercase tracking-widest mb-2 md:mb-4 text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
        Escolha a sua equipe
      </h1>
      
      {/* 2x2 Grid of Characters */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 w-full max-w-xl px-2">
        {party.map((hero, idx) => (
          <div 
            key={idx} 
            className="cursor-pointer transform hover:scale-105 transition-transform"
            onClick={() => handleSlotClick(idx)}
          >
            <FFWindow className="aspect-square w-full max-h-48 md:max-h-56 mx-auto p-2 md:p-3 flex flex-col justify-center">
              {hero ? (
                <>
                  <div className="text-white text-base md:text-xl uppercase font-black tracking-wider text-center mt-0.5">
                    {hero.heroClass}
                  </div>
                  
                  {/* High-detail character bust */}
                  <div className="my-auto relative flex items-center justify-center py-1">
                    <HeroPortrait
                      heroClass={hero.heroClass}
                      emoji={hero.emoji}
                      name={hero.name}
                      hideBadge={true}
                      className="w-16 h-16 md:w-24 md:h-24 rounded-xl border-[3px] border-slate-100 shadow-[inset_0_0_0_2px_#000,0_8px_16px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="text-amber-400 text-lg md:text-2xl font-black tracking-widest mb-1 drop-shadow-md text-center">
                    {hero.name}
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-1 md:gap-2 border-2 border-dashed border-slate-500/70 rounded-lg p-2 group hover:border-yellow-400 transition-colors">
                  <span className="text-yellow-400 text-[26px] leading-[12px] font-black select-none">►</span>
                  <div className="text-slate-300 group-hover:text-white text-[23px] tracking-widest font-black uppercase text-center transition-colors">
                    Heroi {idx + 1}
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Criar</span>
                  </div>
                </div>
              )}
            </FFWindow>
          </div>
        ))}
      </div>

      {/* Start Button */}
      {allFilled && editingSlot === null && (
        <button 
          onClick={handleStart}
          className="px-6 py-2.5 border-4 border-slate-200 text-white font-mono font-black text-xl md:text-2xl uppercase tracking-widest hover:bg-white/20 hover:text-yellow-300 transition-colors rounded-lg shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-pulse mt-1 md:mt-2"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          <span className="text-yellow-400">►</span> Aventura <span className="text-yellow-400">◄</span>
        </button>
      )}

      {/* Editor Modal */}
      {editingSlot !== null && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div 
            className="w-full max-w-2xl max-h-full my-auto rounded-lg border-[4px] border-slate-200 p-3 md:p-6 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-400/60 pb-2 mb-3 shrink-0">
              <div className="text-yellow-400 text-xl md:text-3xl tracking-widest flex items-center gap-2">
                <span>►</span>
                <span>Criar Heroi {editingSlot + 1}</span>
              </div>
              <div className="text-slate-300 text-xs tracking-wider">
                [Nome & Foto]
              </div>
            </div>
            
            {/* Content: 2-column layout matching Combat HUD Action Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch min-h-0 overflow-y-auto custom-scrollbar pb-1">
              {/* Left Box: Portrait & Name Only */}
              <div 
                className="rounded-lg border-[3px] border-slate-300 p-3 flex flex-col items-center justify-center gap-2 shadow-[inset_0_0_0_1px_#000] bg-black/40"
              >
                <div className="text-slate-300 text-[10px] md:text-xs tracking-wider uppercase font-bold">
                  Retrato
                </div>

                <HeroPortrait
                  heroClass={currentClass}
                  hideBadge={true}
                  name={currentName || 'HEROI'}
                  className="w-20 h-20 md:w-32 md:h-32 rounded-xl border-[3px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_8px_16px_rgba(0,0,0,0.8)]"
                />

                <div className="text-yellow-400 text-lg md:text-2xl font-black tracking-widest uppercase mt-1">
                  {currentClass}
                </div>

                {/* Name Input */}
                <div className="w-full mt-1">
                  <label className="text-slate-300 text-[10px] md:text-xs uppercase tracking-wider block mb-1 font-bold">
                    Nome (Max 8 Letras):
                  </label>
                  <div className="flex items-center bg-black/70 border-2 border-slate-300 rounded px-2 py-1 focus-within:border-yellow-400 shadow-[inset_0_0_0_1px_#000]">
                    <span className="text-yellow-400 text-lg mr-2 font-black select-none">►</span>
                    <input 
                      type="text" 
                      value={currentName}
                      onChange={e => {
                        const val = e.target.value.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
                        setCurrentName(val.toUpperCase());
                      }}
                      maxLength={8}
                      className="bg-transparent text-white text-lg md:text-xl outline-none font-mono font-black tracking-widest uppercase w-full placeholder:text-slate-600"
                      placeholder="HEROI"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Right Box: Class Menu (Styled exactly like Combat Action Menu) */}
              <div 
                className="rounded-lg border-[3px] border-slate-300 p-2 md:p-3 flex flex-col justify-between shadow-[inset_0_0_0_1px_#000] bg-black/40 min-h-0"
              >
                <div className="text-slate-300 text-[10px] md:text-xs tracking-wider uppercase mb-1 px-1 font-bold shrink-0">
                  Classe
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {(Object.keys(CLASS_INFO) as HeroClass[]).map(cls => {
                    const isSelected = currentClass === cls;
                    const taken = isClassTaken(cls);
                    return (
                      <button
                        key={cls}
                        onClick={() => setCurrentClass(cls)}
                        disabled={taken}
                        className={`flex items-center text-left hover:bg-white/20 px-2 py-1 rounded transition-all font-mono uppercase font-black text-sm md:text-lg ${
                          isSelected 
                            ? 'text-yellow-300 bg-white/10 ring-1 ring-yellow-400/50' 
                            : 'text-white'
                        } ${taken ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <span className="w-5 shrink-0 text-yellow-400 font-black text-lg select-none">
                          {isSelected ? '►' : ''}
                        </span>
                        <HeroPortrait
                          heroClass={cls}
                          hideBadge={true}
                          className="w-6 h-6 rounded border border-slate-300 shadow shrink-0 mr-2 overflow-hidden"
                        />
                        <span className="tracking-wider flex-1 truncate">{cls}</span>
                        {taken && (
                          <span className="text-[9px] text-slate-400 font-normal ml-1 shrink-0">
                            (USADO)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] md:text-[11px] text-slate-400 text-center tracking-wide shrink-0">
                  Selecione a classe desejada
                </div>
              </div>
            </div>

            {/* Bottom Controls (Combat Action Menu Style) */}
            <div className="flex justify-between items-center border-t-2 border-slate-400/60 pt-3 mt-3 w-full shrink-0">
              <button 
                onClick={() => setEditingSlot(null)}
                className="flex items-center gap-1.5 hover:bg-white/20 px-3 py-1.5 rounded text-slate-300 hover:text-white uppercase font-black text-base md:text-lg transition-colors"
              >
                <span className="text-yellow-400">◄</span> Voltar
              </button>
              <button 
                onClick={handleSaveHero}
                disabled={!currentName.trim()}
                className="flex items-center gap-1.5 hover:bg-white/20 px-4 py-1.5 rounded text-yellow-400 hover:text-white uppercase font-black text-base md:text-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span>►</span> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

