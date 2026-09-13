import React, { useState } from 'react';
import { Weapon, Hero } from '../types';

interface ToolsmithModalProps {
  party: Hero[];
  gold: number;
  availableWeapons: Weapon[];
  onBuyWeapon: (weapon: Weapon, targetHeroIndex: number) => boolean;
  onClose: () => void;
}

export const ToolsmithModal: React.FC<ToolsmithModalProps> = ({
  party,
  gold,
  availableWeapons,
  onBuyWeapon,
  onClose
}) => {
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePurchase = (weapon: Weapon) => {
    if (gold < weapon.damage * 18) {
      setFeedback('Ouro insuficiente para comprar este equipamento!');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const success = onBuyWeapon(weapon, selectedHeroIndex);
    if (success) {
      const heroName = party[selectedHeroIndex]?.name || 'Heroi';
      setFeedback(`${weapon.name} equipado com sucesso em ${heroName}!`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="toolsmith_modal"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] border-4 border-[#cbd5e1] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_0_0_2px_#1e293b] text-white overflow-hidden select-none font-mono"
      >
        {/* Header */}
        <div className="p-5 border-b-2 border-slate-700 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl md:text-2xl font-black text-amber-400 tracking-wider flex items-center gap-2 drop-shadow-[0_2px_4px_#000]">
              <span>FORJA DO FERRAMENTEIRO</span>
            </div>
            <div className="text-xs text-slate-400 font-bold">
              Armas temperadas, ferramentas de exploracao e equipamentos de combate
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Party Gold Display */}
            <div className="px-4 py-1.5 bg-black/60 border border-yellow-500/50 rounded-xl flex items-center gap-2 shadow-inner">
              <span className="text-yellow-400 font-bold text-xs uppercase">Ouro:</span>
              <span className="text-yellow-300 font-black text-base">{gold} GP</span>
            </div>

            <button
              id="toolsmith_close_btn"
              onClick={onClose}
              className="px-4 py-1.5 bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs uppercase rounded-lg border border-red-500/50 cursor-pointer active:scale-95 transition-all"
            >
              Sair - ESC
            </button>
          </div>
        </div>

        {/* Hero Selector for Equipping */}
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 uppercase font-bold mr-2">Equipar em:</span>
          {party.map((hero, idx) => (
            <button
              key={hero.id || idx}
              onClick={() => setSelectedHeroIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                selectedHeroIndex === idx
                  ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-500/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {hero.name} - {hero.heroClass}
            </button>
          ))}
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div className="px-4 py-2 bg-yellow-500/20 border-b border-yellow-500/40 text-yellow-300 text-xs font-bold text-center animate-pulse">
            {feedback}
          </div>
        )}

        {/* Weapon List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {availableWeapons.map((weapon) => {
            const price = weapon.damage * 18;
            const canAfford = gold >= price;
            const currentEquipped = party[selectedHeroIndex]?.weapon;
            const isEquippedOnSelected = currentEquipped?.id === weapon.id;
            const diffDmg = weapon.damage - (currentEquipped?.damage || 0);

            return (
              <div
                key={weapon.id}
                className="p-3.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl flex flex-wrap items-center justify-between gap-3 transition-all"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100 font-bold text-sm md:text-base">
                      {weapon.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                      {weapon.type}
                    </span>
                    {isEquippedOnSelected && (
                      <span className="px-2 py-0.5 rounded bg-blue-900/80 text-[10px] text-blue-300 font-bold border border-blue-500/40 uppercase">
                        Equipado
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Dano: <strong className="text-white">{weapon.damage}</strong></span>
                    <span>Alcance: <strong className="text-white">{weapon.range}</strong></span>
                    {weapon.aoe && <span className="text-cyan-400 font-bold">Dano em Area</span>}
                    {diffDmg !== 0 && (
                      <span className={diffDmg > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {diffDmg > 0 ? `+${diffDmg} DANO` : `${diffDmg} DANO`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Preco:</div>
                    <div className={`font-black text-sm ${canAfford ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {price} GP
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handlePurchase(weapon)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-md transition-all active:scale-95 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-300 font-black'
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    Comprar e Equipar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400">
          Dica: Atualize o armamento de toda a sua equipe antes de explorar as masmorras mais profundas!
        </div>
      </div>
    </div>
  );
};
