import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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

// Esquema de validación
const formSchema = z.object({
  tipo: z.string().min(1, "Selecciona un tipo"),
  cliente: z.string().optional(),
  descripcion: z.string().min(3, "La descripción es obligatoria"),
  link: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

export type TaskFormData = z.infer<typeof formSchema>

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
  initialValues?: TaskFormData
}

export function TaskForm({ onSubmit, onCancel, initialValues }: TaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      tipo: "EntregaProducto",
      cliente: "",
      descripcion: "",
      link: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
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
          <Button type="submit">Crear Tarea</Button>
        </div>
      </form>
    </Form>
  )
}