export const SEED_USERS = [
  {
    id: 'user_prof_gabriela',
    name: 'Profª Gabriela Sanchez',
    email: 'familiapokk@gmail.com',
    password: '201150Az@$#',
    role: 'teacher',
    avatar: null,
    subjects: ['Inglês', 'Matemática'],
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user_student_maria',
    name: 'Maria Silva',
    email: 'maria.silva@eduproctor.com',
    password: '123',
    role: 'student',
    grade: '3º Ano Médio / Nível B2',
    avatar: null,
    createdAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'user_student_lucas',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@eduproctor.com',
    password: '123',
    role: 'student',
    grade: '2º Ano Médio / Nível B1',
    avatar: null,
    createdAt: '2026-09-03T14:30:00Z',
  },
  {
    id: 'user_student_beatriz',
    name: 'Beatriz Souza',
    email: 'beatriz.souza@eduproctor.com',
    password: '123',
    role: 'student',
    grade: '1º Ano Médio / Nível A2',
    avatar: null,
    createdAt: '2026-09-04T09:15:00Z',
  },
];

export const SEED_ASSIGNMENTS = [
  {
    id: 'assign_eng_01',
    title: 'Reading & Synthesis: Artificial Intelligence and Language Learning',
    subject: 'Inglês',
    description: 'Leia o texto anexo e desenvolva uma redação (mínimo de 200 palavras) abordando o impacto das novas tecnologias no aprendizado de idiomas. Foque no uso de conectivos formais e estruturas condicionais (Second & Third Conditionals).',
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
        name: 'Maria_Silva_Redacao_Ingles.pdf',
        size: '640 KB',
        type: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ],
    status: 'graded',
    grade: 9.5,
    feedback: 'Excelente trabalho, Maria! O uso das condicionais ficou impecável e a argumentação foi muito coesa.'
  }
];

export const SEED_EXAMS = [
  {
    id: 'exam_placement_eng_01',
    title: 'Avaliação de Nivelamento de Inglês (Diagnóstico Grammar & Writing)',
    subject: 'Inglês',
    description: 'Teste diagnóstico para mapeamento de competências linguísticas, gramática, interpretação de texto e produção escrita.',
    timeLimitMinutes: 30,
    isReleasedFor: ['user_student_maria'],
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
      },
      {
        id: 'q5',
        type: 'essay',
        points: 40,
        text: 'Writing Task: "Some people believe that total fluency in a second language can only be achieved by living in an English-speaking country, while others argue modern digital tools and dedicated tutoring are just as effective." Present your perspective in English (100–180 words).',
      }
    ]
  },
  {
    id: 'exam_math_01',
    title: 'Exame de Diagnóstico e Raciocínio Matemático',
    subject: 'Matemática',
    description: 'Avaliação de álgebra, funções quadráticas e geometria.',
    timeLimitMinutes: 40,
    isReleasedFor: [],
    isUniversalRelease: false,
    securityConfig: {
      requireFullscreen: true,
      requireAudioMonitoring: true,
      blockActions: true,
      audioThresholdDb: 68,
    },
    createdAt: '2026-10-03T10:00:00',
    questions: [
      {
        id: 'qm1',
        type: 'multiple_choice',
        points: 25,
        text: 'Considere a função quadrática f(x) = -2x² + 8x + 10. Qual é o valor máximo atingido por f(x)?',
        options: ['18', '16', '10', '8'],
        correctAnswer: 0,
      },
      {
        id: 'qm2',
        type: 'multiple_choice',
        points: 25,
        text: 'Se log₂(x) + log₂(x - 2) = 3, qual é o valor real de x?',
        options: ['x = 2', 'x = 4', 'x = -2 ou x = 4', 'x = 8'],
        correctAnswer: 1,
      },
      {
        id: 'qm3',
        type: 'essay',
        points: 50,
        text: 'Questão Dissertativa: Em um triângulo retângulo, a hipotenusa mede 13 cm e um dos catetos mede 5 cm. Demonstre o cálculo do outro cateto e calcule a área desse triângulo.',
      }
    ]
  }
];

export const SEED_EXAM_ATTEMPTS = [];
