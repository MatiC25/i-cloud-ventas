import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithGoogleSheet } from '../../services/api';

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'vendedor';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean; // Solo para la carga inicial de la App
  error: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  
  // INICIALIZAMOS EN TRUE para que al abrir la app muestre el splash screen
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos una pequeña carga para que se vea el efecto suave al entrar
    const stored = localStorage.getItem('sys_user');
    if (stored) {
        try {
            setUser(JSON.parse(stored));
        } catch (e) {
            localStorage.removeItem('sys_user');
        }
    }
    setLoading(false); // Terminó la carga inicial
  }, []);

  const login = async (email: string, password: string) => {
    // NOTA: Ya no tocamos 'setLoading' aquí. 
    // El estado de carga del login lo manejará el formulario localmente.
    setError('');
    try {
        const userData = await loginWithGoogleSheet(email, password);
        setUser(userData);
        localStorage.setItem('sys_user', JSON.stringify(userData));
        return true;
    } catch (e: any) {
        setError(e.message || "Error de autenticación");
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sys_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};