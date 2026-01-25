import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Package, Receipt, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveConfigSheets, IConfigSheetsPayload } from '@/services/api-back';

// Zod Schemas
const productoSchema = z.object({
    categoria: z.string().min(1, 'Requerido'),
    modelo: z.string().min(1, 'Requerido'),
    variantes: z.string().min(1, 'Requerido'),
    colores: z.string().min(1, 'Requerido'),
});

const gastoSchema = z.object({
    destinos: z.string().min(1, 'Requerido'),
    divisas: z.string().min(1, 'Requerido'),
    tipoDeMovimiento: z.string().min(1, 'Requerido'),
    categoriaDeMovimiento: z.string().min(1, 'Requerido'),
});

const formConfigSchema = z.object({
    canalDeVenta: z.string().min(1, 'Requerido'),
    estado: z.string().min(1, 'Requerido'),
});

const configSchema = z.object({
    productos: z.array(productoSchema),
    gastos: z.array(gastoSchema),
    form: z.array(formConfigSchema),
});

type ConfigFormData = z.infer<typeof configSchema>;

export function Configuracion() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('productos');

    const { control, register, handleSubmit, formState: { errors } } = useForm<ConfigFormData>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            productos: [],
            gastos: [],
            form: [],
        },
    });

    const productosArray = useFieldArray({ control, name: 'productos' });
    const gastosArray = useFieldArray({ control, name: 'gastos' });
    const formArray = useFieldArray({ control, name: 'form' });

    const onSubmit = async (data: ConfigFormData) => {
        setIsSubmitting(true);
        try {
            const payload: IConfigSheetsPayload = {};

            if (data.productos.length > 0) payload.productos = data.productos;
            if (data.gastos.length > 0) payload.gastos = data.gastos;
            if (data.form.length > 0) payload.form = data.form;

            if (Object.keys(payload).length === 0) {
                toast.warning('No hay datos para guardar');
                setIsSubmitting(false);
                return;
            }

            const response = await saveConfigSheets(payload);
            if (response?.message) {
                toast.success(response.message);
            } else {
                toast.success('Configuración guardada correctamente');
            }
        } catch (error) {
            toast.error('Error al guardar la configuración');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto space-y-6"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold tracking-tight">Configuración de Hojas</h1>
                <p className="text-muted-foreground mt-1">
                    Administra las configuraciones de Productos, Gastos y Formularios.
                </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <motion.div variants={itemVariants}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="productos" className="flex items-center gap-2">
                                <Package size={16} />
                                Productos ({productosArray.fields.length})
                            </TabsTrigger>
                            <TabsTrigger value="gastos" className="flex items-center gap-2">
                                <Receipt size={16} />
                                Gastos ({gastosArray.fields.length})
                            </TabsTrigger>
                            <TabsTrigger value="form" className="flex items-center gap-2">
                                <FileText size={16} />
                                Formulario ({formArray.fields.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* PRODUCTOS TAB */}
                        <TabsContent value="productos">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="text-blue-500" />
                                        Configuración de Productos
                                    </CardTitle>
                                    <CardDescription>
                                        Agrega categorías, modelos, variantes y colores para los productos.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {productosArray.fields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="grid grid-cols-5 gap-3 p-4 bg-muted/50 rounded-lg items-end"
                                        >
                                            <div className="space-y-1">
                                                <Label>Categoría</Label>
                                                <Input {...register(`productos.${index}.categoria`)} placeholder="iPhone" />
                                                {errors.productos?.[index]?.categoria && (
                                                    <span className="text-xs text-red-500">{errors.productos[index]?.categoria?.message}</span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Modelo</Label>
                                                <Input {...register(`productos.${index}.modelo`)} placeholder="15 Pro Max" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Variantes</Label>
                                                <Input {...register(`productos.${index}.variantes`)} placeholder="256GB, 512GB" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Colores</Label>
                                                <Input {...register(`productos.${index}.colores`)} placeholder="Negro, Blanco" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => productosArray.remove(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </motion.div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => productosArray.append({ categoria: '', modelo: '', variantes: '', colores: '' })}
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Agregar Producto
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* GASTOS TAB */}
                        <TabsContent value="gastos">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="text-emerald-500" />
                                        Configuración de Gastos
                                    </CardTitle>
                                    <CardDescription>
                                        Define destinos, divisas y tipos de movimiento.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {gastosArray.fields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="grid grid-cols-5 gap-3 p-4 bg-muted/50 rounded-lg items-end"
                                        >
                                            <div className="space-y-1">
                                                <Label>Destinos</Label>
                                                <Input {...register(`gastos.${index}.destinos`)} placeholder="Proveedor" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Divisas</Label>
                                                <Input {...register(`gastos.${index}.divisas`)} placeholder="ARS, USD" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Tipo de Movimiento</Label>
                                                <Input {...register(`gastos.${index}.tipoDeMovimiento`)} placeholder="Egreso" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Categoría</Label>
                                                <Input {...register(`gastos.${index}.categoriaDeMovimiento`)} placeholder="Compra Stock" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => gastosArray.remove(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </motion.div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => gastosArray.append({ destinos: '', divisas: '', tipoDeMovimiento: '', categoriaDeMovimiento: '' })}
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Agregar Gasto
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FORM TAB */}
                        <TabsContent value="form">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="text-purple-500" />
                                        Configuración del Formulario
                                    </CardTitle>
                                    <CardDescription>
                                        Agrega canales de venta y estados disponibles.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {formArray.fields.map((field, index) => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg items-end"
                                        >
                                            <div className="space-y-1">
                                                <Label>Canal de Venta</Label>
                                                <Input {...register(`form.${index}.canalDeVenta`)} placeholder="MercadoLibre" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Estado</Label>
                                                <Input {...register(`form.${index}.estado`)} placeholder="Nuevo" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => formArray.remove(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </motion.div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => formArray.append({ canalDeVenta: '', estado: '' })}
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Agregar Configuración
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="mt-6 flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="min-w-[200px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                Guardar Configuración
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>
        </motion.div>
    );
}
