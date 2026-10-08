import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { AuthPage } from './components/auth/AuthPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ExamScreen } from './components/exam/ExamScreen';

const MainLayout = () => {
  const { currentUser, isTeacher } = useAuth();
  const [activeExam, setActiveExam] = useState(null);

  // 1. Se o usuário não está autenticado, abre DIRETAMENTE na tela de Login!
  if (!currentUser) {
    return <AuthPage />;
  }

  // 2. Se o aluno está em prova, a tela de proctoring assume o controle total
  if (activeExam) {
    return (
      <ExamScreen
        exam={activeExam}
        onExitExam={() => setActiveExam(null)}
      />
    );
  }

  // 3. Usuário logado: exibe o painel correspondente (Professora ou Aluno)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1">
        {isTeacher ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard onStartExam={(exam) => setActiveExam(exam)} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduProctor • Aulas Particulares da Profª Gabriela Sanchez</span>
          <span className="text-[11px] text-slate-400">Ambiente Seguro de Ensino & Avaliações</span>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
