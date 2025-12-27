import React, { useMemo } from 'react';
import { FormInput } from '../UI/FormInput';
import { FormSelect } from '../UI/FormSelect';
import { IVenta } from '../../types';
import { IProductConfig } from '../../services/api';

interface Props {
  data: IVenta['producto'];
  onChange: (e: any) => void;
  options: IProductConfig[]; // Recibimos la lista maestra completa
}

export const DatosProducto: React.FC<Props> = ({ data, onChange, options }) => {
  
  // 1. OBTENER CATEGORÍAS ÚNICAS
  // Extraemos ["Smartphone", "Consola", ...] eliminando duplicados
  const categorias = useMemo(() => {
      const cats = options.map(o => o.categoria);
      return [...new Set(cats)].map(c => ({ value: c, label: c }));
  }, [options]);

  // 2. FILTRAR MODELOS SEGÚN LA CATEGORÍA SELECCIONADA
  // Si eligió "Consola", solo mostramos modelos de consolas
  const modelosDisponibles = useMemo(() => {
      return options
        .filter(o => o.categoria === data.tipo) // data.tipo guardará la Categoría
        .map(o => ({ value: o.modelo, label: o.modelo }));
  }, [options, data.tipo]);

  // 3. OBTENER VARIANTES Y COLORES DEL MODELO SELECCIONADO
  // Buscamos la configuración exacta del modelo elegido (ej: "iPhone 13")
  const configActual = options.find(o => o.modelo === data.modelo);

  const variantesDisponibles = configActual 
      ? configActual.variantes.map(v => ({ value: v, label: v })) 
      : [];
      
  const coloresDisponibles = configActual
      ? configActual.colores.map(c => ({ value: c, label: c }))
      : [];

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Detalle del Producto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NIVEL 1: CATEGORÍA */}
        <div className="md:col-span-2">
            <FormSelect 
                label="Categoría / Tipo" 
                name="tipo" // Usamos el campo 'tipo' de tu interface IVenta
                value={data.tipo} 
                onChange={onChange} 
                options={[{value: '', label: 'Seleccionar...'}, ...categorias]}
            />
        </div>

        {/* NIVEL 2: MODELO (Depende de Categoría) */}
        <FormSelect 
            label="Modelo" 
            name="modelo" 
            value={data.modelo} 
            onChange={onChange} 
            options={modelosDisponibles}
            disabled={!data.tipo} // Desactivado si no hay categoría
        />

        {/* NIVEL 3: DETALLES (Dependen del Modelo) */}
        <FormSelect 
            label={data.tipo === 'Consola' ? 'Edición' : 'Capacidad'} // Etiqueta dinámica
            name="capacidad" 
            value={data.capacidad} 
            onChange={onChange} 
            options={variantesDisponibles}
            disabled={!data.modelo || variantesDisponibles.length === 0}
        />

        <FormSelect 
            label="Color" 
            name="color" 
            value={data.color} 
            onChange={onChange} 
            options={coloresDisponibles}
            disabled={!data.modelo || coloresDisponibles.length === 0}
        />
        
        {/* CAMPOS COMUNES */}
        <FormSelect 
            label="Estado" 
            name="estado" 
            value={data.estado} 
            onChange={onChange}
            options={[{ value: 'Nuevo', label: 'Nuevo' }, { value: 'Usado', label: 'Usado' }]}
        />

        <FormInput label="Serial / IMEI" name="imei" value={data.imei || ''} onChange={onChange} />
        <FormInput label="Costo Base (USD)" name="costo" type="number" value={data.costo} onChange={onChange} />
      </div>
    </div>
  );
};