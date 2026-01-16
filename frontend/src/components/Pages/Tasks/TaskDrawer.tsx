import { useState, useMemo, useCallback, memo } from "react";
import { useSWRConfig } from "swr"; // Para mutaciones globales
import useSWR from "swr";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    LayoutList,
    Plus,
    Trash2,
    ArrowLeft,
    Loader2
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Importamos tus servicios y tipos existentes
import { getTasks, deleteTask, updateTask, createTask } from "@/services/api-back";
import { TaskForm, TaskFormData } from "./TaskForm";
import { TASKS_KEY, ITaskUI } from "@/types";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

export function TaskDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"list" | "create">("list");
    const { user } = useUser();
    const { mutate } = useSWRConfig();

    // 1. Fetching de tareas (Misma key que en TasksPage para compartir caché)
    const { data: tasks, isLoading } = useSWR<ITaskUI[]>(TASKS_KEY, getTasks, {
        refreshInterval: 5000,
        revalidateOnFocus: true,
        fallbackData: []
    });

    // OPTIMIZATION: Memoize sorting
    const sortedTasks = useMemo(() => {
        return tasks ? [...tasks].sort((a, b) => {
            if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
            if (a.estado !== "Pendiente" && b.estado === "Pendiente") return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }) : [];
    }, [tasks]);

    const pendingCount = useMemo(() =>
        sortedTasks.filter(t => t.estado === "Pendiente").length
        , [sortedTasks]);

    // --- LÓGICA DE ACCIONES (Memoized) ---

    const handleCreate = useCallback(async (values: TaskFormData) => {
        setView("list");

        const newTaskPayload = {
            ...values,
            cliente: values.cliente || "",
            link: values.link || "",
            id: crypto.randomUUID(),
            estado: "Pendiente",
            is_deleted: false,
            created_at: new Date().toISOString(),
            auditoria: user?.fullName || user?.username || "Drawer Rápido",
            isTemp: true
        };

        mutate(TASKS_KEY, (current: any[] = []) => [newTaskPayload, ...current], false);
        toast.info("Tarea rápida creada");

        try {
            await createTask(newTaskPayload);
            mutate(TASKS_KEY);
        } catch (e) {
            mutate(TASKS_KEY);
            toast.error("Error al crear");
        }
    }, [mutate, user]);

    const handleToggle = useCallback(async (task: ITaskUI) => {
        const nuevoEstado = task.estado === "Pendiente" ? "Completada" : "Pendiente";

        // Optimistic Update
        mutate(TASKS_KEY, (current: any[] = []) =>
            current.map(t => t.id === task.id ? { ...t, estado: nuevoEstado } : t)
            , false);

        try {
            await updateTask({ ...task, estado: nuevoEstado });
            mutate(TASKS_KEY);
        } catch (e) {
            mutate(TASKS_KEY);
        }
    }, [mutate]);

    const handleDelete = useCallback(async (id: string) => {
        mutate(TASKS_KEY, (current: any[] = []) => current.filter(t => t.id !== id), false);
        try {
            await deleteTask(id);
            mutate(TASKS_KEY);
        } catch (e) {
            mutate(TASKS_KEY);
        }
    }, [mutate]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <LayoutList className="h-5 w-5" />
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {pendingCount > 9 ? "+9" : pendingCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-4">
                    {/* FIX: pr-8 prevents overlap with Close button */}
                    <div className="flex items-center justify-between pr-8">
                        <SheetTitle className="flex items-center gap-2">
                            {view === "create" && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={() => setView("list")}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            {view === "list" ? "Mis Tareas" : "Nueva Tarea"}
                        </SheetTitle>

                        {view === "list" && (
                            <Button size="sm" variant="outline" onClick={() => setView("create")}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Crear
                            </Button>
                        )}
                    </div>

                    {view === "list" && (
                        <SheetDescription>
                            Tienes {pendingCount} tareas pendientes.
                        </SheetDescription>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-hidden relative">
                    {view === "create" ? (
                        <div className="px-1 pt-2 animate-in slide-in-from-right-10 fade-in duration-300">
                            <TaskForm
                                onSubmit={handleCreate}
                                onCancel={() => setView("list")}
                            />
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                            {isLoading && tasks?.length === 0 && (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            )}

                            {!isLoading && tasks?.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    Todo limpio ✨
                                </div>
                            )}

                            <div className="space-y-3 pb-10">
                                {sortedTasks.map(task => (
                                    <CompactTaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// --- Sub-componente (Memoized) ---
const CompactTaskItem = memo(function CompactTaskItem({
    task,
    onToggle,
    onDelete
}: {
    task: ITaskUI,
    onToggle: (task: ITaskUI) => void,
    onDelete: (id: string) => void
}) {
    const isCompleted = task.estado === "Completada";

    return (
        <div className={cn(
            "group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
            isCompleted && "bg-muted/30 opacity-70",
            task.isTemp && "opacity-50 animate-pulse"
        )}>
            <Checkbox
                checked={isCompleted}
                onCheckedChange={() => onToggle(task)}
                className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={cn("text-[9px] h-4 px-1 py-0 border-0", getCompactBadgeColor(task.tipo))}>
                        {task.tipo}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                        {format(new Date(task.created_at), "d MMM", { locale: es })}
                    </span>
                </div>

                <p className={cn("text-sm font-medium leading-snug break-words", isCompleted && "line-through text-muted-foreground")}>
                    {task.descripcion}
                </p>

                {task.cliente && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        👤 {task.cliente}
                    </p>
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
})

function getCompactBadgeColor(tipo: string) {
    switch (tipo) {
        case "EntregaProducto": return "bg-emerald-100 text-emerald-700";
        case "Soporte": return "bg-rose-100 text-rose-700";
        case "Administrativo": return "bg-blue-100 text-blue-700";
        default: return "bg-slate-100 text-slate-700";
    }
}