import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingBag, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { IFormConfig, IConfigProducto } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MinimalInput, MinimalSelectTrigger, SectionHeader } from "./components";

interface IDatosProductoProps {
    formConfig: IFormConfig
    productosConfig?: IConfigProducto[]
}

const getCategoryIcon = (category: string) => {
    // Basic mapping, can be expanded or just use generic
    return ShoppingBag;
}

export function DatosProductoMinimalista({ formConfig, productosConfig = [] }: IDatosProductoProps) {
    const { control, watch, setValue } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "productos",
    })

    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [inputMode, setInputMode] = useState<'manual' | 'auto'>('manual')

    useEffect(() => {
        if (activeIndex >= fields.length && fields.length > 0) {
            setActiveIndex(fields.length - 1);
        } else if (fields.length === 0) {
            setActiveIndex(0);
        }
    }, [fields.length, activeIndex]);

    const addProduct = (isTradeIn: boolean = false) => {
        append({
            tipo: "",
            modelo: "",
            capacidad: "",
            color: "",
            estado: "Nuevo",
            imei: "",
            costo: 0,
            precio: 0,
            cantidad: 1,
            esParteDePago: isTradeIn
        })
        setTimeout(() => setActiveIndex(fields.length), 50)
    }

    const removeProduct = (index: number) => {
        remove(index)
        if (activeIndex >= index && activeIndex > 0) {
            setActiveIndex(activeIndex - 1)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader
                    icon={ShoppingBag}
                    title="Productos"
                    className="mb-0"
                    iconClassName="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                />

                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-full">
                        <Switch
                            id="mode-switch-min"
                            checked={inputMode === 'auto'}
                            onCheckedChange={(checked) => setInputMode(checked ? 'auto' : 'manual')}
                            className="scale-75 data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="mode-switch-min" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none">
                            {inputMode === 'auto' ? 'Búsqueda Rápida' : 'Manual'}
                        </Label>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary hover:bg-primary/5 hover:text-primary gap-1.5 px-3 rounded-full"
                        onClick={() => addProduct(false)}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-medium">Agregar</span>
                    </Button>
                </div>
            </div>

            <div className="space-y-10">
                {fields.map((field, index) => (
                    <div key={field.id} className="group relative transition-all duration-300">
                        {/* Remove Button (Hover) */}
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                                onClick={() => removeProduct(index)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}

                        <ProductForm
                            index={index}
                            formConfig={formConfig}
                            productosConfig={productosConfig}
                            mode={inputMode}
                            control={control}
                            watch={watch}
                            setValue={setValue}
                        />

                        {/* Row Separator */}
                        {index < fields.length - 1 && (
                            <div className="border-t border-dashed border-border/40 my-10" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Product component ---
interface ProductFormProps {
    index: number
    formConfig: IFormConfig
    productosConfig: IConfigProducto[]
    mode: 'manual' | 'auto'
    control: any
    watch: any
    setValue: any
}

function ProductForm({ index, formConfig, productosConfig, mode, control, watch, setValue }: ProductFormProps) {
    const tipo = watch(`productos.${index}.tipo`)
    const modelo = watch(`productos.${index}.modelo`)
    const esParteDePago = watch(`productos.${index}.esParteDePago`)

    // --- LOGICA DE OBTENCIÓN DE DATOS (Idem Original) ---
    const useBackendConfig = productosConfig.length > 0;

    const categoriasOptions = useBackendConfig
        ? Array.from(new Set(productosConfig.map(p => p.Categoria))).filter(Boolean)
        : formConfig.tiposDeProductos || [];

    const modelosOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => !tipo || p.Categoria === tipo)
                .map(p => p.Modelo)
        )).filter(Boolean)
        : formConfig.modelosDeProductos || [];

    const capacidadesOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => (!tipo || p.Categoria === tipo) && (!modelo || p.Modelo === modelo))
                .flatMap(p => p.Variantes ? p.Variantes.split(',').map(s => s.trim()) : [])
        )).filter(Boolean)
        : formConfig.capacidadesDeProductos || [];

    const coloresOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => (!tipo || p.Categoria === tipo) && (!modelo || p.Modelo === modelo))
                .flatMap(p => p.Colores ? p.Colores.split(',').map(s => s.trim()) : [])
        )).filter(Boolean)
        : formConfig.coloresDeProductos || [];

    const estados = formConfig.estadosDeProductos || ["Nuevo", "Usado", "Reacondicionado"];

    // --- MODO AUTO: Generar Lista Plana (Idem Original) ---
    const getAutoOptions = () => {
        if (!useBackendConfig) return [];
        const options: { label: string, value: string, icon: any, data: any }[] = [];
        productosConfig.forEach(p => {
            const caps = p.Variantes ? p.Variantes.split(',').map(s => s.trim()).filter(Boolean) : [''];
            const cols = p.Colores ? p.Colores.split(',').map(s => s.trim()).filter(Boolean) : [''];
            const Icon = ShoppingBag;
            const iterCaps = caps.length > 0 ? caps : [''];
            const iterCols = cols.length > 0 ? cols : [''];
            iterCaps.forEach(cap => {
                iterCols.forEach(col => {
                    const parts = [p.Categoria, p.Modelo, cap, col].filter(Boolean);
                    const label = parts.join(" | ");
                    const value = JSON.stringify({
                        tipo: p.Categoria,
                        modelo: p.Modelo,
                        capacidad: cap,
                        color: col
                    });
                    options.push({
                        label,
                        value,
                        icon: Icon,
                        data: { tipo: p.Categoria, modelo: p.Modelo, capacidad: cap, color: col }
                    });
                });
            });
        });
        return options;
    };

    const autoOptions = getAutoOptions();

    const handleAutoSelect = (jsonValue: string) => {
        try {
            const data = JSON.parse(jsonValue);
            setValue(`productos.${index}.tipo`, data.tipo);
            setValue(`productos.${index}.modelo`, data.modelo);
            setValue(`productos.${index}.capacidad`, data.capacidad);
            setValue(`productos.${index}.color`, data.color);
        } catch (e) {
            console.error("Error parsing product value", e);
        }
    };

    return (
        <div className={cn("space-y-5", esParteDePago && "bg-purple-50/20 p-4 rounded-xl border border-purple-100/50")}>
            {esParteDePago && (
                <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Dispositivo en Canje</span>
                </div>
            )}

            {/* SEARCH ROW (Full width) */}
            {mode === 'auto' && (
                <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
                    <Combobox
                        options={autoOptions}
                        value=""
                        onChange={handleAutoSelect}
                        placeholder="🔍 Buscar producto (modelo, color...)"
                        emptyText="No encontrado"
                        className="w-full bg-muted/20 border-transparent hover:bg-muted/30 h-10"
                    />
                </div>
            )}

            {/* MAIN GRID */}
            <div className="grid grid-cols-12 gap-4">
                {/* Categoría */}
                <div className="col-span-12 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.tipo`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Categoría</FormLabel>
                                <Combobox
                                    options={categoriasOptions}
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue(`productos.${index}.modelo`, "");
                                    }}
                                    placeholder="Tipo"
                                    emptyText="-"
                                    className={cn(
                                        "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-transparent"
                                    )}
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Modelo */}
                <div className="col-span-12 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.modelo`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Modelo</FormLabel>
                                {/* Using Combobox for model as it might be long list, or could be select if preferred consistent UI */}
                                <Combobox
                                    options={modelosOptions}
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue(`productos.${index}.capacidad`, "");
                                        setValue(`productos.${index}.color`, "");
                                    }}
                                    placeholder="Modelo"
                                    emptyText="-"
                                    className={cn(
                                        "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-transparent"
                                    )}
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Capacidad */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.capacidad`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Capacidad</FormLabel>
                                <Combobox
                                    options={capacidadesOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="-"
                                    emptyText="-"
                                    className={cn(
                                        "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-transparent"
                                    )}
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Color */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.color`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Color</FormLabel>
                                <Combobox
                                    options={coloresOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="-"
                                    emptyText="-"
                                    className={cn(
                                        "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-transparent"
                                    )}
                                />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className={`grid grid-cols-9 gap-4 ${esParteDePago ? 'opacity-80' : ''}`}>
                {/* Estado */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.estado`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Estado</FormLabel>
                                <Combobox
                                    options={estados}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="-"
                                    emptyText="-"
                                    className={cn(
                                        "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                        field.value ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50" : "bg-transparent"
                                    )}
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Cantidad */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.cantidad`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Cantidad</FormLabel>
                                <FormControl>
                                    <MinimalInput
                                        type="number"
                                        min="1"
                                        className="h-[42px]"
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* IMEI/Serial */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.imei`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">IMEI / Serial (Opcional)</FormLabel>
                                <FormControl>
                                    <MinimalInput
                                        className="h-[42px] text-xs font-mono"
                                        placeholder="Escanear..."
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className={`grid grid-cols-6 gap-4 ${esParteDePago ? 'opacity-80' : ''}`}>
                {/* Precio */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.precio`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase font-bold tracking-wider pl-1 text-primary">Precio Unit.</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">
                                        $
                                    </span>
                                    <MinimalInput
                                        type="number"
                                        className="h-[42px] pl-6 font-semibold tabular-nums"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Costo */}
                <div className="col-span-12 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.costo`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase font-bold tracking-wider pl-1 text-primary">Costo Unit.</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">
                                        $
                                    </span>
                                    <MinimalInput
                                        type="number"
                                        className="h-[42px] pl-6 font-semibold tabular-nums"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
