import React, { useState, useEffect } from 'react';
import { TownNPC } from '../data/townData';
import { soundFX } from '../utils/audio';

interface TownDialogModalProps {
  npc: TownNPC;
  onClose: () => void;
}

export const TownDialogModal: React.FC<TownDialogModalProps> = ({ npc, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    soundFX.playSelect();
  }, [lineIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundFX.playCancel();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lineIndex, npc.dialogue.length, onClose]);

  const handleNext = () => {
    if (lineIndex < npc.dialogue.length - 1) {
      setLineIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCancel();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 md:pb-12 px-4 bg-black/40 backdrop-blur-[2px] select-none"
      onClick={handleNext}
    >
      <div 
        id="town_dialog_box"
        className="w-full max-w-2xl bg-gradient-to-b from-[#1d2794] via-[#151b70] to-[#060930] border-4 border-[#d8d8d8] rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_0_0_2px_#000028] text-white cursor-pointer relative font-mono"
      >
        {/* Header with NPC Name and Title */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-400/40 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/90 border border-yellow-400/60 flex items-center justify-center font-mono font-black text-yellow-300 text-lg shadow-inner">
              {npc.name.charAt(0)}
            </div>
            <div>
              <div className="text-yellow-300 font-black text-base md:text-lg tracking-wider font-mono uppercase drop-shadow-[0_1px_2px_#000]">
                {npc.name}
              </div>
              <div className="text-blue-200 text-xs font-mono font-bold tracking-wide">
                {npc.role}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-300 text-xs font-mono font-bold">
              {lineIndex + 1} de {npc.dialogue.length}
            </span>
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded text-xs text-slate-300 hover:text-white border border-slate-600 transition-all uppercase"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Dialogue text box */}
        <div className="min-h-[65px] md:min-h-[75px] flex items-center py-2">
          <p className="text-white text-base md:text-lg leading-relaxed font-mono font-bold tracking-wide drop-shadow-[1px_1px_0_#000]">
            {npc.dialogue[lineIndex]}
          </p>
        </div>

        {/* Advance Controls Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-blue-900/80 text-xs font-mono text-blue-200">
          <span className="hidden sm:inline">ESPACO ou Clique para avancar</span>
          <div className="ml-auto text-yellow-300 font-black flex items-center gap-1.5 animate-pulse">
            {lineIndex < npc.dialogue.length - 1 ? 'Avancar >' : 'Concluir'}
          </div>
        </div>
      </div>
    </div>
  );
};
