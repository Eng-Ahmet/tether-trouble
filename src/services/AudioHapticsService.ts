import * as Haptics from 'expo-haptics';

class AudioHapticsManager {
  private hapticsEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private bgmTimer: any = null;
  private isBgmPlaying: boolean = false;
  private bgmNoteIndex: number = 0;

  // Cyberpunk Arcade Synthwave Arpeggio Frequencies (C Minor Pentatonic)
  private bgmNotes: number[] = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 196.00, 174.61];

  constructor() {
    this.initAudioContext();
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleHaptics(): boolean {
    this.hapticsEnabled = !this.hapticsEnabled;
    return this.hapticsEnabled;
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  private initAudioContext() {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.log('[AudioHaptics] Web Audio init deferred:', e);
    }
  }

  public unlockAudio() {
    if (!this.audioCtx) {
      this.initAudioContext();
    }
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if (!this.isUnlocked) {
        try {
          const buffer = this.audioCtx.createBuffer(1, 1, 22050);
          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.audioCtx.destination);
          source.start(0);
          this.isUnlocked = true;
        } catch (e) {}
      }
    }
  }

  public startBGM() {
    if (!this.soundEnabled || this.isBgmPlaying) return;
    this.unlockAudio();
    this.isBgmPlaying = true;
    this.bgmNoteIndex = 0;

    this.bgmTimer = setInterval(() => {
      if (!this.soundEnabled || !this.isBgmPlaying) return;
      try {
        if (this.audioCtx && this.audioCtx.state === 'running') {
          const freq = this.bgmNotes[this.bgmNoteIndex % this.bgmNotes.length];
          this.bgmNoteIndex++;

          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

          gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.18);
        }
      } catch (e) {}
    }, 220);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Pure procedural SFX synthesizers
  public playTapSlingSFX() {
    this.unlockAudio();
    if (!this.soundEnabled) return;
    try {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, this.audioCtx.currentTime + 0.09);

        gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.09);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.09);
      }
    } catch (e) {}
  }

  public playGatePassSFX() {
    this.unlockAudio();
    if (!this.soundEnabled) return;
    try {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, this.audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
      }
    } catch (e) {}
  }

  public playNearMissSFX() {
    this.unlockAudio();
    if (!this.soundEnabled) return;
    try {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.18);
      }
    } catch (e) {}
  }

  public playFailSFX() {
    this.unlockAudio();
    if (!this.soundEnabled) return;
    try {
      if (this.audioCtx && this.audioCtx.state === 'running') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, this.audioCtx.currentTime + 0.38);

        gain.gain.setValueAtTime(0.65, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.38);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.38);
      }
    } catch (e) {}
  }

  // Haptics
  public triggerLightHaptic() {
    if (!this.hapticsEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  }

  public triggerMediumHaptic() {
    if (!this.hapticsEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  }

  public triggerHeavyHaptic() {
    if (!this.hapticsEnabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
  }

  public triggerNotificationErrorHaptic() {
    if (!this.hapticsEnabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}
  }
}

export const audioHaptics = new AudioHapticsManager();
