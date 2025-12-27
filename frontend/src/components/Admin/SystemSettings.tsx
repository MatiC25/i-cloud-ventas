import React, { useState, useEffect } from 'react';
import { updateSystemConfig } from '../../services/api';

type TabType = 'general' | 'interface' | 'advanced';

// --- ICONOS SVG (Para no depender de librerías externas) ---
const Icons = {
    Building: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    Palette: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
    ),
    Shield: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Save: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Alert: () => (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    )
};

export const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    
    // Estados General
    const [companyName, setCompanyName] = useState('iCloud');
    const [contactEmail, setContactEmail] = useState('admin@sistema.com');
    const [statusGeneral, setStatusGeneral] = useState<'idle' | 'saving' | 'success'>('idle');

    // Estados Avanzado
    const [sheetId, setSheetId] = useState('');
    const [statusAdvanced, setStatusAdvanced] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Manejador: Guardar Nombre Empresa
    const handleSaveGeneral = async () => {
        setStatusGeneral('saving');
        try {
            // AQUÍ LLAMARÍAMOS A TU API PARA GUARDAR EL NOMBRE
            // await updateSystemConfig({ companyName, contactEmail }); 
            // Por ahora simulamos éxito visual
            setTimeout(() => setStatusGeneral('success'), 1000);
            setTimeout(() => setStatusGeneral('idle'), 3000);
        } catch (e) {
            setStatusGeneral('idle');
        }
    };

    // Manejador: Guardar ID Sheet
    const handleConfigUpdate = async () => {
        if(!sheetId) return;
        setStatusAdvanced('loading');
        try {
            await updateSystemConfig(sheetId);
            setStatusAdvanced('success');
        } catch (e) {
            setStatusAdvanced('error');
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: React.FC<any> }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 pt-8 shadow-sm z-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuración</h2>
                <p className="text-gray-500 text-sm mb-6">Administra las preferencias generales y conexiones del sistema.</p>
                
                <div className="flex space-x-1">
                    <TabButton id="general" label="General" icon={Icons.Building} />
                    <TabButton id="interface" label="Interfaz" icon={Icons.Palette} />
                    <TabButton id="advanced" label="Avanzado" icon={Icons.Shield} />
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    
                    {/* --- PESTAÑA GENERAL --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">Perfil de la Empresa</h3>
                                    {statusGeneral === 'success' && <span className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-lg">¡Guardado!</span>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre Comercial</label>
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Este nombre aparecerá en la barra lateral y reportes.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email de Contacto</label>
                                        <input 
                                            type="email" 
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                                    <button 
                                        onClick={handleSaveGeneral}
                                        disabled={statusGeneral === 'saving'}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Icons.Save />
                                        {statusGeneral === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PESTAÑA INTERFAZ --- */}
                    {activeTab === 'interface' && (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Palette />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Personalización Visual</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                Próximamente podrás modificar el esquema de colores, subir tu logo y activar el modo oscuro.
                            </p>
                        </div>
                    )}

                    {/* --- PESTAÑA AVANZADO --- */}
                    {activeTab === 'advanced' && (
                        <div className="animate-fade-in-up">
                            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-sm">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                                        <Icons.Alert />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-900">Conexión a Base de Datos</h3>
                                        <p className="text-sm text-red-700 mt-1 leading-relaxed max-w-xl">
                                            El sistema está vinculado a una Hoja de Cálculo de Google. 
                                            Cambiar el ID a continuación <strong>interrumpirá inmediatamente</strong> el servicio hasta que se restablezca una conexión válida.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-red-100 space-y-4">
                                    <label className="text-xs font-bold text-red-800 uppercase">Google Sheet ID</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            value={sheetId}
                                            onChange={(e) => setSheetId(e.target.value)}
                                            placeholder="Ej: 1gk8Miut5Wt5uv..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-red-200 text-sm focus:ring-2 focus:ring-red-500/20 outline-none text-gray-700 font-mono"
                                        />
                                        <button 
                                            onClick={handleConfigUpdate}
                                            disabled={statusAdvanced === 'loading'}
                                            className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            {statusAdvanced === 'loading' ? 'Vinculando...' : 'Actualizar Conexión'}
                                        </button>
                                    </div>
                                    {statusAdvanced === 'success' && (
                                        <div className="flex items-center gap-2 text-green-700 text-sm font-bold bg-green-50 p-3 rounded-lg border border-green-200">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Conexión establecida correctamente.
                                        </div>
                                    )}
                                    {statusAdvanced === 'error' && (
                                        <p className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded">❌ Error al conectar. Verifica el ID.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};