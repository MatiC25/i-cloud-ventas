import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp, Package, Smartphone, ShoppingCart, Check, Laptop, Tablet, Watch, Headphones, Plug, Gamepad, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { IFormConfig, IConfigProducto } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface IDatosProductoProps {
    formConfig: IFormConfig
    productosConfig?: IConfigProducto[]
}

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("celular") || cat.includes("iphone")) return Smartphone;
    if (cat.includes("mac") || cat.includes("notebook") || cat.includes("computador")) return Laptop;
    if (cat.includes("ipad") || cat.includes("tablet")) return Tablet;
    if (cat.includes("watch") || cat.includes("reloj")) return Watch;
    if (cat.includes("audio") || cat.includes("auricular") || cat.includes("airpod") || cat.includes("headset") || cat.includes("parlante")) return Headphones;
    if (cat.includes("accesorios") || cat.includes("cargador") || cat.includes("funda")) return Plug;
    if (cat.includes("consola") || cat.includes("juego") || cat.includes("playstation") || cat.includes("nintendo") || cat.includes("xbox")) return Gamepad;
    if (cat.includes("tv") || cat.includes("monitor")) return Tv;
    return Package;
}

export function DatosProducto({ formConfig, productosConfig = [] }: IDatosProductoProps) {
    const { control, watch, setValue } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "productos",
    })

    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [inputMode, setInputMode] = useState<'manual' | 'auto'>('manual')

    // Sync activeIndex with fields length to prevent empty state when deleting or resetting
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

    const productos = watch("productos") || []
    const totalProductos = productos.length
    const productosCompletos = productos.filter((p: any) => p.tipo && p.modelo).length
    const totalPrecio = productos.reduce((acc: number, p: any) => acc + (Number(p.precio) || 0), 0)

    return (
        <Card className="w-full shadow-md border-t-4 border-t-orange-500">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Productos</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {productosCompletos}/{totalProductos} configurados
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 bg-muted/50 p-1.5 rounded-lg border">
                            <Switch
                                id="mode-switch"
                                checked={inputMode === 'auto'}
                                onCheckedChange={(checked) => setInputMode(checked ? 'auto' : 'manual')}
                            />
                            <Label htmlFor="mode-switch" className="text-xs font-medium cursor-pointer">
                                {inputMode === 'auto' ? 'Modo Rápido ⚡' : 'Modo Manual 🛠️'}
                            </Label>
                        </div>

                        {totalPrecio > 0 && (
                            <Badge variant="secondary" className="font-mono text-green-600 bg-green-500/10">
                                ${totalPrecio}
                            </Badge>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600"
                            onClick={() => addProduct(false)}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Producto</span>
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200"
                            onClick={() => addProduct(true)}
                        >
                            <Smartphone className="w-4 h-4" />
                            <span className="hidden sm:inline">Canje</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="relative min-h-[320px]">
                    {fields.map((field, index) => {
                        const isActive = index === activeIndex
                        const producto = watch(`productos.${index}`)
                        const isComplete = producto?.tipo && producto?.modelo
                        const esParteDePago = producto?.esParteDePago

                        return (
                            <div
                                key={field.id}
                                className={cn(
                                    "transition-all duration-300 ease-out",
                                    isActive ? "relative opacity-100" : "absolute inset-x-0 top-0 opacity-0 pointer-events-none",
                                )}
                            >
                                <div className="rounded-lg border bg-muted/30 overflow-hidden">
                                    {/* Product header */}
                                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                                    isComplete
                                                        ? "bg-green-500 text-white"
                                                        : esParteDePago ? "bg-purple-500 text-white" : "bg-orange-500 text-white",
                                                )}
                                            >
                                                {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {producto?.modelo || (esParteDePago ? `Dispositivo ${index + 1}` : `Producto ${index + 1}`)}
                                                {esParteDePago && <span className="mr-1 text-purple-600 font-bold"> [Canje]</span>}
                                            </span>
                                            {producto?.tipo && <span className="text-xs text-muted-foreground">({producto.tipo})</span>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {producto?.precio > 0 && (
                                                <span className={cn(
                                                    "text-sm font-mono mr-2",
                                                    esParteDePago ? "text-red-500" : "text-green-500"
                                                )}>
                                                    {esParteDePago ? "-" : ""}${producto.precio}
                                                </span>
                                            )}
                                            {totalProductos > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeProduct(index)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product form */}
                                    <ProductForm
                                        index={index}
                                        formConfig={formConfig}
                                        productosConfig={productosConfig}
                                        mode={inputMode}
                                        control={control}
                                        watch={watch}
                                        setValue={setValue}
                                        esParteDePago={esParteDePago}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {fields.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-dashed">
                        {fields.map((_, index) => {
                            const producto = watch(`productos.${index}`)
                            const isComplete = producto?.tipo && producto?.modelo

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={cn(
                                        "transition-all duration-200 rounded-full",
                                        index === activeIndex
                                            ? "w-6 h-2 bg-orange-500"
                                            : isComplete
                                                ? "w-2 h-2 bg-green-500 hover:bg-green-400"
                                                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                                    )}
                                />
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card >
    )
}

// --- Product form component ---
interface ProductFormProps {
    index: number
    formConfig: IFormConfig
    productosConfig: IConfigProducto[]
    mode: 'manual' | 'auto'
    control: any
    watch: any
    setValue: any
    esParteDePago?: boolean
}

function ProductForm({ index, formConfig, productosConfig, mode, control, watch, setValue, esParteDePago }: ProductFormProps) {
    const tipo = watch(`productos.${index}.tipo`)
    const modelo = watch(`productos.${index}.modelo`)

    // --- LOGICA DE OBTENCIÓN DE DATOS ---
    const useBackendConfig = productosConfig.length > 0;

    // 1. Opciones Categoria
    // Si hay config, extraemos categorias unicas. Si no, fallback a formConfig.
    const categoriasOptions = useBackendConfig
        ? Array.from(new Set(productosConfig.map(p => p.Categoria))).filter(Boolean)
        : formConfig.tiposDeProductos || [];

    // 2. Opciones Modelo (Dependiente de categoria en Manual, o todos en lista plana si no se filtra)
    // En modo manual, filtramos por categoria seleccionada
    const modelosOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => !tipo || p.Categoria === tipo)
                .map(p => p.Modelo)
        )).filter(Boolean)
        : formConfig.modelosDeProductos || [];

    // 3. Opciones Capacidad (Variantes)
    const capacidadesOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => (!tipo || p.Categoria === tipo) && (!modelo || p.Modelo === modelo))
                .flatMap(p => p.Variantes ? p.Variantes.split(',').map(s => s.trim()) : [])
        )).filter(Boolean)
        : formConfig.capacidadesDeProductos || [];

    // 4. Opciones Colores
    const coloresOptions = useBackendConfig
        ? Array.from(new Set(
            productosConfig
                .filter(p => (!tipo || p.Categoria === tipo) && (!modelo || p.Modelo === modelo))
                .flatMap(p => p.Colores ? p.Colores.split(',').map(s => s.trim()) : [])
        )).filter(Boolean)
        : formConfig.coloresDeProductos || [];

    const estados = formConfig.estadosDeProductos || ["Nuevo", "Usado", "Reacondicionado"];

    // --- MODO AUTO: Generar Lista Plana de Productos ---
    // Generamos todas las combinaciones posibles para el buscador único
    const getAutoOptions = () => {
        if (!useBackendConfig) return [];

        const options: { label: string, value: string, icon: any, data: any }[] = [];

        productosConfig.forEach(p => {
            const caps = p.Variantes ? p.Variantes.split(',').map(s => s.trim()).filter(Boolean) : [''];
            const cols = p.Colores ? p.Colores.split(',').map(s => s.trim()).filter(Boolean) : [''];

            // Icono basado en categoría
            const Icon = getCategoryIcon(p.Categoria);

            // Helper para limpiar arrays y generar combinaciones
            // Si caps o cols están vacíos, usamos un array con un string vacío para que el loop corra al menos una vez (si el producto no tiene variantes)
            const iterCaps = caps.length > 0 ? caps : [''];
            const iterCols = cols.length > 0 ? cols : [''];

            iterCaps.forEach(cap => {
                iterCols.forEach(col => {
                    // Detectar "Pro" / "Plus" / "Max" para lógica adicional si se requiere en el futuro
                    // Por ahora, el nombre del modelo ya debería incluirlo (ej: "iPhone 14 Pro Max")

                    // Format: Categoria | Modelo | Variante | Color
                    const parts = [p.Categoria, p.Modelo, cap, col].filter(Boolean);
                    const label = parts.join(" | ");

                    // Value: unique JSON string
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

    // Handler para selección automática
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
        <div className="p-3 space-y-3">
            {/* MODO AUTOMÁTICO - BUSCADOR ÚNICO */}
            {mode === 'auto' && (
                <div className="mb-4">
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs font-semibold">Buscar Producto</Label>
                        <Combobox
                            options={autoOptions}
                            value=""
                            onChange={handleAutoSelect}
                            placeholder="Buscar producto..."
                            emptyText="No encontrado"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                            * Seleccionar un producto autocompletará todos los campos.
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR if no config */}
            {!useBackendConfig && mode === 'auto' && (
                <div className="text-xs text-red-500">
                    No hay configuración de productos cargada. Cambia a modo manual.
                </div>
            )}

            {/* Categoría */}
            <FormField
                control={control}
                name={`productos.${index}.tipo`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Categoría</FormLabel>
                        <Combobox
                            options={categoriasOptions}
                            value={field.value}
                            onChange={(val) => {
                                field.onChange(val);
                                // Reset fields dependent on category if changed? 
                                // Maybe better UX to keep them if they match, but typically reset.
                                setValue(`productos.${index}.modelo`, "");
                            }}
                            placeholder="Selecciona categoría..."
                            emptyText="Sin resultados."
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Modelo y Capacidad */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={control}
                    name={`productos.${index}.modelo`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Modelo</FormLabel>
                            <Combobox
                                options={modelosOptions}
                                value={field.value}
                                onChange={(val) => {
                                    field.onChange(val);
                                    setValue(`productos.${index}.capacidad`, "");
                                    setValue(`productos.${index}.color`, "");
                                }}
                                placeholder="Modelo"
                                emptyText="Sin resultados."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`productos.${index}.capacidad`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Capacidad</FormLabel>
                            <Combobox
                                options={capacidadesOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Capacidad"
                                emptyText="-"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Color y Estado */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={control}
                    name={`productos.${index}.color`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Color</FormLabel>
                            <Combobox
                                options={coloresOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Color"
                                emptyText="-"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`productos.${index}.estado`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Estado</FormLabel>
                            <Combobox
                                options={estados.length > 0 ? estados : ["Nuevo", "Usado", "Reacondicionado"]}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Estado"
                                emptyText="-"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Cantidad e IMEI */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={control}
                    name={`productos.${index}.cantidad`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Cantidad</FormLabel>
                            <FormControl>
                                <input
                                    type="number"
                                    min="1"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="1"
                                    value={field.value ?? 1}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`productos.${index}.imei`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">IMEI (opcional)</FormLabel>
                            <div>
                                <input
                                    type="text"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Número IMEI"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Precio y Costo */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={control}
                    name={`productos.${index}.precio`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Precio</FormLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                    $
                                </span>
                                <input
                                    type="number"
                                    className="flex h-9 w-full rounded-md border border-input bg-background pl-7 pr-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`productos.${index}.costo`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Costo</FormLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                    $
                                </span>
                                <input
                                    type="number"
                                    className="flex h-9 w-full rounded-md border border-input bg-background pl-7 pr-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
