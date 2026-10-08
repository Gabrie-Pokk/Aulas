import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_DB = {
  users: [
    {
      id: 'user_prof_gabriela',
      name: 'Profª Gabriela Sanchez',
      email: 'familiapokk@gmail.com',
      password: '201150Az@$#',
      role: 'teacher',
      avatar: null,
      subjects: ['Inglês', 'Matemática'],
      createdAt: '2026-09-01T10:00:00Z',
    }
  ],
  assignments: [
    {
      id: 'assign_eng_01',
      title: 'Reading & Synthesis: Artificial Intelligence and Language Learning',
      subject: 'Inglês',
      description: 'Leia o texto anexo e desenvolva uma redação (mínimo de 200 palavras) abordando o impacto das novas tecnologias no aprendizado de idiomas. Foque no uso de conectivos formais e estruturas condicionais.',
      dueDate: '2026-10-15T23:59:00',
      assignedTo: 'all',
      createdAt: '2026-10-02T14:00:00',
      attachments: [
        {
          id: 'att_1',
          name: 'Guia_Redacao_Conectivos_Ingles.pdf',
          size: '1.2 MB',
          type: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        }
      ]
    },
    {
      id: 'assign_math_01',
      title: 'Lista #04: Funções Quadráticas e Problemas de Otimização',
      subject: 'Matemática',
      description: 'Resolva a lista de exercícios anexa. Demonstre os passos para o cálculo de vértices da parábola, raízes reais e aplicação prática em máximos e mínimos. Você pode enviar foto do seu caderno ou PDF.',
      dueDate: '2026-10-18T23:59:00',
      assignedTo: 'all',
      createdAt: '2026-10-04T09:30:00',
      attachments: [
        {
          id: 'att_3',
          name: 'Lista_Exercicios_04_Matematica.pdf',
          size: '1.8 MB',
          type: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        }
      ]
    }
  ],
  submissions: [],
  exams: [
    {
      id: 'exam_placement_eng_01',
      title: 'Avaliação de Nivelamento de Inglês (Diagnóstico Grammar & Writing)',
      subject: 'Inglês',
      description: 'Teste diagnóstico para mapeamento de competências linguísticas, gramática, interpretação de texto e produção escrita.',
      timeLimitMinutes: 30,
      isReleasedFor: [],
      isUniversalRelease: false,
      securityConfig: {
        requireFullscreen: true,
        requireAudioMonitoring: true,
        blockActions: true,
        audioThresholdDb: 68,
      },
      createdAt: '2026-10-01T08:00:00',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          points: 15,
          text: 'Choose the correct option to complete the conditional sentence: "If she _______ harder for the placement test, she would have scored in the C1 band."',
          options: ['had studied', 'would study', 'has studied', 'studied'],
          correctAnswer: 0,
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          points: 15,
          text: 'Select the sentence that contains the correct use of inversion for emphasis:',
          options: [
            'Seldom I have witnessed such an extraordinary intellectual performance.',
            'Seldom have I witnessed such an extraordinary intellectual performance.',
            'Seldom did I witnessed such an extraordinary intellectual performance.',
            'I have seldom witnessed such an extraordinary intellectual performance.'
          ],
          correctAnswer: 1,
        },
        {
          id: 'q5',
          type: 'essay',
          points: 40,
          text: 'Writing Task: "Some people believe that total fluency in a second language can only be achieved by living in an English-speaking country, while others argue modern digital tools and dedicated tutoring are just as effective." Present your perspective in English (100–180 words).',
        }
      ]
    }
  ],
  examAttempts: []
};

const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    // Remove qualquer aluno antigo de teste
    parsed.users = parsed.users.filter(u =>
      !['user_student_maria', 'user_student_lucas', 'user_student_beatriz'].includes(u.id)
    );

    // Assegura conta da Professora
    const profIdx = parsed.users.findIndex(u => u.email === 'familiapokk@gmail.com');
    if (profIdx < 0) {
      parsed.users.unshift(DEFAULT_DB.users[0]);
    } else {
      parsed.users[profIdx].name = 'Profª Gabriela Sanchez';
      parsed.users[profIdx].password = '201150Az@$#';
      parsed.users[profIdx].avatar = null;
    }

    // Limpa submissões e tentativas fictícias antigas
    parsed.submissions = (parsed.submissions || []).filter(
      s => !['user_student_maria', 'user_student_lucas', 'user_student_beatriz'].includes(s.studentId)
    );
    parsed.examAttempts = (parsed.examAttempts || []).filter(
      a => !['user_student_maria', 'user_student_lucas', 'user_student_beatriz'].includes(a.studentId)
    );

    return parsed;
  } catch (err) {
    console.error('Erro ao ler banco de dados:', err);
    return DEFAULT_DB;
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar no banco de dados:', err);
  }
};

// Sincroniza e salva o estado limpo
writeDb(readDb());

/* ========================================================
   ROTAS DA API REST
======================================================== */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();

  // Professora
  if (cleanEmail === 'familiapokk@gmail.com') {
    if (password === '201150Az@$#') {
      const teacher = db.users.find(u => u.email === 'familiapokk@gmail.com') || DEFAULT_DB.users[0];
      return res.json(teacher);
    } else {
      return res.status(401).json({ error: 'Senha incorreta para a conta da Professora.' });
    }
  }

  // Aluno
  const student = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'student');
  if (student) {
    if (student.password === password) {
      return res.json(student);
    } else {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
  }

  return res.status(404).json({ error: 'Aluno não cadastrado. Cadastre-se na aba "Novo Aluno (Cadastro)".' });
});

// Dados do Banco
app.get('/api/data', (req, res) => {
  const db = readDb();
  res.json({
    students: db.users.filter(u => u.role === 'student'),
    assignments: db.assignments || [],
    submissions: db.submissions || [],
    exams: db.exams || [],
    examAttempts: db.examAttempts || [],
  });
});

// Cadastro de Aluno Real
app.post('/api/register', (req, res) => {
  const { name, email, password, grade } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'familiapokk@gmail.com') {
    return res.status(400).json({ error: 'Este e-mail pertence à Professora.' });
  }

  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'Já existe um aluno cadastrado com este e-mail. Faça login.' });
  }

  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: cleanEmail,
    password: password.trim(),
    role: 'student',
    grade: grade || 'Ensino Médio',
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

// Tarefas
app.post('/api/assignments', (req, res) => {
  const assignmentData = req.body;
  const db = readDb();

  const newAssignment = {
    ...assignmentData,
    id: assignmentData.id || ('assign_' + Date.now()),
    createdAt: new Date().toISOString(),
  };

  db.assignments.unshift(newAssignment);
  writeDb(db);
  res.status(201).json(newAssignment);
});

app.delete('/api/assignments/:id', (req, res) => {
  const db = readDb();
  db.assignments = db.assignments.filter(a => a.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Entregas
app.post('/api/submissions', (req, res) => {
  const subData = req.body;
  const db = readDb();

  const newSub = {
    ...subData,
    id: subData.id || ('sub_' + Date.now()),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    grade: null,
    feedback: null,
  };

  db.submissions = db.submissions.filter(
    s => !(s.assignmentId === newSub.assignmentId && s.studentId === newSub.studentId)
  );

  db.submissions.unshift(newSub);
  writeDb(db);
  res.status(201).json(newSub);
});

// Avaliação de Entrega
app.post('/api/grades', (req, res) => {
  const { submissionId, grade, feedback } = req.body;
  const db = readDb();

  db.submissions = db.submissions.map(sub => {
    if (sub.id === submissionId) {
      return {
        ...sub,
        grade: Number(grade),
        feedback: feedback || '',
        status: 'graded',
        gradedAt: new Date().toISOString(),
      };
    }
    return sub;
  });

  writeDb(db);
  res.json({ success: true });
});

// Provas
app.post('/api/exams', (req, res) => {
  const examData = req.body;
  const db = readDb();

  const newExam = {
    ...examData,
    id: examData.id || ('exam_' + Date.now()),
    createdAt: new Date().toISOString(),
    isReleasedFor: examData.isReleasedFor || [],
    isUniversalRelease: Boolean(examData.isUniversalRelease),
  };

  db.exams.unshift(newExam);
  writeDb(db);
  res.status(201).json(newExam);
});

app.post('/api/exams/:id/toggle-release', (req, res) => {
  const { studentId } = req.body;
  const examId = req.params.id;
  const db = readDb();

  db.exams = db.exams.map(e => {
    if (e.id === examId) {
      if (!studentId) {
        const newUniversal = !e.isUniversalRelease;
        return {
          ...e,
          isUniversalRelease: newUniversal,
          isReleasedFor: newUniversal ? db.users.filter(u => u.role === 'student').map(s => s.id) : []
        };
      } else {
        const isRel = (e.isReleasedFor || []).includes(studentId);
        const newList = isRel
          ? (e.isReleasedFor || []).filter(id => id !== studentId)
          : [...(e.isReleasedFor || []), studentId];
        return {
          ...e,
          isReleasedFor: newList,
          isUniversalRelease: false,
        };
      }
    }
    return e;
  });

  writeDb(db);
  res.json({ success: true });
});

app.post('/api/exam-attempts', (req, res) => {
  const attempt = req.body;
  const db = readDb();

  const idx = db.examAttempts.findIndex(a => a.id === attempt.id);
  if (idx >= 0) {
    db.examAttempts[idx] = attempt;
  } else {
    db.examAttempts.unshift(attempt);
  }

  writeDb(db);
  res.status(201).json(attempt);
});

// IA Pedagógica: Geração de Lição Personalizada para Aluno Específico
app.post('/api/ai/generate-lesson', async (req, res) => {
  const {
    studentName = 'Estudante',
    studentId,
    subject = 'Inglês',
    topic = '',
    difficulty = 'Intermediário',
    goal = 'Fixação e prática de exercícios',
    additionalNotes = ''
  } = req.body;

  const cleanName = studentName.trim() || 'Estudante';
  const cleanTopic = topic.trim() || (subject === 'Inglês' ? 'Gramática e Conversação' : 'Resolução e Álgebra');

  // 1. Caso haja GEMINI_API_KEY configurada no servidor (ex: variáveis de ambiente no Render)
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Você é o assistente pedagógico de inteligência artificial da Profª Gabriela Sanchez (aulas particulares de Inglês e Matemática).
Gere uma lição completa, altamente didática, estruturada e personalizada para o(a) aluno(a) "${cleanName}".

Dados da Lição:
- Aluno: ${cleanName}
- Disciplina: ${subject}
- Tópico solicitado: ${cleanTopic}
- Nível de dificuldade: ${difficulty}
- Objetivo pedagógico: ${goal}
${additionalNotes ? `- Observações adicionais da professora: ${additionalNotes}` : ''}

Retorne estritamente um JSON no seguinte formato:
{
  "title": "[Lição Personalizada: ${cleanName}] Título claro e motivador",
  "content": "Texto completo da lição contendo:\\n🎯 OBJETIVO PEDAGÓGICO PARA ${cleanName.toUpperCase()}: ...\\n\\n📖 RESUMO TEÓRICO & PONTOS-CHAVE: ...\\n\\n📝 LISTA DE EXERCÍCIOS PRÁTICOS (4 a 5 exercícios graduais com enunciados claros): ...\\n\\n💡 CRITÉRIOS DE CORREÇÃO & DICAS DA PROFª GABRIELA SANCHEZ: ..."
}`;

      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (aiResponse.ok) {
        const json = await aiResponse.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            title: parsed.title,
            content: parsed.content,
            generatedBy: 'gemini'
          });
        }
      }
    } catch (aiErr) {
      console.warn('[AI] Falha na API Gemini, ativando motor pedagógico nativo:', aiErr.message);
    }
  }

  // 2. Motor Pedagógico Nativo Estruturado
  const title = `[Lição Personalizada: ${cleanName}] ${cleanTopic} (${difficulty})`;
  const isEng = subject === 'Inglês';

  const theory = isEng
    ? `Esta lição foi especialmente elaborada para aprofundar seu domínio sobre "${cleanTopic}".
A fluência se constrói na união de três competências fundamentais:
1. Precisão estrutural (regras e padrões gramaticais)
2. Aplicação contextualizada com vocabulário natural do cotidiano
3. Produção ativa e reflexão crítica

Observe os conectivos formais, tempos verbais adequados e procure ler os enunciados em voz alta para treinar pronúncia e ritmo.`
    : `Esta lição foi especialmente planejada para consolidar seu domínio sobre "${cleanTopic}".
Em Matemática, cada fórmula e teorema é uma ferramenta lógica:
1. Compreenda o porquê de cada passagem algébrica antes de aplicar a fórmula.
2. Identifique os dados fornecidos pelo enunciado e organize as variáveis.
3. Não omita etapas de cálculo: o desenvolvimento demonstra seu raciocínio analítico.`;

  const exercises = isEng
    ? `1. Questão Conceitual:
   Explique com suas palavras a importância de dominar "${cleanTopic}" na comunicação em inglês e dê 2 exemplos de situações do cotidiano onde este padrão é indispensável.

2. Prática Estrutural & Fixação:
   Complete as sentenças abaixo utilizando as estruturas corretas aprendidas em aula:
   a) If ${cleanName} had more preparation time, she/he ________ (deliver) an outstanding presentation.
   b) They have been working on the international assignment ________ last September.

3. Correção de Precisão:
   Identifique o erro gramatical em cada item e reescreva a forma corrigida com a justificativa.

4. Redação Aplicada & Desafio Criativo:
   Escreva um pequeno texto dissertativo (70 a 120 palavras) demonstrando o uso prático de "${cleanTopic}". Enfatize argumentos claros e conectores formais.`
    : `1. Fixação de Fórmulas e Conceitos:
   a) Enuncie a definição e propriedades fundamentais que regem "${cleanTopic}".
   b) Destaque qual é a armadilha ou erro mais frequente cometido ao resolver questões desse tipo.

2. Resolução Passo a Passo:
   Resolva as expressões propostas desenvolvendo todas as etapas algébricas e simplificando o resultado até a forma irredutível.

3. Problema Contextualizado:
   Uma situação prática do cotidiano envolvendo ${cleanName}: formule a equação ou modelo matemático correspondente, determine o conjunto solução e interprete o resultado obtido.

4. Desafio Analítico da Professora Gabriela:
   Demonstre matematicamente se a solução encontrada é única ou se existem outras possibilidades sob diferentes condições de contorno.`;

  const content = `🎯 OBJETIVO PEDAGÓGICO PARA ${cleanName.toUpperCase()}:
${goal}
${additionalNotes ? `\n📌 ORIENTAÇÃO ESPECIAL DA PROFª GABRIELA:\n"${additionalNotes}"\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 RESUMO TEÓRICO & PONTOS-CHAVE:
${theory}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 LISTA DE EXERCÍCIOS PRÁTICOS:
${exercises}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 CRITÉRIOS DE CORREÇÃO & DICAS DE ESTUDO DA PROFª GABRIELA SANCHEZ:
1. Resolução Completa: Envie o desenvolvimento passo a passo (não apenas o resultado final).
2. Formato de Entrega: Você pode responder na própria caixa de texto ou anexar fotos do caderno / arquivo em PDF.
3. Prazo de Entrega: Envie dentro do prazo estipulado para que possamos discutir o feedback detalhado na próxima aula!`;

  res.json({
    title,
    content,
    generatedBy: 'native-curriculum'
  });
});


/* ========================================================
   FRONTEND STATIC SERVING
======================================================== */
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`[EduProctor Server] Servidor e Banco de Dados rodando na porta ${PORT}`);
});
