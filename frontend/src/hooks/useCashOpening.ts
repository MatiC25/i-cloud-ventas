import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

export interface ICashOpeningData {
    fecha: string;
    montoInicial: number;
    usuario: string;
    timestamp: string;
}

const STORAGE_KEY_PREFIX = "caja_apertura_";

/**
 * Genera la key de localStorage para la fecha actual
 */
const getTodayStorageKey = (): string => {
    return `${STORAGE_KEY_PREFIX}${format(new Date(), "yyyy-MM-dd")}`;
};

/**
 * Hook para manejar la lógica de apertura de caja diaria.
 * Verifica si ya se realizó la apertura de caja hoy y provee métodos para abrir la caja.
 * 
 * @returns {object} - Estado y métodos para manejar la apertura de caja
 * 
 * En el futuro, este hook puede ser extendido para:
 * - Consultar un endpoint del backend en lugar de localStorage
 * - Sincronizar el estado entre localStorage y el backend
 * - Manejar estados de carga y error para llamadas API
 */
export const useCashOpening = () => {
    const [shouldShowDialog, setShouldShowDialog] = useState<boolean>(false);
    const [todayData, setTodayData] = useState<ICashOpeningData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    /**
     * Verifica si existe apertura de caja para el día de hoy.
     * En el futuro, aquí se puede agregar una llamada al backend.
     */
    const checkTodayCashOpening = useCallback((): ICashOpeningData | null => {
        try {
            const key = getTodayStorageKey();
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored) as ICashOpeningData;
            }
            return null;
        } catch (error) {
            console.error("Error al verificar apertura de caja:", error);
            return null;
        }
    }, []);

    /**
     * Guarda la apertura de caja en localStorage.
     * En el futuro, aquí se puede agregar una llamada POST al backend.
     */
    const saveCashOpening = useCallback((data: ICashOpeningData): boolean => {
        try {
            const key = getTodayStorageKey();
            localStorage.setItem(key, JSON.stringify(data));
            setTodayData(data);
            setShouldShowDialog(false);
            return true;
        } catch (error) {
            console.error("Error al guardar apertura de caja:", error);
            return false;
        }
    }, []);

    /**
     * Abre la caja con el monto inicial especificado.
     */
    const openCash = useCallback(
        (montoInicial: number, usuario: string): boolean => {
            const data: ICashOpeningData = {
                fecha: format(new Date(), "yyyy-MM-dd"),
                montoInicial,
                usuario,
                timestamp: new Date().toISOString(),
            };
            return saveCashOpening(data);
        },
        [saveCashOpening]
    );

    /**
     * Obtiene la fecha de hoy formateada para mostrar en el UI.
     */
    const getTodayFormatted = useCallback((): string => {
        return format(new Date(), "dd/MM/yyyy");
    }, []);

    // Verifica el estado de la caja al montar el componente
    useEffect(() => {
        const existingData = checkTodayCashOpening();
        if (existingData) {
            setTodayData(existingData);
            setShouldShowDialog(false);
        } else {
            setShouldShowDialog(true);
        }
        setIsLoading(false);
    }, [checkTodayCashOpening]);

    return {
        /** Indica si se debe mostrar el diálogo de apertura de caja */
        shouldShowDialog,
        /** Datos de la apertura de caja de hoy (null si no existe) */
        todayData,
        /** Indica si se está cargando el estado inicial */
        isLoading,
        /** Abre la caja con el monto inicial y usuario especificados */
        openCash,
        /** Obtiene la fecha de hoy formateada (dd/MM/yyyy) */
        getTodayFormatted,
        /** Verifica manualmente si existe apertura de caja para hoy */
        checkTodayCashOpening,
        /** Cierra el diálogo manualmente (útil para testing) */
        closeDialog: () => setShouldShowDialog(false),
    };
};
