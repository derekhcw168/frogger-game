/**
 * Frogger 3D Odyssey - 現代高品質 3D Web Audio 音效與音樂引擎
 * 支援立體聲、跳躍、超級大跳、吐舌抓捕、蛙鳴探測、拯救小青蛙、金幣與現代冒險背景配樂
 */

class SoundEngine3D {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmTimeout = null;
        this.volume = 0.35;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.bgmPlaying) {
            this.stopBGM();
        } else if (!this.muted && !this.bgmPlaying) {
            this.startBGM();
        }
        return this.muted;
    }

    // 1. 基礎跳躍聲 (Q 彈清脆)
    playHop() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

            gain.gain.setValueAtTime(0.35 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    // 2. 超級大跳 Super Hop (深沉蓄力後高亢彈射)
    playSuperHop() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(750, now + 0.2);

            gain.gain.setValueAtTime(0.5 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }

    // 3. 吐長舌抓捕 Tongue Grab (「咻-啵！」聲)
    playTongue() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            // 伸舌音
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(600, now);
            osc1.frequency.exponentialRampToValueAtTime(180, now + 0.07);
            gain1.gain.setValueAtTime(0.25 * this.volume, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.08);

            // 縮回吸附「啵」聲
            setTimeout(() => {
                if (!this.ctx || this.muted) return;
                const t = this.ctx.currentTime;
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(350, t);
                osc2.frequency.exponentialRampToValueAtTime(950, t + 0.06);
                gain2.gain.setValueAtTime(0.35 * this.volume, t);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.start(t);
                osc2.stop(t + 0.07);
            }, 60);
        } catch (e) {}
    }

    // 4. 超能蛙鳴 Power Croak (宏亮震動聲波)
    playCroak() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(220, now + 0.12);
            osc.frequency.linearRampToValueAtTime(120, now + 0.25);

            gain.gain.setValueAtTime(0.4 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
        } catch (e) {}
    }

    // 5. 拯救到小青蛙 (Rescue Baby Frog! 歡樂稚嫩蛙鳴與光芒音)
    playRescue() {
        if (this.muted || !this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.3 * this.volume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            }, idx * 55);
        });
    }

    // 6. 吃金幣聲 (Coin Pickup - 雙音水晶清脆叮噹)
    playCoin() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(987.77, now); // B5
            osc1.frequency.setValueAtTime(1318.51, now + 0.06); // E6

            gain.gain.setValueAtTime(0.3 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc1.connect(gain);
            gain.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.18);
        } catch (e) {}
    }

    // 7. 落水噗通聲
    playSplash() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

            gain.gain.setValueAtTime(0.4 * this.volume, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }

    // 8. 掉入熔岩滋滋聲
    playLavaBurn() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

            gain.gain.setValueAtTime(0.45 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        } catch (e) {}
    }

    // 9. 被撞壓扁聲
    playCrash() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

            gain.gain.setValueAtTime(0.5 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }

    // 10. 關卡大通關狂歡音樂 (Stage Clear Fanfare)
    playStageWin() {
        if (this.muted || !this.ctx) return;
        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.22 },// C6
            { f: 880.00, d: 0.14 }, // A5
            { f: 1046.50, d: 0.14 },// C6
            { f: 1174.66, d: 0.4 }  // D6
        ];
        let delay = 0;
        melody.forEach(item => {
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(item.f, now);
                gain.gain.setValueAtTime(0.3 * this.volume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + item.d);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + item.d);
            }, delay);
            delay += item.d * 1000 + 40;
        });
    }

    // 11. 現代冒險主題背景音樂 (Frogger 2 風格輕快探險旋律)
    startBGM() {
        if (this.bgmPlaying || this.muted || !this.ctx) return;
        this.bgmPlaying = true;
        this._loopBGM();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimeout) {
            clearTimeout(this.bgmTimeout);
            this.bgmTimeout = null;
        }
    }

    _loopBGM() {
        if (!this.bgmPlaying || this.muted) return;

        // 輕快明亮富有節奏感的 3D 冒險旋律
        const notes = [
            { f: 392.00, d: 0.15 }, // G4
            { f: 440.00, d: 0.15 }, // A4
            { f: 523.25, d: 0.22 }, // C5
            { f: 587.33, d: 0.15 }, // D5
            { f: 659.25, d: 0.3 },  // E5
            { f: 523.25, d: 0.2 },  // C5
            { f: 440.00, d: 0.25 }, // A4
            { f: 392.00, d: 0.35 }, // G4

            { f: 523.25, d: 0.15 }, // C5
            { f: 587.33, d: 0.15 }, // D5
            { f: 659.25, d: 0.22 }, // E5
            { f: 783.99, d: 0.3 },  // G5
            { f: 659.25, d: 0.2 },  // E5
            { f: 587.33, d: 0.2 },  // D5
            { f: 523.25, d: 0.4 }   // C5
        ];

        let totalTime = 0;
        notes.forEach(n => {
            setTimeout(() => {
                if (this.bgmPlaying && !this.muted && this.ctx) {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(n.f, now);
                    gain.gain.setValueAtTime(0.08 * this.volume, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.d);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + n.d);
                }
            }, totalTime);
            totalTime += n.d * 1000 + 40;
        });

        this.bgmTimeout = setTimeout(() => {
            if (this.bgmPlaying) {
                this._loopBGM();
            }
        }, totalTime + 500);
    }
}

window.soundEngine = new SoundEngine3D();
