import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Wallet, Banknote, Landmark, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { SiVisa, SiMastercard, SiBinance, SiTether, SiMercadopago, SiBookbub, SiPaypal } from "react-icons/si"
import { NuevaOperacion } from "./NuevaOperacion"
import { getOperaciones, deleteOperacion, updateOperacion } from "@/services/api-back"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IOperacion } from "@/types"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { OperacionForm, OperacionFormData } from "./OperacionForm"

export function TablaOperaciones() {
    const [data, setData] = useState<IOperacion[]>([])
    const [loading, setLoading] = useState(true)

    // Estado para EDICIÓN (Dialog)
    const [editingOperation, setEditingOperation] = useState<IOperacion | null>(null)

    // Estado para ELIMINAR
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [operationToDelete, setOperationToDelete] = useState<IOperacion | null>(null)

    useEffect(() => {
        fetchOperaciones()
    }, [])

    const fetchOperaciones = async (forceRefresh = false) => {
        try {
            setLoading(true)
            const result = await getOperaciones(forceRefresh)
            setData(Array.isArray(result) ? result : [])
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar operaciones")
            setData([])
        } finally {
            setLoading(false)
        }
    }

    // --- Manejo Acción Eliminar ---
    const confirmDelete = (row: IOperacion) => {
        setOperationToDelete(row)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!operationToDelete) return;

        try {
            toast.loading("Eliminando operación...");
            // Optimistic update
            const idToDelete = operationToDelete.id;
            setDeleteDialogOpen(false);

            const response = await deleteOperacion(idToDelete) as { status: string };

            if (response?.status === 'success') {
                toast.dismiss();
                toast.success("Operación eliminada");
                setData(prev => prev.filter(item => item.id !== idToDelete));
            } else {
                toast.dismiss();
                toast.error("Error al eliminar");
                fetchOperaciones(); // Revert
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error de conexión");
            fetchOperaciones(); // Revert
        } finally {
            setOperationToDelete(null);
        }
    }

    // --- Manejo Edición (Dialog Update) ---
    const handleUpdate = async (values: OperacionFormData) => {
        if (!editingOperation) return;

        // Guard against empty IDs which would cause all empty-ID rows to be updated
        if (!editingOperation.id) {
            toast.error("No se puede editar una operación sin ID.");
            setEditingOperation(null);
            return;
        }

        try {
            const updatedOp: IOperacion = {
                ...editingOperation,
                ...values,
                // Mantener campos que no están en el form si es necesario, o actualizarlos
                // OperacionFormData tiene: tipo, categoria, monto, divisa, destino, detalle, comentarios
                // IOperacion tiene además: id, fecha, auditoria
            };

            // Optimistic update
            setData(prev => prev.map(item => item.id === updatedOp.id ? updatedOp : item));
            setEditingOperation(null);

            toast.loading("Actualizando operación...");
            const response = await updateOperacion(updatedOp) as { status: string };

            if (response?.status === 'success') {
                toast.dismiss();
                toast.success("Operación actualizada");
            } else {
                toast.dismiss();
                toast.error("Error al actualizar");
                fetchOperaciones(); // Revert
            }

        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Error al actualizar");
            fetchOperaciones(); // Revert
        }
    }

    const columns = useMemo<ColumnDef<IOperacion>[]>(() => [
        {
            accessorKey: "fecha",
            header: "Fecha",
            cell: ({ row }) => format(row.original.fecha, "dd/MM/yyyy HH:mm", { locale: es }),
        },
        {
            accessorKey: "destino",
            header: "Destino",
            cell: ({ row }) => {
                const destino = row.original.destino || "";

                const getDestinationIcon = (name: string) => {
                    const lowerName = name.toLowerCase();
                    if (lowerName.includes("visa")) return <SiVisa className="h-5 w-5 text-blue-800 mr-2" />;
                    if (lowerName.includes("master")) return <SiMastercard className="h-5 w-5 text-orange-600 mr-2" />;
                    if (lowerName.includes("bbva") || lowerName.includes("frances")) return <SiBookbub className="h-5 w-5 text-blue-900 mr-2" />;
                    if (lowerName.includes("binance")) return <SiBinance className="h-5 w-5 text-yellow-500 mr-2" />;
                    if (lowerName.includes("usdt") || lowerName.includes("tether")) return <SiTether className="h-5 w-5 text-green-500 mr-2" />;
                    if (lowerName.includes("mercado") || lowerName.includes("mp")) return <SiMercadopago className="h-5 w-5 text-blue-500 mr-2" />;

                    if (lowerName.includes("efectivo") || lowerName.includes("cash")) return <Banknote className="h-5 w-5 text-green-600 mr-2" />;
                    if (lowerName.includes("banco") || lowerName.includes("bank") || lowerName.includes("santander") || lowerName.includes("galicia")) return <Landmark className="h-5 w-5 text-slate-600 mr-2" />;
                    if (lowerName.includes("paypal")) return <SiPaypal className="h-5 w-5 text-blue-500 mr-2" />;
                    return <Wallet className="h-5 w-5 text-gray-500 mr-2" />;
                };

                return (
                    <div className="flex items-center">
                        {getDestinationIcon(destino)}
                        <span>{destino}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "detalle",
            header: "Detalle",
        },
        {
            accessorKey: "tipo",
            header: "Tipo",
            cell: ({ row }) => {
                const tipo = row.original.tipo;
                return (
                    <span className={tipo === "Ingreso" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {tipo}
                    </span>
                )
            }
        },
        {
            accessorKey: "categoria",
            header: "Categoría",
        },
        {
            accessorKey: "monto",
            header: () => <div className="text-right">Monto</div>,
            cell: ({ row }) => {
                const isIngreso = row.original.tipo === "Ingreso";
                let formattedValue = "";
                try {
                    formattedValue = row.original.monto.toLocaleString("en-US", { style: "currency", currency: row.original.divisa });
                } catch (e) {
                    formattedValue = `${row.original.divisa} ${row.original.monto}`;
                }

                return (
                    <div className={`text-right font-bold ${isIngreso ? "text-green-600" : "text-red-600"}`}>
                        {formattedValue}
                    </div>
                )
            },
        },
        {
            accessorKey: "auditoria",
            header: "Usuario",
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.auditoria}</span>
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
                                <DropdownMenuItem onClick={() => setEditingOperation(row.original)} className="cursor-pointer">
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
                title="Libro Diario"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={fetchOperaciones}
                toolbarActions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                toast.loading("Verificando integridad y reparando IDs...");
                                try {
                                    // Pass empty string to use backend configured Sheet ID
                                    await import("@/services/api-back").then(m => m.checkSpreadsheetIntegrity(""));
                                    toast.dismiss();
                                    toast.success("Datos verificados. Recargando...");
                                    fetchOperaciones(true);
                                } catch (e) {
                                    toast.dismiss();
                                    toast.error("Error al verificar integridad");
                                }
                            }}
                        >
                            Reparar Datos
                        </Button>
                        <NuevaOperacion onRefresh={() => fetchOperaciones(true)} />
                    </div>
                }
            />

            <Dialog open={!!editingOperation} onOpenChange={(open) => !open && setEditingOperation(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Operación</DialogTitle>
                        <DialogDescription>
                            Modificar los detalles de la operación existente.
                        </DialogDescription>
                    </DialogHeader>
                    {editingOperation && (
                        <OperacionForm
                            initialData={editingOperation}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingOperation(null)}
                            submitLabel="Guardar Cambios"
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la operación de
                            {operationToDelete && (
                                <span className="font-bold text-foreground mx-1">
                                    {operationToDelete.monto.toLocaleString("en-US", { style: "currency", currency: operationToDelete.divisa })}
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
