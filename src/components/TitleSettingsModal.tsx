import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFX, bgm } from '../utils/audio';

interface TitleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasSave: boolean;
  onDeleteSave: () => void;
}

export const TitleSettingsModal: React.FC<TitleSettingsModalProps> = ({
  isOpen,
  onClose,
  hasSave,
  onDeleteSave,
}) => {
  const [activeOption, setActiveOption] = useState<'DELETE_SAVE' | 'AUDIO' | 'TEXT_SPEED' | 'DIFFICULTY' | 'CONTROLS'>('DELETE_SAVE');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(soundFX.enabled);
  const [bgmEnabled, setBgmEnabled] = useState(bgm.enabled);
  const [textSpeed, setTextSpeed] = useState<'normal' | 'fast' | 'instant'>(() => {
    return (localStorage.getItem('eldoria_text_speed') as any) || 'normal';
  });
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>(() => {
    return (localStorage.getItem('eldoria_difficulty') as any) || 'normal';
  });

  // Extract saved game metadata if exists
  const [saveDetails, setSaveDetails] = useState<{
    heroesCount?: number;
    gold?: number;
    steps?: number;
    time?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveOption('DELETE_SAVE');
      setConfirmDelete(false);
      setDeleteSuccess(false);
      const raw = localStorage.getItem('eldoria_save');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const timeSec = parsed.playTimeSeconds || 0;
          const mins = Math.floor(timeSec / 60);
          const secs = timeSec % 60;
          const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          setSaveDetails({
            heroesCount: parsed.player?.party?.length || 4,
            gold: parsed.player?.gold || 0,
            steps: parsed.totalSteps || 0,
            time: timeStr,
          });
        } catch {
          setSaveDetails(null);
        }
      } else {
        setSaveDetails(null);
      }
    }
  }, [isOpen, hasSave]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFX.playCancel();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleSound = () => {
    soundFX.enabled = !sfxEnabled;
    setSfxEnabled(!sfxEnabled);
    soundFX.playSelect();
  };

  const handleToggleBgm = () => {
    const next = bgm.toggle();
    setBgmEnabled(next);
    soundFX.playSelect();
  };

  const handleSetSpeed = (spd: 'normal' | 'fast' | 'instant') => {
    soundFX.playSelect();
    setTextSpeed(spd);
    localStorage.setItem('eldoria_text_speed', spd);
  };

  const handleSetDifficulty = (diff: 'normal' | 'hard') => {
    soundFX.playSelect();
    setDifficulty(diff);
    localStorage.setItem('eldoria_difficulty', diff);
  };

  const handleExecuteDelete = () => {
    soundFX.playCancel();
    onDeleteSave();
    setSaveDetails(null);
    setConfirmDelete(false);
    setDeleteSuccess(true);
    setTimeout(() => {
      setDeleteSuccess(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="title_settings_backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 font-mono select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            soundFX.playCancel();
            onClose();
          }
        }}
      >
        <motion.div
          id="title_settings_window"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-3xl rounded-lg border-[4px] border-slate-200 p-3 md:p-5 shadow-[inset_0_0_0_2px_#000,0_8px_30px_rgba(0,0,0,0.9)] uppercase font-mono font-black flex flex-col gap-3 text-white overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
        >
          {/* Header Bar identical to Combat HUD Style */}
          <div className="flex items-center justify-between border-b-2 border-slate-500/80 pb-2">
            <div className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl text-white font-mono font-black tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              <span className="text-yellow-400">►</span>
              <span>CONFIGURACOES</span>
            </div>
            <button
              id="title_settings_back_btn"
              onClick={() => {
                soundFX.playCancel();
                onClose();
              }}
              className="text-yellow-400 hover:text-white text-base sm:text-lg md:text-xl font-mono font-black uppercase cursor-pointer transition-colors"
            >
               VOLTAR [ESC]
            </button>
          </div>

          {/* Body: Two Combat HUD Panels */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 min-h-[300px] md:min-h-[350px]">
            {/* Left Panel: Action Menu (Exact same classes & style as Combat Action Menu) */}
            <div 
              id="combat_style_action_menu"
              className="w-full md:w-5/12 rounded-lg border-[4px] border-slate-200 p-2 md:p-3 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] text-lg sm:text-xl md:text-2xl gap-1 shrink-0"
              style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
            >
              <button 
                id="cfg_btn_delete"
                className={`flex items-center text-left hover:bg-white/20 p-1.5 rounded text-white cursor-pointer transition-colors ${
                  activeOption === 'DELETE_SAVE' ? 'text-yellow-300' : ''
                }`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveOption('DELETE_SAVE');
                }}
              >
                <span className="w-7 text-yellow-400 font-mono font-black">
                  {activeOption === 'DELETE_SAVE' ? '►' : ''}
                </span> 
                Apagar Save
              </button>

              <button 
                id="cfg_btn_audio"
                className={`flex items-center text-left hover:bg-white/20 p-1.5 rounded text-white cursor-pointer transition-colors ${
                  activeOption === 'AUDIO' ? 'text-yellow-300' : ''
                }`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveOption('AUDIO');
                }}
              >
                <span className="w-7 text-yellow-400 font-mono font-black">
                  {activeOption === 'AUDIO' ? '►' : ''}
                </span> 
                Audio / Som
              </button>

              <button 
                id="cfg_btn_speed"
                className={`flex items-center text-left hover:bg-white/20 p-1.5 rounded text-white cursor-pointer transition-colors ${
                  activeOption === 'TEXT_SPEED' ? 'text-yellow-300' : ''
                }`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveOption('TEXT_SPEED');
                }}
              >
                <span className="w-7 text-yellow-400 font-mono font-black">
                  {activeOption === 'TEXT_SPEED' ? '►' : ''}
                </span> 
                Velocidade
              </button>

              <button 
                id="cfg_btn_diff"
                className={`flex items-center text-left hover:bg-white/20 p-1.5 rounded text-white cursor-pointer transition-colors ${
                  activeOption === 'DIFFICULTY' ? 'text-yellow-300' : ''
                }`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveOption('DIFFICULTY');
                }}
              >
                <span className="w-7 text-yellow-400 font-mono font-black">
                  {activeOption === 'DIFFICULTY' ? '►' : ''}
                </span> 
                Dificuldade
              </button>

              <button 
                id="cfg_btn_controls"
                className={`flex items-center text-left hover:bg-white/20 p-1.5 rounded text-white cursor-pointer transition-colors ${
                  activeOption === 'CONTROLS' ? 'text-yellow-300' : ''
                }`}
                onClick={() => {
                  soundFX.playCursor();
                  setActiveOption('CONTROLS');
                }}
              >
                <span className="w-7 text-yellow-400 font-mono font-black">
                  {activeOption === 'CONTROLS' ? '►' : ''}
                </span> 
                Controles
              </button>
            </div>

            {/* Right Panel: Battle Details & Sub-Actions Panel */}
            <div 
              id="combat_style_details_panel"
              className="flex-1 rounded-lg border-[4px] border-slate-200 p-3 md:p-4 flex flex-col justify-between shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] overflow-y-auto"
              style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
            >
              {/* Option 1: APAGAR SAVE */}
              {activeOption === 'DELETE_SAVE' && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-500 pb-1 mb-3">
                      <span className="text-yellow-400 text-base md:text-xl">GERENCIAR ARQUIVO DE SAVE</span>
                      <span className={`text-xs md:text-sm px-2 py-0.5 rounded border ${
                        hasSave ? 'bg-green-700 text-white border-green-400' : 'bg-slate-800 text-slate-400 border-slate-600'
                      }`}>
                        {hasSave ? 'SAVE ATIVO' : 'SEM DADOS'}
                      </span>
                    </div>

                    {hasSave && saveDetails ? (
                      <div className="flex flex-col gap-1.5 text-sm md:text-lg text-slate-200 border-b border-slate-700/80 pb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300">EQUIPE:</span>
                          <span className="text-yellow-400 font-bold">{saveDetails.heroesCount} HEROIS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">OURO ACUMULADO:</span>
                          <span className="text-yellow-400 font-bold">{saveDetails.gold} GP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">PASSOS TOTAIS:</span>
                          <span className="text-cyan-300 font-bold">{saveDetails.steps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">TEMPO DE JOGO:</span>
                          <span className="text-cyan-300 font-bold">{saveDetails.time}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-300 text-sm md:text-base py-2">
                        Nenhum arquivo de progresso salvo encontrado. Inicie um "Novo Jogo" para criar um save.
                      </div>
                    )}
                  </div>

                  {/* Commands / Sub-Actions */}
                  <div className="mt-4 pt-2 border-t border-slate-700/80">
                    {hasSave ? (
                      !confirmDelete ? (
                        <button
                          id="title_delete_save_btn"
                          onClick={() => {
                            soundFX.playSelect();
                            setConfirmDelete(true);
                          }}
                          className="w-full flex items-center text-left hover:bg-white/20 p-2 rounded text-red-400 hover:text-white font-mono uppercase font-black text-base sm:text-lg md:text-xl cursor-pointer"
                        >
                          <span className="w-8 text-yellow-400">►</span> APAGAR DADOS (DELETAR SAVE)
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2 p-2 border-2 border-red-500 bg-black/70 rounded">
                          <div className="text-red-300 text-xs sm:text-sm font-black">
                            CONFIRMA APAGAR DEFINITIVAMENTE O SAVE?
                          </div>
                          <button
                            id="title_confirm_delete_save_btn"
                            onClick={handleExecuteDelete}
                            className="flex items-center text-left hover:bg-red-800/50 p-2 rounded text-red-400 hover:text-white font-mono uppercase font-black text-base sm:text-lg cursor-pointer"
                          >
                            <span className="w-8 text-yellow-400">►</span> [SIM] APAGAR PERMANENTEMENTE
                          </button>
                          <button
                            onClick={() => {
                              soundFX.playCancel();
                              setConfirmDelete(false);
                            }}
                            className="flex items-center text-left hover:bg-white/20 p-2 rounded text-slate-300 hover:text-white font-mono uppercase font-black text-base sm:text-lg cursor-pointer"
                          >
                            <span className="w-8"></span> [NAO] CANCELAR
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">STATUS: PRONTO</span>
                    )}

                    {deleteSuccess && (
                      <div className="mt-2 text-green-400 text-sm md:text-base font-black animate-pulse">
                        SAVE APAGADO COM SUCESSO!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Option 2: AUDIO / SOM */}
              {activeOption === 'AUDIO' && (
                <div className="flex flex-col h-full justify-between overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-5">
                    {/* BGM section */}
                    <div>
                      <div className="border-b border-slate-500 pb-1 mb-2 text-yellow-400 text-base md:text-xl">
                        TRILHA SONORA (BGM)
                      </div>
                      <p className="text-slate-300 text-sm md:text-base leading-snug mb-3">
                        Musicas originais de Prologo, Overworld, Batalha e Vitoria.
                      </p>
                      <div className="flex flex-col gap-1 text-base sm:text-lg md:text-xl">
                        <button
                          onClick={() => {
                            if (!bgmEnabled) handleToggleBgm();
                          }}
                          className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                        >
                          <span className="w-8 text-yellow-400">{bgmEnabled ? '►' : ''}</span> LIGADO (MUSICA ATIVA)
                        </button>
                        <button
                          onClick={() => {
                            if (bgmEnabled) handleToggleBgm();
                          }}
                          className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                        >
                          <span className="w-8 text-yellow-400">{!bgmEnabled ? '►' : ''}</span> MUDO (DESATIVADA)
                        </button>
                      </div>
                    </div>

                    {/* SFX section */}
                    <div>
                      <div className="border-b border-slate-500 pb-1 mb-2 text-yellow-400 text-base md:text-xl">
                        EFEITOS SONOROS 16-BIT
                      </div>
                      <p className="text-slate-300 text-sm md:text-base leading-snug mb-3">
                        Sons de menus, confirmacao, dano e golpes estilo SNES.
                      </p>
                      <div className="flex flex-col gap-1 text-base sm:text-lg md:text-xl">
                        <button
                          onClick={() => {
                            if (!sfxEnabled) handleToggleSound();
                          }}
                          className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                        >
                          <span className="w-8 text-yellow-400">{sfxEnabled ? '►' : ''}</span> LIGADO (EFEITOS ATIVOS)
                        </button>
                        <button
                          onClick={() => {
                            if (sfxEnabled) handleToggleSound();
                          }}
                          className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                        >
                          <span className="w-8 text-yellow-400">{!sfxEnabled ? '►' : ''}</span> MUDO (DESATIVADO)
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 border-t border-slate-700 pt-2 mt-4">
                    STATUS ATUAL: BGM {bgmEnabled ? 'ATIVO' : 'MUDO'} | SFX {sfxEnabled ? 'ATIVO' : 'MUDO'}
                  </div>
                </div>
              )}

              {/* Option 3: VELOCIDADE */}
              {activeOption === 'TEXT_SPEED' && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="border-b border-slate-500 pb-1 mb-3 text-yellow-400 text-base md:text-xl">
                      VELOCIDADE DE TEXTO E BATALHA
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm mb-4">
                      Define a cadencia das mensagens de combate e dialogos no mundo.
                    </p>
                    <div className="flex flex-col gap-1 text-lg sm:text-xl md:text-2xl">
                      <button
                        onClick={() => handleSetSpeed('normal')}
                        className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                      >
                        <span className="w-8 text-yellow-400">{textSpeed === 'normal' ? '►' : ''}</span> 1: VELOCIDADE NORMAL
                      </button>
                      <button
                        onClick={() => handleSetSpeed('fast')}
                        className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                      >
                        <span className="w-8 text-yellow-400">{textSpeed === 'fast' ? '►' : ''}</span> 2: VELOCIDADE RAPIDA
                      </button>
                      <button
                        onClick={() => handleSetSpeed('instant')}
                        className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                      >
                        <span className="w-8 text-yellow-400">{textSpeed === 'instant' ? '►' : ''}</span> 3: TEXTO INSTANTANEO
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                    CONFIGURACAO ATUAL: {textSpeed.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Option 4: DIFICULDADE */}
              {activeOption === 'DIFFICULTY' && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="border-b border-slate-500 pb-1 mb-3 text-yellow-400 text-base md:text-xl">
                      DIFICULDADE DO COMBATE
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm mb-4">
                      Ajusta os atributos e dano causado pelos monstros nas batalhas.
                    </p>
                    <div className="flex flex-col gap-1 text-lg sm:text-xl md:text-2xl">
                      <button
                        onClick={() => handleSetDifficulty('normal')}
                        className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                      >
                        <span className="w-8 text-yellow-400">{difficulty === 'normal' ? '►' : ''}</span> CLASSICO (BALANCEADO)
                      </button>
                      <button
                        onClick={() => handleSetDifficulty('hard')}
                        className="flex items-center text-left hover:bg-white/20 p-2 rounded text-white cursor-pointer"
                      >
                        <span className="w-8 text-yellow-400">{difficulty === 'hard' ? '►' : ''}</span> DESAFIO (MONSTROS FORTES)
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                    MODO ATUAL: {difficulty === 'normal' ? 'CLASSICO' : 'DESAFIO (HARD)'}
                  </div>
                </div>
              )}

              {/* Option 5: CONTROLES */}
              {activeOption === 'CONTROLS' && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="border-b border-slate-500 pb-1 mb-3 text-yellow-400 text-base md:text-xl">
                      GUIA DE COMANDOS
                    </div>
                    <div className="flex flex-col gap-2.5 text-sm sm:text-base md:text-lg text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">►</span>
                        <span className="text-white font-bold">WASD / SETAS:</span>
                        <span className="text-slate-300">Mover no mapa &amp; menus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">►</span>
                        <span className="text-white font-bold">ENTER / ESPACO:</span>
                        <span className="text-slate-300">Confirmar &amp; Interagir</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">►</span>
                        <span className="text-white font-bold">ESC / TECLA M:</span>
                        <span className="text-slate-300">Menu Pause / Voltar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">►</span>
                        <span className="text-white font-bold">MOUSE:</span>
                        <span className="text-slate-300">Totalmente jogavel por cliques</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                    SUPORTE TOTAL A TECLADO E MOUSE
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
