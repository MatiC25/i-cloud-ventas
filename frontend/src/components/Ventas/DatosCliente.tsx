import React from 'react';
import { FormInput } from '../UI/FormInput';
import { FormSelect } from '../UI/FormSelect';
import { IVenta } from '../../types';

interface Props {
  data: IVenta['cliente'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const DatosCliente: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Datos del Cliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Nombre" name="nombre" value={data.nombre} onChange={onChange} required placeholder="Nombre" />
        <FormInput label="Apellido" name="apellido" value={data.apellido} onChange={onChange} placeholder="Apellido" />
        <FormInput label="Email" name="email" type="email" value={data.email} onChange={onChange} required placeholder="mail@ejemplo.com" />
        <FormInput label="Contacto" name="contacto" value={data.contacto} onChange={onChange} placeholder="Número de teléfono" />
        
        <FormSelect 
            label="Canal de Venta" 
            name="canal" 
            value={data.canal} 
            onChange={onChange}
            options={[
                { value: 'Cliente', label: 'Cliente' },
                { value: 'Contacto', label: 'Contacto' },
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Mayorista', label: 'Mayorista' },
                { value: 'Recomendación', label: 'Recomendación' },
                { value: 'WhatsApp', label: 'WhatsApp' },
                { value: 'Otro', label: 'Otro' }
            ]}
        />
      </div>
    </div>
  );
};