import { useFormContext } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IconDeviceMobileMessage } from "@tabler/icons-react";

export function DatosPartePago() {
    const { control, watch } = useFormContext();
    const esParteDePago = watch("parteDePago.esParteDePago");

    return (
        <Card className="w-full shadow-md border-t-4 border-t-purple-500">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-full">
                        <IconDeviceMobileMessage className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <CardTitle>Parte de Pago</CardTitle>
                        <CardDescription>
                            ¿El cliente entrega un dispositivo?
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6">
                <FormField
                    control={control}
                    name="parteDePago.esParteDePago"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm">
                                    Tomar en parte de pago
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {esParteDePago && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <FormField
                            control={control}
                            name="parteDePago.tipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Celular" {...field} />
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
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: iPhone 11" {...field} />
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
                                    <FormLabel>Capacidad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 64GB" {...field} />
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
                                    <FormLabel>Valor de Toma</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                className="pl-7"
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
                )}
            </CardContent>
        </Card>
    );
}