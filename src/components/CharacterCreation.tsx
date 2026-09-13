import React, { useState } from 'react';
import { HeroClass, Hero, Weapon } from '../types';
import { HeroPortrait } from './HeroPortrait';

type CharacterCreationProps = {
  onComplete: (party: Hero[]) => void;
};

const CLASS_INFO: Record<string, { emoji: string, weapon: Weapon, stats: any, desc: string, role: string, startingMagics: string[] }> = {
  'Guerreiro': {
    emoji: '',
    desc: 'O tanque do grupo. Possui altissima defesa, usa armaduras pesadas e armas de combate com alto dano fisico.',
    role: 'Tanque e Dano Fisico',
    weapon: { id: 'w_sword_warr', name: 'Espada de Ferro', type: 'espada', range: 1, damage: 24 },
    stats: { hp: 140, maxHp: 140, mp: 10, maxMp: 10, sp: 0, maxSp: 100, batPwr: 32, def: 24, magDef: 12, mBlock: 8, vel: 8, vigor: 26, magPwr: 6, mov: 3, for: 26, int: 6 },
    startingMagics: []
  },
  'Ladrao': {
    emoji: '',
    desc: 'Extremamente rapido e com a mais alta taxa de fuga em batalhas. Torna-se peca-chave estrategica.',
    role: 'Agilidade e Alta Fuga',
    weapon: { id: 'w_dagger_thief', name: 'Adaga de Cobre', type: 'espada', range: 1, damage: 18 },
    stats: { hp: 85, maxHp: 85, mp: 25, maxMp: 25, sp: 0, maxSp: 100, batPwr: 22, def: 12, magDef: 14, mBlock: 16, vel: 18, vigor: 16, magPwr: 10, mov: 4, for: 16, int: 10 },
    startingMagics: []
  },
  'Monge': {
    emoji: '',
    desc: 'Lutador desarmado. Causa alto dano com os punhos (quanto menos armas e armaduras pesadas usar, mais forte fica).',
    role: 'Artes Marciais e Dano Desarmado',
    weapon: { id: 'w_fist_monk', name: 'Punhos Vazios', type: 'punho', range: 1, damage: 26 },
    stats: { hp: 110, maxHp: 110, mp: 30, maxMp: 30, sp: 0, maxSp: 100, batPwr: 30, def: 16, magDef: 12, mBlock: 12, vel: 14, vigor: 25, magPwr: 8, mov: 4, for: 25, int: 8 },
    startingMagics: []
  },
  'Mago Branco': {
    emoji: '',
    desc: 'O curador do grupo. Especialista em magias de restauracao de HP, cura de condicoes e barreiras protetoras.',
    role: 'Cura e Suporte Sagrado',
    weapon: { id: 'w_staff_white', name: 'Maca de Carvalho', type: 'cajado', range: 2, damage: 12 },
    stats: { hp: 70, maxHp: 70, mp: 90, maxMp: 90, sp: 0, maxSp: 100, batPwr: 12, def: 8, magDef: 24, mBlock: 22, vel: 9, vigor: 8, magPwr: 26, mov: 3, for: 8, int: 26 },
    startingMagics: ['Cura', 'Antidoto Magico']
  },
  'Mago Negro': {
    emoji: '',
    desc: 'O especialista em dano magico elemental (Fogo, Gelo, Trovao) e maleficios arcanos para debilitar inimigos.',
    role: 'Dano Magico Elemental',
    weapon: { id: 'w_staff_black', name: 'Cajado Arcano', type: 'cajado', range: 3, damage: 10, aoe: true },
    stats: { hp: 60, maxHp: 60, mp: 110, maxMp: 110, sp: 0, maxSp: 100, batPwr: 10, def: 6, magDef: 26, mBlock: 24, vel: 10, vigor: 6, magPwr: 30, mov: 3, for: 6, int: 30 },
    startingMagics: ['Fogo', 'Gelo', 'Trovao']
  },
  'Mago Vermelho': {
    emoji: '',
    desc: 'Pau para toda obra. Consegue usar armas razoaveis, armaduras intermediarias e aprende tanto magias brancas quanto negras.',
    role: 'Versatil Hibrido',
    weapon: { id: 'w_rapier_red', name: 'Florete de Aco', type: 'espada', range: 1, damage: 20 },
    stats: { hp: 90, maxHp: 90, mp: 65, maxMp: 65, sp: 0, maxSp: 100, batPwr: 22, def: 15, magDef: 18, mBlock: 16, vel: 11, vigor: 18, magPwr: 20, mov: 3, for: 18, int: 20 },
    startingMagics: ['Fogo', 'Cura']
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

// Sanitiza texto para manter estritamente caracteres ASCII sem acento
const cleanAscii = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase();
};

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const [party, setParty] = useState<(Hero | null)[]>([null, null, null, null]);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  
  const [currentName, setCurrentName] = useState('');
  const [currentClass, setCurrentClass] = useState<HeroClass>('Guerreiro');

  const isClassTaken = (cls: HeroClass) => {
    return party.some((h, i) => h && h.heroClass === cls && i !== editingSlot);
  };
  
  const getFirstAvailableClass = (): HeroClass => {
    const all = Object.keys(CLASS_INFO) as HeroClass[];
    for (const c of all) {
      if (!isClassTaken(c)) return c;
    }
    return 'Guerreiro';
  };

  const handleSlotClick = (index: number) => {
    setEditingSlot(index);
    const existing = party[index];
    if (existing) {
      setCurrentName(existing.name);
      setCurrentClass(existing.heroClass);
    } else {
      const autoClass = getFirstAvailableClass();
      setCurrentName('');
      setCurrentClass(autoClass);
    }
  };

  const handleClassChange = (cls: HeroClass) => {
    setCurrentClass(cls);
  };

  const handleSaveHero = () => {
    if (editingSlot === null) return;
    const cleanName = currentName.trim() || `Heroi ${editingSlot + 1}`;

    const info = CLASS_INFO[currentClass] || CLASS_INFO['Guerreiro'];
    const newHero: Hero = {
      id: party[editingSlot]?.id || `hero_${Date.now()}_${editingSlot}`,
      name: cleanName,
      heroClass: currentClass,
      level: 1,
      exp: 0,
      stats: { ...info.stats },
      weapon: { ...info.weapon },
      emoji: info.emoji,
      magics: [...(info.startingMagics || [])]
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
  const filledCount = party.filter(h => h !== null).length;
  const previewName = currentName.trim() || (editingSlot !== null ? `Heroi ${editingSlot + 1}` : 'Heroi');

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-2 md:p-4 font-mono select-none z-50 overflow-hidden">
      {/* 2x2 Grid of Characters */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 w-full max-w-xl px-2">
        {party.map((hero, idx) => (
          <div 
            key={idx} 
            className="cursor-pointer transform hover:scale-105 transition-transform"
            onClick={() => handleSlotClick(idx)}
          >
            <FFWindow className="aspect-square w-full max-h-48 md:max-h-56 mx-auto p-2 md:p-3 flex flex-col justify-center">
              {hero ? (
                <>
                  <div className="text-white text-sm md:text-base uppercase font-black tracking-wider text-center mt-0.5">
                    {hero.heroClass}
                  </div>
                  
                  {/* High-detail character bust */}
                  <div className="my-auto relative flex items-center justify-center py-1">
                    <HeroPortrait
                      heroClass={hero.heroClass}
                      emoji={hero.emoji}
                      name={hero.name}
                      hideBadge={true}
                      className="w-16 h-16 md:w-22 md:h-22 rounded-xl border-[3px] border-slate-100 shadow-[inset_0_0_0_2px_#000,0_8px_16px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center mb-1">
                    <div className="text-white text-sm md:text-lg font-black tracking-wider uppercase drop-shadow-md text-center">
                      {hero.name}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-1 md:gap-2 border-2 border-dashed border-slate-500/70 rounded-lg p-2 group hover:border-cyan-400 transition-colors">
                  <div className="text-slate-300 group-hover:text-white text-[20px] md:text-[23px] tracking-widest font-black uppercase text-center transition-colors">
                    Heroi {idx + 1}
                    <span className="block text-[11px] md:text-xs text-cyan-300 font-bold mt-1">+ Criar</span>
                  </div>
                </div>
              )}
            </FFWindow>
          </div>
        ))}
      </div>

      {/* Start Button or Progress Indicator */}
      {editingSlot === null && (
        allFilled ? (
          <button 
            onClick={handleStart}
            className="px-6 py-2.5 border-4 border-slate-200 text-white font-mono font-black text-xl md:text-2xl uppercase tracking-widest hover:bg-white/20 hover:text-cyan-200 transition-colors rounded-lg shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-pulse mt-1 md:mt-2 cursor-pointer"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
            Comecar
          </button>
        ) : (
          <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider py-2 px-4 border border-slate-700 bg-slate-900/80 rounded-lg">
            Crie os 4 herois da equipe - {filledCount} de 4 para iniciar
          </div>
        )
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
              <div className="text-white text-xl md:text-3xl tracking-widest flex items-center gap-2">
                <span>Personalizar Heroi {editingSlot + 1}</span>
              </div>
            </div>
            
            {/* Content: 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch min-h-0 overflow-y-auto custom-scrollbar pb-1">
              {/* Left Box: Portrait & Name Input */}
              <div 
                className="rounded-lg border-[3px] border-slate-300 p-3 flex flex-col items-center justify-center gap-2 shadow-[inset_0_0_0_1px_#000] bg-black/40"
              >
                <HeroPortrait
                  heroClass={currentClass}
                  hideBadge={true}
                  name={previewName}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-xl border-[3px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_8px_16px_rgba(0,0,0,0.8)]"
                />

                <div className="text-center">
                  <div className="text-white text-base md:text-xl font-black tracking-widest uppercase">
                    {previewName}
                  </div>
                  <div className="text-cyan-300 text-xs md:text-sm font-bold uppercase">
                    - {currentClass}
                  </div>
                </div>

                {/* Name Input */}
                <div className="w-full mt-2">
                  <div className="flex items-center bg-black/70 border-2 border-slate-300 rounded px-2 py-1.5 focus-within:border-cyan-400 shadow-[inset_0_0_0_1px_#000]">
                    <span className="text-cyan-300 text-base mr-2 font-black select-none">►</span>
                    <input 
                      type="text" 
                      value={currentName}
                      onChange={e => setCurrentName(cleanAscii(e.target.value).slice(0, 12))}
                      maxLength={12}
                      className="bg-transparent text-white text-base md:text-lg outline-none font-mono font-black tracking-widest uppercase w-full placeholder:text-slate-600"
                      placeholder={`EX: HEROI ${editingSlot + 1}`}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Right Box: Class Menu */}
              <div 
                className="rounded-lg border-[3px] border-slate-300 p-2 md:p-3 flex flex-col justify-between shadow-[inset_0_0_0_1px_#000] bg-black/40 min-h-0"
              >
                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {(Object.keys(CLASS_INFO) as HeroClass[]).map(cls => {
                    const isSelected = currentClass === cls;
                    const taken = isClassTaken(cls);
                    return (
                      <button
                        key={cls}
                        onClick={() => handleClassChange(cls)}
                        className={`flex items-center text-left hover:bg-white/20 px-2 py-1.5 rounded transition-all font-mono uppercase font-black text-sm md:text-base cursor-pointer ${
                          isSelected 
                            ? 'text-cyan-300 bg-white/10 ring-1 ring-cyan-400/50' 
                            : 'text-white'
                        }`}
                      >
                        <span className="w-4 shrink-0 text-cyan-300 font-black text-base select-none">
                          {isSelected ? '►' : ''}
                        </span>
                        <HeroPortrait
                          heroClass={cls}
                          hideBadge={true}
                          className="w-6 h-6 rounded border border-slate-300 shadow shrink-0 mr-2 overflow-hidden"
                        />
                        <div className="flex-1 truncate">
                          <span>{cls}</span>
                        </div>
                        {taken && (
                          <span className="text-[9px] text-slate-400 font-normal ml-1 shrink-0">
                            - JA USADO
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center border-t-2 border-slate-400/60 pt-3 mt-3 w-full shrink-0">
              <button 
                onClick={() => setEditingSlot(null)}
                className="flex items-center gap-1.5 hover:bg-white/20 px-3 py-1.5 rounded text-slate-300 hover:text-white uppercase font-black text-base md:text-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button 
                onClick={handleSaveHero}
                className="flex items-center gap-1.5 hover:bg-white/20 px-4 py-1.5 rounded text-cyan-300 hover:text-white uppercase font-black text-base md:text-lg transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

