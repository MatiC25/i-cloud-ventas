import React from "react"
import { useFormContext, useFieldArray } from "react-hook-form"
import { Plus, Trash2, CreditCard, ShoppingBag, User, Truck, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { IFormConfig, IConfigProducto } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NuevaVentaModernViewProps {
    formConfig: IFormConfig
    productosConfig: IConfigProducto[]
    loading: boolean
}

// Componente de Input Minimalista (Estilo Apple/Ghost)
const MinimalInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
    ({ className, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                className={cn(
                    "bg-white dark:bg-secondary/30 border border-border/40 dark:border-transparent rounded-lg px-3 py-6 shadow-sm transition-all duration-200",
                    "focus-visible:ring-0 focus-visible:border-primary/50 focus-visible:bg-white dark:focus-visible:bg-secondary/50",
                    "placeholder:text-muted-foreground/50",
                    className
                )}
                {...props}
            />
        )
    }
)
MinimalInput.displayName = "MinimalInput"

// Componente de Select Minimalista
const MinimalSelectTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof SelectTrigger>>(
    ({ className, children, ...props }, ref) => (
        <SelectTrigger
            ref={ref}
            className={cn(
                "bg-white dark:bg-secondary/30 border border-border/40 dark:border-transparent rounded-lg px-3 py-6 shadow-sm transition-all",
                "focus:ring-0 focus:border-primary/50 focus:bg-white dark:focus:bg-secondary/50",
                className
            )}
            {...props}
        >
            {children}
        </SelectTrigger>
    )
)
MinimalSelectTrigger.displayName = "MinimalSelectTrigger"

export function NuevaVentaPrueba({ formConfig, productosConfig, loading }: NuevaVentaModernViewProps) {


    const form = useFormContext()
    const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
        control: form.control,
        name: "productos",
    })

    // Watchers para el resumen en tiempo real
    const watchedProductos = form.watch("productos")
    const watchedPagos = form.watch("pagos")

    // Cálculos
    const totalVenta = watchedProductos.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.precio || 0) * Number(curr.cantidad || 1))
    }, 0)

    const totalPagado = watchedPagos?.reduce((acc: number, curr: any) => {
        // Aquí podrías agregar lógica de conversión de divisa si fuera necesario
        return acc + Number(curr.monto || 0)
    }, 0) || 0

    const saldoPendiente = totalVenta - totalPagado

    return (
        <div className="relative min-h-screen pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* ================= COLUMN IZQUIERDA: DATOS (CANVAS) ================= */}
                <div className="lg:col-span-8 space-y-16 pt-2">

                    {/* SECCIÓN: CLIENTE */}
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                                <User size={20} />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight text-foreground">Datos del Cliente</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FormField
                                control={form.control}
                                name="cliente.nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Nombre</FormLabel>
                                        <FormControl>
                                            <MinimalInput placeholder="Ej. Juan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cliente.apellido"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Apellido</FormLabel>
                                        <FormControl>
                                            <MinimalInput placeholder="Ej. Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cliente.email"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Email</FormLabel>
                                        <FormControl>
                                            <MinimalInput placeholder="juan@ejemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cliente.contacto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Teléfono / WhatsApp</FormLabel>
                                        <FormControl>
                                            <MinimalInput placeholder="+54 9 11..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cliente.canal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Canal de Venta</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <MinimalSelectTrigger>
                                                    <SelectValue placeholder="Seleccionar origen" />
                                                </MinimalSelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {formConfig.canalesDeVenta.map((canal) => (
                                                    <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </section>

                    {/* SECCIÓN: PRODUCTOS */}
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400">
                                    <ShoppingBag size={20} />
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-foreground">Productos</h3>
                            </div>
                            <Button
                                type="button"
                                onClick={() => appendProduct({ tipo: "", modelo: "", capacidad: "", color: "", estado: "Nuevo", costo: 0, precio: 0, cantidad: 1 })}
                                variant="ghost"
                                className="text-primary hover:bg-primary/5 hover:text-primary gap-2"
                            >
                                <Plus size={16} /> Agregar ítem
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {productFields.map((field, index) => (
                                <div key={field.id} className="group relative grid grid-cols-12 gap-4 items-start p-4 -mx-4 rounded-xl hover:bg-secondary/20 transition-colors duration-300">
                                    {/* Botón Eliminar (Visible en Hover) */}
                                    {productFields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            onClick={() => removeProduct(index)}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    )}

                                    <div className="col-span-12 md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.tipo`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Categoría</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <MinimalSelectTrigger className="h-10 py-2 text-sm bg-background/50">
                                                                <SelectValue placeholder="Tipo" />
                                                            </MinimalSelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {formConfig.tiposDeProductos.map((t) => (
                                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.modelo`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Modelo</FormLabel>
                                                    <FormControl>
                                                        <MinimalInput className="h-10 py-2 text-sm bg-background/50" placeholder="Ej. iPhone 14" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-6 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.capacidad`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Capacidad</FormLabel>
                                                    <FormControl>
                                                        <MinimalInput className="h-10 py-2 text-sm bg-background/50" placeholder="128GB" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-6 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.color`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Color</FormLabel>
                                                    <FormControl>
                                                        <MinimalInput className="h-10 py-2 text-sm bg-background/50" placeholder="Midnight" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-12 md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.precio`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold text-primary">Precio</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                                            <MinimalInput
                                                                type="number"
                                                                className="h-10 py-2 pl-6 text-sm bg-background/50 font-semibold"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Fila secundaria opcional para detalles extras como IMEI */}
                                    <div className="col-span-12 pt-2 border-t border-dashed border-border/50">
                                        <FormField
                                            control={form.control}
                                            name={`productos.${index}.imei`}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase min-w-[30px]">IMEI:</span>
                                                    <Input
                                                        className="border-none h-6 text-xs bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
                                                        placeholder="Escanear o ingresar IMEI (Opcional)"
                                                        {...field}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN: TRANSACCIÓN & PAGO */}
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight text-foreground">Detalles de la Operación</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FormField
                                control={form.control}
                                name="transaccion.envioRetiro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Método de Entrega</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <MinimalSelectTrigger>
                                                    <SelectValue />
                                                </MinimalSelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Retiro">Retiro en local</SelectItem>
                                                <SelectItem value="Envio">Envío a domicilio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="transaccion.descargarComprobante"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm bg-card/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-medium">Generar PDF</FormLabel>
                                            <p className="text-xs text-muted-foreground">Descargar comprobante al finalizar</p>
                                        </div>
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/50"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="transaccion.comentarios"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium pl-1">Notas Internas</FormLabel>
                                            <FormControl>
                                                <MinimalInput placeholder="Notas sobre la garantía, estado del equipo, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* ================= COLUMN DERECHA: RESUMEN (STICKY) ================= */}
                <div className="lg:col-span-4 lg:relative">
                    <div className="sticky top-6">
                        <div className="rounded-2xl bg-muted/20 border border-border/60 shadow-lg shadow-black/5 backdrop-blur-xl overflow-hidden">
                            {/* Header del Ticket */}
                            <div className="p-6 bg-muted/40 border-b border-border/50">
                                <h4 className="text-lg font-semibold flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-muted-foreground" />
                                    Resumen de Pedido
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>

                            {/* Lista de Items */}
                            <ScrollArea className="h-[calc(100vh-400px)] min-h-[200px] p-6">
                                {watchedProductos.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground text-sm">
                                        No hay productos agregados
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {watchedProductos.map((prod: any, i: number) => (
                                            prod.tipo && (
                                                <div key={i} className="flex justify-between items-start text-sm group">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-foreground">
                                                            {prod.tipo} {prod.modelo}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {prod.capacidad} {prod.color && `• ${prod.color}`}
                                                        </p>
                                                        {prod.cantidad > 1 && (
                                                            <p className="text-xs font-mono text-muted-foreground">x{prod.cantidad}</p>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold tabular-nums">
                                                        ${(Number(prod.precio || 0) * Number(prod.cantidad || 1)).toLocaleString()}
                                                    </p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Totales y Acciones */}
                            <div className="p-6 bg-background/50 border-t border-border/50 space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${totalVenta.toLocaleString()}</span>
                                    </div>
                                    {/* Aquí podrías agregar lógica de impuestos o descuentos si existiera */}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-semibold text-base">Total</span>
                                        <span className="font-bold text-2xl tracking-tight">${totalVenta.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                                    disabled={loading || totalVenta <= 0}
                                >
                                    {loading ? "Procesando..." : `Confirmar Venta ($${totalVenta.toLocaleString()})`}
                                </Button>

                                <p className="text-[10px] text-center text-muted-foreground/60">
                                    Al confirmar, se actualizará el stock automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}