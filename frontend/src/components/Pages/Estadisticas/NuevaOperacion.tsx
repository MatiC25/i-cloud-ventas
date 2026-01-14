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

export function NuevaOperacion({ onRefresh }: { onRefresh?: () => void }) {
    const [open, setOpen] = useState(false)
    const { user } = useUser()

    const onSubmit = async (values: OperacionFormData) => {
        try {
            const payload = {
                ...values,
                fecha: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                usuario: user?.fullName || user?.username || "Usuario Manual",
            }

            toast.promise(saveOperacion(payload), {
                loading: 'Guardando operación...',
                success: (data: any) => {
                    setOpen(false)
                    if (onRefresh) onRefresh()
                    return "Operación registrada con éxito"
                },
                error: 'Error al guardar operación'
            })

        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Operación
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Operación</DialogTitle>
                    <DialogDescription>
                        Carga manual de ingresos o gastos en el Libro Diario.
                    </DialogDescription>
                </DialogHeader>

                <OperacionForm onSubmit={onSubmit} onCancel={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
