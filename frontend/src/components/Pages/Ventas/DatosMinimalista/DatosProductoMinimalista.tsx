import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingBag, Smartphone, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { IFormConfig, IProductosConfig } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MinimalInput, MinimalSelectTrigger, SectionHeader } from "./components";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface IDatosProductoProps {
    formConfig: IFormConfig
    productosConfig: IProductosConfig[]
}

const getCategoryIcon = (category: string) => {
    // Basic mapping, can be expanded or just use generic
    return ShoppingBag;
}

export function DatosProductoMinimalista({ formConfig, productosConfig }: IDatosProductoProps) {
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
            costo: "",
            precio: "",
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
                        {/* Product Header with Title and Actions */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                                    Producto {index + 1}
                                </span>
                                {fields.length > 1 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground/70">
                                        de {fields.length}
                                    </Badge>
                                )}
                            </div>

                            {/* Action Buttons (Hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-primary hover:bg-primary/5 hover:text-primary gap-1 px-2 rounded-full text-[10px]"
                                    onClick={() => addProduct(false)}
                                >
                                    <Plus className="w-3 h-3" />
                                    <span className="font-medium">Agregar</span>
                                </Button>

                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => removeProduct(index)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

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
    productosConfig: IProductosConfig[]
    mode: 'manual' | 'auto'
    control: any
    watch: any
    setValue: any
}

function ProductForm({ index, formConfig, productosConfig, mode, control, watch, setValue }: ProductFormProps) {
    const tipo = watch(`productos.${index}.tipo`)
    const modelo = watch(`productos.${index}.modelo`)
    const esParteDePago = watch(`productos.${index}.esParteDePago`)

    const tipoSeleccionado = watch(`productos.${index}.tipo`);
    const modeloSeleccionado = watch(`productos.${index}.modelo`);

    // --- LOGICA DE OBTENCIÓN DE DATOS (Idem Original) ---
    //const useBackendConfig = productosConfig.length > 0;

    const useBackendConfig = Array.isArray(productosConfig) && productosConfig.length > 0;

    const categoriasOptions = Array.from(new Set(productosConfig.map(p => p.categoria))).filter(Boolean)


    const modelosOptions = Array.from(new Set(
        productosConfig
            .filter(p => !tipoSeleccionado || p.categoria === tipoSeleccionado)
            .map(p => p.modelo)
    )).filter(Boolean)

    const capacidadesOptions = Array.from(new Set(
        productosConfig
            // Filtramos por AMBOS campos
            .filter(p =>
                (!tipoSeleccionado || p.categoria === tipoSeleccionado) &&
                (!modeloSeleccionado || p.modelo === modeloSeleccionado)
            )
            // Rompemos el string "256GB, 512GB" y aplanamos el array
            .flatMap(p => p.variantes ? p.variantes.split(',').map(s => s.trim()) : [])
    )).filter(Boolean)

    const coloresOptions = Array.from(new Set(
        productosConfig
            .filter(p =>
                (!tipoSeleccionado || p.categoria === tipoSeleccionado) &&
                (!modeloSeleccionado || p.modelo === modeloSeleccionado)
            )
            .flatMap(p => p.colores ? p.colores.split(',').map(s => s.trim()) : [])
    )).filter(Boolean)

    const estados = formConfig.estado || [];
    const canalesDeVenta = formConfig.canalesDeVenta || [];

    useEffect(() => {
        setValue(`productos.${index}.modelo`, "");
        setValue(`productos.${index}.capacidad`, "");
    }, [tipoSeleccionado, setValue, index]);

    // --- MODO AUTO: Generar Lista Plana (Idem Original) ---
    const getAutoOptions = () => {
        // Validación de seguridad
        if (!useBackendConfig || !Array.isArray(productosConfig)) return [];

        const options: { label: string, value: string, icon: any, data: any }[] = [];

        productosConfig.forEach(p => {
            // 1. CAMBIO CLAVE: Usamos las props en minúscula (normalizadas en el hook)
            // Separamos por coma y limpiamos espacios
            const caps = p.variantes ? p.variantes.split(',').map(s => s.trim()).filter(Boolean) : [''];
            const cols = p.colores ? p.colores.split(',').map(s => s.trim()).filter(Boolean) : [''];

            const Icon = ShoppingBag; // Asegúrate de tener este import

            // Arrays iterables (si está vacío, al menos una iteración para que el producto exista)
            const iterCaps = caps.length > 0 ? caps : [''];
            const iterCols = cols.length > 0 ? cols : [''];

            // 2. Doble bucle para generar todas las combinaciones (Producto Cartesiano)
            iterCaps.forEach(cap => {
                iterCols.forEach(col => {
                    // Construimos la etiqueta visual: "iPhone | 13 Pro | 256GB | Blue"
                    const parts = [p.categoria, p.modelo, cap, col].filter(Boolean);
                    const label = parts.join(" | ");

                    // El valor es un JSON string para poder recuperarlo fácil al seleccionar
                    const value = JSON.stringify({
                        tipo: p.categoria,
                        modelo: p.modelo,
                        capacidad: cap, // Si era '' se guarda como ''
                        color: col      // Si era '' se guarda como ''
                    });

                    options.push({
                        label,
                        value,
                        icon: Icon,
                        // Guardamos la data cruda por si la necesitas en el evento de selección
                        data: {
                            tipo: p.categoria,
                            modelo: p.modelo,
                            capacidad: cap,
                            color: col
                        }
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
                                <FormMessage />
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

                {/* IMEI/Serial - Modal Scanner */}
                <div className="col-span-6 md:col-span-3">
                    <FormField
                        control={control}
                        name={`productos.${index}.imei`}
                        render={({ field }) => (
                            <ImeiScannerField field={field} />
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
                                <FormMessage />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}

// --- IMEI Scanner Modal Component ---
interface ImeiScannerFieldProps {
    field: {
        value: string;
        onChange: (value: string) => void;
    };
}

function ImeiScannerField({ field }: ImeiScannerFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempValue, setTempValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);

    const handleOpen = () => {
        setTempValue(field.value || "");
        setIsOpen(true);
    };

    const handleConfirm = () => {
        field.onChange(tempValue);
        setIsOpen(false);

        // Después de cerrar el modal, buscar y enfocar el siguiente campo
        setTimeout(() => {
            if (triggerButtonRef.current) {
                // Obtener todos los elementos focusables del formulario
                const focusableSelector = 'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
                const form = triggerButtonRef.current.closest('form');

                if (form) {
                    const focusableElements = Array.from(form.querySelectorAll(focusableSelector)) as HTMLElement[];
                    const currentIndex = focusableElements.indexOf(triggerButtonRef.current);

                    // Enfocar el siguiente elemento (si existe)
                    if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                        focusableElements[currentIndex + 1].focus();
                    }
                }
            }
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        }
    };

    // Auto-focus cuando se abre el modal
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    return (
        <FormItem>
            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">
                IMEI / Serial (Opcional)
            </FormLabel>
            <FormControl>
                <Button
                    ref={triggerButtonRef}
                    type="button"
                    variant="outline"
                    onClick={handleOpen}
                    className={cn(
                        "w-full h-[42px] justify-start text-left font-mono text-xs px-3",
                        "border-border/40 hover:bg-muted/20 shadow-none",
                        field.value
                            ? "bg-blue-50 dark:bg-transparent dark:border-emerald-500/50"
                            : "bg-transparent text-muted-foreground"
                    )}
                >
                    <ScanLine className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                        {field.value || "Escanear..."}
                    </span>
                </Button>
            </FormControl>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ScanLine className="w-5 h-5 text-primary" />
                            Escanear IMEI / Serial
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Escanea el código con la pistola o ingresa manualmente.
                            Presiona <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> para confirmar.
                        </p>

                        <MinimalInput
                            ref={inputRef}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-12 text-lg font-mono tracking-wider text-center"
                            placeholder="Esperando escaneo..."
                            autoComplete="off"
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirm}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </FormItem>
    );
}
