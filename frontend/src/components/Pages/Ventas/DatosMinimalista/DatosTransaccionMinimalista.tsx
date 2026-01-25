import { Combobox } from "@/components/ui/combobox";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
// Removed Select imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CreditCard, Truck, Receipt } from "lucide-react";
import { IFormConfig } from "@/types";
import { MinimalInput, SectionHeader } from "./components";
import { cn } from "@/lib/utils";
import { IGastosConfig } from "@/types";

interface IDatosTransaccionProps {
    formConfig: IFormConfig;
    gastosConfig: IGastosConfig;
}

export function DatosTransaccionMinimalista({ formConfig, gastosConfig }: IDatosTransaccionProps) {
    const { control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "pagos",
    });

    const divisasOptions = gastosConfig.divisas || ["USD", "ARS", "USDT"];
    const destinosOptions = gastosConfig.destinos || ["Efectivo"];

    // Ensure at least one payment method exists
    if (fields.length === 0) {
        append({ monto: 0, divisa: "USD", tipoCambio: "", destino: "A Confirmar" });
    }

    return (
        <div className="space-y-8">
            {/* SECCIÓN PAGOS */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        icon={CreditCard}
                        title="Métodos de Pago"
                        className="mb-0"
                        iconClassName="bg-teal-500/10 text-teal-500 border-teal-500/20"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => append({ monto: 0, divisa: "USD", tipoCambio: "", destino: "Caja Principal" })}
                        className="h-8 text-primary hover:bg-primary/5 hover:text-primary gap-1.5 px-3 rounded-full"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-medium">Agregar Pago</span>
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-4 relative group">
                            {/* Remove Button */}
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            )}

                            {/* Divisa */}
                            <div className="col-span-12 md:col-span-3">
                                <FormField
                                    control={control}
                                    name={`pagos.${index}.divisa`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Divisa</FormLabel>
                                            <Combobox
                                                options={divisasOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Divisa"
                                                emptyText="-"
                                                className={cn(
                                                    "w-full justify-between font-normal h-[42px]",
                                                    "bg-muted/30 border-border/40 text-foreground",
                                                    "rounded-lg px-3 shadow-none transition-all duration-200",
                                                    "hover:bg-muted/50 hover:border-border/60",
                                                    field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-muted/30"
                                                )}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Monto */}
                            <div className="col-span-12 md:col-span-4">
                                <FormField
                                    control={control}
                                    name={`pagos.${index}.monto`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Monto</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">$</span>
                                                    <MinimalInput
                                                        type="number"
                                                        className="pl-6 font-semibold tabular-nums h-[42px] py-2 shadow-none border-border/40 hover:border-border/60"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Cotización (Solo visible si no es USD, opcionalmente) */}
                            <div className="col-span-6 md:col-span-2">
                                <FormField
                                    control={control}
                                    name={`pagos.${index}.tipoCambio`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Cotiz.</FormLabel>
                                            <FormControl>
                                                <MinimalInput
                                                    type="number"
                                                    placeholder="1550"
                                                    className="tabular-nums h-[42px] py-2 shadow-none border-border/40 hover:border-border/60"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Cuenta/Destino */}
                            <div className="col-span-6 md:col-span-3">
                                <FormField
                                    control={control}
                                    name={`pagos.${index}.destino`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Cuenta Destino</FormLabel>
                                            <Combobox
                                                options={destinosOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Destino"
                                                emptyText="-"
                                                className={cn(
                                                    "w-full justify-between font-normal h-[42px]",
                                                    "bg-muted/30 border-border/40 text-foreground",
                                                    "rounded-lg px-3 shadow-none transition-all duration-200",
                                                    "hover:bg-muted/50 hover:border-border/60",
                                                    field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-muted/30"
                                                )}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-dashed border-border/40" />

            {/* SECCIÓN LOGÍSTICA & NOTAS */}
            <div>
                <SectionHeader
                    icon={Truck}
                    title="Logística y Entrega"
                    iconClassName="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Método Entrega */}
                    <FormField
                        control={control}
                        name="transaccion.envioRetiro"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Método de Entrega</FormLabel>
                                <Combobox
                                    options={[
                                        { value: "Retiro", label: "Retiro en local" },
                                        { value: "Envio", label: "Envío a domicilio" }
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar"
                                    emptyText="-"
                                    className={cn(
                                        "w-full justify-between font-normal h-[42px]",
                                        "bg-muted/30 border-border/40 text-foreground",
                                        "rounded-lg px-3 shadow-none transition-all duration-200",
                                        "hover:bg-muted/50 hover:border-border/60",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-muted/30"
                                    )}
                                />
                            </FormItem>
                        )}
                    />

                    {/* Checkbox Comprobante */}
                    <FormField
                        control={control}
                        name="transaccion.descargarComprobante"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/40 p-3 shadow-none bg-muted/10 self-end h-[50px]">
                                <div className="space-y-0.5 ml-1">
                                    <FormLabel className="text-sm font-medium cursor-pointer">Generar PDF</FormLabel>
                                </div>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="h-5 w-5 mr-1"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Notas internas */}
                    <div className="md:col-span-2">
                        <FormField
                            control={control}
                            name="transaccion.comentarios"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Notas Internas</FormLabel>
                                    <FormControl>
                                        <MinimalInput
                                            placeholder="Garantía, estado del equipo, instrucciones especiales..."
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
