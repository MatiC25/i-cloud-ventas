import { useState, useMemo } from "react";
import useSWR from "swr";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    addDays,
    subDays,
    format,
    parseISO,
    getHours,
    getMinutes
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ITaskUI, TASKS_KEY } from "@/types";
import { getTasks } from "@/services/api-back";

// Días de la semana
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Horas del día para la vista diaria (08:00 - 20:00)
const DAY_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 a 20

// Colores de badge por tipo (mismo estilo que TaskList)
function getBadgeStyles(tipo: string) {
    switch (tipo) {
        case "EntregaProducto": return "bg-emerald-600 text-white border-transparent";
        case "Soporte": return "bg-rose-600 text-white border-transparent";
        case "Administrativo": return "bg-blue-600 text-white border-transparent";
        default: return "bg-slate-600 text-white border-transparent";
    }
}

// Helper: Determinar si una tarea tiene hora específica
function hasSpecificTime(fechaProgramada: string): boolean {
    if (!fechaProgramada) return false
    try {
        const date = new Date(fechaProgramada)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        // Si es medianoche exacta (00:00), considerarlo como "todo el día"
        return !(hours === 0 && minutes === 0)
    } catch {
        return false
    }
}

type CalendarView = 'month' | 'day';

interface TasksCalendarProps {
    onNewTask: (date: Date) => void;
    onEditTask: (task: ITaskUI) => void;
}

export function TasksCalendar({ onNewTask, onEditTask }: TasksCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());

    // Consumir tareas usando SWR con la misma key que TaskList
    const { data: tasks = [] } = useSWR<ITaskUI[]>(TASKS_KEY, getTasks, {
        refreshInterval: 3000,
        revalidateOnFocus: true,
        fallbackData: []
    });

    // Calcular los días a mostrar en el calendario mensual
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    // Agrupar tareas por fecha
    const tasksByDate = useMemo(() => {
        const map = new Map<string, ITaskUI[]>();

        tasks.forEach(task => {
            if (task.fechaProgramada && !task.is_deleted) {
                try {
                    const dateKey = format(parseISO(task.fechaProgramada), "yyyy-MM-dd");
                    const existing = map.get(dateKey) || [];
                    map.set(dateKey, [...existing, task]);
                } catch {
                    // Ignorar fechas inválidas
                }
            }
        });

        return map;
    }, [tasks]);

    // Navegación mes
    const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const goToToday = () => {
        setCurrentMonth(new Date());
        if (view === 'day') {
            setSelectedDay(new Date());
        }
    };

    // Navegación día
    const goToPreviousDay = () => setSelectedDay(prev => subDays(prev, 1));
    const goToNextDay = () => setSelectedDay(prev => addDays(prev, 1));

    // Cambiar a vista día
    const goToDayView = (day: Date) => {
        setSelectedDay(day);
        setView('day');
    };

    // Volver a vista mes
    const goToMonthView = () => {
        setCurrentMonth(selectedDay); // Mantener el mes del día seleccionado
        setView('month');
    };

    // Obtener tareas de un día específico
    const getTasksForDay = (day: Date): ITaskUI[] => {
        const dateKey = format(day, "yyyy-MM-dd");
        return tasksByDate.get(dateKey) || [];
    };

    // =============================================
    //                 VISTA MES
    // =============================================
    const MonthView = () => (
        <>
            {/* Header con navegación */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="text-xs"
                    >
                        Hoy
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextMonth}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid del calendario */}
            <div className="rounded-lg border bg-background overflow-hidden">
                {/* Header con días de la semana */}
                <div className="grid grid-cols-7 bg-muted/50">
                    {WEEKDAYS.map((day) => (
                        <div
                            key={day}
                            className="py-2 text-center text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Días del calendario */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                        const dayTasks = getTasksForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);

                        return (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.01 }}
                                className={cn(
                                    "min-h-[100px] border-t border-r p-1 transition-colors group",
                                    !isCurrentMonth && "bg-muted/30",
                                    isTodayDate && "bg-blue-50/50 dark:bg-blue-950/20",
                                    (index + 1) % 7 === 0 && "border-r-0"
                                )}
                            >
                                {/* Número del día - CLICKEABLE para ir a vista día */}
                                <div className="flex items-center justify-between mb-1">
                                    <button
                                        onClick={() => goToDayView(day)}
                                        className={cn(
                                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                            "hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                                            !isCurrentMonth && "text-muted-foreground",
                                            isTodayDate && "bg-blue-600 text-white hover:bg-blue-700"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </button>

                                    {/* Botón para agregar tarea (visible en hover) */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onNewTask(day)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                {/* Tareas del día */}
                                <div
                                    className="space-y-0.5 cursor-pointer"
                                    onClick={() => dayTasks.length === 0 && onNewTask(day)}
                                >
                                    {dayTasks.slice(0, 2).map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditTask(task);
                                            }}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-[10px] px-1.5 py-0.5 truncate font-normal",
                                                    getBadgeStyles(task.tipo)
                                                )}
                                            >
                                                {task.descripcion}
                                            </Badge>
                                        </div>
                                    ))}

                                    {/* Indicador de más tareas */}
                                    {dayTasks.length > 2 && (
                                        <div
                                            className="text-[10px] text-muted-foreground px-1.5 cursor-pointer hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToDayView(day);
                                            }}
                                        >
                                            +{dayTasks.length - 2} más
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    );

    // =============================================
    //                 VISTA DÍA
    // =============================================
    const DayView = () => {
        const dayTasks = getTasksForDay(selectedDay);

        // Separar tareas "todo el día" de las con hora específica
        const allDayTasks = dayTasks.filter(t => !hasSpecificTime(t.fechaProgramada || ""));
        const timedTasks = dayTasks.filter(t => hasSpecificTime(t.fechaProgramada || ""));

        // Agrupar tareas por hora
        const tasksByHour = useMemo(() => {
            const map = new Map<number, ITaskUI[]>();

            timedTasks.forEach(task => {
                if (task.fechaProgramada) {
                    const hour = getHours(parseISO(task.fechaProgramada));
                    const existing = map.get(hour) || [];
                    map.set(hour, [...existing, task]);
                }
            });

            return map;
        }, [timedTasks]);

        return (
            <>
                {/* Header con navegación */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToMonthView}
                            className="text-xs gap-1"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Volver al Mes
                        </Button>
                        <h2 className="text-lg font-semibold capitalize">
                            {format(selectedDay, "EEEE, d MMMM yyyy", { locale: es })}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToToday}
                            className="text-xs"
                        >
                            Hoy
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPreviousDay}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextDay}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Contenedor con scroll */}
                <div className="rounded-lg border bg-background overflow-hidden">
                    {/* Sección "Todo el día" */}
                    {allDayTasks.length > 0 && (
                        <div className="border-b bg-muted/30 p-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                                Todo el día
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allDayTasks.map(task => (
                                    <Badge
                                        key={task.id}
                                        variant="outline"
                                        onClick={() => onEditTask(task)}
                                        className={cn(
                                            "cursor-pointer hover:opacity-80 transition-opacity text-xs px-2 py-1",
                                            getBadgeStyles(task.tipo)
                                        )}
                                    >
                                        {task.descripcion}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grilla de horas */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {DAY_HOURS.map((hour) => {
                            const hourTasks = tasksByHour.get(hour) || [];
                            const isCurrentHour = isToday(selectedDay) && new Date().getHours() === hour;

                            return (
                                <div
                                    key={hour}
                                    className={cn(
                                        "flex border-b last:border-b-0 min-h-[60px] group",
                                        isCurrentHour && "bg-blue-50/50 dark:bg-blue-950/20"
                                    )}
                                >
                                    {/* Columna de hora */}
                                    <div className="w-16 flex-shrink-0 py-2 px-3 text-xs text-muted-foreground border-r bg-muted/20">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>

                                    {/* Columna de tareas */}
                                    <div
                                        className="flex-1 p-2 cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => {
                                            // Crear tarea con la hora preseleccionada
                                            const dateWithHour = new Date(selectedDay);
                                            dateWithHour.setHours(hour, 0, 0, 0);
                                            onNewTask(dateWithHour);
                                        }}
                                    >
                                        {hourTasks.length > 0 ? (
                                            <div className="space-y-1">
                                                {hourTasks.map(task => {
                                                    const minutes = task.fechaProgramada
                                                        ? getMinutes(parseISO(task.fechaProgramada))
                                                        : 0;

                                                    return (
                                                        <div
                                                            key={task.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEditTask(task);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs px-2 py-1 hover:opacity-80 transition-opacity",
                                                                    getBadgeStyles(task.tipo)
                                                                )}
                                                            >
                                                                <span className="font-mono mr-1.5 opacity-70">
                                                                    {hour.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                                                                </span>
                                                                {task.descripcion}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="h-3 w-3 text-muted-foreground mr-1" />
                                                <span className="text-xs text-muted-foreground">Agregar tarea</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    };

    // =============================================
    //                 RENDER
    // =============================================
    return (
        <div className="w-full space-y-4">
            {view === 'month' ? <MonthView /> : <DayView />}

            {/* Footer con estadísticas */}
            <div className="text-xs text-muted-foreground px-2 flex justify-between">
                <span>
                    {tasks.filter(t => !t.is_deleted && t.fechaProgramada).length} tareas programadas
                </span>
                <span>
                    {tasks.filter(t => !t.is_deleted && t.estado === "Pendiente").length} pendientes
                </span>
            </div>
        </div>
    );
}
