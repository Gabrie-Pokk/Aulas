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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Usuário padrão inicial: Professor Carlos para apresentação
    return SEED_USERS[0];
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Escuta mudanças de estado do Firebase Auth caso configurado
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
              setCurrentUser(profile);
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
              return;
            }
          }
          // Caso não haja doc no Firestore ainda
          const fallbackProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email,
            role: 'student',
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };
          setCurrentUser(fallbackProfile);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fallbackProfile));
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
   * Login do Usuário
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      }

      // Modo local / mock
      const allUsers = [...SEED_USERS, ...getCustomUsers()];
      const found = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (found) {
        saveUserSession(found);
        return found;
      }

      // Se não encontrou, cria dinamicamente ou dá erro
      throw new Error('E-mail ou senha incorretos. Dica: use o Acesso Rápido ou cadastre uma nova conta.');
    } catch (err) {
      setAuthError(err.message || 'Falha ao realizar login.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cadastro de Novo Usuário (Professor ou Aluno)
   */
  const register = async ({ name, email, password, role = 'student', grade = '' }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const newUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        role, // 'teacher' ou 'student'
        grade: role === 'student' ? (grade || 'Ensino Médio') : undefined,
        subjects: role === 'teacher' ? ['Inglês', 'Matemática'] : undefined,
        avatar: role === 'teacher'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        newUser.id = cred.user.uid;
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), newUser);
        }
      } else {
        saveCustomUser(newUser);
      }

      saveUserSession(newUser);
      return newUser;
    } catch (err) {
      setAuthError(err.message || 'Falha ao registrar usuário.');
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
      } catch (err) {
        console.warn('Erro ao deslogar do Firebase:', err);
      }
    }
    saveUserSession(null);
  };

  /**
   * Alternador rápido para testes (Professor vs Alunos)
   */
  const quickLogin = (type) => {
    if (type === 'teacher') {
      saveUserSession(SEED_USERS[0]); // Prof. Carlos
    } else if (type === 'student_maria') {
      saveUserSession(SEED_USERS[1]); // Maria Silva (tem prova liberada)
    } else if (type === 'student_lucas') {
      saveUserSession(SEED_USERS[2]); // Lucas Mendes
    } else if (type === 'student_beatriz') {
      saveUserSession(SEED_USERS[3]); // Beatriz Souza
    }
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
        quickLogin,
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
