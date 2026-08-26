import * as Haptics from 'expo-haptics';

class AudioHapticsManager {
  private hapticsEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initAudioWebFallback();
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
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

  private initAudioWebFallback() {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.log('Web Audio context init deferred', e);
    }
  }

  private ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Pure procedural dynamic audio synthesizer for zero latency and zero external asset download failures!
  public playTapSlingSFX() {
    if (!this.soundEnabled) return;
    try {
      this.ensureAudioContext();
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      // Audio synth fallback
    }
  }

  public playGatePassSFX() {
    if (!this.soundEnabled) return;
    try {
      this.ensureAudioContext();
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, this.audioCtx.currentTime + 0.05); // E5

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
    if (!this.soundEnabled) return;
    try {
      this.ensureAudioContext();
      if (this.audioCtx) {
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
    if (!this.soundEnabled) return;
    try {
      this.ensureAudioContext();
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.35);
      }
    } catch (e) {}
  }

  // Haptic feedback handlers
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
