import { bgm } from './music';
import { soundFX } from './audio';

export interface AssetLoadStep {
  id: string;
  name: string;
  action: () => Promise<any>;
}

export const ASSET_LOAD_STEPS: AssetLoadStep[] = [
  {
    id: 'font',
    name: 'Fonte Tipografica do Reino',
    action: async () => {
      try {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          await (document as any).fonts.load("16px 'Final Fantasy VI SNESb'");
        }
        await fetch('/ff6.ttf');
      } catch {
        // Fallback gracefully
      }
    }
  },
  {
    id: 'sfx',
    name: 'Efeitos Sonoros de Combate e Menu',
    action: async () => {
      await soundFX.preloadSounds();
    }
  },
  {
    id: 'bgm_prologue',
    name: 'Tema Musical do Prologo',
    action: async () => {
      await bgm.preloadTrack('prologue');
    }
  },
  {
    id: 'bgm_overworld',
    name: 'Sinfonia do Mapa Mundi',
    action: async () => {
      await bgm.preloadTrack('overworld');
    }
  },
  {
    id: 'bgm_battle',
    name: 'Tema de Batalha Elemental',
    action: async () => {
      await bgm.preloadTrack('battle');
    }
  },
  {
    id: 'bgm_boss',
    name: 'Tema dos Guardioes dos Cristais',
    action: async () => {
      await bgm.preloadTrack('boss');
    }
  },
  {
    id: 'bgm_victory',
    name: 'Fanfarra da Vitoria Lendaria',
    action: async () => {
      await bgm.preloadTrack('victory');
    }
  }
];

export async function loadGameAssets(
  onProgress: (current: number, total: number, label: string) => void
): Promise<void> {
  const total = ASSET_LOAD_STEPS.length;
  let current = 0;

  for (const step of ASSET_LOAD_STEPS) {
    onProgress(current, total, step.name);
    try {
      await step.action();
    } catch {
      // Ignora falhas isoladas de rede para nunca travar a inicializacao
    }
    current++;
    onProgress(current, total, step.name);
  }
}
