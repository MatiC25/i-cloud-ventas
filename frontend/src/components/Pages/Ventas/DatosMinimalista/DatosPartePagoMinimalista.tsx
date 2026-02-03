import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { MinimalInput, SectionHeader } from "./components";
import { Smartphone, ScanLine } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IDatosPartePagoProps {
    productosConfig?: any[]; // Array from backend
}

export function DatosPartePagoMinimalista({ productosConfig = [] }: IDatosPartePagoProps) {
    const { control, watch, setValue } = useFormContext();
    const esParteDePago = watch("parteDePago.esParteDePago");

    // Watch fields for filtering
    const tipoSeleccionado = watch("parteDePago.tipo");
    const modeloSeleccionado = watch("parteDePago.modelo");

    // --- LOGICA DE FILTRADO (Idem DatosProductoMinimalista) ---
    const useBackendConfig = Array.isArray(productosConfig) && productosConfig.length > 0;

    const categoriasOptions = Array.from(new Set(productosConfig.map(p => p.categoria))).filter(Boolean);

    const modelosOptions = Array.from(new Set(
        productosConfig
            .filter(p => !tipoSeleccionado || p.categoria === tipoSeleccionado)
            .map(p => p.modelo)
    )).filter(Boolean);

    const capacidadesOptions = Array.from(new Set(
        productosConfig
            .filter(p =>
                (!tipoSeleccionado || p.categoria === tipoSeleccionado) &&
                (!modeloSeleccionado || p.modelo === modeloSeleccionado)
            )
            // Rompemos el string "256GB, 512GB" y aplanamos el array
            .flatMap(p => p.variantes ? p.variantes.split(',').map((s: string) => s.trim()) : [])
    )).filter(Boolean);

    const coloresOptions = Array.from(new Set(
        productosConfig
            .filter(p =>
                (!tipoSeleccionado || p.categoria === tipoSeleccionado) &&
                (!modeloSeleccionado || p.modelo === modeloSeleccionado)
            )
            .flatMap(p => p.colores ? p.colores.split(',').map((s: string) => s.trim()) : [])
    )).filter(Boolean);

    // Reset dependents when parent changes
    useEffect(() => {
        if (esParteDePago) {
            // Only if we want to strict clear. Optional.
            // setValue("parteDePago.modelo", "");
            // setValue("parteDePago.capacidad", "");
        }
    }, [tipoSeleccionado, setValue, esParteDePago]);


    return (
        <div className="space-y-4">
            {/* Header y Checkbox de activación combinados */}
            <div className="flex items-center justify-between">
                <SectionHeader
                    icon={Smartphone}
                    title="Trade In / Parte de Pago"
                    className="mb-0"
                    iconClassName="bg-purple-500/10 text-purple-500 border-purple-500/20"
                />

                <FormField
                    control={control}
                    name="parteDePago.esParteDePago"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/30 px-3 py-2 rounded-full border border-transparent hover:border-border/30 transition-all">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="h-4 w-4"
                                />
                            </FormControl>
                            <FormLabel className="text-xs font-medium text-muted-foreground cursor-pointer uppercase tracking-tight">
                                Activar
                            </FormLabel>
                        </FormItem>
                    )}
                />
            </div>

            {esParteDePago && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300 relative">
                    {/* Decorative subtle background for the trade-in area */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-transparent rounded-xl -z-10" />

                    <div className="grid grid-cols-12 gap-x-4 gap-y-5 p-1">

                        {/* TIPO */}
                        <div className="col-span-12 md:col-span-3">
                            <FormField
                                control={control}
                                name="parteDePago.tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Tipo</FormLabel>
                                        <Combobox
                                            options={categoriasOptions}
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                setValue("parteDePago.modelo", "");
                                            }}
                                            placeholder="Tipo"
                                            emptyText="-"
                                            className={cn(
                                                "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                                field.value ? "bg-purple-50/50 dark:bg-transparent dark:border-purple-500/50" : "bg-transparent"
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* MODELO */}
                        <div className="col-span-12 md:col-span-3">
                            <FormField
                                control={control}
                                name="parteDePago.modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Modelo</FormLabel>
                                        <Combobox
                                            options={modelosOptions}
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                setValue("parteDePago.capacidad", "");
                                                setValue("parteDePago.color", "");
                                            }}
                                            placeholder="Modelo"
                                            emptyText="-"
                                            className={cn(
                                                "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                                field.value ? "bg-purple-50/50 dark:bg-transparent dark:border-purple-500/50" : "bg-transparent"
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* CAPACIDAD */}
                        <div className="col-span-6 md:col-span-3">
                            <FormField
                                control={control}
                                name="parteDePago.capacidad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Capacidad</FormLabel>
                                        <Combobox
                                            options={capacidadesOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="GB"
                                            emptyText="-"
                                            className={cn(
                                                "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                                field.value ? "bg-purple-50/50 dark:bg-transparent dark:border-purple-500/50" : "bg-transparent"
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* COLOR */}
                        <div className="col-span-6 md:col-span-3">
                            <FormField
                                control={control}
                                name="parteDePago.color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Color</FormLabel>
                                        <Combobox
                                            options={coloresOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Color"
                                            emptyText="-"
                                            className={cn(
                                                "h-[42px] border-border/40 hover:bg-muted/20 shadow-none px-3 font-normal",
                                                field.value ? "bg-purple-50/50 dark:bg-transparent dark:border-purple-500/50" : "bg-transparent"
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* IMEI */}
                        <div className="col-span-6 md:col-span-4">
                            <FormField
                                control={control}
                                name="parteDePago.imei"
                                render={({ field }) => (
                                    <ImeiScannerField field={field} />
                                )}
                            />
                        </div>

                        {/* BATERIA */}
                        <div className="col-span-6 md:col-span-2">
                            <FormField
                                control={control}
                                name="parteDePago.bateria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">Bateria</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MinimalInput
                                                    className="pr-6 font-mono text-center"
                                                    placeholder="%"
                                                    {...field}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">%</span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* COSTO / VALOR TOMA */}
                        <div className="col-span-6 md:col-span-6">
                            <FormField
                                control={control}
                                name="parteDePago.costo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase text-purple-600 font-bold tracking-wider pl-1">Valor Toma</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                                <MinimalInput
                                                    type="number"
                                                    className="pl-6 font-semibold border-purple-200 focus:border-purple-500 bg-white dark:bg-slate-950/50 dark:border-purple-500/30"
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

// --- IMEI Scanner Reutilizable (Mini Version) ---
function ImeiScannerField({ field }: { field: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempValue, setTempValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpen = () => {
        setTempValue(field.value || "");
        setIsOpen(true);
    };

    const handleConfirm = () => {
        field.onChange(tempValue);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        }
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    return (
        <FormItem>
            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider pl-1">
                IMEI / Serial
            </FormLabel>
            <FormControl>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpen}
                    className={cn(
                        "w-full h-[42px] justify-start text-left font-mono text-xs px-3",
                        "border-border/40 hover:bg-muted/20 shadow-none",
                        field.value
                            ? "bg-purple-50/50 dark:bg-transparent dark:border-purple-500/50"
                            : "bg-transparent text-muted-foreground"
                    )}
                >
                    <ScanLine className="w-4 h-4 mr-2 shrink-0 opacity-50" />
                    <span className="truncate">
                        {field.value || "Escanear..."}
                    </span>
                </Button>
            </FormControl>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <ScanLine className="w-4 h-4" />
                            Escanear IMEI (Parte de Pago)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <MinimalInput
                            ref={inputRef}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-10 text-lg font-mono text-center tracking-widest uppercase"
                            placeholder="ESCANEAR AQUI"
                            autoComplete="off"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleConfirm}>Confirmar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </FormItem>
    );
}
