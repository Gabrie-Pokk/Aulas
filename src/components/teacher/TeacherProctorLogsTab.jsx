import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  Maximize2,
  Mic,
  Copy,
  User,
  X,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const TeacherProctorLogsTab = () => {
  const { examAttempts, exams } = useData();
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const getIntegrityBadge = (level) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            100% Íntegra
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Alerta Moderado
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Alto Risco de Cola
          </span>
        );
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'fullscreen_exit':
        return <Maximize2 className="w-4 h-4 text-rose-500" />;
      case 'focus_loss':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'audio_spike':
        return <Mic className="w-4 h-4 text-violet-500" />;
      case 'blocked_action':
      default:
        return <Copy className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" />
            Auditoria de Integridade & Relatórios Anti-Cola (Proctoring)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitore o histórico detalhado de tentativas, trocas de abas, picos de som ambiente e tela cheia.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-semibold">
            Total de Provas Avaliadas: <strong className="text-slate-900">{examAttempts.length}</strong>
          </div>
        </div>
      </div>

      {/* Lista de Tentativas */}
      {examAttempts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-500" />
          <p className="text-xs font-semibold">Nenhuma avaliação foi realizada até o momento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Aluno</th>
                  <th className="px-6 py-3.5">Avaliação</th>
                  <th className="px-6 py-3.5">Data / Horário</th>
                  <th className="px-6 py-3.5">Pontuação Objetiva</th>
                  <th className="px-6 py-3.5">Nível de Integridade</th>
                  <th className="px-6 py-3.5 text-right">Ocorrências / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {examAttempts.map((attempt) => {
                  const examObj = exams.find(e => e.id === attempt.examId);
                  const incidentCount = attempt.proctorLogs?.length || 0;

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{attempt.studentName}</div>
                        <div className="text-[11px] text-slate-500">{attempt.studentEmail}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {attempt.examTitle || examObj?.title || 'Avaliação de Nivelamento'}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {attempt.subject || examObj?.subject || 'Geral'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString('pt-BR')
                          : 'Em andamento'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-700">
                          {attempt.autoScore !== undefined ? `${attempt.autoScore} pts` : '--'}
                        </div>
                        {attempt.totalScore !== undefined && (
                          <div className="text-[10px] text-slate-500">
                            Total: {attempt.totalScore} pts
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {getIntegrityBadge(attempt.integrityLevel || 'high')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttempt(attempt)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Auditar ({incidentCount})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Relatório Completo de Auditoria do Aluno */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" />
                  Dossiê de Auditoria: {selectedAttempt.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAttempt.examTitle} • Finalizada em {new Date(selectedAttempt.submittedAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo do Score e Integridade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pontuação Objetiva
                </span>
                <span className="text-lg font-black text-indigo-700">
                  {selectedAttempt.autoScore || 0} pts
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nível de Integridade
                </span>
                <div className="mt-1">
                  {getIntegrityBadge(selectedAttempt.integrityLevel || 'high')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ocorrências Detectadas
                </span>
                <span className="text-lg font-black text-slate-800">
                  {selectedAttempt.proctorLogs?.length || 0} eventos
                </span>
              </div>
            </div>

            {/* Linha do Tempo dos Incidentes Anti-Cola */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-indigo-600" />
                Linha do Tempo dos Eventos de Segurança (Anti-Cheat Logs)
              </h4>

              {(!selectedAttempt.proctorLogs || selectedAttempt.proctorLogs.length === 0) ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Nenhuma infração registrada durante o exame. O aluno permaneceu em tela cheia e em silêncio.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {selectedAttempt.proctorLogs.map((log, lIdx) => (
                    <div
                      key={log.id || lIdx}
                      className={`p-3 rounded-xl border text-xs flex items-start space-x-3 transition ${
                        log.severity === 'high'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                          : log.severity === 'medium'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="p-1 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5">
                        {getLogIcon(log.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {log.type === 'fullscreen_exit'
                              ? 'Saída de Tela Cheia'
                              : log.type === 'focus_loss'
                              ? 'Perda de Foco / Troca de Janela'
                              : log.type === 'audio_spike'
                              ? 'Pico de Áudio / Conversa Detectada'
                              : 'Ação Bloqueada (Atalho / Tecla)'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 font-semibold">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-600 leading-relaxed text-[11px]">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Respostas Dadas pelo Aluno */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                Respostas Submetidas pelo Estudante
              </h4>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                {selectedAttempt.answers && Object.entries(selectedAttempt.answers).map(([qKey, ansVal], aIdx) => (
                  <div key={qKey} className="pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-800">Questão #{aIdx + 1}:</span>{' '}
                    {typeof ansVal === 'number' ? (
                      <span className="font-semibold text-indigo-700">
                        Opção Selecionada: {String.fromCharCode(65 + ansVal)}
                      </span>
                    ) : (
                      <div className="mt-1 p-2 rounded bg-white border border-slate-200 text-slate-700 italic">
                        "{ansVal}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
