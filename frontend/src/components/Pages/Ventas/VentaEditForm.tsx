import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IVentaTabla } from "@/types"

const formSchema = z.object({
    cliente: z.string().min(1, "El cliente es obligatorio"),
    producto: z.string().min(1, "El producto es obligatorio"),
    monto: z.coerce.number().min(0, "El monto no puede ser negativo"),
    costo: z.coerce.number().min(0, "El costo no puede ser negativo"),
    cantidad: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
    tipoCambio: z.coerce.number().min(0, "El tipo de cambio debe ser mayor a 0"),
    conversion: z.coerce.number().min(0, "La conversión no puede ser negativa"),
})

export type VentaEditFormData = z.infer<typeof formSchema>

interface VentaEditFormProps {
    initialData: IVentaTabla;
    onSubmit: (data: VentaEditFormData) => Promise<void>;
    onCancel: () => void;
}

export function VentaEditForm({ initialData, onSubmit, onCancel }: VentaEditFormProps) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cliente: initialData.cliente || "",
            producto: initialData.producto || "",
            monto: initialData.monto || 0,
            costo: initialData.costo || 0,
            cantidad: initialData.cantidad || 1,
            tipoCambio: initialData.tipoCambio || 0,
            conversion: initialData.conversion || 0
        },
    })

    // Watch values to calculate profit in real-time for display
    const currentMonto = form.watch("monto") as number
    const currentCosto = form.watch("costo") as number
    const currentCantidad = form.watch("cantidad") as number
    const calculatedProfit = (currentMonto || 0) - ((currentCosto || 0) * (currentCantidad || 1))

    useEffect(() => {
        if (initialData) {
            form.reset({
                cliente: initialData.cliente,
                producto: initialData.producto,
                monto: initialData.monto,
                costo: initialData.costo,
                cantidad: initialData.cantidad,
                tipoCambio: initialData.tipoCambio,
                conversion: initialData.conversion
            })
        }
    }, [initialData, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre del cliente" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="producto"
                        render={({ field }) => (
                            <FormItem className="col-span-3">
                                <FormLabel>Producto</FormLabel>
                                <FormControl>
                                    <Input placeholder="Descripción del producto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cantidad"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cant.</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="monto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Venta (USD)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="costo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Costo Unitario (USD)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Profit Display */}
                <div className={`text-sm font-medium border p-2 rounded-md ${calculatedProfit >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    Profit Estimado: {calculatedProfit.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    <span className="text-xs text-gray-500 ml-2">(Total - Costo * Cantidad)</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipoCambio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Cambio</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="conversion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Conversión (ARS/BRL)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </Form>
    )
}
