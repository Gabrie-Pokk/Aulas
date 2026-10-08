import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TeacherStudentsTab } from './TeacherStudentsTab';
import { TeacherAssignmentsTab } from './TeacherAssignmentsTab';
import { TeacherExamsTab } from './TeacherExamsTab';
import { TeacherProctorLogsTab } from './TeacherProctorLogsTab';
import {
  Users,
  BookOpen,
  FileQuestion,
  ShieldAlert,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { students, assignments, submissions, exams, examAttempts } = useData();
  const [activeTab, setActiveTab] = useState('assignments'); // 'students' | 'assignments' | 'exams' | 'proctor'

  // Métricas
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const pendingGrading = submissions.filter(s => s.status !== 'graded').length;
  const totalExams = exams.length;
  const flaggedAttempts = examAttempts.filter(a => a.integrityLevel === 'low').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>Painel de Gestão Docente & Proctoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Olá, {currentUser?.name || 'Professor'}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80 max-w-xl">
              Gerencie suas turmas particulares de Inglês e Matemática, envie tarefas com anexos, configure testes de nivelamento e audite ocorrências anti-cola em tempo real.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Alunos</span>
              <span className="text-xl font-black text-white">{totalStudents}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Tarefas</span>
              <span className="text-xl font-black text-white">{totalAssignments}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">A Corrigir</span>
              <span className="text-xl font-black text-amber-300">{pendingGrading}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Fraudes</span>
              <span className="text-xl font-black text-rose-300">{flaggedAttempts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-4">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lições & Tarefas</span>
          {pendingGrading > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {pendingGrading}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'exams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Avaliações & Nivelamento</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alunos & Liberação</span>
        </button>

        <button
          onClick={() => setActiveTab('proctor')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'proctor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoria Anti-Cola</span>
          {flaggedAttempts > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold animate-pulse">
              {flaggedAttempts} alertas
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div>
        {activeTab === 'assignments' && <TeacherAssignmentsTab />}
        {activeTab === 'exams' && <TeacherExamsTab />}
        {activeTab === 'students' && <TeacherStudentsTab />}
        {activeTab === 'proctor' && <TeacherProctorLogsTab />}
      </div>
    </div>
  );
};
