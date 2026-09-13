import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const MAP_TITLES: Record<string, { label: string; subtitle?: string }> = {
  OVERWORLD: { label: 'CONTINENTE DE ELDORIA', subtitle: 'Mapa do Mundo' },
  TOWN_CORNELIA: { label: 'CIDADE DE CORNELIA', subtitle: 'Capital da Esperanca' },
  TOWN_PRAVOCA: { label: 'CIDADE DE PRAVOCA', subtitle: 'Porto Maritimo do Leste' },
  TOWN_GAIA: { label: 'CIDADE DE GAIA', subtitle: 'Santuario dos Sabios' },
  INTERIOR_CORNELIA_HOUSE: { label: 'RESIDENCIA DE CORNELIA', subtitle: 'Casa de Dona Marta' },
  INTERIOR_CORNELIA_SHOP: { label: 'LOJA DE ITENS E MAGIAS', subtitle: 'Emporio de Cornelia' },
  INTERIOR_CORNELIA_TOOLSMITH: { label: 'FORJA E FERRAMENTEIRO', subtitle: 'Oficina de Cornelia' },
  INTERIOR_CORNELIA_INN: { label: 'ESTALAGEM DE CORNELIA', subtitle: 'Repouso dos Guerreiros' },
  INTERIOR_PRAVOCA_HOUSE: { label: 'RESIDENCIA DE PRAVOCA', subtitle: 'Casa de Mestre Barnaby' },
  INTERIOR_PRAVOCA_SHOP: { label: 'LOJA DE ITENS DO PORTO', subtitle: 'Emporio de Pravoca' },
  INTERIOR_PRAVOCA_TOOLSMITH: { label: 'FORJA DOS MARES', subtitle: 'Oficina Naval de Pravoca' },
  INTERIOR_PRAVOCA_INN: { label: 'ESTALAGEM DO MARINHEIRO', subtitle: 'Repouso dos Navegantes' },
  INTERIOR_GAIA_HOUSE: { label: 'RETIRO DA MONTANHA', subtitle: 'Casa de Hermita Nicholas' },
  INTERIOR_GAIA_SHOP: { label: 'LOJA CELESTIAL DE GAIA', subtitle: 'Emporio Arcano' },
  INTERIOR_GAIA_TOOLSMITH: { label: 'FORJA LENDARIA DE GAIA', subtitle: 'Oficina Sagrada dos Sabios' },
  INTERIOR_GAIA_INN: { label: 'ESTALAGEM DAS ALTURAS', subtitle: 'Santuario do Repouso' },
  DUNGEON_PRELUDIO_1: { label: 'CAVERNA DO PRELUDIO', subtitle: 'Andar 1' },
  DUNGEON_PRELUDIO_2: { label: 'CAVERNA DO PRELUDIO', subtitle: 'Camara do Guardiao' },
  DUNGEON_DESAFIO_1: { label: 'CIDADELA DOS DESAFIOS', subtitle: 'Andar 1' },
  DUNGEON_DESAFIO_2: { label: 'CIDADELA DOS DESAFIOS', subtitle: 'Camara do Cavaleiro' },
  DUNGEON_TERRA_1: { label: 'SANTUARIO DA TERRA', subtitle: 'Andar 1' },
  DUNGEON_TERRA_2: { label: 'SANTUARIO DA TERRA', subtitle: 'Altar de Lich' },
  DUNGEON_FOGO_1: { label: 'MONTE GULG', subtitle: 'Andar 1' },
  DUNGEON_FOGO_2: { label: 'MONTE GULG', subtitle: 'Cratera de Marilith' },
  DUNGEON_AGUA_1: { label: 'SANTUARIO SUBMERSO', subtitle: 'Andar 1' },
  DUNGEON_AGUA_2: { label: 'SANTUARIO SUBMERSO', subtitle: 'Abismo de Kraken' },
  DUNGEON_AR_1: { label: 'TORRE DA MIRAGEM', subtitle: 'Andar 1' },
  DUNGEON_AR_2: { label: 'TORRE DA MIRAGEM', subtitle: 'Pinaculo de Tiamat' },
  DUNGEON_FINAL_1: { label: 'TEMPLO DO CAOS', subtitle: 'Dimensao Obscura' },
  DUNGEON_FINAL_2: { label: 'TEMPLO DO CAOS', subtitle: 'Trono do Caos' }
};

interface MapTransitionOverlayProps {
  isVisible: boolean;
  label?: string;
  subtitle?: string;
}

export const MapTransitionOverlay: React.FC<MapTransitionOverlayProps> = ({
  isVisible,
  label,
  subtitle,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="map_transition_overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center select-none pointer-events-auto"
        >
          {label && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -8 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="text-center px-6 py-4 rounded-xl border-2 border-yellow-500/80 bg-gradient-to-b from-[#0a1140] to-[#02051e] shadow-[0_0_35px_rgba(234,179,8,0.35)]"
            >
              <div className="text-yellow-400 font-mono font-black text-xl md:text-3xl tracking-widest uppercase drop-shadow-[0_2px_4px_#000]">
                {label}
              </div>
              {subtitle && (
                <div className="text-slate-300 font-mono font-bold text-xs md:text-sm tracking-wider mt-1 drop-shadow-[0_1px_2px_#000]">
                  {subtitle}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
