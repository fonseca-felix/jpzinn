/**
 * Cyber Defense: Proteja sua Smart Home
 * Módulo de Exploração Livre da Casa Inteligente com Avatar Humanoide SVG
 * Movimentação 60 FPS (WASD / Setas / Clique no Chão / D-Pad) e Interação de Proximidade
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class SmartHomeExplorationAgent {
    constructor() {
        this.active = true; // Ativo por padrão para o usuário já ver o boneco imediatamente!

        // Posição no espaço SVG (0..1000, 0..580)
        this.x = 500;
        this.y = 260;
        this.targetX = 500;
        this.targetY = 260;
        this.speed = 5.0;
        this.angle = 0;
        this.moving = false;
        this.walkCycle = 0;

        // Teclas
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.nearbyDevice = null;
        this.proximityDistance = 85;
        this.currentRoom = "Hall Central";

        this.initInput();
        this.startLoop();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;
            const key = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(key)) { this.keys.up = true; e.preventDefault(); }
            if (['s', 'arrowdown'].includes(key)) { this.keys.down = true; e.preventDefault(); }
            if (['a', 'arrowleft'].includes(key)) { this.keys.left = true; e.preventDefault(); }
            if (['d', 'arrowright'].includes(key)) { this.keys.right = true; e.preventDefault(); }

            if (['e', ' ', 'enter'].includes(key) && this.nearbyDevice) {
                e.preventDefault();
                this.interactWithNearbyDevice();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(key)) this.keys.up = false;
            if (['s', 'arrowdown'].includes(key)) this.keys.down = false;
            if (['a', 'arrowleft'].includes(key)) this.keys.left = false;
            if (['d', 'arrowright'].includes(key)) this.keys.right = false;
        });

        // Clique no chão do mapa para andar até lá
        document.addEventListener('pointerdown', (e) => {
            if (!this.active) return;
            const mapSvg = document.querySelector('.isometric-svg');
            if (!mapSvg) return;

            // Se clicou no modal ou em controles, não anda
            if (e.target.closest('#device-inspector-modal') || e.target.closest('#audit-report-modal') || e.target.closest('.virtual-dpad') || e.target.closest('.map-filter-bar')) {
                return;
            }

            // Converte coordenadas do clique para o sistema viewBox (0..1000, 0..580)
            const rect = mapSvg.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
                const clickY = ((e.clientY - rect.top) / rect.height) * 580;

                // Limita dentro da casa
                this.targetX = Math.max(140, Math.min(860, clickX));
                this.targetY = Math.max(90, Math.min(490, clickY));
                this.moving = true;
            }
        });
    }

    toggleMode(enable) {
        this.active = enable !== undefined ? enable : !this.active;
        const agentElem = document.getElementById('player-agent-group');
        const hud = document.getElementById('exploration-controls-hud');

        if (agentElem) {
            agentElem.style.display = this.active ? 'block' : 'none';
        }
        if (hud) {
            hud.style.display = this.active ? 'flex' : 'none';
        }

        if (this.active) {
            window.cyberAudio.playShield();
        }
        return this.active;
    }

    startLoop() {
        const tick = () => {
            this.update();
            this.render();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    update() {
        if (!this.active) return;

        let dx = 0;
        let dy = 0;

        if (this.keys.up) dy -= this.speed;
        if (this.keys.down) dy += this.speed;
        if (this.keys.left) dx -= this.speed;
        if (this.keys.right) dx += this.speed;

        const isInputMoving = (dx !== 0 || dy !== 0);

        if (isInputMoving) {
            this.moving = false;
            this.x += dx;
            this.y += dy;
            this.angle = Math.atan2(dy, dx);
            this.targetX = this.x;
            this.targetY = this.y;
            this.walkCycle += 0.25;
        } else if (this.moving) {
            const distX = this.targetX - this.x;
            const distY = this.targetY - this.y;
            const dist = Math.hypot(distX, distY);

            if (dist > 5) {
                this.angle = Math.atan2(distY, distX);
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                this.walkCycle += 0.25;
            } else {
                this.moving = false;
            }
        } else {
            // Em repouso
            this.walkCycle = 0;
        }

        // Limites da casa
        this.x = Math.max(140, Math.min(860, this.x));
        this.y = Math.max(90, Math.min(490, this.y));

        this.detectCurrentRoom();
        this.detectNearbyDevices();
    }

    detectCurrentRoom() {
        if (this.y < 230 && this.x > 320 && this.x < 680) {
            this.currentRoom = "Sala de Estar";
        } else if (this.x >= 580 && this.y >= 200) {
            this.currentRoom = "Quarto Principal";
        } else if (this.y >= 330 && this.x >= 320 && this.x <= 640) {
            this.currentRoom = "Cozinha Conectada";
        } else if (this.x < 360) {
            this.currentRoom = "Entrada / Fachada";
        } else {
            this.currentRoom = "Hall Central";
        }
    }

    detectNearbyDevices() {
        if (!window.gameState) return;
        const devices = window.gameState.getCurrentDevices();
        let closest = null;
        let minDistance = Infinity;

        devices.forEach(dev => {
            const dist = Math.hypot(dev.coords.x - this.x, dev.coords.y - this.y);
            if (dist < minDistance) {
                minDistance = dist;
                closest = dev;
            }
        });

        if (minDistance <= this.proximityDistance) {
            this.nearbyDevice = closest;
        } else {
            this.nearbyDevice = null;
        }
    }

    interactWithNearbyDevice() {
        if (!this.nearbyDevice) return;
        window.cyberAudio.playClick();
        if (window.modalInspector) {
            window.modalInspector.open(this.nearbyDevice.id);
        }
    }

    render() {
        const agentElem = document.getElementById('player-agent-group');
        if (!agentElem) return;

        if (!this.active) {
            agentElem.style.display = 'none';
            return;
        }
        agentElem.style.display = 'block';

        // Atualiza posição do boneco no SVG
        agentElem.setAttribute('transform', `translate(${this.x}, ${this.y})`);

        // Atualiza ângulo da lanterna/corpo
        const flashlight = document.getElementById('agent-flashlight');
        if (flashlight) {
            const deg = (this.angle * 180) / Math.PI;
            flashlight.setAttribute('transform', `rotate(${deg})`);
        }

        // Animação das pernas caminhando
        const legLeft = document.getElementById('leg-left');
        const legRight = document.getElementById('leg-right');
        if (legLeft && legRight) {
            const swing = Math.sin(this.walkCycle) * 4;
            legLeft.setAttribute('y', 8 + swing);
            legRight.setAttribute('y', 8 - swing);
        }

        // Atualiza etiqueta do cômodo
        const roomText = document.getElementById('agent-room-text');
        if (roomText) {
            roomText.textContent = this.currentRoom.toUpperCase();
        }

        // Balão de Interação por Proximidade
        const promptGroup = document.getElementById('agent-interaction-prompt');
        const promptText = document.getElementById('agent-prompt-text');
        const promptBg = document.getElementById('agent-prompt-bg');

        if (promptGroup && promptText && promptBg) {
            if (this.nearbyDevice) {
                promptGroup.style.display = 'block';
                const isFixed = window.gameState.isDeviceFixed(this.nearbyDevice.id);
                promptText.textContent = `[E] INSPECIONAR ${this.nearbyDevice.name.toUpperCase()}`;
                promptBg.setAttribute('fill', isFixed ? 'rgba(0, 230, 118, 0.95)' : 'rgba(255, 59, 92, 0.95)');
            } else {
                promptGroup.style.display = 'none';
            }
        }
    }
}

// Instância global única
window.explorationAgent = new SmartHomeExplorationAgent();
window.SmartHomeExplorationAgent = SmartHomeExplorationAgent;
