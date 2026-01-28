import { useWatch } from "react-hook-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Receipt, Smartphone } from "lucide-react"

export function StickyResume({ loading }: { loading: boolean }) {
    const productos = useWatch({ name: "productos" }) || []
    const cliente = useWatch({ name: "cliente" })
    const transaccion = useWatch({ name: "transaccion" })
    const pagos = useWatch({ name: "pagos" }) || []
    const parteDePago = useWatch({ name: "parteDePago" })

    // Validar productos activos
    const activeProducts = productos.filter((p: any) => p.tipo);

    // Cálculos
    const totalProductos = activeProducts.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.precio || 0) * Number(curr.cantidad || 1))
    }, 0)

    const valorTradeIn = parteDePago?.esParteDePago ? Number(parteDePago.costo || 0) : 0
    const saldoACubrir = totalProductos - valorTradeIn

    // Función auxiliar: convierte todos los pagos a USD
    // Si es USD/USDT → suma directo; si es ARS → divide por tipoCambio
    const calcularTotalEnUSD = (pagos: any[]): number => {
        return pagos.reduce((acc: number, pago: any) => {
            const monto = Number(pago.monto || 0);
            const tipoCambio = Number(pago.tipoCambio || 0);
            const divisa = pago.divisa || "USD";

            if (divisa === "ARS" && tipoCambio > 0) {
                // Convertir pesos a dólares
                return acc + (monto / tipoCambio);
            }

            if (divisa === "EUROS" && tipoCambio > 0) {
                return acc + (monto / tipoCambio);
            }
            // USD, USDT u otras divisas se suman directo
            return acc + monto;
        }, 0);
    };

    const totalAbonado = calcularTotalEnUSD(pagos);

    return (
        // El contenedor externo sigue igual
        <div className="lg:col-span-4 lg:relative p-1">

            {/* CAMBIO CLAVE: Lógica Responsiva 
               - Mobile (default): h-auto (crece infinito), relative (no sticky).
               - Desktop (lg): h-[calc...] (altura fija), sticky (fijo al scrollear).
            */}
            <div className="relative h-auto lg:h-[calc(100vh-3rem)] lg:sticky lg:top-6 flex flex-col transition-all duration-300">

                {/* Card Wrapper:
                   - Mobile: h-auto (crece con el contenido).
                   - Desktop: h-full (llena el contenedor sticky fijo).
                */}
                <div className="flex flex-col h-auto lg:h-full rounded-xl border border-border bg-card dark:bg-slate-900 dark:border-white/10 shadow-xl overflow-hidden">

                    {/* Header: Siempre visible arriba */}
                    <div className="shrink-0 p-6 border-b border-border/50 bg-muted/20 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-primary/10 rounded-md text-primary border border-primary/10">
                                <Receipt className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground tracking-tight uppercase">Resumen de Venta</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1 font-medium">
                            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* ScrollArea:
                       - Mobile: No restringe altura (se expande).
                       - Desktop (lg): flex-1 min-h-0 (ocupa el espacio sobrante y scrollea internamente).
                    */}
                    <ScrollArea className="flex-none lg:flex-1 lg:min-h-0 bg-card dark:bg-slate-900">
                        <div className="p-6 space-y-6">

                            {/* 1. CLIENTE */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-blue-500"></span> Cliente
                                </h5>
                                <div className="text-sm space-y-1 pl-2.5 border-l-2 border-border/50 ml-0.5">
                                    <p className="font-semibold text-foreground">{cliente?.nombre || "-"} {cliente?.apellido || ""}</p>
                                    <p className="text-muted-foreground text-xs">{cliente?.email || "Sin email"}</p>
                                    <p className="text-muted-foreground text-xs">{cliente?.contacto ? `${cliente.contacto} (${cliente.canal})` : cliente?.canal || "-"}</p>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* 2. ENTREGA */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Entrega
                                </h5>
                                <div className="text-sm pl-2.5 border-l-2 border-border/50 ml-0.5">
                                    <p className="font-medium text-foreground">{transaccion?.envioRetiro || "Envio | Mensajeria"}</p>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* 3. PAGOS */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-teal-500"></span> Pagos
                                </h5>
                                <div className="space-y-2 pl-2.5 border-l-2 border-border/50 ml-0.5">
                                    {pagos.length > 0 ? pagos.map((pago: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">{pago.destino}</span>
                                            <span className="font-semibold text-foreground">{pago.divisa} ${Number(pago.monto).toLocaleString()}</span>
                                        </div>
                                    )) : <p className="text-xs text-muted-foreground italic">Sin pagos registrados</p>}
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* 4. PRODUCTOS */}
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span> Productos
                                </h5>
                                <div className="space-y-3">
                                    {activeProducts.length > 0 ? activeProducts.map((prod: any, i: number) => (
                                        <div key={i} className="flex justify-between items-start text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-foreground">{prod.tipo} {prod.modelo}</p>
                                                <p className="text-[10px] text-muted-foreground">{prod.capacidad} {prod.color && `• ${prod.color}`}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground">${(Number(prod.precio || 0) * Number(prod.cantidad || 1)).toLocaleString()}</p>
                                                {prod.cantidad > 1 && <span className="text-[10px] text-muted-foreground">x{prod.cantidad}</span>}
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-muted-foreground italic pl-2">Carrito vacío</p>}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer: Siempre visible abajo */}
                    <div className="shrink-0 p-6 bg-muted/30 border-t border-border/60 space-y-4 text-sm mt-auto">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Valor Productos</span>
                            <span className="font-medium text-foreground">${totalProductos.toLocaleString()}</span>
                        </div>

                        {parteDePago?.esParteDePago && (
                            <div className="flex justify-between text-purple-600 dark:text-purple-400">
                                <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Toma (Trade In)</span>
                                <span className="font-bold">-${valorTradeIn.toLocaleString()}</span>
                            </div>
                        )}

                        <Separator className="bg-border/60" />

                        <div className="flex justify-between items-center text-foreground/80">
                            <span className="font-medium">Saldo a Cubrir</span>
                            <span className="font-bold">${saldoACubrir.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <span className="font-bold text-primary text-sm uppercase tracking-wide">Total Abonado</span>
                            <span className="text-xl font-black tracking-tight text-primary">${totalAbonado.toLocaleString()}</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold shadow-md active:scale-[0.98] transition-all"
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                            {loading ? "Procesando..." : "Confirmar Venta"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}