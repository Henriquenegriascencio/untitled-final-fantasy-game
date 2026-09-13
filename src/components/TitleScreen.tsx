import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFX, bgm } from '../utils/audio';

interface TitleScreenProps {
  hasSave: boolean;
  onNewGame: () => void;
  onLoadGame: () => void;
  onOpenOptions: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSave,
  onNewGame,
  onLoadGame,
  onOpenOptions,
}) => {
  // Default selected index: 1 (New Game) or 0 (Load Game if save exists)
  const [selectedIndex, setSelectedIndex] = useState<number>(hasSave ? 0 : 1);
  const [isExtrasOpen, setIsExtrasOpen] = useState<boolean>(false);
  const [noSaveAlert, setNoSaveAlert] = useState<boolean>(false);

  useEffect(() => {
    bgm.playPrologue();
  }, []);

  const menuItems = [
    { id: 'load', label: 'Carregar Jogo', action: 'load' },
    { id: 'new', label: 'Novo Jogo', action: 'new' },
    { id: 'extras', label: 'Extras', action: 'extras' },
    { id: 'options', label: 'Configuracoes', action: 'options' },
  ];

  const handleSelect = (index: number) => {
    const item = menuItems[index];
    if (item.action === 'load') {
      if (hasSave) {
        soundFX.playSelect();
        onLoadGame();
      } else {
        soundFX.playCancel();
        setNoSaveAlert(true);
        setTimeout(() => setNoSaveAlert(false), 2500);
      }
    } else if (item.action === 'new') {
      soundFX.playSelect();
      onNewGame();
    } else if (item.action === 'extras') {
      soundFX.playSelect();
      setIsExtrasOpen(true);
    } else if (item.action === 'options') {
      soundFX.playSelect();
      onOpenOptions();
    }
  };

  // Keyboard navigation for menu
  useEffect(() => {
    if (isExtrasOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        soundFX.playCursor();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundFX.playCursor();
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isExtrasOpen, hasSave]);

  return (
    <div 
      id="ff6_title_screen"
      className="absolute inset-0 z-50 flex flex-col items-center justify-between select-none overflow-hidden"
      style={{
        backgroundColor: '#e6e7eb',
        backgroundImage: 'radial-gradient(circle at 50% 45%, #ffffff 0%, #ececef 65%, #dddee2 100%)',
      }}
    >
      {/* Top Bar Spacer */}
      <div className="w-full px-6 pt-3 h-8 pointer-events-none z-10" />

      {/* Center Section: Iconic FF6 Logo & Silhouette */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative px-4 -mt-4">
        
        {/* Yoshitaka Amano Artwork Silhouette (Magitek Armor & Rider) */}
        <div className="relative flex items-center justify-center pointer-events-none mb-1">
          <svg
            className="w-[340px] sm:w-[420px] md:w-[540px] lg:w-[600px] h-auto max-h-[260px] md:max-h-[300px] overflow-visible drop-shadow-[0_4px_12px_rgba(185,28,28,0.25)]"
            viewBox="0 0 600 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="amanoGrad" x1="200" y1="20" x2="400" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#dc2626" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#991b1b" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.98" />
              </linearGradient>

              <filter id="inkGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Stylized Amano Magitek Silhouette & Mechanical tendrils */}
            <g id="amano_magitek_silhouette" filter="url(#inkGlow)">
              {/* Rider / Terra figure atop the machine with flowing hair */}
              <path
                d="M 280 45 C 275 35 285 20 295 24 C 305 28 312 38 310 50 C 315 42 325 36 335 38 C 345 40 355 48 358 60 C 348 62 338 65 330 72 C 324 78 322 88 320 98 C 312 90 302 85 292 82 C 285 70 282 58 280 45 Z"
                fill="url(#amanoGrad)"
              />
              {/* Flowing hair strands */}
              <path
                d="M 310 40 Q 340 25 375 35 Q 395 42 410 60 Q 380 50 350 52 Q 330 50 310 40 Z"
                fill="url(#amanoGrad)"
              />
              <path
                d="M 320 50 Q 360 40 400 55 Q 425 68 440 90 Q 405 75 370 72 Z"
                fill="url(#amanoGrad)"
              />
              {/* Magitek Head / Cockpit & Crest */}
              <path
                d="M 270 95 C 280 75 305 70 330 75 C 340 85 348 100 355 115 C 362 130 360 148 348 160 C 330 172 300 170 280 158 C 265 145 258 120 270 95 Z"
                fill="url(#amanoGrad)"
              />
              {/* Armored Horns & Upper Tendrils */}
              <path
                d="M 315 70 Q 330 45 350 30 Q 370 15 395 10 Q 375 25 360 45 Q 345 65 330 80 Z"
                fill="url(#amanoGrad)"
              />
              <path
                d="M 285 75 Q 260 50 235 38 Q 210 28 185 25 Q 215 38 238 58 Q 260 78 275 92 Z"
                fill="url(#amanoGrad)"
              />
              {/* Left Wing / Exhaust Fin */}
              <path
                d="M 260 110 C 230 90 195 85 160 90 C 135 94 110 108 90 125 C 120 120 150 122 180 130 C 210 138 238 152 258 172 C 260 150 260 130 260 110 Z"
                fill="url(#amanoGrad)"
              />
              {/* Right Wing / Main Fin Structure */}
              <path
                d="M 345 105 C 380 85 425 78 465 82 C 495 85 525 98 550 118 C 518 112 485 115 452 124 C 420 134 390 150 365 170 C 360 145 355 125 345 105 Z"
                fill="url(#amanoGrad)"
              />
              {/* Mechanical Chest / Core Sphere */}
              <path
                d="M 265 150 C 255 175 250 205 255 235 C 270 248 300 255 330 255 C 360 255 388 245 400 230 C 405 200 400 170 385 145 C 360 162 330 170 298 168 C 282 165 272 158 265 150 Z"
                fill="url(#amanoGrad)"
              />
              {/* Center Beam / Engine Core */}
              <circle cx="325" cy="205" r="28" fill="#7f1d1d" />
              <circle cx="325" cy="205" r="18" fill="#ef4444" opacity="0.8" />
              <circle cx="325" cy="205" r="9" fill="#fecaca" />
              {/* Front Claws / Mechanical Forelegs */}
              <path
                d="M 255 220 Q 230 240 210 270 Q 195 292 180 315 Q 200 300 220 282 Q 240 265 260 248 Z"
                fill="url(#amanoGrad)"
              />
              <path
                d="M 230 260 Q 205 285 185 305 Q 210 295 235 280 Z"
                fill="url(#amanoGrad)"
              />
              <path
                d="M 385 220 Q 415 242 440 272 Q 460 295 480 318 Q 455 302 432 284 Q 410 265 390 246 Z"
                fill="url(#amanoGrad)"
              />
              <path
                d="M 405 258 Q 430 282 455 302 Q 430 292 405 278 Z"
                fill="url(#amanoGrad)"
              />
              {/* Decorative dynamic ink splashes (Amano watercolor signature) */}
              <circle cx="160" cy="70" r="4.5" fill="#dc2626" opacity="0.6" />
              <circle cx="145" cy="85" r="3" fill="#b91c1c" opacity="0.5" />
              <circle cx="475" cy="65" r="5" fill="#dc2626" opacity="0.6" />
              <circle cx="505" cy="80" r="3.5" fill="#991b1b" opacity="0.5" />
              <circle cx="210" cy="45" r="3" fill="#ef4444" opacity="0.4" />
              <circle cx="420" cy="40" r="3" fill="#ef4444" opacity="0.4" />
            </g>
          </svg>

          {/* Bold Serif "ELEMENTAL FANTASY" Overlay Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            {/* Top horizontal divider line */}
            <div className="w-full max-w-[320px] sm:max-w-[450px] md:max-w-[580px] lg:max-w-[650px] h-[2px] md:h-[2.5px] bg-black mb-1 opacity-95" />

            {/* Title Text */}
            <div className="flex items-baseline justify-center tracking-tighter px-2">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.25rem] font-serif font-black text-black tracking-[0.05em] sm:tracking-[0.08em] uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] whitespace-nowrap"
                style={{
                  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                  transform: 'scaleY(1.12)',
                }}
              >
                ELEMENTAL FANTASY
              </h1>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-serif font-bold text-black ml-1 -translate-y-3 sm:-translate-y-4 md:-translate-y-5">
              </span>
            </div>

            {/* Bottom horizontal divider line */}
            <div className="w-full max-w-[320px] sm:max-w-[450px] md:max-w-[580px] lg:max-w-[650px] h-[2px] md:h-[2.5px] bg-black mt-1 opacity-95" />
          </div>
        </div>

        {/* Menu Options (Carregar Jogo, Novo Jogo, Extras, Opcoes) */}
        <div 
          id="ff6_title_menu" 
          className="mt-6 md:mt-8 flex flex-col items-start gap-1 md:gap-1.5 min-w-[240px] md:min-w-[280px]"
        >
          {menuItems.map((item, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={item.id}
                id={`title_menu_${item.id}`}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => {
                  if (selectedIndex !== idx) {
                    soundFX.playCursor();
                    setSelectedIndex(idx);
                  }
                }}
                className={`relative flex items-center gap-3 py-1 px-2 text-left cursor-pointer transition-colors group outline-none ${
                  isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Combat Pointer '►' (Equal to combat menu action pointer) */}
                <div className="w-8 md:w-10 h-6 md:h-8 flex items-center justify-center shrink-0">
                  {isSelected ? (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                      className="text-2xl sm:text-3xl md:text-4xl text-yellow-400 font-mono font-black select-none"
                      style={{
                        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      ►
                    </motion.span>
                  ) : (
                    <span className="w-4" />
                  )}
                </div>

                {/* Menu Item Text */}
                <span
                  className={`text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-wider transition-all select-none ${
                    isSelected
                      ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] scale-105'
                      : 'text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]'
                  }`}
                  style={{
                    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                    textShadow: isSelected
                      ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.75)'
                      : 'none',
                  }}
                >
                  {item.label}
                </span>

                {/* Save status badge for Load Game */}
                {item.action === 'load' && hasSave && (
                  <span className="text-[10px] md:text-xs font-mono font-black text-green-700 bg-green-200/80 px-1.5 py-0.5 rounded border border-green-600">
                    SAVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* No Save Alert Message */}
        {noSaveAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 px-4 py-1.5 bg-black/80 text-yellow-300 text-xs md:text-sm font-mono font-bold rounded border border-yellow-400 shadow-lg"
          >
           Nenhum arquivo de save encontrado! Inicie um Novo Jogo.
          </motion.div>
        )}
      </div>

      {/* Bottom Copyright and Credit Texts (Accurate to the reference image) */}
      <div className="w-full pb-5 pt-2 flex flex-col items-center justify-center text-center z-10 space-y-0.5">
        <div className="text-black font-serif text-xs md:text-sm tracking-widest font-semibold uppercase">
          By Bop
        </div>
        <div 
          className="text-slate-700 font-serif text-[14px] tracking-wider uppercase font-medium"
          style={{ fontSize: '14px' }}
        >
        IMAGE ILLUSTRATION FROM YOSHITAKA AMANO, ALL RIGHTS AND ASSETS TO SQUARE ENIX
        </div>
      </div>

      {/* ================= EXTRAS MODAL ================= */}
      <AnimatePresence>
        {isExtrasOpen && (
          <div
            id="ff6_extras_backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                soundFX.playCancel();
                setIsExtrasOpen(false);
              }
            }}
          >
            <motion.div
              id="ff6_extras_modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-lg border-[4px] border-slate-200 p-4 md:p-6 shadow-[inset_0_0_0_2px_#000,0_8px_25px_rgba(0,0,0,0.8)] uppercase font-black overflow-hidden flex flex-col gap-4 text-white"
              style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-500 pb-2">
                <button
                  onClick={() => {
                    soundFX.playCancel();
                    setIsExtrasOpen(false);
                  }}
                  className="text-yellow-400 hover:text-white text-xl md:text-2xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>←</span>
                  <span>VOLTAR - ESC</span>
                </button>
                <div className="text-xl md:text-2xl font-black tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                  EXTRAS E BESTIARIO
                </div>
              </div>

              {/* Extras Content */}
              <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                {/* 1. Bestiario */}
                <div className="rounded-lg border-[3px] border-slate-300 p-4 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                  <div className="text-yellow-400 text-lg md:text-xl mb-3 flex items-center gap-2 border-b border-slate-700 pb-1">
                    <span></span>
                    <span>BESTIARIO DE CRIATURAS DE ELDORIA</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                    {[
                      { name: 'Goblin Saqueador', tag: 'LV 03', loc: 'Planicies Iniciais', hp: '35', drop: 'Adaga Velha', weak: 'Fogo' },
                      { name: 'Lobo Selvagem', tag: 'LV 05', loc: 'Bosques do Oeste', hp: '50', drop: 'Pele de Lobo', weak: 'Gelo' },
                      { name: 'Esqueleto Guerreiro', tag: 'LV 08', loc: 'Catacumbas', hp: '80', drop: 'Osso Raro', weak: 'Luz' },
                      { name: 'Golem de Granito', tag: 'LV 12', loc: 'Picos Rochosos', hp: '160', drop: 'Nucleo de Pedra', weak: 'Trovao' },
                      { name: 'Dragao Anciao Supremo', tag: 'CHEFE', loc: 'Dungeon Final', hp: '500', drop: 'Escama Lendaria', weak: 'Gelo' },
                    ].map((m) => (
                      <div key={m.name} className="p-2.5 bg-blue-950/70 rounded border border-blue-800 flex items-center gap-3">
                        <span className="text-amber-300 font-mono font-bold text-sm tracking-wider">{m.tag}</span>
                        <div className="flex-1">
                          <div className="text-white font-black text-sm">{m.name}</div>
                          <div className="text-slate-300 text-xs">HP: <span className="text-green-400">{m.hp}</span> | Drop: <span className="text-yellow-400">{m.drop}</span></div>
                          <div className="text-cyan-300 text-xs">Fraqueza: {m.weak}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Os Quatro Artefatos Elementais */}
                <div className="rounded-lg border-[3px] border-slate-300 p-4 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                  <div className="text-yellow-400 text-lg md:text-xl mb-2 flex items-center gap-2 border-b border-slate-700 pb-1">
                    <span></span>
                    <span>AS RELIQUIAS ELEMENTAIS ANTIGAS</span>
                  </div>
                  <p 
                    className="text-slate-300 normal-case mb-2 font-normal"
                    style={{ fontSize: '19px' }}
                  >
                    Reuna os quatro cristais sagrados para enfraquecer a barreira magica que protege a camara do Dragao Anciao:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-red-950/60 rounded border border-red-700" style={{ fontSize: '14px' }}>FOGO<br/><span className="text-slate-400">Poder de Chamas</span></div>
                    <div className="p-2 bg-blue-950/60 rounded border border-blue-700" style={{ fontSize: '14px' }}>AGUA<br/><span className="text-slate-400">Pureza dos Rios</span></div>
                    <div className="p-2 bg-emerald-950/60 rounded border border-emerald-700" style={{ fontSize: '14px' }}>TERRA<br/><span className="text-slate-400">Forca da Rocha</span></div>
                    <div className="p-2 bg-cyan-950/60 rounded border border-cyan-700" style={{ fontSize: '14px' }}>VENTO<br/><span className="text-slate-400">Furia dos Ceus</span></div>
                  </div>
                </div>

                {/* 3. Creditos & Inspiracao */}
                <div className="rounded-lg border-[3px] border-slate-300 p-4 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                  <div className="text-yellow-400 mb-1" style={{ fontSize: '20px' }}> TRIBUTO E INSPIRACAO</div>
                  <p 
                    className="text-slate-300 normal-case font-normal"
                    style={{ fontSize: '25px', lineHeight: '15.5px' }}
                  >
                    Tributo aos classicos JRPGs da era de ouro do Super Nintendo Entertainment System - 1994. Arte inspirada no lendario ilustrador Yoshitaka Amano e nas obras primas da Squaresoft.
                  </p>
                </div>
              </div>

              {/* Close button */}
              <div className="pt-2 border-t border-slate-600 flex justify-end">
                <button
                  onClick={() => {
                    soundFX.playCancel();
                    setIsExtrasOpen(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-sm md:text-base uppercase rounded border-2 border-slate-200 cursor-pointer transition-all active:scale-95"
                >
                  FECHAR - ESC
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
