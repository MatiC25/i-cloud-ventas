import React from 'react';
import { FormInput } from '../UI/FormInput';
import { FormSelect } from '../UI/FormSelect';
import { IVenta } from '../../types';

interface Props {
  data: IVenta['transaccion'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: Record<string, string>;
}

export const DatosTransaccion: React.FC<Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 border-b pb-2">Transacción</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <FormInput 
            label="Precio de Venta Final" 
            name="monto" 
            type="number" 
            value={data.monto} 
            onChange={onChange} 
            required 
            placeholder="0.00" 
            error={errors?.['transaccion.monto']}
        />

        <div className="grid grid-cols-2 gap-4">
             <FormSelect 
                label="Divisa" 
                name="divisa" 
                value={data.divisa} 
                onChange={onChange}
                options={[{ value: 'USD', label: 'USD' }, { value: 'ARS', label: 'ARS' }]}
            />
             <FormInput 
                label="Tipo de Cambio" 
                name="tipoCambio" 
                type="number" 
                value={data.tipoCambio} 
                onChange={onChange} 
            />
        </div>

        <FormSelect 
            label="Método de Entrega" 
            name="envioRetiro" 
            value={data.envioRetiro} 
            onChange={onChange}
            options={[{ value: 'Retiro', label: 'Retiro en Local' }, { value: 'Envio', label: 'Envío a Domicilio' }]}
        />

        <div className="md:col-span-2">
            <FormInput label="Comentarios" name="comentarios" value={data.comentarios} onChange={onChange} placeholder="Notas adicionales..." />
        </div>
      </div>
    </div>
  );
};