import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Package } from 'lucide-react';
import { RankingProductos } from '@/types';

interface TopProductsTableProps {
    topProducts: RankingProductos[];
}

export function TopProductsTable({ topProducts }: TopProductsTableProps) {
    return (
        <div className="bg-white dark:bg-slate-950 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold tracking-tight">Top Productos</h3>
                <p className="text-sm text-gray-500">Productos más vendidos por cantidad.</p>
            </div>
            <div className="p-2 flex-1 overflow-auto custom-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-gray-100 dark:border-b-slate-800">
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topProducts && topProducts.length > 0 ? (
                            topProducts.map((producto, index) => (
                                <TableRow key={index} className="border-b-gray-50 dark:border-b-slate-900/50 hover:bg-gray-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-gray-400" />
                                            {producto.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900 dark:text-white">
                                        {producto.cantidad}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                                        ${producto.monto.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                    No hay datos aún.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
