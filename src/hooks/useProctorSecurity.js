import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook de Segurança Anti-Cola para ambiente de Prova
 * Gerencia Tela Cheia, Troca de Abas, Perda de Foco e Bloqueio de Ações
 */
export const useProctorSecurity = ({
  isActive = false,
  onSecurityEvent = () => {},
  targetElementRef = null,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [recentWarning, setRecentWarning] = useState(null);
  const warningTimeoutRef = useRef(null);

  const showWarning = useCallback((message, type = 'warning') => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setRecentWarning({ message, type, time: Date.now() });
    warningTimeoutRef.current = setTimeout(() => {
      setRecentWarning(null);
    }, 4000);
  }, []);

  /**
   * Tenta ativar o modo de tela cheia
   */
  const enterFullscreen = useCallback(async () => {
    try {
      const el = targetElementRef?.current || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn('Erro ao solicitar tela cheia:', err);
      showWarning('Por favor, permita tela cheia para realizar o teste.', 'error');
      return false;
    }
  }, [targetElementRef, showWarning]);

  /**
   * Sai da tela cheia de forma segura
   */
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Erro ao sair de tela cheia:', err);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // 1. Monitoramento da Fullscreen API
    const handleFullscreenChange = () => {
      const inFullscreen = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(inFullscreen);

      if (!inFullscreen) {
        showWarning('ATENÇÃO: Você saiu do modo Tela Cheia! A prova está pausada.', 'error');
        onSecurityEvent({
          type: 'fullscreen_exit',
          severity: 'high',
          details: 'Aluno encerrou ou saiu da tela cheia durante o exame.',
        });
      }
    };

    // 2. Monitoramento de Troca de Abas (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
        showWarning('ALERTA: Você saiu da aba da prova! Infração registrada.', 'error');
        onSecurityEvent({
          type: 'focus_loss',
          severity: 'high',
          details: 'Troca de aba detectada (document.hidden = true). Possível navegação externa.',
        });
      } else {
        setIsWindowFocused(true);
      }
    };

    // 3. Monitoramento de Perda de Foco para outros Aplicativos (window.onblur)
    const handleWindowBlur = () => {
      setIsWindowFocused(false);
      showWarning('ALERTA: Janela perdeu o foco (clique em outro aplicativo detectado).', 'high');
      onSecurityEvent({
        type: 'focus_loss',
        severity: 'high',
        details: 'Janela do navegador perdeu o foco (window.blur). Possível uso de ChatGPT/Discord/WhatsApp.',
      });
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    // 4. Bloqueio de Clique Direito (contextmenu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      showWarning('Menu de contexto desabilitado no ambiente de prova.', 'warning');
      onSecurityEvent({
        type: 'blocked_action',
        severity: 'low',
        details: 'Tentativa de clique com botão direito do mouse.',
      });
      return false;
    };

    // 5. Bloqueio de Atalhos de Teclado (Copiar, Colar, DevTools, Imprimir)
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Teclas Proibidas: C, V, X, A (select all), U (view source), P (print), S (save)
      if (isCmdOrCtrl && ['c', 'v', 'x', 'u', 'p', 's'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        showWarning(`Atalho "${e.ctrlKey ? 'Ctrl+' : 'Cmd+'}${key.toUpperCase()}" bloqueado!`, 'error');
        onSecurityEvent({
          type: 'blocked_action',
          severity: key === 'c' || key === 'v' ? 'medium' : 'low',
          details: `Tentativa de uso de atalho proibido: ${key.toUpperCase()}`,
        });
        return false;
      }

      // Atalhos de DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (isCmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        showWarning('Ferramentas de desenvolvedor bloqueadas nesta prova.', 'error');
        onSecurityEvent({
          type: 'blocked_action',
          severity: 'high',
          details: 'Tentativa de inspecionar elementos ou abrir DevTools.',
        });
        return false;
      }
    };

    // 6. Bloqueio de Seleção de Texto e Drag & Drop
    const handleSelectStart = (e) => {
      // Permite seleção apenas em campos de input ou textarea de resposta
      if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Registrar listeners globais
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isActive, onSecurityEvent, showWarning]);

  return {
    isFullscreen,
    isWindowFocused,
    recentWarning,
    enterFullscreen,
    exitFullscreen,
    showWarning,
  };
};
