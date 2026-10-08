import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para monitoramento de áudio com Web Audio API e AnalyserNode
 * Detecta ruídos e conversas contínuas durante a prova.
 */
export const useAudioProctor = ({
  enabled = false,
  thresholdDb = 68,
  spikeDurationMs = 1800,
  onAudioSpike = () => {}
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0); // 0 a 100
  const [currentDb, setCurrentDb] = useState(0);
  const [isSpeakingDetected, setIsSpeakingDetected] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const continuousSpikeStartRef = useRef(null);
  const lastAlertTimeRef = useRef(0);

  // Solicitar permissão de microfone e inicializar AudioContext
  const startMonitoring = useCallback(async () => {
    try {
      setAudioError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('A API de captura de áudio não é suportada por este navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      // Se o contexto iniciar suspenso (política de autoplay dos navegadores)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setHasPermission(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastCheck = performance.now();

      const analyzeAudio = (now) => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcula RMS
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Converte amplitude relativa para estimativa de dB SPL (30dB a 95dB)
        const normalized = Math.min(100, Math.round((rms / 128) * 100));
        const estimatedDb = Math.round(30 + (normalized * 0.65));

        // Atualiza a cada ~60ms para suavidade
        if (now - lastCheck > 60) {
          setCurrentVolume(normalized);
          setCurrentDb(estimatedDb);
          lastCheck = now;
        }

        // Detecção de pico sonoro contínuo (possível conversa)
        if (estimatedDb >= thresholdDb) {
          if (!continuousSpikeStartRef.current) {
            continuousSpikeStartRef.current = now;
          } else {
            const duration = now - continuousSpikeStartRef.current;
            if (duration >= spikeDurationMs) {
              setIsSpeakingDetected(true);

              // Throttle para não floodar alertas (mínimo 6 segundos entre flags de áudio)
              if (now - lastAlertTimeRef.current > 6000) {
                lastAlertTimeRef.current = now;
                onAudioSpike({
                  volumeDb: estimatedDb,
                  durationMs: Math.round(duration),
                  timestamp: new Date().toLocaleTimeString('pt-BR'),
                });
              }
            }
          }
        } else {
          continuousSpikeStartRef.current = null;
          setIsSpeakingDetected(false);
        }

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    } catch (err) {
      console.error('[AudioProctor] Erro ao acessar microfone:', err);
      setAudioError(err.message || 'Permissão de microfone negada.');
      setHasPermission(false);
    }
  }, [thresholdDb, spikeDurationMs, onAudioSpike]);

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setCurrentVolume(0);
    setCurrentDb(0);
    setIsSpeakingDetected(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  return {
    hasPermission,
    currentVolume,
    currentDb,
    isSpeakingDetected,
    audioError,
    startMonitoring,
    stopMonitoring,
  };
};
