import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, User, ShoppingCart, Truck, CreditCard, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Resumen() {
    const { watch } = useFormContext();
    const formData = watch();

    // Calcular totales de productos
    const todosLosProductos = formData.productos || [];
    const ventas = todosLosProductos.filter((p: any) => !p.esParteDePago);
    const canjes = todosLosProductos.filter((p: any) => p.esParteDePago);

    const totalVentas = ventas.reduce((acc: number, p: any) => acc + ((Number(p.precio) || 0) * (Number(p.cantidad) || 1)), 0);
    const totalCanjes = canjes.reduce((acc: number, p: any) => acc + ((Number(p.precio) || 0) * (Number(p.cantidad) || 1)), 0);
    const saldoOperacion = totalVentas - totalCanjes;

    // Calcular pagos
    const transaccion = formData.transaccion || {};
    const pagos = formData.pagos || [];

    // Total Pagado (Suma simple de montos ingresados, asumiendo USD base usuario mental, 
    // pero visualmente separaremos por divisa si es necesario)
    // Para simplificar la visualización rápida, sumamos todo lo que sea numérico.
    // Lo ideal sería tener un conversor, pero aquí mostraremos el desglose.
    const totalPagado = pagos.reduce((acc: number, p: any) => {
        const monto = Number(p.monto) || 0;
        const tipoCambio = Number(p.tipoCambio) || 1;
        const isUSD = p.divisa === 'USD';

        let montoEnUSD = 0;
        if (isUSD) {
            montoEnUSD = monto;
        } else {
            // Conversión inversa: Si la divisa no es USD, dividimos por el tipo de cambio
            // Ejemplo: 1000 ARS / 1000 (TC) = 1 USD
            montoEnUSD = tipoCambio > 0 ? (monto / tipoCambio) : 0;
        }

        return acc + montoEnUSD;
    }, 0);




    const cliente = formData.cliente || {};

    return (
        <Card className="w-full shadow-lg border-t-4 border-t-blue-500 mt-6">
            <CardHeader className="bg-muted/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-full">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base text-foreground">Resumen de la Venta</CardTitle>
                        <CardDescription className="text-sm">Verifica los detalles antes de confirmar</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6">

                {/* Sección Principal: Cliente y Entrega */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Cliente */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2">
                            <User className="w-4 h-4" />
                            <h3>Cliente</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground font-medium">Nombre:</span>
                            <span className="font-medium text-foreground">{cliente.nombre} {cliente.apellido}</span>

                            <span className="text-muted-foreground font-medium">Contacto:</span>
                            <span>{cliente.contacto || "-"}</span>

                            <span className="text-muted-foreground font-medium">Email:</span>
                            <span className="truncate">{cliente.email || "-"}</span>

                            <span className="text-muted-foreground font-medium">Canal:</span>
                            <Badge variant="outline" className="w-fit">{cliente.canal}</Badge>
                        </div>
                    </div>

                    {/* Entrega y Pagos */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2">
                            <Truck className="w-4 h-4" />
                            <h3>Entrega</h3>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground font-medium">Método:</span>
                            <span className="font-medium">{transaccion.envioRetiro}</span>
                        </div>

                        <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 mt-4">
                            <CreditCard className="w-4 h-4" />
                            <h3>Pagos ({pagos.length})</h3>
                        </div>
                        <div className="space-y-2 mt-2">
                            {pagos.map((p: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm bg-muted/20 p-2 rounded">
                                    <span className="text-muted-foreground">Pago {idx + 1} ({p.divisa})</span>
                                    <span className="font-mono font-medium">${p.monto}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Productos (Ventas) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-blue-600 font-semibold border-b pb-2">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            <h3>Productos ({ventas.length})</h3>
                        </div>
                        <span className="text-sm font-mono text-foreground">${totalVentas}</span>
                    </div>

                    <div className="space-y-2">
                        {ventas.length === 0 && <span className="text-sm text-muted-foreground italic">No hay productos seleccionados</span>}
                        {ventas.map((p: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/30">
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {p.cantidad > 1 && <Badge variant="outline" className="mr-2 text-xs h-5 px-1">{p.cantidad}x</Badge>}
                                        {p.modelo} {p.capacidad}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{p.tipo} - {p.color} - {p.estado}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-medium">${(Number(p.precio) || 0) * (Number(p.cantidad) || 1)}</div>
                                    {p.imei && <div className="text-[10px] text-muted-foreground">IMEI: {p.imei}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canjes / Parte de Pago */}
                {canjes.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-purple-600 font-semibold border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                <h3>Parte de Pago ({canjes.length})</h3>
                            </div>
                            <span className="text-sm font-mono text-green-500">-${totalCanjes}</span>
                        </div>

                        <div className="space-y-2">
                            {canjes.map((p: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/30">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {p.cantidad > 1 && <Badge variant="outline" className="mr-2 text-xs h-5 px-1">{p.cantidad}x</Badge>}
                                            {p.modelo} {p.capacidad}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{p.tipo} - {p.color} - {p.estado}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-medium text-green-500">-${(Number(p.precio) || 0) * (Number(p.cantidad) || 1)}</div>
                                        {p.imei && <div className="text-[10px] text-muted-foreground">IMEI: {p.imei}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Totales Finales */}
                <div className="bg-slate-100/80 dark:bg-slate-800/50 p-4 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor Productos</span>
                        <span>${totalVentas}</span>
                    </div>
                    {canjes.length > 0 && (
                        <div className="flex justify-between text-sm text-green-500">
                            <span>Total Canjes</span>
                            <span>-${totalCanjes}</span>
                        </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center font-medium">
                        <span className="text-foreground">Saldo a Cubrir</span>
                        <span className="text-lg">${saldoOperacion}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                        <span className="font-bold text-lg">Total Abonado (USD)</span>
                        <div className="text-right">
                            <span className="font-bold text-2xl text-blue-600">${totalPagado.toFixed(2)}</span>
                            {/* Nota: si hay mix de divisas esto es solo un numero indicativo */}
                        </div>

                    </div>

                    {transaccion.comentarios && (
                        <div className="mt-3 text-xs text-muted-foreground italic border-t pt-2">
                            Nota: {transaccion.comentarios}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}