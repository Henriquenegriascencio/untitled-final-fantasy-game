// Retro 16-bit sound effects using Audio files (/sounds/*) + Web Audio API fallback
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private audioCache: Map<string, HTMLAudioElement[]> = new Map();

  constructor() {
    // Preload audio elements lazily in browser
    if (typeof window !== 'undefined') {
      ['cursor', 'select', 'cancel', 'attack', 'hit', 'magic', 'heal', 'levelup', 'defeat', 'battle_start', 'victory'].forEach(name => {
        this.getOrCreateAudio(name);
      });
    }
  }

  private getOrCreateAudio(name: string): HTMLAudioElement {
    let pool = this.audioCache.get(name);
    if (!pool) {
      pool = [];
      this.audioCache.set(name, pool);
    }
    // Find an available (ended or unstarted) audio element
    const available = pool.find(a => a.paused || a.ended);
    if (available) {
      available.currentTime = 0;
      return available;
    }
    // Otherwise spawn a new one (pool up to 5 concurrent instances per sound)
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.preload = 'auto';
    pool.push(audio);
    return audio;
  }

  private playSoundFile(name: string, fallbackSynth: () => void) {
    if (!this.enabled) return;
    try {
      const audio = this.getOrCreateAudio(name);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked audio playback (e.g. autoplay policy), use Web Audio synth fallback
          fallbackSynth();
        });
      }
    } catch {
      fallbackSynth();
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // 1. Cursor movement sound (short retro blip)
  playCursor() {
    this.playSoundFile('cursor', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    });
  }

  // 2. Selection / Confirm sound (classic FF chime)
  playSelect() {
    this.playSoundFile('select', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.12, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.12);
      });
    });
  }

  // 3. Cancel / Back sound
  playCancel() {
    this.playSoundFile('cancel', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    });
  }

  // 4. Physical Attack / Weapon Slash sound
  playAttack() {
    this.playSoundFile('attack', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // White noise burst for whoosh
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    });
  }

  // 5. Impact / Damage Hit sound
  playHit() {
    this.playSoundFile('hit', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    });
  }

  // 6. Magic / Skill Cast sound
  playMagic() {
    this.playSoundFile('magic', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  // 7. Healing chime
  playHeal() {
    this.playSoundFile('heal', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    });
  }

  // 8. Level Up fanfare
  playLevelUp() {
    this.playSoundFile('levelup', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.18, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.35);
      });
    });
  }

  // 9. Unit Knockout / Defeat sound (Silenciado conforme pedido do usuario)
  playDefeat() {
    // Removido conforme solicitado pelo usuario
  }

  // 10. Battle Encounter / Start sound (Silenciado conforme pedido do usuario)
  playBattleStart() {
    // Removido conforme solicitado pelo usuario
  }

  // 11. Victory Fanfare (Silenciado o sintetizador para prevalecer a trilha sonora bgm)
  playVictory() {
    // Removido conforme solicitado pelo usuario
  }

  // Save fanfare (alias of level up / save)
  playSave() {
    this.playLevelUp();
  }
}

export const soundFX = new SoundFX();
export { bgm } from './music';

