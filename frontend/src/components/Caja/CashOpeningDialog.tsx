import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
    DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { useCashOpening } from "@/hooks/useCashOpening";

/**
 * DialogContent personalizado sin botón de cerrar (X).
 * Se usa para modales obligatorios que no pueden cerrarse sin completar una acción.
 */
const MandatoryDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
            {/* Sin botón de cerrar DialogPrimitive.Close */}
        </DialogPrimitive.Content>
    </DialogPortal>
));
MandatoryDialogContent.displayName = "MandatoryDialogContent";

// Schema de validación con Zod
const cashOpeningSchema = z.object({
    montoInicial: z
        .string()
        .min(1, "El monto inicial es requerido")
        .refine((val) => !isNaN(Number(val.replace(/,/g, ""))), {
            message: "Debe ingresar un número válido",
        })
        .refine((val) => Number(val.replace(/,/g, "")) >= 0, {
            message: "El monto no puede ser negativo",
        }),
});

type CashOpeningFormData = z.infer<typeof cashOpeningSchema>;

/**
 * Componente de diálogo para la apertura de caja diaria.
 * Aparece automáticamente si no se ha realizado la apertura de caja del día.
 * No puede cerrarse sin completar el formulario.
 */
export const CashOpeningDialog: React.FC = () => {
    const { user } = useUser();
    const { shouldShowDialog, isLoading, openCash, getTodayFormatted } =
        useCashOpening();

    const form = useForm<CashOpeningFormData>({
        resolver: zodResolver(cashOpeningSchema),
        defaultValues: {
            montoInicial: "",
        },
    });

    // Formatea el valor como moneda mientras el usuario escribe
    const formatCurrency = (value: string): string => {
        // Remover todo excepto números y punto decimal
        const numericValue = value.replace(/[^0-9.]/g, "");
        // Evitar múltiples puntos decimales
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            return parts[0] + "." + parts.slice(1).join("");
        }
        return numericValue;
    };

    const onSubmit = (data: CashOpeningFormData) => {
        const monto = Number(data.montoInicial.replace(/,/g, ""));
        const usuario =
            user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "Usuario";

        const success = openCash(monto, usuario);

        if (success) {
            toast.success(`Caja abierta con $${monto.toLocaleString("es-AR")}`, {
                description: `Operador: ${usuario} - ${getTodayFormatted()}`,
                duration: 5000,
            });
        } else {
            toast.error("Error al abrir la caja", {
                description: "Por favor, intenta nuevamente.",
            });
        }
    };

    // No renderizar nada mientras se carga o si ya se hizo la apertura
    if (isLoading || !shouldShowDialog) {
        return null;
    }

    return (
        <Dialog open={shouldShowDialog}>
            <MandatoryDialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center sm:text-left">
                    <div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">
                        Apertura de Caja - {getTodayFormatted()}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2">
                        Antes de comenzar a operar, por favor ingresa el saldo inicial en
                        efectivo. Es importante que verifiques que el dinero físico
                        coincida con este monto.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="montoInicial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">
                                        Monto Inicial
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0.00"
                                                className="pl-10 text-lg h-12"
                                                autoFocus
                                                onChange={(e) => {
                                                    field.onChange(formatCurrency(e.target.value));
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span> Procesando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    Abrir Caja
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </MandatoryDialogContent>
        </Dialog>
    );
};

export default CashOpeningDialog;
