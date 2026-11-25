/**
 * Frogger 3D Odyssey - 五界程序化立體 Web Audio 音樂與音效合成引擎 (SoundEngine3D v2)
 * 特色：
 * 1. 精準 Web Audio Lookahead 排程器（告別 setTimeout 掉拍與破音）
 * 2. 6 首專屬程序化多聲部配樂（標題/花園小溪、古代神廟、幽靈古堡、熔岩地穴、賽博科技塔、終極 Boss 決戰）
 * 3. 3D 空間立體聲相位定位 (Stereo Panning) 與連擊動態升調回饋
 * 4. DynamicsCompressor 防爆音母帶壓縮處理
 */

class SoundEngine3D {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.compressor = null;
        this.noiseBuffer = null;

        this.muted = localStorage.getItem('frogger3d_muted') === '1';
        this.volume = 0.42;

        // BGM 排程狀態
        this.bgmPlaying = false;
        this.currentTheme = 1; // 1..5 或 'BOSS'
        this.stepIndex = 0;
        this.nextNoteTime = 0;
        this.schedulerTimer = null;
        this.lookaheadMs = 25;
        this.scheduleAheadSec = 0.12;

        // 6 大主題音序表 (音符以 MIDI 半音表示，0 為休止符)
        this.THEMES = {
            // 世界 1：花園小溪 (陽光馬林巴木琴 + 輕快彈跳低音)
            1: {
                bpm: 132,
                leadWave: 'triangle',
                bassWave: 'sine',
                leadVol: 0.22,
                bassVol: 0.20,
                lead: [
                    72, 76, 79, 84,  81, 79, 76, 72,  74, 77, 81, 86,  83, 79, 74, 0,
                    72, 76, 79, 84,  88, 86, 84, 79,  81, 84, 83, 79,  76, 79, 72, 0
                ],
                bass: [
                    48, 0, 55, 0,  45, 0, 52, 0,  50, 0, 57, 0,  43, 0, 50, 0,
                    48, 0, 55, 0,  52, 0, 55, 0,  53, 0, 55, 0,  48, 55, 48, 0
                ],
                perc: [1, 0, 2, 0,  1, 0, 2, 1,  1, 0, 2, 0,  1, 2, 1, 2]
            },
            // 世界 2：古代神廟 (神秘五聲音階竹笛 + 部落戰鼓)
            2: {
                bpm: 124,
                leadWave: 'sine',
                bassWave: 'triangle',
                leadVol: 0.24,
                bassVol: 0.24,
                lead: [
                    69, 0, 72, 74,  76, 0, 79, 76,  74, 72, 69, 0,   67, 69, 72, 0,
                    76, 0, 79, 81,  84, 81, 79, 76,  74, 76, 72, 69,  67, 0, 69, 0
                ],
                bass: [
                    45, 45, 0, 45,  45, 0, 52, 0,   43, 43, 0, 43,  40, 0, 43, 0,
                    45, 45, 0, 45,  48, 0, 52, 0,   43, 0, 40, 0,   45, 45, 45, 0
                ],
                perc: [1, 2, 0, 1,  2, 0, 1, 2,  1, 2, 0, 1,  2, 1, 2, 2]
            },
            // 世界 3：幽靈古堡 (哥德詭譎管風琴 + 幽魂顫音)
            3: {
                bpm: 118,
                leadWave: 'sawtooth',
                bassWave: 'triangle',
                leadFilter: 1400,
                leadVol: 0.14,
                bassVol: 0.24,
                lead: [
                    72, 0, 75, 0,   78, 79, 75, 0,   72, 0, 71, 0,   68, 71, 72, 0,
                    75, 0, 79, 0,   83, 84, 79, 78,  75, 74, 72, 71,  72, 0, 0, 0
                ],
                bass: [
                    36, 0, 43, 0,   39, 0, 42, 0,   36, 0, 43, 0,   32, 0, 35, 0,
                    36, 0, 48, 0,   44, 0, 42, 0,   39, 0, 35, 0,   36, 0, 36, 0
                ],
                perc: [1, 0, 0, 2,  0, 0, 1, 0,  1, 0, 0, 2,  0, 2, 1, 0]
            },
            // 世界 4：熔岩地穴 (炙熱重低音工業合成器 + 岩漿琶音)
            4: {
                bpm: 140,
                leadWave: 'square',
                bassWave: 'sawtooth',
                leadFilter: 1800,
                leadVol: 0.13,
                bassVol: 0.22,
                lead: [
                    62, 65, 69, 74,  73, 69, 65, 62,  62, 67, 70, 74,  76, 74, 70, 67,
                    69, 74, 77, 81,  79, 76, 74, 69,  70, 67, 65, 64,  62, 0, 74, 0
                ],
                bass: [
                    38, 38, 50, 38,  38, 38, 49, 38,  38, 38, 46, 38,  45, 45, 43, 41,
                    38, 38, 50, 38,  41, 41, 53, 41,  46, 46, 45, 43,  38, 38, 38, 0
                ],
                perc: [1, 2, 1, 2,  1, 2, 1, 2,  1, 2, 1, 2,  1, 1, 2, 2]
            },
            // 世界 5：賽博科技塔 (霓虹 Synthwave 十六分音符脈衝)
            5: {
                bpm: 146,
                leadWave: 'sawtooth',
                bassWave: 'sawtooth',
                leadFilter: 2400,
                leadVol: 0.15,
                bassVol: 0.22,
                lead: [
                    76, 0, 79, 83,  86, 0, 83, 79,  78, 0, 81, 86,  88, 86, 81, 0,
                    79, 0, 83, 86,  91, 88, 86, 83,  81, 79, 78, 74,  76, 0, 88, 0
                ],
                bass: [
                    40, 52, 40, 52,  40, 52, 40, 52,  38, 50, 38, 50,  38, 50, 38, 50,
                    36, 48, 36, 48,  36, 48, 36, 48,  35, 47, 38, 50,  40, 52, 40, 52
                ],
                perc: [1, 0, 2, 0,  1, 2, 2, 0,  1, 0, 2, 0,  1, 2, 1, 2]
            },
            // 終極頭目戰：機械巨鱷皇 Mecha-Swampy (高速壓迫電音交響)
            BOSS: {
                bpm: 162,
                leadWave: 'sawtooth',
                bassWave: 'square',
                leadFilter: 2800,
                leadVol: 0.17,
                bassVol: 0.24,
                lead: [
                    76, 79, 82, 79,  76, 82, 81, 79,  76, 79, 82, 86,  88, 87, 86, 82,
                    84, 81, 78, 81,  84, 87, 90, 87,  88, 0, 87, 0,    88, 91, 88, 0
                ],
                bass: [
                    40, 40, 46, 40,  45, 40, 43, 40,  40, 40, 46, 40,  48, 47, 45, 43,
                    36, 36, 42, 36,  39, 39, 45, 39,  40, 40, 39, 39,  40, 43, 46, 47
                ],
                perc: [1, 2, 1, 2,  1, 2, 1, 2,  1, 2, 1, 2,  1, 1, 1, 2]
            }
        };
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();

            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);

            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

            this.bgmGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);

            this._buildNoiseBuffer();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    _buildNoiseBuffer() {
        if (!this.ctx) return;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * 1.0;
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    _connectSpatial(node, pan = 0, target = null) {
        const dest = target || this.sfxGain;
        if (!this.ctx || !dest) return;
        if (this.ctx.createStereoPanner && pan !== 0) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, pan)), this.ctx.currentTime);
            node.connect(panner);
            panner.connect(dest);
        } else {
            node.connect(dest);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('frogger3d_muted', this.muted ? '1' : '0');
        if (this.ctx && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.03);
        }
        if (this.muted) {
            this.stopBGM();
        } else {
            this.startBGM(this.currentTheme);
        }
        return this.muted;
    }

    setTheme(themeKey) {
        const next = this.THEMES[themeKey] ? themeKey : 1;
        if (this.currentTheme !== next) {
            this.currentTheme = next;
            this.stepIndex = 0;
        }
        if (!this.bgmPlaying && !this.muted && this.ctx) {
            this.startBGM(this.currentTheme);
        }
    }

    startBGM(themeKey) {
        if (themeKey && this.THEMES[themeKey]) {
            this.currentTheme = themeKey;
        }
        if (this.muted) return;
        this.init();
        if (!this.ctx || this.bgmPlaying) return;

        this.bgmPlaying = true;
        this.stepIndex = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this._scheduler();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.schedulerTimer) {
            clearTimeout(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    _scheduler() {
        if (!this.bgmPlaying || this.muted || !this.ctx) return;

        const theme = this.THEMES[this.currentTheme] || this.THEMES[1];
        const secondsPerBeat = 60.0 / theme.bpm;
        const stepDur = secondsPerBeat * 0.5; // 八分音符步進

        // 防止切頁回來後一次排程過多音符
        if (this.nextNoteTime < this.ctx.currentTime - 0.2) {
            this.nextNoteTime = this.ctx.currentTime + 0.03;
        }

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadSec) {
            this._scheduleThemeStep(theme, this.stepIndex, this.nextNoteTime, stepDur);
            this.nextNoteTime += stepDur;
            this.stepIndex = (this.stepIndex + 1) % theme.lead.length;
        }

        this.schedulerTimer = setTimeout(() => this._scheduler(), this.lookaheadMs);
    }

    _scheduleThemeStep(theme, step, time, dur) {
        if (!this.ctx || !this.bgmGain) return;

        // 1. 主旋律聲部
        const leadMidi = theme.lead[step % theme.lead.length];
        if (leadMidi > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = theme.leadWave || 'triangle';
            osc.frequency.setValueAtTime(this.midiToFreq(leadMidi), time);

            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.linearRampToValueAtTime(theme.leadVol || 0.18, time + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0008, time + dur * 0.92);

            if (theme.leadFilter) {
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(theme.leadFilter, time);
                osc.connect(filter);
                filter.connect(gain);
            } else {
                osc.connect(gain);
            }
            gain.connect(this.bgmGain);
            osc.start(time);
            osc.stop(time + dur * 0.95);
        }

        // 2. 低音貝斯聲部
        const bassMidi = theme.bass[step % theme.bass.length];
        if (bassMidi > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = theme.bassWave || 'triangle';
            osc.frequency.setValueAtTime(this.midiToFreq(bassMidi), time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(420, time);

            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.linearRampToValueAtTime(theme.bassVol || 0.2, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0008, time + dur * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(time);
            osc.stop(time + dur * 0.92);
        }

        // 3. 輕量節奏鼓組 (1 = Kick, 2 = Hi-hat)
        const perc = theme.perc ? theme.perc[step % theme.perc.length] : 0;
        if (perc === 1) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(115, time);
            osc.frequency.exponentialRampToValueAtTime(36, time + 0.09);
            gain.gain.setValueAtTime(0.16, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.095);
            osc.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(time);
            osc.stop(time + 0.1);
        } else if (perc === 2 && this.noiseBuffer) {
            const src = this.ctx.createBufferSource();
            src.buffer = this.noiseBuffer;
            const hp = this.ctx.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.setValueAtTime(6500, time);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.045, time);
            gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.045);
            src.connect(hp);
            hp.connect(gain);
            gain.connect(this.bgmGain);
            src.start(time);
            src.stop(time + 0.05);
        }
    }

    // ==================== 互動立體音效庫 ====================

    // 1. Q 彈跳躍（隨連擊微幅升調）
    playHop(combo = 0, pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const mult = Math.pow(1.035, Math.min(12, combo));
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(250 * mult, now);
            osc.frequency.exponentialRampToValueAtTime(560 * mult, now + 0.085);

            gain.gain.setValueAtTime(0.32, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    // 2. 超級大跳蓄力起飛
    playSuperHop(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(170, now);
            osc1.frequency.exponentialRampToValueAtTime(820, now + 0.22);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(340, now);
            osc2.frequency.exponentialRampToValueAtTime(1240, now + 0.22);

            gain.gain.setValueAtTime(0.38, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc1.connect(gain);
            osc2.connect(gain);
            this._connectSpatial(gain, pan);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.25);
            osc2.stop(now + 0.25);
        } catch (e) {}
    }

    // 3. 大跳落地衝擊波
    playStomp(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);
            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.21);
        } catch (e) {}
    }

    // 4. 吐長舌抓捕
    playTongue(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(680, now);
            osc1.frequency.exponentialRampToValueAtTime(190, now + 0.065);
            gain1.gain.setValueAtTime(0.22, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
            osc1.connect(gain1);
            this._connectSpatial(gain1, pan);
            osc1.start(now);
            osc1.stop(now + 0.08);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(360, now + 0.06);
            osc2.frequency.exponentialRampToValueAtTime(980, now + 0.13);
            gain2.gain.setValueAtTime(0.0001, now);
            gain2.gain.setValueAtTime(0.3, now + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc2.connect(gain2);
            this._connectSpatial(gain2, pan);
            osc2.start(now + 0.06);
            osc2.stop(now + 0.15);
        } catch (e) {}
    }

    // 5. 長舌成功拉中目標 (小青蛙 / 開關 / Boss 核心)
    playGrappleHit(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            [523.25, 783.99, 1174.66].forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now + i * 0.04);
                gain.gain.setValueAtTime(0.32, now + i * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.14);
                osc.connect(gain);
                this._connectSpatial(gain, pan);
                osc.start(now + i * 0.04);
                osc.stop(now + i * 0.04 + 0.15);
            });
        } catch (e) {}
    }

    // 6. 超能蛙鳴聲波
    playCroak(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(135, now);
            osc1.frequency.linearRampToValueAtTime(240, now + 0.11);
            osc1.frequency.linearRampToValueAtTime(155, now + 0.28);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(270, now);
            osc2.frequency.linearRampToValueAtTime(640, now + 0.26);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(520, now);
            filter.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
            filter.Q.setValueAtTime(2.5, now);

            gain.gain.setValueAtTime(0.42, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            this._connectSpatial(gain, pan);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.33);
            osc2.stop(now + 0.33);
        } catch (e) {}
    }

    // 7. 拯救小萌蛙（第 1~5 隻音階越爬越高！）
    playRescue(rescuedCount = 1) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const shift = Math.pow(1.06, Math.max(0, rescuedCount - 1));
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
            notes.forEach((freq, idx) => {
                const t = now + idx * 0.055;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq * shift, t);
                gain.gain.setValueAtTime(0.32, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.17);
            });
        } catch (e) {}
    }

    // 8. 拾取金幣
    playCoin(combo = 0, pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const mult = Math.pow(1.025, Math.min(10, combo));
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77 * mult, now);
            osc.frequency.setValueAtTime(1318.51 * mult, now + 0.055);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.21);
        } catch (e) {}
    }

    // 9. 吃到補血螢火蟲
    playFirefly(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            [659.25, 880, 1174.66, 1567.98].forEach((f, i) => {
                const t = now + i * 0.045;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.26, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                osc.connect(gain);
                this._connectSpatial(gain, pan);
                osc.start(t);
                osc.stop(t + 0.19);
            });
        } catch (e) {}
    }

    // 10. 觸發機關開關
    playSwitch(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.07);
            osc.frequency.setValueAtTime(880, now + 0.14);
            gain.gain.setValueAtTime(0.34, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.29);
        } catch (e) {}
    }

    // 11. 落水噗通（白噪音水花 + 氣泡音）
    playSplash(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(85, now + 0.28);
            gain.gain.setValueAtTime(0.42, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.31);

            if (this.noiseBuffer) {
                const src = this.ctx.createBufferSource();
                src.buffer = this.noiseBuffer;
                const bp = this.ctx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.frequency.setValueAtTime(900, now);
                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.28, now);
                nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
                src.connect(bp);
                bp.connect(nGain);
                this._connectSpatial(nGain, pan);
                src.start(now);
                src.stop(now + 0.28);
            }
        } catch (e) {}
    }

    // 12. 熔岩灼燒滋滋聲
    playLavaBurn(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(190, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);
            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.37);

            if (this.noiseBuffer) {
                const src = this.ctx.createBufferSource();
                src.buffer = this.noiseBuffer;
                const hp = this.ctx.createBiquadFilter();
                hp.type = 'bandpass';
                hp.frequency.setValueAtTime(2200, now);
                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.32, now);
                nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
                src.connect(hp);
                hp.connect(nGain);
                this._connectSpatial(nGain, pan);
                src.start(now);
                src.stop(now + 0.35);
            }
        } catch (e) {}
    }

    // 13. 車禍碰撞聲
    playCrash(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.26);
            gain.gain.setValueAtTime(0.48, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.29);

            if (this.noiseBuffer) {
                const src = this.ctx.createBufferSource();
                src.buffer = this.noiseBuffer;
                const lp = this.ctx.createBiquadFilter();
                lp.type = 'lowpass';
                lp.frequency.setValueAtTime(1200, now);
                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.35, now);
                nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                src.connect(lp);
                lp.connect(nGain);
                this._connectSpatial(nGain, pan);
                src.start(now);
                src.stop(now + 0.22);
            }
        } catch (e) {}
    }

    // 14. 震散幽靈 / 彈反能量球
    playGhostPoof(pan = 0) {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(1480, now + 0.22);
            gain.gain.setValueAtTime(0.32, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.connect(gain);
            this._connectSpatial(gain, pan);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }

    // 15. 地板下沉 / 間歇泉預警滴答
    playWarningTick() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.045);
        } catch (e) {}
    }

    // 16. 機械巨鱷皇登場咆哮
    playBossRoar() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(110, now);
            osc1.frequency.linearRampToValueAtTime(65, now + 0.35);
            osc1.frequency.exponentialRampToValueAtTime(36, now + 0.75);

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(165, now);
            osc2.frequency.exponentialRampToValueAtTime(48, now + 0.75);

            gain.gain.setValueAtTime(0.48, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.sfxGain);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.8);
            osc2.stop(now + 0.8);
        } catch (e) {}
    }

    // 17. 擊中 Boss 核心重創音效
    playBossHit() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(55, now + 0.38);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.42);
        } catch (e) {}
    }

    // 18. 商店購買 / 升級成功
    playPurchase() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            [783.99, 987.77, 1318.51, 1567.98].forEach((f, i) => {
                const t = now + i * 0.05;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.17);
            });
        } catch (e) {}
    }

    // 19. 成就解鎖音效
    playAchievement() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
                const t = now + i * 0.07;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.32, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.26);
            });
        } catch (e) {}
    }

    // 20. 關卡過關勝利號角
    playStageWin() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const melody = [
                { f: 523.25, d: 0.11 },
                { f: 659.25, d: 0.11 },
                { f: 783.99, d: 0.11 },
                { f: 1046.50, d: 0.22 },
                { f: 880.00, d: 0.13 },
                { f: 1046.50, d: 0.13 },
                { f: 1318.51, d: 0.45 }
            ];
            let offset = 0;
            melody.forEach(item => {
                const t = now + offset;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(item.f, t);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + item.d + 0.02);
                offset += item.d + 0.03;
            });
        } catch (e) {}
    }

    // 21. 遊戲挑戰失敗音效
    playGameOver() {
        if (this.muted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const notes = [440, 415.3, 392, 349.23];
            notes.forEach((f, i) => {
                const t = now + i * 0.18;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(0.22, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.24);
            });
        } catch (e) {}
    }
}

window.soundEngine = new SoundEngine3D();
