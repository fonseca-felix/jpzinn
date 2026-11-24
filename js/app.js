/**
 * Cyber Defense: Proteja sua Smart Home
 * Controlador Principal da Aplicação (App Controller)
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização dos Módulos Principais
    window.modalInspector = new DeviceModalInspector('device-inspector-modal');
    window.auditReport = new AuditReportManager('audit-report-modal');
    window.smartHomeMap = new IsometricSmartHomeMap('isometric-map-wrapper', 'dome-canvas');

    // Estado da Aplicação UI
    const App = {
        currentView: 'home',

        init() {
            this.bindNavigation();
            this.bindTopbarActions();
            this.bindHomeActions();
            this.bindRoomFilters();
            this.bindKnowledgeTabs();
            this.bindSettings();
            this.bindGameStateUpdates();
            this.startLiveSocFeed();

            // Renderiza estado inicial
            this.hydrateIcons();
            this.updateTopbar();
            this.renderAchievements();
            this.renderProgressMetrics();
            this.renderKnowledgeBase();

            // Interação inicial de áudio para desbloquear o Web Audio API
            document.body.addEventListener('click', () => {
                if (window.cyberAudio) window.cyberAudio.ensureContext();
            }, { once: true });
        },

        // Roteamento SPA das Abas
        navigateTo(viewId) {
            this.currentView = viewId;
            window.cyberAudio.playClick();

            // Atualiza botões da Sidebar
            document.querySelectorAll('.nav-link').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
            });

            // Alterna seções de conteúdo
            document.querySelectorAll('.view-section').forEach(sec => {
                sec.classList.toggle('active', sec.id === `view-${viewId}`);
            });

            // Se for para o Gameplay, re-renderiza o mapa para garantir medidas corretas
            if (viewId === 'game') {
                setTimeout(() => {
                    if (window.smartHomeMap) {
                        window.smartHomeMap.initCanvas();
                        window.smartHomeMap.renderMap();
                    }
                }, 100);
            } else if (viewId === 'achievements') {
                this.renderAchievements();
            } else if (viewId === 'progress') {
                this.renderProgressMetrics();
            }
        },

        bindNavigation() {
            document.querySelectorAll('.nav-link').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = btn.getAttribute('data-view');
                    this.navigateTo(view);
                });
            });
        },

        bindHomeActions() {
            const btnPlay = document.getElementById('btn-hero-play');
            if (btnPlay) {
                btnPlay.addEventListener('click', () => this.navigateTo('game'));
            }

            const btnHowTo = document.getElementById('btn-hero-howto');
            if (btnHowTo) {
                btnHowTo.addEventListener('click', () => this.navigateTo('howto'));
            }

            // Quick device markers no hero
            document.querySelectorAll('.hero-device-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    this.navigateTo('game');
                    const devId = pill.getAttribute('data-target-dev');
                    if (devId) {
                        setTimeout(() => {
                            if (window.modalInspector) window.modalInspector.open(devId);
                        }, 250);
                    }
                });
            });
        },

        hydrateIcons() {
            if (!window.CyberIcons) return;
            document.querySelectorAll('[data-icon]').forEach(el => {
                const iconName = el.getAttribute('data-icon');
                if (window.CyberIcons[iconName]) {
                    el.innerHTML = window.CyberIcons[iconName];
                }
            });
        },

        bindTopbarActions() {
            // Mute / Unmute
            const btnSound = document.getElementById('btn-quick-sound');
            if (btnSound) {
                btnSound.innerHTML = CyberIcons.volume2;
                btnSound.addEventListener('click', () => {
                    const isEnabled = window.cyberAudio.toggleMute();
                    btnSound.innerHTML = isEnabled ? CyberIcons.volume2 : CyberIcons.volumeX;
                    btnSound.title = isEnabled ? 'Silenciar Áudio' : 'Ativar Áudio';
                    this.showToast(isEnabled ? 'Efeitos Sonoros Ativados' : 'Áudio Silenciado', 'info');
                });
            }

            // Tela Cheia (Fullscreen API)
            const btnFullscreen = document.getElementById('btn-quick-fullscreen');
            if (btnFullscreen) {
                btnFullscreen.innerHTML = CyberIcons.maximize;
                btnFullscreen.addEventListener('click', () => {
                    window.cyberAudio.playClick();
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => {});
                    } else {
                        if (document.exitFullscreen) document.exitFullscreen();
                    }
                });
            }

            // Seletor rápido de Nível no Gameplay
            const levelSelect = document.getElementById('topbar-level-select');
            if (levelSelect) {
                levelSelect.addEventListener('change', (e) => {
                    const chosenLevel = parseInt(e.target.value);
                    window.cyberAudio.playClick();
                    window.gameState.initLevel(chosenLevel);
                });
            }
        },

        bindRoomFilters() {
            document.querySelectorAll('.filter-room-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.cyberAudio.playClick();
                    document.querySelectorAll('.filter-room-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const room = btn.getAttribute('data-room');
                    if (window.smartHomeMap) {
                        window.smartHomeMap.setFilter(room);
                    }
                });
            });

            // Botão de Varredura de Rede
            const btnScan = document.getElementById('btn-scan-network');
            if (btnScan) {
                btnScan.addEventListener('click', () => {
                    if (window.smartHomeMap) {
                        window.smartHomeMap.triggerNetworkScan();
                    }
                });
            }
        },

        bindKnowledgeTabs() {
            document.querySelectorAll('.kb-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.cyberAudio.playClick();
                    document.querySelectorAll('.kb-tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.kb-tab-pane').forEach(p => p.classList.remove('active'));
                    btn.classList.add('active');
                    const target = btn.getAttribute('data-target');
                    const pane = document.getElementById(target);
                    if (pane) pane.classList.add('active');
                });
            });
        },

        bindSettings() {
            // Volume Slider
            const volSlider = document.getElementById('setting-volume-slider');
            if (volSlider) {
                volSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    window.cyberAudio.setVolume(val);
                });
            }

            // Efeitos Sonoros Toggle
            const soundToggle = document.getElementById('setting-sound-toggle');
            if (soundToggle) {
                soundToggle.addEventListener('change', (e) => {
                    if (window.cyberAudio.soundEnabled !== e.target.checked) {
                        window.cyberAudio.toggleMute();
                    }
                });
            }

            // Ambiência Cyber Drone Toggle
            const ambientToggle = document.getElementById('setting-ambient-toggle');
            if (ambientToggle) {
                ambientToggle.addEventListener('change', () => {
                    const isPlaying = window.cyberAudio.toggleAmbient();
                    this.showToast(isPlaying ? 'Ambiência Cyber Iniciada' : 'Ambiência Desativada', 'info');
                });
            }

            // Efeito Scanlines CRT
            const scanlineToggle = document.getElementById('setting-scanlines-toggle');
            if (scanlineToggle) {
                scanlineToggle.addEventListener('change', (e) => {
                    document.body.classList.toggle('scanlines-enabled', e.target.checked);
                });
            }

            // Reset de Progresso
            const btnReset = document.getElementById('btn-reset-progress');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    if (confirm('Atenção: Deseja realmente resetar todo o progresso, pontuação e conquistas?')) {
                        window.gameState.resetProgress();
                        this.showToast('Progresso Resetado com Sucesso', 'warning');
                        this.navigateTo('home');
                    }
                });
            }
        },

        bindGameStateUpdates() {
            window.gameState.subscribe((event, data) => {
                this.updateTopbar();

                if (event === 'achievement_unlocked') {
                    this.showAchievementBanner(data);
                } else if (event === 'level_completed') {
                    window.cyberAudio.playLevelComplete();
                    setTimeout(() => {
                        window.auditReport.open(
                            window.gameState.getCurrentLevelData(),
                            data.score,
                            data.history
                        );
                    }, 600);
                } else if (event === 'device_secured') {
                    this.showToast(`Nó [${data.deviceId}] blindado com sucesso!`, 'success');
                } else if (event === 'step_error') {
                    this.showToast('Ação incorreta! Perda de integridade detectada.', 'danger');
                }
            });
        },

        updateTopbar() {
            const sec = window.gameState.securityPct;
            const score = window.gameState.score;
            const level = window.gameState.currentLevel;
            const fixedCount = window.gameState.fixedDevices.length;
            const totalDevices = 7;

            // Nível no Topbar
            const levelBadge = document.getElementById('topbar-level-display');
            if (levelBadge) {
                levelBadge.textContent = `NÍVEL ${level}`;
            }

            const levelSelect = document.getElementById('topbar-level-select');
            if (levelSelect && levelSelect.value != level) {
                levelSelect.value = level;
            }

            // Dispositivos protegidos
            const nodesProgress = document.getElementById('topbar-nodes-progress');
            if (nodesProgress) {
                nodesProgress.textContent = `${fixedCount} / ${totalDevices} NÓS BLINDADOS`;
            }
            const nodesBar = document.getElementById('topbar-nodes-bar');
            if (nodesBar) {
                nodesBar.style.width = `${(fixedCount / totalDevices) * 100}%`;
            }

            // Segurança %
            const secDisplay = document.getElementById('topbar-security-val');
            if (secDisplay) {
                secDisplay.textContent = `${sec}%`;
            }
            const secGauge = document.getElementById('topbar-security-gauge');
            if (secGauge) {
                secGauge.style.width = `${sec}%`;
                // Atualiza cores dinamicamente
                if (sec < 40) {
                    secGauge.style.backgroundColor = '#ff3b5c';
                    secGauge.style.boxShadow = '0 0 10px rgba(255, 59, 92, 0.8)';
                } else if (sec < 80) {
                    secGauge.style.backgroundColor = '#00e5ff';
                    secGauge.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.8)';
                } else {
                    secGauge.style.backgroundColor = '#00e676';
                    secGauge.style.boxShadow = '0 0 12px rgba(0, 230, 118, 0.9)';
                }
            }

            // Pontuação
            const scoreDisplay = document.getElementById('topbar-score-display');
            if (scoreDisplay) {
                scoreDisplay.textContent = `${score} PTS`;
            }
        },

        renderAchievements() {
            const container = document.getElementById('achievements-grid');
            if (!container) return;

            const list = window.gameState.achievements;
            container.innerHTML = list.map(item => `
                <div class="achievement-card ${item.unlocked ? 'unlocked' : 'locked'}">
                    <div class="ach-icon-box">
                        <span class="ach-badge-tag">${item.badge}</span>
                        <div class="ach-glyph">${this.getAchievementGlyph(item.id)}</div>
                    </div>
                    <div class="ach-content">
                        <h4 class="ach-title">${item.title}</h4>
                        <p class="ach-desc">${item.desc}</p>
                        <div class="ach-status">
                            ${item.unlocked ? '<span class="status-unlocked">DESBLOQUEADO (+100 PTS)</span>' : '<span class="status-locked">BLOQUEADO</span>'}
                        </div>
                    </div>
                </div>
            `).join('');
        },

        getAchievementGlyph(id) {
            if (!window.CyberIcons) return '';
            const map = {
                first_defense: CyberIcons.shield,
                hunter_passwords: CyberIcons.key,
                master_segmentation: CyberIcons.network,
                mirai_destroyer: CyberIcons.alertTriangle,
                zero_trust_shield: CyberIcons.lock,
                firmware_detective: CyberIcons.cpu,
                armored_home: CyberIcons.zap,
                perfect_auditor: CyberIcons.award,
                protocol_master: CyberIcons.book,
                smart_home_guardian: CyberIcons.shieldCheck
            };
            return map[id] || CyberIcons.award;
        },

        showAchievementBanner(ach) {
            window.cyberAudio.playSuccess();
            const banner = document.createElement('div');
            banner.className = 'achievement-toast-banner';
            banner.innerHTML = `
                <div class="ach-toast-icon">${window.CyberIcons ? CyberIcons.award : ''}</div>
                <div>
                    <span class="ach-toast-sub">NOVA CONQUISTA DESBLOQUEADA</span>
                    <h4 class="ach-toast-title">${ach.title}</h4>
                    <p class="ach-toast-desc">${ach.desc}</p>
                </div>
            `;
            document.body.appendChild(banner);
            setTimeout(() => banner.classList.add('show'), 50);
            setTimeout(() => {
                banner.classList.remove('show');
                setTimeout(() => banner.remove(), 400);
            }, 4500);
        },

        renderProgressMetrics() {
            const container = document.getElementById('progress-dashboard-content');
            if (!container) return;

            const stats = window.gameState.stats;
            const history = window.gameState.levelAuditHistory;
            const totalFixed = stats.totalFixed;
            const totalErrors = stats.totalErrors;
            const accuracy = Math.max(0, Math.round(((totalFixed * 3) / ((totalFixed * 3) + totalErrors)) * 100)) || 100;
            const elapsedMins = Math.round((Date.now() - stats.startTime) / 60000);

            container.innerHTML = `
                <div class="stats-cards-overview">
                    <div class="stat-card">
                        <span class="stat-lbl">Total de Dispositivos Blindados</span>
                        <span class="stat-val text-green">${totalFixed}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-lbl">Tentativas Incorretas</span>
                        <span class="stat-val text-red">${totalErrors}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-lbl">Precisão de Resposta</span>
                        <span class="stat-val text-cyan">${accuracy}%</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-lbl">Tempo de Simulação</span>
                        <span class="stat-val">${elapsedMins} min</span>
                    </div>
                </div>

                <!-- Histórico de Intervenções -->
                <div class="audit-history-box">
                    <h3>HISTÓRICO DE AUDITORIA EM TEMPO REAL</h3>
                    ${history.length === 0 ? `
                        <p class="text-muted">Nenhuma intervenção registrada ainda. Vá para o menu <strong>Jogar</strong> e clique nos dispositivos com alerta para auditar!</p>
                    ` : `
                        <div class="table-responsive">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Nível</th>
                                        <th>Dispositivo</th>
                                        <th>Cômodo</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${history.map(h => `
                                        <tr>
                                            <td><small class="font-mono">${h.timestamp}</small></td>
                                            <td>Nível ${h.level}</td>
                                            <td><strong>${h.deviceName}</strong></td>
                                            <td>${h.room}</td>
                                            <td>
                                                <span class="report-status-tag ${h.status === 'Perfeito' ? 'tag-success' : 'tag-warning'}">
                                                    ${h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            `;
        },

        renderKnowledgeBase() {
            // Renderiza Protocolos
            const protoList = document.getElementById('kb-protocols-list');
            if (protoList) {
                protoList.innerHTML = GAME_DATA.knowledgeBase.protocols.map(p => `
                    <div class="kb-article-card" data-proto-name="${p.name}">
                        <div class="kb-card-head">
                            <span class="kb-tag">${p.tag}</span>
                            <span class="kb-port font-mono">${p.port}</span>
                        </div>
                        <h3>${p.name}</h3>
                        <div class="kb-detail-row"><strong>Arquitetura:</strong> ${p.architecture}</div>
                        <div class="kb-detail-row text-green"><strong>Vantagens:</strong> ${p.pros}</div>
                        <div class="kb-detail-row text-red"><strong>Vulnerabilidades / Riscos:</strong> ${p.cons}</div>
                        <div class="kb-best-practice-box">
                            <strong>🛡 Melhores Práticas de Segurança:</strong>
                            <p>${p.bestPractices}</p>
                        </div>
                    </div>
                `).join('');

                // Registra inspeção no GameState para a conquista
                protoList.querySelectorAll('.kb-article-card').forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        const name = card.getAttribute('data-proto-name');
                        if (name) window.gameState.registerGlossaryView(name);
                    });
                });
            }

            // Renderiza Ameaças
            const threatList = document.getElementById('kb-threats-list');
            if (threatList) {
                threatList.innerHTML = GAME_DATA.knowledgeBase.threats.map(t => `
                    <div class="kb-article-card">
                        <div class="kb-card-head">
                            <span class="kb-tag tag-danger">AMEAÇA CRÍTICA</span>
                        </div>
                        <h3>${t.title}</h3>
                        <div class="kb-detail-row"><strong>Vetor de Exploração:</strong> ${t.vector}</div>
                        <div class="kb-detail-row text-red"><strong>Impacto na Smart Home:</strong> ${t.impact}</div>
                        <div class="kb-best-practice-box">
                            <strong>🛡 Contramedida Recomendada:</strong>
                            <p>${t.defense}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Renderiza Boas Práticas
            const bpList = document.getElementById('kb-practices-list');
            if (bpList) {
                bpList.innerHTML = GAME_DATA.knowledgeBase.bestPractices.map(bp => `
                    <div class="kb-article-card">
                        <div class="kb-card-head">
                            <span class="kb-tag tag-success">PADRÃO SESI / SENAI</span>
                        </div>
                        <h3>${bp.title}</h3>
                        <div class="kb-detail-row"><strong>Regra de Ouro:</strong> ${bp.rule}</div>
                        <div class="kb-best-practice-box">
                            <strong>Detalhamento Técnico:</strong>
                            <p>${bp.details}</p>
                        </div>
                    </div>
                `).join('');
            }
        },

        // Mini SOC Live Feed
        startLiveSocFeed() {
            const feedContainer = document.getElementById('soc-live-stream-log');
            if (!feedContainer) return;

            const sampleEvents = [
                "Scan SYN detectado na porta 23 (Telnet) originado de IP externo.",
                "Dispositivo 192.168.1.135 requisitando IP via DHCP lease.",
                "Beacon Wi-Fi WPA2 transmitido com sinal de -45 dBm.",
                "Verificação periódica de integridade da cúpula holográfica executada.",
                "Pacote MQTT publicado no tópico 'home/sensor/temp' com QoS 0.",
                "Tentativa de conexão BLE no canal 37 sem autenticação.",
                "Sessão de inspeção iniciada no nó de controle do roteador."
            ];

            setInterval(() => {
                if (Math.random() > 0.4) {
                    const evt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
                    const time = new Date().toLocaleTimeString();
                    const line = document.createElement('div');
                    line.className = 'soc-feed-line';
                    line.innerHTML = `<span class="time">[${time}]</span> <span class="text">${evt}</span>`;
                    feedContainer.prepend(line);

                    // Mantém no máximo 15 eventos
                    while (feedContainer.children.length > 15) {
                        feedContainer.removeChild(feedContainer.lastChild);
                    }
                }
            }, 4500);
        },

        showToast(msg, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `cyber-toast toast-${type}`;
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 50);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }
    };

    // Inicialização
    App.init();
    window.CyberApp = App;
});
