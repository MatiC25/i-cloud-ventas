import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OperacionReciente } from '@/types';

interface RecentOperationsTableProps {
    operations: OperacionReciente[];
    className?: string; // Allow custom styling wrapper
}


const currencyMap: Record<string, string> = {
    "Pesos Arg": "ARS",
    "Pesos Argentinos": "ARS",
    "ARS": "ARS",
    "USD": "USD",
    "Dólares": "USD",
    "Dolares": "USD",
    "EUR": "EUR",
}

export function RecentOperationsTable({ operations, className }: RecentOperationsTableProps) {
    // Helper to safely format date
    const formatDate = (dateInput: string | number) => {
        try {
            const date = new Date(dateInput);
            // Check if valid date
            if (isNaN(date.getTime())) return "Fecha inválida";
            return format(date, "dd/MM HH:mm", { locale: es });
        } catch (e) {
            return String(dateInput);
        }
    };

    return (
        <div className={`bg-white dark:bg-slate-950 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden ${className}`}>
            <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold tracking-tight">Últimas Operaciones</h3>
                <p className="text-sm text-gray-500">Actividad reciente registrada en el sistema.</p>
            </div>
            <div className="p-2">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-gray-100 dark:border-b-slate-800">
                            <TableHead className="w-[140px]">Fecha</TableHead>
                            <TableHead>Cliente / Detalle</TableHead>
                            <TableHead>Realizada por</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operations && operations.length > 0 ? (
                            operations.map((op) => (
                                <TableRow key={op.id} className="border-b-gray-50 dark:border-b-slate-900/50 hover:bg-gray-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(op.fecha)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-gray-200">
                                            {op.cliente || "Sin detalle"}
                                        </div>
                                        {/* Optional: Show type if available */}
                                        {op.tipo && (
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ml-0 ${op.tipo === 'Venta' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {op.tipo}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {op.auditoria ? op.auditoria.charAt(0).toUpperCase() : <User size={12} />}
                                            </div>
                                            <span className="text-xs text-gray-500">{op.auditoria}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {op.tipoProducto + " " + op.modelo + " " + op.capacidad + " " + op.color}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right font-semibold">
                                        <span
                                            className={
                                                op.tipo === "Gasto"
                                                    ? "text-red-500"
                                                    : "text-gray-900 dark:text-white"
                                            }
                                        >
                                            {op.tipo === "Gasto" ? "-" : ""}
                                            {op.monto?.toLocaleString("es-AR", {
                                                style: "currency",
                                                currency: currencyMap[op.divisa ?? ""] ?? "ARS",
                                            })}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No hay operaciones recientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
