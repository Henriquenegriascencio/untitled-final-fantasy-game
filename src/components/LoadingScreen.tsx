import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadGameAssets } from '../utils/assetLoader';
import { bgm } from '../utils/music';
import { soundFX } from '../utils/audio';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'loading' | 'disclaimer'>('loading');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(7);
  const [currentLabel, setCurrentLabel] = useState('Carregando recursos...');
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    loadGameAssets((current, total, label) => {
      setCurrentStep(current);
      setTotalSteps(total);
      setCurrentLabel(label);
    }).then(() => {
      setIsAssetsLoaded(true);
      // Small pause to let the 100% bar be visible, then transition to disclaimer
      setTimeout(() => {
        setPhase('disclaimer');
      }, 500);
    });
  }, []);

  const handleProceed = () => {
    if (phase !== 'disclaimer') return;
    soundFX.unlockAudio();
    bgm.unlockAudio();
    soundFX.playSelect();
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'disclaimer') {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const percent = totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0;

  return (
    <div 
      id="loading_screen_container"
      onClick={phase === 'disclaimer' ? handleProceed : undefined}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center select-none overflow-hidden text-white"
    >
      <AnimatePresence mode="wait">
        {phase === 'loading' ? (
          /* ======================================================== */
          /* STAGE 1: Minimalist Black Screen with Loading Bar       */
          /* ======================================================== */
          <motion.div
            key="loading-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-[480px] max-w-[88%] flex flex-col items-center text-center px-4"
          >
            {/* Minimalist Title */}
            <div className="text-xl sm:text-2xl font-bold tracking-widest text-slate-300 mb-8 font-mono">
              CARREGANDO...
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-slate-950 border border-slate-700 rounded-sm p-0.5 mb-3 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <motion.div 
                className="h-full bg-slate-200 transition-all duration-200 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Label and percentage */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono tracking-wider">
              <span className="truncate max-w-[320px] text-left">
                {currentLabel}
              </span>
              <span className="font-bold text-slate-300 ml-2 shrink-0">
                {percent} de 100
              </span>
            </div>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* STAGE 2: Disclaimer Warning Screen                      */
          /* ======================================================== */
          <motion.div
            key="disclaimer-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[840px] max-w-[94%] bg-black border-2 sm:border-4 border-slate-600 rounded-lg p-6 sm:p-10 flex flex-col items-center text-center shadow-[0_0_40px_rgba(0,0,0,0.95)] cursor-pointer"
          >
            {/* Warning Header */}
            <div className="text-3xl sm:text-4xl md:text-5xl text-amber-400 font-black tracking-widest mb-6 sm:mb-8 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              ATENCAO
            </div>

            {/* Warning Body Lines with larger prominent typography */}
            <div className="space-y-6 text-lg sm:text-xl md:text-2xl text-slate-100 font-semibold leading-relaxed text-left sm:text-center mb-10 px-2 sm:px-4">
              <p>
                Isso apenas uma fangame totalmente ferrada e sem nenhuma intencao de obter lucro ou creditos com isso, contudo e proibido a circulacao de venda deste;
              </p>
              <p>
                Franquia final fantasy e propriedade da Square Enix e as musicas e efeitos sonoros sao de propriedade dela;
              </p>
              <p className="text-amber-300 font-bold text-xl sm:text-2xl md:text-3xl">
                Nao me processem D:
              </p>
            </div>

            {/* Call to Action Button */}
            <motion.button
              type="button"
              onClick={handleProceed}
              animate={{ 
                opacity: [0.85, 1, 0.85],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-amber-400 rounded-md text-amber-300 hover:text-amber-200 font-extrabold tracking-widest text-sm sm:text-base md:text-lg uppercase cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              PRESSIONE QUALQUER TECLA OU CLIQUE PARA CONTINUAR
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

