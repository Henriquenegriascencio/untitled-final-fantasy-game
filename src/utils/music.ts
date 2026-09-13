// Background Music (BGM) Manager for Elemental Fantasy
// Uses user-uploaded audio tracks from /music/ folder

export type MusicTrack = 'prologue' | 'overworld' | 'battle' | 'boss' | 'victory' | null;

const TRACK_PATHS: Record<Exclude<MusicTrack, null>, string[]> = {
  prologue: ['/music/prologue.mp3', '/musics/prologue.mp3'],
  overworld: ['/music/overworld theme.mp3', '/music/overworld.mp3', '/musics/overworld theme.mp3'],
  battle: ['/music/1-07 Battle.mp3', '/music/battle.mp3', '/musics/1-07 Battle.mp3'],
  boss: ['/music/boss battle theme.mp3', '/music/boss.mp3', '/musics/boss battle theme.mp3'],
  victory: ['/music/1-08 Victory Fanfare.mp3', '/music/victory.mp3', '/musics/1-08 Victory Fanfare.mp3']
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

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eldoria_music_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }

      // Unlock browser autoplay policy on first user interaction
      const unlockAudio = () => {
        this.userInteracted = true;
        if (this.currentAudio && this.currentAudio.paused && this.isEnabled && this.currentTrack) {
          this.currentAudio.play().catch(() => {});
        }
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

  public play(track: Exclude<MusicTrack, null>) {
    this.targetTrack = track;
    if (!this.isEnabled) return;

    // If already playing this track and not paused, keep playing
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    if (this.currentTrack === track && this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.volume = this.volume;
      this.currentAudio.play().catch(() => {});
      return;
    }

    // Fade out previous audio
    if (this.currentAudio) {
      const oldAudio = this.currentAudio;
      let fadeVol = oldAudio.volume;
      const step = fadeVol / 6;
      const fader = setInterval(() => {
        fadeVol -= step;
        if (fadeVol <= 0.05) {
          clearInterval(fader);
          oldAudio.pause();
          oldAudio.currentTime = 0;
        } else {
          oldAudio.volume = Math.max(0, fadeVol);
        }
      }, 35);
    }

    // Instantiate new audio
    const paths = TRACK_PATHS[track];
    const audio = new Audio(encodeURI(paths[0]));
    audio.loop = track !== 'victory'; // Victory fanfare plays once
    audio.volume = 0;
    audio.preload = 'auto';

    // Fallback path in case filename encoding issues arise
    let pathIndex = 0;
    audio.onerror = () => {
      pathIndex++;
      if (pathIndex < paths.length) {
        audio.src = encodeURI(paths[pathIndex]);
        audio.play().catch(() => {});
      }
    };

    this.currentAudio = audio;
    this.currentTrack = track;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Fade in
          let inVol = 0;
          const targetVol = this.isDucked ? Math.max(0.06, this.volume * 0.22) : this.volume;
          const stepIn = targetVol / 8;
          const inFader = setInterval(() => {
            inVol += stepIn;
            if (inVol >= targetVol) {
              clearInterval(inFader);
              audio.volume = targetVol;
            } else {
              audio.volume = Math.min(targetVol, inVol);
            }
          }, 40);
        })
        .catch(() => {
          // Playback failed or was blocked by browser autoplay policy
          // Will resume automatically upon first user click/touch
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
