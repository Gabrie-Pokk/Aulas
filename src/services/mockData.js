export const SEED_USERS = [
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
];

export const SEED_ASSIGNMENTS = [
  {
    id: 'assign_eng_01',
    title: 'Reading & Synthesis: Artificial Intelligence and Language Learning',
    subject: 'Inglês',
    description: 'Read the attached article and write an essay (minimum 250 words) discussing how AI tools influence personal study habits. Focus on conditionals (second & third conditionals) and advanced linking words.',
    dueDate: '2026-10-15T23:59:00',
    assignedTo: 'all', // ou lista de ids
    createdAt: '2026-10-02T14:00:00',
    attachments: [
      {
        id: 'att_1',
        name: 'AI_in_Education_Cambridge_Paper.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'att_2',
        name: 'Essay_Rubric_and_Vocabulary_Guide.png',
        size: '450 KB',
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
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
  },
  {
    id: 'assign_eng_02',
    title: 'Listening & Idiomatic Expressions: Business Communication',
    subject: 'Inglês',
    description: 'Analise os 10 diálogos práticos fornecidos no guia anexo e elabore 5 frases contextuais usando expressões como "touch base", "ballpark figure" e "circle back".',
    dueDate: '2026-10-22T23:59:00',
    assignedTo: ['user_student_maria', 'user_student_beatriz'],
    createdAt: '2026-10-06T16:00:00',
    attachments: [
      {
        id: 'att_4',
        name: 'Business_Idioms_Handbook.pdf',
        size: '890 KB',
        type: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      }
    ]
  }
];

export const SEED_SUBMISSIONS = [
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
  },
  {
    id: 'sub_02',
    assignmentId: 'assign_math_01',
    studentId: 'user_student_lucas',
    studentName: 'Lucas Mendes',
    studentEmail: 'lucas.mendes@eduproctor.com',
    submittedAt: '2026-10-07T14:10:00',
    textNotes: 'Enviei fotos nítidas do meu caderno com as contas desenvolvidas.',
    files: [
      {
        name: 'Resolucao_Lucas_Matematica_Caderno.jpg',
        size: '1.8 MB',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
      }
    ],
    status: 'submitted',
    grade: null,
    feedback: null
  }
];

export const SEED_EXAMS = [
  {
    id: 'exam_placement_eng_01',
    title: 'Avaliação de Nivelamento de Inglês (CEFR A1-C1 Diagnostic)',
    subject: 'Inglês',
    description: 'Teste diagnóstico abrangente para mapeamento de competências linguísticas, gramática, interpretação de texto e produção escrita.',
    timeLimitMinutes: 30,
    isReleasedFor: ['user_student_maria', 'user_student_beatriz'], // Liberada para Maria e Beatriz inicialmente!
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
        explanation: 'Third conditional requires past perfect (had + past participle) in the if-clause.'
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
        explanation: 'Negative adverbs like "seldom" at the start of a sentence trigger subject-auxiliary inversion: "have I witnessed".'
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        points: 15,
        text: 'Identify the synonym that best substitutes the word "METICULOUS" in the context: "The researcher conducted a meticulous investigation of the grammar corpus."',
        options: [
          'Superficial',
          'Painstaking',
          'Spontaneous',
          'Ambiguous'
        ],
        correctAnswer: 1,
        explanation: '"Painstaking" means extremely careful and thorough, just like "meticulous".'
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        points: 15,
        text: 'Which sentence correctly uses the passive voice with a modal verb in the past?',
        options: [
          'The documents must be signed yesterday.',
          'The documents should have been delivered before noon.',
          'The documents were should delivered before noon.',
          'The documents might had been delivered.'
        ],
        correctAnswer: 1,
        explanation: 'Modal perfect passive structure: modal + have been + past participle (should have been delivered).'
      },
      {
        id: 'q5',
        type: 'essay',
        points: 40,
        text: 'Writing Task: "Some people believe that total fluency in a second language can only be achieved by living in an English-speaking country, while others argue modern digital tools and dedicated tutoring are just as effective." Present your perspective in English (100–180 words), illustrating your stance with at least one concrete example.',
        expectedKeywords: ['fluency', 'environment', 'practice', 'immersion', 'tutoring', 'technology']
      }
    ]
  },
  {
    id: 'exam_math_diagnostic_01',
    title: 'Exame de Diagnóstico e Raciocínio Matemático Avançado',
    subject: 'Matemática',
    description: 'Avaliação de álgebra, funções, geometria e resolução analítica de problemas para nivelamento.',
    timeLimitMinutes: 45,
    isReleasedFor: ['user_student_lucas'],
    isUniversalRelease: false,
    securityConfig: {
      requireFullscreen: true,
      requireAudioMonitoring: true,
      blockActions: true,
      audioThresholdDb: 70,
    },
    createdAt: '2026-10-03T10:00:00',
    questions: [
      {
        id: 'qm1',
        type: 'multiple_choice',
        points: 20,
        text: 'Considere a função quadrática f(x) = -2x² + 8x + 10. Qual é o valor máximo atingido por f(x)?',
        options: [
          '18',
          '16',
          '10',
          '8'
        ],
        correctAnswer: 0,
        explanation: 'O x do vértice é -b/(2a) = -8/(2*-2) = 2. O y máximo é f(2) = -2(4) + 8(2) + 10 = -8 + 16 + 10 = 18.'
      },
      {
        id: 'qm2',
        type: 'multiple_choice',
        points: 20,
        text: 'Se log₂(x) + log₂(x - 2) = 3, qual é o valor real de x?',
        options: [
          'x = 2',
          'x = 4',
          'x = -2 ou x = 4',
          'x = 8'
        ],
        correctAnswer: 1,
        explanation: 'log₂(x(x - 2)) = 3 => x² - 2x = 8 => x² - 2x - 8 = 0 => (x - 4)(x + 2) = 0. Como x > 2 pela condição de existência do logaritmo, x = 4.'
      },
      {
        id: 'qm3',
        type: 'multiple_choice',
        points: 20,
        text: 'Em um triângulo retângulo, a hipotenusa mede 13 cm e um dos catetos mede 5 cm. Qual é a área desse triângulo?',
        options: [
          '30 cm²',
          '60 cm²',
          '32.5 cm²',
          '26 cm²'
        ],
        correctAnswer: 0,
        explanation: 'Pelo teorema de Pitágoras: 13² = 5² + c² => 169 = 25 + c² => c² = 144 => c = 12 cm. Área = (base * altura)/2 = (5 * 12)/2 = 30 cm².'
      },
      {
        id: 'qm4',
        type: 'essay',
        points: 40,
        text: 'Questão Dissertativa: Um fabricante vende um produto com custo unitário fixo de R$ 30,00 mais custos fixos mensais de R$ 5.000,00. A função demanda estimada relaciona o preço de venda unitário P com a quantidade vendida Q por: P(Q) = 150 - 0,5Q. Determine a quantidade Q que maximiza o lucro mensal e calcule o lucro máximo obtido. Apresente todo o raciocínio analítico.',
        expectedKeywords: ['Lucro', 'Receita', 'Vértice', 'Derivada', 'Q = 120']
      }
    ]
  }
];

export const SEED_EXAM_ATTEMPTS = [
  {
    id: 'att_exam_001',
    examId: 'exam_placement_eng_01',
    studentId: 'user_student_maria',
    studentName: 'Maria Silva',
    startedAt: '2026-10-07T10:00:00',
    submittedAt: '2026-10-07T10:24:35',
    answers: {
      q1: 0, // correta
      q2: 1, // correta
      q3: 1, // correta
      q4: 1, // correta
      q5: 'In my perspective, while spending time abroad accelerates natural conversation instincts, contemporary digital resources combined with high-level personalized tutoring provide an equally rigorous path to fluency. For instance, structured speaking sessions allow immediate feedback on nuances and phonetics that casual day-to-day interactions abroad often overlook.'
    },
    autoScore: 60, // 4 de 4 certas nas objetivas (60 pts)
    essayScore: 38,
    totalScore: 98,
    status: 'completed',
    integrityLevel: 'high', // high = seguro, medium = avisos leves, low = alto risco
    proctorLogs: [
      {
        id: 'log_01',
        timestamp: '10:05:12',
        type: 'audio_spike',
        severity: 'low',
        details: 'Breve ruído sonoro ambiente registrado (64 dB)',
        volumeDb: 64
      },
      {
        id: 'log_02',
        timestamp: '10:14:40',
        type: 'blocked_action',
        severity: 'low',
        details: 'Tentativa de clique direito (menu de contexto desabilitado)',
        volumeDb: 0
      }
    ]
  },
  {
    id: 'att_exam_002',
    examId: 'exam_placement_eng_01',
    studentId: 'user_student_beatriz',
    studentName: 'Beatriz Souza',
    startedAt: '2026-10-07T15:30:00',
    submittedAt: '2026-10-07T15:58:12',
    answers: {
      q1: 0,
      q2: 0, // errou
      q3: 1,
      q4: 0, // errou
      q5: 'Learning online is good because you can repeat lessons many times and practice whenever you want.'
    },
    autoScore: 30,
    essayScore: 25,
    totalScore: 55,
    status: 'flagged',
    integrityLevel: 'low', // muitas infrações
    proctorLogs: [
      {
        id: 'log_10',
        timestamp: '15:32:10',
        type: 'fullscreen_exit',
        severity: 'high',
        details: 'Aluno saiu do modo Tela Cheia sem autorização',
        volumeDb: 0
      },
      {
        id: 'log_11',
        timestamp: '15:34:02',
        type: 'focus_loss',
        severity: 'high',
        details: 'Aba em segundo plano detectada (visibilitychange) - possível consulta a outra aba',
        volumeDb: 0
      },
      {
        id: 'log_12',
        timestamp: '15:42:15',
        type: 'audio_spike',
        severity: 'high',
        details: 'Suspeita de comunicação por voz contínua (82 dB detectado por > 3 seg)',
        volumeDb: 82
      },
      {
        id: 'log_13',
        timestamp: '15:45:20',
        type: 'blocked_action',
        severity: 'medium',
        details: 'Tentativa de atalho de cópia (Ctrl+C / Cmd+C bloqueado)',
        volumeDb: 0
      }
    ]
  }
];
