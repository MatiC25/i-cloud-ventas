
import React, { useState } from 'react';
import {Sidebar} from './components/Layout/SideBar';
import NuevaVenta from './components/Ventas/NuevaVenta'; 
import { AdminConfig } from './components/Admin/AdminConfig';
import { UltimasVentas } from './components/Ventas/UltimasVentas';
import { Login } from './components/Context/Login';
import { SystemSettings } from './components/Admin/SystemSettings';
import { AuthProvider, useAuth } from './components/Context/AuthContext';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth(); // <--- Aquí ya es seguro usarlo
    const [activeTab, setActiveTab] = useState('nueva-venta');

    // Estado de carga inicial (mientras revisamos si hay usuario guardado)
    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
                {/* Logo o Icono Pulsante */}
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                    <span className="text-4xl">🚀</span>
                </div>
                {/* Barra de progreso falsa */}
                <div className="mt-8 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[pulse_1s_ease-in-out_infinite] w-1/2 rounded-full"></div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-400 animate-pulse">Iniciando Sistema...</p>
            </div>
        );
    }

    // Si no hay usuario, mostramos Login
    if (!user) {
        return <Login />;
    }

    // Si hay usuario, mostramos la App completa
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            
            <main className="flex-1 overflow-hidden relative flex flex-col overflow-y-auto">
                {activeTab === 'nueva-venta' && <NuevaVenta />}
                {activeTab === 'ultimas-ventas' && <UltimasVentas />}
                {activeTab === 'stock' && <AdminConfig />}
                
                {/* Protección de ruta para Admin */}
                {activeTab === 'settings' && user.role === 'admin' && <SystemSettings />}
            </main>
        </div>
    );
};

// 2. COMPONENTE PADRE (El que provee el contexto)
// Este componente NO puede usar useAuth(), su única misión es envolver
const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
};

export default App;