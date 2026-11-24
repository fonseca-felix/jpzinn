/**
 * Cyber Defense: Proteja sua Smart Home
 * Web Audio API - Sintetizador de Efeitos Sonoros e Ambiência Futurista
 * Desenvolvido para SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class CyberAudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.soundEnabled = true;
        this.ambientEnabled = false;
        this.ambientNodes = [];
        this.volume = 0.5;

        // Inicializa no primeiro clique do usuário para contornar autoplay policy dos navegadores
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
                this.initialized = true;
            }
        } catch (e) {
            console.warn('Web Audio API não suportada ou bloqueada:', e);
        }
    }

    ensureContext() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime, 0.05);
        }
    }

    toggleMute() {
        this.soundEnabled = !this.soundEnabled;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime, 0.05);
        }
        if (!this.soundEnabled && this.ambientEnabled) {
            this.stopAmbient();
        }
        return this.soundEnabled;
    }

    // Clique futurista sutil
    playClick() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.15 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Acorde de sucesso cyber ascendente
    playSuccess() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            const startT = now + idx * 0.08;
            gain.gain.setValueAtTime(0.001, startT);
            gain.gain.exponentialRampToValueAtTime(0.2 * this.volume, startT + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startT);
            osc.stop(startT + 0.4);
        });
    }

    // Som de glitch / erro de intrusão
    playError() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.06);
        osc.frequency.setValueAtTime(90, now + 0.12);

        gain.gain.setValueAtTime(0.25 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        // Filtro para dar textura de alarme distorcido
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(400, now + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Sweep ressonante de ativação de escudo holográfico
    playShield() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.6);
    }

    // Bi-tone de alerta SOC (Security Operations Center)
    playAlarm() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startT = now + i * 0.12;

            osc.type = 'square';
            osc.frequency.setValueAtTime(880, startT);
            osc.frequency.setValueAtTime(740, startT + 0.06);

            gain.gain.setValueAtTime(0.12 * this.volume, startT);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.11);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startT);
            osc.stop(startT + 0.12);
        }
    }

    // Fanfarra triunfal de Nível Concluído
    playLevelComplete() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.25 }, // C6
            { f: 880.00, d: 0.15 }, // A5
            { f: 1046.50, d: 0.5 }   // C6
        ];

        let cursor = now;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, cursor);

            gain.gain.setValueAtTime(0.001, cursor);
            gain.gain.linearRampToValueAtTime(0.25 * this.volume, cursor + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, cursor + item.d + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(cursor);
            osc.stop(cursor + item.d + 0.15);
            cursor += item.d;
        });
    }

    // Ambiência Cyber Drone (synth procedural suave com osciladores senoidais lentos)
    toggleAmbient() {
        if (this.ambientEnabled) {
            this.stopAmbient();
            return false;
        } else {
            this.startAmbient();
            return true;
        }
    }

    startAmbient() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;
        this.stopAmbient();

        const now = this.ctx.currentTime;
        const freqs = [55, 110, 164.81]; // Frequências fundamentais baixas (A1, A2, E3)
        const ambientGain = this.ctx.createGain();
        ambientGain.gain.setValueAtTime(0.001, now);
        ambientGain.gain.linearRampToValueAtTime(0.06 * this.volume, now + 2);
        ambientGain.connect(this.masterGain);

        this.ambientNodes.push(ambientGain);

        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Filtro com LFO para sensação pulsante e viva
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, now);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.2, now); // 0.2 Hz (uma respiração lenta)
            lfoGain.gain.setValueAtTime(80, now);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            osc.connect(filter);
            filter.connect(ambientGain);

            osc.start(now);
            lfo.start(now);

            this.ambientNodes.push(osc, filter, lfo, lfoGain);
        });

        this.ambientEnabled = true;
    }

    stopAmbient() {
        if (this.ambientNodes.length > 0) {
            try {
                this.ambientNodes.forEach(node => {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                });
            } catch (e) {
                // Ignore cleanup errors
            }
            this.ambientNodes = [];
        }
        this.ambientEnabled = false;
    }
}

// Instância global de áudio
window.cyberAudio = new CyberAudioManager();
