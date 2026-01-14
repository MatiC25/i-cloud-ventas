import React, { useMemo } from 'react';
import { IProductConfig } from '../../services/api';
import { FormInput } from '../UI/FormInput';   // <--- Importamos
import { FormSelect } from '../UI/FormSelect'; // <--- Importamos

interface Props {
    data: {
        tipo: string;
        modelo: string;
        capacidad: string;
        color: string;
        estado: string;
        imei?: string;
        costo: number;
    };
    onChange: (e: any) => void;
    options: IProductConfig[];
    errors?: Record<string, string>; // <--- Recibimos errores
}

export const DatosProducto: React.FC<Props> = ({ data, onChange, options, errors }) => {

    // --- LOGICA DE FILTRADO (Igual que antes) ---
    const categoriasDisponibles = useMemo(() => {
        const cats = options.map(o => o.categoria);
        return [...new Set(cats)];
    }, [options]);

    const modelosDisponibles = useMemo(() => {
        if (!data.tipo) return [];
        return options
            .filter(o => o.categoria === data.tipo)
            .map(o => o.modelo);
    }, [options, data.tipo]);

    const configActual = useMemo(() => {
        return options.find(o => o.categoria === data.tipo && o.modelo === data.modelo);
    }, [options, data.tipo, data.modelo]);

    const capacidadesDisponibles = configActual ? configActual.variantes : [];
    const coloresDisponibles = configActual ? configActual.colores : [];

    // --- RENDERIZADO ---
    return (
        <div className="bg-white p-6 rounded-xl h-full animate-fade-in">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 border-b pb-2">
                Detalle del Producto
            </h3>
            <div className="space-y-6">

                
                {/* 1. Categoría */}
                <FormSelect 
                    label="Categoría / Tipo"
                    name="tipo"
                    value={data.tipo}
                    onChange={onChange}
                    options={categoriasDisponibles.map(c => ({ value: c, label: c }))}
                    error={errors?.['producto.tipo']} // Conectamos el error
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Modelo */}
                    <FormSelect 
                        label="Modelo"
                        name="modelo"
                        value={data.modelo}
                        onChange={onChange}
                        disabled={!data.tipo}
                        options={modelosDisponibles.map(m => ({ value: m, label: m }))}
                        // Si quisieras validar modelo: error={errors?.['producto.modelo']}
                    />

                    {/* 3. Capacidad (Dinámico: Select o Input) */}
                    {capacidadesDisponibles.length > 0 ? (
                        <FormSelect 
                            label="Capacidad"
                            name="capacidad"
                            value={data.capacidad}
                            onChange={onChange}
                            disabled={!data.modelo}
                            options={capacidadesDisponibles.map(c => ({ value: c, label: c }))}
                        />
                    ) : (
                        <FormInput 
                            label="Capacidad"
                            name="capacidad"
                            value={data.capacidad}
                            onChange={onChange}
                            placeholder="Ej: 128GB"
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 4. Color (Dinámico: Select o Input) */}
                    {coloresDisponibles.length > 0 ? (
                        <FormSelect 
                            label="Color"
                            name="color"
                            value={data.color}
                            onChange={onChange}
                            disabled={!data.modelo}
                            options={coloresDisponibles.map(c => ({ value: c, label: c }))}
                        />
                    ) : (
                        <FormInput 
                            label="Color"
                            name="color"
                            value={data.color}
                            onChange={onChange}
                            placeholder="Ej: Midnight"
                        />
                    )}

                    {/* 5. Estado */}
                    <FormSelect 
                        label="Estado"
                        name="estado"
                        value={data.estado}
                        onChange={onChange}
                        options={[
                            { value: 'Nuevo', label: 'Nuevo' },
                            { value: 'Usado', label: 'Usado' },
                            { value: 'Reacondicionado', label: 'Reacondicionado' }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 6. IMEI */}
                    <FormInput 
                        label="Serial / IMEI"
                        name="imei"
                        value={data.imei || ''}
                        onChange={onChange}
                        placeholder="Escanea o escribe..."
                        className="font-mono text-sm" 
                    />

                    {/* 7. Costo */}
                    <FormInput 
                        label="Costo Base (USD)"
                        name="costo"
                        type="number"
                        value={data.costo}
                        onChange={onChange}
                        placeholder="0.00"
                        error={errors?.['producto.costo']} 
                    />
                </div>
            </div>
        </div>
    );
};