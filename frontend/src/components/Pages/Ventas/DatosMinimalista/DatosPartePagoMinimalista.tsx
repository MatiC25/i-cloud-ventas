import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { MinimalInput, SectionHeader } from "./components";
import { ArrowDownLeft, Smartphone } from "lucide-react";

export function DatosPartePagoMinimalista() {
    const { control, watch } = useFormContext();
    const esParteDePago = watch("parteDePago.esParteDePago");

    return (
        <div className="space-y-4">
            {/* Header y Checkbox de activación combinados */}
            <div className="flex items-center justify-between">
                <SectionHeader
                    icon={Smartphone}
                    title="Trade In / Parte de Pago"
                    className="mb-0"
                    iconClassName="bg-purple-500/10 text-purple-500 border-purple-500/20"
                />

                <FormField
                    control={control}
                    name="parteDePago.esParteDePago"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/30 px-3 py-2 rounded-full border border-transparent hover:border-border/30 transition-all">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="h-4 w-4"
                                />
                            </FormControl>
                            <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer uppercase tracking-tight">
                                Activar
                            </FormLabel>
                        </FormItem>
                    )}
                />
            </div>

            {esParteDePago && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300 relative">
                    {/* Decorative subtle background for the trade-in area */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-transparent rounded-xl -z-10" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-1">

                        <FormField
                            control={control}
                            name="parteDePago.tipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Tipo</FormLabel>
                                    <FormControl>
                                        <MinimalInput placeholder="Ej: Celular" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="parteDePago.modelo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Modelo</FormLabel>
                                    <FormControl>
                                        <MinimalInput placeholder="Ej: iPhone 11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="parteDePago.capacidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Capacidad</FormLabel>
                                    <FormControl>
                                        <MinimalInput placeholder="Ej: 64GB" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="parteDePago.costo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase text-primary font-bold tracking-wider pl-1">Valor de Toma</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                            <MinimalInput
                                                type="number"
                                                className="pl-6 font-semibold"
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
                </div>
            )}
        </div>
    );
}
