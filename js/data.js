/**
 * Cyber Defense: Proteja sua Smart Home
 * Base de Dados Educacional IoT e Cibersegurança
 * Padrão Curricular: Técnico em Desenvolvimento de Sistemas (SESI/SENAI)
 */

const GAME_DATA = {
    levels: [
        {
            id: 1,
            title: "Nível 1: Casa Conectada & Credenciais",
            subtitle: "Higiene Básica de Cibersegurança & Configurações de Fábrica",
            badge: "Iniciante",
            description: "Você foi designado pelo SOC do SENAI para realizar uma auditoria preliminar em uma residência inteligente recém-instalada. Dispositivos foram plugados diretamente na rede sem alterações nas credenciais de fábrica e com portas administrativas expostas.",
            targetScore: 700,
            initialSecurity: 20
        },
        {
            id: 2,
            title: "Nível 2: Rede & Automação",
            subtitle: "Segmentação de Rede, Protocolos IoT & Criptografia",
            badge: "Intermediário",
            description: "A casa possui automação avançada com sensores e lâmpadas comunicando-se via MQTT e Wi-Fi. No entanto, toda a rede é plana (flat network), tráfegos críticos trafegam em texto claro e o broker de mensagens está sem autenticação.",
            targetScore: 1050,
            initialSecurity: 15
        },
        {
            id: 3,
            title: "Nível 3: Ataque Ativo & Resposta a Incidentes",
            subtitle: "Botnet Mirai, Man-in-the-Middle e Defesa Zero-Trust",
            badge: "Avançado",
            description: "ALERTA MÁXIMO! A residência está sofrendo um ataque coordenado externo. Uma botnet está varrendo a rede em busca de portas Telnet, há tentativas de ARP Spoofing e um ransomware IoT está ameaçando travar a fechadura eletrônica.",
            targetScore: 1400,
            initialSecurity: 10
        }
    ],

    // Módulos de Defesa globais para Arrastar e Soltar (Drag & Drop) com ícones vetoriais
    defenseModules: [
        { id: "mod_vlan", name: "Segmentação VLAN 30", icon: "network", desc: "Isola dispositivo em sub-rede IoT com firewall", type: "network" },
        { id: "mod_pw", name: "Credenciais Fortes + 2FA", icon: "key", desc: "Substitui senha padrão por senha de 16 caracteres e MFA", type: "auth" },
        { id: "mod_tls", name: "Criptografia TLS 1.3", icon: "lock", desc: "Força canal seguro e desativa HTTP/Telnet puro", type: "crypto" },
        { id: "mod_firewall", name: "Regra Firewall Anti-DDoS", icon: "shield", desc: "Bloqueia UPnP, Telnet 23 e tráfego WAN suspeito", type: "security" },
        { id: "mod_patch", name: "Patch Assinado (ECDSA)", icon: "cpu", desc: "Aplica firmware verificado com Secure Boot ativo", type: "firmware" },
        { id: "mod_ble_pin", name: "PIN 6 Dígitos + Anti-Replay", icon: "key", desc: "Exige Passkey Entry e timestamps criptográficos", type: "auth" }
    ],

    // Definição dos 7 Dispositivos por Nível com coordenadas amplas e sem colisões
    devicesByLevel: {
        1: [
            {
                id: "camera",
                name: "Câmera IP de Segurança",
                room: "living",
                roomName: "Sala de Estar / Entrada",
                icon: "camera",
                ip: "192.168.1.105",
                mac: "B8:27:EB:4F:92:1A",
                protocol: "RTSP / HTTP (Porta 80, 554)",
                firmware: "v1.0.2-factory",
                alertMsg: "Credenciais de fábrica 'admin/admin' ativas e UPnP exposto na WAN",
                coords: { x: 590, y: 170 },
                requiredModules: ["mod_pw", "mod_firewall"],
                interactiveControls: [
                    { id: "ctrl_pwd", label: "Senha de Acesso", type: "select", options: ["Padrão (admin/admin)", "Fraca (123456)", "Forte (Sec_H0m3!#2026)"], correct: 2 },
                    { id: "ctrl_upnp", label: "UPnP (Port Forwarding Automático)", type: "toggle", state: true, correct: false },
                    { id: "ctrl_2fa", label: "Autenticação em Dois Fatores (2FA)", type: "toggle", state: false, correct: true }
                ],
                consoleLogs: [
                    "[08:14:02] [CAM_DAEMON] Starting RTSP stream on port 554 (TCP/UDP)...",
                    "[08:14:03] [HTTPD] Embedded Web Server active at http://192.168.1.105:8080",
                    "[08:14:15] [AUTH_LOG] Login attempt from WAN: username='admin' password='admin'",
                    "[08:14:15] [AUTH_LOG] STATUS: 200 OK — Authentication Successful!",
                    "[08:14:16] [WARNING] Default factory credential detected. Password changed flag = FALSE",
                    "[08:14:20] [UPnP] IGD Port Mapping enabled automatically via router (Ext Port 8080 -> Int Port 8080)"
                ],
                step1: {
                    question: "Analisando os logs da Câmera IP, qual vulnerabilidade crítica está presente?",
                    options: [
                        "O dispositivo está executando versão não compatível de Linux Embedded.",
                        "Uso de credenciais de fábrica fracas ('admin:admin') e UPnP ativado expondo a porta para a Internet.",
                        "Falta de suporte a resolução Full HD gerando sobrecarga no buffer de rede.",
                        "A câmera está utilizando endereço IPv6 com roteamento estático incorreto."
                    ],
                    correctIndex: 1,
                    explanation: "Credenciais de fábrica padrão (como admin/admin) combinadas com UPnP abrem as portas do dispositivo para a WAN sem conhecimento do usuário, tornando-o alvo fácil de scanners automáticos."
                },
                step2: {
                    question: "Qual ameaça cibernética é diretamente facilitada por essa vulnerabilidade?",
                    options: [
                        "Ataque de Força Bruta / Dicionário e sequestro de feed de vídeo por invasores remotos.",
                        "Envenenamento de cache DNS local da Smart TV.",
                        "Corrupção eletrostática do sensor CMOS da câmera.",
                        "Ataque de amplificação NTP via porta 123 UDP."
                    ],
                    correctIndex: 0,
                    explanation: "Scanners e atacantes usam listas de credenciais comuns (Credential Stuffing / Dicionário) para acessar o feed de vídeo, invadir a privacidade dos moradores ou recrutar a câmera para botnets."
                },
                step3: {
                    question: "Qual é a melhor medida de proteção imediata recomendada?",
                    options: [
                        "Diminuir a taxa de quadros (FPS) da câmera para 15 fps.",
                        "Alterar a senha para uma senha forte (mínimo 14 caracteres), desabilitar UPnP e exigir 2FA.",
                        "Trocar o cabo de rede Ethernet por uma conexão Wi-Fi de 2.4 GHz sem criptografia.",
                        "Reiniciar a câmera a cada 1 hora via cron job."
                    ],
                    correctIndex: 1,
                    explanation: "A alteração de credenciais para senhas complexas, desativação do UPnP no roteador e o uso de autenticação de dois fatores (2FA) impedem o acesso remoto não autorizado."
                },
                technicalBriefing: "Conforme o OWASP IoT Top 10 (Item I1 - Weak, Guessable, or Hardcoded Passwords), senhas padrão são o vetor de entrada número 1 em invasões a câmeras domésticas."
            },
            {
                id: "router",
                name: "Roteador Wi-Fi Principal",
                room: "living",
                roomName: "Sala de Estar / Rack Central",
                icon: "router",
                ip: "192.168.1.1",
                mac: "00:1A:2B:3C:4D:5E",
                protocol: "Wi-Fi (WPA2-PSK TKIP) / HTTP / Telnet",
                firmware: "v2.01.00 (Desatualizado desde 2019)",
                alertMsg: "Porta 23 (Telnet) aberta sem autenticação por chave e WPS ativo",
                coords: { x: 420, y: 140 },
                requiredModules: ["mod_firewall", "mod_tls"],
                interactiveControls: [
                    { id: "ctrl_telnet", label: "Serviço Telnet (Porta 23)", type: "toggle", state: true, correct: false },
                    { id: "ctrl_wps", label: "WPS PIN Authentication", type: "toggle", state: true, correct: false },
                    { id: "ctrl_wifi_sec", label: "Protocolo de Criptografia Wi-Fi", type: "select", options: ["WPA2-TKIP (Depreciado)", "WPA2-AES", "WPA3-SAE (Recomendado)"], correct: 2 }
                ],
                consoleLogs: [
                    "[08:10:00] [SYSTEM] Router OS boot initialized. IP: 192.168.1.1/24",
                    "[08:10:01] [TELNETD] Telnet service listening on 0.0.0.0:23 (INSECURE: Cleartext)",
                    "[08:10:02] [WIRELESS] SSID: 'MinhaCasa_WiFi' Security: WPA2-TKIP (Depreciado)",
                    "[08:10:05] [WPS] Wi-Fi Protected Setup PIN Mode: ENABLED (Default PIN: 12345670)",
                    "[08:10:08] [REMOTE_MGMT] Web GUI accessible from WAN interface on port 80"
                ],
                step1: {
                    question: "Quais falhas graves de segurança foram identificadas no Roteador?",
                    options: [
                        "Protocolo WPS ativado com PIN padrão, serviço Telnet em texto claro e gerenciamento remoto WAN liberado.",
                        "O roteador está operando com apenas 4 antenas de ganho 5dBi.",
                        "O servidor DHCP está distribuindo endereços no formato 192.168.1.X em vez de 10.0.0.X.",
                        "A interface gráfica web utiliza a cor azul em vez de um padrão acessível."
                    ],
                    correctIndex: 0,
                    explanation: "WPS com PIN é extremamente vulnerável a ataques de força bruta (Pixie Dust / Reaver). Além disso, Telnet envia dados sem criptografia e o acesso WAN abre o painel para qualquer pessoa na Internet."
                },
                step2: {
                    question: "Que tipo de ataque um invasor próximo pode executar contra esse roteador?",
                    options: [
                        "Ataque Pixie Dust / Reaver para quebrar o PIN do WPS em minutos e interceptação Telnet.",
                        "Desmagnetização das placas de rede dos computadores conectados.",
                        "Injeção de SQL direto no chip flash do modem de fibra óptica.",
                        "Sobrecarga física da fonte de alimentação de 12V."
                    ],
                    correctIndex: 0,
                    explanation: "Ferramentas como Reaver e Bully exploram a falha de design do WPS PIN para obter a chave WPA2 da rede em poucos minutos sem precisar quebrar a senha principal."
                },
                step3: {
                    question: "Como o Técnico em Desenvolvimento de Sistemas deve corrigir esse Roteador?",
                    options: [
                        "Desabilitar o WPS, fechar a porta Telnet, desligar o acesso remoto WAN e atualizar para WPA3-SAE ou WPA2-AES.",
                        "Aumentar a potência de transmissão do sinal Wi-Fi para 100% cobrindo a vizinhança.",
                        "Esconder o SSID (rede oculta), pois isso garante proteção criptográfica total.",
                        "Mudar o IP do roteador para 192.168.1.254 e manter o Telnet aberto para emergências."
                    ],
                    correctIndex: 0,
                    explanation: "Desativar WPS, desabilitar serviços legados inseguros (Telnet, HTTP puro), bloquear acesso WAN ao admin e adotar WPA3 ou WPA2-AES com senhas robustas segue as diretrizes da RFC e NIST."
                },
                technicalBriefing: "O roteador é a primeira linha de defesa (Edge Gateway). Comprometê-lo concede ao atacante o controle sobre o DNS, espelhamento de tráfego e acesso irrestrito aos dispositivos internos."
            },
            {
                id: "smartlock",
                name: "Fechadura Inteligente",
                room: "entrance",
                roomName: "Porta Principal / Entrada",
                icon: "lock",
                ip: "192.168.1.120",
                mac: "AC:DE:48:00:11:22",
                protocol: "BLE (Bluetooth Low Energy 4.2) / Wi-Fi Bridge",
                firmware: "LockOS v1.1.0",
                alertMsg: "Modo de pareamento Bluetooth aberto sem solicitação de PIN/Passkey",
                coords: { x: 200, y: 350 },
                requiredModules: ["mod_ble_pin", "mod_pw"],
                interactiveControls: [
                    { id: "ctrl_ble_mode", label: "Modo de Pareamento BLE", type: "select", options: ["Just Works (Sem Senha)", "Passkey Entry (PIN 6 Dígitos)"], correct: 1 },
                    { id: "ctrl_replay", label: "Proteção Criptográfica Anti-Replay", type: "toggle", state: false, correct: true },
                    { id: "ctrl_autolock", label: "Auto-bloqueio após 30 segundos", type: "toggle", state: true, correct: true }
                ],
                consoleLogs: [
                    "[08:12:00] [BLE_STACK] Advertising BLE Service UUID 0xFFE0 (SmartLock Controller)",
                    "[08:12:01] [BLE_SEC] Pairing Mode: 'Just Works' (No Man-in-the-Middle protection / No PIN)",
                    "[08:12:30] [CMD_RCV] Received command: 0x01 (UNLOCK_DOOR) from Unknown BLE MAC: F4:5C:89:12:33:AA",
                    "[08:12:31] [ACTUATOR] Solenoid triggered. Physical door latch opened!",
                    "[08:12:32] [WARNING] Command executed without cryptographic nonce or timestamp validation."
                ],
                step1: {
                    question: "Qual falha no pareamento Bluetooth e validação de comandos foi detectada?",
                    options: [
                        "A fechadura consome muita bateria durante a comunicação por radiofrequência.",
                        "Uso do modo de pareamento 'Just Works' sem autenticação/PIN e ausência de nonce anti-replay.",
                        "O solenóide mecânico é feito de latão em vez de aço endurecido.",
                        "A fechadura não possui integração com assistente de voz da Amazon."
                    ],
                    correctIndex: 1,
                    explanation: "O modo BLE 'Just Works' não fornece proteção contra Man-in-the-Middle ou autenticação de identidade. Sem nonces (números aleatórios de uso único), qualquer pessoa no alcance pode capturar e reenviar o comando de destrancar."
                },
                step2: {
                    question: "Qual é o impacto de segurança desta vulnerabilidade no mundo real?",
                    options: [
                        "Invasão física da residência por replay attack ou pareamento não autorizado via smartphone.",
                        "Interrupção no fornecimento de energia elétrica da cozinha.",
                        "Falha no relógio do forno micro-ondas.",
                        "Aumento da latência nas partidas de videogame online."
                    ],
                    correctIndex: 0,
                    explanation: "Um atacante externo, parado do lado de fora da porta com um notebook ou smartphone, consegue parear sem senha ou gravar o sinal BLE de um morador e destrancar a porta física em segundos."
                },
                step3: {
                    question: "Qual controle de segurança deve ser implementado no firmware da fechadura?",
                    options: [
                        "Exigir BLE Passkey Entry (PIN numérico de 6 dígitos), autenticação mútua AES-128 e token dinâmico com timestamp.",
                        "Pintar a fechadura com tinta anti-radar militar.",
                        "Usar apenas pilhas alcalinas descartáveis em vez de recarregáveis.",
                        "Deixar a porta destrancada durante o dia para economizar ciclos de rádio."
                    ],
                    correctIndex: 0,
                    explanation: "A implementação de BLE Secure Connections com Passkey Entry, chaves criptográficas AES e tokens com carimbo de tempo (evitando replay) garante que apenas dispositivos autorizados acionem o solenóide."
                },
                technicalBriefing: "Segurança física e lógica convergem em IoT. Falhas no firmware de travas e atuadores físicos representam risco imediato à integridade física das pessoas."
            },
            {
                id: "thermostat",
                name: "Termostato Inteligente",
                room: "bedroom",
                roomName: "Quarto / Climatização",
                icon: "thermometer",
                ip: "192.168.1.135",
                mac: "2C:F4:32:88:99:10",
                protocol: "HTTP API / CoAP (Porta 5683)",
                firmware: "ThermoCore v2.1 (Build 2020)",
                alertMsg: "API REST local exposta sem qualquer autenticação HTTP (No Auth)",
                coords: { x: 700, y: 390 },
                requiredModules: ["mod_tls", "mod_pw"],
                interactiveControls: [
                    { id: "ctrl_api_auth", label: "Autenticação nos Endpoints REST", type: "select", options: ["Nenhuma (No Auth)", "Bearer Token / JWT Seguro"], correct: 1 },
                    { id: "ctrl_debug", label: "Rotas de Debug /api/v1/dump", type: "toggle", state: true, correct: false },
                    { id: "ctrl_tls_thermo", label: "Criptografia HTTPS (TLS 1.3)", type: "toggle", state: false, correct: true }
                ],
                consoleLogs: [
                    "[08:15:00] [THERMO] Ambient Temp: 23.5°C | Target: 22.0°C | HVAC Mode: COOL",
                    "[08:15:10] [HTTP_SRV] GET /api/v1/status HTTP/1.1 200 OK (Headers: Access-Control-Allow-Origin: *)",
                    "[08:15:15] [HTTP_SRV] POST /api/v1/temperature payload: {'target': 38.0} No Authorization header",
                    "[08:15:16] [HVAC_CTRL] Overriding heating elements to MAXIMUM 38.0°C! Danger of overheating.",
                    "[08:15:20] [DEBUG] Endpoint /api/v1/firmware/dump exposes Wi-Fi cleartext password."
                ],
                step1: {
                    question: "Qual é a vulnerabilidade identificada nos endpoints do Termostato?",
                    options: [
                        "API REST aceita requisições POST sem autenticação (No Auth) e endpoint de debug vaza a chave Wi-Fi.",
                        "O termostato só mede em graus Celsius e não em Fahrenheit.",
                        "O cabo do termopar está com aterramento elétrico flutuante.",
                        "O display LCD consome mais de 5 Watts de potência."
                    ],
                    correctIndex: 0,
                    explanation: "A ausência de autenticação (OAuth2, Bearer Tokens ou API Keys) permite que qualquer dispositivo ou script na rede mude as configurações climáticas e colete credenciais da rede interna."
                },
                step2: {
                    question: "Que risco essa falha representa para o sistema e ambiente?",
                    options: [
                        "Manipulação arbitrária de atuadores térmicos (risco de sobreaquecimento) e pivô de invasão via vazamento de senha.",
                        "Queima instantânea do roteador de fibra da operadora.",
                        "Infiltração de água nas paredes da sala.",
                        "Bloqueio da conta do e-mail pessoal do usuário."
                    ],
                    correctIndex: 0,
                    explanation: "Atacantes podem danificar equipamentos HVAC, gerar contas de energia exorbitantes ou usar o termostato como 'pivô' para saltar para computadores pessoais após obter a senha do Wi-Fi exposta no endpoint de debug."
                },
                step3: {
                    question: "Qual correção técnica deve ser aplicada?",
                    options: [
                        "Implementar autenticação JWT/OAuth2 na API, fechar endpoints de debug e usar HTTPS com TLS 1.3.",
                        "Desligar o ar condicionado durante a noite.",
                        "Remover o sensor de temperatura e deixar a ventilação no modo manual.",
                        "Colocar uma fita isolante preta sobre o display do termostato."
                    ],
                    correctIndex: 0,
                    explanation: "Toda API REST em IoT deve exigir tokens criptográficos de autenticação (JWT/mTLS), desativar rotas de debug em compilações de produção e criptografar o canal com TLS."
                },
                technicalBriefing: "Princípio do Menor Acesso: Endpoints que realizam modificação de estado (POST/PUT/DELETE) nunca devem ser acessíveis anonimamente em redes locais compartilhadas."
            },
            {
                id: "speaker",
                name: "Assistente Virtual / Smart Speaker",
                room: "kitchen",
                roomName: "Cozinha",
                icon: "mic",
                ip: "192.168.1.140",
                mac: "D8:96:E0:44:55:66",
                protocol: "UPnP / mDNS / HTTP Streaming (Port 8008)",
                firmware: "VoiceOS 3.4.1",
                alertMsg: "Streaming de áudio e microfone aberto para conexões locais sem autenticação",
                coords: { x: 480, y: 440 },
                requiredModules: ["mod_vlan", "mod_pw"],
                interactiveControls: [
                    { id: "ctrl_cast_pin", label: "PIN Obrigatório para Streaming", type: "toggle", state: false, correct: true },
                    { id: "ctrl_cloud_telemetry", label: "Compartilhar Gravações com a Nuvem", type: "toggle", state: true, correct: false },
                    { id: "ctrl_client_isolation", label: "Isolamento de Ponto de Acesso (AP Isolation)", type: "toggle", state: false, correct: true }
                ],
                consoleLogs: [
                    "[08:18:00] [AUDIO_ENGINE] Far-field 4-mic array calibrated. Listening for wake-word...",
                    "[08:18:12] [CAST_SRV] Google Cast/AirPlay bridge active on port 8008 without PIN code.",
                    "[08:18:30] [STREAM] Incoming remote stream connection from 192.168.1.199:54210",
                    "[08:18:31] [RECORD] Live PCM audio buffer being duplicated to external socket without user notice.",
                    "[08:18:35] [TELEMETRY] Uploading unencrypted voice samples to cloud telemetry server."
                ],
                step1: {
                    question: "O que os logs revelam sobre o comportamento do Smart Speaker?",
                    options: [
                        "O alto-falante não tem graves suficientes para tocar músicas em alta fidelidade.",
                        "Transmissão e duplicação não autorizada de áudio do microfone para IP externo sem feedback visual ou criptografia.",
                        "A assistente não entende comandos com sotaques regionais.",
                        "O cabo USB de alimentação é incompatível com carregamento rápido."
                    ],
                    correctIndex: 1,
                    explanation: "O serviço de streaming do dispositivo está permitindo conexões diretas sem autenticação para capturar o áudio captado pelos microfones da residência, violando diretamente a privacidade dos usuários."
                },
                step2: {
                    question: "Qual é a classificação dessa ameaça sob a ótica de privacidade e conformidade (LGPD)?",
                    options: [
                        "Eavesdropping (espionagem sonora) e vazamento ilícito de dados biométricos de voz.",
                        "Ataque de negação de serviço na rede elétrica doméstica.",
                        "Vulnerabilidade de hardware no driver magnético da bobina.",
                        "Dano por radiofrequência não ionizante."
                    ],
                    correctIndex: 0,
                    explanation: "Eavesdropping permite que conversas privadas, senhas ditadas em voz alta e dados pessoais sejam gravados e exfiltrados, configurando grave incidente de segurança e violação da LGPD."
                },
                step3: {
                    question: "Qual política de segurança e configuração deve ser aplicada?",
                    options: [
                        "Ativar isolamento de clientes AP, habilitar autenticação por PIN no protocolo de streaming e desligar telemetria não essencial.",
                        "Falar baixo perto da assistente para que o microfone não capture os sons.",
                        "Embalar o alto-falante em papel alumínio.",
                        "Usar a assistente apenas como cronômetro de cozinha."
                    ],
                    correctIndex: 0,
                    explanation: "Configurar autenticação estrita para qualquer streaming de mídia, isolar o dispositivo em rede específica, desativar compartilhamento de telemetria e acionar a chave física de mudo quando não em uso."
                },
                technicalBriefing: "Smart speakers são nós de captura contínua de áudio. Na arquitetura Zero-Trust, dispositivos com microfones e câmeras devem ser isolados e ter tráfego de saída rigorosamente monitorado."
            },
            {
                id: "doorsensor",
                name: "Sensor de Janela / Porta",
                room: "entrance",
                roomName: "Entrada / Hall",
                icon: "shield",
                ip: "192.168.1.150 (Gateway RF)",
                mac: "00:0D:6F:12:34:56",
                protocol: "RF 433 MHz / Zigbee sem criptografia de chave de rede",
                firmware: "SensorFirmware v0.9-alpha",
                alertMsg: "Transmissão de status de abertura/fechamento em rádio frequência sem chave AES",
                coords: { x: 310, y: 240 },
                requiredModules: ["mod_ble_pin", "mod_patch"],
                interactiveControls: [
                    { id: "ctrl_zigbee_key", label: "Chave de Criptografia Zigbee", type: "select", options: ["Padrão ('ZigBeeAlliance09')", "Aleatória Única 128-bits"], correct: 1 },
                    { id: "ctrl_rolling_code", label: "Rolling-Code com HMAC", type: "toggle", state: false, correct: true },
                    { id: "ctrl_heartbeat", label: "Supervisão Heartbeat a cada 10s", type: "toggle", state: false, correct: true }
                ],
                consoleLogs: [
                    "[08:20:00] [RF_MOD] Listening on 433.92 MHz ASK/OOK modulation...",
                    "[08:20:05] [PACKET_TX] Pkt: 0xAAAA 01 00 FF (Payload: DOOR_STATUS=CLOSED, Counter=0x0001)",
                    "[08:20:20] [PACKET_TX] Pkt: 0xAAAA 01 01 FF (Payload: DOOR_STATUS=OPEN, Counter=0x0002)",
                    "[08:20:25] [SECURITY_CHECK] Zigbee Network Key: Using well-known default 'ZigBeeAlliance09'!",
                    "[08:20:26] [ALERT] Rolling-code or cryptographic HMAC is NOT implemented on payload."
                ],
                step1: {
                    question: "Qual fraqueza criptográfica está presente na comunicação deste sensor?",
                    options: [
                        "A bateria de lítio CR2032 tem voltagem nominal de apenas 3V.",
                        "Uso da chave de rede padrão conhecida ('ZigBeeAlliance09') e ausência de HMAC/código rolante (rolling-code).",
                        "O sensor magnético de efeito Hall é sensível demais à temperatura.",
                        "O alcance do sensor está restrito a apenas 15 metros."
                    ],
                    correctIndex: 1,
                    explanation: "O uso da chave padrão de fábrica da ZigBee Alliance e mensagens simples sem HMAC nem códigos de rolagem permite que qualquer receptor de rádio SDR (Software Defined Radio) capture e decodifique o pacote."
                },
                step2: {
                    question: "Que técnica de invasão pode burlar o sistema de alarme através deste sensor?",
                    options: [
                        "Replay Attack (Ataque de Repetição) usando um transmissor RF como HackRF ou Flipper Zero.",
                        "Injeção de código SQL através do ímã da porta.",
                        "Ataque Cross-Site Scripting (XSS) refletido no batente da janela.",
                        "Ataque de negação de serviço na linha telefônica fixa."
                    ],
                    correctIndex: 0,
                    explanation: "No Replay Attack, o invasor grava o sinal de rádio de 'porta fechada'. Ao arrombar a porta, ele transmite em loop o sinal gravado, enganando a central de segurança da casa."
                },
                step3: {
                    question: "Como sanar essa vulnerabilidade na camada de rádio/enlace?",
                    options: [
                        "Trocar a chave de rede Zigbee para uma chave aleatória de 128-bits e implementar rolling-code criptografado.",
                        "Trocar o ímã da porta por um ímã de neodímio mais forte.",
                        "Colocar o sensor apenas do lado de fora da porta.",
                        "Desativar o sensor durante a noite para evitar alarmes falsos."
                    ],
                    correctIndex: 0,
                    explanation: "A geração de uma chave de rede Zigbee aleatória única durante o comissionamento e a inclusão de contadores de mensagens (frame counters) e assinaturas HMAC impedem ataques de repetição e escuta."
                },
                technicalBriefing: "Segurança de protocolos sem fio exige integridade e frescor de mensagem (freshness). Sem contadores com carimbo criptográfico, sensores de presença tornam-se inúteis frente a ferramentas SDR populares."
            },
            {
                id: "smartbulb",
                name: "Lâmpadas Inteligentes Mesh",
                room: "bedroom",
                roomName: "Quarto Principal",
                icon: "bulb",
                ip: "192.168.1.160",
                mac: "50:02:91:A1:B2:C3",
                protocol: "Zigbee 3.0 / Bridge HTTP",
                firmware: "BulbFirmware v1.0.0",
                alertMsg: "Porta de atualização OTA (Over-the-Air) aceita binários sem assinatura digital",
                coords: { x: 770, y: 270 },
                requiredModules: ["mod_patch", "mod_vlan"],
                interactiveControls: [
                    { id: "ctrl_secure_boot", label: "Secure Boot (Hardware Root of Trust)", type: "toggle", state: false, correct: true },
                    { id: "ctrl_code_sign", label: "Validação Obrigatória de Assinatura ECDSA", type: "toggle", state: false, correct: true },
                    { id: "ctrl_ota_chan", label: "Canal de Atualização OTA", type: "select", options: ["Broadcast Livre", "Canal Criptografado TLS"], correct: 1 }
                ],
                consoleLogs: [
                    "[08:22:00] [LIGHT_MESH] 4 RGB Bulbs synchronized on Zigbee Channel 15",
                    "[08:22:05] [OTA_SERVICE] Checking for firmware updates via broadcast beacon...",
                    "[08:22:15] [OTA_UPDATE] Received firmware binary image 'bulb_update_v1.0.1.bin' (Size: 245KB)",
                    "[08:22:16] [INTEGRITY_CHECK] Signature verification: BYPASSED (Signature check flag = DISABLED)",
                    "[08:22:17] [FLASH] Writing unsigned binary payload directly to internal bootloader flash memory!"
                ],
                step1: {
                    question: "Qual falha crítica foi encontrada no mecanismo de atualização de firmware das lâmpadas?",
                    options: [
                        "O firmware não oferece suporte a 16 milhões de cores RGB.",
                        "O processo de atualização OTA aceita e grava códigos binários sem validação de assinatura digital (Code Signing).",
                        "A lâmpada pisca duas vezes ao ligar na tomada.",
                        "O soquete padrão E27 não dissipa calor de forma silenciosa."
                    ],
                    correctIndex: 1,
                    explanation: "Sem assinatura digital criptográfica (Code Signing com chave assimétrica RSA/ECC), qualquer binário malicioso transmitido no alcance do rádio será gravado na memória flash do dispositivo."
                },
                step2: {
                    question: "Qual é a consequência de permitir binários não assinados em dispositivos IoT?",
                    options: [
                        "Instalação de firmware malicioso (Rootkit/Malware), transformando as lâmpadas em nós de ataque ou botnets.",
                        "Curto-circuito instantâneo na rede de distribuição elétrica da concessionária pública.",
                        "Desconfiguração automática das senhas do banco no smartphone.",
                        "Falha na sincronização do relógio atômico de Greenwich."
                    ],
                    correctIndex: 0,
                    explanation: "Ataques famosos (como a propagação de vermes em lâmpadas inteligentes demonstrada por pesquisadores da Philips Hue) usam falhas de OTA para infectar dispositivos em cadeia e usá-los como pontos de espionagem e DDoS."
                },
                step3: {
                    question: "Qual medida de engenharia de software seguro resolve esse problema?",
                    options: [
                        "Implementar Boot Seguro (Secure Boot) e validação obrigatória de assinatura criptográfica (ECDSA) antes do flash.",
                        "Trocar a lâmpada LED por uma lâmpada incandescente tradicional.",
                        "Atualizar o firmware somente quando a luz estiver apagada.",
                        "Mudar a cor da luz para verde indicando que o sistema está seguro."
                    ],
                    correctIndex: 0,
                    explanation: "O Secure Boot com raiz de confiança em hardware (RoT) e a exigência de assinaturas digitais com chaves privadas protegidas pelo fabricante garantem que apenas códigos autênticos sejam executados."
                },
                technicalBriefing: "O NIST SP 800-193 estabelece diretrizes de resiliência de firmware. Atualizações OTA não autenticadas são uma das portas mais perigosas de persistência de malware em IoT."
            }
        ],

        // Nível 2 e Nível 3 herdam as mesmas coordenadas e ganham controles interativos
        2: [],
        3: []
    },

    // Base de Conquistas (Achievements)
    achievements: [
        {
            id: "first_defense",
            title: "Primeira Linha de Defesa",
            desc: "Identifique e neutralize a primeira vulnerabilidade em qualquer dispositivo.",
            icon: "shield-check",
            badge: "Recruta",
            unlocked: false
        },
        {
            id: "hunter_passwords",
            title: "Caçador de Senhas Padrão",
            desc: "Elimine todas as credenciais de fábrica (admin/admin) e portas inseguras no Nível 1.",
            icon: "key",
            badge: "Segurança Básica",
            unlocked: false
        },
        {
            id: "master_segmentation",
            title: "Mestre da Segmentação",
            desc: "Isole com sucesso a rede IoT em uma VLAN separada com regras de firewall.",
            icon: "network",
            badge: "Arquiteto de Redes",
            unlocked: false
        },
        {
            id: "mirai_destroyer",
            title: "Caçador de Botnets",
            desc: "Contenha e erradique o malware Mirai da Câmera IP no Nível 3.",
            icon: "bug-slash",
            badge: "Threat Hunter",
            unlocked: false
        },
        {
            id: "zero_trust_shield",
            title: "Escudo Zero-Trust",
            desc: "Aplique autenticação mútua (mTLS) e criptografia ponta-a-ponta em 5 dispositivos.",
            icon: "lock-open-shield",
            badge: "Especialista Zero-Trust",
            unlocked: false
        },
        {
            id: "firmware_detective",
            title: "Detetive de Firmware",
            desc: "Identifique falhas críticas em atualizações OTA e aplique Secure Boot.",
            icon: "cpu",
            badge: "Engenheiro de Firmware",
            unlocked: false
        },
        {
            id: "armored_home",
            title: "100% Blindado",
            desc: "Alcance 100% no Medidor de Segurança em qualquer nível.",
            icon: "award",
            badge: "Fortaleza Digital",
            unlocked: false
        },
        {
            id: "perfect_auditor",
            title: "Auditor Perfeito",
            desc: "Conclua uma auditoria completa de nível sem cometer nenhum erro.",
            icon: "star",
            badge: "Perfeição Técnica",
            unlocked: false
        },
        {
            id: "protocol_master",
            title: "Mestre dos Protocolos",
            desc: "Consulte todos os tópicos de protocolos IoT (MQTT, Zigbee, BLE, Wi-Fi) no Glossário.",
            icon: "book-open",
            badge: "Pesquisador SESI/SENAI",
            unlocked: false
        },
        {
            id: "smart_home_guardian",
            title: "Guardião da Smart Home",
            desc: "Finalize os 3 níveis da simulação com classificação Especialista Cyber IoT.",
            icon: "trophy",
            badge: "Lenda da Defesa IoT",
            unlocked: false
        }
    ],

    // Base de Conteúdos Educativos & Glossário Técnico SESI/SENAI
    knowledgeBase: {
        protocols: [
            {
                name: "MQTT (Message Queuing Telemetry Transport)",
                tag: "Aplicação / Mensageria",
                port: "1883 (TCP puro) / 8883 (TLS seguro)",
                architecture: "Publish / Subscribe via Broker central",
                pros: "Extremamente leve, ideal para sensores de baixo consumo e banda reduzida.",
                cons: "Por padrão não possui criptografia ou autenticação sem configuração prévia.",
                bestPractices: "Usar MQTTS na porta 8883 com TLS 1.3, autenticação por usuário e senha complexa ou certificados de cliente (mTLS), e aplicar Listas de Controle de Acesso (ACL) rígidas por tópico."
            },
            {
                name: "Zigbee (IEEE 802.15.4)",
                tag: "Rede em Malha (Mesh)",
                port: "2.4 GHz ISM Band (Canais 11-26)",
                architecture: "Topologia Mesh (Coordenador, Roteadores, Nós Finais)",
                pros: "Baixíssimo consumo de energia, auto-regeneração de malha, longo alcance via nós repetidores.",
                cons: "Suscetível a interferência de Wi-Fi e ataques se utilizar chave de rede padrão de fábrica.",
                bestPractices: "Utilizar Zigbee 3.0 com Install Codes únicos por dispositivo, fechar a associação (Permit Join) imediatamente após o comissionamento e evitar a chave de link conhecida 'ZigBeeAlliance09'."
            },
            {
                name: "Wi-Fi (IEEE 802.11 ax/ac/n) & WPA3",
                tag: "Acesso à Rede / Sem Fio",
                port: "2.4 GHz, 5 GHz e 6 GHz",
                architecture: "Infraestrutura BSS / Ponto de Acesso Central",
                pros: "Alta taxa de transferência (ideal para vídeo e áudio), ubiquidade em residências.",
                cons: "Alto consumo de energia (inviável para sensores a moeda CR2032), grande superfície de ataque.",
                bestPractices: "Migrar para WPA3-SAE (Simultaneous Authentication of Equals) eliminando ataques de dicionário offline, criar SSID exclusivo em VLAN separada para IoT e desabilitar WPS e UPnP."
            },
            {
                name: "BLE (Bluetooth Low Energy)",
                tag: "Personal Area Network (PAN)",
                port: "2.4 GHz ISM (40 canais de 2 MHz)",
                architecture: "Master / Slave e Bluetooth Mesh",
                pros: "Compatibilidade nativa com smartphones, emparelhamento rápido, alcance controlado.",
                cons: "O modo legado 'Just Works' não oferece segurança contra interceptação (MitM).",
                bestPractices: "Exigir BLE Secure Connections com autenticação numérica (Passkey Entry de 6 dígitos), criptografia AES-CCM e tokens com proteção anti-replay."
            },
            {
                name: "Matter / Thread",
                tag: "Padrão Unificado Moderno",
                port: "IPv6 sobre 802.15.4 e Wi-Fi",
                architecture: "Mesh IPv6 auto-reparável com camada de aplicação unificada",
                pros: "Interoperabilidade total entre Apple, Google, Amazon e Samsung; segurança nativa ponta a ponta.",
                cons: "Requer hardware recente compatível com Thread Border Router.",
                bestPractices: "Validação estrita de credenciais comissionadas via DAC (Device Attestation Certificate) assinadas por autoridades certificadoras da CSA."
            }
        ],

        threats: [
            {
                title: "Botnet Mirai & Variantes (DDoS em IoT)",
                vector: "Varredura contínua de portas 23 (Telnet) e 554 (RTSP) com listas de credenciais padrão.",
                impact: "Recrutamento do dispositivo como 'zumbi' para ataques de negação de serviço distribuído (DDoS) contra empresas e serviços essenciais.",
                defense: "Desativar Telnet em favor de SSH com chave pública, trocar senhas padrão e bloquear tráfego de saída não autorizado no firewall de borda."
            },
            {
                title: "Man-in-the-Middle (MitM) & ARP Spoofing",
                vector: "Envio de respostas ARP falsificadas em redes locais não segmentadas (Camada 2).",
                impact: "Interceptação de senhas, injeção de código, alteração de telemetria e sequestro de sessões sem o conhecimento dos usuários.",
                defense: "Habilitar Dynamic ARP Inspection (DAI), DHCP Snooping e utilizar criptografia fim a fim obrigatória (TLS/HTTPS/MQTTS)."
            },
            {
                title: "Replay Attack (Ataque de Repetição de RF)",
                vector: "Captura de sinais de radiofrequência (433 MHz, 868 MHz, BLE) com dispositivos SDR e retransmissão posterior.",
                impact: "Destrancamento de portas, desarmamento de alarmes e desligamento forçado de sensores perimetrais.",
                defense: "Implementação de Rolling Codes (códigos de rolagem), contadores de sequência monotônicos e assinaturas criptográficas HMAC com timestamps."
            },
            {
                title: "Ransomware IoT & Sequestro de Atuadores",
                vector: "Exploração de vulnerabilidades de RCE (Remote Code Execution) ou credenciais fracas em painéis web locais.",
                impact: "Travamento físico de fechaduras, desligamento forçado de sistemas de aquecimento/refrigeração e extorsão financeira.",
                defense: "Hardening de firmware, desativação de portas de gerenciamento WAN, princípio do menor privilégio e backups seguros da configuração de fábrica."
            }
        ],

        bestPractices: [
            {
                title: "Segmentação de Rede com VLANs & Firewall",
                rule: "Nunca misture dispositivos IoT com computadores e smartphones de uso pessoal.",
                details: "Crie uma VLAN exclusiva (ex: VLAN 30 - IoT) com regras de firewall 'Drop All' para tráfego direcionado à rede interna (LAN Principal). Apenas permita conexões iniciadas da LAN para a IoT, nunca o contrário."
            },
            {
                title: "Princípio do Menor Privilégio & Hardening",
                rule: "Desative todos os serviços, protocolos e portas que não forem estritamente essenciais.",
                details: "Desabilite UPnP (Universal Plug and Play), Telnet, HTTP puro, SSH com senha e interfaces de debug (JTAG/UART expostas). O que não está instalado ou ativado não pode ser atacado."
            },
            {
                title: "Atualizações de Firmware Seguras (OTA com Secure Boot)",
                rule: "Garanta a integridade e autenticidade de qualquer código executado pelo hardware.",
                details: "Implemente Boot Seguro (Secure Boot) com raiz de confiança em hardware. Todas as atualizações Over-The-Air devem ter assinatura criptográfica verificada antes da gravação na memória flash."
            },
            {
                title: "Autenticação Forte & Arquitetura Zero-Trust",
                rule: "Nunca confie cegamente em um dispositivo apenas porque ele está conectado à rede local.",
                details: "Exija autenticação em múltiplos fatores (MFA/2FA) para acessos de controle, adote mTLS (mutual TLS) para comunicação máquina-a-máquina (M2M) e monitore comportamentos anômalos continuamente."
            }
        ]
    }
};

// Clona os dispositivos para Nível 2 e 3 com as mesmas coordenadas perfeitas
GAME_DATA.devicesByLevel[2] = JSON.parse(JSON.stringify(GAME_DATA.devicesByLevel[1]));
GAME_DATA.devicesByLevel[3] = JSON.parse(JSON.stringify(GAME_DATA.devicesByLevel[1]));

// Exporta para escopo global
window.GAME_DATA = GAME_DATA;
