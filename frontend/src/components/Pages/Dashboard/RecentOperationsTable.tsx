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
import { User, Calendar, ShoppingBag, Building2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Unified operation type for the table
export interface UnifiedOperation {
    id: string;
    fecha: string | number | Date;
    cliente: string;
    monto: number;
    tipoProducto?: string;
    modelo?: string;
    capacidad?: string;
    color?: string;
    auditoria: string;
    divisa?: string;
    tipo: "Minorista" | "Mayorista" | "Gasto";
    detalle?: string; // For gastos
    destino?: string; // Wallet/destination for gastos
}

interface RecentOperationsTableProps {
    operations: UnifiedOperation[];
    className?: string;
}
const currencyMap: Record<string, string> = {
    "Pesos Arg": "ARS",
    "Pesos Argentinos": "ARS",
    "Pesos argentinos": "ARS",
    "ARS": "ARS",
    "USD": "USD",
    "Dólares": "USD",
    "Dolares": "USD",
    "EUR": "EUR",
}

// Type badge config
const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    "Minorista": {
        label: "Minorista",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: ShoppingBag
    },
    "Mayorista": {
        label: "Mayorista",
        color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: Building2
    },
    "Gasto": {
        label: "Libro Diario",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: Receipt
    },
};

export function RecentOperationsTable({ operations, className }: RecentOperationsTableProps) {
    // Helper to safely format date
    const formatDate = (dateInput: string | number | Date) => {
        try {
            const date = new Date(dateInput);
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
                <p className="text-sm text-gray-500">Actividad reciente: ventas minoristas, mayoristas y gastos.</p>
            </div>
            <div className="p-2">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-gray-100 dark:border-b-slate-800">
                            <TableHead className="w-[120px]">Fecha</TableHead>
                            <TableHead className="w-[120px]">Tipo</TableHead>
                            <TableHead>Cliente / Detalle</TableHead>
                            <TableHead>Realizada por</TableHead>
                            <TableHead>Producto/Destino</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operations && operations.length > 0 ? (
                            operations.map((op, index) => {
                                const config = typeConfig[op.tipo] || typeConfig["Minorista"];
                                const IconComponent = config.icon;
                                const currency = currencyMap[op.divisa ?? ""] ?? "ARS";

                                return (
                                    <TableRow
                                        key={op.id || index}
                                        className="border-b-gray-50 dark:border-b-slate-900/50 hover:bg-gray-50/50 dark:hover:bg-slate-900/50"
                                    >
                                        <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(op.fecha)}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-md ${config.color}`}>
                                                <IconComponent size={12} />
                                                {config.label}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                {op.cliente || op.detalle || "Sin detalle"}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {op.auditoria ? op.auditoria.charAt(0).toUpperCase() : <User size={12} />}
                                                </div>
                                                <span className="text-xs text-gray-500">{op.auditoria || "Sistema"}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {op.tipo === "Gasto"
                                                    ? (op.destino || "-")
                                                    : [op.tipoProducto, op.modelo, op.capacidad, op.color]
                                                        .filter(Boolean)
                                                        .join(" ") || "-"
                                                }
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right font-semibold">
                                            <span className={op.tipo === "Gasto" ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                                                {op.tipo === "Gasto" ? "-" : "+"}
                                                {op.monto?.toLocaleString("es-AR", {
                                                    style: "currency",
                                                    currency: currency,
                                                })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
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

// Helper function to combine and sort operations from the new endpoint
export function combineRecentOperations(data: {
    Minorista?: any[];
    Mayorista?: any[];
    Gasto?: any[];
}, limit: number = 20): UnifiedOperation[] {
    const operations: UnifiedOperation[] = [];

    // Process Minoristas
    (data.Minorista || []).forEach(item => {
        operations.push({
            id: item["N° ID"] || item.id || Math.random().toString(),
            fecha: item["Fecha"] || item.fecha,
            cliente: item["Nombre y Apellido"] || item.cliente || "Sin Nombre",
            monto: Number(item["Total en Dolares"] || item.monto || 0),
            tipoProducto: item["Equipo | Producto"] || "",
            modelo: item["Modelo"] || "",
            capacidad: item["Tamaño"] || "",
            color: item["Color"] || "",
            auditoria: item["Auditoría"] || item.auditoria || "Sistema",
            divisa: item["Divisa"] || "USD",
            tipo: "Minorista",
        });
    });

    // Process Mayoristas
    (data.Mayorista || []).forEach(item => {
        operations.push({
            id: item["N° ID"] || item.id || Math.random().toString(),
            fecha: item["Fecha"] || item.fecha,
            cliente: item["Nombre y Apellido"] || item.cliente || "Sin Nombre",
            monto: Number(item["Total en Dolares"] || item.monto || 0),
            tipoProducto: item["Equipo | Producto"] || "",
            modelo: item["Modelo"] || "",
            capacidad: item["Tamaño"] || "",
            color: item["Color"] || "",
            auditoria: item["Auditoría"] || item.auditoria || "Sistema",
            divisa: item["Divisa"] || "USD",
            tipo: "Mayorista",
        });
    });

    // Process Gastos
    (data.Gasto || []).forEach(item => {
        operations.push({
            id: item["ID"] || item.id || Math.random().toString(),
            fecha: item["Fecha"] || item.fecha,
            cliente: item["Detalle"] || "Sin detalle",
            monto: Number(item["Monto"] || 0),
            detalle: item["Detalle"] || "",
            destino: item["Destino"] || "-",
            auditoria: item["Auditoría"] || item.auditoria || "Sistema",
            divisa: item["Divisa"] || "USD",
            tipo: "Gasto",
        });
    });

    // Sort by date descending and limit
    return operations
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, limit);
}
