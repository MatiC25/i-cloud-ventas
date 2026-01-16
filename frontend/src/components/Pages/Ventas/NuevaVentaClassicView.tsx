import { DatosCliente } from "./Datos/DatosCliente"
import { DatosProducto } from "./Datos/DatosProducto"
import { DatosTransaccion } from "./Datos/DatosTransaccion"
import { Resumen } from "./Resumen"
import { Button } from "@/components/ui/button"
import { Loader2, Save, FileText } from "lucide-react"
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { IFormConfig, IConfigProducto } from "@/types"
import { useFormContext } from "react-hook-form"

interface NuevaVentaClassicViewProps {
    formConfig: IFormConfig
    loading: boolean
    productosConfig?: IConfigProducto[]
}

export function NuevaVentaClassicView({ formConfig, loading, productosConfig }: NuevaVentaClassicViewProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-6">
            <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Columna 1: Cliente y Parte de Pago */}
                <div className="space-y-6">
                    <DatosCliente formConfig={formConfig} />
                    <DatosProducto formConfig={formConfig} productosConfig={productosConfig} />

                    {/* PDF Download Checkbox */}
                    <FormField
                        control={control}
                        name="transaccion.descargarComprobante"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card transition-colors">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                                        Descargar comprobante de venta
                                        <FileText className="w-4 h-4 text-blue-500" />
                                    </FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Se generará un PDF con el detalle de la venta al finalizar
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-6">
                    <DatosTransaccion formConfig={formConfig} />
                    <Resumen />
                </div>
            </div>

            {/* Botón Submit */}
            <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Venta
                    </>
                )}
            </Button>
        </div>
    )
}
