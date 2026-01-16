import { IFormConfig } from "@/types";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconCash, IconPlus, IconTrash, IconTruckDelivery } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, HelpCircle, Plus } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";



interface IDatosTransaccionProps {
    formConfig: IFormConfig;
}

export function DatosTransaccion({ formConfig }: IDatosTransaccionProps) {
    const { control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "pagos",
    });

    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Sync activeIndex with fields length
    useEffect(() => {
        if (activeIndex >= fields.length && fields.length > 0) {
            setActiveIndex(fields.length - 1);
        } else if (fields.length === 0) {
            setActiveIndex(0);
        }
    }, [fields.length, activeIndex]);

    const pagos = watch("pagos") || [];
    const totalPagos = pagos.length;

    // Calcular si el método está completo (tiene monto > 0)
    const pagosCompletos = pagos.filter((p: any) => Number(p.monto) > 0).length;

    const addPayment = () => {
        append({ monto: 0, divisa: "USD", tipoCambio: 1550 });
        setTimeout(() => setActiveIndex(fields.length), 50);
    };

    const removePayment = (index: number) => {
        remove(index);
        if (activeIndex >= index && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleSubmit = (note: string) => {
        console.log('Submitted note:', note)
    }

    return (
        <div className="space-y-6">
            <Card className="w-full shadow-md border-t-4 border-t-green-500">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-500/10 rounded-full">
                                <IconCash className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Métodos de Pago</CardTitle>
                                <p className="text-xs text-muted-foreground mr-2">
                                    {pagosCompletos}/{totalPagos} pagos registrados
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPayment}
                                className="h-8 gap-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-600"
                            >
                                <IconPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Pago</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="relative min-h-[220px]">
                        {fields.map((field, index) => {
                            const isActive = index === activeIndex;
                            const pago = watch(`pagos.${index}`);
                            const isComplete = Number(pago?.monto) > 0;

                            return (
                                <div
                                    key={field.id}
                                    className={cn(
                                        "transition-all duration-300 ease-out",
                                        isActive ? "relative opacity-100 transform-none" : "absolute inset-x-0 top-0 opacity-0 pointer-events-none",
                                    )}
                                >
                                    <div className="rounded-lg border bg-muted/30 overflow-hidden">
                                        {/* Header de la tarjeta individual */}
                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                                        isComplete ? "bg-green-500 text-white" : "bg-muted-foreground/30 text-white",
                                                    )}
                                                >
                                                    {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    Pago {index + 1}
                                                </span>
                                                {pago?.divisa && <Badge variant="outline" className="text-[10px] h-5">{pago.divisa}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Number(pago?.monto) > 0 && (
                                                    <span className="text-sm font-mono mr-2 text-green-600 font-medium">
                                                        ${pago.monto}
                                                    </span>
                                                )}
                                                {totalPagos > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removePayment(index)}
                                                    >
                                                        <IconTrash className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contenido del Formulario de Pago */}
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`pagos.${index}.divisa`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">Divisa</FormLabel>
                                                            <Combobox
                                                                options={formConfig?.divisas || ["USD", "ARS", "USDT"]}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Divisa"
                                                                emptyText="-"
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={control}
                                                    name={`pagos.${index}.monto`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">Monto</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                                                        $
                                                                    </span>
                                                                    <Input
                                                                        type="number"
                                                                        className="pl-7 h-9 bg-background"
                                                                        placeholder="0.00"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`pagos.${index}.tipoCambio`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">Tipo de Cambio</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" className="h-9 bg-background" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={control}
                                                    name={`pagos.${index}.destino`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-2">
                                                                <FormLabel className="text-xs text-muted-foreground">Destino</FormLabel>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="max-w-xs">Indique la cuenta de destino (ej: Banco, Caja Fuerte) para facilitar la conciliación.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <Combobox
                                                                options={formConfig?.destinos || ["Caja Fuerte", "Banco Galicia", "Banco Santander", "MercadoPago"]}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Seleccionar"
                                                                emptyText="Sin resultados"
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Indicadores de Paginación */}
                    {fields.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-dashed">
                            {fields.map((_, index) => {
                                const pago = watch(`pagos.${index}`);
                                const isComplete = Number(pago?.monto) > 0;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className={cn(
                                            "transition-all duration-200 rounded-full",
                                            index === activeIndex
                                                ? "w-6 h-2 bg-green-500"
                                                : isComplete
                                                    ? "w-2 h-2 bg-green-500 hover:bg-green-400"
                                                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                                        )}
                                    />
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="w-full shadow-md border-t-4 border-t-teal-600">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-600/10 rounded-full">
                            <IconTruckDelivery className="w-5 h-5 text-teal-600" />
                        </div>
                        <CardTitle className="text-base">Detalles de Entrega</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="transaccion.envioRetiro"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Envío / Retiro</FormLabel>
                                    <Combobox
                                        options={["Retiro en Local", "Envío a Domicilio"]}
                                        value={field.value === "Retiro" ? "Retiro en Local" : field.value === "Envio" ? "Envío a Domicilio" : field.value}
                                        onChange={(val) => {
                                            // Map readable value back to internal code if needed, or just use the val
                                            // The original used "Retiro" and "Envio" as values but displayed longer text.
                                            // Let's standardise on the displayed text if possible, or mapping.
                                            // Simplest is to just send the value selected. 
                                            // If backend expects "Retiro"/"Envio", I should map it.
                                            if (val === "Retiro en Local") field.onChange("Retiro")
                                            else if (val === "Envío a Domicilio") field.onChange("Envio")
                                            else field.onChange(val)
                                        }}
                                        placeholder="Selecciona opción"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="transaccion.comentarios"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentarios</FormLabel>
                                    <FormControl>
                                        <textarea
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Notas adicionales..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />


                    </div>
                </CardContent>
            </Card>
        </div>
    )
}