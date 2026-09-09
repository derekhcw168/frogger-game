/**
 * Frogger 3D Odyssey - 現代 3D 主遊戲核心引擎 (Three.js WebGL)
 * 完整修復版：流暢河流漂浮物理、即時落水與車禍碰撞、小萌蛙救援疊疊樂、防卡死狀態機與 5 大世界
 */

class Frogger3DGame {
    constructor() {
        this.container = document.getElementById('gameContainer');

        // 5 大主題世界定義
        this.WORLDS = [
            {
                id: 1,
                name: '世界 1：花園小溪',
                subtitle: 'Suburban Garden & Brook',
                skyColor: 0x90caf9,
                fogColor: 0xbbdefb,
                groundColor: 0x43a047,
                roadColor: 0x37474f,
                waterColor: 0x1976d2,
                waterType: 'WATER',
                trafficSpeed: 1.0,
                rows: 20
            },
            {
                id: 2,
                name: '世界 2：古代神廟',
                subtitle: 'Ancient Temple & Ruins',
                skyColor: 0x1b5e20,
                fogColor: 0x2e7d32,
                groundColor: 0x388e3c,
                roadColor: 0x4e342e,
                waterColor: 0x00695c,
                waterType: 'WATER',
                trafficSpeed: 1.2,
                rows: 22
            },
            {
                id: 3,
                name: '世界 3：幽靈古堡',
                subtitle: 'Haunted Manor & Graveyard',
                skyColor: 0x120024,
                fogColor: 0x240046,
                groundColor: 0x1a1128,
                roadColor: 0x2d1b4e,
                waterColor: 0x5a189a,
                waterType: 'POISON',
                trafficSpeed: 1.3,
                rows: 24
            },
            {
                id: 4,
                name: '世界 4：熔岩地穴',
                subtitle: 'Volcano Lava Caverns',
                skyColor: 0x370617,
                fogColor: 0x6a040f,
                groundColor: 0x1c1917,
                roadColor: 0x292524,
                waterColor: 0xd00000,
                waterType: 'LAVA',
                trafficSpeed: 1.4,
                rows: 26
            },
            {
                id: 5,
                name: '世界 5：賽博科技塔',
                subtitle: 'Cyberpunk Neon Tower',
                skyColor: 0x03071e,
                fogColor: 0x0a1128,
                groundColor: 0x0f172a,
                roadColor: 0x1e293b,
                waterColor: 0x00f5d4,
                waterType: 'CYBER',
                trafficSpeed: 1.55,
                rows: 28
            }
        ];

        this.currentWorldIndex = 0;
        this.currentWorld = this.WORLDS[0];

        // 網格單位尺寸
        this.GRID = 2.0;

        // 遊戲狀態: 'PLAYING', 'DYING', 'STAGE_CLEAR'
        this.state = 'PLAYING';

        // 數值與紀錄
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('frogger3d_highscore')) || 5000;
        this.coins = parseInt(localStorage.getItem('frogger3d_coins')) || 0;
        this.lives = 3;
        this.rescuedCount = 0;

        // 技能冷卻
        this.cooldowns = {
            superHop: 0,
            tongue: 0,
            croak: 0
        };

        // 場景物件快取
        this.activeMeshes = [];
        this.gridMap = {};
        this.vehicles = [];
        this.waterObjects = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.ripples = [];
        this.deathTimer = null;

        // 青蛙實體與運動狀態
        this.frog = null;
        this.frogPos = { col: 0, row: 0 };
        this.jumpAnim = {
            active: false,
            type: 'NORMAL',
            startTime: 0,
            duration: 170,
            startX: 0,
            startZ: 0,
            targetX: 0,
            targetZ: 0,
            peakY: 1.1
        };

        this.tongueAnim = {
            active: false,
            startTime: 0,
            duration: 250
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
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentWorld.skyColor);
        this.scene.fog = new THREE.FogExp2(this.currentWorld.fogColor, 0.022);

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 150);
        this.camera.position.set(0, 15, 14);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.7);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        this.dirLight.position.set(15, 30, 20);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        const d = 25;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.scene.add(this.dirLight);

        // 建立主角青蛙
        this.frog = Models3D.createFrogger();
        this.scene.add(this.frog);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 2. 建構立體冒險世界地圖
    buildWorld(world) {
        this.clearWorld();

        this.currentWorld = world;
        this.scene.background = new THREE.Color(world.skyColor);
        this.scene.fog.color.setHex(world.fogColor);

        const totalRows = world.rows;
        const mapWidth = 26;

        this.rescuedCount = 0;
        const babyColors = [
            { hex: 0xff3344, name: '小紅' },
            { hex: 0x3388ff, name: '小藍' },
            { hex: 0xffbb00, name: '小黃' },
            { hex: 0xaa33ff, name: '小紫' },
            { hex: 0xff66cc, name: '小粉' }
        ];

        // 5 隻小青蛙分佈於各區域
        const frogTargetRows = [
            3,
            7,
            Math.floor(totalRows * 0.46),
            Math.floor(totalRows * 0.7),
            totalRows - 3
        ];

        for (let r = 0; r < totalRows; r++) {
            const z = -r * this.GRID;
            let type = 'SAFE';

            if (r === 0 || r === 1) {
                type = 'SAFE';
            } else if (r === totalRows - 1) {
                type = 'GOAL';
            } else if (r === Math.floor(totalRows * 0.45) || r === Math.floor(totalRows * 0.45) + 1) {
                type = 'SAFE'; // 中央安全島
            } else if ((r >= 2 && r <= 5) || (r >= 13 && r <= 16)) {
                type = 'ROAD'; // 公路
            } else {
                type = 'WATER'; // 水道或熔岩
            }

            this.gridMap[r] = { type, z };
            this.buildRowTiles(r, z, type, mapWidth, world);

            // 放置小青蛙
            const fIdx = frogTargetRows.indexOf(r);
            if (fIdx !== -1 && fIdx < 5) {
                const info = babyColors[fIdx];
                const baby = Models3D.createBabyFrog(info.hex, info.name);
                const colX = (fIdx % 2 === 0 ? -2.5 : 2.5) * this.GRID;
                baby.position.set(colX, 0.2, z);
                this.scene.add(baby);
                this.babyFrogs.push({
                    mesh: baby,
                    origX: colX,
                    origZ: z,
                    info: info,
                    rescued: false
                });
            }

            // 放置金幣
            if (r > 1 && r < totalRows - 1 && Math.random() < 0.55) {
                const coin = Models3D.createCoin();
                const colX = (Math.floor(Math.random() * 7) - 3) * this.GRID;
                coin.position.set(colX, 0.6, z);
                this.scene.add(coin);
                this.coinsList.push(coin);
            }

            // 放置飛蟲
            if (r > 2 && Math.random() < 0.22) {
                const fly = Models3D.createFly();
                const colX = (Math.floor(Math.random() * 5) - 2) * this.GRID;
                fly.position.set(colX, 1.2, z);
                this.scene.add(fly);
                this.fliesList.push(fly);
            }
        }

        // 終點傳送陣
        const goalZ = -(totalRows - 1) * this.GRID;
        this.goalPortal = Models3D.createGoalPortal();
        this.goalPortal.position.set(0, 0, goalZ);
        this.scene.add(this.goalPortal);

        this.resetFrog();
    }

    buildRowTiles(row, z, type, mapWidth, world) {
        if (type === 'ROAD') {
            const roadGeo = new THREE.BoxGeometry(mapWidth, 0.3, this.GRID * 0.96);
            const roadMat = new THREE.MeshStandardMaterial({ color: world.roadColor, roughness: 0.8 });
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(0, -0.15, z);
            road.receiveShadow = true;
            this.scene.add(road);
            this.activeMeshes.push(road);

            const speed = (row % 2 === 0 ? 1 : -1) * (3.2 + Math.random() * 2.0) * world.trafficSpeed;
            const vehType = (world.id === 4) ? 'SPORTS_CAR' : ((row % 3 === 0) ? 'TRUCK' : 'TAXI');
            for (let i = -2; i <= 2; i++) {
                const v = Models3D.createVehicle(vehType);
                v.position.set(i * 10 + (Math.random() * 2), 0, z);
                v.rotation.y = (speed > 0) ? Math.PI / 2 : -Math.PI / 2;
                this.scene.add(v);
                this.vehicles.push({
                    mesh: v,
                    speed: speed,
                    z: z,
                    row: row,
                    width: (vehType === 'TRUCK') ? 4.2 : 2.4
                });
            }
        } else if (type === 'WATER') {
            const isLava = world.waterType === 'LAVA';
            const isCyber = world.waterType === 'CYBER';

            const waterGeo = new THREE.PlaneGeometry(mapWidth, this.GRID * 0.98);
            waterGeo.rotateX(-Math.PI / 2);

            let waterMat;
            if (isLava) {
                waterMat = new THREE.MeshStandardMaterial({
                    color: 0xff2200,
                    emissive: 0xff3300,
                    emissiveIntensity: 0.75,
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
                    opacity: 0.85,
                    roughness: 0.15
                });
            }

            const water = new THREE.Mesh(waterGeo, waterMat);
            water.position.set(0, -0.22, z);
            water.receiveShadow = true;
            this.scene.add(water);
            this.activeMeshes.push(water);

            const speed = (row % 2 === 0 ? 1 : -1) * (1.8 + Math.random() * 1.2) * (world.trafficSpeed * 0.8);
            for (let i = -2; i <= 2; i++) {
                let obj;
                let radius = 1.6;
                if (row % 2 === 0) {
                    obj = Models3D.createLog(3.6, 0.5);
                    radius = 2.0;
                } else {
                    obj = Models3D.createLilyPad(1.0);
                    radius = 1.1;
                }
                obj.position.set(i * 7 + (Math.random() * 1.2), -0.15, z);
                this.scene.add(obj);
                this.waterObjects.push({ mesh: obj, speed: speed, z: z, row: row, radius: radius });
            }
        } else {
            const groundGeo = new THREE.BoxGeometry(mapWidth, 0.4, this.GRID);
            const groundMat = new THREE.MeshStandardMaterial({ color: world.groundColor, roughness: 0.6 });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.position.set(0, -0.2, z);
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.activeMeshes.push(ground);
        }
    }

    clearWorld() {
        if (this.deathTimer) {
            clearTimeout(this.deathTimer);
            this.deathTimer = null;
        }

        if (this.activeMeshes) this.activeMeshes.forEach(m => this.scene.remove(m));
        if (this.vehicles) this.vehicles.forEach(v => this.scene.remove(v.mesh));
        if (this.waterObjects) this.waterObjects.forEach(w => this.scene.remove(w.mesh));
        if (this.coinsList) this.coinsList.forEach(c => this.scene.remove(c));
        if (this.fliesList) this.fliesList.forEach(f => this.scene.remove(f));
        if (this.babyFrogs) this.babyFrogs.forEach(b => this.scene.remove(b.mesh));
        if (this.ripples) this.ripples.forEach(r => this.scene.remove(r.mesh));
        if (this.goalPortal) this.scene.remove(this.goalPortal);

        // 清空主角背後的小青蛙
        if (this.frog && this.frog.userData && this.frog.userData.backpack) {
            const bp = this.frog.userData.backpack;
            while (bp.children.length > 0) {
                bp.remove(bp.children[0]);
            }
        }

        this.activeMeshes = [];
        this.vehicles = [];
        this.waterObjects = [];
        this.coinsList = [];
        this.fliesList = [];
        this.babyFrogs = [];
        this.ripples = [];
        this.gridMap = {};
    }

    resetFrog() {
        this.frogPos = { col: 0, row: 0 };
        this.frog.position.set(0, 0, 0);
        this.frog.rotation.set(0, 0, 0);
        this.frog.scale.set(1, 1, 1);
        this.state = 'PLAYING';
        this.jumpAnim.active = false;
        this.tongueAnim.active = false;
        if (this.frog.userData.tongue) {
            this.frog.userData.tongue.scale.set(1, 1, 0.001);
        }
    }

    // 3. 鍵盤與行動觸控輸入綁定
    bindControls() {
        window.addEventListener('keydown', (e) => {
            window.soundEngine.init();
            if (this.state === 'DYING' || this.state === 'STAGE_CLEAR') return;

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
                e.preventDefault();
                this.superHop();
            } else if (e.code === 'KeyE' || e.code === 'KeyK') {
                e.preventDefault();
                this.tongueGrab();
            } else if (e.code === 'KeyQ' || e.code === 'KeyL') {
                e.preventDefault();
                this.powerCroak();
            }
        });

        // 技能按鈕
        const btnSuperHop = document.getElementById('btnSuperHop');
        const btnTongue = document.getElementById('btnTongue');
        const btnCroak = document.getElementById('btnCroak');

        if (btnSuperHop) {
            btnSuperHop.addEventListener('click', (e) => {
                e.preventDefault();
                window.soundEngine.init();
                this.superHop();
            });
        }
        if (btnTongue) {
            btnTongue.addEventListener('click', (e) => {
                e.preventDefault();
                window.soundEngine.init();
                this.tongueGrab();
            });
        }
        if (btnCroak) {
            btnCroak.addEventListener('click', (e) => {
                e.preventDefault();
                window.soundEngine.init();
                this.powerCroak();
            });
        }

        // 滑動手勢
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
                this.hop(0, 1);
            }
        }, { passive: true });

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

    // 4. 青蛙普通跳躍 (流暢坐標與角度)
    hop(dCol, dRow) {
        if (this.jumpAnim.active || this.state !== 'PLAYING') return;

        const targetRow = this.frogPos.row + dRow;
        if (targetRow < 0 || targetRow >= this.currentWorld.rows) return;

        // 計算目標 X 坐標 (避免被漂移強扯回原處)
        let targetX = this.frog.position.x;
        if (dCol !== 0) {
            targetX += dCol * this.GRID;
        } else {
            // 前後直跳時，微調對齊至最近的半網格，自然直行
            targetX = Math.round(targetX / (this.GRID * 0.5)) * (this.GRID * 0.5);
        }

        targetX = Math.max(-10.5, Math.min(10.5, targetX));

        // 朝向
        if (dRow > 0) this.frog.rotation.y = 0;
        else if (dRow < 0) this.frog.rotation.y = Math.PI;
        else if (dCol < 0) this.frog.rotation.y = Math.PI / 2;
        else if (dCol > 0) this.frog.rotation.y = -Math.PI / 2;

        this.jumpAnim.active = true;
        this.jumpAnim.type = 'NORMAL';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 160;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetX;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 1.1;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);

        window.soundEngine.playHop();
        this.addScore(10);
    }

    // 5. 超級大跳 (Super Hop - 前進 2 格越障)
    superHop() {
        if (this.jumpAnim.active || this.state !== 'PLAYING') return;
        if (this.cooldowns.superHop > 0) return;

        const targetRow = Math.min(this.currentWorld.rows - 1, this.frogPos.row + 2);
        const targetX = Math.max(-10.5, Math.min(10.5, this.frog.position.x));

        this.frog.rotation.y = 0;
        this.jumpAnim.active = true;
        this.jumpAnim.type = 'SUPER';
        this.jumpAnim.startTime = performance.now();
        this.jumpAnim.duration = 260;
        this.jumpAnim.startX = this.frog.position.x;
        this.jumpAnim.startZ = this.frog.position.z;
        this.jumpAnim.targetX = targetX;
        this.jumpAnim.targetZ = -targetRow * this.GRID;
        this.jumpAnim.peakY = 2.4;

        this.frogPos.row = targetRow;
        this.frogPos.col = Math.round(targetX / this.GRID);
        this.cooldowns.superHop = 160;

        window.soundEngine.playSuperHop();
        this.addScore(30);
    }

    // 6. 吐長舌抓捕 (Tongue Grab)
    tongueGrab() {
        if (this.tongueAnim.active || this.jumpAnim.active || this.state !== 'PLAYING') return;

        this.tongueAnim.active = true;
        this.tongueAnim.startTime = performance.now();

        window.soundEngine.playTongue();

        const frogX = this.frog.position.x;
        const frogZ = this.frog.position.z;

        // 舌頭抓金幣
        this.coinsList.forEach(coin => {
            if (!coin.userData.collected && Math.abs(coin.position.x - frogX) < 1.3 && coin.position.z < frogZ && coin.position.z > frogZ - 7.0) {
                coin.userData.collected = true;
                this.scene.remove(coin);
                this.coins += 5;
                localStorage.setItem('frogger3d_coins', this.coins);
                window.soundEngine.playCoin();
                this.addScore(50);
                this.updateHUD();
            }
        });

        // 舌頭抓飛蟲
        this.fliesList.forEach(fly => {
            if (Math.abs(fly.position.x - frogX) < 1.5 && fly.position.z < frogZ && fly.position.z > frogZ - 7.0) {
                this.scene.remove(fly);
                window.soundEngine.playCoin();
                this.addScore(150);
                this.lives = Math.min(5, this.lives + 1);
                this.updateHUD();
            }
        });
    }

    // 7. 超能蛙鳴 (Power Croak)
    powerCroak() {
        if (this.state !== 'PLAYING') return;

        window.soundEngine.playCroak();

        const ringGeo = new THREE.RingGeometry(0.3, 0.6, 20);
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
        this.ripples.push({ mesh: ring, scale: 1, opacity: 0.8, geo: ringGeo, mat: ringMat });

        // 尋找最近的小青蛙
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

        if (nearestBaby && nearestBaby.mesh && nearestBaby.mesh.userData && nearestBaby.mesh.userData.beacon) {
            nearestBaby.mesh.userData.beacon.material.opacity = 1.0;
            nearestBaby.mesh.scale.set(1.4, 1.4, 1.4);
            setTimeout(() => {
                if (nearestBaby && !nearestBaby.rescued && nearestBaby.mesh && nearestBaby.mesh.userData.beacon) {
                    nearestBaby.mesh.scale.set(1, 1, 1);
                    nearestBaby.mesh.userData.beacon.material.opacity = 0.45;
                }
            }, 1000);
        }
    }

    // 8. 拯救小青蛙判定
    checkRescue() {
        this.babyFrogs.forEach(b => {
            if (!b.rescued) {
                const dist = this.frog.position.distanceTo(b.mesh.position);
                if (dist < 1.7) {
                    b.rescued = true;
                    this.rescuedCount++;
                    window.soundEngine.playRescue();
                    this.addScore(300);

                    // 移除頭頂光柱與底座
                    if (b.mesh.userData.beacon) b.mesh.remove(b.mesh.userData.beacon);
                    if (b.mesh.userData.pad) b.mesh.remove(b.mesh.userData.pad);

                    // 疊加在主角背上
                    b.mesh.scale.set(0.55, 0.55, 0.55);
                    this.scene.remove(b.mesh);
                    b.mesh.position.set(0, (this.rescuedCount - 1) * 0.32, 0);
                    this.frog.userData.backpack.add(b.mesh);

                    this.updateHUD();

                    // 5 隻救齊：啟動終點光柱
                    if (this.rescuedCount >= 5 && this.goalPortal) {
                        this.goalPortal.userData.beam.visible = true;
                    }
                }
            }
        });
    }

    // 9. 著地判定
    onFrogLand() {
        const row = this.frogPos.row;
        const rowInfo = this.gridMap[row];
        if (!rowInfo) return;

        // A. 抵達終點
        if (rowInfo.type === 'GOAL') {
            if (this.rescuedCount >= 5) {
                this.state = 'STAGE_CLEAR';
                window.soundEngine.playStageWin();
                this.addScore(1000);
                setTimeout(() => {
                    this.currentWorldIndex = (this.currentWorldIndex + 1) % this.WORLDS.length;
                    this.buildWorld(this.WORLDS[this.currentWorldIndex]);
                    this.updateHUD();
                }, 2800);
            } else {
                this.powerCroak();
            }
            return;
        }

        // B. 著地在河流/熔岩
        if (rowInfo.type === 'WATER') {
            let onSafe = false;
            for (let obj of this.waterObjects) {
                if (obj.row === row) {
                    if (Math.abs(this.frog.position.x - obj.mesh.position.x) < obj.radius) {
                        onSafe = true;
                        break;
                    }
                }
            }

            if (!onSafe) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
                return;
            }
        }

        // 吃金幣
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

        // 拯救小青蛙
        this.checkRescue();
    }

    // 10. 觸發死亡 (安全防重複與重置)
    triggerDeath(type = 'CRASH') {
        if (this.state === 'DYING') return;

        this.state = 'DYING';
        this.lives--;
        this.updateHUD();

        if (this.deathTimer) clearTimeout(this.deathTimer);

        if (type === 'LAVA') {
            window.soundEngine.playLavaBurn();
            this.frog.scale.set(1.3, 0.2, 1.3);
        } else if (type === 'WATER') {
            window.soundEngine.playSplash();
            this.frog.position.y = -0.55;
        } else {
            window.soundEngine.playCrash();
            this.frog.scale.set(1.4, 0.1, 1.4);
        }

        this.deathTimer = setTimeout(() => {
            if (this.lives >= 0) {
                this.resetFrog();
            } else {
                this.lives = 3;
                this.score = 0;
                this.buildWorld(this.currentWorld);
            }
            this.updateHUD();
        }, 1100);
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

        if (babyIconsEl) {
            let html = '';
            for (let i = 0; i < 5; i++) {
                const rescued = i < this.rescuedCount;
                html += `<span style="opacity: ${rescued ? '1' : '0.3'}; filter: ${rescued ? 'none' : 'grayscale(1)'}; margin: 0 2px;">👶</span>`;
            }
            babyIconsEl.innerHTML = html;
        }
    }

    // 11. 遊戲主循環
    animate(timestamp) {
        const dt = Math.min(timestamp - this.lastTime, 50);
        this.lastTime = timestamp;

        // 守護機制：防卡死 Watchdog
        if (this.jumpAnim.active && timestamp - this.jumpAnim.startTime > 350) {
            this.jumpAnim.active = false;
            this.frog.position.y = 0;
            this.onFrogLand();
        }

        // 更新車輛
        this.vehicles.forEach(v => {
            v.mesh.position.x += v.speed * (dt / 1000);
            if (v.speed > 0 && v.mesh.position.x > 15) {
                v.mesh.position.x = -15;
            } else if (v.speed < 0 && v.mesh.position.x < -15) {
                v.mesh.position.x = 15;
            }

            // 車禍碰撞
            if (this.state === 'PLAYING' && this.frogPos.row === v.row) {
                const dx = Math.abs(this.frog.position.x - v.mesh.position.x);
                if (dx < (v.width * 0.5 + 0.35)) {
                    this.triggerDeath('CRASH');
                }
            }
        });

        // 更新漂浮物 (浮木/荷葉) 與河流持續落水判定
        const currentRow = this.frogPos.row;
        const rowInfo = this.gridMap[currentRow];
        let onAnyLog = false;

        this.waterObjects.forEach(w => {
            w.mesh.position.x += w.speed * (dt / 1000);
            if (w.speed > 0 && w.mesh.position.x > 15) {
                w.mesh.position.x = -15;
            } else if (w.speed < 0 && w.mesh.position.x < -15) {
                w.mesh.position.x = 15;
            }

            // 若站在浮木上，跟隨漂動
            if (this.state === 'PLAYING' && !this.jumpAnim.active && currentRow === w.row) {
                const dx = Math.abs(this.frog.position.x - w.mesh.position.x);
                if (dx < w.radius) {
                    onAnyLog = true;
                    this.frog.position.x += w.speed * (dt / 1000);
                    if (this.frog.position.x < -11.5 || this.frog.position.x > 11.5) {
                        this.triggerDeath('WATER');
                    }
                }
            }
        });

        // 核心水面檢測：站立在水面但腳下無浮木時，立刻落水！
        if (this.state === 'PLAYING' && !this.jumpAnim.active && rowInfo && rowInfo.type === 'WATER') {
            if (!onAnyLog) {
                this.triggerDeath(this.currentWorld.waterType === 'LAVA' ? 'LAVA' : 'WATER');
            }
        }

        // 金幣自轉
        this.coinsList.forEach(c => {
            if (!c.userData.collected) c.rotation.z += 0.04;
        });

        // 飛蟲拍翅
        this.fliesList.forEach(f => {
            f.userData.lWing.rotation.y = Math.sin(timestamp * 0.03) * 0.5;
            f.userData.rWing.rotation.y = -Math.sin(timestamp * 0.03) * 0.5;
            f.position.y = 1.2 + Math.sin(timestamp * 0.005) * 0.2;
        });

        // 小青蛙原地歡樂跳躍
        this.babyFrogs.forEach(b => {
            if (!b.rescued && b.mesh) {
                b.mesh.position.y = 0.2 + Math.abs(Math.sin(timestamp * 0.006)) * 0.25;
            }
        });

        // 跳躍拋物線插值
        if (this.jumpAnim.active) {
            const elapsed = timestamp - this.jumpAnim.startTime;
            const progress = Math.min(1, elapsed / this.jumpAnim.duration);

            this.frog.position.x = this.jumpAnim.startX + (this.jumpAnim.targetX - this.jumpAnim.startX) * progress;
            this.frog.position.z = this.jumpAnim.startZ + (this.jumpAnim.targetZ - this.jumpAnim.startZ) * progress;
            this.frog.position.y = Math.sin(progress * Math.PI) * this.jumpAnim.peakY;

            if (progress >= 1) {
                this.jumpAnim.active = false;
                this.frog.position.x = this.jumpAnim.targetX;
                this.frog.position.z = this.jumpAnim.targetZ;
                this.frog.position.y = 0;
                this.onFrogLand();
            }
        }

        // 吐舌頭伸展縮回
        if (this.tongueAnim.active && this.frog.userData.tongue) {
            const elapsed = timestamp - this.tongueAnim.startTime;
            const t = elapsed / this.tongueAnim.duration;
            if (t < 0.5) {
                this.frog.userData.tongue.scale.set(1, 1, t * 2 * 5.0);
            } else if (t < 1) {
                this.frog.userData.tongue.scale.set(1, 1, Math.max(0.001, (1 - t) * 2 * 5.0));
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
                r.geo.dispose();
                r.mat.dispose();
                this.ripples.splice(i, 1);
            }
        }

        if (this.cooldowns.superHop > 0) this.cooldowns.superHop--;

        // 平滑鏡頭追蹤
        const targetCamX = this.frog.position.x * 0.45;
        const targetCamZ = this.frog.position.z + 14;
        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
        this.camera.lookAt(this.frog.position.x * 0.3, 0.5, this.frog.position.z - 2);

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((t) => this.animate(t));
    }
}

// 頁面就緒後啟動
window.addEventListener('DOMContentLoaded', () => {
    window.game3D = new Frogger3DGame();
});
