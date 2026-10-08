import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, isTeacher, logout } = useAuth();

  if (!currentUser) return null;

  // Iniciais do nome para avatar limpo sem fotos genéricas
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                EduProctor
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Anti-Cheat Ativo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Profª Gabriela Sanchez • Aulas Particulares de Inglês e Matemática
            </p>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            {/* Avatar com Iniciais */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {getInitials(currentUser.name)}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {isTeacher ? (
                  <span className="text-indigo-600 font-bold">Professora (Admin)</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Aluno • {currentUser.grade || 'Ensino Médio'}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
