import { IVenta } from '../types';

export const guardarVenta = async (venta: IVenta): Promise<void> => {
    // Replace with your actual Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            //mode: 'no-cors', // Google Apps Script often requires no-cors for simple POSTs if not configured with strict CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'nueva_venta',
                payload: venta,
            }),
        });
    } catch (error) {
        console.error('Error in guardarVenta:', error);
        throw error;
    }
};

/**
 * Alternative implementation if your Google Apps Script is configured to return proper CORS headers.
 * The prompt requested handling "status: 'success'", which implies we can read the response.
 * For this to work, the GAS script must serve content with setXFrameOptionsMode and allow origin.
 */
export const guardarVentaWithResponse = async (venta: IVenta): Promise<any> => {
    // Replace with your actual Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            // mode: 'cors', // Default is cors
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script sometimes prefers text/plain to avoid preflight complications
            },
            body: JSON.stringify({
                action: 'nueva_venta',
                payload: venta,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result; // Expected { status: 'success', ... }

    } catch (error) {
        console.error('Error in guardarVentaWithResponse:', error);
        throw error;
    }
};



export const guardarNuevoProductoConfig = async (nuevoProd: any) => {
    const response = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addProduct', payload: nuevoProd })
    });
    return await response.json();
};

export const getFormOptions = async (): Promise<IProductConfig[]> => {
    // Reemplaza con tu URL real del Script
    const URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; 
    
    const response = await fetch(`${URL}?action=getOptions`);
    const json = await response.json();
    
    if (json.status === 'success') {
        return json.data; // Devuelve el array de productos
    } else {
        return [];
    }
};



export const getUltimasVentas = async (): Promise<IVentaHistorial[]> => {
    const URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; 
    
    const response = await fetch(`${URL}?action=getLastSales`);
    const json = await response.json();
    
    if (json.status === 'success') {
        return json.data;
    } else {
        return [];
    }
};

export const updateSystemConfig = async (newSpreadsheetId: string) => {
    const URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; 
    
    const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'save_config',
            payload: { sheetId: newSpreadsheetId }
        })
    });
    return await response.json();
};

export const loginWithGoogleSheet = async (email: string, password: string) => {
    const URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; 

    const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'login',
            payload: { email, password }
        })
    });
    
    const json = await response.json();
    
    if (json.status === 'success') {
        return json.data.user; // Retorna el objeto usuario { name, role... }
    } else {
        throw new Error(json.message || "Error al iniciar sesión");
    }
};

export const checkSpreadsheetIntegrity = async (sheetId: string) => {
    const URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; 

    try {
        const response = await fetch(URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'check_integrity', 
                sheetId: sheetId // Enviamos el ID en la raíz del objeto
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en checkSpreadsheetIntegrity:', error);
        throw error;
    }
};

