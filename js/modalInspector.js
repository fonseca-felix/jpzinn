/**
 * Cyber Defense: Proteja sua Smart Home
 * Inspetor de Dispositivo, Laboratório Prático Drag & Drop e Fluxo em 3 Etapas
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class DeviceModalInspector {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.currentDevice = null;
        this.currentViewMode = 'lab';
        this.currentStep = 1;
        this.stepAnswered = { 1: false, 2: false, 3: false };
        this.stepSuccess = { 1: false, 2: false, 3: false };
        this.slottedModules = [];
        this.controlStates = {};

        this.initDOM();
    }

    initDOM() {
        if (!this.modal) return;
        const closeBtn = this.modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(deviceId) {
        this.currentDevice = window.gameState.getDevice(deviceId);
        if (!this.currentDevice) return;

        this.currentViewMode = 'lab';
        this.currentStep = 1;
        this.stepAnswered = { 1: false, 2: false, 3: false };
        this.stepSuccess = { 1: false, 2: false, 3: false };
        this.slottedModules = [];

        this.controlStates = {};
        if (this.currentDevice.interactiveControls) {
            this.currentDevice.interactiveControls.forEach(ctrl => {
                this.controlStates[ctrl.id] = ctrl.type === 'toggle' ? ctrl.state : 0;
            });
        }

        const isFixed = window.gameState.isDeviceFixed(deviceId);
        if (isFixed) {
            this.stepAnswered = { 1: true, 2: true, 3: true };
            this.stepSuccess = { 1: true, 2: true, 3: true };
            if (this.currentDevice.requiredModules) {
                this.slottedModules = [...this.currentDevice.requiredModules];
            }
        }

        this.render();
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        this.currentDevice = null;
    }

    render() {
        if (!this.modal || !this.currentDevice) return;
        const dev = this.currentDevice;
        const isFixed = window.gameState.isDeviceFixed(dev.id);

        const content = this.modal.querySelector('.modal-body-container');
        if (!content) return;

        content.innerHTML = `
        <!-- Cabeçalho do Dispositivo -->
        <div class="inspector-header">
            <div class="device-meta-group">
                <div class="device-icon-badge ${isFixed ? 'secured' : 'vulnerable'}">
                    <span class="icon">${this.getIconSvg(dev.icon)}</span>
                </div>
                <div>
                    <div class="device-status-badge ${isFixed ? 'badge-safe' : 'badge-danger'}">
                        ${isFixed ? 'DISPOSITIVO BLINDADO (SEGURO)' : 'AMEAÇA ATIVA / VULNERÁVEL'}
                    </div>
                    <h2 class="device-title">${dev.name}</h2>
                    <p class="device-subtitle">Localização: <strong>${dev.roomName}</strong> | Nível: <strong>Nível ${window.gameState.currentLevel}</strong></p>
                </div>
            </div>

            <!-- Dados Técnicos Rápidos -->
            <div class="device-specs-grid">
                <div class="spec-card">
                    <span class="spec-label">Endereço IP</span>
                    <span class="spec-val font-mono">${dev.ip}</span>
                </div>
                <div class="spec-card">
                    <span class="spec-label">Endereço MAC</span>
                    <span class="spec-val font-mono">${dev.mac}</span>
                </div>
                <div class="spec-card">
                    <span class="spec-label">Protocolo</span>
                    <span class="spec-val">${dev.protocol}</span>
                </div>
                <div class="spec-card">
                    <span class="spec-label">Firmware</span>
                    <span class="spec-val font-mono">${dev.firmware}</span>
                </div>
            </div>
        </div>

        <!-- Terminal de Inspeção de Logs SOC -->
        <div class="soc-terminal-wrapper">
            <div class="terminal-bar">
                <div class="terminal-dots">
                    <span class="dot dot-red"></span>
                    <span class="dot dot-yellow"></span>
                    <span class="dot dot-green"></span>
                </div>
                <span class="terminal-title">SOC RAW LOG CONSOLE // CAPTURA DE PACOTES EM TEMPO REAL</span>
                <span class="terminal-tag">LIVE_STREAM</span>
            </div>
            <div class="terminal-body font-mono" id="inspector-log-body">
                ${dev.consoleLogs.map(line => `<div class="log-line">${this.colorizeLog(line)}</div>`).join('')}
            </div>
        </div>

        <!-- Abas de Modo -->
        <div class="inspector-nav-tabs">
            <button class="modal-tab-btn ${this.currentViewMode === 'lab' ? 'active' : ''}" id="tab-btn-lab">
                ${CyberIcons.sliders} HARDENING & DRAG & DROP
            </button>
            <button class="modal-tab-btn ${this.currentViewMode === 'quiz' ? 'active' : ''}" id="tab-btn-quiz">
                ${CyberIcons.shield} DIAGNÓSTICO TÉCNICO (3 ETAPAS)
            </button>
        </div>

        <!-- Conteúdo da Aba Selecionada -->
        <div class="tab-mode-content">
            ${isFixed ? this.renderSecuredSummary(dev) : (
                this.currentViewMode === 'lab' ? this.renderInteractiveLab(dev) : this.renderGuidedQuiz(dev)
            )}
        </div>
        `;

        this.bindEvents();
    }

    renderInteractiveLab(dev) {
        const allModules = GAME_DATA.defenseModules || [];
        const required = dev.requiredModules || ["mod_pw", "mod_firewall"];
        const controls = dev.interactiveControls || [];

        return `
        <!-- Seção de Drag & Drop -->
        <div class="dnd-section-container">
            <div class="dnd-header-title">
                ${CyberIcons.shield} MÓDULOS DE DEFESA // ARRASTE PARA OS SLOTS DE PROTEÇÃO
            </div>
            <p class="dnd-desc">
                Arraste os módulos de mitigação corretos da coluna da esquerda para os <strong>Slots de Defesa</strong> do dispositivo, ou clique sobre o módulo para equipar.
            </p>

            <div class="dnd-arena-split">
                <!-- Módulos Disponíveis -->
                <div class="dnd-col">
                    <div class="dnd-col-title">
                        <span>MÓDULOS DISPONÍVEIS NO ARSENAL</span>
                        <span class="text-cyan font-mono">${allModules.filter(m => !this.slottedModules.includes(m.id)).length}</span>
                    </div>
                    <div class="modules-pool" id="modules-available-pool">
                        ${allModules.filter(m => !this.slottedModules.includes(m.id)).map(m => `
                            <div class="draggable-module" draggable="true" data-module-id="${m.id}">
                                <span class="module-icon">${this.getIconSvg(m.icon)}</span>
                                <div class="module-info">
                                    <div class="module-name">${m.name}</div>
                                    <div class="module-desc">${m.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Slots de Defesa -->
                <div class="dnd-col">
                    <div class="dnd-col-title">
                        <span>SLOTS DE BLINDAGEM DO DISPOSITIVO</span>
                        <span class="text-green font-mono">${this.slottedModules.length} / ${required.length}</span>
                    </div>
                    <div class="defense-slots-container" id="defense-slots-container">
                        ${required.map((reqId, idx) => {
                            const slottedId = this.slottedModules[idx];
                            const slottedMod = allModules.find(m => m.id === slottedId);
                            if (slottedMod) {
                                return `
                                <div class="defense-slot occupied" data-slot-index="${idx}">
                                    <div class="draggable-module" data-module-id="${slottedMod.id}">
                                        <span class="module-icon">${this.getIconSvg(slottedMod.icon)}</span>
                                        <div class="module-info">
                                            <div class="module-name">${slottedMod.name}</div>
                                            <div class="module-desc text-green">Módulo Instalado</div>
                                        </div>
                                        <button class="cyber-btn cyber-btn-ghost btn-remove-module" data-module-id="${slottedMod.id}" style="padding:4px 8px;font-size:0.75rem;">✕</button>
                                    </div>
                                </div>
                                `;
                            } else {
                                return `
                                <div class="defense-slot" data-slot-index="${idx}">
                                    <span class="slot-placeholder">ENCAIXE O MÓDULO DE DEFESA AQUI (SLOT ${idx + 1})</span>
                                </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Controles de Hardening -->
        ${controls.length > 0 ? `
        <div class="interactive-controls-card">
            <div class="dnd-header-title">
                ${CyberIcons.sliders} CONTROLES DE HARDENING // CONFIGURAÇÃO MANUAL
            </div>
            <p class="dnd-desc">Ajuste os parâmetros de portas, serviços e protocolos nos interruptores abaixo:</p>
            <div class="controls-grid">
                ${controls.map(ctrl => `
                    <div class="control-item">
                        <span class="control-label">${ctrl.label}</span>
                        ${ctrl.type === 'toggle' ? `
                            <label class="cyber-switch">
                                <input type="checkbox" class="interactive-toggle-input" data-ctrl-id="${ctrl.id}" ${this.controlStates[ctrl.id] ? 'checked' : ''}>
                                <span class="switch-slider"></span>
                            </label>
                        ` : `
                            <select class="cyber-select-inline interactive-select-input" data-ctrl-id="${ctrl.id}">
                                ${ctrl.options.map((opt, oIdx) => `
                                    <option value="${oIdx}" ${this.controlStates[ctrl.id] === oIdx ? 'selected' : ''}>${opt}</option>
                                `).join('')}
                            </select>
                        `}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Terminal Interativo com Comandos Rápidos -->
        <div class="terminal-command-deck">
            <div class="command-deck-title">EXECUÇÃO DE COMANDOS TÉCNICOS VIA TERMINAL (CLIQUE PARA DISPARAR):</div>
            <div class="quick-commands-row">
                <button class="cmd-pill-btn" data-cmd="ufw default deny incoming && ufw reload"># ufw default deny incoming</button>
                <button class="cmd-pill-btn" data-cmd="systemctl stop telnet && systemctl disable telnet"># systemctl disable telnet</button>
                <button class="cmd-pill-btn" data-cmd="vlan-mgr --create 30 --isolate-iot"># vlan-mgr --isolate-iot</button>
                <button class="cmd-pill-btn" data-cmd="passwd-vault --enforce-mfa --min-len 16"># passwd-vault --enforce-mfa</button>
            </div>
        </div>

        <!-- Botão de Testar Ataque -->
        <div class="attack-simulation-box">
            <div class="attack-sim-info">
                <h4>VERIFICAÇÃO DE RESILIÊNCIA CONTRA ATAQUE</h4>
                <p>Dispare uma simulação de invasão do hacker para validar se as defesas implementadas suportam o vetor de ataque.</p>
                <div class="attack-result-badge" id="attack-result-badge"></div>
            </div>
            <button class="cyber-btn cyber-btn-primary" id="btn-run-attack-test">
                ${CyberIcons.zap} DISPARAR TESTE DE ATAQUE
            </button>
        </div>
        `;
    }

    renderGuidedQuiz(dev) {
        let stepData;
        let stepTitle;
        let stepPrompt;

        if (this.currentStep === 1) {
            stepData = dev.step1;
            stepTitle = "ETAPA 1: ANÁLISE DE VULNERABILIDADE TÉCNICA";
            stepPrompt = "Inspecione os logs e parâmetros de rede acima para determinar a falha:";
        } else if (this.currentStep === 2) {
            stepData = dev.step2;
            stepTitle = "ETAPA 2: RECONHECIMENTO DE VETOR DE AMEAÇA";
            stepPrompt = "Considerando a falha confirmada, qual ataque pode ser explorado por invasores?";
        } else {
            stepData = dev.step3;
            stepTitle = "ETAPA 3: APLICAÇÃO DE MEDIDA TÉCNICA DE MITIGAÇÃO";
            stepPrompt = "Selecione o controle de segurança defensivo adequado para blindar o dispositivo:";
        }

        const isAnswered = this.stepAnswered[this.currentStep];
        const isSuccess = this.stepSuccess[this.currentStep];

        return `
        <div class="steps-stepper">
            <div class="step-item ${this.currentStep === 1 ? 'active' : ''} ${this.stepSuccess[1] ? 'completed' : ''}" data-step="1">
                <div class="step-num">${this.stepSuccess[1] ? 'OK' : '1'}</div>
                <div class="step-info">
                    <span class="step-heading">Etapa 1</span>
                    <span class="step-desc">Identificar Vulnerabilidade</span>
                </div>
            </div>
            <div class="step-line ${this.stepSuccess[1] ? 'filled' : ''}"></div>
            <div class="step-item ${this.currentStep === 2 ? 'active' : ''} ${this.stepSuccess[2] ? 'completed' : ''}" data-step="2">
                <div class="step-num">${this.stepSuccess[2] ? 'OK' : '2'}</div>
                <div class="step-info">
                    <span class="step-heading">Etapa 2</span>
                    <span class="step-desc">Reconhecer Ameaça</span>
                </div>
            </div>
            <div class="step-line ${this.stepSuccess[2] ? 'filled' : ''}"></div>
            <div class="step-item ${this.currentStep === 3 ? 'active' : ''} ${this.stepSuccess[3] ? 'completed' : ''}" data-step="3">
                <div class="step-num">${this.stepSuccess[3] ? 'OK' : '3'}</div>
                <div class="step-info">
                    <span class="step-heading">Etapa 3</span>
                    <span class="step-desc">Selecionar Medida de Proteção</span>
                </div>
            </div>
        </div>

        <div class="step-action-card">
            <div class="step-prompt-header">
                <span class="step-badge-tag">${stepTitle}</span>
                <h3 class="step-question-text">${stepData.question}</h3>
                <p class="step-instructions">${stepPrompt}</p>
            </div>

            <div class="options-container">
                ${stepData.options.map((opt, idx) => {
                    let stateClass = '';
                    if (isAnswered) {
                        if (idx === stepData.correctIndex) {
                            stateClass = 'option-correct';
                        } else if (!isSuccess && this.lastChosenIndex === idx) {
                            stateClass = 'option-wrong';
                        }
                    }
                    return `
                    <button class="cyber-option-btn ${stateClass}" data-idx="${idx}" ${isAnswered && isSuccess ? 'disabled' : ''}>
                        <span class="opt-key">${String.fromCharCode(65 + idx)}</span>
                        <span class="opt-label">${opt}</span>
                        <span class="opt-feedback-icon">${idx === stepData.correctIndex && isAnswered ? 'OK' : ''}</span>
                    </button>
                    `;
                }).join('')}
            </div>

            <div id="step-feedback-box" class="step-feedback-box ${isAnswered ? 'show' : ''} ${isSuccess ? 'feedback-success' : 'feedback-error'}">
                ${isAnswered ? this.renderFeedbackMessage(stepData, isSuccess) : ''}
            </div>
        </div>
        `;
    }

    renderFeedbackMessage(stepData, isSuccess) {
        if (isSuccess) {
            return `
            <div class="feedback-inner">
                <div class="feedback-title-row">
                    <span class="feedback-badge-success">RESPOSTA CORRETA (+50 PONTOS)</span>
                    <span class="feedback-status-tech">Validação Criptográfica OK</span>
                </div>
                <p class="feedback-desc">${stepData.explanation}</p>
                <div class="feedback-curriculum-tip">
                    <strong>Dica Técnica SESI/SENAI:</strong> ${this.currentDevice.technicalBriefing}
                </div>
                <div class="feedback-action-row">
                    ${this.currentStep < 3 ? `
                        <button class="cyber-btn cyber-btn-primary" id="btn-next-step">
                            AVANÇAR PARA ETAPA ${this.currentStep + 1}
                        </button>
                    ` : `
                        <button class="cyber-btn cyber-btn-success" id="btn-finish-device">
                            FINALIZAR MITIGAÇÃO DO DISPOSITIVO
                        </button>
                    `}
                </div>
            </div>
            `;
        } else {
            return `
            <div class="feedback-inner">
                <div class="feedback-title-row">
                    <span class="feedback-badge-error">RESPOSTA INCORRETA (-3% INTEGRIDADE)</span>
                    <span class="feedback-status-tech">Falha na Mitigação</span>
                </div>
                <p class="feedback-desc">A opção escolhida não corresponde à causa-raiz ou à melhor prática de defesa.</p>
                <div class="feedback-hint">
                    <strong>Dica do SOC:</strong> Releia atentamente o log do terminal buscando portas abertas, protocolos desprotegidos ou credenciais padrão.
                </div>
                <div class="feedback-action-row">
                    <button class="cyber-btn cyber-btn-danger" id="btn-retry-step">
                        TENTAR NOVAMENTE
                    </button>
                </div>
            </div>
            `;
        }
    }

    renderSecuredSummary(dev) {
        return `
        <div class="device-secured-full">
            <div class="shield-anim-icon">${CyberIcons.shieldCheck}</div>
            <h3>DISPOSITIVO TOTALMENTE BLINDADO & SEGURO</h3>
            <p>Todas as defesas e hardening foram aplicados com sucesso neste nó da residência inteligente.</p>
            
            <div class="summary-cards-grid">
                <div class="summary-card">
                    <span class="sc-title">Vulnerabilidade Mitigada</span>
                    <p class="sc-val">${dev.step1.options[dev.step1.correctIndex]}</p>
                </div>
                <div class="summary-card">
                    <span class="sc-title">Ameaça Neutralizada</span>
                    <p class="sc-val">${dev.step2.options[dev.step2.correctIndex]}</p>
                </div>
                <div class="summary-card">
                    <span class="sc-title">Medida de Proteção Ativa</span>
                    <p class="sc-val">${dev.step3.options[dev.step3.correctIndex]}</p>
                </div>
            </div>

            <div class="technical-dossier-box">
                <h4>Dossiê Técnico SESI/SENAI:</h4>
                <p>${dev.technicalBriefing}</p>
            </div>

            <div class="action-footer">
                <button class="cyber-btn cyber-btn-primary" id="btn-close-secured">
                    VOLTAR À PLANTA DA CASA
                </button>
            </div>
        </div>
        `;
    }

    bindEvents() {
        const btnLab = this.modal.querySelector('#tab-btn-lab');
        const btnQuiz = this.modal.querySelector('#tab-btn-quiz');

        if (btnLab) {
            btnLab.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.currentViewMode = 'lab';
                this.render();
            });
        }
        if (btnQuiz) {
            btnQuiz.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.currentViewMode = 'quiz';
                this.render();
            });
        }

        const draggables = this.modal.querySelectorAll('.draggable-module');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                const modId = draggable.getAttribute('data-module-id');
                e.dataTransfer.setData('text/plain', modId);
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });

            draggable.addEventListener('click', () => {
                const modId = draggable.getAttribute('data-module-id');
                const req = this.currentDevice.requiredModules || ["mod_pw", "mod_firewall"];
                if (this.slottedModules.length < req.length && !this.slottedModules.includes(modId)) {
                    this.slottedModules.push(modId);
                    window.cyberAudio.playClick();
                    this.appendLogLine(`[KERNEL_SEC] Module '${modId}' mounted into device bus slot #${this.slottedModules.length}`);
                    this.render();
                }
            });
        });

        const slots = this.modal.querySelectorAll('.defense-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('slot-dragover');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('slot-dragover');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('slot-dragover');
                const modId = e.dataTransfer.getData('text/plain');
                if (modId && !this.slottedModules.includes(modId)) {
                    const slotIdx = parseInt(slot.getAttribute('data-slot-index'));
                    this.slottedModules[slotIdx] = modId;
                    window.cyberAudio.playClick();
                    this.appendLogLine(`[KERNEL_SEC] Module '${modId}' dropped and activated on slot #${slotIdx + 1}`);
                    this.render();
                }
            });
        });

        const removeBtns = this.modal.querySelectorAll('.btn-remove-module');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const modId = btn.getAttribute('data-module-id');
                this.slottedModules = this.slottedModules.filter(id => id !== modId);
                window.cyberAudio.playClick();
                this.render();
            });
        });

        const toggleInputs = this.modal.querySelectorAll('.interactive-toggle-input');
        toggleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const ctrlId = input.getAttribute('data-ctrl-id');
                this.controlStates[ctrlId] = e.target.checked;
                window.cyberAudio.playClick();
                this.appendLogLine(`[CONFIG_CHANGE] Parameter '${ctrlId}' toggled to: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
            });
        });

        const selectInputs = this.modal.querySelectorAll('.interactive-select-input');
        selectInputs.forEach(select => {
            select.addEventListener('change', (e) => {
                const ctrlId = select.getAttribute('data-ctrl-id');
                this.controlStates[ctrlId] = parseInt(e.target.value);
                window.cyberAudio.playClick();
                this.appendLogLine(`[CONFIG_CHANGE] Parameter '${ctrlId}' set to option index #${e.target.value}`);
            });
        });

        const cmdBtns = this.modal.querySelectorAll('.cmd-pill-btn');
        cmdBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                window.cyberAudio.playClick();
                this.appendLogLine(`[ROOT@SHELL]# ${cmd}`);
                setTimeout(() => {
                    this.appendLogLine(`[EXEC_OK] Rule successfully applied. Firewall chain updated.`);
                }, 150);
            });
        });

        const btnAttack = this.modal.querySelector('#btn-run-attack-test');
        if (btnAttack) {
            btnAttack.addEventListener('click', () => {
                this.runAttackSimulation();
            });
        }

        const optionBtns = this.modal.querySelectorAll('.cyber-option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosenIdx = parseInt(btn.getAttribute('data-idx'));
                this.handleOptionChosen(chosenIdx);
            });
        });

        const nextBtn = this.modal.querySelector('#btn-next-step');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.currentStep++;
                this.render();
            });
        }

        const finishBtn = this.modal.querySelector('#btn-finish-device');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                window.cyberAudio.playShield();
                this.close();
            });
        }

        const retryBtn = this.modal.querySelector('#btn-retry-step');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.stepAnswered[this.currentStep] = false;
                this.render();
            });
        }

        const closeSecuredBtn = this.modal.querySelector('#btn-close-secured');
        if (closeSecuredBtn) {
            closeSecuredBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.close();
            });
        }
    }

    runAttackSimulation() {
        const dev = this.currentDevice;
        const required = dev.requiredModules || ["mod_pw", "mod_firewall"];
        const controls = dev.interactiveControls || [];
        const badge = this.modal.querySelector('#attack-result-badge');

        this.appendLogLine(`[ATTACK_SIM] Hacker initiated exploitation on ${dev.ip}...`);

        const hasAllModules = required.every(reqId => this.slottedModules.includes(reqId));
        
        let controlsOk = true;
        controls.forEach(ctrl => {
            if (this.controlStates[ctrl.id] !== ctrl.correct) {
                controlsOk = false;
            }
        });

        setTimeout(() => {
            if (hasAllModules || controlsOk) {
                window.cyberAudio.playShield();
                window.cyberAudio.playSuccess();
                this.appendLogLine(`[DEFENSE_SHIELD] INTRUSION BLOCKED! Exploit payload deflected by security layer.`);
                this.appendLogLine(`[INTEGRITY_OK] Device hardened successfully. Status: SECURE.`);

                if (badge) {
                    badge.className = 'attack-result-badge success';
                    badge.textContent = 'ATAQUE DO HACKER BLOQUEADO COM SUCESSO! DISPOSITIVO BLINDADO.';
                }

                window.gameState.recordStepSuccess(dev.id, 1, 50);
                window.gameState.recordStepSuccess(dev.id, 2, 50);
                window.gameState.recordStepSuccess(dev.id, 3, 100);

                setTimeout(() => {
                    this.render();
                }, 1200);

            } else {
                window.cyberAudio.playError();
                this.triggerScreenGlitch();
                this.appendLogLine(`[SECURITY_BREACH] EXPLOIT SUCCEEDED! Defense incomplete. Check modules and switches.`);

                if (badge) {
                    badge.className = 'attack-result-badge fail';
                    badge.textContent = 'FALHA NA DEFESA: Faltam módulos essenciais ou chaves de hardening desativadas.';
                }

                window.gameState.recordStepError(dev.id, 1);
            }
        }, 600);
    }

    appendLogLine(text) {
        const body = this.modal.querySelector('#inspector-log-body');
        if (body) {
            const line = document.createElement('div');
            line.className = 'log-line';
            line.innerHTML = this.colorizeLog(text);
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;
        }
    }

    handleOptionChosen(idx) {
        if (this.stepAnswered[this.currentStep] && this.stepSuccess[this.currentStep]) return;

        this.lastChosenIndex = idx;
        const dev = this.currentDevice;
        let stepData = this.currentStep === 1 ? dev.step1 : (this.currentStep === 2 ? dev.step2 : dev.step3);

        const isCorrect = (idx === stepData.correctIndex);
        this.stepAnswered[this.currentStep] = true;
        this.stepSuccess[this.currentStep] = isCorrect;

        if (isCorrect) {
            window.cyberAudio.playSuccess();
            window.gameState.recordStepSuccess(dev.id, this.currentStep, 50);
        } else {
            window.cyberAudio.playError();
            this.triggerScreenGlitch();
            window.gameState.recordStepError(dev.id, this.currentStep);
        }

        this.render();
    }

    triggerScreenGlitch() {
        document.body.classList.add('intrusion-glitch-active');
        setTimeout(() => {
            document.body.classList.remove('intrusion-glitch-active');
        }, 500);
    }

    colorizeLog(line) {
        return line
            .replace(/(\[.*?\])/g, '<span class="log-tag">$1</span>')
            .replace(/(OK|Successful|OPEN|CLOSED|ENABLED|BLOCKED|SECURE)/g, '<span class="log-highlight-green">$1</span>')
            .replace(/(WARNING|ALERT|INSECURE|DANGER|FAIL|DISABLED|CRITICAL|BREACH)/g, '<span class="log-highlight-red">$1</span>')
            .replace(/(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/g, '<span class="log-ip">$1</span>')
            .replace(/(port \d+)/gi, '<span class="log-port">$1</span>');
    }

    getIconSvg(iconType) {
        if (window.CyberIcons && window.CyberIcons[iconType]) {
            return window.CyberIcons[iconType];
        }
        return window.CyberIcons ? window.CyberIcons.shield : '';
    }
}

window.DeviceModalInspector = DeviceModalInspector;
