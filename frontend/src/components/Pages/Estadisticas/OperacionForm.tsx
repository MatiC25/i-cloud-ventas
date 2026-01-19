import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Combobox } from "@/components/ui/combobox"
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
import { Textarea } from "@/components/ui/textarea"

import { IOperacion } from "@/types"
import { useSystemConfig } from "@/hooks/useSystemConfig"


const formSchema = z.object({
    tipo: z.string().min(1, "Selecciona un tipo"),
    categoria: z.string().min(1, "Selecciona una categoría"),
    monto: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    divisa: z.string().min(1, "Selecciona divisa"),
    destino: z.string().min(1, "Selecciona destino"),
    detalle: z.string().min(1, "Ingresa un detalle"),
    comentarios: z.string().optional(),
})

export type OperacionFormData = z.infer<typeof formSchema>

interface OperacionFormProps {
    initialData?: IOperacion;
    onSubmit: (data: OperacionFormData) => Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
}

export function OperacionForm({ initialData, onSubmit, onCancel, submitLabel = "Guardar Operación" }: OperacionFormProps) {
    const [options, setOptions] = useState({
        tipos: [] as string[],
        categorias: [] as string[],
        divisas: [] as string[],
        destinos: [] as string[]
    })

    const { config } = useSystemConfig();
    const gastosConfig = config?.gastosConfig;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: initialData?.tipo || "",
            categoria: initialData?.categoria || "",
            monto: initialData?.monto || 0,
            divisa: initialData?.divisa || "",
            destino: initialData?.destino || "",
            detalle: initialData?.detalle || "",
            comentarios: initialData?.comentarios || "",
        },
    })

    useEffect(() => {
        if (!gastosConfig) return; // Wait until config is loaded

        setOptions({
            tipos: gastosConfig.tiposDeMovimiento,
            categorias: gastosConfig.categoriaDeMovimiento,
            divisas: gastosConfig.divisas,
            destinos: gastosConfig.destinos
        });
    }, [gastosConfig])

    // Reset logic when initialData changes (important for reusing the same form instance in a dialog)
    useEffect(() => {
        if (initialData) {
            form.reset({
                tipo: initialData.tipo,
                categoria: initialData.categoria,
                monto: initialData.monto,
                divisa: initialData.divisa,
                destino: initialData.destino,
                detalle: initialData.detalle,
                comentarios: initialData.comentarios,
            })
        }
    }, [initialData, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Movimiento</FormLabel>
                                <Combobox
                                    options={options.tipos}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <Combobox
                                    options={options.categorias}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="detalle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detalle / Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Compra de insumos" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="monto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Ej: 1000" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="divisa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Divisa</FormLabel>
                                <Combobox
                                    options={options.divisas}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="destino"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Destino / Origen</FormLabel>
                            <Combobox
                                options={options.destinos}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Seleccionar"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="comentarios"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comentarios</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Opcional..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit">{submitLabel}</Button>
                </div>
            </form>
        </Form>
    )
}
