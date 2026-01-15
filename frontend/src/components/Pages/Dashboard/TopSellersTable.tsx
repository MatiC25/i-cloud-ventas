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
import { User } from 'lucide-react';
import { VendedorStat } from '@/types';

interface TopSellersTableProps {
    topSellers: VendedorStat[];
}

export function TopSellersTable({ topSellers }: TopSellersTableProps) {
    return (
        <div className="bg-white dark:bg-slate-950 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold tracking-tight">Top Vendedores</h3>
                <p className="text-sm text-gray-500">Rendimiento por vendedor este mes.</p>
            </div>
            <div className="p-2 flex-1 overflow-auto custom-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-gray-100 dark:border-b-slate-800">
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-right">Ventas</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSellers && topSellers.length > 0 ? (
                            topSellers.map((vendedor, index) => (
                                <TableRow key={index} className="border-b-gray-50 dark:border-b-slate-900/50 hover:bg-gray-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'}`}>
                                                {vendedor.name.charAt(0).toUpperCase()}
                                            </div>
                                            {vendedor.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-600 dark:text-gray-400">
                                        {vendedor.count}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                                        ${vendedor.profit.toLocaleString()}
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
