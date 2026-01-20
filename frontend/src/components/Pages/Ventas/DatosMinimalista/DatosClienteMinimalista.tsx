import { Combobox } from "@/components/ui/combobox"
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IconMail, IconPhone, IconUser } from "@tabler/icons-react"
import { IFormConfig } from "@/types"
// Removed Select imports as we are replacing with Combobox
import { MinimalInput, SectionHeader } from "./components"
import { cn } from "@/lib/utils"

interface IDatosClienteProps {
    formConfig: IFormConfig;
    headerAction?: React.ReactNode;
}

export function DatosClienteMinimalista({ formConfig, headerAction }: IDatosClienteProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-6">
            <SectionHeader
                icon={IconUser}
                title="Datos del Cliente"
                iconClassName="bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
                {headerAction}
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* ROW 1: Nombre & Apellido (Side by Side) */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="cliente.nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-wider pl-1">Nombre</FormLabel>
                                <FormControl>
                                    <MinimalInput placeholder="Nombre" {...field} className="h-[42px] py-2 shadow-none border-border/40 hover:border-border/60" />
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
                                <FormLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-wider pl-1">Apellido</FormLabel>
                                <FormControl>
                                    <MinimalInput placeholder="Apellido" {...field} className="h-[42px] py-2 shadow-none border-border/40 hover:border-border/60" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* ROW 1 (Col 2): Email */}
                <FormField
                    control={control}
                    name="cliente.email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-wider pl-1">Email</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <MinimalInput
                                        className="pl-10 h-[42px] py-2 shadow-none border-border/40 hover:border-border/60"
                                        placeholder="cliente@email.com"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ROW 2: Teléfono */}
                <FormField
                    control={control}
                    name="cliente.contacto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-wider pl-1">Teléfono / WhatsApp</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <MinimalInput
                                        className="pl-10 h-[42px] py-2 shadow-none border-border/40 hover:border-border/60"
                                        placeholder="+54 9 11..."
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* ROW 2: Canal */}
                <FormField
                    control={control}
                    name="cliente.canal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-wider pl-1">Canal de Venta</FormLabel>
                            <Combobox
                                options={formConfig?.canalesDeVenta || []}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Seleccionar"
                                emptyText="Sin resultados"
                                className={cn(
                                    "w-full justify-between font-normal h-[42px]",
                                    "bg-muted/30 border-border/40 text-foreground",
                                    "rounded-lg px-3 shadow-none transition-all duration-200",
                                    "hover:bg-muted/50 hover:border-border/60",
                                    field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-muted/30"
                                )}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </div>
        </div>
    )
}
