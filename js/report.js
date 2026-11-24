/**
 * Cyber Defense: Proteja sua Smart Home
 * Gerador de Relatório Técnico de Pentest / Auditoria Cibernética
 * SESI/SENAI - Técnico em Desenvolvimento de Sistemas
 */

class AuditReportManager {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.initDOM();
    }

    initDOM() {
        if (!this.modal) return;
        const closeBtn = this.modal.querySelector('.report-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Fechar ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open(levelData, score, auditHistory) {
        if (!this.modal) return;
        this.render(levelData, score, auditHistory);
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    render(levelData, score, auditHistory) {
        const container = this.modal.querySelector('.report-modal-content');
        if (!container) return;

        const totalErrors = window.gameState.stats.totalErrors;
        const totalFixed = auditHistory.length;
        const accuracyPct = Math.max(0, Math.round(((totalFixed * 3) / ((totalFixed * 3) + totalErrors)) * 100)) || 100;

        // Classificação do Auditor
        let badgeTitle, badgeClass, badgeDesc;
        if (accuracyPct >= 90) {
            badgeTitle = "ESPECIALISTA CYBER IOT";
            badgeClass = "rank-elite";
            badgeDesc = "Desempenho exemplar! Todas as vulnerabilidades críticas foram mitigadas com máxima precisão e conformidade técnica.";
        } else if (accuracyPct >= 75) {
            badgeTitle = "ANALISTA DE SEGURANÇA PLENO";
            badgeClass = "rank-pro";
            badgeDesc = "Excelente capacidade analítica. A rede Smart Home foi protegida com sucesso contra ataques externos.";
        } else if (accuracyPct >= 50) {
            badgeTitle = "ANALISTA DE SEGURANÇA JÚNIOR";
            badgeClass = "rank-junior";
            badgeDesc = "Objetivos alcançados, com algumas falhas no reconhecimento de vetores que foram contornadas.";
        } else {
            badgeTitle = "RECRUTA EM TREINAMENTO";
            badgeClass = "rank-rookie";
            badgeDesc = "A residência sofreu tentativas de invasão durante a auditoria. Recomenda-se revisão dos conceitos no Glossário.";
        }

        const dateStr = new Date().toLocaleDateString('pt-BR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const nextLevelNum = window.gameState.currentLevel < 3 ? window.gameState.currentLevel + 1 : null;

        container.innerHTML = `
        <div class="report-printable-area" id="audit-printable-doc">
            <!-- Cabeçalho Oficial do Relatório de Auditoria -->
            <div class="report-header">
                <div class="report-brand">
                    <div class="report-logo">CYBER DEFENSE</div>
                    <div class="report-sub">SESI / SENAI — LABORATÓRIO DE CIBERSEGURANÇA EM IOT</div>
                </div>
                <div class="report-doc-info">
                    <div><strong>DOCUMENTO:</strong> REL-PENTEST-IOT-${Date.now().toString().slice(-6)}</div>
                    <div><strong>CLASSIFICAÇÃO:</strong> CONFIDENCIAL / TÉCNICO</div>
                    <div><strong>DATA:</strong> ${dateStr}</div>
                </div>
            </div>

            <!-- Título do Relatório -->
            <div class="report-title-banner">
                <h2>RELATÓRIO DE AUDITORIA E BLINDAGEM DE SMART HOME</h2>
                <p>Análise de Postura de Segurança, Vetores de Exploração e Contramedidas em Dispositivos Conectados</p>
            </div>

            <!-- Quadro de Métricas Executivas -->
            <div class="report-kpi-grid">
                <div class="report-kpi-card">
                    <span class="kpi-label">PONTUAÇÃO TOTAL</span>
                    <span class="kpi-value text-cyan">${score} PTS</span>
                    <span class="kpi-sub">Bônus por Nível Aplicado</span>
                </div>
                <div class="report-kpi-card">
                    <span class="kpi-label">DISPOSITIVOS BLINDADOS</span>
                    <span class="kpi-value text-green">${totalFixed} / 7</span>
                    <span class="kpi-sub">100% de Cobertura de Nós</span>
                </div>
                <div class="report-kpi-card">
                    <span class="kpi-label">PRECISÃO DE DEFESA</span>
                    <span class="kpi-value text-cyan">${accuracyPct}%</span>
                    <span class="kpi-sub">${totalErrors} Falhas Registradas</span>
                </div>
                <div class="report-kpi-card">
                    <span class="kpi-label">STATUS DA CÚPULA</span>
                    <span class="kpi-value text-green">100% ATIVA</span>
                    <span class="kpi-sub">Perímetro Holográfico Seguro</span>
                </div>
            </div>

            <!-- Classificação e Selo do Auditor -->
            <div class="report-rank-box ${badgeClass}">
                <div class="rank-seal">${window.CyberIcons ? CyberIcons.award : ''}</div>
                <div class="rank-details">
                    <span class="rank-tag">CLASSIFICAÇÃO TÉCNICA ATRIBUÍDA:</span>
                    <h3 class="rank-name">${badgeTitle}</h3>
                    <p class="rank-desc">${badgeDesc}</p>
                </div>
            </div>

            <!-- Tabela Detalhada de Dispositivos Auditados -->
            <div class="report-section-table">
                <h3>DISPOSITIVOS AUDITADOS & MITIGAÇÕES IMPLEMENTADAS</h3>
                <div class="table-responsive">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Dispositivo & Cômodo</th>
                                <th>Vulnerabilidade Identificada</th>
                                <th>Ameaça Neutralizada</th>
                                <th>Medida de Proteção Aplicada</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${auditHistory.map(item => `
                                <tr>
                                    <td>
                                        <strong>${item.deviceName}</strong><br>
                                        <small class="text-muted">${item.room}</small>
                                    </td>
                                    <td>${item.vulnerability}</td>
                                    <td>${item.threat}</td>
                                    <td>${item.mitigation}</td>
                                    <td>
                                        <span class="report-status-tag ${item.status === 'Perfeito' ? 'tag-success' : 'tag-warning'}">
                                            ${item.status === 'Perfeito' ? 'Conforme' : 'Com Alertas'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recomendações Normativas (NIST / OWASP / CIS Controls) -->
            <div class="report-recommendations-box">
                <h4>RECOMENDAÇÕES TÉCNICAS E NORMATIVAS (SESI/SENAI):</h4>
                <ul>
                    <li><strong>Segmentação de Rede (CIS Control 12):</strong> Manter dispositivos IoT permanentemente isolados em VLAN exclusiva, sem roteamento bidirecional para computadores pessoais.</li>
                    <li><strong>Gestão de Identidade e Acesso (NIST SP 800-63):</strong> Erradicar credenciais padrão de fábrica, forçando alteração no primeiro boot e exigindo autenticação em múltiplos fatores (MFA).</li>
                    <li><strong>Criptografia de Transporte e Mensageria (RFC 8446 / MQTT v5):</strong> Bloquear tráfego em texto claro na camada de transporte (proibir HTTP e Telnet), adotando TLS 1.3 e MQTTS com mTLS.</li>
                    <li><strong>Resiliência de Firmware (NIST SP 800-193):</strong> Exigir Secure Boot e validação de assinatura digital (ECDSA/RSA) antes de qualquer aplicação de patch via OTA.</li>
                </ul>
            </div>

            <!-- Assinatura Digital do Auditor -->
            <div class="report-signature-block">
                <div class="sig-line">
                    <span>Assinatura Digital do Auditor: <strong>TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS</strong></span>
                    <span class="sig-hash font-mono">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                </div>
            </div>
        </div>

        <!-- Ações do Relatório (Não impressas) -->
        <div class="report-actions-bar no-print">
            <button class="cyber-btn cyber-btn-secondary" id="btn-print-report">
                ${window.CyberIcons ? CyberIcons.printer : ''} EXPORTAR / IMPRIMIR RELATÓRIO PDF
            </button>
            ${nextLevelNum ? `
                <button class="cyber-btn cyber-btn-primary" id="btn-next-level">
                    AVANÇAR PARA O NÍVEL ${nextLevelNum} ▶
                </button>
            ` : `
                <button class="cyber-btn cyber-btn-success" id="btn-restart-sim">
                    ↺ JOGAR NOVAMENTE / REINICIAR SIMULAÇÃO
                </button>
            `}
            <button class="cyber-btn cyber-btn-ghost" id="btn-close-report-view">
                FECHAR
            </button>
        </div>
        `;

        this.bindReportEvents(nextLevelNum);
    }

    bindReportEvents(nextLevelNum) {
        // Imprimir / Exportar PDF
        const printBtn = this.modal.querySelector('#btn-print-report');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                window.print();
            });
        }

        // Avançar para próximo nível
        const nextLevelBtn = this.modal.querySelector('#btn-next-level');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.close();
                window.gameState.initLevel(nextLevelNum);
            });
        }

        // Reiniciar simulação
        const restartBtn = this.modal.querySelector('#btn-restart-sim');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.close();
                window.gameState.initLevel(1);
            });
        }

        // Fechar visualização
        const closeBtn = this.modal.querySelector('#btn-close-report-view');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.cyberAudio.playClick();
                this.close();
            });
        }
    }
}

window.AuditReportManager = AuditReportManager;
