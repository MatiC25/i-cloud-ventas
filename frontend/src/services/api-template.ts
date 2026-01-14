const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

/**
 * Función genérica para manejar peticiones
 */
async function apiRequest<T>(body: object): Promise<T> {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const json: ApiResponse<T> = await response.json();

        if (json.status === 'error') {
            throw new Error(json.message || 'Error desconocido en el servidor');
        }

        return json.data as T;
    } catch (error) {
        console.error("API Error:", error);
        // Aquí podrías disparar una notificación de Toast (Shadcn)
        throw error;
    }
}

export default apiRequest;