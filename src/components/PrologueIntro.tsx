import React, { useState, useEffect } from 'react';
import { Hero } from '../types';

interface PrologueIntroProps {
  party: Hero[];
  onComplete: () => void;
}

export const PrologueIntro: React.FC<PrologueIntroProps> = ({ party, onComplete }) => {
  const [phase, setPhase] = useState<'LORE' | 'DIALOGUE'>('LORE');
  const [loreStep, setLoreStep] = useState(0);
  const [dialogueStep, setDialogueStep] = useState(0);

  const hero1 = party[0]?.name || 'Heroi 1';
  const hero2 = party[1]?.name || 'Heroi 2';
  const hero3 = party[2]?.name || 'Heroi 3';
  const hero4 = party[3]?.name || 'Heroi 4';

  const LORE_PARAGRAPHS = [
    'No alvorecer dos tempos, o continente de Eldoria prosperava sob a resplandecencia dos Quatro Cristais Sagrados.',
    'Contudo, as forcas do Caos despertaram das profundezas, rompendo a harmonia elemental e corrompendo a terra.',
    'Duas masmorras ancestrais nao-elementais — a Caverna do Preludio e a Cidadela dos Desafios — foram seladas para proteger as passagens entre os reinos.',
    'Em resposta ao clamor do mundo, os sabios invocaram quatro guerreiros atraves das fendas do espaco e do tempo...',
    'Eis que os quatro escolhidos despertam no coracao de Eldoria.'
  ];

  const DIALOGUE_LINES = [
    {
      speaker: hero1,
      role: party[0]?.heroClass || 'Lider',
      avatar: party[0]?.heroClass || 'Cavalheiro',
      text: 'Onde... onde estamos? A terra sob nossos pes vibra com uma energia ancestral desconhecida...'
    },
    {
      speaker: hero2,
      role: party[1]?.heroClass || 'Mago',
      avatar: party[1]?.heroClass || 'Mago',
      text: 'As forcas dos Cristais estao em colapso. O ritual dos sabios nos transportou para o continente esquecido de Eldoria!'
    },
    {
      speaker: hero3,
      role: party[2]?.heroClass || 'Estrategista',
      avatar: party[2]?.heroClass || 'Arqueiro',
      text: 'Olhem para o norte, logo alem destas planicies: avisto muralhas de pedra e estandartes. E a Cidade de Cornelia!'
    },
    {
      speaker: hero4,
      role: party[3]?.heroClass || 'Especialista',
      avatar: party[3]?.heroClass || 'Lutador',
      text: 'Devemos ir ate la primeiro! Os cidadaos, a Loja de Itens e o Ferramenteiro nos darao pistas sobre a Caverna do Preludio e como abrir os caminhos do reino.'
    },
    {
      speaker: hero1,
      role: party[0]?.heroClass || 'Lider',
      avatar: party[0]?.heroClass || 'Cavalheiro',
      text: 'Exato. Nosso destino comeca agora. Vamos reunir provisoes em Cornelia e salvar este mundo!'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (phase === 'LORE') {
      if (loreStep < LORE_PARAGRAPHS.length - 1) {
        setLoreStep(prev => prev + 1);
      } else {
        setPhase('DIALOGUE');
      }
    } else {
      if (dialogueStep < DIALOGUE_LINES.length - 1) {
        setDialogueStep(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white font-mono select-none overflow-hidden p-3 md:p-6">
      <div className="w-full max-w-4xl flex flex-col gap-3">
        {/* Main Action-Style Box */}
        <div 
          className="w-full rounded-lg border-[4px] border-slate-200 p-4 md:p-8 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_12px_rgba(0,0,0,0.8)] min-h-[380px] md:min-h-[440px] justify-between relative"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          {/* Top Title Bar */}
          <div className="flex items-center justify-between border-b-2 border-slate-400/60 pb-2 mb-4">
            <div className="text-white text-lg md:text-2xl font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-cyan-300 font-bold">ELDORIA</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-200">
                {phase === 'LORE' ? 'PROLOGO ANCESTRAL' : 'O DESPERTAR'}
              </span>
            </div>
            <div className="text-cyan-300 font-bold text-sm md:text-base tracking-wider">
              {phase === 'LORE' ? `${loreStep + 1} de ${LORE_PARAGRAPHS.length}` : `${dialogueStep + 1} de ${DIALOGUE_LINES.length}`}
            </div>
          </div>

          {/* Lore Phase: Big Clear Font */}
          {phase === 'LORE' && (
            <div className="my-auto py-4 px-2 text-center flex flex-col items-center justify-center">
              <p className="text-xl md:text-3xl lg:text-4xl text-white font-black leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase">
                {LORE_PARAGRAPHS[loreStep]}
              </p>
            </div>
          )}

          {/* Dialogue Phase: Big Clear Font with Speaker Name */}
          {phase === 'DIALOGUE' && (
            <div className="my-auto py-2 flex flex-col gap-4">
              {/* Speaker Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-slate-200 bg-black/60 flex items-center justify-center text-cyan-300 font-black text-lg md:text-xl shadow-[inset_0_0_0_1px_#000]">
                  {DIALOGUE_LINES[dialogueStep].speaker.charAt(0)}
                </div>
                <div>
                  <div className="text-cyan-300 text-xl md:text-3xl font-black uppercase tracking-wider drop-shadow-md">
                    {DIALOGUE_LINES[dialogueStep].speaker}
                  </div>
                  <div className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-wider">
                    - {DIALOGUE_LINES[dialogueStep].role}
                  </div>
                </div>
              </div>

              {/* Dialogue Text */}
              <div className="p-3 md:p-5 rounded-lg border-2 border-slate-300/80 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                <p className="text-lg md:text-2xl lg:text-3xl text-white font-black leading-relaxed tracking-wide drop-shadow-md">
                  {DIALOGUE_LINES[dialogueStep].text}
                </p>
              </div>

              {/* Party Avatars Simple Bar */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {party.map((hero, idx) => {
                  const isCurrent = DIALOGUE_LINES[dialogueStep].speaker === hero.name;
                  return (
                    <div 
                      key={idx}
                      className={`px-2 py-1.5 rounded border text-center transition-all ${
                        isCurrent 
                          ? 'border-cyan-300 bg-white/15 text-white font-black ring-1 ring-cyan-400/80' 
                          : 'border-slate-700 bg-black/40 text-slate-400'
                      }`}
                    >
                      <div className="text-xs md:text-sm truncate uppercase font-bold">
                        {hero.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between border-t-2 border-slate-400/60 pt-3 mt-4">
            <button
              id="skip_prologue_btn"
              onClick={onComplete}
              className="px-4 py-2 hover:bg-white/15 text-slate-400 hover:text-white font-black text-xs md:text-sm uppercase tracking-widest rounded border border-slate-600 cursor-pointer transition-colors"
            >
              Pular - ESC
            </button>

            <button
              id="next_prologue_btn"
              onClick={handleNext}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black text-sm md:text-lg uppercase tracking-wider rounded border-2 border-slate-200 shadow-[inset_0_0_0_1px_#000] cursor-pointer active:scale-95 transition-all"
            >
              {phase === 'LORE' && loreStep === LORE_PARAGRAPHS.length - 1
                ? 'Ver Herois >'
                : phase === 'DIALOGUE' && dialogueStep === DIALOGUE_LINES.length - 1
                ? 'Iniciar Aventura!'
                : 'Avancar - ESPACO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
