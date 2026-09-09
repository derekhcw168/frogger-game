/**
 * Frogger 1981 - 像素精靈圖繪製器 (Sprite Renderer)
 * 精準還原 1981 街機像素美學與配色
 */

const Sprites = {
    // 經典街機調色盤
    COLORS: {
        BLACK: '#000000',
        WHITE: '#FFFFFF',
        FROG_GREEN: '#00D800',
        FROG_LIGHT: '#80FF00',
        FROG_DARK: '#008800',
        FROG_EYE: '#FF0000',
        FROG_BELLY: '#FFFF55',
        LADY_FROG: '#FF69B4',
        PURPLE_SIDEWALK: '#9932CD',
        PURPLE_BRICK: '#4B0082',
        WATER_BLUE: '#000066',
        WATER_FLOW: '#0000AA',
        GRASS_GREEN: '#008000',
        BUSH_DARK: '#004d00',
        LOG_BARK: '#8B4513',
        LOG_LIGHT: '#CD853F',
        LOG_CORE: '#DEB887',
        TURTLE_SHELL: '#FF4500',
        TURTLE_RIM: '#FFA500',
        TURTLE_SKIN: '#32CD32',
        TURTLE_DIVE: '#1E90FF',
        CAR_YELLOW: '#FFFF00',
        CAR_RED: '#FF1493',
        CAR_WHITE: '#F0F8FF',
        CAR_GREEN: '#00EE76',
        CAR_BLUE: '#1E90FF',
        TIRE: '#222222',
        FLY_BLACK: '#111111',
        FLY_WING: '#E0FFFF',
        CROC_GREEN: '#2E8B57',
        CROC_JAW: '#FF3030'
    },

    /**
     * 繪製青蛙
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x - 像素 X 座標
     * @param {number} y - 像素 Y 座標
     * @param {string} dir - 方向 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
     * @param {boolean} jumping - 是否正在跳躍伸展
     * @param {boolean} hasLady - 是否背著母青蛙
     */
    drawFrog(ctx, x, y, dir = 'UP', jumping = false, hasLady = false) {
        ctx.save();
        ctx.translate(x + 8, y + 8);

        // 依方向旋轉畫布
        let angle = 0;
        if (dir === 'RIGHT') angle = Math.PI / 2;
        else if (dir === 'DOWN') angle = Math.PI;
        else if (dir === 'LEFT') angle = -Math.PI / 2;
        ctx.rotate(angle);

        const green = this.COLORS.FROG_GREEN;
        const eyeRed = this.COLORS.FROG_EYE;
        const belly = this.COLORS.FROG_BELLY;

        if (!jumping) {
            // 靜止/蹲坐狀態 (16x16 點陣)
            // 軀幹
            ctx.fillStyle = green;
            ctx.fillRect(-4, -4, 8, 8);
            ctx.fillRect(-5, -2, 10, 5);

            // 雙眼
            ctx.fillStyle = eyeRed;
            ctx.fillRect(-5, -7, 3, 3);
            ctx.fillRect(2, -7, 3, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(-4, -6, 1, 1);
            ctx.fillRect(3, -6, 1, 1);

            // 前足
            ctx.fillStyle = green;
            ctx.fillRect(-7, -4, 3, 3);
            ctx.fillRect(4, -4, 3, 3);

            // 後足 (彎曲收攏)
            ctx.fillRect(-7, 3, 4, 3);
            ctx.fillRect(3, 3, 4, 3);
            ctx.fillRect(-6, 6, 3, 2);
            ctx.fillRect(3, 6, 3, 2);

            // 肚皮
            ctx.fillStyle = belly;
            ctx.fillRect(-2, -2, 4, 5);
        } else {
            // 跳躍伸展狀態
            // 軀幹拉長
            ctx.fillStyle = green;
            ctx.fillRect(-3, -5, 6, 10);

            // 眼睛
            ctx.fillStyle = eyeRed;
            ctx.fillRect(-4, -8, 3, 3);
            ctx.fillRect(1, -8, 3, 3);

            // 前足全力向前展開
            ctx.fillRect(-7, -7, 3, 2);
            ctx.fillRect(4, -7, 3, 2);
            ctx.fillRect(-8, -9, 3, 3);
            ctx.fillRect(5, -9, 3, 3);

            // 後足向後伸展
            ctx.fillRect(-7, 4, 3, 4);
            ctx.fillRect(4, 4, 3, 4);
            ctx.fillRect(-8, 8, 4, 3);
            ctx.fillRect(4, 8, 4, 3);

            // 腹部
            ctx.fillStyle = belly;
            ctx.fillRect(-2, -3, 4, 6);
        }

        // 背負粉紅母蛙
        if (hasLady) {
            ctx.fillStyle = this.COLORS.LADY_FROG;
            ctx.fillRect(-2, -2, 4, 4);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(-2, -3, 1, 1);
            ctx.fillRect(1, -3, 1, 1);
        }

        ctx.restore();
    },

    /**
     * 繪製溺水或壓扁死亡動畫
     */
    drawDeath(ctx, x, y, type = 'SQUASH', frame = 0) {
        ctx.save();
        ctx.translate(x + 8, y + 8);
        if (type === 'WATER') {
            // 水花環狀擴散
            const r = (frame + 1) * 3;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(r, 9), 0, Math.PI * 2);
            ctx.stroke();
            if (frame >= 1) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(-2, -2, 4, 4);
            }
        } else {
            // 被撞壓扁 / 骷髏 / 骨頭碎裂街機風格
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(-6, -6, 12, 12);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(-4, -4, 8, 8);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-3, -3, 2, 2);
            ctx.fillRect(1, -3, 2, 2);
            ctx.fillRect(-2, 1, 4, 2);
        }
        ctx.restore();
    },

    /**
     * 繪製車輛 (多樣化街機車款)
     */
    drawVehicle(ctx, x, y, type, width) {
        ctx.save();
        switch (type) {
            case 'YELLOW_CAB': // 黃色小轎車 (向左)
                ctx.fillStyle = this.COLORS.CAR_YELLOW;
                ctx.fillRect(x + 2, y + 2, width - 4, 12);
                // 車窗
                ctx.fillStyle = '#000033';
                ctx.fillRect(x + 4, y + 4, width - 8, 8);
                // 車頂
                ctx.fillStyle = this.COLORS.CAR_YELLOW;
                ctx.fillRect(x + 7, y + 4, width - 14, 8);
                // 車輪
                ctx.fillStyle = this.COLORS.TIRE;
                ctx.fillRect(x + 3, y, 3, 2);
                ctx.fillRect(x + width - 6, y, 3, 2);
                ctx.fillRect(x + 3, y + 14, 3, 2);
                ctx.fillRect(x + width - 6, y + 14, 3, 2);
                // 前燈 (向左)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1, y + 3, 1, 2);
                ctx.fillRect(x + 1, y + 11, 1, 2);
                break;

            case 'TRACTOR': // 綠色推土機 / 短卡車
                ctx.fillStyle = this.COLORS.GRASS_GREEN;
                ctx.fillRect(x + 2, y + 2, width - 4, 12);
                // 履帶/大型粗輪
                ctx.fillStyle = '#111';
                ctx.fillRect(x + 1, y + 1, width - 2, 3);
                ctx.fillRect(x + 1, y + 12, width - 2, 3);
                // 駕駛艙
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 6, y + 5, 5, 6);
                break;

            case 'PINK_CAR': // 粉色小汽車 (向右)
                ctx.fillStyle = this.COLORS.CAR_RED;
                ctx.fillRect(x + 2, y + 2, width - 4, 12);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 5, y + 4, width - 10, 8);
                ctx.fillStyle = this.COLORS.CAR_RED;
                ctx.fillRect(x + 7, y + 5, width - 14, 6);
                // 輪胎
                ctx.fillStyle = this.COLORS.TIRE;
                ctx.fillRect(x + 4, y, 3, 2);
                ctx.fillRect(x + width - 7, y, 3, 2);
                ctx.fillRect(x + 4, y + 14, 3, 2);
                ctx.fillRect(x + width - 7, y + 14, 3, 2);
                // 車燈 (向右)
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + width - 2, y + 3, 1, 2);
                ctx.fillRect(x + width - 2, y + 11, 1, 2);
                break;

            case 'RACE_CAR': // 賽車 (超快速，流線白紅)
                ctx.fillStyle = this.COLORS.WHITE;
                ctx.fillRect(x + 2, y + 4, width - 4, 8);
                // 賽車紅線
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 5, y + 5, width - 10, 6);
                // 外擴大型輪胎
                ctx.fillStyle = this.COLORS.TIRE;
                ctx.fillRect(x + 2, y + 1, 4, 3);
                ctx.fillRect(x + width - 6, y + 1, 4, 3);
                ctx.fillRect(x + 2, y + 12, 4, 3);
                ctx.fillRect(x + width - 6, y + 12, 4, 3);
                // 駕駛座頭盔
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + Math.floor(width / 2) - 1, y + 6, 3, 4);
                break;

            case 'TRUCK': // 重型大貨車 (佔2格 32px)
                // 貨櫃主體
                ctx.fillStyle = '#00BFFF';
                ctx.fillRect(x + 10, y + 2, width - 12, 12);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 12, y + 4, width - 16, 8);
                // 車頭 (向左)
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + 2, y + 3, 8, 10);
                // 車窗
                ctx.fillStyle = '#111';
                ctx.fillRect(x + 4, y + 4, 3, 8);
                // 車輪
                ctx.fillStyle = this.COLORS.TIRE;
                ctx.fillRect(x + 3, y + 1, 4, 2);
                ctx.fillRect(x + 3, y + 13, 4, 2);
                ctx.fillRect(x + width - 8, y + 1, 5, 2);
                ctx.fillRect(x + width - 8, y + 13, 5, 2);
                break;

            case 'BULLDOZER': // 黃色推土機
                ctx.fillStyle = this.COLORS.CAR_YELLOW;
                ctx.fillRect(x + 3, y + 3, width - 6, 10);
                // 推土板 (向右)
                ctx.fillStyle = '#888';
                ctx.fillRect(x + width - 3, y + 1, 3, 14);
                // 輪子
                ctx.fillStyle = '#222';
                ctx.fillRect(x + 2, y + 1, width - 6, 2);
                ctx.fillRect(x + 2, y + 13, width - 6, 2);
                break;
        }
        ctx.restore();
    },

    /**
     * 繪製浮木 (Log)
     */
    drawLog(ctx, x, y, width) {
        ctx.save();
        const bark = this.COLORS.LOG_BARK;
        const core = this.COLORS.LOG_CORE;
        const light = this.COLORS.LOG_LIGHT;

        // 樹幹本體
        ctx.fillStyle = bark;
        ctx.fillRect(x + 4, y + 2, width - 8, 12);

        // 樹皮高光與紋理
        ctx.fillStyle = light;
        for (let i = 8; i < width - 12; i += 12) {
            ctx.fillRect(x + i, y + 3, 6, 2);
            ctx.fillRect(x + i + 4, y + 9, 5, 2);
        }

        // 左右兩端年輪截面
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(x + 4, y + 8, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(x + width - 4, y + 8, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 年輪中心點
        ctx.fillStyle = bark;
        ctx.fillRect(x + 3, y + 7, 2, 2);
        ctx.fillRect(x + width - 5, y + 7, 2, 2);

        ctx.restore();
    },

    /**
     * 繪製烏龜 (單隻或多隻組，支援下潛動畫)
     * @param {number} diveState - 0: 水面, 1: 準備下潛, 2: 半潛, 3: 完全在水底
     */
    drawTurtleGroup(ctx, x, y, count = 2, diveState = 0, swimAnim = 0) {
        ctx.save();
        for (let i = 0; i < count; i++) {
            const tx = x + i * 16;
            this.drawSingleTurtle(ctx, tx, y, diveState, swimAnim);
        }
        ctx.restore();
    },

    drawSingleTurtle(ctx, x, y, diveState = 0, swimAnim = 0) {
        if (diveState === 3) {
            // 完全潛入水中：只看見水波微光，不能踩！
            ctx.fillStyle = '#0055CC';
            ctx.fillRect(x + 4, y + 5, 8, 6);
            return;
        }

        if (diveState === 2) {
            // 半潛水：身體變暗，四肢沒入水中
            ctx.fillStyle = '#003388';
            ctx.fillRect(x + 2, y + 3, 12, 10);
            ctx.fillStyle = '#0088AA';
            ctx.fillRect(x + 4, y + 4, 8, 8);
            return;
        }

        // 正常水面或準備下潛
        const shellColor = (diveState === 1) ? '#CD3700' : this.COLORS.TURTLE_SHELL;
        const skinColor = this.COLORS.TURTLE_SKIN;

        // 龜甲主體
        ctx.fillStyle = shellColor;
        ctx.fillRect(x + 3, y + 3, 10, 10);

        // 龜甲邊框花紋
        ctx.fillStyle = this.COLORS.TURTLE_RIM;
        ctx.fillRect(x + 4, y + 4, 8, 2);
        ctx.fillRect(x + 4, y + 10, 8, 2);
        ctx.fillRect(x + 5, y + 6, 6, 4);

        // 烏龜頭部 (向左划動)
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 1, y + 6, 2, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 1, y + 7, 1, 1);

        // 四肢划水 (有 2 幀交替動畫)
        const offset = (swimAnim % 2 === 0) ? 0 : 1;
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 3 - offset, y + 1, 3, 2);
        ctx.fillRect(x + 10 - offset, y + 1, 3, 2);
        ctx.fillRect(x + 3 - offset, y + 13, 3, 2);
        ctx.fillRect(x + 10 - offset, y + 13, 3, 2);
    },

    /**
     * 繪製鱷魚 (Alligator)
     */
    drawCrocodile(ctx, x, y, width, mouthOpen = false) {
        ctx.save();
        // 鱷魚綠色凹凸背部
        ctx.fillStyle = this.COLORS.CROC_GREEN;
        ctx.fillRect(x + 2, y + 3, width - 16, 10);
        // 背刺紋理
        ctx.fillStyle = '#1c5c36';
        for (let i = 4; i < width - 18; i += 6) {
            ctx.fillRect(x + i, y + 4, 3, 3);
            ctx.fillRect(x + i, y + 9, 3, 3);
        }
        // 鱷魚頭部 (向右)
        const hx = x + width - 14;
        ctx.fillStyle = this.COLORS.CROC_GREEN;
        ctx.fillRect(hx, y + 4, 12, 8);
        // 眼睛
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(hx + 2, y + 2, 2, 2);
        ctx.fillRect(hx + 2, y + 12, 2, 2);

        if (mouthOpen) {
            // 張開大嘴：露出血盆大口與尖牙 (危險區！)
            ctx.fillStyle = this.COLORS.CROC_JAW;
            ctx.fillRect(hx + 4, y + 6, 8, 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(hx + 5, y + 5, 2, 1);
            ctx.fillRect(hx + 9, y + 5, 2, 1);
            ctx.fillRect(hx + 5, y + 10, 2, 1);
            ctx.fillRect(hx + 9, y + 10, 2, 1);
        } else {
            // 閉嘴：安全狀態
            ctx.fillStyle = '#111';
            ctx.fillRect(hx + 4, y + 7, 8, 2);
        }
        ctx.restore();
    },

    /**
     * 繪製獎勵蒼蠅
     */
    drawFly(ctx, x, y) {
        ctx.save();
        ctx.translate(x + 8, y + 8);
        // 黑色蟲體
        ctx.fillStyle = this.COLORS.FLY_BLACK;
        ctx.fillRect(-2, -3, 4, 6);
        // 白色翅膀
        ctx.fillStyle = this.COLORS.FLY_WING;
        ctx.fillRect(-5, -4, 3, 4);
        ctx.fillRect(2, -4, 3, 4);
        // 紅色複眼
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-2, -4, 1, 1);
        ctx.fillRect(1, -4, 1, 1);
        ctx.restore();
    },

    /**
     * 繪製洞口內過關青蛙
     */
    drawHomeFrog(ctx, x, y) {
        ctx.save();
        ctx.translate(x + 8, y + 8);
        ctx.fillStyle = this.COLORS.FROG_GREEN;
        ctx.fillRect(-5, -4, 10, 8);
        ctx.fillRect(-4, -6, 8, 2);
        ctx.fillStyle = this.COLORS.FROG_EYE;
        ctx.fillRect(-4, -7, 2, 2);
        ctx.fillRect(2, -7, 2, 2);
        ctx.fillStyle = this.COLORS.FROG_BELLY;
        ctx.fillRect(-3, -2, 6, 5);
        ctx.restore();
    },

    /**
     * 繪製街機地圖背景 (紫磚人行道、馬路標線、草叢灌木、水流波紋)
     */
    drawBackground(ctx, width, height, riverFlowOffset = 0) {
        // 全黑底色
        ctx.fillStyle = this.COLORS.BLACK;
        ctx.fillRect(0, 0, width, height);

        // 1. 頂部草叢灌木目標區 (Row 1, y = 16 ~ 32)
        ctx.fillStyle = this.COLORS.GRASS_GREEN;
        ctx.fillRect(0, 16, width, 16);
        ctx.fillStyle = this.COLORS.BUSH_DARK;
        for (let i = 0; i < width; i += 8) {
            ctx.fillRect(i, 16, 4, 4);
            ctx.fillRect(i + 4, 28, 4, 4);
        }

        // 2. 河流區域 (Row 2 ~ 7, y = 32 ~ 128)
        ctx.fillStyle = this.COLORS.WATER_BLUE;
        ctx.fillRect(0, 32, width, 96);
        // 動態水波紋
        ctx.fillStyle = this.COLORS.WATER_FLOW;
        for (let y = 32; y < 128; y += 16) {
            for (let x = 0; x < width; x += 32) {
                const waveX = (x + riverFlowOffset * 10) % (width + 32) - 16;
                ctx.fillRect(waveX, y + 6, 8, 2);
                ctx.fillRect(waveX + 16, y + 12, 6, 2);
            }
        }

        // 3. 中央紫磚安全島 (Row 8, y = 128 ~ 144)
        this.drawSidewalk(ctx, 0, 128, width);

        // 4. 馬路區域 (Row 9 ~ 13, y = 144 ~ 224)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 144, width, 80);
        // 馬路虛線/車道分隔
        ctx.fillStyle = '#FFFFFF';
        for (let row = 1; row < 5; row++) {
            const laneY = 144 + row * 16;
            for (let x = 4; x < width; x += 24) {
                ctx.fillRect(x, laneY - 1, 10, 1);
            }
        }

        // 5. 底部起點安全帶 (Row 14, y = 224 ~ 240)
        this.drawSidewalk(ctx, 0, 224, width);
    },

    drawSidewalk(ctx, x, y, width) {
        ctx.fillStyle = this.COLORS.PURPLE_SIDEWALK;
        ctx.fillRect(x, y, width, 16);
        // 紫磚交叉陰影
        ctx.fillStyle = this.COLORS.PURPLE_BRICK;
        for (let i = 0; i < width; i += 8) {
            ctx.fillRect(i, y, 1, 16);
            ctx.fillRect(i, y + 7, 8, 1);
        }
    }
};

window.Sprites = Sprites;
