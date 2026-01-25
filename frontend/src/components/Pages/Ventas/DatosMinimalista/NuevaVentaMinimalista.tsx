"use client"

import { useState } from "react"
import z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useUser } from "@clerk/clerk-react"
import { Loader2, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { motion, Variants } from "framer-motion"

// Imports propios
import { guardarVenta } from "@/services/api-back"
import { useSystemConfig } from '@/hooks/useSystemConfig'
import { generarPDFVenta } from "@/utils/pdfGenerator"
import { cn } from "@/lib/utils" // Added cn import

// Componentes del Formulario
import { DatosClienteMinimalista } from "./DatosClienteMinimalista"
import { DatosProductoMinimalista } from "./DatosProductoMinimalista"
import { DatosPartePagoMinimalista } from "./DatosPartePagoMinimalista"
import { DatosTransaccionMinimalista } from "./DatosTransaccionMinimalista"
import { StickyResume } from "./StickyResume"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

// --- CONSTANTES Y SCHEMAS ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

const productSchema = z.object({
    tipo: z.string().min(1, "Selecciona una categoría"),
    modelo: z.string().default(""),
    capacidad: z.string().default(""),
    color: z.string().default(""),
    estado: z.string().default("Nuevo"),
    imei: z.string().optional(),
    costo: z.coerce.number().min(1, "El costo debe ser mayor a 0"),
    precio: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
    cantidad: z.coerce.number().int().positive().default(1),
    esParteDePago: z.boolean().default(false),
})

const pagoSchema = z.object({
    monto: z.coerce.number().positive("El monto debe ser mayor a 0").min(1, "El monto debe ser mayor a 0"),
    divisa: z.string().default("USD"),
    tipoCambio: z.coerce.number().default(1),
    destino: z.string().default("A confirmar"),
})

const formSchema = z.object({
    cliente: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 5 letras"),
        apellido: z.string().default(""),
        email: z.string().email("Email inválido").or(z.literal("")),
        canal: z.string().default("Local"),
        contacto: z.string().default(""),
    }),
    productos: z.array(productSchema).min(1, "Debes agregar al menos un producto"),
    pagos: z.array(pagoSchema).min(1, "Debes agregar al menos un método de pago"),
    transaccion: z.object({
        envioRetiro: z.string().default("Retiro"),
        comentarios: z.string().default(""),
        descargarComprobante: z.boolean().default(false),
    }),
    parteDePago: z.object({
        esParteDePago: z.boolean().default(false),
        tipo: z.string().default(""),
        modelo: z.string().default(""),
        capacidad: z.string().default(""),
        costo: z.coerce.number().default(0),
    }),
    trazabilidad: z.object({
        idOperacion: z.string().default(""),
        fecha: z.string().default(new Date().toISOString()),
        usuario: z.string().default(""),
    })
})

type FormValues = z.infer<typeof formSchema>


// --- 1. COMPONENTE HIJO (El Formulario Real) ---
// Este componente asume que la 'config' YA EXISTE y no es null.
function NuevaVentaForm({ config }: { config: any }) {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [saleType, setSaleType] = useState<'Minorista' | 'Mayorista'>('Minorista')

    // Desestructuramos la config segura
    const { formConfig, productosConfig, gastosConfig } = config;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cliente: { nombre: "", apellido: "", email: "", canal: "", contacto: "" },
            productos: [{ tipo: "", modelo: "", capacidad: "", color: "", estado: "Nuevo", imei: "", costo: "", precio: "", cantidad: 1, esParteDePago: false }],
            pagos: [{ monto: "", divisa: "USD", tipoCambio: "", destino: "A confirmar" }],
            transaccion: { envioRetiro: "Retiro", comentarios: "", descargarComprobante: false },
            parteDePago: { esParteDePago: false, tipo: "", modelo: "", capacidad: "", costo: "" },
            trazabilidad: { idOperacion: "", fecha: new Date().toISOString(), usuario: "" },
        },
    })

    async function onSubmit(values: FormValues) {
        setLoading(true)

        try {
            const pagoPrincipal = values.pagos[0] || { monto: 0, divisa: "USD", tipoCambio: 1500, destino: "A confirmar" };

            const ventaFinal: any = {
                usuario: user?.fullName || user?.primaryEmailAddress?.emailAddress || "Anónimo",
                tipoVenta: saleType,
                cliente: values.cliente,
                productos: values.productos,
                pagos: values.pagos,
                transaccion: {
                    ...values.transaccion,
                    monto: pagoPrincipal.monto,
                    divisa: pagoPrincipal.divisa,
                    tipoCambio: pagoPrincipal.tipoCambio
                },
                parteDePago: values.parteDePago,
                trazabilidad: values.trazabilidad,
            }

            // Guardamos los valores para el PDF antes de resetear
            const shouldDownloadPDF = values.transaccion.descargarComprobante;
            const ventaParaPDF = { ...ventaFinal };

            // --- OPTIMISTIC UI: Mostramos éxito inmediatamente ---
            toast.success("¡Venta registrada!", {
                description: "Procesando en segundo plano...",
                duration: 2000,
            });

            // Reseteamos el form inmediatamente para que el usuario pueda seguir
            form.reset();
            setLoading(false);

            // --- Ejecutamos la operación en background ---
            guardarVenta(ventaFinal)
                .then((response) => {
                    if (response.status === 'success') {
                        const idFactura = response.id_operacion ? response.id_operacion.toString().padStart(8, '0') : "00000000";

                        // Generación PDF (si corresponde)
                        if (shouldDownloadPDF) {
                            generarPDFVenta(ventaParaPDF, idFactura);
                        }

                        // Notificación final sutil
                        toast.success("Venta sincronizada ✓", {
                            description: `ID: #${idFactura}`,
                            duration: 3000,
                        });
                    } else {
                        // Si falla, mostramos error
                        toast.error(response.message || "Error al sincronizar la venta", {
                            description: "La venta puede no haberse guardado correctamente",
                            duration: 5000,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Error de conexión", {
                        description: "La venta puede no haberse guardado. Revisa tu conexión.",
                        duration: 5000,
                    });
                });

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Error al preparar la venta");
            setLoading(false);
        }
    }



    return (
        <FormProvider {...form}>
            <motion.form onSubmit={form.handleSubmit(onSubmit)} className="bg-background dark:bg-[#020617] relative min-h-screen pb-20 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >

                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT COLUMN */}
                        <motion.div className="lg:col-span-8 bg-card dark:bg-slate-900 border border-border dark:border-white/10 rounded-xl shadow-sm overflow-hidden"
                            variants={itemVariants}
                        >
                            <motion.div className="p-8">
                                <DatosClienteMinimalista
                                    formConfig={formConfig}
                                    headerAction={
                                        <div className="bg-muted/50 p-1 rounded-lg inline-flex relative border border-border/50">
                                            <button
                                                type="button"
                                                onClick={() => setSaleType('Minorista')}
                                                className={cn(
                                                    "px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 relative z-10",
                                                    saleType === 'Minorista'
                                                        ? "bg-white dark:bg-slate-800 text-foreground shadow-sm ring-1 ring-border/50"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                                                )}
                                            >
                                                Minorista
                                            </button>
                                            <div className="w-px h-4 bg-border/50 my-auto mx-1" />
                                            <button
                                                type="button"
                                                onClick={() => setSaleType('Mayorista')}
                                                className={cn(
                                                    "px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 relative z-10",
                                                    saleType === 'Mayorista'
                                                        ? "bg-white dark:bg-slate-800 text-foreground shadow-sm ring-1 ring-border/50"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                                                )}
                                            >
                                                Mayorista
                                            </button>
                                        </div>
                                    }
                                />
                            </motion.div>
                            <Separator />
                            <motion.div className="p-8">
                                <DatosProductoMinimalista formConfig={formConfig} productosConfig={productosConfig} />
                            </motion.div>
                            <Separator />
                            <motion.div className="p-8 space-y-10">
                                <DatosPartePagoMinimalista />
                                <Separator className="border-dashed" />
                                <DatosTransaccionMinimalista formConfig={formConfig} gastosConfig={gastosConfig} />
                            </motion.div>
                        </motion.div>

                        {/* RIGHT COLUMN */}
                        <motion.div className="lg:col-span-4" variants={itemVariants}>
                            <StickyResume loading={loading} />
                        </motion.div>
                    </div>

                </div>
            </motion.form>
        </FormProvider>
    )
}

export function NuevaVentaMinimalista() {
    // 1. Hooks siempre al inicio
    const { config, isLoading, isError } = useSystemConfig();

    if (isError) {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-red-500 gap-4">
                <p>Error al cargar la configuración.</p>
            </div>
        );
    }

    // 2. Condiciones de renderizado temprano
    if (isLoading || !config) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Cargando sistema de ventas...</p>
                </div>
            </div>
        );
    }

    return <NuevaVentaForm config={config} />


}
