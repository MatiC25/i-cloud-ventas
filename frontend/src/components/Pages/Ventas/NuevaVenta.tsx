"use client"

import { useState, useEffect } from "react"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { IFormConfig } from "@/types"
import { guardarVenta, getFormOptions, getGastosConfig, getProductosConfig } from "@/services/api-back"
import { generarPDFVenta } from "@/utils/pdfGenerator"
import { useUser } from "@clerk/clerk-react"
import { NuevaVentaClassicView } from "./NuevaVentaClassicView"
import { NuevaVentaModernView } from "./NuevaVentaModernView"
import { LayoutGrid, List, Users, Building2 } from "lucide-react"

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
    modelo: z.string().min(1, "El modelo es obligatorio"),
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

export function NuevaVenta() {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'classic' | 'modern'>('classic')
    const [saleType, setSaleType] = useState<'Minorista' | 'Mayorista'>('Minorista')

    const [formConfig, setFormConfig] = useState<IFormConfig>(DEFAULT_FORM_CONFIG)
    const [productosConfig, setProductosConfig] = useState<IConfigProducto[]>([])
    const [pdf, setPdf] = useState(false)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Fetch en paralelo de la configuración general, gastos y productos
                const [config, gastosConfig, configProductos] = await Promise.all([
                    getFormOptions(),
                    getGastosConfig(),
                    getProductosConfig()
                ]);

                // Extraer destinos únicos de la configuración de gastos
                let destinos: string[] = [];
                if (Array.isArray(gastosConfig)) {
                    destinos = Array.from(new Set(gastosConfig.map(r => r["Destinos"]).filter(Boolean)));
                }

                // Merge configuration
                setFormConfig({
                    ...config,
                    destinos
                });

                // Set products config if available (index 2 in Promise.all)
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
            pagos: [{ monto: 0, divisa: "USD", tipoCambio: 1550 }], // Default con un pago
            transaccion: { envioRetiro: "Retiro", comentarios: "", descargarComprobante: false },
            parteDePago: { esParteDePago: false, tipo: "", modelo: "", capacidad: "", costo: 0 },
            trazabilidad: { idOperacion: "", fecha: new Date().toISOString(), usuario: "" },
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            setLoading(true)

            // MAPEO DE RETRO-COMPATIBILIDAD
            // El backend legacy espera transaccion.monto y transaccion.divisa
            // Asignamos el PRIMER pago como principal, o sumamos.
            // Para simplificar, tomamos el primer pago para llenar los campos "legacy"
            // y enviamos todo el array "pagos" para que el nuevo backend lo use si quiere.

            const pagoPrincipal = values.pagos[0] || { monto: 0, divisa: "USD", tipoCambio: 1 };


            const ventaFinal: any = {
                usuario: user?.fullName || user?.primaryEmailAddress?.emailAddress || "Anónimo",
                tipoVenta: saleType,
                cliente: values.cliente,
                productos: values.productos,
                pagos: values.pagos, // Enviamos el array completo
                transaccion: {
                    ...values.transaccion,
                    // Campos legacy calculados del primer pago
                    monto: pagoPrincipal.monto,
                    divisa: pagoPrincipal.divisa,
                    tipoCambio: pagoPrincipal.tipoCambio
                },
                parteDePago: values.parteDePago,
                trazabilidad: values.trazabilidad,
            }

            const response = await guardarVenta(ventaFinal);

            if (response.status === 'success') {

                // if (values.transaccion.descargarComprobante) {
                //     const idOperacion = response.id_operacion;
                //     generarPDFVenta(ventaFinal, idOperacion.toString());
                // }

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

    if (!formConfig) return <div>Cargando configuración...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Nueva Venta</h2>
                    <p className="text-muted-foreground">Gestión de salida de productos y facturación.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                        <Button
                            variant={saleType === 'Minorista' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSaleType('Minorista')}
                            className="gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Minorista
                        </Button>
                        <Button
                            variant={saleType === 'Mayorista' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSaleType('Mayorista')}
                            className="gap-2"
                        >
                            <Building2 className="w-4 h-4" />
                            Mayorista
                        </Button>
                    </div>

                    <div className="h-4 w-px bg-border" />

                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'classic' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('classic')}
                            className="gap-2"
                        >
                            <List className="w-4 h-4" />
                            Clásica
                        </Button>
                        <Button
                            variant={viewMode === 'modern' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('modern')}
                            className="gap-2"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Moderna
                        </Button>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {viewMode === 'classic' ? (
                        <NuevaVentaClassicView formConfig={formConfig} loading={loading} productosConfig={productosConfig} />
                    ) : (
                        <NuevaVentaModernView formConfig={formConfig} loading={loading} productosConfig={productosConfig} />
                    )}
                </form>
            </Form>
        </div >
    )
}
