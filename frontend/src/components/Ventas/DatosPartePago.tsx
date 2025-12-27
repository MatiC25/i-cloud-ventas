import React, { useMemo } from 'react';
import { FormInput } from '../UI/FormInput';
import { FormSelect } from '../UI/FormSelect';
import { IVenta } from '../../types';
import { IProductConfig } from '../../services/api';
import { Icons } from '../UI/Icons';

interface Props {
  data: IVenta['parteDePago'];
  onChange: (e: any) => void;
  options: IProductConfig[];
  active: boolean;          // Para saber si mostramos los campos o no
  onToggle: () => void;     // Para activar/desactivar el trade-in
}

export const DatosPartePago: React.FC<Props> = ({ data, onChange, options, active, onToggle }) => {
  
  // Reutilizamos la lógica inteligente de categorías del Excel
  const categorias = useMemo(() => {
      const cats = options.map(o => o.categoria);
      return [...new Set(cats)].map(c => ({ value: c, label: c }));
  }, [options]);

  const modelosDisponibles = useMemo(() => {
      return options
        .filter(o => o.categoria === data.tipo)
        .map(o => ({ value: o.modelo, label: o.modelo }));
  }, [options, data.tipo]);

  return (
    <div className={`transition-all duration-500 ease-in-out border-2 border-dashed rounded-2xl p-4 ${active ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
      
      {/* HEADER CON SWITCH */}
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2">
              <Icons.TradeIn className="w-6 h-6 group-hover:scale-110 transition-transform"/>
              <h3 className="font-bold text-gray-700">Tomar equipo en parte de pago</h3>
          </div>
          {/* Toggle Switch Visual */}
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
      </div>

      {/* CAMPOS DESPLEGABLES (Solo si está activo) */}
      {active && (
          <div className="space-y-4 animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect 
                    label="Tipo" 
                    name="tipo" 
                    value={data.tipo} 
                    onChange={onChange}
                    options={[{value: '', label: '...'}, ...categorias]} 
                  />
                  <FormSelect 
                    label="Modelo" 
                    name="modelo" 
                    value={data.modelo} 
                    onChange={onChange}
                    options={modelosDisponibles} 
                    disabled={!data.tipo}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <FormInput 
                    label="Capacidad" 
                    name="capacidad" 
                    value={data.capacidad} 
                    onChange={onChange} 
                    placeholder="Ej: 128GB"
                  />
                  <FormInput 
                    label="Cotización (Valor de toma)" 
                    name="costo" 
                    type="number" // Ahora sin flechitas molestas
                    value={data.costo} 
                    onChange={onChange} 
                    placeholder="0.00"
                  />
              </div>
          </div>
      )}
    </div>
  );
};