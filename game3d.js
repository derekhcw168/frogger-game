/**
 * Frogger 3D Odyssey DX - 4K 超解析度華麗光暈核心引擎 (Frogger3DGame Ultra v3)
 * 視覺特效升級：
 * 1. 超高解析度渲染管線：支援最高 2.5x 超採樣 HiDPI + WebGL2 4x MSAA 多重採樣抗鋸齒 EffectComposer
 * 2. ACESFilmic 電影級色調映射 + 4096x4096 超清軟陰影 + PMREM 程序化彩色工作室 PBR 環境反射 (IBL)
 * 3. 自訂 GLSL 動態流體著色器（陽光焦散波紋溪流 + 水底錦鯉、極光毒霧河、白熾脈動岩漿、賽博霓虹光柵河）
 * 4. 多層次 Additive 星芒光暈粒子、七彩極光大跳軌跡、即時動態點光源互動與三階段華麗 Boss 決戰
 */

class Frogger3DGame {
    constructor() {
        this.container = document.getElementById('gameContainer');
        this.fxLayer = document.getElementById('fxLayer');
        this.toastContainer = document.getElementById('toastContainer');

        // 5 大繽紛主題世界配置
        this.WORLDS = [
            {
                id: 1,
                name: '世界 1：櫻花溪谷',
                subtitle: 'Sakura Garden & Crystal Brook',
                desc: '漫天櫻花與精靈微光！閃避清漆跑車與割草車，踏過錦鯉悠游的焦散波光溪流與潛水烏龜！',
                skyColor: 0x1d8cf8,
                fogColor: 0x38bdf8,
                fogDensity: 0.012,
                bloomStrength: 0.36,
                envColors: [0x38bdf8, 0xff85b3, 0xffe066, 0x4ade80],
                waterType: 'WATER',
                streamMode: 0,
                weatherColors: [0xff99cc, 0xffe066, 0xffffff],
                weatherMode: 'PETAL',
                trafficSpeed: 0.95,
                rows: 20
            },
            {
                id: 2,
                name: '世界 2：黃金神廟',
                subtitle: 'Golden Temple & Mystic Falls',
                desc: '聖火輝映古老遺跡！閃避發光符文滾石與張嘴巨鱷，利用長舌啟動星芒水晶緩速全場！',
                skyColor: 0x064e3b,
                fogColor: 0x065f46,
                fogDensity: 0.015,
                bloomStrength: 0.42,
                envColors: [0x10b981, 0xffd700, 0x00f5d4, 0xf59e0b],
                waterType: 'WATER',
                streamMode: 1,
                weatherColors: [0xa3e635, 0xffd700, 0x2dd4bf],
                weatherMode: 'SPORE',
                trafficSpeed: 1.12,
                rows: 22
            },
            {
                id: 3,
                name: '世界 3：星雲古堡',
                subtitle: 'Nebula Haunted Manor',
                desc: '紫晶極光與幽魂燈籠交織！按 [Q] 超能蛙鳴釋放彩虹音爆，震散遊蕩幽靈並點亮迷霧！',
                skyColor: 0x160736,
                fogColor: 0x280d59,
                fogDensity: 0.024,
                bloomStrength: 0.48,
                envColors: [0xc084fc, 0x38bdf8, 0xf472b6, 0x818cf8],
                waterType: 'POISON',
                streamMode: 2,
                weatherColors: [0xe879f9, 0x67e8f9, 0xc084fc],
                weatherMode: 'WISP',
                trafficSpeed: 1.22,
                rows: 24
            },
            {
                id: 4,
                name: '世界 4：紅蓮火海',
                subtitle: 'Crimson Obsidian Lava Caverns',
                desc: '白熾岩漿奔流不息！小心踩踏後閃耀裂紋下沉的玄武岩，飛越爆發的紅蓮熔岩噴泉！',
                skyColor: 0x2b060a,
                fogColor: 0x4c0810,
                fogDensity: 0.016,
                bloomStrength: 0.46,
                envColors: [0xff4500, 0xffbe0b, 0xff0055, 0xfb923c],
                waterType: 'LAVA',
                streamMode: 3,
                weatherColors: [0xffea00, 0xff6b00, 0xff1744],
                weatherMode: 'EMBER',
                trafficSpeed: 1.32,
                rows: 26
            },
            {
                id: 5,
                name: '世界 5：霓虹科技塔',
                subtitle: 'Cyberpunk Prismatic Tower & Final Boss',
                desc: '穿梭全息摩天樓與霓虹加速光帶，救齊 5 隻小萌蛙登上星穹頂端，決戰「機械巨鱷皇」！',
                skyColor: 0x04081c,
                fogColor: 0x0a1336,
                fogDensity: 0.014,
                bloomStrength: 0.52,
                envColors: [0x00f5ff, 0xff00aa, 0xffe047, 0x7c3aed],
                waterType: 'CYBER',
                streamMode: 4,
                weatherColors: [0x00f5ff, 0xff00aa, 0xffe047],
                weatherMode: 'RAIN',
                trafficSpeed: 1.42,
                rows: 28
            }
        ];

        this.TALENT_DEFS = [
            {
                id: 'cooldown',
                name: '⚡ 靈巧氣囊',
                desc: '縮短三大超能力冷卻時間（每級 -12%）',
                maxLv: 5,
                baseCost: 25
            },
            {
                id: 'tongue',
                name: '👅 彈力神舌',
                desc: '延長長舌抓捕與隔空救蛙距離（每級 +0.9 格）',
                maxLv: 5,
                baseCost: 25
            },
            {
                id: 'vitality',
                name: '💖 生命護符',
                desc: '提升開局初始生命與上限（最高 6 顆心）',
                maxLv: 3,
                baseCost: 40
            }
        ];

        this.ACHIEVEMENT_DEFS = [
            { id: 'first_rescue', icon: '🐣', name: '初試啼聲', desc: '成功救起第 1 隻迷失小萌蛙', reward: 15 },
            { id: 'tongue_sniper', icon: '👅', name: '隔空神舌', desc: '使用長舌隔空拉回遠處的小萌蛙', reward: 25 },
            { id: 'world_clear_1', icon: '🌸', name: '花園守護者', desc: '完成「世界 1：櫻花翡翠溪谷」', reward: 20 },
            { id: 'ghost_buster', icon: '👻', name: '幽靈剋星', desc: '使用超能蛙鳴震散古堡中的遊蕩幽靈', reward: 30 },
            { id: 'combo_master', icon: '🔥', name: '極限節奏王', desc: '達成 8 連擊以上的高速推進節奏', reward: 30 },
            { id: 'flawless_star', icon: '🌟', name: '無傷傳奇', desc: '以零傷亡完美表現通過任一世界', reward: 40 },
            { id: 'fashion_frog', icon: '👑', name: '造型收藏家', desc: '在造型工坊解鎖任一款新青蛙外觀', reward: 25 },
            { id: 'boss_slayer', icon: '🐲', name: '機械屠鱷勇士', desc: '擊敗最終頭目「機械巨鱷皇」通關全境', reward: 100 }
        ];

        this.loadSaveData();

        this.GRID = 2.0;
        this.currentWorldIndex = 0;
        this.currentWorld = this.WORLDS[0];
        this.state = 'TITLE';

        // 單局統計
        this.score = 0;
        this.lives = this.getMaxLives();
        this.rescuedCount = 0;
        this.stageCoins = 0;
        this.deathsThisStage = 0;
        this.highestRowReached = 0;
        this.checkpointRow = 0;
        this.invulnTimer = 0;
        this.hazardSlowTimer = 0;
        this.fogClearTimer = 0;

        this.combo = 0;
        this.comboTimer = 0;

        // 三段式畫質檔位：'ULTRA' (預設超採樣4K華麗光暈) | 'HIGH' | 'PERF'
        this.qualityLevel = localStorage.getItem('frogger3d_quality_v3') || 'ULTRA';
        this.cameraMode = localStorage.getItem('frogger3d_camera') || 'ISOMETRIC';
        this.screenShake = 0;

        this.cooldowns = { superHop: 0, tongue: 0, croak: 0 };
        this.maxCooldowns = { superHop: 2.2, tongue: 0.9, croak: 3.0 };

        // 場景物件管理
        this.worldDisposables = [];
        this.gridMap = {};
        this.vehicles = [];
        this.platforms = [];
        this.koiList = [];
        this.hazards = [];
        this.switches = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.ripples = [];
        this.particles = [];
        this.weatherSprites = null;
        this.streamMaterial = null;
        this.envRT = null;
        this.deathTimer = null;

        this.frog = null;
        this.frogLight = null;
        this.frogLightIntensity = 0.8;
        this.compassArrow = null;
        this.compassTimer = 0;
        this.frogPos = { col: 0, row: 0 };
        this.facingDir = { dCol: 0, dRow: 1 };
        this.bufferedMove = null;
        this.rainbowTrailTick = 0;

        this.jumpAnim = {
            active: false,
            type: 'NORMAL',
            startTime: 0,
            duration: 150,
            startX: 0,
            startZ: 0,
            targetX: 0,
            targetZ: 0,
            peakY: 1.15
        };

        this.tongueAnim = {
            active: false,
            startTime: 0,
            duration: 240,
            reach: 5.8
        };

        this.boss = null;

        this.initThree();
        this.buildWorld(this.currentWorld);
        this.bindControls();
        this.bindUIModals();
        this.updateHUD();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.animate(t));
    }

    // ==================== 存檔與讀取 ====================
    loadSaveData() {
        this.highScore = parseInt(localStorage.getItem('frogger3d_highscore')) || 5000;
        this.coins = parseInt(localStorage.getItem('frogger3d_coins'));
        if (Number.isNaN(this.coins)) this.coins = 20;

        try {
            this.unlockedSkins = JSON.parse(localStorage.getItem('frogger3d_skins')) || ['classic'];
        } catch (e) {
            this.unlockedSkins = ['classic'];
        }
        this.equippedSkin = localStorage.getItem('frogger3d_equipped_skin') || 'classic';

        try {
            this.talents = JSON.parse(localStorage.getItem('frogger3d_talents')) || {
                cooldown: 0,
                tongue: 0,
                vitality: 0
            };
        } catch (e) {
            this.talents = { cooldown: 0, tongue: 0, vitality: 0 };
        }

        try {
            this.worldStars = JSON.parse(localStorage.getItem('frogger3d_stars')) || {};
        } catch (e) {
            this.worldStars = {};
        }

        try {
            this.achievements = JSON.parse(localStorage.getItem('frogger3d_achievements')) || {};
        } catch (e) {
            this.achievements = {};
        }
    }

    saveData() {
        localStorage.setItem('frogger3d_highscore', String(this.highScore));
        localStorage.setItem('frogger3d_coins', String(this.coins));
        localStorage.setItem('frogger3d_skins', JSON.stringify(this.unlockedSkins));
        localStorage.setItem('frogger3d_equipped_skin', this.equippedSkin);
        localStorage.setItem('frogger3d_talents', JSON.stringify(this.talents));
        localStorage.setItem('frogger3d_stars', JSON.stringify(this.worldStars));
        localStorage.setItem('frogger3d_achievements', JSON.stringify(this.achievements));
    }

    getMaxLives() {
        return 3 + (this.talents.vitality || 0);
    }

    getCooldownFactor() {
        return Math.max(0.4, 1 - (this.talents.cooldown || 0) * 0.12);
    }

    getTongueRange() {
        return 5.8 + (this.talents.tongue || 0) * 1.8;
    }

    getTotalStars() {
        return Object.values(this.worldStars).reduce((sum, s) => sum + (s || 0), 0);
    }

    getEffectiveDPR() {
        const native = window.devicePixelRatio || 1;
        if (this.qualityLevel === 'ULTRA') {
            // 即使在 1x 桌機螢幕也強制啟用 2.0x 超採樣 (4K 級銳利邊緣！)，高分屏最高達 2.5x
            return Math.min(Math.max(native, 2.0), 2.5);
        } else if (this.qualityLevel === 'HIGH') {
            return Math.min(Math.max(native, 1.35), 2.0);
        }
        return Math.min(native, 1.25);
    }

    // ==================== 1. 初始化 4K 超解析度渲染管線、IBL 環境光與多重採樣 Bloom ====================
    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentWorld.skyColor);
        this.scene.fog = new THREE.FogExp2(this.currentWorld.fogColor, this.currentWorld.fogDensity);

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 200);
        this.camera.position.set(0, 15, 14);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.96;
        this.renderer.shadowMap.enabled = this.qualityLevel !== 'PERF';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 精準平衡多彩光影（飽和濃郁不泛白）+ 4096x4096 超清軟陰影主光源
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x271f4a, 0.58);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.86);
        this.dirLight.position.set(14, 28, 18);
        this.dirLight.castShadow = true;
        const shadowRes = this.qualityLevel === 'ULTRA' ? 4096 : 2048;
        this.dirLight.shadow.mapSize.set(shadowRes, shadowRes);
        const d = 18;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.dirLight.shadow.camera.near = 2;
        this.dirLight.shadow.camera.far = 75;
        this.dirLight.shadow.bias = -0.00035;
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);

        // 側向戲劇化冷暖輪廓補光 (Rim Light)
        this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.26);
        this.rimLight.position.set(-18, 12, -12);
        this.scene.add(this.rimLight);

        // 主角隨身柔和魔法點光源（不使角色本體過曝）
        this.frogLight = new THREE.PointLight(0x00ffaa, 0.35, 8);
        this.scene.add(this.frogLight);

        // PMREM 程序化環境反射光生成器（讓清漆與金屬材質反射絢麗天空與霓虹！）
        this.pmremGenerator = THREE.PMREMGenerator ? new THREE.PMREMGenerator(this.renderer) : null;
        if (this.pmremGenerator && this.pmremGenerator.compileEquirectangularShader) {
            this.pmremGenerator.compileEquirectangularShader();
        }

        // 建立超解析度多重採樣抗鋸齒 EffectComposer + UnrealBloomPass
        this.applyResolutionAndComposer();

        // 主角與 3D 指南光箭
        this.rebuildFrogModel();
        this.compassArrow = Models3D.createCompassArrow();
        this.scene.add(this.compassArrow);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.applyResolutionAndComposer();
        });
    }

    applyResolutionAndComposer() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = this.getEffectiveDPR();

        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = this.qualityLevel !== 'PERF';

        if (this.composer) {
            if (this.composer.renderTarget1) this.composer.renderTarget1.dispose();
            if (this.composer.renderTarget2) this.composer.renderTarget2.dispose();
            this.composer = null;
        }

        if (this.qualityLevel === 'PERF') return;

        if (window.THREE && THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            try {
                const rtW = Math.floor(w * dpr);
                const rtH = Math.floor(h * dpr);
                let renderTarget = null;

                // WebGL2 原生 4x MSAA 多重採樣抗鋸齒 RenderTarget（徹底消除後製鋸齒與模糊！）
                if (this.renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget) {
                    renderTarget = new THREE.WebGLMultisampleRenderTarget(rtW, rtH, {
                        format: THREE.RGBAFormat,
                        stencilBuffer: false
                    });
                    renderTarget.samples = this.qualityLevel === 'ULTRA' ? 4 : 2;
                } else {
                    renderTarget = new THREE.WebGLRenderTarget(rtW, rtH, {
                        minFilter: THREE.LinearFilter,
                        magFilter: THREE.LinearFilter,
                        format: THREE.RGBAFormat,
                        stencilBuffer: false
                    });
                }

                this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
                this.composer.setPixelRatio(dpr);
                this.composer.setSize(w, h);

                const renderPass = new THREE.RenderPass(this.scene, this.camera);
                const strength = this.currentWorld ? this.currentWorld.bloomStrength : 0.44;
                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(rtW, rtH),
                    strength,
                    0.66, // 絲滑夢幻光暈擴散半徑
                    0.86  // 精準高光閾值：天空與草地保持清透鮮豔，僅星芒、霓虹、車燈與岩漿脈綻放光暈！
                );
                this.composer.addPass(renderPass);
                this.composer.addPass(this.bloomPass);
            } catch (err) {
                this.composer = null;
            }
        }
    }

    updateWorldEnvironment(world) {
        if (!this.pmremGenerator) return;
        if (this.envRT) {
            this.envRT.dispose();
            this.envRT = null;
        }

        // 採用暗房彩色柔光球攝影棚（避免漫反射洗白草地，僅在清漆與黃金裝甲上產生璀璨鏡面反射！）
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color(0x080c18);

        const positions = [
            [15, 18, 12],
            [-16, 15, 10],
            [0, 22, -16],
            [12, -10, -12]
        ];
        (world.envColors || [0x38bdf8, 0xff85b3, 0xffd700, 0x4ade80]).forEach((col, i) => {
            const lamp = new THREE.Mesh(
                new THREE.SphereGeometry(3.2, 12, 12),
                new THREE.MeshBasicMaterial({ color: col })
            );
            lamp.position.set(...positions[i % positions.length]);
            envScene.add(lamp);
        });

        this.envRT = this.pmremGenerator.fromScene(envScene, 0.04);
        this.scene.environment = this.envRT.texture;
    }

    // 自訂 GLSL 高解析度動態波光 / 極光毒霧 / 白熾熔岩 / 賽博光柵著色器！
    createStreamMaterial(world) {
        return new THREE.ShaderMaterial({
            transparent: world.waterType !== 'LAVA',
            uniforms: {
                uTime: { value: 0 },
                uMode: { value: world.streamMode || 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                void main() {
                    vUv = uv;
                    vec4 wp = modelMatrix * vec4(position, 1.0);
                    vWorldPos = wp.xyz;
                    gl_Position = projectionMatrix * viewMatrix * wp;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform float uMode;
                varying vec2 vUv;
                varying vec3 vWorldPos;

                float waveNoise(vec2 p) {
                    return sin(p.x * 2.1 + uTime * 2.2) * cos(p.y * 2.7 - uTime * 1.6)
                         + 0.5 * sin(p.x * 4.7 - uTime * 3.1 + sin(p.y * 3.3));
                }

                void main() {
                    vec2 wp = vWorldPos.xz;
                    float edge = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
                    float shoreline = 1.0 - edge;
                    vec3 col = vec3(0.0);
                    float alpha = 0.92;

                    if (uMode < 1.5) {
                        // 世界 1 & 2：陽光焦散波光水晶溪流 / 翡翠瀑布河
                        float n1 = waveNoise(wp * 0.9);
                        float n2 = waveNoise(wp * 1.9 + vec2(3.1, -1.7));
                        float caustic = smoothstep(0.45, 1.15, n1 + n2 * 0.6);
                        vec3 deep = (uMode < 0.5) ? vec3(0.02, 0.44, 0.82) : vec3(0.02, 0.46, 0.42);
                        vec3 mid  = (uMode < 0.5) ? vec3(0.06, 0.72, 0.96) : vec3(0.08, 0.82, 0.68);
                        vec3 glow = (uMode < 0.5) ? vec3(0.75, 0.98, 1.00) : vec3(0.72, 1.00, 0.86);
                        col = mix(deep, mid, clamp(n1 * 0.5 + 0.5, 0.0, 1.0));
                        col = mix(col, glow, caustic * 0.65);
                        col += vec3(0.85, 0.97, 1.0) * shoreline * 0.55;
                    } else if (uMode < 2.5) {
                        // 世界 3：星雲紫晶極光魔河
                        float n = waveNoise(wp * 1.15);
                        float swirl = sin(wp.x * 1.5 + n * 2.0 - uTime * 2.0) * 0.5 + 0.5;
                        vec3 c1 = vec3(0.24, 0.05, 0.48);
                        vec3 c2 = vec3(0.72, 0.18, 0.96);
                        vec3 c3 = vec3(0.20, 0.92, 0.98);
                        col = mix(c1, c2, swirl);
                        col += c3 * smoothstep(0.65, 1.25, n) * 0.55;
                        col += vec3(0.75, 0.45, 1.0) * shoreline * 0.45;
                    } else if (uMode < 3.5) {
                        // 世界 4：白熾金紅脈動熔岩海（深邃黑曜岩殼配高對比火脈）
                        float n = waveNoise(wp * 0.85);
                        float vein = smoothstep(0.08, 0.88, abs(n));
                        vec3 crust = vec3(0.14, 0.02, 0.02);
                        vec3 lava  = vec3(0.86, 0.18, 0.01);
                        vec3 hot   = vec3(1.12, 0.84, 0.18);
                        col = mix(hot, lava, vein);
                        col = mix(col, crust, smoothstep(0.55, 1.15, n + 0.35));
                        alpha = 1.0;
                    } else {
                        // 世界 5：賽博霓虹全息數據光河
                        float gx = abs(fract(wp.x * 0.5 - uTime * 0.8) - 0.5);
                        float gz = abs(fract(vUv.y * 4.0) - 0.5);
                        float grid = smoothstep(0.08, 0.01, min(gx, gz));
                        float pulse = smoothstep(0.82, 0.99, sin(wp.x * 0.6 + uTime * 4.5));
                        vec3 base = vec3(0.02, 0.10, 0.28);
                        vec3 cyan = vec3(0.0, 1.15, 1.25);
                        vec3 pink = vec3(1.25, 0.05, 0.78);
                        col = base + cyan * grid * 0.75 + pink * pulse * 0.85;
                        col += cyan * shoreline * 0.55;
                    }

                    gl_FragColor = vec4(col, alpha);
                }
            `
        });
    }

    rebuildFrogModel() {
        let savedPos = new THREE.Vector3(0, 0, 0);
        let savedRotY = 0;
        const rescuedMeshes = [];

        if (this.frog) {
            savedPos.copy(this.frog.position);
            savedRotY = this.frog.rotation.y;
            if (this.frog.userData.backpack) {
                while (this.frog.userData.backpack.children.length > 0) {
                    const child = this.frog.userData.backpack.children[0];
                    this.frog.userData.backpack.remove(child);
                    rescuedMeshes.push(child);
                }
            }
            this.scene.remove(this.frog);
        }

        this.frog = Models3D.createFrogger(this.equippedSkin);
        this.frog.position.copy(savedPos);
        this.frog.rotation.y = savedRotY;
        rescuedMeshes.forEach(m => this.frog.userData.backpack.add(m));
        this.scene.add(this.frog);

        if (this.frogLight) {
            this.frogLight.color.setHex(this.frog.userData.trailColor || 0x4ade80);
        }
    }

    // ==================== 2. 建構五大華麗微縮世界 ====================
    buildWorld(world) {
        this.clearWorld();

        this.currentWorld = world;
        this.scene.background = new THREE.Color(world.skyColor);
        this.scene.fog.color.setHex(world.fogColor);
        this.scene.fog.density = world.fogDensity;

        this.updateWorldEnvironment(world);
        if (this.bloomPass) {
            this.bloomPass.strength = world.bloomStrength || 0.72;
        }
        this.streamMaterial = this.createStreamMaterial(world);

        if (window.soundEngine) {
            window.soundEngine.setTheme(world.id);
        }

        const totalRows = world.rows;
        const mapWidth = 28;
        const midRow = Math.floor(totalRows * 0.5);

        this.rescuedCount = 0;
        this.stageCoins = 0;
        this.deathsThisStage = 0;
        this.highestRowReached = 0;
        this.checkpointRow = 0;
        this.hazardSlowTimer = 0;
        this.fogClearTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;

        const babyColors = [
            { hex: 0xff3366, name: '小紅' },
            { hex: 0x00e5ff, name: '小藍' },
            { hex: 0xffdf00, name: '小黃' },
            { hex: 0xc084fc, name: '小紫' },
            { hex: 0xff77cc, name: '小粉' }
        ];

        const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
        const texGroundA = Models3D.getGroundTexture(world.id, false);
        const texGroundB = Models3D.getGroundTexture(world.id, true);
        const texRoad = Models3D.getRoadTexture(world.id);
        [texGroundA, texGroundB, texRoad].forEach(t => { t.anisotropy = maxAniso; });

        for (let r = 0; r < totalRows; r++) {
            const z = -r * this.GRID;
            let type = 'SAFE';

            if (r <= 1) {
                type = 'SAFE';
            } else if (world.id === 5 && r >= totalRows - 5) {
                type = (r === totalRows - 1) ? 'GOAL' : 'BOSS_ARENA';
            } else if (r === totalRows - 1) {
                type = 'GOAL';
            } else if (r === midRow || r === midRow + 1 || r === totalRows - 6) {
                type = 'SAFE';
            } else {
                const block = r % 9;
                if (block === 0) type = 'SAFE';
                else if (block >= 1 && block <= 4) type = 'ROAD';
                else type = 'WATER';
            }

            this.gridMap[r] = { type, z, conveyorSpeed: 0 };
            this.buildRow(r, z, type, mapWidth, world, midRow, texGroundA, texGroundB, texRoad);

            // 兩岸高密度繽紛微縮景觀（每列錯落佈置櫻花樹、聖火柱、南瓜方尖碑、水晶簇與霓虹塔！）
            if (r % 2 === 0) {
                [-1, 1].forEach(side => {
                    const cluster = Models3D.createBankCluster(world.id, side);
                    cluster.position.set(side * 12.6 + (Math.random() - 0.5) * 0.6, 0, z);
                    this.addWorldObject(cluster);
                });
            }

            // 金幣與補血螢火蟲
            if (r > 1 && r < totalRows - 2 && type !== 'BOSS_ARENA') {
                if (Math.random() < 0.68) {
                    const coin = Models3D.createCoin();
                    const colX = (Math.floor(Math.random() * 9) - 4) * this.GRID;
                    coin.position.set(colX, 0.68, z);
                    this.addWorldObject(coin);
                    this.coinsList.push(coin);
                }
                if (Math.random() < 0.22) {
                    const fly = Models3D.createFly();
                    const colX = (Math.floor(Math.random() * 7) - 3) * this.GRID;
                    fly.position.set(colX, 1.18, z);
                    this.addWorldObject(fly);
                    this.fliesList.push(fly);
                }
            }
        }

        // 放置 5 隻星芒小萌蛙
        const candidateRows = [];
        for (let r = 3; r < (world.id === 5 ? totalRows - 5 : totalRows - 1); r++) {
            if (this.gridMap[r].type === 'SAFE' || this.gridMap[r].type === 'WATER') {
                candidateRows.push(r);
            }
        }
        for (let i = 0; i < 5; i++) {
            const rIdx = Math.min(
                candidateRows.length - 1,
                Math.floor(((i + 0.5) / 5) * candidateRows.length)
            );
            const row = candidateRows[rIdx] || (3 + i * 3);
            const z = -row * this.GRID;
            const colX = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3)) * this.GRID;
            const info = babyColors[i];
            const baby = Models3D.createBabyFrog(info.hex, info.name);
            baby.position.set(colX, 0.22, z);
            this.addWorldObject(baby);
            this.babyFrogs.push({
                mesh: baby,
                row,
                origX: colX,
                origZ: z,
                info,
                rescued: false,
                pulling: false
            });
        }

        // 中途存檔點水晶台
        this.checkpointRowTarget = midRow;
        const cpMarker = Models3D.createHazardProp('SWITCH_ORB');
        cpMarker.position.set(0, 0, -midRow * this.GRID);
        cpMarker.scale.set(0.9, 0.9, 0.9);
        this.addWorldObject(cpMarker);
        this.checkpointMesh = cpMarker;

        // 終點多環星象儀傳送陣
        const goalZ = -(totalRows - 1) * this.GRID;
        this.goalPortal = Models3D.createGoalPortal(world.id);
        this.goalPortal.position.set(0, 0, goalZ);
        this.addWorldObject(this.goalPortal);

        // 繽紛星芒氣候粒子
        this.buildWeatherParticles(world);
        this.setBossHudVisible(false);

        this.resetFrog(true);
        this.updateHUD();
    }

    buildRow(row, z, type, mapWidth, world, midRow, texGroundA, texGroundB, texRoad) {
        if (type === 'ROAD') {
            const roadGeo = new THREE.BoxGeometry(mapWidth, 0.34, this.GRID * 0.98);
            const roadMat = new THREE.MeshStandardMaterial({
                map: texRoad,
                roughness: world.id === 5 ? 0.35 : 0.68,
                metalness: world.id === 5 ? 0.45 : 0.1
            });
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(0, -0.17, z);
            road.receiveShadow = true;
            this.addWorldObject(road);

            // 發光車道分隔標線
            const dashColor = world.id === 5 ? 0x00f5ff : (world.id === 4 ? 0xff6b00 : 0xfef08a);
            const dashMat = new THREE.MeshBasicMaterial({ color: dashColor });
            for (let dx = -10; dx <= 10; dx += 4) {
                const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.12), dashMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(dx, 0.012, z);
                this.addWorldObject(dash);
            }

            if (world.id === 5 && row % 2 === 1) {
                const cDir = (row % 4 === 1) ? 1 : -1;
                this.gridMap[row].conveyorSpeed = cDir * 1.65;
            }

            const dir = (row % 2 === 0) ? 1 : -1;
            const speed = dir * (2.9 + (row % 3) * 0.95 + Math.random() * 0.8) * world.trafficSpeed;
            const vehType = this.pickVehicleType(world.id, row);
            const count = (vehType === 'LAVA_TRAIN' || vehType === 'PICKUP') ? 3 : 4;
            const spacing = 30 / count;

            for (let i = 0; i < count; i++) {
                const vMesh = Models3D.createVehicle(vehType);
                const startX = -14 + i * spacing + Math.random() * 1.8;
                vMesh.position.set(startX, 0, z);
                vMesh.rotation.y = (speed > 0) ? Math.PI / 2 : -Math.PI / 2;
                this.addWorldObject(vMesh);
                this.vehicles.push({
                    mesh: vMesh,
                    type: vehType,
                    baseSpeed: speed,
                    z,
                    row,
                    halfLen: (vMesh.userData.length || 2.5) * 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        } else if (type === 'WATER') {
            const waterGeo = new THREE.PlaneGeometry(mapWidth, this.GRID * 1.01);
            waterGeo.rotateX(-Math.PI / 2);
            const water = new THREE.Mesh(waterGeo, this.streamMaterial);
            water.position.set(0, -0.20, z);
            this.addWorldObject(water);

            // 世界 1 & 2 清澈溪流底下悠游的金紅錦鯉！
            if (world.id <= 2 && row % 2 === 0) {
                for (let k = 0; k < 2; k++) {
                    const koi = Models3D.createKoiFish();
                    const kDir = k % 2 === 0 ? 1 : -1;
                    koi.position.set((k - 0.5) * 9, -0.34, z + (k - 0.5) * 0.45);
                    koi.scale.x = kDir;
                    this.addWorldObject(koi);
                    this.koiList.push({ mesh: koi, speed: kDir * (1.2 + Math.random()), phase: Math.random() * 6 });
                }
            }

            const dir = (row % 2 === 0) ? 1 : -1;
            const speed = dir * (1.7 + (row % 3) * 0.55) * (world.trafficSpeed * 0.85);
            const platSpec = this.pickPlatformSpec(world.id, row);
            const count = 4;
            const spacing = 30 / count;

            for (let i = 0; i < count; i++) {
                const pMesh = Models3D.createPlatform(platSpec.type, platSpec.size);
                const startX = -14 + i * spacing + (Math.random() * 1.1);
                pMesh.position.set(startX, -0.10, z);
                if (platSpec.type === 'CROCODILE' || platSpec.type === 'DIVING_TURTLE') {
                    pMesh.scale.x = dir > 0 ? 1 : -1;
                }
                this.addWorldObject(pMesh);

                this.platforms.push({
                    mesh: pMesh,
                    type: platSpec.type,
                    baseSpeed: speed,
                    dir,
                    z,
                    row,
                    halfSpan: pMesh.userData.halfSpan || 1.8,
                    canDive: platSpec.type === 'DIVING_TURTLE' && (i % 2 === 0),
                    diveTimer: 2.5 + i * 1.4,
                    diveState: 'SURFACE',
                    mouthOpen: false,
                    mouthTimer: 1.5 + i * 0.9,
                    sinkProgress: 0,
                    sunkTimer: 0
                });
            }
        } else {
            const isArena = type === 'BOSS_ARENA';
            const groundGeo = new THREE.BoxGeometry(mapWidth, 0.42, this.GRID);
            const groundMat = isArena
                ? new THREE.MeshStandardMaterial({
                    color: 0x172554,
                    roughness: 0.25,
                    metalness: 0.65
                })
                : new THREE.MeshStandardMaterial({
                    map: (row % 2 === 0) ? texGroundA : texGroundB,
                    roughness: 0.58,
                    metalness: 0.08
                });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.position.set(0, -0.21, z);
            ground.receiveShadow = true;
            this.addWorldObject(ground);

            if (isArena) {
                const line = new THREE.Mesh(
                    new THREE.PlaneGeometry(24, 0.13),
                    new THREE.MeshBasicMaterial({ color: 0xff00aa })
                );
                line.rotation.x = -Math.PI / 2;
                line.position.set(0, 0.015, z + this.GRID * 0.48);
                this.addWorldObject(line);
            }

            if (type === 'SAFE' && row > 2 && row !== midRow && row < world.rows - 2) {
                if (world.id === 2) {
                    [-4, 4].forEach((col, idx) => {
                        const plant = Models3D.createHazardProp('PIRANHA_PLANT');
                        plant.position.set(col * this.GRID, 0, z);
                        this.addWorldObject(plant);
                        this.hazards.push({
                            kind: 'PIRANHA',
                            mesh: plant,
                            row,
                            x: col * this.GRID,
                            z,
                            timer: idx * 1.4
                        });
                    });
                } else if (world.id === 4) {
                    [-3, 3].forEach((col, idx) => {
                        const geyser = Models3D.createHazardProp('LAVA_GEYSER');
                        geyser.position.set(col * this.GRID, 0, z);
                        this.addWorldObject(geyser);
                        this.hazards.push({
                            kind: 'GEYSER',
                            mesh: geyser,
                            row,
                            x: col * this.GRID,
                            z,
                            timer: idx * 1.6
                        });
                    });
                }

                if (world.id >= 2 && Math.random() < 0.65) {
                    const sw = Models3D.createHazardProp('SWITCH_ORB');
                    const sx = (row % 2 === 0 ? -6 : 6);
                    sw.position.set(sx, 0, z);
                    this.addWorldObject(sw);
                    this.switches.push({ mesh: sw, x: sx, z, row, cooldown: 0 });
                }
            }
        }
    }

    pickVehicleType(worldId, row) {
        if (worldId === 1) return ['LAWNMOWER', 'TOY_RACER', 'PICKUP'][row % 3];
        if (worldId === 2) return (row % 2 === 0) ? 'BOULDER' : 'TEMPLE_CHARIOT';
        if (worldId === 3) return (row % 2 === 0) ? 'GHOST' : 'HEARSE';
        if (worldId === 4) return (row % 3 === 0) ? 'LAVA_TRAIN' : 'MAGMA_BEETLE';
        return (row % 2 === 0) ? 'HOVER_CAR' : 'CYBER_DRONE';
    }

    pickPlatformSpec(worldId, row) {
        if (worldId === 1) {
            if (row % 3 === 0) return { type: 'DIVING_TURTLE', size: 3.6 };
            if (row % 2 === 0) return { type: 'LOG', size: 3.9 };
            return { type: 'LILYPAD', size: 1.15 };
        }
        if (worldId === 2) {
            if (row % 3 === 0) return { type: 'CROCODILE', size: 4.1 };
            if (row % 2 === 0) return { type: 'STONE_RAFT', size: 3.6 };
            return { type: 'DIVING_TURTLE', size: 3.2 };
        }
        if (worldId === 3) {
            return (row % 2 === 0) ? { type: 'COFFIN_RAFT', size: 3.7 } : { type: 'LILYPAD', size: 1.16 };
        }
        if (worldId === 4) {
            return { type: 'BASALT_SLAB', size: (row % 2 === 0) ? 3.5 : 2.8 };
        }
        return { type: 'HOLO_PAD', size: (row % 2 === 0) ? 3.6 : 2.7 };
    }

    // 多彩星芒貼圖氣候粒子系統 (Additive Sparkle Weather)
    buildWeatherParticles(world) {
        const count = this.qualityLevel === 'ULTRA' ? 160 : (this.qualityLevel === 'HIGH' ? 100 : 45);
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const palette = (world.weatherColors || [0xffffff]).map(hex => new THREE.Color(hex));

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 32;
            positions[i * 3 + 1] = Math.random() * 15;
            positions[i * 3 + 2] = -Math.random() * (world.rows * this.GRID);
            speeds[i] = 0.6 + Math.random() * 1.5;

            const c = palette[i % palette.length];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const mat = new THREE.PointsMaterial({
            map: Models3D.getSparkleTexture(),
            size: world.weatherMode === 'RAIN' ? 0.55 : 0.72,
            vertexColors: true,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.weatherSprites = new THREE.Points(geo, mat);
        this.addWorldObject(this.weatherSprites);
    }

    addWorldObject(obj) {
        this.scene.add(obj);
        this.worldDisposables.push(obj);
    }

    clearWorld() {
        if (this.deathTimer) {
            clearTimeout(this.deathTimer);
            this.deathTimer = null;
        }

        this.worldDisposables.forEach(obj => this.scene.remove(obj));
        this.worldDisposables = [];

        this.ripples.forEach(r => this.scene.remove(r.mesh));
        this.ripples = [];

        this.particles.forEach(p => {
            this.scene.remove(p.sprite);
            p.mat.dispose();
        });
        this.particles = [];

        if (this.boss) {
            if (this.boss.mesh) this.scene.remove(this.boss.mesh);
            if (this.boss.laserGroup) this.scene.remove(this.boss.laserGroup);
            this.boss.orbs.forEach(o => this.scene.remove(o.mesh));
            this.boss = null;
        }

        if (this.frog && this.frog.userData && this.frog.userData.backpack) {
            const bp = this.frog.userData.backpack;
            while (bp.children.length > 0) {
                bp.remove(bp.children[0]);
            }
        }

        this.vehicles = [];
        this.platforms = [];
        this.koiList = [];
        this.hazards = [];
        this.switches = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.weatherSprites = null;
        this.gridMap = {};
    }

    resetFrog(fullStageStart = false) {
        const spawnRow = fullStageStart
            ? 0
            : (this.state === 'BOSS_FIGHT' ? Math.max(0, this.currentWorld.rows - 5) : this.checkpointRow);

        this.frogPos = { col: 0, row: spawnRow };
        this.facingDir = { dCol: 0, dRow: 1 };
        this.bufferedMove = null;
        this.frog.position.set(0, 0, -spawnRow * this.GRID);
        this.frog.rotation.set(0, 0, 0);
        this.frog.scale.set(1, 1, 1);
        this.frog.visible = true;
        if (this.frog.userData.visualRoot) {
            this.frog.userData.visualRoot.scale.set(1, 1, 1);
        }
        if (this.frog.userData.tongue) {
            this.frog.userData.tongue.scale.set(1, 1, 0.001);
        }
        this.jumpAnim.active = false;
        this.tongueAnim.active = false;
        this.invulnTimer = fullStageStart ? 0 : 1.8;

        if (this.state !== 'TITLE') {
            this.state = this.boss ? 'BOSS_FIGHT' : 'PLAYING';
        }
    }

    // ==================== 3. 操控綁定與預輸入緩衝 ====================
    bindControls() {
        window.addEventListener('keydown', (e) => {
            if (document.querySelector('dialog[open]')) return;
            window.soundEngine.init();

            if (this.state === 'TITLE') {
                if (['Space', 'Enter'].includes(e.code)) {
                    e.preventDefault();
                    this.startCampaign();
                }
                return;
            }

            if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;

            if (['ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                this.requestHop(0, 1);
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                this.requestHop(0, -1);
            } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
                e.preventDefault();
                this.requestHop(-1, 0);
            } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
                e.preventDefault();
                this.requestHop(1, 0);
            } else if (e.code === 'Space' || e.code === 'KeyJ') {
                e.preventDefault();
                this.superHop();
            } else if (e.code === 'KeyE' || e.code === 'KeyK') {
                e.preventDefault();
                this.tongueGrab();
            } else if (e.code === 'KeyQ' || e.code === 'KeyL') {
                e.preventDefault();
                this.powerCroak();
            } else if (e.code === 'KeyC') {
                this.toggleCameraMode();
            }
        });

        const bindClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.soundEngine.init();
                    fn();
                });
            }
        };
        bindClick('btnSuperHop', () => this.superHop());
        bindClick('btnTongue', () => this.tongueGrab());
        bindClick('btnCroak', () => this.powerCroak());
        bindClick('dpadUp', () => this.requestHop(0, 1));
        bindClick('dpadDown', () => this.requestHop(0, -1));
        bindClick('dpadLeft', () => this.requestHop(-1, 0));
        bindClick('dpadRight', () => this.requestHop(1, 0));

        let touchX = 0, touchY = 0;
        this.container.addEventListener('touchstart', (e) => {
            window.soundEngine.init();
            const t = e.changedTouches[0];
            touchX = t.clientX;
            touchY = t.clientY;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchX;
            const dy = t.clientY - touchY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) > 24) {
                if (absX > absY) this.requestHop(dx > 0 ? 1 : -1, 0);
                else this.requestHop(0, dy > 0 ? -1 : 1);
            } else {
                this.requestHop(0, 1);
            }
        }, { passive: true });
    }

    startCampaign(worldIndex = null) {
        window.soundEngine.init();
        if (worldIndex !== null) {
            this.currentWorldIndex = worldIndex;
        }
        const overlay = document.getElementById('titleOverlay');
        if (overlay) overlay.classList.add('hidden');

        this.lives = this.getMaxLives();
        this.score = 0;
        this.buildWorld(this.WORLDS[this.currentWorldIndex]);
        this.state = 'PLAYING';
        window.soundEngine.startBGM(this.currentWorld.id);
        this.updateHUD();
    }

    requestHop(dCol, dRow) {
        if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;
        if (this.jumpAnim.active) {
            const progress = (performance.now() - this.jumpAnim.startTime) / this.jumpAnim.duration;
            if (progress > 0.35) {
                this.bufferedMove = { dCol, dRow };
            }
            return;
        }
        this.hop(dCol, dRow);
    }

    setFrogFacing(dCol, dRow) {
        this.facingDir = { dCol, dRow };
        if (dRow > 0) this.frog.rotation.y = 0;
        else if (dRow < 0) this.frog.rotation.y = Math.PI;
        else if (dCol < 0) this.frog.rotation.y = Math.PI / 2;
        else if (dCol > 0) this.frog.rotation.y = -Math.PI / 2;
    }

    // ==================== 4. 華麗星芒跳躍與三大戰術超能力 ====================
    hop(dCol, dRow) {
        if (this.jumpAnim.active || (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT')) return;

        const minRow = this.state === 'BOSS_FIGHT' ? (this.currentWorld.rows - 6) : 0;
        const maxRow = this.state === 'BOSS_FIGHT' ? (this.currentWorld.rows - 2) : (this.currentWorld.rows - 1);

        const targetRow = this.frogPos.row + dRow;
        if (targetRow < minRow || targetRow > maxRow) {
            this.setFrogFacing(dCol, dRow);
            return;
        }

        let targetX = this.frog.position.x;
        if (dCol !== 0) {
            targetX += dCol * this.GRID;
        } else {
            targetX = Math.round(targetX / (this.GRID * 0.5)) * (this.GRID * 0.5);
        }
        targetX = Math.max(-10.2, Math.min(10.2, targetX));

        this.setFrogFacing(dCol, dRow);

        this.jumpAnim.active = true;
        this.jumpAnim.type = 'NORMAL';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 148;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetX;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 1.15;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);

        if (dRow > 0 && targetRow > this.highestRowReached) {
            this.highestRowReached = targetRow;
            this.bumpCombo();
            this.addScore(15);
        } else {
            this.comboTimer = Math.max(this.comboTimer, 1.8);
        }

        const tc = this.frog.userData.trailColor || 0x4ade80;
        this.spawnSparkleBurst(this.frog.position.x, 0.25, this.frog.position.z, [tc, 0xffffff, 0xffe066], 9, 2.8);
        this.spawnShockRing(this.frog.position.x, this.frog.position.z, tc, 0.25, 0.55);

        window.soundEngine.playHop(this.combo, this.frog.position.x / 12);
    }

    superHop() {
        if (this.jumpAnim.active || (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT')) return;
        if (this.cooldowns.superHop > 0) return;

        const dCol = this.facingDir.dCol;
        const dRow = (dCol === 0 && this.facingDir.dRow === 0) ? 1 : this.facingDir.dRow;

        const minRow = this.state === 'BOSS_FIGHT' ? (this.currentWorld.rows - 6) : 0;
        const maxRow = this.state === 'BOSS_FIGHT' ? (this.currentWorld.rows - 2) : (this.currentWorld.rows - 1);

        const targetRow = Math.max(minRow, Math.min(maxRow, this.frogPos.row + dRow * 2));
        const targetX = Math.max(-10.2, Math.min(10.2, this.frog.position.x + dCol * 2 * this.GRID));

        this.setFrogFacing(dCol, dRow);

        this.jumpAnim.active = true;
        this.jumpAnim.type = 'SUPER';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 260;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetX;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 2.75;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);
        this.cooldowns.superHop = this.maxCooldowns.superHop * this.getCooldownFactor();
        this.frogLightIntensity = 3.2;

        if (targetRow > this.highestRowReached) {
            this.highestRowReached = targetRow;
            this.bumpCombo();
        }

        this.spawnSparkleBurst(this.frog.position.x, 0.35, this.frog.position.z, [0x00f5ff, 0xff00aa, 0xffe047], 18, 4.5);
        window.soundEngine.playSuperHop(this.frog.position.x / 12);
        this.addScore(35);
    }

    tongueGrab() {
        if (this.tongueAnim.active || (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT')) return;
        if (this.cooldowns.tongue > 0) return;

        const range = this.getTongueRange();
        this.tongueAnim.active = true;
        this.tongueAnim.startTime = performance.now();
        this.tongueAnim.reach = range;
        this.cooldowns.tongue = this.maxCooldowns.tongue * this.getCooldownFactor();
        this.frogLightIntensity = 2.4;

        const pan = this.frog.position.x / 12;
        window.soundEngine.playTongue(pan);

        const forward = new THREE.Vector3(this.facingDir.dCol, 0, -this.facingDir.dRow).normalize();
        if (forward.lengthSq() < 0.1) forward.set(0, 0, -1);

        const inTongueCone = (targetPos, maxDist, minCos = 0.55) => {
            const toTarget = new THREE.Vector3(
                targetPos.x - this.frog.position.x,
                0,
                targetPos.z - this.frog.position.z
            );
            const dist = toTarget.length();
            if (dist > maxDist) return false;
            if (dist < 1.3) return true;
            toTarget.normalize();
            return forward.dot(toTarget) >= minCos;
        };

        this.coinsList.forEach(coin => {
            if (!coin.userData.collected && inTongueCone(coin.position, range, 0.5)) {
                this.collectCoin(coin, 3);
            }
        });

        this.fliesList.forEach(fly => {
            if (!fly.userData.collected && inTongueCone(fly.position, range, 0.5)) {
                this.collectFly(fly);
            }
        });

        this.babyFrogs.forEach(b => {
            if (!b.rescued && !b.pulling && inTongueCone(b.mesh.position, range + 0.8, 0.48)) {
                const dist = this.frog.position.distanceTo(b.mesh.position);
                b.pulling = true;
                window.soundEngine.playGrappleHit(pan);
                this.spawnFloatingText('👅 隔空神舌救援!', b.mesh.position, '#ff77cc');
                if (dist > 2.4) this.unlockAchievement('tongue_sniper');
            }
        });

        this.switches.forEach(sw => {
            if (sw.cooldown <= 0 && inTongueCone(sw.mesh.position, range + 0.6, 0.45)) {
                this.activateSwitch(sw);
            }
        });

        if (this.state === 'BOSS_FIGHT' && this.boss && this.boss.hp > 0) {
            const bossWorldPos = this.boss.mesh.position;
            if (inTongueCone(bossWorldPos, range + 2.8, 0.35)) {
                if (this.boss.coreExposed) {
                    this.damageBoss(35, '💥 長舌扯裂核心 -35!');
                    this.boss.coreExposed = false;
                    this.boss.stateTimer = 1.5;
                } else {
                    this.damageBoss(6, '👅 裝甲擦傷 -6');
                }
            }
        }
    }

    powerCroak() {
        if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;
        if (this.cooldowns.croak > 0) return;

        this.cooldowns.croak = this.maxCooldowns.croak * this.getCooldownFactor();
        this.frogLightIntensity = 3.8;
        const pan = this.frog.position.x / 12;
        window.soundEngine.playCroak(pan);

        if (this.frog.userData.throatSac) {
            this.frog.userData.throatSac.scale.set(1.75, 1.75, 1.75);
        }

        // 三重七彩霓虹音爆光環 + 星芒迸發！
        [0x00ffaa, 0x00f5ff, 0xff66cc].forEach((color, idx) => {
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, color, 0.25 + idx * 0.35, 0.95);
        });
        this.spawnSparkleBurst(this.frog.position.x, 0.5, this.frog.position.z, [0x00ffaa, 0x00f5ff, 0xff66cc], 16, 4.0);

        this.hazardSlowTimer = Math.max(this.hazardSlowTimer, 1.8);

        if (this.currentWorld.id === 3) {
            this.fogClearTimer = 6.5;
        }
        let banishedCount = 0;
        this.vehicles.forEach(v => {
            if (v.type === 'GHOST' && !v.mesh.userData.banished) {
                const dist = this.frog.position.distanceTo(v.mesh.position);
                if (dist < 7.2) {
                    v.mesh.userData.banished = true;
                    v.mesh.visible = false;
                    v.respawnTimer = 6.0;
                    banishedCount++;
                    window.soundEngine.playGhostPoof(v.mesh.position.x / 12);
                    this.spawnSparkleBurst(v.mesh.position.x, 1.0, v.mesh.position.z, [0xe879f9, 0x67e8f9, 0xffffff], 22, 4.8);
                    this.spawnFloatingText('👻 震散幽靈 +120!', v.mesh.position, '#e879f9');
                    this.addScore(120);
                }
            }
        });
        if (banishedCount > 0) this.unlockAchievement('ghost_buster');

        if (this.state === 'BOSS_FIGHT' && this.boss) {
            this.boss.orbs.forEach(orb => {
                if (!orb.deflected && this.frog.position.distanceTo(orb.mesh.position) < 5.6) {
                    orb.deflected = true;
                    window.soundEngine.playGhostPoof(0);
                    if (orb.mesh.userData.shell) orb.mesh.userData.shell.material.color.setHex(0x00ffaa);
                    if (orb.mesh.userData.glow) orb.mesh.userData.glow.material.color.setHex(0x00ffaa);
                    this.spawnFloatingText('⚡ 聲波完美彈反!', orb.mesh.position, '#00ffaa');
                }
            });
        }

        let nearestBaby = null;
        let minDist = Infinity;
        this.babyFrogs.forEach(b => {
            if (!b.rescued) {
                const d = this.frog.position.distanceTo(b.mesh.position);
                if (d < minDist) {
                    minDist = d;
                    nearestBaby = b;
                }
            }
        });

        if (nearestBaby) {
            this.compassTarget = nearestBaby;
            this.compassTimer = 3.6;
            if (nearestBaby.mesh.userData.beaconMat) {
                nearestBaby.mesh.userData.beaconMat.opacity = 0.92;
                nearestBaby.mesh.scale.set(1.45, 1.45, 1.45);
                setTimeout(() => {
                    if (nearestBaby && !nearestBaby.rescued && nearestBaby.mesh) {
                        nearestBaby.mesh.scale.set(1, 1, 1);
                        if (nearestBaby.mesh.userData.beaconMat) {
                            nearestBaby.mesh.userData.beaconMat.opacity = 0.32;
                        }
                    }
                }, 1400);
            }
        }
    }

    // ==================== 5. 落地、救援、機關與世界 5 Boss 戰 ====================
    onFrogLand(wasSuperHop = false) {
        if (this.frog.userData.visualRoot) {
            this.frog.userData.visualRoot.scale.set(1.26, 0.72, 1.22);
        }

        if (wasSuperHop) {
            window.soundEngine.playStomp(this.frog.position.x / 12);
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, 0xffe047, 0.25, 0.95);
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, 0x00f5ff, 0.5, 0.85);
            this.spawnSparkleBurst(this.frog.position.x, 0.3, this.frog.position.z, [0xffe047, 0x00f5ff, 0xff00aa], 20, 4.8);
            this.screenShake = Math.max(this.screenShake, 0.24);

            if (this.state === 'BOSS_FIGHT' && this.boss && this.boss.hp > 0) {
                const dBoss = this.frog.position.distanceTo(this.boss.mesh.position);
                if (dBoss < 5.5) {
                    this.damageBoss(16, '🚀 重踏震波 -16!');
                }
            }
        }

        const row = this.frogPos.row;
        const rowInfo = this.gridMap[row];
        if (!rowInfo) return;

        if (this.checkpointRow === 0 && row >= this.checkpointRowTarget && this.state === 'PLAYING') {
            this.checkpointRow = this.checkpointRowTarget;
            window.soundEngine.playSwitch(0);
            this.spawnSparkleBurst(0, 0.8, -this.checkpointRow * this.GRID, [0x00ffaa, 0xffe047, 0xffffff], 24, 4.8);
            this.spawnFloatingText('🚩 中途存檔點已啟動!', this.frog.position, '#00ffaa');
        }

        this.switches.forEach(sw => {
            if (sw.cooldown <= 0 && this.frog.position.distanceTo(sw.mesh.position) < 1.5) {
                this.activateSwitch(sw);
            }
        });

        this.coinsList.forEach(c => {
            if (!c.userData.collected && this.frog.position.distanceTo(c.position) < 1.45) {
                this.collectCoin(c, 1);
            }
        });
        this.fliesList.forEach(f => {
            if (!f.userData.collected && this.frog.position.distanceTo(f.position) < 1.55) {
                this.collectFly(f);
            }
        });

        this.checkRescue();

        if (this.currentWorld.id === 5 && this.state === 'PLAYING' && row >= this.currentWorld.rows - 5) {
            if (this.rescuedCount >= 5 && !this.boss) {
                this.startBossBattle();
                return;
            } else if (this.rescuedCount < 5) {
                this.spawnFloatingText(`還差 ${5 - this.rescuedCount} 隻小萌蛙才能開啟決戰!`, this.frog.position, '#facc15');
                this.powerCroak();
            }
        }

        if (rowInfo.type === 'GOAL' && this.currentWorld.id < 5) {
            if (this.rescuedCount >= 5) {
                this.completeStage();
            } else {
                this.spawnFloatingText(`尚有 ${5 - this.rescuedCount} 隻小萌蛙等待救援!`, this.frog.position, '#facc15');
                this.powerCroak();
            }
            return;
        }

        if (rowInfo.type === 'WATER') {
            if (!this.isStandingOnSafeWater(row)) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
                return;
            }
        }

        if (this.bufferedMove && (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT')) {
            const next = this.bufferedMove;
            this.bufferedMove = null;
            this.hop(next.dCol, next.dRow);
        }
    }

    isStandingOnSafeWater(row) {
        for (const b of this.babyFrogs) {
            if (!b.rescued && b.row === row && Math.abs(this.frog.position.x - b.mesh.position.x) < 1.28) {
                return true;
            }
        }
        for (const p of this.platforms) {
            if (p.row === row) {
                if (p.type === 'DIVING_TURTLE' && p.diveState === 'SUBMERGED') continue;
                if (p.type === 'BASALT_SLAB' && p.sunkTimer > 0) continue;

                const dx = this.frog.position.x - p.mesh.position.x;
                if (Math.abs(dx) < p.halfSpan + 0.25) {
                    if (p.type === 'CROCODILE' && p.mouthOpen) {
                        const headSide = p.dir > 0 ? dx > (p.halfSpan - 1.1) : dx < -(p.halfSpan - 1.1);
                        if (headSide) {
                            this.triggerDeath('CRASH');
                            return true;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    activateSwitch(sw) {
        sw.cooldown = 8.0;
        this.hazardSlowTimer = 5.5;
        window.soundEngine.playSwitch(sw.x / 12);
        this.spawnShockRing(sw.x, sw.z, 0x00f5ff, 0.2, 0.95);
        this.spawnSparkleBurst(sw.x, 0.9, sw.z, [0x00f5ff, 0xffe047, 0xffffff], 22, 4.5);
        this.spawnFloatingText('⏳ 時空緩速機關啟動 (5.5秒)!', sw.mesh.position, '#00f5ff');
        this.addScore(100);
    }

    collectCoin(coin, amount = 1) {
        coin.userData.collected = true;
        coin.visible = false;
        this.coins += amount;
        this.stageCoins += amount;
        this.frogLightIntensity = 2.2;
        this.saveData();
        window.soundEngine.playCoin(this.combo, coin.position.x / 12);
        this.spawnSparkleBurst(coin.position.x, 0.65, coin.position.z, [0xffdf00, 0xffffff, 0xffaa00], 14, 3.6);
        this.spawnFloatingText(`+${amount} 💰`, coin.position, '#ffd700');
        this.addScore(50 * amount);
        this.updateHUD();
    }

    collectFly(fly) {
        fly.userData.collected = true;
        fly.visible = false;
        const maxHp = this.getMaxLives();
        this.lives = Math.min(maxHp, this.lives + 1);
        this.frogLightIntensity = 2.6;
        window.soundEngine.playFirefly(fly.position.x / 12);
        this.spawnSparkleBurst(fly.position.x, 1.1, fly.position.z, [0xa3e635, 0x00ffaa, 0xffffff], 18, 4.0);
        this.spawnFloatingText('💚 生命恢復 +1!', fly.position, '#a3e635');
        this.addScore(150);
        this.updateHUD();
    }

    checkRescue() {
        this.babyFrogs.forEach(b => {
            if (!b.rescued) {
                const dist = this.frog.position.distanceTo(b.mesh.position);
                if (dist < 1.75) {
                    this.rescueBabyFrog(b);
                }
            }
        });
    }

    rescueBabyFrog(b) {
        if (b.rescued) return;
        b.rescued = true;
        b.pulling = false;
        this.rescuedCount++;
        this.frogLightIntensity = 3.2;

        window.soundEngine.playRescue(this.rescuedCount);
        this.bumpCombo();
        this.addScore(300);
        this.unlockAchievement('first_rescue');

        this.spawnSparkleBurst(b.mesh.position.x, 0.6, b.mesh.position.z, [b.info.hex, 0xffffff, 0xffe047], 26, 5.2);
        this.spawnShockRing(b.mesh.position.x, b.mesh.position.z, b.info.hex, 0.25, 0.95);
        this.spawnFloatingText(`🎉 救出${b.info.name}! (${this.rescuedCount}/5)`, b.mesh.position, '#ffffff');

        if (b.mesh.userData.beacon) b.mesh.remove(b.mesh.userData.beacon);
        if (b.mesh.userData.pad) b.mesh.remove(b.mesh.userData.pad);
        if (b.mesh.userData.bodyMesh) {
            b.mesh.userData.bodyMesh.rotation.y = Math.PI;
        }

        b.mesh.scale.set(0.56, 0.56, 0.56);
        this.scene.remove(b.mesh);
        b.mesh.position.set(0, (this.rescuedCount - 1) * 0.34, 0);
        this.frog.userData.backpack.add(b.mesh);

        this.updateHUD();

        if (this.rescuedCount >= 5 && this.goalPortal) {
            this.goalPortal.userData.beam.visible = true;
            this.showToast('✨ 5 隻小萌蛙全數獲救！', '終點星象儀光柱已開啟，快衝向最頂端！');
        }
    }

    // ==================== 6. 超華麗終極頭目戰：機械巨鱷皇 ====================
    startBossBattle() {
        this.state = 'BOSS_FIGHT';
        if (this.goalPortal) this.goalPortal.visible = false;

        const arenaTopZ = -(this.currentWorld.rows - 1) * this.GRID - 1.2;
        const bossMesh = Models3D.createMechaBoss();
        bossMesh.position.set(0, 0, arenaTopZ);
        this.scene.add(bossMesh);

        // 雙層高光電漿橫掃雷射（白熱核心 + 粉紅光暈外殼）
        const laserGroup = new THREE.Group();
        const laserCore = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 26, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        laserCore.rotation.z = Math.PI / 2;
        const laserHalo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.55, 26, 16),
            new THREE.MeshBasicMaterial({
                color: 0xff007f,
                transparent: true,
                opacity: 0.65,
                blending: THREE.AdditiveBlending
            })
        );
        laserHalo.rotation.z = Math.PI / 2;
        laserGroup.add(laserCore, laserHalo);
        laserGroup.visible = false;
        this.scene.add(laserGroup);

        this.boss = {
            mesh: bossMesh,
            hp: 100,
            maxHp: 100,
            phase: 'PATROL',
            stateTimer: 2.8,
            orbCooldown: 1.4,
            coreExposed: false,
            orbs: [],
            laserGroup,
            laserHalo,
            laserRow: this.currentWorld.rows - 4
        };

        this.screenShake = 0.55;
        window.soundEngine.setTheme('BOSS');
        window.soundEngine.playBossRoar();
        this.setBossHudVisible(true);
        this.updateBossHud('⚡ 按 [Q] 蛙鳴可彈反電漿球！趁牠張嘴按 [E] 長舌扯出核心！');
        this.showToast('⚠️ 終極頭目降臨！', '機械巨鱷皇 MECHA-SWAMPY REX 擋住了去路！');
    }

    updateBoss(dt, timestamp) {
        if (!this.boss || this.boss.hp <= 0) return;
        const b = this.boss;
        const rageMult = b.hp <= 45 ? 1.35 : 1.0;

        b.stateTimer -= dt;
        b.orbCooldown -= dt;

        const targetJawAngle = b.coreExposed ? -0.68 : -0.05;
        const jaw = b.mesh.userData.upperJawPivot;
        jaw.rotation.x += (targetJawAngle - jaw.rotation.x) * 0.16;
        b.mesh.userData.coreMesh.visible = b.coreExposed;
        if (b.coreExposed) {
            b.mesh.userData.coreMesh.children[0].rotation.y += 0.09;
            b.mesh.userData.coreMesh.children[0].rotation.x += 0.06;
        }
        b.mesh.userData.shieldRing.rotation.z += 0.03 * rageMult;

        if (b.phase === 'PATROL') {
            const targetX = Math.sin(timestamp * 0.0016 * rageMult) * 6.8;
            b.mesh.position.x += (targetX - b.mesh.position.x) * 0.06;

            if (b.orbCooldown <= 0) {
                this.spawnBossOrb();
                b.orbCooldown = b.hp <= 45 ? 1.35 : 1.9;
            }

            if (b.stateTimer <= 0) {
                if (Math.random() < 0.55) {
                    b.phase = 'CORE_OPEN';
                    b.coreExposed = true;
                    b.stateTimer = 4.0;
                    window.soundEngine.playBossRoar();
                    this.updateBossHud('🎯 能量核心暴露！快靠近按 [E] 長舌抓捕 或 [空白鍵] 重踏震波！');
                } else {
                    b.phase = 'LASER_WARN';
                    b.laserRow = (this.currentWorld.rows - 5) + Math.floor(Math.random() * 3);
                    b.laserGroup.position.set(0, 0.55, -b.laserRow * this.GRID);
                    b.laserGroup.visible = true;
                    b.laserGroup.scale.set(1, 0.22, 0.22);
                    b.laserHalo.material.color.setHex(0xffea00);
                    b.laserHalo.material.opacity = 0.55;
                    b.stateTimer = 1.15;
                    window.soundEngine.playWarningTick();
                    this.updateBossHud('⚠️ 雷射蓄力鎖定車道！快跳開或按 [空白鍵] 超級大跳飛越！');
                }
            }
        } else if (b.phase === 'LASER_WARN') {
            b.laserHalo.material.opacity = 0.3 + Math.abs(Math.sin(timestamp * 0.025)) * 0.6;
            if (b.stateTimer <= 0) {
                b.phase = 'LASER_FIRE';
                b.stateTimer = 0.85;
                b.laserGroup.scale.set(1, 1.35, 1.35);
                b.laserHalo.material.color.setHex(0xff007f);
                b.laserHalo.material.opacity = 0.92;
                this.screenShake = Math.max(this.screenShake, 0.32);
                window.soundEngine.playLavaBurn(0);
            }
        } else if (b.phase === 'LASER_FIRE') {
            if (
                this.invulnTimer <= 0 &&
                this.frogPos.row === b.laserRow &&
                this.frog.position.y < 1.05
            ) {
                this.triggerDeath('LAVA');
            }
            if (b.stateTimer <= 0) {
                b.laserGroup.visible = false;
                b.phase = 'CORE_OPEN';
                b.coreExposed = true;
                b.stateTimer = 3.8;
                this.updateBossHud('🎯 雷射過熱核心暴露！快上前按 [E] 長舌扯出核心重創牠！');
            }
        } else if (b.phase === 'CORE_OPEN') {
            const restZ = -(this.currentWorld.rows - 1) * this.GRID + 0.6;
            b.mesh.position.z += (restZ - b.mesh.position.z) * 0.08;
            if (b.stateTimer <= 0) {
                b.coreExposed = false;
                b.phase = 'PATROL';
                b.stateTimer = 3.4;
                b.mesh.position.z = -(this.currentWorld.rows - 1) * this.GRID - 1.2;
                this.updateBossHud('⚡ 按 [Q] 超能蛙鳴彈反電漿球回擊頭目！');
            }
        }

        for (let i = b.orbs.length - 1; i >= 0; i--) {
            const orb = b.orbs[i];
            orb.mesh.userData.halo.rotation.x += 0.12;
            orb.mesh.userData.halo.rotation.y += 0.14;

            if (orb.deflected) {
                const toBoss = new THREE.Vector3().subVectors(b.mesh.position, orb.mesh.position);
                toBoss.y = 0;
                const dist = toBoss.length();
                toBoss.normalize();
                orb.mesh.position.addScaledVector(toBoss, 15.5 * dt);
                if (dist < 2.2) {
                    this.damageBoss(18, '⚡ 彈反電漿轟炸 -18!');
                    this.scene.remove(orb.mesh);
                    b.orbs.splice(i, 1);
                    continue;
                }
            } else {
                orb.mesh.position.addScaledVector(orb.vel, dt);
                if (
                    this.invulnTimer <= 0 &&
                    this.frog.position.y < 1.4 &&
                    this.frog.position.distanceTo(orb.mesh.position) < 1.05
                ) {
                    this.scene.remove(orb.mesh);
                    b.orbs.splice(i, 1);
                    this.triggerDeath('CRASH');
                    continue;
                }
                if (orb.mesh.position.z > -((this.currentWorld.rows - 7) * this.GRID) || Math.abs(orb.mesh.position.x) > 14) {
                    this.scene.remove(orb.mesh);
                    b.orbs.splice(i, 1);
                }
            }
        }
    }

    spawnBossOrb() {
        if (!this.boss) return;
        const orbMesh = Models3D.createBossOrb(false);
        orbMesh.position.copy(this.boss.mesh.position);
        orbMesh.position.y = 0.85;
        orbMesh.position.z += 2.2;

        const dir = new THREE.Vector3(
            this.frog.position.x - orbMesh.position.x,
            0,
            this.frog.position.z - orbMesh.position.z
        ).normalize();
        const speed = this.boss.hp <= 45 ? 8.2 : 6.6;
        this.scene.add(orbMesh);
        this.boss.orbs.push({
            mesh: orbMesh,
            vel: dir.multiplyScalar(speed),
            deflected: false
        });
    }

    damageBoss(dmg, label) {
        if (!this.boss || this.boss.hp <= 0) return;
        this.boss.hp = Math.max(0, this.boss.hp - dmg);
        this.screenShake = Math.max(this.screenShake, 0.48);
        window.soundEngine.playBossHit();

        this.spawnSparkleBurst(this.boss.mesh.position.x, 1.5, this.boss.mesh.position.z + 1.5, [0xffea00, 0xff00aa, 0x00f5ff], 36, 6.8);
        this.spawnShockRing(this.boss.mesh.position.x, this.boss.mesh.position.z + 1.2, 0xffea00, 0.4, 1.0);
        this.spawnFloatingText(label, this.boss.mesh.position, '#ffea00');
        this.addScore(dmg * 25);
        this.updateBossHud();

        if (this.boss.hp <= 0) {
            this.defeatBoss();
        }
    }

    defeatBoss() {
        if (!this.boss) return;
        this.boss.orbs.forEach(o => this.scene.remove(o.mesh));
        this.boss.orbs = [];
        this.boss.laserGroup.visible = false;

        const bx = this.boss.mesh.position.x;
        const bz = this.boss.mesh.position.z;
        [[0xff007f, 0xffea00], [0x00f5ff, 0xffffff], [0xffe047, 0x4ade80], [0xc084fc, 0x00f5ff]].forEach((cols, idx) => {
            setTimeout(() => {
                this.spawnSparkleBurst(bx + (idx - 1.5) * 1.6, 1.9, bz + 1.0, cols, 42, 8.2);
                this.spawnShockRing(bx, bz + 1.0, cols[0], 0.5, 1.0);
                window.soundEngine.playRescue(idx + 2);
            }, idx * 220);
        });

        this.scene.remove(this.boss.mesh);
        this.setBossHudVisible(false);

        this.coins += 50;
        this.stageCoins += 50;
        this.addScore(3000);
        this.unlockAchievement('boss_slayer');
        this.saveData();

        setTimeout(() => {
            this.completeStage(true);
        }, 1250);
    }

    setBossHudVisible(visible) {
        const hud = document.getElementById('bossHud');
        if (hud) hud.classList.toggle('hidden', !visible);
    }

    updateBossHud(hintText = null) {
        if (!this.boss) return;
        const fill = document.getElementById('bossHpFill');
        if (fill) {
            fill.style.width = `${Math.max(0, (this.boss.hp / this.boss.maxHp) * 100)}%`;
        }
        if (hintText) {
            const hint = document.getElementById('bossPhaseHint');
            if (hint) hint.textContent = hintText;
        }
    }

    // ==================== 7. 結算、死亡與華麗星芒爆炸特效 ====================
    completeStage(isFinalVictory = false) {
        if (this.state === 'STAGE_CLEAR') return;
        this.state = 'STAGE_CLEAR';
        window.soundEngine.playStageWin();

        let stars = 1;
        if (this.stageCoins >= 6) stars++;
        if (this.deathsThisStage === 0) {
            stars++;
            this.unlockAchievement('flawless_star');
        }
        if (this.currentWorld.id === 1) {
            this.unlockAchievement('world_clear_1');
        }

        const prevStars = this.worldStars[this.currentWorld.id] || 0;
        if (stars > prevStars) this.worldStars[this.currentWorld.id] = stars;

        const clearBonus = 1000 + stars * 250;
        this.coins += stars * 5;
        this.addScore(clearBonus);
        this.saveData();
        this.updateHUD();

        this.spawnSparkleBurst(this.frog.position.x, 1.6, this.frog.position.z, [0xffdf00, 0x00f5ff, 0xff66cc, 0x4ade80], 45, 7.0);
        this.openStageClearModal(stars, clearBonus, isFinalVictory);
    }

    triggerDeath(type = 'CRASH') {
        if (this.state === 'DYING' || this.state === 'STAGE_CLEAR' || this.state === 'GAME_OVER') return;
        if (this.invulnTimer > 0) return;

        const wasBoss = this.state === 'BOSS_FIGHT';
        this.state = 'DYING';
        this.lives--;
        this.deathsThisStage++;
        this.combo = 0;
        this.comboTimer = 0;
        this.screenShake = 0.45;
        this.updateHUD();

        if (this.deathTimer) clearTimeout(this.deathTimer);
        const pan = this.frog.position.x / 12;

        if (type === 'LAVA') {
            window.soundEngine.playLavaBurn(pan);
            this.frog.scale.set(1.35, 0.18, 1.35);
            this.spawnSparkleBurst(this.frog.position.x, 0.4, this.frog.position.z, [0xff4500, 0xffea00], 26, 5.2);
        } else if (type === 'WATER') {
            window.soundEngine.playSplash(pan);
            this.frog.position.y = -0.6;
            this.spawnSparkleBurst(this.frog.position.x, 0.2, this.frog.position.z, [0x38bdf8, 0xffffff, 0x00f5ff], 24, 4.6);
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, 0x7dd3fc, 0.2, 0.9);
        } else {
            window.soundEngine.playCrash(pan);
            this.frog.scale.set(1.42, 0.12, 1.42);
            this.spawnSparkleBurst(this.frog.position.x, 0.4, this.frog.position.z, [0xff1744, 0xffbe0b], 24, 5.0);
        }

        this.deathTimer = setTimeout(() => {
            if (this.lives > 0) {
                if (wasBoss) this.state = 'BOSS_FIGHT';
                this.resetFrog(false);
                this.updateHUD();
            } else {
                this.state = 'GAME_OVER';
                window.soundEngine.playGameOver();
                this.openGameOverModal();
            }
        }, 950);
    }

    bumpCombo() {
        this.combo++;
        this.comboTimer = 3.2;
        if (this.combo >= 8) this.unlockAchievement('combo_master');
    }

    addScore(pts) {
        const mult = 1 + Math.min(2.0, Math.floor(this.combo / 3) * 0.25);
        this.score += Math.round(pts * mult);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveData();
        }
        this.updateHUD();
    }

    unlockAchievement(id) {
        if (this.achievements[id]) return;
        const def = this.ACHIEVEMENT_DEFS.find(a => a.id === id);
        if (!def) return;

        this.achievements[id] = true;
        this.coins += def.reward;
        this.saveData();
        this.updateHUD();
        window.soundEngine.playAchievement();
        this.showToast(`🏅 成就解鎖：${def.name}`, `${def.desc}（獎勵 +${def.reward} 💰）`);
    }

    showToast(title, subtitle) {
        if (!this.toastContainer) return;
        const card = document.createElement('div');
        card.className = 'game-toast';
        card.innerHTML = `<div class="toast-title">${title}</div><div class="toast-sub">${subtitle}</div>`;
        this.toastContainer.appendChild(card);
        setTimeout(() => {
            card.classList.add('fade-out');
            setTimeout(() => card.remove(), 400);
        }, 3400);
    }

    spawnFloatingText(text, worldPos, color = '#ffffff') {
        if (!this.fxLayer || !this.camera) return;
        const proj = worldPos.clone();
        proj.y += 1.25;
        proj.project(this.camera);

        const x = (proj.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-proj.y * 0.5 + 0.5) * window.innerHeight;
        if (x < -50 || x > window.innerWidth + 50 || y < -50 || y > window.innerHeight + 50) return;

        const el = document.createElement('div');
        el.className = 'float-popup';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.color = color;
        el.textContent = text;
        this.fxLayer.appendChild(el);
        setTimeout(() => el.remove(), 950);
    }

    // 加成混合十字星芒光暈粒子爆發 (Additive Sparkle Burst)
    spawnSparkleBurst(x, y, z, colorList = [0xffffff], count = 14, speed = 3.8) {
        const mult = this.qualityLevel === 'ULTRA' ? 1.2 : (this.qualityLevel === 'HIGH' ? 0.85 : 0.45);
        const actualCount = Math.max(3, Math.round(count * mult));
        const tex = Models3D.getSparkleTexture();

        for (let i = 0; i < actualCount; i++) {
            if (this.particles.length > 220) {
                const oldest = this.particles.shift();
                this.scene.remove(oldest.sprite);
                oldest.mat.dispose();
            }
            const cHex = colorList[i % colorList.length];
            const mat = new THREE.SpriteMaterial({
                map: tex,
                color: cHex,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(mat);
            const initScale = 0.45 + Math.random() * 0.55;
            sprite.scale.set(initScale, initScale, 1);
            sprite.position.set(x, y, z);

            const angle = Math.random() * Math.PI * 2;
            const spd = (0.35 + Math.random() * 0.85) * speed;
            this.scene.add(sprite);
            this.particles.push({
                sprite,
                mat,
                initScale,
                vx: Math.cos(angle) * spd,
                vy: 1.8 + Math.random() * speed * 0.95,
                vz: Math.sin(angle) * spd,
                life: 0.62 + Math.random() * 0.38
            });
        }
    }

    spawnShockRing(x, z, colorHex = 0x00ffaa, startScale = 0.3, opacity = 0.9) {
        const ringGeo = new THREE.RingGeometry(0.48, 0.78, 36);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(x, 0.16, z);
        ring.scale.set(startScale, startScale, startScale);
        this.scene.add(ring);
        this.ripples.push({ mesh: ring, scale: startScale, opacity, geo: ringGeo, mat: ringMat });
    }

    // ==================== 8. 互動對話框與畫質切換 ====================
    bindUIModals() {
        const btnStart = document.getElementById('btnStartGame');
        if (btnStart) btnStart.addEventListener('click', () => this.startCampaign());

        const openDialogSafe = (id, renderFn) => {
            const dlg = document.getElementById(id);
            if (!dlg) return;
            if (renderFn) renderFn();
            if (!dlg.open) dlg.showModal();
        };

        document.querySelectorAll('dialog.glass-dialog').forEach(dlg => {
            dlg.addEventListener('click', (e) => {
                if (e.target === dlg) dlg.close();
            });
        });

        ['worldSelectBtn', 'btnOpenWorldsTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('worldDialog', () => this.renderWorldDialog()));
        });
        const closeWorld = document.getElementById('closeWorldDialog');
        if (closeWorld) closeWorld.addEventListener('click', () => document.getElementById('worldDialog').close());

        ['btnWardrobe', 'btnOpenWardrobeTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('wardrobeDialog', () => this.renderWardrobeDialog()));
        });
        const closeWardrobe = document.getElementById('closeWardrobeDialog');
        if (closeWardrobe) closeWardrobe.addEventListener('click', () => document.getElementById('wardrobeDialog').close());

        ['btnAchieve', 'btnOpenAchieveTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('achieveDialog', () => this.renderAchieveDialog()));
        });
        const closeAchieve = document.getElementById('closeAchieveDialog');
        if (closeAchieve) closeAchieve.addEventListener('click', () => document.getElementById('achieveDialog').close());

        const camBtn = document.getElementById('cameraBtn');
        if (camBtn) camBtn.addEventListener('click', () => this.toggleCameraMode());

        const qualBtn = document.getElementById('qualityBtn');
        if (qualBtn) qualBtn.addEventListener('click', () => this.cycleQuality());
        this.syncToolButtons();

        const btnReplay = document.getElementById('btnReplayStage');
        if (btnReplay) {
            btnReplay.addEventListener('click', () => {
                document.getElementById('stageClearDialog').close();
                this.lives = this.getMaxLives();
                this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                this.state = 'PLAYING';
                this.updateHUD();
            });
        }

        const btnNext = document.getElementById('btnNextStage');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                document.getElementById('stageClearDialog').close();
                this.currentWorldIndex = (this.currentWorldIndex + 1) % this.WORLDS.length;
                this.lives = this.getMaxLives();
                this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                this.state = 'PLAYING';
                this.updateHUD();
            });
        }

        const btnRetry = document.getElementById('btnRetryStage');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                document.getElementById('gameOverDialog').close();
                this.lives = this.getMaxLives();
                this.score = 0;
                this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                this.state = 'PLAYING';
                this.updateHUD();
            });
        }

        const btnBackTitle = document.getElementById('btnBackTitle');
        if (btnBackTitle) {
            btnBackTitle.addEventListener('click', () => {
                document.getElementById('gameOverDialog').close();
                this.state = 'TITLE';
                this.buildWorld(this.WORLDS[0]);
                const overlay = document.getElementById('titleOverlay');
                if (overlay) overlay.classList.remove('hidden');
                this.updateHUD();
            });
        }
    }

    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'ISOMETRIC' ? 'CHASE' : 'ISOMETRIC';
        localStorage.setItem('frogger3d_camera', this.cameraMode);
        this.syncToolButtons();
        this.showToast(
            this.cameraMode === 'CHASE' ? '🎬 切換：追尾越肩動作視角' : '🎥 切換：經典微縮斜俯視角',
            '隨時可按 [C] 鍵或右下角按鈕自由切換'
        );
    }

    cycleQuality() {
        const order = ['ULTRA', 'HIGH', 'PERF'];
        this.qualityLevel = order[(order.indexOf(this.qualityLevel) + 1) % order.length];
        localStorage.setItem('frogger3d_quality_v3', this.qualityLevel);
        this.applyResolutionAndComposer();
        this.syncToolButtons();

        const labels = {
            ULTRA: ['💎 已開啟：4K 超採樣華麗光暈模式', '2.5x 超高解析度 + 4x MSAA + 全開星芒光暈'],
            HIGH: ['✨ 已開啟：高清標準輝光模式', '兼顧細膩輝光與流暢效能'],
            PERF: ['⚡ 已開啟：極速省電模式', '關閉後製光暈以釋放最高幀率']
        };
        const [t, s] = labels[this.qualityLevel];
        this.showToast(t, s);
    }

    syncToolButtons() {
        const qualBtn = document.getElementById('qualityBtn');
        if (qualBtn) {
            qualBtn.textContent = this.qualityLevel === 'ULTRA' ? '💎' : (this.qualityLevel === 'HIGH' ? '✨' : '⚡');
            qualBtn.title = `畫質檔位：${this.qualityLevel} (點擊切換 4K超清 / 高清 / 省電)`;
        }
        const camBtn = document.getElementById('cameraBtn');
        if (camBtn) {
            camBtn.textContent = this.cameraMode === 'CHASE' ? '🎬' : '🎥';
        }
    }

    renderWorldDialog() {
        const grid = document.getElementById('worldGrid');
        if (!grid) return;
        grid.innerHTML = '';

        this.WORLDS.forEach((w, idx) => {
            const stars = this.worldStars[w.id] || 0;
            const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            const card = document.createElement('div');
            card.className = `modal-card ${idx === this.currentWorldIndex ? 'active' : ''}`;
            card.innerHTML = `
                <div class="card-head">
                    <span class="card-title">${w.name}</span>
                    <span class="card-stars">${starStr}</span>
                </div>
                <p class="card-desc">${w.desc}</p>
                <button class="action-pill-btn">立即前往挑戰 ➔</button>
            `;
            card.querySelector('button').addEventListener('click', () => {
                document.getElementById('worldDialog').close();
                this.startCampaign(idx);
            });
            grid.appendChild(card);
        });
    }

    renderWardrobeDialog() {
        const coinsEl = document.getElementById('wardrobeCoins');
        if (coinsEl) coinsEl.textContent = this.coins;

        const skinGrid = document.getElementById('skinGrid');
        if (skinGrid) {
            skinGrid.innerHTML = '';
            Models3D.SKINS.forEach(skin => {
                const owned = this.unlockedSkins.includes(skin.id);
                const equipped = this.equippedSkin === skin.id;
                const card = document.createElement('div');
                card.className = `modal-card ${equipped ? 'active' : ''}`;

                const btnLabel = equipped ? '✔ 穿戴中' : (owned ? '立即換裝' : `解鎖 (${skin.cost} 💰)`);
                card.innerHTML = `
                    <div class="card-head">
                        <span class="card-title">${skin.badge} ${skin.name}</span>
                    </div>
                    <p class="card-desc">${skin.desc}</p>
                    <button class="action-pill-btn ${equipped ? 'equipped' : ''}" ${(!owned && this.coins < skin.cost) ? 'disabled' : ''}>${btnLabel}</button>
                `;
                card.querySelector('button').addEventListener('click', () => {
                    if (owned) {
                        this.equippedSkin = skin.id;
                        this.saveData();
                        this.rebuildFrogModel();
                        window.soundEngine.playSwitch(0);
                        this.renderWardrobeDialog();
                    } else if (this.coins >= skin.cost) {
                        this.coins -= skin.cost;
                        this.unlockedSkins.push(skin.id);
                        this.equippedSkin = skin.id;
                        this.saveData();
                        this.rebuildFrogModel();
                        window.soundEngine.playPurchase();
                        this.unlockAchievement('fashion_frog');
                        this.updateHUD();
                        this.renderWardrobeDialog();
                    }
                });
                skinGrid.appendChild(card);
            });
        }

        const talentGrid = document.getElementById('talentGrid');
        if (talentGrid) {
            talentGrid.innerHTML = '';
            this.TALENT_DEFS.forEach(t => {
                const lv = this.talents[t.id] || 0;
                const isMax = lv >= t.maxLv;
                const cost = t.baseCost + lv * 20;
                const card = document.createElement('div');
                card.className = 'modal-card';
                card.innerHTML = `
                    <div class="card-head">
                        <span class="card-title">${t.name}</span>
                        <span class="card-stars">Lv.${lv} / ${t.maxLv}</span>
                    </div>
                    <p class="card-desc">${t.desc}</p>
                    <button class="action-pill-btn" ${(isMax || this.coins < cost) ? 'disabled' : ''}>
                        ${isMax ? '✨ 已達最高等級' : `強化升級 (${cost} 💰)`}
                    </button>
                `;
                card.querySelector('button').addEventListener('click', () => {
                    if (!isMax && this.coins >= cost) {
                        this.coins -= cost;
                        this.talents[t.id] = lv + 1;
                        if (t.id === 'vitality') {
                            this.lives = Math.min(this.getMaxLives(), this.lives + 1);
                        }
                        this.saveData();
                        window.soundEngine.playPurchase();
                        this.updateHUD();
                        this.renderWardrobeDialog();
                    }
                });
                talentGrid.appendChild(card);
            });
        }
    }

    renderAchieveDialog() {
        const grid = document.getElementById('achieveGrid');
        const prog = document.getElementById('achieveProgress');
        if (!grid) return;

        const unlockedCount = Object.keys(this.achievements).length;
        if (prog) prog.textContent = `${unlockedCount} / ${this.ACHIEVEMENT_DEFS.length}`;

        grid.innerHTML = '';
        this.ACHIEVEMENT_DEFS.forEach(a => {
            const done = !!this.achievements[a.id];
            const card = document.createElement('div');
            card.className = `modal-card ${done ? 'active' : 'locked'}`;
            card.innerHTML = `
                <div class="card-head">
                    <span class="card-title">${a.icon} ${a.name}</span>
                    <span class="card-stars">${done ? '✅ 已達成' : `+${a.reward} 💰`}</span>
                </div>
                <p class="card-desc">${a.desc}</p>
            `;
            grid.appendChild(card);
        });
    }

    openStageClearModal(stars, clearBonus, isFinalVictory) {
        const dlg = document.getElementById('stageClearDialog');
        if (!dlg) return;

        const titleEl = document.getElementById('clearTitle');
        const starsEl = document.getElementById('clearStars');
        const statsEl = document.getElementById('clearStats');
        const nextBtn = document.getElementById('btnNextStage');

        if (titleEl) {
            titleEl.textContent = isFinalVictory
                ? '🏆 傳奇誕生！擊敗機械巨鱷皇全境通關！'
                : `🎉 完美突破 ${this.currentWorld.name}！`;
        }
        if (starsEl) starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        if (statsEl) {
            statsEl.innerHTML = `
                <div>本關收集金幣：<strong>+${this.stageCoins} 💰</strong></div>
                <div>過關星級獎勵：<strong>+${stars * 5} 💰 / +${clearBonus} 分</strong></div>
                <div>傷亡次數：<strong>${this.deathsThisStage === 0 ? '零傷亡完美表現！' : `${this.deathsThisStage} 次`}</strong></div>
            `;
        }
        if (nextBtn) {
            nextBtn.textContent = isFinalVictory ? '🔄 榮耀凱旋（返回世界 1 巡禮）' : '🚀 前往下一世界 ➔';
        }
        if (!dlg.open) dlg.showModal();
    }

    openGameOverModal() {
        const dlg = document.getElementById('gameOverDialog');
        if (!dlg) return;
        const statsEl = document.getElementById('overStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div>挑戰世界：<strong>${this.currentWorld.name}</strong></div>
                <div>最終分數：<strong>${this.score}</strong>（最高紀錄：${this.highScore}）</div>
                <div>目前累計金幣：<strong>${this.coins} 💰</strong>（可至造型工坊強化天賦！）</div>
            `;
        }
        if (!dlg.open) dlg.showModal();
    }

    updateHUD() {
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('hudScore', this.score);
        setTxt('hudHighScore', this.highScore);
        setTxt('hudCoins', this.coins);
        setTxt('hudLives', '🐸'.repeat(Math.max(0, this.lives)));
        setTxt('hudWorld', this.currentWorld.name);
        setTxt('titleStarsTotal', `⭐ 累計星章：${this.getTotalStars()} / ${this.WORLDS.length * 3}`);

        const comboEl = document.getElementById('hudCombo');
        if (comboEl) {
            if (this.combo >= 2) {
                comboEl.classList.remove('hidden');
                comboEl.textContent = `🔥 ${this.combo} COMBO`;
            } else {
                comboEl.classList.add('hidden');
            }
        }

        const babyIconsEl = document.getElementById('hudBabyIcons');
        if (babyIconsEl) {
            const colors = ['#ff3366', '#00e5ff', '#ffdf00', '#c084fc', '#ff77cc'];
            let html = '';
            for (let i = 0; i < 5; i++) {
                const rescued = i < this.rescuedCount;
                html += `<span class="baby-dot ${rescued ? 'rescued' : ''}" style="--dot-color:${colors[i]}">🐸</span>`;
            }
            babyIconsEl.innerHTML = html;
        }
    }

    updateCooldownDOM() {
        const applyCd = (id, cur, max) => {
            const el = document.getElementById(id);
            if (!el) return;
            const ratio = Math.max(0, Math.min(1, cur / (max * this.getCooldownFactor())));
            el.style.transform = `scaleY(${ratio})`;
        };
        applyCd('cdSuperHop', this.cooldowns.superHop, this.maxCooldowns.superHop);
        applyCd('cdTongue', this.cooldowns.tongue, this.maxCooldowns.tongue);
        applyCd('cdCroak', this.cooldowns.croak, this.maxCooldowns.croak);
    }

    // ==================== 9. 主渲染循環 ====================
    animate(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        // 更新 GLSL 動態流體時間
        if (this.streamMaterial) {
            this.streamMaterial.uniforms.uTime.value = timestamp * 0.001;
        }

        if (this.invulnTimer > 0) {
            this.invulnTimer -= dt;
            this.frog.visible = Math.floor(timestamp / 80) % 2 === 0 || this.invulnTimer <= 0;
        }
        if (this.hazardSlowTimer > 0) this.hazardSlowTimer -= dt;
        if (this.fogClearTimer > 0) {
            this.fogClearTimer -= dt;
            this.scene.fog.density += (0.010 - this.scene.fog.density) * 0.08;
        } else {
            this.scene.fog.density += (this.currentWorld.fogDensity - this.scene.fog.density) * 0.05;
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0 && this.combo > 0) {
                this.combo = 0;
                this.updateHUD();
            }
        }

        ['superHop', 'tongue', 'croak'].forEach(k => {
            if (this.cooldowns[k] > 0) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
        });
        this.updateCooldownDOM();

        if (this.jumpAnim.active && timestamp - this.jumpAnim.startTime > 380) {
            const wasSuper = this.jumpAnim.type === 'SUPER';
            this.jumpAnim.active = false;
            this.frog.position.y = 0;
            this.onFrogLand(wasSuper);
        }

        const speedScale = this.hazardSlowTimer > 0 ? 0.38 : 1.0;

        // 水底錦鯉悠游更新
        this.koiList.forEach(k => {
            k.mesh.position.x += k.speed * dt;
            k.mesh.rotation.y = Math.sin(timestamp * 0.008 + k.phase) * 0.22;
            if (k.speed > 0 && k.mesh.position.x > 14) k.mesh.position.x = -14;
            else if (k.speed < 0 && k.mesh.position.x < -14) k.mesh.position.x = 14;
        });

        // 1. 載具與幽靈運動
        this.vehicles.forEach(v => {
            if (v.type === 'GHOST' && v.mesh.userData.banished) {
                v.respawnTimer -= dt;
                if (v.respawnTimer <= 0) {
                    v.mesh.userData.banished = false;
                    v.mesh.visible = true;
                }
                return;
            }

            v.mesh.position.x += v.baseSpeed * speedScale * dt;
            if (v.baseSpeed > 0 && v.mesh.position.x > 15.5) v.mesh.position.x = -15.5;
            else if (v.baseSpeed < 0 && v.mesh.position.x < -15.5) v.mesh.position.x = 15.5;

            if (v.mesh.userData.spinBall) {
                v.mesh.userData.spinBall.rotation.x += Math.abs(v.baseSpeed) * dt * 1.1;
            }
            if (v.mesh.userData.spinPart) {
                v.mesh.userData.spinPart.rotation.y += dt * 10;
            }
            if (v.type === 'GHOST') {
                v.mesh.position.y = Math.sin(timestamp * 0.005 + v.phase) * 0.25;
                v.mesh.position.z = v.z + Math.cos(timestamp * 0.003 + v.phase) * 0.35;
            } else if (v.mesh.userData.isHover) {
                v.mesh.position.y = Math.sin(timestamp * 0.007 + v.phase) * 0.12;
            }

            if (
                this.state === 'PLAYING' &&
                this.invulnTimer <= 0 &&
                this.frogPos.row === v.row &&
                this.frog.position.y < 1.35
            ) {
                const dx = Math.abs(this.frog.position.x - v.mesh.position.x);
                if (dx < v.halfLen + 0.28) {
                    this.triggerDeath('CRASH');
                }
            }
        });

        // 2. 賽博傳送帶
        const curRowInfo = this.gridMap[this.frogPos.row];
        if (
            this.state === 'PLAYING' &&
            !this.jumpAnim.active &&
            curRowInfo &&
            curRowInfo.conveyorSpeed !== 0
        ) {
            this.frog.position.x = Math.max(-10.5, Math.min(10.5, this.frog.position.x + curRowInfo.conveyorSpeed * dt));
        }

        // 3. 浮台與機關更新
        let standingPlatform = null;
        this.platforms.forEach(p => {
            p.mesh.position.x += p.baseSpeed * speedScale * dt;
            if (p.baseSpeed > 0 && p.mesh.position.x > 15.5) p.mesh.position.x = -15.5;
            else if (p.baseSpeed < 0 && p.mesh.position.x < -15.5) p.mesh.position.x = 15.5;

            if (p.type === 'DIVING_TURTLE' && p.canDive) {
                p.diveTimer -= dt;
                if (p.diveState === 'SURFACE' && p.diveTimer <= 0) {
                    p.diveState = 'WARN';
                    p.diveTimer = 1.25;
                } else if (p.diveState === 'WARN') {
                    const pulse = Math.abs(Math.sin(timestamp * 0.02));
                    p.mesh.userData.shellMats.forEach(m => m.emissive.setRGB(pulse * 1.1, pulse * 0.25, 0));
                    p.mesh.position.y = -0.16;
                    if (p.diveTimer <= 0) {
                        p.diveState = 'SUBMERGED';
                        p.diveTimer = 1.65;
                    }
                } else if (p.diveState === 'SUBMERGED') {
                    p.mesh.position.y = -0.68;
                    if (p.diveTimer <= 0) {
                        p.diveState = 'SURFACE';
                        p.diveTimer = 3.5;
                        p.mesh.position.y = -0.10;
                        p.mesh.userData.shellMats.forEach(m => m.emissive.setRGB(0, 0, 0));
                    }
                }
            }

            if (p.type === 'CROCODILE') {
                p.mouthTimer -= dt;
                if (p.mouthTimer <= 0) {
                    p.mouthOpen = !p.mouthOpen;
                    p.mouthTimer = p.mouthOpen ? 1.6 : 2.6;
                }
                const targetAngle = p.mouthOpen ? 0.55 : 0.02;
                p.mesh.userData.upperJaw.rotation.z += (targetAngle - p.mesh.userData.upperJaw.rotation.z) * 0.18;
            }

            if (p.type === 'BASALT_SLAB' && p.sunkTimer > 0) {
                p.sunkTimer -= dt;
                p.mesh.position.y = -0.75;
                if (p.sunkTimer <= 0) {
                    p.sinkProgress = 0;
                    p.mesh.position.y = -0.10;
                }
            }

            if (
                this.state === 'PLAYING' &&
                !this.jumpAnim.active &&
                this.frogPos.row === p.row &&
                !(p.type === 'DIVING_TURTLE' && p.diveState === 'SUBMERGED') &&
                !(p.type === 'BASALT_SLAB' && p.sunkTimer > 0)
            ) {
                const dx = this.frog.position.x - p.mesh.position.x;
                if (Math.abs(dx) < p.halfSpan + 0.25) standingPlatform = p;
            }
        });

        if (standingPlatform) {
            this.frog.position.x += standingPlatform.baseSpeed * speedScale * dt;
            if (standingPlatform.type === 'BASALT_SLAB') {
                standingPlatform.sinkProgress += dt;
                standingPlatform.mesh.position.x += Math.sin(timestamp * 0.06) * 0.02;
                standingPlatform.mesh.userData.crackMat.emissiveIntensity = 0.5 + standingPlatform.sinkProgress * 1.1;
                if (standingPlatform.sinkProgress >= 1.75) {
                    standingPlatform.sunkTimer = 2.4;
                    standingPlatform = null;
                }
            } else if (standingPlatform.type === 'CROCODILE' && standingPlatform.mouthOpen) {
                const dx = this.frog.position.x - standingPlatform.mesh.position.x;
                const headSide = standingPlatform.dir > 0
                    ? dx > (standingPlatform.halfSpan - 1.1)
                    : dx < -(standingPlatform.halfSpan - 1.1);
                if (headSide) this.triggerDeath('CRASH');
            }

            if (Math.abs(this.frog.position.x) > 11.6) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
            }
        } else if (
            this.state === 'PLAYING' &&
            !this.jumpAnim.active &&
            curRowInfo &&
            curRowInfo.type === 'WATER'
        ) {
            if (!this.isStandingOnSafeWater(this.frogPos.row)) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
            }
        }

        // 4. 食人花、間歇泉與水晶開關
        this.hazards.forEach(h => {
            h.timer += dt * speedScale;
            if (h.kind === 'PIRANHA') {
                const cycle = h.timer % 3.4;
                const snapping = cycle > 2.2;
                const openAmt = snapping ? 0.65 : 0.12 + Math.sin(timestamp * 0.008) * 0.08;
                h.mesh.userData.jawL.rotation.z = openAmt;
                h.mesh.userData.jawR.rotation.z = -openAmt;
                h.mesh.userData.head.scale.setScalar(snapping ? 1.28 : 1.0);

                if (
                    snapping &&
                    this.state === 'PLAYING' &&
                    this.invulnTimer <= 0 &&
                    this.frog.position.y < 1.2 &&
                    Math.hypot(this.frog.position.x - h.x, this.frog.position.z - h.z) < 1.15
                ) {
                    this.triggerDeath('CRASH');
                }
            } else if (h.kind === 'GEYSER') {
                const cycle = h.timer % 4.0;
                if (cycle < 2.0) {
                    h.mesh.userData.plume.scale.set(1, 0.01, 1);
                } else if (cycle < 2.8) {
                    const p = 0.15 + Math.abs(Math.sin(timestamp * 0.03)) * 0.22;
                    h.mesh.userData.plume.scale.set(1.1, p, 1.1);
                } else {
                    h.mesh.userData.plume.scale.set(1, 1.0, 1);
                    if (
                        this.state === 'PLAYING' &&
                        this.invulnTimer <= 0 &&
                        this.frog.position.y < 1.9 &&
                        Math.hypot(this.frog.position.x - h.x, this.frog.position.z - h.z) < 1.15
                    ) {
                        this.triggerDeath('LAVA');
                    }
                }
            }
        });

        this.switches.forEach(sw => {
            if (sw.cooldown > 0) sw.cooldown = Math.max(0, sw.cooldown - dt);
            sw.mesh.userData.orb.rotation.y += 0.045;
            sw.mesh.userData.ring.rotation.x += 0.035;
            sw.mesh.userData.orbMat.emissiveIntensity = sw.cooldown > 0 ? 0.15 : 1.0;
        });

        // 5. 金幣、螢火蟲與小萌蛙動畫
        this.coinsList.forEach(c => {
            if (!c.userData.collected) {
                if (c.userData.spinMesh) c.userData.spinMesh.rotation.z += 0.05;
                if (c.userData.star) c.userData.star.rotation.y += 0.07;
            }
        });
        this.fliesList.forEach(f => {
            if (!f.userData.collected) {
                f.userData.lWing.rotation.y = Math.sin(timestamp * 0.035) * 0.55;
                f.userData.rWing.rotation.y = -Math.sin(timestamp * 0.035) * 0.55;
                f.position.y = 1.18 + Math.sin(timestamp * 0.005) * 0.22;
            }
        });
        this.babyFrogs.forEach(b => {
            if (!b.rescued && b.mesh) {
                if (b.pulling) {
                    b.mesh.position.lerp(this.frog.position, 0.24);
                    if (this.frog.position.distanceTo(b.mesh.position) < 1.5) {
                        this.rescueBabyFrog(b);
                    }
                } else {
                    b.mesh.position.y = 0.22 + Math.abs(Math.sin(timestamp * 0.006)) * 0.26;
                }
            }
        });

        if (this.goalPortal && this.goalPortal.visible) {
            this.goalPortal.userData.ring.rotation.z += 0.025;
            if (this.goalPortal.userData.innerRing) {
                this.goalPortal.userData.innerRing.rotation.z -= 0.04;
            }
        }

        // 6. 主角拋物線、大跳彩虹星塵軌跡與隨身光源
        if (this.jumpAnim.active) {
            const elapsed = timestamp - this.jumpAnim.startTime;
            const p = Math.min(1, elapsed / this.jumpAnim.duration);

            this.frog.position.x = this.jumpAnim.startX + (this.jumpAnim.targetX - this.jumpAnim.startX) * p;
            this.frog.position.z = this.jumpAnim.startZ + (this.jumpAnim.targetZ - this.jumpAnim.startZ) * p;
            this.frog.position.y = Math.sin(p * Math.PI) * this.jumpAnim.peakY;

            // 超級大跳空中持續灑落七彩星芒軌跡！
            if (this.jumpAnim.type === 'SUPER' && ++this.rainbowTrailTick % 2 === 0) {
                this.spawnSparkleBurst(
                    this.frog.position.x,
                    this.frog.position.y + 0.3,
                    this.frog.position.z,
                    [0x00f5ff, 0xff00aa, 0xffe047],
                    3,
                    1.2
                );
            }

            if (this.frog.userData.visualRoot) {
                const stretch = 1 + Math.sin(p * Math.PI) * 0.24;
                this.frog.userData.visualRoot.scale.set(1 / Math.sqrt(stretch), stretch, stretch);
            }

            if (p >= 1) {
                const wasSuper = this.jumpAnim.type === 'SUPER';
                this.jumpAnim.active = false;
                this.frog.position.x = this.jumpAnim.targetX;
                this.frog.position.z = this.jumpAnim.targetZ;
                this.frog.position.y = 0;
                this.onFrogLand(wasSuper);
            }
        } else if (this.frog && this.frog.userData.visualRoot) {
            const vr = this.frog.userData.visualRoot;
            vr.scale.lerp(new THREE.Vector3(1, 1, 1), 0.22);
        }

        if (this.frog && this.frog.userData.auraRing) {
            this.frog.userData.auraRing.rotation.z += 0.02;
        }
        if (this.frog && this.frog.userData.throatSac) {
            this.frog.userData.throatSac.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.14);
        }

        // 主角動態點光源平滑呼吸與爆發衰減
        if (this.frogLight) {
            this.frogLightIntensity = Math.min(1.25, this.frogLightIntensity);
            this.frogLightIntensity += (0.35 - this.frogLightIntensity) * 0.09;
            this.frogLight.intensity = this.frogLightIntensity;
            this.frogLight.position.set(this.frog.position.x, this.frog.position.y + 1.5, this.frog.position.z);
        }

        if (this.tongueAnim.active && this.frog.userData.tongue) {
            const t = (timestamp - this.tongueAnim.startTime) / this.tongueAnim.duration;
            const reach = this.tongueAnim.reach;
            if (t < 0.45) {
                this.frog.userData.tongue.scale.set(1, 1, (t / 0.45) * reach);
            } else if (t < 1) {
                this.frog.userData.tongue.scale.set(1, 1, Math.max(0.001, ((1 - t) / 0.55) * reach));
            } else {
                this.tongueAnim.active = false;
                this.frog.userData.tongue.scale.set(1, 1, 0.001);
            }
        }

        if (this.frog && this.frog.userData.backpack) {
            this.frog.userData.backpack.children.forEach((child, idx) => {
                child.position.x = Math.sin(timestamp * 0.008 + idx * 0.9) * 0.08 * (idx + 1);
            });
        }

        if (this.compassTimer > 0 && this.compassTarget && !this.compassTarget.rescued) {
            this.compassTimer -= dt;
            this.compassArrow.visible = true;
            this.compassArrow.position.copy(this.frog.position);
            const dx = this.compassTarget.mesh.position.x - this.frog.position.x;
            const dz = this.compassTarget.mesh.position.z - this.frog.position.z;
            this.compassArrow.rotation.y = Math.atan2(-dx, -dz);
        } else {
            this.compassArrow.visible = false;
        }

        if (this.state === 'BOSS_FIGHT') {
            this.updateBoss(dt, timestamp);
        }

        // 7. 星芒粒子與光環更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.life -= dt;
            pt.vy -= 8.5 * dt;
            pt.sprite.position.x += pt.vx * dt;
            pt.sprite.position.y += pt.vy * dt;
            pt.sprite.position.z += pt.vz * dt;
            const s = Math.max(0.05, pt.initScale * pt.life * 1.3);
            pt.sprite.scale.set(s, s, 1);
            pt.mat.opacity = Math.max(0, pt.life * 1.3);
            if (pt.life <= 0) {
                this.scene.remove(pt.sprite);
                pt.mat.dispose();
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.scale += 10.2 * dt;
            r.opacity -= 1.65 * dt;
            r.mesh.scale.set(r.scale, r.scale, r.scale);
            r.mesh.material.opacity = Math.max(0, r.opacity);
            if (r.opacity <= 0) {
                this.scene.remove(r.mesh);
                r.geo.dispose();
                r.mat.dispose();
                this.ripples.splice(i, 1);
            }
        }

        if (this.weatherSprites) {
            const posAttr = this.weatherSprites.geometry.attributes.position;
            const spdAttr = this.weatherSprites.geometry.attributes.aSpeed;
            const mode = this.currentWorld.weatherMode;
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i);
                let x = posAttr.getX(i);
                const spd = spdAttr.getX(i);

                if (mode === 'EMBER' || mode === 'WISP') {
                    y += spd * 2.3 * dt;
                    x += Math.sin(timestamp * 0.002 + i) * 0.65 * dt;
                    if (y > 15) y = 0.2;
                } else if (mode === 'RAIN') {
                    y -= spd * 14.5 * dt;
                    if (y < 0) y = 15;
                } else {
                    y -= spd * 1.45 * dt;
                    x += Math.cos(timestamp * 0.0018 + i) * 0.85 * dt;
                    if (y < 0.2) y = 14;
                }
                posAttr.setXY(i, x, y);
            }
            posAttr.needsUpdate = true;
        }

        // 8. 4096 級動態軟陰影跟隨
        this.dirLight.position.set(this.frog.position.x * 0.5 + 14, 28, this.frog.position.z + 16);
        this.dirLight.target.position.set(this.frog.position.x * 0.5, 0, this.frog.position.z - 4);
        this.dirLight.target.updateMatrixWorld();

        // 9. 智慧電影運鏡
        if (this.state === 'TITLE') {
            const camAngle = timestamp * 0.00035;
            this.camera.position.set(Math.sin(camAngle) * 9.5, 9.2, 9.5 + Math.cos(camAngle) * 3.0);
            this.camera.lookAt(0, 0.8, -4.5);
        } else {
            let desiredX, desiredY, desiredZ, lookZ;
            if (this.state === 'BOSS_FIGHT') {
                desiredX = this.frog.position.x * 0.45;
                desiredY = 15.2;
                desiredZ = this.frog.position.z + 13.5;
                lookZ = this.frog.position.z - 4.8;
            } else if (this.cameraMode === 'CHASE') {
                desiredX = this.frog.position.x * 0.78;
                desiredY = 7.3 + this.frog.position.y * 0.35;
                desiredZ = this.frog.position.z + 8.6;
                lookZ = this.frog.position.z - 5.2;
            } else {
                desiredX = this.frog.position.x * 0.48;
                desiredY = 14.0 + this.frog.position.y * 0.25;
                desiredZ = this.frog.position.z + 13.0;
                lookZ = this.frog.position.z - 2.6;
            }

            if (this.screenShake > 0) {
                this.screenShake = Math.max(0, this.screenShake - dt * 1.8);
                desiredX += (Math.random() - 0.5) * this.screenShake * 1.6;
                desiredY += (Math.random() - 0.5) * this.screenShake * 1.2;
            }

            this.camera.position.x += (desiredX - this.camera.position.x) * 0.1;
            this.camera.position.y += (desiredY - this.camera.position.y) * 0.1;
            this.camera.position.z += (desiredZ - this.camera.position.z) * 0.1;
            this.camera.lookAt(this.frog.position.x * 0.38, 0.6, lookZ);
        }

        if (this.qualityLevel !== 'PERF' && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        requestAnimationFrame((t) => this.animate(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game3D = new Frogger3DGame();
});
