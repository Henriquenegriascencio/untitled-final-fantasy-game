import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { soundFX } from '../utils/audio';

interface TreasureModalProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export const TreasureModal: React.FC<TreasureModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    soundFX.playSelect();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Auto dismiss after 4 seconds if not pressed
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="absolute inset-0 z-[120] flex items-start justify-center pt-8 md:pt-10 px-4 pointer-events-auto select-none cursor-pointer bg-black/30"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="w-full max-w-xl py-4 px-6 md:py-5 md:px-10 rounded-[6px] border-[3px] border-white text-center"
        style={{
          background: 'linear-gradient(to bottom, #3b53c7 0%, #283ba6 30%, #1c2b7d 65%, #0f184e 100%)',
          boxShadow: 'inset 0 0 0 2px #070d2b, inset 0 0 0 3px #94a3b8, inset 0 0 0 4px #070d2b, 0 10px 30px rgba(0,0,0,0.85)'
        }}
      >
        <p className="text-xl sm:text-2xl md:text-3xl text-white font-normal tracking-wide [text-shadow:_2px_2px_0_#000000,_1px_1px_0_#000000]">
          {message}
        </p>
      </motion.div>
    </div>
  );
};

