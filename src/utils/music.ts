// Background Music (BGM) Manager for Elemental Fantasy
// Uses user-uploaded audio tracks from /music/ folder with zero-delay preloading

export type MusicTrack = 'prologue' | 'overworld' | 'battle' | 'boss' | 'victory' | null;

const TRACK_PATHS: Record<Exclude<MusicTrack, null>, string[]> = {
  prologue: ['/music/prologue.mp3', '/musics/prologue.mp3'],
  overworld: ['/music/overworld.mp3', '/music/overworld theme.mp3', '/musics/overworld theme.mp3'],
  battle: ['/music/battle.mp3', '/music/1-07 Battle.mp3', '/musics/1-07 Battle.mp3'],
  boss: ['/music/boss.mp3', '/music/boss battle theme.mp3', '/musics/boss battle theme.mp3'],
  victory: ['/music/victory.mp3', '/music/1-08 Victory Fanfare.mp3', '/musics/1-08 Victory Fanfare.mp3']
};

class MusicManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack = null;
  private targetTrack: MusicTrack = null;
  private isEnabled: boolean = true;
  private volume: number = 0.65;
  private isDucked: boolean = false;
  private fadeInterval: any = null;
  private duckInterval: any = null;
  private userInteracted: boolean = false;

  // Preloaded audio elements & blob urls for instant, zero-delay playback
  private preloadedAudios: Map<Exclude<MusicTrack, null>, HTMLAudioElement> = new Map();
  private blobUrls: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eldoria_music_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }

      // Unlock browser autoplay policy on first user interaction
      const unlockAudio = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  public get enabled(): boolean {
    return this.isEnabled;
  }

  public set enabled(val: boolean) {
    this.isEnabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('eldoria_music_enabled', val ? 'true' : 'false');
    }
    if (!val) {
      this.pauseCurrent();
    } else if (this.targetTrack) {
      this.play(this.targetTrack);
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      const target = this.isDucked ? Math.max(0.05, this.volume * 0.22) : this.volume;
      this.currentAudio.volume = target;
    }
  }

  public setDucked(ducked: boolean) {
    this.isDucked = ducked;
    if (!this.currentAudio) return;

    if (this.duckInterval) {
      clearInterval(this.duckInterval);
      this.duckInterval = null;
    }

    const targetVol = ducked ? Math.max(0.06, this.volume * 0.22) : this.volume;
    const currentVol = this.currentAudio.volume;
    const diff = targetVol - currentVol;
    const steps = 8;
    let stepCount = 0;

    this.duckInterval = setInterval(() => {
      stepCount++;
      if (!this.currentAudio || stepCount >= steps) {
        clearInterval(this.duckInterval);
        this.duckInterval = null;
        if (this.currentAudio) {
          this.currentAudio.volume = targetVol;
        }
      } else {
        const nextVol = currentVol + (diff * (stepCount / steps));
        this.currentAudio.volume = Math.max(0, Math.min(1, nextVol));
      }
    }, 25);
  }

  public get ducked(): boolean {
    return this.isDucked;
  }

  public getTrack(): MusicTrack {
    return this.currentTrack;
  }

  private pauseCurrent() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  /**
   * Preloads an individual music track into memory as a Blob URL.
   * This guarantees zero-delay playback with no network streaming hiccup.
   */
  public async preloadTrack(track: Exclude<MusicTrack, null>): Promise<boolean> {
    if (this.preloadedAudios.has(track)) {
      return true;
    }

    const paths = TRACK_PATHS[track];
    for (const path of paths) {
      try {
        const res = await fetch(encodeURI(path));
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          this.blobUrls.set(track, blobUrl);

          const audio = new Audio(blobUrl);
          audio.loop = track !== 'victory';
          audio.preload = 'auto';
          audio.volume = 0;
          this.preloadedAudios.set(track, audio);
          return true;
        }
      } catch {
        // Continue to fallback path
      }
    }

    // Fallback: instantiate direct HTMLAudioElement
    try {
      const audio = new Audio(encodeURI(paths[0]));
      audio.loop = track !== 'victory';
      audio.preload = 'auto';
      audio.volume = 0;
      this.preloadedAudios.set(track, audio);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unlocks all preloaded audio instances on first user gesture.
   */
  public unlockAudio(): void {
    this.userInteracted = true;
    this.preloadedAudios.forEach((audio) => {
      try {
        const initialVol = audio.volume;
        audio.volume = 0;
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = initialVol;
          }).catch(() => {});
        }
      } catch {}
    });
  }

  public play(track: Exclude<MusicTrack, null>) {
    this.targetTrack = track;
    if (!this.isEnabled) return;

    // If already playing this track and not paused, keep playing
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    // If same track was paused, resume
    if (this.currentTrack === track && this.currentAudio && this.currentAudio.paused) {
      const targetVol = this.isDucked ? Math.max(0.06, this.volume * 0.22) : this.volume;
      this.currentAudio.volume = targetVol;
      this.currentAudio.play().catch(() => {});
      return;
    }

    // Fade out previous audio smoothly
    if (this.currentAudio) {
      const oldAudio = this.currentAudio;
      let fadeVol = oldAudio.volume;
      const step = fadeVol / 5;
      const fader = setInterval(() => {
        fadeVol -= step;
        if (fadeVol <= 0.05) {
          clearInterval(fader);
          oldAudio.pause();
          oldAudio.currentTime = 0;
        } else {
          oldAudio.volume = Math.max(0, fadeVol);
        }
      }, 25);
    }

    // Obtain preloaded audio or create a fallback
    let audio = this.preloadedAudios.get(track);
    if (!audio) {
      const paths = TRACK_PATHS[track];
      audio = new Audio(encodeURI(paths[0]));
      audio.loop = track !== 'victory';
      audio.preload = 'auto';
      this.preloadedAudios.set(track, audio);
    }

    audio.currentTime = 0;
    const targetVol = this.isDucked ? Math.max(0.06, this.volume * 0.22) : this.volume;
    audio.volume = targetVol;
    this.currentAudio = audio;
    this.currentTrack = track;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Will play upon next interaction if autoplay blocked
      });
    }
  }

  public playPrologue() {
    this.play('prologue');
  }

  public playOverworld() {
    this.play('overworld');
  }

  public playBattle() {
    this.play('battle');
  }

  public playBoss() {
    this.play('boss');
  }

  public playVictory() {
    this.play('victory');
  }

  public stop() {
    this.targetTrack = null;
    this.currentTrack = null;
    this.pauseCurrent();
    if (this.currentAudio) {
      this.currentAudio.currentTime = 0;
    }
  }
}

export const bgm = new MusicManager();

