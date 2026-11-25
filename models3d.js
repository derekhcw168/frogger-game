/**
 * Frogger 3D Odyssey - 精緻玩具微縮風 3D 模型庫 (Models3D v2)
 * 重要座標約定：
 * - 主角青蛙預設面朝 -Z（畫面正前方推進方向），舌頭沿 -Z 伸展，小青蛙背負於 +Z 背部。
 * - 所有載具預設車頭朝 +Z（由左往右時 rotation.y = +PI/2，由右往左時 rotation.y = -PI/2）。
 */

const Models3D = {
    // 6 款可解鎖 3D 主角造型定義
    SKINS: [
        {
            id: 'classic',
            name: '經典翠綠蛙',
            badge: '🐸',
            cost: 0,
            bodyColor: 0x24d044,
            bellyColor: 0xfff3a8,
            trailColor: 0x4ade80,
            desc: '活力滿滿的森林冒險家，附帶翠綠光點跳躍拖尾。'
        },
        {
            id: 'ninja',
            name: '暗影忍者蛙',
            badge: '⚔️',
            cost: 35,
            bodyColor: 0x1e293b,
            bellyColor: 0x94a3b8,
            trailColor: 0xff3366,
            desc: '身披赤紅頭巾與背負小太刀的疾風忍者，附帶緋紅櫻花拖尾。'
        },
        {
            id: 'cyber',
            name: '霓虹機甲蛙',
            badge: '🤖',
            cost: 65,
            bodyColor: 0xe2e8f0,
            bellyColor: 0x38bdf8,
            trailColor: 0x00f5ff,
            desc: '配備全息發光護目鏡與雙肩噴射器的未來機甲，附帶電漿藍拖尾。'
        },
        {
            id: 'gold',
            name: '皇家黃金蛙',
            badge: '👑',
            cost: 100,
            bodyColor: 0xffc800,
            bellyColor: 0xfff8dc,
            trailColor: 0xffdf40,
            desc: '24K 純金鏡面鍛造、頭戴紅寶石皇冠的尊爵王者，附帶璀璨星塵拖尾。'
        },
        {
            id: 'ghost',
            name: '幻影幽靈蛙',
            badge: '👻',
            cost: 130,
            bodyColor: 0x67e8f9,
            bellyColor: 0xe0f2fe,
            trailColor: 0xc084fc,
            desc: '半透明自發光靈體並環繞幽魂光環，附帶紫晶魂火拖尾。'
        },
        {
            id: 'dragon',
            name: '赤焰熔岩蛙',
            badge: '🐲',
            cost: 170,
            bodyColor: 0x292524,
            bellyColor: 0xff6b00,
            trailColor: 0xff4500,
            desc: '黑曜石鱗甲配烈焰雙角與發光背棘，附帶熾熱火星拖尾。'
        }
    ],

    getSkinInfo(skinId) {
        return this.SKINS.find(s => s.id === skinId) || this.SKINS[0];
    },

    // ==================== 1. 主角大青蛙 (面朝 -Z) ====================
    createFrogger(skinId = 'classic') {
        const skin = this.getSkinInfo(skinId);
        const frogGroup = new THREE.Group();

        // 視覺縮放層（用於 Q 彈擠壓與伸展動畫，不影響舌頭與背上小青蛙比例）
        const visualRoot = new THREE.Group();
        frogGroup.add(visualRoot);

        const isGold = skin.id === 'gold';
        const isGhost = skin.id === 'ghost';
        const isCyber = skin.id === 'cyber';
        const isDragon = skin.id === 'dragon';

        const skinMat = new THREE.MeshStandardMaterial({
            color: skin.bodyColor,
            roughness: isGold ? 0.16 : (isCyber ? 0.25 : 0.36),
            metalness: isGold ? 0.88 : (isCyber ? 0.65 : 0.12),
            transparent: isGhost,
            opacity: isGhost ? 0.82 : 1.0,
            emissive: isGhost ? 0x0ea5e9 : (isDragon ? 0x330800 : 0x000000),
            emissiveIntensity: isGhost ? 0.45 : 0.3
        });

        const bellyMat = new THREE.MeshStandardMaterial({
            color: skin.bellyColor,
            roughness: 0.4,
            metalness: isGold ? 0.5 : 0.05,
            emissive: isDragon ? 0xff4500 : (isCyber ? 0x0284c7 : 0x000000),
            emissiveIntensity: (isDragon || isCyber) ? 0.55 : 0
        });

        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: isDragon ? 0xffdd00 : 0x111111 });
        const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff77aa, transparent: true, opacity: 0.65 });
        const tongueMat = new THREE.MeshStandardMaterial({
            color: 0xff3377,
            emissive: 0x550022,
            emissiveIntensity: 0.35,
            roughness: 0.25
        });

        // 圓潤軀幹
        const bodyGeo = new THREE.SphereGeometry(0.54, 18, 14);
        bodyGeo.scale(1.12, 0.78, 1.18);
        const body = new THREE.Mesh(bodyGeo, skinMat);
        body.position.y = 0.45;
        body.castShadow = true;
        body.receiveShadow = true;
        visualRoot.add(body);

        // 肚皮 (朝前 -Z)
        const bellyGeo = new THREE.SphereGeometry(0.46, 14, 12);
        bellyGeo.scale(0.95, 0.62, 1.02);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.36, -0.11);
        visualRoot.add(belly);

        // 蛙鳴共鳴氣囊 (蛙鳴時鼓起發光)
        const sacGeo = new THREE.SphereGeometry(0.24, 12, 10);
        const sacMat = new THREE.MeshStandardMaterial({
            color: 0xfff088,
            emissive: 0x00ffaa,
            emissiveIntensity: 0.2,
            roughness: 0.3
        });
        const throatSac = new THREE.Mesh(sacGeo, sacMat);
        throatSac.position.set(0, 0.34, -0.44);
        throatSac.scale.set(0.5, 0.5, 0.5);
        visualRoot.add(throatSac);

        // 雙眼 (朝 -Z)
        const eyeSocketGeo = new THREE.SphereGeometry(0.22, 12, 10);
        const eyeBallGeo = new THREE.SphereGeometry(0.175, 12, 10);
        const pupilGeo = new THREE.SphereGeometry(0.085, 8, 8);

        [-1, 1].forEach(dir => {
            const socket = new THREE.Mesh(eyeSocketGeo, skinMat);
            socket.position.set(dir * 0.31, 0.76, -0.26);
            socket.castShadow = true;

            const ball = new THREE.Mesh(eyeBallGeo, eyeWhiteMat);
            ball.position.set(dir * 0.31, 0.79, -0.31);

            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(dir * 0.31, 0.80, -0.45);

            const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), cheekMat);
            cheek.scale.set(1.2, 0.7, 0.5);
            cheek.position.set(dir * 0.44, 0.54, -0.42);

            visualRoot.add(socket, ball, pupil, cheek);
        });

        // 前後四肢與璞足
        const frontFootGeo = new THREE.BoxGeometry(0.24, 0.09, 0.30);
        const flFoot = new THREE.Mesh(frontFootGeo, skinMat);
        flFoot.position.set(-0.50, 0.08, -0.34);
        flFoot.castShadow = true;
        const frFoot = new THREE.Mesh(frontFootGeo, skinMat);
        frFoot.position.set(0.50, 0.08, -0.34);
        frFoot.castShadow = true;

        const thighGeo = new THREE.SphereGeometry(0.22, 10, 10);
        thighGeo.scale(0.85, 0.9, 1.35);
        const blThigh = new THREE.Mesh(thighGeo, skinMat);
        blThigh.position.set(-0.54, 0.26, 0.24);
        const brThigh = new THREE.Mesh(thighGeo, skinMat);
        brThigh.position.set(0.54, 0.26, 0.24);

        const backFootGeo = new THREE.BoxGeometry(0.28, 0.09, 0.38);
        const blFoot = new THREE.Mesh(backFootGeo, skinMat);
        blFoot.position.set(-0.56, 0.08, 0.30);
        blFoot.castShadow = true;
        const brFoot = new THREE.Mesh(backFootGeo, skinMat);
        brFoot.position.set(0.56, 0.08, 0.30);
        brFoot.castShadow = true;

        visualRoot.add(flFoot, frFoot, blThigh, brThigh, blFoot, brFoot);

        // ===== 造型專屬 3D 配件 =====
        if (skin.id === 'ninja') {
            // 赤紅忍者頭巾與飄帶 + 背部武士小太刀
            const bandMat = new THREE.MeshStandardMaterial({ color: 0xff1e42, emissive: 0x440011, roughness: 0.4 });
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.065, 8, 20), bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.set(0, 0.63, -0.02);
            const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.48), bandMat);
            tail1.position.set(-0.14, 0.62, 0.62);
            tail1.rotation.set(-0.25, -0.2, 0);
            const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.42), bandMat);
            tail2.position.set(0.12, 0.58, 0.58);
            tail2.rotation.set(-0.35, 0.25, 0);

            const swordGroup = new THREE.Group();
            const scabbard = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.04, 1.05, 8),
                new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
            );
            const hilt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8),
                new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7 })
            );
            hilt.position.y = 0.62;
            const guard = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.13, 0.03, 10),
                new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 })
            );
            guard.position.y = 0.50;
            swordGroup.add(scabbard, hilt, guard);
            swordGroup.position.set(0.05, 0.55, 0.52);
            swordGroup.rotation.z = 0.68;
            visualRoot.add(band, tail1, tail2, swordGroup);
        } else if (skin.id === 'cyber') {
            // 全息發光護目鏡 + 雙肩噴射背包
            const visorMat = new THREE.MeshStandardMaterial({
                color: 0x00f5ff,
                emissive: 0x00f5ff,
                emissiveIntensity: 0.9,
                roughness: 0.1
            });
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.20, 0.22), visorMat);
            visor.position.set(0, 0.78, -0.42);
            visualRoot.add(visor);

            [-0.36, 0.36].forEach(jx => {
                const pod = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.11, 0.14, 0.42, 10),
                    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
                );
                pod.position.set(jx, 0.52, 0.46);
                pod.rotation.x = 0.3;
                const flame = new THREE.Mesh(
                    new THREE.ConeGeometry(0.09, 0.25, 8),
                    visorMat
                );
                flame.rotation.x = Math.PI;
                flame.position.y = -0.28;
                pod.add(flame);
                visualRoot.add(pod);
            });
        } else if (skin.id === 'gold') {
            // 皇家皇冠 + 紅寶石
            const crownGroup = new THREE.Group();
            const crownMat = new THREE.MeshStandardMaterial({
                color: 0xffe033,
                metalness: 0.92,
                roughness: 0.12,
                emissive: 0x443300
            });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.16, 12), crownMat);
            crownGroup.add(base);
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), crownMat);
                spike.position.set(Math.cos(a) * 0.23, 0.15, Math.sin(a) * 0.23);
                crownGroup.add(spike);
            }
            const ruby = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.09),
                new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0044, emissiveIntensity: 0.8 })
            );
            ruby.position.set(0, 0.04, -0.25);
            crownGroup.add(ruby);
            crownGroup.position.set(0, 0.95, 0.02);
            crownGroup.rotation.x = -0.12;
            visualRoot.add(crownGroup);
        } else if (skin.id === 'ghost') {
            // 頭頂靈魂光環
            const halo = new THREE.Mesh(
                new THREE.TorusGeometry(0.32, 0.045, 8, 24),
                new THREE.MeshBasicMaterial({ color: 0xc084fc })
            );
            halo.rotation.x = Math.PI / 2;
            halo.position.set(0, 1.06, 0);
            visualRoot.add(halo);
        } else if (skin.id === 'dragon') {
            // 烈焰雙角與發光熔岩背棘
            const hornMat = new THREE.MeshStandardMaterial({
                color: 0xff5500,
                emissive: 0xff3300,
                emissiveIntensity: 0.85,
                roughness: 0.25
            });
            [-0.26, 0.26].forEach(hx => {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.36, 8), hornMat);
                horn.position.set(hx, 0.96, -0.05);
                horn.rotation.z = hx < 0 ? 0.35 : -0.35;
                horn.rotation.x = 0.25;
                visualRoot.add(horn);
            });
            for (let s = 0; s < 3; s++) {
                const spine = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), hornMat);
                spine.position.set(0, 0.82 - s * 0.12, 0.14 + s * 0.18);
                spine.rotation.x = 0.45;
                visualRoot.add(spine);
            }
        }

        // 可伸長彈力長舌（原點位於嘴部，沿 -Z 伸展！）
        const tongueGeo = new THREE.CylinderGeometry(0.075, 0.075, 1.0, 8);
        tongueGeo.rotateX(Math.PI / 2);
        tongueGeo.translate(0, 0, -0.5); // 頂端在 z = -1.0
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0, 0.44, -0.52);
        tongue.scale.set(1, 1, 0.001);

        const tongueTip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), tongueMat);
        tongueTip.position.set(0, 0, -1.0);
        tongue.add(tongueTip);
        frogGroup.add(tongue);

        // 背部小萌蛙疊疊樂容器 (+Z 背側)
        const backpackGroup = new THREE.Group();
        backpackGroup.position.set(0, 0.82, 0.16);
        frogGroup.add(backpackGroup);

        frogGroup.userData = {
            skinId: skin.id,
            trailColor: skin.trailColor,
            visualRoot,
            body,
            throatSac,
            tongue,
            backpack: backpackGroup,
            limbs: { flFoot, frFoot, blFoot, brFoot }
        };

        return frogGroup;
    },

    // ==================== 2. 迷失小萌蛙 ====================
    createBabyFrog(colorHex = 0xff3344, name = '小紅') {
        const group = new THREE.Group();

        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.28,
            metalness: 0.12,
            emissive: colorHex,
            emissiveIntensity: 0.15
        });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        // 浮空能量睡蓮底座（保證在水道或公路旁清晰安全）
        const padGroup = new THREE.Group();
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.75, 0.68, 0.14, 14),
            new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 })
        );
        pad.receiveShadow = true;
        const glowRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.78, 0.045, 8, 24),
            new THREE.MeshBasicMaterial({ color: colorHex })
        );
        glowRing.rotation.x = Math.PI / 2;
        glowRing.position.y = 0.04;
        padGroup.add(pad, glowRing);
        padGroup.position.y = -0.05;
        group.add(padGroup);

        // 小萌蛙圓滾身體（在場上時面朝 +Z 鏡頭賣萌）
        const bodyMesh = new THREE.Group();
        const torsoGeo = new THREE.SphereGeometry(0.27, 14, 12);
        torsoGeo.scale(1.12, 0.88, 1.1);
        const torso = new THREE.Mesh(torsoGeo, mat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        bodyMesh.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), bellyMat);
        belly.position.set(0, 0.20, 0.09);
        bodyMesh.add(belly);

        [-0.13, 0.13].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), eyeMat);
            eye.position.set(ex, 0.39, 0.15);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), pupilMat);
            pupil.position.set(ex, 0.40, 0.24);
            bodyMesh.add(eye, pupil);
        });
        group.add(bodyMesh);

        // 柔和方位光柱
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.28, 4.8, 10, 1, true);
        beaconGeo.translate(0, 2.4, 0);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.36,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        group.add(beacon);

        group.userData = {
            name,
            colorHex,
            beacon,
            pad: padGroup,
            bodyMesh,
            isRescued: false
        };

        return group;
    },

    // ==================== 3. 五界特色載具與移動威脅 ====================
    createVehicle(type = 'TOY_RACER') {
        const group = new THREE.Group();
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.85 });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff7aa });
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });

        const addWheels = (w, l, r = 0.24) => {
            const wGeo = new THREE.CylinderGeometry(r, r, 0.20, 12);
            wGeo.rotateZ(Math.PI / 2);
            [
                [-w * 0.52, r, l * 0.3],
                [w * 0.52, r, l * 0.3],
                [-w * 0.52, r, -l * 0.3],
                [w * 0.52, r, -l * 0.3]
            ].forEach(p => {
                const wheel = new THREE.Mesh(wGeo, wheelMat);
                wheel.position.set(...p);
                wheel.castShadow = true;
                group.add(wheel);
            });
        };

        const addLights = (w, y, frontZ, backZ) => {
            [-w * 0.32, w * 0.32].forEach(lx => {
                const hl = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), headlightMat);
                hl.position.set(lx, y, frontZ);
                const tl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.05), taillightMat);
                tl.position.set(lx, y, backZ);
                group.add(hl, tl);
            });
        };

        if (type === 'LAWNMOWER') {
            // 花園割草車
            const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
            const deckMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
            const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.45, 1.9), redMat);
            chassis.position.y = 0.42;
            chassis.castShadow = true;
            const hood = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.85), redMat);
            hood.position.set(0, 0.72, 0.38);
            hood.castShadow = true;
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.35, 0.5),
                new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
            );
            seat.position.set(0, 0.78, -0.45);
            const bladeDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.12, 12), deckMat);
            bladeDeck.position.set(0, 0.16, 0.05);
            group.add(chassis, hood, seat, bladeDeck);
            addWheels(1.2, 1.8, 0.24);
            addLights(0.9, 0.68, 0.82, -0.96);
            group.userData = { length: 2.0, width: 1.35, spinPart: bladeDeck };
        } else if (type === 'PICKUP') {
            // 鄉村木欄皮卡
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.32, metalness: 0.25 });
            const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.52, 3.2), bodyMat);
            base.position.y = 0.48;
            base.castShadow = true;
            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.55, 1.25), glassMat);
            cab.position.set(0, 0.95, 0.45);
            cab.castShadow = true;
            const bed = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.42, 1.45), woodMat);
            bed.position.set(0, 0.82, -0.82);
            bed.castShadow = true;
            group.add(base, cab, bed);
            addWheels(1.45, 3.0, 0.28);
            addLights(1.2, 0.52, 1.61, -1.61);
            group.userData = { length: 3.3, width: 1.5 };
        } else if (type === 'BOULDER') {
            // 神廟符文滾石陷阱
            const rockGroup = new THREE.Group();
            const rockGeo = new THREE.DodecahedronGeometry(0.88, 1);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.castShadow = true;
            const runeRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.84, 0.06, 6, 16),
                new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
            );
            rockGroup.add(rock, runeRing);
            rockGroup.position.y = 0.86;
            group.add(rockGroup);
            group.userData = { length: 1.85, width: 1.8, spinBall: rockGroup };
        } else if (type === 'TEMPLE_CHARIOT') {
            // 神廟黃金衝車
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 2.9), stoneMat);
            body.position.y = 0.65;
            body.castShadow = true;
            const ram = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 6), goldMat);
            ram.rotation.x = Math.PI / 2;
            ram.position.set(0, 0.62, 1.75);
            group.add(body, ram);
            addWheels(1.5, 2.5, 0.34);
            group.userData = { length: 3.4, width: 1.55 };
        } else if (type === 'HEARSE') {
            // 古堡幽冥靈車
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.4, metalness: 0.3 });
            const lanternMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 3.1), darkMat);
            base.position.y = 0.48;
            base.castShadow = true;
            const roof = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.72, 2.1), darkMat);
            roof.position.set(0, 1.05, -0.2);
            roof.castShadow = true;
            [-0.58, 0.58].forEach(lx => {
                const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), lanternMat);
                lantern.position.set(lx, 0.92, 1.35);
                group.add(lantern);
            });
            group.add(base, roof);
            addWheels(1.42, 2.8, 0.3);
            group.userData = { length: 3.2, width: 1.45 };
        } else if (type === 'GHOST') {
            // 古堡遊蕩幽靈（可被超能蛙鳴震散！）
            const ghostMat = new THREE.MeshStandardMaterial({
                color: 0xa5f3fc,
                emissive: 0x8b5cf6,
                emissiveIntensity: 0.75,
                transparent: true,
                opacity: 0.82,
                roughness: 0.2
            });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), ghostMat);
            head.position.y = 1.05;
            const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.95, 12, 1, true), ghostMat);
            skirt.position.y = 0.58;
            skirt.rotation.x = Math.PI;
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0066 });
            [-0.22, 0.22].forEach(ex => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), eyeMat);
                eye.position.set(ex, 1.12, 0.54);
                group.add(eye);
            });
            group.add(head, skirt);
            group.userData = { length: 1.5, width: 1.4, isGhost: true, banished: false };
        } else if (type === 'LAVA_TRAIN') {
            // 熔岩重裝火車
            const ironMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.75, roughness: 0.35 });
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff3300, emissiveIntensity: 0.95 });
            const hull = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.9, 4.2), ironMat);
            hull.position.y = 0.65;
            hull.castShadow = true;
            const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 2.6, 12), coreMat);
            boiler.rotation.x = Math.PI / 2;
            boiler.position.set(0, 1.05, 0.4);
            const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.65, 10), ironMat);
            stack.position.set(0, 1.58, 1.25);
            group.add(hull, boiler, stack);
            addWheels(1.56, 3.6, 0.3);
            addLights(1.1, 0.75, 2.12, -2.12);
            group.userData = { length: 4.3, width: 1.6 };
        } else if (type === 'MAGMA_BEETLE') {
            // 熔岩裝甲蟲車
            const shellMat = new THREE.MeshStandardMaterial({
                color: 0x450a0a,
                emissive: 0xdc2626,
                emissiveIntensity: 0.45,
                roughness: 0.3
            });
            const domeGeo = new THREE.SphereGeometry(0.95, 14, 12);
            domeGeo.scale(0.85, 0.65, 1.35);
            const dome = new THREE.Mesh(domeGeo, shellMat);
            dome.position.y = 0.55;
            dome.castShadow = true;
            group.add(dome);
            addWheels(1.4, 2.0, 0.25);
            addLights(0.85, 0.55, 1.22, -1.22);
            group.userData = { length: 2.5, width: 1.45 };
        } else if (type === 'HOVER_CAR') {
            // 賽博懸浮飛車
            const hullMat = new THREE.MeshStandardMaterial({
                color: 0x283655,
                emissive: 0x0b132b,
                emissiveIntensity: 0.45,
                metalness: 0.55,
                roughness: 0.22
            });
            const neonColor = Math.random() > 0.5 ? 0x00f5ff : 0xff00aa;
            const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 2.8), hullMat);
            body.position.y = 0.65;
            body.castShadow = true;
            const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.45), glassMat);
            canopy.position.set(0, 0.98, -0.05);
            const strip = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 2.86), neonMat);
            strip.position.y = 0.55;
            group.add(body, canopy, strip);
            addLights(1.1, 0.68, 1.42, -1.42);
            group.userData = { length: 2.85, width: 1.48, isHover: true };
        } else if (type === 'CYBER_DRONE') {
            // 賽博攔截無人機
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            const core = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.52),
                new THREE.MeshStandardMaterial({ color: 0x1e1b4b, emissive: 0xec4899, emissiveIntensity: 0.7 })
            );
            core.position.y = 0.85;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.07, 8, 20), ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.85;
            group.add(core, ring);
            group.userData = { length: 1.75, width: 1.7, isHover: true, spinPart: ring };
        } else {
            // TOY_RACER 經典流線跑車
            const palette = [0xff2a5f, 0xffbe0b, 0x3a86ff, 0x8338ec];
            const carColor = palette[Math.floor(Math.random() * palette.length)];
            const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.22, metalness: 0.35 });
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.46, 2.55), bodyMat);
            base.position.y = 0.42;
            base.castShadow = true;
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.42, 1.25), glassMat);
            cabin.position.set(0, 0.80, -0.1);
            cabin.castShadow = true;
            const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 0.28), bodyMat);
            spoiler.position.set(0, 0.76, -1.12);
            group.add(base, cabin, spoiler);
            addWheels(1.36, 2.3, 0.24);
            addLights(1.0, 0.46, 1.28, -1.28);
            group.userData = { length: 2.6, width: 1.4 };
        }

        return group;
    },

    // ==================== 4. 五界水上/岩漿/數據浮台 ====================
    createPlatform(type = 'LOG', length = 3.8) {
        const group = new THREE.Group();

        if (type === 'LILYPAD') {
            const radius = length;
            const padMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });
            const pad = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, 0.14, 18, 1, false, 0.25, Math.PI * 1.85), padMat);
            pad.receiveShadow = true;
            group.add(pad);

            // 盛開蓮花
            const flower = new THREE.Group();
            const petalMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x500724, roughness: 0.3 });
            for (let i = 0; i < 6; i++) {
                const p = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.30, 5), petalMat);
                p.rotation.z = Math.PI / 3.5;
                p.rotation.y = (i * Math.PI * 2) / 6;
                flower.add(p);
            }
            flower.position.set(radius * 0.35, 0.16, -radius * 0.2);
            group.add(flower);
            group.userData = { halfSpan: radius * 1.05, platformType: 'LILYPAD' };
        } else if (type === 'DIVING_TURTLE') {
            // 2~3 隻結隊潛水烏龜
            const count = Math.max(2, Math.round(length / 1.45));
            const shellMats = [];
            const turtles = [];
            const spacing = 1.35;
            const startX = -((count - 1) * spacing) * 0.5;

            for (let i = 0; i < count; i++) {
                const tGroup = new THREE.Group();
                const sMat = new THREE.MeshStandardMaterial({
                    color: 0xea580c,
                    emissive: 0x000000,
                    roughness: 0.38
                });
                shellMats.push(sMat);
                const skinMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });

                const shellGeo = new THREE.SphereGeometry(0.55, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
                const shell = new THREE.Mesh(shellGeo, sMat);
                shell.scale.set(1.05, 0.72, 0.95);
                shell.castShadow = true;

                const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 8), skinMat);
                head.position.set(0.62, 0.12, 0);

                tGroup.add(shell, head);
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
            // 神廟浮雕石筏
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.75 });
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.75, roughness: 0.25 });
            const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.34, 1.52), stoneMat);
            slab.castShadow = true;
            slab.receiveShadow = true;
            const trim = new THREE.Mesh(new THREE.BoxGeometry(length * 0.92, 0.08, 1.25), goldMat);
            trim.position.y = 0.18;
            group.add(slab, trim);
            group.userData = { halfSpan: length * 0.52, platformType: 'STONE_RAFT' };
        } else if (type === 'CROCODILE') {
            // 神廟巨鱷（背部安全，張嘴時頭部危險！）
            const crocMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
            const jawRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const bodyLen = length - 1.1;
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, 0.42, 1.18), crocMat);
            body.position.x = -0.45;
            body.castShadow = true;
            body.receiveShadow = true;

            // 上下顎（頭朝 +X，當 speed < 0 時外層會翻轉 scale.x = -1）
            const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.16, 0.95), crocMat);
            lowerJaw.position.set(bodyLen * 0.5 + 0.05, -0.05, 0);

            const upperJaw = new THREE.Group();
            upperJaw.position.set(bodyLen * 0.5 - 0.45, 0.12, 0);
            const snout = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.20, 0.95), crocMat);
            snout.position.set(0.55, 0.05, 0);
            const mouthIn = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), jawRedMat);
            mouthIn.rotation.x = Math.PI / 2;
            mouthIn.position.set(0.55, -0.06, 0);
            upperJaw.add(snout, mouthIn);

            [-0.32, 0.32].forEach(ez => {
                const eye = new THREE.Mesh(
                    new THREE.SphereGeometry(0.11, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
                );
                eye.position.set(bodyLen * 0.5 - 0.3, 0.30, ez);
                group.add(eye);
            });

            group.add(body, lowerJaw, upperJaw);
            group.userData = {
                halfSpan: length * 0.5,
                platformType: 'CROCODILE',
                upperJaw
            };
        } else if (type === 'COFFIN_RAFT') {
            // 古堡幽魂木筏 + 紫火提燈
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b1d5e, roughness: 0.7 });
            const raft = new THREE.Mesh(new THREE.BoxGeometry(length, 0.30, 1.45), woodMat);
            raft.castShadow = true;
            raft.receiveShadow = true;
            const post = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.18),
                new THREE.MeshBasicMaterial({ color: 0xc084fc })
            );
            post.position.set(length * 0.42, 0.42, -0.48);
            group.add(raft, post);
            group.userData = { halfSpan: length * 0.52, platformType: 'COFFIN_RAFT' };
        } else if (type === 'BASALT_SLAB') {
            // 火山下沉玄武岩石板（踩踏後裂紋發亮預警下沉！）
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.85 });
            const crackMat = new THREE.MeshStandardMaterial({
                color: 0xff5500,
                emissive: 0xff3300,
                emissiveIntensity: 0.35,
                roughness: 0.3
            });
            const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.36, 1.56), rockMat);
            slab.castShadow = true;
            slab.receiveShadow = true;
            const seam = new THREE.Mesh(new THREE.BoxGeometry(length * 0.86, 0.38, 0.22), crackMat);
            const seam2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.32), crackMat);
            group.add(slab, seam, seam2);
            group.userData = {
                halfSpan: length * 0.52,
                platformType: 'BASALT_SLAB',
                crackMat
            };
        } else if (type === 'HOLO_PAD') {
            // 賽博全息能量浮板
            const frameMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
            const coreMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                emissive: 0x00f5ff,
                emissiveIntensity: 0.55,
                transparent: true,
                opacity: 0.82
            });
            const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 1.52), coreMat);
            const rim = new THREE.Mesh(new THREE.BoxGeometry(length + 0.08, 0.08, 1.6), frameMat);
            rim.position.y = 0.08;
            group.add(deck, rim);
            group.userData = { halfSpan: length * 0.52, platformType: 'HOLO_PAD' };
        } else {
            // 經典立體樹皮圓木
            const barkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.82 });
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });
            const mossMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });

            const logGeo = new THREE.CylinderGeometry(0.56, 0.56, length, 14);
            logGeo.rotateZ(Math.PI / 2);
            const logMesh = new THREE.Mesh(logGeo, barkMat);
            logMesh.castShadow = true;
            logMesh.receiveShadow = true;
            group.add(logMesh);

            [-1, 1].forEach(side => {
                const cap = new THREE.Mesh(new THREE.CircleGeometry(0.53, 14), coreMat);
                cap.position.x = side * (length * 0.502);
                cap.rotation.y = side * (Math.PI / 2);
                group.add(cap);
            });

            const moss = new THREE.Mesh(new THREE.BoxGeometry(length * 0.35, 0.08, 0.45), mossMat);
            moss.position.set(0.2, 0.54, 0.08);
            group.add(moss);

            group.userData = { halfSpan: length * 0.52, platformType: 'LOG' };
        }

        return group;
    },

    // ==================== 5. 地面定點陷阱與互動機關 ====================
    createHazardProp(type = 'PIRANHA_PLANT') {
        const group = new THREE.Group();

        if (type === 'PIRANHA_PLANT') {
            // 神廟大嘴食人花
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.42, 0.45, 10),
                new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 })
            );
            pot.position.y = 0.22;
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.11, 0.14, 0.55, 8),
                new THREE.MeshStandardMaterial({ color: 0x16a34a })
            );
            stem.position.y = 0.58;

            const head = new THREE.Group();
            head.position.y = 0.95;
            const headMat = new THREE.MeshStandardMaterial({
                color: 0xe11d48,
                emissive: 0x4c0519,
                roughness: 0.3
            });
            const jawL = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10, 0, Math.PI), headMat);
            const jawR = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10, Math.PI, Math.PI), headMat);
            head.add(jawL, jawR);
            group.add(pot, stem, head);
            group.userData = { head, jawL, jawR };
        } else if (type === 'LAVA_GEYSER') {
            // 火山間歇熔岩噴泉
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.78, 0.28, 10),
                new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 })
            );
            rim.position.y = 0.14;
            const corePool = new THREE.Mesh(
                new THREE.CircleGeometry(0.46, 12),
                new THREE.MeshBasicMaterial({ color: 0xff5500 })
            );
            corePool.rotation.x = -Math.PI / 2;
            corePool.position.y = 0.29;

            const plumeGeo = new THREE.CylinderGeometry(0.28, 0.52, 3.2, 12);
            plumeGeo.translate(0, 1.6, 0);
            const plumeMat = new THREE.MeshBasicMaterial({
                color: 0xff6b00,
                transparent: true,
                opacity: 0.9
            });
            const plume = new THREE.Mesh(plumeGeo, plumeMat);
            plume.scale.set(1, 0.01, 1);
            group.add(rim, corePool, plume);
            group.userData = { plume, corePool };
        } else if (type === 'SWITCH_ORB') {
            // 可用長舌或踩踏觸發的能量水晶機關（暫緩全場陷阱 5 秒！）
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.68, 0.25, 10),
                new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
            );
            base.position.y = 0.12;
            const orbMat = new THREE.MeshStandardMaterial({
                color: 0x00f5ff,
                emissive: 0x00f5ff,
                emissiveIntensity: 0.85,
                roughness: 0.1
            });
            const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36), orbMat);
            orb.position.y = 0.82;
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.52, 0.045, 8, 20),
                new THREE.MeshBasicMaterial({ color: 0xfacc15 })
            );
            ring.position.y = 0.82;
            group.add(base, orb, ring);
            group.userData = { orb, ring, orbMat, activated: false };
        }

        return group;
    },

    // ==================== 6. 兩岸微縮模型景觀裝飾 ====================
    createBankCluster(worldId = 1, side = 1) {
        const group = new THREE.Group();

        if (worldId === 1) {
            // 花園松樹與小花叢
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.24, 0.9, 8),
                new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
            );
            trunk.position.y = 0.45;
            const leavesMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
            const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 8), leavesMat);
            c1.position.y = 1.25;
            c1.castShadow = true;
            const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 8), leavesMat);
            c2.position.y = 1.95;
            c2.castShadow = true;
            group.add(trunk, c1, c2);
        } else if (worldId === 2) {
            // 神廟古老石柱與聖火盆
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.42, 0.48, 2.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 })
            );
            pillar.position.y = 1.1;
            pillar.castShadow = true;
            const flame = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.32),
                new THREE.MeshBasicMaterial({ color: 0xff9500 })
            );
            flame.position.y = 2.42;
            group.add(pillar, flame);
        } else if (worldId === 3) {
            // 古堡枯樹墓碑與發光南瓜燈
            const stone = new THREE.Mesh(
                new THREE.BoxGeometry(0.75, 1.15, 0.25),
                new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
            );
            stone.position.y = 0.55;
            stone.rotation.z = side * 0.12;
            const pumpkin = new THREE.Mesh(
                new THREE.SphereGeometry(0.34, 10, 8),
                new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xff6b00, emissiveIntensity: 0.65 })
            );
            pumpkin.scale.y = 0.8;
            pumpkin.position.set(-side * 0.55, 0.28, 0.35);
            group.add(stone, pumpkin);
        } else if (worldId === 4) {
            // 火山發光熔岩水晶簇
            const crystalMat = new THREE.MeshStandardMaterial({
                color: 0xdc2626,
                emissive: 0xff4500,
                emissiveIntensity: 0.75,
                roughness: 0.2
            });
            const spire1 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.1, 6), crystalMat);
            spire1.position.y = 1.05;
            spire1.rotation.z = side * 0.15;
            const spire2 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.35, 6), crystalMat);
            spire2.position.set(-side * 0.45, 0.65, 0.3);
            spire2.rotation.z = -side * 0.22;
            group.add(spire1, spire2);
        } else {
            // 賽博霓虹摩天光塔
            const towerMat = new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                emissive: 0x091326,
                emissiveIntensity: 0.45,
                metalness: 0.5,
                roughness: 0.28
            });
            const neonColor = side > 0 ? 0x00f5ff : 0xff00aa;
            const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.4, 1.1), towerMat);
            tower.position.y = 1.7;
            const strip = new THREE.Mesh(
                new THREE.BoxGeometry(1.16, 0.14, 1.16),
                new THREE.MeshBasicMaterial({ color: neonColor })
            );
            strip.position.y = 2.8;
            const strip2 = strip.clone();
            strip2.position.y = 1.6;
            group.add(tower, strip, strip2);
        }

        return group;
    },

    // ==================== 7. 金幣、螢火蟲、指南光箭、傳送陣 ====================
    createCoin() {
        const group = new THREE.Group();
        const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 16);
        coinGeo.rotateX(Math.PI / 2);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0x664400,
            emissiveIntensity: 0.4,
            metalness: 0.85,
            roughness: 0.18
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.castShadow = true;
        group.add(coin);
        group.userData = { isCoin: true, collected: false };
        return group;
    },

    createFly() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x1e293b })
        );
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xa3e635 })
        );
        glow.position.z = -0.08;

        const wingGeo = new THREE.PlaneGeometry(0.22, 0.16);
        const wingMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.78,
            side: THREE.DoubleSide
        });
        const lWing = new THREE.Mesh(wingGeo, wingMat);
        lWing.position.set(-0.14, 0.09, 0);
        const rWing = new THREE.Mesh(wingGeo, wingMat);
        rWing.position.set(0.14, 0.09, 0);

        group.add(body, glow, lWing, rWing);
        group.userData = { lWing, rWing, isFly: true, collected: false };
        return group;
    },

    createCompassArrow() {
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.9
        });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 8), mat);
        cone.rotation.x = -Math.PI / 2; // 指向 -Z
        cone.position.set(0, 0.35, -1.35);
        group.add(cone);
        group.visible = false;
        return group;
    },

    createGoalPortal(worldId = 1) {
        const group = new THREE.Group();
        const portalColor = worldId === 5 ? 0xff00aa : 0x00f5ff;

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.55, 0.14, 10, 28),
            new THREE.MeshBasicMaterial({ color: portalColor, wireframe: true })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.28;
        group.add(ring);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.38, 1.55, 0.26, 12),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.25 })
        );
        base.position.y = 0.12;
        base.receiveShadow = true;
        group.add(base);

        const beamGeo = new THREE.CylinderGeometry(0.95, 1.15, 11, 18, 1, true);
        beamGeo.translate(0, 5.5, 0);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.visible = false;
        group.add(beam);

        group.userData = { ring, beam };
        return group;
    },

    // ==================== 8. 最終頭目：機械巨鱷皇 (Mecha-Swampy Rex) ====================
    createMechaBoss() {
        const boss = new THREE.Group();

        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x3b4876,
            emissive: 0x171f42,
            emissiveIntensity: 0.55,
            metalness: 0.48,
            roughness: 0.28
        });
        const trimMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            metalness: 0.6,
            roughness: 0.25
        });
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
        const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

        // 重裝軀幹 (面朝 +Z 對決玩家)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 3.6), armorMat);
        torso.position.y = 1.15;
        torso.castShadow = true;
        const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(3.52, 0.22, 3.68), cyanMat);
        chestPlate.position.y = 1.15;
        boss.add(torso, chestPlate);

        // 背部發光霓虹裝甲鰭
        for (let i = 0; i < 3; i++) {
            const fin = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 6), neonMat);
            fin.position.set(0, 2.35, -1.1 + i * 0.95);
            boss.add(fin);
        }

        // 雙肩電漿飛彈發射艙
        [-1.95, 1.95].forEach(px => {
            const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.6, 10), armorMat);
            pod.rotation.x = Math.PI / 2;
            pod.position.set(px, 1.75, 0.2);
            const muzzle = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.38, 12), cyanMat);
            muzzle.position.set(px, 1.75, 1.02);
            boss.add(pod, muzzle);
        });

        // 機械巨顎（下顎固定，上顎可張開露出能量核心！）
        const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.42, 2.2), armorMat);
        lowerJaw.position.set(0, 0.55, 2.35);
        boss.add(lowerJaw);

        const upperJawPivot = new THREE.Group();
        upperJawPivot.position.set(0, 1.15, 1.45);

        const upperSnout = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.65, 2.25), armorMat);
        upperSnout.position.set(0, 0.25, 0.95);
        upperSnout.castShadow = true;
        const snoutRim = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.10, 2.30), neonMat);
        snoutRim.position.set(0, 0.56, 0.95);
        upperJawPivot.add(upperSnout, snoutRim);

        // 雙目猩紅電子眼
        [-0.82, 0.82].forEach(ex => {
            const eye = new THREE.Mesh(
                new THREE.BoxGeometry(0.48, 0.24, 0.2),
                new THREE.MeshBasicMaterial({ color: 0xff1144 })
            );
            eye.position.set(ex, 0.68, 0.65);
            upperJawPivot.add(eye);
        });

        // 鋸齒雷射尖牙
        [-0.95, -0.35, 0.35, 0.95].forEach(tx => {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), cyanMat);
            fang.rotation.x = Math.PI;
            fang.position.set(tx, -0.15, 1.85);
            upperJawPivot.add(fang);
        });

        boss.add(upperJawPivot);

        // 喉部暴露弱點：超載能量核心（長舌抓捕目標！）
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xffea00,
            emissive: 0xff00aa,
            emissiveIntensity: 1.2,
            roughness: 0.1
        });
        const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.56, 1), coreMat);
        coreMesh.position.set(0, 1.05, 2.25);
        coreMesh.visible = false;
        boss.add(coreMesh);

        // 護盾光環
        const shieldRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.6, 0.08, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.5 })
        );
        shieldRing.rotation.x = Math.PI / 2;
        shieldRing.position.y = 0.25;
        boss.add(shieldRing);

        boss.userData = {
            upperJawPivot,
            coreMesh,
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
            new THREE.SphereGeometry(0.36, 12, 12),
            new THREE.MeshBasicMaterial({ color })
        );
        const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.52, 0.05, 6, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        group.add(core, halo);
        group.userData = { halo, core };
        return group;
    }
};

window.Models3D = Models3D;
