/**
 * Frogger 3D Odyssey - 程序化 3D 幾何模型庫 (Models3D)
 * 專為《青蛙過街2》(Frogger 2) 風格打造
 * 包含主角大青蛙、5 隻走失小萌蛙（帶蓮花底座）、立體車流、浮木荷葉、金幣與特效
 */

const Models3D = {
    // 1. 建立主角大青蛙 (Frogger)
    createFrogger() {
        const frogGroup = new THREE.Group();

        const skinMat = new THREE.MeshStandardMaterial({
            color: 0x24d036,
            roughness: 0.35,
            metalness: 0.1
        });
        const bellyMat = new THREE.MeshStandardMaterial({
            color: 0xfff0a0,
            roughness: 0.4
        });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const tongueMat = new THREE.MeshStandardMaterial({
            color: 0xff3377,
            roughness: 0.2
        });

        // 軀幹主體
        const bodyGeo = new THREE.SphereGeometry(0.55, 16, 14);
        bodyGeo.scale(1.1, 0.75, 1.2);
        const body = new THREE.Mesh(bodyGeo, skinMat);
        body.position.y = 0.45;
        body.castShadow = true;
        body.receiveShadow = true;
        frogGroup.add(body);

        // 奶油黃肚皮
        const bellyGeo = new THREE.SphereGeometry(0.48, 14, 10);
        bellyGeo.scale(0.95, 0.6, 1.05);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.36, 0.1);
        frogGroup.add(belly);

        // 雙眼 (凸起大眼)
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
        leftPupil.position.set(-0.32, 0.8, 0.46);
        frogGroup.add(leftSocket, leftBall, leftPupil);

        // 右眼
        const rightSocket = new THREE.Mesh(eyeSocketGeo, skinMat);
        rightSocket.position.set(0.32, 0.75, 0.28);
        rightSocket.castShadow = true;
        const rightBall = new THREE.Mesh(eyeBallGeo, eyeMat);
        rightBall.position.set(0.32, 0.78, 0.32);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.32, 0.8, 0.46);
        frogGroup.add(rightSocket, rightBall, rightPupil);

        // 前後四肢
        const footGeo = new THREE.BoxGeometry(0.24, 0.08, 0.28);
        const limbMat = skinMat;

        // 前足
        const flFoot = new THREE.Mesh(footGeo, limbMat);
        flFoot.position.set(-0.52, 0.1, 0.35);
        const frFoot = new THREE.Mesh(footGeo, limbMat);
        frFoot.position.set(0.52, 0.1, 0.35);
        frogGroup.add(flFoot, frFoot);

        // 後足
        const blFoot = new THREE.Mesh(footGeo, limbMat);
        blFoot.position.set(-0.58, 0.1, -0.3);
        const brFoot = new THREE.Mesh(footGeo, limbMat);
        brFoot.position.set(0.58, 0.1, -0.3);
        frogGroup.add(blFoot, brFoot);

        // 可伸長長舌 (原點在喉部)
        const tongueGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        tongueGeo.rotateX(Math.PI / 2);
        tongueGeo.translate(0, 0, 0.5);
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0, 0.42, 0.55);
        tongue.scale.set(1, 1, 0.001);

        const tipGeo = new THREE.SphereGeometry(0.13, 8, 8);
        const tongueTip = new THREE.Mesh(tipGeo, tongueMat);
        tongueTip.position.set(0, 0, 1);
        tongue.add(tongueTip);
        frogGroup.add(tongue);

        // 背部小青蛙容器
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
     * 2. 建立小萌蛙 (Baby Frog) - 帶安全浮水蓮台
     */
    createBabyFrog(colorHex = 0xff3344, name = 'BabyRed') {
        const group = new THREE.Group();

        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.3,
            metalness: 0.1
        });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        // 安全蓮花底座 (確保在水面也不會掉下去)
        const padGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.12, 12);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.y = -0.06;
        pad.receiveShadow = true;
        group.add(pad);

        // 幼蛙圓滾小身軀
        const bodyGeo = new THREE.SphereGeometry(0.25, 12, 10);
        bodyGeo.scale(1.1, 0.85, 1.1);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.22;
        body.castShadow = true;
        group.add(body);

        // 肚皮
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bellyMat);
        belly.position.set(0, 0.18, 0.08);
        group.add(belly);

        // 萌萌大眼
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

        // 頭頂光柱 (指示方位)
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.2, 5, 8);
        beaconGeo.translate(0, 2.5, 0);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        group.add(beacon);

        group.userData = {
            name: name,
            colorHex: colorHex,
            beacon: beacon,
            pad: pad,
            isRescued: false
        };

        return group;
    },

    /**
     * 3. 建立車輛
     */
    createVehicle(type = 'TAXI') {
        const group = new THREE.Group();

        let bodyColor = 0xffcc00;
        let length = 2.4;
        let width = 1.3;
        let height = 0.9;

        if (type === 'SPORTS_CAR') {
            bodyColor = 0xff2244;
            length = 2.5;
            height = 0.7;
        } else if (type === 'TRUCK') {
            bodyColor = 0x2288ff;
            length = 4.2;
            height = 1.6;
            width = 1.5;
        }

        const bodyMat = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.3,
            metalness: 0.3
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

        // 車底座
        const baseGeo = new THREE.BoxGeometry(width, height * 0.6, length);
        const base = new THREE.Mesh(baseGeo, bodyMat);
        base.position.y = height * 0.45;
        base.castShadow = true;
        group.add(base);

        if (type !== 'TRUCK') {
            const cabinGeo = new THREE.BoxGeometry(width * 0.85, height * 0.5, length * 0.55);
            const cabin = new THREE.Mesh(cabinGeo, glassMat);
            cabin.position.set(0, height * 0.85, -length * 0.05);
            cabin.castShadow = true;
            group.add(cabin);
        } else {
            // 大卡車駕駛艙與貨櫃
            const cabGeo = new THREE.BoxGeometry(width, height * 0.8, length * 0.3);
            const cab = new THREE.Mesh(cabGeo, bodyMat);
            cab.position.set(0, height * 0.6, length * 0.32);
            cab.castShadow = true;
            const cargoGeo = new THREE.BoxGeometry(width * 1.05, height * 0.95, length * 0.65);
            const cargoMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
            const cargo = new THREE.Mesh(cargoGeo, cargoMat);
            cargo.position.set(0, height * 0.75, -length * 0.15);
            cargo.castShadow = true;
            group.add(cab, cargo);
        }

        // 四個車輪
        const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 10);
        wheelGeo.rotateZ(Math.PI / 2);
        const wPositions = [
            [-width * 0.52, 0.24, length * 0.3],
            [width * 0.52, 0.24, length * 0.3],
            [-width * 0.52, 0.24, -length * 0.3],
            [width * 0.52, 0.24, -length * 0.3]
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
    createLog(length = 3.8, radius = 0.6) {
        const group = new THREE.Group();

        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
        });
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xdeb887,
            roughness: 0.6
        });

        const logGeo = new THREE.CylinderGeometry(radius, radius, length, 12);
        logGeo.rotateZ(Math.PI / 2);
        const logMesh = new THREE.Mesh(logGeo, barkMat);
        logMesh.castShadow = true;
        logMesh.receiveShadow = true;
        group.add(logMesh);

        // 兩端年輪
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
     * 5. 建立睡蓮荷葉 (Lily Pad)
     */
    createLilyPad(radius = 1.0) {
        const group = new THREE.Group();

        const padMat = new THREE.MeshStandardMaterial({
            color: 0x22aa44,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        const padGeo = new THREE.CylinderGeometry(radius, radius, 0.1, 16);
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.receiveShadow = true;
        group.add(pad);

        // 睡蓮小花
        const flowerGroup = new THREE.Group();
        const petalMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.3 });
        const petalGeo = new THREE.ConeGeometry(0.12, 0.28, 5);
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.rotation.z = Math.PI / 4;
            petal.rotation.y = (i * Math.PI * 2) / 5;
            flowerGroup.add(petal);
        }
        flowerGroup.position.set(radius * 0.35, 0.14, 0);
        group.add(flowerGroup);

        group.userData = { radius: radius };
        return group;
    },

    /**
     * 6. 建立金幣 (Gold Coin)
     */
    createCoin() {
        const group = new THREE.Group();
        const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12);
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
     * 7. 建立飛舞螢火蟲 (Fly)
     */
    createFly() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x88ff00 })
        );
        glow.position.z = -0.09;

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
     * 8. 建立終點傳送荷花陣 (Level Goal Portal)
     */
    createGoalPortal() {
        const group = new THREE.Group();

        const ringGeo = new THREE.TorusGeometry(1.4, 0.14, 8, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            roughness: 0.3,
            metalness: 0.6
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.25, 8), baseMat);
        base.position.y = 0.12;
        base.receiveShadow = true;
        group.add(base);

        const beamGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 16);
        beamGeo.translate(0, 5, 0);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.45,
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
