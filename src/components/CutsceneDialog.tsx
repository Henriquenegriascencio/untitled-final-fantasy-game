import React, { useEffect, useState } from 'react';
import { Cutscene } from '../types';
import { soundFX, bgm } from '../utils/audio';

interface CutsceneDialogProps {
  cutscene: Cutscene;
  onClose: () => void;
}

export const CutsceneDialog: React.FC<CutsceneDialogProps> = ({ cutscene, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMsg = cutscene.messages[currentIndex];

  // Duck music volume while dialogue is open
  useEffect(() => {
    bgm.setDucked(true);
    return () => {
      bgm.setDucked(false);
    };
  }, []);

  useEffect(() => {
    soundFX.playSelect();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < cutscene.messages.length - 1) {
      soundFX.playSelect();
      setCurrentIndex(prev => prev + 1);
    } else {
      soundFX.playSelect();
      onClose();
    }
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playCancel();
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cutscene.messages.length]);

  if (!currentMsg) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-6 sm:pb-8 px-4 sm:px-8 bg-black/40 pointer-events-auto select-none">
      {/* FF6 SNES Authentic Dialogue Box */}
      <div 
        onClick={handleNext}
        className="w-full max-w-4xl min-h-[140px] sm:min-h-[160px] p-4 sm:p-6 rounded-[6px] border-[3px] border-[#c4cbdb] shadow-[inset_0_0_0_2px_#000000,0_10px_35px_rgba(0,0,0,0.95)] cursor-pointer relative font-mono flex flex-col justify-between"
        style={{ 
          background: 'linear-gradient(to bottom, #1d2794 0%, #151b70 45%, #0d1250 80%, #060930 100%)' 
        }}
      >
        {/* Top subtle controls: Skip indicator */}
        <div className="absolute top-2 right-3 z-10 flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="text-slate-300 hover:text-white text-xs sm:text-sm font-mono tracking-widest px-2 py-0.5 rounded hover:bg-white/10 transition-colors uppercase"
            style={{ textShadow: '1px 1px 0px #000' }}
          >
            Pular
          </button>
        </div>

        {/* Dialogue Text Content (Classic FF6 layout matching reference image) */}
        <div 
          className="text-white text-2xl sm:text-[30px] md:text-[34px] leading-tight tracking-wider font-mono pr-12 pt-1"
          style={{ textShadow: '2px 2px 0px #000000' }}
        >
          <span className="font-bold uppercase tracking-wider">
            {currentMsg.speaker}:
          </span>{' '}
          <span className="whitespace-pre-wrap">
            {currentMsg.text}
          </span>
        </div>

        {/* Bottom Right: Classic FF6 Blinking Advance Cursor */}
        <div className="flex justify-end items-center mt-2 pr-1">
          <span 
            className="text-white text-xl sm:text-2xl animate-pulse select-none"
            style={{ textShadow: '2px 2px 0px #000000' }}
          >
          </span>
        </div>
      </div>
    </div>
  );
};
