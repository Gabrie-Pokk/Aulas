# 🎓 EduProctor — Plataforma de Ensino & Avaliações com Anti-Cheat Avançado

Uma plataforma educacional completa desenvolvida com **React**, **Vite** e **Tailwind CSS v3**, projetada para professores particulares de **Inglês** e **Matemática**. O sistema conta com autenticação de dois níveis (Professor Admin e Aluno), módulo de tarefas com envio e correção de arquivos (PDF e imagens), e um **ambiente de prova com monitoramento de segurança avançado (Proctoring/Anti-cheat em tempo real)**.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- npm

### Passo a Passo

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará acessível em: `http://localhost:5173/`

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuração do Backend (BaaS / Firebase)

O sistema foi arquitetado em modelo **Híbrido**:
- **Modo Padrão (Sem chaves):** Opera com persistência local reativa (`localStorage` + `IndexedDB`), com dados de exemplo pré-carregados (Professor Carlos, Alunas Maria e Beatriz, tarefas e simulados com logs de auditoria).
- **Modo Firebase Conectado:** Basta criar um arquivo `.env` na raiz (baseado no `.env.example`) com suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

---

## 🌟 Funcionalidades Implementadas

### 1. Sistema de Usuários e Autenticação
- **Login e Cadastro** com seleção de perfil: **Professor (Admin)** e **Aluno**.
- Para Alunos: campo de série/nível (ex: Ensino Médio, Nível Intermediário B1/B2, etc.).
- **Acesso Rápido de Demonstração (1 Clique):** Permite testar imediatamente como *Prof. Carlos*, *Aluna Maria Silva (com prova liberada)* ou *Aluno Lucas*.

### 2. Painel do Professor (Admin)
- **Gestão de Alunos:** Visualização de todos os alunos cadastrados, turmas e controle de liberação das avaliações por aluno individual ou para todos em lote.
- **Módulo de Tarefas (Inglês e Matemática):**
  - Criação de lições com data de entrega e descrição.
  - Upload de arquivos anexos para os alunos (PDFs de listas de exercícios, imagens, guias).
  - Atribuição para turmas completas ou alunos específicos.
  - Visualizador de entregas: download das resoluções enviadas pelos alunos e atribuição de **Nota (0 a 10)** e **Feedback Pedagógico**.
- **Módulo de Avaliações:**
  - Criação de provas com tempo limite (countdown em minutos).
  - Construtor de perguntas de **Múltipla Escolha** (com gabarito selecionável) e **Dissertativas/Redações**.
  - **Botão de Liberação de Prova:** O professor controla exatamente quem pode realizar o exame.
- **Auditoria de Proctoring (Relatório Anti-Cola):**
  - Histórico de todas as tentativas de prova com classificação de integridade (*100% Íntegra*, *Alerta Moderado*, *Alto Risco de Cola*).
  - Dossiê detalhado com linha do tempo de todas as infrações cometidas pelo aluno durante o teste.

### 3. Painel do Aluno
- **Dashboard de Tarefas:** Visualização das tarefas de Inglês e Matemática, download dos materiais do professor.
- **Área "Entregar Tarefa":** Upload da própria resolução (PDF ou fotos do caderno/lista de exercícios) e anotações em texto.
- **Acompanhamento de Correção:** Visualização da nota recebida e dos comentários do professor.
- **Módulo de Provas:**
  - Lista de provas atribuídas.
  - **O botão "Iniciar Avaliação" só fica ativo quando o professor libera o acesso.** Se bloqueado, exibe cadeado e aviso explicativo.

### 4. Sistema Avançado Anti-Cola (Proctoring/Anti-cheat) na Tela de Prova
Operando nativamente no navegador do aluno:
1. **Tela Cheia Obrigatória (`Fullscreen API`):**
   - O aluno só pode iniciar se autorizar a tela cheia.
   - Se tentar sair do modo tela cheia, a prova é pausada instantaneamente com um overlay de bloqueio e a ocorrência é logada com timestamp.
2. **Monitoramento de Abas e Foco (`visibilitychange` e `window.onblur`):**
   - Detecta se o aluno mudou de aba ou abriu outro programa (como ChatGPT, Discord ou WhatsApp).
   - Registra o evento de perda de foco com severidade alta no dossiê de auditoria.
3. **Monitoramento de Áudio (`MediaDevices API` + `Web Audio API` com `AnalyserNode`):**
   - Analisa o sinal sonoro do microfone em tempo real calculando decibéis (dB SPL estimado).
   - HUD visual com VU Meter animado (Verde < 60dB, Amarelo 60-70dB, Vermelho > 70dB).
   - Detecta picos contínuos de fala e registra a flag **"Suspeita de comunicação por voz"** com o valor em dB.
4. **Bloqueio de Ações:**
   - Desativa menu de contexto (clique direito com o mouse).
   - Bloqueia atalhos de copiar/colar (`Ctrl+C`, `Ctrl+V`, `Cmd+C`, `Cmd+V`, `Ctrl+X`).
   - Bloqueia DevTools (`F12`, `Ctrl+Shift+I/J/C`) e impressão (`Ctrl+P`).
   - Desativa seleção de texto via CSS (`user-select: none`) nas perguntas para evitar cópia para IAs.

---

## 📁 Estrutura do Código

```
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.jsx             # Modal de Login, Registro e Acesso Rápido
│   │   ├── exam/
│   │   │   └── ExamScreen.jsx            # Tela completa de Prova com Proctoring
│   │   ├── layout/
│   │   │   └── Navbar.jsx                # Header com Brand, Perfis e Status BaaS
│   │   ├── proctoring/
│   │   │   ├── ProctorMonitorHUD.jsx     # Barra flutuante com VU Meter e Status
│   │   │   └── ProctorViolationOverlay.jsx # Overlay de bloqueio em caso de infração
│   │   ├── student/
│   │   │   └── StudentDashboard.jsx      # Painel do Aluno (Tarefas, Entregas e Provas)
│   │   └── teacher/
│   │       ├── TeacherDashboard.jsx      # Painel principal do Professor
│   │       ├── TeacherAssignmentsTab.jsx # Criação de tarefas e correção de entregas
│   │       ├── TeacherExamsTab.jsx       # Criação de provas e liberação por aluno
│   │       ├── TeacherProctorLogsTab.jsx # Auditoria e dossiê de infrações anti-cola
│   │       └── TeacherStudentsTab.jsx    # Gestão de alunos e acessos
│   ├── context/
│   │   ├── AuthContext.jsx               # Gerenciador de sessão e perfis
│   │   └── DataContext.jsx               # Estado reativo de tarefas, entregas e provas
│   ├── hooks/
│   │   ├── useAudioProctor.js            # Hook de captura e análise de áudio (Web Audio API)
│   │   └── useProctorSecurity.js         # Hook de Fullscreen, Abas, Foco e Bloqueio de Teclas
│   ├── services/
│   │   ├── firebase.js                   # Conexão com Firebase Auth, Firestore e Storage
│   │   ├── mockData.js                   # Dados de demonstração realistas
│   │   └── storageService.js             # Upload para Firebase Storage ou DataURL local
│   ├── App.jsx                           # Roteamento central e orquestração
│   ├── index.css                         # Diretivas do Tailwind e regras anti-seleção
│   └── main.jsx                          # Ponto de entrada React
├── .env.example                          # Modelo de configuração de chaves BaaS
├── tailwind.config.js                    # Configuração de temas e animações
└── package.json
```
