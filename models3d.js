/**
 * Frogger 3D Odyssey DX - 超精細清漆高模、程序化高解析紋理與多層星芒光暈庫 (Models3D Ultra v3)
 * 升級亮點：
 * 1. MeshPhysicalMaterial 清漆 (Clearcoat) 琉璃與金屬質感 + 高細分曲面幾何 (32~48 段)
 * 2. 程序化高解析度紋理 (512x512 道路、花草磚、賽博電路、十字星芒與柔和光暈貼圖)
 * 3. 載具立體車頭探照光束 (Volumetric Light Cones) 與尾燈光暈
 * 4. 雙層瞳孔高光大眼、腳趾璞足、角色專屬腳底魔法陣與多環星象儀傳送門
 */

const Models3D = {
    _texCache: {},

    // ==================== 程序化高解析度貼圖與光暈生成器 ====================
    getGlowTexture() {
        if (this._texCache.glow) return this._texCache.glow;
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        g.addColorStop(0.22, 'rgba(255, 255, 255, 0.78)');
        g.addColorStop(0.52, 'rgba(255, 255, 255, 0.22)');
        g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(canvas);
        this._texCache.glow = tex;
        return tex;
    },

    getSparkleTexture() {
        if (this._texCache.sparkle) return this._texCache.sparkle;
        const size = 256;
        const c = size / 2;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 柔和圓形光暈底
        const g = ctx.createRadialGradient(c, c, 0, c, c, c);
        g.addColorStop(0.0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.45)');
        g.addColorStop(1.0, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);

        // 十字星芒高光
        ctx.save();
        ctx.translate(c, c);
        for (let i = 0; i < 2; i++) {
            ctx.rotate(i * Math.PI * 0.5);
            const sg = ctx.createLinearGradient(-c, 0, c, 0);
            sg.addColorStop(0, 'rgba(255,255,255,0)');
            sg.addColorStop(0.5, 'rgba(255,255,255,0.95)');
            sg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.ellipse(0, 0, c * 0.95, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        this._texCache.sparkle = tex;
        return tex;
    },

    createGlowSprite(colorHex = 0xffffff, scale = 1.6, opacity = 0.48, useSparkle = false) {
        const mat = new THREE.SpriteMaterial({
            map: useSparkle ? this.getSparkleTexture() : this.getGlowTexture(),
            color: colorHex,
            transparent: true,
            opacity: Math.min(0.62, opacity),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(scale, scale, 1);
        return sprite;
    },

    getGroundTexture(worldId, isAlt = false) {
        const key = `ground_${worldId}_${isAlt ? 1 : 0}`;
        if (this._texCache[key]) return this._texCache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const palettes = {
            1: isAlt ? ['#15803d', '#16a34a', '#4ade80'] : ['#16a34a', '#22c55e', '#facc15'],
            2: isAlt ? ['#365314', '#3f6212', '#84cc16'] : ['#3f6212', '#4d7c0f', '#eab308'],
            3: isAlt ? ['#1e1b4b', '#312e81', '#9333ea'] : ['#251052', '#3b1978', '#38bdf8'],
            4: isAlt ? ['#1c1917', '#262220', '#ea580c'] : ['#241e1c', '#332b28', '#dc2626'],
            5: isAlt ? ['#0b1120', '#162038', '#00d4ff'] : ['#111c38', '#1b2c54', '#ec4899']
        };
        const [base, mid, accent] = palettes[worldId] || palettes[1];

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 512, 512);

        // 精緻棋盤方磚與微紋理細節
        ctx.fillStyle = mid;
        for (let y = 0; y < 512; y += 128) {
            for (let x = 0; x < 512; x += 128) {
                if (((x + y) / 128) % 2 === 0) {
                    ctx.globalAlpha = 0.28;
                    ctx.fillRect(x + 4, y + 4, 120, 120);
                }
            }
        }

        // 點綴小花朵 / 符文 / 火星 / 電路節點
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = accent;
        for (let i = 0; i < 42; i++) {
            const px = (i * 97 + 31) % 490 + 11;
            const py = (i * 151 + 53) % 490 + 11;
            if (worldId === 5) {
                ctx.fillRect(px, py, 18, 3);
                ctx.fillRect(px, py, 3, 18);
            } else {
                ctx.beginPath();
                ctx.arc(px, py, (i % 3) + 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 1);
        this._texCache[key] = tex;
        return tex;
    },

    getRoadTexture(worldId) {
        const key = `road_${worldId}`;
        if (this._texCache[key]) return this._texCache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const roadColors = {
            1: { bg: '#263244', border: '#facc15', grain: '#3b4b63' },
            2: { bg: '#443c36', border: '#d97706', grain: '#5c524a' },
            3: { bg: '#1e1633', border: '#a855f7', grain: '#322554' },
            4: { bg: '#181313', border: '#ff5500', grain: '#2e1f1f' },
            5: { bg: '#090e1f', border: '#00f5ff', grain: '#172554' }
        };
        const rc = roadColors[worldId] || roadColors[1];

        ctx.fillStyle = rc.bg;
        ctx.fillRect(0, 0, 512, 256);

        // 細膩柏油/石板顆粒感
        ctx.fillStyle = rc.grain;
        for (let i = 0; i < 180; i++) {
            const x = (i * 73) % 512;
            const y = (i * 41) % 256;
            ctx.fillRect(x, y, 4, 3);
        }

        // 雙側精緻路緣邊線
        ctx.fillStyle = rc.border;
        ctx.globalAlpha = worldId >= 3 ? 0.85 : 0.65;
        ctx.fillRect(0, 6, 512, 7);
        ctx.fillRect(0, 243, 512, 7);
        ctx.globalAlpha = 1.0;

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(8, 1);
        this._texCache[key] = tex;
        return tex;
    },

    // ==================== 6 款可解鎖高模清漆主角造型 ====================
    SKINS: [
        {
            id: 'classic',
            name: '經典翡翠琉璃蛙',
            badge: '🐸',
            cost: 0,
            bodyColor: 0x1ee858,
            spotColor: 0x059669,
            bellyColor: 0xfff5b8,
            irisColor: 0xfbbf24,
            trailColor: 0x4ade80,
            desc: '水潤清漆光澤的森林冒險家，附帶翡翠星芒光環與跳躍拖尾。'
        },
        {
            id: 'ninja',
            name: '緋櫻暗影忍者蛙',
            badge: '⚔️',
            cost: 35,
            bodyColor: 0x1e293b,
            spotColor: 0x0f172a,
            bellyColor: 0x94a3b8,
            irisColor: 0xff2255,
            trailColor: 0xff3366,
            desc: '身披緋紅飄帶頭巾與背負發光妖刀的疾風忍者，附帶櫻花星芒拖尾。'
        },
        {
            id: 'cyber',
            name: '全息霓虹機甲蛙',
            badge: '🤖',
            cost: 65,
            bodyColor: 0xf1f5f9,
            spotColor: 0x38bdf8,
            bellyColor: 0x00f5ff,
            irisColor: 0x00f5ff,
            trailColor: 0x00f5ff,
            desc: '鏡面鈦合金裝甲、全息雷射護目鏡與雙肩電漿推進器，附帶霓虹電弧拖尾。'
        },
        {
            id: 'gold',
            name: '皇家璀璨黃金蛙',
            badge: '👑',
            cost: 100,
            bodyColor: 0xffcc00,
            spotColor: 0xf59e0b,
            bellyColor: 0xfffbeb,
            irisColor: 0xff0055,
            trailColor: 0xffe047,
            desc: '24K 鏡面純金鍛造、鑲嵌星芒紅寶石皇冠的王者，附帶黃金星塵光暈。'
        },
        {
            id: 'ghost',
            name: '星雲幻影靈體蛙',
            badge: '👻',
            cost: 130,
            bodyColor: 0x67e8f9,
            spotColor: 0xc084fc,
            bellyColor: 0xf0f9ff,
            irisColor: 0xe879f9,
            trailColor: 0xc084fc,
            desc: '半透明琉璃自發光星雲靈體並環繞雙層天使光環，附帶極光魂火拖尾。'
        },
        {
            id: 'dragon',
            name: '赤焰黑曜龍皇蛙',
            badge: '🐲',
            cost: 170,
            bodyColor: 0x272020,
            spotColor: 0xff4500,
            bellyColor: 0xff7b00,
            irisColor: 0xffea00,
            trailColor: 0xff5500,
            desc: '黑曜石清漆龍鱗配熾熱熔岩雙角與發光背棘，附帶烈焰流火光暈。'
        }
    ],

    getSkinInfo(skinId) {
        return this.SKINS.find(s => s.id === skinId) || this.SKINS[0];
    },

    // ==================== 1. 主角大青蛙 (32 段高模清漆 + 雙高光大眼 + 腳底魔法陣) ====================
    createFrogger(skinId = 'classic') {
        const skin = this.getSkinInfo(skinId);
        const frogGroup = new THREE.Group();

        const visualRoot = new THREE.Group();
        frogGroup.add(visualRoot);

        const isGold = skin.id === 'gold';
        const isGhost = skin.id === 'ghost';
        const isCyber = skin.id === 'cyber';
        const isDragon = skin.id === 'dragon';

        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
        const skinMat = new MatClass({
            color: skin.bodyColor,
            roughness: isGold ? 0.12 : (isCyber ? 0.18 : 0.24),
            metalness: isGold ? 0.92 : (isCyber ? 0.72 : 0.08),
            clearcoat: 0.85,
            clearcoatRoughness: 0.12,
            transparent: isGhost,
            opacity: isGhost ? 0.84 : 1.0,
            emissive: isGhost ? 0x0284c7 : (isDragon ? 0x3b0900 : 0x03200c),
            emissiveIntensity: isGhost ? 0.55 : 0.22
        });

        const spotMat = new MatClass({
            color: skin.spotColor,
            roughness: 0.25,
            metalness: isGold ? 0.8 : 0.15,
            emissive: (isDragon || isCyber || isGhost) ? skin.spotColor : 0x000000,
            emissiveIntensity: (isDragon || isCyber || isGhost) ? 0.65 : 0
        });

        const bellyMat = new MatClass({
            color: skin.bellyColor,
            roughness: 0.3,
            metalness: isGold ? 0.55 : 0.05,
            clearcoat: 0.5,
            emissive: (isDragon || isCyber) ? skin.bellyColor : 0x000000,
            emissiveIntensity: (isDragon || isCyber) ? 0.45 : 0
        });

        // 腳底柔和魔法光環（不遮擋身體清漆高光細節）
        const auraRing = new THREE.Mesh(
            new THREE.RingGeometry(0.62, 0.75, 36),
            new THREE.MeshBasicMaterial({
                color: skin.trailColor,
                transparent: true,
                opacity: 0.52,
                side: THREE.DoubleSide
            })
        );
        auraRing.rotation.x = -Math.PI / 2;
        auraRing.position.y = 0.03;
        frogGroup.add(auraRing);

        // 高細分圓潤軀幹 (32x24)
        const bodyGeo = new THREE.SphereGeometry(0.55, 32, 24);
        bodyGeo.scale(1.14, 0.80, 1.20);
        const body = new THREE.Mesh(bodyGeo, skinMat);
        body.position.y = 0.46;
        body.castShadow = true;
        body.receiveShadow = true;
        visualRoot.add(body);

        // 背部精緻斑紋點綴
        [[-0.22, 0.78, 0.12, 0.11], [0.22, 0.78, 0.12, 0.11], [0, 0.81, 0.28, 0.13]].forEach(([sx, sy, sz, sr]) => {
            const spot = new THREE.Mesh(new THREE.SphereGeometry(sr, 14, 12), spotMat);
            spot.scale.set(1.2, 0.35, 1.2);
            spot.position.set(sx, sy, sz);
            visualRoot.add(spot);
        });

        // 奶油光澤肚皮
        const bellyGeo = new THREE.SphereGeometry(0.47, 24, 18);
        bellyGeo.scale(0.96, 0.64, 1.04);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.36, -0.12);
        visualRoot.add(belly);

        // 蛙鳴發光共鳴氣囊
        const throatSac = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 20, 16),
            new MatClass({
                color: 0xfff088,
                emissive: 0x00ffaa,
                emissiveIntensity: 0.35,
                clearcoat: 0.8,
                roughness: 0.2
            })
        );
        throatSac.position.set(0, 0.34, -0.45);
        throatSac.scale.set(0.5, 0.5, 0.5);
        visualRoot.add(throatSac);

        // 多層次寶石大眼睛（眼窩 + 眼白 + 彩色虹膜 + 瞳孔 + 雙星高光點）
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const irisMat = new THREE.MeshBasicMaterial({ color: skin.irisColor });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff66aa, transparent: true, opacity: 0.72 });

        [-1, 1].forEach(dir => {
            const socket = new THREE.Mesh(new THREE.SphereGeometry(0.23, 20, 16), skinMat);
            socket.position.set(dir * 0.32, 0.77, -0.26);
            socket.castShadow = true;

            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.185, 20, 16), eyeWhiteMat);
            ball.position.set(dir * 0.32, 0.80, -0.31);

            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 14), irisMat);
            iris.scale.set(1, 1, 0.55);
            iris.position.set(dir * 0.32, 0.81, -0.44);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), pupilMat);
            pupil.scale.set(1, 1, 0.55);
            pupil.position.set(dir * 0.32, 0.81, -0.475);

            // 動漫感雙高光點
            const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeWhiteMat);
            shine1.position.set(dir * 0.32 + 0.04, 0.85, -0.505);
            const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeWhiteMat);
            shine2.position.set(dir * 0.32 - 0.035, 0.78, -0.505);

            const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), cheekMat);
            cheek.scale.set(1.25, 0.68, 0.5);
            cheek.position.set(dir * 0.45, 0.54, -0.43);

            visualRoot.add(socket, ball, iris, pupil, shine1, shine2, cheek);
        });

        // 精雕三趾吸盤前足與強健後腿璞足
        const buildWebbedFoot = (isBack = false) => {
            const fGroup = new THREE.Group();
            const palm = new THREE.Mesh(
                new THREE.SphereGeometry(isBack ? 0.16 : 0.13, 12, 10),
                skinMat
            );
            palm.scale.set(1.2, 0.42, 1.35);
            fGroup.add(palm);

            [-0.28, 0, 0.28].forEach(ang => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, isBack ? 0.26 : 0.20, 8), skinMat);
                toe.rotation.x = Math.PI / 2;
                toe.rotation.z = ang;
                toe.position.set(Math.sin(ang) * 0.12, 0, -0.14);
                const pad = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), spotMat);
                pad.scale.y = 0.5;
                pad.position.set(Math.sin(ang) * 0.18, 0, -0.24);
                fGroup.add(toe, pad);
            });
            return fGroup;
        };

        const flFoot = buildWebbedFoot(false);
        flFoot.position.set(-0.50, 0.07, -0.34);
        const frFoot = buildWebbedFoot(false);
        frFoot.position.set(0.50, 0.07, -0.34);

        const thighGeo = new THREE.SphereGeometry(0.24, 18, 14);
        thighGeo.scale(0.86, 0.92, 1.38);
        const blThigh = new THREE.Mesh(thighGeo, skinMat);
        blThigh.position.set(-0.55, 0.27, 0.24);
        blThigh.castShadow = true;
        const brThigh = new THREE.Mesh(thighGeo, skinMat);
        brThigh.position.set(0.55, 0.27, 0.24);
        brThigh.castShadow = true;

        const blFoot = buildWebbedFoot(true);
        blFoot.position.set(-0.56, 0.07, 0.30);
        const brFoot = buildWebbedFoot(true);
        brFoot.position.set(0.56, 0.07, 0.30);

        visualRoot.add(flFoot, frFoot, blThigh, brThigh, blFoot, brFoot);

        // ===== 6 款造型高精細專屬配件與星芒光暈 =====
        if (skin.id === 'ninja') {
            const bandMat = new MatClass({ color: 0xff1744, emissive: 0x660018, roughness: 0.3 });
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.068, 12, 32), bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.set(0, 0.63, -0.02);
            const metalPlate = new THREE.Mesh(
                new THREE.BoxGeometry(0.32, 0.13, 0.06),
                new MatClass({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
            );
            metalPlate.position.set(0, 0.64, -0.53);
            const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.045, 0.55), bandMat);
            tail1.position.set(-0.15, 0.62, 0.65);
            tail1.rotation.set(-0.25, -0.22, 0);
            const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.045, 0.48), bandMat);
            tail2.position.set(0.14, 0.58, 0.62);
            tail2.rotation.set(-0.35, 0.26, 0);

            const swordGroup = new THREE.Group();
            const scabbard = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.038, 1.15, 12),
                new MatClass({ color: 0x0f172a, clearcoat: 0.9, roughness: 0.15 })
            );
            const hilt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.052, 0.052, 0.30, 12),
                new MatClass({ color: 0xff1744, roughness: 0.4 })
            );
            hilt.position.y = 0.68;
            const guard = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.035, 16),
                new MatClass({ color: 0xffd700, metalness: 0.9, roughness: 0.15 })
            );
            guard.position.y = 0.54;
            swordGroup.add(scabbard, hilt, guard);
            swordGroup.position.set(0.06, 0.56, 0.54);
            swordGroup.rotation.z = 0.68;
            visualRoot.add(band, metalPlate, tail1, tail2, swordGroup);
        } else if (skin.id === 'cyber') {
            const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.22, 0.24), visorMat);
            visor.position.set(0, 0.79, -0.43);
            const visorGlow = this.createGlowSprite(0x00f5ff, 1.4, 0.65, false);
            visorGlow.position.set(0, 0.79, -0.56);
            visualRoot.add(visor, visorGlow);

            [-0.38, 0.38].forEach(jx => {
                const pod = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.15, 0.46, 16),
                    new MatClass({ color: 0x334155, metalness: 0.88, roughness: 0.15 })
                );
                pod.position.set(jx, 0.54, 0.48);
                pod.rotation.x = 0.32;
                const flame = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.32, 12), visorMat);
                flame.rotation.x = Math.PI;
                flame.position.y = -0.32;
                pod.add(flame);
                visualRoot.add(pod);
            });
        } else if (skin.id === 'gold') {
            const crownGroup = new THREE.Group();
            const crownMat = new MatClass({
                color: 0xffe033,
                metalness: 0.96,
                roughness: 0.08,
                clearcoat: 1.0,
                emissive: 0x553b00,
                emissiveIntensity: 0.4
            });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.25, 0.18, 20), crownMat);
            crownGroup.add(base);
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 10), crownMat);
                spike.position.set(Math.cos(a) * 0.25, 0.18, Math.sin(a) * 0.25);
                const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                pearl.position.set(Math.cos(a) * 0.25, 0.30, Math.sin(a) * 0.25);
                crownGroup.add(spike, pearl);
            }
            const ruby = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.10, 1),
                new THREE.MeshBasicMaterial({ color: 0xff0055 })
            );
            ruby.position.set(0, 0.05, -0.27);
            const sparkle = this.createGlowSprite(0xffea00, 1.3, 0.85, true);
            sparkle.position.set(0, 0.22, 0);
            crownGroup.add(ruby, sparkle);
            crownGroup.position.set(0, 0.96, 0.02);
            crownGroup.rotation.x = -0.12;
            visualRoot.add(crownGroup);
        } else if (skin.id === 'ghost') {
            const halo = new THREE.Mesh(
                new THREE.TorusGeometry(0.35, 0.048, 12, 32),
                new THREE.MeshBasicMaterial({ color: 0xe879f9 })
            );
            halo.rotation.x = Math.PI / 2;
            halo.position.set(0, 1.08, 0);
            const ghostGlow = this.createGlowSprite(0xc084fc, 2.0, 0.65, true);
            ghostGlow.position.set(0, 0.72, 0);
            visualRoot.add(halo, ghostGlow);
        } else if (skin.id === 'dragon') {
            const hornMat = new THREE.MeshBasicMaterial({ color: 0xff6b00 });
            [-0.27, 0.27].forEach(hx => {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.42, 12), hornMat);
                horn.position.set(hx, 0.98, -0.05);
                horn.rotation.z = hx < 0 ? 0.38 : -0.38;
                horn.rotation.x = 0.28;
                visualRoot.add(horn);
            });
            for (let s = 0; s < 3; s++) {
                const spine = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 10), hornMat);
                spine.position.set(0, 0.84 - s * 0.12, 0.15 + s * 0.19);
                spine.rotation.x = 0.45;
                visualRoot.add(spine);
            }
            const fireGlow = this.createGlowSprite(0xff4500, 1.9, 0.58, false);
            fireGlow.position.set(0, 0.65, 0.1);
            visualRoot.add(fireGlow);
        }

        // 彈力粉紅發光長舌（沿 -Z 伸展）
        const tongueMat = new MatClass({
            color: 0xff2a75,
            emissive: 0xaa0044,
            emissiveIntensity: 0.55,
            clearcoat: 0.9,
            roughness: 0.15
        });
        const tongueGeo = new THREE.CylinderGeometry(0.075, 0.075, 1.0, 14);
        tongueGeo.rotateX(Math.PI / 2);
        tongueGeo.translate(0, 0, -0.5);
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0, 0.45, -0.52);
        tongue.scale.set(1, 1, 0.001);

        const tongueTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), tongueMat);
        tongueTip.position.set(0, 0, -1.0);
        const tipGlow = this.createGlowSprite(0xff66aa, 0.85, 0.8, true);
        tipGlow.position.set(0, 0, -1.0);
        tongue.add(tongueTip, tipGlow);
        frogGroup.add(tongue);

        // 背部小萌蛙疊疊樂容器
        const backpackGroup = new THREE.Group();
        backpackGroup.position.set(0, 0.84, 0.16);
        frogGroup.add(backpackGroup);

        frogGroup.userData = {
            skinId: skin.id,
            trailColor: skin.trailColor,
            visualRoot,
            body,
            throatSac,
            tongue,
            auraRing,
            backpack: backpackGroup,
            limbs: { flFoot, frFoot, blFoot, brFoot }
        };

        return frogGroup;
    },

    // ==================== 2. 高精細迷失小萌蛙 + 星芒蓮花寶座 ====================
    createBabyFrog(colorHex = 0xff3355, name = '小紅') {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        const mat = new MatClass({
            color: colorHex,
            roughness: 0.2,
            metalness: 0.1,
            clearcoat: 0.85,
            emissive: colorHex,
            emissiveIntensity: 0.24
        });
        const bellyMat = new MatClass({ color: 0xffffff, roughness: 0.3, clearcoat: 0.5 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

        // 多瓣發光蓮花安全底座
        const padGroup = new THREE.Group();
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.80, 0.72, 0.15, 24),
            new MatClass({ color: 0x16a34a, roughness: 0.35, clearcoat: 0.4 })
        );
        pad.receiveShadow = true;
        padGroup.add(pad);

        // 環繞立體蓮花花瓣
        const petalMat = new MatClass({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.45,
            roughness: 0.25
        });
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 8), petalMat);
            petal.position.set(Math.cos(a) * 0.72, 0.10, Math.sin(a) * 0.72);
            petal.rotation.z = -Math.cos(a) * 0.55;
            petal.rotation.x = Math.sin(a) * 0.55;
            padGroup.add(petal);
        }

        const glowRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.86, 0.045, 10, 32),
            new THREE.MeshBasicMaterial({ color: colorHex })
        );
        glowRing.rotation.x = Math.PI / 2;
        glowRing.position.y = 0.05;
        padGroup.add(glowRing);
        padGroup.position.y = -0.05;
        group.add(padGroup);

        // 水潤小萌蛙本體
        const bodyMesh = new THREE.Group();
        const torsoGeo = new THREE.SphereGeometry(0.28, 24, 18);
        torsoGeo.scale(1.14, 0.90, 1.12);
        const torso = new THREE.Mesh(torsoGeo, mat);
        torso.position.y = 0.25;
        torso.castShadow = true;
        bodyMesh.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 14), bellyMat);
        belly.position.set(0, 0.21, 0.09);
        bodyMesh.add(belly);

        [-0.135, 0.135].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), eyeMat);
            eye.position.set(ex, 0.41, 0.15);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pupilMat);
            pupil.position.set(ex, 0.42, 0.245);
            const shine = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
            shine.position.set(ex + 0.025, 0.45, 0.285);
            bodyMesh.add(eye, pupil, shine);
        });

        // 頭頂可愛迷你領結/小嫩芽
        const sprout = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xa3e635 })
        );
        sprout.scale.set(1.8, 0.5, 0.8);
        sprout.position.set(0, 0.54, 0);
        bodyMesh.add(sprout);
        group.add(bodyMesh);

        // 極光指引光柱 + 璀璨星芒光暈
        const beaconGroup = new THREE.Group();
        const beaconGeo = new THREE.CylinderGeometry(0.05, 0.34, 5.4, 16, 1, true);
        beaconGeo.translate(0, 2.7, 0);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const beaconShaft = new THREE.Mesh(beaconGeo, beaconMat);
        const starHalo = this.createGlowSprite(colorHex, 1.85, 0.85, true);
        starHalo.position.y = 0.65;
        beaconGroup.add(beaconShaft, starHalo);
        group.add(beaconGroup);

        group.userData = {
            name,
            colorHex,
            beacon: beaconGroup,
            beaconMat,
            pad: padGroup,
            bodyMesh,
            isRescued: false
        };

        return group;
    },

    // ==================== 3. 清漆烤漆載具 + 立體車頭光束與輪框 ====================
    createVehicle(type = 'TOY_RACER') {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.75 });
        const rimMat = new MatClass({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
        const glassMat = new MatClass({
            color: 0x0ea5e9,
            roughness: 0.06,
            metalness: 0.25,
            clearcoat: 1.0,
            emissive: 0x082f49,
            emissiveIntensity: 0.4
        });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

        const addDeluxeWheels = (w, l, r = 0.25) => {
            const tireGeo = new THREE.CylinderGeometry(r, r, 0.22, 20);
            tireGeo.rotateZ(Math.PI / 2);
            const hubGeo = new THREE.CylinderGeometry(r * 0.58, r * 0.58, 0.235, 16);
            hubGeo.rotateZ(Math.PI / 2);
            [
                [-w * 0.52, r, l * 0.3],
                [w * 0.52, r, l * 0.3],
                [-w * 0.52, r, -l * 0.3],
                [w * 0.52, r, -l * 0.3]
            ].forEach(p => {
                const tire = new THREE.Mesh(tireGeo, tireMat);
                tire.position.set(...p);
                tire.castShadow = true;
                const hub = new THREE.Mesh(hubGeo, rimMat);
                hub.position.set(...p);
                group.add(tire, hub);
            });
        };

        // 雙側車頭立體探照光錐 (Volumetric Light Cones) + 尾燈紅暈
        const addLightBeams = (w, y, frontZ, backZ, beamColor = 0xfff3b0) => {
            const coneGeo = new THREE.ConeGeometry(0.38, 2.2, 16, 1, true);
            coneGeo.translate(0, -1.1, 0);
            coneGeo.rotateX(-Math.PI / 2);
            const coneMat = new THREE.MeshBasicMaterial({
                color: beamColor,
                transparent: true,
                opacity: 0.10,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            [-w * 0.33, w * 0.33].forEach(lx => {
                const hl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), headlightMat);
                hl.position.set(lx, y, frontZ);
                const beam = new THREE.Mesh(coneGeo, coneMat);
                beam.position.set(lx, y * 0.85, frontZ + 0.05);

                const tl = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.11, 0.06), taillightMat);
                tl.position.set(lx, y, backZ);
                group.add(hl, beam, tl);
            });
        };

        if (type === 'LAWNMOWER') {
            const redMat = new MatClass({ color: 0xff2a4b, roughness: 0.18, clearcoat: 0.85 });
            const deckMat = new MatClass({ color: 0x10b981, roughness: 0.28, clearcoat: 0.5 });
            const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.46, 1.95), redMat);
            chassis.position.y = 0.42;
            chassis.castShadow = true;
            const hood = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.40, 0.90), redMat);
            hood.position.set(0, 0.74, 0.40);
            hood.castShadow = true;
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(0.72, 0.36, 0.52),
                new MatClass({ color: 0xfacc15, roughness: 0.35 })
            );
            seat.position.set(0, 0.80, -0.45);
            const bladeDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.13, 20), deckMat);
            bladeDeck.position.set(0, 0.16, 0.05);
            group.add(chassis, hood, seat, bladeDeck);
            addDeluxeWheels(1.22, 1.82, 0.24);
            addLightBeams(0.88, 0.68, 0.86, -0.98);
            group.userData = { length: 2.05, width: 1.36, spinPart: bladeDeck };
        } else if (type === 'PICKUP') {
            const bodyMat = new MatClass({ color: 0x06b6d4, roughness: 0.16, metalness: 0.3, clearcoat: 0.9 });
            const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.54, 3.25), bodyMat);
            base.position.y = 0.48;
            base.castShadow = true;
            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.56, 1.28), glassMat);
            cab.position.set(0, 0.96, 0.46);
            cab.castShadow = true;
            const bed = new THREE.Mesh(new THREE.BoxGeometry(1.40, 0.44, 1.48), woodMat);
            bed.position.set(0, 0.84, -0.82);
            bed.castShadow = true;
            group.add(base, cab, bed);
            addDeluxeWheels(1.48, 3.0, 0.29);
            addLightBeams(1.18, 0.54, 1.63, -1.63);
            group.userData = { length: 3.35, width: 1.52 };
        } else if (type === 'BOULDER') {
            const rockGroup = new THREE.Group();
            const rock = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.90, 2),
                new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.72, flatShading: true })
            );
            rock.castShadow = true;
            const runeRing1 = new THREE.Mesh(
                new THREE.TorusGeometry(0.88, 0.055, 8, 28),
                new THREE.MeshBasicMaterial({ color: 0xffd700 })
            );
            const runeRing2 = runeRing1.clone();
            runeRing2.rotation.y = Math.PI / 2;
            const glow = this.createGlowSprite(0xfbbf24, 2.2, 0.45, false);
            rockGroup.add(rock, runeRing1, runeRing2, glow);
            rockGroup.position.y = 0.88;
            group.add(rockGroup);
            group.userData = { length: 1.88, width: 1.84, spinBall: rockGroup };
        } else if (type === 'TEMPLE_CHARIOT') {
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.55 });
            const goldMat = new MatClass({ color: 0xffd700, metalness: 0.92, roughness: 0.15, clearcoat: 0.8 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.86, 2.95), stoneMat);
            body.position.y = 0.66;
            body.castShadow = true;
            const ram = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.95, 12), goldMat);
            ram.rotation.x = Math.PI / 2;
            ram.position.set(0, 0.64, 1.78);
            const gem = this.createGlowSprite(0x00ffaa, 1.3, 0.75, true);
            gem.position.set(0, 1.15, 1.1);
            group.add(body, ram, gem);
            addDeluxeWheels(1.52, 2.5, 0.34);
            group.userData = { length: 3.45, width: 1.56 };
        } else if (type === 'HEARSE') {
            const darkMat = new MatClass({ color: 0x3b0764, roughness: 0.2, metalness: 0.4, clearcoat: 0.85 });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.56, 3.15), darkMat);
            base.position.y = 0.48;
            base.castShadow = true;
            const roof = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.74, 2.15), darkMat);
            roof.position.set(0, 1.06, -0.2);
            roof.castShadow = true;
            [-0.6, 0.6].forEach(lx => {
                const lantern = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.17, 1),
                    new THREE.MeshBasicMaterial({ color: 0xe879f9 })
                );
                lantern.position.set(lx, 0.94, 1.38);
                const lGlow = this.createGlowSprite(0xc084fc, 1.4, 0.75, false);
                lGlow.position.copy(lantern.position);
                group.add(lantern, lGlow);
            });
            group.add(base, roof);
            addDeluxeWheels(1.44, 2.8, 0.30);
            addLightBeams(1.1, 0.55, 1.58, -1.58, 0xd8b4fe);
            group.userData = { length: 3.25, width: 1.48 };
        } else if (type === 'GHOST') {
            const ghostMat = new MatClass({
                color: 0x67e8f9,
                emissive: 0x6b21a8,
                emissiveIntensity: 0.45,
                transparent: true,
                opacity: 0.84,
                clearcoat: 0.9,
                roughness: 0.15
            });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.64, 24, 18), ghostMat);
            head.position.y = 1.06;
            const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.98, 20, 1, true), ghostMat);
            skirt.position.y = 0.58;
            skirt.rotation.x = Math.PI;
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0066 });
            [-0.22, 0.22].forEach(ex => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat);
                eye.position.set(ex, 1.14, 0.55);
                group.add(eye);
            });
            const halo = this.createGlowSprite(0xc084fc, 1.8, 0.38, false);
            halo.position.y = 0.95;
            group.add(head, skirt, halo);
            group.userData = { length: 1.52, width: 1.44, isGhost: true, banished: false };
        } else if (type === 'LAVA_TRAIN') {
            const ironMat = new MatClass({ color: 0x27272a, metalness: 0.85, roughness: 0.22, clearcoat: 0.6 });
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xff6b00 });
            const hull = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.92, 4.25), ironMat);
            hull.position.y = 0.66;
            hull.castShadow = true;
            const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 2.65, 20), coreMat);
            boiler.rotation.x = Math.PI / 2;
            boiler.position.set(0, 1.08, 0.4);
            const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.68, 16), ironMat);
            stack.position.set(0, 1.60, 1.26);
            const furnaceGlow = this.createGlowSprite(0xff5500, 2.8, 0.55, false);
            furnaceGlow.position.set(0, 1.15, 0.4);
            group.add(hull, boiler, stack, furnaceGlow);
            addDeluxeWheels(1.58, 3.6, 0.31);
            addLightBeams(1.12, 0.76, 2.14, -2.14, 0xffaa44);
            group.userData = { length: 4.35, width: 1.62 };
        } else if (type === 'MAGMA_BEETLE') {
            const shellMat = new MatClass({
                color: 0x7f1d1d,
                emissive: 0xff3300,
                emissiveIntensity: 0.55,
                clearcoat: 0.9,
                roughness: 0.16
            });
            const domeGeo = new THREE.SphereGeometry(0.96, 24, 18);
            domeGeo.scale(0.86, 0.66, 1.36);
            const dome = new THREE.Mesh(domeGeo, shellMat);
            dome.position.y = 0.56;
            dome.castShadow = true;
            group.add(dome);
            addDeluxeWheels(1.42, 2.0, 0.25);
            addLightBeams(0.86, 0.56, 1.24, -1.24, 0xff8800);
            group.userData = { length: 2.55, width: 1.46 };
        } else if (type === 'HOVER_CAR') {
            const hullMat = new MatClass({
                color: 0x253861,
                emissive: 0x0d1b3e,
                emissiveIntensity: 0.5,
                metalness: 0.72,
                roughness: 0.14,
                clearcoat: 1.0
            });
            const neonColor = Math.random() > 0.5 ? 0x00f5ff : 0xff00aa;
            const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.44, 2.85), hullMat);
            body.position.y = 0.66;
            body.castShadow = true;
            const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 14), glassMat);
            canopy.scale.set(0.85, 0.52, 1.25);
            canopy.position.set(0, 0.96, -0.05);
            const strip = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.09, 2.92), neonMat);
            strip.position.y = 0.55;
            const underGlow = this.createGlowSprite(neonColor, 2.4, 0.52, false);
            underGlow.position.set(0, 0.35, 0);
            group.add(body, canopy, strip, underGlow);
            addLightBeams(1.12, 0.68, 1.44, -1.44, neonColor);
            group.userData = { length: 2.9, width: 1.5, isHover: true };
        } else if (type === 'CYBER_DRONE') {
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            const core = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.54, 1),
                new MatClass({ color: 0x38bdf8, emissive: 0x00f5ff, emissiveIntensity: 0.85, clearcoat: 1.0 })
            );
            core.position.y = 0.86;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.075, 12, 32), ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.86;
            const glow = this.createGlowSprite(0xff00aa, 2.1, 0.65, true);
            glow.position.y = 0.86;
            group.add(core, ring, glow);
            group.userData = { length: 1.8, width: 1.75, isHover: true, spinPart: ring };
        } else {
            // TOY_RACER 超跑清漆塗裝 + 白雙賽車線
            const palette = [0xff1e56, 0xffbe0b, 0x00bbf9, 0x9b5de5, 0x00f5d4];
            const carColor = palette[Math.floor(Math.random() * palette.length)];
            const bodyMat = new MatClass({
                color: carColor,
                roughness: 0.12,
                metalness: 0.38,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08
            });
            const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.46, 2.60), bodyMat);
            base.position.y = 0.42;
            base.castShadow = true;
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.47, 2.62), stripeMat);
            stripe.position.y = 0.42;
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.44, 1.28), glassMat);
            cabin.position.set(0, 0.82, -0.1);
            cabin.castShadow = true;
            const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.09, 0.32), bodyMat);
            spoiler.position.set(0, 0.78, -1.14);
            group.add(base, stripe, cabin, spoiler);
            addDeluxeWheels(1.38, 2.32, 0.25);
            addLightBeams(1.02, 0.46, 1.31, -1.31);
            group.userData = { length: 2.65, width: 1.42 };
        }

        return group;
    },

    // ==================== 4. 高細節水上/熔岩/全息浮台 ====================
    createPlatform(type = 'LOG', length = 3.8) {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        if (type === 'LILYPAD') {
            const radius = length;
            const padMat = new MatClass({ color: 0x16a34a, roughness: 0.32, clearcoat: 0.55 });
            const pad = new THREE.Mesh(
                new THREE.CylinderGeometry(radius, radius * 0.94, 0.15, 28, 1, false, 0.22, Math.PI * 1.86),
                padMat
            );
            pad.receiveShadow = true;
            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(radius * 0.96, 0.04, 8, 28, Math.PI * 1.82),
                new THREE.MeshBasicMaterial({ color: 0x86efac })
            );
            rim.rotation.x = Math.PI / 2;
            rim.rotation.z = 0.24;
            rim.position.y = 0.07;
            group.add(pad, rim);

            // 雙層盛開荷花 + 發光花蕊
            const flower = new THREE.Group();
            const petalMat = new MatClass({ color: 0xff66b2, emissive: 0x701a45, roughness: 0.22, clearcoat: 0.6 });
            for (let i = 0; i < 8; i++) {
                const p = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 8), petalMat);
                p.rotation.z = Math.PI / 3.2;
                p.rotation.y = (i * Math.PI * 2) / 8;
                flower.add(p);
            }
            const stamen = new THREE.Mesh(
                new THREE.SphereGeometry(0.11, 12, 10),
                new THREE.MeshBasicMaterial({ color: 0xffe047 })
            );
            stamen.position.y = 0.08;
            flower.add(stamen);
            flower.position.set(radius * 0.36, 0.16, -radius * 0.22);
            group.add(flower);

            group.userData = { halfSpan: radius * 1.06, platformType: 'LILYPAD' };
        } else if (type === 'DIVING_TURTLE') {
            const count = Math.max(2, Math.round(length / 1.45));
            const shellMats = [];
            const turtles = [];
            const spacing = 1.36;
            const startX = -((count - 1) * spacing) * 0.5;

            for (let i = 0; i < count; i++) {
                const tGroup = new THREE.Group();
                const sMat = new MatClass({
                    color: 0xf97316,
                    emissive: 0x000000,
                    roughness: 0.22,
                    clearcoat: 0.8
                });
                shellMats.push(sMat);
                const skinMat = new MatClass({ color: 0x4ade80, roughness: 0.35, clearcoat: 0.5 });

                const shellGeo = new THREE.SphereGeometry(0.56, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
                const shell = new THREE.Mesh(shellGeo, sMat);
                shell.scale.set(1.06, 0.74, 0.96);
                shell.castShadow = true;

                const rim = new THREE.Mesh(
                    new THREE.TorusGeometry(0.54, 0.05, 8, 20),
                    new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 })
                );
                rim.rotation.x = Math.PI / 2;
                rim.position.y = 0.05;

                const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), skinMat);
                head.position.set(0.64, 0.13, 0);

                tGroup.add(shell, rim, head);
                tGroup.position.x = startX + i * spacing;
                group.add(tGroup);
                turtles.push(tGroup);
            }
            group.userData = {
                halfSpan: (count * spacing) * 0.52,
                platformType: 'DIVING_TURTLE',
                shellMats,
                turtles
            };
        } else if (type === 'STONE_RAFT') {
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.65 });
            const goldMat = new MatClass({ color: 0xffd700, metalness: 0.88, roughness: 0.16, clearcoat: 0.8 });
            const gemMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
            const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.36, 1.56), stoneMat);
            slab.castShadow = true;
            slab.receiveShadow = true;
            const trim = new THREE.Mesh(new THREE.BoxGeometry(length * 0.92, 0.09, 1.28), goldMat);
            trim.position.y = 0.19;
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), gemMat);
            gem.position.y = 0.28;
            group.add(slab, trim, gem);
            group.userData = { halfSpan: length * 0.52, platformType: 'STONE_RAFT' };
        } else if (type === 'CROCODILE') {
            const crocMat = new MatClass({ color: 0x15803d, roughness: 0.38, clearcoat: 0.6 });
            const jawRedMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
            const bodyLen = length - 1.1;
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, 0.44, 1.20), crocMat);
            body.position.x = -0.45;
            body.castShadow = true;
            body.receiveShadow = true;

            const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.17, 0.98), crocMat);
            lowerJaw.position.set(bodyLen * 0.5 + 0.05, -0.05, 0);

            const upperJaw = new THREE.Group();
            upperJaw.position.set(bodyLen * 0.5 - 0.45, 0.12, 0);
            const snout = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.22, 0.98), crocMat);
            snout.position.set(0.55, 0.05, 0);
            const mouthIn = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.78), jawRedMat);
            mouthIn.rotation.x = Math.PI / 2;
            mouthIn.position.set(0.55, -0.06, 0);
            upperJaw.add(snout, mouthIn);

            [-0.33, 0.33].forEach(ez => {
                const eye = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 12, 12),
                    new THREE.MeshBasicMaterial({ color: 0xffe047 })
                );
                eye.position.set(bodyLen * 0.5 - 0.3, 0.32, ez);
                group.add(eye);
            });

            group.add(body, lowerJaw, upperJaw);
            group.userData = { halfSpan: length * 0.5, platformType: 'CROCODILE', upperJaw };
        } else if (type === 'COFFIN_RAFT') {
            const woodMat = new MatClass({ color: 0x4c1d95, roughness: 0.45, clearcoat: 0.4 });
            const raft = new THREE.Mesh(new THREE.BoxGeometry(length, 0.32, 1.48), woodMat);
            raft.castShadow = true;
            raft.receiveShadow = true;
            const post = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.20, 1),
                new THREE.MeshBasicMaterial({ color: 0xe879f9 })
            );
            post.position.set(length * 0.42, 0.46, -0.48);
            const glow = this.createGlowSprite(0xc084fc, 1.4, 0.75, false);
            glow.position.copy(post.position);
            group.add(raft, post, glow);
            group.userData = { halfSpan: length * 0.52, platformType: 'COFFIN_RAFT' };
        } else if (type === 'BASALT_SLAB') {
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x272020, roughness: 0.75 });
            const crackMat = new THREE.MeshStandardMaterial({
                color: 0xff6b00,
                emissive: 0xff4500,
                emissiveIntensity: 0.55,
                roughness: 0.2
            });
            const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.38, 1.58), rockMat);
            slab.castShadow = true;
            slab.receiveShadow = true;
            const seam = new THREE.Mesh(new THREE.BoxGeometry(length * 0.88, 0.40, 0.24), crackMat);
            const seam2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.40, 1.36), crackMat);
            group.add(slab, seam, seam2);
            group.userData = { halfSpan: length * 0.52, platformType: 'BASALT_SLAB', crackMat };
        } else if (type === 'HOLO_PAD') {
            const frameMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
            const accentMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
            const coreMat = new MatClass({
                color: 0x0284c7,
                emissive: 0x00bbf9,
                emissiveIntensity: 0.68,
                transparent: true,
                opacity: 0.85,
                clearcoat: 1.0
            });
            const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.24, 1.56), coreMat);
            const rim = new THREE.Mesh(new THREE.BoxGeometry(length + 0.10, 0.08, 1.64), frameMat);
            rim.position.y = 0.09;
            const centerLine = new THREE.Mesh(new THREE.BoxGeometry(length * 0.75, 0.26, 0.16), accentMat);
            group.add(deck, rim, centerLine);
            group.userData = { halfSpan: length * 0.52, platformType: 'HOLO_PAD' };
        } else {
            // 精雕苔蘚蘑菇圓木
            const barkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.72 });
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 });
            const mossMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });

            const logGeo = new THREE.CylinderGeometry(0.58, 0.58, length, 24);
            logGeo.rotateZ(Math.PI / 2);
            const logMesh = new THREE.Mesh(logGeo, barkMat);
            logMesh.castShadow = true;
            logMesh.receiveShadow = true;
            group.add(logMesh);

            [-1, 1].forEach(side => {
                const cap = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), coreMat);
                cap.position.x = side * (length * 0.502);
                cap.rotation.y = side * (Math.PI / 2);
                group.add(cap);
            });

            const moss = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), mossMat);
            moss.scale.set(2.2, 0.25, 0.9);
            moss.position.set(0.2, 0.55, 0.08);
            // 發光小蘑菇點綴
            const shroom = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
                new THREE.MeshBasicMaterial({ color: 0xff66aa })
            );
            shroom.position.set(-length * 0.28, 0.60, -0.15);
            group.add(moss, shroom);

            group.userData = { halfSpan: length * 0.52, platformType: 'LOG' };
        }

        return group;
    },

    // ==================== 5. 定點陷阱與星芒水晶機關 ====================
    createHazardProp(type = 'PIRANHA_PLANT') {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        if (type === 'PIRANHA_PLANT') {
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.58, 0.44, 0.48, 18),
                new MatClass({ color: 0x16a34a, roughness: 0.35, clearcoat: 0.6 })
            );
            pot.position.y = 0.24;
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.58, 12),
                new THREE.MeshStandardMaterial({ color: 0x22c55e })
            );
            stem.position.y = 0.60;

            const head = new THREE.Group();
            head.position.y = 0.98;
            const headMat = new MatClass({
                color: 0xff1744,
                emissive: 0x66001a,
                roughness: 0.2,
                clearcoat: 0.8
            });
            const jawL = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 14, 0, Math.PI), headMat);
            const jawR = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 14, Math.PI, Math.PI), headMat);
            head.add(jawL, jawR);
            group.add(pot, stem, head);
            group.userData = { head, jawL, jawR };
        } else if (type === 'LAVA_GEYSER') {
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.58, 0.82, 0.30, 16),
                new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.85 })
            );
            rim.position.y = 0.15;
            const corePool = new THREE.Mesh(
                new THREE.CircleGeometry(0.48, 18),
                new THREE.MeshBasicMaterial({ color: 0xff7b00 })
            );
            corePool.rotation.x = -Math.PI / 2;
            corePool.position.y = 0.31;

            const plumeGeo = new THREE.CylinderGeometry(0.32, 0.58, 3.5, 18);
            plumeGeo.translate(0, 1.75, 0);
            const plumeMat = new THREE.MeshBasicMaterial({
                color: 0xff8800,
                transparent: true,
                opacity: 0.92
            });
            const plume = new THREE.Mesh(plumeGeo, plumeMat);
            plume.scale.set(1, 0.01, 1);
            const glow = this.createGlowSprite(0xff5500, 2.2, 0.55, false);
            glow.position.y = 0.45;
            group.add(rim, corePool, plume, glow);
            group.userData = { plume, corePool };
        } else if (type === 'SWITCH_ORB') {
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.58, 0.72, 0.26, 18),
                new MatClass({ color: 0x334155, metalness: 0.75, roughness: 0.22 })
            );
            base.position.y = 0.13;
            const orbMat = new MatClass({
                color: 0x00f5ff,
                emissive: 0x00f5ff,
                emissiveIntensity: 0.95,
                clearcoat: 1.0,
                roughness: 0.05
            });
            const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.40, 1), orbMat);
            orb.position.y = 0.86;
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.56, 0.048, 10, 28),
                new THREE.MeshBasicMaterial({ color: 0xffe047 })
            );
            ring.position.y = 0.86;
            const halo = this.createGlowSprite(0x00f5ff, 2.2, 0.75, true);
            halo.position.y = 0.86;
            group.add(base, orb, ring, halo);
            group.userData = { orb, ring, orbMat, halo, activated: false };
        }

        return group;
    },

    // ==================== 6. 華麗繽紛兩岸微縮造景 ====================
    createBankCluster(worldId = 1, side = 1) {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        if (worldId === 1) {
            // 浪漫櫻花樹 / 翠綠雲朵樹 + 七彩花圃 + 精靈路燈
            const isSakura = Math.random() < 0.45;
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.20, 0.28, 1.05, 12),
                new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
            );
            trunk.position.y = 0.52;
            const leafColor = isSakura ? 0xff85b3 : 0x22c55e;
            const leafMat = new MatClass({
                color: leafColor,
                emissive: isSakura ? 0x4a0e2e : 0x052e16,
                emissiveIntensity: 0.25,
                roughness: 0.4,
                clearcoat: 0.3
            });
            [[0, 1.45, 0, 0.85], [-0.42, 1.25, 0.28, 0.62], [0.42, 1.32, -0.22, 0.65], [0, 1.98, 0, 0.64]].forEach(([x, y, z, r]) => {
                const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), leafMat);
                puff.position.set(x, y, z);
                puff.castShadow = true;
                group.add(puff);
            });
            // 發光小精靈燈球
            const fairy = this.createGlowSprite(isSakura ? 0xff99cc : 0xffe066, 1.25, 0.65, true);
            fairy.position.set(-side * 0.65, 0.75, 0.4);
            group.add(trunk, fairy);
        } else if (worldId === 2) {
            // 黃金圖騰石柱 + 熊熊聖火光暈 + 翡翠晶簇
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.44, 0.52, 2.35, 14),
                new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.75 })
            );
            pillar.position.y = 1.18;
            pillar.castShadow = true;
            const cap = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.22, 1.1),
                new MatClass({ color: 0xffd700, metalness: 0.85, roughness: 0.2 })
            );
            cap.position.y = 2.36;
            const flame = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.36, 1),
                new THREE.MeshBasicMaterial({ color: 0xffaa00 })
            );
            flame.position.y = 2.75;
            const fGlow = this.createGlowSprite(0xff8800, 2.2, 0.78, false);
            fGlow.position.y = 2.75;
            group.add(pillar, cap, flame, fGlow);
        } else if (worldId === 3) {
            // 哥德雕花方尖碑 + 發光南瓜燈 + 懸浮藍紫幽魂燈籠
            const obelisk = new THREE.Mesh(
                new THREE.ConeGeometry(0.45, 2.2, 4),
                new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 })
            );
            obelisk.position.y = 1.1;
            obelisk.rotation.y = Math.PI / 4;
            const pumpkin = new THREE.Mesh(
                new THREE.SphereGeometry(0.38, 16, 12),
                new MatClass({ color: 0xff6b00, emissive: 0xff5500, emissiveIntensity: 0.75, clearcoat: 0.5 })
            );
            pumpkin.scale.y = 0.82;
            pumpkin.position.set(-side * 0.58, 0.30, 0.38);
            const soulGlow = this.createGlowSprite(0xc084fc, 1.8, 0.72, true);
            soulGlow.position.set(0, 2.3, 0);
            group.add(obelisk, pumpkin, soulGlow);
        } else if (worldId === 4) {
            // 璀璨紅寶石與琥珀熔岩晶簇 + 光暈
            const crystalMat = new MatClass({
                color: 0xff2a00,
                emissive: 0xff5500,
                emissiveIntensity: 0.85,
                clearcoat: 1.0,
                roughness: 0.1
            });
            const spire1 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 2.35, 7), crystalMat);
            spire1.position.y = 1.18;
            spire1.rotation.z = side * 0.15;
            const spire2 = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.55, 7), crystalMat);
            spire2.position.set(-side * 0.48, 0.75, 0.32);
            spire2.rotation.z = -side * 0.24;
            const glow = this.createGlowSprite(0xff6b00, 2.4, 0.65, false);
            glow.position.y = 1.25;
            group.add(spire1, spire2, glow);
        } else {
            // 賽博全息霓虹摩天巨塔 + 多彩霓虹環
            const towerMat = new MatClass({
                color: 0x1e293b,
                emissive: 0x0f172a,
                emissiveIntensity: 0.5,
                metalness: 0.7,
                roughness: 0.18,
                clearcoat: 0.9
            });
            const neonColor = side > 0 ? 0x00f5ff : 0xff00aa;
            const tower = new THREE.Mesh(new THREE.BoxGeometry(1.18, 3.8, 1.18), towerMat);
            tower.position.y = 1.9;
            [1.1, 2.1, 3.1].forEach((hy, idx) => {
                const c = idx === 1 ? 0xffe047 : neonColor;
                const strip = new THREE.Mesh(
                    new THREE.BoxGeometry(1.26, 0.14, 1.26),
                    new THREE.MeshBasicMaterial({ color: c })
                );
                strip.position.y = hy;
                group.add(strip);
            });
            const holoHalo = this.createGlowSprite(neonColor, 2.4, 0.55, false);
            holoHalo.position.y = 3.2;
            group.add(tower, holoHalo);
        }

        return group;
    },

    // ==================== 7. 水下錦鯉、璀璨金幣、螢火蟲、多環星象儀傳送門 ====================
    createKoiFish() {
        const group = new THREE.Group();
        const isGold = Math.random() > 0.45;
        const fishColor = isGold ? 0xff9f1c : 0xff4d6d;
        const mat = new THREE.MeshBasicMaterial({ color: fishColor, transparent: true, opacity: 0.85 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), mat);
        body.scale.set(2.2, 0.5, 0.85);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
        tail.rotation.z = Math.PI / 2;
        tail.position.x = -0.38;
        group.add(body, tail);
        return group;
    },

    createCoin() {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
        const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.10, 24);
        coinGeo.rotateX(Math.PI / 2);
        const coinMat = new MatClass({
            color: 0xffd700,
            emissive: 0xaa6600,
            emissiveIntensity: 0.5,
            metalness: 0.92,
            roughness: 0.10,
            clearcoat: 1.0
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.castShadow = true;

        const star = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            new THREE.MeshBasicMaterial({ color: 0xfffbeb })
        );
        const halo = this.createGlowSprite(0xffdf40, 1.35, 0.72, true);
        group.add(coin, star, halo);
        group.userData = { isCoin: true, collected: false, spinMesh: coin, star };
        return group;
    },

    createFly() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0x1e293b })
        );
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xbef264 })
        );
        glow.position.z = -0.08;

        const wingGeo = new THREE.PlaneGeometry(0.24, 0.17);
        const wingMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const lWing = new THREE.Mesh(wingGeo, wingMat);
        lWing.position.set(-0.15, 0.10, 0);
        const rWing = new THREE.Mesh(wingGeo, wingMat);
        rWing.position.set(0.15, 0.10, 0);

        const halo = this.createGlowSprite(0xa3e635, 1.45, 0.85, true);
        group.add(body, glow, lWing, rWing, halo);
        group.userData = { lWing, rWing, isFly: true, collected: false };
        return group;
    },

    createCompassArrow() {
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.95
        });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.60, 14), mat);
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 0.38, -1.42);
        const glow = this.createGlowSprite(0x00ffaa, 1.0, 0.8, true);
        glow.position.copy(cone.position);
        group.add(cone, glow);
        group.visible = false;
        return group;
    },

    createGoalPortal(worldId = 1) {
        const group = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
        const primary = worldId === 5 ? 0xff00aa : 0x00f5ff;
        const secondary = 0xffd700;

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.75, 0.10, 14, 48),
            new THREE.MeshBasicMaterial({ color: primary })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.32;

        const innerRing = new THREE.Mesh(
            new THREE.TorusGeometry(1.28, 0.07, 12, 36),
            new THREE.MeshBasicMaterial({ color: secondary })
        );
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.38;
        group.add(ring, innerRing);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.50, 1.70, 0.28, 28),
            new MatClass({ color: 0xfbbf24, metalness: 0.85, roughness: 0.18, clearcoat: 0.9 })
        );
        base.position.y = 0.13;
        base.receiveShadow = true;
        group.add(base);

        // 四方懸浮水晶柱
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const crystal = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.24, 1),
                new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? primary : secondary })
            );
            crystal.position.set(Math.cos(a) * 1.9, 0.95, Math.sin(a) * 1.9);
            group.add(crystal);
        }

        const halo = this.createGlowSprite(primary, 4.2, 0.65, false);
        halo.position.y = 0.55;
        group.add(halo);

        const beamGeo = new THREE.CylinderGeometry(1.05, 1.35, 12, 28, 1, true);
        beamGeo.translate(0, 6.0, 0);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.visible = false;
        group.add(beam);

        group.userData = { ring, innerRing, beam };
        return group;
    },

    // ==================== 8. 超華麗終極頭目：機械巨鱷皇 Mecha-Swampy Rex ====================
    createMechaBoss() {
        const boss = new THREE.Group();
        const MatClass = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;

        const armorMat = new MatClass({
            color: 0x3b4d82,
            emissive: 0x172554,
            emissiveIntensity: 0.6,
            metalness: 0.68,
            roughness: 0.16,
            clearcoat: 1.0
        });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
        const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
        const goldMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

        // 裝甲主軀幹 + 電漿裝甲線
        const torso = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.75, 3.7), armorMat);
        torso.position.y = 1.18;
        torso.castShadow = true;
        const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(3.62, 0.22, 3.78), cyanMat);
        chestPlate.position.y = 1.18;
        boss.add(torso, chestPlate);

        // 背部水晶能量背鰭
        for (let i = 0; i < 4; i++) {
            const fin = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.05, 8), i % 2 === 0 ? neonMat : goldMat);
            fin.position.set(0, 2.45, -1.3 + i * 0.85);
            boss.add(fin);
        }

        // 雙肩重型電漿渦輪砲
        [-2.05, 2.05].forEach(px => {
            const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 1.75, 20), armorMat);
            pod.rotation.x = Math.PI / 2;
            pod.position.set(px, 1.80, 0.25);
            const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 12, 24), cyanMat);
            muzzle.position.set(px, 1.80, 1.14);
            const podGlow = this.createGlowSprite(0x00f5ff, 1.6, 0.75, false);
            podGlow.position.set(px, 1.80, 1.22);
            boss.add(pod, muzzle, podGlow);
        });

        // 巨顎機構
        const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.45, 2.28), armorMat);
        lowerJaw.position.set(0, 0.56, 2.38);
        boss.add(lowerJaw);

        const upperJawPivot = new THREE.Group();
        upperJawPivot.position.set(0, 1.18, 1.48);

        const upperSnout = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.68, 2.32), armorMat);
        upperSnout.position.set(0, 0.26, 0.96);
        upperSnout.castShadow = true;
        const snoutRim = new THREE.Mesh(new THREE.BoxGeometry(2.80, 0.12, 2.38), neonMat);
        snoutRim.position.set(0, 0.58, 0.96);
        upperJawPivot.add(upperSnout, snoutRim);

        // 猩紅雷射電子眼 + 光暈
        [-0.84, 0.84].forEach(ex => {
            const eye = new THREE.Mesh(
                new THREE.BoxGeometry(0.52, 0.26, 0.22),
                new THREE.MeshBasicMaterial({ color: 0xff1144 })
            );
            eye.position.set(ex, 0.72, 0.66);
            const eGlow = this.createGlowSprite(0xff0055, 1.3, 0.8, false);
            eGlow.position.set(ex, 0.72, 0.82);
            upperJawPivot.add(eye, eGlow);
        });

        [-0.98, -0.36, 0.36, 0.98].forEach(tx => {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 10), cyanMat);
            fang.rotation.x = Math.PI;
            fang.position.set(tx, -0.15, 1.88);
            upperJawPivot.add(fang);
        });
        boss.add(upperJawPivot);

        // 超載能量核心 + 雙重璀璨星芒光暈
        const coreGroup = new THREE.Group();
        coreGroup.position.set(0, 1.08, 2.28);
        const coreMat = new MatClass({
            color: 0xffffff,
            emissive: 0xff00aa,
            emissiveIntensity: 1.5,
            roughness: 0.05
        });
        const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 2), coreMat);
        const coreHalo = this.createGlowSprite(0xffea00, 3.2, 0.95, true);
        coreGroup.add(coreCrystal, coreHalo);
        coreGroup.visible = false;
        boss.add(coreGroup);

        // 雙重旋轉能量護盾陣
        const shieldRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.75, 0.09, 12, 48),
            new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.68 })
        );
        shieldRing.rotation.x = Math.PI / 2;
        shieldRing.position.y = 0.26;
        boss.add(shieldRing);

        boss.userData = {
            upperJawPivot,
            coreMesh: coreGroup,
            coreMat,
            shieldRing,
            torso
        };

        return boss;
    },

    createBossOrb(deflected = false) {
        const color = deflected ? 0x00ffaa : 0xff007f;
        const group = new THREE.Group();
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 18, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.46, 18, 16),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.78 })
        );
        const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.58, 0.055, 8, 24),
            new THREE.MeshBasicMaterial({ color })
        );
        const glow = this.createGlowSprite(color, 2.2, 0.85, true);
        group.add(core, shell, halo, glow);
        group.userData = { halo, core, shell, glow };
        return group;
    }
};

window.Models3D = Models3D;
