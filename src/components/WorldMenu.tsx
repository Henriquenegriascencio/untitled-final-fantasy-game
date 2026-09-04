import React, { useState, useEffect } from 'react';
import { Player, Hero, Item, HeroClass } from '../types';
import { HeroPortrait } from './HeroPortrait';
import { soundFX } from '../utils/audio';

type MenuCommand = 'Item' | 'Skills' | 'Equip' | 'Relic' | 'Status' | 'Config' | 'Save';

interface WorldMenuProps {
  player: Player;
  playTimeSeconds: number;
  totalSteps: number;
  onClose: () => void;
  onSave: () => void;
  onUpdateParty: (updatedParty: Hero[], updatedItems: Item[]) => void;
  onEquipWeapon?: (heroId: string, weaponId: string) => void;
}

// Iconic FF6 Blue Gradient Window Component
const FF6Window: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}> = ({ children, className = '', id, onClick }) => (
  <div
    id={id}
    onClick={onClick}
    className={`relative rounded-lg border-[4px] border-slate-200 p-3 md:p-4 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black ${className}`}
    style={{
      background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)',
    }}
  >
    {children}
  </div>
);

// Classic FF6 Pointer Cursor
const FF6Cursor: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  return (
    <span className="inline-flex items-center mr-1 text-white animate-[bounce_1s_infinite] select-none">
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="drop-shadow-[2px_2px_0_#000]">
        {/* SNES White Glove Pointer */}
        <path
          d="M2 9 C2 8 3 7 5 7 L12 7 L12 4 C12 2.5 13.5 1.5 15 2.5 C16 3.2 16.5 4.5 16 6 L16 8 L20 8 C22 8 23 9.5 22 11 L18 12 L21 12.5 C22.5 13 22.5 14.5 21 15 L17 15 L19 16 C20 16.5 20 18 18.5 18.5 L12 18.5 C8 18.5 5 17 2 13 Z"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <path d="M12 8 L18 8" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M12 11.5 L17 11.5" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="7" cy="11" r="1.5" fill="#64748b" />
      </svg>
    </span>
  );
};

export const WorldMenu: React.FC<WorldMenuProps> = ({
  player,
  playTimeSeconds,
  totalSteps,
  onClose,
  onSave,
  onUpdateParty,
}) => {
  const [activeCommand, setActiveCommand] = useState<MenuCommand>('Item');
  const [subView, setSubView] = useState<MenuCommand | null>(null);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [useTargetPrompt, setUseTargetPrompt] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Default party fallback if player started before creation or has empty party
  const party: Hero[] = player.party && player.party.length > 0 ? player.party : [
    {
      id: 'default_1',
      name: 'CELES',
      heroClass: 'Cavalheiro' as HeroClass,
      level: 19,
      exp: 4200,
      stats: { hp: 485, maxHp: 615, mp: 154, maxMp: 158, sp: 0, maxSp: 100, for: 28, int: 22, def: 24, mov: 4, vel: 14 },
      weapon: { id: 'w1', name: 'Espada Longa', type: 'espada', range: 1, damage: 25 },
      emoji: '⚔️',
      magics: ['Cura', 'Nevasca']
    },
    {
      id: 'default_2',
      name: 'LOCKE',
      heroClass: 'Arqueiro' as HeroClass,
      level: 20,
      exp: 4800,
      stats: { hp: 658, maxHp: 684, mp: 161, maxMp: 161, sp: 0, maxSp: 100, for: 24, int: 16, def: 18, mov: 4, vel: 20 },
      weapon: { id: 'w2', name: 'Arco Curto', type: 'arco', range: 4, damage: 22 },
      emoji: '🏹',
      magics: ['Rajada', 'Veneno']
    },
    {
      id: 'default_3',
      name: 'EDGAR',
      heroClass: 'Inventor' as HeroClass,
      level: 20,
      exp: 4750,
      stats: { hp: 569, maxHp: 685, mp: 149, maxMp: 160, sp: 0, maxSp: 100, for: 26, int: 20, def: 22, mov: 4, vel: 16 },
      weapon: { id: 'w3', name: 'Chave Inglesa', type: 'ferramenta', range: 1, damage: 24 },
      emoji: '⚙️',
      magics: ['Auto-Crossbow', 'Flash']
    },
    {
      id: 'default_4',
      name: 'CYAN',
      heroClass: 'Lutador' as HeroClass,
      level: 16,
      exp: 3100,
      stats: { hp: 452, maxHp: 452, mp: 116, maxMp: 116, sp: 0, maxSp: 100, for: 32, int: 12, def: 26, mov: 4, vel: 12 },
      weapon: { id: 'w4', name: 'Katana Ancestral', type: 'espada', range: 1, damage: 30 },
      emoji: '🥊',
      magics: ['Presa do Dragao', 'Concentracao']
    }
  ];

  const commands: MenuCommand[] = ['Item', 'Skills', 'Equip', 'Relic', 'Status', 'Config', 'Save'];

  // Format play time HH:MM or MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        if (subView) {
          soundFX.playCancel();
          setSubView(null);
          setUseTargetPrompt(false);
        } else {
          soundFX.playCancel();
          onClose();
        }
        return;
      }

      if (!subView) {
        // Main command menu navigation
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          soundFX.playCursor();
          setActiveCommand((prev) => {
            const idx = commands.indexOf(prev);
            const nextIdx = (idx - 1 + commands.length) % commands.length;
            return commands[nextIdx];
          });
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          soundFX.playCursor();
          setActiveCommand((prev) => {
            const idx = commands.indexOf(prev);
            const nextIdx = (idx + 1) % commands.length;
            return commands[nextIdx];
          });
        } else if (e.key === 'Enter' || e.key === ' ') {
          handleExecuteCommand(activeCommand);
        }
      } else if (subView === 'Item' && useTargetPrompt) {
        // Target selection for item
        if (e.key === 'ArrowUp' || e.key === 'w') {
          soundFX.playCursor();
          setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          soundFX.playCursor();
          setSelectedHeroIndex((prev) => (prev + 1) % party.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
          handleApplyItem(selectedItemIndex, selectedHeroIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCommand, subView, useTargetPrompt, selectedItemIndex, selectedHeroIndex, party.length, onClose]);

  const handleExecuteCommand = (cmd: MenuCommand) => {
    if (cmd === 'Save') {
      soundFX.playSave();
      onSave();
      setFeedbackMessage('Jogo Salvo com Sucesso! ⭐');
      setTimeout(() => setFeedbackMessage(null), 2500);
      return;
    }
    soundFX.playSelect();
    setSubView(cmd);
  };

  // Item Usage logic
  const handleApplyItem = (itemIdx: number, heroIdx: number) => {
    const items = [...player.inventory.items];
    const item = items[itemIdx];
    if (!item || item.count <= 0) return;

    const target = party[heroIdx];
    if (!target) return;

    // Check if already at max HP
    if (target.stats.hp >= target.stats.maxHp) {
      soundFX.playCancel();
      setFeedbackMessage(`${target.name} ja esta com a vida cheia!`);
      setTimeout(() => setFeedbackMessage(null), 2000);
      return;
    }

    // Apply heal
    soundFX.playHeal();
    const healedHp = Math.min(target.stats.maxHp, target.stats.hp + item.heal);
    const updatedParty = party.map((h, i) =>
      i === heroIdx ? { ...h, stats: { ...h.stats, hp: healedHp } } : h
    );

    // Reduce item count
    const updatedItems = items
      .map((it, i) => (i === itemIdx ? { ...it, count: it.count - 1 } : it))
      .filter((it) => it.count > 0);

    onUpdateParty(updatedParty, updatedItems);
    setUseTargetPrompt(false);
    setFeedbackMessage(`+${item.heal} HP em ${target.name}! ✨`);
    setTimeout(() => setFeedbackMessage(null), 2000);
  };

  // Cast Cura in menu
  const handleCastCura = (heroIdx: number, targetIdx: number) => {
    const caster = party[heroIdx];
    const target = party[targetIdx];
    if (!caster || !target) return;

    if (caster.stats.mp < 10) {
      soundFX.playCancel();
      setFeedbackMessage(`${caster.name} nao tem MP suficiente! (Requer 10 MP)`);
      setTimeout(() => setFeedbackMessage(null), 2000);
      return;
    }

    soundFX.playHeal();
    const newMp = caster.stats.mp - 10;
    const healAmount = 60 + caster.stats.int * 2;
    const newHp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);

    const updatedParty = party.map((h, i) => {
      if (i === heroIdx && i === targetIdx) {
        return { ...h, stats: { ...h.stats, mp: newMp, hp: newHp } };
      }
      if (i === heroIdx) {
        return { ...h, stats: { ...h.stats, mp: newMp } };
      }
      if (i === targetIdx) {
        return { ...h, stats: { ...h.stats, hp: newHp } };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    setFeedbackMessage(`${caster.name} curou ${healAmount} HP em ${target.name}! 💚`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  return (
    <div
      id="ff6_world_menu"
      className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 select-none font-mono"
    >
      <div className="relative w-full max-w-[960px] h-[640px] md:h-[680px] flex flex-col justify-between">
        
        {/* Banner Notification for Save / Heal Feedback */}
        {feedbackMessage && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 border-2 border-white text-slate-950 font-black px-6 py-2 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.9)] animate-bounce text-sm md:text-base tracking-wider">
            {feedbackMessage}
          </div>
        )}

        {/* Main Grid: Left Party List (68%) + Right Windows (32%) */}
        <div className="grid grid-cols-12 gap-3 h-full">

          {/* ================= LEFT PARTY PANEL ================= */}
          <FF6Window id="ff6_party_panel" className="col-span-8 h-full justify-around">
            <div className="flex flex-col h-full justify-between py-1">
              {party.map((hero, idx) => {
                const isTargetSelected = useTargetPrompt && selectedHeroIndex === idx;
                const hpRatio = hero.stats.hp / hero.stats.maxHp;
                const hpColor =
                  hpRatio > 0.5
                    ? 'text-white'
                    : hpRatio > 0.25
                    ? 'text-yellow-300'
                    : 'text-red-400';

                return (
                  <div
                    key={hero.id || idx}
                    id={`ff6_hero_row_${idx}`}
                    onClick={() => {
                      soundFX.playCursor();
                      setSelectedHeroIndex(idx);
                      if (subView === 'Item' && useTargetPrompt) {
                        handleApplyItem(selectedItemIndex, idx);
                      }
                    }}
                    className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      isTargetSelected
                        ? 'bg-blue-600/40 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                        : selectedHeroIndex === idx && subView
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Optional Finger Cursor when targeting a hero */}
                    {useTargetPrompt && (
                      <div className="w-5 shrink-0">
                        {isTargetSelected && <FF6Cursor />}
                      </div>
                    )}

                    {/* Character Portrait (Authentic FF6 bust) */}
                    <HeroPortrait
                      heroClass={hero.heroClass}
                      emoji={hero.emoji}
                      name={hero.name}
                      className="w-16 h-16 md:w-20 md:h-20"
                    />

                    {/* Character Stats in pure FF6 SNES alignment */}
                    <div className="flex flex-col justify-center flex-1 font-mono leading-tight tracking-wider">
                      {/* Row 1: Name */}
                      <div 
                        style={idx === 0 ? { fontSize: '40px', lineHeight: '21px' } : { fontSize: '40px', lineHeight: '20px' }}
                        className="text-xl md:text-2xl font-black text-white drop-shadow-[2px_2px_0_#000000] tracking-widest uppercase"
                      >
                        {hero.name}
                      </div>

                      {/* Row 2: LV */}
                      <div 
                        style={{ fontSize: '40px', lineHeight: '20px' }}
                        className="flex items-center gap-4 text-base md:text-lg mt-0.5"
                      >
                        <span className="text-[#38bdf8] font-bold drop-shadow-[1px_1px_0_#000]">LV</span>
                        <span className="text-white font-bold drop-shadow-[1px_1px_0_#000] min-w-[32px]">
                          {hero.level}
                        </span>
                      </div>

                      {/* Row 3: HP */}
                      <div 
                        style={{ fontSize: '40px', lineHeight: '20px' }}
                        className="flex items-center gap-3 text-base md:text-lg"
                      >
                        <span className="text-[#38bdf8] font-bold drop-shadow-[1px_1px_0_#000]">HP</span>
                        <span className={`font-bold drop-shadow-[1px_1px_0_#000] ${hpColor}`}>
                          {String(hero.stats.hp).padStart(3, ' ')}/
                          <span className="text-white ml-1">{String(hero.stats.maxHp).padStart(3, ' ')}</span>
                        </span>
                      </div>

                      {/* Row 4: MP */}
                      <div 
                        style={{ fontSize: '40px', lineHeight: '20px' }}
                        className="flex items-center gap-3 text-base md:text-lg"
                      >
                        <span className="text-[#38bdf8] font-bold drop-shadow-[1px_1px_0_#000]">MP</span>
                        <span className="text-white font-bold drop-shadow-[1px_1px_0_#000]">
                          {String(hero.stats.mp).padStart(3, ' ')}/
                          <span className="text-white ml-1">{String(hero.stats.maxMp).padStart(3, ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FF6Window>

          {/* ================= RIGHT COLUMN (3 Sub-Windows) ================= */}
          <div className="col-span-4 flex flex-col gap-3 h-full justify-between">

            {/* Sub-Window 1: Commands Menu */}
            <FF6Window id="ff6_commands_window" className="flex-1 justify-between py-3">
              <div className="flex flex-col justify-around h-full">
                {commands.map((cmd) => {
                  const isSelected = activeCommand === cmd;
                  return (
                    <button
                      key={cmd}
                      id={`ff6_cmd_${cmd.toLowerCase()}`}
                      onMouseEnter={() => {
                        if (activeCommand !== cmd) {
                          soundFX.playCursor();
                          setActiveCommand(cmd);
                        }
                      }}
                      onClick={() => handleExecuteCommand(cmd)}
                      className={`flex items-center text-left text-lg md:text-2xl font-bold tracking-widest uppercase transition-colors px-2 py-0.5 rounded ${
                        isSelected
                          ? 'text-white drop-shadow-[2px_2px_0_#000]'
                          : 'text-slate-300 hover:text-white drop-shadow-[1px_1px_0_#000]'
                      }`}
                    >
                      <div className="w-6 shrink-0 flex items-center justify-center">
                        <FF6Cursor active={isSelected} />
                      </div>
                      <span 
                        style={{ fontSize: '40px', lineHeight: '4px' }}
                        className="ml-1"
                      >
                        {cmd}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FF6Window>

            {/* Sub-Window 2: Time */}
            <FF6Window id="ff6_time_window" className="py-2.5 px-4 h-20 justify-center">
              <div className="flex items-center justify-between">
                <span 
                  style={{ fontSize: '40px', lineHeight: '28px' }}
                  className="text-[#38bdf8] font-bold text-lg md:text-xl drop-shadow-[1px_1px_0_#000]"
                >
                  Time
                </span>
                <span 
                  style={{ fontSize: '40px' }}
                  className="text-white font-black text-xl md:text-2xl drop-shadow-[2px_2px_0_#000] tracking-widest"
                >
                  {formatTime(playTimeSeconds)}
                </span>
              </div>
            </FF6Window>

            {/* Sub-Window 3: Steps & GP */}
            <FF6Window id="ff6_steps_gp_window" className="py-3 px-4 h-28 justify-around">
              <div className="flex items-center justify-between">
                <span 
                  style={{ fontSize: '40px', lineHeight: '4px' }}
                  className="text-[#38bdf8] font-bold text-lg md:text-xl drop-shadow-[1px_1px_0_#000]"
                >
                  Steps
                </span>
                <span 
                  style={{ fontSize: '40px', lineHeight: '4px' }}
                  className="text-white font-black text-lg md:text-xl drop-shadow-[1px_1px_0_#000]"
                >
                  {totalSteps}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span 
                  style={{ fontSize: '40px', lineHeight: '4px' }}
                  className="text-[#38bdf8] font-bold text-lg md:text-xl drop-shadow-[1px_1px_0_#000]"
                >
                  GP
                </span>
                <span 
                  style={{ fontSize: '40px', lineHeight: '4px' }}
                  className="text-white font-black text-xl md:text-2xl drop-shadow-[2px_2px_0_#000]"
                >
                  {player.gold}
                </span>
              </div>
            </FF6Window>

          </div>
        </div>

        {/* Bottom Help / Exit Bar */}
        <div className="flex items-center justify-between px-2 pt-2 text-xs md:text-sm text-slate-300 font-bold">
          <div className="flex items-center gap-4">
            <span>[▲▼ / W, S] Navegar</span>
            <span>[ENTER / ESPACO] Selecionar</span>
            <span>[ESC / M] Fechar Menu</span>
          </div>
          <button
            id="ff6_close_button"
            onClick={() => {
              soundFX.playCancel();
              onClose();
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded border border-slate-500 uppercase tracking-wider font-black transition-colors"
          >
            ✕ Fechar
          </button>
        </div>

        {/* ================= MODAL SUB-VIEWS ================= */}
        {subView && (
          <div 
            id="ff6_subview_modal"
            className="absolute inset-0 rounded-lg border-[4px] border-slate-200 p-3 md:p-5 z-40 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
          >
            {/* Header with Back Button styled like Combat action menu */}
            <div className="flex items-center justify-between border-b-2 border-slate-600 pb-2 mb-3 shrink-0">
              <button
                id="ff6_subview_back"
                onClick={() => {
                  soundFX.playCancel();
                  setSubView(null);
                  setUseTargetPrompt(false);
                }}
                className="text-yellow-400 hover:text-white text-left font-mono font-black text-2xl md:text-3xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>←</span>
                <span>VOLTAR [ESC]</span>
              </button>

              <div className="text-white text-2xl md:text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                {subView === 'Item' && '🎒 ITENS'}
                {subView === 'Skills' && '✨ HABILIDADES & MAGIAS'}
                {subView === 'Equip' && '🛡️ EQUIPAMENTO'}
                {subView === 'Relic' && '💎 RELIQUIAS ELEMENTAIS'}
                {subView === 'Status' && '📊 STATUS DA EQUIPE'}
                {subView === 'Config' && '⚙️ CONFIGURACOES'}
              </div>
            </div>

            {/* ================= 1. ITEM SUB-VIEW ================= */}
            {subView === 'Item' && (
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                <div className="text-yellow-400 text-lg md:text-xl font-black tracking-wider flex items-center gap-2">
                  <span>►</span>
                  <span>
                    {useTargetPrompt
                      ? 'SELECIONE UM HEROI DA EQUIPE PARA USAR O ITEM:'
                      : 'SELECIONE UM ITEM DO INVENTARIO:'}
                  </span>
                </div>

                {player.inventory.items.length === 0 ? (
                  <div className="p-8 text-center text-slate-300 text-xl md:text-2xl border-[2px] border-dashed border-slate-600 rounded-lg">
                    INVENTARIO VAZIO! VISITE AS LOJAS DAS CIDADES PARA COMPRAR POCOES.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {player.inventory.items.map((it, idx) => (
                      <button
                        key={it.id || idx}
                        id={`ff6_inv_item_${idx}`}
                        onClick={() => {
                          soundFX.playSelect();
                          setSelectedItemIndex(idx);
                          setUseTargetPrompt(true);
                        }}
                        className={`flex items-center justify-between text-left hover:bg-white/20 p-2 rounded disabled:opacity-50 text-white font-mono uppercase font-black text-xl md:text-3xl transition-colors cursor-pointer border-[2px] shadow-[inset_0_0_0_1px_#000] ${
                          useTargetPrompt && selectedItemIndex === idx
                            ? 'bg-blue-600 border-yellow-300 text-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                            : 'bg-black/50 border-blue-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-yellow-400 font-black">
                            {useTargetPrompt && selectedItemIndex === idx ? '►' : ''}
                          </span>
                          <span className="text-2xl">🧪</span>
                          <span>{it.name}</span>
                          <span className="text-base md:text-xl text-green-400 ml-2">
                            (+{it.heal} HP)
                          </span>
                        </div>
                        <span className="text-yellow-400 font-mono text-2xl md:text-3xl">
                          x{it.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Party Target selector styled like Combat action menu */}
                {useTargetPrompt && (
                  <div 
                    className="mt-3 p-3 rounded-lg border-[3px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex flex-col gap-1"
                    style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                  >
                    <div className="text-yellow-400 text-xl md:text-2xl font-black mb-2 flex items-center gap-2">
                      <span>►</span>
                      <span>SELECIONE O ALVO PARA CURAR:</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {party.map((h, hIdx) => (
                        <button
                          key={h.id}
                          id={`ff6_item_target_${hIdx}`}
                          onClick={() => handleApplyItem(selectedItemIndex, hIdx)}
                          className="flex items-center justify-between text-left hover:bg-white/20 p-2 rounded text-white font-mono uppercase font-black text-xl md:text-2xl border border-transparent hover:border-yellow-400 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 text-yellow-400">►</span>
                            <span className="text-2xl">{h.emoji}</span>
                            <span>{h.name}</span>
                            <span className="text-sm md:text-base text-cyan-300 ml-1">({h.heroClass})</span>
                          </div>
                          <div className="flex items-center gap-4 text-lg md:text-xl">
                            <span className="text-yellow-300">LV {h.level}</span>
                            <span className={h.stats.hp <= h.stats.maxHp * 0.25 ? 'text-red-400 font-black' : 'text-white'}>
                              HP {h.stats.hp}/{h.stats.maxHp}
                            </span>
                            <span className="text-cyan-400">
                              MP {h.stats.mp}/{h.stats.maxMp}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= 2. SKILLS SUB-VIEW ================= */}
            {subView === 'Skills' && (
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                {/* Hero selector row styled like Combat unit queue ribbon */}
                <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-600 overflow-x-auto shrink-0">
                  <span className="text-yellow-400 text-sm md:text-base whitespace-nowrap">► HEROI:</span>
                  {party.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        soundFX.playCursor();
                        setSelectedHeroIndex(i);
                      }}
                      className={`px-3 py-1.5 rounded font-mono font-black text-base md:text-xl uppercase transition-all flex items-center gap-1.5 border-[2px] shadow-[inset_0_0_0_1px_#000] cursor-pointer ${
                        selectedHeroIndex === i
                          ? 'bg-blue-600 text-white border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-105'
                          : 'bg-black/60 text-slate-300 border-blue-900 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-xl">{h.emoji}</span>
                      <span>{h.name}</span>
                    </button>
                  ))}
                </div>

                {/* Skills Container Box in Combat Menu style */}
                <div 
                  className="rounded-lg border-[3px] border-slate-200 p-3 md:p-4 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex-1"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-600 mb-3 text-xl md:text-2xl">
                    <span className="text-yellow-400 font-black">
                      MAGIAS DE {party[selectedHeroIndex]?.name} ({party[selectedHeroIndex]?.heroClass})
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">
                      MP: {party[selectedHeroIndex]?.stats.mp}/{party[selectedHeroIndex]?.stats.maxMp}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xl md:text-3xl">
                    {[
                      { name: 'Cura', cost: 10, desc: 'Restaura HP de um aliado', canCast: true },
                      { name: 'Fogo', cost: 15, desc: 'Ataque elemental de chamas', canCast: false },
                      { name: 'Nevasca', cost: 18, desc: 'Explosao de gelo cortante', canCast: false },
                      { name: 'Trovão', cost: 20, desc: 'Raio de alto impacto', canCast: false },
                    ].map((sp) => (
                      <div
                        key={sp.name}
                        className="flex items-center justify-between text-left hover:bg-white/20 p-2 rounded text-white font-mono uppercase font-black transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-yellow-400">►</span>
                          <span>{sp.name}</span>
                          <span className="text-sm md:text-lg text-slate-300 lowercase font-normal ml-2">
                            ({sp.desc})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-mono text-xl md:text-2xl">
                            {sp.cost} MP
                          </span>
                          {sp.canCast && (
                            <button
                              onClick={() => handleCastCura(selectedHeroIndex, selectedHeroIndex)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm md:text-base font-black rounded border-2 border-white shadow-[inset_0_0_0_1px_#000] cursor-pointer active:scale-95"
                            >
                              CONJURAR
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3. EQUIP SUB-VIEW ================= */}
            {subView === 'Equip' && (
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                {/* Hero selector row styled like Combat unit queue ribbon */}
                <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-600 overflow-x-auto shrink-0">
                  <span className="text-yellow-400 text-sm md:text-base whitespace-nowrap">► HEROI:</span>
                  {party.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        soundFX.playCursor();
                        setSelectedHeroIndex(i);
                      }}
                      className={`px-3 py-1.5 rounded font-mono font-black text-base md:text-xl uppercase transition-all flex items-center gap-1.5 border-[2px] shadow-[inset_0_0_0_1px_#000] cursor-pointer ${
                        selectedHeroIndex === i
                          ? 'bg-blue-600 text-white border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-105'
                          : 'bg-black/60 text-slate-300 border-blue-900 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-xl">{h.emoji}</span>
                      <span>{h.name}</span>
                    </button>
                  ))}
                </div>

                <div 
                  className="rounded-lg border-[3px] border-slate-200 p-4 flex flex-col shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex-1"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <h3 className="text-2xl md:text-3xl font-black text-yellow-400 mb-4 flex items-center gap-2">
                    <span>►</span>
                    <span>EQUIPAMENTO DE {party[selectedHeroIndex]?.name}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border-[2px] border-slate-200 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                      <div className="text-slate-400 text-base mb-1 uppercase tracking-wider">Arma Principal</div>
                      <div className="text-white text-2xl md:text-4xl font-black">
                        {party[selectedHeroIndex]?.weapon.name}
                      </div>
                      <div className="text-yellow-400 text-lg md:text-2xl mt-3 font-bold">
                        DANO: +{party[selectedHeroIndex]?.weapon.damage} | ALCANCE: {party[selectedHeroIndex]?.weapon.range}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border-[2px] border-slate-200 bg-black/60 shadow-[inset_0_0_0_1px_#000]">
                      <div className="text-slate-400 text-base mb-1 uppercase tracking-wider">Armadura & Reliquia</div>
                      <div className="text-white text-2xl md:text-4xl font-black">Manto Real de Eldoria</div>
                      <div className="text-green-400 text-lg md:text-2xl mt-3 font-bold">
                        DEFESA: +{party[selectedHeroIndex]?.stats.def} | MOVIMENTO: {party[selectedHeroIndex]?.stats.mov}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. RELIC SUB-VIEW (4 Elements) ================= */}
            {subView === 'Relic' && (
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                <div className="text-yellow-400 text-lg md:text-xl font-black tracking-wider flex items-center gap-2">
                  <span>►</span>
                  <span>ARTEFATOS ELEMENTAIS DE ELDORIA:</span>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {[
                    { id: 'Fogo', emoji: '🔥', dungeon: 'Masmorra do Fogo', desc: 'Concede poder igneo devastador.' },
                    { id: 'Agua', emoji: '💧', dungeon: 'Masmorra da Agua', desc: 'Restaura a pureza dos rios e fontes.' },
                    { id: 'Ar', emoji: '🌪️', dungeon: 'Masmorra do Ar', desc: 'Controla as correntes e ventos celestes.' },
                    { id: 'Terra', emoji: '🪨', dungeon: 'Masmorra da Terra', desc: 'Estabiliza montanhas e abismos.' },
                  ].map((art) => {
                    const owned = player.artifacts.includes(art.id);
                    return (
                      <div
                        key={art.id}
                        className={`rounded-lg border-[3px] border-slate-200 p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all ${
                          owned
                            ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                            : 'opacity-70 border-blue-900'
                        }`}
                        style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                      >
                        <span className="text-5xl">{art.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-black text-xl md:text-3xl">ARTEFATO DE {art.id}</span>
                            <span
                              className={`text-xs md:text-sm font-black px-2 py-0.5 rounded-sm border border-black shadow ${
                                owned
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-black/80 text-slate-400 border-slate-600'
                              }`}
                            >
                              {owned ? '✓ COLETADO' : 'PENDENTE'}
                            </span>
                          </div>
                          <div className="text-sm md:text-base text-cyan-300 mt-1">Local: {art.dungeon}</div>
                          <div className="text-xs md:text-sm text-slate-300 mt-0.5">{art.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= 5. STATUS SUB-VIEW ================= */}
            {subView === 'Status' && (
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                {/* Hero selector row styled like Combat unit queue ribbon */}
                <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-600 overflow-x-auto shrink-0">
                  <span className="text-yellow-400 text-sm md:text-base whitespace-nowrap">► HEROI:</span>
                  {party.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        soundFX.playCursor();
                        setSelectedHeroIndex(i);
                      }}
                      className={`px-3 py-1.5 rounded font-mono font-black text-base md:text-xl uppercase transition-all flex items-center gap-1.5 border-[2px] shadow-[inset_0_0_0_1px_#000] cursor-pointer ${
                        selectedHeroIndex === i
                          ? 'bg-blue-600 text-white border-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-105'
                          : 'bg-black/60 text-slate-300 border-blue-900 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-xl">{h.emoji}</span>
                      <span>{h.name}</span>
                    </button>
                  ))}
                </div>

                {party[selectedHeroIndex] && (
                  <div 
                    className="rounded-lg border-[4px] border-slate-200 p-4 md:p-6 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex gap-6 flex-1 items-center"
                    style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                  >
                    <div className="border-[3px] border-slate-200 rounded-lg p-1.5 bg-black/60 shadow-[inset_0_0_0_1px_#000] shrink-0">
                      <HeroPortrait
                        heroClass={party[selectedHeroIndex].heroClass}
                        emoji={party[selectedHeroIndex].emoji}
                        name={party[selectedHeroIndex].name}
                        className="w-32 h-32 md:w-40 md:h-40"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-3xl md:text-5xl font-black text-white">{party[selectedHeroIndex].name}</div>
                        <div className="text-yellow-400 font-black text-xl md:text-2xl mt-1">{party[selectedHeroIndex].heroClass}</div>
                        <div className="text-cyan-400 font-mono text-xl md:text-2xl mt-2 font-bold">NIVEL: {party[selectedHeroIndex].level}</div>
                        <div className="text-slate-300 font-mono text-base md:text-lg mt-1">
                          EXP: {party[selectedHeroIndex].exp} / {party[selectedHeroIndex].level * 100}
                        </div>
                        {/* SP Gauge from Combat */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-lg md:text-xl text-yellow-400 font-black">SP</span>
                          <div className="flex-1 h-3.5 bg-slate-900 border border-slate-400 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all" 
                              style={{ width: `${((party[selectedHeroIndex].stats.sp || 0) / (party[selectedHeroIndex].stats.maxSp || 100)) * 100}%` }} 
                            />
                          </div>
                          <span className="text-xs text-slate-300 font-mono">
                            {party[selectedHeroIndex].stats.sp || 0}/{party[selectedHeroIndex].stats.maxSp || 100}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 font-mono text-lg md:text-2xl font-black">
                        <div className="text-white">HP: <span className="text-green-400">{party[selectedHeroIndex].stats.hp}/{party[selectedHeroIndex].stats.maxHp}</span></div>
                        <div className="text-white">MP: <span className="text-cyan-400">{party[selectedHeroIndex].stats.mp}/{party[selectedHeroIndex].stats.maxMp}</span></div>
                        <div className="text-white">FOR (FORCA): <span className="text-yellow-400">{party[selectedHeroIndex].stats.for}</span></div>
                        <div className="text-white">INT (MAGIA): <span className="text-cyan-400">{party[selectedHeroIndex].stats.int}</span></div>
                        <div className="text-white">DEF (DEFESA): <span className="text-green-400">{party[selectedHeroIndex].stats.def}</span></div>
                        <div className="text-white">VEL (VELOCIDADE): <span className="text-purple-400">{party[selectedHeroIndex].stats.vel}</span></div>
                        <div className="text-white">MOV (MOVIMENTO): <span className="text-sky-400">{party[selectedHeroIndex].stats.mov}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= 6. CONFIG SUB-VIEW ================= */}
            {subView === 'Config' && (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-w-xl mx-auto w-full justify-center">
                <div 
                  className="rounded-lg border-[3px] border-slate-200 p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex justify-between items-center"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <div>
                    <div className="text-white font-black text-xl md:text-2xl">EFEITOS SONOROS 16-BIT</div>
                    <div className="text-xs md:text-sm text-slate-300 font-normal">Sons de menu e batalha estilo SNES</div>
                  </div>
                  <button
                    onClick={() => {
                      soundFX.enabled = !soundFX.enabled;
                      if (soundFX.enabled) soundFX.playSelect();
                    }}
                    className={`px-6 py-2 rounded font-black text-base md:text-xl uppercase border-2 shadow-[inset_0_0_0_1px_#000] cursor-pointer active:scale-95 transition-all ${
                      soundFX.enabled 
                        ? 'bg-green-600 text-white border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                        : 'bg-red-800 text-slate-300 border-red-500'
                    }`}
                  >
                    {soundFX.enabled ? 'LIGADO' : 'MUDO'}
                  </button>
                </div>

                <div 
                  className="rounded-lg border-[3px] border-slate-200 p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex justify-between items-center"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <div>
                    <div className="text-white font-black text-xl md:text-2xl">TECLAS DE ATALHO</div>
                    <div className="text-xs md:text-sm text-slate-300 font-normal">WASD / Setas para mover. M para abrir este menu.</div>
                  </div>
                  <span className="text-yellow-400 font-mono font-black text-2xl">[M]</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
