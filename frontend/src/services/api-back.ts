import apiRequest from "./api-template";
import {
    IProductConfig,
    IVentaHistorial,
    IVenta,
    IProducto,
    IFormConfig,
    ISaveVentaResponse,
    IOperacion,
    adaptarOperacionParaTabla,
    IGastosConfigRow,
    IDashboardStats,
    IConfigProducto,
    IBalanceResponse,
    IDashboardStatsResponse,
    IDashboardCacheEnvelope,
    CacheCategory,
    DASHBOARD_KEY
} from "../types";
import { adaptarVentaParaTabla } from "../types";
import { IVentaTabla } from "@/types";
import { invalidateCache } from "@/utils/invalidadorCache";
import { mutate } from 'swr';

// --- Simple Local Cache ---
export const CACHE: Record<string, any> = {
    formOptions: null,
    gastosConfig: null,
    ventas: null,
    operaciones: null,
    ultimasVentas: null,
    dashboardStats: null,
    productosConfig: null
};

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos por defecto
const lastFetch: Record<string, number> = {};

const isCacheValid = (key: string) => {
    if (!CACHE[key]) return false;
    const now = Date.now();
    return (now - (lastFetch[key] || 0)) < CACHE_DURATION;
};


export const guardarVenta = async (venta: IVenta) => {
    const response = await apiRequest<ISaveVentaResponse>({ action: 'nueva_venta', payload: venta });
    if (response) {
        await invalidateCache('dashboard');
    }
    return response;
};

export const updateVenta = async (venta: IVentaTabla) => {
    // Convert Dates to ISO strings or format expected by backend if necessary
    // Assuming backend takes the object as is since mostly values are needed
    return await apiRequest({ action: 'update_venta', payload: venta });
};

export const deleteVenta = async (id: string) => {
    const response = await apiRequest({ action: 'delete_venta', id });
    if (response) {
        await invalidateCache('dashboard');
    }
    return response;
};

export const getFormOptions = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('formOptions')) return CACHE.formOptions;

    const data = await apiRequest<IFormConfig>({ action: 'getConfig' });
    if (data) {
        CACHE.formOptions = data;
        lastFetch.formOptions = Date.now();
    }
    return data;
}

// Obtener configuración dinámica para operaciones (Gastos)
export const getGastosConfig = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('gastosConfig')) return CACHE.gastosConfig;

    const data = await apiRequest<IGastosConfigRow[]>({ action: 'obtenerMetodosPago' });
    if (data) {
        CACHE.gastosConfig = data;
        lastFetch.gastosConfig = Date.now();
    }
    return data;
}


export const loginWithGoogleSheet = async (email: string, password: string) => {
    return apiRequest({
        action: 'login',
        payload: { email, password }
    });
};

export const checkSpreadsheetIntegrity = (sheetId: string) =>
    apiRequest({ action: 'check_integrity', sheetId });

export const saveNewProduct = (newProd: IProducto) =>
    apiRequest({ action: 'addProduct', payload: newProd });

export const updateSystemConfig = async (newSpreadsheetId: string) =>
    apiRequest({ action: 'updateConfig', payload: { spreadsheetId: newSpreadsheetId } });

export const getProductosConfig = async (forceRefresh = false): Promise<IConfigProducto[]> => {
    if (!forceRefresh && isCacheValid('productosConfig') && CACHE.productosConfig) return CACHE.productosConfig;

    const data = await apiRequest<IConfigProducto[]>({ action: 'obtenerProductos' });
    if (Array.isArray(data)) {
        CACHE.productosConfig = data;
        lastFetch.productosConfig = Date.now();
        return data;
    }
    return [];
};


export const getVentas = async (limit = 50, forceRefresh = false): Promise<IVentaTabla[]> => {
    // Nota: El límite podría complicar el caché simple, pero asumimos uso estándar
    if (!forceRefresh && isCacheValid('ventas') && CACHE.ventas) return CACHE.ventas;

    const rawData = await apiRequest({ action: "getVentas", limit });
    if (!Array.isArray(rawData)) return [];

    const mapped = rawData.map(adaptarVentaParaTabla);
    CACHE.ventas = mapped;
    lastFetch.ventas = Date.now();
    return mapped;
}

export const getOperaciones = async (forceRefresh = false): Promise<IOperacion[]> => {
    if (!forceRefresh && isCacheValid('operaciones')) return CACHE.operaciones;

    const rawData = await apiRequest({ action: 'getOperaciones' });
    if (!Array.isArray(rawData)) return [];

    const mapped = rawData.map(adaptarOperacionParaTabla);
    CACHE.operaciones = mapped;
    lastFetch.operaciones = Date.now();
    return mapped;
}

// export const saveOperacion = async (operacion: any) => {
//     const response = await apiRequest({ action: 'nueva_operacion', payload: operacion });
//     if (response) {

//         mutate('dashboard');
//         await invalidateCache('dashboard');
//     }
//     return response;
// }

export const saveOperacion = async (operacion: any) => {
    const response = await apiRequest({ action: 'nueva_operacion', payload: operacion });
    
    if (response) {
        triggerCacheRebuild('dashboard')
            .then(() => {
                mutate(DASHBOARD_KEY); 
            })
            .catch(err => console.error("Error en background:", err));
    }

    return response;
}

export const updateOperacion = async (operacion: IOperacion) => {
    return apiRequest({ action: 'update_operacion', payload: operacion });
}

export const deleteOperacion = async (id: string) => {
    return apiRequest({ action: 'delete_operacion', payload: { id } });
}

export const triggerCacheRebuild = async (category: CacheCategory) => {
    return apiRequest({ action: 'triggerCacheRebuild', payload: { category } });
}


export const getLiveBalances = async () => {
    return apiRequest<IBalanceResponse>({ action: 'getLiveBalances' });
}

export const getDashboardStats = async () => {
    return apiRequest<IDashboardCacheEnvelope>({ action: 'getDashboardStats' });
}

export const checkCacheStatus = async () => {
    return apiRequest({ action: 'checkCacheStatus' });
}