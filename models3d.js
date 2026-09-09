/**
 * Frogger 3D Odyssey - 程序化 3D 幾何模型庫 (Procedural 3D Mesh Generator)
 * 專為《青蛙過街2》(Frogger 2) 風格打造：圓潤可愛的主角、5 隻走失小萌蛙、立體車流、機關與多世界地圖物件
 * 零外部模型檔依賴，極速 100% 秒開！
 */

const Models3D = {
    // 常用材質快取
    materials: {},

    getMat(name, params) {
        if (!this.materials[name]) {
            this.materials[name] = new THREE.MeshStandardMaterial(params);
        }
        return this.materials[name];
    },

    /**
     * 1. 建立主角大青蛙 (Frogger)
     */
    createFrogger() {
        const frogGroup = new THREE.Group();

        // 身體材質
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0x22cc33,
            roughness: 0.4,
            metalness: 0.1
        });
        const bellyMat = new THREE.MeshStandardMaterial({
            color: 0xfff3a0,
            roughness: 0.5
        });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2
        });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x880022 });
        const tongueMat = new THREE.MeshStandardMaterial({
            color: 0xff3377,
            roughness: 0.3
        });

        // 軀幹 (圓角略扁主體)
        const bodyGeo = new THREE.SphereGeometry(0.55, 16, 12);
        bodyGeo.scale(1.1, 0.75, 1.2);
        const body = new THREE.Mesh(bodyGeo, skinMat);
        body.position.y = 0.45;
        body.castShadow = true;
        body.receiveShadow = true;
        frogGroup.add(body);

        // 肚皮
        const bellyGeo = new THREE.SphereGeometry(0.48, 12, 10);
        bellyGeo.scale(0.95, 0.6, 1.05);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.38, 0.08);
        frogGroup.add(belly);

        // 雙眼 (凸起立體大眼)
        const eyeSocketGeo = new THREE.SphereGeometry(0.22, 12, 10);
        const eyeBallGeo = new THREE.SphereGeometry(0.18, 12, 10);
        const pupilGeo = new THREE.SphereGeometry(0.09, 8, 8);

        // 左眼
        const leftSocket = new THREE.Mesh(eyeSocketGeo, skinMat);
        leftSocket.position.set(-0.32, 0.75, 0.28);
        leftSocket.castShadow = true;
        const leftBall = new THREE.Mesh(eyeBallGeo, eyeMat);
        leftBall.position.set(-0.32, 0.78, 0.32);
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.32, 0.8, 0.45);
        frogGroup.add(leftSocket, leftBall, leftPupil);

        // 右眼
        const rightSocket = new THREE.Mesh(eyeSocketGeo, skinMat);
        rightSocket.position.set(0.32, 0.75, 0.28);
        rightSocket.castShadow = true;
        const rightBall = new THREE.Mesh(eyeBallGeo, eyeMat);
        rightBall.position.set(0.32, 0.78, 0.32);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.32, 0.8, 0.45);
        frogGroup.add(rightSocket, rightBall, rightPupil);

        // 前後四肢
        const limbGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.38, 8);
        const footGeo = new THREE.BoxGeometry(0.24, 0.08, 0.28);

        // 前左手
        const flArm = new THREE.Mesh(limbGeo, skinMat);
        flArm.position.set(-0.52, 0.28, 0.32);
        flArm.rotation.z = Math.PI / 4;
        const flFoot = new THREE.Mesh(footGeo, skinMat);
        flFoot.position.set(-0.62, 0.12, 0.38);
        frogGroup.add(flArm, flFoot);

        // 前右手
        const frArm = new THREE.Mesh(limbGeo, skinMat);
        frArm.position.set(0.52, 0.28, 0.32);
        frArm.rotation.z = -Math.PI / 4;
        const frFoot = new THREE.Mesh(footGeo, skinMat);
        frFoot.position.set(0.62, 0.12, 0.38);
        frogGroup.add(frArm, frFoot);

        // 後左腳 (壯碩蛙腿)
        const blLeg = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), skinMat);
        blLeg.scale.set(1, 0.8, 1.4);
        blLeg.position.set(-0.54, 0.35, -0.28);
        blLeg.rotation.x = -Math.PI / 8;
        const blFoot = new THREE.Mesh(footGeo, skinMat);
        blFoot.position.set(-0.62, 0.12, -0.32);
        frogGroup.add(blLeg, blFoot);

        // 後右腳
        const brLeg = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), skinMat);
        brLeg.scale.set(1, 0.8, 1.4);
        brLeg.position.set(0.54, 0.35, -0.28);
        brLeg.rotation.x = -Math.PI / 8;
        const brFoot = new THREE.Mesh(footGeo, skinMat);
        brFoot.position.set(0.62, 0.12, -0.32);
        frogGroup.add(brLeg, brFoot);

        // 可伸長粉紅舌頭 (預設收起 scale.z = 0)
        const tongueGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        tongueGeo.rotateX(Math.PI / 2);
        tongueGeo.translate(0, 0, 0.5); // 原點在舌根
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0, 0.42, 0.6);
        tongue.scale.set(1, 1, 0.001); // 平時隱藏收縮

        // 舌尖黏球
        const tipGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const tongueTip = new THREE.Mesh(tipGeo, tongueMat);
        tongueTip.position.set(0, 0, 1);
        tongue.add(tongueTip);
        frogGroup.add(tongue);

        // 背部小青蛙排隊容器 (Saved Frogs backpack)
        const backpackGroup = new THREE.Group();
        backpackGroup.position.set(0, 0.72, -0.15);
        frogGroup.add(backpackGroup);

        frogGroup.userData = {
            tongue: tongue,
            body: body,
            backpack: backpackGroup
        };

        return frogGroup;
    },

    /**
     * 2. 建立小萌蛙 (Baby Frog)
     * @param {number} colorHex - 小青蛙代表色
     * @param {string} name - 小青蛙名字
     */
    createBabyFrog(colorHex = 0xff4444, name = 'BabyRed') {
        const group = new THREE.Group();

        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.3,
            metalness: 0.1
        });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        // 小圓身體
        const bodyGeo = new THREE.SphereGeometry(0.24, 12, 10);
        bodyGeo.scale(1.1, 0.8, 1.1);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.22;
        body.castShadow = true;
        group.add(body);

        // 小肚皮
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bellyMat);
        belly.position.set(0, 0.18, 0.06);
        group.add(belly);

        // 大大雙眼 (超萌)
        const eyeGeo = new THREE.SphereGeometry(0.11, 8, 8);
        const pupilGeo = new THREE.SphereGeometry(0.05, 6, 6);

        const lEye = new THREE.Mesh(eyeGeo, eyeMat);
        lEye.position.set(-0.13, 0.36, 0.14);
        const lPupil = new THREE.Mesh(pupilGeo, pupilMat);
        lPupil.position.set(-0.13, 0.37, 0.22);
        group.add(lEye, lPupil);

        const rEye = new THREE.Mesh(eyeGeo, eyeMat);
        rEye.position.set(0.13, 0.36, 0.14);
        const rPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rPupil.position.set(0.13, 0.37, 0.22);
        group.add(rEye, rPupil);

        // 頭頂發光裝飾 (小星星或花朵)
        const decoGeo = new THREE.SphereGeometry(0.07, 6, 6);
        const decoMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const deco = new THREE.Mesh(decoGeo, decoMat);
        deco.position.set(0, 0.45, 0);
        group.add(deco);

        // 待救援時頭頂的光柱特效
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.2, 4, 8);
        beaconGeo.translate(0, 2, 0);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        group.add(beacon);

        group.userData = {
            name: name,
            colorHex: colorHex,
            beacon: beacon,
            isRescued: false
        };

        return group;
    },

    /**
     * 3. 建立立體車輛 (Cars & Trucks)
     */
    createVehicle(type = 'TAXI') {
        const group = new THREE.Group();

        let bodyColor = 0xffcc00;
        let length = 2.2;
        let width = 1.3;
        let height = 0.9;

        if (type === 'SPORTS_CAR') {
            bodyColor = 0xff2244;
            length = 2.4;
            height = 0.7;
        } else if (type === 'TRUCK') {
            bodyColor = 0x2288ff;
            length = 4.2;
            height = 1.6;
            width = 1.5;
        } else if (type === 'POLICE') {
            bodyColor = 0x111122;
            length = 2.4;
        } else if (type === 'CYBER_CAR') {
            bodyColor = 0x00ffff;
            length = 2.5;
            height = 0.65;
        }

        const bodyMat = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.3,
            metalness: 0.4
        });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x112233,
            roughness: 0.1,
            metalness: 0.8
        });
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8
        });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });

        // 車體底座
        const baseGeo = new THREE.BoxGeometry(width, height * 0.6, length);
        const base = new THREE.Mesh(baseGeo, bodyMat);
        base.position.y = height * 0.45;
        base.castShadow = true;
        group.add(base);

        // 駕駛艙車頂
        if (type !== 'TRUCK') {
            const cabinGeo = new THREE.BoxGeometry(width * 0.85, height * 0.5, length * 0.55);
            const cabin = new THREE.Mesh(cabinGeo, glassMat);
            cabin.position.set(0, height * 0.85, -length * 0.05);
            cabin.castShadow = true;
            group.add(cabin);
        } else {
            // 大卡車車頭與貨櫃
            const cabGeo = new THREE.BoxGeometry(width, height * 0.8, length * 0.3);
            const cab = new THREE.Mesh(cabGeo, bodyMat);
            cab.position.set(0, height * 0.6, length * 0.32);
            cab.castShadow = true;
            const cargoGeo = new THREE.BoxGeometry(width * 1.05, height * 0.95, length * 0.65);
            const cargoMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
            const cargo = new THREE.Mesh(cargoGeo, cargoMat);
            cargo.position.set(0, height * 0.75, -length * 0.15);
            cargo.castShadow = true;
            group.add(cab, cargo);
        }

        // 計程車燈牌
        if (type === 'TAXI') {
            const signGeo = new THREE.BoxGeometry(0.5, 0.18, 0.25);
            const signMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const sign = new THREE.Mesh(signGeo, signMat);
            sign.position.set(0, height * 1.15, 0);
            group.add(sign);
        }

        // 車頭燈光
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), lightMat);
        fl.position.set(-width * 0.35, height * 0.45, length * 0.5);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), lightMat);
        fr.position.set(width * 0.35, height * 0.45, length * 0.5);
        group.add(fl, fr);

        // 四個立體車輪
        const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12);
        wheelGeo.rotateZ(Math.PI / 2);

        const wPositions = [
            [-width * 0.52, 0.24, length * 0.32],
            [width * 0.52, 0.24, length * 0.32],
            [-width * 0.52, 0.24, -length * 0.32],
            [width * 0.52, 0.24, -length * 0.32]
        ];

        wPositions.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.position.set(...pos);
            w.castShadow = true;
            group.add(w);
        });

        group.userData = { width: width, length: length, height: height };
        return group;
    },

    /**
     * 4. 建立浮木 (Log)
     */
    createLog(length = 3.5, radius = 0.55) {
        const group = new THREE.Group();

        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
        });
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xdeb887,
            roughness: 0.6
        });

        // 圓木主體
        const logGeo = new THREE.CylinderGeometry(radius, radius, length, 12);
        logGeo.rotateZ(Math.PI / 2);
        const logMesh = new THREE.Mesh(logGeo, barkMat);
        logMesh.castShadow = true;
        logMesh.receiveShadow = true;
        group.add(logMesh);

        // 兩端年輪截面
        const capGeo = new THREE.CircleGeometry(radius * 0.96, 12);
        const leftCap = new THREE.Mesh(capGeo, coreMat);
        leftCap.position.x = -length * 0.501;
        leftCap.rotation.y = -Math.PI / 2;
        const rightCap = new THREE.Mesh(capGeo, coreMat);
        rightCap.position.x = length * 0.501;
        rightCap.rotation.y = Math.PI / 2;
        group.add(leftCap, rightCap);

        group.userData = { length: length, radius: radius };
        return group;
    },

    /**
     * 5. 建立睡蓮荷葉 (Lily Pad with Flower)
     */
    createLilyPad(radius = 0.8) {
        const group = new THREE.Group();

        const padMat = new THREE.MeshStandardMaterial({
            color: 0x22aa44,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        // 缺角荷葉
        const padGeo = new THREE.CylinderGeometry(radius, radius, 0.08, 16, 1, false, 0, Math.PI * 1.85);
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.receiveShadow = true;
        group.add(pad);

        // 粉紅睡蓮花朵
        const flowerGroup = new THREE.Group();
        const petalMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.3 });
        const petalGeo = new THREE.ConeGeometry(0.12, 0.28, 5);
        for (let i = 0; i < 6; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.rotation.z = Math.PI / 4;
            petal.rotation.y = (i * Math.PI) / 3;
            flowerGroup.add(petal);
        }
        flowerGroup.position.set(radius * 0.35, 0.12, 0);
        group.add(flowerGroup);

        group.userData = { radius: radius };
        return group;
    },

    /**
     * 6. 建立古代滾動巨石 (Rolling Boulder)
     */
    createBoulder(radius = 0.8) {
        const geo = new THREE.DodecahedronGeometry(radius, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.9,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.userData = { radius: radius };
        return mesh;
    },

    /**
     * 7. 建立旋轉金幣 (Gold Coin)
     */
    createCoin() {
        const group = new THREE.Group();
        const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12);
        coinGeo.rotateX(Math.PI / 2);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.castShadow = true;
        group.add(coin);
        group.userData = { isCoin: true, collected: false };
        return group;
    },

    /**
     * 8. 建立飛舞螢火蟲/蝴蝶 (Fly)
     */
    createFly() {
        const group = new THREE.Group();
        // 蟲體
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        // 發光腹部
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x88ff00 })
        );
        glow.position.z = -0.09;
        // 雙翅
        const wingGeo = new THREE.PlaneGeometry(0.18, 0.14);
        const wingMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const lWing = new THREE.Mesh(wingGeo, wingMat);
        lWing.position.set(-0.12, 0.08, 0);
        const rWing = new THREE.Mesh(wingGeo, wingMat);
        rWing.position.set(0.12, 0.08, 0);

        group.add(body, glow, lWing, rWing);
        group.userData = { lWing, rWing, isFly: true };
        return group;
    },

    /**
     * 9. 建立終點傳送荷花陣 (Level Goal Portal)
     */
    createGoalPortal() {
        const group = new THREE.Group();

        // 浮空能量光圈
        const ringGeo = new THREE.TorusGeometry(1.2, 0.12, 8, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        // 金色荷花座
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            roughness: 0.3,
            metalness: 0.6
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.25, 8), baseMat);
        base.position.y = 0.12;
        base.receiveShadow = true;
        group.add(base);

        // 向上發射的光柱 (過關時亮起)
        const beamGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
        beamGeo.translate(0, 4, 0);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.visible = false;
        group.add(beam);

        group.userData = { ring, beam };
        return group;
    }
};

window.Models3D = Models3D;
