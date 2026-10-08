import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  BookOpen
} from 'lucide-react';

export const AuthPage = () => {
  const { login, register, authError, loading } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Ensino Médio');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (tab === 'login') {
        if (!email || !password) {
          setLocalError('Por favor, informe seu e-mail e sua senha.');
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          setLocalError('Por favor, preencha todos os campos obrigatórios.');
          return;
        }
        await register({ name, email, password, grade });
      }
    } catch (err) {
      setLocalError(err.message || 'Falha na autenticação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/20 mb-4 border border-indigo-400/30">
            <GraduationCap className="w-9 h-9" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            EduProctor
          </h1>
          <p className="text-xs font-semibold text-indigo-400 mt-1 uppercase tracking-wider">
            Profª Gabriela Sanchez • Inglês & Matemática
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Plataforma de Aulas Particulares & Avaliações Seguras
          </p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button
              type="button"
              onClick={() => { setTab('login'); setLocalError(''); }}
              className={`flex-1 py-4 text-xs font-bold text-center border-b-2 transition ${
                tab === 'login'
                  ? 'border-indigo-500 text-white bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setLocalError(''); }}
              className={`flex-1 py-4 text-xs font-bold text-center border-b-2 transition ${
                tab === 'register'
                  ? 'border-indigo-500 text-white bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Novo Aluno (Cadastro)
            </button>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {(localError || authError) && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{localError || authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Cadastro para novos alunos da Profª Gabriela Sanchez.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Nome Completo do Aluno
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Ana Clara Martins"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Escolaridade / Nível de Aprendizado
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Acessando...</span>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Entrar na Plataforma' : 'Criar Conta de Aluno'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Ambiente Seguro com Monitoramento Anti-Cola • EduProctor
        </p>
      </div>
    </div>
  );
};
