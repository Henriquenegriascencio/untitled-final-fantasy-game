import React, { useState } from 'react';
import { HeroClass, Hero, Weapon } from '../types';
import { motion } from 'framer-motion';

type CharacterCreationProps = {
  onComplete: (party: Hero[]) => void;
};

const CLASS_INFO: Record<HeroClass, { emoji: string, desc: string, weapon: Weapon, stats: any }> = {
  Cavalheiro: {
    emoji: '⚔️',
    desc: 'Alta defesa e dano corpo-a-corpo.',
    weapon: { id: 'w_sword', name: 'Espada Longa', type: 'espada', range: 1, damage: 15 },
    stats: { hp: 120, maxHp: 120, mp: 20, maxMp: 20, sp: 0, maxSp: 100, for: 15, int: 5, def: 12, mov: 3, vel: 5 }
  },
  Mago: {
    emoji: '🧙',
    desc: 'Ataques magicos a distancia e em area.',
    weapon: { id: 'w_staff', name: 'Cajado de Aprendiz', type: 'cajado', range: 3, damage: 8, aoe: true },
    stats: { hp: 60, maxHp: 60, mp: 100, maxMp: 100, sp: 0, maxSp: 100, for: 3, int: 18, def: 4, mov: 3, vel: 6 }
  },
  Alquimista: {
    emoji: '🧪',
    desc: 'Especialista em itens e magias de suporte.',
    weapon: { id: 'w_flask', name: 'Frasco Quimico', type: 'ferramenta', range: 2, damage: 10 },
    stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, sp: 0, maxSp: 100, for: 6, int: 14, def: 8, mov: 3, vel: 7 }
  },
  Arqueiro: {
    emoji: '🏹',
    desc: 'Ataques fisicos precisos de longe.',
    weapon: { id: 'w_bow', name: 'Arco Curto', type: 'arco', range: 4, damage: 12 },
    stats: { hp: 75, maxHp: 75, mp: 30, maxMp: 30, sp: 0, maxSp: 100, for: 12, int: 6, def: 6, mov: 4, vel: 9 }
  },
  Lutador: {
    emoji: '🥊',
    desc: 'Muito veloz, combos corpo-a-corpo.',
    weapon: { id: 'w_fist', name: 'Luvas de Couro', type: 'punho', range: 1, damage: 10 },
    stats: { hp: 100, maxHp: 100, mp: 40, maxMp: 40, sp: 0, maxSp: 100, for: 14, int: 4, def: 10, mov: 5, vel: 12 }
  },
  Inventor: {
    emoji: '⚙️',
    desc: 'Engenhocas e utilidades de longo alcance.',
    weapon: { id: 'w_wrench', name: 'Chave Inglesa', type: 'ferramenta', range: 1, damage: 14 },
    stats: { hp: 90, maxHp: 90, mp: 50, maxMp: 50, sp: 0, maxSp: 100, for: 10, int: 12, def: 10, mov: 4, vel: 6 }
  }
};


const FFWindow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div 
    className={`rounded-lg border-[4px] border-slate-200 p-2 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] ${className}`}
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

  const isClassTaken = (cls) => {
    return party.some((h, i) => h && h.heroClass === cls && i !== editingSlot);
  };
  
  const getFirstAvailableClass = () => {
    const all = Object.keys(CLASS_INFO);
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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 font-mono select-none z-50">
      <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-widest mb-16 text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">Escolha a sua equipe</h1>
      
      {/* 2x2 Grid of Characters */}
      <div className="grid grid-cols-2 gap-4 md:gap-10 mb-8 w-full max-w-xl px-4 md:px-8">
        {party.map((hero, idx) => (
          <div 
            key={idx} 
            className="cursor-pointer transform hover:scale-105 transition-transform"
            onClick={() => handleSlotClick(idx)}
          >
            <FFWindow className="aspect-square w-full max-h-64 mx-auto">
              {hero ? (
                <>
                  <div className="text-white text-2xl md:text-4xl uppercase font-black mt-2">{hero.heroClass}</div>
                  <div className="text-6xl md:text-8xl my-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{hero.emoji}</div>
                  <div className="text-amber-400 text-3xl md:text-5xl font-black tracking-widest mb-2 drop-shadow-md">{hero.name}</div>
                </>
              ) : (
                <div className="h-full w-full bg-black/50 rounded animate-pulse border border-white/20"></div>
              )}
            </FFWindow>
          </div>
        ))}
      </div>

      {/* Start Button */}
      {allFilled && editingSlot === null && (
        <button 
          onClick={handleStart}
          className="px-8 py-4 border-4 border-slate-200 text-white font-black text-2xl uppercase tracking-widest hover:bg-white hover:text-[#0000a8] transition-colors rounded-lg shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          Aventura
        </button>
      )}

      {/* Editor Modal */}
      {editingSlot !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <FFWindow className="w-full max-w-2xl">
            <h2 className="text-white text-4xl uppercase mb-6 mt-2 font-black border-b-2 border-white/50 pb-2 w-full text-center">
              Criar Heroi
            </h2>
            
            <div className="w-full flex flex-col gap-6 px-4">
              <div className="flex flex-col gap-4">
                <label 
                  className="text-amber-400 uppercase tracking-widest text-[31px] leading-[20px]"
                  style={{ fontSize: '31px', lineHeight: '20px' }}
                >
                  Nome (Max 8)
                </label>
                <input 
                  type="text" 
                  value={currentName}
                  onChange={e => {
                    // Remove emojis using a regex that catches most of them
                    const val = e.target.value.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
                    setCurrentName(val.toUpperCase());
                  }}
                  maxLength={8}
                  className="bg-transparent border-b-2 border-white text-white text-3xl p-2 outline-none font-black tracking-widest uppercase focus:border-amber-400 transition-colors w-full"
                  placeholder="HEROI"
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-amber-400 uppercase tracking-widest text-2xl">Classe</label>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(CLASS_INFO) as HeroClass[]).map(cls => (
                    <button
                      key={cls}
                      onClick={() => setCurrentClass(cls)}
                      disabled={isClassTaken(cls)}
                      className={`p-2 text-left text-xl md:text-2xl font-bold uppercase flex items-center gap-2 border-2 ${currentClass === cls ? 'border-white text-white bg-white/20' : 'border-transparent text-slate-400 hover:text-white'} ${isClassTaken(cls) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-3xl shrink-0">{CLASS_INFO[cls].emoji}</span>
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12 mb-4 w-full px-4">
              <button 
                onClick={() => setEditingSlot(null)}
                className="flex-1 p-4 text-3xl md:text-4xl border-2 border-slate-400 text-slate-400 hover:text-white hover:border-white uppercase font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveHero}
                disabled={!currentName.trim()}
                className="flex-1 p-4 text-3xl md:text-4xl border-2 border-white text-[#0000a8] bg-white hover:bg-amber-400 hover:border-amber-400 uppercase font-black transition-colors disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </FFWindow>
        </div>
      )}
    </div>
  );
};
