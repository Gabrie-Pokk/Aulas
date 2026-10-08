import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ExamScreen } from './components/exam/ExamScreen';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Calculator,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Eye,
  Mic,
  Maximize2
} from 'lucide-react';

const MainLayout = () => {
  const { currentUser, isTeacher, isStudent, quickLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeExam, setActiveExam] = useState(null);

  // Se o aluno iniciou uma prova, a tela de proctoring assume o controle total
  if (activeExam) {
    return (
      <ExamScreen
        exam={activeExam}
        onExitExam={() => setActiveExam(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentUser ? (
          isTeacher ? (
            <TeacherDashboard />
          ) : (
            <StudentDashboard onStartExam={(exam) => setActiveExam(exam)} />
          )
        ) : (
          /* Landing de Boas-vindas caso deslogado */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-in fade-in duration-300">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>EduProctor Engine • Integridade em Provas Particulares</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Plataforma de Ensino & Avaliações com{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Proctoring Avançado
                </span>
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Desenvolvida para aulas particulares de <strong>Inglês</strong> e <strong>Matemática</strong>. Gerencie tarefas com envio de arquivos (PDF e imagens), avalie resoluções e aplique testes de nivelamento com monitoramento de abas, tela cheia e áudio ambiente em tempo real.
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => quickLogin('teacher')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Acessar como Profª Gabriela Sanchez</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin('student_maria')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Acessar como Aluno (Maria Silva)</span>
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Lições de Inglês & Matemática
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envie lições com PDFs e imagens. O aluno responde com upload de arquivos próprios e recebe notas com feedbacks pedagógicos.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Anti-Cheat de Alta Fidelidade
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bloqueio de tela cheia obrigatório, detecção de mudança de abas (<code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">visibilitychange</code>) e perda de foco de janelas.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Monitoramento Acústico (Web Audio)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Análise de volume e decibéis por AnalyserNode em tempo real. Picos sonoros e conversas suspeitas geram flags automáticas no relatório do professor.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">EduProctor</span>
            <span>• Plataforma de Aulas Particulares & Proctoring</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Ambiente Seguro com Tailwind CSS & React</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Anti-Cheat Engine Ativo
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
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
