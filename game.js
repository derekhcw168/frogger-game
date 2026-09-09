/**
 * Frogger 1981 - 街機主遊戲引擎 (Game Engine)
 * 嚴格還原 1981 年 Konami 經典街機物理、時序、碰撞與得分系統
 */

// 街機遊戲難度配置表
const DIFFICULTIES = {
    EASY: {
        key: 'EASY',
        name: '簡單',
        color: '#00ff66',
        speedMult: 0.75,    // 車速減緩 25%
        maxTime: 45,        // 充裕的 45 秒
        initialLives: 5,    // 5 條命
        canDive: false,     // 烏龜不下潛
        crocChance: 0.0,    // 不出現鱷魚
        scoreMult: 1.0,
        desc: '車速慢 / 烏龜不下潛 / 45秒 / 5條命'
    },
    NORMAL: {
        key: 'NORMAL',
        name: '普通',
        color: '#00e5ff',
        speedMult: 1.0,     // 原版 1981 街機標準
        maxTime: 30,        // 標準 30 秒
        initialLives: 3,    // 3 條命
        canDive: true,      // 烏龜下潛
        crocChance: 0.25,   // 正常機率出現鱷魚
        scoreMult: 1.0,
        desc: '原版街機標準 / 烏龜下潛 / 30秒 / 3條命'
    },
    HARD: {
        key: 'HARD',
        name: '困難',
        color: '#ffbb00',
        speedMult: 1.35,    // 車速加快 35%
        maxTime: 22,        // 22 秒緊迫倒數
        initialLives: 3,    // 3 條命
        canDive: true,      // 烏龜下潛更頻繁
        crocChance: 0.45,   // 鱷魚出現更頻繁
        scoreMult: 1.5,     // 分數 1.5 倍加成！
        desc: '快速車流 / 22秒倒數 / 分數1.5x'
    },
    EXPERT: {
        key: 'EXPERT',
        name: '地獄',
        color: '#ff2a6d',
        speedMult: 1.7,     // 極速狂飆 70%
        maxTime: 16,        // 16 秒生死時速
        initialLives: 2,    // 僅 2 條命
        canDive: true,      // 幾乎全下潛
        crocChance: 0.7,    // 大量鱷魚
        scoreMult: 2.0,     // 分數雙倍 2.0x！
        desc: '極速暴衝 / 16秒倒數 / 2條命 / 分數2x'
    }
};

class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 街機原生解析度
        this.WIDTH = 224;
        this.HEIGHT = 256;
        this.GRID = 16;

        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        // 難度設定 (讀取本機快取，預設 NORMAL)
        this.currentDifficultyKey = localStorage.getItem('frogger_difficulty') || 'NORMAL';
        if (!DIFFICULTIES[this.currentDifficultyKey]) {
            this.currentDifficultyKey = 'NORMAL';
        }

        // 遊戲狀態: 'TITLE', 'PLAYING', 'DYING', 'LEVEL_CLEAR', 'GAME_OVER', 'PAUSED'
        this.state = 'TITLE';

        // 分數與生命
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('frogger_highscore')) || 10000;
        this.lives = this.difficulty.initialLives;
        this.level = 1;

        // 計時器 (依照難度設定)
        this.maxTime = this.difficulty.maxTime;
        this.timeLeft = this.maxTime;
        this.lastTimeTick = 0;

        // 5 個目標洞穴 (Home Bays)
        // 經典街機 x 座標: 12, 56, 104, 152, 200
        this.homeBays = [
            { x: 12, filled: false, hasFly: false, flyTimer: 0, hasCroc: false },
            { x: 56, filled: false, hasFly: false, flyTimer: 0, hasCroc: false },
            { x: 104, filled: false, hasFly: false, flyTimer: 0, hasCroc: false },
            { x: 152, filled: false, hasFly: false, flyTimer: 0, hasCroc: false },
            { x: 200, filled: false, hasFly: false, flyTimer: 0, hasCroc: false }
        ];

        // 青蛙角色
        this.frog = {
            x: 104,
            y: 224,
            startX: 104,
            startY: 224,
            dir: 'UP',
            jumping: false,
            jumpProgress: 0,
            fromX: 104,
            fromY: 224,
            targetX: 104,
            targetY: 224,
            highestY: 224,
            hasLady: false
        };

        // 死亡動畫狀態
        this.death = {
            active: false,
            type: 'SQUASH', // 'SQUASH' 或 'WATER'
            x: 0,
            y: 0,
            timer: 0,
            frame: 0
        };

        // 動態物件 (車輛與浮木/烏龜)
        this.vehicles = [];
        this.waterObjects = [];
        this.riverFlowOffset = 0;
        this.animTick = 0;

        this.initLanes();
        this.bindEvents();
        this.lastTimestamp = performance.now();

        // 啟動主循環
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // 取得當前難度配置
    get difficulty() {
        return DIFFICULTIES[this.currentDifficultyKey] || DIFFICULTIES.NORMAL;
    }

    // 循環切換難度 (簡單 ➔ 普通 ➔ 困難 ➔ 地獄)
    cycleDifficulty() {
        const keys = Object.keys(DIFFICULTIES);
        const currentIndex = keys.indexOf(this.currentDifficultyKey);
        const nextIndex = (currentIndex + 1) % keys.length;
        this.currentDifficultyKey = keys[nextIndex];
        localStorage.setItem('frogger_difficulty', this.currentDifficultyKey);

        window.soundEngine.init();
        window.soundEngine.playBonus();

        // 重新設定計時與生命
        this.maxTime = this.difficulty.maxTime;
        if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
            this.lives = this.difficulty.initialLives;
            this.timeLeft = this.maxTime;
            this.initLanes();
        } else if (this.state === 'PLAYING') {
            // 遊玩中切換：直接套用新局重啟
            this.startGame();
        }
        this.updateUI();
    }

    // 初始化車道與河道 (融合關卡與難度係數)
    initLanes() {
        this.vehicles = [];
        this.waterObjects = [];

        // 基礎難度倍率 × 關卡成長倍率
        const speedMult = this.difficulty.speedMult * (1 + (this.level - 1) * 0.18);

        // --- 1. 馬路車道 (Row 9 ~ 13, y: 144 ~ 208) ---
        // Row 13 (y: 208): 黃色小轎車 (向左, 速度約 1.1)
        this.createVehicleLane(208, -1.1 * speedMult, 16, 'YELLOW_CAB', [40, 110, 180]);
        // Row 12 (y: 192): 慢速拖拉機 (向右, 速度約 0.8)
        this.createVehicleLane(192, 0.8 * speedMult, 16, 'TRACTOR', [20, 100, 180]);
        // Row 11 (y: 176): 粉紫小汽車 (向左, 速度約 1.3)
        this.createVehicleLane(176, -1.3 * speedMult, 16, 'PINK_CAR', [30, 110, 190]);
        // Row 10 (y: 160): 紅白高速賽車 (向右, 速度約 2.4)
        this.createVehicleLane(160, 2.4 * speedMult, 16, 'RACE_CAR', [70, 190]);
        // Row 9  (y: 144): 重型大卡車 (向左, 速度約 0.9, 寬度 32)
        this.createVehicleLane(144, -0.9 * speedMult, 32, 'TRUCK', [10, 110]);

        // --- 2. 河流車道 (Row 3 ~ 7, y: 48 ~ 112) ---
        // Row 7 (y: 112): 3連烏龜 (向左, 速度約 1.0)
        this.createTurtleLane(112, -1.0 * speedMult, 3, [10, 80, 150]);
        // Row 6 (y: 96): 小型浮木 (向右, 速度約 1.2, 寬度 48)
        this.createLogLane(96, 1.2 * speedMult, 48, [20, 100, 180]);
        // Row 5 (y: 80): 特大浮木 (向右, 速度約 1.6, 寬度 96)
        this.createLogLane(80, 1.6 * speedMult, 96, [10, 130]);
        // Row 4 (y: 64): 2連烏龜 (向左, 速度約 1.3)
        this.createTurtleLane(64, -1.3 * speedMult, 2, [30, 90, 160]);
        // Row 3 (y: 48): 中型浮木或鱷魚 (向右, 速度約 1.1, 寬度 64)
        this.createLogLane(48, 1.1 * speedMult, 64, [10, 90, 170]);
    }

    createVehicleLane(y, speed, width, type, startPositions) {
        startPositions.forEach(x => {
            this.vehicles.push({ x, y, speed, width, type });
        });
    }

    createLogLane(y, speed, width, startPositions) {
        startPositions.forEach(x => {
            // 隨機機會將浮木替換為鱷魚 (依難度機率)
            const isCroc = (this.level >= 2 && Math.random() < this.difficulty.crocChance);
            this.waterObjects.push({
                x, y, speed, width,
                type: isCroc ? 'CROC' : 'LOG',
                mouthOpen: false,
                mouthTimer: 0,
                hasLady: (!isCroc && Math.random() < 0.15)
            });
        });
    }

    createTurtleLane(y, speed, count, startPositions) {
        startPositions.forEach((x, idx) => {
            // 烏龜下潛能力 (依難度決定是否啟用)
            const canDive = this.difficulty.canDive && (idx % 2 === 1 || this.level >= 2);
            this.waterObjects.push({
                x, y, speed,
                width: count * 16,
                type: 'TURTLE',
                count,
                canDive,
                diveState: 0, // 0: 浮出, 1: 預警, 2: 半潛, 3: 沉底
                diveTimer: Math.random() * 180 + 80
            });
        });
    }

    // 重置青蛙至起點
    resetFrog() {
        this.frog.x = this.frog.startX;
        this.frog.y = this.frog.startY;
        this.frog.fromX = this.frog.x;
        this.frog.fromY = this.frog.y;
        this.frog.targetX = this.frog.x;
        this.frog.targetY = this.frog.y;
        this.frog.dir = 'UP';
        this.frog.jumping = false;
        this.frog.jumpProgress = 0;
        this.frog.highestY = this.frog.startY;
        this.frog.hasLady = false;
        this.timeLeft = this.maxTime;
    }

    // 觸發死亡
    triggerDeath(type = 'SQUASH') {
        if (this.state !== 'PLAYING') return;

        this.state = 'DYING';
        this.death.active = true;
        this.death.type = type;
        this.death.x = this.frog.x;
        this.death.y = this.frog.y;
        this.death.timer = 60; // 動畫幀數
        this.death.frame = 0;

        if (type === 'WATER') {
            window.soundEngine.playPlunk();
        } else {
            window.soundEngine.playSquash();
        }

        this.lives--;
        this.updateUI();

        if (this.lives < 0) {
            setTimeout(() => {
                this.state = 'GAME_OVER';
                window.soundEngine.playGameOver();
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('frogger_highscore', this.highScore);
                }
                this.updateUI();
            }, 1000);
        }
    }

    // 青蛙跳躍輸入
    moveFrog(dir) {
        if (this.state === 'TITLE') {
            this.startGame();
            return;
        }
        if (this.state === 'GAME_OVER') {
            this.restartGame();
            return;
        }
        if (this.state !== 'PLAYING' || this.frog.jumping) return;

        let dx = 0;
        let dy = 0;
        if (dir === 'UP') dy = -this.GRID;
        else if (dir === 'DOWN') dy = this.GRID;
        else if (dir === 'LEFT') dx = -this.GRID;
        else if (dir === 'RIGHT') dx = this.GRID;

        const nx = this.frog.x + dx;
        const ny = this.frog.y + dy;

        // 邊界防禦
        if (nx < 0 || nx > this.WIDTH - this.GRID) return;
        if (ny > 224) return; // 不能跳出最底端
        if (ny < 16) return;  // 不能跳出最頂端

        this.frog.dir = dir;
        this.frog.fromX = this.frog.x;
        this.frog.fromY = this.frog.y;
        this.frog.targetX = nx;
        this.frog.targetY = ny;
        this.frog.jumping = true;
        this.frog.jumpProgress = 0;

        window.soundEngine.playHop();

        // 向上推進得分 (+10 分)
        if (ny < this.frog.highestY) {
            this.frog.highestY = ny;
            this.addScore(10);
        }
    }

    addScore(pts) {
        // 依難度倍率計算分數加成
        const actualPts = Math.round(pts * this.difficulty.scoreMult);
        const oldScore = this.score;
        this.score += actualPts;
        // 每達 10,000 分獎勵一條命
        if (Math.floor(this.score / 10000) > Math.floor(oldScore / 10000)) {
            this.lives++;
            window.soundEngine.playBonus();
        }
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.updateUI();
    }

    startGame() {
        window.soundEngine.init();
        window.soundEngine.startBGM();
        this.state = 'PLAYING';
        this.score = 0;
        this.lives = this.difficulty.initialLives;
        this.maxTime = this.difficulty.maxTime;
        this.timeLeft = this.maxTime;
        this.level = 1;
        this.homeBays.forEach(b => {
            b.filled = false;
            b.hasFly = false;
        });
        this.initLanes();
        this.resetFrog();
        this.updateUI();
    }

    restartGame() {
        this.startGame();
    }

    // 鍵盤與觸控事件監聽
    bindEvents() {
        window.addEventListener('keydown', (e) => {
            window.soundEngine.init();
            if (['ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                this.moveFrog('UP');
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                this.moveFrog('DOWN');
            } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
                e.preventDefault();
                this.moveFrog('LEFT');
            } else if (['ArrowRight'].includes(e.code)) {
                e.preventDefault();
                this.moveFrog('RIGHT');
            } else if (e.code === 'KeyD') {
                // 若在標題畫面，D 鍵可切換難度；遊戲中則作為向右移動
                if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
                    e.preventDefault();
                    this.cycleDifficulty();
                } else {
                    e.preventDefault();
                    this.moveFrog('RIGHT');
                }
            } else if (e.code === 'Space') {
                e.preventDefault();
                if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
                    this.startGame();
                } else if (this.state === 'PLAYING') {
                    this.state = 'PAUSED';
                } else if (this.state === 'PAUSED') {
                    this.state = 'PLAYING';
                }
            } else if (e.code === 'KeyM') {
                // 靜音切換
                const isMuted = window.soundEngine.toggleMute();
                const muteBtn = document.getElementById('muteBtn');
                if (muteBtn) {
                    muteBtn.textContent = isMuted ? '🔇 靜音' : '🔊 音效';
                }
            }
        });

        // 手勢滑動 (Swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            window.soundEngine.init();
            const t = e.changedTouches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) > 20) {
                if (absX > absY) {
                    this.moveFrog(dx > 0 ? 'RIGHT' : 'LEFT');
                } else {
                    this.moveFrog(dy > 0 ? 'DOWN' : 'UP');
                }
            } else {
                // 輕點畫面 (向上跳或開始)
                this.moveFrog('UP');
            }
        }, { passive: true });

        // 虛擬 D-pad 控制按鈕
        const setupBtn = (id, dir) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    window.soundEngine.init();
                    this.moveFrog(dir);
                });
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    window.soundEngine.init();
                    this.moveFrog(dir);
                });
            }
        };

        setupBtn('btnUp', 'UP');
        setupBtn('btnDown', 'DOWN');
        setupBtn('btnLeft', 'LEFT');
        setupBtn('btnRight', 'RIGHT');

        // 難度切換按鈕
        const diffBtn = document.getElementById('diffBtn');
        if (diffBtn) {
            diffBtn.addEventListener('click', () => {
                this.cycleDifficulty();
            });
        }

        // 音效開關按鈕
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                window.soundEngine.init();
                const isMuted = window.soundEngine.toggleMute();
                muteBtn.textContent = isMuted ? '🔇 靜音' : '🔊 音效';
            });
        }

        // 開始 / 重新開始按鈕
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                window.soundEngine.init();
                this.startGame();
            });
        }
    }

    // 更新遊戲狀態
    update(dt) {
        this.animTick++;
        this.riverFlowOffset += dt * 0.05;

        // 1. 更新車輛位置
        this.vehicles.forEach(v => {
            v.x += v.speed * (dt / 16.6);
            if (v.speed > 0 && v.x > this.WIDTH) {
                v.x = -v.width;
            } else if (v.speed < 0 && v.x + v.width < 0) {
                v.x = this.WIDTH;
            }
        });

        // 2. 更新河流物件 (浮木、烏龜、鱷魚)
        this.waterObjects.forEach(obj => {
            obj.x += obj.speed * (dt / 16.6);
            if (obj.speed > 0 && obj.x > this.WIDTH) {
                obj.x = -obj.width;
            } else if (obj.speed < 0 && obj.x + obj.width < 0) {
                obj.x = this.WIDTH;
            }

            // 烏龜下潛邏輯
            if (obj.type === 'TURTLE' && obj.canDive) {
                obj.diveTimer--;
                if (obj.diveTimer <= 0) {
                    obj.diveState = (obj.diveState + 1) % 4;
                    // 各階段停留時間
                    if (obj.diveState === 0) obj.diveTimer = 180; // 水面正常
                    else if (obj.diveState === 1) obj.diveTimer = 50; // 變暗預警
                    else if (obj.diveState === 2) obj.diveTimer = 35; // 半潛水
                    else if (obj.diveState === 3) obj.diveTimer = 75; // 完全潛水
                }
            }

            // 鱷魚張嘴邏輯
            if (obj.type === 'CROC') {
                obj.mouthTimer = (obj.mouthTimer || 0) + 1;
                if (obj.mouthTimer > 120) {
                    obj.mouthOpen = !obj.mouthOpen;
                    obj.mouthTimer = 0;
                }
            }
        });

        // 3. 隨機產生蒼蠅獎勵
        if (Math.random() < 0.003) {
            const emptyBays = this.homeBays.filter(b => !b.filled && !b.hasFly);
            if (emptyBays.length > 0) {
                const bay = emptyBays[Math.floor(Math.random() * emptyBays.length)];
                bay.hasFly = true;
                bay.flyTimer = 300; // 持續約 5 秒
            }
        }
        this.homeBays.forEach(bay => {
            if (bay.hasFly) {
                bay.flyTimer--;
                if (bay.flyTimer <= 0) bay.hasFly = false;
            }
        });

        if (this.state === 'DYING') {
            this.death.timer--;
            this.death.frame = Math.floor((60 - this.death.timer) / 15);
            if (this.death.timer <= 0) {
                this.death.active = false;
                if (this.lives >= 0) {
                    this.resetFrog();
                    this.state = 'PLAYING';
                }
            }
            return;
        }

        if (this.state !== 'PLAYING') return;

        // 4. 倒數計時器
        this.timeLeft -= dt / 1000;
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
            if (performance.now() - this.lastTimeTick > 600) {
                window.soundEngine.playTick();
                this.lastTimeTick = performance.now();
            }
        }
        if (this.timeLeft <= 0) {
            this.triggerDeath('SQUASH');
            return;
        }

        // 5. 青蛙跳躍平滑插值動畫 (約 4 幀完成)
        if (this.frog.jumping) {
            this.frog.jumpProgress += 0.28;
            if (this.frog.jumpProgress >= 1) {
                this.frog.jumping = false;
                this.frog.x = this.frog.targetX;
                this.frog.y = this.frog.targetY;
                this.onFrogLand();
            } else {
                this.frog.x = this.frog.fromX + (this.frog.targetX - this.frog.fromX) * this.frog.jumpProgress;
                this.frog.y = this.frog.fromY + (this.frog.targetY - this.frog.fromY) * this.frog.jumpProgress;
            }
        }

        // 6. 河流漂浮物理 (站在浮木/烏龜上時跟隨移動)
        if (!this.frog.jumping && this.frog.y >= 48 && this.frog.y <= 112) {
            const currentObj = this.getWaterObjectAt(this.frog.x, this.frog.y);
            if (currentObj) {
                this.frog.x += currentObj.speed * (dt / 16.6);
                // 漂出螢幕邊界死亡
                if (this.frog.x < -4 || this.frog.x > this.WIDTH - 12) {
                    this.triggerDeath('WATER');
                    return;
                }
            } else {
                // 踩在水面上 (溺水)
                this.triggerDeath('WATER');
                return;
            }
        }

        // 7. 馬路車輛碰撞檢測
        if (this.frog.y >= 144 && this.frog.y <= 208) {
            const hit = this.vehicles.some(v => {
                if (Math.abs(v.y - this.frog.y) < 8) {
                    // 車輛水平碰撞箱 (微縮以增加操作寬容度)
                    const frogBox = { l: this.frog.x + 3, r: this.frog.x + 13 };
                    const carBox = { l: v.x + 2, r: v.x + v.width - 2 };
                    return (frogBox.l < carBox.r && frogBox.r > carBox.l);
                }
                return false;
            });

            if (hit) {
                this.triggerDeath('SQUASH');
            }
        }
    }

    // 青蛙著地後的判定 (進洞、水流、吃蟲、背母蛙)
    onFrogLand() {
        // A. 跳到目標洞穴區 (y <= 32)
        if (this.frog.y <= 32) {
            let inBay = null;
            this.homeBays.forEach(bay => {
                if (Math.abs(this.frog.x - bay.x) <= 8) {
                    inBay = bay;
                }
            });

            if (inBay && !inBay.filled) {
                // 成功進洞！
                inBay.filled = true;
                let bonus = 50; // 進洞基礎 50 分
                window.soundEngine.playHome();

                // 剩餘時間換算分數 (每秒 10 分)
                bonus += Math.floor(this.timeLeft) * 10;

                // 吃了蒼蠅
                if (inBay.hasFly) {
                    bonus += 200;
                    inBay.hasFly = false;
                    window.soundEngine.playBonus();
                }

                // 背了母蛙
                if (this.frog.hasLady) {
                    bonus += 200;
                    this.frog.hasLady = false;
                    window.soundEngine.playBonus();
                }

                this.addScore(bonus);

                // 檢查是否 5 個洞全滿 (通關)
                const allFilled = this.homeBays.every(b => b.filled);
                if (allFilled) {
                    this.state = 'LEVEL_CLEAR';
                    window.soundEngine.playLevelWin();
                    this.addScore(1000); // 通關獎勵 1000 分
                    setTimeout(() => {
                        this.level++;
                        this.homeBays.forEach(b => {
                            b.filled = false;
                            b.hasFly = false;
                        });
                        this.initLanes();
                        this.resetFrog();
                        this.state = 'PLAYING';
                    }, 2500);
                } else {
                    this.resetFrog();
                }
            } else {
                // 跳到灌木叢、或跳進已有青蛙的洞 (撞死)
                this.triggerDeath('SQUASH');
            }
            return;
        }

        // B. 著地在河流車道 (檢查是否安全站在浮木/烏龜上)
        if (this.frog.y >= 48 && this.frog.y <= 112) {
            const obj = this.getWaterObjectAt(this.frog.x, this.frog.y);
            if (!obj) {
                this.triggerDeath('WATER');
            } else {
                // 檢查鱷魚嘴巴
                if (obj.type === 'CROC' && obj.mouthOpen) {
                    const mouthX = obj.x + obj.width - 16;
                    if (this.frog.x >= mouthX - 4) {
                        this.triggerDeath('SQUASH'); // 被鱷魚吞食
                        return;
                    }
                }
                // 檢查母青蛙
                if (obj.hasLady) {
                    this.frog.hasLady = true;
                    obj.hasLady = false;
                    window.soundEngine.playBonus();
                }
            }
        }
    }

    // 取得當前青蛙踩踏的浮木或烏龜
    getWaterObjectAt(x, y) {
        for (let obj of this.waterObjects) {
            if (Math.abs(obj.y - y) < 8) {
                // 檢查是否完全沉入水中 (無法站立)
                if (obj.type === 'TURTLE' && obj.diveState === 3) {
                    continue;
                }
                // 物件水平覆蓋
                if (x + 4 >= obj.x && x + 12 <= obj.x + obj.width + 4) {
                    return obj;
                }
            }
        }
        return null;
    }

    // 繪製畫面
    render() {
        const ctx = this.ctx;

        // 1. 繪製背景 (河道、馬路、安全島、草叢)
        Sprites.drawBackground(ctx, this.WIDTH, this.HEIGHT, this.riverFlowOffset);

        // 2. 繪製 5 個青蛙洞穴 (Home Bays)
        this.homeBays.forEach(bay => {
            // 洞穴深色入口
            ctx.fillStyle = '#000033';
            ctx.fillRect(bay.x, 16, 16, 16);

            if (bay.filled) {
                Sprites.drawHomeFrog(ctx, bay.x, 16);
            } else if (bay.hasFly) {
                Sprites.drawFly(ctx, bay.x, 16);
            }
        });

        // 3. 繪製河流物件 (浮木、烏龜、鱷魚)
        this.waterObjects.forEach(obj => {
            if (obj.type === 'LOG') {
                Sprites.drawLog(ctx, obj.x, obj.y, obj.width);
                if (obj.hasLady) {
                    // 繪製木頭上的粉紅母蛙
                    ctx.fillStyle = Sprites.COLORS.LADY_FROG;
                    ctx.fillRect(obj.x + Math.floor(obj.width / 2) - 4, obj.y + 4, 8, 8);
                }
            } else if (obj.type === 'TURTLE') {
                Sprites.drawTurtleGroup(ctx, obj.x, obj.y, obj.count, obj.diveState, Math.floor(this.animTick / 15));
            } else if (obj.type === 'CROC') {
                Sprites.drawCrocodile(ctx, obj.x, obj.y, obj.width, obj.mouthOpen);
            }
        });

        // 4. 繪製馬路車輛
        this.vehicles.forEach(v => {
            Sprites.drawVehicle(ctx, v.x, v.y, v.type, v.width);
        });

        // 5. 繪製青蛙 (或死亡動畫)
        if (this.death.active) {
            Sprites.drawDeath(ctx, this.death.x, this.death.y, this.death.type, this.death.frame);
        } else if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            Sprites.drawFrog(ctx, this.frog.x, this.frog.y, this.frog.dir, this.frog.jumping, this.frog.hasLady);
        }

        // 6. 頂部儀表板 (1-UP, HIGH SCORE)
        this.renderHUD(ctx);

        // 7. 畫面遮罩/提示文字
        if (this.state === 'TITLE') {
            this.renderOverlay(ctx, 'FROGGER 1981', `[空白鍵開始] 難度:${this.difficulty.name}`);
        } else if (this.state === 'PAUSED') {
            this.renderOverlay(ctx, 'PAUSED', '按空白鍵繼續');
        } else if (this.state === 'LEVEL_CLEAR') {
            this.renderOverlay(ctx, 'STAGE CLEAR!', `進入關卡 ${this.level + 1}`);
        } else if (this.state === 'GAME_OVER') {
            this.renderOverlay(ctx, 'GAME OVER', '點擊或按空白鍵重來');
        }
    }

    renderHUD(ctx) {
        // 頂部 Row 0 (y: 0 ~ 16)
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 8px "Courier New", monospace';
        ctx.fillText('1-UP', 16, 8);
        ctx.fillText('HI-SCORE', 120, 8);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(String(this.score).padStart(5, '0'), 16, 15);
        ctx.fillText(String(this.highScore).padStart(5, '0'), 120, 15);

        // 底部 Row 15 (y: 240 ~ 256)
        // 剩餘生命圖標
        for (let i = 0; i < Math.max(0, this.lives); i++) {
            ctx.fillStyle = Sprites.COLORS.FROG_GREEN;
            ctx.fillRect(8 + i * 12, 244, 8, 8);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(8 + i * 12, 244, 2, 2);
            ctx.fillRect(14 + i * 12, 244, 2, 2);
        }

        // TIME 計時條
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('TIME', 110, 252);

        const timeWidth = 64;
        const currentW = Math.max(0, (this.timeLeft / this.maxTime) * timeWidth);
        const timeColor = (this.timeLeft <= 5) ? ((Math.floor(this.animTick / 8) % 2 === 0) ? '#FF0000' : '#FFFF00') : '#00EE00';

        ctx.fillStyle = '#222222';
        ctx.fillRect(140, 244, timeWidth, 8);
        ctx.fillStyle = timeColor;
        ctx.fillRect(140 + (timeWidth - currentW), 244, currentW, 8);
    }

    renderOverlay(ctx, title, sub) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(16, 75, this.WIDTH - 32, 90);

        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 75, this.WIDTH - 32, 90);

        ctx.fillStyle = '#FFFF00';
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillText(title, this.WIDTH / 2, 105);

        ctx.fillStyle = '#00FFFF';
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(sub, this.WIDTH / 2, 126);

        if (this.state === 'TITLE') {
            ctx.fillStyle = this.difficulty.color;
            ctx.font = '7px "Courier New", monospace';
            ctx.fillText(this.difficulty.desc, this.WIDTH / 2, 146);
        }

        ctx.textAlign = 'left';
    }

    updateUI() {
        const scoreEl = document.getElementById('uiScore');
        const hiEl = document.getElementById('uiHighScore');
        const livesEl = document.getElementById('uiLives');
        const levelEl = document.getElementById('uiLevel');
        const diffEl = document.getElementById('uiDifficulty');
        const diffBtn = document.getElementById('diffBtn');

        if (scoreEl) scoreEl.textContent = this.score;
        if (hiEl) hiEl.textContent = this.highScore;
        if (livesEl) livesEl.textContent = '🐸'.repeat(Math.max(0, this.lives));
        if (levelEl) levelEl.textContent = this.level;

        if (diffEl) {
            diffEl.textContent = this.difficulty.name;
            diffEl.style.color = this.difficulty.color;
        }

        if (diffBtn) {
            diffBtn.textContent = `⚙ 難度: ${this.difficulty.name}`;
            diffBtn.style.backgroundColor = this.difficulty.color;
            diffBtn.style.color = (this.difficulty.key === 'EXPERT' || this.difficulty.key === 'HARD') ? '#000' : '#000';
        }
    }

    gameLoop(timestamp) {
        const dt = Math.min(timestamp - this.lastTimestamp, 50);
        this.lastTimestamp = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// 頁面載入完成後啟動
window.addEventListener('DOMContentLoaded', () => {
    window.game = new FroggerGame();
});
