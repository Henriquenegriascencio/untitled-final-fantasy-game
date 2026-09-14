import React, { useState, useEffect, useMemo } from 'react';
import { Player, Hero, Item, HeroClass, EquipmentItem, EquipmentSlot, HeroEquipment, WeaponType } from '../types';
import { HeroPortrait } from './HeroPortrait';
import { soundFX, bgm } from '../utils/audio';
import { STARTER_EQUIPMENT_CATALOG, getDefaultHeroEquipment, calculateHeroFF6Stats } from '../utils/equipmentData';
import { SPELLS_CATALOG, getMagicDotBadge, getSpellByIdOrName, SpellDefinition } from '../utils/magicData';
import { BestiaryMenu } from './BestiaryMenu';

type MenuCommand = 'Item' | 'Skills' | 'Equip' | 'Status' | 'Bestiary' | 'Config' | 'Save';

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
    className={`relative rounded-lg border-[3px] border-[#cbd5e1] p-3 md:p-4 flex flex-col shadow-[inset_0_0_0_2px_#050518,0_4px_8px_rgba(0,0,0,0.6)] font-mono uppercase font-black ${className}`}
    style={{
      background: 'linear-gradient(to bottom, #4354c7 0%, #28348a 35%, #121856 70%, #030424 100%)',
    }}
  >
    {children}
  </div>
);

// Classic FF6 Pointer Cursor (Authentic SNES Glove)
const FF6Cursor: React.FC<{ active?: boolean; className?: string }> = ({ active = true, className = '' }) => {
  if (!active) return null;
  return (
    <span className={`inline-flex items-center mr-1 text-white animate-[pulse_1.2s_infinite] select-none ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" fill="none" className="drop-shadow-[2px_2px_0_#000000]">
        {/* SNES White Glove Pointer */}
        <path
          d="M2 9 C2 7.5 3.5 6.5 5 6.5 L12 6.5 L12 3 C12 1.5 14 1 15 2 C16 3 16 4.5 16 6 L16 8 L22 8 C24.5 8 25.5 9.5 24.5 11.5 C23.5 13 22 13 20 13 L 22 14.5 C23.5 15.5 23 17 21.5 17.5 L 17 17.5 L 19 19 C19.8 19.8 19 21 17.5 21 L 11 21 C6 21 2 17 2 11 Z"
          fill="#f8fafc"
          stroke="#050510"
          strokeWidth="1.5"
        />
        <path d="M2 9 L2 14 C3 17 6 20 10 21" stroke="#64748b" strokeWidth="1.2" fill="none" />
        <path d="M15 10.5 L22 10.5" stroke="#94a3b8" strokeWidth="1" />
        <path d="M14 15 L20 15" stroke="#94a3b8" strokeWidth="1" />
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
  const [itemTab, setItemTab] = useState<'USE' | 'ARRANGE' | 'RARE'>('USE');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [bgmActive, setBgmActive] = useState<boolean>(bgm.enabled);
  const [sfxActive, setSfxActive] = useState<boolean>(soundFX.enabled);

  // Equip Menu State
  const [equipCommand, setEquipCommand] = useState<'EQUIP' | 'OPTIMUM' | 'RMOVE' | 'EMPTY'>('EQUIP');
  const [equipFocus, setEquipFocus] = useState<'COMMANDS' | 'SLOTS' | 'ITEMS'>('COMMANDS');
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('rHand');
  const [selectedEquipItemIdx, setSelectedEquipItemIdx] = useState<number>(0);
  const [inventoryEquipment, setInventoryEquipment] = useState<EquipmentItem[]>(() => {
    return player.inventory.equipment && player.inventory.equipment.length > 0
      ? player.inventory.equipment
      : [...STARTER_EQUIPMENT_CATALOG];
  });

  // Skills / Magic Menu State (FF6 2-Screen Layout)
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<number>(0);
  const [isMagicTargetMode, setIsMagicTargetMode] = useState<boolean>(false);
  const [selectedTargetHeroIndex, setSelectedTargetHeroIndex] = useState<number>(0);

  // Renaming state for customized hero naming in menu
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renamingName, setRenamingName] = useState<string>('');

  const cleanAscii = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .toUpperCase();
  };

  // Only use player created party
  const party: Hero[] = player.party || [];

  const commands: MenuCommand[] = ['Item', 'Skills', 'Equip', 'Status', 'Bestiary', 'Config', 'Save'];

  // Rare / Quest Items
  const rareItems = [
    { id: 'art_fire', name: 'Cristal de Fogo', count: player.artifacts?.some(a => a.id?.includes('fire') || a.id?.includes('fogo')) ? 1 : 0, desc: 'Brilho ancestral do Cristal Elemental de Fogo' },
    { id: 'art_water', name: 'Cristal de Agua', count: player.artifacts?.some(a => a.id?.includes('water') || a.id?.includes('agua')) ? 1 : 0, desc: 'Lagrima sagrada do Cristal Elemental de Agua' },
    { id: 'art_air', name: 'Cristal de Ar', count: player.artifacts?.some(a => a.id?.includes('air') || a.id?.includes('ar')) ? 1 : 0, desc: 'Sussurro divino do Cristal Elemental de Ar' },
    { id: 'art_earth', name: 'Cristal de Terra', count: player.artifacts?.some(a => a.id?.includes('earth') || a.id?.includes('terra')) ? 1 : 0, desc: 'Coracao firme do Cristal Elemental de Terra' },
    { id: 'art_selo', name: 'Selo de Cobre', count: 1, desc: 'Selo guardiao conquistado na Masmorra do Preludio' },
    { id: 'art_amuleto', name: 'Amuleto dos Sabios', count: 1, desc: 'Reliquia ancestral da Cidadela dos Desafios' },
  ];

  // Format play time HH:MM starting from 00:00
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Equip helpers
  const currentHero = party[selectedHeroIndex] || party[0];
  const currentHeroEquipment: HeroEquipment = currentHero ? getDefaultHeroEquipment(currentHero) : {
    rHand: null, lHand: null, head: null, body: null
  };

  // Resolved hero spells for Skills / Magic menu
  const currentHeroSpells: SpellDefinition[] = useMemo(() => {
    if (!currentHero) return [];
    const heroSpellsRaw = currentHero.magics && currentHero.magics.length > 0
      ? currentHero.magics
      : (currentHero.heroClass === 'Mago Branco' || currentHero.heroClass === 'Mago Branco Superior'
          ? ['cura', 'antidoto_magico', 'cura_2', 'vida']
          : currentHero.heroClass === 'Mago Negro' || currentHero.heroClass === 'Mago Negro Superior'
          ? ['fogo', 'gelo', 'trovao', 'veneno']
          : currentHero.heroClass === 'Mago Vermelho' || currentHero.heroClass === 'Mago Vermelho Superior'
          ? ['cura', 'fogo', 'gelo', 'antidoto_magico']
          : ['cura']);

    return heroSpellsRaw.map((raw) => {
      const found = getSpellByIdOrName(raw);
      if (found) return found;
      return {
        id: raw.toLowerCase(),
        name: raw,
        category: (raw === 'Cura' ? 'Cura' : raw === 'Veneno' ? 'Efeito' : 'Ataque') as any,
        cost: 10,
        price: 100,
        desc: 'Feitico ancestral do grimorio',
        targetType: (raw === 'Cura' ? 'ally' : 'enemy') as any,
        canCastInField: raw === 'Cura'
      };
    });
  }, [currentHero]);

  const handleEquipItem = (itemToEquip: EquipmentItem | null) => {
    if (!currentHero) return;
    const currentEquipped = currentHeroEquipment[selectedSlot] || null;

    const newEquipment: HeroEquipment = {
      ...currentHeroEquipment,
      [selectedSlot]: itemToEquip
    };

    let updatedInv = [...inventoryEquipment];
    if (itemToEquip) {
      const idx = updatedInv.findIndex(it => it.id === itemToEquip.id);
      if (idx !== -1) {
        updatedInv.splice(idx, 1);
      }
    }
    if (currentEquipped) {
      updatedInv.push(currentEquipped);
    }
    setInventoryEquipment(updatedInv);

    let updatedWeapon = currentHero.weapon;
    if (selectedSlot === 'rHand') {
      if (itemToEquip) {
        updatedWeapon = {
          id: itemToEquip.id,
          name: itemToEquip.name,
          type: (currentHero.weapon?.type || 'espada') as WeaponType,
          range: currentHero.weapon?.range || 1,
          damage: itemToEquip.batPwr || currentHero.weapon?.damage || 18,
        };
      }
    }

    const updatedParty = party.map((h, i) => {
      if (i === selectedHeroIndex) {
        return {
          ...h,
          weapon: updatedWeapon,
          equipment: newEquipment,
        };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    soundFX.playSelect();
    setFeedbackMessage(itemToEquip ? `${itemToEquip.name} equipado em ${currentHero.name}!` : `Item desequipado em ${currentHero.name}!`);
    setTimeout(() => setFeedbackMessage(null), 2500);
    setEquipFocus('SLOTS');
  };

  const handleRemoveSlot = (slot: EquipmentSlot) => {
    if (!currentHero) return;
    const currentEquipped = currentHeroEquipment[slot];
    if (!currentEquipped) {
      soundFX.playCancel();
      setFeedbackMessage('Nenhum equipamento neste slot!');
      setTimeout(() => setFeedbackMessage(null), 2000);
      return;
    }

    const newEquipment: HeroEquipment = {
      ...currentHeroEquipment,
      [slot]: null
    };

    const updatedInv = [...inventoryEquipment, currentEquipped];
    setInventoryEquipment(updatedInv);

    const updatedParty = party.map((h, i) => {
      if (i === selectedHeroIndex) {
        return {
          ...h,
          equipment: newEquipment
        };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    soundFX.playCancel();
    setFeedbackMessage(`${currentEquipped.name} removido!`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleOptimum = () => {
    if (!currentHero) return;
    let invPool = [...inventoryEquipment];
    let newEquipment: HeroEquipment = { ...currentHeroEquipment };
    const slots: EquipmentSlot[] = ['rHand', 'lHand', 'head', 'body'];

    slots.forEach(slot => {
      const candidates = invPool.filter(it => it.slot === slot);
      if (candidates.length > 0) {
        candidates.sort((a, b) => {
          const scoreA = (a.batPwr || 0) * 1.5 + (a.defense || 0) * 1.5 + (a.vigor || 0) + (a.magPwr || 0) + (a.speed || 0);
          const scoreB = (b.batPwr || 0) * 1.5 + (b.defense || 0) * 1.5 + (b.vigor || 0) + (b.magPwr || 0) + (b.speed || 0);
          return scoreB - scoreA;
        });
        const bestCandidate = candidates[0];
        const currentItem = newEquipment[slot];
        const currentScore = currentItem ? (currentItem.batPwr || 0) * 1.5 + (currentItem.defense || 0) * 1.5 + (currentItem.vigor || 0) + (currentItem.magPwr || 0) : -1;
        const bestScore = (bestCandidate.batPwr || 0) * 1.5 + (bestCandidate.defense || 0) * 1.5 + (bestCandidate.vigor || 0) + (bestCandidate.magPwr || 0);

        if (bestScore > currentScore) {
          if (currentItem) invPool.push(currentItem);
          const cIdx = invPool.findIndex(it => it.id === bestCandidate.id);
          if (cIdx !== -1) invPool.splice(cIdx, 1);
          newEquipment[slot] = bestCandidate;
        }
      }
    });

    setInventoryEquipment(invPool);
    const updatedParty = party.map((h, i) => {
      if (i === selectedHeroIndex) {
        return {
          ...h,
          equipment: newEquipment,
          weapon: newEquipment.rHand ? {
            id: newEquipment.rHand.id,
            name: newEquipment.rHand.name,
            type: (h.weapon?.type || 'espada') as WeaponType,
            range: h.weapon?.range || 1,
            damage: newEquipment.rHand.batPwr || h.weapon?.damage || 18,
          } : h.weapon,
        };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    soundFX.playHeal();
    setFeedbackMessage(`Melhor equipamento equipado em ${currentHero.name}!`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleEmpty = () => {
    if (!currentHero) return;
    const itemsToRemove = [
      currentHeroEquipment.rHand,
      currentHeroEquipment.lHand,
      currentHeroEquipment.head,
      currentHeroEquipment.body,
    ].filter(Boolean) as EquipmentItem[];

    if (itemsToRemove.length === 0) {
      soundFX.playCancel();
      setFeedbackMessage('Heroi ja esta sem equipamentos!');
      setTimeout(() => setFeedbackMessage(null), 2000);
      return;
    }

    const updatedInv = [...inventoryEquipment, ...itemsToRemove];
    setInventoryEquipment(updatedInv);

    const emptyEquipment: HeroEquipment = {
      rHand: null,
      lHand: null,
      head: null,
      body: null,
    };

    const updatedParty = party.map((h, i) => {
      if (i === selectedHeroIndex) {
        return {
          ...h,
          equipment: emptyEquipment
        };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    soundFX.playCancel();
    setFeedbackMessage(`Equipamentos removidos de ${currentHero.name}!`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        if (subView) {
          if (subView === 'Item' && useTargetPrompt) {
            soundFX.playCancel();
            setUseTargetPrompt(false);
            return;
          }
          if (subView === 'Skills') {
            if (isMagicTargetMode) {
              soundFX.playCancel();
              setIsMagicTargetMode(false);
              return;
            }
            soundFX.playCancel();
            setSubView(null);
            return;
          }
          if (subView === 'Equip') {
            if (equipFocus === 'ITEMS') {
              soundFX.playCancel();
              setEquipFocus('SLOTS');
              return;
            }
            if (equipFocus === 'SLOTS') {
              soundFX.playCancel();
              setEquipFocus('COMMANDS');
              return;
            }
            soundFX.playCancel();
            setSubView(null);
            return;
          }
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
      } else if (subView === 'Item') {
        if (!useTargetPrompt) {
          // Screen 1: Item list navigation
          const currentList = itemTab === 'RARE' ? rareItems : player.inventory.items;
          const count = currentList.length;
          if (count > 0) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
              soundFX.playCursor();
              setSelectedItemIndex((prev) => (prev - 1 + count) % count);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
              soundFX.playCursor();
              setSelectedItemIndex((prev) => (prev + 1) % count);
            } else if (e.key === 'Enter' || e.key === ' ') {
              if (itemTab === 'USE' && player.inventory.items.length > 0) {
                soundFX.playSelect();
                setUseTargetPrompt(true);
              }
            }
          }
        } else {
          // Screen 2: Target selection for item
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            soundFX.playCursor();
            setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
          } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            soundFX.playCursor();
            setSelectedHeroIndex((prev) => (prev + 1) % party.length);
          } else if (e.key === 'Enter' || e.key === ' ') {
            handleApplyItem(selectedItemIndex, selectedHeroIndex);
          }
        }
      } else if (subView === 'Skills') {
        if (!isMagicTargetMode) {
          // Hero quick cycle
          if (e.key === 'q' || e.key === 'Q' || e.key === '[') {
            soundFX.playCursor();
            setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
            setSelectedSpellIndex(0);
            return;
          }
          if (e.key === 'e' || e.key === 'E' || e.key === ']') {
            soundFX.playCursor();
            setSelectedHeroIndex((prev) => (prev + 1) % party.length);
            setSelectedSpellIndex(0);
            return;
          }

          const spellCount = currentHeroSpells.length;
          if (spellCount > 0) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
              soundFX.playCursor();
              setSelectedSpellIndex((prev) => (prev - 1 + spellCount) % spellCount);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
              soundFX.playCursor();
              setSelectedSpellIndex((prev) => (prev + 1) % spellCount);
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
              soundFX.playCursor();
              setSelectedSpellIndex((prev) => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
              soundFX.playCursor();
              setSelectedSpellIndex((prev) => Math.min(spellCount - 1, prev + 1));
            } else if (e.key === 'Enter' || e.key === ' ') {
              soundFX.playSelect();
              setIsMagicTargetMode(true);
              setSelectedTargetHeroIndex(selectedHeroIndex);
            }
          }
        } else {
          // Screen 2: Target Selection
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            soundFX.playCursor();
            setSelectedTargetHeroIndex((prev) => (prev - 1 + party.length) % party.length);
          } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            soundFX.playCursor();
            setSelectedTargetHeroIndex((prev) => (prev + 1) % party.length);
          } else if (e.key === 'Enter' || e.key === ' ') {
            const activeSpell = currentHeroSpells[selectedSpellIndex];
            if (activeSpell) {
              handleCastOrEquipSpell(activeSpell, selectedHeroIndex, selectedTargetHeroIndex);
            }
          }
        }
      } else if (subView === 'Equip') {
        // Hero quick cycle
        if (e.key === 'q' || e.key === 'Q' || e.key === '[') {
          soundFX.playCursor();
          setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
          return;
        }
        if (e.key === 'e' || e.key === 'E' || e.key === ']') {
          soundFX.playCursor();
          setSelectedHeroIndex((prev) => (prev + 1) % party.length);
          return;
        }

        if (equipFocus === 'COMMANDS') {
          const equipCmds: ('EQUIP' | 'OPTIMUM' | 'RMOVE' | 'EMPTY')[] = ['EQUIP', 'OPTIMUM', 'RMOVE', 'EMPTY'];
          const currentCmdIdx = equipCmds.indexOf(equipCommand);
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            soundFX.playCursor();
            const nextIdx = (currentCmdIdx - 1 + equipCmds.length) % equipCmds.length;
            setEquipCommand(equipCmds[nextIdx]);
          } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            soundFX.playCursor();
            const nextIdx = (currentCmdIdx + 1) % equipCmds.length;
            setEquipCommand(equipCmds[nextIdx]);
          } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            soundFX.playCursor();
            setEquipFocus('SLOTS');
          } else if (e.key === 'Enter' || e.key === ' ') {
            if (equipCommand === 'EQUIP') {
              soundFX.playSelect();
              setEquipFocus('SLOTS');
            } else if (equipCommand === 'OPTIMUM') {
              handleOptimum();
            } else if (equipCommand === 'RMOVE') {
              soundFX.playSelect();
              setEquipFocus('SLOTS');
            } else if (equipCommand === 'EMPTY') {
              handleEmpty();
            }
          }
        } else if (equipFocus === 'SLOTS') {
          const slots: EquipmentSlot[] = ['rHand', 'lHand', 'head', 'body'];
          const slotIdx = slots.indexOf(selectedSlot);
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            soundFX.playCursor();
            if (slotIdx === 0) {
              setEquipFocus('COMMANDS');
            } else {
              setSelectedSlot(slots[slotIdx - 1]);
            }
          } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            soundFX.playCursor();
            if (slotIdx < slots.length - 1) {
              setSelectedSlot(slots[slotIdx + 1]);
            }
          } else if (e.key === 'Enter' || e.key === ' ') {
            if (equipCommand === 'RMOVE') {
              handleRemoveSlot(selectedSlot);
            } else {
              soundFX.playSelect();
              setEquipFocus('ITEMS');
              setSelectedEquipItemIdx(0);
            }
          }
        } else if (equipFocus === 'ITEMS') {
          const availableCount = 1 + inventoryEquipment.filter((item) => item.slot === selectedSlot).length;
          if (availableCount > 0) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
              soundFX.playCursor();
              setSelectedEquipItemIdx((prev) => (prev - 1 + availableCount) % availableCount);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
              soundFX.playCursor();
              setSelectedEquipItemIdx((prev) => (prev + 1) % availableCount);
            } else if (e.key === 'Enter' || e.key === ' ') {
              const currentAvailable: (EquipmentItem | null)[] = [
                null,
                ...inventoryEquipment.filter((item) => item.slot === selectedSlot),
              ];
              const chosen = currentAvailable[selectedEquipItemIdx] ?? null;
              handleEquipItem(chosen);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCommand, subView, useTargetPrompt, selectedItemIndex, selectedHeroIndex,
    party.length, itemTab, player.inventory.items, onClose, equipCommand, equipFocus,
    selectedSlot, selectedEquipItemIdx, inventoryEquipment, currentHeroEquipment,
    isMagicTargetMode, selectedSpellIndex, selectedTargetHeroIndex, currentHeroSpells
  ]);

  const handleExecuteCommand = (cmd: MenuCommand) => {
    if (cmd === 'Save') {
      soundFX.playSave();
      onSave();
      setFeedbackMessage('Jogo Salvo com Sucesso!');
      setTimeout(() => setFeedbackMessage(null), 2500);
      return;
    }
    soundFX.playSelect();
    setSubView(cmd);
    setSelectedItemIndex(0);
    setUseTargetPrompt(false);
    if (cmd === 'Skills') {
      setSelectedSpellIndex(0);
      setIsMagicTargetMode(false);
      setSelectedTargetHeroIndex(selectedHeroIndex);
    } else if (cmd === 'Equip') {
      setEquipCommand('EQUIP');
      setEquipFocus('COMMANDS');
      setSelectedSlot('rHand');
      setSelectedEquipItemIdx(0);
    }
  };

  const handleSelectTab = (tab: 'USE' | 'ARRANGE' | 'RARE') => {
    soundFX.playSelect();
    setItemTab(tab);
    setSelectedItemIndex(0);
    if (tab === 'ARRANGE') {
      const sorted = [...player.inventory.items].sort((a, b) => a.name.localeCompare(b.name));
      onUpdateParty(party, sorted);
      setFeedbackMessage('Inventario organizado!');
      setTimeout(() => setFeedbackMessage(null), 2000);
      setItemTab('USE');
    }
  };

  // Item Usage logic
  const handleApplyItem = (itemIdx: number, heroIdx: number) => {
    const items = [...player.inventory.items];
    const item = items[itemIdx];
    if (!item || item.count <= 0) return;

    const target = party[heroIdx];
    if (!target) return;

    // Check conditions
    if (item.revive) {
      if (target.stats.hp > 0 && target.stats.hp >= target.stats.maxHp) {
        soundFX.playCancel();
        setFeedbackMessage(`${target.name} ja esta com HP maximo!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }
    } else if (item.mpHeal && !item.heal) {
      if (target.stats.mp >= target.stats.maxMp) {
        soundFX.playCancel();
        setFeedbackMessage(`${target.name} ja esta com MP maximo!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }
    } else {
      if (target.stats.hp >= target.stats.maxHp) {
        soundFX.playCancel();
        setFeedbackMessage(`${target.name} ja esta com a vida cheia!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }
    }

    soundFX.playHeal();
    let newHp = target.stats.hp;
    let newMp = target.stats.mp;
    let effectSummary = '';

    if (item.heal) {
      newHp = Math.min(target.stats.maxHp, target.stats.hp + item.heal);
      effectSummary += `+${item.heal} HP`;
    }
    if (item.mpHeal) {
      newMp = Math.min(target.stats.maxMp, target.stats.mp + item.mpHeal);
      effectSummary += `${effectSummary ? ' e ' : ''}+${item.mpHeal} MP`;
    }

    const updatedParty = party.map((h, i) =>
      i === heroIdx ? { ...h, stats: { ...h.stats, hp: newHp, mp: newMp } } : h
    );

    const remainingCount = item.count - 1;
    const updatedItems = items
      .map((it, i) => (i === itemIdx ? { ...it, count: remainingCount } : it))
      .filter((it) => it.count > 0);

    onUpdateParty(updatedParty, updatedItems);
    setFeedbackMessage(`${effectSummary} em ${target.name}!`);
    setTimeout(() => setFeedbackMessage(null), 2000);

    // If item is finished, return to item menu
    if (remainingCount <= 0) {
      setUseTargetPrompt(false);
      setSelectedItemIndex(0);
    }
  };

  // Cast restorative spell in menu
  const handleCastRestorativeSpell = (spell: SpellDefinition, heroIdx: number, targetIdx: number) => {
    const caster = party[heroIdx];
    const target = party[targetIdx];
    if (!caster || !target) return;

    if (caster.stats.mp < spell.cost) {
      soundFX.playCancel();
      setFeedbackMessage(`${caster.name} nao tem MP suficiente! - Requer ${spell.cost} MP`);
      setTimeout(() => setFeedbackMessage(null), 2000);
      return;
    }

    const casterMagPwr = caster.stats.magPwr || caster.stats.int || 15;
    let healAmount = (spell.power || 40) + casterMagPwr * 2;
    soundFX.playHeal();
    const newMp = caster.stats.mp - spell.cost;

    let newTargetHp = target.stats.hp;
    let debuffs = target.debuffs || [];

    if (spell.id === 'vida') {
      if (target.stats.hp > 0) {
        soundFX.playCancel();
        setFeedbackMessage(`${target.name} nao esta caido!`);
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }
      newTargetHp = Math.min(target.stats.maxHp, 50 + casterMagPwr);
    } else if (spell.id === 'antidoto_magico') {
      debuffs = [];
      healAmount = 20;
      newTargetHp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);
    } else if (spell.targetType === 'all_allies') {
      // Curaga cura todo o grupo
      const updatedParty = party.map((h, i) => {
        const hHp = Math.min(h.stats.maxHp, h.stats.hp + healAmount);
        if (i === heroIdx) {
          return { ...h, stats: { ...h.stats, mp: newMp, hp: hHp } };
        }
        return { ...h, stats: { ...h.stats, hp: hHp } };
      });
      onUpdateParty(updatedParty, player.inventory.items);
      setFeedbackMessage(`${caster.name} conjurou ${spell.name} curando todo o grupo com +${healAmount} HP!`);
      setTimeout(() => setFeedbackMessage(null), 2500);
      return;
    } else {
      newTargetHp = Math.min(target.stats.maxHp, target.stats.hp + healAmount);
    }

    const updatedParty = party.map((h, i) => {
      if (i === heroIdx && i === targetIdx) {
        return { ...h, debuffs, stats: { ...h.stats, mp: newMp, hp: newTargetHp } };
      }
      if (i === heroIdx) {
        return { ...h, stats: { ...h.stats, mp: newMp } };
      }
      if (i === targetIdx) {
        return { ...h, debuffs, stats: { ...h.stats, hp: newTargetHp } };
      }
      return h;
    });

    onUpdateParty(updatedParty, player.inventory.items);
    setFeedbackMessage(`${caster.name} conjurou ${spell.name} em ${target.name}!`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Cast or equip spell from skills menu
  const handleCastOrEquipSpell = (spell: SpellDefinition, heroIdx: number, targetIdx: number) => {
    const caster = party[heroIdx];
    const target = party[targetIdx];
    if (!caster || !target) return;

    if (spell.canCastInField) {
      handleCastRestorativeSpell(spell, heroIdx, targetIdx);
    } else {
      soundFX.playSelect();
      setFeedbackMessage(`Magia ${spell.name} selecionada para combate!`);
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  // ================= DEDICATED FF6 SKILLS SUB-VIEW (SCREEN 1 & SCREEN 2) =================
  const renderSkillsMenu = () => {
    const activeSpell = currentHeroSpells[selectedSpellIndex] || currentHeroSpells[0];

    if (!isMagicTargetMode) {
      // SCREEN 1: Magic selection (matching Image 1)
      return (
        <div 
          id="ff6_skills_screen_1"
          className="absolute inset-0 z-40 flex flex-col gap-2 p-1.5 md:p-3 font-mono uppercase font-black select-none bg-slate-950/85 backdrop-blur-xs rounded-lg"
        >
          {/* Row 1: Top Bar (Description Left + Attached MP Box Right + Back Button) */}
          <div className="flex items-stretch gap-2 h-14 md:h-16 shrink-0">
            {/* Description Box */}
            <FF6Window className="flex-1 flex-row items-center justify-between py-1 px-4 md:px-6">
              <span 
                style={{ fontSize: '34px', lineHeight: '22px' }} 
                className="text-white drop-shadow-[2px_2px_0_#000000] tracking-wide truncate"
              >
                {activeSpell?.desc || 'Recupera HP'}
              </span>
            </FF6Window>

            {/* Attached MP Box */}
            <FF6Window className="w-36 md:w-48 flex-row items-center justify-between py-1 px-4 shrink-0">
              <span 
                style={{ fontSize: '36px', lineHeight: '22px' }} 
                className="text-[#00ffff] font-black drop-shadow-[2px_2px_0_#000000] tracking-wider"
              >
                MP...
              </span>
              <span 
                style={{ fontSize: '38px', lineHeight: '22px' }} 
                className="text-white font-black drop-shadow-[2px_2px_0_#000000] font-mono"
              >
                {activeSpell ? activeSpell.cost : 0}
              </span>
            </FF6Window>

            {/* Back button */}
            <button
              id="ff6_skills_back_btn"
              onClick={() => {
                soundFX.playCancel();
                setSubView(null);
              }}
              className="px-3 py-1 bg-black/40 hover:bg-white/20 text-yellow-400 hover:text-white rounded border border-slate-500 uppercase tracking-wider font-bold text-xs md:text-sm cursor-pointer transition-colors shrink-0"
            >
              VOLTAR - ESC
            </button>
          </div>

          {/* Row 2: Character Summary Banner (matching Image 1 middle box) */}
          <FF6Window className="h-28 md:h-32 shrink-0 flex-row items-center justify-between p-3 md:p-4">
            {/* Left: Portrait & Hero Switcher */}
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 border-[2px] border-slate-200 rounded overflow-hidden shadow-[inset_0_0_0_1px_#000] bg-black/40">
                <HeroPortrait
                  heroClass={currentHero?.heroClass || ''}
                  emoji={currentHero?.emoji}
                  name={currentHero?.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-col justify-center font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFX.playCursor();
                      setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
                      setSelectedSpellIndex(0);
                    }}
                    className="text-yellow-400 hover:text-white text-base md:text-xl font-black cursor-pointer px-1"
                    title="Heroi Anterior - Tecla Q"
                  >
                    ◄
                  </button>
                  <span 
                    style={{ fontSize: '38px', lineHeight: '24px' }} 
                    className="text-white font-black drop-shadow-[2px_2px_0_#000000] tracking-widest uppercase"
                  >
                    {currentHero?.name}
                  </span>
                  <button
                    onClick={() => {
                      soundFX.playCursor();
                      setSelectedHeroIndex((prev) => (prev + 1) % party.length);
                      setSelectedSpellIndex(0);
                    }}
                    className="text-yellow-400 hover:text-white text-base md:text-xl font-black cursor-pointer px-1"
                    title="Proximo Heroi - Tecla E"
                  >
                    ►
                  </button>
                </div>
                <span className="text-xs md:text-sm text-cyan-300 font-bold uppercase tracking-wider mt-0.5">
                  {currentHero?.heroClass}
                </span>
              </div>
            </div>

            {/* Right: Stats LV, HP, MP exactly as in Image 1 */}
            <div className="flex flex-col justify-center font-mono text-right pr-2 md:pr-6">
              {/* LV */}
              <div 
                style={{ fontSize: '34px', lineHeight: '22px' }} 
                className="flex items-center justify-end gap-4"
              >
                <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">LV</span>
                <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000] min-w-[36px]">{currentHero?.level || 1}</span>
              </div>

              {/* HP */}
              <div 
                style={{ fontSize: '34px', lineHeight: '22px' }} 
                className="flex items-center justify-end gap-3 mt-1"
              >
                <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">HP</span>
                <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                  {String(currentHero?.stats.hp || 0).padStart(3, ' ')} / {String(currentHero?.stats.maxHp || 0).padStart(3, ' ')}
                </span>
              </div>

              {/* MP */}
              <div 
                style={{ fontSize: '34px', lineHeight: '22px' }} 
                className="flex items-center justify-end gap-3 mt-1"
              >
                <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">MP</span>
                <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                  {String(currentHero?.stats.mp || 0).padStart(3, ' ')} / {String(currentHero?.stats.maxMp || 0).padStart(3, ' ')}
                </span>
              </div>
            </div>
          </FF6Window>

          {/* Row 3: Spells List (matching Image 1 bottom large window) */}
          <FF6Window className="flex-1 p-3 md:p-5 flex-row items-stretch justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 content-start">
              {currentHeroSpells.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-slate-300">
                  <span style={{ fontSize: '34px', lineHeight: '22px' }}>
                    Nenhuma magia aprendida
                  </span>
                </div>
              ) : (
                currentHeroSpells.map((sp, idx) => {
                  const isSelected = selectedSpellIndex === idx;
                  const canCastInMenu = !!sp.canCastInField && (currentHero?.stats.mp || 0) >= sp.cost;
                  const isOffensive = sp.category === 'Ataque';

                  return (
                    <div
                      key={sp.id || idx}
                      id={`ff6_spell_row_${idx}`}
                      onMouseEnter={() => {
                        if (selectedSpellIndex !== idx) {
                          soundFX.playCursor();
                          setSelectedSpellIndex(idx);
                        }
                      }}
                      onClick={() => {
                        soundFX.playSelect();
                        setSelectedSpellIndex(idx);
                        setIsMagicTargetMode(true);
                        setSelectedTargetHeroIndex(selectedHeroIndex);
                      }}
                      className="flex items-center justify-between cursor-pointer py-1.5 px-2 rounded hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center">
                        {/* Pointing Glove Cursor */}
                        <div className="w-8 shrink-0 flex items-center justify-center">
                          {isSelected && <FF6Cursor active={true} />}
                        </div>

                        {/* Dot Icon (white circle for heal / status, filled black for attack) */}
                        <span className={`text-xl md:text-2xl mr-2 ${isOffensive ? 'text-slate-900 bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs' : 'text-white drop-shadow-[0_0_2px_#ffffff]'}`}>
                          {isOffensive ? '●' : '○'}
                        </span>

                        {/* Spell Name */}
                        <span 
                          style={{ fontSize: '36px', lineHeight: '22px' }} 
                          className={`font-black drop-shadow-[2px_2px_0_#000000] tracking-wide ${
                            canCastInMenu || isOffensive ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {sp.name}
                        </span>
                      </div>

                      {/* MP Cost display */}
                      <span 
                        style={{ fontSize: '34px', lineHeight: '22px' }} 
                        className="text-cyan-300 font-mono font-bold pr-2"
                      >
                        {sp.cost}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scroll Indicator Arrows */}
            <div className="w-6 shrink-0 flex flex-col items-center justify-center text-white select-none animate-pulse">
              <span style={{ fontSize: '18px', lineHeight: '14px' }}>▲</span>
              <span style={{ fontSize: '18px', lineHeight: '14px' }}>▼</span>
            </div>
          </FF6Window>
        </div>
      );
    }

    // SCREEN 2: Magic Target / Equip Screen (matching Image 2)
    return (
      <div 
        id="ff6_skills_screen_2" 
        className="absolute inset-0 z-40 flex items-stretch gap-2.5 p-1.5 md:p-3 font-mono uppercase font-black select-none bg-slate-950/85 backdrop-blur-xs rounded-lg animate-fadeIn"
      >
        {/* Left Column: Stacked Windows matching Image 2 */}
        <div className="w-48 md:w-60 flex flex-col gap-2.5 shrink-0">
          {/* Box 1 (Top Left): Selected Spell Name with Dot */}
          <FF6Window className="h-16 md:h-20 flex-row items-center px-4 gap-2">
            <span className={`text-xl md:text-2xl ${activeSpell?.category === 'Ataque' ? 'text-slate-900 bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs' : 'text-white drop-shadow-[0_0_2px_#ffffff]'}`}>
              {activeSpell?.category === 'Ataque' ? '●' : '○'}
            </span>
            <span 
              style={{ fontSize: '36px', lineHeight: '22px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000] tracking-wide truncate"
            >
              {activeSpell?.name || 'Magia'}
            </span>
          </FF6Window>

          {/* Box 2 (Middle Left): "5 MP" "Needed" */}
          <FF6Window className="h-28 md:h-32 justify-center px-4 py-2">
            <span 
              style={{ fontSize: '36px', lineHeight: '24px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000]"
            >
              {activeSpell?.cost ?? 0} MP
            </span>
            <span 
              style={{ fontSize: '32px', lineHeight: '20px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000] mt-1"
            >
              Needed
            </span>
          </FF6Window>

          {/* Return Button */}
          <button
            id="ff6_skills_target_cancel"
            onClick={() => {
              soundFX.playCancel();
              setIsMagicTargetMode(false);
            }}
            className="mt-auto px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-yellow-400 rounded-lg border-2 border-slate-500 hover:border-yellow-400 uppercase tracking-wider font-black text-xs md:text-sm cursor-pointer transition-colors text-center shadow-md"
          >
            VOLTAR - ESC
          </button>
        </div>

        {/* Right Window: Target Party Selection Window matching Image 2 */}
        <FF6Window className="flex-1 p-3 md:p-6 overflow-y-auto custom-scrollbar justify-start gap-3 md:gap-4">
          {party.map((hero, idx) => {
            const isSelected = selectedTargetHeroIndex === idx;
            return (
              <div
                key={hero.id || idx}
                id={`ff6_magic_target_${idx}`}
                onMouseEnter={() => {
                  if (selectedTargetHeroIndex !== idx) {
                    soundFX.playCursor();
                    setSelectedTargetHeroIndex(idx);
                  }
                }}
                onClick={() => {
                  if (activeSpell) {
                    handleCastOrEquipSpell(activeSpell, selectedHeroIndex, idx);
                  }
                }}
                className={`flex items-center gap-3 md:gap-5 p-2.5 md:p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white/10 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Glove Cursor pointing directly to character */}
                <div className="w-7 md:w-8 shrink-0 flex items-center justify-center">
                  {isSelected && <FF6Cursor active={true} />}
                </div>

                {/* Hero Portrait */}
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 border-[2px] border-slate-200 rounded overflow-hidden shadow-[inset_0_0_0_1px_#000] bg-black/40">
                  <HeroPortrait
                    heroClass={hero.heroClass}
                    emoji={hero.emoji}
                    name={hero.name}
                    className="w-full h-full"
                  />
                </div>

                {/* Hero Stats */}
                <div className="flex flex-col justify-center flex-1 font-mono">
                  {/* Hero Name */}
                  <div 
                    style={{ fontSize: '38px', lineHeight: '24px' }} 
                    className="text-white font-black drop-shadow-[2px_2px_0_#000000] tracking-widest uppercase"
                  >
                    {hero.name}
                  </div>

                  {/* LV */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3 mt-1.5"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">LV</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000] min-w-[28px]">{hero.level}</span>
                  </div>

                  {/* HP */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">HP</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                      {String(hero.stats.hp).padStart(3, ' ')} / {String(hero.stats.maxHp).padStart(3, ' ')}
                    </span>
                  </div>

                  {/* MP */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">MP</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                      {String(hero.stats.mp).padStart(3, ' ')} / {String(hero.stats.maxMp).padStart(3, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </FF6Window>
      </div>
    );
  };

  const renderItemMenu = () => {
    const displayItems = itemTab === 'RARE' ? rareItems : player.inventory.items;
    const activeItem = player.inventory.items[selectedItemIndex];
    const currentItem = displayItems[selectedItemIndex];

    const currentItemDesc = currentItem
      ? (currentItem.desc || (currentItem.heal ? `Recupera ${currentItem.heal} HP` : 'Item util'))
      : 'Nenhum item disponivel';

    const currentItemCountDisplay = currentItem ? currentItem.count : 0;

    if (!useTargetPrompt) {
      // SCREEN 1: Item Menu
      return (
        <div 
          id="ff6_item_screen_1"
          className="absolute inset-0 z-40 flex flex-col gap-2 p-1.5 md:p-3 font-mono uppercase font-black select-none bg-slate-950/85 backdrop-blur-xs rounded-lg"
        >
          {/* Row 1: Top Bar */}
          <div className="flex items-stretch gap-2 h-14 md:h-16 shrink-0">
            {/* Box 1: Item */}
            <FF6Window className="w-32 md:w-44 items-center justify-center py-1 px-3">
              <span 
                style={{ fontSize: '38px', lineHeight: '22px' }} 
                className="text-[#00ffff] font-black drop-shadow-[2px_2px_0_#000000] tracking-wider"
              >
                Item
              </span>
            </FF6Window>

            {/* Box 2: Actions USE ARRANGE RARE */}
            <FF6Window className="flex-1 flex-row items-center justify-between py-1 px-4 md:px-8">
              <div className="flex items-center gap-6 md:gap-14">
                {(['USE', 'ARRANGE', 'RARE'] as const).map((tab) => {
                  const isTabActive = itemTab === tab;
                  return (
                    <button
                      key={tab}
                      id={`ff6_item_tab_${tab.toLowerCase()}`}
                      onClick={() => handleSelectTab(tab)}
                      className={`flex items-center cursor-pointer transition-colors ${
                        isTabActive ? 'text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isTabActive && <FF6Cursor active={true} className="mr-1" />}
                      <span 
                        style={{ fontSize: '36px', lineHeight: '22px' }} 
                        className="drop-shadow-[2px_2px_0_#000000] tracking-wider font-black"
                      >
                        {tab}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                id="ff6_item_back_btn"
                onClick={() => {
                  soundFX.playCancel();
                  setSubView(null);
                }}
                className="text-yellow-400 hover:text-white text-xs md:text-sm font-black uppercase px-2.5 py-1 rounded bg-black/40 border border-slate-500 hover:border-yellow-400 transition-colors cursor-pointer"
              >
                VOLTAR - ESC
              </button>
            </FF6Window>
          </div>

          {/* Row 2: Description Box */}
          <FF6Window className="h-14 md:h-16 shrink-0 flex-row items-center justify-between py-1 px-4 md:px-6">
            <span 
              style={{ fontSize: '34px', lineHeight: '22px' }} 
              className="text-white drop-shadow-[2px_2px_0_#000000] tracking-wide"
            >
              {currentItemDesc}
            </span>
            <span 
              style={{ fontSize: '34px', lineHeight: '22px' }} 
              className="text-white drop-shadow-[2px_2px_0_#000000] font-mono pr-2"
            >
              {currentItemCountDisplay}
            </span>
          </FF6Window>

          {/* Row 3: Items List Window */}
          <FF6Window className="flex-1 p-3 md:p-5 flex-row items-stretch justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 flex flex-col gap-1.5">
              {displayItems.length === 0 ? (
                <div className="py-8 text-center text-slate-300">
                  <span style={{ fontSize: '34px', lineHeight: '22px' }}>
                    Nenhum item no inventario
                  </span>
                </div>
              ) : (
                displayItems.map((it, idx) => {
                  const isSelected = selectedItemIndex === idx;
                  return (
                    <div
                      key={it.id || idx}
                      id={`ff6_item_row_${idx}`}
                      onMouseEnter={() => {
                        if (selectedItemIndex !== idx) {
                          soundFX.playCursor();
                          setSelectedItemIndex(idx);
                        }
                      }}
                      onClick={() => {
                        if (itemTab === 'USE') {
                          soundFX.playSelect();
                          setSelectedItemIndex(idx);
                          setUseTargetPrompt(true);
                        }
                      }}
                      className="flex items-center justify-between cursor-pointer py-1 px-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 shrink-0 flex items-center justify-center">
                          {isSelected && <FF6Cursor active={true} />}
                        </div>
                        <span 
                          style={{ fontSize: '36px', lineHeight: '22px' }} 
                          className="text-white font-black drop-shadow-[2px_2px_0_#000000]"
                        >
                          {it.name}
                        </span>
                      </div>
                      <span 
                        style={{ fontSize: '36px', lineHeight: '22px' }} 
                        className="text-white font-black drop-shadow-[2px_2px_0_#000000] font-mono tracking-wider"
                      >
                        :  {it.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Scroll Arrow Indicators */}
            <div className="w-6 shrink-0 flex flex-col items-center justify-center text-white select-none animate-pulse">
              <span style={{ fontSize: '18px', lineHeight: '14px' }}>▲</span>
              <span style={{ fontSize: '18px', lineHeight: '14px' }}>▼</span>
            </div>
          </FF6Window>
        </div>
      );
    }

    // SCREEN 2: Use Item (Target Selection)
    return (
      <div 
        id="ff6_item_screen_2"
        className="absolute inset-0 z-40 flex items-stretch gap-2.5 p-1.5 md:p-3 font-mono uppercase font-black select-none bg-slate-950/85 backdrop-blur-xs rounded-lg"
      >
        {/* Left Column: Stacked Windows */}
        <div className="w-44 md:w-56 flex flex-col gap-2.5 shrink-0">
          {/* Box 1: Item Name */}
          <FF6Window className="h-16 md:h-20 justify-center px-4">
            <span 
              style={{ fontSize: '36px', lineHeight: '22px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000] tracking-wide"
            >
              {activeItem?.name || 'Item'}
            </span>
          </FF6Window>

          {/* Box 2: Owned */}
          <FF6Window className="h-28 md:h-32 justify-center px-4 py-2">
            <span 
              style={{ fontSize: '32px', lineHeight: '20px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000]"
            >
              Owned:
            </span>
            <span 
              style={{ fontSize: '38px', lineHeight: '24px' }} 
              className="text-white font-black drop-shadow-[2px_2px_0_#000000] mt-1 pl-4 font-mono"
            >
              {activeItem?.count ?? 0}
            </span>
          </FF6Window>

          {/* Back Button */}
          <button
            id="ff6_item_target_cancel"
            onClick={() => {
              soundFX.playCancel();
              setUseTargetPrompt(false);
            }}
            className="mt-auto px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-yellow-400 rounded-lg border-2 border-slate-500 hover:border-yellow-400 uppercase tracking-wider font-black text-xs md:text-sm cursor-pointer transition-colors text-center shadow-md"
          >
            VOLTAR - ESC
          </button>
        </div>

        {/* Right Main Window: Party members list */}
        <FF6Window className="flex-1 p-3 md:p-6 overflow-y-auto custom-scrollbar justify-start gap-3 md:gap-4">
          {party.map((hero, idx) => {
            const isSelected = selectedHeroIndex === idx;
            return (
              <div
                key={hero.id || idx}
                id={`ff6_hero_target_${idx}`}
                onMouseEnter={() => {
                  if (selectedHeroIndex !== idx) {
                    soundFX.playCursor();
                    setSelectedHeroIndex(idx);
                  }
                }}
                onClick={() => handleApplyItem(selectedItemIndex, idx)}
                className={`flex items-center gap-3 md:gap-5 p-2.5 md:p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white/10 ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Glove Cursor pointing directly to the character */}
                <div className="w-7 md:w-8 shrink-0 flex items-center justify-center">
                  {isSelected && <FF6Cursor active={true} />}
                </div>

                {/* Hero Portrait */}
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 border-[2px] border-slate-200 rounded overflow-hidden shadow-[inset_0_0_0_1px_#000] bg-black/40">
                  <HeroPortrait
                    heroClass={hero.heroClass}
                    emoji={hero.emoji}
                    name={hero.name}
                    className="w-full h-full"
                  />
                </div>

                {/* Hero Stats */}
                <div className="flex flex-col justify-center flex-1 font-mono">
                  {/* Hero Name */}
                  <div 
                    style={{ fontSize: '38px', lineHeight: '24px' }} 
                    className="text-white font-black drop-shadow-[2px_2px_0_#000000] tracking-widest uppercase"
                  >
                    {hero.name}
                  </div>

                  {/* LV */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3 mt-1.5"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">LV</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000] min-w-[28px]">{hero.level}</span>
                  </div>

                  {/* HP */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">HP</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                      {String(hero.stats.hp).padStart(3, ' ')} / {String(hero.stats.maxHp).padStart(3, ' ')}
                    </span>
                  </div>

                  {/* MP */}
                  <div 
                    style={{ fontSize: '34px', lineHeight: '20px' }} 
                    className="flex items-center gap-3"
                  >
                    <span className="text-[#00ffff] font-bold drop-shadow-[1px_1px_0_#000000]">MP</span>
                    <span className="text-white font-bold drop-shadow-[1px_1px_0_#000000]">
                      {String(hero.stats.mp).padStart(3, ' ')} / {String(hero.stats.maxMp).padStart(3, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </FF6Window>
      </div>
    );
  };

  const renderEquipMenu = () => {
    const currentHeroEquipment: HeroEquipment = currentHero ? getDefaultHeroEquipment(currentHero) : {
      rHand: null, lHand: null, head: null, body: null
    };
    const currentStats = currentHero ? calculateHeroFF6Stats(currentHero, currentHeroEquipment) : {
      vigor: 30, speed: 30, stamina: 30, magPwr: 30, batPwr: 20, defense: 20, evade: 10, magDef: 15, mBlock: 5
    };

    const availableItemsForSlot: (EquipmentItem | null)[] = [
      null,
      ...inventoryEquipment.filter((item) => item.slot === selectedSlot),
    ];

    const hoveredCandidateItem = availableItemsForSlot[selectedEquipItemIdx] ?? null;
    const prospectiveEquipment: HeroEquipment = {
      ...currentHeroEquipment,
      [selectedSlot]: hoveredCandidateItem,
    };
    const prospectiveStats = currentHero ? calculateHeroFF6Stats(currentHero, prospectiveEquipment) : currentStats;

    const equipCommands: { id: 'EQUIP' | 'OPTIMUM' | 'RMOVE' | 'EMPTY'; label: string }[] = [
      { id: 'EQUIP', label: 'EQUIPAR' },
      { id: 'OPTIMUM', label: 'OTIMO' },
      { id: 'RMOVE', label: 'REMOVER' },
      { id: 'EMPTY', label: 'LIMPAR' },
    ];

    const statRows = [
      { label: 'Poder de Batalha', cur: currentStats.batPwr, nxt: prospectiveStats.batPwr, isPercent: false },
      { label: 'Defesa', cur: currentStats.defense, nxt: prospectiveStats.defense, isPercent: false },
      { label: 'Defesa Magica', cur: currentStats.magDef, nxt: prospectiveStats.magDef, isPercent: false },
      { label: 'Bloqueio Magico', cur: currentStats.mBlock, nxt: prospectiveStats.mBlock, isPercent: true },
      { label: 'Velocidade', cur: currentStats.speed, nxt: prospectiveStats.speed, isPercent: false },
      { label: 'Vigor', cur: currentStats.vigor, nxt: prospectiveStats.vigor, isPercent: false },
      { label: 'Poder de Magia', cur: currentStats.magPwr, nxt: prospectiveStats.magPwr, isPercent: false },
    ];

    return (
      <div 
        id="ff6_equip_menu_container"
        className="absolute inset-0 z-40 flex flex-col gap-2.5 p-1 animate-fadeIn select-none"
      >
        {/* ================= 1. TOP WINDOW: COMMANDS (EQUIPAR, OTIMO, REMOVER, LIMPAR) ================= */}
        <FF6Window className="p-2 md:p-3 flex-row items-center justify-between shrink-0 h-14 md:h-16">
          {/* Commands Row */}
          <div className="flex items-center gap-2 md:gap-6 flex-1">
            {equipCommands.map((cmd) => {
              const isActive = equipCommand === cmd.id;
              const hasCursor = equipFocus === 'COMMANDS' && isActive;
              return (
                <button
                  key={cmd.id}
                  id={`ff6_equip_cmd_${cmd.id.toLowerCase()}`}
                  onMouseEnter={() => {
                    if (equipFocus === 'COMMANDS') {
                      soundFX.playCursor();
                      setEquipCommand(cmd.id);
                    }
                  }}
                  onClick={() => {
                    setEquipCommand(cmd.id);
                    if (cmd.id === 'EQUIP') {
                      soundFX.playSelect();
                      setEquipFocus('SLOTS');
                    } else if (cmd.id === 'OPTIMUM') {
                      handleOptimum();
                    } else if (cmd.id === 'RMOVE') {
                      soundFX.playSelect();
                      setEquipFocus('SLOTS');
                    } else if (cmd.id === 'EMPTY') {
                      handleEmpty();
                    }
                  }}
                  className="flex items-center gap-1 cursor-pointer py-1 px-1 rounded transition-transform active:scale-95"
                >
                  <div className="w-6 shrink-0 flex items-center justify-center">
                    {hasCursor && <FF6Cursor active={true} />}
                  </div>
                  <span
                    style={{ fontSize: '38px', lineHeight: '24px' }}
                    className={`font-black drop-shadow-[2px_2px_0_#000000] tracking-wider ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cmd.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Top Right: Back button */}
          <button
            id="ff6_equip_back_button"
            onClick={() => {
              if (equipFocus === 'ITEMS') {
                soundFX.playCancel();
                setEquipFocus('SLOTS');
              } else if (equipFocus === 'SLOTS') {
                soundFX.playCancel();
                setEquipFocus('COMMANDS');
              } else {
                soundFX.playCancel();
                setSubView(null);
              }
            }}
            className="px-3 py-1 bg-black/40 hover:bg-white/20 text-yellow-400 hover:text-white rounded border border-slate-500 uppercase tracking-wider font-bold text-xs md:text-sm cursor-pointer transition-colors shadow-inner"
          >
            VOLTAR - ESC
          </button>
        </FF6Window>

        {/* ================= 2. MIDDLE WINDOW: EQUIPMENT SLOTS & HERO INFO ================= */}
        <FF6Window className="p-3 md:p-4 flex-row items-center justify-between shrink-0 h-44 md:h-48">
          {/* Left Column: 4 Equipment Slots */}
          <div className="flex-1 flex flex-col justify-between h-full pr-2">
            {([
              { slot: 'rHand' as EquipmentSlot, label: 'Arma', icon: 'weapon', item: currentHeroEquipment.rHand },
              { slot: 'lHand' as EquipmentSlot, label: 'Escudo', icon: 'shield', item: currentHeroEquipment.lHand },
              { slot: 'head' as EquipmentSlot, label: 'Elmo', icon: 'head', item: currentHeroEquipment.head },
              { slot: 'body' as EquipmentSlot, label: 'Armadura', icon: 'body', item: currentHeroEquipment.body },
            ]).map((slotRow) => {
              const isSelected = equipFocus === 'SLOTS' && selectedSlot === slotRow.slot;
              const isSlotActiveInItems = equipFocus === 'ITEMS' && selectedSlot === slotRow.slot;

              return (
                <div
                  key={slotRow.slot}
                  id={`ff6_slot_${slotRow.slot}`}
                  onMouseEnter={() => {
                    if (equipFocus === 'SLOTS') {
                      soundFX.playCursor();
                      setSelectedSlot(slotRow.slot);
                    }
                  }}
                  onClick={() => {
                    setSelectedSlot(slotRow.slot);
                    if (equipCommand === 'RMOVE') {
                      handleRemoveSlot(slotRow.slot);
                    } else {
                      soundFX.playSelect();
                      setEquipFocus('ITEMS');
                      setSelectedEquipItemIdx(0);
                    }
                  }}
                  className={`flex items-center cursor-pointer py-0.5 px-1 rounded transition-colors ${
                    isSelected ? 'bg-white/15 ring-1 ring-yellow-400' : isSlotActiveInItems ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Glove Cursor */}
                  <div className="w-6 shrink-0 flex items-center justify-center">
                    {isSelected && <FF6Cursor active={true} />}
                  </div>

                  {/* Slot Label (cyan, in Portuguese) */}
                  <span
                    style={{ fontSize: '38px', lineHeight: '24px' }}
                    className="text-[#00ffff] font-black drop-shadow-[2px_2px_0_#000000] w-36 md:w-40 tracking-wide shrink-0"
                  >
                    {slotRow.label}
                  </span>

                  {/* Slot Icon */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 mr-2">
                    {slotRow.icon === 'weapon' && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="drop-shadow-[1px_1px_0_#000]">
                        <path d="M13 3 L7 9 L6 8 L5 9 L7 11 L8 10 L9 11 L15 5 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
                        <path d="M3 13 L5 11 L4 10 L2 12 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.8" />
                        <path d="M1 15 L3 13" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {slotRow.icon === 'shield' && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="drop-shadow-[1px_1px_0_#000]">
                        <path d="M8 1 L14 4 L14 8 C14 12 8 15 8 15 C8 15 2 12 2 8 L2 4 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="0.8" />
                        <path d="M8 3 L8 13" stroke="#f8fafc" strokeWidth="1.2" />
                        <path d="M4 7 L12 7" stroke="#f8fafc" strokeWidth="1.2" />
                      </svg>
                    )}
                    {slotRow.icon === 'head' && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="drop-shadow-[1px_1px_0_#000]">
                        <path d="M3 11 C3 7 5 4 8 4 C11 4 13 7 13 11 Z" fill="#10b981" stroke="#0f172a" strokeWidth="0.8" />
                        <path d="M1 12 L15 12 L13 14 L3 14 Z" fill="#047857" stroke="#0f172a" strokeWidth="0.8" />
                        <circle cx="8" cy="7" r="1.5" fill="#fef08a" />
                      </svg>
                    )}
                    {slotRow.icon === 'body' && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="drop-shadow-[1px_1px_0_#000]">
                        <path d="M5 2 L8 5 L11 2 L14 5 L12 14 L4 14 L2 5 Z" fill="#64748b" stroke="#0f172a" strokeWidth="0.8" />
                        <path d="M6 5 L10 5 L9 13 L7 13 Z" fill="#cbd5e1" />
                      </svg>
                    )}
                  </div>

                  {/* Equipped Item Name (white) */}
                  <span
                    style={{ fontSize: '38px', lineHeight: '24px' }}
                    className={`font-black drop-shadow-[2px_2px_0_#000000] tracking-wide truncate ${
                      slotRow.item ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {slotRow.item ? slotRow.item.name : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Hero Portrait & Name */}
          <div className="w-36 md:w-48 flex flex-col items-center justify-center border-l-2 border-blue-900/60 pl-2 shrink-0">
            {/* Hero switcher arrows */}
            <div className="flex items-center gap-2 mb-1">
              <button
                id="ff6_equip_prev_hero"
                onClick={() => {
                  soundFX.playCursor();
                  setSelectedHeroIndex((prev) => (prev - 1 + party.length) % party.length);
                }}
                className="px-2 py-0.5 bg-black/40 hover:bg-white/20 text-yellow-400 rounded cursor-pointer font-bold text-xs transition-colors"
                title="Heroi Anterior"
              >
                ◄
              </button>
              <span className="text-yellow-400 font-bold text-xs">Heroi {selectedHeroIndex + 1} de {party.length}</span>
              <button
                id="ff6_equip_next_hero"
                onClick={() => {
                  soundFX.playCursor();
                  setSelectedHeroIndex((prev) => (prev + 1) % party.length);
                }}
                className="px-2 py-0.5 bg-black/40 hover:bg-white/20 text-yellow-400 rounded cursor-pointer font-bold text-xs transition-colors"
                title="Proximo Heroi"
              >
                ►
              </button>
            </div>

            {/* Bust Portrait */}
            <div className="w-16 h-16 md:w-20 md:h-20 border-[2px] border-slate-200 rounded overflow-hidden shadow-[inset_0_0_0_1px_#000] bg-black/40">
              <HeroPortrait
                heroClass={currentHero?.heroClass || 'GUERREIRO'}
                emoji={currentHero?.emoji || '⚔️'}
                name={currentHero?.name || 'Heroi'}
                className="w-full h-full"
              />
            </div>

            {/* Hero Name */}
            <span
              style={{ fontSize: '38px', lineHeight: '24px' }}
              className="text-white font-black drop-shadow-[2px_2px_0_#000000] uppercase tracking-widest mt-1.5 text-center truncate max-w-full"
            >
              {currentHero?.name}
            </span>
          </div>
        </FF6Window>

        {/* ================= 3. BOTTOM WINDOW: STATS / ITEM PICKER ================= */}
        {equipFocus !== 'ITEMS' ? (
          /* View 3A: Classic FF6 Stats Panel - 2 Spacious Columns with Large Readable Font */
          <FF6Window className="flex-1 p-3 md:p-5 flex-col justify-center overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-3xl mx-auto grid grid-cols-2 gap-x-8 md:gap-x-16 gap-y-3 md:gap-y-4 py-2 px-2 md:px-4">
              {statRows.map((statRow) => (
                <div key={statRow.label} className="flex items-center justify-between border-b border-blue-900/40 pb-1.5">
                  {/* Cyan Stat Label */}
                  <span
                    style={{ fontSize: '46px', lineHeight: '28px' }}
                    className="text-[#00ffff] font-black drop-shadow-[2px_2px_0_#000000] tracking-wider"
                  >
                    {statRow.label}
                  </span>

                  {/* White Value with Cyan Plus or por cento */}
                  <div className="flex items-center font-mono">
                    <span
                      style={{ fontSize: '46px', lineHeight: '28px' }}
                      className="text-white font-black drop-shadow-[2px_2px_0_#000000] min-w-[42px] text-right"
                    >
                      {statRow.isPercent ? `${statRow.cur} por cento` : statRow.cur}
                    </span>
                    {!statRow.isPercent && (
                      <span
                        style={{ fontSize: '46px', lineHeight: '28px' }}
                        className="text-[#00ffff] font-black drop-shadow-[2px_2px_0_#000000] ml-1.5"
                      >
                        +
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FF6Window>
        ) : (
          /* View 3B: Item Selection & Stat Comparison Preview with Large Fonts */
          <div className="flex-1 grid grid-cols-12 gap-2.5 overflow-hidden">
            {/* Left: List of items available for selectedSlot */}
            <FF6Window className="col-span-7 p-2.5 md:p-3 overflow-y-auto custom-scrollbar flex-col justify-start">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-600 mb-2">
                <span
                  style={{ fontSize: '34px', lineHeight: '22px' }}
                  className="text-yellow-400 font-black tracking-wider"
                >
                  EQUIPAMENTO PARA {selectedSlot === 'rHand' ? 'ARMA' : selectedSlot === 'lHand' ? 'ESCUDO' : selectedSlot === 'head' ? 'ELMO' : 'ARMADURA'}:
                </span>
                <span className="text-slate-400 text-xs">{availableItemsForSlot.length} opcoes</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {availableItemsForSlot.map((item, idx) => {
                  const isItemHovered = selectedEquipItemIdx === idx;
                  return (
                    <div
                      key={item ? item.id : 'empty_slot'}
                      id={`ff6_available_item_${idx}`}
                      onMouseEnter={() => {
                        soundFX.playCursor();
                        setSelectedEquipItemIdx(idx);
                      }}
                      onClick={() => handleEquipItem(item)}
                      className={`flex items-center justify-between py-1 px-1.5 rounded cursor-pointer transition-colors ${
                        isItemHovered ? 'bg-white/15 ring-1 ring-yellow-400' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-5 shrink-0 flex items-center justify-center">
                          {isItemHovered && <FF6Cursor active={true} />}
                        </div>
                        <span
                          style={{ fontSize: '36px', lineHeight: '22px' }}
                          className={`font-black drop-shadow-[2px_2px_0_#000000] tracking-wide truncate ${
                            item ? 'text-white' : 'text-slate-400 italic'
                          }`}
                        >
                          {item ? item.name : '- Vazio / Desequipar'}
                        </span>
                      </div>

                      {item && (
                        <div
                          style={{ fontSize: '30px', lineHeight: '18px' }}
                          className="text-cyan-300 shrink-0 font-bold ml-2 drop-shadow-[1px_1px_0_#000]"
                        >
                          {item.batPwr ? `PODER +${item.batPwr}` : item.defense ? `DEF +${item.defense}` : item.magDef ? `M.DEF +${item.magDef}` : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FF6Window>

            {/* Right: Real-time Stat Comparison with Large Fonts */}
            <FF6Window className="col-span-5 p-2.5 md:p-3 overflow-y-auto custom-scrollbar flex-col justify-between">
              <div className="pb-1 border-b border-slate-600 mb-1 text-center">
                <span
                  style={{ fontSize: '34px', lineHeight: '22px' }}
                  className="text-yellow-400 font-black tracking-wider"
                >
                  PREVIA DE ATRIBUTOS
                </span>
              </div>

              <div className="flex flex-col gap-2 my-auto">
                {statRows.map((statRow) => {
                  const diff = statRow.nxt - statRow.cur;
                  return (
                    <div key={statRow.label} className="flex items-center justify-between py-0.5 border-b border-blue-950/40">
                      <span
                        style={{ fontSize: '34px', lineHeight: '22px' }}
                        className="text-[#00ffff] font-black drop-shadow-[1px_1px_0_#000]"
                      >
                        {statRow.label}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          style={{ fontSize: '34px', lineHeight: '22px' }}
                          className="text-white font-bold drop-shadow-[1px_1px_0_#000]"
                        >
                          {statRow.isPercent ? `${statRow.cur} por cento` : statRow.cur}
                        </span>
                        <span className="text-yellow-400 text-xs">►</span>
                        <span
                          style={{ fontSize: '34px', lineHeight: '22px' }}
                          className={`font-black drop-shadow-[1px_1px_0_#000] ${
                            diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {statRow.isPercent ? `${statRow.nxt} por cento` : statRow.nxt} {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                id="ff6_equip_confirm_button"
                onClick={() => handleEquipItem(hoveredCandidateItem)}
                style={{ fontSize: '34px', lineHeight: '22px' }}
                className="mt-2 w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded border border-white uppercase tracking-wider cursor-pointer shadow-md transition-colors"
              >
                EQUIPAR ITEM
              </button>
            </FF6Window>
          </div>
        )}
      </div>
    );
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
                        style={idx === 0 ? { fontSize: '36px', lineHeight: '22px' } : { fontSize: '36px', lineHeight: '21px' }}
                        className="text-lg md:text-2xl font-black text-white drop-shadow-[2px_2px_0_#000000] tracking-widest uppercase flex items-center gap-2"
                      >
                        <span>{hero.name}</span>
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
          </div>
          <button
            id="ff6_close_button"
            onClick={() => {
              soundFX.playCancel();
              onClose();
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded border border-slate-500 uppercase tracking-wider font-black transition-colors"
          >
            FECHAR
          </button>
        </div>

        {/* ================= DEDICATED FF6 ITEM SUB-VIEW (SCREEN 1 & SCREEN 2) ================= */}
        {subView === 'Item' && renderItemMenu()}

        {/* ================= DEDICATED FF6 SKILLS SUB-VIEW (SCREEN 1 & SCREEN 2) ================= */}
        {subView === 'Skills' && renderSkillsMenu()}

        {/* ================= DEDICATED FF6 EQUIP SUB-VIEW ================= */}
        {subView === 'Equip' && renderEquipMenu()}

        {/* ================= DEDICATED FF6 BESTIARY SUB-VIEW ================= */}
        {subView === 'Bestiary' && (
          <BestiaryMenu onBack={() => setSubView(null)} />
        )}

        {/* ================= OTHER MODAL SUB-VIEWS (STATUS & CONFIG) ================= */}
        {subView && subView !== 'Item' && subView !== 'Skills' && subView !== 'Equip' && subView !== 'Bestiary' && (
          <div 
            id="ff6_subview_modal"
            className="absolute inset-0 rounded-lg border-[3px] border-[#cbd5e1] p-3 md:p-5 z-40 flex flex-col shadow-[inset_0_0_0_2px_#050518,0_4px_8px_rgba(0,0,0,0.6)] font-mono uppercase font-black overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #4354c7 0%, #28348a 35%, #121856 70%, #030424 100%)' }}
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
                <span></span>
                <span>VOLTAR</span>
              </button>

              <div className="text-white text-2xl md:text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                {subView === 'Status' && 'STATUS DA EQUIPE'}
                {subView === 'Config' && 'CONFIGURACOES'}
              </div>
            </div>

            {/* ================= STATUS SUB-VIEW ================= */}
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
                        {isRenaming ? (
                          <div className="flex flex-col gap-1 mb-2">
                            <label className="text-xs text-cyan-300 font-bold uppercase">
                              Novo Nome - Max 12:
                            </label>
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                type="text"
                                value={renamingName}
                                onChange={e => setRenamingName(cleanAscii(e.target.value).slice(0, 12))}
                                maxLength={12}
                                autoFocus
                                className="bg-black/80 border-2 border-yellow-400 rounded px-2 py-1 text-white text-lg md:text-xl font-mono font-black tracking-widest uppercase outline-none"
                              />
                              <button
                                onClick={() => {
                                  const clean = cleanAscii(renamingName).trim();
                                  if (!clean) return;
                                  const updated = party.map((h, i) => i === selectedHeroIndex ? { ...h, name: clean } : h);
                                  onUpdateParty(updated, player.inventory?.items || []);
                                  setIsRenaming(false);
                                  soundFX.playSelect();
                                  setFeedbackMessage(`Heroi renomeado para ${clean}!`);
                                  setTimeout(() => setFeedbackMessage(null), 2500);
                                }}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm rounded cursor-pointer uppercase shadow"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setIsRenaming(false)}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded cursor-pointer uppercase"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-3xl md:text-5xl font-black text-white tracking-wider uppercase">
                              {party[selectedHeroIndex].name}
                            </div>
                            <button
                              onClick={() => {
                                soundFX.playSelect();
                                setIsRenaming(true);
                                setRenamingName(party[selectedHeroIndex].name);
                              }}
                              className="text-xs px-2.5 py-1 bg-blue-900/90 hover:bg-blue-700 text-yellow-300 border border-slate-400 rounded font-bold uppercase cursor-pointer transition-colors shadow"
                              title="Renomear Heroi"
                            >
                              Renomear
                            </button>
                          </div>
                        )}
                        <div className="text-yellow-400 font-black text-xl md:text-2xl mt-1 flex items-center gap-2">
                          <span>{party[selectedHeroIndex].heroClass}</span>
                          <span className="text-xs md:text-sm text-cyan-300 border border-cyan-400/50 px-2 py-0.5 rounded bg-blue-900/60 uppercase">Nossa Equipe</span>
                        </div>
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
                        <div className="text-white">PODER DE BATALHA: <span className="text-yellow-400">{party[selectedHeroIndex].stats.batPwr}</span></div>
                        <div className="text-white">DEFESA: <span className="text-green-400">{party[selectedHeroIndex].stats.def}</span></div>
                        <div className="text-white">DEFESA MAGICA: <span className="text-emerald-300">{party[selectedHeroIndex].stats.magDef}</span></div>
                        <div className="text-white">BLOQUEIO MAGICO: <span className="text-cyan-300">{party[selectedHeroIndex].stats.mBlock} por cento</span></div>
                        <div className="text-white">VELOCIDADE: <span className="text-purple-400">{party[selectedHeroIndex].stats.vel}</span></div>
                        <div className="text-white">VIGOR: <span className="text-orange-400">{party[selectedHeroIndex].stats.vigor}</span></div>
                        <div className="text-white">PODER DE MAGIA: <span className="text-sky-400">{party[selectedHeroIndex].stats.magPwr}</span></div>
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
                    <div className="text-white font-black text-xl md:text-2xl">MUSICA DE FUNDO - BGM</div>
                    <div className="text-xs md:text-sm text-slate-300 font-normal">Trilhas de Prologo, Overworld, Batalha e Vitoria</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = bgm.toggle();
                      setBgmActive(next);
                      if (soundFX.enabled) soundFX.playSelect();
                    }}
                    className={`px-6 py-2 rounded font-black text-base md:text-xl uppercase border-2 shadow-[inset_0_0_0_1px_#000] cursor-pointer active:scale-95 transition-all ${
                      bgmActive 
                        ? 'bg-green-600 text-white border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                        : 'bg-red-800 text-slate-300 border-red-500'
                    }`}
                  >
                    {bgmActive ? 'LIGADO' : 'MUDO'}
                  </button>
                </div>

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
                      setSfxActive(soundFX.enabled);
                      if (soundFX.enabled) soundFX.playSelect();
                    }}
                    className={`px-6 py-2 rounded font-black text-base md:text-xl uppercase border-2 shadow-[inset_0_0_0_1px_#000] cursor-pointer active:scale-95 transition-all ${
                      sfxActive 
                        ? 'bg-green-600 text-white border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                        : 'bg-red-800 text-slate-300 border-red-500'
                    }`}
                  >
                    {sfxActive ? 'LIGADO' : 'MUDO'}
                  </button>
                </div>

                <div 
                  className="rounded-lg border-[3px] border-slate-200 p-4 shadow-[inset_0_0_0_2px_#000,0_4px_6px_rgba(0,0,0,0.5)] flex justify-between items-center"
                  style={{ background: 'linear-gradient(to bottom, #1e3a8a 0%, #000000 100%)' }}
                >
                  <div>
                    <div className="text-white font-black text-xl md:text-2xl">TECLAS DE ATALHO</div>
                    <div className="text-xs md:text-sm text-slate-300 font-normal">WASD ou Setas para mover. M para abrir este menu.</div>
                  </div>
                  <span className="text-yellow-400 font-mono font-black text-2xl">M</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
