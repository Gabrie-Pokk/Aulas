import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Mic,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';

export const ProctorMonitorHUD = ({
  isFullscreen,
  volumeLevel,
  currentDb,
  isSpeakingDetected,
  violationCount,
  timeLeftFormatted,
  recentWarning,
  examTitle,
  subject,
}) => {
  // Cor do medidor de áudio
  const getAudioColor = () => {
    if (currentDb >= 70) return 'bg-rose-500 shadow-rose-500/50';
    if (currentDb >= 60) return 'bg-amber-500 shadow-amber-500/50';
    return 'bg-emerald-500 shadow-emerald-500/50';
  };

  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg px-4 py-2.5 transition-all select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Exam Info & Security Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-200 tracking-wide flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Proctoring Ativo
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5 truncate max-w-xs md:max-w-md">
              <span className="truncate">{examTitle}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                {subject}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Anti-cheat ativado: Áudio, Foco e Tela Cheia monitorados
            </div>
          </div>
        </div>

        {/* Center: Live Warning Toast if any */}
        {recentWarning && (
          <div className="hidden lg:flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-400 shrink-0" />
            <span>{recentWarning.message}</span>
          </div>
        )}

        {/* Right: Security Sensors & Countdown */}
        <div className="flex items-center space-x-4">
          {/* Microfone & Decibéis */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Mic className={`w-3.5 h-3.5 ${isSpeakingDetected ? 'text-rose-400 animate-bounce' : 'text-slate-300'}`} />
            
            {/* VU Meter Bars */}
            <div className="flex items-end space-x-0.5 h-4 w-12 bg-slate-900 rounded p-0.5">
              <div
                className={`w-full rounded-sm transition-all duration-75 ${getAudioColor()}`}
                style={{ height: `${Math.max(15, volumeLevel)}%` }}
              ></div>
            </div>

            <span className="text-[11px] font-mono text-slate-300 min-w-[32px]">
              {currentDb} dB
            </span>

            {isSpeakingDetected && (
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider animate-pulse hidden sm:inline">
                Voz detectada
              </span>
            )}
          </div>

          {/* Fullscreen Badge */}
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 border border-slate-700">
            <Maximize2 className={`w-3.5 h-3.5 ${isFullscreen ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className={`text-[11px] font-medium hidden sm:inline ${isFullscreen ? 'text-emerald-300' : 'text-rose-400'}`}>
              {isFullscreen ? 'Tela Cheia OK' : 'Fora de Fullscreen'}
            </span>
          </div>

          {/* Violações acumuladas */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
              violationCount === 0
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : violationCount <= 2
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse'
            }`}
            title="Total de ocorrências registradas nesta tentativa"
          >
            {violationCount === 0 ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              {violationCount} {violationCount === 1 ? 'aviso' : 'avisos'}
            </span>
          </div>

          {/* Timer Countdown */}
          <div className="flex items-center space-x-1.5 bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 px-3 py-1.5 rounded-lg font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeLeftFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
