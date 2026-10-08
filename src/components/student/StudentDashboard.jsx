import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { uploadFile } from '../../services/storageService';
import {
  BookOpen,
  FileQuestion,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Upload,
  FileText,
  Download,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

export const StudentDashboard = ({ onStartExam }) => {
  const { currentUser } = useAuth();
  const { assignments, submissions, submitAssignment, exams, examAttempts } = useData();

  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'exams'
  const [subjectFilter, setSubjectFilter] = useState('all'); // 'all' | 'Inglês' | 'Matemática'

  // Modal de Entrega de Tarefa
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtra as tarefas atribuídas a este aluno ou a 'all'
  const myAssignments = assignments.filter(a => {
    const isAssigned = a.assignedTo === 'all' || (Array.isArray(a.assignedTo) && a.assignedTo.includes(currentUser.id));
    if (!isAssigned) return false;
    if (subjectFilter !== 'all' && a.subject !== subjectFilter) return false;
    return true;
  });

  // Filtra as provas
  const myExams = exams.filter(e => {
    if (subjectFilter !== 'all' && e.subject !== subjectFilter) return false;
    return true;
  });

  // Upload do arquivo de entrega do aluno
  const handleStudentFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadError('');
    try {
      for (const file of files) {
        const uploaded = await uploadFile(file, `submissions/${currentUser.id}`);
        setUploadedFiles(prev => [...prev, uploaded]);
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setUploadError('Erro ao carregar o arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmSubmission = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!submissionText.trim() && uploadedFiles.length === 0) {
      setUploadError('Por favor anexe um arquivo (PDF/Imagem) ou escreva uma mensagem com sua resolução.');
      return;
    }

    await submitAssignment({
      assignmentId: submittingAssignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      textNotes: submissionText,
      files: uploadedFiles,
    });

    setSuccessMsg('Tarefa entregue com sucesso! O professor foi notificado.');
    setTimeout(() => setSuccessMsg(''), 4000);

    setSubmittingAssignment(null);
    setSubmissionText('');
    setUploadedFiles([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Área do Aluno • Ensino Personalizado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bem-vindo(a), {currentUser?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Acompanhe suas tarefas de Inglês e Matemática, envie suas resoluções e realize suas avaliações de nivelamento com segurança.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">Tarefas Ativas</span>
              <span className="text-2xl font-black text-white">{myAssignments.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">Avaliações</span>
              <span className="text-2xl font-black text-white">{myExams.length}</span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Tabs */}
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Minhas Tarefas & Lições</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'exams'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Avaliações & Nivelamento</span>
          </button>
        </div>

        {/* Subject Filter Pill */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              subjectFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas as Matérias
          </button>
          <button
            onClick={() => setSubjectFilter('Inglês')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              subjectFilter === 'Inglês' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inglês
          </button>
          <button
            onClick={() => setSubjectFilter('Matemática')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              subjectFilter === 'Matemática' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matemática
          </button>
        </div>
      </div>

      {/* ========================================================
          ABA 1: LIÇÕES E TAREFAS DO ALUNO
         ======================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {myAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50 text-indigo-400" />
              <p className="text-xs font-semibold">Nenhuma tarefa atribuída no momento para este filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myAssignments.map((assignment) => {
                const sub = submissions.find(s => s.assignmentId === assignment.id && s.studentId === currentUser.id);
                const isEnglish = assignment.subject === 'Inglês';

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isEnglish
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {assignment.subject}
                        </span>

                        <span className="text-[11px] text-slate-500 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Prazo: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {assignment.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {assignment.description}
                      </p>

                      {/* Anexos fornecidos pelo professor */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                            Materiais de Estudo do Professor:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-xs font-semibold text-indigo-700 shadow-2xs transition"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                <span className="truncate max-w-[160px]">{file.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({file.size})</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status de Entrega Atual */}
                      {sub && (
                        <div className="mb-4 p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                              Sua Entrega Realizada
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          {sub.status === 'graded' ? (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-emerald-900">Nota Atribuída:</span>
                                <span className="text-sm font-black text-emerald-700">{sub.grade} / 10</span>
                              </div>
                              {sub.feedback && (
                                <p className="text-[11px] text-emerald-800 leading-snug">
                                  <strong>Feedback do Professor:</strong> "{sub.feedback}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Aguardando correção pelo professor
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botão de Entregar */}
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittingAssignment(assignment);
                          setSubmissionText(sub?.textNotes || '');
                          setUploadedFiles(sub?.files || []);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm ${
                          sub
                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{sub ? 'Reenviar Resolução' : 'Entregar Tarefa'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ABA 2: AVALIAÇÕES E TESTES DE NIVELAMENTO DO ALUNO
         ======================================================== */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-indigo-950 mb-0.5">
                Protocolo de Avaliações Seguras (Proctoring)
              </strong>
              Para manter o padrão de excelência nas aulas particulares, as provas operam com monitoramento em tela cheia obrigatória, verificação de áudio ambiente e bloqueio de cópia.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myExams.map((exam) => {
              const attempt = examAttempts.find(a => a.examId === exam.id && a.studentId === currentUser.id);
              // Verifica se a prova foi liberada para este aluno ou universalmente
              const isReleased = exam.isUniversalRelease || (exam.isReleasedFor || []).includes(currentUser.id);
              const isEnglish = exam.subject === 'Inglês';

              return (
                <div
                  key={exam.id}
                  className={`rounded-2xl border p-6 transition flex flex-col justify-between ${
                    attempt
                      ? 'bg-white border-slate-200 shadow-xs'
                      : isReleased
                      ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-slate-50/80 border-slate-200 opacity-80'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isEnglish
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {exam.subject}
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-500 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {exam.timeLimitMinutes} min
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {exam.questions.length} questões
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                      {exam.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {exam.description}
                    </p>

                    {/* Status da Tentativa se já realizada */}
                    {attempt ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                            Avaliação Concluída
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(attempt.submittedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-600">Pontuação Objetiva:</span>
                          <span className="font-black text-indigo-700 text-sm">
                            {attempt.autoScore} pts
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Botão de Iniciar Prova (Controlado pelo Professor!) */}
                  <div className="pt-4 border-t border-slate-100">
                    {attempt ? (
                      <div className="text-center text-xs font-semibold text-slate-500 py-1 flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Respostas já enviadas e registradas</span>
                      </div>
                    ) : isReleased ? (
                      <button
                        type="button"
                        onClick={() => onStartExam(exam)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group"
                      >
                        <Unlock className="w-4 h-4 text-indigo-200" />
                        <span>Iniciar Avaliação com Monitoramento</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-600 flex items-center justify-center space-x-1.5 mb-0.5">
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Acesso Bloqueado no Momento</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          O botão será ativado assim que o professor liberar o exame para você no painel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ENTREGAR TAREFA (Upload de PDF/Imagem + Texto)
         ======================================================== */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Entregar Tarefa: {submittingAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {submittingAssignment.subject} • Prazo: {new Date(submittingAssignment.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSubmission} className="space-y-4">
              {/* Upload de Arquivos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload do Arquivo com a Resolução (PDF ou Foto/Imagem)
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-slate-50/50 hover:bg-indigo-50/30 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploading ? 'Fazendo upload seguro...' : 'Clique para selecionar seu arquivo'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Envie seu PDF digitado ou fotos do caderno/lista de exercícios (PNG, JPG)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleStudentFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Arquivos Selecionados */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate font-semibold text-slate-800">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mensagem / Comentário para o Professor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comentários ou Resolução em Texto (Opcional)
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Escreva dúvidas, considerações ou insira diretamente suas respostas aqui..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar para Correção</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
