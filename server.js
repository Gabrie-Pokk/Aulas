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

// Diretório e arquivo do banco de dados persistente
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Garante que o diretório data exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dados sementes iniciais se o arquivo não existir
const DEFAULT_DB = {
  users: [
    {
      id: 'user_prof_gabriela',
      name: 'Profª Gabriela Sanchez',
      email: 'gabriela.sanchez@eduproctor.com',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      subjects: ['Inglês', 'Matemática'],
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'user_student_maria',
      name: 'Maria Silva',
      email: 'maria.silva@eduproctor.com',
      role: 'student',
      grade: '3º Ano Médio / Nível B2',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-09-02T11:00:00Z',
    },
    {
      id: 'user_student_lucas',
      name: 'Lucas Mendes',
      email: 'lucas.mendes@eduproctor.com',
      role: 'student',
      grade: '2º Ano Médio / Nível B1',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-09-03T14:30:00Z',
    },
    {
      id: 'user_student_beatriz',
      name: 'Beatriz Souza',
      email: 'beatriz.souza@eduproctor.com',
      role: 'student',
      grade: '1º Ano Médio / Nível A2',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-09-04T09:15:00Z',
    },
  ],
  assignments: [
    {
      id: 'assign_eng_01',
      title: 'Reading & Synthesis: Artificial Intelligence and Language Learning',
      subject: 'Inglês',
      description: 'Read the attached article and write an essay (minimum 250 words) discussing how AI tools influence personal study habits. Focus on conditionals (second & third conditionals) and advanced linking words.',
      dueDate: '2026-10-15T23:59:00',
      assignedTo: 'all',
      createdAt: '2026-10-02T14:00:00',
      attachments: [
        {
          id: 'att_1',
          name: 'AI_in_Education_Cambridge_Paper.pdf',
          size: '1.2 MB',
          type: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        }
      ]
    },
    {
      id: 'assign_math_01',
      title: 'Estudo de Funções Quadráticas e Otimização de Máximos e Mínimos',
      subject: 'Matemática',
      description: 'Resolva a lista de exercícios 04 do módulo de álgebra. Demonstre os cálculos passo a passo para o cálculo de vértices da parábola, raízes reais e interpretação gráfica em problemas econômicos.',
      dueDate: '2026-10-18T23:59:00',
      assignedTo: 'all',
      createdAt: '2026-10-04T09:30:00',
      attachments: [
        {
          id: 'att_3',
          name: 'Lista_Exercicios_04_Funcoes_Quadraticas.pdf',
          size: '2.4 MB',
          type: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        }
      ]
    }
  ],
  submissions: [
    {
      id: 'sub_01',
      assignmentId: 'assign_eng_01',
      studentId: 'user_student_maria',
      studentName: 'Maria Silva',
      studentEmail: 'maria.silva@eduproctor.com',
      submittedAt: '2026-10-06T18:24:00',
      textNotes: 'Olá professora Gabriela! Segue a minha redação sobre o impacto da IA nos estudos de inglês. Foquei nos conectivos e nas estruturas condicionais como solicitado.',
      files: [
        {
          name: 'Maria_Silva_Essay_AI_Impacts.pdf',
          size: '640 KB',
          type: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
      ],
      status: 'graded',
      grade: 9.5,
      feedback: 'Excelente trabalho, Maria! O uso do third conditional ficou impecável e a argumentação foi muito coesa.'
    }
  ],
  exams: [
    {
      id: 'exam_placement_eng_01',
      title: 'Avaliação de Nivelamento de Inglês (CEFR A1-C1 Diagnostic)',
      subject: 'Inglês',
      description: 'Teste diagnóstico abrangente para mapeamento de competências linguísticas, gramática, interpretação de texto e produção escrita.',
      timeLimitMinutes: 30,
      isReleasedFor: ['user_student_maria', 'user_student_beatriz'],
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
          options: [
            'had studied',
            'would study',
            'has studied',
            'studied'
          ],
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
  examAttempts: [
    {
      id: 'att_exam_001',
      examId: 'exam_placement_eng_01',
      studentId: 'user_student_maria',
      studentName: 'Maria Silva',
      startedAt: '2026-10-07T10:00:00',
      submittedAt: '2026-10-07T10:24:35',
      answers: { q1: 0, q2: 1, q5: 'Dedicated tutoring provides immediate structured feedback.' },
      autoScore: 30,
      totalScore: 70,
      status: 'completed',
      integrityLevel: 'high',
      proctorLogs: []
    }
  ]
};

// Funções de leitura e escrita do banco de dados
const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
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

// Inicializa banco de dados
readDb();

/* ========================================================
   ROTAS DA API REST DO BANCO DE DADOS
======================================================== */

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Obter todos os dados do banco
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

// Cadastrar Aluno
app.post('/api/register', (req, res) => {
  const { name, email, grade, avatar } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  }

  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'student', // Sempre aluno
    grade: grade || 'Ensino Médio',
    avatar: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

// Criar Tarefa
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

// Excluir Tarefa
app.delete('/api/assignments/:id', (req, res) => {
  const db = readDb();
  db.assignments = db.assignments.filter(a => a.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Aluno entrega tarefa
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

  // Remove envio anterior do mesmo aluno para essa tarefa se houver
  db.submissions = db.submissions.filter(
    s => !(s.assignmentId === newSub.assignmentId && s.studentId === newSub.studentId)
  );

  db.submissions.unshift(newSub);
  writeDb(db);
  res.status(201).json(newSub);
});

// Professora avalia entrega
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

// Criar Prova
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

// Liberar / Bloquear Prova para Aluno
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

// Salvar / Finalizar Tentativa de Prova (com logs de proctoring)
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

/* ========================================================
   FRONTEND STATIC SERVING (Para deploy unificado no Render)
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
