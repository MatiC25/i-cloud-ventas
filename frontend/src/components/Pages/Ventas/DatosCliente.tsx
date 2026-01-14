import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { IFormConfig } from "@/types";

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { IconUser, IconMail, IconPhone, IconBuildingStore } from "@tabler/icons-react"

interface IDatosClienteProps {
    formConfig: IFormConfig;
}

export function DatosCliente({ formConfig }: IDatosClienteProps) {
    const { control } = useFormContext();
    return (
        <Card className="w-full shadow-md border-t-4 border-t-primary">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <IconUser className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Datos del Cliente</CardTitle>
                        <CardDescription>Información personal y de contacto</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid gap-6">

                {/* FILA 1: Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="cliente.nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="cliente.apellido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* FILA 2: Contacto (Email y Teléfono) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="cliente.email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <IconMail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="cliente@email.com" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="cliente.contacto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono / WhatsApp</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <IconPhone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="+54 9 11..." {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* FILA 3: Canal de Venta */}
                <FormField
                    control={control}
                    name="cliente.canal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Canal de Venta</FormLabel>
                            <Combobox
                                options={formConfig?.canalesDeVenta || []}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Selecciona el canal"
                                emptyText="Sin resultados"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </CardContent>
        </Card>
    );
}