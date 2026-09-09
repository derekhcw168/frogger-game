/**
 * Frogger 1981 - 8-Bit Web Audio 合成音效引擎
 * 使用純 Web Audio API 程序化合成所有街機音效與背景音樂，免載入外部聲音檔
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmTimeout = null;
        this.volume = 0.25; // 總體音量
    }

    // 瀏覽器規範：需使用者互動才能啟動 AudioContext
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
        }
        return this.muted;
    }

    // 通用音調生成輔助
    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.15, pitchDrop = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (pitchDrop !== 0) {
                osc.frequency.linearRampToValueAtTime(Math.max(10, freq + pitchDrop), now + duration);
            }

            gain.gain.setValueAtTime(gainVal * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            console.error("音效播放失敗:", e);
        }
    }

    // 1. 青蛙跳躍聲 (Hop)：短促、音調微微上升
    playHop() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(480, now + 0.07);

            gain.gain.setValueAtTime(0.3 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    // 2. 落水聲 (Splash / Plunk)：水花氣泡音
    playPlunk() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            
            // 低頻泡泡調頻
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

            gain.gain.setValueAtTime(0.4 * this.volume, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);

            // 搭配水花噪聲
            this.playNoise(0.2, 0.25);
        } catch (e) {}
    }

    // 白噪聲生成器 (水花或被撞)
    playNoise(duration = 0.15, gainVal = 0.2) {
        if (this.muted || !this.ctx) return;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(this.ctx.currentTime);
            noise.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // 3. 被車壓扁 (Squash / Crash)
    playSquash() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

            gain.gain.setValueAtTime(0.5 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.22);
            this.playNoise(0.25, 0.4);
        } catch (e) {}
    }

    // 4. 青蛙順利進洞 (Home / Bay)
    playHome() {
        if (this.muted || !this.ctx) return;
        const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'square', 0.08, 0.2);
            }, idx * 60);
        });
    }

    // 5. 吃到蒼蠅或拯救母蛙 (Bonus)
    playBonus() {
        if (this.muted || !this.ctx) return;
        const notes = [587, 740, 880, 1175]; // D5, F#5, A5, D6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', 0.09, 0.25);
            }, idx * 50);
        });
    }

    // 6. 時間即將耗盡警告聲 (Tick / Urgent)
    playTick() {
        if (this.muted || !this.ctx) return;
        this.playTone(800, 'square', 0.04, 0.15);
    }

    // 7. 過關勝利旋律 (Level Complete)
    playLevelWin() {
        if (this.muted || !this.ctx) return;
        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.25 },// C6
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.4 }  // C6
        ];
        let delay = 0;
        melody.forEach(item => {
            setTimeout(() => {
                this.playTone(item.f, 'square', item.d, 0.2);
            }, delay);
            delay += item.d * 1000 + 40;
        });
    }

    // 8. 遊戲結束悲傷曲 (Game Over)
    playGameOver() {
        if (this.muted || !this.ctx) return;
        const melody = [
            { f: 493.88, d: 0.18 }, // B4
            { f: 466.16, d: 0.18 }, // Bb4
            { f: 440.00, d: 0.18 }, // A4
            { f: 415.30, d: 0.35 }  // Ab4
        ];
        let delay = 0;
        melody.forEach(item => {
            setTimeout(() => {
                this.playTone(item.f, 'sawtooth', item.d, 0.25);
            }, delay);
            delay += item.d * 1000 + 50;
        });
    }

    // 9. 背景音樂循環播放 (經典 1981 街機輕快主題 8-bit BGM)
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
        
        // 經典街機 Frogger 輕快主題短旋律
        const notes = [
            { f: 659.25, d: 0.14 }, // E5
            { f: 659.25, d: 0.14 }, // E5
            { f: 587.33, d: 0.14 }, // D5
            { f: 523.25, d: 0.14 }, // C5
            { f: 587.33, d: 0.14 }, // D5
            { f: 659.25, d: 0.25 }, // E5
            { f: 523.25, d: 0.25 }, // C5
            { f: 440.00, d: 0.28 }, // A4

            { f: 587.33, d: 0.14 }, // D5
            { f: 587.33, d: 0.14 }, // D5
            { f: 523.25, d: 0.14 }, // C5
            { f: 493.88, d: 0.14 }, // B4
            { f: 523.25, d: 0.14 }, // C5
            { f: 587.33, d: 0.25 }, // D5
            { f: 659.25, d: 0.25 }, // E5
            { f: 523.25, d: 0.35 }  // C5
        ];

        let totalTime = 0;
        notes.forEach(n => {
            setTimeout(() => {
                if (this.bgmPlaying && !this.muted) {
                    this.playTone(n.f, 'square', n.d * 0.9, 0.08);
                }
            }, totalTime);
            totalTime += n.d * 1000 + 40;
        });

        // 循環排程
        this.bgmTimeout = setTimeout(() => {
            if (this.bgmPlaying) {
                this._loopBGM();
            }
        }, totalTime + 600);
    }
}

// 導出全域音效單例
window.soundEngine = new SoundEngine();
