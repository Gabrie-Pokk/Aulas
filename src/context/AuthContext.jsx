import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured, auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SEED_USERS } from '../services/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'eduproctor_current_user';
const STORAGE_KEY_REGISTERED = 'eduproctor_custom_users';

export const AuthProvider = ({ children }) => {
  // Inicializa deslogado por padrão, ou restaura sessão se já logado antes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null; // O site agora abre na tela de login!
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const profile = { id: firebaseUser.uid, ...userSnap.data() };
              saveUserSession(profile);
              return;
            }
          }
        } catch (err) {
          console.error('[Auth] Erro ao sincronizar perfil do Firebase:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const saveUserSession = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  const getCustomUsers = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REGISTERED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveCustomUser = (user) => {
    const list = getCustomUsers();
    list.push(user);
    localStorage.setItem(STORAGE_KEY_REGISTERED, JSON.stringify(list));
  };

  /**
   * Login do Usuário (Professora ou Aluno)
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      // 1. Verificação oficial da conta da Professora Gabriela Sanchez
      if (cleanEmail === 'familiapokk@gmail.com') {
        if (cleanPass === '201150Az@$#') {
          const teacherProfile = {
            id: 'user_prof_gabriela',
            name: 'Profª Gabriela Sanchez',
            email: 'familiapokk@gmail.com',
            role: 'teacher',
            subjects: ['Inglês', 'Matemática'],
            createdAt: '2026-09-01T10:00:00Z',
          };
          saveUserSession(teacherProfile);
          return teacherProfile;
        } else {
          throw new Error('Senha incorreta para a conta da Professora.');
        }
      }

      // 2. Tenta autenticação via API do Servidor (se ativo)
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        });

        if (res.ok) {
          const user = await res.json();
          saveUserSession(user);
          return user;
        } else {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 401 || res.status === 404) {
            throw new Error(errorData.error || 'Credenciais inválidas.');
          }
        }
      } catch (apiErr) {
        if (apiErr.message && !apiErr.message.includes('fetch')) {
          throw apiErr;
        }
      }

      // 3. Fallback: Usuários locais
      const allUsers = [...SEED_USERS, ...getCustomUsers()];
      const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (found) {
        if (!found.password || found.password === cleanPass) {
          saveUserSession(found);
          return found;
        } else {
          throw new Error('Senha incorreta.');
        }
      }

      throw new Error('Usuário não encontrado. Se você é aluno, realize seu cadastro na aba ao lado.');
    } catch (err) {
      setAuthError(err.message || 'Falha ao realizar login.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cadastro de Novo Aluno (Apenas estudantes permitidos)
   */
  const register = async ({ name, email, password, grade = '' }) => {
    setLoading(true);
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      if (cleanEmail === 'familiapokk@gmail.com') {
        throw new Error('Este e-mail pertence à conta da Professora.');
      }

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        email: cleanEmail,
        password: cleanPass,
        role: 'student',
        grade: grade || 'Ensino Médio',
        createdAt: new Date().toISOString(),
      };

      // Sincroniza com servidor
      try {
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      } catch {
        // fallback
      }

      saveCustomUser(newUser);
      saveUserSession(newUser);
      return newUser;
    } catch (err) {
      setAuthError(err.message || 'Falha ao cadastrar aluno.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'guest',
        loading,
        authError,
        login,
        register,
        logout,
        isTeacher: currentUser?.role === 'teacher',
        isStudent: currentUser?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
};
