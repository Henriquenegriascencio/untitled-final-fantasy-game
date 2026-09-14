import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const MAP_TITLES: Record<string, { label: string; subtitle?: string }> = {
  OVERWORLD: { label: 'CONTINENTE DE ELDORIA', subtitle: 'Mapa do Mundo' },
  TOWN_CORNELIA: { label: 'CIDADE DE CORNELIA', subtitle: 'Area Urbana Fortificada' },
  TOWN_PRAVOCA: { label: 'CIDADE DE PRAVOCA', subtitle: 'Area Portuaria do Leste' },
  TOWN_GAIA: { label: 'CIDADE DE GAIA', subtitle: 'Area Sagrada dos Sabios' },
  INTERIOR_CORNELIA_HOUSE: { label: 'RESIDENCIA DE CORNELIA', subtitle: 'Area Residencial' },
  INTERIOR_CORNELIA_SHOP: { label: 'LOJA DE ITENS E MAGIAS', subtitle: 'Area Comercial' },
  INTERIOR_CORNELIA_TOOLSMITH: { label: 'FORJA E FERRAMENTEIRO', subtitle: 'Area Artesanal' },
  INTERIOR_CORNELIA_INN: { label: 'ESTALAGEM DE CORNELIA', subtitle: 'Area de Repouso' },
  INTERIOR_PRAVOCA_HOUSE: { label: 'RESIDENCIA DE PRAVOCA', subtitle: 'Area Residencial' },
  INTERIOR_PRAVOCA_SHOP: { label: 'LOJA DE ITENS DO PORTO', subtitle: 'Area Comercial' },
  INTERIOR_PRAVOCA_TOOLSMITH: { label: 'FORJA DOS MARES', subtitle: 'Area Artesanal' },
  INTERIOR_PRAVOCA_INN: { label: 'ESTALAGEM DO MARINHEIRO', subtitle: 'Area de Repouso' },
  INTERIOR_GAIA_HOUSE: { label: 'RETIRO DA MONTANHA', subtitle: 'Area Residencial' },
  INTERIOR_GAIA_SHOP: { label: 'LOJA CELESTIAL DE GAIA', subtitle: 'Area Comercial' },
  INTERIOR_GAIA_TOOLSMITH: { label: 'FORJA LENDARIA DE GAIA', subtitle: 'Area Artesanal' },
  INTERIOR_GAIA_INN: { label: 'ESTALAGEM DAS ALTURAS', subtitle: 'Area de Repouso' },
  DUNGEON_PRELUDIO_1: { label: 'CAVERNA DO PRELUDIO', subtitle: 'Area 1 - Entrada' },
  DUNGEON_PRELUDIO_2: { label: 'CAVERNA DO PRELUDIO', subtitle: 'Area 2 - Camara do Guardiao' },
  DUNGEON_DESAFIO_1: { label: 'CIDADELA DOS DESAFIOS', subtitle: 'Area 1 - Entrada' },
  DUNGEON_DESAFIO_2: { label: 'CIDADELA DOS DESAFIOS', subtitle: 'Area 2 - Camara do Cavaleiro' },
  DUNGEON_TERRA_1: { label: 'SANTUARIO DA TERRA', subtitle: 'Area 1 - Entrada' },
  DUNGEON_TERRA_2: { label: 'SANTUARIO DA TERRA', subtitle: 'Area 2 - Altar de Lich' },
  DUNGEON_FOGO_1: { label: 'MONTE GULG', subtitle: 'Area 1 - Vulcao' },
  DUNGEON_FOGO_2: { label: 'MONTE GULG', subtitle: 'Area 2 - Cratera de Marilith' },
  DUNGEON_AGUA_1: { label: 'SANTUARIO SUBMERSO', subtitle: 'Area 1 - Profundezas' },
  DUNGEON_AGUA_2: { label: 'SANTUARIO SUBMERSO', subtitle: 'Area 2 - Abismo de Kraken' },
  DUNGEON_AR_1: { label: 'TORRE DA MIRAGEM', subtitle: 'Area 1 - Base' },
  DUNGEON_AR_2: { label: 'TORRE DA MIRAGEM', subtitle: 'Area 2 - Intermediaria' },
  DUNGEON_AR_3: { label: 'TORRE DA MIRAGEM', subtitle: 'Area 3 - Pinaculo de Tiamat' },
  DUNGEON_FINAL_1: { label: 'TEMPLO DO CAOS', subtitle: 'Area 1 - Dimensao Obscura' },
  DUNGEON_FINAL_2: { label: 'TEMPLO DO CAOS', subtitle: 'Area 2 - Camara Ancestral' },
  DUNGEON_FINAL_3: { label: 'TEMPLO DO CAOS', subtitle: 'Area 3 - Trono do Caos' }
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
