import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { uploadFile } from '../../services/storageService';
import { generateAILesson } from '../../services/aiLessonService';
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
  AlertCircle,
  Sparkles,
  Trash2,
  User,
  Check,
  RefreshCw,
  Send
} from 'lucide-react';

export const TeacherAssignmentsTab = () => {
  const { assignments, createAssignment, deleteAssignment, submissions, students, gradeSubmission } = useData();

  // Modais de controle
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState('manual'); // 'manual' (upload próprio) | 'ai' (gerar com IA)
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null);
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Formulário de criação de tarefa
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Inglês');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedMode, setAssignedMode] = useState('all'); // 'all' ou 'specific'
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Parâmetros do Gerador de Lição por IA
  const [aiStudentId, setAiStudentId] = useState(students.length > 0 ? students[0].id : '');
  const [aiCustomStudentName, setAiCustomStudentName] = useState('');
  const [aiSubject, setAiSubject] = useState('Inglês');
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Intermediário');
  const [aiGoal, setAiGoal] = useState('Fixação e prática de exercícios');
  const [aiAdditionalNotes, setAiAdditionalNotes] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [aiTargetName, setAiTargetName] = useState('');

  // Sugestões rápidas de tópicos pedagógicos
  const topicSuggestions = {
    'Inglês': [
      'Conditionals (Zero, 1st & 2nd)',
      'Present Perfect vs. Simple Past',
      'Phrasal Verbs cotidianos',
      'Business English & E-mails',
      'Passive Voice & Formal Writing',
      'Reading & Interpretação de Texto'
    ],
    'Matemática': [
      'Equações de 2º Grau & Bhaskara',
      'Função Afim e Quadrática',
      'Geometria Plana & Pitágoras',
      'Matemática Financeira & Juros',
      'Geometria Espacial & Prismas',
      'Estatística Básica & Médias'
    ]
  };

  // Upload de arquivo anexado na tarefa
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

  // Abrir modal em modo manual
  const openManualCreate = () => {
    setCreateMode('manual');
    resetForm();
    setShowCreateModal(true);
  };

  // Abrir modal em modo IA
  const openAICreate = () => {
    setCreateMode('ai');
    resetForm();
    if (students.length > 0 && !aiStudentId) {
      setAiStudentId(students[0].id);
    }
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setUploadedFiles([]);
    setFormError('');
    setFormSuccess('');
    setAiGeneratedSuccess(false);
    setAiTopic('');
    setAiAdditionalNotes('');
    setAssignedMode('all');
    setSelectedStudentIds([]);
    setAiTargetName('');
  };

  // Disparar geração com IA
  const handleGenerateWithAI = async () => {
    setFormError('');
    setFormSuccess('');

    // Determina o nome do aluno alvo
    let studentName = '';
    let targetId = null;

    if (students.length > 0 && aiStudentId) {
      const found = students.find(s => s.id === aiStudentId);
      if (found) {
        studentName = found.name;
        targetId = found.id;
      }
    }

    if (!studentName) {
      studentName = aiCustomStudentName.trim() || 'Estudante';
    }

    setIsGeneratingAI(true);

    try {
      const generated = await generateAILesson({
        studentName,
        studentId: targetId,
        studentLevel: aiDifficulty,
        subject: aiSubject,
        topic: aiTopic,
        difficulty: aiDifficulty,
        goal: aiGoal,
        additionalNotes: aiAdditionalNotes
      });

      // Preenche os campos do formulário com o conteúdo gerado
      setTitle(generated.title);
      setDescription(generated.description);
      setSubject(aiSubject);
      setAiTargetName(studentName);

      // Data de entrega padrão: daqui a 7 dias
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 7);
      setDueDate(defaultDue.toISOString().split('T')[0]);

      // Atribui especificamente ao aluno selecionado se existir no banco
      if (targetId) {
        setAssignedMode('specific');
        setSelectedStudentIds([targetId]);
      } else {
        setAssignedMode('all');
        setSelectedStudentIds([]);
      }

      setAiGeneratedSuccess(true);
      setFormSuccess(`Lição pedagógica personalizada gerada com sucesso pela IA para ${studentName}! Você pode revisar o texto abaixo e fazer qualquer alteração antes de salvar.`);
    } catch (err) {
      console.error('Erro na geração da IA:', err);
      setFormError('Não foi possível gerar a lição neste momento. Tente novamente.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Salvar/publicar a lição no sistema
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim() || !dueDate) {
      setFormError('Preencha título, instruções/conteúdo e data limite de entrega.');
      return;
    }

    try {
      const isSpecific = assignedMode === 'specific' && selectedStudentIds.length > 0;
      const targetStudent = isSpecific
        ? (students.find(s => s.id === selectedStudentIds[0])?.name || aiTargetName)
        : (aiTargetName || null);

      await createAssignment({
        title: title.trim(),
        subject,
        description: description.trim(),
        dueDate,
        assignedTo: isSpecific ? selectedStudentIds : 'all',
        targetStudentName: targetStudent,
        generatedByAi: Boolean(aiGeneratedSuccess),
        attachments: uploadedFiles,
      });

      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Erro ao salvar a tarefa:', err);
      setFormError('Erro ao salvar a tarefa no servidor.');
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
      {/* Top Banner com Ações Claras */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            Módulo de Tarefas & Lições de Casa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publique materiais de estudo, suba seus arquivos em PDF/imagens ou gere lições exclusivas com IA para alunos específicos.
          </p>
        </div>

        {/* Botões de Ação da Professora */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={openManualCreate}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Subir Arquivo / Criar Manual</span>
          </button>

          <button
            onClick={openAICreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Pedir à IA Criar Lição ✨</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarefas Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50 text-indigo-400" />
            <p className="text-xs font-semibold text-slate-600">Nenhuma tarefa publicada até o momento.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Use os botões acima para subir um arquivo próprio ou pedir para a IA criar uma lição personalizada para seus alunos.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const subs = submissions.filter(s => s.assignmentId === assignment.id);
            const gradedCount = subs.filter(s => s.status === 'graded').length;
            const isEnglish = assignment.subject === 'Inglês';

            // Alunos atribuídos
            let targetLabel = 'Toda a turma';
            if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
              const names = assignment.assignedTo
                .map(id => students.find(s => s.id === id)?.name)
                .filter(Boolean);
              if (names.length > 0) {
                targetLabel = names.join(', ');
              } else if (assignment.targetStudentName) {
                targetLabel = assignment.targetStudentName;
              } else {
                targetLabel = `${assignment.assignedTo.length} aluno(s) específico(s)`;
              }
            } else if (assignment.targetStudentName) {
              targetLabel = assignment.targetStudentName;
            }

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Badges do Card */}
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isEnglish
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {assignment.subject}
                      </span>

                      {assignment.generatedByAi && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Sparkles className="w-2.5 h-2.5 mr-1 text-purple-600" />
                          IA Personalizada
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                      {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {/* Destinatário */}
                  <div className="mb-2 flex items-center text-[11px] text-indigo-700 font-semibold bg-indigo-50/70 px-2 py-1 rounded-md border border-indigo-100/80">
                    <User className="w-3 h-3 mr-1 text-indigo-500 shrink-0" />
                    <span className="truncate">Para: {targetLabel}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {assignment.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                    {assignment.description}
                  </p>

                  {/* Anexos da Tarefa */}
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center">
                        <Paperclip className="w-3 h-3 mr-1 text-slate-400" /> Anexos ({assignment.attachments.length}):
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

                {/* Card Footer com contagem de entregas e ações */}
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

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setViewSubmissionsFor(assignment)}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center space-x-1"
                      title="Ver entregas dos alunos"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Resoluções</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja excluir a lição "${assignment.title}"?`)) {
                          deleteAssignment(assignment.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          MODAL PRINCIPAL: CRIAR LIÇÃO (MANUAL OU COM IA)
         ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 overflow-y-auto max-h-[92vh]">
            
            {/* Header com Toggle das Duas Modalidades */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  {createMode === 'ai' ? 'Criar Lição com Inteligência Artificial' : 'Criar Tarefa / Subir Arquivo'}
                </h3>
                <p className="text-xs text-slate-500">
                  {createMode === 'ai'
                    ? 'A IA elabora o plano completo, teoria e exercícios sob medida para o aluno selecionado.'
                    : 'Escreva suas instruções e anexe seus arquivos em PDF, imagens ou documentos.'}
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Switch de Modalidade */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreateMode('manual')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  createMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Arquivo / Manual</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateMode('ai')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  createMode === 'ai'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir para IA Criar (Aluno) ✨</span>
              </button>
            </div>

            {/* Alertas */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* ====================================================
                BLOCO EXCLUSIVO DO MODO IA: FORMULÁRIO DE PEDIDO À IA
               ==================================================== */}
            {createMode === 'ai' && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                        Configuração do Prompt Pedagógico
                      </h4>
                      <p className="text-[11px] text-indigo-700/80">
                        Informe o aluno e o assunto para a IA gerar exercícios e explicações direcionadas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Seletor de Aluno Específico */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center">
                      <User className="w-3 h-3 mr-1 text-indigo-600" />
                      Aluno Específico Destinatário
                    </label>
                    {students.length > 0 ? (
                      <select
                        value={aiStudentId}
                        onChange={(e) => setAiStudentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={aiCustomStudentName}
                          onChange={(e) => setAiCustomStudentName(e.target.value)}
                          placeholder="Digite o nome do aluno (ex: João Silva)"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Nenhum aluno cadastrado ainda. A lição será gerada para este aluno e ficará salva!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Seletor de Disciplina */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Disciplina
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAiSubject('Inglês')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                          aiSubject === 'Inglês'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Inglês
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSubject('Matemática')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                          aiSubject === 'Matemática'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Matemática
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tópico / Conteúdo com Sugestões Rápidas */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tópico ou Conteúdo da Lição
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ex: Conditionals, Phrasal Verbs, Equações de 2º Grau..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Sugestões Rápidas em Pills */}
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Sugestões Rápidas para {aiSubject} (clique para preencher):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topicSuggestions[aiSubject].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAiTopic(sug)}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Nível de Dificuldade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nível do Aluno
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Iniciante / Básico">Iniciante / Básico (A1-A2)</option>
                      <option value="Intermediário">Intermediário (B1-B2)</option>
                      <option value="Avançado">Avançado (C1-C2 / Vestibular)</option>
                    </select>
                  </div>

                  {/* Objetivo Pedagógico */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Foco Pedagógico
                    </label>
                    <select
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Fixação e prática de exercícios">Fixação e prática de exercícios</option>
                      <option value="Reforço de dificuldades da última aula">Reforço de dificuldades da última aula</option>
                      <option value="Produção escrita e aplicação prática">Produção escrita e aplicação prática</option>
                      <option value="Raciocínio lógico e desenvolvimento passo a passo">Raciocínio lógico e desenvolvimento passo a passo</option>
                    </select>
                  </div>
                </div>

                {/* Observações Opcionais da Professora */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Orientações Específicas da Professora Gabriela (Opcional)
                  </label>
                  <input
                    type="text"
                    value={aiAdditionalNotes}
                    onChange={(e) => setAiAdditionalNotes(e.target.value)}
                    placeholder="Ex: Cobrar a regra de sinais, focar em e-mails corporativos, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Botão de Disparo da IA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                        <span>A IA está estruturando a lição personalizada sob medida...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Gerar Lição com IA para este Aluno ✨</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ====================================================
                FORMULÁRIO PRINCIPAL DE PUBLICAÇÃO (EDITÁVEL)
               ==================================================== */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {aiGeneratedSuccess && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600 shrink-0" />
                    <strong>Lição gerada com IA!</strong> Você pode revisar e editar qualquer trecho abaixo antes de publicar.
                  </span>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Exercícios de Fixação: Conditional Clauses (Grammar)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {/* Disciplina & Data Limite */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Instruções / Conteúdo da Lição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Conteúdo Completo, Explicações & Exercícios</span>
                  <span className="text-[10px] text-slate-400 font-normal">Editável a qualquer momento</span>
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique detalhadamente o que o aluno deve desenvolver, teoria resumida e lista de exercícios..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono leading-relaxed"
                ></textarea>
              </div>

              {/* Upload de Arquivos Próprios (PDF, Imagens, Documentos) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Anexar Arquivos Próprios (PDF, Imagens, Listas em Word)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 cursor-pointer transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">
                    {uploading ? 'Fazendo upload...' : 'Clique para selecionar arquivos do seu computador'}
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
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
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
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1 bg-slate-50/50">
                    {students.length === 0 ? (
                      <p className="text-[11px] text-slate-400 p-1">
                        Nenhum aluno cadastrado no momento. A tarefa ficará pública para os novos alunos ou vinculada ao perfil informado.
                      </p>
                    ) : (
                      students.map((st) => (
                        <label key={st.id} className="flex items-center space-x-2 text-xs text-slate-700 p-1.5 hover:bg-white rounded-lg cursor-pointer">
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
                          <span className="font-medium">{st.name}</span>
                          <span className="text-[10px] text-slate-400">({st.email})</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || isGeneratingAI}
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Lição</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: VISUALIZAR ENTREGAS DOS ALUNOS
         ======================================================== */}
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

      {/* ========================================================
          MODAL: ATRIBUIR NOTA E FEEDBACK
         ======================================================== */}
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
