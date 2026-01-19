import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, parse, setHours, setMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover-standard"
import { cn } from "@/lib/utils"

// Esquema de validación
const formSchema = z.object({
    tipo: z.string().min(1, "Selecciona un tipo"),
    cliente: z.string().optional(),
    descripcion: z.string().min(3, "La descripción es obligatoria"),
    link: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
    fechaProgramada: z.string().optional(),
    horaProgramada: z.string().optional(), // Formato "HH:mm"
})

export type TaskFormData = z.infer<typeof formSchema>

interface TaskFormProps {
    onSubmit: (data: TaskFormData) => void
    onCancel: () => void
    initialValues?: TaskFormData
    isEditMode?: boolean
}

// Helper: Combinar fecha y hora en ISO string
function combineDateAndTime(dateIso: string, time: string): string {
    if (!dateIso) return ""

    try {
        let date = new Date(dateIso)

        if (time) {
            const [hours, minutes] = time.split(":").map(Number)
            date = setHours(date, hours)
            date = setMinutes(date, minutes)
        }

        return date.toISOString()
    } catch {
        return dateIso
    }
}

// Helper: Extraer hora de un ISO string
function extractTimeFromIso(isoString: string): string {
    if (!isoString) return ""

    try {
        const date = new Date(isoString)
        const hours = date.getHours()
        const minutes = date.getMinutes()

        // Si es medianoche exacta (00:00), considerarlo como "sin hora"
        if (hours === 0 && minutes === 0) return ""

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    } catch {
        return ""
    }
}

export function TaskForm({ onSubmit, onCancel, initialValues, isEditMode }: TaskFormProps) {
    // Extraer hora de fechaProgramada si existe
    const initialTime = initialValues?.fechaProgramada
        ? extractTimeFromIso(initialValues.fechaProgramada)
        : ""

    const form = useForm<TaskFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: initialValues?.tipo || "EntregaProducto",
            cliente: initialValues?.cliente || "",
            descripcion: initialValues?.descripcion || "",
            link: initialValues?.link || "",
            fechaProgramada: initialValues?.fechaProgramada || "",
            horaProgramada: initialTime,
        },
    })

    // Handler personalizado para combinar fecha y hora antes de enviar
    const handleFormSubmit = (data: TaskFormData) => {
        const finalData = {
            ...data,
            // Combinar fecha + hora en fechaProgramada
            fechaProgramada: combineDateAndTime(data.fechaProgramada || "", data.horaProgramada || "")
        }
        // Remover horaProgramada del payload final (no se persiste por separado)
        delete (finalData as any).horaProgramada
        onSubmit(finalData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

                {/* Campo TIPO */}
                <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Tarea</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="EntregaProducto">Entrega Producto</SelectItem>
                                    <SelectItem value="Soporte">Soporte Técnico</SelectItem>
                                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo CLIENTE */}
                <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cliente (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre del cliente..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo DESCRIPCIÓN */}
                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="¿Qué hay que hacer?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* FECHA y HORA en fila */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Campo FECHA PROGRAMADA */}
                    <FormField
                        control={form.control}
                        name="fechaProgramada"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(new Date(field.value), "dd/MM/yyyy", { locale: es })
                                                ) : (
                                                    <span>Seleccionar</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                field.onChange(date ? date.toISOString() : "")
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Campo HORA PROGRAMADA */}
                    <FormField
                        control={form.control}
                        name="horaProgramada"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Hora (Opcional)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            {...field}
                                            className={cn(
                                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                                                "ring-offset-background placeholder:text-muted-foreground",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                "disabled:cursor-not-allowed disabled:opacity-50",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        />
                                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Campo LINK */}
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">{isEditMode ? "Guardar Cambios" : "Crear Tarea"}</Button>
                </div>
            </form>
        </Form>
    )
}
