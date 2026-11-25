/**
 * Frogger 3D Odyssey - 旗艦 3D 冒險核心引擎 (Frogger3DGame v2)
 * 包含：
 * - UnrealBloomPass 霓虹輝光後製 + 畫質檔位切換 + 雙視角智慧運鏡
 * - 五大特色世界生態機關（潛水龜、滾石/食人花/鱷魚、可震散幽靈與動態迷霧、下沉玄武岩/熔岩噴泉、賽博傳送帶）
 * - 第 5 世界終極三階段 Boss 決戰：「機械巨鱷皇 Mecha-Swampy Rex」
 * - 預輸入緩衝 (Input Buffer)、Q 彈擠壓伸展、連擊倍率、3D 空間飄字與震屏特效
 * - 6 款 3D 造型工坊、3 項天賦升級、每關三星評級與 8 大成就圖鑑
 */

class Frogger3DGame {
    constructor() {
        this.container = document.getElementById('gameContainer');
        this.fxLayer = document.getElementById('fxLayer');
        this.toastContainer = document.getElementById('toastContainer');

        // 5 大主題世界配置
        this.WORLDS = [
            {
                id: 1,
                name: '世界 1：花園小溪',
                subtitle: 'Suburban Garden & Brook',
                desc: '避開割草車與玩具跑車，留意預警下潛的烏龜群，在櫻花微風中救出小萌蛙！',
                skyColor: 0x7dd3fc,
                fogColor: 0xbae6fd,
                fogDensity: 0.017,
                groundColor: 0x22c55e,
                altGroundColor: 0x16a34a,
                roadColor: 0x334155,
                waterColor: 0x0284c7,
                waterEmissive: 0x0369a1,
                waterType: 'WATER',
                weatherColor: 0xffb7c5,
                weatherMode: 'PETAL',
                trafficSpeed: 0.95,
                rows: 20
            },
            {
                id: 2,
                name: '世界 2：古代神廟',
                subtitle: 'Ancient Temple & Ruins',
                desc: '閃避符文滾石與張嘴巨鱷，小心安全島上的大嘴食人花，善用長舌啟動水晶機關！',
                skyColor: 0x14532d,
                fogColor: 0x166534,
                fogDensity: 0.020,
                groundColor: 0x4d7c0f,
                altGroundColor: 0x3f6212,
                roadColor: 0x57534e,
                waterColor: 0x0d9488,
                waterEmissive: 0x115e59,
                waterType: 'WATER',
                weatherColor: 0xbef264,
                weatherMode: 'SPORE',
                trafficSpeed: 1.12,
                rows: 22
            },
            {
                id: 3,
                name: '世界 3：幽靈古堡',
                subtitle: 'Haunted Manor & Graveyard',
                desc: '暗夜濃霧籠罩！按下 [Q] 超能蛙鳴可震散遊蕩幽靈並驅散紫霧照亮前路！',
                skyColor: 0x13072e,
                fogColor: 0x240b4c,
                fogDensity: 0.032,
                groundColor: 0x1e1b4b,
                altGroundColor: 0x312e81,
                roadColor: 0x27272a,
                waterColor: 0x6b21a8,
                waterEmissive: 0x581c87,
                waterType: 'POISON',
                weatherColor: 0xc084fc,
                weatherMode: 'WISP',
                trafficSpeed: 1.22,
                rows: 24
            },
            {
                id: 4,
                name: '世界 4：熔岩地穴',
                subtitle: 'Volcano Lava Caverns',
                desc: '玄武岩石板踩踏後會震動下沉！看準熔岩間歇泉噴發間隙，用超級大跳飛越火海！',
                skyColor: 0x2a0808,
                fogColor: 0x450a0a,
                fogDensity: 0.021,
                groundColor: 0x292524,
                altGroundColor: 0x1c1917,
                roadColor: 0x18181b,
                waterColor: 0xea580c,
                waterEmissive: 0xdc2626,
                waterType: 'LAVA',
                weatherColor: 0xff7b00,
                weatherMode: 'EMBER',
                trafficSpeed: 1.32,
                rows: 26
            },
            {
                id: 5,
                name: '世界 5：賽博科技塔',
                subtitle: 'Cyberpunk Neon Tower & Final Boss',
                desc: '突破懸浮飛車與霓虹加速帶，救齊 5 隻小萌蛙登上塔頂，迎戰終極頭目「機械巨鱷皇」！',
                skyColor: 0x040816,
                fogColor: 0x091128,
                fogDensity: 0.019,
                groundColor: 0x0f172a,
                altGroundColor: 0x1e293b,
                roadColor: 0x090d16,
                waterColor: 0x00f5d4,
                waterEmissive: 0x00bbf9,
                waterType: 'CYBER',
                weatherColor: 0x00f5ff,
                weatherMode: 'RAIN',
                trafficSpeed: 1.42,
                rows: 28
            }
        ];

        // 天賦升級定義
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

        // 8 大成就圖鑑定義
        this.ACHIEVEMENT_DEFS = [
            { id: 'first_rescue', icon: '🐣', name: '初試啼聲', desc: '成功救起第 1 隻迷失小萌蛙', reward: 15 },
            { id: 'tongue_sniper', icon: '👅', name: '隔空神舌', desc: '使用長舌隔空拉回遠處的小萌蛙', reward: 25 },
            { id: 'world_clear_1', icon: '🌸', name: '花園守護者', desc: '完成「世界 1：花園小溪」', reward: 20 },
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

        // 狀態: 'TITLE', 'PLAYING', 'BOSS_FIGHT', 'DYING', 'STAGE_CLEAR', 'GAME_OVER'
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

        // 連擊系統
        this.combo = 0;
        this.comboTimer = 0;

        // 畫質與視角模式
        this.highQuality = localStorage.getItem('frogger3d_quality') !== 'PERF';
        this.cameraMode = localStorage.getItem('frogger3d_camera') || 'ISOMETRIC'; // 'ISOMETRIC' | 'CHASE'
        this.screenShake = 0;

        // 技能冷卻（秒）
        this.cooldowns = { superHop: 0, tongue: 0, croak: 0 };
        this.maxCooldowns = { superHop: 2.2, tongue: 0.9, croak: 3.0 };

        // 場景容器陣列
        this.worldDisposables = [];
        this.gridMap = {};
        this.vehicles = [];
        this.platforms = [];
        this.hazards = [];
        this.switches = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.ripples = [];
        this.particles = [];
        this.weatherPoints = null;
        this.deathTimer = null;

        // 主角運動與預輸入緩衝
        this.frog = null;
        this.compassArrow = null;
        this.compassTimer = 0;
        this.frogPos = { col: 0, row: 0 };
        this.facingDir = { dCol: 0, dRow: 1 };
        this.bufferedMove = null;

        this.jumpAnim = {
            active: false,
            type: 'NORMAL',
            startTime: 0,
            duration: 155,
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
            reach: 5.5
        };

        // Boss 戰狀態
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
        if (Number.isNaN(this.coins)) this.coins = 20; // 新手迎賓金幣

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

    // ==================== 1. 初始化 Three.js 與 Bloom 後製 ====================
    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentWorld.skyColor);
        this.scene.fog = new THREE.FogExp2(this.currentWorld.fogColor, this.currentWorld.fogDensity);

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 180);
        this.camera.position.set(0, 15, 14);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.highQuality;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 環境半球光 + 動態跟隨平行光陰影
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.78);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.98);
        this.dirLight.position.set(14, 28, 18);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        const d = 22;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.dirLight.shadow.camera.near = 2;
        this.dirLight.shadow.camera.far = 75;
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);

        // UnrealBloomPass 輝光後製管線（若 CDN 載入成功自動啟用，否則優雅回退原生渲染）
        this.composer = null;
        this.bloomPass = null;
        if (window.THREE && THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            try {
                this.composer = new THREE.EffectComposer(this.renderer);
                const renderPass = new THREE.RenderPass(this.scene, this.camera);
                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    0.42, // strength
                    0.55, // radius
                    0.78  // threshold
                );
                this.composer.addPass(renderPass);
                this.composer.addPass(this.bloomPass);
            } catch (err) {
                this.composer = null;
            }
        }

        // 建立主角與 3D 方位指南光箭
        this.rebuildFrogModel();
        this.compassArrow = Models3D.createCompassArrow();
        this.scene.add(this.compassArrow);

        // 預建粒子幾何共用池
        this.sharedParticleGeo = new THREE.SphereGeometry(0.14, 6, 6);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.composer) {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            }
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
    }

    // ==================== 2. 建構五大主題關卡與微縮景觀 ====================
    buildWorld(world) {
        this.clearWorld();

        this.currentWorld = world;
        this.scene.background = new THREE.Color(world.skyColor);
        this.scene.fog.color.setHex(world.fogColor);
        this.scene.fog.density = world.fogDensity;

        if (this.bloomPass) {
            this.bloomPass.strength = (world.id >= 3) ? 0.56 : 0.36;
        }

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
            { hex: 0xff3355, name: '小紅' },
            { hex: 0x38bdf8, name: '小藍' },
            { hex: 0xfacc15, name: '小黃' },
            { hex: 0xc084fc, name: '小紫' },
            { hex: 0xf472b6, name: '小粉' }
        ];

        // 精心規劃每一列的屬性，確保馬路、安全島、河流節奏分明（不再出現後段全是水道的問題！）
        for (let r = 0; r < totalRows; r++) {
            const z = -r * this.GRID;
            let type = 'SAFE';

            if (r <= 1) {
                type = 'SAFE';
            } else if (world.id === 5 && r >= totalRows - 5) {
                // 世界 5 塔頂留出寬敞的 Boss 決戰競技場！
                type = (r === totalRows - 1) ? 'GOAL' : 'BOSS_ARENA';
            } else if (r === totalRows - 1) {
                type = 'GOAL';
            } else if (r === midRow || r === midRow + 1 || r === totalRows - 6) {
                type = 'SAFE';
            } else {
                // 依區段交替配置 ROAD 與 WATER，中間穿插安全緩衝列
                const block = r % 9;
                if (block === 0) type = 'SAFE';
                else if (block >= 1 && block <= 4) type = 'ROAD';
                else type = 'WATER';
            }

            this.gridMap[r] = { type, z, conveyorSpeed: 0 };
            this.buildRow(r, z, type, mapWidth, world, midRow);

            // 兩岸微縮模型景觀 (每隔 2 列佈置立體裝飾)
            if (r % 2 === 0) {
                [-1, 1].forEach(side => {
                    const cluster = Models3D.createBankCluster(world.id, side);
                    cluster.position.set(side * 12.6 + (Math.random() - 0.5) * 0.6, 0, z);
                    this.addWorldObject(cluster);
                });
            }

            // 佈置金幣與補血螢火蟲
            if (r > 1 && r < totalRows - 2 && type !== 'BOSS_ARENA') {
                if (Math.random() < 0.65) {
                    const coin = Models3D.createCoin();
                    const colX = (Math.floor(Math.random() * 9) - 4) * this.GRID;
                    coin.position.set(colX, 0.65, z);
                    this.addWorldObject(coin);
                    this.coinsList.push(coin);
                }
                if (Math.random() < 0.20) {
                    const fly = Models3D.createFly();
                    const colX = (Math.floor(Math.random() * 7) - 3) * this.GRID;
                    fly.position.set(colX, 1.15, z);
                    this.addWorldObject(fly);
                    this.fliesList.push(fly);
                }
            }
        }

        // 放置 5 隻走失小萌蛙（優先放在風景各異的河岸/安全帶或獨立睡蓮座，保證不與卡車重疊穿模！）
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

        // 中途存檔點蓮花燈座
        this.checkpointRowTarget = midRow;
        const cpMarker = Models3D.createHazardProp('SWITCH_ORB');
        cpMarker.position.set(0, 0, -midRow * this.GRID);
        cpMarker.scale.set(0.85, 0.85, 0.85);
        this.addWorldObject(cpMarker);
        this.checkpointMesh = cpMarker;

        // 終點傳送荷花陣
        const goalZ = -(totalRows - 1) * this.GRID;
        this.goalPortal = Models3D.createGoalPortal(world.id);
        this.goalPortal.position.set(0, 0, goalZ);
        this.addWorldObject(this.goalPortal);

        // 建立該世界的動態氣候粒子系統
        this.buildWeatherParticles(world);

        // 隱藏 Boss 血條
        this.setBossHudVisible(false);

        this.resetFrog(true);
        this.updateHUD();
    }

    buildRow(row, z, type, mapWidth, world, midRow) {
        if (type === 'ROAD') {
            const roadGeo = new THREE.BoxGeometry(mapWidth, 0.32, this.GRID * 0.97);
            const roadMat = new THREE.MeshStandardMaterial({ color: world.roadColor, roughness: 0.82 });
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(0, -0.16, z);
            road.receiveShadow = true;
            this.addWorldObject(road);

            // 車道標線（賽博世界為發光青色能量線）
            const dashColor = world.id === 5 ? 0x00f5ff : (world.id === 4 ? 0xff5500 : 0x94a3b8);
            const dashMat = new THREE.MeshBasicMaterial({ color: dashColor });
            for (let dx = -10; dx <= 10; dx += 4) {
                const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.12), dashMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(dx, 0.01, z);
                this.addWorldObject(dash);
            }

            // 世界 5：部分車道附帶霓虹橫向加速傳送帶！
            if (world.id === 5 && row % 2 === 1) {
                const cDir = (row % 4 === 1) ? 1 : -1;
                this.gridMap[row].conveyorSpeed = cDir * 1.65;
            }

            // 依世界主題挑選專屬載具
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
            const isLava = world.waterType === 'LAVA';
            const isCyber = world.waterType === 'CYBER';
            const isPoison = world.waterType === 'POISON';

            const waterGeo = new THREE.PlaneGeometry(mapWidth, this.GRID * 0.99);
            waterGeo.rotateX(-Math.PI / 2);
            const waterMat = new THREE.MeshStandardMaterial({
                color: world.waterColor,
                emissive: world.waterEmissive,
                emissiveIntensity: isLava ? 0.82 : (isCyber ? 0.6 : (isPoison ? 0.45 : 0.18)),
                roughness: 0.18,
                transparent: !isLava,
                opacity: isLava ? 1.0 : 0.88
            });
            const water = new THREE.Mesh(waterGeo, waterMat);
            water.position.set(0, -0.22, z);
            water.receiveShadow = true;
            this.addWorldObject(water);

            const dir = (row % 2 === 0) ? 1 : -1;
            const speed = dir * (1.7 + (row % 3) * 0.55) * (world.trafficSpeed * 0.85);
            const platSpec = this.pickPlatformSpec(world.id, row);
            const count = 4;
            const spacing = 30 / count;

            for (let i = 0; i < count; i++) {
                const pMesh = Models3D.createPlatform(platSpec.type, platSpec.size);
                const startX = -14 + i * spacing + (Math.random() * 1.1);
                pMesh.position.set(startX, -0.12, z);
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
                    // 潛水龜狀態
                    canDive: platSpec.type === 'DIVING_TURTLE' && (i % 2 === 0),
                    diveTimer: 2.5 + i * 1.4,
                    diveState: 'SURFACE', // 'SURFACE' | 'WARN' | 'SUBMERGED'
                    // 巨鱷張嘴狀態
                    mouthOpen: false,
                    mouthTimer: 1.5 + i * 0.9,
                    // 下沉玄武岩狀態
                    sinkProgress: 0,
                    sunkTimer: 0
                });
            }
        } else {
            // SAFE / GOAL / BOSS_ARENA 陸地磚
            const isArena = type === 'BOSS_ARENA';
            const color = isArena
                ? 0x1e1b4b
                : ((row % 2 === 0) ? world.groundColor : world.altGroundColor);
            const groundGeo = new THREE.BoxGeometry(mapWidth, 0.4, this.GRID);
            const groundMat = new THREE.MeshStandardMaterial({
                color,
                roughness: isArena ? 0.35 : 0.68,
                metalness: isArena ? 0.5 : 0.05
            });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.position.set(0, -0.2, z);
            ground.receiveShadow = true;
            this.addWorldObject(ground);

            if (isArena) {
                // Boss 競技場霓虹邊框格線
                const line = new THREE.Mesh(
                    new THREE.PlaneGeometry(22, 0.10),
                    new THREE.MeshBasicMaterial({ color: 0xff007f })
                );
                line.rotation.x = -Math.PI / 2;
                line.position.set(0, 0.01, z + this.GRID * 0.48);
                this.addWorldObject(line);
            }

            // 在非起點、非存檔列的安全島佈置世界專屬定點機關與水晶開關！
            if (type === 'SAFE' && row > 2 && row !== midRow && row < world.rows - 2) {
                if (world.id === 2) {
                    // 神廟大嘴食人花
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
                            timer: idx * 1.4,
                            active: false
                        });
                    });
                } else if (world.id === 4) {
                    // 火山熔岩間歇噴泉
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
                            timer: idx * 1.6,
                            state: 'IDLE' // 'IDLE' | 'WARN' | 'ERUPT'
                        });
                    });
                }

                // 放置可用長舌或踩踏觸發的「時間緩速水晶機關」
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
        if (worldId === 1) {
            return ['LAWNMOWER', 'TOY_RACER', 'PICKUP'][row % 3];
        } else if (worldId === 2) {
            return (row % 2 === 0) ? 'BOULDER' : 'TEMPLE_CHARIOT';
        } else if (worldId === 3) {
            return (row % 2 === 0) ? 'GHOST' : 'HEARSE';
        } else if (worldId === 4) {
            return (row % 3 === 0) ? 'LAVA_TRAIN' : 'MAGMA_BEETLE';
        } else {
            return (row % 2 === 0) ? 'HOVER_CAR' : 'CYBER_DRONE';
        }
    }

    pickPlatformSpec(worldId, row) {
        if (worldId === 1) {
            if (row % 3 === 0) return { type: 'DIVING_TURTLE', size: 3.6 };
            if (row % 2 === 0) return { type: 'LOG', size: 3.9 };
            return { type: 'LILYPAD', size: 1.12 };
        } else if (worldId === 2) {
            if (row % 3 === 0) return { type: 'CROCODILE', size: 4.1 };
            if (row % 2 === 0) return { type: 'STONE_RAFT', size: 3.6 };
            return { type: 'DIVING_TURTLE', size: 3.2 };
        } else if (worldId === 3) {
            return (row % 2 === 0) ? { type: 'COFFIN_RAFT', size: 3.7 } : { type: 'LILYPAD', size: 1.15 };
        } else if (worldId === 4) {
            return { type: 'BASALT_SLAB', size: (row % 2 === 0) ? 3.5 : 2.8 };
        } else {
            return { type: 'HOLO_PAD', size: (row % 2 === 0) ? 3.6 : 2.7 };
        }
    }

    buildWeatherParticles(world) {
        const count = this.highQuality ? 110 : 45;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = Math.random() * 14;
            positions[i * 3 + 2] = -Math.random() * (world.rows * this.GRID);
            speeds[i] = 0.6 + Math.random() * 1.4;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const mat = new THREE.PointsMaterial({
            color: world.weatherColor,
            size: world.weatherMode === 'RAIN' ? 0.24 : 0.28,
            transparent: true,
            opacity: 0.82
        });
        this.weatherPoints = new THREE.Points(geo, mat);
        this.addWorldObject(this.weatherPoints);
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

        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];

        if (this.boss) {
            if (this.boss.mesh) this.scene.remove(this.boss.mesh);
            if (this.boss.laserMesh) this.scene.remove(this.boss.laserMesh);
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
        this.hazards = [];
        this.switches = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.weatherPoints = null;
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

    // ==================== 3. 操控與預輸入緩衝 ====================
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

        // 底部三大超能力按鈕
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

        // 行動端虛擬十字鍵
        bindClick('dpadUp', () => this.requestHop(0, 1));
        bindClick('dpadDown', () => this.requestHop(0, -1));
        bindClick('dpadLeft', () => this.requestHop(-1, 0));
        bindClick('dpadRight', () => this.requestHop(1, 0));

        // 螢幕滑動手勢
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
            // 預輸入緩衝：跳躍進行過 35% 時記錄下一步，落地瞬間無縫起跳！
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
        if (dRow > 0) this.frog.rotation.y = 0;              // 面朝 -Z (正前方)
        else if (dRow < 0) this.frog.rotation.y = Math.PI;   // 面朝 +Z (後方)
        else if (dCol < 0) this.frog.rotation.y = Math.PI / 2; // 面朝 -X (左側)
        else if (dCol > 0) this.frog.rotation.y = -Math.PI / 2;// 面朝 +X (右側)
    }

    // ==================== 4. 跳躍與三大戰術超能力 ====================
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
        this.jumpAnim.peakY = 1.12;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);

        // 連擊與推進加分
        if (dRow > 0 && targetRow > this.highestRowReached) {
            this.highestRowReached = targetRow;
            this.bumpCombo();
            this.addScore(15);
        } else {
            this.comboTimer = Math.max(this.comboTimer, 1.8);
        }

        // 造型跳躍粒子拖尾
        this.spawnBurst(
            this.frog.position.x,
            0.2,
            this.frog.position.z,
            this.frog.userData.trailColor || 0x4ade80,
            6,
            2.2
        );

        const pan = this.frog.position.x / 12;
        window.soundEngine.playHop(this.combo, pan);
    }

    // 技能 1：超級大跳（越過 2 格障礙，落地釋放衝擊震波！）
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
        this.jumpAnim.duration = 255;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetX;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 2.65;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);
        this.cooldowns.superHop = this.maxCooldowns.superHop * this.getCooldownFactor();

        if (targetRow > this.highestRowReached) {
            this.highestRowReached = targetRow;
            this.bumpCombo();
        }

        this.spawnBurst(this.frog.position.x, 0.3, this.frog.position.z, 0x00f5ff, 12, 3.5);
        window.soundEngine.playSuperHop(this.frog.position.x / 12);
        this.addScore(35);
    }

    // 技能 2：長舌抓捕（自動扇形鎖定面朝方向：抓金幣、螢火蟲、隔空拉小青蛙、啟動水晶開關、扯下 Boss 核心！）
    tongueGrab() {
        if (this.tongueAnim.active || (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT')) return;
        if (this.cooldowns.tongue > 0) return;

        const range = this.getTongueRange();
        this.tongueAnim.active = true;
        this.tongueAnim.startTime = performance.now();
        this.tongueAnim.reach = range;
        this.cooldowns.tongue = this.maxCooldowns.tongue * this.getCooldownFactor();

        const pan = this.frog.position.x / 12;
        window.soundEngine.playTongue(pan);

        // 計算面朝單位向量 (注意 row 增加對應 -Z)
        const forward = new THREE.Vector3(
            this.facingDir.dCol,
            0,
            -this.facingDir.dRow
        ).normalize();
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

        // 1. 抓金幣
        this.coinsList.forEach(coin => {
            if (!coin.userData.collected && inTongueCone(coin.position, range, 0.5)) {
                this.collectCoin(coin, 3);
            }
        });

        // 2. 抓補血螢火蟲
        this.fliesList.forEach(fly => {
            if (!fly.userData.collected && inTongueCone(fly.position, range, 0.5)) {
                this.collectFly(fly);
            }
        });

        // 3. 隔空救援遠處小萌蛙！
        this.babyFrogs.forEach(b => {
            if (!b.rescued && !b.pulling && inTongueCone(b.mesh.position, range + 0.8, 0.48)) {
                const dist = this.frog.position.distanceTo(b.mesh.position);
                b.pulling = true;
                window.soundEngine.playGrappleHit(pan);
                this.spawnFloatingText('👅 隔空神舌救援!', b.mesh.position, '#ff77cc');
                if (dist > 2.4) {
                    this.unlockAchievement('tongue_sniper');
                }
            }
        });

        // 4. 遠距觸發時間緩速水晶機關！
        this.switches.forEach(sw => {
            if (sw.cooldown <= 0 && inTongueCone(sw.mesh.position, range + 0.6, 0.45)) {
                this.activateSwitch(sw);
            }
        });

        // 5. Boss 戰：扯出機械巨鱷皇暴露的超載能量核心！
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

    // 技能 3：超能蛙鳴（3D 指南針鎖定小青蛙 + 震退幽靈 + 驅散濃霧 + 彈反 Boss 電漿球 + 短暫震懾車流！）
    powerCroak() {
        if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;
        if (this.cooldowns.croak > 0) return;

        this.cooldowns.croak = this.maxCooldowns.croak * this.getCooldownFactor();
        const pan = this.frog.position.x / 12;
        window.soundEngine.playCroak(pan);

        // 喉部氣囊鼓起特效
        if (this.frog.userData.throatSac) {
            this.frog.userData.throatSac.scale.set(1.65, 1.65, 1.65);
        }

        // 雙層聲波擴散光環
        [0x00ffaa, 0x00f5ff].forEach((color, idx) => {
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, color, idx * 0.4);
        });

        // 1. 短暫緩速周圍車輛 1.8 秒
        this.hazardSlowTimer = Math.max(this.hazardSlowTimer, 1.8);

        // 2. 世界 3 幽靈古堡：震散周圍幽靈 + 驅散紫霧照亮視野！
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
                    this.spawnBurst(v.mesh.position.x, 1.0, v.mesh.position.z, 0xc084fc, 16, 4.2);
                    this.spawnFloatingText('👻 震散幽靈 +120!', v.mesh.position, '#c084fc');
                    this.addScore(120);
                }
            }
        });
        if (banishedCount > 0) {
            this.unlockAchievement('ghost_buster');
        }

        // 3. Boss 戰：震飛並彈反追蹤電漿球回擊 Boss！
        if (this.state === 'BOSS_FIGHT' && this.boss) {
            this.boss.orbs.forEach(orb => {
                if (!orb.deflected && this.frog.position.distanceTo(orb.mesh.position) < 5.6) {
                    orb.deflected = true;
                    window.soundEngine.playGhostPoof(0);
                    orb.mesh.children[0].material.color.setHex(0x00ffaa);
                    this.spawnFloatingText('⚡ 聲波完美彈反!', orb.mesh.position, '#00ffaa');
                }
            });
        }

        // 4. 啟動 3D 方位指南光箭指向最近未獲救的小萌蛙
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
            this.compassTimer = 3.5;
            if (nearestBaby.mesh.userData.beacon) {
                nearestBaby.mesh.userData.beacon.material.opacity = 0.95;
                nearestBaby.mesh.scale.set(1.45, 1.45, 1.45);
                setTimeout(() => {
                    if (nearestBaby && !nearestBaby.rescued && nearestBaby.mesh) {
                        nearestBaby.mesh.scale.set(1, 1, 1);
                        if (nearestBaby.mesh.userData.beacon) {
                            nearestBaby.mesh.userData.beacon.material.opacity = 0.36;
                        }
                    }
                }, 1400);
            }
        }
    }

    // ==================== 5. 落地、救援、機關與世界 5 Boss 戰 ====================
    onFrogLand(wasSuperHop = false) {
        // 落地 Q 彈壓縮回饋
        if (this.frog.userData.visualRoot) {
            this.frog.userData.visualRoot.scale.set(1.26, 0.72, 1.22);
        }

        // 超級大跳落地釋放黃金震波！
        if (wasSuperHop) {
            window.soundEngine.playStomp(this.frog.position.x / 12);
            this.spawnShockRing(this.frog.position.x, this.frog.position.z, 0xfacc15, 0.2);
            this.screenShake = Math.max(this.screenShake, 0.22);

            // 大跳震波若靠近 Boss 可直接震裂護甲！
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

        // 檢查是否抵達中途存檔點
        if (this.checkpointRow === 0 && row >= this.checkpointRowTarget && this.state === 'PLAYING') {
            this.checkpointRow = this.checkpointRowTarget;
            window.soundEngine.playSwitch(0);
            this.spawnBurst(0, 0.8, -this.checkpointRow * this.GRID, 0x00ffaa, 18, 4.0);
            this.spawnFloatingText('🚩 中途存檔點已啟動!', this.frog.position, '#00ffaa');
        }

        // 檢查水晶機關踩踏
        this.switches.forEach(sw => {
            if (sw.cooldown <= 0 && this.frog.position.distanceTo(sw.mesh.position) < 1.5) {
                this.activateSwitch(sw);
            }
        });

        // 拾取金幣與螢火蟲
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

        // 救援小萌蛙
        this.checkRescue();

        // 世界 5：抵達塔頂競技場且救齊 5 隻小萌蛙 ➔ 觸發「機械巨鱷皇」終極 Boss 決戰！
        if (this.currentWorld.id === 5 && this.state === 'PLAYING' && row >= this.currentWorld.rows - 5) {
            if (this.rescuedCount >= 5 && !this.boss) {
                this.startBossBattle();
                return;
            } else if (this.rescuedCount < 5) {
                this.spawnFloatingText(`還差 ${5 - this.rescuedCount} 隻小萌蛙才能開啟決戰!`, this.frog.position, '#facc15');
                this.powerCroak();
            }
        }

        // 世界 1~4：抵達終點傳送荷花陣
        if (rowInfo.type === 'GOAL' && this.currentWorld.id < 5) {
            if (this.rescuedCount >= 5) {
                this.completeStage();
            } else {
                this.spawnFloatingText(`尚有 ${5 - this.rescuedCount} 隻小萌蛙等待救援!`, this.frog.position, '#facc15');
                this.powerCroak();
            }
            return;
        }

        // 河流/熔岩安全落腳判定
        if (rowInfo.type === 'WATER') {
            if (!this.isStandingOnSafeWater(row)) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
                return;
            }
        }

        // 執行預輸入緩衝的下一步跳躍！
        if (this.bufferedMove && (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT')) {
            const next = this.bufferedMove;
            this.bufferedMove = null;
            this.hop(next.dCol, next.dRow);
        }
    }

    isStandingOnSafeWater(row) {
        // 1. 檢查未獲救小萌蛙的浮水蓮台（避免救蛙時落水）
        for (const b of this.babyFrogs) {
            if (!b.rescued && b.row === row && Math.abs(this.frog.position.x - b.mesh.position.x) < 1.25) {
                return true;
            }
        }
        // 2. 檢查漂浮平台
        for (const p of this.platforms) {
            if (p.row === row) {
                if (p.type === 'DIVING_TURTLE' && p.diveState === 'SUBMERGED') continue;
                if (p.type === 'BASALT_SLAB' && p.sunkTimer > 0) continue;

                const dx = this.frog.position.x - p.mesh.position.x;
                if (Math.abs(dx) < p.halfSpan + 0.25) {
                    // 巨鱷張嘴時踩在頭部會被咬！
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
        this.spawnShockRing(sw.x, sw.z, 0x00f5ff, 0.2);
        this.spawnBurst(sw.x, 0.9, sw.z, 0x00f5ff, 16, 3.8);
        this.spawnFloatingText('⏳ 時空緩速機關啟動 (5.5秒)!', sw.mesh.position, '#00f5ff');
        this.addScore(100);
    }

    collectCoin(coin, amount = 1) {
        coin.userData.collected = true;
        coin.visible = false;
        this.coins += amount;
        this.stageCoins += amount;
        this.saveData();
        window.soundEngine.playCoin(this.combo, coin.position.x / 12);
        this.spawnBurst(coin.position.x, 0.65, coin.position.z, 0xffd700, 10, 3.0);
        this.spawnFloatingText(`+${amount} 💰`, coin.position, '#ffd700');
        this.addScore(50 * amount);
        this.updateHUD();
    }

    collectFly(fly) {
        fly.userData.collected = true;
        fly.visible = false;
        const maxHp = this.getMaxLives();
        this.lives = Math.min(maxHp, this.lives + 1);
        window.soundEngine.playFirefly(fly.position.x / 12);
        this.spawnBurst(fly.position.x, 1.1, fly.position.z, 0xa3e635, 14, 3.4);
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

        window.soundEngine.playRescue(this.rescuedCount);
        this.bumpCombo();
        this.addScore(300);
        this.unlockAchievement('first_rescue');

        this.spawnBurst(b.mesh.position.x, 0.6, b.mesh.position.z, b.info.hex, 20, 4.5);
        this.spawnFloatingText(`🎉 救出${b.info.name}! (${this.rescuedCount}/5)`, b.mesh.position, '#ffffff');

        if (b.mesh.userData.beacon) b.mesh.remove(b.mesh.userData.beacon);
        if (b.mesh.userData.pad) b.mesh.remove(b.mesh.userData.pad);
        if (b.mesh.userData.bodyMesh) {
            // 背在主角背上時轉為面朝 -Z 前方
            b.mesh.userData.bodyMesh.rotation.y = Math.PI;
        }

        b.mesh.scale.set(0.56, 0.56, 0.56);
        this.scene.remove(b.mesh);
        b.mesh.position.set(0, (this.rescuedCount - 1) * 0.34, 0);
        this.frog.userData.backpack.add(b.mesh);

        this.updateHUD();

        if (this.rescuedCount >= 5 && this.goalPortal) {
            this.goalPortal.userData.beam.visible = true;
            this.showToast('✨ 5 隻小萌蛙全數獲救！', '終點傳送光柱已開啟，快衝向最頂端！');
        }
    }

    // ==================== 6. 終極頭目戰：機械巨鱷皇 ====================
    startBossBattle() {
        this.state = 'BOSS_FIGHT';
        if (this.goalPortal) this.goalPortal.visible = false;

        const arenaTopZ = -(this.currentWorld.rows - 1) * this.GRID - 1.2;
        const bossMesh = Models3D.createMechaBoss();
        bossMesh.position.set(0, 0, arenaTopZ);
        this.scene.add(bossMesh);

        // 橫掃雷射預警與光束模型
        const laserGeo = new THREE.BoxGeometry(24, 0.45, 0.55);
        const laserMat = new THREE.MeshBasicMaterial({
            color: 0xff0055,
            transparent: true,
            opacity: 0.0
        });
        const laserMesh = new THREE.Mesh(laserGeo, laserMat);
        laserMesh.visible = false;
        this.scene.add(laserMesh);

        this.boss = {
            mesh: bossMesh,
            hp: 100,
            maxHp: 100,
            phase: 'PATROL', // 'PATROL' | 'LASER_WARN' | 'LASER_FIRE' | 'CORE_OPEN'
            stateTimer: 2.8,
            orbCooldown: 1.4,
            coreExposed: false,
            orbs: [],
            laserMesh,
            laserRow: this.currentWorld.rows - 4,
            hitFlash: 0
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

        // 上顎張合動畫與核心自轉
        const targetJawAngle = b.coreExposed ? -0.68 : -0.05;
        const jaw = b.mesh.userData.upperJawPivot;
        jaw.rotation.x += (targetJawAngle - jaw.rotation.x) * 0.16;
        b.mesh.userData.coreMesh.visible = b.coreExposed;
        if (b.coreExposed) {
            b.mesh.userData.coreMesh.rotation.y += 0.09;
            b.mesh.userData.coreMesh.rotation.x += 0.06;
        }
        b.mesh.userData.shieldRing.rotation.z += 0.03 * rageMult;

        // 狀態機切換
        if (b.phase === 'PATROL') {
            // 左右巡弋並發射電漿追蹤球
            const targetX = Math.sin(timestamp * 0.0016 * rageMult) * 6.8;
            b.mesh.position.x += (targetX - b.mesh.position.x) * 0.06;

            if (b.orbCooldown <= 0) {
                this.spawnBossOrb();
                b.orbCooldown = b.hp <= 45 ? 1.35 : 1.9;
            }

            if (b.stateTimer <= 0) {
                if (Math.random() < 0.55) {
                    // 進入張嘴暴露弱點階段！
                    b.phase = 'CORE_OPEN';
                    b.coreExposed = true;
                    b.stateTimer = 4.0;
                    window.soundEngine.playBossRoar();
                    this.updateBossHud('🎯 能量核心暴露！快靠近按 [E] 長舌抓捕 或 [空白鍵] 重踏震波！');
                } else {
                    // 進入橫掃雷射預警階段！
                    b.phase = 'LASER_WARN';
                    b.laserRow = (this.currentWorld.rows - 5) + Math.floor(Math.random() * 3);
                    b.laserMesh.position.set(0, 0.55, -b.laserRow * this.GRID);
                    b.laserMesh.visible = true;
                    b.laserMesh.scale.set(1, 0.25, 0.25);
                    b.laserMesh.material.color.setHex(0xfacc15);
                    b.laserMesh.material.opacity = 0.65;
                    b.stateTimer = 1.15;
                    window.soundEngine.playWarningTick();
                    this.updateBossHud('⚠️ 雷射蓄力鎖定車道！快跳開或按 [空白鍵] 超級大跳飛越！');
                }
            }
        } else if (b.phase === 'LASER_WARN') {
            b.laserMesh.material.opacity = 0.35 + Math.abs(Math.sin(timestamp * 0.025)) * 0.55;
            if (b.stateTimer <= 0) {
                b.phase = 'LASER_FIRE';
                b.stateTimer = 0.85;
                b.laserMesh.scale.set(1, 1.3, 1.3);
                b.laserMesh.material.color.setHex(0xff0055);
                b.laserMesh.material.opacity = 0.95;
                this.screenShake = Math.max(this.screenShake, 0.3);
                window.soundEngine.playLavaBurn(0);
            }
        } else if (b.phase === 'LASER_FIRE') {
            // 若玩家在雷射列且沒有高跳躍過（y < 1.1），觸發受傷
            if (
                this.invulnTimer <= 0 &&
                this.frogPos.row === b.laserRow &&
                this.frog.position.y < 1.05
            ) {
                this.triggerDeath('LAVA');
            }
            if (b.stateTimer <= 0) {
                b.laserMesh.visible = false;
                // 雷射過熱後必定露出核心讓玩家反擊！
                b.phase = 'CORE_OPEN';
                b.coreExposed = true;
                b.stateTimer = 3.8;
                this.updateBossHud('🎯 雷射過熱核心暴露！快上前按 [E] 長舌扯出核心重創牠！');
            }
        } else if (b.phase === 'CORE_OPEN') {
            // Boss 緩慢靠近競技場前緣方便玩家長舌命中
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

        // 更新電漿球運動與彈反判定
        for (let i = b.orbs.length - 1; i >= 0; i--) {
            const orb = b.orbs[i];
            orb.mesh.rotation.x += 0.1;
            orb.mesh.rotation.y += 0.12;

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
                // 命中玩家判定
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
        this.screenShake = Math.max(this.screenShake, 0.45);
        window.soundEngine.playBossHit();

        this.spawnBurst(this.boss.mesh.position.x, 1.5, this.boss.mesh.position.z + 1.5, 0xffea00, 26, 6.0);
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
        this.boss.laserMesh.visible = false;

        // 連環絢麗煙火爆炸
        const bx = this.boss.mesh.position.x;
        const bz = this.boss.mesh.position.z;
        [0xff007f, 0x00f5ff, 0xffea00, 0x4ade80].forEach((c, idx) => {
            setTimeout(() => {
                this.spawnBurst(bx + (idx - 1.5) * 1.4, 1.8, bz + 1.0, c, 32, 7.5);
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
        }, 1200);
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

    // ==================== 7. 過關結算、三星評級與死亡處理 ====================
    completeStage(isFinalVictory = false) {
        if (this.state === 'STAGE_CLEAR') return;
        this.state = 'STAGE_CLEAR';
        window.soundEngine.playStageWin();

        // 計算三星評價：1星=過關，2星=本關金幣 >= 6，3星=零傷亡完美過關
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
        if (stars > prevStars) {
            this.worldStars[this.currentWorld.id] = stars;
        }

        const clearBonus = 1000 + stars * 250;
        this.coins += stars * 5;
        this.addScore(clearBonus);
        this.saveData();
        this.updateHUD();

        // 放慶祝煙火粒子
        this.spawnBurst(this.frog.position.x, 1.5, this.frog.position.z, 0xffd700, 30, 6.0);
        this.spawnBurst(this.frog.position.x, 1.8, this.frog.position.z, 0x00f5ff, 24, 5.2);

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
            this.spawnBurst(this.frog.position.x, 0.4, this.frog.position.z, 0xff4500, 22, 4.8);
        } else if (type === 'WATER') {
            window.soundEngine.playSplash(pan);
            this.frog.position.y = -0.6;
            this.spawnBurst(this.frog.position.x, 0.2, this.frog.position.z, 0x38bdf8, 20, 4.2);
        } else {
            window.soundEngine.playCrash(pan);
            this.frog.scale.set(1.42, 0.12, 1.42);
            this.spawnBurst(this.frog.position.x, 0.4, this.frog.position.z, 0xff2255, 20, 4.5);
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

    // ==================== 8. 分數、連擊、成就、3D 飄字與粒子特效 ====================
    bumpCombo() {
        this.combo++;
        this.comboTimer = 3.2;
        if (this.combo >= 8) {
            this.unlockAchievement('combo_master');
        }
    }

    addScore(pts) {
        const mult = 1 + Math.min(2.0, Math.floor(this.combo / 3) * 0.25);
        const gained = Math.round(pts * mult);
        this.score += gained;
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
        proj.y += 1.2;
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

    spawnBurst(x, y, z, colorHex, count = 12, speed = 3.5) {
        const actualCount = this.highQuality ? count : Math.ceil(count * 0.5);
        for (let i = 0; i < actualCount; i++) {
            if (this.particles.length > 160) {
                const oldest = this.particles.shift();
                this.scene.remove(oldest.mesh);
                oldest.mat.dispose();
            }
            const mat = new THREE.MeshBasicMaterial({
                color: colorHex,
                transparent: true,
                opacity: 1.0
            });
            const mesh = new THREE.Mesh(this.sharedParticleGeo, mat);
            mesh.position.set(x, y, z);
            const angle = Math.random() * Math.PI * 2;
            const spd = (0.4 + Math.random() * 0.8) * speed;
            this.scene.add(mesh);
            this.particles.push({
                mesh,
                mat,
                vx: Math.cos(angle) * spd,
                vy: 1.8 + Math.random() * speed * 0.9,
                vz: Math.sin(angle) * spd,
                life: 0.55 + Math.random() * 0.35
            });
        }
    }

    spawnShockRing(x, z, colorHex = 0x00ffaa, startScale = 0.3) {
        const ringGeo = new THREE.RingGeometry(0.45, 0.78, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(x, 0.18, z);
        ring.scale.set(startScale, startScale, startScale);
        this.scene.add(ring);
        this.ripples.push({ mesh: ring, scale: startScale, opacity: 0.9, geo: ringGeo, mat: ringMat });
    }

    // ==================== 9. 互動式視窗 (選關、造型工坊、成就、結算) ====================
    bindUIModals() {
        // 標題畫面按鈕
        const btnStart = document.getElementById('btnStartGame');
        if (btnStart) btnStart.addEventListener('click', () => this.startCampaign());

        const openDialogSafe = (id, renderFn) => {
            const dlg = document.getElementById(id);
            if (!dlg) return;
            if (renderFn) renderFn();
            if (!dlg.open) dlg.showModal();
        };

        // 點擊背景遮罩自動關閉 dialog
        document.querySelectorAll('dialog.glass-dialog').forEach(dlg => {
            dlg.addEventListener('click', (e) => {
                if (e.target === dlg) dlg.close();
            });
        });

        // 選關視窗
        ['worldSelectBtn', 'btnOpenWorldsTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('worldDialog', () => this.renderWorldDialog()));
        });
        const closeWorld = document.getElementById('closeWorldDialog');
        if (closeWorld) closeWorld.addEventListener('click', () => document.getElementById('worldDialog').close());

        // 造型與天賦工坊視窗
        ['btnWardrobe', 'btnOpenWardrobeTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('wardrobeDialog', () => this.renderWardrobeDialog()));
        });
        const closeWardrobe = document.getElementById('closeWardrobeDialog');
        if (closeWardrobe) closeWardrobe.addEventListener('click', () => document.getElementById('wardrobeDialog').close());

        // 成就視窗
        ['btnAchieve', 'btnOpenAchieveTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openDialogSafe('achieveDialog', () => this.renderAchieveDialog()));
        });
        const closeAchieve = document.getElementById('closeAchieveDialog');
        if (closeAchieve) closeAchieve.addEventListener('click', () => document.getElementById('achieveDialog').close());

        // 視角與畫質切換按鈕
        const camBtn = document.getElementById('cameraBtn');
        if (camBtn) camBtn.addEventListener('click', () => this.toggleCameraMode());

        const qualBtn = document.getElementById('qualityBtn');
        if (qualBtn) qualBtn.addEventListener('click', () => this.toggleQuality());
        this.syncToolButtons();

        // 過關與失敗對話框按鈕
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
            this.cameraMode === 'CHASE' ? '🎥 切換：追尾越肩動作視角' : '🎥 切換：經典微縮斜俯視角',
            '隨時可按 [C] 鍵或右下角按鈕自由切換'
        );
    }

    toggleQuality() {
        this.highQuality = !this.highQuality;
        localStorage.setItem('frogger3d_quality', this.highQuality ? 'HIGH' : 'PERF');
        this.renderer.shadowMap.enabled = this.highQuality;
        this.syncToolButtons();
        this.showToast(
            this.highQuality ? '✨ 已開啟：極致輝光畫質' : '⚡ 已開啟：高幀率省電模式',
            this.highQuality ? '啟用 UnrealBloom 霓虹輝光與全量氣候粒子' : '關閉輝光後製以發揮最高流暢度'
        );
    }

    syncToolButtons() {
        const qualBtn = document.getElementById('qualityBtn');
        if (qualBtn) {
            qualBtn.textContent = this.highQuality ? '✨' : '⚡';
            qualBtn.title = this.highQuality ? '極致輝光畫質 (點擊切換省電)' : '省電效能模式 (點擊切換輝光)';
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

                let btnLabel = equipped ? '✔ 穿戴中' : (owned ? '立即換裝' : `解鎖 (${skin.cost} 💰)`);
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
        if (starsEl) {
            starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        }
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

    // ==================== 10. HUD 更新 ====================
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
            const colors = ['#ff3355', '#38bdf8', '#facc15', '#c084fc', '#f472b6'];
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

    // ==================== 11. 主循環 (物理、機關、粒子、運鏡) ====================
    animate(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        // 計時器遞減
        if (this.invulnTimer > 0) {
            this.invulnTimer -= dt;
            this.frog.visible = Math.floor(timestamp / 80) % 2 === 0 || this.invulnTimer <= 0;
        }
        if (this.hazardSlowTimer > 0) this.hazardSlowTimer -= dt;
        if (this.fogClearTimer > 0) {
            this.fogClearTimer -= dt;
            this.scene.fog.density += (0.013 - this.scene.fog.density) * 0.08;
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

        // 防卡死保護
        if (this.jumpAnim.active && timestamp - this.jumpAnim.startTime > 380) {
            const wasSuper = this.jumpAnim.type === 'SUPER';
            this.jumpAnim.active = false;
            this.frog.position.y = 0;
            this.onFrogLand(wasSuper);
        }

        const speedScale = this.hazardSlowTimer > 0 ? 0.38 : 1.0;

        // 1. 更新所有車輛與幽靈運動
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

            // 載具動態細節：滾石翻滾、割草刀盤與無人機旋轉、懸浮車與幽靈上下浮動
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

            // 車禍碰撞判定（超級大跳飛躍高空 y > 1.35 時可帥氣飛越矮車與滾石！）
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

        // 2. 賽博傳送帶水平推力
        const curRowInfo = this.gridMap[this.frogPos.row];
        if (
            this.state === 'PLAYING' &&
            !this.jumpAnim.active &&
            curRowInfo &&
            curRowInfo.conveyorSpeed !== 0
        ) {
            this.frog.position.x = Math.max(-10.5, Math.min(10.5, this.frog.position.x + curRowInfo.conveyorSpeed * dt));
        }

        // 3. 更新水上/熔岩/數據浮台（潛水龜、張嘴巨鱷、下沉玄武岩）
        let standingPlatform = null;
        this.platforms.forEach(p => {
            p.mesh.position.x += p.baseSpeed * speedScale * dt;
            if (p.baseSpeed > 0 && p.mesh.position.x > 15.5) p.mesh.position.x = -15.5;
            else if (p.baseSpeed < 0 && p.mesh.position.x < -15.5) p.mesh.position.x = 15.5;

            // A. 潛水烏龜週期
            if (p.type === 'DIVING_TURTLE' && p.canDive) {
                p.diveTimer -= dt;
                if (p.diveState === 'SURFACE' && p.diveTimer <= 0) {
                    p.diveState = 'WARN';
                    p.diveTimer = 1.25;
                } else if (p.diveState === 'WARN') {
                    const pulse = Math.abs(Math.sin(timestamp * 0.02));
                    p.mesh.userData.shellMats.forEach(m => m.emissive.setRGB(pulse * 0.9, pulse * 0.2, 0));
                    p.mesh.position.y = -0.18;
                    if (p.diveTimer <= 0) {
                        p.diveState = 'SUBMERGED';
                        p.diveTimer = 1.65;
                    }
                } else if (p.diveState === 'SUBMERGED') {
                    p.mesh.position.y = -0.68;
                    if (p.diveTimer <= 0) {
                        p.diveState = 'SURFACE';
                        p.diveTimer = 3.5;
                        p.mesh.position.y = -0.12;
                        p.mesh.userData.shellMats.forEach(m => m.emissive.setRGB(0, 0, 0));
                    }
                }
            }

            // B. 神廟巨鱷張嘴週期
            if (p.type === 'CROCODILE') {
                p.mouthTimer -= dt;
                if (p.mouthTimer <= 0) {
                    p.mouthOpen = !p.mouthOpen;
                    p.mouthTimer = p.mouthOpen ? 1.6 : 2.6;
                }
                const targetAngle = p.mouthOpen ? 0.55 : 0.02;
                p.mesh.userData.upperJaw.rotation.z += (targetAngle - p.mesh.userData.upperJaw.rotation.z) * 0.18;
            }

            // C. 火山下沉玄武岩石板
            if (p.type === 'BASALT_SLAB') {
                if (p.sunkTimer > 0) {
                    p.sunkTimer -= dt;
                    p.mesh.position.y = -0.75;
                    if (p.sunkTimer <= 0) {
                        p.sinkProgress = 0;
                        p.mesh.position.y = -0.12;
                    }
                }
            }

            // 檢測玩家是否正站在此浮台上
            if (
                this.state === 'PLAYING' &&
                !this.jumpAnim.active &&
                this.frogPos.row === p.row &&
                !(p.type === 'DIVING_TURTLE' && p.diveState === 'SUBMERGED') &&
                !(p.type === 'BASALT_SLAB' && p.sunkTimer > 0)
            ) {
                const dx = this.frog.position.x - p.mesh.position.x;
                if (Math.abs(dx) < p.halfSpan + 0.25) {
                    standingPlatform = p;
                }
            }
        });

        // 站在浮台上跟隨漂流與石板下沉邏輯
        if (standingPlatform) {
            this.frog.position.x += standingPlatform.baseSpeed * speedScale * dt;
            if (standingPlatform.type === 'BASALT_SLAB') {
                standingPlatform.sinkProgress += dt;
                standingPlatform.mesh.position.x += Math.sin(timestamp * 0.06) * 0.02;
                standingPlatform.mesh.userData.crackMat.emissiveIntensity = 0.4 + standingPlatform.sinkProgress * 0.9;
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

        // 4. 更新安全島定點陷阱（食人花、熔岩噴泉）與水晶開關
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
                    // 冒泡預警
                    const p = 0.15 + Math.abs(Math.sin(timestamp * 0.03)) * 0.2;
                    h.mesh.userData.plume.scale.set(1.1, p, 1.1);
                } else {
                    // 噴發烈焰柱！
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
            sw.mesh.userData.orb.rotation.y += 0.04;
            sw.mesh.userData.ring.rotation.x += 0.03;
            sw.mesh.userData.orbMat.emissiveIntensity = sw.cooldown > 0 ? 0.15 : 0.9;
        });

        // 5. 更新金幣、螢火蟲、小萌蛙（含長舌隔空拉回動畫！）
        this.coinsList.forEach(c => {
            if (!c.userData.collected) c.rotation.z += 0.05;
        });
        this.fliesList.forEach(f => {
            if (!f.userData.collected) {
                f.userData.lWing.rotation.y = Math.sin(timestamp * 0.035) * 0.55;
                f.userData.rWing.rotation.y = -Math.sin(timestamp * 0.035) * 0.55;
                f.position.y = 1.15 + Math.sin(timestamp * 0.005) * 0.22;
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

        // 終點傳送陣旋轉
        if (this.goalPortal && this.goalPortal.visible) {
            this.goalPortal.userData.ring.rotation.z += 0.025;
        }

        // 6. 主角拋物線跳躍、Q 彈回彈、氣囊收縮與長舌動畫
        if (this.jumpAnim.active) {
            const elapsed = timestamp - this.jumpAnim.startTime;
            const p = Math.min(1, elapsed / this.jumpAnim.duration);

            this.frog.position.x = this.jumpAnim.startX + (this.jumpAnim.targetX - this.jumpAnim.startX) * p;
            this.frog.position.z = this.jumpAnim.startZ + (this.jumpAnim.targetZ - this.jumpAnim.startZ) * p;
            this.frog.position.y = Math.sin(p * Math.PI) * this.jumpAnim.peakY;

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
            // 平滑恢復 Q 彈比例
            const vr = this.frog.userData.visualRoot;
            vr.scale.lerp(new THREE.Vector3(1, 1, 1), 0.22);
        }

        if (this.frog && this.frog.userData.throatSac) {
            this.frog.userData.throatSac.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.14);
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

        // 背上小萌蛙歡樂搖擺疊疊樂
        if (this.frog && this.frog.userData.backpack) {
            this.frog.userData.backpack.children.forEach((child, idx) => {
                child.position.x = Math.sin(timestamp * 0.008 + idx * 0.9) * 0.08 * (idx + 1);
            });
        }

        // 3D 指南光箭指向最近小青蛙
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

        // 7. Boss 戰邏輯更新
        if (this.state === 'BOSS_FIGHT') {
            this.updateBoss(dt, timestamp);
        }

        // 8. 粒子爆裂、波紋與五界動態天氣更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.life -= dt;
            pt.vy -= 9.5 * dt;
            pt.mesh.position.x += pt.vx * dt;
            pt.mesh.position.y += pt.vy * dt;
            pt.mesh.position.z += pt.vz * dt;
            pt.mat.opacity = Math.max(0, pt.life * 1.4);
            if (pt.life <= 0) {
                this.scene.remove(pt.mesh);
                pt.mat.dispose();
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.scale += 9.5 * dt;
            r.opacity -= 1.6 * dt;
            r.mesh.scale.set(r.scale, r.scale, r.scale);
            r.mesh.material.opacity = Math.max(0, r.opacity);
            if (r.opacity <= 0) {
                this.scene.remove(r.mesh);
                r.geo.dispose();
                r.mat.dispose();
                this.ripples.splice(i, 1);
            }
        }

        if (this.weatherPoints) {
            const posAttr = this.weatherPoints.geometry.attributes.position;
            const spdAttr = this.weatherPoints.geometry.attributes.aSpeed;
            const mode = this.currentWorld.weatherMode;
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i);
                let x = posAttr.getX(i);
                const spd = spdAttr.getX(i);

                if (mode === 'EMBER' || mode === 'WISP') {
                    y += spd * 2.2 * dt;
                    x += Math.sin(timestamp * 0.002 + i) * 0.6 * dt;
                    if (y > 14) y = 0.2;
                } else if (mode === 'RAIN') {
                    y -= spd * 14.0 * dt;
                    if (y < 0) y = 14;
                } else {
                    y -= spd * 1.5 * dt;
                    x += Math.cos(timestamp * 0.0018 + i) * 0.8 * dt;
                    if (y < 0.2) y = 13;
                }
                posAttr.setXY(i, x, y);
            }
            posAttr.needsUpdate = true;
        }

        // 9. 動態陰影跟隨（確保深入第 28 列陰影依然清晰銳利！）
        this.dirLight.position.set(this.frog.position.x * 0.5 + 14, 28, this.frog.position.z + 16);
        this.dirLight.target.position.set(this.frog.position.x * 0.5, 0, this.frog.position.z - 4);
        this.dirLight.target.updateMatrixWorld();

        // 10. 電影級智慧運鏡（支援標題環繞、經典斜俯視、追尾越肩與 Boss 戰全景）
        if (this.state === 'TITLE') {
            const camAngle = timestamp * 0.00035;
            this.camera.position.set(Math.sin(camAngle) * 9.5, 9.5, 9.5 + Math.cos(camAngle) * 3.0);
            this.camera.lookAt(0, 0.8, -4.5);
        } else {
            let desiredX, desiredY, desiredZ, lookZ;
            if (this.state === 'BOSS_FIGHT') {
                desiredX = this.frog.position.x * 0.45;
                desiredY = 15.5;
                desiredZ = this.frog.position.z + 13.5;
                lookZ = this.frog.position.z - 4.8;
            } else if (this.cameraMode === 'CHASE') {
                desiredX = this.frog.position.x * 0.78;
                desiredY = 7.4 + this.frog.position.y * 0.35;
                desiredZ = this.frog.position.z + 8.8;
                lookZ = this.frog.position.z - 5.2;
            } else {
                desiredX = this.frog.position.x * 0.48;
                desiredY = 14.2 + this.frog.position.y * 0.25;
                desiredZ = this.frog.position.z + 13.2;
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

        // 渲染輸出（依畫質檔位切換 UnrealBloomComposer 或原生 Renderer）
        if (this.highQuality && this.composer) {
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
