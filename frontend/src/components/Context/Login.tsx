import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Ajusta la ruta si es necesario
import { updateSystemConfig } from '../../services/api'; // Ajusta la ruta
import { Icons } from '../UI/Icons';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Usamos el hook, pero para el formulario usaremos un estado local
  const { login, error } = useAuth(); 
  
  // ESTADO LOCAL PARA LA ANIMACIÓN DE CARGA DEL LOGIN
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados para recuperación de config
  const [showConfig, setShowConfig] = useState(false);
  const [newSheetId, setNewSheetId] = useState('');
  const [configMsg, setConfigMsg] = useState('');

  const isConfigError = error && (error.includes("SYSTEM_NOT_CONFIGURED") || error.includes("getSheetByName"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggingIn(true); // 1. Activamos animación
      await login(email, password);
      setIsLoggingIn(false); // 2. Desactivamos si falló (si entra, el componente se desmonta solo)
    }
  };

  const handleConfigUpdate = async () => {
      try {
          setConfigMsg("Vinculando...");
          await updateSystemConfig(newSheetId);
          setConfigMsg("✅ Vinculado. Intenta iniciar sesión nuevamente.");
          setTimeout(() => {
              setShowConfig(false);
              window.location.reload(); 
          }, 2000);
      } catch (e) {
          setConfigMsg("Error al vincular ID");
      }
  };

  // --- VISTA DE ERROR CRÍTICO (Falta Config) ---
  if (showConfig || isConfigError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border-2 border-red-100">
                <div className="text-4xl mb-4">🚨</div>
                <h1 className="text-xl font-bold text-red-800 mb-2">Sistema Desconectado</h1>
                <p className="text-gray-600 mb-6 text-sm">
                    No se detectó una Hoja de Cálculo vinculada. Por favor, ingresa el ID para restaurar el sistema.
                </p>
                
                <input 
                  type="text" 
                  placeholder="ID del Google Sheet (ej: 1gk8M...)"
                  value={newSheetId}
                  onChange={(e) => setNewSheetId(e.target.value)}
                  className="w-full p-3 mb-4 rounded-xl border border-red-200 outline-none focus:ring-2 focus:ring-red-500/20"
                />
                
                {configMsg && <p className="mb-4 text-sm font-bold text-slate-700">{configMsg}</p>}

                <button 
                    onClick={handleConfigUpdate}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                >
                    Vincular y Restaurar
                </button>
            </div>
        </div>
      );
  }

  // --- VISTA DE LOGIN CON EFECTOS DE CARGA ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-xl mx-auto flex items-center justify-center text-3xl mb-6 shadow-lg">
          <Icons.Lock className="w-8 h-8 text-white"/>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
        
        {/* Mostramos errores solo si NO estamos cargando */}
        {error && !isConfigError && !isLoggingIn && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg animate-pulse">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoggingIn} // Bloqueamos input al cargar
                className={`w-full mt-1 p-3 rounded-xl border outline-none transition-all duration-300
                    ${isLoggingIn 
                        ? 'bg-gray-100 text-gray-400 border-gray-100 animate-pulse cursor-not-allowed' // Estilo Skeleton
                        : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20'
                    }`} 
            />
          </div>
          <div className="text-left">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
            <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoggingIn} // Bloqueamos input al cargar
                className={`w-full mt-1 p-3 rounded-xl border outline-none transition-all duration-300
                    ${isLoggingIn 
                        ? 'bg-gray-100 text-gray-400 border-gray-100 animate-pulse cursor-not-allowed' // Estilo Skeleton
                        : 'bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20'
                    }`} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn} 
            className={`w-full py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${isLoggingIn 
                    ? 'bg-slate-700 cursor-wait' 
                    : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
                }`}
          >
            {isLoggingIn ? (
                // SPINNER SVG
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verificando...</span>
                </>
            ) : (
                'Entrar al Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};