/**
 * Frogger 3D Odyssey - 現代 3D 主遊戲核心引擎 (Three.js WebGL)
 * 完美呈現《青蛙過街2》(Frogger 2: Swampy's Revenge) 風格：
 * 5 隻小青蛙救援任務、3D 弧線拋物線跳躍、超級大跳、吐長舌抓捕、超能蛙鳴、5 大主題世界與豐富立體機關
 */

class Frogger3DGame {
    constructor() {
        this.container = document.getElementById('gameContainer');

        // 世界定義 (5 大世界)
        this.WORLDS = [
            {
                id: 1,
                name: '世界 1：花園小溪',
                subtitle: 'Suburban Garden & Brook',
                skyColor: 0xa0d8ef,
                fogColor: 0xc8e6f5,
                groundColor: 0x44aa33,
                roadColor: 0x333338,
                waterColor: 0x2277bb,
                waterType: 'WATER',
                trafficSpeed: 1.0,
                rows: 22
            },
            {
                id: 2,
                name: '世界 2：古代神廟',
                subtitle: 'Ancient Temple & Ruins',
                skyColor: 0x1e3f20,
                fogColor: 0x2a522d,
                groundColor: 0x3e6836,
                roadColor: 0x5a5448,
                waterColor: 0x1d5f66,
                waterType: 'WATER',
                trafficSpeed: 1.15,
                rows: 24
            },
            {
                id: 3,
                name: '世界 3：幽靈古堡',
                subtitle: 'Haunted Manor & Graveyard',
                skyColor: 0x120c1c,
                fogColor: 0x1f1430,
                groundColor: 0x22182e,
                roadColor: 0x2d233c,
                waterColor: 0x4b1d6d,
                waterType: 'POISON',
                trafficSpeed: 1.25,
                rows: 26
            },
            {
                id: 4,
                name: '世界 4：熔岩地穴',
                subtitle: 'Volcano Lava Caverns',
                skyColor: 0x260400,
                fogColor: 0x380900,
                groundColor: 0x221515,
                roadColor: 0x2a1a1a,
                waterColor: 0xff3300,
                waterType: 'LAVA',
                trafficSpeed: 1.35,
                rows: 28
            },
            {
                id: 5,
                name: '世界 5：賽博科技塔',
                subtitle: 'Cyberpunk Neon Tower',
                skyColor: 0x050512,
                fogColor: 0x0d0d29,
                groundColor: 0x111124,
                roadColor: 0x181836,
                waterColor: 0x00f0ff,
                waterType: 'CYBER',
                trafficSpeed: 1.5,
                rows: 30
            }
        ];

        this.currentWorldIndex = 0;
        this.currentWorld = this.WORLDS[0];

        // 網格單位尺寸 (每一格寬度與長度)
        this.GRID = 2.0;

        // 遊戲狀態: 'PLAYING', 'JUMPING', 'SUPER_JUMPING', 'TONGUE', 'DYING', 'STAGE_CLEAR', 'PAUSED'
        this.state = 'PLAYING';

        // 數值與紀錄
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('frogger3d_highscore')) || 5000;
        this.coins = parseInt(localStorage.getItem('frogger3d_coins')) || 0;
        this.lives = 3;
        this.rescuedCount = 0;

        // 技能冷卻管理
        this.cooldowns = {
            superHop: 0,
            tongue: 0,
            croak: 0
        };

        // 場景物件列表
        this.gridMap = {};       // 存放每行屬性: 'SAFE', 'ROAD', 'WATER', 'GOAL'
        this.vehicles = [];      // 車輛 / 巨石
        this.waterObjects = [];  // 浮木 / 荷葉 / 浮石
        this.coinsList = [];     // 金幣
        this.fliesList = [];     // 飛蟲
        this.babyFrogs = [];     // 5 隻小青蛙
        this.particles = [];     // 粒子效果
        this.ripples = [];       // 蛙鳴波紋

        // 青蛙實體與運動狀態
        this.frog = null;
        this.frogPos = { x: 0, z: 0 }; // 邏輯網格坐標
        this.jumpAnim = {
            active: false,
            type: 'NORMAL', // 'NORMAL' 或 'SUPER'
            startTime: 0,
            duration: 180, // 毫秒
            startX: 0,
            startZ: 0,
            targetX: 0,
            targetZ: 0,
            peakY: 1.2
        };

        this.tongueAnim = {
            active: false,
            startTime: 0,
            duration: 250,
            maxDist: 6.0
        };

        this.initThree();
        this.buildWorld(this.currentWorld);
        this.bindControls();
        this.updateHUD();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.animate(t));
    }

    // 1. 初始化 Three.js 引擎
    initThree() {
        // 場景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentWorld.skyColor);
        this.scene.fog = new THREE.FogExp2(this.currentWorld.fogColor, 0.025);

        // 攝影機 (等軸斜俯視角)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 150);
        this.camera.position.set(0, 16, 15);
        this.camera.lookAt(0, 0, 0);

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 光源
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.65);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        this.dirLight.position.set(20, 35, 20);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 80;
        const d = 25;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.scene.add(this.dirLight);

        // 建立主角青蛙
        this.frog = Models3D.createFrogger();
        this.scene.add(this.frog);

        // 監聽螢幕尺寸變更
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 2. 建構立體冒險世界地圖
    buildWorld(world) {
        // 清理前一個世界的物件
        this.clearWorld();

        this.currentWorld = world;
        this.scene.background = new THREE.Color(world.skyColor);
        this.scene.fog.color.setHex(world.fogColor);

        const totalRows = world.rows;
        const mapWidth = 24; // 橫向跨度 (-12 到 +12)

        // 規劃 5 隻小青蛙目標放置點
        this.rescuedCount = 0;
        const babyColors = [
            { hex: 0xff3344, name: '小紅' },
            { hex: 0x3388ff, name: '小藍' },
            { hex: 0xffcc00, name: '小黃' },
            { hex: 0xaa33ff, name: '小紫' },
            { hex: 0xff66cc, name: '小粉' }
        ];

        // 決定小青蛙出現的行數 (平均分散在各挑戰區)
        const frogTargetRows = [
            4,                      // 前段草地/路旁
            8,                      // 第一段河道中
            Math.floor(totalRows * 0.5), // 中央安全島
            Math.floor(totalRows * 0.72),// 後段危險車流/熔岩中
            totalRows - 2           // 終點前險境
        ];

        // 生成各行地塊
        for (let r = 0; r < totalRows; r++) {
            const z = -r * this.GRID;
            let type = 'SAFE';

            if (r === 0 || r === 1) {
                type = 'SAFE'; // 起點大草地
            } else if (r === totalRows - 1) {
                type = 'GOAL'; // 終點傳送荷花陣
            } else if (r === Math.floor(totalRows * 0.45) || r === Math.floor(totalRows * 0.45) + 1) {
                type = 'SAFE'; // 中央休息島
            } else if ((r >= 2 && r <= 6) || (r >= 14 && r <= 17)) {
                type = 'ROAD'; // 馬路車道
            } else {
                type = 'WATER'; // 河流/熔岩
            }

            this.gridMap[r] = { type, z };
            this.buildRowTiles(r, z, type, mapWidth, world);

            // 放置小青蛙
            const frogIndex = frogTargetRows.indexOf(r);
            if (frogIndex !== -1 && frogIndex < 5) {
                const info = babyColors[frogIndex];
                const baby = Models3D.createBabyFrog(info.hex, info.name);
                // 隨機擺在中間左右格
                const randCol = (frogIndex % 2 === 0) ? -2 : 2;
                baby.position.set(randCol * this.GRID, 0.2, z);
                this.scene.add(baby);
                this.babyFrogs.push({
                    mesh: baby,
                    col: randCol,
                    row: r,
                    info: info,
                    rescued: false
                });
            }

            // 隨機放置金幣與飛蟲
            if (r > 1 && r < totalRows - 1 && Math.random() < 0.6) {
                const coin = Models3D.createCoin();
                const col = (Math.floor(Math.random() * 9) - 4) * this.GRID;
                coin.position.set(col, 0.5, z);
                this.scene.add(coin);
                this.coinsList.push(coin);
            }

            if (r > 2 && Math.random() < 0.25) {
                const fly = Models3D.createFly();
                const col = (Math.floor(Math.random() * 7) - 3) * this.GRID;
                fly.position.set(col, 1.2, z);
                this.scene.add(fly);
                this.fliesList.push(fly);
            }
        }

        // 終點傳送荷花陣
        const goalZ = -(totalRows - 1) * this.GRID;
        this.goalPortal = Models3D.createGoalPortal();
        this.goalPortal.position.set(0, 0, goalZ);
        this.scene.add(this.goalPortal);

        // 重置青蛙位置
        this.resetFrog();
    }

    buildRowTiles(row, z, type, mapWidth, world) {
        let color = world.groundColor;
        let yOffset = 0;

        if (type === 'ROAD') {
            color = world.roadColor;
            // 建立柏油馬路
            const roadGeo = new THREE.BoxGeometry(mapWidth, 0.3, this.GRID * 0.96);
            const roadMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(0, -0.15, z);
            road.receiveShadow = true;
            this.scene.add(road);
            this.activeMeshes.push(road);

            // 產生該車道的行駛車輛 (向左或向右)
            const speed = (row % 2 === 0 ? 1 : -1) * (3.5 + Math.random() * 2.5) * world.trafficSpeed;
            const vehType = (world.id === 4) ? 'SPORTS_CAR' : ((row % 3 === 0) ? 'TRUCK' : 'TAXI');
            for (let i = -2; i <= 2; i++) {
                const v = Models3D.createVehicle(vehType);
                v.position.set(i * 10 + (Math.random() * 2), 0, z);
                v.rotation.y = (speed > 0) ? Math.PI / 2 : -Math.PI / 2;
                this.scene.add(v);
                this.vehicles.push({ mesh: v, speed: speed, z: z, row: row });
            }
        } else if (type === 'WATER') {
            // 水道/熔岩地表凹槽
            const isLava = world.waterType === 'LAVA';
            const isCyber = world.waterType === 'CYBER';

            const waterGeo = new THREE.PlaneGeometry(mapWidth, this.GRID * 0.98);
            waterGeo.rotateX(-Math.PI / 2);

            let waterMat;
            if (isLava) {
                waterMat = new THREE.MeshStandardMaterial({
                    color: 0xff2200,
                    emissive: 0xff3300,
                    emissiveIntensity: 0.7,
                    roughness: 0.2
                });
            } else if (isCyber) {
                waterMat = new THREE.MeshStandardMaterial({
                    color: 0x00ffff,
                    emissive: 0x0088cc,
                    emissiveIntensity: 0.5,
                    roughness: 0.1
                });
            } else {
                waterMat = new THREE.MeshStandardMaterial({
                    color: world.waterColor,
                    transparent: true,
                    opacity: 0.82,
                    roughness: 0.1,
                    metalness: 0.2
                });
            }

            const water = new THREE.Mesh(waterGeo, waterMat);
            water.position.set(0, -0.25, z);
            water.receiveShadow = true;
            this.scene.add(water);
            this.activeMeshes.push(water);

            // 產生浮木或荷葉
            const speed = (row % 2 === 0 ? 1 : -1) * (2.0 + Math.random() * 1.5) * (world.trafficSpeed * 0.8);
            for (let i = -2; i <= 2; i++) {
                let obj;
                if (row % 2 === 0) {
                    obj = Models3D.createLog(3.2, 0.45);
                } else {
                    obj = Models3D.createLilyPad(0.85);
                }
                obj.position.set(i * 7 + (Math.random() * 1.5), -0.15, z);
                this.scene.add(obj);
                this.waterObjects.push({ mesh: obj, speed: speed, z: z, row: row, radius: 1.6 });
            }
        } else {
            // 安全草地/地磚
            const groundGeo = new THREE.BoxGeometry(mapWidth, 0.4, this.GRID);
            const groundMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.position.set(0, -0.2, z);
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.activeMeshes.push(ground);
        }
    }

    clearWorld() {
        if (!this.activeMeshes) this.activeMeshes = [];
        this.activeMeshes.forEach(m => this.scene.remove(m));
        this.vehicles.forEach(v => this.scene.remove(v.mesh));
        this.waterObjects.forEach(w => this.scene.remove(w.mesh));
        this.coinsList.forEach(c => this.scene.remove(c));
        this.fliesList.forEach(f => this.scene.remove(f));
        this.babyFrogs.forEach(b => this.scene.remove(b.mesh));
        if (this.goalPortal) this.scene.remove(this.goalPortal);

        this.activeMeshes = [];
        this.vehicles = [];
        this.waterObjects = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.gridMap = {};
    }

    resetFrog() {
        this.frogPos = { col: 0, row: 0 };
        this.frog.position.set(0, 0, 0);
        this.frog.rotation.y = 0; // 面對前方
        this.frog.scale.set(1, 1, 1);
        this.state = 'PLAYING';
        this.jumpAnim.active = false;
        this.tongueAnim.active = false;
        this.frog.userData.tongue.scale.set(1, 1, 0.001);
    }

    // 3. 鍵盤與行動觸控輸入綁定
    bindControls() {
        window.addEventListener('keydown', (e) => {
            window.soundEngine.init();
            if (this.state === 'DYING' || this.state === 'STAGE_CLEAR') return;

            // 移動 (方向鍵 / WASD)
            if (['ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                this.hop(0, 1);
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                this.hop(0, -1);
            } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
                e.preventDefault();
                this.hop(-1, 0);
            } else if (['ArrowRight'].includes(e.code)) {
                e.preventDefault();
                this.hop(1, 0);
            } else if (e.code === 'KeyD') {
                if (this.state === 'PLAYING' && !this.jumpAnim.active) {
                    this.hop(1, 0);
                }
            } else if (e.code === 'Space' || e.code === 'KeyJ') {
                // 超級大跳 Super Hop
                e.preventDefault();
                this.superHop();
            } else if (e.code === 'KeyE' || e.code === 'KeyK') {
                // 長舌抓捕 Tongue Grab
                e.preventDefault();
                this.tongueGrab();
            } else if (e.code === 'KeyQ' || e.code === 'KeyL') {
                // 超能蛙鳴 Power Croak
                e.preventDefault();
                this.powerCroak();
            }
        });

        // 綁定畫面下方技能按鈕
        const btnSuperHop = document.getElementById('btnSuperHop');
        const btnTongue = document.getElementById('btnTongue');
        const btnCroak = document.getElementById('btnCroak');

        if (btnSuperHop) {
            btnSuperHop.addEventListener('click', () => {
                window.soundEngine.init();
                this.superHop();
            });
        }
        if (btnTongue) {
            btnTongue.addEventListener('click', () => {
                window.soundEngine.init();
                this.tongueGrab();
            });
        }
        if (btnCroak) {
            btnCroak.addEventListener('click', () => {
                window.soundEngine.init();
                this.powerCroak();
            });
        }

        // 手勢滑動 (Swipe) 跳躍支援
        let touchX = 0, touchY = 0;
        this.container.addEventListener('touchstart', (e) => {
            window.soundEngine.init();
            const t = e.changedTouches[0];
            touchX = t.clientX;
            touchY = t.clientY;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - touchX;
            const dy = t.clientY - touchY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) > 25) {
                if (absX > absY) {
                    this.hop(dx > 0 ? 1 : -1, 0);
                } else {
                    this.hop(0, dy > 0 ? -1 : 1);
                }
            } else {
                // 輕點直接向前跳
                this.hop(0, 1);
            }
        }, { passive: true });

        // 頂部世界切換選單按鈕
        const worldSelectBtn = document.getElementById('worldSelectBtn');
        if (worldSelectBtn) {
            worldSelectBtn.addEventListener('click', () => {
                this.currentWorldIndex = (this.currentWorldIndex + 1) % this.WORLDS.length;
                this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                this.updateHUD();
                window.soundEngine.playStageWin();
            });
        }
    }

    // 4. 青蛙普通跳躍 (Hop)
    hop(dCol, dRow) {
        if (this.jumpAnim.active || this.state !== 'PLAYING') return;

        const targetCol = this.frogPos.col + dCol;
        const targetRow = this.frogPos.row + dRow;

        // 邊界防禦
        if (targetCol < -5 || targetCol > 5) return;
        if (targetRow < 0 || targetRow >= this.currentWorld.rows) return;

        // 設定朝向
        if (dRow > 0) this.frog.rotation.y = 0;            // 前
        else if (dRow < 0) this.frog.rotation.y = Math.PI; // 後
        else if (dCol < 0) this.frog.rotation.y = Math.PI / 2; // 左
        else if (dCol > 0) this.frog.rotation.y = -Math.PI / 2;// 右

        this.jumpAnim.active = true;
        this.jumpAnim.type = 'NORMAL';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 160;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetCol * this.GRID;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 1.1;

        this.frogPos.col = targetCol;
        this.frogPos.row = targetRow;

        window.soundEngine.playHop();
        this.addScore(10);
    }

    // 5. 超級大跳 (Super Hop - 前進 2 格越過障礙)
    superHop() {
        if (this.jumpAnim.active || this.state !== 'PLAYING') return;
        if (this.cooldowns.superHop > 0) return;

        const targetCol = this.frogPos.col;
        const targetRow = Math.min(this.currentWorld.rows - 1, this.frogPos.row + 2);

        this.frog.rotation.y = 0; // 朝前
        this.jumpAnim.active = true;
        this.jumpAnim.type = 'SUPER';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 260;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetCol * this.GRID;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 2.4; // 超高弧線

        this.frogPos.col = targetCol;
        this.frogPos.row = targetRow;
        this.cooldowns.superHop = 180; // 3 秒冷卻

        window.soundEngine.playSuperHop();
        this.addScore(30);
    }

    // 6. 吐長舌抓捕 (Tongue Grab - 抓取前方的金幣/飛蟲)
    tongueGrab() {
        if (this.tongueAnim.active || this.jumpAnim.active || this.state !== 'PLAYING') return;

        this.tongueAnim.active = true;
        this.tongueAnim.startTime = performance.now();

        window.soundEngine.playTongue();

        // 偵測前方 3 格內是否有金幣或飛蟲
        const frogX = this.frog.position.x;
        const frogZ = this.frog.position.z;

        // 金幣抓捕
        this.coinsList.forEach(coin => {
            if (!coin.userData.collected && Math.abs(coin.position.x - frogX) < 1.2 && coin.position.z < frogZ && coin.position.z > frogZ - 6.5) {
                coin.userData.collected = true;
                this.scene.remove(coin);
                this.coins += 5;
                localStorage.setItem('frogger3d_coins', this.coins);
                window.soundEngine.playCoin();
                this.addScore(50);
                this.updateHUD();
            }
        });

        // 飛蟲抓捕
        this.fliesList.forEach(fly => {
            if (Math.abs(fly.position.x - frogX) < 1.5 && fly.position.z < frogZ && fly.position.z > frogZ - 6.5) {
                this.scene.remove(fly);
                window.soundEngine.playCoin();
                this.addScore(150);
                this.lives = Math.min(5, this.lives + 1); // 補血
                this.updateHUD();
            }
        });
    }

    // 7. 超能蛙鳴 (Power Croak - 釋放聲波震盪，尋找小青蛙)
    powerCroak() {
        if (this.state !== 'PLAYING') return;

        window.soundEngine.playCroak();

        // 產生擴散光圈
        const ringGeo = new THREE.RingGeometry(0.3, 0.6, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(this.frog.position);
        ring.position.y = 0.2;
        this.scene.add(ring);
        this.ripples.push({ mesh: ring, scale: 1, opacity: 0.8 });

        // 尋找最近未拯救的小青蛙，加強其頭頂光柱
        let nearestBaby = null;
        let minDist = 999;
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
            // 光柱劇烈閃爍指引
            nearestBaby.mesh.userData.beacon.material.opacity = 1.0;
            nearestBaby.mesh.scale.set(1.5, 1.5, 1.5);
            setTimeout(() => {
                if (nearestBaby && !nearestBaby.rescued) {
                    nearestBaby.mesh.scale.set(1, 1, 1);
                    nearestBaby.mesh.userData.beacon.material.opacity = 0.35;
                }
            }, 1200);
        }
    }

    // 8. 判定拯救小青蛙 (Rescue Baby Frog)
    checkRescue() {
        this.babyFrogs.forEach(b => {
            if (!b.rescued) {
                const dist = this.frog.position.distanceTo(b.mesh.position);
                if (dist < 1.8) {
                    // 救起小萌蛙！
                    b.rescued = true;
                    this.rescuedCount++;
                    window.soundEngine.playRescue();
                    this.addScore(300);

                    // 移除頭頂光柱
                    b.mesh.remove(b.mesh.userData.beacon);

                    // 將小青蛙縮小並背在主角背上排隊！
                    b.mesh.scale.set(0.65, 0.65, 0.65);
                    this.scene.remove(b.mesh);
                    b.mesh.position.set(0, (this.rescuedCount - 1) * 0.35, 0);
                    this.frog.userData.backpack.add(b.mesh);

                    this.updateHUD();

                    // 5 隻全救出：啟動終點蓮花光陣！
                    if (this.rescuedCount >= 5 && this.goalPortal) {
                        this.goalPortal.userData.beam.visible = true;
                    }
                }
            }
        });
    }

    // 9. 碰撞與著地判定
    onFrogLand() {
        const row = this.frogPos.row;
        const rowInfo = this.gridMap[row];

        if (!rowInfo) return;

        // A. 抵達終點傳送蓮花陣
        if (rowInfo.type === 'GOAL') {
            if (this.rescuedCount >= 5) {
                // 完美過關！
                this.state = 'STAGE_CLEAR';
                window.soundEngine.playStageWin();
                this.addScore(1000);
                setTimeout(() => {
                    // 自動進階下一個世界
                    this.currentWorldIndex = (this.currentWorldIndex + 1) % this.WORLDS.length;
                    this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                    this.updateHUD();
                }, 3000);
            } else {
                // 尚未收集齊 5 隻小青蛙
                this.powerCroak();
            }
            return;
        }

        // B. 著地在河流/熔岩 (檢查是否踩在浮木或荷葉上)
        if (rowInfo.type === 'WATER') {
            let onSafeObject = false;
            for (let obj of this.waterObjects) {
                if (obj.row === row) {
                    const d = Math.abs(this.frog.position.x - obj.mesh.position.x);
                    if (d < obj.radius) {
                        onSafeObject = true;
                        break;
                    }
                }
            }

            if (!onSafeObject) {
                // 落水或掉入熔岩
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
                return;
            }
        }

        // 檢查金幣收集
        this.coinsList.forEach(coin => {
            if (!coin.userData.collected && this.frog.position.distanceTo(coin.position) < 1.4) {
                coin.userData.collected = true;
                this.scene.remove(coin);
                this.coins++;
                localStorage.setItem('frogger3d_coins', this.coins);
                window.soundEngine.playCoin();
                this.addScore(50);
                this.updateHUD();
            }
        });

        // 檢查拯救小青蛙
        this.checkRescue();
    }

    // 10. 觸發死亡
    triggerDeath(type = 'CRASH') {
        if (this.state === 'DYING') return;

        this.state = 'DYING';
        this.lives--;
        this.updateHUD();

        if (type === 'LAVA') {
            window.soundEngine.playLavaBurn();
            this.frog.scale.set(1.2, 0.2, 1.2); // 燒扁
        } else if (type === 'WATER') {
            window.soundEngine.playSplash();
            this.frog.position.y = -0.6; // 下沉
        } else {
            window.soundEngine.playCrash();
            this.frog.scale.set(1.4, 0.1, 1.4); // 壓扁
        }

        setTimeout(() => {
            if (this.lives >= 0) {
                this.resetFrog();
            } else {
                this.lives = 3;
                this.score = 0;
                this.resetFrog();
                this.buildWorld(this.currentWorld);
            }
            this.updateHUD();
        }, 1200);
    }

    addScore(pts) {
        this.score += pts;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('frogger3d_highscore', this.highScore);
        }
        this.updateHUD();
    }

    updateHUD() {
        const scoreEl = document.getElementById('hudScore');
        const hiEl = document.getElementById('hudHighScore');
        const coinsEl = document.getElementById('hudCoins');
        const livesEl = document.getElementById('hudLives');
        const worldEl = document.getElementById('hudWorld');
        const babyIconsEl = document.getElementById('hudBabyIcons');

        if (scoreEl) scoreEl.textContent = this.score;
        if (hiEl) hiEl.textContent = this.highScore;
        if (coinsEl) coinsEl.textContent = this.coins;
        if (livesEl) livesEl.textContent = '🐸'.repeat(Math.max(0, this.lives));
        if (worldEl) worldEl.textContent = this.currentWorld.name;

        // 5 隻小青蛙的待救/已救頭像
        if (babyIconsEl) {
            let html = '';
            for (let i = 0; i < 5; i++) {
                const rescued = i < this.rescuedCount;
                html += `<span style="opacity: ${rescued ? '1' : '0.35'}; filter: ${rescued ? 'none' : 'grayscale(1)'}; margin: 0 3px;">👶</span>`;
            }
            babyIconsEl.innerHTML = html;
        }
    }

    // 11. 遊戲主循環動畫
    animate(timestamp) {
        const dt = Math.min(timestamp - this.lastTime, 50);
        this.lastTime = timestamp;

        // 更新車輛移動
        this.vehicles.forEach(v => {
            v.mesh.position.x += v.speed * (dt / 1000);
            if (v.speed > 0 && v.mesh.position.x > 14) {
                v.mesh.position.x = -14;
            } else if (v.speed < 0 && v.mesh.position.x < -14) {
                v.mesh.position.x = 14;
            }

            // 車禍碰撞檢測
            if (this.state === 'PLAYING' && !this.jumpAnim.active && this.frogPos.row === v.row) {
                const dx = Math.abs(this.frog.position.x - v.mesh.position.x);
                if (dx < 1.3) {
                    this.triggerDeath('CRASH');
                }
            }
        });

        // 更新河流漂浮物 (浮木與荷葉)
        this.waterObjects.forEach(w => {
            w.mesh.position.x += w.speed * (dt / 1000);
            if (w.speed > 0 && w.mesh.position.x > 14) {
                w.mesh.position.x = -14;
            } else if (w.speed < 0 && w.mesh.position.x < -14) {
                w.mesh.position.x = 14;
            }

            // 若青蛙站在浮木上，跟隨水平漂動！
            if (this.state === 'PLAYING' && !this.jumpAnim.active && this.frogPos.row === w.row) {
                const dx = Math.abs(this.frog.position.x - w.mesh.position.x);
                if (dx < w.radius) {
                    this.frog.position.x += w.speed * (dt / 1000);
                    // 飄出地圖邊界
                    if (this.frog.position.x < -11 || this.frog.position.x > 11) {
                        this.triggerDeath('WATER');
                    }
                }
            }
        });

        // 金幣浮空自轉
        this.coinsList.forEach(c => {
            if (!c.userData.collected) {
                c.rotation.z += 0.04;
            }
        });

        // 飛蟲拍翅
        this.fliesList.forEach(f => {
            f.userData.lWing.rotation.y = Math.sin(timestamp * 0.03) * 0.5;
            f.userData.rWing.rotation.y = -Math.sin(timestamp * 0.03) * 0.5;
            f.position.y = 1.2 + Math.sin(timestamp * 0.005) * 0.2;
        });

        // 小青蛙原地蹦跳歡樂動畫
        this.babyFrogs.forEach(b => {
            if (!b.rescued) {
                b.mesh.position.y = 0.2 + Math.abs(Math.sin(timestamp * 0.006)) * 0.3;
                b.mesh.rotation.y += 0.02;
            }
        });

        // 跳躍拋物線插值動畫
        if (this.jumpAnim.active) {
            const elapsed = timestamp - this.jumpAnim.startTime;
            const progress = Math.min(1, elapsed / this.jumpAnim.duration);

            // 水平位置插值 (線性)
            this.frog.position.x = this.jumpAnim.startX + (this.jumpAnim.targetX - this.jumpAnim.startX) * progress;
            this.frog.position.z = this.jumpAnim.startZ + (this.jumpAnim.targetZ - this.jumpAnim.startZ) * progress;

            // 垂直弧度 (拋物線 sin(pi * t))
            this.frog.position.y = Math.sin(progress * Math.PI) * this.jumpAnim.peakY;

            // 著地前傾
            this.frog.rotation.x = Math.sin(progress * Math.PI) * 0.2;

            if (progress >= 1) {
                this.jumpAnim.active = false;
                this.frog.position.x = this.jumpAnim.targetX;
                this.frog.position.z = this.jumpAnim.targetZ;
                this.frog.position.y = 0;
                this.frog.rotation.x = 0;
                this.onFrogLand();
            }
        }

        // 吐舌頭動畫
        if (this.tongueAnim.active) {
            const elapsed = timestamp - this.tongueAnim.startTime;
            const t = elapsed / this.tongueAnim.duration;
            if (t < 0.5) {
                // 伸展
                const p = t * 2;
                this.frog.userData.tongue.scale.set(1, 1, p * 5.0);
            } else if (t < 1) {
                // 縮回
                const p = (1 - t) * 2;
                this.frog.userData.tongue.scale.set(1, 1, Math.max(0.001, p * 5.0));
            } else {
                this.tongueAnim.active = false;
                this.frog.userData.tongue.scale.set(1, 1, 0.001);
            }
        }

        // 蛙鳴波紋擴散
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.scale += 0.35;
            r.opacity -= 0.025;
            r.mesh.scale.set(r.scale, r.scale, r.scale);
            r.mesh.material.opacity = Math.max(0, r.opacity);
            if (r.opacity <= 0) {
                this.scene.remove(r.mesh);
                this.ripples.splice(i, 1);
            }
        }

        // 技能冷卻計時
        if (this.cooldowns.superHop > 0) this.cooldowns.superHop--;

        // 平滑跟隨相機 (Camera Lerp)
        const targetCamX = this.frog.position.x * 0.4;
        const targetCamZ = this.frog.position.z + 14;
        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
        this.camera.lookAt(this.frog.position.x * 0.3, 0.5, this.frog.position.z - 2);

        // 渲染畫面
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame((t) => this.animate(t));
    }
}

// 頁面就緒後啟動
window.addEventListener('DOMContentLoaded', () => {
    window.game3D = new Frogger3DGame();
});
