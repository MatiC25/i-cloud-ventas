import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { IChartsData } from '@/types'; 

// Tipos para las props
export type ChartMetric = 'count' | 'profit' | 'total';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IChartsData | null;
  isLoading: boolean;
  activeMetric: ChartMetric; 
}

export const SalesDetailsModal = ({ isOpen, onClose, data, isLoading, activeMetric }: SalesModalProps) => {
  const [filter, setFilter] = useState<'hoy' | 'mes' | 'anio' | 'historico'>('mes');

  // Configuración visual según la métrica activa
  const config = useMemo(() => {
    switch (activeMetric) {
      case 'count':
        return {
          title: 'Evolución de Cantidad de Ventas',
          color: '#3b82f6', // Azul
          dataKey: 'count',
          formatter: (val: number) => Math.round(val).toString(), 
          gradientId: 'colorCount'
        };
      case 'profit':
        return {
          title: 'Evolución de Ganancia Neta (Profit)',
          color: '#10b981', // Verde Esmeralda
          dataKey: 'profit',
          formatter: (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: "compact" }).format(val),
          gradientId: 'colorProfit'
        };
      case 'total':
      default:
        return {
          title: 'Evolución de Facturación Total',
          color: '#6366f1', // Indigo
          dataKey: 'total',
          formatter: (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: "compact" }).format(val),
          gradientId: 'colorTotal'
        };
    }
  }, [activeMetric]);

  // Selección de datos
  const currentChartData = useMemo(() => {
    if (!data) return [];
    // @ts-ignore
    return data[filter] || [];
  }, [data, filter]);

  // Totales dinámicos (Cards de arriba)
  const summary = useMemo(() => {
    return currentChartData.reduce((acc: any, curr: any) => ({
      total: acc.total + (Number(curr.total) || 0),
      profit: acc.profit + (Number(curr.profit) || 0),
      count: acc.count + (Number(curr.count) || 0)
    }), { total: 0, profit: 0, count: 0 });
  }, [currentChartData]);

  // --- NUEVA FUNCIÓN: Formateador del Eje X ---
  const formatXAxis = (tickItem: string) => {
    // Si el filtro es "mes" y el texto empieza con "Día" (ej: "Día 16")
    if (filter === 'mes' && typeof tickItem === 'string' && tickItem.startsWith('Día')) {
        const day = tickItem.replace('Día ', '').padStart(2, '0'); // "16"
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0'); // "01" (Mes actual)
        return `${day}/${month}`; // "16/01"
    }
    // Para otros filtros (Horas, Años, etc.) lo dejamos igual
    return tickItem;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
        <DialogHeader className="mb-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" style={{ color: config.color }} />
              {config.title}
            </DialogTitle>
            
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-lg">
              {(['hoy', 'mes', 'anio', 'historico'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setFilter(period)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    filter === period 
                      ? 'bg-white dark:bg-slate-800 shadow-sm font-bold' 
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={{ color: filter === period ? config.color : undefined }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p>Cargando datos...</p>
          </div>
        ) : !data || currentChartData.length === 0 ? (
           <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 gap-2">
             <Calendar className="w-10 h-10 opacity-20"/>
             <p>No hay datos registrados para este periodo.</p>
           </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-6">
            
            {/* KPIs Resumen */}
            <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${activeMetric === 'total' ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60'}`}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1 opacity-70">
                      <DollarSign className="w-3 h-3"/> Facturación
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(summary.total)}</p>
                </div>

                <div className={`p-4 rounded-xl border ${activeMetric === 'profit' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60'}`}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1 opacity-70">
                      <TrendingUp className="w-3 h-3"/> Profit Neto
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(summary.profit)}</p>
                </div>

                <div className={`p-4 rounded-xl border ${activeMetric === 'count' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60'}`}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1 opacity-70">
                       <ShoppingCart className="w-3 h-3" /> Ventas
                    </p>
                    <p className="text-xl font-bold">{summary.count}</p>
                </div>
            </div>

            {/* Gráfico Principal */}
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
                  
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={formatXAxis} // <--- AQUÍ APLICAMOS EL FORMATO
                  />
                  
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickFormatter={config.formatter}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                    // También aplicamos formato al tooltip para que coincida
                    labelFormatter={formatXAxis} 
                    formatter={(value: number) => [
                        activeMetric === 'count' ? value : formatCurrency(value), 
                        activeMetric === 'count' ? 'Cantidad' : 'Monto'
                    ]}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey={config.dataKey}
                    stroke={config.color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill={`url(#${config.gradientId})`} 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};