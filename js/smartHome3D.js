/**
 * Cyber Defense: Proteja sua Smart Home
 * Motor 3D WebGL da Casa Inteligente (Three.js)
 * Ambiente 3D Completo, Agente Controlável, Iluminação Dinâmica e Dispositivos Interativos
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class SmartHome3DEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Grupos e Objetos 3D
        this.houseGroup = new THREE.Group();
        this.devicesGroup = new THREE.Group();
        this.deviceMeshes = {}; // deviceId -> Mesh
        this.agentMesh = null;
        this.domeMesh = null;
        this.particlesGroup = null;
        this.scanWaveMesh = null;

        // Estado do Agente 3D
        this.agentPos = new THREE.Vector3(0, 0.8, 0);
        this.agentTarget = new THREE.Vector3(0, 0.8, 0);
        this.agentSpeed = 0.16;
        this.agentAngle = 0;
        this.isMoving = false;
        this.walkCycle = 0;
        this.cameraMode = 'orbit'; // 'orbit', 'follow', 'top'

        // Teclas
        this.keys = { up: false, down: false, left: false, right: false };
        this.nearbyDevice = null;
        this.hoveredDevice = null;

        // Paleta de Iluminação Atual
        this.currentPalette = 'cyber'; // 'cyber', 'matrix', 'stealth'

        this.init();
    }

    init() {
        const w = this.container.clientWidth || 900;
        const h = this.container.clientHeight || 560;

        // 1. Cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050a14);
        this.scene.fog = new THREE.FogExp2(0x050a14, 0.022);

        // 2. Câmera
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        this.camera.position.set(0, 16, 22);

        // 3. Renderizador WebGL
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Remove SVG/canvas antigo se houver e anexa o novo canvas WebGL
        const oldCanvas = this.container.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
        const oldSvg = this.container.querySelector('svg');
        if (oldSvg) oldSvg.style.display = 'none';

        this.renderer.domElement.id = "webgl-smart-home-canvas";
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = "0";
        this.renderer.domElement.style.left = "0";
        this.container.appendChild(this.renderer.domElement);

        // 4. Orbit Controls
        if (window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.08;
            this.controls.maxPolarAngle = Math.PI / 2.1; // Não passa para baixo do chão
            this.controls.minDistance = 6;
            this.controls.maxDistance = 38;
            this.controls.target.set(0, 1, 0);
        }

        // 5. Iluminação Geral
        this.setupLights();

        // 6. Construção da Casa 3D (Cômodos, Paredes de Vidro, Chão Neon)
        this.buildSmartHome();

        // 7. Dispositivos Inteligentes em 3D
        this.buildDevices();

        // 8. Cúpula Holográfica 3D
        this.buildHolographicDome();

        // 9. Agente / Boneco Cyber 3D
        this.buildCyberAgent();

        // 10. Onda de Varredura
        this.buildScanWave();

        // 11. Eventos de Interação (Teclado, Mouse, Resize)
        this.setupEvents();

        // 12. Render Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupLights() {
        // Luz Ambiente suave azul-escura
        this.ambientLight = new THREE.AmbientLight(0x0e1f3d, 1.2);
        this.scene.add(this.ambientLight);

        // Luz Direcional Principal com Sombras
        this.dirLight = new THREE.DirectionalLight(0x00e5ff, 1.5);
        this.dirLight.position.set(12, 20, 10);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 40;
        this.dirLight.shadow.camera.left = -15;
        this.dirLight.shadow.camera.right = 15;
        this.dirLight.shadow.camera.top = 15;
        this.dirLight.shadow.camera.bottom = -15;
        this.scene.add(this.dirLight);

        // Luzes PointLight Temáticas por Cômodo
        // 1. Sala (Ciano)
        this.livingLight = new THREE.PointLight(0x00e5ff, 2.5, 14);
        this.livingLight.position.set(-4, 3.5, -4);
        this.scene.add(this.livingLight);

        // 2. Quarto (Púrpura / Magenta)
        this.bedroomLight = new THREE.PointLight(0xb388ff, 2.8, 14);
        this.bedroomLight.position.set(5, 3.5, -4);
        this.scene.add(this.bedroomLight);

        // 3. Cozinha (Âmbar / Laranja)
        this.kitchenLight = new THREE.PointLight(0xff9100, 2.2, 14);
        this.kitchenLight.position.set(5, 3.5, 5);
        this.scene.add(this.kitchenLight);

        // 4. Entrada (Verde Esmeralda)
        this.entranceLight = new THREE.PointLight(0x00e676, 2.5, 14);
        this.entranceLight.position.set(-5, 3.5, 5);
        this.scene.add(this.entranceLight);
    }

    buildSmartHome() {
        this.scene.add(this.houseGroup);

        // Grade Cibernética Neon do Chão
        const gridHelper = new THREE.GridHelper(36, 36, 0x00e5ff, 0x081933);
        gridHelper.position.y = -0.05;
        this.scene.add(gridHelper);

        // Plataforma Principal da Casa (Lajes dos Cômodos)
        const roomDefs = [
            { name: "living", x: -4.8, z: -4.8, w: 9, d: 9, color: 0x07152d, neon: 0x00e5ff, label: "SALA DE ESTAR" },
            { name: "bedroom", x: 4.8, z: -4.8, w: 9, d: 9, color: 0x140d2b, neon: 0xb388ff, label: "QUARTO PRINCIPAL" },
            { name: "kitchen", x: 4.8, z: 4.8, w: 9, d: 9, color: 0x1d140a, neon: 0xff9100, label: "COZINHA CONECTADA" },
            { name: "entrance", x: -4.8, z: 4.8, w: 9, d: 9, color: 0x071e16, neon: 0x00e676, label: "ENTRADA / FACHADA" }
        ];

        roomDefs.forEach(r => {
            // Piso do Cômodo
            const floorGeo = new THREE.BoxGeometry(r.w, 0.2, r.d);
            const floorMat = new THREE.MeshStandardMaterial({
                color: r.color,
                roughness: 0.25,
                metalness: 0.8
            });
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.position.set(r.x, 0, r.z);
            floorMesh.receiveShadow = true;
            this.houseGroup.add(floorMesh);

            // Borda Neon do Cômodo
            const edgeGeo = new THREE.EdgesGeometry(floorGeo);
            const edgeMat = new THREE.LineBasicMaterial({ color: r.neon, linewidth: 2 });
            const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
            edgeLine.position.copy(floorMesh.position);
            this.houseGroup.add(edgeLine);

            // Paredes Baixas de Vidro Cibernético (Glassmorphism 3D)
            this.buildGlassWalls(r);
        });

        // Mobílias Estilizadas Low-Poly Futuristas
        this.buildSciFiFurniture();
    }

    buildGlassWalls(r) {
        const wallMat = new THREE.MeshPhysicalMaterial({
            color: 0x071830,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.75, // Vidro translúcido
            transparent: true,
            opacity: 0.45,
            reflectivity: 0.6
        });

        const halfW = r.w / 2;
        const halfD = r.d / 2;
        const wallH = 1.4;

        // Paredes externas norte/sul/leste/oeste
        const walls = [
            { w: r.w, d: 0.15, px: r.x, pz: r.z - halfD },
            { w: r.w, d: 0.15, px: r.x, pz: r.z + halfD },
            { w: 0.15, d: r.d, px: r.x - halfW, pz: r.z },
            { w: 0.15, d: r.d, px: r.x + halfW, pz: r.z }
        ];

        walls.forEach(w => {
            const wGeo = new THREE.BoxGeometry(w.w, wallH, w.d);
            const wMesh = new THREE.Mesh(wGeo, wallMat);
            wMesh.position.set(w.px, wallH / 2 + 0.1, w.pz);
            wMesh.castShadow = true;
            this.houseGroup.add(wMesh);

            // Linha Neon no topo da parede
            const topGeo = new THREE.BoxGeometry(w.w, 0.05, w.d);
            const topMat = new THREE.MeshBasicMaterial({ color: r.neon });
            const topMesh = new THREE.Mesh(topGeo, topMat);
            topMesh.position.set(w.px, wallH + 0.1, w.pz);
            this.houseGroup.add(topMesh);
        });
    }

    buildSciFiFurniture() {
        // Sofá Sci-Fi na Sala
        const sofaGeo = new THREE.BoxGeometry(3, 0.6, 1.2);
        const sofaMat = new THREE.MeshStandardMaterial({ color: 0x0f294a, roughness: 0.4 });
        const sofa = new THREE.Mesh(sofaGeo, sofaMat);
        sofa.position.set(-4.8, 0.4, -6.5);
        sofa.castShadow = true;
        this.houseGroup.add(sofa);

        // Rack & Tela Holográfica da Sala
        const screenGeo = new THREE.BoxGeometry(2.4, 1.4, 0.08);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(-4.8, 1.5, -3.2);
        this.houseGroup.add(screen);

        // Cama Cibernética no Quarto
        const bedGeo = new THREE.BoxGeometry(2.4, 0.6, 3.2);
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x221245, roughness: 0.5 });
        const bed = new THREE.Mesh(bedGeo, bedMat);
        bed.position.set(5.5, 0.4, -5.5);
        bed.castShadow = true;
        this.houseGroup.add(bed);

        // Bancada da Cozinha
        const counterGeo = new THREE.BoxGeometry(3.2, 0.9, 1.2);
        const counterMat = new THREE.MeshStandardMaterial({ color: 0x2e1e0a, roughness: 0.3 });
        const counter = new THREE.Mesh(counterGeo, counterMat);
        counter.position.set(4.8, 0.55, 4.8);
        counter.castShadow = true;
        this.houseGroup.add(counter);

        // Tapete Neon da Entrada
        const rugGeo = new THREE.PlaneGeometry(2.2, 3);
        const rugMat = new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.25 });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(-4.8, 0.11, 4.8);
        this.houseGroup.add(rug);
    }

    buildDevices() {
        this.scene.add(this.devicesGroup);

        const devPositions = {
            router: { x: -2.8, y: 1.1, z: -3.5, color: 0x00e5ff, type: "router" },
            camera: { x: -7.5, y: 2.2, z: -3.0, color: 0xff3b5c, type: "camera" },
            smartlock: { x: -8.8, y: 1.2, z: 4.8, color: 0xff3b5c, type: "lock" },
            thermostat: { x: 8.8, y: 1.4, z: -3.2, color: 0xff3b5c, type: "thermostat" },
            speaker: { x: 5.5, y: 1.1, z: 4.8, color: 0xff3b5c, type: "speaker" },
            doorsensor: { x: -3.2, y: 1.1, z: 8.8, color: 0xff3b5c, type: "sensor" },
            smartbulb: { x: 4.8, y: 2.6, z: -6.5, color: 0xff3b5c, type: "bulb" }
        };

        let devicesData = window.gameState ? window.gameState.getCurrentDevices() : [];
        if (!devicesData || devicesData.length === 0) {
            devicesData = (window.GAME_DATA && window.GAME_DATA.devicesByLevel) ? window.GAME_DATA.devicesByLevel[1] : [];
        }

        devicesData.forEach(dev => {
            const p = devPositions[dev.id] || { x: 0, y: 1, z: 0, color: 0x00e5ff, type: "generic" };
            const isFixed = window.gameState ? window.gameState.isDeviceFixed(dev.id) : false;
            const nodeMesh = this.createDeviceMesh(dev, p, isFixed);
            this.devicesGroup.add(nodeMesh);
            this.deviceMeshes[dev.id] = nodeMesh;
        });
    }

    refreshDevices() {
        if (!this.devicesGroup) return;
        while (this.devicesGroup.children.length > 0) {
            this.devicesGroup.remove(this.devicesGroup.children[0]);
        }
        this.deviceMeshes = {};
        this.buildDevices();
        const sec = window.gameState ? window.gameState.securityPct : 20;
        this.updateSecurityDome(sec);
    }

    createDeviceMesh(dev, p, isFixed) {
        const group = new THREE.Group();
        group.position.set(p.x, p.y, p.z);
        group.userData = { deviceId: dev.id, name: dev.name };

        const color = isFixed ? 0x00e676 : 0xff3b5c;

        // Base Tecnológica do Dispositivo
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.3, 16);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x081426,
            metalness: 0.9,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        group.add(base);

        // Núcleo Emissivo / LED de Status
        const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: color });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0.35;
        group.add(core);

        // Anel de Alerta Pulsante
        const ringGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: color });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.15;
        group.add(ring);

        // Luz Local do Dispositivo
        const light = new THREE.PointLight(color, 2, 4.5);
        light.position.y = 0.5;
        group.add(light);

        // Balão Flutuante de Texto / Badge em Sprite 3D
        const sprite = this.createDeviceSprite(dev.name, isFixed);
        sprite.position.y = 1.3;
        group.add(sprite);

        // Guarda referências para animação
        group.userData.core = core;
        group.userData.ring = ring;
        group.userData.light = light;
        group.userData.sprite = sprite;

        return group;
    }

    createDeviceSprite(text, isFixed) {
        const canvas = document.createElement('canvas');
        canvas.width = 380;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(7, 13, 25, 0.9)';
        ctx.strokeStyle = isFixed ? '#00e676' : '#ff3b5c';
        ctx.lineWidth = 4;

        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(10, 10, 360, 70, 12);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(10, 10, 360, 70);
            ctx.strokeRect(10, 10, 360, 70);
        }

        // Texto do Dispositivo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 190, 42);

        // Status
        ctx.fillStyle = isFixed ? '#00e676' : '#ff3b5c';
        ctx.font = 'bold 15px Rajdhani, sans-serif';
        ctx.fillText(isFixed ? 'STATUS: BLINDADO (SEGURO)' : 'STATUS: VULNERÁVEL [CLIQUE OU E]', 190, 66);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(3.4, 0.85, 1);
        return sprite;
    }

    buildHolographicDome() {
        const sec = window.gameState ? window.gameState.securityPct : 20;
        const color = sec < 40 ? 0xff3b5c : (sec < 80 ? 0x00e5ff : 0x00e676);

        // Cúpula Semiesférica em Wireframe
        const domeGeo = new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.18
        });
        this.domeMesh = new THREE.Mesh(domeGeo, domeMat);
        this.domeMesh.position.y = 0;
        this.scene.add(this.domeMesh);

        // Nuvem de Partículas 3D Orbitando a Cúpula
        const particleCount = 200;
        const partGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0) / 2; // Semiesfera
            const r = 14.8 + Math.random() * 0.5;

            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.cos(phi);
            positions[i + 2] = r * Math.sin(phi) * Math.sin(theta);
        }

        partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const partMat = new THREE.PointsMaterial({
            color: color,
            size: 0.35,
            transparent: true,
            opacity: 0.75
        });
        this.particlesGroup = new THREE.Points(partGeo, partMat);
        this.scene.add(this.particlesGroup);
    }

    buildCyberAgent() {
        this.agentMesh = new THREE.Group();
        this.agentMesh.position.copy(this.agentPos);

        // 1. Sombra no chão
        const shadowGeo = new THREE.CircleGeometry(0.55, 16);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.75;
        this.agentMesh.add(shadow);

        // 2. Pernas
        const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x071325, roughness: 0.5 });
        this.leftLeg = new THREE.Mesh(legGeo, legMat);
        this.leftLeg.position.set(-0.2, -0.4, 0);
        this.agentMesh.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, legMat);
        this.rightLeg.position.set(0.2, -0.4, 0);
        this.agentMesh.add(this.rightLeg);

        // 3. Tronco com Colete Tático
        const bodyGeo = new THREE.BoxGeometry(0.65, 0.75, 0.35);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0c2040, metalness: 0.8, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.2;
        body.castShadow = true;
        this.agentMesh.add(body);

        // LED no peito do agente
        const ledGeo = new THREE.BoxGeometry(0.25, 0.25, 0.08);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.25, 0.18);
        this.agentMesh.add(led);

        // 4. Cabeça e Capacete com Visor Neon
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x071325, metalness: 0.9, roughness: 0.1 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.8;
        head.castShadow = true;
        this.agentMesh.add(head);

        // Visor Ciano
        const visorGeo = new THREE.BoxGeometry(0.38, 0.16, 0.16);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.82, 0.24);
        this.agentMesh.add(visor);

        // 5. Lanterna SpotLight 3D com Projeção Real
        this.agentLight = new THREE.SpotLight(0x00e5ff, 4, 12, Math.PI / 4, 0.4, 1);
        this.agentLight.position.set(0, 0.5, 0.2);
        this.agentLightTarget = new THREE.Object3D();
        this.agentLightTarget.position.set(0, 0, 4);
        this.agentMesh.add(this.agentLightTarget);
        this.agentLight.target = this.agentLightTarget;
        this.agentMesh.add(this.agentLight);

        // 6. Halo Holográfico aos Pés
        const haloGeo = new THREE.RingGeometry(0.7, 0.8, 24);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = -0.73;
        this.agentMesh.add(halo);

        this.scene.add(this.agentMesh);
    }

    buildScanWave() {
        const waveGeo = new THREE.RingGeometry(0.1, 0.8, 32);
        const waveMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        this.scanWaveMesh = new THREE.Mesh(waveGeo, waveMat);
        this.scanWaveMesh.rotation.x = -Math.PI / 2;
        this.scanWaveMesh.position.y = 0.15;
        this.scene.add(this.scanWaveMesh);
        this.isScanning = false;
        this.scanRadius = 0;
    }

    triggerScanWave() {
        this.isScanning = true;
        this.scanRadius = 0.5;
        window.cyberAudio.playShield();
    }

    onResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w > 0 && h > 0) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }
    }

    setupEvents() {
        // Redimensionamento
        window.addEventListener('resize', () => this.onResize());

        // Controles de Teclado WASD
        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(k)) this.keys.up = true;
            if (['s', 'arrowdown'].includes(k)) this.keys.down = true;
            if (['a', 'arrowleft'].includes(k)) this.keys.left = true;
            if (['d', 'arrowright'].includes(k)) this.keys.right = true;

            if (['e', ' ', 'enter'].includes(k) && this.nearbyDevice) {
                e.preventDefault();
                this.openDeviceInspector(this.nearbyDevice.id);
            }
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(k)) this.keys.up = false;
            if (['s', 'arrowdown'].includes(k)) this.keys.down = false;
            if (['a', 'arrowleft'].includes(k)) this.keys.left = false;
            if (['d', 'arrowright'].includes(k)) this.keys.right = false;
        });

        // Controles D-pad na tela (Mobile e Mouse)
        const bindDpad = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const start = (e) => { e.preventDefault(); this.keys[key] = true; };
            const stop = (e) => { e.preventDefault(); this.keys[key] = false; };
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', stop);
            btn.addEventListener('mouseleave', stop);
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', stop, { passive: false });
        };
        bindDpad('btn-dpad-up', 'up');
        bindDpad('btn-dpad-down', 'down');
        bindDpad('btn-dpad-left', 'left');
        bindDpad('btn-dpad-right', 'right');

        const btnDpadInteract = document.getElementById('btn-dpad-interact');
        if (btnDpadInteract) {
            btnDpadInteract.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.nearbyDevice) {
                    this.openDeviceInspector(this.nearbyDevice.id);
                } else {
                    const pending = window.gameState ? window.gameState.getCurrentDevices().find(d => !window.gameState.isDeviceFixed(d.id)) : null;
                    if (pending) this.openDeviceInspector(pending.id);
                }
            });
        }

        // Clique no Banner Flutuante de Interação [E]
        const promptEl = document.getElementById('agent-interaction-prompt-3d');
        if (promptEl) {
            promptEl.addEventListener('click', () => {
                if (this.nearbyDevice) {
                    this.openDeviceInspector(this.nearbyDevice.id);
                }
            });
        }

        // Clique no Mundo 3D (Raycasting para andar ou selecionar dispositivo)
        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            // 1. Testa clique em Dispositivos 3D
            const deviceHits = this.raycaster.intersectObjects(this.devicesGroup.children, true);
            if (deviceHits.length > 0) {
                let hitNode = deviceHits[0].object;
                while (hitNode && !hitNode.userData.deviceId && hitNode.parent) {
                    hitNode = hitNode.parent;
                }
                if (hitNode && hitNode.userData.deviceId) {
                    window.cyberAudio.playClick();
                    this.openDeviceInspector(hitNode.userData.deviceId);
                    return;
                }
            }

            // 2. Se clicou no chão, o agente anda até as coordenadas do clique
            const floorHits = this.raycaster.intersectObjects(this.houseGroup.children, true);
            if (floorHits.length > 0) {
                const pt = floorHits[0].point;
                this.agentTarget.set(
                    Math.max(-8.5, Math.min(8.5, pt.x)),
                    0.8,
                    Math.max(-8.5, Math.min(8.5, pt.z))
                );
                this.isMoving = true;
            }
        });
    }

    openDeviceInspector(deviceId) {
        window.cyberAudio.playClick();
        if (window.modalInspector) {
            window.modalInspector.open(deviceId);
        }
    }

    setFilter(room) {
        this.currentFilter = room;
        if (!this.controls || !this.camera) return;

        const targets = {
            'all': { x: 0, y: 1, z: 0, camX: 0, camY: 16, camZ: 22 },
            'living': { x: -4.8, y: 1, z: -4.8, camX: -4.8, camY: 10, camZ: 8 },
            'bedroom': { x: 4.8, y: 1, z: -4.8, camX: 4.8, camY: 10, camZ: 8 },
            'kitchen': { x: 4.8, y: 1, z: 4.8, camX: 4.8, camY: 10, camZ: 17 },
            'entrance': { x: -4.8, y: 1, z: 4.8, camX: -4.8, camY: 10, camZ: 17 }
        };

        const target = targets[room] || targets['all'];
        this.controls.target.set(target.x, target.y, target.z);
        this.camera.position.set(target.camX, target.camY, target.camZ);
        this.controls.update();
    }

    cycleCameraMode() {
        const modes = ['orbit', 'follow', 'top'];
        const idx = modes.indexOf(this.cameraMode);
        const next = modes[(idx + 1) % modes.length];
        this.setCameraMode(next);
        return next;
    }

    setCameraMode(mode) {
        this.cameraMode = mode;
        if (!this.controls) return;

        if (mode === 'top') {
            // Visão de Cima (Planta Baixa)
            this.camera.position.set(0, 26, 0.1);
            this.controls.target.set(0, 0, 0);
        } else if (mode === 'follow') {
            // Seguir o Boneco / Agente
            this.controls.target.copy(this.agentPos);
            this.camera.position.set(this.agentPos.x, this.agentPos.y + 7, this.agentPos.z + 10);
        } else {
            // Visão Isométrica 3D Livre (Órbita)
            this.camera.position.set(0, 16, 22);
            this.controls.target.set(0, 1, 0);
        }
        this.controls.update();
    }

    togglePalette() {
        if (this.currentPalette === 'cyber') {
            this.currentPalette = 'matrix';
            if (this.livingLight) this.livingLight.color.setHex(0x00ff66);
            if (this.bedroomLight) this.bedroomLight.color.setHex(0x00e5ff);
            if (this.scene) this.scene.background.setHex(0x020f06);
            if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0x020f06);
        } else if (this.currentPalette === 'matrix') {
            this.currentPalette = 'stealth';
            if (this.livingLight) this.livingLight.color.setHex(0xff3b5c);
            if (this.bedroomLight) this.bedroomLight.color.setHex(0xff9100);
            if (this.scene) this.scene.background.setHex(0x0d0306);
            if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0x0d0306);
        } else {
            this.currentPalette = 'cyber';
            if (this.livingLight) this.livingLight.color.setHex(0x00e5ff);
            if (this.bedroomLight) this.bedroomLight.color.setHex(0xb388ff);
            if (this.scene) this.scene.background.setHex(0x050a14);
            if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0x050a14);
        }
        return this.currentPalette;
    }

    updateAgent() {
        if (!this.agentMesh) return;

        let mx = 0;
        let mz = 0;

        if (this.keys.up) mz -= this.agentSpeed;
        if (this.keys.down) mz += this.agentSpeed;
        if (this.keys.left) mx -= this.agentSpeed;
        if (this.keys.right) mx += this.agentSpeed;

        if (mx !== 0 || mz !== 0) {
            this.isMoving = false;
            this.agentPos.x += mx;
            this.agentPos.z += mz;
            this.agentAngle = Math.atan2(mx, mz);
            this.walkCycle += 0.22;
        } else if (this.isMoving) {
            const dist = this.agentPos.distanceTo(this.agentTarget);
            if (dist > 0.2) {
                const dir = new THREE.Vector3().subVectors(this.agentTarget, this.agentPos).normalize();
                this.agentAngle = Math.atan2(dir.x, dir.z);
                this.agentPos.addScaledVector(dir, this.agentSpeed);
                this.walkCycle += 0.22;
            } else {
                this.isMoving = false;
            }
        } else {
            this.walkCycle = 0;
        }

        // Limites físicos da residência
        this.agentPos.x = Math.max(-8.5, Math.min(8.5, this.agentPos.x));
        this.agentPos.z = Math.max(-8.5, Math.min(8.5, this.agentPos.z));

        // Aplica posição e rotação
        this.agentMesh.position.copy(this.agentPos);
        this.agentMesh.rotation.y = this.agentAngle;

        // Animação de caminhada das pernas
        if (this.leftLeg && this.rightLeg) {
            const swing = Math.sin(this.walkCycle) * 0.45;
            this.leftLeg.rotation.x = swing;
            this.rightLeg.rotation.x = -swing;
        }

        // Modo de câmera seguir o jogador
        if (this.cameraMode === 'follow' && this.controls) {
            this.controls.target.lerp(this.agentPos, 0.08);
            this.camera.position.set(this.agentPos.x, this.agentPos.y + 8, this.agentPos.z + 11);
        }

        // Checagem de Proximidade com Dispositivos
        this.checkDeviceProximity();
    }

    checkDeviceProximity() {
        let nearest = null;
        let minD = 3.2;

        Object.keys(this.deviceMeshes).forEach(devId => {
            const mesh = this.deviceMeshes[devId];
            const d = this.agentPos.distanceTo(mesh.position);
            if (d < minD) {
                minD = d;
                nearest = { id: devId, mesh: mesh };
            }
        });

        this.nearbyDevice = nearest;

        // Atualiza aviso visual sobre o agente
        const promptHUD = document.getElementById('agent-interaction-prompt-3d');
        if (promptHUD) {
            if (nearest) {
                promptHUD.style.display = 'block';
                const devData = window.gameState ? window.gameState.getDevice(nearest.id) : null;
                const name = devData ? devData.name : nearest.id;
                promptHUD.innerHTML = `<strong>[E]</strong> INSPECIONAR <span>${name.toUpperCase()}</span>`;
            } else {
                promptHUD.style.display = 'none';
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate);

        const time = performance.now() * 0.001;

        // 1. Atualiza Agente 3D
        this.updateAgent();

        // 2. Animação da Cúpula Holográfica e Partículas
        if (this.domeMesh) {
            this.domeMesh.rotation.y = time * 0.05;
        }
        if (this.particlesGroup) {
            this.particlesGroup.rotation.y = -time * 0.08;
        }

        // 3. Animação dos Dispositivos (Pulso de anéis e flutuação suave)
        Object.values(this.deviceMeshes).forEach(mesh => {
            if (mesh.userData.ring) {
                const scale = 1 + Math.sin(time * 3 + mesh.position.x) * 0.15;
                mesh.userData.ring.scale.set(scale, scale, scale);
            }
            if (mesh.userData.sprite) {
                mesh.userData.sprite.position.y = 1.3 + Math.sin(time * 2 + mesh.position.z) * 0.06;
            }
        });

        // 4. Animação da Onda de Varredura EMP
        if (this.isScanning && this.scanWaveMesh) {
            this.scanRadius += 0.22;
            const maxR = 16;
            this.scanWaveMesh.scale.set(this.scanRadius, this.scanRadius, 1);
            this.scanWaveMesh.material.opacity = Math.max(0, 1 - (this.scanRadius / maxR));

            if (this.scanRadius >= maxR) {
                this.isScanning = false;
                this.scanWaveMesh.material.opacity = 0;
            }
        }

        // 5. Atualiza OrbitControls
        if (this.controls) {
            this.controls.update();
        }

        // 6. Renderiza
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateSecurityDome(sec) {
        const color = sec < 40 ? 0xff3b5c : (sec < 80 ? 0x00e5ff : 0x00e676);
        if (this.domeMesh) this.domeMesh.material.color.setHex(color);
        if (this.particlesGroup) this.particlesGroup.material.color.setHex(color);

        // Atualiza dispositivos se foram blindados
        Object.keys(this.deviceMeshes).forEach(devId => {
            const isFixed = window.gameState ? window.gameState.isDeviceFixed(devId) : false;
            const nodeMesh = this.deviceMeshes[devId];
            if (nodeMesh) {
                const col = isFixed ? 0x00e676 : 0xff3b5c;
                if (nodeMesh.userData.core) nodeMesh.userData.core.material.color.setHex(col);
                if (nodeMesh.userData.ring) nodeMesh.userData.ring.material.color.setHex(col);
                if (nodeMesh.userData.light) nodeMesh.userData.light.color.setHex(col);

                // Atualiza o sprite se mudou o estado
                if (nodeMesh.userData.isFixed !== isFixed) {
                    nodeMesh.userData.isFixed = isFixed;
                    if (nodeMesh.userData.sprite) {
                        nodeMesh.remove(nodeMesh.userData.sprite);
                    }
                    const newSprite = this.createDeviceSprite(nodeMesh.userData.name, isFixed);
                    newSprite.position.y = 1.3;
                    nodeMesh.add(newSprite);
                    nodeMesh.userData.sprite = newSprite;
                }
            }
        });
    }
}

window.SmartHome3DEngine = SmartHome3DEngine;
