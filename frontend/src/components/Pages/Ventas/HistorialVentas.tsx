import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getVentas, updateVenta, deleteVenta } from "@/services/api-back"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IVentaTabla } from "@/types"
import { DataTable } from "@/components/ui/data-table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { VentaEditForm, VentaEditFormData } from "./VentaEditForm"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function HistorialVentas() {
    const [data, setData] = useState<IVentaTabla[]>([])
    const [loading, setLoading] = useState(true)

    // Estado para EDICIÓN (Dialog)
    const [editingSale, setEditingSale] = useState<IVentaTabla | null>(null)

    // Estado para ELIMINAR
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [saleToDelete, setSaleToDelete] = useState<IVentaTabla | null>(null)

    useEffect(() => {
        fetchVentas()
    }, [])

    const fetchVentas = async (force = false) => {
        try {
            setLoading(true)
            const result = await getVentas(50, force)
            setData(Array.isArray(result) ? result : [])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar ventas")
            setData([])
        } finally {
            setLoading(false)
        }
    }

    // --- Manejo de Edición y Eliminar ---
    const confirmDelete = (row: IVentaTabla) => {
        setSaleToDelete(row)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!saleToDelete) return;

        try {
            toast.loading("Eliminando venta...");
            // Optimistic delete
            const idToDelete = saleToDelete.id;
            setDeleteDialogOpen(false);

            const response: any = await deleteVenta(idToDelete);

            if (response?.status === 'success') {
                toast.dismiss();
                toast.success("Venta eliminada");
                setData(prev => prev.filter(item => item.id !== idToDelete));
            } else {
                toast.dismiss();
                toast.error("Error al eliminar venta");
                fetchVentas(); // Revert
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error de conexión");
            fetchVentas(); // Revert
        } finally {
            setSaleToDelete(null);
        }
    }

    const handleUpdate = async (values: VentaEditFormData) => {
        if (!editingSale) return;

        try {
            const updatedSale: IVentaTabla = {
                ...editingSale,
                ...values,
                // Recalculate profit derived from new form values
                profit: values.monto - (values.costo * (editingSale.cantidad || 1)),
                // Note: quantity is not editable in this simplified form so we use existing quantity
            };

            // Optimistic update
            setData(prev => prev.map(item => item.id === updatedSale.id ? updatedSale : item));
            setEditingSale(null);

            toast.loading("Actualizando venta...");
            const response: any = await updateVenta(updatedSale);

            if (response?.status === 'success') {
                toast.dismiss();
                toast.success("Venta actualizada");
            } else {
                toast.dismiss();
                toast.error("Error al guardar en servidor");
                fetchVentas(); // Revert
            }
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Error de conexión");
            fetchVentas(); // Revert
        }
    }

    // --- COLUMNAS ---
    const columns = useMemo<ColumnDef<IVentaTabla>[]>(() => [
        {
            accessorKey: "fecha",
            header: "Fecha",
            cell: ({ row }) => format(row.original.fecha, "dd/MM/yyyy HH:mm", { locale: es }),
        },
        {
            accessorKey: "vendedor", // .vendedor
            header: "Vendedor",
            cell: ({ row }) => <span className="text-blue-500">{row.original.vendedor}</span>
        },
        {
            accessorKey: "cliente",
            header: "Cliente",
        },
        {
            accessorKey: "producto",
            header: "Producto",
        },
        {
            accessorKey: "cantidad",
            header: "Cantidad",
            cell: ({ row }) => <span>{row.original.cantidad}</span>
        },
        // Nuevas Columnas (Solo lectura aquí, edición en Dialog)
        {
            accessorKey: "tipoCambio",
            header: "TC",
            cell: ({ row }) => <span>{row.original.tipoCambio}</span>
        },
        {
            accessorKey: "conversion",
            header: "Conversión",
            cell: ({ row }) => <span className="font-mono">{row.original.conversion?.toLocaleString()}</span>
        },
        {
            accessorKey: "monto",
            header: () => <div className="text-right">Total USD</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-right font-bold text-green-600">
                        {row.original.monto.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </div>
                )
            },
        },
        {
            accessorKey: "profit",
            header: () => <div className="text-right">Profit</div>,
            cell: ({ row }) => {
                const val = row.original.profit;
                return (
                    <div className={`text-right font-bold ${Number(val) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {Number(val)?.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </div>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <div className="text-center w-full">Acciones</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setEditingSale(row.original)} className="cursor-pointer">
                                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDelete(row.original)} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ], []);

    return (
        <>
            <DataTable
                title="Historial de Ventas"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={fetchVentas}
            />

            <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Venta</DialogTitle>
                        <DialogDescription>
                            Modificar los detalles de la venta existente.
                        </DialogDescription>
                    </DialogHeader>
                    {editingSale && (
                        <VentaEditForm
                            initialData={editingSale}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingSale(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la venta de
                            {saleToDelete && (
                                <span className="font-bold text-foreground mx-1">
                                    {saleToDelete.producto}
                                </span>
                            )}
                            de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
