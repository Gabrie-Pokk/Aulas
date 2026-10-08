import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, quickLogin, authError, loading } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [grade, setGrade] = useState('Nível Intermediário (B1/B2)');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (tab === 'login') {
        if (!email || !password) {
          setLocalError('Preencha o e-mail e a senha.');
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          setLocalError('Por favor preencha todos os campos obrigatórios.');
          return;
        }
        await register({ name, email, password, role, grade });
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Erro durante a autenticação.');
    }
  };

  const handleQuick = (type) => {
    quickLogin(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Portal EduProctor</h2>
          <p className="text-xs text-indigo-100/90 mt-1">
            Plataforma de Aulas e Avaliações Seguras de Inglês e Matemática
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setTab('login'); setLocalError(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'login'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            onClick={() => { setTab('register'); setLocalError(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'register'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Novo Cadastro
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {(localError || authError) && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Cadastro de Estudante para as aulas particulares da <strong>Profª Gabriela Sanchez</strong>.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo do Aluno
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Ana Clara Martins"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nível / Escolaridade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="Fundamental II (6º ao 9º)">Fundamental II (6º ao 9º)</option>
                    <option value="Ensino Médio (1º ao 3º)">Ensino Médio (1º ao 3º)</option>
                    <option value="Pré-Vestibular / ENEM">Pré-Vestibular / ENEM</option>
                    <option value="Inglês Básico (A1/A2)">Inglês Básico (A1/A2)</option>
                    <option value="Nível Intermediário (B1/B2)">Nível Intermediário (B1/B2)</option>
                    <option value="Inglês Avançado (C1/C2)">Inglês Avançado (C1/C2)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail Institucional ou Pessoal
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@eduproctor.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Acesso Rápido de Teste (1 Clique)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuick('teacher')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 text-xs font-semibold text-left transition flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  GS
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px]">Profª Gabriela</div>
                  <div className="text-[10px] text-slate-500">Painel Docente</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('student_maria')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 text-xs font-semibold text-left transition flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  A
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px]">Aluna Maria</div>
                  <div className="text-[10px] text-slate-500">Prova Liberada</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
