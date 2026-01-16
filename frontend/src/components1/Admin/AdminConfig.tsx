import React, { useState } from 'react';
import { guardarNuevoProductoConfig } from '../../services/api';
import { updateSystemConfig } from '../../services/api';

export const AdminConfig: React.FC = () => {
    const [form, setForm] = useState({
        categoria: '',
        modelo: '',
        variantes: '', // Texto separado por comas
        colores: ''
    });
    const [status, setStatus] = useState('idle');

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await guardarNuevoProductoConfig(form);
            setStatus('success');
            setForm({ categoria: '', modelo: '', variantes: '', colores: '' }); // Limpiar
        } catch (error) {
            setStatus('error');
        }
    };

    const [sheetId, setSheetId] = useState('');

    const handleConfigUpdate = async () => {
        if(!sheetId) return;
        try {
            await updateSystemConfig(sheetId);
            alert("Sistema conectado al Excel");
        } catch (e) {
            alert("Error al conectar");
        }
    };

    return (
        <div>
            
        </div>
        // <div className="p-8 max-w-2xl mx-auto">
        //         <div className="flex items-center gap-3 mb-6">
        //             <Icons.NewProduct className="w-6 h-6 text-gray-700" />
        //             <h2 className="text-2xl font-bold text-gray-800">
        //                 Cargar nuevo producto
        //             </h2>
        //         </div>
        //     <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        //         <h3 className="text-lg font-medium mb-4">Agregar Nuevo Modelo al Sistema</h3>
                
        //         {status === 'success' && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">Producto agregado exitosamente</div>}

        //         <form onSubmit={handleSubmit} className="space-y-6">
        //             <FormInput 
        //                 label="Categoría" 
        //                 name="categoria" 
        //                 value={form.categoria} 
        //                 onChange={handleChange} 
        //                 placeholder="Ej: Consola, Tablet..." 
        //                 required
        //             />
        //             <FormInput 
        //                 label="Nombre del Modelo" 
        //                 name="modelo" 
        //                 value={form.modelo} 
        //                 onChange={handleChange} 
        //                 placeholder="Ej: PS5" 
        //                 required
        //             />
                    
        //             <div className="grid grid-cols-2 gap-4">
        //                 <FormInput 
        //                     label="Variantes (Separa con comas)" 
        //                     name="variantes" 
        //                     value={form.variantes} 
        //                     onChange={handleChange} 
        //                     placeholder="Ej: 128GB, 256GB" 
        //                 />
        //                 <FormInput 
        //                     label="Colores (Separa con comas)" 
        //                     name="colores" 
        //                     value={form.colores} 
        //                     onChange={handleChange} 
        //                     placeholder="Ej: White, Red, Neon" 
        //                 />
        //             </div>

        //             <button 
        //                 type="submit" 
        //                 className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all"
        //             >
        //                 {status === 'loading' ? 'Guardando en Excel...' : 'Guardar Configuración'}
        //             </button>
        //         </form>
        //     </div>
        // </div>
    );
};