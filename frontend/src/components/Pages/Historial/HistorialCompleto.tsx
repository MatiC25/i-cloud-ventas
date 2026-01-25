import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getRecentOperations, getOperaciones, updateVenta, deleteVenta, updateOperacion, deleteOperacion } from '@/services/api-back';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Plus, Edit2, Trash2, MoreHorizontal, ShoppingCart, Users, BookOpen } from 'lucide-react';
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { OperacionReciente, IVentaTabla, IOperacion } from '@/types';
import { startOfDay, startOfMonth, startOfYear, isAfter, parseISO } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VentaEditForm, VentaEditFormData } from '../Ventas/VentaEditForm';
import { OperacionForm, OperacionFormData } from '../Estadisticas/OperacionForm';
import { NuevaOperacion } from '../Estadisticas/NuevaOperacion';
import { useNavigation } from '@/components/Layout/NavigationContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TimeFilter = 'day' | 'month' | 'year';

interface Stats {
    income: number;
    expense: number;
    salesCount: number;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Efecto cascada entre elementos
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

function safeDate(value: any): Date | null {
    if (!value) return null

    // Si viene como Date real (GAS a veces lo manda así)
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value
    }

    // Si viene como string ISO
    if (typeof value === "string") {
        const parsed = parseISO(value)
        if (!isNaN(parsed.getTime())) return parsed
    }

    return null
}

export function normalizeCurrency(value?: string): "USD" | "ARS" | "EUR" {
    if (!value) return "USD"

    const v = value
        .toLowerCase()
        .normalize("NFD")              // quita acentos
        .replace(/[\u0300-\u036f]/g, "")
        .trim()

    // DÓLARES
    if (
        v === "usd" ||
        v.includes("dolar")
    ) {
        return "USD"
    }

    // PESOS ARGENTINOS
    if (
        v === "ars" ||
        v.includes("peso")
    ) {
        return "ARS"
    }

    // EUROS (por si aparece)
    if (
        v === "eur" ||
        v.includes("euro")
    ) {
        return "EUR"
    }

    // fallback seguro
    return "USD"
}


export function HistorialCompleto() {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
    const [activeTableTab, setActiveTableTab] = useState<'minorista' | 'mayorista' | 'libro'>('minorista');
    const { setActiveTab } = useNavigation();

    // Fetch with limit=0 to get ALL operations for accurate stats
    const { data: rawData, error, isLoading, mutate } = useSWR('recentOperationsFull', () => getRecentOperations(0), {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    // --- STATES FOR ACTIONS ---
    const [editingSale, setEditingSale] = useState<IVentaTabla | null>(null);
    const [editingOp, setEditingOp] = useState<IOperacion | null>(null);

    const [deleteSaleOpen, setDeleteSaleOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<IVentaTabla | null>(null);

    const [deleteOpOpen, setDeleteOpOpen] = useState(false);
    const [opToDelete, setOpToDelete] = useState<IOperacion | null>(null);


    // --- STATS CALCULATION ---
    const filteredStats = useMemo(() => {
        if (!rawData) return { income: 0, expense: 0, salesCount: 0 };

        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
            case 'day': startDate = startOfDay(now); break;
            case 'month': startDate = startOfMonth(now); break;
            case 'year': startDate = startOfYear(now); break;
        }

        const filterDate = (item: any) => {
            const d = new Date(item.Fecha || item.fecha);
            return isAfter(d, startDate);
        };

        const minoristaRaw = (rawData.Minorista || []);
        const mayoristaRaw = (rawData.Mayorista || []);
        const gastosRaw = (rawData.Gasto || []);

        const salesCount = minoristaRaw.filter(filterDate).length + mayoristaRaw.filter(filterDate).length;

        const gastosFiltered = gastosRaw.filter(filterDate);

        // Sum helpers
        const sumMonto = (list: any[]) => list.reduce((acc, curr) => acc + Number(curr["Monto"] || 0), 0);

        const income = sumMonto(gastosFiltered.filter((g: any) => g["Tipo de Movimiento"] === "Ingreso"));
        const expense = sumMonto(gastosFiltered.filter((g: any) => g["Tipo de Movimiento"] !== "Ingreso")); // Egreso, Gasto, etc.

        return { income, expense, salesCount };

    }, [rawData, timeFilter]);


    // --- MAPPERS ---
    const mapVenta = (list: any[]): IVentaTabla[] => {
        if (!list) return [];

        return list.map(item => ({
            id: item["N° ID"] || item.id || Math.random().toString(),
            fecha: safeDate(item["Fecha"] ?? item.fecha) || new Date(),
            vendedor: item["Auditoría"] || item.auditoria || "Sistema",
            cliente: item["Nombre y Apellido"] || item.cliente || "Sin Nombre",
            producto: `${item["Equipo | Producto"] || ''} ${item["Modelo"] || ''} ${item["Tamaño"] || ''}`.trim(),
            monto: Number(item["Total en Dolares"] || item.monto || 0),
            cantidad: Number(item["Cantidad"] || 1),
            estado: item["Estado"] || "Finalizado",
            tipoCambio: Number(item["Tipo de Cambio"] || 0),
            conversion: Number(item["Conversión"] || 0),
            profit: Number(item["Profit Bruto"] || 0),
            costo: Number(item["Costo del Producto"] || 0),
            totalPesos: Number(item["Total en Pesos"] || 0),
        })).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    };

    const mapGasto = (list: any[]): IOperacion[] => {
        if (!list) return [];
        return list.map(item => ({
            id: item["ID"] || "",
            fecha: safeDate(item["Fecha"] ?? item.fecha) || new Date(),
            detalle: item["Detalle"] || "",
            tipo: item["Tipo de Movimiento"] || "",
            categoria: item["Categoría de Movimiento"] || "",
            monto: Number(item["Monto"] || 0),
            divisa: normalizeCurrency(item["Divisa"]),
            destino: item["Destino"] || "",
            comentarios: item["Comentarios"] || "",
            auditoria: item["Auditoría"] || "Sistema"
        })).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    };

    const minoristaData = useMemo(() => mapVenta(rawData?.Minorista || []), [rawData]);
    const mayoristaData = useMemo(() => mapVenta(rawData?.Mayorista || []), [rawData]);
    const gastosData = useMemo(() => mapGasto(rawData?.Gasto || []), [rawData]);


    // --- HANDLERS (CRUD) ---
    // VENTA
    const handleUpdateVenta = async (values: VentaEditFormData) => {
        if (!editingSale) return;
        try {
            toast.loading("Actualizando venta...");
            const updated: IVentaTabla = { ...editingSale, ...values, profit: values.monto - (values.costo * (editingSale.cantidad || 1)) };
            await updateVenta(updated);
            toast.dismiss();
            toast.success("Venta actualizada");
            setEditingSale(null);
            mutate(); // Refresh SWR
        } catch (e) { console.error(e); toast.dismiss(); toast.error("Error al actualizar"); }
    };

    const handleDeleteVenta = async () => {
        if (!saleToDelete) return;
        try {
            toast.loading("Eliminando venta...");
            await deleteVenta(saleToDelete.id);
            toast.dismiss();
            toast.success("Venta eliminada");
            setDeleteSaleOpen(false);
            mutate();
        } catch (e) {
            console.error(e); toast.dismiss(); toast.error("Error al eliminar");
        }
    };

    // OPERACION (GASTO)
    const handleUpdateOp = async (values: OperacionFormData) => {
        if (!editingOp) return;
        try {
            toast.loading("Actualizando operación...");
            const updated: IOperacion = { ...editingOp, ...values };
            await updateOperacion(updated);
            toast.dismiss();
            toast.success("Operación actualizada");
            setEditingOp(null);
            mutate();
        } catch (e) { console.error(e); toast.dismiss(); toast.error("Error al actualizar"); }
    };

    const handleDeleteOp = async () => {
        if (!opToDelete) return;
        try {
            toast.loading("Eliminando operación...");
            await deleteOperacion(opToDelete.id);
            toast.dismiss();
            toast.success("Operación eliminada");
            setDeleteOpOpen(false);
            mutate();
        } catch (e) {
            console.error(e); toast.dismiss(); toast.error("Error al eliminar");
        }
    };


    // --- COLUMN DEFINITIONS ---
    const ventaColumns: ColumnDef<IVentaTabla>[] = [
        {
            accessorKey: "fecha",
            header: "Fecha",
            cell: ({ row }) => format(row.original.fecha, "dd/MM/yyyy HH:mm", { locale: es }),
        },
        { accessorKey: "vendedor", header: "Auditoría" },
        { accessorKey: "cliente", header: "Cliente" },
        { accessorKey: "producto", header: "Producto" },
        {
            accessorKey: "totalPesos",
            header: () => <div className="text-center">Total ($)</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.original.totalPesos.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</div>
        },
        {
            accessorKey: "monto",
            header: () => <div className="text-center">Total (USD)</div>,
            cell: ({ row }) => <div className="text-center font-bold text-green-600">{row.original.monto.toLocaleString("en-US", { style: "currency", currency: "USD" })}</div>
        },
        {
            accessorKey: "conversion",
            header: () => <div className="text-center">Conv.</div>,
            cell: ({ row }) => <div className="text-center text-xs text-muted-foreground">{row.original.tipoCambio > 0 ? row.original.tipoCambio.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "-"}</div>
        },
        {
            id: "actions",
            header: () => <div className="text-center">Acciones</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingSale(row.original)} className="cursor-pointer"><Edit2 className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSaleToDelete(row.original); setDeleteSaleOpen(true); }} className="text-red-600 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const gastoColumns: ColumnDef<IOperacion>[] = [
        {
            accessorKey: "fecha",
            header: "Fecha",
            cell: ({ row }) => format(row.original.fecha, "dd/MM/yyyy HH:mm", { locale: es }),
        },
        { accessorKey: "auditoria", header: "Auditoría" },
        { accessorKey: "detalle", header: "Detalle" },
        {
            accessorKey: "tipo",
            header: "Tipo",
            cell: ({ row }) => <span className={row.original.tipo === 'Ingreso' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{row.original.tipo}</span>
        },
        { accessorKey: "categoria", header: "Categoría" },
        { accessorKey: "destino", header: "Destino" },
        {
            accessorKey: "monto",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => {
                const currency = normalizeCurrency(row.original.divisa)

                return (
                    <div
                        className={`text-right font-bold ${row.original.tipo === "Ingreso"
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {row.original.monto.toLocaleString("en-US", {
                            style: "currency",
                            currency,
                        })}
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingOp(row.original)} className="cursor-pointer"><Edit2 className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setOpToDelete(row.original); setDeleteOpOpen(true); }} className="text-red-600 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-[300px]" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    if (error) return <div className="text-red-500 text-center">Error al cargar datos.</div>;

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header & Filter */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Historial Completo</h2>
                    <p className="text-slate-500 dark:text-slate-400">Visión unificada de todas las operaciones.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button onClick={() => setActiveTab('nueva-venta-minimalista')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Nueva Venta
                        </Button>
                        {/* We use Trigger capability of NuevaOperacion if available, else we render button that opens it */}
                        <NuevaOperacion onRefresh={() => mutate()} trigger={<Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Nueva Operación</Button>} />
                    </div>

                    <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="day">Hoy</TabsTrigger>
                            <TabsTrigger value="month">Mes</TabsTrigger>
                            <TabsTrigger value="year">Año</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos (Gastos)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{filteredStats.income.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                        <p className="text-xs text-muted-foreground">{timeFilter === 'day' ? 'Hoy' : timeFilter === 'month' ? 'Este Mes' : 'Este Año'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Egresos (Gastos)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{filteredStats.expense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                        <p className="text-xs text-muted-foreground">{timeFilter === 'day' ? 'Hoy' : timeFilter === 'month' ? 'Este Mes' : 'Este Año'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cantidad de Ventas</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{filteredStats.salesCount}</div>
                        <p className="text-xs text-muted-foreground">Minoristas + Mayoristas</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tables with Tabs */}
            <motion.div variants={itemVariants}>
                <Tabs value={activeTableTab} onValueChange={(v) => setActiveTableTab(v as 'minorista' | 'mayorista' | 'libro')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="minorista" className="flex items-center gap-2">
                            <Users size={16} />
                            Clientes Minoristas ({minoristaData.length})
                        </TabsTrigger>
                        <TabsTrigger value="mayorista" className="flex items-center gap-2">
                            <Users size={16} />
                            Clientes Mayoristas ({mayoristaData.length})
                        </TabsTrigger>
                        <TabsTrigger value="libro" className="flex items-center gap-2">
                            <BookOpen size={16} />
                            Libro Diario ({gastosData.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="minorista">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Users className="text-blue-500" size={20} />
                                <h3 className="text-lg font-semibold">Ventas Minoristas</h3>
                            </div>
                            <DataTable columns={ventaColumns} data={minoristaData} />
                        </div>
                    </TabsContent>

                    <TabsContent value="mayorista">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Users className="text-purple-500" size={20} />
                                <h3 className="text-lg font-semibold">Ventas Mayoristas</h3>
                            </div>
                            <DataTable columns={ventaColumns} data={mayoristaData} />
                        </div>
                    </TabsContent>

                    <TabsContent value="libro">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <BookOpen className="text-emerald-500" size={20} />
                                <h3 className="text-lg font-semibold">Libro Diario - Gastos y Movimientos</h3>
                            </div>
                            <DataTable columns={gastoColumns} data={gastosData} />
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Edit DIALOGS */}
            <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Editar Venta</DialogTitle></DialogHeader>
                    {editingSale && <VentaEditForm initialData={editingSale} onSubmit={handleUpdateVenta} onCancel={() => setEditingSale(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingOp} onOpenChange={(open) => !open && setEditingOp(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Editar Operación</DialogTitle></DialogHeader>
                    {editingOp && <OperacionForm initialData={editingOp} onSubmit={handleUpdateOp} onCancel={() => setEditingOp(null)} submitLabel="Guardar" />}
                </DialogContent>
            </Dialog>

            {/* DELETE ALERTS */}
            <AlertDialog open={deleteSaleOpen} onOpenChange={setDeleteSaleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Venta?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteVenta} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteOpOpen} onOpenChange={setDeleteOpOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Operación?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOp} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </motion.div>
    );
}
