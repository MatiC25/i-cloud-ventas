import React, { useState, useEffect } from 'react';
import { IVenta } from '../../types';
import { guardarVentaWithResponse, getFormOptions, IProductConfig } from '../../services/api';

// Imports
import { DatosCliente } from './DatosCliente';
import { DatosProducto } from './DatosProducto';
import { DatosTransaccion } from './DatosTransaccion';
import { DatosPartePago } from './DatosPartePago';
import { useAuth } from '../Context/AuthContext'; 
import { Icons } from '../UI/Icons';

const INITIAL_STATE: IVenta = {
    cliente: { nombre: '', apellido: '', email: '', canal: 'Local', contacto: '' },
    producto: { tipo: '', modelo: '', capacidad: '', color: '', estado: 'Nuevo', imei: '', costo: 0 },
    transaccion: { cantidad: 1, monto: 0, divisa: 'USD', tipoCambio: 1, envioRetiro: 'Retiro', comentarios: '' },
    parteDePago: { esParteDePago: false, tipo: '', modelo: '', capacidad: '', costo: 0 }
};

interface IStep {
    id: number;
    title: string;
    component: React.ComponentType<any>;
    key: keyof IVenta;
    icon: React.FC<any>;
}

const STEPS: IStep[] = [
    { id: 1, title: 'Cliente', component: DatosCliente, key: 'cliente' , icon: Icons.User },
    { id: 2, title: 'Producto', component: DatosProducto, key: 'producto' , icon: Icons.Phone },
    { id: 3, title: 'Trade-In', component: DatosPartePago, key: 'parteDePago' , icon: Icons.TradeIn },
    { id: 4, title: 'Pago', component: DatosTransaccion, key: 'transaccion' , icon: Icons.Money }
];

// --- COMPONENTE MODAL DE ÉXITO ---
const SuccessModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 border border-gray-100">
                {/* Icono Animado */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_infinite]">
                    <span className="text-4xl">🎉</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Venta Exitosa!</h3>
                <p className="text-gray-500 mb-8 text-sm">
                    La operación ha sido registrada correctamente en el sistema y el stock fue actualizado.
                </p>
                
                <button 
                    onClick={onClose} 
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    Nueva Venta
                </button>
            </div>
        </div>
    );
};

const NuevaVenta: React.FC = () => {
    const [formData, setFormData] = useState<IVenta>(INITIAL_STATE);
    const [viewMode, setViewMode] = useState<'grid' | 'wizard'>('grid');
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Estados de UI
    const [showModal, setShowModal] = useState(false); // <--- NUEVO: Controla el modal
    const [status, setStatus] = useState<'idle' | 'error'>('idle'); // Quitamos 'success' de aquí porque usaremos el modal
    const [msg, setMsg] = useState('');
    
    const [dbOptions, setDbOptions] = useState<IProductConfig[]>([]);
    const { user } = useAuth();

    const [configSalida, setConfigSalida] = useState({
        imprimirTicket: false,
        enviarMail: true
    });

    useEffect(() => {
        const cargarConfig = async () => {
            try {
                const productos = await getFormOptions();
                setDbOptions(productos);
            } catch (error) { console.error(error); }
        };
        cargarConfig();
    }, []);

    // --- MANEJADORES ---
    const updateCliente = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, cliente: { ...prev.cliente, [name]: value } }));
    };
    const updateProducto = (e: any) => {
        const { name, value } = e.target;
        const val = name === 'costo' ? Number(value) : value;
        if (name === 'tipo') {
             setFormData(prev => ({ 
                 ...prev, 
                 producto: { ...prev.producto, tipo: value, modelo: '', capacidad: '', color: '' } 
             }));
        } else {
             setFormData(prev => ({ ...prev, producto: { ...prev.producto, [name]: val } }));
        }
    };
    const updatePartePago = (e: any) => {
        const { name, value } = e.target;
        const val = name === 'costo' ? Number(value) : value;
        setFormData(prev => ({ ...prev, parteDePago: { ...prev.parteDePago, [name]: val } }));
    };
    const togglePartePago = () => {
        setFormData(prev => ({
            ...prev,
            parteDePago: { ...prev.parteDePago, esParteDePago: !prev.parteDePago.esParteDePago }
        }));
    };
    const updateTransaccion = (e: any) => {
        const { name, value } = e.target;
        const val = ['monto', 'cantidad', 'tipoCambio'].includes(name) ? Number(value) : value;
        setFormData(prev => ({ ...prev, transaccion: { ...prev.transaccion, [name]: val } }));
    };

    const getHandlerForStep = (stepIndex: number) => {
        if (stepIndex === 0) return updateCliente;
        if (stepIndex === 1) return updateProducto;
        if (stepIndex === 2) return updatePartePago;
        return updateTransaccion;
    };

    // --- VALIDACIÓN ---
    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!formData.cliente.nombre.trim()) errors.push("Nombre del Cliente");
        if (!formData.producto.tipo) errors.push("Categoría de Producto");
        if (formData.transaccion.monto <= 0) errors.push("Precio de Venta");
        if (formData.parteDePago.esParteDePago) {
            if (!formData.parteDePago.tipo) errors.push("Tipo (Trade-In)");
            if (!formData.parteDePago.modelo) errors.push("Modelo (Trade-In)");
            if (formData.parteDePago.costo <= 0) errors.push("Cotización (Trade-In)");
        }

        if (errors.length > 0) {
            setStatus('error');
            setMsg(`Faltan completar: ${errors.join(', ')}`);
            setTimeout(() => setStatus('idle'), 5000);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setStatus('idle');
        try {
            const ventaFinal = {
                ...formData,
                vendedor: user?.email || 'Anónimo' 
            };
            const response = await guardarVentaWithResponse(ventaFinal);

            if (response.status === 'success') {
                // ÉXITO: Mostramos Modal y Limpiamos caché
                setShowModal(true); 
                sessionStorage.removeItem('sys_ventas_history');
            } else { 
                throw new Error(response.message); 
            }
        } catch (error: any) {
            setStatus('error');
            setMsg(error.message);
        } finally { 
            setLoading(false); 
        }
    };

    // Función que se ejecuta al cerrar el modal de éxito
    const handleReset = () => {
        setShowModal(false);
        setFormData(INITIAL_STATE);
        setCurrentStep(0);
    };

    const totalPagar = formData.transaccion.monto;
    const descuentoTradeIn = formData.parteDePago.esParteDePago ? formData.parteDePago.costo : 0;
    const totalFinal = totalPagar - descuentoTradeIn;

    // Estilos base para las tarjetas blancas
    const cardBase = "bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit";

    // Componente Switch Visual
    const ToggleSwitch = ({ label, active }: { label: string, active: boolean }) => (
        <div className="flex items-center justify-between opacity-60 cursor-not-allowed group">
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
            <div className={`w-9 h-5 rounded-full p-0.5 flex transition-colors ${active ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-full bg-gray-50 p-4 md:p-6 font-sans relative">
            
            {/* MODAL DE ÉXITO */}
            {showModal && <SuccessModal onClose={handleReset} />}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Nueva Venta</h2>
                    <p className="text-sm text-gray-500">{viewMode === 'grid' ? 'Cockpit' : 'Wizard'}</p>
                </div>
                <div className="flex items-center gap-4">
                    {status === 'error' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold animate-bounce text-sm">⚠️ {msg}</span>}
                    
                    <button onClick={() => setViewMode(prev => prev === 'grid' ? 'wizard' : 'grid')} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors">
                        <Icons.PrevNext className="w-4 h-4 text-gray-500" /> {/* Usa un icono de cambio/switch si tienes */}
                        {viewMode === 'grid' ? 'Ver Paso a Paso' : 'Ver Grilla'}
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                // --- MODO GRID (Sin cambios, tu código ya estaba bien aquí) ---
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ... (Todo el contenido del Grid que ya tenías) ... */}
                    {/* COLUMNA 1 */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={cardBase}>
                             <DatosCliente data={formData.cliente} onChange={updateCliente} />
                        </div>
                        <div className={cardBase}>
                            <DatosTransaccion data={formData.transaccion} onChange={updateTransaccion} />
                        </div>
                    </div>

                    {/* COLUMNA 2 */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={cardBase}>
                            <DatosProducto data={formData.producto} onChange={updateProducto} options={dbOptions} />
                        </div>
                        <div className={cardBase}>
                            <DatosPartePago
                                data={formData.parteDePago}
                                onChange={updatePartePago}
                                options={dbOptions}
                                active={formData.parteDePago.esParteDePago}
                                onToggle={togglePartePago}
                            />
                        </div>
                    </div>

                    {/* COLUMNA 3 */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            <h3 className="text-xs font-bold uppercase text-gray-400">Configuración de Entrega</h3>
                            <div className="space-y-3">
                                <ToggleSwitch label="🖨️ Imprimir Nota de Compra" active={configSalida.imprimirTicket} />
                                <ToggleSwitch label="✉️ Enviar Confirmación por Email" active={configSalida.enviarMail} />
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-xl shadow-xl shadow-slate-900/20 flex flex-col justify-between sticky top-6 h-fit">
                            <div className="space-y-6">
                                <div className="border-b border-slate-700 pb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <h3 className="text-xs font-bold uppercase text-slate-400">Cliente</h3>
                                    </div>
                                    <div className="pl-4">
                                        <p className="font-bold text-sm text-slate-300 truncate italic">
                                            {formData.cliente.nombre || formData.cliente.apellido 
                                                ? `${formData.cliente.nombre} ${formData.cliente.apellido}` 
                                                : <span className="text-slate-600 italic">Sin nombre...</span>}
                                        </p>
                                    </div>
                                    <div className="pl-4">
                                        <p className="font-bold text-sm text-slate-300 truncate italic">
                                            {formData.cliente.email 
                                                ? formData.cliente.email 
                                                : <span className="text-slate-600 italic">Sin email...</span>}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Detalle</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-slate-300">
                                            <span>Subtotal</span>
                                            <span className="font-mono">${totalPagar}</span>
                                        </div>
                                        <div className={`flex justify-between text-sm transition-all duration-300 ${formData.parteDePago.esParteDePago ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                            <span className="text-green-400">Trade-In</span>
                                            <span className="font-mono text-green-400">- ${descuentoTradeIn}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-700 my-4"></div>
                                    <div>
                                        <span className="block text-slate-400 text-xs mb-1">Total a Pagar</span>
                                        <span className="block text-xl font-black text-white tracking-tight">
                                            {formData.transaccion.divisa} ${totalFinal}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSubmit} disabled={loading} className={`w-full py-4 mt-8 rounded-xl font-bold text-base transition-all transform active:scale-[0.98] ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'}`}>
                                {loading ? 'Procesando...' : 'CONFIRMAR VENTA'}
                            </button>
                        </div>
                    </div>
                </div>

            ) : (
                // --- MODO WIZARD CORREGIDO ---
                <div className="flex-1 flex justify-center items-start pt-4">
                    {/* CAMBIO 1: Quitamos h-[650px] fijo y usamos min-h-[600px] para evitar el scroll innecesario */}
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col min-h-[600px] max-h-[85vh]">
                        
                        {/* Pestañas Superiores */}
                        <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center rounded-t-2xl overflow-x-auto scrollbar-hide">
                            <div className="flex space-x-2">
                                {STEPS.map((step, index) => (
                                    <div key={step.id} onClick={() => setCurrentStep(index)}
                                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${index === currentStep ? 'bg-blue-600 text-white shadow-md' : 'bg-white border hover:bg-gray-50'}`}>
                                        <step.icon className="w-4 h-4" />
                                        <span>{step.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Área de Contenido */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            {currentStep === 2 ? (
                                // CAMBIO 2: Pasamos las props correctas para que el toggle funcione
                                <DatosPartePago
                                    data={formData.parteDePago}
                                    onChange={updatePartePago}
                                    options={dbOptions}
                                    active={formData.parteDePago.esParteDePago} // <--- AHORA SÍ ES DINÁMICO
                                    onToggle={togglePartePago} // <--- AHORA SÍ TIENE EL MANEJADOR
                                />
                            ) : (
                                (() => {
                                    const StepComponent = STEPS[currentStep].component;
                                    const currentKey = STEPS[currentStep].key as keyof IVenta;
                                    return (
                                        <StepComponent
                                            data={formData[currentKey]}
                                            onChange={getHandlerForStep(currentStep)}
                                            options={dbOptions}
                                        />
                                    );
                                })()
                            )}
                        </div>

                        {/* Footer de Botones */}
                        <div className="p-6 bg-gray-50 border-t flex justify-between rounded-b-2xl mt-auto">
                            <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0} className="px-6 py-3 bg-white border rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-colors">Atrás</button>
                            {currentStep < STEPS.length - 1 ? (
                                <button onClick={() => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1))} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all">Siguiente</button>
                            ) : (
                                <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 shadow-lg shadow-green-500/30 transition-all">Confirmar</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevaVenta;