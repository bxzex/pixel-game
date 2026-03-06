function envelope(gainNode, start, attack, decay, sustain) {
  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.exponentialRampToValueAtTime(0.3, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(sustain, start + attack + decay);
}

function noteToFrequency(note) {
  return 440 * (2 ** ((note - 69) / 12));
}

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicTimer = null;
    this.step = 0;
    this.enabled = false;
  }

  async enable() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.24;
      this.master.connect(this.ctx.destination);
    }

    if (this.ctx.state !== "running") {
      await this.ctx.resume();
    }

    this.enabled = true;
    this.startMusic();
  }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;

    const bassLine = [40, 40, 43, 47, 38, 38, 43, 45];
    const melody = [64, 67, 71, 74, 72, 71, 67, 64, 62, 64, 67, 71, 69, 67, 64, 62];

    const playStep = () => {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playTone(noteToFrequency(bassLine[this.step % bassLine.length]), 0.14, "square", now, 0.13);
      this.playTone(noteToFrequency(melody[this.step % melody.length]), 0.08, "triangle", now + 0.02, 0.1);
      this.step += 1;
    };

    playStep();
    this.musicTimer = setInterval(playStep, 220);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playTone(frequency, duration, type, when = null, sustain = 0.05) {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gainNode);
    gainNode.connect(this.master);

    const start = when ?? this.ctx.currentTime;
    envelope(gainNode, start, 0.008, duration * 0.55, sustain);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.start(start);
    osc.stop(start + duration + 0.01);
  }

  jump() {
    this.playTone(560, 0.13, "square", null, 0.08);
    this.playTone(880, 0.08, "triangle", this.ctx.currentTime + 0.05, 0.02);
  }

  coin() {
    this.playTone(880, 0.08, "square", null, 0.12);
    this.playTone(1174, 0.11, "triangle", this.ctx.currentTime + 0.04, 0.09);
  }

  hit() {
    this.playTone(160, 0.2, "sawtooth", null, 0.04);
  }

  portal() {
    this.playTone(659, 0.14, "square", null, 0.11);
    this.playTone(784, 0.16, "triangle", this.ctx.currentTime + 0.08, 0.1);
    this.playTone(988, 0.18, "triangle", this.ctx.currentTime + 0.16, 0.08);
  }

  win() {
    const now = this.ctx.currentTime;
    this.playTone(523, 0.15, "square", now, 0.1);
    this.playTone(659, 0.15, "square", now + 0.18, 0.1);
    this.playTone(784, 0.18, "triangle", now + 0.35, 0.08);
    this.playTone(1047, 0.25, "triangle", now + 0.55, 0.09);
  }
}
