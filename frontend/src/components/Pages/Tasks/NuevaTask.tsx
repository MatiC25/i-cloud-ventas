import { useSWRConfig } from "swr"
import { useUser } from "@clerk/clerk-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
// Importamos updateTask también
import { createTask, updateTask } from "@/services/api-back"
import { TaskForm, TaskFormData } from "./TaskForm"
import { ITaskUI, TASKS_KEY } from "@/types"

export function NuevaTask({
    open,
    onOpenChange,
    taskToEdit,
    initialDate  // Nueva prop para pre-llenar fecha desde el calendario
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskToEdit?: ITaskUI | null
    initialDate?: string  // ISO date string
}) {
    const { user } = useUser()
    const { mutate } = useSWRConfig()

    const isEditMode = !!taskToEdit // Booleano para saber si editamos

    const onSubmit = async (values: TaskFormData) => {
        onOpenChange(false) // Cerramos modal

        if (isEditMode && taskToEdit) {
            // ===========================
            //       LÓGICA DE EDICIÓN
            // ===========================
            const updatedTask = {
                ...taskToEdit, // Mantenemos ID, fecha creación, etc.
                ...values,     // Sobrescribimos con lo nuevo del form
                fechaProgramada: values.fechaProgramada || taskToEdit.fechaProgramada,
                // Opcional: Actualizar auditoría al que editó último
                auditoria: user?.fullName || user?.username || "Usuario Manual",
            }

            // UI Optimista (Map): Buscamos la tarea y la reemplazamos
            mutate(TASKS_KEY, (currentTasks: any[] = []) => {
                return currentTasks.map(t => t.id === taskToEdit.id ? updatedTask : t)
            }, false)

            toast.info("Actualizando tarea...")

            try {
                // Llamada API update
                await updateTask(updatedTask) // Asegúrate que tu updateTask acepte el objeto completo
                await mutate(TASKS_KEY)
                toast.success("Tarea actualizada")
            } catch (error) {
                console.error(error)
                toast.error("Error al actualizar")
                mutate(TASKS_KEY) // Rollback
            }

        } else {
            // ===========================
            //       LÓGICA DE CREAR
            // ===========================
            const newTaskPayload = {
                ...values,
                cliente: values.cliente || "",
                link: values.link || "",
                fechaProgramada: values.fechaProgramada || "",
                id: crypto.randomUUID(),
                estado: "Pendiente",
                is_deleted: false,
                created_at: new Date().toISOString(),
                auditoria: user?.fullName || user?.username || "Usuario Manual",
                isTemp: true
            }

            // UI Optimista (Prepend): Agregamos al inicio
            mutate(TASKS_KEY, (currentTasks: any[] = []) => [newTaskPayload, ...currentTasks], false)

            toast.info("Creando tarea...")

            try {
                await createTask(newTaskPayload)
                await mutate(TASKS_KEY)
                toast.success("Tarea creada con éxito")
            } catch (error) {
                console.error(error)
                toast.error("Error al crear. Se revertirán los cambios.")
                mutate(TASKS_KEY)
            }
        }
    }

    // Determinar valores iniciales para el formulario
    const getInitialValues = (): TaskFormData | undefined => {
        if (isEditMode && taskToEdit) {
            return {
                tipo: taskToEdit.tipo,
                descripcion: taskToEdit.descripcion,
                cliente: taskToEdit.cliente,
                link: taskToEdit.link,
                fechaProgramada: taskToEdit.fechaProgramada || ""
            }
        }

        // Si hay una fecha inicial (click en día del calendario), la usamos
        if (initialDate) {
            return {
                tipo: "EntregaProducto",
                cliente: "",
                descripcion: "",
                link: "",
                fechaProgramada: initialDate
            }
        }

        return undefined
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    {/* Título dinámico */}
                    <DialogTitle>{isEditMode ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Modifica los detalles de la tarea existente."
                            : "Crea una tarea compartida para el equipo."}
                    </DialogDescription>
                </DialogHeader>

                {/* Pasamos key para forzar re-render si cambia taskToEdit o initialDate */}
                <TaskForm
                    key={taskToEdit ? taskToEdit.id : initialDate || 'new'}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    initialValues={getInitialValues()}
                    isEditMode={isEditMode}
                />
            </DialogContent>
        </Dialog>
    )
}
