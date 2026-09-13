import React, { useState } from 'react';
import { Hero } from '../types';
import { soundFX } from '../utils/audio';

interface InnModalProps {
  townName: string;
  party: Hero[];
  onRest: () => void;
  onClose: () => void;
}

export const InnModal: React.FC<InnModalProps> = ({
  townName,
  party,
  onRest,
  onClose
}) => {
  const [rested, setRested] = useState(false);

  const handleRest = () => {
    soundFX.playHeal();
    onRest();
    setRested(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="inn_modal"
        className="w-full max-w-lg bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617] border-4 border-[#38bdf8]/60 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_0_0_2px_#312e81] text-white font-mono select-none"
      >
        {/* Header */}
        <div className="text-center pb-4 border-b border-indigo-900/80">
          <div className="text-xl md:text-2xl font-black text-amber-300 tracking-wider drop-shadow-[0_2px_4px_#000]">
            ESTALAGEM DA CIDADE
          </div>
          <div className="text-xs text-indigo-300 font-bold mt-1">
            {townName} - Aconchego e Descanso dos Herois
          </div>
        </div>

        {/* Message */}
        <div className="my-5 p-4 bg-black/50 border border-indigo-950 rounded-xl text-center">
          <p className="text-slate-200 text-sm leading-relaxed">
            {rested 
              ? 'Sua equipe descansou profundamente! HP, MP, Barra Especial e status negativos foram restaurados e purificados ao maximo!'
              : 'O estalajadeiro acolhe seu grupo com calor: Desejam passar a noite e recuperar todas as energias e curar debuffs da equipe?'}
          </p>
        </div>

        {/* Party Status Preview */}
        <div className="space-y-2 mb-6">
          {party.map((hero) => {
            const isFull = hero.stats.hp === hero.stats.maxHp && hero.stats.mp === hero.stats.maxMp;
            const hasDebuffs = hero.debuffs && hero.debuffs.length > 0;
            return (
              <div 
                key={hero.id} 
                className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{hero.name}</span>
                  {!rested && hasDebuffs && (
                    <span className="text-[10px] bg-red-950 border border-red-500 text-red-300 px-1 py-0.2 rounded">
                      DEBUFF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={rested || isFull ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                    HP: {rested ? hero.stats.maxHp : hero.stats.hp}/{hero.stats.maxHp}
                  </span>
                  <span className={rested || isFull ? 'text-cyan-400 font-bold' : 'text-blue-400'}>
                    MP: {rested ? hero.stats.maxMp : hero.stats.mp}/{hero.stats.maxMp}
                  </span>
                  <span className="text-amber-400 font-bold">
                    SP: {rested ? hero.stats.maxSp || 100 : hero.stats.sp || 0}/{hero.stats.maxSp || 100}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {!rested ? (
            <>
              <button
                id="inn_rest_btn"
                onClick={handleRest}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm uppercase rounded-xl border border-emerald-400/50 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
              >
                Descansar Agora - Gratis
              </button>
              <button
                id="inn_cancel_btn"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl border border-slate-600 cursor-pointer active:scale-95 transition-all"
              >
                Voltar a Cidade
              </button>
            </>
          ) : (
            <div className="text-emerald-400 font-black text-sm uppercase tracking-wider animate-bounce">
              Energias Renovadas!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
