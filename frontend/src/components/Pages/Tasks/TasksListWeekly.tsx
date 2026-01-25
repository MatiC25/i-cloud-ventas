import { useState, useMemo } from "react";
import useSWR from "swr";
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isToday,
    addWeeks,
    subWeeks,
    format,
    parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Settings2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ITaskUI, TASKS_KEY } from "@/types";
import { getTasks } from "@/services/api-back";

interface TasksListWeeklyProps {
    onNewTask: (date: Date) => void;
    onEditTask: (task: ITaskUI) => void;
}

// Colores de badge por tipo (reutilizado)
function getBadgeStyles(tipo: string) {
    switch (tipo) {
        case "EntregaProducto": return "bg-emerald-600 text-white border-transparent";
        case "Soporte": return "bg-rose-600 text-white border-transparent";
        case "Administrativo": return "bg-blue-600 text-white border-transparent";
        default: return "bg-slate-600 text-white border-transparent";
    }
}

const ALL_DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function TasksListWeekly({ onNewTask, onEditTask }: TasksListWeeklyProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    // Por defecto mostramos Lunes a Sábado (Indices 1 a 6)
    const [visibleDays, setVisibleDays] = useState<number[]>(() => {
        const saved = localStorage.getItem("tasks-weekly-visible-days");
        return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5, 6];
    });

    // Guardar en localStorage cuando cambia
    const updateVisibleDays = (newDays: number[]) => {
        setVisibleDays(newDays);
        localStorage.setItem("tasks-weekly-visible-days", JSON.stringify(newDays));
    };

    // Consumir tareas
    const { data: tasks = [] } = useSWR<ITaskUI[]>(TASKS_KEY, getTasks, {
        refreshInterval: 3000,
        revalidateOnFocus: true,
        fallbackData: []
    });

    // Calcular días de la semana actual
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Filtrar solo los días visibles
    const filteredDays = useMemo(() => {
        return weekDays.filter(day => visibleDays.includes(day.getDay()));
    }, [weekDays, visibleDays]);

    // Agrupar tareas por fecha
    const tasksByDate = useMemo(() => {
        const map = new Map<string, ITaskUI[]>();
        tasks.forEach(task => {
            if (task.fechaProgramada && !task.is_deleted) {
                try {
                    const dateKey = format(parseISO(task.fechaProgramada), "yyyy-MM-dd");
                    const existing = map.get(dateKey) || [];
                    map.set(dateKey, [...existing, task]);
                } catch { }
            }
        });
        return map;
    }, [tasks]);

    const getTasksForDay = (day: Date) => {
        return tasksByDate.get(format(day, "yyyy-MM-dd")) || [];
    };

    const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
    const goToToday = () => setCurrentDate(new Date());

    const toggleDayVisibility = (dayIndex: number) => {
        const prev = visibleDays;
        let newDays;

        if (prev.includes(dayIndex)) {
            // Evitar ocultar todos los días
            if (prev.length === 1) return;
            newDays = prev.filter(d => d !== dayIndex);
        } else {
            newDays = [...prev, dayIndex].sort();
        }

        updateVisibleDays(newDays);
    };

    return (
        <div className="space-y-4">
            {/* Header de Navegación */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold capitalize">
                        {format(weekDays[0], "MMM d", { locale: es })} - {format(weekDays[6], "MMM d, yyyy", { locale: es })}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Selector de Días */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2">
                                <Settings2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Días</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Días Visibles</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ALL_DAYS.map((dayName, index) => (
                                <DropdownMenuCheckboxItem
                                    key={index}
                                    checked={visibleDays.includes(index)}
                                    onCheckedChange={() => toggleDayVisibility(index)}
                                >
                                    {dayName}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                        Hoy
                    </Button>
                    <div className="flex items-center rounded-md border bg-background shadow-sm">
                        <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8 rounded-none border-r">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8 rounded-none">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid Semanal Dinámico */}
            <div
                className="grid gap-2 min-h-[600px]"
                style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}
            >
                {filteredDays.map((day, index) => {
                    const isTodayDate = isToday(day);
                    const dayTasks = getTasksForDay(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "flex flex-col bg-muted/20 dark:bg-slate-900/50 rounded-xl border border-border/50 overflow-hidden transition-colors",
                                isTodayDate && "ring-1 ring-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
                            )}
                        >
                            {/* Header del Día */}
                            <div className={cn(
                                "p-3 border-b flex flex-col items-center justify-center gap-1",
                                isTodayDate ? "bg-blue-100/50 dark:bg-blue-900/20" : "bg-muted/40"
                            )}>
                                <span className={cn(
                                    "text-xs font-semibold uppercase tracking-wider",
                                    isTodayDate ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                                )}>
                                    {format(day, "EEE", { locale: es })}
                                </span>
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    isTodayDate ? "bg-blue-600 text-white" : "text-foreground"
                                )}>
                                    {format(day, "d")}
                                </div>
                            </div>

                            {/* Lista de Tareas */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px]">
                                {dayTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        layoutId={task.id}
                                        onClick={() => onEditTask(task)}
                                        className="group bg-background p-2.5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <Badge
                                                className={cn("w-fit text-[10px] px-1.5 py-0.5 font-normal", getBadgeStyles(task.tipo))}
                                                variant="secondary"
                                            >
                                                {task.tipo}
                                            </Badge>
                                            <p className="text-xs font-medium leading-snug line-clamp-3">
                                                {task.descripcion}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        task.estado === "Pendiente" ? "bg-amber-400" : "bg-emerald-500"
                                                    )} />
                                                    {task.link && (
                                                        <a
                                                            href={task.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-muted-foreground hover:text-blue-500 transition-colors"
                                                            title="Abrir enlace"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {task.cliente && (
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                                        {task.cliente}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Botón Agregar Rápido */}
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground hover:text-foreground h-8 border-dashed border border-transparent hover:border-border hover:bg-muted/50"
                                    onClick={() => onNewTask(day)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
