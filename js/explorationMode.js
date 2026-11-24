/**
 * Cyber Defense: Proteja sua Smart Home
 * Módulo de Exploração Livre da Casa Inteligente (Agent Free-Roam)
 * Movimentação fluida (WASD / Setas / Clique / Joystick), Iluminação Dinâmica e Proximidade
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class SmartHomeExplorationAgent {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.active = false;

        // Posição e física do Agente Cyber
        this.x = 500;
        this.y = 260;
        this.targetX = 500;
        this.targetY = 260;
        this.radius = 16;
        this.speed = 4.2;
        this.angle = 0;
        this.moving = false;

        // Controle de Teclado
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // Dispositivo próximo
        this.nearbyDevice = null;
        this.proximityDistance = 65;

        // Rastro de partículas do agente
        this.trail = [];

        // Cômodo atual
        this.currentRoom = "Centro";

        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;
            const key = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(key)) { this.keys.up = true; e.preventDefault(); }
            if (['s', 'arrowdown'].includes(key)) { this.keys.down = true; e.preventDefault(); }
            if (['a', 'arrowleft'].includes(key)) { this.keys.left = true; e.preventDefault(); }
            if (['d', 'arrowright'].includes(key)) { this.keys.right = true; e.preventDefault(); }

            // Interação com tecla E ou Espaço
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

        // Clique no chão para andar até o ponto
        if (this.canvas) {
            this.canvas.addEventListener('pointerdown', (e) => {
                if (!this.active) return;
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                // Limita dentro da casa
                this.targetX = Math.max(160, Math.min(840, clickX));
                this.targetY = Math.max(100, Math.min(500, clickY));
                this.moving = true;
            });
        }
    }

    toggleMode(enable) {
        this.active = enable !== undefined ? enable : !this.active;
        if (this.active) {
            window.cyberAudio.playShield();
            // Posiciona no centro da casa se estiver fora
            if (this.x < 150 || this.x > 850) this.x = 500;
            if (this.y < 90 || this.y > 510) this.y = 260;
            this.targetX = this.x;
            this.targetY = this.y;
        }
        return this.active;
    }

    interactWithNearbyDevice() {
        if (!this.nearbyDevice) return;
        window.cyberAudio.playClick();
        if (window.modalInspector) {
            window.modalInspector.open(this.nearbyDevice.id);
        }
    }

    update() {
        if (!this.active) return;

        let dx = 0;
        let dy = 0;

        if (this.keys.up) dy -= this.speed;
        if (this.keys.down) dy += this.speed;
        if (this.keys.left) dx -= this.speed;
        if (this.keys.right) dx += this.speed;

        if (dx !== 0 || dy !== 0) {
            // Movimento por teclado
            this.moving = false;
            this.x += dx;
            this.y += dy;
            this.angle = Math.atan2(dy, dx);
            this.targetX = this.x;
            this.targetY = this.y;
        } else if (this.moving) {
            // Movimento suave até o ponto clicado
            const distX = this.targetX - this.x;
            const distY = this.targetY - this.y;
            const dist = Math.hypot(distX, distY);

            if (dist > 4) {
                this.angle = Math.atan2(distY, distX);
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
            } else {
                this.moving = false;
            }
        }

        // Limites físicos da residência (Paredes perimetrais)
        this.x = Math.max(150, Math.min(840, this.x));
        this.y = Math.max(100, Math.min(490, this.y));

        // Atualiza cômodo atual
        this.detectCurrentRoom();

        // Rastro de partículas (Trail)
        if (Math.random() > 0.3) {
            this.trail.push({
                x: this.x,
                y: this.y,
                alpha: 0.6,
                size: Math.random() * 4 + 2
            });
        }
        this.trail.forEach(t => {
            t.alpha -= 0.03;
        });
        this.trail = this.trail.filter(t => t.alpha > 0);

        // Detecta dispositivo mais próximo
        this.detectNearbyDevices();
    }

    detectCurrentRoom() {
        if (this.y < 220 && this.x > 320 && this.x < 680) {
            this.currentRoom = "Sala de Estar";
        } else if (this.x >= 600 && this.y >= 200) {
            this.currentRoom = "Quarto Principal";
        } else if (this.y >= 350 && this.x >= 320 && this.x <= 640) {
            this.currentRoom = "Cozinha Conectada";
        } else if (this.x < 360) {
            this.currentRoom = "Entrada / Fachada";
        } else {
            this.currentRoom = "Hall Central";
        }
    }

    detectNearbyDevices() {
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

    draw(ctx) {
        if (!this.active || !ctx) return;

        // 1. Iluminação e Lanterna do Agente
        const lightGrad = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, 130);
        lightGrad.addColorStop(0, "rgba(0, 229, 255, 0.28)");
        lightGrad.addColorStop(0.6, "rgba(0, 229, 255, 0.08)");
        lightGrad.addColorStop(1, "rgba(0, 229, 255, 0)");

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 130, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rastro de partículas
        this.trail.forEach(t => {
            ctx.fillStyle = `rgba(0, 229, 255, ${t.alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Sombra do Agente
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 14, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Drone / Avatar do Agente Cyber
        ctx.save();
        ctx.translate(this.x, this.y);

        // Anel holográfico giratório do avatar
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Núcleo do agente
        ctx.fillStyle = "#070d19";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Scanner frontal apontando na direção do movimento
        ctx.rotate(this.angle);
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.moveTo(this.radius - 4, -4);
        ctx.lineTo(this.radius + 6, 0);
        ctx.lineTo(this.radius - 4, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 5. HUD Flutuante do Agente (Cômodo e Dica de Ação)
        this.drawAgentHUD(ctx);
    }

    drawAgentHUD(ctx) {
        // Tag com nome do cômodo
        ctx.font = "bold 11px Orbitron, sans-serif";
        ctx.textAlign = "center";
        
        ctx.fillStyle = "rgba(7, 13, 25, 0.85)";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1;

        const roomText = `AGENTE: ${this.currentRoom.toUpperCase()}`;
        const textWidth = ctx.measureText(roomText).width + 20;

        ctx.beginPath();
        ctx.roundRect(this.x - textWidth / 2, this.y - 42, textWidth, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#00e5ff";
        ctx.fillText(roomText, this.x, this.y - 28);

        // Se estiver perto de um dispositivo: Balão com Tecla [E]
        if (this.nearbyDevice) {
            const dev = this.nearbyDevice;
            const isFixed = window.gameState.isDeviceFixed(dev.id);
            const promptY = this.y + 36;

            const actionText = `[E] INSPECIONAR ${dev.name.toUpperCase()}`;
            const actionWidth = ctx.measureText(actionText).width + 24;

            ctx.fillStyle = isFixed ? "rgba(0, 230, 118, 0.92)" : "rgba(255, 59, 92, 0.92)";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            ctx.roundRect(this.x - actionWidth / 2, promptY, actionWidth, 24, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isFixed ? "#070d19" : "#ffffff";
            ctx.font = "bold 11.5px Orbitron, sans-serif";
            ctx.fillText(actionText, this.x, promptY + 16);

            // Linha guia conectando o agente ao dispositivo
            ctx.strokeStyle = isFixed ? "rgba(0, 230, 118, 0.6)" : "rgba(255, 59, 92, 0.6)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(dev.coords.x, dev.coords.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

window.SmartHomeExplorationAgent = SmartHomeExplorationAgent;
