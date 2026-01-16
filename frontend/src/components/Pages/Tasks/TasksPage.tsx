import React, { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
// Asegúrate de importar tus funciones desde tu archivo
import { createTask, deleteTask, updateTask, getTasks } from '@/services/api-back';
import { TrashIcon } from 'lucide-react';
import { ITask } from '@/types';
import { TASKS_KEY } from '@/types';
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NuevaTask } from "./NuevaTask"
import { TaskList } from "./TaskList"
import { ITaskUI } from '@/types';
// Key para el caché de SWR (puede ser cualquier string único)



export function TasksPage() {
    const { mutate } = useSWRConfig();
    const [openNuevaTask, setOpenNuevaTask] = useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<ITaskUI | null>(null);

    // Fetcher tipado: SWR devolverá un array de ITaskUI
    const { data: tasks, isLoading } = useSWR<ITaskUI[]>(TASKS_KEY, () => getTasks(), {
        refreshInterval: 3000,
        revalidateOnFocus: true,
        fallbackData: []
    });

    // Estado del formulario (solo los campos que el usuario llena)
    const [formData, setFormData] = useState({
        tipo: 'EntregaProducto',
        cliente: '',
        descripcion: '',
        link: ''
    });

    const handleEditClick = (task: ITaskUI) => {
        setTaskToEdit(task); // Guardamos la tarea a editar
        setModalOpen(true);  // Abrimos el modal
    };

    const handleNewClick = () => {
        setTaskToEdit(null); // Limpiamos para crear nueva
        setModalOpen(true);
    };

    // --- CREAR TAREA (Optimistic UI) ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descripcion) return;

        // A. Construimos la Tarea Temporal respetando ITask
        const tempTask: ITaskUI = {
            id: crypto.randomUUID(), // ID temporal
            ...formData,
            estado: "Pendiente",
            is_deleted: false,
            created_at: new Date().toISOString(),
            auditoria: "UsuarioActual", // O el dato real si tienes Auth
            isTemp: true // Flag visual
        };

        // B. Mutación Optimista
        mutate(TASKS_KEY, (currentTasks: ITaskUI[] = []) => [tempTask, ...currentTasks], false);

        // Limpiar form
        setFormData({ ...formData, cliente: '', descripcion: '', link: '' });

        try {
            // C. Enviar al Backend (createTask espera un ITask parcial o payload)
            // Nota: Quizás tengas que castear si tu función espera ITask estricto
            await createTask(tempTask);
            mutate(TASKS_KEY);
        } catch (error) {
            console.error("Error creating:", error);
            mutate(TASKS_KEY); // Rollback
            alert("Error al guardar");
        }
    };

    // --- BORRAR TAREA ---
    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar tarea?")) return;

        mutate(TASKS_KEY, (currentTasks: ITaskUI[] = []) => currentTasks.filter(t => t.id !== id), false);

        try {
            await deleteTask(id);
            mutate(TASKS_KEY);
        } catch (error) {
            console.error("Error deleting:", error);
            mutate(TASKS_KEY);
        }
    };

    // --- COMPLETAR TAREA ---
    const handleToggleStatus = async (task: ITaskUI) => {
        // Si es temporal, no permitimos editar todavía
        if (task.isTemp) return;

        const nuevoEstado = task.estado === "Pendiente" ? "Completada" : "Pendiente";

        // Update optimista
        mutate(TASKS_KEY, (currentTasks: ITaskUI[] = []) => {
            return currentTasks.map(t =>
                t.id === task.id ? { ...t, estado: nuevoEstado } : t
            );
        }, false);

        try {
            const taskUpdated = { ...task, estado: nuevoEstado };
            await updateTask(taskUpdated);

            mutate(TASKS_KEY);
        } catch (error) {
            console.error("Error updating:", error);
            mutate(TASKS_KEY);
        }
    };

    // --- RENDER ---
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tablero de Tareas</h1>

                <Button onClick={() => setOpenNuevaTask(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
                </Button>
            </div>

            {/* COMPONENTE DEL MODAL */}
            <NuevaTask
                open={modalOpen}
                onOpenChange={setModalOpen}
                taskToEdit={taskToEdit}
            />

            <TaskList tasks={tasks || []} onToggleStatus={handleToggleStatus} onDelete={handleDelete} onEdit={handleEditClick}/>
           
        </div>
    );
}

function getBadgeColor(tipo: string) {
    switch (tipo) {
        case 'EntregaProducto': return 'bg-emerald-100 text-emerald-700';
        case 'Soporte': return 'bg-rose-100 text-rose-700';
        case 'Administrativo': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}