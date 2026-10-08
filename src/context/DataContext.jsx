import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SEED_USERS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_EXAMS,
  SEED_EXAM_ATTEMPTS
} from '../services/mockData';

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
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) {
      // Remove alunos e entregas de teste antigos
      return parsed.filter(item =>
        !['user_student_maria', 'user_student_lucas', 'user_student_beatriz'].includes(item.id || item.studentId)
      );
    }
    return parsed;
  } catch {
    return fallback;
  }
};

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState(() =>
    getStored(STORAGE_KEYS.STUDENTS, [])
  );

  const [assignments, setAssignments] = useState(() =>
    getStored(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS)
  );

  const [submissions, setSubmissions] = useState(() =>
    getStored(STORAGE_KEYS.SUBMISSIONS, [])
  );

  const [exams, setExams] = useState(() =>
    getStored(STORAGE_KEYS.EXAMS, SEED_EXAMS)
  );

  const [examAttempts, setExamAttempts] = useState(() =>
    getStored(STORAGE_KEYS.EXAM_ATTEMPTS, [])
  );

  // Sincroniza periodicamente com o banco de dados do servidor (/api/data)
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        if (data.assignments && data.assignments.length > 0) setAssignments(data.assignments);
        setSubmissions(data.submissions || []);
        if (data.exams && data.exams.length > 0) setExams(data.exams);
        setExamAttempts(data.examAttempts || []);
      }
    } catch {
      // Silencioso se estiver operando sem o backend ativo
    }
  }, []);

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 15000); // Polling leve a cada 15s para sincronizar novas entregas
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Persistência no LocalStorage de contingência
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

    try {
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentWithId),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar tarefa com servidor:', err);
    }

    return assignmentWithId;
  };

  /**
   * Excluir Lição
   */
  const deleteAssignment = async (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
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
      const filtered = prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentId));
      return [newSub, ...filtered];
    });

    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar entrega com servidor:', err);
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

    try {
      await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, grade: Number(grade), feedback }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar nota com servidor:', err);
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

    try {
      await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examWithId),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar prova com servidor:', err);
    }

    return examWithId;
  };

  /**
   * Liberar / Bloquear prova para um aluno específico ou universalmente
   */
  const toggleExamRelease = async (examId, studentId = null) => {
    setExams(prev =>
      prev.map(e => {
        if (e.id === examId) {
          if (!studentId) {
            const newUniversal = !e.isUniversalRelease;
            return {
              ...e,
              isUniversalRelease: newUniversal,
              isReleasedFor: newUniversal ? students.map(s => s.id) : []
            };
          } else {
            const alreadyReleased = (e.isReleasedFor || []).includes(studentId);
            const newList = alreadyReleased
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
      })
    );

    try {
      await fetch(`/api/exams/${examId}/toggle-release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar liberação de prova:', err);
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

    try {
      await fetch('/api/exam-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar tentativa de prova:', err);
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
          let integrityLevel = a.integrityLevel || 'high';
          const highFlags = updatedLogs.filter(l => l.severity === 'high').length;
          if (highFlags >= 2) integrityLevel = 'low';
          else if (highFlags === 1 || updatedLogs.length >= 3) integrityLevel = 'medium';

          const updatedAttempt = {
            ...a,
            integrityLevel,
            status: integrityLevel === 'low' ? 'flagged' : a.status,
            proctorLogs: updatedLogs,
          };

          // Sincroniza em background
          fetch('/api/exam-attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAttempt),
          }).catch(() => {});

          return updatedAttempt;
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
        syncWithServer,
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
