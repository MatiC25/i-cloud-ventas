import React from 'react';
import { useAuth } from '../Context/AuthContext'; // Importar contexto
import { Icons } from '../UI/Icons';
import { useConfig } from '../Admin/ConfigContext';

interface Props {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
    const { user, logout } = useAuth(); // Usar datos reales

    const { appName } = useConfig();
    const menuItems = [
        { id: 'nueva-venta', label: 'Nueva Venta', icon: Icons.Cart },
        { id: 'stock', label: 'Stock / Inventario', icon: Icons.Box },
        { id: 'ultimas-ventas', label: 'Historial', icon: Icons.History },
    ];

    return (
        <aside className="md:w-20 lg:w-64 bg-slate-900 text-white flex flex-col h-screen shadow-2xl relative z-20 transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center justify-center lg:justify-between p-4 lg:p-6 border-b border-slate-700">
                <h1 className="hidden lg:block text-2xl font-bold tracking-tighter text-blue-400">{appName}</h1>
                <span className="lg:hidden text-xl font-bold text-blue-400">GA</span>
            </div>

            {/* Menú */}
            <nav className="flex-1 p-2 lg:p-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-2 lg:px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        title={item.label}
                    >
                        <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:block font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer: Perfil + Configuración */}
            <div className="p-2 lg:p-4 border-t border-slate-800 bg-slate-900">

                {/* Botón Configuración (Solo Admins) */}
                {user?.role === 'admin' && (
                    <button
                        onClick={() => onTabChange('settings')}
                        className={`w-full flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-2 lg:px-4 py-2 rounded-lg mb-4 text-sm transition-colors ${activeTab === 'settings' ? 'text-blue-400 bg-slate-800' : 'text-slate-500 hover:text-white'
                            }`}
                        title="Configuración"
                    >
                        <Icons.Settings className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:block">Configuración</span>
                    </button>
                )}

                {/* Tarjeta de Usuario */}
                <div className="flex items-center justify-center lg:justify-between px-0 lg:px-2 pt-2">
                    <div className="flex items-center space-x-0 lg:space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center font-bold text-xs shadow-lg shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden lg:block text-sm overflow-hidden">
                            <p className="font-bold text-white truncate max-w-[100px]">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {/* Botón Salir */}
                    <button onClick={logout} className="hidden lg:block text-slate-500 hover:text-red-400 transition-colors" title="Cerrar Sesión">
                        <Icons.Logout className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </aside>
    );
};