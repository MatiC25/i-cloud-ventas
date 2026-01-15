import { useState } from "react"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { saveOperacion } from "@/services/api-back"
import { useUser } from "@clerk/clerk-react"
import { OperacionForm, OperacionFormData } from "./OperacionForm"

export function NuevaOperacion({
    open,
    onOpenChange,
    onRefresh,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onRefresh?: () => void
}) {
    const { user } = useUser()

    const onSubmit = async (values: OperacionFormData) => {
        const payload = {
            ...values,
            fecha: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
            usuario: user?.fullName || user?.username || "Usuario Manual",
        }

        onOpenChange(false);
        toast.info("Procesando operación...");

        saveOperacion(payload)
            .then(() => {
                toast.success("Operación sincronizada con éxito");
                onRefresh?.();
            })
            .catch((error) => {
                console.error(error);
                toast.error("Error al sincronizar la operación. Revisa tu conexión.");
            });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Operación</DialogTitle>
                    <DialogDescription>
                        Carga manual de ingresos o gastos en el Libro Diario.
                    </DialogDescription>
                </DialogHeader>

                <OperacionForm
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
