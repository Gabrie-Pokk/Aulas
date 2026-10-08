import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAudioProctor } from '../../hooks/useAudioProctor';
import { useProctorSecurity } from '../../hooks/useProctorSecurity';
import { ProctorMonitorHUD } from '../proctoring/ProctorMonitorHUD';
import { ProctorViolationOverlay } from '../proctoring/ProctorViolationOverlay';
import {
  ShieldCheck,
  ShieldAlert,
  Mic,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

export const ExamScreen = ({ exam, onExitExam }) => {
  const { currentUser } = useAuth();
  const { saveExamAttempt, addProctorLog } = useData();

  // Estados de Fluxo da Prova: 'preflight' | 'active' | 'completed'
  const [phase, setPhase] = useState('preflight');
  const [answers, setAnswers] = useState({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [attemptId] = useState(() => 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  const [violationLogs, setViolationLogs] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Timer de tempo restante (em segundos)
  const initialSeconds = (exam.timeLimitMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  // Elemento container para fullscreen
  const examContainerRef = useRef(null);

  // Callback de eventos de segurança (fullscreen, foco, teclas)
  const handleSecurityEvent = useCallback((event) => {
    if (phase !== 'active') return;

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      type: event.type,
      severity: event.severity || 'medium',
      details: event.details,
      volumeDb: event.volumeDb || 0,
    };

    setViolationLogs(prev => [...prev, logEntry]);
    addProctorLog(attemptId, logEntry);
  }, [phase, attemptId, addProctorLog]);

  // Audio Proctor Hook
  const {
    hasPermission: hasAudioPermission,
    currentVolume,
    currentDb,
    isSpeakingDetected,
    audioError,
    startMonitoring: startAudio,
    stopMonitoring: stopAudio
  } = useAudioProctor({
    enabled: phase === 'active',
    thresholdDb: exam.securityConfig?.audioThresholdDb || 68,
    spikeDurationMs: 1800,
    onAudioSpike: (spikeData) => {
      handleSecurityEvent({
        type: 'audio_spike',
        severity: 'high',
        details: `Ruído de voz contínuo detectado (${spikeData.volumeDb} dB). Possível comunicação verbal.`,
        volumeDb: spikeData.volumeDb,
      });
    }
  });

  // Security Guard Hook (Fullscreen, abas, bloqueios)
  const {
    isFullscreen,
    recentWarning,
    enterFullscreen,
    exitFullscreen,
    showWarning,
  } = useProctorSecurity({
    isActive: phase === 'active',
    onSecurityEvent: handleSecurityEvent,
    targetElementRef: examContainerRef,
  });

  // Timer Countdown Effect
  useEffect(() => {
    if (phase !== 'active') return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Submissão forçada por tempo esgotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Formatação do tempo MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Iniciar Prova após Checklist
  const handleStartExam = async () => {
    if (!hasAudioPermission) {
      await startAudio();
    }
    const fullOk = await enterFullscreen();
    if (!fullOk) {
      showWarning('Por favor aceite o modo Tela Cheia para iniciar.', 'error');
      return;
    }

    setPhase('active');

    // Inicializa a tentativa no banco
    saveExamAttempt({
      id: attemptId,
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      answers: {},
      proctorLogs: [],
      integrityLevel: 'high',
    });
  };

  // Resposta selecionada para questão múltipla escolha
  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  // Resposta escrita para questão dissertativa
  const handleEssayChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Finalizar e Submeter Prova
  const handleSubmitExam = async (forcedByTime = false) => {
    let autoScore = 0;
    let maxAutoScore = 0;

    // Calcula nota das questões objetivas
    exam.questions.forEach(q => {
      if (q.type === 'multiple_choice') {
        maxAutoScore += (q.points || 10);
        if (answers[q.id] === q.correctAnswer) {
          autoScore += (q.points || 10);
        }
      }
    });

    const highSeverityViolations = violationLogs.filter(v => v.severity === 'high').length;
    let integrityLevel = 'high';
    if (highSeverityViolations >= 2) integrityLevel = 'low';
    else if (highSeverityViolations === 1 || violationLogs.length >= 3) integrityLevel = 'medium';

    const finalAttempt = {
      id: attemptId,
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      submittedAt: new Date().toISOString(),
      status: integrityLevel === 'low' ? 'flagged' : 'completed',
      answers,
      autoScore,
      maxAutoScore,
      essayScore: null, // Pendente de correção manual do professor
      totalScore: autoScore,
      integrityLevel,
      proctorLogs: violationLogs,
      forcedByTime,
    };

    await saveExamAttempt(finalAttempt);

    stopAudio();
    await exitFullscreen();
    setPhase('completed');

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignora erro em ambientes sem suporte
    }
  };

  const currentQ = exam.questions[activeQuestionIdx];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      ref={examContainerRef}
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none proctor-exam-mode"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ========================================================
          FASE 1: PRE-FLIGHT CHECKLIST (Antes de Iniciar)
         ======================================================== */}
      {phase === 'preflight' && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-radial from-slate-800 to-slate-950">
          <div className="max-w-2xl w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ambiente Seguro de Avaliação
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                {exam.title} • <span className="text-indigo-400 font-semibold">{exam.subject}</span>
              </p>
            </div>

            {/* Requisitos de Segurança */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center">
                    1. Modo Tela Cheia Obrigatório
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    A prova só pode ser realizada em tela cheia (Fullscreen). Sair da tela cheia ou alternar para outra janela bloqueará a avaliação e registrará uma infração no sistema para o professor.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      2. Monitoramento de Áudio Ambiente
                    </h4>
                    {hasAudioPermission ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Microfone OK
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={startAudio}
                        className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-600 hover:bg-indigo-500 text-white transition"
                      >
                        Autorizar Microfone
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    O microfone será analisado por Web Audio API para detecção de conversas ou auxílio de terceiros.
                  </p>
                  {audioError && (
                    <p className="text-xs text-rose-400 mt-1 font-semibold">{audioError}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    3. Bloqueio de Teclas e Cópia
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Clique direito, atalhos de copiar/colar (Ctrl+C, Ctrl+V) e seleção de texto estão totalmente bloqueados para garantir a lisura da prova.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkbox Termos */}
            <label className="flex items-start space-x-3 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300 leading-snug">
                Estou ciente de que realizarei esta prova sob monitoramento em tempo real (Proctoring) e me comprometo a não consultar materiais externos ou terceiros durante a execução.
              </span>
            </label>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onExitExam}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700/60 text-xs font-bold transition text-center"
              >
                Voltar ao Painel
              </button>

              <button
                type="button"
                disabled={!acceptedTerms}
                onClick={handleStartExam}
                className="w-full flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Ativar Tela Cheia e Iniciar Prova</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FASE 2: REALIZAÇÃO ATIVA DA PROVA COM PROCTORING
         ======================================================== */}
      {phase === 'active' && (
        <>
          {/* Header Fixo de Proctoring */}
          <ProctorMonitorHUD
            isFullscreen={isFullscreen}
            volumeLevel={currentVolume}
            currentDb={currentDb}
            isSpeakingDetected={isSpeakingDetected}
            violationCount={violationLogs.length}
            timeLeftFormatted={formatTime(secondsRemaining)}
            recentWarning={recentWarning}
            examTitle={exam.title}
            subject={exam.subject}
          />

          {/* Overlay de Bloqueio em caso de Saída de Tela Cheia */}
          {!isFullscreen && (
            <ProctorViolationOverlay
              reason="fullscreen"
              onRestoreFullscreen={enterFullscreen}
              violationCount={violationLogs.length}
            />
          )}

          {/* Corpo da Prova */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            {/* Barra de Progresso e Navegação entre Questões */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 mb-6 shadow-md">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-300">
                  Questão {activeQuestionIdx + 1} de {totalQuestions}
                </span>
                <span className="text-slate-400">
                  {answeredCount} de {totalQuestions} respondidas
                </span>
              </div>

              {/* Botões numerados das questões */}
              <div className="flex flex-wrap gap-2">
                {exam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isCurrent = idx === activeQuestionIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                          : isAnswered
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                          : 'bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card da Questão Ativa */}
            <div className="flex-1 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {currentQ.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa / Redação'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Valor: {currentQ.points || 10} pontos
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-6">
                  {currentQ.text}
                </h3>

                {/* Opções de Múltipla Escolha */}
                {currentQ.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-center space-x-3.5 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                              : 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Campo Dissertativo */}
                {currentQ.type === 'essay' && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Sua resposta dissertativa:</span>
                      <span>
                        {(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} palavras
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                      placeholder="Escreva sua resposta de forma clara e detalhada. Lembre-se que atalhos de cópia e colagem externos são bloqueados."
                      className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
                    ></textarea>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Esta resposta será avaliada diretamente pelo professor após a entrega.
                    </p>
                  </div>
                )}
              </div>

              {/* Controles de Navegação Inferiores */}
              <div className="mt-8 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center space-x-3">
                  {activeQuestionIdx < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <span>Próxima</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-emerald-600/30"
                    >
                      <Send className="w-4 h-4" />
                      <span>Concluir e Entregar Prova</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Modal de Confirmação de Entrega */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Deseja finalizar sua avaliação?</h3>
                <p className="text-xs text-slate-300 mt-2">
                  Você respondeu <strong className="text-indigo-400">{answeredCount}</strong> de <strong>{totalQuestions}</strong> questões. Após a entrega, suas respostas e o relatório de monitoramento serão enviados ao professor.
                </p>

                <div className="mt-6 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                  >
                    Revisar Respostas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      handleSubmitExam(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                  >
                    Confirmar Envio
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          FASE 3: TELA DE CONCLUSÃO E FEEDBACK
         ======================================================== */}
      {phase === 'completed' && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-900">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-black text-white">
              Avaliação Enviada com Sucesso!
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              Suas respostas foram registradas com segurança no sistema.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-900 border border-slate-700/80 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Avaliação:</span>
                <span className="font-bold text-white">{exam.title}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Aluno:</span>
                <span className="font-bold text-white">{currentUser.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Questões Respondidas:</span>
                <span className="font-bold text-emerald-400">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                <span>Registro de Integridade:</span>
                <span className={`font-bold ${violationLogs.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {violationLogs.length === 0 ? '100% Conforme (Sem ocorrências)' : `${violationLogs.length} avisos registrados`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExitExam}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Retornar ao Meu Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
