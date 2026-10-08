import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SEED_USERS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_EXAMS,
  SEED_EXAM_ATTEMPTS
} from '../services/mockData';
import { isFirebaseConfigured, db } from '../services/firebase';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  ASSIGNMENTS: 'eduproctor_assignments',
  SUBMISSIONS: 'eduproctor_submissions',
  EXAMS: 'eduproctor_exams',
  EXAM_ATTEMPTS: 'eduproctor_exam_attempts',
  STUDENTS: 'eduproctor_students',
};

const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState(() =>
    getStored(STORAGE_KEYS.STUDENTS, SEED_USERS.filter(u => u.role === 'student'))
  );

  const [assignments, setAssignments] = useState(() =>
    getStored(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS)
  );

  const [submissions, setSubmissions] = useState(() =>
    getStored(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS)
  );

  const [exams, setExams] = useState(() =>
    getStored(STORAGE_KEYS.EXAMS, SEED_EXAMS)
  );

  const [examAttempts, setExamAttempts] = useState(() =>
    getStored(STORAGE_KEYS.EXAM_ATTEMPTS, SEED_EXAM_ATTEMPTS)
  );

  // Sincroniza mudanças no LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAM_ATTEMPTS, JSON.stringify(examAttempts));
  }, [examAttempts]);

  // Se o Firebase Firestore estiver ativo, faz leitura inicial opcional
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const syncFirebase = async () => {
      try {
        const examsSnap = await getDocs(collection(db, 'exams'));
        if (!examsSnap.empty) {
          const list = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setExams(list);
        }
      } catch (err) {
        console.warn('Sincronização Firestore ignorada:', err);
      }
    };
    syncFirebase();
  }, []);

  /**
   * Criar nova Lição / Tarefa
   */
  const createAssignment = async (newAssignment) => {
    const assignmentWithId = {
      ...newAssignment,
      id: 'assign_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setAssignments(prev => [assignmentWithId, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'assignments', assignmentWithId.id), assignmentWithId);
      } catch (err) {
        console.error('Erro ao salvar tarefa no Firebase:', err);
      }
    }

    return assignmentWithId;
  };

  /**
   * Excluir Lição
   */
  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  /**
   * Aluno entrega Lição
   */
  const submitAssignment = async ({ assignmentId, studentId, studentName, studentEmail, textNotes, files }) => {
    const newSub = {
      id: 'sub_' + Date.now(),
      assignmentId,
      studentId,
      studentName,
      studentEmail,
      submittedAt: new Date().toISOString(),
      textNotes: textNotes || '',
      files: files || [],
      status: 'submitted',
      grade: null,
      feedback: null,
    };

    setSubmissions(prev => {
      // Remove envio prévio do mesmo aluno para essa lição se houver
      const filtered = prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentId));
      return [newSub, ...filtered];
    });

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'submissions', newSub.id), newSub);
      } catch (err) {
        console.error('Erro ao salvar entrega no Firebase:', err);
      }
    }

    return newSub;
  };

  /**
   * Professor corrige entrega e dá nota
   */
  const gradeSubmission = async (submissionId, { grade, feedback }) => {
    setSubmissions(prev =>
      prev.map(sub => {
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
      })
    );

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'submissions', submissionId), {
          grade: Number(grade),
          feedback: feedback || '',
          status: 'graded',
          gradedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Erro ao atualizar nota no Firebase:', err);
      }
    }
  };

  /**
   * Criar nova Avaliação / Prova
   */
  const createExam = async (examData) => {
    const examWithId = {
      ...examData,
      id: 'exam_' + Date.now(),
      createdAt: new Date().toISOString(),
      isReleasedFor: examData.isReleasedFor || [],
      isUniversalRelease: Boolean(examData.isUniversalRelease),
    };

    setExams(prev => [examWithId, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'exams', examWithId.id), examWithId);
      } catch (err) {
        console.error('Erro ao criar prova no Firebase:', err);
      }
    }

    return examWithId;
  };

  /**
   * Liberar / Bloquear prova para um aluno específico ou universalmente
   */
  const toggleExamRelease = async (examId, studentId = null) => {
    let updatedExam = null;

    setExams(prev =>
      prev.map(e => {
        if (e.id === examId) {
          if (!studentId) {
            // Alterna liberação global para todos os alunos
            const newUniversal = !e.isUniversalRelease;
            updatedExam = {
              ...e,
              isUniversalRelease: newUniversal,
              isReleasedFor: newUniversal ? students.map(s => s.id) : []
            };
            return updatedExam;
          } else {
            // Alterna para um aluno específico
            const alreadyReleased = (e.isReleasedFor || []).includes(studentId);
            const newList = alreadyReleased
              ? (e.isReleasedFor || []).filter(id => id !== studentId)
              : [...(e.isReleasedFor || []), studentId];

            updatedExam = {
              ...e,
              isReleasedFor: newList,
              isUniversalRelease: false,
            };
            return updatedExam;
          }
        }
        return e;
      })
    );

    if (isFirebaseConfigured && db && updatedExam) {
      try {
        await updateDoc(doc(db, 'exams', examId), {
          isReleasedFor: updatedExam.isReleasedFor,
          isUniversalRelease: updatedExam.isUniversalRelease
        });
      } catch (err) {
        console.error('Erro ao atualizar permissão da prova no Firebase:', err);
      }
    }
  };

  /**
   * Registra início ou conclusão de tentativa de prova
   */
  const saveExamAttempt = async (attempt) => {
    setExamAttempts(prev => {
      const idx = prev.findIndex(a => a.id === attempt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = attempt;
        return copy;
      }
      return [attempt, ...prev];
    });

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'examAttempts', attempt.id), attempt);
      } catch (err) {
        console.error('Erro ao salvar tentativa no Firebase:', err);
      }
    }
  };

  /**
   * Adiciona um evento no log de integridade / anti-cola
   */
  const addProctorLog = (attemptId, logEntry) => {
    const fullLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      ...logEntry,
    };

    setExamAttempts(prev =>
      prev.map(a => {
        if (a.id === attemptId) {
          const updatedLogs = [...(a.proctorLogs || []), fullLog];
          // Recalcula nível de integridade se necessário
          let integrityLevel = a.integrityLevel || 'high';
          const highFlags = updatedLogs.filter(l => l.severity === 'high').length;
          if (highFlags >= 2) integrityLevel = 'low';
          else if (highFlags === 1 || updatedLogs.length >= 3) integrityLevel = 'medium';

          return {
            ...a,
            integrityLevel,
            status: integrityLevel === 'low' ? 'flagged' : a.status,
            proctorLogs: updatedLogs,
          };
        }
        return a;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        students,
        setStudents,
        assignments,
        submissions,
        exams,
        examAttempts,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        createExam,
        toggleExamRelease,
        saveExamAttempt,
        addProctorLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de um DataProvider');
  return ctx;
};
