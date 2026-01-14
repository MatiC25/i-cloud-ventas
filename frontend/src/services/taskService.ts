import apiRequest from "./api-template";

export interface ITask {
    ID?: string;
    Fecha_Creacion?: string;
    Fecha_Objetivo: string; // ISO String or "HH:mm" if today
    Descripcion: string;
    Cliente: string;
    Estado: "Pendiente" | "Completada";
    Prioridad?: string;
    Creado_Por?: string;
}

export const createTask = async (task: Partial<ITask>) => {
    return await apiRequest({ action: 'createTask', payload: task });
};

export const getPendingTasks = async (): Promise<ITask[]> => {
    return await apiRequest<ITask[]>({ action: 'getPendingTasks' });
};

export const getTodaysTasks = async (): Promise<ITask[]> => {
    return await apiRequest<ITask[]>({ action: 'getTodaysTasks' });
};

export const completeTask = async (id: string) => {
    return await apiRequest({ action: 'completeTask', payload: { id } });
};

export const reactivateTask = async (id: string) => {
    return await apiRequest({ action: 'reactivateTask', payload: { id } });
};

export const deleteTask = async (id: string) => {
    return await apiRequest({ action: 'deleteTask', payload: { id } });
};
