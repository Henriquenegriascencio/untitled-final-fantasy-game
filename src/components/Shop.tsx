import React from 'react';
import { Player } from '../types';
import { ITEMS, WEAPONS } from '../constants';
import { soundFX } from '../utils/audio';

type ShopProps = {
  player: Player;
  onBuyItem: (itemId: string) => void;
  onBuyWeapon: (weaponId: string, price: number) => void;
  onExit: () => void;
};

export const Shop: React.FC<ShopProps> = ({ player, onBuyItem, onBuyWeapon, onExit }) => {
  return (
    <div 
      className="flex flex-col items-center max-w-2xl mx-auto w-full p-4 md:p-6 rounded-lg border-[4px] border-slate-200 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] font-mono uppercase font-black"
      style={{
        background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)',
      }}
    >
      <div className="flex justify-between items-center w-full border-b-2 border-slate-600 pb-3 mb-4">
        <h2 className="text-2xl md:text-3xl text-yellow-400 tracking-wider">LOJA DA CIDADE</h2>
        <div className="text-xl md:text-2xl text-yellow-300 font-mono tracking-widest">
          {player.gold} GP
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Consumables */}
        <div className="bg-black/40 p-3 rounded border-2 border-blue-900 flex flex-col gap-2">
          <h3 className="text-lg md:text-xl text-cyan-300 tracking-wider border-b border-slate-700 pb-1">
            ITENS DE CURA
          </h3>
          <div className="space-y-2">
            {Object.values(ITEMS).map(item => (
              <div 
                key={item.id} 
                className="flex justify-between items-center bg-black/60 p-2.5 rounded border border-slate-700 hover:border-yellow-400 transition-colors"
              >
                <div>
                  <div className="text-white text-base md:text-lg">{item.name}</div>
                  <div className="text-xs text-slate-400">CURA +{item.heal} HP</div>
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

        {/* Weapons */}
        <div className="bg-black/40 p-3 rounded border-2 border-blue-900 flex flex-col gap-2">
          <h3 className="text-lg md:text-xl text-cyan-300 tracking-wider border-b border-slate-700 pb-1">
            EQUIPAMENTOS
          </h3>
          <div className="space-y-2">
            {[
               { w: WEAPONS.espada_aco, price: 150 },
               { w: WEAPONS.arco_longo, price: 150 },
               { w: WEAPONS.cajado_anciao, price: 200 }
            ].map(({ w, price }) => {
              const isEquipped = player.weapon.id === w.id;
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
      </div>

      <button 
        onClick={() => {
          soundFX.playCancel();
          onExit();
        }}
        className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-white font-black rounded text-base md:text-lg tracking-wider w-full transition-colors border-2 border-slate-500 cursor-pointer shadow-[inset_0_0_0_1px_#000]"
      >
        SAIR DA LOJA [ESC]
      </button>
    </div>
  );
};
