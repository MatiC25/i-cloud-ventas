import { DatosClienteMinimalista } from "./DatosClienteMinimalista"
import { DatosProductoMinimalista } from "./DatosProductoMinimalista"
import { DatosPartePagoMinimalista } from "./DatosPartePagoMinimalista"
import { DatosTransaccionMinimalista } from "./DatosTransaccionMinimalista"

"use client"

import { useState, useEffect } from "react"
import z from "zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { IFormConfig } from "@/types"
import { guardarVenta, getFormOptions, getGastosConfig, getProductosConfig } from "@/services/api-back"
import { useUser } from "@clerk/clerk-react"
import { Loader2, Check, Receipt, ShoppingCart, Smartphone } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StickyResume } from "./StickyResume"

const DEFAULT_FORM_CONFIG: IFormConfig = {
    metodosPago: [],
    divisas: [],
    tiposDeOperaciones: [],
    tiposDeProductos: [],
    modelosDeProductos: [],
    capacidadesDeProductos: [],
    coloresDeProductos: [],
    canalesDeVenta: [],
    estadosDeProductos: [],
}

import { IConfigProducto } from "@/types"

const productSchema = z.object({
    tipo: z.string().min(1, "Selecciona una categoría"),
    modelo: z.string().default(""),
    capacidad: z.string().default(""),
    color: z.string().default(""),
    estado: z.string().default("Nuevo"),
    imei: z.string().optional(),
    costo: z.coerce.number().min(0, "El costo no puede ser negativo").default(0),
    precio: z.coerce.number().min(0, "El precio no puede ser negativo").default(0),
    cantidad: z.coerce.number().int().positive().default(1),
    esParteDePago: z.boolean().default(false),
})

const pagoSchema = z.object({
    monto: z.coerce.number().positive("El monto debe ser mayor a 0").default(0),
    divisa: z.string().default("USD"),
    tipoCambio: z.coerce.number().default(1),
    destino: z.string().default("A confirmar"),
})

const formSchema = z.object({
    cliente: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 letras"),
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


export function NuevaVentaMinimalista() {

    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [saleType, setSaleType] = useState<'Minorista' | 'Mayorista'>('Minorista')

    const [formConfig, setFormConfig] = useState<IFormConfig>(DEFAULT_FORM_CONFIG)
    const [productosConfig, setProductosConfig] = useState<IConfigProducto[]>([])

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const [config, gastosConfig, configProductos] = await Promise.all([
                    getFormOptions(),
                    getGastosConfig(),
                    getProductosConfig()
                ]);

                let destinos: string[] = [];
                if (Array.isArray(gastosConfig)) {
                    destinos = Array.from(new Set(gastosConfig.map(r => r["Destinos"]).filter(Boolean)));
                }

                setFormConfig({ ...config, destinos });

                if (Array.isArray(configProductos)) {
                    setProductosConfig(configProductos);
                }

            } catch (error) {
                console.error("Error al obtener la configuración del formulario:", error)
                toast.error("Error al cargar configuración")
            }
        }
        fetchConfig()
    }, [])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cliente: { nombre: "", apellido: "", email: "", canal: "", contacto: "" },
            productos: [{ tipo: "", modelo: "", capacidad: "", color: "", estado: "Nuevo", imei: "", costo: 0, precio: 0, cantidad: 1, esParteDePago: false }],
            pagos: [{ monto: 0, divisa: "USD", tipoCambio: 1550, destino: "A confirmar" }],
            transaccion: { envioRetiro: "Retiro", comentarios: "", descargarComprobante: false },
            parteDePago: { esParteDePago: false, tipo: "", modelo: "", capacidad: "", costo: 0 },
            trazabilidad: { idOperacion: "", fecha: new Date().toISOString(), usuario: "" },
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            setLoading(true)
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

            const response = await guardarVenta(ventaFinal);

            if (response.status === 'success') {
                setLoading(false)
                toast.success(response.message || "Venta guardada exitosamente")
                form.reset()
            } else {
                setLoading(false)
                toast.error(response.message || "Error desconocido al guardar la venta")
            }
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            toast.error(error.message || "Error al guardar la venta")
        }
    }

    if (!formConfig) return <div className="p-8 flex items-center justify-center text-muted-foreground text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</div>

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background dark:bg-[#020617] relative min-h-screen pb-20 p-6">
                <div className="max-w-[1600px] mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Data Entry - UNIFIED CARD */}
                        <div className="lg:col-span-8 bg-card dark:bg-slate-900 border border-border dark:border-white/10 rounded-xl shadow-sm overflow-hidden">

                            {/* Section: Cliente */}
                            <div className="p-8">
                                <DatosClienteMinimalista formConfig={formConfig} />
                            </div>

                            <Separator />

                            {/* Section: Productos */}
                            <div className="p-8">
                                <DatosProductoMinimalista formConfig={formConfig} productosConfig={productosConfig} />
                            </div>

                            <Separator />

                            {/* Section: Pagos y Detalles */}
                            <div className="p-8 space-y-10">
                                <DatosPartePagoMinimalista />
                                <Separator className="border-dashed" />
                                <DatosTransaccionMinimalista formConfig={formConfig} />
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Sticky Summary */}
                        <StickyResume loading={loading} />

                    </div>
                </div>
            </form>
        </FormProvider>
    )
}