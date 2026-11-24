# Cyber Defense: Proteja sua Smart Home

Simulador educativo de cibersegurança em IoT (Internet das Coisas) desenvolvido para o curso Técnico em Desenvolvimento de Sistemas (SESI/SENAI).

![Cyber Defense Banner](assets/preview.png)

## Funcionalidades
- **Dark Mode Cyber-Tech Futurista** com efeitos glassmorphism e cores neon (`#070d19`, `#00e5ff`, `#00e676`, `#ff3b5c`).
- **Planta Isométrica Interativa da Smart Home** com visualização dos 4 cômodos (Sala de Estar, Quarto, Cozinha, Entrada/Fachada) e Cúpula Holográfica de Proteção animada em tempo real via Canvas 2D.
- **7 Dispositivos Inteligentes Auditáveis**: Câmera IP, Roteador Wi-Fi, Fechadura Inteligente, Termostato, Smart Speaker, Sensor de Janela/Porta e Lâmpadas Mesh.
- **Laboratório Prático Hands-On**:
  - Sistema de **Arrastar e Soltar (Drag & Drop)** de Módulos de Defesa para os slots do dispositivo.
  - **Switches & Controles de Hardening** manuais (desativar Telnet/UPnP, habilitar WPA3, 2FA, isolamento AP).
  - **Terminal Interativo** com comandos de cibersegurança executáveis.
  - **Simulador de Teste de Ataque em Tempo Real**: teste se a defesa montada bloqueia os pacotes maliciosos do hacker.
  - **Radar de Varredura de Rede**: escaneamento com efeito visual que percorre a casa detectando nós vulneráveis.
- **Fluxo de Ação em 3 Etapas**: Identificar Vulnerabilidade técnica, Reconhecer Ameaça e Selecionar Medida de Proteção.
- **Sintetizador de Áudio Procedural (Web Audio API)**: efeitos sonoros e ambiência sci-fi gerados nativamente sem arquivos externos.
- **Relatório Técnico de Pentest / Auditoria**: classificação técnica (Especialista, Pleno, Júnior), métricas de precisão, recomendações normativas (NIST, OWASP, CIS Controls) e suporte à impressão/exportação em PDF.
- **Conquistas Desbloqueáveis** e **Base de Conhecimento / Glossário de Protocolos IoT** (MQTT, Zigbee, Wi-Fi 6, BLE, Matter).

## Como Executar Localmente
Como a aplicação utiliza HTML5, CSS3 avançado e JavaScript modular puro, nenhum build complexo é necessário.

Basta iniciar qualquer servidor estático local na raiz do projeto:

```bash
# Com Python 3
python -m http.server 8080

# Ou com Node.js (se possuir http-server instalado)
npx http-server -p 8080
```

Abra o navegador em `http://localhost:8080/`.

## Hospedagem no GitHub Pages
Para ativar o GitHub Pages gratuitamente:
1. Acesse o seu repositório no GitHub: `Settings > Pages`.
2. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
3. Clique em **Save**. Em instantes, o jogo estará online para qualquer aluno acessar!

---
Desenvolvido com foco no currículo do **Técnico em Desenvolvimento de Sistemas — SESI/SENAI**.
