import React, { useState, useEffect } from 'react';
import { Player, Hero } from '../types';
import { ITEMS, WEAPONS } from '../constants';
import { soundFX } from '../utils/audio';
import { SPELLS_CATALOG, getMagicDotBadge, SpellDefinition, MagicCategory } from '../utils/magicData';

type ShopProps = {
  player: Player;
  onBuyItem: (itemId: string) => void;
  onBuyWeapon: (weaponId: string, price: number) => void;
  onTeachSpell: (spellId: string, heroId: string, price: number) => void;
  onExit: () => void;
};

export const Shop: React.FC<ShopProps> = ({
  player,
  onBuyItem,
  onBuyWeapon,
  onTeachSpell,
  onExit,
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'WEAPONS' | 'MAGIC'>('MAGIC');
  const [magicFilter, setMagicFilter] = useState<'ALL' | MagicCategory>('ALL');
  const [selectedSpellToTeach, setSelectedSpellToTeach] = useState<SpellDefinition | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Global ESC key listener to exit shop smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundFX.playCancel();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const spellsList = Object.values(SPELLS_CATALOG);
  const filteredSpells = spellsList.filter(s => {
    if (magicFilter === 'ALL') return true;
    return s.category === magicFilter;
  });

  const handleSelectSpell = (spell: SpellDefinition) => {
    if (player.gold < spell.price) {
      soundFX.playCancel();
      setFeedback('Ouro insuficiente para adquirir este tomo de magia!');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    soundFX.playSelect();
    setSelectedSpellToTeach(spell);
  };

  const handleConfirmTeach = (hero: Hero) => {
    if (!selectedSpellToTeach) return;
    const heroAlreadyKnows = hero.magics?.some(
      m => m.toLowerCase() === selectedSpellToTeach.name.toLowerCase() || m.toLowerCase() === selectedSpellToTeach.id.toLowerCase()
    );
    if (heroAlreadyKnows) {
      soundFX.playCancel();
      setFeedback(`${hero.name} ja domina a magia ${selectedSpellToTeach.name}!`);
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    onTeachSpell(selectedSpellToTeach.id, hero.id, selectedSpellToTeach.price);
    soundFX.playSelect();
    setFeedback(`Magia ${selectedSpellToTeach.name} ensinada com sucesso a ${hero.name}!`);
    setSelectedSpellToTeach(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div
      id="shop_main_container"
      className="flex flex-col items-center max-w-4xl mx-auto w-full max-h-[92vh] p-4 md:p-6 rounded-lg border-[4px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black overflow-hidden relative select-none"
      style={{
        background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)',
      }}
    >
      {/* Top Header with Gold and prominent Close Button */}
      <div className="flex justify-between items-center w-full border-b-2 border-slate-600 pb-3 mb-3 gap-3">
        <div className="flex-1">
          <h2 className="text-xl md:text-3xl text-yellow-400 tracking-wider">
            SANTUARIO E LOJA DA CIDADE
          </h2>
          <div className="text-xs text-slate-300 font-normal tracking-wide lowercase mt-0.5 hidden sm:block">
            itens de cura, forja de equipamentos e aprendizado dos 3 tipos de magias
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-base md:text-2xl text-yellow-300 font-mono tracking-widest bg-black/60 px-3 py-1 rounded border border-yellow-500/50 shadow-inner">
            {player.gold} GP
          </div>

          <button
            id="shop_header_exit_btn"
            onClick={() => {
              soundFX.playCancel();
              onExit();
            }}
            className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 text-white font-black text-xs md:text-sm uppercase rounded-lg border border-red-400 shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            title="Sair da Loja - Tecla ESC"
          >
            <span>SAIR</span>
            <span className="text-red-200 text-[10px] hidden sm:inline">ESC</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 w-full mb-4 border-b border-slate-700 pb-2">
        <button
          onClick={() => { soundFX.playCursor(); setActiveTab('MAGIC'); }}
          className={`px-4 py-2 rounded text-base md:text-lg border-2 transition-all cursor-pointer ${
            activeTab === 'MAGIC'
              ? 'bg-blue-600 text-white border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
              : 'bg-black/60 text-slate-300 border-slate-700 hover:bg-white/10'
          }`}
        >
          TOMOS DE MAGIA
        </button>
        <button
          onClick={() => { soundFX.playCursor(); setActiveTab('ITEMS'); }}
          className={`px-4 py-2 rounded text-base md:text-lg border-2 transition-all cursor-pointer ${
            activeTab === 'ITEMS'
              ? 'bg-blue-600 text-white border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
              : 'bg-black/60 text-slate-300 border-slate-700 hover:bg-white/10'
          }`}
        >
          ITENS DE CURA
        </button>
        <button
          onClick={() => { soundFX.playCursor(); setActiveTab('WEAPONS'); }}
          className={`px-4 py-2 rounded text-base md:text-lg border-2 transition-all cursor-pointer ${
            activeTab === 'WEAPONS'
              ? 'bg-blue-600 text-white border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
              : 'bg-black/60 text-slate-300 border-slate-700 hover:bg-white/10'
          }`}
        >
          ARMAS E FORJA
        </button>
      </div>

      {/* Feedback message banner */}
      {feedback && (
        <div className="w-full bg-blue-900/90 border-2 border-yellow-400 p-2 rounded text-center text-yellow-300 text-sm md:text-base mb-3 animate-fade-in">
          {feedback}
        </div>
      )}

      {/* TAB 1: MAGIAS (Com os 3 tipos e pontos caracteristicos) */}
      {activeTab === 'MAGIC' && (
        <div className="w-full flex flex-col gap-3">
          {/* Sub-filtros dos 3 tipos */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/50 p-2.5 rounded border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xs md:text-sm">TIPOS DE MAGIA:</span>
              <button
                onClick={() => { soundFX.playCursor(); setMagicFilter('ALL'); }}
                className={`px-2.5 py-1 rounded text-xs md:text-sm border ${
                  magicFilter === 'ALL' ? 'bg-blue-700 text-white border-yellow-400' : 'bg-black/60 text-slate-300 border-slate-700'
                }`}
              >
                TODAS
              </button>
              <button
                onClick={() => { soundFX.playCursor(); setMagicFilter('Cura'); }}
                className={`px-2.5 py-1 rounded text-xs md:text-sm border flex items-center gap-1.5 ${
                  magicFilter === 'Cura' ? 'bg-white/25 text-white border-white' : 'bg-black/60 text-slate-300 border-slate-700'
                }`}
              >
                <span className="text-white text-base">○</span>
                <span>CURA - RESTAURADORA</span>
              </button>
              <button
                onClick={() => { soundFX.playCursor(); setMagicFilter('Ataque'); }}
                className={`px-2.5 py-1 rounded text-xs md:text-sm border flex items-center gap-1.5 ${
                  magicFilter === 'Ataque' ? 'bg-red-950/80 text-red-300 border-red-500' : 'bg-black/60 text-slate-300 border-slate-700'
                }`}
              >
                <span className="text-slate-900 bg-white rounded-full w-3 h-3 flex items-center justify-center text-[10px]">●</span>
                <span>ATAQUE - OFENSIVA</span>
              </button>
              <button
                onClick={() => { soundFX.playCursor(); setMagicFilter('Efeito'); }}
                className={`px-2.5 py-1 rounded text-xs md:text-sm border flex items-center gap-1.5 ${
                  magicFilter === 'Efeito' ? 'bg-slate-700 text-slate-200 border-slate-400' : 'bg-black/60 text-slate-300 border-slate-700'
                }`}
              >
                <span className="text-slate-400 text-base">•</span>
                <span>EFEITO - STATUS</span>
              </button>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              {filteredSpells.length} tomos disponiveis
            </span>
          </div>

          {/* Spell Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {filteredSpells.map(spell => {
              const badge = getMagicDotBadge(spell.category);
              const canAfford = player.gold >= spell.price;
              const isSelected = selectedSpellToTeach?.id === spell.id;

              return (
                <div
                  key={spell.id}
                  className={`flex flex-col justify-between bg-black/60 p-3 rounded border-2 transition-all ${
                    isSelected
                      ? 'border-yellow-400 bg-blue-950/70 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${badge.dotColorClass}`}>{badge.dotSymbol}</span>
                      <span className="text-white text-lg md:text-xl">{spell.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-cyan-300 text-sm font-mono">{spell.cost} MP</span>
                  </div>

                  <div className="text-xs text-slate-300 mb-2 font-normal lowercase">
                    - {spell.desc}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-yellow-300 text-base font-mono">{spell.price} GP</span>
                    <button
                      onClick={() => handleSelectSpell(spell)}
                      disabled={!canAfford}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black rounded text-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-yellow-200 shadow"
                    >
                      {isSelected ? 'ENSINANDO...' : 'ENSINAR MAGIA'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal de Selecao de Heroi para Ensinar a Magia Selecionada */}
          {selectedSpellToTeach && (
            <div className="mt-2 p-3 bg-blue-950/90 border-2 border-yellow-400 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center pb-1 border-b border-blue-800">
                <span className="text-yellow-300 text-sm md:text-base">
                  ESCOLHA O HEROI PARA APRENDER: {selectedSpellToTeach.name} - {selectedSpellToTeach.category}
                </span>
                <button
                  onClick={() => setSelectedSpellToTeach(null)}
                  className="text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-black/50 cursor-pointer"
                >
                  FECHAR
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {player.party.map(hero => {
                  const alreadyLearned = hero.magics?.some(
                    m => m.toLowerCase() === selectedSpellToTeach.name.toLowerCase() || m.toLowerCase() === selectedSpellToTeach.id.toLowerCase()
                  );
                  return (
                    <button
                      key={hero.id}
                      onClick={() => handleConfirmTeach(hero)}
                      disabled={alreadyLearned}
                      className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${
                        alreadyLearned
                          ? 'bg-black/40 border-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-black/80 border-blue-500 text-white hover:border-yellow-400 hover:bg-blue-900/60 cursor-pointer active:scale-95'
                      }`}
                    >
                      <span className="text-2xl">{hero.emoji}</span>
                      <span className="text-sm font-bold truncate max-w-full">{hero.name}</span>
                      <span className="text-[10px] text-cyan-300">{hero.heroClass}</span>
                      <span className={`text-[10px] font-mono ${alreadyLearned ? 'text-slate-500' : 'text-green-400'}`}>
                        {alreadyLearned ? 'JA CONHECE' : 'ENSINAR AGORA'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ITENS DE CONSUMO */}
      {activeTab === 'ITEMS' && (
        <div className="w-full bg-black/40 p-3 rounded border-2 border-blue-900 flex flex-col gap-2">
          <h3 className="text-lg md:text-xl text-cyan-300 tracking-wider border-b border-slate-700 pb-1">
            ITENS DE CURA E RESTAURACAO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {Object.values(ITEMS).map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-black/60 p-2.5 rounded border border-slate-700 hover:border-yellow-400 transition-colors"
              >
                <div>
                  <div className="text-white text-base md:text-lg">{item.name}</div>
                  <div className="text-xs text-slate-400">
                    {item.revive
                      ? 'REVIVE +100 HP'
                      : item.mpHeal && item.heal
                      ? `+${item.heal} HP e +${item.mpHeal} MP`
                      : item.mpHeal
                      ? `+${item.mpHeal} MP`
                      : `+${item.heal} HP`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFX.playSelect();
                    onBuyItem(item.id);
                  }}
                  disabled={player.gold < item.price}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black rounded text-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-yellow-200 shadow"
                >
                  {item.price} GP
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ARMAS E FORJA */}
      {activeTab === 'WEAPONS' && (
        <div className="w-full bg-black/40 p-3 rounded border-2 border-blue-900 flex flex-col gap-2">
          <h3 className="text-lg md:text-xl text-cyan-300 tracking-wider border-b border-slate-700 pb-1">
            EQUIPAMENTOS DE COMBATE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {[
              { w: WEAPONS.espada_aco, price: 150 },
              { w: WEAPONS.arco_longo, price: 150 },
              { w: WEAPONS.cajado_anciao, price: 200 },
              { w: WEAPONS.espada_flamejante, price: 350 },
            ].map(({ w, price }) => {
              const isEquipped =
                (player.party && player.party.some(h => h.weapon?.id === w.id)) ||
                player.weapon?.id === w.id;
              return (
                <div
                  key={w.id}
                  className="flex justify-between items-center bg-black/60 p-2.5 rounded border border-slate-700 hover:border-yellow-400 transition-colors"
                >
                  <div>
                    <div className="text-white text-base md:text-lg">{w.name}</div>
                    <div className="text-xs text-slate-400">ATQ: {w.damage} | ALC: {w.range}</div>
                  </div>
                  <button
                    onClick={() => {
                      soundFX.playSelect();
                      onBuyWeapon(w.id, price);
                    }}
                    disabled={player.gold < price || isEquipped}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded text-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-blue-400 shadow"
                  >
                    {isEquipped ? 'EQUIPADO' : `${price} GP`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={() => {
          soundFX.playCancel();
          onExit();
        }}
        className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-white font-black rounded text-base md:text-lg tracking-wider w-full transition-colors border-2 border-slate-500 cursor-pointer shadow-[inset_0_0_0_1px_#000]"
      >
        SAIR DA LOJA - TECLA ESC
      </button>
    </div>
  );
};
