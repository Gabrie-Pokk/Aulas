import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileQuestion,
  Plus,
  Clock,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';

export const TeacherExamsTab = () => {
  const { exams, createExam, toggleExamRelease, students, examAttempts } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Inglês');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  // Construtor de perguntas
  const [questions, setQuestions] = useState([
    {
      id: 'q_' + Date.now(),
      type: 'multiple_choice',
      points: 20,
      text: 'Exemplo: Which sentence uses the past perfect tense accurately?',
      options: [
        'She had already finished lunch when I arrived.',
        'She have finished lunch when I arrived.',
        'She was finished lunch when I arrived.',
        'She finished lunch when I had arrived.'
      ],
      correctAnswer: 0,
    }
  ]);

  const [formError, setFormError] = useState('');

  // Adicionar pergunta de múltipla escolha
  const addMultipleChoice = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        type: 'multiple_choice',
        points: 20,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      }
    ]);
  };

  // Adicionar pergunta dissertativa
  const addEssay = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        type: 'essay',
        points: 40,
        text: '',
      }
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
  };

  const updateOptionText = (qIdx, optIdx, val) => {
    setQuestions(prev => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const setCorrectOption = (qIdx, optIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctAnswer: optIdx };
      return copy;
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description) {
      setFormError('Preencha título e descrição da avaliação.');
      return;
    }

    if (questions.length === 0) {
      setFormError('Adicione pelo menos 1 questão à avaliação.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setFormError(`A questão #${i + 1} está com o enunciado vazio.`);
        return;
      }
    }

    await createExam({
      title,
      subject,
      description,
      timeLimitMinutes: Number(timeLimitMinutes),
      questions,
      isReleasedFor: [],
      isUniversalRelease: false,
      securityConfig: {
        requireFullscreen: true,
        requireAudioMonitoring: true,
        blockActions: true,
        audioThresholdDb: 68,
      }
    });

    // Reset
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileQuestion className="w-5 h-5 mr-2 text-indigo-600" />
            Módulo de Avaliações & Nivelamento Seguro
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie provas com múltipla escolha e redação, configure regras de proctoring e libere para os alunos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Avaliação</span>
        </button>
      </div>

      {/* Grid de Provas Cadastradas */}
      <div className="space-y-4">
        {exams.map((exam) => {
          const attempts = examAttempts.filter(a => a.examId === exam.id);
          const isEnglish = exam.subject === 'Inglês';

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Informações da Prova */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isEnglish
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {exam.subject}
                  </span>

                  <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {exam.timeLimitMinutes} minutos
                  </span>

                  <span className="inline-flex items-center text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    <HelpCircle className="w-3 h-3 mr-1 text-indigo-500" />
                    {exam.questions.length} questões
                  </span>

                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Shield className="w-3 h-3 mr-1 text-emerald-500" />
                    Proctoring Ativo
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {exam.description}
                </p>

                {/* Status de Realizações */}
                <div className="mt-3 flex items-center space-x-3 text-xs text-slate-500">
                  <span><strong>{attempts.length}</strong> provas realizadas</span>
                  <span>•</span>
                  <span>
                    Liberada para:{' '}
                    {exam.isUniversalRelease ? (
                      <strong className="text-emerald-600">Todos os Alunos</strong>
                    ) : (
                      <strong className="text-indigo-600">{exam.isReleasedFor?.length || 0} alunos</strong>
                    )}
                  </span>
                </div>
              </div>

              {/* Controles de Liberação por Aluno */}
              <div className="lg:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    Liberação por Aluno
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExamRelease(exam.id, null)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {exam.isUniversalRelease ? 'Restringir' : 'Liberar Todos'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {students.map((st) => {
                    const isReleased = exam.isUniversalRelease || (exam.isReleasedFor || []).includes(st.id);
                    return (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <span className="truncate max-w-[150px] font-semibold text-slate-800">
                          {st.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleExamRelease(exam.id, st.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition ${
                            isReleased
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isReleased ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Liberado</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Bloqueado</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Criar Nova Avaliação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <FileQuestion className="w-4 h-4 mr-2 text-indigo-600" />
                Criar Nova Avaliação / Prova
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Prova
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Teste de Nivelamento de Inglês (Writing & Reading)"
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
                    Tempo Limite (Minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruções e Ementa da Prova
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Orientações aos alunos sobre os tópicos cobrados e critérios..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              {/* Construtor de Perguntas */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Perguntas da Prova ({questions.length})
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={addMultipleChoice}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Múltipla Escolha</span>
                    </button>
                    <button
                      type="button"
                      onClick={addEssay}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Dissertativa</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto p-1">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          Questão #{qIdx + 1} ({q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remover questão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        placeholder="Enunciado da pergunta..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />

                      {/* Alternativas se Múltipla Escolha */}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-1.5 pl-2">
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Opções (marque o círculo na opção correta):
                          </span>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct_${q.id}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => setCorrectOption(qIdx, optIdx)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                                placeholder={`Alternativa ${String.fromCharCode(65 + optIdx)}`}
                                className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition"
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
