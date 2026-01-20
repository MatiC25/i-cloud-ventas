import React, { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
// Asegúrate de importar tus funciones desde tu archivo
import { createTask, deleteTask, updateTask, getTasks } from '@/services/api-back';
import { ITask } from '@/types';
import { TASKS_KEY } from '@/types';
import { Plus, List, CalendarDays, Columns } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NuevaTask } from "./NuevaTask"
import { TaskList } from "./TaskList"
import { TasksCalendar } from "./TasksCalendar"
import { TasksListWeekly } from "./TasksListWeekly"
import { ITaskUI } from '@/types';
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

export function TasksPage() {
    const { mutate } = useSWRConfig();
    const [modalOpen, setModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<ITaskUI | null>(null);
    const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState("semanal");

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
        setTaskToEdit(task);
        setInitialDate(undefined); // Limpiar fecha inicial al editar
        setModalOpen(true);
    };

    const handleNewClick = () => {
        setTaskToEdit(null);
        setInitialDate(undefined);
        setModalOpen(true);
    };

    // Handler para crear tarea desde el calendario con fecha preseleccionada
    const handleNewFromCalendar = (date: Date) => {
        setTaskToEdit(null);
        setInitialDate(date.toISOString());
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

    // Handler para cerrar modal y limpiar estado
    const handleModalClose = (open: boolean) => {
        setModalOpen(open);
        if (!open) {
            setTaskToEdit(null);
            setInitialDate(undefined);
        }
    };

    // --- RENDER ---
    return (
        <motion.div className="p-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            <motion.header className="flex justify-between items-center mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-bold">Tablero de Tareas</h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button onClick={handleNewClick}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
                    </Button>
                </motion.div>
            </motion.header>

            {/* COMPONENTE DEL MODAL */}
            <NuevaTask
                open={modalOpen}
                onOpenChange={handleModalClose}
                taskToEdit={taskToEdit}
                initialDate={initialDate}
            />

            {/* TABS: Vista Lista / Vista Calendario */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="lista" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Vista Lista
                        </TabsTrigger>
                        <TabsTrigger value="semanal" className="flex items-center gap-2">
                            <Columns className="h-4 w-4" />
                            Vista Semanal
                        </TabsTrigger>
                        <TabsTrigger value="calendario" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Vista Calendario
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lista">
                        <TaskList
                            tasks={tasks || []}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            onEdit={handleEditClick}
                        />
                    </TabsContent>

                    <TabsContent value="semanal">
                        <TasksListWeekly
                            onNewTask={handleNewFromCalendar}
                            onEditTask={handleEditClick}
                        />
                    </TabsContent>

                    <TabsContent value="calendario">
                        <TasksCalendar
                            onNewTask={handleNewFromCalendar}
                            onEditTask={handleEditClick}
                        />
                    </TabsContent>
                </Tabs>
            </motion.div>

        </motion.div>
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
