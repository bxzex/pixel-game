function envelope(gainNode, start, attack, decay, sustain, peak = 0.26) {
  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.exponentialRampToValueAtTime(peak, start + attack);
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
    this.mood = "calm";
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

  setMood(nextMood) {
    this.mood = nextMood;
  }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;

    const calmBass = [40, 40, 43, 45, 47, 45, 43, 40];
    const dangerBass = [43, 43, 46, 48, 50, 48, 46, 43];
    const calmLead = [64, 67, 69, 71, 72, 71, 69, 67, 64, 67, 71, 72, 74, 72, 71, 69];
    const dangerLead = [69, 72, 74, 76, 74, 72, 69, 67, 69, 71, 72, 74, 76, 74, 72, 71];

    const playStep = () => {
      if (!this.enabled || !this.ctx) return;

      const now = this.ctx.currentTime;
      const danger = this.mood === "danger";
      const triumphant = this.mood === "triumph";

      const bass = danger ? dangerBass : calmBass;
      const lead = danger ? dangerLead : calmLead;
      const bassNote = bass[this.step % bass.length];
      const leadNote = lead[this.step % lead.length] + (triumphant ? 3 : 0);

      this.playTone(noteToFrequency(bassNote), 0.16, "square", now, 0.11, 0.22);
      this.playTone(noteToFrequency(leadNote), 0.12, "triangle", now + 0.03, 0.07, 0.2);
      if ((this.step % 4) === 0) {
        this.playTone(noteToFrequency(52 + (triumphant ? 2 : 0)), 0.1, "sine", now + 0.01, 0.03, 0.12);
      }

      this.step += 1;
    };

    playStep();
    this.musicTimer = setInterval(playStep, 185);
  }

  playTone(frequency, duration, type, when = null, sustain = 0.05, peak = 0.26) {
    if (!this.ctx || !this.enabled) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gainNode);
    gainNode.connect(this.master);

    const start = when ?? this.ctx.currentTime;
    envelope(gainNode, start, 0.006, duration * 0.55, sustain, peak);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.start(start);
    osc.stop(start + duration + 0.01);
  }

  jump() {
    this.playTone(560, 0.12, "square", null, 0.07, 0.2);
    this.playTone(880, 0.08, "triangle", this.ctx.currentTime + 0.04, 0.04, 0.15);
  }

  bounce() {
    this.playTone(500, 0.09, "square", null, 0.08, 0.22);
    this.playTone(740, 0.08, "triangle", this.ctx.currentTime + 0.03, 0.05, 0.16);
  }

  coin() {
    this.playTone(930, 0.08, "square", null, 0.1, 0.2);
    this.playTone(1245, 0.1, "triangle", this.ctx.currentTime + 0.04, 0.08, 0.15);
  }

  relic() {
    const now = this.ctx.currentTime;
    this.playTone(622, 0.1, "triangle", now, 0.08, 0.16);
    this.playTone(831, 0.12, "triangle", now + 0.08, 0.08, 0.16);
    this.playTone(1047, 0.16, "triangle", now + 0.16, 0.08, 0.17);
  }

  key() {
    const now = this.ctx.currentTime;
    this.playTone(784, 0.1, "square", now, 0.1, 0.2);
    this.playTone(988, 0.14, "square", now + 0.08, 0.1, 0.2);
  }

  hit() {
    this.playTone(170, 0.2, "sawtooth", null, 0.03, 0.22);
  }

  portal() {
    const now = this.ctx.currentTime;
    this.playTone(659, 0.14, "square", now, 0.1, 0.18);
    this.playTone(784, 0.16, "triangle", now + 0.08, 0.1, 0.17);
    this.playTone(988, 0.18, "triangle", now + 0.16, 0.09, 0.16);
  }

  win() {
    const now = this.ctx.currentTime;
    this.playTone(523, 0.15, "square", now, 0.1, 0.2);
    this.playTone(659, 0.15, "square", now + 0.18, 0.1, 0.2);
    this.playTone(784, 0.18, "triangle", now + 0.35, 0.08, 0.16);
    this.playTone(1047, 0.26, "triangle", now + 0.55, 0.08, 0.16);
  }
}
