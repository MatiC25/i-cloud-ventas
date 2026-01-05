import React, { useState, useEffect } from 'react';
import { getUltimasVentas, IVentaHistorial } from '../../services/api';

const CACHE_KEY = 'sys_ventas_history'; // Clave para guardar en memoria

export const UltimasVentas: React.FC = () => {
    const [ventas, setVentas] = useState<IVentaHistorial[]>([]);
    const [loading, setLoading] = useState(false);

    // Función inteligente de carga
    const cargarDatos = async (forceRefresh = false) => {
        setLoading(true);

        try {
            // 1. ESTRATEGIA DE CACHÉ
            // Si NO estamos forzando (botón refresh) y existen datos en memoria...
            if (!forceRefresh) {
                const cachedData = sessionStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    console.log("⚡ Usando caché de memoria (sin gastar API)");
                    setVentas(JSON.parse(cachedData));
                    setLoading(false);
                    return; // ¡Salimos temprano! No llamamos a la API
                }
            }

            // 2. LLAMADA A LA API (Solo si no hay caché o si forzamos refresh)
            console.log("📡 Llamando a Google API...");
            const data = await getUltimasVentas();

            // 3. GUARDAR EN MEMORIA
            setVentas(data);
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));

        } catch (error) {
            console.error("Error al cargar historial", error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar al iniciar (False = intenta usar memoria primero)
    useEffect(() => {
        cargarDatos(false);
    }, []);

    // Formateador de fecha
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });
        } catch { return dateString; }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Historial Reciente</h2>
                    <p className="text-sm text-gray-500">Últimos movimientos registrados en el sistema</p>
                </div>

                {/* BOTÓN REFRESH (Force = true) */}
                <button
                    onClick={() => cargarDatos(true)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                >
                    <span className={`text-lg transition-transform duration-700 ${loading ? 'animate-spin' : ''}`}>
                        ↻
                    </span>
                    {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
            </div>

            {/* VIEW: DESKTOP (TABLA) */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Cliente</div>
                    <div className="col-span-4">Producto</div>
                    <div className="col-span-2 text-right">Monto</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {loading && ventas.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="p-4 animate-pulse flex space-x-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))
                    ) : ventas.length > 0 ? (
                        ventas.map((venta, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50/50 transition-colors items-center text-sm text-gray-700">
                                <div className="col-span-2 text-gray-500 font-mono text-xs">{formatDate(venta.fecha)}</div>
                                <div className="col-span-1"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">#{venta.id.toString().slice(-4)}</span></div>
                                <div className="col-span-3 font-medium truncate">{venta.cliente}</div>
                                <div className="col-span-4 text-gray-600 truncate">{venta.producto}</div>
                                <div className="col-span-2 text-right font-bold text-gray-900">{venta.divisa} {venta.monto}</div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <p className="text-4xl mb-2">📭</p>
                            <p>No se encontraron registros recientes.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* VIEW: MOBILE/TABLET (CARDS) */}
            <div className="lg:hidden space-y-4">
                {loading && ventas.length === 0 ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse h-32"></div>
                    ))
                ) : ventas.length > 0 ? (
                    ventas.map((venta, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                            {/* Header Card: Fecha + ID */}
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-xs text-gray-400 font-mono">{formatDate(venta.fecha)}</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">#{venta.id.toString().slice(-4)}</span>
                            </div>

                            {/* Body: Producto + Cliente */}
                            <div>
                                <h4 className="font-bold text-gray-800 text-base">{venta.producto}</h4>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span>{venta.cliente}</span>
                                </div>
                            </div>

                            {/* Footer: Monto */}
                            <div className="mt-2 flex justify-end items-center">
                                <span className="text-xl font-black text-gray-900 tracking-tight">
                                    <span className="text-base font-normal text-gray-500 mr-1">{venta.divisa}</span>
                                    {venta.monto}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                        <p className="text-4xl mb-2">📭</p>
                        <p>No se encontraron registros.</p>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
                Mostrando las últimas 10 operaciones. Revisa el Google Sheet para el historial completo.
            </p>
        </div>
    );
};