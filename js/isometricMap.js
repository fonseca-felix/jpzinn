/**
 * Cyber Defense: Proteja sua Smart Home
 * Mapa Interativo Isométrico & Cúpula Holográfica de Proteção
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class IsometricSmartHomeMap {
    constructor(containerId, canvasId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.currentFilter = 'all';
        this.particles = [];
        this.animId = null;
        this.domePulse = 0;
        this.isScanning = false;
        this.scanProgress = 0;

        this.initCanvas();
        this.initParticles();
        this.startDomeAnimation();
        this.bindEvents();
    }

    initCanvas() {
        if (!this.canvas) return;
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width || 900;
            this.canvas.height = rect.height || 560;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    initParticles() {
        this.particles = [];
        const count = 30;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * (this.canvas ? this.canvas.width : 900),
                y: Math.random() * (this.canvas ? this.canvas.height : 560),
                radius: Math.random() * 2 + 0.8,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 0.7 - 0.2,
                alpha: Math.random() * 0.6 + 0.2
            });
        }
    }

    startDomeAnimation() {
        const render = () => {
            this.drawHolographicDome();
            this.animId = requestAnimationFrame(render);
        };
        render();
    }

    triggerNetworkScan() {
        if (this.isScanning) return;
        this.isScanning = true;
        this.scanProgress = 0;
        window.cyberAudio.playShield();

        const scanInterval = setInterval(() => {
            this.scanProgress += 0.03;
            if (this.scanProgress >= 1.2) {
                clearInterval(scanInterval);
                this.isScanning = false;
                window.cyberAudio.playSuccess();
                if (window.CyberApp) {
                    window.CyberApp.showToast("Varredura de Rede Concluída! Nós vulneráveis destacados.", "info");
                }
            }
        }, 30);
    }

    drawHolographicDome() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const sec = window.gameState ? window.gameState.securityPct : 20;

        ctx.clearRect(0, 0, w, h);

        let r, g, b;
        if (sec < 40) {
            r = 255; g = 59; b = 92;
        } else if (sec < 80) {
            r = 0; g = 229; b = 255;
        } else {
            r = 0; g = 230; b = 118;
        }

        this.domePulse += 0.02;
        const pulse = Math.sin(this.domePulse) * 0.1 + 0.9;

        const cx = w / 2;
        const cy = h / 2 + 10;
        const rx = w * 0.46 * pulse;
        const ry = h * 0.44 * pulse;

        // Gradiente da cúpula
        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, rx);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.02 * (sec / 100)})`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.06 * (sec / 100)})`);
        grad.addColorStop(0.95, `rgba(${r}, ${g}, ${b}, ${0.22 * pulse})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Linhas de meridianos
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * (sec / 100) + 0.08})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);

        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx * (i / 3), ry * (i / 3), 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Efeito de Varredura de Radar Ativo
        if (this.isScanning) {
            const currentR = rx * Math.min(1, this.scanProgress);
            const scanGrad = ctx.createRadialGradient(cx, cy, Math.max(0, currentR - 50), cx, cy, currentR);
            scanGrad.addColorStop(0, "rgba(0, 229, 255, 0)");
            scanGrad.addColorStop(0.8, "rgba(0, 229, 255, 0.4)");
            scanGrad.addColorStop(1, "rgba(0, 229, 255, 0.8)");

            ctx.fillStyle = scanGrad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, currentR, currentR * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Partículas flutuantes
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) {
                p.y = h;
                p.x = Math.random() * w;
            }
            if (p.x < 0 || p.x > w) p.vx *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderMap() {
        if (!this.container) return;
        const devices = window.gameState.getCurrentDevices();
        const fixedDevices = window.gameState.fixedDevices;

        // Planta Isométrica ampla no viewBox 0 0 1000 580
        const svgHTML = `
        <svg viewBox="0 0 1000 580" class="isometric-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="floorLiving" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0e1a32" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#081122" stop-opacity="0.95"/>
                </linearGradient>
                <linearGradient id="floorBedroom" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#14213d" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#0a1528" stop-opacity="0.95"/>
                </linearGradient>
                <linearGradient id="floorKitchen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#11223e" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#08101e" stop-opacity="0.95"/>
                </linearGradient>
                <linearGradient id="floorEntrance" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f2038" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#060c18" stop-opacity="0.95"/>
                </linearGradient>
            </defs>

            <!-- Grade Isométrica de Fundo -->
            <g class="iso-grid" stroke="rgba(0, 229, 255, 0.06)" stroke-width="1">
                ${this.generateIsoGrid()}
            </g>

            <!-- 1. SALA DE ESTAR (Norte / Topo-Central: x 320..680, y 60..240) -->
            <g class="room-group room-living ${this.isRoomDimmed('living') ? 'dimmed' : ''}" data-room="living">
                <polygon points="500,60 700,160 500,260 300,160" fill="url(#floorLiving)" stroke="#00e5ff" stroke-width="1.8" stroke-dasharray="6,3" />
                <polygon points="300,160 500,260 500,275 300,175" fill="#081120" stroke="rgba(0,229,255,0.4)" />
                <polygon points="500,260 700,160 700,175 500,275" fill="#060c18" stroke="rgba(0,229,255,0.4)" />
                <text x="500" y="105" text-anchor="middle" class="room-label">SALA DE ESTAR (CENTRAL)</text>
            </g>

            <!-- 2. QUARTO PRINCIPAL (Leste / Direita: x 600..960, y 180..380) -->
            <g class="room-group room-bedroom ${this.isRoomDimmed('bedroom') ? 'dimmed' : ''}" data-room="bedroom">
                <polygon points="700,160 900,260 700,360 500,260" fill="url(#floorBedroom)" stroke="#00e5ff" stroke-width="1.8" stroke-dasharray="6,3" />
                <polygon points="500,260 700,360 700,375 500,275" fill="#081120" stroke="rgba(0,229,255,0.4)" />
                <polygon points="700,360 900,260 900,275 700,375" fill="#060c18" stroke="rgba(0,229,255,0.4)" />
                <text x="730" y="210" text-anchor="middle" class="room-label">QUARTO PRINCIPAL</text>
            </g>

            <!-- 3. COZINHA (Sul / Baixo-Central: x 300..700, y 260..460) -->
            <g class="room-group room-kitchen ${this.isRoomDimmed('kitchen') ? 'dimmed' : ''}" data-room="kitchen">
                <polygon points="500,260 700,360 500,460 300,360" fill="url(#floorKitchen)" stroke="#00e5ff" stroke-width="1.8" stroke-dasharray="6,3" />
                <polygon points="300,360 500,460 500,475 300,375" fill="#081120" stroke="rgba(0,229,255,0.4)" />
                <polygon points="500,460 700,360 700,375 500,475" fill="#060c18" stroke="rgba(0,229,255,0.4)" />
                <text x="500" y="320" text-anchor="middle" class="room-label">COZINHA CONECTADA</text>
            </g>

            <!-- 4. ENTRADA / FACHADA (Oeste / Esquerda: x 100..500, y 160..360) -->
            <g class="room-group room-entrance ${this.isRoomDimmed('entrance') ? 'dimmed' : ''}" data-room="entrance">
                <polygon points="300,160 500,260 300,360 100,260" fill="url(#floorEntrance)" stroke="#00e5ff" stroke-width="1.8" stroke-dasharray="6,3" />
                <polygon points="100,260 300,360 300,375 100,275" fill="#081120" stroke="rgba(0,229,255,0.4)" />
                <polygon points="300,360 500,260 500,275 300,375" fill="#060c18" stroke="rgba(0,229,255,0.4)" />
                <text x="270" y="210" text-anchor="middle" class="room-label">ENTRADA / FACHADA</text>
            </g>

            <!-- Linhas de Barramento IoT entre os nós -->
            <g class="iot-bus-lines" stroke="rgba(0, 229, 255, 0.35)" stroke-width="1.5" stroke-dasharray="4,4">
                <line x1="420" y1="140" x2="590" y2="170" /> <!-- Router -> Camera -->
                <line x1="420" y1="140" x2="700" y2="390" /> <!-- Router -> Thermostat -->
                <line x1="420" y1="140" x2="480" y2="440" /> <!-- Router -> Speaker -->
                <line x1="420" y1="140" x2="770" y2="270" /> <!-- Router -> Bulb -->
                <line x1="420" y1="140" x2="310" y2="240" /> <!-- Router -> Door Sensor -->
                <line x1="310" y1="240" x2="200" y2="350" /> <!-- Door Sensor -> Lock -->
            </g>

            <!-- NÓS DE DISPOSITIVOS INTELIGENTES -->
            <g class="devices-layer">
                ${devices.map(device => this.renderDeviceNode(device, fixedDevices.includes(device.id))).join('')}
            </g>
        </svg>
        `;

        this.container.innerHTML = svgHTML;
        this.attachNodeClickEvents();
    }

    generateIsoGrid() {
        let lines = '';
        for (let x = 0; x <= 1000; x += 100) {
            lines += `<line x1="${x}" y1="0" x2="${x + 500}" y2="580" />`;
            lines += `<line x1="${x}" y1="0" x2="${x - 500}" y2="580" />`;
        }
        return lines;
    }

    isRoomDimmed(roomName) {
        if (this.currentFilter === 'all') return false;
        return this.currentFilter !== roomName;
    }

    renderDeviceNode(device, isFixed) {
        const { x, y } = device.coords;
        const statusClass = isFixed ? 'node-secured' : 'node-vulnerable';
        const ringColor = isFixed ? '#00e676' : '#ff3b5c';
        const pulseColor = isFixed ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 59, 92, 0.5)';
        const iconSvg = this.getDeviceSvgPath(device.icon, isFixed);

        return `
        <g class="device-node ${statusClass}" data-device-id="${device.id}" transform="translate(${x}, ${y})">
            <!-- Pulso animado de perigo / segurança -->
            <circle cx="0" cy="0" r="26" class="pulse-ring" fill="${pulseColor}" />
            <circle cx="0" cy="0" r="22" class="node-base-ring" stroke="${ringColor}" stroke-width="2.5" fill="#070d19" />
            
            <!-- Ícone central do dispositivo -->
            <g class="node-icon" transform="translate(-12, -12)">
                ${iconSvg}
            </g>

            <!-- Badge de Status Flutuante (⚠️ ou ✔) -->
            <g transform="translate(14, -14)">
                <circle cx="0" cy="0" r="10" fill="${isFixed ? '#00e676' : '#ff3b5c'}" stroke="#070d19" stroke-width="2"/>
                <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="#070d19">
                    ${isFixed ? '✔' : '!'}
                </text>
            </g>

            <!-- Rótulo do Dispositivo com Efeito Tech -->
            <g class="node-tag" transform="translate(0, 34)">
                <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(7, 13, 25, 0.92)" stroke="${ringColor}" stroke-width="1.2" />
                <text x="0" y="3" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600" letter-spacing="0.5">
                    ${device.name}
                </text>
            </g>

            <!-- Alerta Flutuante SOC Compacto -->
            ${!isFixed ? `
            <g class="soc-threat-bubble" transform="translate(0, -32)">
                <rect x="-55" y="-10" width="110" height="20" rx="3" fill="rgba(255, 59, 92, 0.92)" stroke="#fff" stroke-width="0.8" />
                <text x="0" y="3" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">
                    ⚠ VULNERÁVEL
                </text>
            </g>
            ` : `
            <g class="soc-secured-bubble" transform="translate(0, -32)">
                <rect x="-50" y="-10" width="100" height="20" rx="3" fill="rgba(0, 230, 118, 0.9)" stroke="#070d19" stroke-width="0.8" />
                <text x="0" y="3" text-anchor="middle" fill="#070d19" font-size="9" font-weight="800">
                    BLINDADO
                </text>
            </g>
            `}
        </g>
        `;
    }

    getDeviceSvgPath(iconType, isFixed) {
        const color = isFixed ? '#00e676' : '#00e5ff';
        switch (iconType) {
            case 'camera':
                return `<path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="${color}" />`;
            case 'router':
                return `<path d="M2 17h20v2H2zm2-4h16v2H4zm3-8a9 9 0 0 1 10 0l-1.5 2a7 7 0 0 0-7 0zm2 3a6 6 0 0 1 6 0l-1.5 2a4 4 0 0 0-3 0zm1 3a3 3 0 0 1 2 0l-1 1.5z" fill="${color}" />`;
            case 'lock':
                return `<path d="M17 9V7A5 5 0 0 0 7 7v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-5 7.7V18a1 1 0 0 1-2 0v-1.3a2 2 0 1 1 2 0zM9 9V7a3 3 0 0 1 6 0v2z" fill="${color}" />`;
            case 'thermometer':
                return `<path d="M12 2a3 3 0 0 0-3 3v8.3a5 5 0 1 0 6 0V5a3 3 0 0 0-3-3zm1 14.7v.3a2 2 0 1 1-2 0v-.3l-.5-.3A3 3 0 0 1 10 14h4a3 3 0 0 1-.5 2.4zM11 5a1 1 0 0 1 2 0v5h-2z" fill="${color}" />`;
            case 'mic':
                return `<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z" fill="${color}" />`;
            case 'shield':
                return `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z" fill="${color}" />`;
            case 'bulb':
                return `<path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zm-3 18h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm6-9h-2V7h-2v4H9l3 3z" fill="${color}" />`;
            default:
                return `<circle cx="12" cy="12" r="10" fill="${color}" />`;
        }
    }

    attachNodeClickEvents() {
        if (!this.container) return;
        const nodes = this.container.querySelectorAll('.device-node');
        nodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const deviceId = node.getAttribute('data-device-id');
                window.cyberAudio.playClick();
                if (window.modalInspector) {
                    window.modalInspector.open(deviceId);
                }
            });
        });
    }

    setFilter(roomName) {
        this.currentFilter = roomName;
        this.renderMap();
    }

    bindEvents() {
        window.gameState.subscribe((event, data) => {
            if (['level_started', 'device_secured', 'step_error', 'level_completed', 'progress_reset'].includes(event)) {
                this.renderMap();
            }
        });
    }
}

window.IsometricSmartHomeMap = IsometricSmartHomeMap;
