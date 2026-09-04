import React from 'react';
import { Player } from '../types';
import { ITEMS, WEAPONS } from '../constants';

type ShopProps = {
  player: Player;
  onBuyItem: (itemId: string) => void;
  onBuyWeapon: (weaponId: string, price: number) => void;
  onExit: () => void;
};

export const Shop: React.FC<ShopProps> = ({ player, onBuyItem, onBuyWeapon, onExit }) => {
  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full p-8 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center w-full border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest">Loja da Cidade</h2>
        <div className="text-xl font-bold text-yellow-500">💰 {player.gold}G</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Consumables */}
        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-4 uppercase">Consumiveis</h3>
          <div className="space-y-3">
            {Object.values(ITEMS).map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                <div>
                  <div className="font-bold text-slate-200">{item.name}</div>
                  <div className="text-xs text-slate-400">Cura {item.heal} HP</div>
                </div>
                <button 
                  onClick={() => onBuyItem(item.id)}
                  disabled={player.gold < item.price}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold rounded text-sm transition-colors"
                >
                  {item.price}G
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weapons */}
        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-4 uppercase">Equipamentos</h3>
          <div className="space-y-3">
            {[
               { w: WEAPONS.espada_aco, price: 150 },
               { w: WEAPONS.arco_longo, price: 150 },
               { w: WEAPONS.cajado_anciao, price: 200 }
            ].map(({ w, price }) => (
              <div key={w.id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                <div>
                  <div className="font-bold text-slate-200">{w.name}</div>
                  <div className="text-xs text-slate-400">Dano: {w.damage} | Alcance: {w.range}</div>
                </div>
                <button 
                  onClick={() => onBuyWeapon(w.id, price)}
                  disabled={player.gold < price || player.weapon.id === w.id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded text-sm transition-colors"
                >
                  {player.weapon.id === w.id ? 'Equipado' : `${price}G`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={onExit}
        className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg uppercase tracking-widest w-full transition-colors border border-slate-700"
      >
        Sair da Loja
      </button>
    </div>
  );
};
