import { DatosCliente } from "./DatosCliente"
import { DatosProducto } from "./DatosProducto"
import { DatosTransaccion } from "./DatosTransaccion"
import { Resumen } from "./Resumen"
import { Button } from "@/components/ui/button"
import { Loader2, Save, FileText, ArrowRight } from "lucide-react"
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { IFormConfig, IConfigProducto } from "@/types"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface NuevaVentaModernViewProps {
    formConfig: IFormConfig
    loading: boolean
    productosConfig?: IConfigProducto[]
}

export function NuevaVentaModernView({ formConfig, loading, productosConfig }: NuevaVentaModernViewProps) {
    const { control } = useFormContext()

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
            {/* Columna Principal: Formulario de Datos (Ancho 8/12 = 2/3) */}
            <div className="xl:col-span-8 space-y-6">

                {/* 1. Datos del Cliente */}
                <DatosCliente formConfig={formConfig} />

                {/* 2. Selección de Productos */}
                <DatosProducto formConfig={formConfig} productosConfig={productosConfig} />

                {/* 3. Datos de Transacción (Pagos y Entrega) */}
                <DatosTransaccion formConfig={formConfig} />
            </div>

            {/* Columna Lateral: Resumen y Acciones (Ancho 4/12 = 1/3) sticky */}
            <div className="xl:col-span-4">
                <div className="sticky top-6 space-y-6">

                    {/* Resumen Card */}
                    <Resumen />

                    {/* Acciones Card */}
                    <Card className="shadow-lg border-t-4 border-t-primary/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Finalizar Venta</CardTitle>
                            <CardDescription>Opciones finales y confirmación</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* PDF Checkbox */}
                            <FormField
                                control={control}
                                name="transaccion.descargarComprobante"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-background">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="cursor-pointer font-normal">
                                                Generar y descargar comprobante PDF
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold py-6 text-lg shadow-xl shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Venta
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
