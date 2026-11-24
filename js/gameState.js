/**
 * Cyber Defense: Proteja sua Smart Home
 * Gerenciador de Estado do Jogo (GameState)
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class GameStateManager {
    constructor() {
        this.STORAGE_KEY = 'cyber_defense_smart_home_state_v1';
        this.currentLevel = 1;
        this.score = 0;
        this.securityPct = 20; // Começa baixo conforme especificação
        this.fixedDevices = []; // IDs dos dispositivos corrigidos no nível atual
        this.deviceAttempts = {}; // Tentativas por dispositivo { deviceId: { step1Attempts, step2Attempts, step3Attempts, errors } }
        this.levelAuditHistory = []; // Registro detalhado de cada ação para o Relatório Final
        this.achievements = JSON.parse(JSON.stringify(GAME_DATA.achievements));
        this.stats = {
            totalFixed: 0,
            totalErrors: 0,
            levelsCompleted: [],
            startTime: Date.now(),
            inspectedGlossary: new Set()
        };

        this.listeners = [];
        this.loadSavedState();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(event, data) {
        this.listeners.forEach(cb => {
            try {
                cb(event, data);
            } catch (e) {
                console.error("Erro no listener de GameState:", e);
            }
        });
        this.saveState();
    }

    getCurrentLevelData() {
        return GAME_DATA.levels.find(l => l.id === this.currentLevel) || GAME_DATA.levels[0];
    }

    getCurrentDevices() {
        return GAME_DATA.devicesByLevel[this.currentLevel] || [];
    }

    getDevice(deviceId) {
        const devices = this.getCurrentDevices();
        return devices.find(d => d.id === deviceId);
    }

    isDeviceFixed(deviceId) {
        return this.fixedDevices.includes(deviceId);
    }

    // Inicializa ou reinicializa um nível
    initLevel(levelNumber) {
        this.currentLevel = levelNumber;
        const levelData = this.getCurrentLevelData();
        this.fixedDevices = [];
        this.deviceAttempts = {};
        this.securityPct = levelData.initialSecurity || 15;
        this.notify('level_started', { level: this.currentLevel, securityPct: this.securityPct });
    }

    // Registra acerto em uma etapa de dispositivo
    recordStepSuccess(deviceId, stepIndex, pointsEarned = 50) {
        if (!this.deviceAttempts[deviceId]) {
            this.deviceAttempts[deviceId] = { step1: 0, step2: 0, step3: 0, errors: 0 };
        }
        
        this.score += pointsEarned;
        this.notify('score_updated', { score: this.score, earned: pointsEarned });

        // Se completou a etapa 3 (última etapa), o dispositivo está totalmente mitigado
        if (stepIndex === 3) {
            if (!this.fixedDevices.includes(deviceId)) {
                this.fixedDevices.push(deviceId);
                this.stats.totalFixed++;

                // Aumenta a segurança percentual proporcionalmente (7 dispositivos por nível)
                const totalDevices = this.getCurrentDevices().length;
                const levelData = this.getCurrentLevelData();
                const remainingSec = 100 - levelData.initialSecurity;
                const increment = Math.round(remainingSec / totalDevices);

                this.securityPct = Math.min(100, this.securityPct + increment);
                if (this.fixedDevices.length === totalDevices) {
                    this.securityPct = 100; // Garante 100% se todos corrigidos
                }

                // Salva histórico de auditoria
                const dev = this.getDevice(deviceId);
                this.levelAuditHistory.push({
                    level: this.currentLevel,
                    deviceId: deviceId,
                    deviceName: dev ? dev.name : deviceId,
                    room: dev ? dev.roomName : 'Geral',
                    vulnerability: dev ? dev.step1.options[dev.step1.correctIndex] : 'Mitigada',
                    threat: dev ? dev.step2.options[dev.step2.correctIndex] : 'Neutralizada',
                    mitigation: dev ? dev.step3.options[dev.step3.correctIndex] : 'Aplicada',
                    errors: this.deviceAttempts[deviceId].errors,
                    status: this.deviceAttempts[deviceId].errors === 0 ? 'Perfeito' : 'Corrigido com Falhas',
                    timestamp: new Date().toLocaleTimeString()
                });

                this.checkAchievements();
                this.notify('device_secured', {
                    deviceId,
                    securityPct: this.securityPct,
                    fixedCount: this.fixedDevices.length,
                    totalCount: totalDevices
                });

                // Verifica se o nível foi concluído
                if (this.fixedDevices.length === totalDevices) {
                    this.completeLevel();
                }
            }
        }
    }

    // Registra erro em uma etapa
    recordStepError(deviceId, stepIndex) {
        if (!this.deviceAttempts[deviceId]) {
            this.deviceAttempts[deviceId] = { step1: 0, step2: 0, step3: 0, errors: 0 };
        }
        this.deviceAttempts[deviceId].errors++;
        this.stats.totalErrors++;

        // Penalidade suave de integridade (mínimo mantido conforme piso do nível)
        const minSec = 5;
        this.securityPct = Math.max(minSec, this.securityPct - 3);

        this.notify('step_error', {
            deviceId,
            stepIndex,
            securityPct: this.securityPct,
            errorsOnDevice: this.deviceAttempts[deviceId].errors
        });
    }

    completeLevel() {
        if (!this.stats.levelsCompleted.includes(this.currentLevel)) {
            this.stats.levelsCompleted.push(this.currentLevel);
        }

        // Bônus de conclusão
        const bonus = 250 * this.currentLevel;
        this.score += bonus;

        this.checkAchievements();
        this.notify('level_completed', {
            level: this.currentLevel,
            score: this.score,
            bonus: bonus,
            history: this.levelAuditHistory.filter(h => h.level === this.currentLevel)
        });
    }

    // Checagem de Conquistas
    checkAchievements() {
        const unlock = (id) => {
            const ach = this.achievements.find(a => a.id === id);
            if (ach && !ach.unlocked) {
                ach.unlocked = true;
                this.score += 100; // Bônus por conquista
                this.notify('achievement_unlocked', ach);
            }
        };

        // 1. Primeira Defesa
        if (this.stats.totalFixed >= 1) unlock('first_defense');

        // 2. Caçador de Senhas Padrão
        if (this.currentLevel === 1 && this.fixedDevices.length >= 7) unlock('hunter_passwords');

        // 3. Mestre da Segmentação
        if (this.currentLevel === 2 && this.fixedDevices.includes('router') && this.fixedDevices.includes('camera')) {
            unlock('master_segmentation');
        }

        // 4. Caçador de Botnets
        if (this.currentLevel === 3 && this.fixedDevices.includes('camera')) unlock('mirai_destroyer');

        // 5. Escudo Zero-Trust
        if (this.stats.totalFixed >= 5) unlock('zero_trust_shield');

        // 6. Detetive de Firmware
        if (this.fixedDevices.includes('smartbulb')) unlock('firmware_detective');

        // 7. 100% Blindado
        if (this.securityPct >= 100) unlock('armored_home');

        // 8. Auditor Perfeito
        const currentAudit = this.levelAuditHistory.filter(h => h.level === this.currentLevel);
        if (currentAudit.length === 7 && currentAudit.every(a => a.errors === 0)) {
            unlock('perfect_auditor');
        }

        // 9. Mestre dos Protocolos (Glossário)
        if (this.stats.inspectedGlossary && this.stats.inspectedGlossary.size >= 4) {
            unlock('protocol_master');
        }

        // 10. Guardião da Smart Home
        if (this.stats.levelsCompleted.length >= 3 && this.score >= 2500) {
            unlock('smart_home_guardian');
        }
    }

    registerGlossaryView(protocolName) {
        if (!this.stats.inspectedGlossary) this.stats.inspectedGlossary = new Set();
        this.stats.inspectedGlossary.add(protocolName);
        this.checkAchievements();
    }

    // Salvar e Carregar no LocalStorage
    saveState() {
        try {
            const dataToSave = {
                currentLevel: this.currentLevel,
                score: this.score,
                securityPct: this.securityPct,
                fixedDevices: this.fixedDevices,
                levelAuditHistory: this.levelAuditHistory,
                achievements: this.achievements,
                stats: {
                    totalFixed: this.stats.totalFixed,
                    totalErrors: this.stats.totalErrors,
                    levelsCompleted: this.stats.levelsCompleted,
                    startTime: this.stats.startTime,
                    inspectedGlossary: Array.from(this.stats.inspectedGlossary || [])
                }
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('Não foi possível persistir no localStorage:', e);
        }
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.currentLevel = data.currentLevel || 1;
                this.score = data.score || 0;
                this.securityPct = data.securityPct || 20;
                this.fixedDevices = data.fixedDevices || [];
                this.levelAuditHistory = data.levelAuditHistory || [];
                if (data.achievements) {
                    this.achievements = data.achievements;
                }
                if (data.stats) {
                    this.stats = {
                        totalFixed: data.stats.totalFixed || 0,
                        totalErrors: data.stats.totalErrors || 0,
                        levelsCompleted: data.stats.levelsCompleted || [],
                        startTime: data.stats.startTime || Date.now(),
                        inspectedGlossary: new Set(data.stats.inspectedGlossary || [])
                    };
                }
            }
        } catch (e) {
            console.warn('Falha ao restaurar do localStorage, usando valores padrão:', e);
        }
    }

    resetProgress() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.currentLevel = 1;
        this.score = 0;
        this.securityPct = 20;
        this.fixedDevices = [];
        this.deviceAttempts = {};
        this.levelAuditHistory = [];
        this.achievements = JSON.parse(JSON.stringify(GAME_DATA.achievements));
        this.stats = {
            totalFixed: 0,
            totalErrors: 0,
            levelsCompleted: [],
            startTime: Date.now(),
            inspectedGlossary: new Set()
        };
        this.notify('progress_reset', {});
    }
}

// Instância global
window.gameState = new GameStateManager();
