import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { uploadFile } from '../../services/storageService';
import {
  BookOpen,
  Plus,
  Paperclip,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  X,
  Eye,
  Award,
  Download,
  AlertCircle
} from 'lucide-react';

export const TeacherAssignmentsTab = () => {
  const { assignments, createAssignment, deleteAssignment, submissions, students, gradeSubmission } = useData();

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null);
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Form de criação de tarefa
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Inglês');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedMode, setAssignedMode] = useState('all'); // 'all' ou array de ids
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formError, setFormError] = useState('');

  // Lidar com upload de arquivo na criação da tarefa
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await uploadFile(file, 'assignments');
        setUploadedFiles(prev => [...prev, uploaded]);
      }
    } catch (err) {
      console.error('Erro no upload do arquivo:', err);
      setFormError('Erro ao fazer upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !dueDate) {
      setFormError('Preencha título, descrição e prazo de entrega.');
      return;
    }

    try {
      await createAssignment({
        title,
        subject,
        description,
        dueDate,
        assignedTo: assignedMode === 'all' ? 'all' : selectedStudentIds,
        attachments: uploadedFiles,
      });

      // Reset
      setTitle('');
      setDescription('');
      setDueDate('');
      setUploadedFiles([]);
      setShowCreateModal(false);
    } catch (err) {
      setFormError('Erro ao salvar a tarefa.');
    }
  };

  // Submeter nota e feedback
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingSub) return;

    await gradeSubmission(gradingSub.id, {
      grade: gradeInput,
      feedback: feedbackInput,
    });

    setGradingSub(null);
    setGradeInput('');
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            Módulo de Tarefas & Lições de Casa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publique materiais de estudo, listas de exercícios e receba as entregas com resolução dos alunos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Tarefa</span>
        </button>
      </div>

      {/* Grid de Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map((assignment) => {
          const subs = submissions.filter(s => s.assignmentId === assignment.id);
          const gradedCount = subs.filter(s => s.status === 'graded').length;
          const isEnglish = assignment.subject === 'Inglês';

          return (
            <div
              key={assignment.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
            >
              <div>
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
                  <div className="text-[11px] text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Entrega: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                  {assignment.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Anexos da Tarefa */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center">
                      <Paperclip className="w-3 h-3 mr-1" /> Anexos ({assignment.attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {assignment.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-medium border border-slate-200 transition"
                        >
                          <FileText className="w-3 h-3 mr-1 text-slate-400" />
                          <span className="truncate max-w-[130px]">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer com contagem de entregas */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-slate-900">{subs.length}</span>{' '}
                  <span className="text-slate-500">entregas</span>
                  {subs.length > 0 && (
                    <span className="text-emerald-600 font-semibold ml-1.5">
                      ({gradedCount} corrigidas)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setViewSubmissionsFor(assignment)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Resoluções</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Criar Nova Tarefa */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                Criar Nova Lição / Tarefa
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Exercícios de Fixação: Conditional Clauses (Grammar)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Inglês">Inglês</option>
                    <option value="Matemática">Matemática</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data Limite de Entrega
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruções e Descrição
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique detalhadamente o que o aluno deve desenvolver, critérios e leituras..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              {/* Upload de Anexos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arquivos Anexos (PDF, Imagens, Documentos)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">
                    {uploading ? 'Fazendo upload...' : 'Clique para selecionar arquivos'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF, PNG, JPG de até 15MB</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Lista de anexos carregados */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate font-medium">{f.name}</span>
                          <span className="text-[10px] text-slate-400">({f.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(i)}
                          className="text-rose-500 hover:text-rose-700 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Atribuir para Alunos Específicos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destinatários da Tarefa
                </label>
                <div className="flex items-center space-x-4 mb-2">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="assignedMode"
                      value="all"
                      checked={assignedMode === 'all'}
                      onChange={() => setAssignedMode('all')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Todos os Alunos</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="assignedMode"
                      value="specific"
                      checked={assignedMode === 'specific'}
                      onChange={() => setAssignedMode('specific')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Alunos Específicos</span>
                  </label>
                </div>

                {assignedMode === 'specific' && (
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                    {students.map((st) => (
                      <label key={st.id} className="flex items-center space-x-2 text-xs text-slate-700 p-1 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds(prev => [...prev, st.id]);
                            } else {
                              setSelectedStudentIds(prev => prev.filter(id => id !== st.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{st.name} ({st.email})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition"
                >
                  Publicar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Entregas dos Alunos */}
      {viewSubmissionsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Entregas Recebidas: {viewSubmissionsFor.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewSubmissionsFor.subject} • Prazo: {new Date(viewSubmissionsFor.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setViewSubmissionsFor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Entregas */}
            {(() => {
              const currentSubs = submissions.filter(s => s.assignmentId === viewSubmissionsFor.id);
              if (currentSubs.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Nenhum aluno entregou esta tarefa até o momento.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {currentSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-500">
                            Entregue em: {new Date(sub.submittedAt).toLocaleString('pt-BR')}
                          </div>
                        </div>

                        {sub.status === 'graded' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Nota: {sub.grade}/10
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Aguardando Correção
                          </span>
                        )}
                      </div>

                      {/* Texto / Anotações do aluno */}
                      {sub.textNotes && (
                        <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                          <strong className="block text-[11px] text-slate-500 mb-1">Anotações do Aluno:</strong>
                          {sub.textNotes}
                        </div>
                      )}

                      {/* Arquivos enviados pelo aluno */}
                      {sub.files && sub.files.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                            Arquivos Enviados pelo Aluno:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sub.files.map((file, fIdx) => (
                              <a
                                key={fIdx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-xs font-semibold text-indigo-700 shadow-2xs transition"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                <span>{file.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">({file.size})</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback existente */}
                      {sub.feedback && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                          <strong>Seu Feedback:</strong> {sub.feedback}
                        </div>
                      )}

                      {/* Botão de Avaliar */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setGradingSub(sub);
                            setGradeInput(sub.grade !== null ? String(sub.grade) : '10');
                            setFeedbackInput(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-2xs flex items-center space-x-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{sub.status === 'graded' ? 'Alterar Nota & Feedback' : 'Atribuir Nota'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Atribuir Nota e Feedback */}
      {gradingSub && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Avaliar Entrega de {gradingSub.studentName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Atribua a pontuação e oriente o estudante sobre os pontos de melhoria.
            </p>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nota (0 a 10)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Feedback Pedagógico
                </label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Escreva comentários construtivos sobre a resolução..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
