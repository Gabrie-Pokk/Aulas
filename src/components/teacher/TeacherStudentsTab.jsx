import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  BookOpen,
  Mail,
  GraduationCap,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const TeacherStudentsTab = () => {
  const { students, exams, toggleExamRelease, submissions, examAttempts } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Alunos Matriculados & Liberação de Avaliações
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie o acesso dos estudantes às provas de nivelamento e monitore a assiduidade.
          </p>
        </div>

        {/* Exam Release Quick Selector */}
        {exams.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Prova Selecionada:
            </span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.subject}: {ex.title}
                </option>
              ))}
            </select>

            {currentExam && (
              <button
                type="button"
                onClick={() => toggleExamRelease(currentExam.id, null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs ${
                  currentExam.isUniversalRelease
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <span>{currentExam.isUniversalRelease ? 'Bloquear para Todos' : 'Liberar para Todos'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aluno por nome, e-mail ou escolaridade..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Students Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 mx-auto flex items-center justify-center mb-3">
              <Users className="w-7 h-7 opacity-75" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum aluno cadastrado no momento</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Compartilhe o link do seu site com seus estudantes. Assim que eles se cadastrarem na tela inicial, eles aparecerão aqui nesta tabela automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Estudante</th>
                  <th className="px-6 py-3.5">Escolaridade / Nível</th>
                  <th className="px-6 py-3.5">Tarefas Entregues</th>
                  <th className="px-6 py-3.5">Status Prova Selecionada</th>
                  <th className="px-6 py-3.5 text-right">Controle de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const studentSubmissions = submissions.filter(s => s.studentId === student.id);
                  const isExamReleased = currentExam?.isUniversalRelease || (currentExam?.isReleasedFor || []).includes(student.id);
                  const hasTakenExam = examAttempts.some(a => a.studentId === student.id && a.examId === currentExam?.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <GraduationCap className="w-3 h-3 mr-1 text-slate-500" />
                          {student.grade || 'Ensino Médio'}
                        </span>
                      </td>

                      {/* Submissions count */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          {studentSubmissions.length} entregas
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {studentSubmissions.filter(s => s.status === 'graded').length} corrigidas
                        </div>
                      </td>

                      {/* Exam status */}
                      <td className="px-6 py-4">
                        {hasTakenExam ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <CheckCircle className="w-3 h-3 mr-1 text-indigo-600" />
                            Prova Realizada
                          </span>
                        ) : isExamReleased ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                            Acesso Liberado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 mr-1 text-slate-400" />
                            Bloqueada
                          </span>
                        )}
                      </td>

                      {/* Toggle button */}
                      <td className="px-6 py-4 text-right">
                        {currentExam && (
                          <button
                            type="button"
                            onClick={() => toggleExamRelease(currentExam.id, student.id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                              isExamReleased
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {isExamReleased ? (
                              <>
                                <ToggleRight className="w-4 h-4 mr-1.5 text-rose-600" />
                                <span>Bloquear</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-1.5 text-emerald-600" />
                                <span>Liberar Prova</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
