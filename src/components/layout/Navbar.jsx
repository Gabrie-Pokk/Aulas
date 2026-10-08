import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../services/firebase';
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  User,
  Sparkles,
  BookOpen,
  Calculator,
  ChevronDown,
  Database
} from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { currentUser, role, isTeacher, isStudent, logout, quickLogin } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
                EduProctor
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Anti-Cheat v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Inglês & Matemática • Ensino Personalizado
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Status BaaS / Local indicator */}
          <div className="hidden md:flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Database className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            {isFirebaseConfigured ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Firebase Ativo
              </span>
            ) : (
              <span className="text-slate-600 flex items-center" title="Dados persistidos localmente. Pronto para plugar .env">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                Modo Híbrido Local
              </span>
            )}
          </div>

          {/* Demo Quick Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
              title="Trocar rapidamente de perfil para testar todas as telas"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simular Perfil</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Troca Rápida de Usuário
                </div>
                
                <button
                  onClick={() => quickLogin('teacher')}
                  className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    CH
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center">
                      Prof. Carlos Henrique
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-semibold">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Criar tarefas, liberar provas & auditoria</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button
                  onClick={() => quickLogin('student_maria')}
                  className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    MS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center">
                      Maria Silva (Aluna)
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                        Prova Liberada
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Acesso liberado ao Teste de Nivelamento</div>
                  </div>
                </button>

                <button
                  onClick={() => quickLogin('student_lucas')}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    LM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Lucas Mendes (Aluno)
                    </div>
                    <div className="text-[11px] text-slate-500">Prova de Matemática liberada</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          {currentUser ? (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="flex items-center space-x-2">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/20"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 flex items-center">
                    {isTeacher ? (
                      <span className="text-indigo-600 font-semibold">Professor (Admin)</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Aluno</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Desconectar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
