import React from 'react';
import { ShieldAlert, Maximize2, AlertTriangle, ArrowRight } from 'lucide-react';

export const ProctorViolationOverlay = ({
  reason = 'fullscreen', // 'fullscreen' | 'focus_loss'
  onRestoreFullscreen,
  violationCount,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 text-white animate-in fade-in duration-150">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl"></div>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-9 h-9 animate-pulse" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
          AVALIAÇÃO INTERROMPIDA
        </h3>
        
        <p className="text-sm font-semibold text-slate-200 mt-2">
          {reason === 'fullscreen'
            ? 'Você saiu do modo de Tela Cheia obrigatório.'
            : 'Perda de foco detectada: você alternou de aba ou acessou outro aplicativo.'}
        </p>

        <div className="my-5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-left text-xs text-rose-200 space-y-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Infração de Segurança #{violationCount}:</span> O horário e os detalhes deste evento foram imediatamente registrados no painel do professor com carimbo de data/hora (timestamp).
            </div>
          </div>
          <p className="text-slate-400 text-[11px] pl-6">
            Para continuar respondendo o exame, você deve retornar imediatamente para a tela cheia e permanecer exclusivamente nesta janela.
          </p>
        </div>

        <button
          onClick={onRestoreFullscreen}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 group"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Restaurar Tela Cheia e Continuar Prova</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-[11px] text-slate-500">
          EduProctor Security Engine • Monitoramento Ativo em Segundo Plano
        </p>
      </div>
    </div>
  );
};
